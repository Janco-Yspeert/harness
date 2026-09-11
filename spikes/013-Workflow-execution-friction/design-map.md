# Design Map — Spike 013

## Shared contracts

### Host-issued delegated evaluator capability

An evaluator-role allocation creates an opaque, unguessable capability bound by
the Harness host to that exact run ID, workflow slot, role, and executor. The
host passes the capability to the allocated worker through execution context
that is not part of the natural-language prompt. A validation operation owned
by the host must reject an absent, unknown, mismatched, expired, or replayed
capability.

The Claude evaluator allocation invokes a repository-owned delegated evaluator
entry point. That entry point may be model-invocable, but it must first validate
the host capability and role binding before carrying out evaluator work. The
ordinary `evaluator` skill retains its direct-human-invocation guard; direct
human invocation remains a separate valid route. A prompt that imitates a
delegated allocation, without the host-provided capability, is not authority.

### Role outcome is host state, not an exit-code inference

Each workflow-run record has independent provider/process state and
methodology-role disposition. An evaluator role becomes successful only after
the host receives an authenticated, run-bound successful role outcome. A normal
provider exit without such an outcome must be represented as a non-successful
role disposition and must not advance workflow authority.

The host exposes the role disposition with the existing run identity,
alongside process state, executor, role, and log location. The exact labels and
internal storage layout are implementation freedom, provided they distinguish
successful completion from refusal/blocking and from process failure.

### Operator-safe dispatch lifecycle

Dispatch preview is read-only: it performs no allocation and consumes no
operational execution attempt. An actual dispatch either returns the allocated
run's identity and immediately useful inspection location, or reports a
pre-execution failure without leaving a non-retryable allocation. Replacement
or retry preserves real attempted executions and their terminal facts.

Authority status reports structurally legal transitions independently of
whether each presently lacks required evidence. It must expose an
evidence-bearing `correction-cycle-opened` transition in the preserved
Spike-011-shaped recovery state.

### Bootstrap evaluator authority

For Spike 013 evaluator prepare and verify, the host resolves a committed,
immutable evaluator snapshot recorded under this spike and validates its
identity against its declared source commit. The host, not the dispatch helper
or candidate working tree, binds that snapshot into the evaluator allocation.
The evaluator skill and delegation semantics in the working tree are candidate
implementation and cannot replace this authority.

## Invariants

- No ordinary role gains evaluator authority by prompt text, role name, or
  self-declaration.
- Delegation binds only the allocated evaluator role; it is not a general
  executor privilege.
- Process success is evidence only of process health, never sufficient proof of
  methodology completion.
- Run inspection remains available by host-owned identity after the initiating
  client disconnects.
- Genuine execution history and frozen Spike 011 authority are append-only;
  this spike does not advance Spike 011.
- At least one acceptance path exercises both the real Harness host boundary
  and the real Claude executor; provider-free tests support but do not replace
  that evidence.

## Implementation freedom

The capability's representation, transport, lifetime mechanics, validation
endpoint/command shape, delegated entry-point file layout, disposition
vocabulary, status rendering, and test fixtures are open. No persistence across
host restart, browser UI, generic agent protocol, or broad protected-skill
framework is required.
