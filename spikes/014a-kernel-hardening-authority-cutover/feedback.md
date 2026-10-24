# Brief Readiness — Spike 014a: Kernel Hardening

## Scope reviewed

Reviewed `spikes/014a-kernel-hardening-authority-cutover/spike.md` at
`sha256:56a125810cf34896658cfff975f9b0b1626244fc51b33b8b13d6d9cb73d01910`.
This is correctly scoped as a corrective successor to the human-rejected Spike
014, not a retroactive reclassification of its genuine evaluator PASS.

## Repository evidence

- `spikes/014-kernel-consolidation-authority-role-grants/acceptance.md`
  identifies the three inherited implementation gaps and the evaluator-coverage
  defect which Part I addresses. The brief preserves the predecessor's PASS,
  promotion, As-Built, and rejection as immutable history.
- `methodologies/harness/contracts/evaluator-verify.json` currently omits the
  active evaluator's `SPECIFICATION_AMBIGUITY` and `SPECIFICATION_DRIFT`
  classifications and does not express the required result cross-field rules.
  `methodologies/harness/policy.json` currently has outcomes that only select
  on `result`. The brief makes both the representation and total routing of
  valid verification results explicit requirements without dictating a
  Harness-specific kernel conditional.
- `src/kernel/execution.ts` currently accepts any independently valid
  methodology fields and may leave an accepted result without a matching policy
  outcome. `src/kernel/host.ts` currently starts automatic continuation through
  a fire-and-forget request that ignores non-success HTTP responses. These are
  concrete, feasible correction targets covered by the brief's observable
  requirements.
- `src/kernel/ledger.ts` currently gives `after` an accidental missing-anchor
  truth value through `findLastIndex(...) === -1`. The brief states the intended
  language semantics and requires visible regression coverage.
- `tools/legacy-workflow.ts` remains a forward-mutating workflow surface. The
  brief is precise that post-cutover legacy support is historical/read-only and
  requires mechanical removal or rejection of forward mutation, while retaining
  compatibility reading as implementation freedom.
- `skills/orchestrator/SKILL.md` distinguishes workflow authorization from role
  authority. The brief supplies the remaining externally significant boundary:
  a supervisor cannot turn skill discovery or convenience into inline worker
  authority.
- The current repaired bootstrap allocation recorded in
  `spikes/014a-kernel-hardening-authority-cutover/workflow.jsonl` pins this
  skill and a Brief Readiness contract with `repository-write` plus
  `feedback.md`, consistent with the active skill. This is bootstrap evidence,
  not evidence that the proposed successor mechanisms already exist.

## Findings

No blockers or material clarifications.

The brief separates inherited defects from new successor scope, states the
observable authority/lifecycle/failure invariants needed for fair independent
evaluation, and leaves schema and internal-mechanism choices to the Design Map
or implementation where they do not change that behavior. In particular, the
single-execution lease, non-equivalent allocation conflict, ordered
supersession, bounded semantic work, governed transition provenance, promotion
boundary, legacy cutover, and spawned semantic-result handshake are sufficiently
specified to prevent divergent but superficially plausible implementations.

The bootstrap/self-hosting section is unusually detailed, but materially so: it
prevents pre-cutover legacy facts and a stale checkout from being misrepresented
as governed successor proof. Its bounded repair and replacement-freeze sequence
does not require the brief to decide a new product behavior.

## Review limitations

This was a readiness review only. It did not inspect evaluator-private material,
create a Design Map, prepare evaluation, implement the spike, or execute the
test suite. Repository inspection was limited to public contracts, visible
source/tests, public workflow evidence, and predecessor acceptance evidence
needed to assess feasibility and contract fidelity.

## Files changed

- `spikes/014a-kernel-hardening-authority-cutover/feedback.md`

## Checks run

- Complete read of the live brief and relevant public predecessor acceptance
  evidence.
- Public contract and source inspection for evaluator-result validation,
  continuation, predicate semantics, legacy mutation, role-contract fidelity,
  and orchestration authority boundaries.
- Confirmed the reviewed brief identity matches the allocated Brief Readiness
  input identity.

Ready to freeze
