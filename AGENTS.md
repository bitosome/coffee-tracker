# Coffee Tracker

This repository owns the Home Assistant integration and bundled Lovelace card.

- Store money as integer cents, validate decimal input, serialize mutations, and save before publishing success. Never use browser storage for the authoritative balance/history.
- All pool users share the same persisted ledger. Preserve Home Assistant context and entity permissions for service calls. Public examples/tests must use synthetic data.
- Never test against a real pool or deploy to a live Home Assistant without authorization.
- Frontend must follow Space Hub Card tokens/typography/isolated under-tile glows. Preserve vendored provenance and license. Support light/dark, narrow mobile, accessible labels, and reduced motion.
- Integration category in HACS: ship the built card inside custom_components/coffee_tracker/www. Do not require a second Dashboard installation.
- Keep Python integration, pure ledger, frontend presentation, and tests separate. Build and test before committing/releasing; keep package/manifest/bundle versions aligned.
