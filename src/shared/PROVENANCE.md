# Shared design provenance

Inspected 2026-10-09. These files are vendored source, not runtime dependencies. Synchronize them from the recorded upstream source rather than editing them by hand.

| File | Source | Source revision | SHA-256 |
| --- | --- | --- | --- |
| `design-tokens.ts` | [Space Hub Card](https://github.com/bitosome/space-hub-card), `src/shared/design-tokens.ts` | `06ac33e6713482bbb1ad2f43c1ed67945f832e18` | `6e7ec06ca5fc8a96f0442593d32133fb5fcc1c35befcf74dcf0d83b149d332c8` |
| `glow.ts` | [NIBE Dashboard](https://github.com/bitosome/nibe-dashboard), `src/shared/glow.ts` | `2af7eda2b02fe01813172629342d887c1964acbc` | `d4220bff90c1af772cd4829422580eab9dd9347f93c92c427c243e7811d041bd` |

`glow.ts` is the scoped Space Hub `buildGlow` extraction also shared by Robot Vacuum Cleaner Card. Its canonical implementation is Space Hub Card `src/glow.ts`; the NIBE extraction omits unrelated entity-availability and appliance helpers. Both vendored files match the recorded hashes exactly. Static glows are isolated beneath tile surfaces, following Space Hub Card stacking.

Space Hub Card declares the MIT license. NIBE Dashboard's MIT attribution and the bundled Lit dependency license are retained in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md), also shipped alongside the bundled card.
