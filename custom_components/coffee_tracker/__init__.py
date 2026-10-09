"""Coffee Tracker: a shared persistent ledger and bundled dashboard card."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Callable

import voluptuous as vol
from homeassistant.auth.permissions.const import POLICY_CONTROL, POLICY_READ
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.exceptions import ConfigEntryNotReady, HomeAssistantError, ServiceValidationError, Unauthorized
from homeassistant.helpers import config_validation as cv, entity_registry as er

from .const import CARD_URL, DOMAIN, PLATFORMS, VERSION
from .ledger import Ledger, LedgerError
from .storage import LedgerStorage

_LOGGER = logging.getLogger(__name__)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
BASE = {vol.Required("entity_id"): cv.entity_id}
MUTATION = {**BASE, vol.Optional("request_id"): vol.All(str, vol.Length(min=8, max=128))}
REVISION = vol.All(int, vol.Range(min=1))
AMOUNT = vol.Any(str, int, float)
SCHEMAS = {
    "add_funds": {**MUTATION, vol.Required("amount"): AMOUNT, vol.Optional("note", default=""): vol.All(str, vol.Length(max=250))},
    "set_balance": {**MUTATION, vol.Required("amount"): AMOUNT, vol.Required("expected_revision"): REVISION, vol.Optional("note", default=""): vol.All(str, vol.Length(max=250))},
    "set_price": {**MUTATION, vol.Required("amount"): AMOUNT, vol.Required("expected_revision"): REVISION},
    "buy_coffee": {**MUTATION, vol.Optional("expected_revision"): REVISION},
    "undo": {**MUTATION, vol.Required("transaction_id"): str, vol.Required("expected_revision"): REVISION},
    "reset_ledger": {**BASE, vol.Required("request_id"): vol.All(str, vol.Length(min=8, max=128)), vol.Required("confirmed"): vol.All(bool, True), vol.Required("expected_revision"): REVISION},
    "get_history": {**BASE, vol.Optional("limit", default=20): vol.All(int, vol.Range(min=1, max=100)), vol.Optional("before"): vol.All(int, vol.Range(min=1))},
}


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Register services once, including when every entry is temporarily unloaded."""
    async def handle(call: ServiceCall) -> dict:
        entity_id = call.data["entity_id"]
        registry_entry = er.async_get(hass).async_get(entity_id)
        if not registry_entry or registry_entry.platform != DOMAIN or registry_entry.domain != "sensor" or registry_entry.unique_id != f"{registry_entry.config_entry_id}_balance":
            raise ServiceValidationError("Choose a Coffee Tracker balance sensor.")
        entry = hass.config_entries.async_get_entry(registry_entry.config_entry_id)
        if not entry or not hasattr(entry, "runtime_data") or entry.runtime_data is None or not entry.runtime_data.active:
            raise ServiceValidationError("This coffee pool is unavailable. Check its integration status.")
        pool: Pool = entry.runtime_data
        if call.service == "get_history":
            await pool.actor(call.context, entity_id, POLICY_READ)
            try:
                return pool.ledger.history(limit=call.data["limit"], before=call.data.get("before"))
            except LedgerError as err:
                raise ServiceValidationError(f"{err.code}: {err}") from err
        return await pool.mutate(call.service, call.context, **{key: value for key, value in call.data.items() if key != "entity_id"})

    for service, schema in SCHEMAS.items():
        hass.services.async_register(DOMAIN, service, handle, schema=vol.Schema(schema), supports_response=SupportsResponse.ONLY if service == "get_history" else SupportsResponse.OPTIONAL)
    await _register_card(hass)
    return True


