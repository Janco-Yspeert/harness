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
`human-evaluator-correction-authorized` path rather than adding a parallel
human evaluator-repair mechanism, if it can be extended safely.

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

After this generic authority has been independently verified and made available
to the trusted runtime, use it to bind the existing canonical finalized
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
eligibility. Stop there unless the normal governed resolver selects the repair.

## Non-goals

- Changing the 014l/014m candidate.
- Rewriting any existing verification result or classification.
- Performing the evaluator repair as part of this authority mechanism.
- Weakening evaluator isolation.
- Broad workflow-backend consolidation.
- Introducing a second human evaluator-repair authority model.
