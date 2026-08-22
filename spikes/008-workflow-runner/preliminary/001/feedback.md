# Brief Readiness — Spike 008

## Findings

### Blocker — retry attempts cannot be recorded

`spikes/008-workflow-runner/spike.md` requires the runner to reject “a
duplicate terminal outcome for the same phase” and defines a linear dispatch
precondition. `AGENTS.md` requires an implementation/evaluation retry loop
after evaluator verification. A failed verification must permit another
implementation attempt against the same frozen evaluation; it must not force
evaluation preparation to run again.

As written, a terminal `failed` evaluator-verify record would prevent the next
implementation attempt from being recorded or dispatched. The runner would
therefore reject a required canonical path.

Clarify the state model to distinguish a phase *kind* from a monotonically
numbered attempt and to define the only permitted backward transition:
`evaluator-verify` with a failed outcome may open the next implementation
attempt. Evaluator `prepare` remains non-repeatable unless the existing
evaluator contract establishes a corrected frozen revision.

## Review scope

Read `spikes/008-workflow-runner/spike.md`, `AGENTS.md`, the active
implementation and evaluator skill contracts, `package.json`, and the public
Spike 007 manifest/outcome. No evaluator-private material was inspected.

## Checks

- `git diff --check -- spikes/008-workflow-runner` passed before this feedback
  file was written.
- Runtime checks were not run: this was a contract review with no runtime
  implementation.

## Verdict

**Not ready to freeze**
