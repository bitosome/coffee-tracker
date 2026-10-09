"""Independent regressions for accounting boundaries and HA integration behavior."""
from __future__ import annotations

import asyncio
from copy import deepcopy

import pytest

from custom_components.coffee_tracker.ledger import Ledger, LedgerError, to_minor


@pytest.mark.parametrize("amount", ["1e999999999", "1e-999999999", "0.001", "NaN", "Infinity", True])
def test_review_rejects_non_cent_and_extreme_decimal_values(amount):
    """Reject hostile/non-cent inputs without rounding or leaking arithmetic errors."""
    with pytest.raises(LedgerError, match="finite amount"):
        to_minor(amount)


async def test_review_cancelled_client_retry_is_exactly_once():
    """A lost client during disk persistence must not turn Retry into another debit."""
    snapshots = []
    writing = asyncio.Event()
    release = asyncio.Event()

    async def save(state):
        if state["revision"] > 1:
            writing.set()
            await release.wait()
        snapshots.append(deepcopy(state))

    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="1.25", balance="10.00")
    purchase = asyncio.create_task(ledger.mutate("buy_coffee", request_id="review-cancelled", actor_id="test-user", expected_revision=1))
    await writing.wait()
    purchase.cancel()
    release.set()
    with pytest.raises(asyncio.CancelledError):
        await purchase
    assert ledger.snapshot["balance_minor"] == 875
    response = await ledger.mutate("buy_coffee", request_id="review-cancelled", actor_id="test-user", expected_revision=1)
    assert response["revision"] == 2
    assert len(snapshots) == 2
    restored = Ledger(save)
    await restored.initialize(snapshots[-1], currency="EUR", price="9.99", balance="999.00")
    repeated = await restored.mutate("buy_coffee", request_id="review-cancelled", actor_id="test-user", expected_revision=1)
    assert repeated == response
    assert restored.snapshot["balance_minor"] == 875
    assert restored.snapshot["cup_price_minor"] == 125
    assert len(snapshots) == 2


async def test_review_watch_purchases_and_topups_serialize_without_lost_updates():
    """All users' relative transactions accumulate, even during slow disk writes."""
    async def save(state):
        await asyncio.sleep(0)

    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="0.35", balance="0")
    purchases = [ledger.mutate("buy_coffee", request_id=f"review-coffee-{index}", actor_id=f"user-{index % 3}") for index in range(40)]
    additions = [ledger.mutate("add_funds", amount="1.05", request_id=f"review-topup-{index}") for index in range(10)]
    await asyncio.gather(*purchases, *additions)
    assert ledger.snapshot["balance_minor"] == -350
    assert ledger.snapshot["coffee_count"] == 40
    assert ledger.snapshot["revision"] == 51
    history = ledger.history(limit=100)
    assert len(history["items"]) == 51
    assert all("request_key" not in row and "request_fingerprint" not in row for row in history["items"])


async def test_review_currency_history_and_undo_use_original_coffee_price():
    """A later price change must not change the refundable amount of a prior cup."""
    async def save(state):
        pass

    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="1.25", balance="10.00")
    bought = await ledger.mutate("buy_coffee")
    await ledger.mutate("set_price", amount="2.50", expected_revision=2)
    undo = await ledger.mutate("undo", transaction_id=bought["transaction_id"], expected_revision=3)
    assert undo["balance_minor"] == 1000
    assert undo["cup_price_minor"] == 250
    assert undo["coffee_count"] == 0
    assert ledger.history()["items"][0]["amount_minor"] == 125
    with pytest.raises(LedgerError, match="latest financial action"):
        await ledger.mutate("undo", transaction_id=bought["transaction_id"], expected_revision=4)