async def _register_card(hass: HomeAssistant) -> None:
    """Serve a versioned module and register storage-mode resources idempotently."""
    await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, str(Path(__file__).parent / "www" / "coffee-tracker-card.js"), False)])
    url = f"{CARD_URL}?v={VERSION}"
    try:
        lovelace = hass.data.get("lovelace")
        resources = getattr(lovelace, "resources", None)
        if resources is None or not hasattr(resources, "async_create_item"):
            _LOGGER.info("For YAML dashboard resources, add %s as type module", url)
            return
        await resources.async_get_info()
        existing = next((item for item in resources.async_items() if item["url"].split("?", 1)[0] == CARD_URL), None)
        if existing:
            if existing["url"] != url or existing.get("type") != "module":
                await resources.async_update_item(existing["id"], {"url": url, "res_type": "module"})
        else:
            await resources.async_create_item({"url": url, "res_type": "module"})
    except Exception:  # Frontend registration must not prevent access to the ledger.
        _LOGGER.warning("Automatic card resource registration failed; add %s as a module in dashboard resources", url, exc_info=True)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    storage = LedgerStorage(hass, entry.entry_id)
    ledger = Ledger(storage.save)
    try:
        stored = await storage.load()
        if stored is None and entry.data.get("initialized"):
            raise HomeAssistantError("Coffee ledger is missing. Restore its .storage backup before using this pool.")
        await ledger.initialize(stored, currency=entry.data["currency"], price=entry.data["cup_price"], balance=entry.data["opening_balance"])
    except (HomeAssistantError, LedgerError, OSError) as err:
        raise ConfigEntryNotReady(str(err)) from err
    if not entry.data.get("initialized"):
        hass.config_entries.async_update_entry(entry, data={**entry.data, "initialized": True})
    pool = Pool(hass, entry, ledger)
    entry.runtime_data = pool
    entry.async_on_unload(hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, pool.registry_changed))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    pool.publish()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    pool = entry.runtime_data
    pool.active = False
    await pool.ledger.close()
    if await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return True
    await pool.ledger.reopen()
    pool.active = True
    return False


class Pool:
    """Entity/service adapter; state and history always come from one ledger."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, ledger: Ledger) -> None:
        self.hass = hass
        self.entry = entry
        self.ledger = ledger
        self.active = True
        self._listeners: set[Callable[[Context | None], None]] = set()

    @callback
    def subscribe(self, listener: Callable[[Context | None], None]) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    @callback
    def publish(self, context: Context | None = None) -> None:
        for listener in tuple(self._listeners):
            listener(context)

    @callback
    def registry_changed(self, event) -> None:
        # Entity IDs are user-editable. Recompute links instead of guessing names.
        if event.data.get("entity_id", "").startswith(("sensor.", "number.", "button.")):
            self.publish()

    def entity_id(self, domain: str, key: str) -> str | None:
        return er.async_get(self.hass).async_get_entity_id(domain, DOMAIN, f"{self.entry.entry_id}_{key}")

    async def actor(self, context: Context | None, entity_id: str, permission: str) -> tuple[str, str]:
        if context is None or context.user_id is None:
            return "Automation", "automation"
        user = await self.hass.auth.async_get_user(context.user_id)
        if user is None or not user.is_active or not user.permissions.check_entity(entity_id, permission):
            raise Unauthorized(context=context, entity_id=entity_id, permission=permission)
        return user.name or "Home Assistant user", user.id

    async def mutate(self, kind: str, context: Context | None, **kwargs: Any) -> dict:
        if not self.active:
            raise ServiceValidationError("This coffee pool is unavailable.")
        entity_id = self.entity_id("sensor", "balance")
        if entity_id is None:
            raise ServiceValidationError("The coffee pool's balance sensor is unavailable.")
        actor, actor_id = await self.actor(context, entity_id, POLICY_CONTROL)
        try:
            result = await self.ledger.mutate(kind, actor=actor, actor_id=actor_id, **kwargs)
        except LedgerError as err:
            raise ServiceValidationError(f"{err.code}: {err}") from err
        except (HomeAssistantError, OSError) as err:
            raise HomeAssistantError("The coffee action could not be saved. No balance change was published. Check Home Assistant storage and retry the same request.") from err
        finally:
            # If the caller disconnected during a durable commit, all other clients
            # still need to receive the resulting persisted state.
            self.publish(context)
        return result
