# Brief Readiness — Spike 011

## Findings

None.

The brief now binds workflow-run ownership to the existing Harness runtime under
`src/`, while preserving the necessary distinction between interactive sessions
and workflow-role runs. It gives fair, observable acceptance criteria for the
host lifecycle, duplicate allocation, replacement ordering, terminal-completion
binding, event/log separation, and bounded permissions. It also explicitly
limits the bootstrap exception: pre-implementation orchestration may use the
current runner, but cannot fabricate the host-owned evidence being introduced.

The existing runtime and workflow runner make the slice feasible. The current
single-session host is deliberately eligible for a focused generalization, and
the brief correctly forbids a methodology-only sidecar from pretending to solve
the product problem.

## Review scope and limitations

Read `spikes/011-host-owned-workflow-runs/spike.md`, `AGENTS.md`, `GOALS.md`,
the Brief Readiness, Design Map, Implementation, As-Built, Outcome, and
Evaluator skill contracts, the public Harness runtime under `src/`,
`tools/workflow.ts`, visible tests, and public Spike 010c historical evidence.
No evaluator-private material was inspected.

## Checks

- Individual visible runtime and workflow suites passed:
  `test/session-lifecycle.integration.test.ts` (4 tests) and
  `test/workflow.test.ts` (12 tests).
- The full `npm test` invocation did not complete within the command execution
  window; its parallel test-file workers were interrupted before reporting
  diagnostics. This is an execution-window limitation, not a claimed product
  failure; the full suite remains required before implementation handoff.
- `git diff --check` passed before the manifest update.

**Ready to freeze**
