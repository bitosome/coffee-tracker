"""Accounting invariants, storage failure and journal semantics."""
from copy import deepcopy

import pytest

from custom_components.coffee_tracker.ledger import Ledger, LedgerError, to_minor


@pytest.mark.parametrize("value,expected", [("0.01", 1), ("1.2300", 123), ("-0.10", -10), (0.1, 10), ("1e-2", 1), ("0e999999999", 0)])
def test_exact_decimal(value, expected):
    assert to_minor(value) == expected


@pytest.mark.parametrize("value", [True, None, "nan", "inf", "-Infinity", "0.001", "1e999999999", "1e-999999999", "9" * 200])
def test_bad_amount(value):
    with pytest.raises(LedgerError):
        to_minor(value)


async def test_storage_failure_has_no_memory_effect():
    saved = []
    async def save(state):
        if saved:
            raise OSError("disk full")
        saved.append(deepcopy(state))
    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="2.00", balance="10.00")
    before = ledger.snapshot
    with pytest.raises(OSError):
        await ledger.mutate("buy_coffee", request_id="failure-request")
    assert ledger.snapshot == before
    assert len(ledger.history()["items"]) == 1


async def test_negative_balance_undo_and_price_history():
    saved = []
    async def save(state):
        saved.append(deepcopy(state))
    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="2", balance="1")
    purchase = await ledger.mutate("buy_coffee")
    assert purchase["balance_minor"] == -100
    await ledger.mutate("set_price", amount="5", expected_revision=2)
    await ledger.mutate("undo", transaction_id=purchase["transaction_id"], expected_revision=3)
    assert ledger.snapshot["balance_minor"] == 100
    assert ledger.snapshot["coffee_count"] == 0
    assert ledger.snapshot["cup_price_minor"] == 500
    with pytest.raises(LedgerError, match="Only the latest"):
        await ledger.mutate("undo", transaction_id=purchase["transaction_id"], expected_revision=4)
    restored = Ledger(save)
    await restored.initialize(saved[-1], currency="EUR", price="1", balance="0")
    assert restored.snapshot == ledger.snapshot


async def test_request_conflict_and_scoping():
    async def save(state):
        pass
    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="2", balance="10")
    first = await ledger.mutate("add_funds", amount="1.10", request_id="same-request", actor_id="first")
    assert await ledger.mutate("add_funds", amount="1.1", request_id="same-request", actor_id="first") == first
    with pytest.raises(LedgerError, match="already used"):
        await ledger.mutate("add_funds", amount="2", request_id="same-request", actor_id="first")
    await ledger.mutate("add_funds", amount="2", request_id="same-request", actor_id="second")
    assert ledger.snapshot["balance_minor"] == 1310


async def test_corrupt_semantics_rejected_without_overwrite():
    saved = []
    async def save(state):
        saved.append(deepcopy(state))
    ledger = Ledger(save)
    await ledger.initialize(None, currency="EUR", price="2", balance="10")
    await ledger.mutate("buy_coffee")
    corrupt = deepcopy(saved[-1])
    corrupt["transactions"][-1]["amount_minor"] = -100
    corrupt["transactions"][-1]["balance_minor"] = 900
    corrupt["balance_minor"] = 900
    restored = Ledger(save)
    with pytest.raises(LedgerError, match="invalid"):
        await restored.initialize(corrupt, currency="EUR", price="2", balance="10")
    assert len(saved) == 2
