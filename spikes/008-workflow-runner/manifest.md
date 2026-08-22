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
