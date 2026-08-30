# Spike 008 — Workflow Manifest

This append-only record preserves material workflow runs for Spike 008.

## Run 001 — Brief Readiness

- Recorded: retrospectively from the immutable preliminary snapshot
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `spike.md`
- Output: `feedback.md`, `preliminary/001/spike.md`, and
  `preliminary/001/feedback.md`
- Findings: 1 blocker — the original state machine forbade the canonical
  implementation/evaluator retry loop
- Restricted evaluator material inspected: none
- Git checkpoint: `7892c55`

## Run 002 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: revised `spike.md`
- Input content identity:
  `sha256:9fb8edd3dd7da1e8f640dc5b93f23e6e99131371f69af5ace054f4cd5b02da7a`
- Output: `feedback.md`
- Output content identity:
  `sha256:bac2ae256bebfd89ebdff6083fcde5155e1d3bef483ae647926edf30917fdf2d`
- Findings: none; the permitted retry transition is explicit
- Repository evidence inspected: `AGENTS.md`, active implementation and
  evaluator skill contracts, package tooling, and public Spike 007 workflow
  evidence
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because this review made no implementation change
- Measurement cutoff: immediately before this manifest update

## Run 003 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief: `spike.md`
- Frozen brief content identity:
  `sha256:9fb8edd3dd7da1e8f640dc5b93f23e6e99131371f69af5ace054f4cd5b02da7a`
- Frozen brief Git provenance: `f9fad71`
- Output: `design-map.md`
- Output content identity:
  `sha256:c159f5b62f070caf8428594939d43f58318cb4725ed7b9673ed766aab9e4ded8`
- Shared contracts established: normalized spike-path boundary, public state
  document, phase ownership/order/retry semantics, explicit completion, and
  argument-vector subprocess boundary
- Repository evidence inspected: frozen brief, `AGENTS.md`, active skill
  contracts, package tooling, TypeScript configuration, and existing Node entry
  point conventions
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because no implementation changed
- Measurement cutoff: immediately before this manifest update

## Run 004 — Brief Readiness correction

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: unchanged frozen `spike.md`
- Input content identity:
  `sha256:9fb8edd3dd7da1e8f640dc5b93f23e6e99131371f69af5ace054f4cd5b02da7a`
- Output: corrected `feedback.md`
- Output content identity:
  `sha256:bd8ccc9a0f904042e613c53ed419cb130916423497d5627e392a035fb6b09c76`
- Correction: Run 002's content stated no findings and its manifest recorded
  `Ready to freeze`, but its verdict line was accidentally left as `Not ready
  to freeze`. The brief and Design Map were unchanged; no evaluator revision
  was frozen or artifact written before the inconsistency was discovered.
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because this was a documentation correction
- Measurement cutoff: immediately before this manifest update

## Run 005 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: revised `spike.md`
- Input content identity:
  `sha256:933537330e679a9489fab467c8c4c0149f57739811cb5c53f5d94ff2ca2225bd`
- Output: `feedback.md`
- Output content identity:
  `sha256:b4ae478bfdf518b0e9a9640f88a2d6ac382bd9ed0d060d9affa0312dde5afc29`
- Findings: none. The executor lifecycle is explicit and detached for both
  Codex and Claude; the prior Design Map and attempted evaluator preparation
  are invalidated by this material contract revision.
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because this was a contract review
- Measurement cutoff: immediately before this manifest update

## Run 006 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: revised `spike.md`
- Input content identity:
  `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
- Output: `feedback.md`
- Output content identity:
  `sha256:4e9cac7264eebec18a13119f74f49ff1a6d9b11aeb40d9108a61d52217f4c14e`
- Findings: none. Detached job output is local and Git-ignored, preserving the
  repository's no-secret-logging rule.
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because this was a contract review
- Measurement cutoff: immediately before this manifest update

## Run 007 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief content identity:
  `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
- Frozen brief Git provenance: `5a1d303`
- Output: `design-map.md`
- Output content identity:
  `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`
- Shared contracts established: ignored local operational state, durable
  detached jobs for both providers, explicit completion, and bounded job
  status/cancellation.
- Restricted evaluator material inspected: none
- Checks: `git diff --check` passed for the Spike 008 directory before this
  manifest update
