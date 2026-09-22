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

## Run 003 — Evaluator preparation

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`
  and frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  both verified against committed provenance at
  `22715165436e71bf3e577ead25ffec7de7f6616a`.
- Result: succeeded; private evaluator revision `001`
  `sha256:d44a06c755bc57ec14b976c48f9bfbda2e04c7eb795c855666c2131e8f2aaceb`
  is frozen after passing implementation-independent integrity validation.
- Public outputs: `eval-requirements.md`
  `sha256:ccc99e8ea39dd9cfccbf6fa920c9bb7b152beb25e4091dff6c6bc80336baab65`
  and `coverage-map.json`
  `sha256:6cbf1fb3111750ed315e890015fef9db21c44f6fc8690a7b2a3894545ddab29c`.
- Checks: public coverage structural validation; complete criterion/procedure
  traceability and private inventory validation; controlled invalid-target
  negative control; and committed pre-implementation `npm test` baseline
  (109 passing, 0 failing). No candidate implementation was inspected or run.
- Restricted evaluator material inspected: current Spike 014a private evaluator
  workspace only.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Evaluator preparation correction

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`
  and frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`.
- Result: succeeded; evaluator revision `002`
  `sha256:33cc04f03c0b8fede97604a20be75fd97a3db103c15d18286b40cd1aef7811b4`
  preserves revision `001` and its acceptance semantics while correcting the
  public readiness binding for `eval-requirements.md`.
- Public outputs: unchanged `eval-requirements.md`
  `sha256:ccc99e8ea39dd9cfccbf6fa920c9bb7b152beb25e4091dff6c6bc80336baab65`
  and corrected `coverage-map.json`
  `sha256:6a2e044e461dcc86cbcdd54b7e88df7bbf3a7dbf93cfbdfa3d1dfa4730919a45`.
- Checks: deterministic pre-freeze integrity validation passed: 23 criteria,
  19 procedures, complete bidirectional traceability, and public/private
  readiness consistency. No candidate implementation was inspected or run.
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Implementation

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`.
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  prepared coverage `sha256:6a2e044e461dcc86cbcdd54b7e88df7bbf3a7dbf93cfbdfa3d1dfa4730919a45`,
  and public `eval-requirements.md`
  `sha256:ccc99e8ea39dd9cfccbf6fa920c9bb7b152beb25e4091dff6c6bc80336baab65`,
  verified against committed provenance. No retry feedback applies.
- Result: succeeded; implementation candidate adds generic result constraints,
  equivalent-grant-only deduplication, durable continuation-stop facts,
  grant-scoped automatic-work bounds, safe supersession, explicit inline
  adoption, executor requested/confirmed attestation, deterministic `after`
  semantics, and missing spawned-result failure handling.
- Output: candidate implementation diff
  `sha256:b56eeac19d25e564082276fb3c58d017ca4e9b5964886c374066f9e06faa9526`
  before this manifest update.
- Checks: `git diff --check`; `npm run typecheck`; `npm run lint`;
  `npm run format:check`; and `npm test` (113 passing, 0 failing).
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.
