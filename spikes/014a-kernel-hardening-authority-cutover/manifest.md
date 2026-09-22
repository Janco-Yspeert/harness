# Spike 014a Manifest

## Run 001 — Design Map

- Skill: `design-map` v2,
  `sha256:6332887fcecad5efb39ea649a24d3cc710bfcc4a41ec5f4fed14c17aa9f0f6c1`.
- Input: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  clean against the working tree and committed at
  `42a0f7207f8d8736154a369ab80ab96887470c92`.
- Result: succeeded; Design Map ready for the separately authorized bootstrap
  publication/checkpoint path.
- Output: `design-map.md`
  `sha256:d89e9fabda38f96f43440f6846eb4feb50739fa8854724991d317b784e5fa076`.
- Repository evidence inspected: frozen brief; public Design Map and methodology
  contracts; public workflow evidence; relevant public authority/kernel,
  policy, and test surfaces; and the public predecessor Design Map.
- Restricted evaluator material inspected: none.
- Checks: frozen brief SHA-256 and committed-provenance verification; Design Map
  scope/boundary review; output SHA-256; and `git diff --check` for the Design
  Map before this manifest update.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Design Map

- Skill: `design-map` v3,
  `sha256:c4f645a2d383ad15173131c72768eca723d7d6a8528b49cd273981d234d559ea`.
- Input: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  verified against committed provenance
  `42a0f7207f8d8736154a369ab80ab96887470c92`.
- Result: succeeded; the map resolves the shared cutover authority seam without
  extending the frozen product contract.
- Output: `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`.
- Repository evidence inspected: frozen brief and readiness review; active
  design-map contract and orchestrator contract; public execution, workflow
  backend, and workflow-test surfaces; existing public Design Map and manifest.
- Restricted evaluator material inspected: none.
- Checks: frozen brief SHA-256 and committed-provenance verification; Design Map
  boundary review against the frozen brief; output SHA-256; and `git diff --check`
  for the Design Map before this manifest update.
- Measurement cutoff: immediately before this manifest update.