async def test_review_real_atomic_storage_failure_preserves_balance_and_retry(hass, tmp_path, monkeypatch):
    """Exercise HA's atomic JSON helper failure, not a fake async_save boundary."""
    from homeassistant.exceptions import HomeAssistantError
    from homeassistant.util.file import WriteError
    from custom_components.coffee_tracker.storage import LedgerStorage

    hass.config.config_dir = str(tmp_path)
    storage = LedgerStorage(hass, "review-atomic-pool")
    ledger = Ledger(storage.save)
    await ledger.initialize(None, currency="EUR", price="1.25", balance="10.00")
    initial = await storage.load()
    assert await hass.async_add_executor_job(lambda: storage.path.stat().st_mode & 0o777) == 0o600

    def fail_atomic_write(*args, **kwargs):
        raise WriteError("synthetic disk full")

    with monkeypatch.context() as patch:
        patch.setattr("homeassistant.helpers.json.write_utf8_file_atomic", fail_atomic_write)
        with pytest.raises(HomeAssistantError, match="disk full"):
            await ledger.mutate("buy_coffee", request_id="review-disk-failure")
    assert ledger.snapshot["revision"] == 1
    assert ledger.snapshot["balance_minor"] == 1000
    assert await storage.load() == initial
    successful_retry = await ledger.mutate("buy_coffee", request_id="review-disk-failure")
    assert successful_retry["balance_minor"] == 875
    assert (await storage.load())["revision"] == 2


async def test_review_storage_rejects_shutdown_and_invalid_envelope(hass, tmp_path):
    """Never acknowledge deferred money writes or reinterpret corrupt data as new."""
    from homeassistant.core import CoreState
    from homeassistant.exceptions import HomeAssistantError
    from custom_components.coffee_tracker.storage import LedgerStorage

    hass.config.config_dir = str(tmp_path)
    storage = LedgerStorage(hass, "review-shutdown-pool")
    prior_state = hass.state
    try:
        hass.set_state(CoreState.stopping)
        with pytest.raises(HomeAssistantError, match="stopping"):
            await storage.save({"never": "commit"})
    finally:
        hass.set_state(prior_state)
    assert await storage.load() is None
    await hass.async_add_executor_job(storage.path.parent.mkdir, 0o700, True, True)
    payload = '{"version":2,"key":"review-shutdown-pool","data":{}}'
    await hass.async_add_executor_job(storage.path.write_text, payload)
    with pytest.raises(HomeAssistantError, match="Unsupported or invalid"):
        await storage.load()
    assert await hass.async_add_executor_job(storage.path.read_text) == payload


async def test_review_reload_waits_for_durable_commit_before_reopening_pool(hass, pool_entry, monkeypatch):
    """A config-entry reload cannot start a second ledger while a write is pending."""
    from homeassistant.exceptions import ServiceValidationError

    old_pool = pool_entry.runtime_data
    balance_entity = old_pool.entity_id("sensor", "balance")
    persist = old_pool.ledger._save
    writing = asyncio.Event()
    release = asyncio.Event()

    async def delayed_save(state):
        writing.set()
        await release.wait()
        await persist(state)

    monkeypatch.setattr(old_pool.ledger, "_save", delayed_save)
    request = {"entity_id": balance_entity, "amount": "3.25", "request_id": "review-reload-during-save"}
    mutation = asyncio.create_task(hass.services.async_call("coffee_tracker", "add_funds", request, blocking=True, return_response=True))
    await writing.wait()
    reloading = asyncio.create_task(hass.config_entries.async_reload(pool_entry.entry_id))
    try:
        for _ in range(30):
            await asyncio.sleep(0)
            if not old_pool.active:
                break
        assert not old_pool.active
        assert not reloading.done()
        with pytest.raises(ServiceValidationError, match="unavailable"):
            await old_pool.mutate("buy_coffee", None)
    finally:
        release.set()
    result = await mutation
    assert await reloading
    await hass.async_block_till_done()
    new_pool = pool_entry.runtime_data
    assert new_pool is not old_pool
    assert new_pool.ledger.snapshot["balance_minor"] == 1325
    repeated = await hass.services.async_call("coffee_tracker", "add_funds", request, blocking=True, return_response=True)
    assert repeated == result
    assert new_pool.ledger.snapshot["revision"] == 2


async def test_review_history_read_permission_and_native_control_permission(hass, pool_entry, hass_admin_user, hass_read_only_user):
    """Custom history must not bypass entity permissions; native controls honor them."""
    from homeassistant.core import Context
    from homeassistant.exceptions import Unauthorized

    pool = pool_entry.runtime_data
    balance_entity = pool.entity_id("sensor", "balance")
    no_access = await hass.auth.async_create_user("Synthetic user without access")
    with pytest.raises(Unauthorized):
        await hass.services.async_call("coffee_tracker", "get_history", {"entity_id": balance_entity}, blocking=True, return_response=True, context=Context(user_id=no_access.id))
    context = Context(user_id=hass_read_only_user.id)
    with pytest.raises(Unauthorized):
        await hass.services.async_call("button", "press", {"entity_id": pool.entity_id("button", "buy_coffee")}, blocking=True, context=context)
    with pytest.raises(Unauthorized):
        await hass.services.async_call("number", "set_value", {"entity_id": pool.entity_id("number", "cup_price"), "value": 9}, blocking=True, context=context)
    assert pool.ledger.snapshot["balance_minor"] == 1000
    assert pool.ledger.snapshot["cup_price_minor"] == 200


