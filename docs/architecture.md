# Architecture and service API

## Ownership

Each Home Assistant config entry owns a named pool. The integration is the sole authority for the balance, cup price, coffee count, and journal. The dashboard and native button/number entities use the same mutation path. There is no dependency on a cloud coffee service, payment provider, or running browser.

Money is stored as integer minor units (cents). Decimal input is validated rather than silently rounded. Currency is fixed for the pool's lifetime. Price changes are recorded and only affect later purchases. Negative balances are allowed, because recording a consumed coffee should not be prevented by an empty pool.

An asynchronous lock serializes mutations within a pool. A proposed ledger is written atomically before becoming the visible snapshot. A failed write leaves the previous state intact. Loaded data is validated; invalid storage must cause a clear setup failure rather than silently resetting the balance. Include `.storage` in backups. Version 0.1.0 cannot read a ledger after its first reset; downgrade only by restoring a matching pre-reset backup, not by replacing just the code.

During normal use, the journal is append-only. An explicitly confirmed reset clears it and starts a new empty ledger at the next revision, keeping the currency and cup price. Undo adds a compensating entry and can target only the latest eligible financial action. Changing the price does not make the preceding purchase ineligible. Once an action is reversed, the reversal cannot itself be reversed using Undo.

## Entities

| Entity | Purpose |
| --- | --- |
| `sensor.<pool>_balance` | Balance in the selected currency; card's configured entity |
| `sensor.<pool>_coffees` | Coffee count since the last reset, reduced when the latest coffee is undone |
| `number.<pool>_cup_price` | Current price, in increments of 0.01 |
| `button.<pool>_buy_coffee` | Record one cup at the current price |

Actual entity IDs are assigned by Home Assistant and can be renamed. Consumers must use registered IDs rather than constructing them from the pool title.

The balance sensor advertises an integration marker, pool ID, currency, integer balance/price, revision, count, last action timestamp, reset capability, and registered sibling entity IDs. History is not stored in state attributes; this avoids duplicating the full journal into Recorder on every update.

## Domain actions

All actions below are in the `coffee_tracker` domain and take the pool's balance sensor as `entity_id`. Home Assistant checks that the entity belongs to this integration and that the caller has the required entity permissions. History requires read access; mutations require control access. Native entity services also use Home Assistant's normal permissions.

| Action | Additional fields | Result |
| --- | --- | --- |
| `buy_coffee` | Optional `expected_revision`, `request_id` | Debit current price and increment count |
| `add_funds` | Positive decimal `amount`; optional `note`, `request_id` | Add a contribution |
| `set_balance` | Signed decimal absolute `amount`, `expected_revision`; optional `note`, `request_id` | Record a balance correction |
| `set_price` | Positive decimal `amount`, `expected_revision`; optional `request_id` | Set price for future cups |
| `undo` | `transaction_id`, `expected_revision`; optional `request_id` | Reverse latest eligible financial action |
| `reset_ledger` | `confirmed: true`, `expected_revision`, `request_id` | Delete all journal entries, zero the balance/count, preserve currency/price |
| `get_history` | Optional `limit` (1–100, default 20), `before` sequence | Return a page of entries, newest first |

Mutations accept an optional service response. Responses contain `balance_minor`, `cup_price_minor`, `coffee_count`, `currency`, `revision`, and `transaction_id`. History requires a response and returns `items`, `has_more`, `next_before`, and `revision`.

Each history item has an ID, sequence, action kind, amount delta, resulting balance, price, count, UTC timestamp, actor, note, and computed undo eligibility. A reversal identifies its original transaction. The browser formats times and currency for the user's locale.

Example contribution:

```yaml
action: coffee_tracker.add_funds
data:
  entity_id: sensor.coffee_pool_balance
  amount: '20.00'
  note: Weekly contribution
```

Example history response in a script:

```yaml
- action: coffee_tracker.get_history
  data:
    entity_id: sensor.coffee_pool_balance
    limit: 20
  response_variable: coffee_history
```

Use the sensor's current `revision` when editing the price/balance, undoing a transaction, or resetting the ledger. A stale revision is an explicit rejection; callers must refresh rather than retrying the edit with a fabricated newer revision. The native price number obtains its current revision on the server.

## Retry and attribution semantics

The card assigns a unique request ID to each mutation. If a response is lost, retrying the same request ID with the same payload and actor returns the original result without recording another cup. Reusing that ID with a different payload is rejected. The journal retains idempotency information across restarts. Reset retires prior request identifiers as hashes, without retaining erased amounts, actors, notes, or transaction receipts. Those old requests are rejected if they arrive again. The current reset receipt is persisted separately so an uncertain reset can be retried safely even after a later coffee has been recorded. Revisions continue increasing across resets; they do not return to one. Domain service callers can opt into this protection with their own 8–128 character IDs.

Two independent button presses are two coffees. The integration cannot infer that two separately executed Watch scripts were a user's accidental double tap. Undo provides an explicit correction.

User attribution is derived on the server from Home Assistant context, never accepted as a caller-supplied display name. Actions without a user context are attributed to Automation. This is a shared household activity history, not a separate accounting balance per user.

## Frontend boundaries

The card calls integration actions only after user interaction and animates a purchase only after successful acknowledgement. Pending actions disable competing controls. State revision changes from other sessions trigger history refresh. Edits and the reset confirmation retain the revision at which they started, making shared-user conflicts visible. Reset requires a dedicated modal confirmation. Activity is collapsed on first load, and hidden history actions cannot receive keyboard focus.

The bundled module is served locally. Storage-mode Lovelace resources are registered with a versioned URL; YAML resources are managed by the user. This distinction keeps the integration usable for both dashboard configurations.
