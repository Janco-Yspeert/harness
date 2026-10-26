# Design Map — 014f Inactive Workflow Grant Retirement

Authoritative input: `spike.md` `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`.
Brief Readiness findings M1–M4 were not folded into the brief; the Design Map
settles them below only where the brief explicitly delegates or leaves the
choice within its stated boundary.

## Shared contracts

1. **Lifecycle event.** Retirement is one new append-only workflow ledger event,
   transition `kernel.workflow-grant-retired`, evidence
   `{ workflowGrant: <exact grant id>, origin: "human", reason: <non-empty string> }`.
   It is not a `kernel.workflow-grant-revoked` event, carries no `recovery`
   field, and never creates an execution, allocation, session, or successor
   grant. The original `kernel.workflow-grant` event is never modified.
2. **Kernel operation.** `ExecutionKernel.retireWorkflowGrant(workflow, { workflowGrant, reason })`
   runs inside the existing per-workflow transaction, and returns the recorded
   event evidence. It is the only writer of the event.
3. **Host operation.** `POST /governed/<workflow>/grant-retirements` with JSON
   `{ "workflowGrant": "<id>", "reason": "<text>" }`, guarded by the existing
   `needRoot()` (root bearer token) exactly like other grant operations. Success
   is HTTP 201 with the evidence. A refusal uses the existing 409 error
   envelope `{ error }`. `GET` on the same operation (root only) lists retirement
   evidence for the workflow. Session/executor tokens and worker results cannot
   reach it; no role contract or skill changes.
4. **Binding.** The request names the workflow (path) and exact grant id. An
   unknown grant id, or an id belonging to another workflow, is refused
   (`unknown workflow grant`) with no event. No stale-basis check is required
   or added.
5. **Eligibility (all fail-closed, refusal appends nothing):**
   - grant exists in the workflow;
   - grant is not already retired (repeat retirement is a **refusal** with
     message containing "already retired", no second event; not idempotent
     success);
   - grant is not already revoked (message: already permanently revoked);
   - no execution under the grant is active, using the existing definition
     `process ∈ {allocated, running}` (same as pre-implementation recovery);
   - no execution under the grant has an unresolved human request (a
     `kernel.human-request` whose response is null), even when that execution
     is terminal. Resolve or answer it first.
6. **Shared liveness predicate.** The existing `#revocation` lookup is
   generalised to one "grant permanently non-executable" check that recognises
   both revoked and retired grants and yields a reason. Every path that already
   consults `#revocation` (`inspect`, and `allocate`) uses it; there are no
   retirement-specific checks elsewhere. The denial reason for a retired grant
   states that the grant is permanently *retired* and must not mention
   pre-implementation recovery; the revoked reason is unchanged. Because
   manual/automatic continuation, retry and replacement all pass through
   `inspect`/`allocate`, they are refused before any session, process or
   allocation is created. Automatic continuation may record the existing
   `kernel.continuation-stopped` event with that reason.
7. **Ledger-mechanics classification.** `kernel.workflow-grant-retired` joins the
   resolver's `MECHANICS` set: it does not move the authority basis nor count as
   a methodology fact.

## Design decisions

- Retirement is derived state from the ledger, so restart resilience follows from
  replay; no separate persistence or cache.
- Retirement does not affect other grants in the workflow. A successor grant is
  issued through the ordinary grant path (no `supersedes`), starts with its own
  budget, and inherits nothing.
- Allocation accounting (`maxAllocations`, `maxAutomaticWork`) counts existing
  allocations only; retirement adds none, so counts before and after are equal.

## Invariants

- Retirement appends exactly one event on success and zero on any refusal.
- All prior events, executions, semantic results, actions, diagnostics,
  transitions, and the original grant remain byte-identical and readable.
- Once retired, a grant is never executable again through any path or after
  restart; retirement is irreversible.
- Retirement never implies workflow completion or human acceptance.
- Active work must be stopped by existing mechanisms before retirement; retirement
  never cancels or interrupts anything.
- Existing revocation, supersession, recovery, correction and limit semantics
  are unchanged.

## Implementation freedom

- Internal shape of the generalised predicate, helper names, and how the
  unresolved-request scan is computed from existing ledger/execution state.
- Exact wording of refusal messages beyond the required "retired"/"already
  retired" markers and absence of the recovery wording.
- Whether the `GET` listing derives from ledger events or a kernel accessor.
- Test file organisation, provided tests go through the host/kernel authority
  path and never edit the ledger directly.