async def test_review_missing_initialized_ledger_never_silently_resets_money(hass, pool_entry):
    """A deleted ledger after first setup must fail rather than recreate initial funds."""
    from homeassistant.config_entries import ConfigEntryState
    from custom_components.coffee_tracker.storage import LedgerStorage

    entry_id = pool_entry.entry_id
    storage = LedgerStorage(hass, entry_id)
    assert pool_entry.data["initialized"] is True
    assert await hass.config_entries.async_unload(entry_id)
    await hass.async_add_executor_job(storage.path.unlink)
    assert not await hass.config_entries.async_setup(entry_id)
    assert pool_entry.state is ConfigEntryState.SETUP_RETRY
    assert await storage.load() is None


async def test_review_actual_lovelace_resource_collection_registers_and_updates_once(hass):
    """Use the real HA collection schemas to validate bundled-card registration."""
    from types import SimpleNamespace
    from unittest.mock import AsyncMock
    from homeassistant.components.lovelace.resources import ResourceStorageCollection
    from custom_components.coffee_tracker import _register_card
    from custom_components.coffee_tracker.const import CARD_URL, VERSION

    collection = ResourceStorageCollection(hass, SimpleNamespace(async_load=AsyncMock(return_value={})))
    hass.data["lovelace"] = SimpleNamespace(resources=collection)
    original_http = hass.http
    hass.http = SimpleNamespace(async_register_static_paths=AsyncMock())
    try:
        await _register_card(hass)
        resources = collection.async_items()
        assert len(resources) == 1
        assert resources[0]["url"] == f"{CARD_URL}?v={VERSION}"
        assert resources[0]["type"] == "module"
        resource_id = resources[0]["id"]
        await collection.async_update_item(resource_id, {"url": f"{CARD_URL}?v=0.0.0", "res_type": "js"})
        await _register_card(hass)
        await _register_card(hass)
        resources = collection.async_items()
        assert len(resources) == 1
        assert resources[0]["id"] == resource_id
        assert resources[0]["url"] == f"{CARD_URL}?v={VERSION}"
        assert resources[0]["type"] == "module"
        registered = hass.http.async_register_static_paths.call_args.args[0][0]
        assert registered.url_path == CARD_URL
        assert registered.path.endswith("custom_components/coffee_tracker/www/coffee-tracker-card.js")
        assert registered.cache_headers is False
    finally:
        hass.http = original_http
        hass.data.pop("lovelace")


async def test_review_repeated_cancellation_cannot_abandon_executor_commit(tmp_path):
    """A second cancellation must not release the lock while disk writing continues."""
    import json
    import threading

    loop = asyncio.get_running_loop()
    entered = asyncio.Event()
    disk_finished = asyncio.Event()
    release = threading.Event()
    path = tmp_path / "synthetic-ledger.json"

    def blocking_save(state):
        loop.call_soon_threadsafe(entered.set)
        assert release.wait(timeout=5)
        path.write_text(json.dumps(state))
        loop.call_soon_threadsafe(disk_finished.set)

    async def save(state):
        if state["revision"] > 1:
            await loop.run_in_executor(None, blocking_save, state)

    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="1.00", balance="5")
    purchase = asyncio.create_task(ledger.mutate("buy_coffee", request_id="review-double-cancel"))
    await entered.wait()
    purchase.cancel()
    await asyncio.sleep(0)
    purchase.cancel()
    await asyncio.sleep(0)
    release.set()
    with pytest.raises(asyncio.CancelledError):
        await purchase
    await disk_finished.wait()
    committed = json.loads(await asyncio.to_thread(path.read_text))
    assert committed["balance_minor"] == 400
    assert ledger.snapshot["balance_minor"] == committed["balance_minor"]
    assert ledger.snapshot["revision"] == committed["revision"]
    repeated = await ledger.mutate("buy_coffee", request_id="review-double-cancel")
    assert repeated["revision"] == 2
