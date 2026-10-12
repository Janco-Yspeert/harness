# As-Built — 014n Finalized Verification Evaluator-Correction Authority

Inspected implementation: `c448eaa26d1b4205d54212bbe61939bdf67357dc`.
Verification: attempt 004, evaluator revision 003, PASS; AC01–AC17 were
satisfied and AC18, the non-required post-acceptance operator step, was not
adjudicated. The host promotion record matches the bound identity
`sha256:ef2311a6d8e411481a57ddeb1e4678079bfde4c8457c5aa8b3a3985b02d83714`
and was committed unchanged in the separate promotion checkpoint
`c3be677d`.

## Implemented shape

- `ExecutionKernel.authorizeEvaluatorCorrection` now accepts a discriminated
  request union. Omitting `source` retains the existing rejected-execution
  request and authority shape; `source: "finalized-verification"` selects the
  added variant. The existing root-only `POST .../evaluator-corrections` host
  route parses both forms and rejects any other discriminator. No route,
  transition name, workspace, or capability was added.
- Finalized-source authorization runs inside the existing per-workflow ledger
  transaction. It requires a non-empty diagnosis and the requested
  `EVALUATOR_COVERAGE_DEFECT` classification, a numeric positive attempt,
  revision and identity formats, and a requested source result of `BLOCKED`.
  A canonical `BLOCKED / EVALUATOR_DEFECT` source is refused because it is
  already repair-eligible; other recorded classifications are treated
  generically rather than by a workflow- or classification-specific branch.
- The kernel resolves the exact `verification-finalized` event by id and
  compares its execution, role grant, source semantic result, candidate,
  evaluator revision, attempt, recorded result and classification, artifact
  commit, artifact path, and artifact identity with the request. It also
  requires one matching `verification-allocated` event, the current
  implementation handoff, and an available allocation identity. Missing,
  ambiguous, or mismatched bindings throw before an authority event is
  appended.
- The committed verification artifact is re-read with `git show` from the
  requested artifact commit. Its SHA-256 identity and its workflow (when
  present), execution, attempt, candidate, evaluator revision, result,
  classification, and allocation identity (when present) must agree with the
  canonical lineage. This read is validation-only; the source event and
  artifact bytes are not rewritten.
- Currentness is derived from ledger order. The source must belong to the
  current correction cycle, and a later implementation handoff, evaluator
  preparation or repair, verification allocation or finalization, correction
  cycle transition, or evaluator-correction authority makes it stale. An
  existing authority for the same execution and attempt is a duplicate and is
  refused without another event.
- Success appends one `human-evaluator-correction-authorized` event. Its
  finalized variant records the source discriminator, cycle, finalized-event
  id, candidate, role grant, source semantic result, source result and
  classification, source artifact provenance, evaluator revision, execution,
  attempt, and diagnosis. Its own `semanticResult` is content-derived from the
  new authority and remains distinct from the source verification semantic
  result.
- The existing methodology policy remains byte-unchanged. Its evaluator-repair
  predicate and role-input contract use the authority event to make one repair
  eligible, pass the authority semantic result as `repairTrigger`, and use the
  current frozen evaluator revision as `sourceEvaluatorRevision`. The
  implementation and evaluator-verify predicates remain false at this point;
  evaluator-repair retains its existing workspace, capabilities, protection,
  and bounded failed/interrupted retry policy.
- Resolver gate handling recognizes an unconsumed finalized-source authority
  only when it follows and names the latest finalized verification. In that
  state it suppresses the matching top-level `verification-finalized` policy
  gate while leaving other gates active, allowing the already-eligible repair
  role to be granted without changing the recorded verification
  classification. A later `evaluator-repair-recorded` event consumes this
  effect and the authority no longer makes repair eligible; failed or
  interrupted allocations do not append that transition and therefore do not
  consume it.
- Durable state consists solely of the append-only workflow ledger and the
  already committed source artifact. There is no added cache, database,
  background process, provider integration, network authority, or private-data
  exposure. Focused visible tests cover exact binding and refusal without
  mutation, immutable source history, eligibility and gate lifting,
  one-success consumption, duplicate refusal, stale sources, inadmissible
  results, and the unchanged rejected-execution variant; the promoted archive
  records independent verification of the exact candidate.

## Comparison to the frozen contract

**Missing**

None found.

**Contradictory**

None found.

**Extra**

None found.
