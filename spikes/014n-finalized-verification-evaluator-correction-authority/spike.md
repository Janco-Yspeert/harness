# Spike 014n - Finalized Verification Evaluator-Correction Authority

**Status:** Draft for Brief Readiness and human review; not frozen

## Purpose

Create the smallest reusable legal authority needed to repair an evaluator after
a finalized `BLOCKED` verification whose recorded failure classification does
not itself make evaluator repair eligible.

## Problem

A governed evaluator may finalize a `BLOCKED` result because required evidence
is unavailable from within its intentionally constrained environment. A human
may subsequently determine that the infrastructure behaved correctly and that
the actual defect lies in the evaluator's coverage or evidence design.

The human diagnosis must not rewrite or relabel the original canonical
verification result. The original result and classification remain immutable
history.

## Required behavior

Extend the existing `authorizeEvaluatorCorrection` /
`human-evaluator-correction-authorized` path. Do not add a parallel human
evaluator-repair mechanism.

The source may be either:

1. the already-supported rejected verification execution; or
2. an exact canonical finalized verification result.

For a finalized verification source, the authority must:

- require an existing canonical `verification-finalized` event;
- bind the exact workflow, candidate, evaluator revision, verification attempt
  and execution, semantic result, artifact identity, and recorded
  classification;
- preserve the source verification result and classification unchanged;
- require an explicit human diagnosis explaining why the observed blockage is
  an evaluator coverage or evidence-design defect;
- record a new human-owned `human-evaluator-correction-authorized` transition;
- retain authority classification `EVALUATOR_COVERAGE_DEFECT`;
- authorize exactly one `evaluator-repair` successor from the bound evaluator
  revision;
- require the repair to produce a new evaluator revision without mutating the
  previous revision;
- consume the authority when one repair succeeds, while retaining ordinary
  failed/interrupted evaluator-repair retry semantics;
- fail closed when candidate, evaluator revision, verification lineage,
  workflow scope, or source evidence is stale or mismatched.

The authority must not:

- reopen implementation or authorize candidate changes;
- enable evaluator verification directly;
- broaden evaluator workspace, filesystem, network, capability, or
  private-data access;
- synthesize, rewrite, or relabel an evaluator verdict;
- permit duplicate authorization or repeated successful repairs from the same
  authority;
- special-case `INFRASTRUCTURE_FAILURE` or any workflow/spike identity.

## Request and authority shape

Keep the existing rejected-execution request byte-compatible. Treat an omitted
source discriminator as that legacy rejected-execution variant.

Add one explicit `finalized-verification` request variant on the existing
`/evaluator-corrections` route. It replaces `rejectionEvent` with the exact
`verification-finalized` event id and supplies the source candidate, role grant,
semantic result, result, recorded classification, artifact commit, artifact
path, and artifact identity in addition to the existing workflow-bound
execution, attempt, evaluator revision, diagnosis `reason`, and requested
`EVALUATOR_COVERAGE_DEFECT` classification.

Represent `HumanEvaluatorCorrectionAuthority` as corresponding discriminated
variants. The rejected variant retains its existing fields. The finalized
variant records the exact finalized-event id and all source bindings above.
Both remain the same `human-evaluator-correction-authorized` transition and
produce a content-derived `semanticResult`.

For a finalized source, re-read the committed artifact from Git and require its
content identity and semantic fields to agree with the canonical finalized
event and matching `verification-allocated` event. Match, at minimum, workflow,
candidate commit, role grant, evaluator revision, numeric attempt, execution,
allocation identity, semantic result, result, recorded classification,
artifact commit/path/identity, and the exact finalized event id. Any absent or
ambiguous binding fails closed.

Duplicate detection is verification-lineage based, not source-variant based:
only one human evaluator-correction authority may exist for the same workflow,
execution, attempt, candidate, and evaluator revision. A rejected and finalized
variant therefore cannot separately authorize the same verification lineage.

## Eligibility, retry, and consumption

This spike includes the canonical resolver and transition-validation seams
needed to make `human-evaluator-correction-authorized` real authority. Do not
create a second state machine: update any still-supported legacy
`evaluator-repair-recorded` validation only as required to preserve compatibility
with the canonical governed behavior.

An unconsumed authority makes only `evaluator-repair` eligible. The role grant
must receive the authority's `semanticResult` as its repair trigger and the
bound source evaluator revision as its source revision. Neither
`implementation` nor `evaluator-verify` becomes eligible from this event.

