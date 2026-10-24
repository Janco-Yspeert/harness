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

## Cycle 002 correction — host promotion and human decisions

### Authority and scope

This correction is bound to human Role Grant
`sha256:c5cd2124a08ea7b98c5afd953664685b667cb1fb0eab95d8b6a19ea4a2e21862`
and the committed cycle-002 authority classified
`IMPLEMENTATION_AND_EVALUATOR_DEFECT`. It addresses only the recorded AC16,
AC17, and AC19 implementation gaps: host-mediated evaluator promotion,
promotion denial/failure distinct from semantic PASS, and configured canonical
human acceptance/rejection.

The frozen brief, Design Map, public evaluation requirements, and repaired
coverage retain their exact bound identities. Attempt 005's canonical PASS and
all prior workflow evidence remain unchanged.

### Correction

- Role contracts may declare a bounded promotion action. The resolved Role
  Grant pins the source and destination workspaces, destination scope,
  candidate, evaluator revision, required semantic result, verification
  allocation/attempt binding, and resulting canonical transition.
- The governed host accepts an exact artifact manifest from the owning
  execution, validates source identities, stages byte-preserving copies, writes
  `promotion.json`, atomically installs the new promotion directory, records
  the action result, and records `promotion-recorded` only after success.
  Denied and failed actions remain durable `kernel.action-result` facts and do
  not modify the accepted semantic Role Result.
- The active evaluator-verification contract authorizes that narrow promotion
  into the spike-local `evaluation` destination. It grants no remote,
  credential, ref, or publication capability to the evaluator.
- Workflow policy may declare root-only human decisions with predicates and
  exact event/scope bindings. The active Harness policy configures acceptance
  and rejection to bind the current cycle, implementation candidate,
  verification result, promotion, and As-Built evidence. Rejection additionally
  requires a non-empty classification and findings list.

Both mechanisms are generic and configured. The kernel does not branch on
Harness role names, evaluator classifications, or phase names, and the legacy
workflow/local-state surface is not consulted.

### Visible regression evidence

The live HTTP regressions cover both positive and negative host boundaries:

- wrong evaluator revision is denied before filesystem mutation;
- a mismatched source identity records a failed action, leaves semantic PASS
  unchanged, and records no promotion transition;
- an exact request copies the bounded source, creates `promotion.json`, records
  integrity identities, and emits the configured promotion transition;
- human acceptance is rejected before As-Built and with mismatched candidate
  evidence, then accepted with the exact configured evidence;
- human rejection is rejected without non-empty findings, then records the
  exact classification/findings and canonical evidence; and
- a legacy-looking `.workflow` acceptance flag has no authority.

The focused tests first failed against the prior host, then passed after the
correction. `npm run check` passes typecheck, lint, formatting, and the complete
visible suite (120 passing, 0 failing).

### Boundaries

No evaluator-private material was inspected. Evaluator preparation or
verification was not run, acceptance semantics and historical classifications
were not changed, and no workflow ledger event, publication, push, fetch, or
external credential operation was performed. Promotion is deliberately a
one-shot atomic installation into a previously absent configured destination;
it does not overwrite an existing public archive.
