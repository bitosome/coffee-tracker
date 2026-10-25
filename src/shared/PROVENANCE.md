# Shared design provenance

Original extraction inspected 2026-10-09; shared presentation refreshed 2026-10-25. These files are vendored source, not runtime dependencies. Synchronize them from the recorded upstream source rather than editing them by hand.

| File | Source | Source revision | SHA-256 |
| --- | --- | --- | --- |
| `glow.ts` | [NIBE Dashboard](https://github.com/bitosome/nibe-dashboard), `src/shared/glow.ts` | `2af7eda2b02fe01813172629342d887c1964acbc` | `d4220bff90c1af772cd4829422580eab9dd9347f93c92c427c243e7811d041bd` |

`glow.ts` is the scoped Space Hub `buildGlow` extraction also shared by Robot Vacuum Cleaner Card. Its canonical implementation is Space Hub Card `src/glow.ts`; the NIBE extraction omits unrelated entity-availability and appliance helpers. `glow.ts` retains the recorded hash. The current `design-tokens.ts` and `card-primitives.ts` source revision, design version and hashes are in [DESIGN_PROVENANCE.json](DESIGN_PROVENANCE.json); synchronize them using Space Hub `scripts/sync-card-design.mjs`. Static glows are isolated beneath tile surfaces, following Space Hub Card stacking.

Space Hub Card declares the MIT license. NIBE Dashboard's MIT attribution and the bundled Lit dependency license are retained in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md), also shipped alongside the bundled card.
