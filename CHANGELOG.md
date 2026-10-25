# Changelog

## 0.2.1 — 2026-10-25

- Adopt the shared Space Hub header, icon buttons and native dialog shell with safe-area geometry and focus restoration.
- Replace hand-drawn utility icons with Home Assistant MDI icons; use the family settings icon and retain the cup illustration.
- Add the consistent X to ledger reset, including uncertain outcomes; keep Cancel for an unsubmitted confirmation.
- Allow a pending reset to be dismissed without cancelling or repeating it. Pending feedback remains on the card, and uncertain retry reuses the original request ID.
- Keep integer-cent accounting, revision checks, cross-user history and backend persistence unchanged.
- Validate 42 frontend and 68 integration/ledger tests, plus narrow/short viewport and light-theme fixtures.
