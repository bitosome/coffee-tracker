"""Independent reset regressions for durable writes, stale clients and restarts."""
from __future__ import annotations

import asyncio
from copy import deepcopy

import pytest

from custom_components.coffee_tracker.ledger import Ledger, LedgerError


async def make_ledger(save):
    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="1.25", balance="10.00")
    return ledger


async def reset(ledger, request_id="review-reset-request", **kwargs):
    return await ledger.mutate(
        "reset_ledger", confirmed=True,
        expected_revision=ledger.snapshot["revision"], request_id=request_id, **kwargs,
    )


async def test_reset_review_failed_write_keeps_history_and_original_retry():
    snapshots = []
    fail_reset = False

    async def save(state):
        if fail_reset:
            raise OSError("synthetic disk full")
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    original = await ledger.mutate("buy_coffee", request_id="review-original-coffee")
    before = ledger.snapshot
    history = ledger.history()
    fail_reset = True
    with pytest.raises(OSError, match="disk full"):
        await reset(ledger)
    assert ledger.snapshot == before
    assert ledger.history() == history
    assert len(snapshots) == 2
    assert await ledger.mutate("buy_coffee", request_id="review-original-coffee") == original
    fail_reset = False
    result = await reset(ledger)
    assert result["revision"] == 3
    assert ledger.history()["items"] == []


async def test_reset_review_cancelled_client_commits_once_and_survives_restart():
    snapshots = []
    writing = asyncio.Event()
    release = asyncio.Event()
    delay = False

    async def save(state):
        if delay:
            writing.set()
            await release.wait()
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    await ledger.mutate("buy_coffee", request_id="review-before-reset")
    delay = True
    request = dict(confirmed=True, expected_revision=2, request_id="review-cancel-reset")
    resetting = asyncio.create_task(ledger.mutate("reset_ledger", **request))
    await writing.wait()
    resetting.cancel()
    await asyncio.sleep(0)
    resetting.cancel()
    release.set()
    with pytest.raises(asyncio.CancelledError):
        await resetting
    assert ledger.snapshot == {"currency": "EUR", "balance_minor": 0, "cup_price_minor": 125, "coffee_count": 0, "revision": 3}
    assert ledger.history()["items"] == []
    restored = Ledger(save)
    await restored.initialize(snapshots[-1], currency="EUR", price="9.00", balance="99.00")
    repeated = await restored.mutate("reset_ledger", **request)
    assert repeated["revision"] == 3
    assert len(snapshots) == 3
    with pytest.raises(LedgerError) as error:
        await restored.mutate("buy_coffee", request_id="review-before-reset")
    assert error.value.code == "request_retired"
    assert restored.snapshot["coffee_count"] == 0


async def test_reset_review_purchase_committing_first_invalidates_old_confirmation():
    writing = asyncio.Event()
    release = asyncio.Event()
    delay = False

    async def save(state):
        if delay:
            writing.set()
            await release.wait()

    ledger = await make_ledger(save)
    delay = True
    purchase = asyncio.create_task(ledger.mutate("buy_coffee"))
    await writing.wait()
    resetting = asyncio.create_task(ledger.mutate("reset_ledger", confirmed=True, expected_revision=1, request_id="review-stale-reset"))
    release.set()
    await purchase
    with pytest.raises(LedgerError) as error:
        await resetting
    assert error.value.code == "stale_revision"
    assert ledger.snapshot["balance_minor"] == 875
    assert len(ledger.history()["items"]) == 2


async def test_reset_review_new_watch_purchase_queues_after_reset_and_is_not_lost():
    writing = asyncio.Event()
    release = asyncio.Event()
    delay = False

    async def save(state):
        if delay:
            writing.set()
            await release.wait()

    ledger = await make_ledger(save)
    delay = True
    resetting = asyncio.create_task(reset(ledger))
    await writing.wait()
    purchase = asyncio.create_task(ledger.mutate("buy_coffee", request_id="review-new-watch-coffee"))
    release.set()
    await resetting
    await purchase
    assert ledger.snapshot["balance_minor"] == -125
    assert ledger.snapshot["coffee_count"] == 1
    assert ledger.snapshot["revision"] == 3
    assert [row["kind"] for row in ledger.history()["items"]] == ["buy_coffee"]


