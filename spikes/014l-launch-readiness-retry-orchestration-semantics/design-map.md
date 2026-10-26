# Design Map — 014l Launch, Readiness, Retry, and Orchestration Semantics

Frozen brief: `spike.md` (`sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`), verified against the host-bound identity and the bytes committed at `a9c69e27`.

## Shared contracts

1. **One canonical orchestration projection.** The existing root-only `GET /governed/:workflow/resolve/:workflowGrant` response remains the observation surface. Its existing resolution (`grant`, `gate`, `stop`, or `denied`) is preserved and augmented with one canonical orchestration-status object derived from the authority ledger and host operational records. That object carries the minimum status facts required by AC22; callers do not join a second endpoint or mutable status store to understand launch, readiness, allocation, retry, progress, or gate state.

2. **Durable operational attempt record.** Each spawned pre-semantic try is one `kernel.launch-attempt` record. An attached compatibility check uses the same record shape with mode `attached`, compatibility rather than probe state, and no automatic-retry allowance. The record has its own identity and binds the brief's normative operational-attempt fields, the canonical launch-intent identity, launch/attachment-shape identity, ordinal within that intent, readiness/compatibility state, normalized outcome/failure class, and any consumed single-use readiness identity. It never contains a semantic execution or Role Grant binding. The status projection and retry accounting are reconstructed from these records; raw provider diagnostics remain separate observational evidence.

3. **Canonical shapes and identities are host values.** The host derives immutable canonical launch or attachment shapes from the resolved proposed Role Grant, workflow authority, executor profile, host containment/runtime configuration, and execution mode. The launch-intent and semantic-progress identities are SHA-256 identities of canonical JSON objects containing exactly the included and ignored fields specified by the brief. Object keys and set-valued fields are normalized deterministically. The same canonical values are used for adapter input, compatibility validation, durable records, retry decisions, no-progress decisions, and the `resolve` projection; no consumer independently reconstructs them.

4. **Provider boundary.** A registered `ProviderAdapter` receives a host-derived spawned launch shape and may only translate it to provider-native invocation plus report effective capability/readiness facts. It cannot select authority, workspaces, exposure, role material, or retry policy. Readiness uses a distinct probe invocation and result path that is injectable for deterministic tests. The semantic `GovernedProviderRun` path is not entered and worker context/assignment delivery is not constructed until readiness has passed and `kernel.allocation` exists.

5. **Allocation, exposure, and delivery ownership.** The host owns pre-semantic shape derivation, readiness/compatibility, operational records, and session selection/registration. The kernel owns the atomic semantic commit: append `kernel.allocation`, then append the role's `onAllocate` transition/counter projection from committed allocation history. The governed delivery path then records every required `kernel.exposure` before making the corresponding non-public workspace or role material available. Session registration may precede allocation but grants no governed workspace or assignment access. These are ordered durable boundaries, not comments or timing assumptions.

6. **Attached compatibility uses the same host contract.** An attached request supplies the existing session identifier to `resolve`/`continue`; the host derives the canonical attachment shape and checks it against canonical `Session` provenance before allocation. It neither invokes a provider probe nor mutates the session to manufacture compatibility. Failure is projected and durably classified as an operational refusal with no `kernel.allocation`; choosing another session produces a different launch intent.

7. **Bounded human retry surface.** Human retry is a root-only host operation at `POST /governed/:workflow/retries`. Its closed request is `{ workflowGrant, kind, exhausted, count? }`, where `kind` is `operational` or `semantic`, `exhausted` is the exact host-projected exhausted budget/state identity, and omitted `count` means one. The host resolves all role, candidate/input, evaluator, exposure, workspace, launch/attachment-shape, and authority bindings from that exhausted state; the caller cannot replace them in this request. Success appends one durable `kernel.retry-authority` record with a positive finite count. Drift, a non-exhausted identity, unknown fields, or any scope expansion is refused. The authority permits only the recorded number of additional retries and is reflected by `resolve`.

8. **Semantic continuation comparison point.** After each terminal semantic resolution, the host records the canonical semantic-progress identity used to decide the next automatic continuation. Immediately before another automatic semantic allocation it compares the current identity with the preceding automatic-resolution identity. Equality records a `kernel.continuation-stopped` gate with normalized reason `repeated-no-progress` and performs no launch or allocation. Operational launch attempts never create or advance this comparison point.

## Design decisions

- Existing `RoleGrant`, `ExecutorProfile`, `Session`, `ProviderAdapter`, `ExecutionKernel`, `GovernedHost`, and registered-adapter containment remain the authoritative ownership chain. 014l extends those boundaries rather than adding an orchestration service, provider command path, or parallel authority model.
- Proposed Role Grant semantics are resolved without persisting a semantic grant. The exact Role Grant is durably bound only inside `kernel.allocation`; pre-allocation records bind canonical shape/intent identities instead.
- A readiness PASS is represented by an identity-bearing terminal state of its `kernel.launch-attempt`. Allocation consumes that PASS once. Any intervening shape/intent/runtime-generation mismatch or contradictory operational failure prevents consumption.
- Semantic attempt numbers are projections over scoped committed `kernel.allocation` records for the role's `onAllocate` transition. Operational ordinals and retry-authority uses are separate counters.
- Failure classification uses a closed host-level vocabulary covering the brief's required categories. Provider wording may be retained privately or as a public-safe diagnostic, but is never an identity or retry decision input.

## Invariants

- No spawned readiness failure or attached compatibility refusal creates a semantic execution, Role Grant binding, `kernel.allocation`, `onAllocate` transition, semantic counter increment, `kernel.automatic-work`, or governed exposure.
- After `kernel.allocation`, every failure belongs to that committed semantic attempt; later process failure cannot return it to the operational loop.
- A canonical/effective shape mismatch fails closed before allocation whenever it is detectable without governed material. Neither the supervisor nor an adapter can substitute an ad hoc provider command.
- Automatic operational retry is exactly the initial try plus three retries per unchanged launch intent. It is independent of methodology retry and automatic-work budgets.
- Retry authority changes only retry allowance. It cannot change authority, identity, workspace, exposure, provider shape, candidate, evaluator revision, or role.
- All status and identity-bearing records are regenerable from canonical durable facts and contain no evaluator-private bytes, provider credentials, private diagnostics, or non-public workspace contents.
- Existing protected-exposure and session-busy checks still apply before attached allocation and before any governed delivery.

## Implementation freedom

- Module, helper, and TypeScript type names; the internal split between kernel and host helpers; and the on-disk encoding of operational records, provided the named ledger transitions and public host surfaces above remain stable.
- The harmless readiness instruction, synthetic workspace construction, probe subprocess mechanics, and readiness result representation, provided the probe is material-free, single-use, deterministic at its boundary, and exercises the effective shape required by the brief.
- The exact nesting and field names inside the orchestration-status object beyond the minimum facts fixed by the brief, provided one response is canonical and independently reproducible.
- Canonical JSON implementation details and UUID generation for individual launch attempts, provided normative identity inputs/omissions and deterministic normalization are preserved.
- Deterministic fixture and test organization, including injected provider/probe failures, provided tests exercise the real host ordering, durable records, adapter translation, and status projection rather than a duplicate orchestration model.
