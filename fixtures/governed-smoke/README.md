# Governed smoke fixture project

A dedicated, isolated synthetic project for Spike 014c's governed-executor
tests. It has its own tiny methodology (`methodology/`), two trivial roles and
one protected role with a `promotion` contract, and harmless precreated bytes.

- `project.json` — loaded with the production `loadProject`. Test code adds one
  disposable workflow whose directory and workspaces are temporary directories.
- `methodology/` — the fixture's policy, contracts and skills.
- `data/` — copied into each disposable workflow directory (the `repository`
  workspace).
- `private/` — copied into each disposable `private` workspace.

## Trust root

The fixture's trusted history is `methodology/trusted.jsonl`. It is deliberately
absent until a human approves the exact fixture revision and manifest identity
reported in `spikes/014c-governed-executor-integration/smoke-evidence.md`. Until
then the production trust-equivalence gate denies every grant for this fixture,
and the real-provider smoke criteria are unproven.

This fixture's trust root authorizes only its own synthetic executions. It
cannot govern or evaluate any Harness spike, alter Harness's trusted history, or
authorize a production workflow.

Deterministic tests copy this fixture into a disposable Git repository and
record a test-only trust root there; they never write this directory.
