"""Price control shared by the card and Home Assistant."""
from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import EntityCategory

from .entity import CoffeeEntity


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    async_add_entities([CupPriceNumber(entry.runtime_data)])


class CupPriceNumber(CoffeeEntity, NumberEntity):
    _attr_name = "Cup price"
    _attr_icon = "mdi:cash"
    _attr_entity_category = EntityCategory.CONFIG
    _attr_mode = NumberMode.BOX
    _attr_native_min_value = 0.01
    _attr_native_max_value = 10000
    _attr_native_step = 0.01

    def __init__(self, pool) -> None:
        super().__init__(pool, "cup_price")
        self._attr_native_unit_of_measurement = pool.ledger.snapshot["currency"]

    @property
    def native_value(self):
        return self.pool.ledger.snapshot["cup_price_minor"] / 100

    async def async_set_native_value(self, value: float) -> None:
        await self.pool.mutate("set_price", self._context, amount=value, expected_revision=self.pool.ledger.snapshot["revision"])
