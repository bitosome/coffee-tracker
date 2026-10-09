"""Coffee pool balance and lifetime consumption."""
from decimal import Decimal

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity

from .entity import CoffeeEntity


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    async_add_entities([BalanceSensor(entry.runtime_data), CoffeesSensor(entry.runtime_data)])


class BalanceSensor(CoffeeEntity, SensorEntity):
    _attr_name = "Balance"
    _attr_icon = "mdi:wallet"
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_suggested_display_precision = 2

    def __init__(self, pool) -> None:
        super().__init__(pool, "balance")
        self._attr_native_unit_of_measurement = pool.ledger.snapshot["currency"]

    @property
    def native_value(self):
        return Decimal(self.pool.ledger.snapshot["balance_minor"]) / 100

    @property
    def extra_state_attributes(self):
        snapshot = self.pool.ledger.snapshot
        latest = self.pool.ledger.history(limit=1)["items"][0]
        return {"integration": "coffee_tracker", "pool_id": self.pool.entry.entry_id, **snapshot, "last_action_at": latest["timestamp"], "price_entity_id": self.pool.entity_id("number", "cup_price"), "coffee_button_entity_id": self.pool.entity_id("button", "buy_coffee")}


class CoffeesSensor(CoffeeEntity, SensorEntity):
    _attr_name = "Coffees"
    _attr_icon = "mdi:coffee"

    def __init__(self, pool) -> None:
        super().__init__(pool, "coffees")

    @property
    def native_value(self):
        return self.pool.ledger.snapshot["coffee_count"]
