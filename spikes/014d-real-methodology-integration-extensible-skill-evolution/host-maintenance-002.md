# Host maintenance 002 — pre-implementation recovery scope

**Authority:** explicit human recovery authorization, 2026-09-25

This is a generic, host-level maintenance change. It is not a Harness role,
does not alter trusted methodology N, and does not rewrite prior evidence.

`kernel.preimplementation-recovery` records one human-authorized recovery
authority, the exact invalidated `design-map-frozen` and
`evaluation-prepared` events, and the latter's dependency on the former. The
host then permanently revokes the old Workflow Grant and appends a successor
grant under the same trusted methodology.

Resolver predicates and role-input lookup evaluate a recovery-scoped event
view: only the exact invalidated frozen events are withheld. The frozen brief,
canonical human response, old artifacts, private evaluator material, attempt
history and diagnostics remain durable and readable historical facts. A
recovery is unavailable once an implementation handoff or verification result
exists, and it never revives an active execution.

Deterministic regression coverage drives the relevant sequence through the
root host endpoint: late canonical answer, prematurely frozen Design Map,
dependent prepared evaluator revision, stale grant denial, new Design Map
resolution and restart persistence.
