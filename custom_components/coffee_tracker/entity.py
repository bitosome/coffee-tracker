"""Shared entity representation of a coffee pool."""
from homeassistant.core import Context, callback
from homeassistant.helpers.entity import DeviceInfo, Entity

from . import Pool
from .const import DOMAIN, VERSION


class CoffeeEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, pool: Pool, key: str) -> None:
        self.pool = pool
        self._attr_unique_id = f"{pool.entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, pool.entry.entry_id)}, name=pool.entry.title, manufacturer="Coffee Tracker", model="Shared coffee pool", sw_version=VERSION)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.pool.subscribe(self._changed))

    @callback
    def _changed(self, context: Context | None = None) -> None:
        if context is not None:
            self.async_set_context(context)
        self.async_write_ha_state()
