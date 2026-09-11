# Spike 013a Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Input: working-tree `spike.md`
- Result: `Not ready to freeze`
- Output: `feedback.md`; immutable reviewed snapshot under `preliminary/001/`
- Operational outcome: the allocated `brief-readiness` attempt is recorded as
  `blocked` in `.workflow/state.json`; no canonical freeze authority was
  recorded.
- Repository evidence inspected: public workflow authority/runner and
  host-owned execution surfaces, evaluator invocation contract, visible
  workflow tests, and relevant public Spike 011–013 history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; relevant public-source and test inspection.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Brief Readiness (pre-freeze retry bootstrap)

- Skill: `brief-readiness` v3
- Input: revised working-tree `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
- Prior execution: host-owned `brief-readiness` attempt 1,
  run `d5f53a95-873b-4c13-b882-0f415839bc9f`, durably recorded as `blocked` in
  `.workflow/state.json`.
- Authority path: frozen pre-freeze retry bootstrap; this review retains the
  same pending methodology attempt and does not fabricate, delete, or rewrite
  operational runner history.
- Result: `Ready to freeze`
- Output: `feedback.md`
- Repository evidence inspected: revised brief and prior readiness evidence;
  public workflow authority, runner and host-run surfaces; evaluator invocation
  contract; visible workflow tests; and public Spike 011–013 history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; revision-to-prior-findings comparison;
  relevant public-source and visible-test inspection; `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Design Map (Spike 013a bootstrap exception)

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  with committed provenance `c543cae`.
- Authority path: direct host-owned allocation under the Spike 013a bootstrap
  exception. Canonical `brief-frozen` authority is the upstream source; no
  historical runner dispatch or completion was fabricated.
- Result: `READY`
- Output: `design-map.md`
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
- Repository evidence inspected: frozen brief and readiness result; public
  canonical and operational workflow state; public workflow authority, runner,
  host-run, backend and visible-test surfaces; prior public Design Maps; and
  `GOALS.md`.
- Restricted evaluator material inspected: none.
- Checks: frozen brief SHA-256 and Git provenance; Design Map boundary review;
  `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Evaluator Preparation

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  working-tree `skills/evaluator/SKILL.md` confirmed byte-identical)
- Input: frozen `spike.md`
  (`sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`)
  and frozen `design-map.md`
  (`sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`)
- Result: `Frozen` (evaluator revision `001`)
- Output: public `eval-requirements.md` and `coverage-map.json` (35 criterion
  records, all required, readiness attestation `integrityValidation: PASS`)
- Mandatory executable hidden coverage: 5 cases, each reusing the existing
  public `tools/workflow.ts` CLI seam; each exercised against the
  pre-implementation baseline before freeze (4 fail for their documented
  defect reason, 1 passes and is frozen as a non-regression control)
- Mandatory non-executable coverage: 12 procedures, spanning
  implementation-owned visible regression obligations, two reserved bounded
  live-provider fixtures (Claude, Codex), one host-boundary crossing
  requirement, and one composite readiness/provenance check, per the frozen
  brief's evidence requirements
- Pre-freeze structural integrity validation: `PASS`, 0 diagnostics; the
  final public `coverage-map.json` was additionally confirmed to validate
  against the repository's own `evaluation-prepared` authority-transition
  check via a disposable fixture
- Repository evidence inspected: public workflow-run/host/backend surfaces,
  the canonical `workflow.jsonl` authority engine and its CLI, the shared
  evaluator-integrity structural validator, existing public regression tests,
  and prior evaluator-preparation precedent (Spike 012)
- Restricted evaluator material inspected: none beyond this spike's own
  private evaluator workspace, which this run authored
- Checks: pinned-authority byte-identity confirmation; `npm test`,
  `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `git diff --check` all green at the preparation commit; five hidden tests
  individually exercised against the baseline; structural integrity
  validation; real-authority-validator acceptance of the public artifact
- Measurement cutoff: immediately before this manifest update.
