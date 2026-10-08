# Outcome — 014f Inactive Workflow Grant Retirement

## Result and exact provenance

**COMPLETE — STANDARD.** Human acceptance binds candidate
`af75b14d1847af02404a591a8829751dc8df2a2e`, independently verified as PASS
by evaluator revision `002` in attempt `009` (execution
`d59a2e87-2bf0-494c-86af-9012967229b6`). The canonical verification artifact
is `sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`;
the promoted evaluation identity is
`sha256:d283a7ffb58a9c9a227783148f1a7f63249443377aef1943986b4b218583c7e5`;
and the completed As-Built identity is
`sha256:28e1ca62d780563132decee0413572c4fb6282bc0c2ff3aaa170525a417a5211`.

## What Was Established

Harness can permanently retire one exact inactive Workflow Execution Grant
through the existing root-authorized host boundary without creating an
execution or consuming allocation authority. Retirement is a durable,
append-only `kernel.workflow-grant-retired` event. It preserves the original
grant and all prior history while preventing future allocation, continuation,
retry, or replacement under that grant, including after ledger replay.

Retirement fails closed while an owned execution is active or has an unresolved
human request. Repeat retirement is refused without a duplicate event. An
independently issued successor grant continues to work normally and inherits no
unused budget from the retired grant.

## Implementation Summary

The kernel owns retirement under the existing per-workflow transaction and
uses a shared permanent-non-executable lookup for revoked and retired grants.
The root-only `POST /governed/<workflow>/grant-retirements` operation records
retirement, while the corresponding root-only `GET` lists retirement evidence.
Existing inspect and allocation paths enforce the retired state, so continuation
and recovery paths do not need retirement-specific bypasses or a second state
store. No role skill or contract changed for this feature.

## Evaluation Evidence

Attempt `009` ran against a clean detached checkout of the exact candidate.
All 11 mandatory executable procedures passed, both non-executable procedures
were satisfied, and AC01–AC08 were adjudicated satisfied. The differential
regression compared candidate and baseline suites: each had the same one
environmental nested-sandbox failure, with no baseline-passing behavior failing
on the candidate. Type checking, focused lint and formatting, and candidate
`git diff --check` also passed.

Promotion contains evaluator revision `002`, the passing result, the preceding
attempt `008` result, and recovery/provenance records. The archive is explicitly
`incomplete` under `HISTORICAL_UNBOUND_PRIVATE_EVIDENCE`: terminal private bytes
for attempts 1, 2, and 5 were never durably identity-bound and were not
reconstructed. Human acceptance explicitly accepted this historical limitation
because the exact passing attempt, evaluator revision, public result, and
private terminal evidence are intact and identity-bound.

## Material History

- Evaluator revision `001` produced two BLOCKED infrastructure results after
  its feature cases passed but repository regression evidence could not be
  completed reliably in the environment.
- Revision `002` replaced only that environment-blocked evidence plan; frozen
  acceptance semantics did not change and the implementation required no
  source rewrite.
- Attempts 3, 4, 6, and 7 remained nonterminal allocations. Attempt 5 was
  BLOCKED because no writable disposable storage was available.
- Attempt 8 was BLOCKED before candidate evaluation by a nested-shell sandbox
  failure. Its public result also used the wrong identity field, so canonical
  finalization was transition-blocked. The manifest was accidentally replaced
  during its evidence action and then restored forward; the immutable history
  preserves both the overwrite and correction.
- Attempt 9 supplied the canonical PASS. Later explicit recovery bound the
  surviving evidence truthfully without inventing missing bytes, after which
  promotion, As-Built, and human acceptance completed.

## Decisions and Discoveries

Retirement is a distinct lifecycle fact, not revocation, cancellation, a fake
execution result, or pre-implementation recovery. Derived ledger state is
sufficient for restart safety; no cache or persistence layer was needed. The
existing inspect/allocation chokepoints were the right enforcement boundary,
and exact workflow-plus-grant binding was sufficient without adding a stale
authority-basis mechanism.

The protracted evaluation also showed that evaluator success is separable from
provider setup, sandbox viability, semantic-result recording, finalization, and
archive completeness. In particular, terminal evaluator evidence must be
durably identity-bound before or atomically with verification finalization.

## Deferred Concerns

This spike does not add grant expiry, budget transfer, bulk cleanup, generalized
grant editing, or Stockdif-specific behavior. It does not complete or resume the
014e canary. Provider/runtime preflight, explicit human retry authority, durable
session resumption, stronger terminal-evidence binding, and clearer separation
of result, finalization, and archival state remain successor concerns.

## Skill Versions and Workflow Cost

Material roles used Brief Readiness v5, Design Map v4, Evaluator v14,
Implementation v5, As-Built v4, and Outcome v5. The workflow recorded two
evaluator preparations, two implementation handoffs, and nine evaluator
allocations: five terminal BLOCKED/PASS attempts and four nonterminal attempts.
The attempt 8 manifest record includes a forward evidence repair, and the later
archive entries are explicitly recovery/retrospective records. One provider
call is recorded for attempt 8; wall-clock time, token usage, and other runtime
measurements were unavailable and are not estimated.

## Next Step

If the 014e Stockdif canary is deliberately resumed, first use this accepted
operation under fresh explicit root authority to retire the exact stranded H4
grant and verify its unused allocations remain visible but unusable. Resume
Stockdif only as a separate decision under a fresh bounded grant and the
then-current accepted Harness runtime.
