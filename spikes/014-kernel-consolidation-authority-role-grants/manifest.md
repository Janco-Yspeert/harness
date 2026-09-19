# Spike 014 Manifest

## Run 001 — Design Map

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  with committed provenance `55dfa7d032af847871d8786512281a8a1a0588a5`.
- Result: ready to freeze.
- Output: `design-map.md`.
- Repository evidence inspected: frozen brief and readiness result; `GOALS.md`;
  public authority ledger/runner, host-run, backend, and visible-test surfaces;
  and public prior Design Maps.
- Restricted evaluator material inspected: none.
- Checks: Design Map contract SHA-256, frozen brief SHA-256 and Git provenance,
  Design Map boundary review, and `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Evaluator Preparation

- Skill: `evaluator` v11 (no bootstrap pin applies to this spike; executed
  directly under the plain working-tree `skills/evaluator/SKILL.md`,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`).
- Inputs: frozen `spike.md`
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  (canonical `brief-frozen` provenance `d69b1be4908e43ede4b4f5f1ce248411d063ca5b`)
  and frozen `design-map.md`
  `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`
  (canonical `design-map-frozen` provenance
  `1571bd108c8fa2c6a3a456c8a14aeb609e4ea9e3`).
- Result: prepared. 35 required criteria (AC01-AC35) each carry exactly one
  criterion evidence record across 15 evaluation procedures; pre-freeze
  structural integrity validation (`tools/evaluator-integrity.ts`) PASSED
  with 0 diagnostics; evaluator revision `001` frozen.
- Output: `eval-requirements.md`, `coverage-map.json` (public); private
  `eval-spec.md`, `case-manifest.json`, one evaluator-authored executable
  hidden regression test, and `.eval/freeze.json` under the Spike 014
  private evaluator workspace.
- Coverage summary: 1 mandatory executable hidden-test procedure (a
  pre-authored, implementation-independent Git-tree-identity regression
  control over prior, already-adjudicated spike directories); the remaining
  14 procedures rely on the implementation's own visible regression suite,
  manual source/data-model inspection, and 4 mandatory real-boundary proofs
  (attached execution, spawned execution, host-mediated publication,
  human-wait/resume), because the frozen Design Map's "Implementation
  freedom" section deliberately leaves nearly every underlying
  representation, storage, and API/transport as an implementation choice
  for this from-scratch kernel consolidation.
- Repository evidence inspected: frozen `spike.md` and `design-map.md`;
  `bootstrap/brief-readiness-replacement-001.md` and
  `bootstrap/evaluator-workspace-correction-001.md`; `AGENTS.md`; `GOALS.md`;
  the public authority ledger/runner (`tools/workflow.ts`), host-owned
  workflow-run surface (`src/workflow-run.ts`, `src/workflow-backend.ts`,
  `src/index.ts`), evaluator-integrity helper (`tools/evaluator-integrity.ts`),
  and visible test suite; prior spikes 010-013a's promoted evaluation
  artifacts and public authority ledgers, used both as structural precedent
  for this preparation's own artifacts and as the pinned fixture for the
  frozen `E1` hidden regression test.
- Restricted evaluator material inspected: none beyond this spike's own
  private evaluator preparation workspace under
  `harness-hidden/spikes/014-kernel-consolidation-authority-role-grants`
  (this spike's own `eval-spec.md`, `case-manifest.json`,
  `.hidden-test/**`, and `.eval/**`, all authored during this run). Before
  use, the effective protected workspace was confirmed limited to the
  public Harness repository plus that one private path;
  `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` was unset and no other spike's
  private material was reachable, per
  `bootstrap/evaluator-workspace-correction-001.md`.
- Checks: evaluator skill contract SHA-256 (v11); frozen brief and Design
  Map SHA-256 and Git provenance; `tools/evaluator-integrity.ts` structural
  validation (PASS, 0 diagnostics, 35 criteria / 15 procedures); the sole
  executable hidden test run via `node --test` against the
  pre-implementation baseline with a positive result and a discarded
  negative control confirming the correct failure mode; `tsc --noEmit`,
  `eslint`, and `prettier --check` on that hidden test; full `npm test`
  (86/86), `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check` at the preparation commit; committed public content
  identity of `eval-requirements.md` and `coverage-map.json` confirmed to
  match `.eval/freeze.json`; canonical `evaluation-prepared` recorded
  through the existing supported `workflow authority record` path.
- Measurement cutoff: immediately before this manifest update.
