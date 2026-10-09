# Development

Use Node.js 22+ and Python 3.14 for the Home Assistant test environment. Backend runtime dependencies come from Home Assistant itself; there are no external coffee services.

```sh
npm ci
npm run check
python3.14 -m venv .venv
.venv/bin/pip install -r requirements-test.txt
.venv/bin/pytest -q
python3 scripts/check_package.py
npm run preview
```

The preview uses invented people and transactions. It has no connection to Home Assistant and must not be used as evidence of production installation.

The integration lives under `custom_components/coffee_tracker`. The TypeScript frontend builds into that directory's `www/coffee-tracker-card.js`; this generated artifact is committed and included in HACS downloads. Update the version in `package.json`, `package-lock.json`, and `manifest.json` together. Rebuild, run tests, and inspect both themes at mobile widths before release.

Shared design files retain provenance. Synchronize from the canonical Space Hub source instead of changing the vendored tokens for this card.

CI checks the frontend, backend, package, and HACS/HA metadata. Release tags must match the package and manifest version. A release includes the integration zip and the card module; the supported HACS installation is Integration, using the complete repository layout.
