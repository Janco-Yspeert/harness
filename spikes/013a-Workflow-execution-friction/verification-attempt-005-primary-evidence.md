# Verification attempt 005 — primary Harness-to-Claude evidence

This public-safe record preserves operational evidence from canonical
verification attempt 005. It does not replace the evaluator's immutable
private result or revise the already-recorded `BLOCKED` finalization.

## Canonical binding

- Canonical authority: `workflow.jsonl`, `verification-allocated`, attempt
  `5`, implementation attempt `4`, candidate
  `3edb31603c1b97eb4f2d52b56c52d4965962113d`, public evaluator revision
  `001`.
- Frozen evaluator bootstrap: evaluator v11,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- Private evaluator revision used by the evaluator: `002`, as recorded in
  `verification-feedback-004.md`.

## Successful protected-role execution

- Harness run ID: `658c01eb-51d3-49d1-a6e0-48770af5a3e2` (execution attempt
  `2`, replacing the preserved provider-API-error execution
  `cf5e427f-5212-45dc-881b-70802e6f5e89`).
- Real Claude child: PID `2398318`, Claude Code `2.1.270`.
- Delivery: the real production Claude adapter using
  `claude-system-contract`; the host resolved the pinned v11 contract and
  canonical workflow allocation itself.
- The evaluator was invoked as the protected `evaluator-verify` role through
  Harness. No manual `/evaluator` invocation occurred.
- The child ran for 1,129,419 ms (18m49s), completed the evaluator work, and
  emitted a semantic role result accepted by Harness as host-validated
  `succeeded`.

The retained host run record for this execution identified the canonical
allocation authority, v11 contract identity, evaluator permission profile,
candidate and private evaluator workspaces, and a host-created run-scoped
scratch workspace. Its log location was
`/workflow-runs/658c01eb-51d3-49d1-a6e0-48770af5a3e2/log` on the originating
Harness host. The public evaluator result is
`verification-feedback-004.md`; the canonical terminal authority event is the
attempt-5 `verification-finalized` entry in `workflow.jsonl`.

## Relationship to the attempt-5 BLOCKED result

The outer Harness-to-Claude execution did not reproduce the earlier refusal
condition: the protected evaluator role genuinely executed and completed.
The evaluator independently established 33 of 35 criteria. It marked AC08,
AC09, and dependent AC34 `BLOCKED` only after attempting an additional nested
live-Claude fixture whose *inner* process launch failed with `spawn claude
ENOENT` in the evaluator's own environment. That infrastructure limitation
occurred after—not instead of—the successful outer protected-role execution.

This record deliberately does not decide whether the successful outer
execution is sufficient frozen evidence for AC08/AC09. That adjudication is
reserved to the frozen evaluator in a later canonical verification attempt.

Spike 011 authority was not modified by this work; its pre-existing dirty
ledger entry remains outside this spike's history.
