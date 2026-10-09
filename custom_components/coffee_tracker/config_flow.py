"""Create shared pools through Settings → Devices & services."""
from decimal import Decimal

import voluptuous as vol

from homeassistant import config_entries

from .const import CURRENCIES, DOMAIN
from .ledger import LedgerError, to_minor


class CoffeeTrackerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            try:
                name = user_input["name"].strip()
                if not name or len(name) > 80:
                    errors["name"] = "invalid_name"
                price = to_minor(user_input["cup_price"], price=True)
                balance = to_minor(user_input["opening_balance"])
                if user_input["currency"] not in CURRENCIES:
                    errors["currency"] = "invalid_currency"
                if not errors:
                    # Exact decimal strings in config; persisted journal owns all
                    # subsequent changes and always wins over these initial values.
                    return self.async_create_entry(title=name, data={"currency": user_input["currency"], "cup_price": f"{Decimal(price) / 100:.2f}", "opening_balance": f"{Decimal(balance) / 100:.2f}"})
            except LedgerError:
                errors["base"] = "invalid_amount"
        defaults = user_input or {}
        return self.async_show_form(step_id="user", data_schema=vol.Schema({vol.Required("name", default=defaults.get("name", "Coffee pool")): str, vol.Required("currency", default=defaults.get("currency", "EUR")): vol.In(CURRENCIES), vol.Required("cup_price", default=defaults.get("cup_price", "2.00")): str, vol.Required("opening_balance", default=defaults.get("opening_balance", "0.00")): str}), errors=errors)
