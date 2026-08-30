# Spike 010 — Workflow Manifest

This append-only record preserves material workflow runs for Spike 010.

## Run 001 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: `spike.md`
- Input content identity:
  `sha256:a3e81619e2bca965eac7b40789cbc7b98f5a29f5be7ef98b7c14714d85e5ddb4`
- Output: `feedback.md`
- Output content identity:
  `sha256:c4089627c21473f25df32c70a25d1dc49b07e9b8ece12dabcdf1226b9f1c461c`
- Findings: none
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, active workflow
  skills, public Spike 009 evidence, existing workflow tooling/tests, and
  package/TypeScript tooling
- Restricted evaluator material inspected: none
- Checks: `git diff --check -- spikes/010-workflow-authority` passed before
  this manifest update
- Runtime tests: not run because this review made no implementation change
- Measurement cutoff: immediately before this manifest update

## Run 002 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief content identity:
  `sha256:a3e81619e2bca965eac7b40789cbc7b98f5a29f5be7ef98b7c14714d85e5ddb4`
- Frozen brief Git provenance: `51d020b`
- Output: `design-map.md`
- Output content identity:
  `sha256:8f6185794278d0b2c6fc9d725367e548bf664a662d2d7389ece6cf0fd200e800`
- Shared contracts: public `workflow.jsonl`, authority status/validate/record
  commands, provenance-bearing guarded transitions, and separate operational
  versus methodology state
- Restricted evaluator material inspected: none
- Checks: `git diff --check -- spikes/010-workflow-authority` passed before
  this manifest update
- Runtime tests: not run because no implementation changed
- Measurement cutoff: immediately before this manifest update

## Run 003 — Evaluator Prepare

- Recorded: contemporaneously
- Skill: `evaluator` v8
- Agent/tool: Codex (independent evaluator role)
- Mode: `prepare`
- Result: evaluator revision `001` frozen
- Frozen brief identity: `sha256:a3e81619e2bca965eac7b40789cbc7b98f5a29f5be7ef98b7c14714d85e5ddb4`
- Frozen Design Map identity:
  `sha256:8f6185794278d0b2c6fc9d725367e548bf664a662d2d7389ece6cf0fd200e800`
- Output: `eval-requirements.md`,
  `sha256:e61c4a578a2eaf21261df77b72e4d1d4feebe450225254bcd3567531c3e6966d`
- Evaluation revision identity:
  `sha256:7ef1fee50feabdc64a4b748664a36ce2061589598b6c10ed5bf611f07d6aea28`
- Coverage: public-regression evidence only; no hidden suite was frozen because
  the public authority CLI and visible state-transition tests are the stable
  black-box seam and private duplication would add no fair coverage
- Restricted evaluator material produced: private specification, case manifest,
  freeze metadata, and attempt ledger
- Measurement cutoff: immediately before this manifest update

## Run 004 — Implementation attempt 001

- Recorded: contemporaneously
- Skill: `implementation` v3
- Agent/tool: Codex
- Result: candidate complete; independent verification pending
- Inputs: frozen brief, Design Map, public evaluation requirements, and active
  repository instructions
- Output: guarded public authority commands and `workflow.jsonl` canonical
  record alongside preserved operational dispatch tooling
- Checks: `npm run typecheck`, `npm run lint`, `npm test` (28 passing), and
  `git diff --check` passed
- Observation: until the authority is committed, the host still manually
  sequences frozen handoffs and evaluator preparation; after this checkpoint it
  can submit those facts to guarded transitions rather than relying only on
  conversational discipline
- Measurement cutoff: immediately before this manifest update
