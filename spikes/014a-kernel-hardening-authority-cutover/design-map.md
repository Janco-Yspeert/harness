# Design Map — Spike 014a Kernel Hardening: Authority Cutover

## Shared contracts

- The Authority Ledger and pinned Methodology Definition remain the only forward
  methodology authority. A role-derived canonical transition is accepted only
  when the configured authority path binds its exact governed execution, Role
  Grant, validated semantic result, and required artifact/result identities.
  Artifact content, Git provenance, provider prose, legacy state, and process
  exit are not substitutes for that binding.
- Workflow Execution Grant (WEG) authority is finite and scoped to that grant.
  The configured operational retry allowance and the semantic automatic-work
  budget are distinct counters; a fresh human WEG starts both afresh. Exhausted
  semantic authority produces a durable human gate/stop, never implicit renewed
  authority.
- An allocation is idempotent only for the same resolved Role Grant/allocation
  semantics. While a workflow has a non-terminal governed execution, another
  Role Grant or WEG cannot be reported as that execution's duplicate and cannot
  start without the explicit supersession path.
- Supersession is a durable authority transition: it identifies the exact old
  grant/execution, records new authority, immediately prevents the old
  execution's semantic results and host actions from being accepted, then
  terminates or reconciles its provider lifecycle before new non-equivalent
  governed work begins. Historical facts remain immutable.
- Supervisor identity is separate from governed-worker identity. An attached
  supervisor becomes a worker only by adopting an eligible Role Grant under
  explicit inline authority or a mechanically satisfied configured fallback;
  the adoption occupies the workflow's sole governed-execution lease and uses
  ordinary grant, result, action, and exposure rules.
- Spawned execution completion requires the supported semantic-result handshake.
  Clean process exit without a valid result yields a durable, classified
  missing-result failure/attention fact that configured retry, replacement, or
  human-gate policy can consume; process lifecycle remains a separate fact.
- Privileged promotion is a configured, narrowly authorized host action. The
  evaluator supplies semantic PASS evidence and a bounded request; the host
  validates and records the exact source, action, destination, result, and
  resulting integrity identities. Action failure never rewrites semantic PASS.

## Design decisions

- Keep role-specific behavior in the pinned methodology: the evaluator result
  vocabulary, cross-field validity constraints, complete valid-result routing,
  and role-skill/contract fidelity validation are configured or repository
  methodology responsibilities. The generic kernel provides generic validation,
  policy interpretation, grant resolution, and host-action seams only.
- Treat the one-active-execution rule as a workflow-scoped governed-authority
  lease, independent of supervisor contexts and provider process count. The
  durable allocation/lifecycle record is the shared inspection seam for active
  work, conflict/gate evidence, and supersession reconciliation.
- The host owns durable continuation failure/stop/attention facts, supersession
  invalidation, execution-bound transition validation, and host-action results.
  Automatic continuation must report a failure through that durable surface;
  caller connection state cannot determine it.
- The policy predicate language has explicit semantics: `A after B` is false
  when no matching `B` exists. Missing-anchor behavior requiring another meaning
  must be expressed in policy rather than leaking from storage lookup behavior.
- Legacy workflow machinery is a historical reader/projection boundary only for
  post-cutover workflows. Its forward mutation/dispatch/decision surfaces must
  be mechanically unavailable; new human acceptance or rejection uses the
  configured canonical authority path.
- Executor records distinguish requested constraints from host-enforced and
  runtime-confirmed configuration. An exact required model/effort that cannot
  be enforced or attested blocks allocation; parent supervisor identity cannot
  attest a child executor.

## Invariants

- No generic-kernel branch encodes Harness role names, evaluator classifications,
  skill filenames, or workflow phases. The established 014 resolver, immutable
  grants, monotonic exposure provenance, and separate process/result/action
  facts remain intact.
- Every accepted verification result satisfies its pinned role contract: PASS
  has no classification; every non-PASS has one valid classification; and every
  valid result reaches an explicit configured transition, stop, or gate.
- A late request from superseded authority is rejected even if the old provider
  remains alive. A new WEG alone does not terminate old authority.
- Role contracts remain materially faithful to their bound skills' required
  inputs, outputs, capabilities, exposure, human interaction, and host actions;
  validation proves this without teaching the generic kernel Harness-specific
  skill semantics.
- Real host/process/filesystem evidence covers supersession, inline adoption,
  execution-bound role transition, promotion, spawned result delivery, and
  Brief Readiness artifact/grant compatibility. Deterministic unit tests may
  cover the associated policy, budget, predicate, and result mechanics.

## Implementation freedom

- The representation and accounting granularity of semantic budgets,
  supersession/lifecycle facts, continuation failures, semantic-result handshake,
  inline permission/fallback, runtime-attestation metadata, and transition
  provenance are free if the shared contracts hold.
- The host-action registry, promotion schemas, validation implementation,
  API/transport, session representation, adapter protocol, lock mechanism, and
  retained read-only legacy interface are free. No general scheduler, worker
  pool, distributed locking, provider resurrection, or new provider adapter is
  implied.
