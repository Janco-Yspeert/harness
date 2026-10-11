# Design Map — 014n Finalized Verification Evaluator-Correction Authority

Frozen brief: `spike.md` (`sha256:8b5d3b4036306a225ff6de46dbd586a71b7d12a623a9fcd25207b4ae13d5263d`).

## Shared contracts

**Surface.** The existing `ExecutionKernel.authorizeEvaluatorCorrection` and the
root-only `POST …/evaluator-corrections` route remain the only entry points. No
new route, method, or transition name is added.

**Source discriminator.** The request field is `source`. Absent (the rejected
request exactly as accepted today) means the legacy rejected-execution variant;
the one new value is `"finalized-verification"`. Any other value fails closed.
The legacy request, its validation, errors, and authority bytes are unchanged.

**Finalized request fields.** `source`, `classification`
(`EVALUATOR_COVERAGE_DEFECT`), `reason`, `execution`, `attempt`,
`sourceEvaluatorRevision`, plus names already used by the correction-cycle
request for the same facts: `finalizedEvent` (replaces `rejectionEvent`),
`commit` (candidate), `roleGrant`, `semanticResult` (the _source_
verification's), `result` (`BLOCKED`), `recordedClassification`,
`artifactCommit`, `artifactPath`, `artifactIdentity`. Every field is required.

**Authority variants.** `HumanEvaluatorCorrectionAuthority` becomes a union
discriminated by `source`.

- Rejected variant: exactly today's fields. It must not gain a `source` field,
  so its content-derived `semanticResult` is unchanged for identical inputs.
- Finalized variant: `source: "finalized-verification"`, the common fields
  (`id`, `project`, `workflow`, `origin: "human"`, `classification:
"EVALUATOR_COVERAGE_DEFECT"`, `sourceEvaluatorRevision`, `attempt`,
  `execution`, `reason`), and source bindings `finalizedEvent`,
  `sourceCommit`, `sourceRoleGrant`, `sourceSemanticResult`, `sourceResult`,
  `sourceClassification`, `sourceArtifactCommit`, `sourceArtifactPath`,
  `sourceArtifactIdentity`. Its own `semanticResult` is content-derived over
  all other fields and distinct from `sourceSemanticResult`.
- Both are appended as the same `human-evaluator-correction-authorized` event.
  The event's top-level `evidence.execution`, `attempt`, `classification`, and
  `semanticResult` keep their existing meaning for both variants (the resolver
  predicate and `repairTrigger` input read them).

**Lineage key.** At most one `human-evaluator-correction-authorized` event per
workflow + execution + attempt + candidate + evaluator revision, regardless of
variant. Legacy rejected authority events carry no candidate field; their
candidate is that of the matching `verification-allocated` event, which is how
the duplicate check compares them. Duplicate → existing "already recorded"
error (HTTP 409).

**Source verification contract.** For `finalized-verification` the kernel
re-reads the artifact from Git at `artifactCommit:artifactPath` and requires
identity and semantic fields to agree with the canonical
`verification-finalized` event with id `finalizedEvent` and the matching
`verification-allocated` event, across the fields enumerated in the brief. Only
`result: BLOCKED` whose recorded classification does not already satisfy the
evaluator-repair eligibility predicate is admissible.

**Currentness.** Computed solely from canonical ledger order: the source must be
the latest `verification-finalized` in the current lineage, and no later event
may be any of the five staleness events in the brief. Caller assertions are not
consulted.

**Eligibility and consumption seam.** Eligibility is expressed in the pinned
methodology policy (`methodologies/harness/policy.json`, role
`evaluator-repair` `when`) and the `repairTrigger` input of
`evaluator-repair.json`; both already name
`human-evaluator-correction-authorized`. That remains the single
resolver/state-machine seam: an unconsumed authority is the latest such event
with no later `evaluator-repair-recorded`; the `implementation` and
`evaluator-verify` `when` clauses must stay false while it is unconsumed.
Changing policy or contract bytes changes the methodology identity, which the
brief requires unchanged; so eligibility must rely on the existing
policy/contract bytes where they suffice, and any further transition validation
lives in kernel code, not new policy.

**Repair binding.** The `evaluator-repair` grant's repair trigger is the
authority's `semanticResult`; its source evaluator revision is the authority's
`sourceEvaluatorRevision`. A recorded repair must bind both and a new successor
revision; recording it consumes the authority.

## Design decisions

- The discriminator name `source` and the field vocabulary above are fixed here
  so independent evaluation can construct requests and read authorities without
  guessing. Names reuse the correction-cycle request/authority vocabulary.
- The authority's own `semanticResult` is never the source's; the source's is
  carried as `sourceSemanticResult`.
- The duplicate check widens from (execution, attempt) to the lineage key above
  for both variants (brief clarification C1).
- Source verification events are never modified; the authority is a new
  appended event only.

## Invariants

- The original `verification-finalized` event and artifact are byte-for-byte
  and event-for-event unchanged; no verdict or classification is written.
- The authority makes only `evaluator-repair` eligible; never `implementation`
  or `evaluator-verify`; no candidate change.
- Evaluator workspace, capability, forbidden-exposure, and protection
  properties of the repair grant are identical to those of a repair triggered
  by an existing authority.
- Failed or interrupted repairs do not consume the authority and use only the
  ordinary evaluator-repair retry limit; one successful repair consumes it and
  no second repair is possible from it.
- The automatic correction count is neither reset nor incremented.
- No branch depends on `INFRASTRUCTURE_FAILURE`, a workflow id, or a spike id.
- Absent, ambiguous, stale, or mismatched bindings refuse without appending any
  event.

## Implementation freedom

- Internal structure of validation, helper names, and how the currentness scan
  and Git re-read are factored.
- Exact wording of new refusal messages (the existing "already recorded"
  wording for duplicates is retained).
- Whether finalized-variant request parsing lives in the host or kernel layer,
  provided the route and kernel method surface above are preserved.
- Test fixture construction.
