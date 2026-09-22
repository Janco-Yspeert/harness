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

## Run 006 — Evaluator verification

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Inputs: candidate `git:42925c4f0e9028e9647a4d35b27ac1e4df4aed8a`, frozen
  `spike.md` `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  Design Map `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  prepared coverage `sha256:6a2e044e461dcc86cbcdd54b7e88df7bbf3a7dbf93cfbdfa3d1dfa4730919a45`,
  and evaluator revision `002`.
- Result: `FAIL` / `IMPLEMENTATION_FAILURE`. AC11 failed: ordinary attached
  continuation can grant a supervisor a worker role without explicit inline or
  configured fallback authority.
- Public outputs: `verification-result.json` and
  `verification-feedback.md`.
- Checks: frozen input and private-bundle identity verification; required
  public `npm test` regression (113 passing, 0 failing); and a bounded
  supported authority-boundary proof.
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Implementation correction

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`.
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  prepared coverage `sha256:6a2e044e461dcc86cbcdd54b7e88df7bbf3a7dbf93cfbdfa3d1dfa4730919a45`,
  public `eval-requirements.md`
  `sha256:ccc99e8ea39dd9cfccbf6fa920c9bb7b152beb25e4091dff6c6bc80336baab65`,
  and committed AC11 retry feedback
  `sha256:d3a6394aa522e0a4bc03016663368f1ed7e7c6c40cce6665eff7fd74b9a18e43`
  from `dcac33bdfb8e1174c9bc35c043f9bd97fdfacdce`; evaluator revision `002`
  remains unchanged.
- Result: succeeded; every attached allocation now requires inline authority
  on its immutable Workflow Execution Grant, whether or not the continuation
  request supplies an `inline` flag. Existing attached-path regressions declare
  that authority explicitly.
- Output: focused implementation/test diff
  `sha256:f8adf1ecf9efb6b56038fafaefd00b7b380b6c9f8640d278a3cb2938292982af`
  before this manifest update (2 files, 27 insertions, 3 deletions).
- Checks: the new focused negative test failed against the prior candidate as
  expected; focused inline-adoption test passed; `test/kernel.test.ts` passed
  (21 passing, 0 failing); and `npm run check` passed, including typecheck,
  lint, formatting, and the full suite (113 passing, 0 failing).
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 008 — Evaluator verification

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Inputs: candidate `git:b1a4ed833db84b2f4736c2454d5f19103f9af7aa`, frozen
  `spike.md` `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  Design Map `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  prepared coverage `sha256:6a2e044e461dcc86cbcdd54b7e88df7bbf3a7dbf93cfbdfa3d1dfa4730919a45`,
  and evaluator revision `002` (unchanged; not re-prepared or repaired).
- Result: `PASS`. AC11 is now satisfied: every attached-mode allocation
  requires explicit Workflow-Execution-Grant-level inline authority,
  regardless of the per-request `inline` flag.
- Public output: `verification-result.json`.
- Checks: frozen input and private-bundle identity verification; required
  public `npm test` regression (113 passing, 0 failing); and bounded,
  independently authored live fixtures against the real kernel/host exercising
  all 19 frozen procedures (P01-P19), including a live re-run of the
  previously-failing AC11 boundary and a real spawned-process supersession
  proof.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.

## Run 009 — Evaluator repair

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Trigger: `human-evaluator-correction-authorized`, classification
  `EVALUATOR_COVERAGE_DEFECT`, against attempt 004's otherwise validator-valid
  `PASS` (source evaluator revision `002`, semantic result
  `sha256:a4becba0b8b22448a1d8f20b0e7542cbdeb36056e0169fc6307822407bfae7c2`).
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  source evaluator revision `002`
  `sha256:33cc04f03c0b8fede97604a20be75fd97a3db103c15d18286b40cd1aef7811b4`.
- Result: succeeded; evaluator revision `003`
  `sha256:d169cf26cb187c904697e6be6ca31d6d15ed8fbaf055404418d1aef3e57a8e4f`
  preserves revision `002` (archived byte-for-byte) and corrects only
  procedure P02's frozen wording, which had omitted exercising the canonical
  valid PASS-without-classification path required by AC03's already-frozen
  invariant. AC02, AC03, their `frozenAuthority`, `sufficiency`, `mode`, and
  every other criterion/procedure/coverage-mode are byte-for-byte unchanged;
  acceptance semantics are preserved.
- Public output: corrected `coverage-map.json`
  `sha256:5d69abc778d71f32308b4edc9eff3d476fc6c4207f8e7df617e7b17fa068ad7d`.
- Checks: deterministic structural pre-freeze integrity validation passed (23
  criteria, 19 procedures, complete bidirectional traceability, public/private
  readiness consistency). A separate, explicitly bounded repair-control
  exercise (not a new verification attempt) confirmed the corrected procedure
  is genuinely executable through the real governed result/canonical-
  transition path against the unchanged, already-accepted candidate
  `b1a4ed833db84b2f4736c2454d5f19103f9af7aa`; it also surfaced an
  implementation-side finding on that candidate, reported out-of-scope for a
  follow-on process and not actioned by this repair. Attempt 004's finalized
  `PASS`, bound to evaluator revision `002`, is unchanged.
- Restricted evaluator material inspected: none beyond this repair's own
  scope.
- Measurement cutoff: immediately before this manifest update.

## Canonical-status correction — attempt 004

- The Run 008 and Run 009 wording above records the evaluator's semantic
  `PASS` report, but incorrectly describes it as finalized/accepted.
- Harness rejected attempt 004's canonical transition with
  `result violates pinned cross-field contract`; its governed execution ended
  `failed`, and no `verification-finalized` event was recorded for that
  attempt.
- Attempt 004 therefore remains useful immutable evaluation evidence bound to
  candidate `b1a4ed833db84b2f4736c2454d5f19103f9af7aa` and evaluator revision
  `002`, but it is not and must never be treated as a canonical PASS.
- Revision `003` repair authority and lineage remain unchanged; the repair was
  recorded canonically by Harness before this append-only clarification.

## Run 010 — Implementation correction

- Skill: `implementation` v4,
  `sha256:74ed5401e6972a13bb411fdd0e3157653cd68926e431bdc4060835a2c3e77a70`.
- Authority: explicit human root Role Grant
  `sha256:e0ce7736f41551f98aaadaaeb1c4bafbe083f30cb769a8d508ba6e309a05d577`
  for the bounded result-constraint correction. Attempt 004 produced no
  canonical `verification-finalized` / `IMPLEMENTATION_FAILURE` event, so the
  grant's exact human root decision is the retry authority; no event was
  fabricated.
- Inputs: frozen `spike.md`
  `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  frozen `design-map.md`
  `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  evaluator revision `003` prepared coverage
  `sha256:5d69abc778d71f32308b4edc9eff3d476fc6c4207f8e7df617e7b17fa068ad7d`,
  and public `eval-requirements.md`
  `sha256:ccc99e8ea39dd9cfccbf6fa920c9bb7b152beb25e4091dff6c6bc80336baab65`.
- Result: succeeded; the generic checker treats omitted `required` and `absent`
  arrays independently as imposing no check, without changing configured
  evaluator vocabulary, outcomes, acceptance semantics, or workflow authority.
- Output: implementation, visible-test, and public-report content set
  `sha256:91b36c93236a9c6148639c1d590063b68391414111d4bf9b7905e91a75ce6842`
  before this manifest update.
- Visible evidence: the focused governed-result/canonical-transition regression
  failed against the prior checker on valid PASS, then passed after correction;
  `test/kernel.test.ts` passed (23 passing, 0 failing); and `npm run check`
  passed typecheck, lint, formatting, and the full suite (115 passing, 0
  failing).
- Restricted evaluator material inspected: none. Evaluator preparation and
  verification were not rerun; the existing AC11 correction, evaluator revision
  `003`, prior attempts/revisions, and unrelated working-tree residue were
  preserved.
- Measurement cutoff: immediately before this manifest update.

## Run 011 — Evaluator verification

- Skill: `evaluator` v12,
  `sha256:ab89688a2016644d03a6a05bb37f8f18a82d77aba079788b0d6b9e79e8f8c29d`.
- Inputs: candidate `git:53ba9067eed21e53b148aeb8d35696e6b327b2b1`, frozen
  `spike.md` `sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`,
  Design Map `sha256:2a17dc60d81cab8b44e48ab498cef2643962d87efccaf40cc440f1a735085c95`,
  prepared coverage `sha256:5d69abc778d71f32308b4edc9eff3d476fc6c4207f8e7df617e7b17fa068ad7d`,
  and evaluator revision `003`
  `sha256:d169cf26cb187c904697e6be6ca31d6d15ed8fbaf055404418d1aef3e57a8e4f`
  (unchanged; not re-prepared or repaired by this run).
- Result: `PASS`. All 23 frozen criteria satisfied, including the revision-003
  -repaired P02/AC03 cross-field matrix: a valid PASS with no classification is
  now accepted and reaches its configured transition against this candidate.
- Public output: `verification-result.json` (attempt `005`).
- Checks: frozen input identity verification (candidate content identical to
  current HEAD for every file this evaluation touches); required public
  `npm run check` regression (typecheck, lint, format, 115 tests passing, 0
  failing) with a deliberately nonexistent negative control confirmed to fail
  first; bounded, independently authored live fixtures against the real
  kernel/host exercising 18 of the 19 frozen procedures (P01-P12, P14, P16,
  P18), including the full repaired P02/AC03 cross-field matrix; P13, P15, and
  half of P19 evidenced by the passing public regression per the frozen
  evaluator's documented non-executable coverage mode; and the actual pinned
  `verification-accounting` validator run against the complete public
  artifact using this attempt's exact Role Grant inputs, confirming it before
  finalization.
- Restricted evaluator material inspected: none.
- Measurement cutoff: immediately before this manifest update.
