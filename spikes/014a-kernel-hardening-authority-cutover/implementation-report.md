# Spike 014a Implementation Correction Report

## Authority and scope

This is the explicitly human-authorized implementation-only correction after
attempt 004's semantic PASS was rejected before `verification-finalized`. The
human root decision supplies the bounded retry authority because no canonical
`IMPLEMENTATION_FAILURE` event exists for that rejection.

The correction preserves the prior AC11 fix, evaluator revision `003`, all
earlier attempts and revisions, and existing workflow evidence. It does not
change the configured evaluator contract, policy outcomes, acceptance
semantics, or workflow authority.

## Correction

The generic result-constraint checker previously negated an optional-chained
`required.every(...)` result. When a matching constraint omitted `required`,
the expression negated `undefined` and rejected the result. This made the
configured absent-only PASS constraint reject a valid PASS without a
classification.

The checker now defaults `required` and `absent` independently to empty arrays.
An omitted array therefore imposes no check of its kind, while a present array
retains the existing required-field or absent-field behavior. No role names,
result values, or evaluator classifications were added to the kernel.

## Visible regression evidence

The visible kernel regression uses real Role Grant allocation, governed
semantic-result submission, and configured canonical transition handling for
the evaluator-shaped constraints. It proves:

- PASS without classification is accepted and records the configured canonical
  transition;
- PASS with classification is rejected before semantic-result acceptance;
- FAIL and BLOCKED without classification are rejected before semantic-result
  acceptance; and
- classified FAIL and BLOCKED results are accepted and record the configured
  canonical transition.

The focused regression failed against the prior checker on valid PASS, then
passed after the generic correction. `test/kernel.test.ts` passes 23 tests. The
full `npm run check` passes typecheck, lint, formatting, and 115 tests.

## Boundaries

No evaluator-private material was inspected. Evaluator preparation and
verification were not rerun, and no evaluator revision, public evaluation
requirement, historical result, workflow authority, host action, publication,
push, or fetch was changed or performed.
