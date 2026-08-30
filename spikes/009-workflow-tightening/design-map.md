# Design Map — Spike 009 Workflow Tightening

## Shared contracts

- The stable command remains `npm run workflow -- ...`; it operates only on a
  normalized repository-relative `spikes/NNN-*/` path. The runner implementation
  moves to a repository tooling location outside `src/`; no runtime module may
  import it.
- The seven fixed workflow phases and their phase-to-skill mapping are
  unchanged. They describe roles, not vendor ownership: public work is Brief
  Readiness, Design Map, implementation, As-Built, and Outcome; independent
  work is evaluator prepare and evaluator verify.
- Public and evaluator roles each select an executor independently through
  explicit repository-tool environment settings. The defaults remain Codex for
  public work and Claude for evaluator work. The supported selection is limited
  to the existing Codex and Claude command profiles; this is a bounded command
  choice, not a provider abstraction.
- Implementation attempts and evaluator-verification attempts have separate,
  monotonically increasing identity spaces. Each evaluator-verification
  dispatch/record explicitly carries the completed implementation attempt it
  evaluates. `status` exposes that relation so it remains independently
  testable.
- A completed implementation may therefore receive a later verification after
  an earlier verification is recorded `blocked`. A new implementation attempt
  is permitted only after the operator records evaluator verify `failed`; the
  runner does not determine the classification behind that outcome.
- An `--execute` dispatch becomes a consumed phase dispatch only after the
  executor launch succeeds. A launch error may be retained as operational
  history, but it cannot block a retry of that same phase attempt and is not a
  terminal workflow outcome.
- `.workflow/` remains ignored local operational state. On the supported POSIX
  host, newly created directories use owner-only access and newly created state
  and combined-output log files use owner read/write access, independent of a
  permissive process umask.

## Invariants

- `record` remains the only authority for `complete`, `blocked`, or `failed`;
  executor exit and output are not interpreted.
- Dry-run remains the default; execution remains detached with combined local
  logs, status/liveness reporting, and cancellation.
- The runner does not read evaluator-private material, manage evaluator
  revisions, perform Git operations, or claim evaluation success or acceptance.
- Spike 008 historical artifacts remain untouched.

## Implementation freedom

- The state-file schema, environment-variable names, event names for retained
  launch failures, command-profile construction, process-launch plumbing, and
  exact permissions API are implementation choices.
- Selection may reject an unsupported executor clearly; no general provider or
  plugin registration mechanism is required.
