# As-Built — 014n Finalized Verification Evaluator-Correction Authority

Inspected implementation: `6fa5ed9fc62077dbe4be144c6f8ec5e026cc6d67`.
Verification: attempt 010, evaluator revision 005, PASS; AC01–AC17 were
satisfied and AC18, the non-required post-acceptance operator step, was not
adjudicated. The host promotion record matches the bound identity
`sha256:890a238fee31aa9982e257c655cd61e8024ea6274149e9a9dfc518d362e412ac`,
all 30 artifacts named by it are present with their recorded identities, and
the record was committed unchanged in the separate promotion checkpoint
`df2ad66b`.

## Implemented shape

- `ExecutionKernel.authorizeEvaluatorCorrection` accepts a discriminated
  request union. Omitting `source` retains the rejected-execution request and
  authority shape; `source: "finalized-verification"` selects the added
  variant. The existing root-only `POST .../evaluator-corrections` route parses
  both forms and rejects other discriminator values. No route or transition
  name was added.
- Finalized-source authorization runs inside the existing per-workflow ledger
  transaction. It requires a non-blank diagnosis, requested classification
  `EVALUATOR_COVERAGE_DEFECT`, a positive numeric attempt, valid revision and
  identity formats, and requested result `BLOCKED`. A canonical
  `BLOCKED / EVALUATOR_DEFECT` source is refused because it is already
  repair-eligible; other recorded classifications are handled generically.
- The kernel resolves the exact `verification-finalized` event by id and
  compares its execution, role grant, semantic result, candidate, evaluator
  revision, attempt, result, recorded classification, artifact commit, path,
  and identity with the request. It also requires exactly one matching
  `verification-allocated` event, the matching current implementation handoff,
  and an available allocation identity. Missing, ambiguous, or mismatched
  bindings fail before an authority event is appended.
- The committed verification artifact is re-read with `git show` from the
  requested artifact commit and must have the requested SHA-256 identity. Its
  candidate, evaluator revision, attempt, result, and classification must
  match; workflow, execution, and allocation identity must also match when
  those fields are present. Execution may therefore be absent from the
  artifact, while a present mismatch is refused. The canonical finalized and
  allocation events retain the mandatory execution and other lineage bindings.
- Currentness is derived from ledger order. The source must belong to the
  current correction cycle. A later implementation handoff, evaluator
  preparation or repair, verification allocation or finalization, correction
  cycle transition, or evaluator-correction authority makes it stale. An
  authority already recorded for the same execution and attempt is treated as
  the same verification lineage and refused as a duplicate.
- Success appends one `human-evaluator-correction-authorized` event. The
  finalized variant records the discriminator, cycle, finalized-event id,
  candidate, role grant, source semantic result, result and classification,
  artifact provenance, evaluator revision, execution, attempt, and diagnosis.
  Its own `semanticResult` is content-derived from the authority and distinct
  from the source verification semantic result. The source verification event,
  its classification, and its artifact remain unchanged.
- The existing methodology policy and role contracts remain byte-unchanged.
  Their evaluator-repair predicate makes the repair role eligible from the
  authority. Role-input projection supplies the authority semantic result as
  `repairTrigger`, takes `sourceEvaluatorRevision` from the authority when the
  field is present, and exposes the full authority as typed input evidence so
  the worker receives the diagnosis and bound source identities. Older legacy
  records lacking that newer source-revision field retain the revision resolved
  by the existing public contract.
- Resolver gate handling recognizes a finalized-source authority only when it
  follows and names the latest finalized verification. It suppresses only the
  top-level `verification-finalized` gate whose classification exactly matches
  the authority's recorded source classification; unrelated gates stay active.
  The suppression holds while no repair is recorded and after exactly one
  repair whose recorded inputs bind both the authority semantic result and its
  source evaluator revision. This permits the existing repair role first and
  the ordinary post-repair verification successor afterward without changing
  the original classification. An unbound repair does not discharge the gate.
- A successful `evaluator-repair-recorded` transition consumes repair
  eligibility under the existing policy. Failed or interrupted allocations do
  not append that transition and retain the ordinary bounded retry behavior.
  Implementation and evaluator verification are not made eligible directly by
  the authority, and no second successful repair can consume it.
- The omitted-source legacy flow continues to emit its original authority
  field set and content-derived identity. It shares duplicate detection and
  one-success consumption behavior with the finalized variant without gaining
  a `source` field.
- Durable state is limited to the append-only workflow ledger and the already
  committed source artifact. The change adds no cache, database, background
  process, provider integration, network authority, workspace, capability, or
  private-data exposure. Candidate changes are confined to kernel execution,
  host request parsing, model types, resolver behavior, and focused kernel
  tests.

## Comparison to the frozen contract

**Missing**

None found.

**Contradictory**

None found.

**Extra**

None found.