- Runtime tests: not run because no implementation changed
- Measurement cutoff: immediately before this manifest update

## Run 008 — Evaluator Prepare

- Recorded: contemporaneously
- Skill: `evaluator` v7
- Agent/tool: Claude
- Mode: `prepare`
- Result: evaluation revision `001` frozen
- Frozen brief content identity:
  `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
- Frozen brief Git provenance: `5a1d303`
- Frozen Design Map content identity:
  `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`
- Frozen Design Map Git provenance: `3ac7c20`
- Output: `eval-requirements.md`
- Output content identity:
  `sha256:449873a0355cc377294d0ca1fa144a2d7d77347c4e96e4dd72b18bdea422a53a`
- Evaluation revision identity:
  `sha256:ee62552f957408e3cc64ee09040503f87dbbb194d9b165d03baf98655f21b333`
- Repository evidence inspected: frozen brief, frozen Design Map, active
  evaluator skill contract, package tooling and `tsconfig.json`, public
  Spike 007 workflow evidence
- Checks: `tsc --noEmit` against the frozen evaluation suite (using the
  public project's own compiler options) passed with zero errors; `node
  --test` executed the frozen suite against the unmodified public
  repository (no `workflow` script exists yet) and every failure was
  attributable to the absent implementation, not a broken oracle; `npx
  prettier --check` passed for this output and every frozen private
  artifact; the `PATH` bare-name process-resolution assumption and the
  `git check-ignore` oracle mechanism were each validated empirically
  outside the test framework; `git diff --check` passed for the Spike 008
  directory before this manifest update
- Measurement cutoff: immediately before this manifest update

## Run 009 — Implementation attempt 001

- Recorded: contemporaneously
- Skill: `implementation` v3
- Agent/tool: Codex
- Result: candidate complete; independent evaluator verification pending
- Inputs: frozen `spike.md`, `design-map.md`, `eval-requirements.md`, and
  `AGENTS.md`
- Input content identities:
  - `spike.md`:
    `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
  - `design-map.md`:
    `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`
  - `eval-requirements.md`:
    `sha256:449873a0355cc377294d0ca1fa144a2d7d77347c4e96e4dd72b18bdea422a53a`
- Input Git provenance: `5a1d303` (brief), `3ac7c20` (Design Map), and
  `e53ecd3` (evaluation requirements)
- Output: repository-local `workflow` CLI, ignored `.workflow/` state/log
  paths, and visible workflow-runner tests
- Output content identity (implementation files, immediately before this
  manifest update):
  `sha256:185edbf36a174bfb447f817a8d4737eedef27e3e4e4207a2d7396cea827fd7b0`
- Restricted evaluator material inspected: none
- Checks: `npm test` passed (27 tests) with localhost binding permitted; `npm
  run typecheck`, `npm run lint -- src/workflow.ts test/workflow.test.ts`,
  `npx prettier --check src/workflow.ts test/workflow.test.ts package.json`,
  `git diff --check`, and `git check-ignore` for state and log paths passed
- Measurement cutoff: immediately before this manifest update

## Run 010 — Evaluator Verify attempt 001

- Recorded: retrospectively from the immutable private attempt result
- Skill: `evaluator` v7
- Agent/tool: Claude
- Mode: `verify`
- Result: `BLOCKED`
- Implementation evaluated: `e147e0f` (working tree clean)
- Evaluator revision: `001`, revision identity:
  `sha256:ee62552f957408e3cc64ee09040503f87dbbb194d9b165d03baf98655f21b333`
- Mandatory cases: 13 of 13 run; 12 passed; 1 evaluator-defective (E4's
  second sub-case in `retry-loop.test.ts`)
- Classification: `EVALUATOR_DEFECT` — the case's action script recorded two
  differing terminal outcomes for the same numbered phase+attempt, itself
  contradicting the independently frozen and independently verified R7
- Follow-up: evaluator revision `001` corrected under a distinguishable
  revision `002` (retry-loop.test.ts split into two non-contradictory
  cases preserving full R9 coverage; only that test file and this spike's
  private `eval-spec.md` Revision History changed); revision `001` archived
  unchanged before correction; regressions deferred to the attempt against
  the corrected revision per the shared verify procedure
