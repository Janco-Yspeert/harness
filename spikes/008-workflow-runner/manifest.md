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
