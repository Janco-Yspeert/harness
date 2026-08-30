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