- Private result: `.eval/attempts/001/eval-result.md`, result identity
  `sha256:2dad9be01529ba74144eaa5beef9fe4a7982b619f82b40cb9790c326f0aefb46`
- Measurement cutoff: immediately before this manifest update

## Run 011 — Evaluator Verify attempt 002

- Recorded: retrospectively from the immutable private attempt result
- Skill: `evaluator` v7
- Agent/tool: Claude
- Mode: `verify`
- Result: `PASS`
- Implementation evaluated: `e147e0f` (unchanged from attempt 001; working
  tree clean)
- Evaluator revision: `002` (corrects `001`), revision identity:
  `sha256:eaf93d47ef02ade7ba27ebddaf3ff15b855cc85b1f302dd778f117333ae828f3`
- Mandatory cases: 13 of 13 passed (20 individual test blocks across 9
  hidden test files); 0 evaluator defects against revision `002`; no
  specification drift detected
- Regressions: `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `npm test` (27/27, the project's own pre-existing suite), and
  `git diff --check` all passed clean against `e147e0f`
- Private result: `.eval/attempts/002/eval-result.md`, result identity
  `sha256:d062636b0871eb09339edbee5dec6d7adc974fe591699eeb523817391cfa2fb6`
- Measurement cutoff: immediately before this manifest update

## Run 012 — Evaluator Promotion (attempt 002 PASS)

- Recorded: contemporaneously
- Skill: `evaluator` v7
- Agent/tool: Claude
- Mode: `verify` (promotion procedure following a finalized `PASS`)
- Result: promoted
- Independent re-verification performed before promoting: reran all 9 frozen
  hidden test files (20/20 passing) against unchanged implementation
  `e147e0f`, and recomputed the content identity of `spike.md`,
  `design-map.md`, `eval-requirements.md`, private `eval-spec.md`, and every
  hidden test/support file, confirming exact agreement with the frozen
  identities before promoting
- Promoted: private attempt ledger and both attempts' immutable results,
  unchanged, to `evaluation/`; evaluator revision `002`'s exact frozen
  bundle (`eval-spec.md`, `.hidden-test/**`) and freeze metadata to
  `evaluation/revisions/002/` and `evaluation/freeze/002.json`
- Not promoted: evaluator revision `001` (recorded by revision identity and
  `not-promoted` disposition only in `evaluation/promotion.json`) — its
  `retry-loop.test.ts` could not pass against any correct implementation, so
  it provides no durable public regression coverage
- Checks: `prettier --check` across the entire promoted `evaluation/` tree
  passed clean; `git diff --check` passed clean; every promoted historical
  file's recomputed content identity matched its recorded source identity
- Output: `evaluation/promotion.json`, `evaluation/attempt-ledger.json`,
  `evaluation/attempts/001/eval-result.md`,
  `evaluation/attempts/002/eval-result.md`, `evaluation/freeze/002.json`,
  `evaluation/revisions/002/**`
- Measurement cutoff: immediately before this manifest update

## Run 013 — As-Built

- Recorded: contemporaneously
- Skill: `as-built` v2
- Agent/tool: Codex
- Result: complete; no missing, contradictory, or extra material behavior or
  structure found against the frozen brief and Design Map
- Inspected implementation revision: `e147e0f`
- Inputs:
  - frozen `spike.md`:
    `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
  - frozen `design-map.md`:
    `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`
  - public `eval-requirements.md`:
    `sha256:449873a0355cc377294d0ca1fa144a2d7d77347c4e96e4dd72b18bdea422a53a`
  - final promoted evaluator result: attempt `002`, revision `002`, `PASS`
- Output: `as-built.md`, content identity
  `sha256:b3868e5f8dd3cc3c596deff3c1b821308265f52beb5d69fdc69a6e10a7e7a9c5`
- Repository evidence inspected: exact implementation diff, `src/workflow.ts`,
  `test/workflow.test.ts`, root `.gitignore`, package script, frozen public
  contracts, and promoted evaluation results
- Checks: `git diff --check` passed for the As-Built artifact before this
  manifest update
- Measurement cutoff: immediately before this manifest update
