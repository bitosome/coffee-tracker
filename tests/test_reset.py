"""Confirmed ledger reset, including Home Assistant service/entity boundaries."""
from copy import deepcopy
import json

import pytest
import voluptuous as vol
from homeassistant.core import Context
from homeassistant.exceptions import Unauthorized

from custom_components.coffee_tracker.ledger import Ledger, LedgerError


async def make_ledger():
    saved = []

    async def save(state):
        saved.append(deepcopy(state))

    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="1.25", balance="12.50")
    return ledger, saved, save


async def test_reset_erases_entries_and_personal_data_but_preserves_price_currency():
    ledger, saved, save = await make_ledger()
    await ledger.mutate("add_funds", amount="2.50", actor="Private contributor", note="Private note", request_id="private-request", actor_id="private-user")
    await ledger.mutate("buy_coffee", actor="Private coffee drinker")
    receipt = await ledger.mutate("reset_ledger", expected_revision=3, request_id="reset-request", confirmed=True)
    assert receipt == {"currency": "EUR", "revision": 4, "transaction_id": saved[-1]["reset"]["id"], "balance_minor": 0, "cup_price_minor": 125, "coffee_count": 0}
    assert ledger.history() == {"items": [], "has_more": False, "next_before": None, "revision": 4}
    assert ledger.last_action_at == saved[-1]["reset"]["timestamp"]
    assert saved[-1]["transactions"] == []
    assert saved[-1]["base_revision"] == 4
    serialized = json.dumps(saved[-1])
    for private_text in ("Private contributor", "Private note", "Private coffee drinker", "private-request", "private-user", "opening_balance"):
        assert private_text not in serialized
    assert len(saved[-1]["retired_requests"]) == 1
    restored = Ledger(save)
    await restored.initialize(saved[-1], currency="EUR", price="2.00", balance="99.00")
    assert restored.snapshot == ledger.snapshot
    assert restored.history()["items"] == []
    added = await restored.mutate("add_funds", amount="10")
    assert added["revision"] == 5
    assert restored.history()["items"][0]["undoable"]
    await restored.mutate("undo", transaction_id=added["transaction_id"], expected_revision=5)
    restored_again = Ledger(save)
    await restored_again.initialize(saved[-1], currency="EUR", price="2", balance="99")
    assert restored_again.snapshot["balance_minor"] == 0


@pytest.mark.parametrize("confirmation", [False, None, 0, 1, "true", "yes"])
async def test_reset_requires_explicit_true(confirmation):
    ledger, saved, _ = await make_ledger()
    with pytest.raises(LedgerError) as error:
        await ledger.mutate("reset_ledger", confirmed=confirmation, expected_revision=1, request_id="reset-request")
    assert error.value.code == "confirmation_required"
    assert len(saved) == 1


async def test_reset_requires_request_and_revision_and_does_not_reuse_old_receipt():
    ledger, saved, _ = await make_ledger()
    with pytest.raises(LedgerError) as error:
        await ledger.mutate("reset_ledger", confirmed=True, expected_revision=1)
    assert error.value.code == "missing_request_id"
    with pytest.raises(LedgerError) as error:
        await ledger.mutate("reset_ledger", confirmed=True, request_id="reset-first")
    assert error.value.code == "missing_revision"
    await ledger.mutate("reset_ledger", confirmed=True, expected_revision=1, request_id="reset-first")
    await ledger.mutate("add_funds", amount="3", request_id="after-first")
    await ledger.mutate("reset_ledger", confirmed=True, expected_revision=3, request_id="reset-second")
    assert saved[-1]["base_revision"] == 4
    assert len(saved[-1]["retired_requests"]) == 2
    with pytest.raises(LedgerError) as error:
        await ledger.mutate("reset_ledger", confirmed=True, expected_revision=1, request_id="reset-first")
    assert error.value.code == "request_retired"
    assert ledger.snapshot["revision"] == 4


async def test_reset_service_and_entities_remain_available_after_empty_history(hass, pool_entry, hass_admin_user):
    pool = pool_entry.runtime_data
    entity = pool.entity_id("sensor", "balance")
    assert hass.states.get(entity).attributes["supports_reset"] is True
    request = {"entity_id": entity, "expected_revision": 1, "request_id": "ha-reset-request", "confirmed": True}
    receipt = await hass.services.async_call("coffee_tracker", "reset_ledger", request, blocking=True, return_response=True, context=Context(user_id=hass_admin_user.id))
    assert receipt["balance_minor"] == 0
    assert receipt["coffee_count"] == 0
    assert receipt["cup_price_minor"] == 200
    state = hass.states.get(entity)
    assert state.state == "0"
    assert state.attributes["revision"] == 2
    assert state.attributes["last_action_at"]
    assert hass.states.get(pool.entity_id("sensor", "coffees")).state == "0"
    history = await hass.services.async_call("coffee_tracker", "get_history", {"entity_id": entity}, blocking=True, return_response=True)
    assert history["items"] == []
    assert await hass.config_entries.async_reload(pool_entry.entry_id)
    await hass.async_block_till_done()
    pool = pool_entry.runtime_data
    assert pool.ledger.snapshot["revision"] == 2
    assert hass.states.get(entity).state == "0"
    await hass.services.async_call("button", "press", {"entity_id": pool.entity_id("button", "buy_coffee")}, blocking=True)
    assert pool.ledger.snapshot["balance_minor"] == -200
    history = pool.ledger.history()
    assert len(history["items"]) == 1
    assert history["items"][0]["kind"] == "buy_coffee"
    assert history["items"][0]["sequence"] == 3


@pytest.mark.parametrize("field,value", [("confirmed", False), ("confirmed", 1), ("confirmed", "true"), ("confirmed", None), ("request_id", None), ("expected_revision", None)])
async def test_reset_service_rejects_implicit_confirmation_or_missing_guard(hass, pool_entry, field, value):
    pool = pool_entry.runtime_data
    data = {"entity_id": pool.entity_id("sensor", "balance"), "expected_revision": 1, "request_id": "ha-reset-request", "confirmed": True}
    if value is None:
        data.pop(field)
    else:
        data[field] = value
    with pytest.raises(vol.Invalid):
        await hass.services.async_call("coffee_tracker", "reset_ledger", data, blocking=True)
    assert pool.ledger.snapshot["revision"] == 1


async def test_reset_service_requires_control_permission(hass, pool_entry, hass_read_only_user):
    pool = pool_entry.runtime_data
    data = {"entity_id": pool.entity_id("sensor", "balance"), "expected_revision": 1, "request_id": "ha-reset-request", "confirmed": True}
    with pytest.raises(Unauthorized):
        await hass.services.async_call("coffee_tracker", "reset_ledger", data, blocking=True, context=Context(user_id=hass_read_only_user.id))
    assert pool.ledger.snapshot["revision"] == 1
