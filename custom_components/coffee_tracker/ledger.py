"""Persistent accounting independent of Home Assistant and its UI.

Amounts are cents, commits are serialized, and a save must succeed before the
new snapshot becomes visible. The append-only journal is also the idempotency
index: a retried operation can never silently debit the pool again after restart.
"""
from __future__ import annotations

import asyncio
from copy import deepcopy
from datetime import datetime, timezone
from decimal import Decimal, DecimalException, InvalidOperation
import hashlib
import json
from typing import Any, Awaitable, Callable
from uuid import uuid4

from .const import CURRENCIES, MAX_BALANCE_MINOR, MAX_PRICE_MINOR


class LedgerError(ValueError):
    """A rejected operation with a stable, machine-readable error code."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(message)


def to_minor(value: Any, *, positive: bool = False, price: bool = False) -> int:
    """Parse decimal major units without rounding or accepting bool/NaN."""
    try:
        if isinstance(value, bool) or not isinstance(value, (str, int, float, Decimal)):
            raise InvalidOperation
        text = str(value).strip()
        if len(text) > 128:
            raise InvalidOperation
        decimal = Decimal(text)
        limit = MAX_PRICE_MINOR if price else MAX_BALANCE_MINOR
        if not decimal.is_finite() or decimal.copy_abs() > Decimal(limit) / 100:
            raise InvalidOperation
        sign, digits, exponent = decimal.as_tuple()
        # Tuple arithmetic is exact and independent of Decimal's finite context.
        # It cannot round an extremely small amount to zero or overflow first.
        digits = list(digits)
        while digits and digits[-1] == 0:
            digits.pop()
            exponent += 1
        if not digits:
            result = 0
        elif exponent < -2:
            raise InvalidOperation
        else:
            result = int("".join(str(digit) for digit in digits)) * 10 ** (exponent + 2)
            if sign:
                result = -result
    except (DecimalException, ValueError, OverflowError) as err:
        raise LedgerError("invalid_amount", "Enter a finite amount with no more than two decimal places.") from err
    if (positive or price) and result <= 0:
        raise LedgerError("invalid_amount", "The amount must be greater than zero.")
    return result


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def _integer(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


class Ledger:
    """One shared pool; all entry points, including the watch, use this lock."""

    def __init__(self, save: Callable[[dict], Awaitable[None]]) -> None:
        self._save = save
        self._lock = asyncio.Lock()
        self._state: dict = {}
        self._closed = False
        self._requests: dict[str, dict] = {}

    async def close(self) -> None:
        """Drain an in-flight commit before unloading/reloading this pool."""
        async with self._lock:
            self._closed = True

    async def reopen(self) -> None:
        async with self._lock:
            self._closed = False

    @property
    def snapshot(self) -> dict:
        return {key: self._state[key] for key in ("currency", "balance_minor", "cup_price_minor", "coffee_count", "revision")}

    async def initialize(self, stored: dict | None, *, currency: str, price: Any, balance: Any, actor: str = "Setup") -> None:
        if stored is not None:
            self._validate(stored)
            if stored["currency"] != currency:
                raise LedgerError("invalid_storage", "The stored currency does not match this pool.")
            self._state = deepcopy(stored)
        else:
            if currency not in CURRENCIES:
                raise LedgerError("invalid_currency", "Choose a supported two-decimal currency.")
            state = {"currency": currency, "balance_minor": to_minor(balance), "cup_price_minor": to_minor(price, price=True), "coffee_count": 0, "revision": 1}
            item = {"id": str(uuid4()), "sequence": 1, "kind": "opening_balance", "amount_minor": state["balance_minor"], "timestamp": _timestamp(), "actor": actor, "note": "Opening balance", **state}
            item.pop("currency")
            item.pop("revision")
            state["transactions"] = [item]
            await self._commit(state)
        self._requests = {item["request_key"]: item for item in self._state["transactions"] if "request_key" in item}

    @staticmethod
    def _validate(state: Any) -> None:
        try:
            if not isinstance(state, dict) or state["currency"] not in CURRENCIES:
                raise ValueError
            rows = state["transactions"]
            if not isinstance(rows, list) or not rows or (not _integer(state["revision"]) or state["revision"] != len(rows)):
                raise ValueError
            balance = count = 0
            previous_price = None
            latest_financial = None
            ids: set[str] = set()
            requests: set[str] = set()
            for sequence, row in enumerate(rows, 1):
                if not _integer(row["sequence"]) or row["sequence"] != sequence or row["id"] in ids or not isinstance(row["id"], str) or not row["id"]:
                    raise ValueError
                ids.add(row["id"])
                if row["kind"] not in ("opening_balance", "add_funds", "buy_coffee", "set_balance", "set_price", "undo"):
                    raise ValueError
                if (sequence == 1) != (row["kind"] == "opening_balance"):
                    raise ValueError
                for key in ("amount_minor", "balance_minor", "cup_price_minor", "coffee_count"):
                    if not _integer(row[key]):
                        raise ValueError
                if not 1 <= row["cup_price_minor"] <= MAX_PRICE_MINOR or row["coffee_count"] < 0:
                    raise ValueError
                balance += row["amount_minor"]
                if balance != row["balance_minor"] or abs(balance) > MAX_BALANCE_MINOR:
                    raise ValueError
                kind = row["kind"]
                if previous_price is not None and kind != "set_price" and row["cup_price_minor"] != previous_price:
                    raise ValueError
                if kind == "buy_coffee":
                    if row["amount_minor"] != -row["cup_price_minor"]:
                        raise ValueError
                    count += 1
                elif kind == "add_funds" and row["amount_minor"] <= 0:
                    raise ValueError
                elif kind == "set_price" and row["amount_minor"] != 0:
                    raise ValueError
                elif kind == "undo":
                    if not latest_financial or latest_financial["kind"] in ("opening_balance", "undo") or row.get("undo_of") != latest_financial["id"] or row["amount_minor"] != -latest_financial["amount_minor"]:
                        raise ValueError
                    undo_coffee = latest_financial["kind"] == "buy_coffee"
                    if row.get("undo_coffee") is not undo_coffee:
                        raise ValueError
                    count -= int(undo_coffee)
                if kind != "set_price":
                    latest_financial = row
                previous_price = row["cup_price_minor"]
                if row["coffee_count"] != count:
                    raise ValueError
                if not isinstance(row["actor"], str) or not isinstance(row["note"], str):
                    raise ValueError
                if datetime.fromisoformat(row["timestamp"]).tzinfo is None:
                    raise ValueError
                if "request_key" in row:
                    if row["request_key"] in requests or not isinstance(row["request_fingerprint"], str):
                        raise ValueError
                    requests.add(row["request_key"])
            for key in ("balance_minor", "cup_price_minor", "coffee_count"):
                if not _integer(state[key]) or state[key] != rows[-1][key]:
                    raise ValueError
        except (KeyError, TypeError, ValueError, OverflowError) as err:
            raise LedgerError("invalid_storage", "The stored coffee ledger is invalid. Restore a backup; it has not been overwritten.") from err

    async def _commit(self, state: dict) -> None:
        # Cancellation while an executor writes must not release the mutation lock
        # with disk ahead of memory. Let the commit finish, then honor cancellation.
        async def persist() -> None:
            await self._save(deepcopy(state))
            self._state = state
        task = asyncio.create_task(persist())
        cancelled = False
        while not task.done():
            try:
                await asyncio.shield(task)
            except asyncio.CancelledError:
                # A timeout plus a disconnect can cancel the caller repeatedly.
                # Every wait must stay shielded: cancelling the executor await
                # does not stop its disk write and would put disk ahead of memory.
                cancelled = True
        task.result()  # Propagate a failed save; never publish an uncommitted state.
        if cancelled:
            raise asyncio.CancelledError

    def _response(self, row: dict) -> dict:
        return {"currency": self._state["currency"], "revision": row["sequence"], "transaction_id": row["id"], **{key: row[key] for key in ("balance_minor", "cup_price_minor", "coffee_count")}}

    def _last_financial(self) -> dict | None:
        return next((row for row in reversed(self._state["transactions"]) if row["kind"] != "set_price"), None)

    def history(self, *, limit: int = 20, before: int | None = None) -> dict:
        if not _integer(limit) or not 1 <= limit <= 100 or (before is not None and (not _integer(before) or before < 1)):
            raise LedgerError("invalid_history", "History limit must be 1–100 and its cursor a positive sequence.")
        rows = [row for row in reversed(self._state["transactions"]) if before is None or row["sequence"] < before]
        latest = self._last_financial()
        items = []
        for row in rows[:limit]:
            item = {key: value for key, value in row.items() if key not in ("request_key", "request_fingerprint", "undo_coffee")}
            item["undoable"] = bool(latest and row["id"] == latest["id"] and row["kind"] not in ("opening_balance", "undo"))
            items.append(item)
        return {"items": items, "has_more": len(rows) > limit, "next_before": items[-1]["sequence"] if len(rows) > limit else None, "revision": self._state["revision"]}

    async def mutate(self, kind: str, *, amount: Any = None, expected_revision: int | None = None, request_id: str | None = None, actor: str = "Automation", actor_id: str = "automation", note: str = "", transaction_id: str | None = None) -> dict:
        if kind not in ("add_funds", "buy_coffee", "set_balance", "set_price", "undo"):
            raise LedgerError("invalid_action", "Unknown coffee action.")
        if expected_revision is not None and (not _integer(expected_revision) or expected_revision < 1):
            raise LedgerError("invalid_revision", "Provide a positive revision.")
        if kind in ("set_balance", "set_price", "undo") and expected_revision is None:
            raise LedgerError("missing_revision", "Reload the pool before editing it.")
        if request_id is not None and (not isinstance(request_id, str) or not 8 <= len(request_id) <= 128):
            raise LedgerError("invalid_request_id", "Request IDs must have 8–128 characters.")
        if not isinstance(note, str) or len(note) > 250:
            raise LedgerError("invalid_note", "Notes may contain up to 250 characters.")
        minor = to_minor(amount, positive=kind == "add_funds", price=kind == "set_price") if kind in ("add_funds", "set_balance", "set_price") else None
        request_key = hashlib.sha256(f"{actor_id}:{request_id}".encode()).hexdigest() if request_id else None
        fingerprint = hashlib.sha256(json.dumps([kind, minor, expected_revision, note, transaction_id], separators=(",", ":")).encode()).hexdigest()
        async with self._lock:
            if self._closed:
                raise LedgerError("pool_unavailable", "This coffee pool is unloading. Try again after it reloads.")
            # Before revision checking: a network retry repeats the original result.
            if request_key and request_key in self._requests:
                previous = self._requests[request_key]
                if previous["request_fingerprint"] != fingerprint:
                    raise LedgerError("request_conflict", "This request ID was already used for another action.")
                return self._response(previous)
            if expected_revision is not None and expected_revision != self._state["revision"]:
                raise LedgerError("stale_revision", "The pool changed in another session. Review the latest balance and try again.")
            state = deepcopy(self._state)
            delta = 0
            count = state["coffee_count"]
            extra: dict = {}
            if kind == "add_funds":
                delta = minor
            elif kind == "set_balance":
                delta = minor - state["balance_minor"]
            elif kind == "buy_coffee":
                delta = -state["cup_price_minor"]
                count += 1
            elif kind == "set_price":
                state["cup_price_minor"] = minor
            elif kind == "undo":
                previous = self._last_financial()
                if not previous or previous["id"] != transaction_id or previous["kind"] in ("opening_balance", "undo"):
                    raise LedgerError("not_undoable", "Only the latest financial action can be undone once.")
                delta = -previous["amount_minor"]
                is_coffee = previous["kind"] == "buy_coffee"
                count -= int(is_coffee)
                extra = {"undo_of": previous["id"], "undo_coffee": is_coffee}
            state["balance_minor"] += delta
            if abs(state["balance_minor"]) > MAX_BALANCE_MINOR:
                raise LedgerError("balance_limit", "This action exceeds the supported balance range.")
            state["coffee_count"] = count
            state["revision"] += 1
            row = {"id": str(uuid4()), "sequence": state["revision"], "kind": kind, "amount_minor": delta, "balance_minor": state["balance_minor"], "cup_price_minor": state["cup_price_minor"], "coffee_count": count, "timestamp": _timestamp(), "actor": actor[:128], "note": note, **extra}
            if request_key:
                row.update(request_key=request_key, request_fingerprint=fingerprint)
            state["transactions"].append(row)
            try:
                await self._commit(state)
            finally:
                # Even a cancelled caller can have completed its durable commit.
                if request_key and self._state is state:
                    self._requests[request_key] = row
            return self._response(row)
