"""Real Home Assistant entity/service tests; only the browser bundle is mocked."""
from unittest.mock import AsyncMock, patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, mock_component


@pytest.fixture
async def pool_entry(hass, enable_custom_integrations, tmp_path):
    hass.config.config_dir = str(tmp_path)
    mock_component(hass, "frontend")
    entry = MockConfigEntry(domain="coffee_tracker", title="Test coffee pool", data={"currency": "EUR", "cup_price": "2.00", "opening_balance": "10.00"})
    entry.add_to_hass(hass)
    with patch("custom_components.coffee_tracker._register_card", new=AsyncMock()):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        yield entry
    if getattr(entry, "runtime_data", None) is not None and entry.runtime_data.active:
        await hass.config_entries.async_unload(entry.entry_id)
        await hass.async_block_till_done()
