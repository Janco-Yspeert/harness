# Outside-Workflow Manifesto — Spike 009

This is a post-Outcome transparency record, requested after the Spike had
completed. It is not frozen workflow evidence, does not amend the brief or
evaluation contract, and should not be mistaken for runner state. The runner
was deliberately not used to orchestrate this work.

## What happened outside the runner

- I created and pushed `feat/spike-009` manually from the completed Spike 008
  branch, then made focused checkpoint commits for each public handoff. The
  runner performed no branch, commit, push, PR, merge, or manifest operation.
- Per the request, I manually sequenced Brief Readiness, Design Map, evaluator
  preparation/verification, implementation, As-Built, and Outcome from this
  conversation. No `.workflow/` state was created for Spike 009 and no
  `workflow.ts` command was used as a workflow authority.
- I created and maintained the sibling private evaluator workspace manually,
  including the frozen suite, attempt ledger, immutable result, archival copy
  of the defective evaluator revision, and promotion copies. This was work
  required by the evaluator contract, but it was outside the runner's local
  bookkeeping boundary.
- The first evaluator suite had a genuine fixture defect: its supposed missing
  executable was still on `PATH`. It was caught while validating the prepared
  suite against the candidate, archived unchanged, and corrected as evaluator
  revision `002`. The implementation was not changed to accommodate it.
- Human acceptance was supplied in this conversation after promoted PASS and
  As-Built. That is intentionally not something the runner can infer or record
  as an automatic success claim.

## What did not happen

- No Harness runtime behavior beyond the requested runner move/tightening was
  changed.
- No dependency, scheduler, daemon, provider framework, remote execution, or
  evaluator-private access was added to the runner.
- No history was rewritten, no promoted evaluator artifact was normalized after
  promotion, and no changes were made directly on `main`.
- No pull request or merge has been created; that remains a human review step.

## Why this is separate

The workflow runner is intentionally a small local record keeper, not the
authority that declares frozen provenance, evaluator validity, promotion, or
acceptance. The work above is therefore visible here rather than smuggled into
its state machine like a suspiciously damp goblin.
