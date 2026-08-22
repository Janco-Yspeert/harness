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
