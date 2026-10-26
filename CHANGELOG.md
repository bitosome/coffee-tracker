# Changelog

## 0.3.1 — 2026-10-26

- Identify Settings, contribution, balance, price and Undo controls as modal launchers rather than inline expanded sections.
- Keep Activity as a true collapsed disclosure and retain the shared settings cog, guarded form drafts and serialized ledger writes.

## 0.3.0 — 2026-10-25

- Bundle `@bitosome/ha-card-ui` for canonical Space Hub design, glows and reusable modal/action/feedback components.
- Move contributions, balance and price editing, Settings, ledger reset and Undo into one shared modal flow. Back returns to the parent; X closes the whole flow.
- Guard changed form values on Back, X, Escape and backdrop with Keep editing / Discard changes, preserving focus and drafts during telemetry updates.
- Keep pending ledger writes and idempotent retries independent of modal dismissal. Late acknowledgements cannot close a newer flow or alter another pool configuration.
- Keep Activity collapsed on the dashboard and retain shared persisted integer-cent accounting and revision validation.

## 0.2.1 — 2026-10-25

- Adopt the shared Space Hub header, icon buttons and native dialog shell with safe-area geometry and focus restoration.
- Replace hand-drawn utility icons with Home Assistant MDI icons; use the family settings icon and retain the cup illustration.
- Add the consistent X to ledger reset, including uncertain outcomes; keep Cancel for an unsubmitted confirmation.
- Allow a pending reset to be dismissed without cancelling or repeating it. Pending feedback remains on the card, and uncertain retry reuses the original request ID.
- Keep integer-cent accounting, revision checks, cross-user history and backend persistence unchanged.
- Validate 42 frontend and 68 integration/ledger tests, plus narrow/short viewport and light-theme fixtures.
