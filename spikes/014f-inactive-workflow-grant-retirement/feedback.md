# Brief Readiness Feedback — Spike 014f

Reviewed: `spikes/014f-inactive-workflow-grant-retirement/spike.md`
(`sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`).

## Verdict: Ready after minor clarification

The brief is one bounded, generic, host-owned lifecycle operation with a clear
question, scope, exclusions and acceptance criteria. The repository supports it:

- `src/kernel/execution.ts` already has an append-only
  `kernel.workflow-grant-revoked` event, a `#revocation` liveness lookup, an
  "active" notion (`allocated`/`running`) and a no-active-execution check in
  pre-implementation recovery.
- `src/kernel/host.ts` already gates grant operations with `needRoot()`.
- `src/kernel/model.ts` defines `WorkflowGrant` with `maxAllocations` and
  `maxAutomaticWork`.

Nothing found forces an unresolved contract onto a later role. The findings below
are non-blocking.

## Findings

### M1 — Material clarification: unresolved human request rule is deferred

Brief §1 leaves "unresolved human request or other canonical gate" to the Design
Map, though it prefers refusal. Retirement eligibility is externally observable.
Suggest stating in the brief that retirement is refused (fail-closed) while any
execution under the grant has an unresolved human request. The Design Map may
still enumerate other gates.

### M2 — Material clarification: repeat-retirement outcome is either/or

Brief §2 and AC05 allow either an "already retired" refusal or an idempotent
response. The existing analogue in `src/kernel/execution.ts` refuses
("workflow grant is already permanently revoked"). Suggest fixing the outcome as
a deterministic refusal with no new event, so the frozen evaluation can assert
one behavior.

### M3 — Material clarification: relationship to the existing revocation predicate

The brief requires a new explicit event, not a fake revocation. But the existing
liveness path (`#revocation`) returns a denial reason that says "pre-implementation
recovery" (around `src/kernel/execution.ts:664` and `:880`). Suggest requiring
that the shared liveness predicate cover both revoked and retired grants, and that
the denial reason for a retired grant identify retirement rather than recovery.
Retirement must not reuse the `recovery` field or claim recovery authority.

### M4 — Material clarification: "stale request" binding is unspecified

§2 asks for a binding that rejects the wrong workflow or grant and says to reuse
authority-basis protections "where practical". Suggest requiring only that the
request name the exact workflow and grant id and that an unknown grant or
cross-workflow id is refused. A stale-basis check is optional and the Design Map
may decide it.

### E1 — Editorial

The Handoff and §6 restate operational use twice. Also "Execution and authority
sequence" step 9 could point to §6 rather than repeat it. No action required.

## Limitations

- Only the public brief and public repository code were read. Evaluator-private
  material was not inspected.
- No tests were run. The code inspection was selective (kernel grant, host and
  model paths).

## Files changed

- `spikes/014f-inactive-workflow-grant-retirement/feedback.md` (new)
- `spikes/014f-inactive-workflow-grant-retirement/manifest.md` (new)
