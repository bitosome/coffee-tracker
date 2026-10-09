"""Exercise config flow, real entity platforms and permission-aware services."""
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import Context
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.helpers import entity_registry as er
from homeassistant.config_entries import SOURCE_USER
from pytest_homeassistant_custom_component.common import mock_component


async def test_entities_and_watch_button(hass, pool_entry, hass_admin_user):
    pool = pool_entry.runtime_data
    balance = pool.entity_id("sensor", "balance")
    button = pool.entity_id("button", "buy_coffee")
    price = pool.entity_id("number", "cup_price")
    state = hass.states.get(balance)
    assert state.state == "10"
    assert state.attributes["coffee_button_entity_id"] == button
    assert state.attributes["price_entity_id"] == price
    assert "transactions" not in state.attributes
    await hass.services.async_call("button", "press", {"entity_id": button}, blocking=True, context=Context(user_id=hass_admin_user.id))
    assert pool.ledger.snapshot["balance_minor"] == 800
    assert pool.ledger.history()["items"][0]["actor"] == hass_admin_user.name
    await hass.services.async_call("number", "set_value", {"entity_id": price, "value": 1.25}, blocking=True)
    await hass.services.async_call("button", "press", {"entity_id": button}, blocking=True)
    assert pool.ledger.snapshot["balance_minor"] == 675
    assert hass.states.get(pool.entity_id("sensor", "coffees")).state == "2"


async def test_service_persistence_dedupe_history_and_stale_edit(hass, pool_entry):
    pool = pool_entry.runtime_data
    entity = pool.entity_id("sensor", "balance")
    data = {"entity_id": entity, "request_id": "test-request-123", "amount": "0.10"}
    result = await hass.services.async_call("coffee_tracker", "add_funds", data, blocking=True, return_response=True)
    assert result["balance_minor"] == 1010
    await hass.config_entries.async_reload(pool_entry.entry_id)
    await hass.async_block_till_done()
    pool = pool_entry.runtime_data
    result2 = await hass.services.async_call("coffee_tracker", "add_funds", data, blocking=True, return_response=True)
    assert result == result2
    assert pool.ledger.snapshot["revision"] == 2
    with pytest.raises(ServiceValidationError, match="stale_revision"):
        await hass.services.async_call("coffee_tracker", "set_balance", {"entity_id": entity, "amount": "100", "expected_revision": 1}, blocking=True)
    history = await hass.services.async_call("coffee_tracker", "get_history", {"entity_id": entity, "limit": 1}, blocking=True, return_response=True)
    assert history["items"][0]["amount_minor"] == 10
    assert history["has_more"]
    assert history["next_before"] == 2


async def test_permissions_and_entity_target_validation(hass, pool_entry, hass_read_only_user):
    pool = pool_entry.runtime_data
    entity = pool.entity_id("sensor", "balance")
    context = Context(user_id=hass_read_only_user.id)
    history = await hass.services.async_call("coffee_tracker", "get_history", {"entity_id": entity}, blocking=True, return_response=True, context=context)
    assert len(history["items"]) == 1
    with pytest.raises(Unauthorized):
        await hass.services.async_call("coffee_tracker", "buy_coffee", {"entity_id": entity}, blocking=True, context=context)
    with pytest.raises(Unauthorized):
        await hass.services.async_call("coffee_tracker", "buy_coffee", {"entity_id": entity}, blocking=True, context=Context(user_id="deleted-user"))
    with pytest.raises(ServiceValidationError, match="balance sensor"):
        await hass.services.async_call("coffee_tracker", "buy_coffee", {"entity_id": pool.entity_id("sensor", "coffees")}, blocking=True)
    assert pool.ledger.snapshot["balance_minor"] == 1000


async def test_renamed_entity_links(hass, pool_entry):
    registry = er.async_get(hass)
    pool = pool_entry.runtime_data
    original = pool.entity_id("button", "buy_coffee")
    registry.async_update_entity(original, new_entity_id="button.office_coffee")
    await hass.async_block_till_done()
    assert hass.states.get(pool.entity_id("sensor", "balance")).attributes["coffee_button_entity_id"] == "button.office_coffee"


async def test_config_flow(hass, enable_custom_integrations):
    mock_component(hass, "frontend")
    result = await hass.config_entries.flow.async_init("coffee_tracker", context={"source": SOURCE_USER})
    assert result["type"] == "form"
    bad = await hass.config_entries.flow.async_configure(result["flow_id"], {"name": "Coffee", "currency": "EUR", "cup_price": "0", "opening_balance": "2.123"})
    assert bad["errors"]["base"] == "invalid_amount"
    with patch("custom_components.coffee_tracker.async_setup_entry", new=AsyncMock(return_value=True)):
        good = await hass.config_entries.flow.async_configure(result["flow_id"], {"name": " Coffee ", "currency": "EUR", "cup_price": "1.25", "opening_balance": "10.01"})
        assert good["type"] == "create_entry"
        assert good["title"] == "Coffee"
        assert good["data"]["opening_balance"] == "10.01"
        await hass.async_block_till_done()
