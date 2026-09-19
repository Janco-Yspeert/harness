# Design Map — Spike 013a Workflow Execution Friction

## Shared contracts

- A real host-owned workflow-run allocation resolves one immutable **execution
  binding** before provider launch. The binding associates the host run identity
  with the workflow/spike, methodology phase and attempt or correction cycle,
  role, selected executor, resolved repository contract authority, and contract
  delivery/invocation mode. For protected roles it also records the
  canonical-authority validation that permitted this exact allocation. A caller
  cannot create this binding by supplying those fields or by prompt text.
- The host retains the resolved binding with its run record and exposes it
  through the normal run/workflow inspection surface. Dispatch returns the run
  identity, role, and executor; inspection/follow exposes that binding, process
  state, semantic role disposition, and available output/follow reference.
- A role result is a host-validated, run-bound fact separate from provider
  process state. It is accepted only when it agrees with that allocation's role,
  methodology attempt/cycle, and resolved contract authority. Only its
  successful disposition can satisfy a governed workflow prerequisite; an
  exited process without a valid successful result remains non-successful.
- The workflow runner treats canonical `workflow.jsonl` authority as the source
  for completed methodology checkpoints. It records adoption/resumption as an
  operational fact distinct from dispatch and completion, then derives the next
  eligible phase from that authority. It never reconstructs missing historical
  dispatches or outcomes. Normal runner status makes the adoption fact
  inspectable without requiring callers to parse `.workflow` files.
- Preview/planning is read-only. A real allocation begins operational execution
  history only once the host has committed a run. A terminal non-successful role
  disposition preserves its execution attempt but does not consume the still
  pending methodology phase; a later eligible allocation receives a new
  execution-attempt identity.

## Design decisions

- Protected delegated execution uses the host-owned execution binding as the
  validation boundary. The selected provider adapter receives only the resolved
  role contract and the allocation-bound delegation material needed to invoke
  it; it cannot mint, broaden, or substitute that authority. Explicit human
  evaluator invocation remains a separate authorization route.
- Contract delivery is adapter-specific, but both Codex and Claude allocations
  must resolve the same repository-owned contract authority before adapter
  choice. The binding records whether that authority was delivered through a
  native mechanism, host-supplied frozen content, repository loading, or an
  equivalent supported mode. Provider declarations are diagnostic evidence,
  never the authority record.
- The two required live-provider scenarios use bounded, repository-owned
  workflow fixtures. The Claude fixture exercises a canonically permitted
  protected evaluator role against the pinned evaluator authority, with only
  its evaluator workspace/access and the fixture's declared allowed side
  effects; expected result is a host-validated successful evaluator-role
  disposition. The Codex fixture exercises a canonically permitted governed
  role against an exact repository-owned contract, limited to its declared
  fixture workspace and side effects; expected result is a host-validated
  successful role disposition. Each fixture declares its authority prerequisite,
  workspace/access boundary, permitted effects, and cleanup/isolation before
  evaluator preparation. Neither fixture advances Spike 011 authority.
- Spike 013a's bootstrap allocations use the same execution-binding and result
  rules. Their binding explicitly identifies the frozen upstream canonical
  authority and bootstrap-exception use; this is a recorded bridge to runner
  adoption, not ordinary runner history or a standing bypass.

## Invariants

- A role, executor, process exit, request payload, or provider prose alone
  never grants evaluator authority or completes a methodology role.
- Provider-specific delivery may differ, but equivalent valid allocations have
  equivalent authority, contract-identity, and semantic-result requirements.
- Methodology attempt identity, execution-attempt identity, provider/process
  lifecycle, and semantic role disposition remain independently observable.
- Canonical authority and genuine run history are append-only. Adoption and
  retry add facts; they do not rewrite either history.
- Required live Claude, Codex, and host-boundary evidence remains mandatory;
  provider unavailability is a blocked result, not a mock-backed pass.

## Implementation freedom

- The execution-binding and delegation representation, storage, capability
  lifetime, validation transport, result schema/disposition vocabulary, and
  adapter entry-point layout are free.
- The precise status/inspect/follow command syntax, operational adoption-record
  schema, retry/concurrency mechanism, fixture implementation, and cleanup
  machinery are free provided they preserve the shared observable contracts.
