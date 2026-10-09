"""One press records one coffee, including Apple Watch Companion actions."""
from homeassistant.components.button import ButtonEntity

from .entity import CoffeeEntity


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    async_add_entities([BuyCoffeeButton(entry.runtime_data)])


class BuyCoffeeButton(CoffeeEntity, ButtonEntity):
    _attr_name = "Buy coffee"
    _attr_icon = "mdi:coffee"

    def __init__(self, pool) -> None:
        super().__init__(pool, "buy_coffee")

    async def async_press(self) -> None:
        await self.pool.mutate("buy_coffee", self._context)
