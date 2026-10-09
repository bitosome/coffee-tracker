"""Strict, atomic ledger storage with explicit write failure propagation."""
from pathlib import Path

from homeassistant.core import CoreState, HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.json import save_json
from homeassistant.util.json import load_json

from .const import DOMAIN


class LedgerStorage:
    """Do not use Store.async_save: it logs write failures instead of raising."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self.hass = hass
        self.key = f"{DOMAIN}.{entry_id}"
        self.path = Path(hass.config.path(".storage", self.key))

    async def load(self) -> dict | None:
        envelope = await self.hass.async_add_executor_job(load_json, self.path, None)
        if envelope is None:
            return None
        if not isinstance(envelope, dict) or envelope.get("version") != 1 or envelope.get("key") != self.key or not isinstance(envelope.get("data"), dict):
            raise HomeAssistantError("Unsupported or invalid Coffee Tracker storage. Restore a backup; the file has not been changed.")
        return envelope["data"]

    def _write(self, state: dict) -> None:
        self.path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        save_json(str(self.path), {"version": 1, "key": self.key, "data": state}, private=True, atomic_writes=True)

    async def save(self, state: dict) -> None:
        if self.hass.state in (CoreState.stopping, CoreState.stopped, CoreState.final_write):
            raise HomeAssistantError("Home Assistant is stopping. Try again after it restarts.")
        await self.hass.async_add_executor_job(self._write, state)
