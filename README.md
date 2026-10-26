# Coffee Tracker

A shared coffee pool for Home Assistant. Add a contribution, set your cup price, and tap **Coffee purchased** to record a cup. The integration saves the balance and action history; the included dashboard card gives it a calm, theme-aware home with a little celebration for each coffee.

- One balance shared across devices and Home Assistant users, with support for separate named pools.
- Add money, correct the balance, change the price per cup, and undo the latest financial action.
- Timestamped history of contributions, coffees, corrections, price changes, and reversals, including the actor when Home Assistant provides their identity.
- Native balance/count sensors, price number, and **Buy coffee** button for automations and an Apple Watch script.
- Persistent local storage; no cloud account, credentials, or browser-only balance.
- Exact cents, serialized writes, and retry protection for card requests.
- Space Hub family styling, light/dark themes, mobile layouts, and reduced-motion support.

## Install with HACS

Requires Home Assistant 2026.3 or later.

1. In HACS, open **Custom repositories**, add `https://github.com/bitosome/coffee-tracker`, and select **Integration** as the type.
2. Download **Coffee Tracker** and restart Home Assistant.
3. Open **Settings → Devices & services → Add integration → Coffee Tracker**.
4. Enter a pool name, currency, price per cup, and opening balance. Each additional integration entry creates a separate pool.
5. Reload your browser/dashboard, then add **Coffee Tracker** using the card picker. Select the pool's balance sensor.

**Installing in HACS only downloads the files. Configure the first pool in Devices & services before looking for the card.**

The card ships inside the integration. It does not need a separate HACS Dashboard repository. Storage-mode dashboard resources are registered automatically. If you manage resources in YAML, add the JavaScript module described below.

```yaml
type: custom:coffee-tracker-card
entity: sensor.coffee_pool_balance
title: Coffee pool
```

Use your actual balance entity ID from **Settings → Devices & services → Coffee Tracker**; Home Assistant may assign a suffix if the name already exists.

For YAML-managed Lovelace resources:

```yaml
lovelace:
  resources:
    - url: /coffee_tracker/coffee-tracker-card.js?v=0.3.3
      type: module
```

If the card is missing after an update, reload the dashboard. Check the resource URL against the version installed and avoid adding the same module twice.

## Daily use

Tap **Add money** to record a contribution. Set the price per cup in the card settings or through the integration's number entity. **Coffee purchased** subtracts the current price and records one coffee. Changing the price never rewrites old purchases.

**Activity** starts collapsed. Tap its heading to expand the history, load older entries, or undo the latest eligible action.

**Adjust balance** sets an absolute balance and records the difference, which is useful for correcting a mistake or reconciling the pool. Add a note to explain a correction. **Undo** creates a reversal of the latest eligible financial action; it never erases history.

Open the cog **Settings → Reset ledger** to start over. The confirmation dialog explains that reset deletes **all activity entries**, sets the balance and coffee count to **zero**, and affects everyone using this pool. The currency and cup price stay unchanged. Cancel or Escape leaves the ledger untouched. Reset cannot be undone in the card; restoring a Home Assistant backup is the recovery option. If another user changes the pool while the dialog is open, review the latest balance in the dialog before confirming again.

A balance may go below zero. This is a record of coffee consumption, so a coffee can still be logged when the pool needs a top-up. The card shows the shortfall. No payment is collected or transferred by this integration.

All users of the same pool share its balance, price, and history. Actions use Home Assistant's entity permissions. A card edit based on an older revision is rejected instead of overwriting another user's newer change. Refresh and review the current values before applying it again.

## Apple Watch: one tap, one coffee

The integration exposes a **Buy coffee** button. Home Assistant Companion's Watch home screen supports scripts, scenes, and iOS Actions, so add this small script and select it in the iPhone app under **Settings → Companion app → Apple Watch → Configuration**. Save, then reload the Watch app. See the [official Companion Watch guide](https://companion.home-assistant.io/docs/apple-watch/).

```yaml
# scripts.yaml — replace this with your actual Buy coffee button entity ID.
coffee_purchased:
  alias: Coffee purchased
  icon: mdi:coffee
  mode: queued
  max: 20
  sequence:
    - action: button.press
      target:
        entity_id: button.coffee_pool_buy_coffee
```

One completed script run records one cup at the current price. Separate presses count as separate coffees. The card's retry protection cannot deduplicate two independently executed Watch scripts. If you tap twice by mistake, use **Undo** in the card. The Watch must be able to reach Home Assistant; this does not provide an offline purchase queue.

The balance sensor can also be used in a Watch complication. Attribution is the Home Assistant user when the action carries a user context, otherwise **Automation**.

## Updating

After updating in HACS, restart Home Assistant to load the backend, then reload your dashboard. Version 0.2.0 adds the reset action; until the backend has restarted, the card keeps Reset unavailable and explains why.

## Data and maintenance

The ledger lives in Home Assistant's `.storage` directory and survives normal restarts and integration reloads. Include Home Assistant configuration storage in backups. The browser only displays the server's state. History is retained without an automatic age limit unless you explicitly confirm Reset ledger. Reset clears Coffee Tracker's journal; it does not purge existing Home Assistant backups or Recorder sensor history. The integration retains only non-reversible request hashes from erased actions to prevent an old network retry from recreating them. Removing an integration entry leaves its ledger file available for recovery, but adding a new pool creates a new identity and does not automatically reconnect that old file. Back up the pool before removing the entry.

Currency is fixed when a pool is created, preventing old transactions from silently changing units. Supported currencies use two decimal places. Prices and amounts accept up to two decimal places. History is retrieved in pages rather than copied into every sensor state. It is kept independently from Home Assistant Recorder retention.

The integration remains usable through native entities when no dashboard is open. The card only reports a purchase animation after a successful service response. Storage or connection errors remain visible, and a failed save does not publish a new balance.

See [architecture and service API](docs/architecture.md) for details and [development](docs/development.md) for local checks.

## License and design

MIT. Shared design components derive from [Space Hub Card](https://github.com/bitosome/space-hub-card) through `@bitosome/ha-card-ui`; see `src/shared/PROVENANCE.md`.

## Shared design

The build bundles [`@bitosome/ha-card-ui`](https://github.com/bitosome/ha-card-ui), the versioned Space Hub design and behavior library. Its tokens, under-tile activation glows, MDI controls and shared native dialog controller are included in this card's JavaScript. Home Assistant does not need a separate library resource or another card installed. The release URL and integrity are pinned by `package-lock.json`; see [provenance](src/shared/PROVENANCE.md).

Settings, Add money, Adjust balance, Price per cup, Reset ledger and Undo use one modal flow. Back returns to a parent screen; X closes the whole flow. Changed amount/reason drafts require explicit discard. Activity stays collapsed on the main card. A dispatched ledger write keeps its duplicate guard and idempotent retry identity after dismissal; completion cannot close a newer flow. Errors and pending state remain available while that request finishes.