Every `evaluator-repair-recorded` result produced from this authority must bind
that exact authority semantic result, source evaluator revision, and a new
successor evaluator revision. A successfully recorded repair consumes the
authority. Allocated repairs that fail or are interrupted do not consume it and
may use only the ordinary bounded evaluator-repair retry policy. No second
successful repair can consume the same authority.

Apply these eligibility, retry, and consumption semantics to both authority
source variants. This does not change the evidence contract or accepted request
shape of the existing rejected-execution flow; it supplies the one-shot
consumer semantics that the existing authority concept requires.

This explicit human authorization is outside the exhausted automatic
post-implementation evaluator-correction allowance. It authorizes one bounded
repair without erasing or resetting the recorded automatic-correction count.
After its successful repair, no additional automatic correction is created.

## Admissible finalized source and staleness

The finalized variant accepts only canonical `BLOCKED` results whose recorded
classification does not already make evaluator repair eligible. It does not
accept `PASS`, `FAIL`, or `EVALUATOR_DEFECT`. This restriction is expressed in
terms of result and existing eligibility, not a special case for any other
classification.

A finalized source is current only when it is the latest canonical
`verification-finalized` event for the current implementation handoff,
candidate, evaluator revision, correction cycle, and verification lineage.
It is stale and must be refused if any later event in that current lineage:

- records a new implementation handoff or candidate;
- prepares or records a successor evaluator revision;
- allocates or finalizes a later verification attempt;
- opens or completes a successor correction cycle; or
- records or consumes evaluator-correction authority for the same verification
  lineage.

The implementation must derive currentness from canonical ledger order and
bindings, not caller assertions.

The explicit human diagnosis is the existing non-empty `reason` field. Harness
validates presence and binding, not the truth of the human's substantive
judgment.

The reusable rule is that explicit human authority may classify a bound
finalized verification as `EVALUATOR_COVERAGE_DEFECT` without altering its
original recorded classification. The new authority is layered over immutable
history; it is not a correction of history.

## Verification requirements

Add deterministic coverage for at least:

- finalized `BLOCKED` verification -> explicit human evaluator-coverage
  authorization -> one evaluator repair becomes eligible;
- original verification classification remains byte-for-byte and
  event-for-event unchanged;
- wrong candidate, evaluator revision, attempt/execution, or artifact identity
  is refused;
- stale or superseded verification is refused;
- duplicate human authorization is refused;
- successful repair consumes the authority;
- authority enables neither implementation nor evaluator verification;
- evaluator workspace/capability authority does not widen;
- the existing rejected-verification evaluator-correction flow remains
  unchanged.

## Current-lineage application after acceptance

After this generic authority has been independently verified, accepted, and
installed as an operator-owned runtime successor without changing the trusted
methodology identity, the Harness supervisor/root authority uses the existing
root-only endpoint to bind the canonical finalized
verification for workflow `014m-pre-semantic-implementation-correction`,
candidate `3e753a4a732c87fc5b42e9e3cf771482aba6a522`, evaluator revision `003`,
execution `84f7b735-63e3-46d2-ac12-88e115b26a7d`, result identity
`25db5182-6917-4c3b-b406-13fd6b22b7e9`, artifact identity
`sha256:1ebdbf39e87712efd3693687bf38a43643f50e196837f797edf4d7977f0f16c9`,
and its unchanged recorded `BLOCKED / INFRASTRUCTURE_FAILURE` classification.

The human diagnosis is that the observed blockage is an evaluator coverage and
evidence-design defect: evidence intentionally unavailable inside evaluator
isolation must instead be obtained through bounded host-owned evidence or
projection where appropriate, and lifecycle facts that exist only after
candidate verification or adoption must not be prerequisites for candidate
verification `PASS`. Evaluator isolation must not be weakened.

Record exactly one correction authority and establish `evaluator-repair`
eligibility. Acceptance evidence for this application is the recorded authority
identity plus resolver output showing `evaluator-repair` eligible from revision
`003`, with `implementation` and `evaluator-verify` ineligible and the workspace
and capability set unchanged. Stop there. Do not allocate the repair as part of
this spike; a later ordinary orchestration turn may do so only if the normal
governed resolver selects it.

## Non-goals

- Changing the 014l/014m candidate.
- Rewriting any existing verification result or classification.
- Performing the evaluator repair as part of this authority mechanism.
- Weakening evaluator isolation.
- Broad workflow-backend consolidation.
- Introducing a second human evaluator-repair authority model.