async def test_reset_review_old_reset_retry_cannot_erase_new_activity():
    snapshots = []

    async def save(state):
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    request = dict(confirmed=True, expected_revision=1, request_id="review-reset-retry")
    result = await ledger.mutate("reset_ledger", **request)
    await ledger.mutate("add_funds", amount="4.50", request_id="review-later-funds")
    restored = Ledger(save)
    await restored.initialize(snapshots[-1], currency="EUR", price="8.00", balance="88.00")
    assert await restored.mutate("reset_ledger", **request) == result
    assert restored.snapshot["balance_minor"] == 450
    assert restored.snapshot["revision"] == 3
    assert len(restored.history()["items"]) == 1
    assert len(snapshots) == 3


async def test_reset_review_repeated_reset_retires_old_actions_and_previous_reset():
    snapshots = []

    async def save(state):
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    coffee = dict(request_id="review-repeated-key", actor_id="synthetic-user-a")
    await ledger.mutate("buy_coffee", **coffee)
    first_reset = dict(confirmed=True, expected_revision=2, request_id="review-first-reset")
    await ledger.mutate("reset_ledger", **first_reset)
    await ledger.mutate("buy_coffee", request_id="review-repeated-key", actor_id="synthetic-user-b")
    await reset(ledger, request_id="review-second-reset")
    restored = Ledger(save)
    await restored.initialize(snapshots[-1], currency="EUR", price="1.00", balance="0.00")
    for kind, args in (("buy_coffee", coffee), ("reset_ledger", first_reset), ("buy_coffee", {**coffee, "actor_id": "synthetic-user-b"})):
        with pytest.raises(LedgerError) as error:
            await restored.mutate(kind, **args)
        assert error.value.code == "request_retired"
    assert restored.snapshot["revision"] == 5
    assert restored.history()["items"] == []
    assert len(snapshots) == 5
    raw = str(snapshots[-1])
    assert "synthetic-user-a" not in raw
    assert "synthetic-user-b" not in raw
    assert "review-repeated-key" not in raw


async def test_reset_review_legacy_storage_loads_then_resets_without_sequence_reuse():
    snapshots = []

    async def save(state):
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    await ledger.mutate("buy_coffee", request_id="review-legacy-coffee")
    legacy = {key: deepcopy(value) for key, value in snapshots[-1].items() if key in ("currency", "balance_minor", "cup_price_minor", "coffee_count", "revision", "transactions")}
    restored = Ledger(save)
    await restored.initialize(legacy, currency="EUR", price="8.88", balance="88.88")
    result = await reset(restored)
    assert result["revision"] == 3
    new = await restored.mutate("buy_coffee")
    assert new["revision"] == 4
    latest = Ledger(save)
    await latest.initialize(snapshots[-1], currency="EUR", price="8.88", balance="88.88")
    assert latest.snapshot == restored.snapshot
    assert latest.history()["items"][0]["sequence"] == 4
    assert latest.snapshot["cup_price_minor"] == 125


@pytest.mark.parametrize("field,value", [("balance_minor", 100), ("coffee_count", 1), ("revision", 1), ("cup_price_minor", 0)])
async def test_reset_review_corrupt_empty_ledger_never_overwrites_storage(field, value):
    snapshots = []

    async def save(state):
        snapshots.append(deepcopy(state))

    ledger = await make_ledger(save)
    await reset(ledger)
    corrupt = deepcopy(snapshots[-1])
    corrupt[field] = value
    restored = Ledger(save)
    with pytest.raises(LedgerError) as error:
        await restored.initialize(corrupt, currency="EUR", price="1", balance="0")
    assert error.value.code == "invalid_storage"
    assert len(snapshots) == 2


async def test_reset_review_atomic_storage_failure_preserves_durable_data(hass, tmp_path, monkeypatch):
    from homeassistant.exceptions import HomeAssistantError
    from homeassistant.util.file import WriteError
    from custom_components.coffee_tracker.storage import LedgerStorage

    hass.config.config_dir = str(tmp_path)
    storage = LedgerStorage(hass, "review-reset-atomic")
    ledger = await make_ledger(storage.save)
    await ledger.mutate("buy_coffee", request_id="review-persisted-coffee")
    before = await storage.load()

    def fail_atomic_write(*args, **kwargs):
        raise WriteError("synthetic reset disk failure")

    with monkeypatch.context() as patch:
        patch.setattr("homeassistant.helpers.json.write_utf8_file_atomic", fail_atomic_write)
        with pytest.raises(HomeAssistantError, match="disk failure"):
            await reset(ledger)
    assert await storage.load() == before
    assert ledger.snapshot["balance_minor"] == 875
    await reset(ledger)
    restored = Ledger(storage.save)
    await restored.initialize(await storage.load(), currency="EUR", price="2", balance="50")
    assert restored.snapshot["balance_minor"] == 0
    assert restored.history()["items"] == []
