# Spike 007 — Workflow Manifest

This append-only record preserves material workflow runs for Spike 007.

## Run 001 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `spike.md`
- Input content identity:
  `sha256:9ec0a2cca29b18e0970d443cedc75979a38f1cb7c90a566dcfc81406341c57ec`
- Outputs: `feedback.md`, `preliminary/001/spike.md`, and
  `preliminary/001/feedback.md`
- Feedback content identity:
  `sha256:c7cd957862793854090dc8388ab338c09f096a4a5dc4bd15d38ccba9a767eeca`
- Findings: 2 blockers, 1 material clarification
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, `src/index.ts`,
  `src/session-backend.ts`, `public/client.js`, visible session lifecycle,
  backend, and Codex integration tests, package tooling, and public Outcomes for
  Spikes 003–005
- Restricted evaluator material inspected: none
- Checks: both preliminary files compared byte-identical with their live
  counterparts; feedback formatting passed; `git diff --check` passed for the
  Spike 007 directory before this manifest update
- Runtime tests: not run because this review made no implementation change
- Input lines: 270
- Feedback lines: 108
- Limitation: the worktree was already dirty with an unrelated Spike 006 path
  rename; it was not modified by this run
- Git checkpoint: not committed or pushed because the draft is untracked on
  protected `main` amid unrelated worktree changes, not on the canonical
  `feat/spike-007` workflow branch
- Measurement cutoff: immediately before this manifest update

## Run 002 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: revised `spike.md`
- Input content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Output: `feedback.md`
- Output content identity:
  `sha256:d0ebd3d5a18262ef740ae21454c38342743ba0e8a2a9bcfa41de2c924fec10f3`
- Findings: none
- Prior findings resolved: 2 blockers and 1 material clarification from Run 001
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, the preserved Run 001
  feedback, `src/index.ts`, `src/session-backend.ts`, `public/client.js`, visible
  session lifecycle, backend, and Codex integration tests, package tooling, and
  public Outcomes for Spikes 003–005
- External evidence inspected: the public canonical Conduit protocol repository
  named by the brief, at its moving head for feasibility only; immutable
  revision selection remains a Design Map responsibility
- Restricted evaluator material inspected: none
- Checks: feedback formatting passed; `git diff --check` passed for the Spike
  007 directory before this manifest update
- Runtime tests: not run because this review made no implementation change
- Input lines: 617
- Feedback lines: 61
- Preliminary snapshot: none, because the review passed
- Measurement cutoff: immediately before this manifest update

## Run 003 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief: `spike.md`
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen brief Git provenance: `b1a2ecc`
- Output: `design-map.md`
- Output content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Conduit protocol reference:
  `29ef1c88f8d2c805319f671c901872fb82036356`
- Shared contracts established: exact minimal lifecycle envelope, Conduit schema
  identity and root-event semantics, `/events/ws` transport boundary, Harness
  lifecycle ownership, broadcast connection ownership, and existing public
  evaluation seam
- Repository evidence inspected: frozen brief and readiness history,
  `AGENTS.md`, `GOALS.md`, `src/index.ts`, `src/session-backend.ts`, visible
  lifecycle/backend tests, and workflow contracts
- External evidence inspected: the pinned Conduit protocol README, canonical
  JSON schema, minimal-event fixture, root-message fixture, and conformance
  documentation
- Restricted evaluator material inspected: none
- Checks: Design Map formatting passed; `git diff --check` passed for the Spike
  007 directory before this manifest update
- Runtime tests: not run because no implementation changed
- Design Map lines: 112
- Measurement cutoff: immediately before this manifest update

## Run 004 — Evaluator `prepare`

- Recorded: contemporaneously
- Skill: `evaluator` v6, mode `prepare`
- Agent/tool: Claude Code
- Result: prepared and frozen (evaluation revision 1)
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen Design Map content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Output: `eval-requirements.md`
- Output content identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Blocking questions: none; the frozen brief and Design Map left no material
  ambiguity preventing fair evaluation
- Testability requirements published: 4
- Evaluator assumptions published: 4
- Mandatory evaluation cases frozen: 12, exercising both PTY- and
  Codex-backed sessions where the brief requires backend-neutral coverage
- Repository evidence inspected: frozen brief, Design Map, and readiness
  history; `src/index.ts`, `src/session-backend.ts`, `src/pty-backend.ts`,
  `src/codex-backend.ts`; the existing public integration test suites for
  session lifecycle, session backend injection, and Codex backend
  behaviour; `package.json`
- Restricted evaluator material inspected/produced: private `eval-spec.md`,
  a private hidden-test suite, and a private case manifest, all under the
  mirrored `harness-hidden` spike path
- Pre-freeze integrity gate: shared evaluator helpers independently
  validated (positive and negative hand-built samples); every mandatory
  case positive-controlled against a throwaway, uncommitted reference
  implementation of the frozen contract and negative-controlled against
  the current, unimplemented repository, confirming each failure/pass was
  for the intended reason; the one materially new runtime mechanism
  (live WebSocket broadcast with no replay for late joiners) was
  additionally validated empirically, independent of Harness code, before
  any hidden test was written; one connection-helper defect (hangs on a
  rejected upgrade instead of failing) was found and fixed during this
  process, before freeze
- Runtime tests: public `npm test` confirmed passing on the frozen commit
  before preparation began; no implementation change was made
- Checks: `git diff --check` passed for the Spike 007 directory before this
  manifest update; the public working tree was confirmed clean after a
  temporary, uncommitted dependency-injection probe used to validate one
  case's negative control
- Measurement cutoff: immediately before this manifest update
