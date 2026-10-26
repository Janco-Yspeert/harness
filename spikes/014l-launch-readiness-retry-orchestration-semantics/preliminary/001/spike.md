# Spike 014l - Launch, Readiness, Retry, and Orchestration Semantics

**Status:** Draft for Brief Readiness and human review; not frozen

**Starting point:** Spike 014f is complete/as-built. The stale Stockdif/H4 Workflow Grant has been retired. This spike must not resume Stockdif work.

**Purpose:** separate operational launch failure from semantic role failure, make the host authoritative for canonical launch shape, validate runtime readiness before governed exposure, bound retries, and stop automatic continuation when no meaningful progress is possible.

**Out of scope:** persistent provider sessions, telemetry/cost optimisation, provider-neutral skill redesign, progressive context exposure/caching, broad kernel decomposition, and general architecture cleanup beyond what is required for correct launch/retry semantics.

## Context

Spike 014's live-canary work exposed a recurring class of failures that are not semantic failures of an implementation or evaluator, but are currently represented too similarly to them.

Recent governed runs included failures caused by provider startup, authentication, sandbox setup, writable storage, effective tool permissions, worker connectivity, provider launch-shape mismatch, and other execution-environment problems. A read-only audit of representative 014f/014j/014k runs found 56 allocations, 56 distinct sessions, and 12 allocations that produced no semantic result.

These failures currently have several undesirable consequences:

- operational failures can consume semantic attempt numbers and retry budget;
- unusable executions can receive governed exposure before their runtime is known to be viable;
- provider-specific launch details can be inferred or assembled too late rather than derived from host authority;
- required capabilities can be dropped, or provider defaults can accidentally broaden authority;
- retry exhaustion can require additional authority even where no meaningful semantic attempt occurred;
- attempt history can overstate the number of meaningful implementation/evaluation attempts;
- repeated continuation can cycle without making meaningful progress;
- operators must reconstruct the distinction between infrastructure failure and role failure from low-level evidence.

014l addresses those orchestration semantics.

It does not introduce persistent sessions, token optimisation, provider-neutral skills, or broad architectural cleanup.

## Question

Can Harness make the complete pre-semantic execution path explicit and governed so that it can reliably answer:

> Did the role fail, or did Harness fail to launch the role in a state where it could meaningfully try?

and then apply the correct launch, readiness, retry, exposure, authority, and history semantics without manual forensic interpretation?

## Objectives

After this spike:

1. Harness derives the exact structured launch shape for a governed role from canonical host state.
2. Provider adapters translate that shape without inventing, dropping, or broadening authority.
3. Harness determines whether a role runtime is plausibly usable before exposing governed role material.
4. Operational launch/setup failures remain durable history but do not become semantic attempts.
5. A semantic attempt begins at a well-defined exposure boundary.
6. Automatic retry authority is bounded and deterministic.
7. Human-authorized retries are explicit and bound to the failure being retried.
8. Repeated automatic continuation cannot loop indefinitely without meaningful state progress.
9. The host can project enough canonical status to explain the current launch/retry/attempt state without reconstructing it manually.

## Core execution model

The lifecycle MUST distinguish at least:

    allocation
        |
        v
    canonical launch shape
        |
        v
    provider translation
        |
        v
    operational preparation / readiness
        |
        v
    semantic-attempt boundary
        |
        v
    governed role exposure / execution
        |
        v
    semantic result

### Operational execution

An operational execution represents host/provider work required to establish that a role can run.

Examples include:

- provider process launch;
- provider authentication;
- adapter initialization;
- containment setup;
- worker/tool connectivity;
- writable scratch/private workspace validation;
- effective tool-capability validation;
- harmless runtime computation;
- validation that the effective provider launch matches the canonical launch shape.

Operational execution is durable evidence.

Operational execution is not, by itself, a semantic attempt.

### Semantic-attempt boundary

A semantic attempt begins immediately before the first role-specific governed exposure or authorization to perform semantic role work.

Readiness MUST therefore complete before candidate, evaluator-private, or other governed role material is exposed.

Once the semantic-attempt boundary has been crossed, failure consumes that semantic attempt even if the eventual failure is provider/process-related.

Harness MUST NOT retroactively classify an exposed execution as merely operational in order to preserve retry budget.

Exposure history remains authoritative.

## Canonical launch shape

Harness MUST derive and provide the exact structured launch shape required for each governed role execution.

The orchestrator or supervising model MUST NOT reconstruct provider invocation semantics from prose, historical examples, repository conventions, or previous executions.

The canonical launch shape should include, where applicable:

- provider/adapter identity;
- role and role mode;
- model/profile selection where governed;
- repository/workspace access shape;
- private/scratch workspace access;
- allowed host actions/tools;
- containment profile;
- required invocation/skill/contract identity;
- assignment/input bindings;
- exposure class;
- expected result/action interface.

### Launch-shape ownership

Harness owns the semantic launch specification.

Provider adapters own only the deterministic translation of that specification into provider-native invocation.

The supervising/orchestrating model may request an eligible governed action, but MUST NOT construct the authority-bearing provider invocation itself.

Provider adapters MUST NOT reinterpret the requested authority or infer additional capabilities.

### Effective launch validation

The effective provider launch MUST be checked against the requested canonical launch shape before governed exposure wherever the incompatibility is detectable before execution.

A mismatch between requested and effective launch capability is an operational readiness failure.

Examples include:

- a role requiring read-only repository access plus writable private scratch being translated into globally read-only execution;
- required worker/MCP capability being absent from the effective runtime;
- provider defaults broadening repository or tool access beyond the role grant;
- required invocation mode, skill, or result channel not being available;
- the adapter silently selecting a materially different profile or authority shape.

Such failures:

- MUST occur before governed role exposure where detectable;
- MUST be recorded durably;
- MUST consume operational rather than semantic retry budget;
- MUST NOT be repaired by the supervising model inventing an alternate launch command;
- MUST fail closed where the effective launch shape cannot be proven compatible with the granted shape.

## Readiness

Before crossing the semantic-attempt boundary, the relevant adapter/runtime MUST demonstrate sufficient readiness for the requested role profile.

Readiness should cover, where applicable:

- provider availability;
- authentication;
- required worker/tool connectivity;
- containment startup;
- required workspace shape;
- writable scratch/private storage;
- effective role tool permissions;
- harmless process/computation capability;
- compatibility between canonical and effective launch shape.

The readiness probe MUST NOT require exposure of candidate content, evaluator-private content, or equivalent governed role material.

A failed readiness probe:

- is recorded durably;
- consumes operational retry budget where applicable;
- consumes no semantic attempt;
- produces no semantic role result;
- MUST NOT create misleading evaluator/implementation attempt numbering.

### Readiness caching

Readiness MAY be cached where useful, but cache validity MUST NOT depend solely on immutable configuration identity.

Authentication, connectivity, provider state, and external runtime conditions may change without a configuration digest changing.

Any caching mechanism therefore MUST:

- bind to the relevant provider/runtime/profile/configuration identities;
- have bounded validity or equivalent revalidation semantics;
- be invalidated by contradictory runtime failure;
- fail closed when readiness cannot be established.

This spike does not require sophisticated readiness caching. Correct semantics are more important than optimisation.

## Retry classes

Harness MUST distinguish operational retry from semantic retry.

### Operational retry

Operational retry is used where the semantic-attempt boundary was not crossed.

Examples include:

- provider failed to launch;
- authentication unavailable;
- containment could not start;
- scratch workspace unusable;
- required tool connectivity unavailable;
- canonical/effective launch shape mismatch.

Operational retries MAY occur automatically within a bounded budget.

They MUST NOT:

- increment semantic attempt number;
- broaden authority;
- broaden exposure;
- alter candidate/evaluator identity;
- silently change role profile or workspace permissions.

### Semantic retry

Semantic retry is used where a semantic attempt occurred but failed to produce an acceptable terminal result.

Semantic retry continues to obey the role's normal governed retry semantics and exposure constraints.

The host MUST NOT relabel a semantic retry as operational merely because its terminal failure was technical.

## Automatic retry budget

Automatic retry is finite.

For a single unchanged failed state, Harness may perform at most three automatic retries beyond the original failed execution, unless an existing stricter policy applies.

After exhaustion, Harness MUST stop automatic continuation.

Retry budget MUST be observable from canonical host state.

Operational and semantic retry budgets MUST NOT be conflated.

## Human-authorized retry

A human may explicitly authorize additional retry after the automatic budget is exhausted.

Human retry authority MUST:

- identify the exact failed state or execution being retried;
- preserve existing candidate, evaluator, exposure, and workspace constraints unless separately authorized;
- authorize a bounded additional retry rather than creating indefinite retry authority;
- be recorded durably.

By default, one explicit human retry authorization permits one additional retry.

Further retry requires further explicit authority unless a deliberately bounded count was authorized.

Human-authorized retry MUST NOT silently become methodology policy.

## No-progress detection

Automatic continuation MUST stop when Harness detects that it is repeating an orchestration cycle without meaningful progress.

Progress MUST be derived deterministically from canonical state rather than inferred by a supervising model.

The implementation SHOULD define a progress identity incorporating the relevant combination of:

- workflow phase;
- role;
- candidate identity;
- evaluator/methodology identity where relevant;
- semantic result or feedback identity;
- unresolved failure classification;
- transition state;
- governing authority identity.

If automatic continuation returns to an equivalent unresolved orchestration state without any meaningful change to the bound state, Harness MUST treat the recurrence as no progress rather than continuing indefinitely.

Operational transient failures remain governed by the operational retry budget and MUST NOT be confused with semantic workflow-loop detection.

When automatic progress is no longer available, the host MUST stop in an explicit human-gated state with a normalized reason equivalent to repeated-no-progress.

## Status projection

014l MUST provide a canonical host-derived projection sufficient to understand launch/retry/orchestration state.

At minimum it should expose:

- current workflow phase;
- active execution, if any;
- requested role/profile;
- canonical workspace/access shape;
- provider/adapter selected;
- effective capability/readiness result;
- whether the semantic-attempt boundary has been crossed;
- current semantic attempt number;
- operational retries used/remaining;
- automatic semantic retries used/remaining;
- last failure classification;
- current gate/stop reason;
- currently eligible next action or actions;
- authority required for any otherwise-eligible privileged action;
- any normalized launch-shape incompatibility.

Sensitive provider-private or evaluator-private data need not be exposed in the public projection.

This status is a projection of canonical state.

It MUST NOT become a second state store or competing authority.

A richer operator-facing status/CLI experience belongs to subsequent architecture cleanup.

## Failure classification

Operational failures MUST be classified sufficiently to support deterministic retry and diagnosis.

The spike does not require an exhaustive taxonomy, but MUST avoid collapsing all failures into a generic role failure.

The host should distinguish at least categories equivalent to:

- provider unavailable/start failure;
- authentication failure;
- containment/setup failure;
- workspace/storage readiness failure;
- required connectivity/tool failure;
- launch-shape incompatibility;
- pre-exposure readiness failure;
- post-exposure execution/process failure;
- semantic terminal failure;
- no-progress/retry exhaustion.

The exact enum/schema should fit the existing architecture.

Provider-specific raw errors MAY be retained as evidence, but provider wording MUST NOT become orchestration semantics.

## Authority invariants

014l MUST preserve the following:

- the host remains authoritative for role eligibility and automatic continuation;
- the host is authoritative for the semantic launch specification;
- provider adapters translate but do not reinterpret authority;
- retry never implies expanded workspace or tool permission;
- retry never implies expanded exposure;
- retry never changes candidate/evaluator identity unless separately governed;
- implementation-exposed state cannot be reused as protected evaluator state;
- human authority remains explicit where automatic authority has ended;
- failure remains durably visible even where no semantic attempt occurred;
- fail-closed behavior remains the default where authority, effective capability, or readiness is ambiguous.

## Acceptance criteria

### AC1 - Canonical launch shape is host-derived

A governed role launch is derived from canonical role/grant state rather than constructed by the supervising model.

### AC2 - Provider translation preserves authority shape

Provider-specific translation neither drops required capabilities nor broadens granted capabilities.

### AC3 - Effective launch shape is validated before exposure

Where detectable before execution, incompatibility between the canonical and effective launch shape is treated as an operational readiness failure.

### AC4 - Operational and semantic attempts are distinct

A failure before the semantic-attempt boundary is durably recorded without creating or incrementing a semantic implementation/evaluator attempt.

### AC5 - Exposure creates semantic-attempt commitment

Once governed role exposure begins, that execution is recorded as a semantic attempt even if a later provider/runtime failure prevents a semantic result.

### AC6 - Readiness precedes governed exposure

Required runtime readiness is established before candidate/evaluator-private governed material is exposed.

### AC7 - Readiness failure preserves confidentiality

A failed readiness probe can be demonstrated without candidate or protected evaluator exposure.

### AC8 - Launch mismatch cannot consume semantic attempt budget

A pre-exposure launch-shape mismatch is durably recorded without creating a semantic attempt.

### AC9 - Orchestrator cannot repair launch semantics ad hoc

The supervising model cannot bypass a launch-shape failure by inventing provider commands, flags, permissions, or alternate invocation machinery outside the governed adapter path.

### AC10 - Operational retry is bounded

Operational failures may retry automatically only within a deterministic bounded budget.

### AC11 - Semantic retry remains separately governed

Semantic retry counts and role retry policy are unaffected by pre-exposure operational failures.

### AC12 - Retry cannot broaden authority

Automatic or human-authorized retry cannot implicitly expand workspace, tools, role, exposure class, or candidate/evaluator scope.

### AC13 - Human retry is explicit and bounded

After automatic retry exhaustion, another retry requires durable explicit human authority bound to the failed state.

### AC14 - Failure history remains append-only

Operational failures remain visible in durable history even though they do not become semantic attempts.

### AC15 - Attempt numbering reflects semantic work

Provider/setup failures no longer create misleading gaps or inflated semantic attempt numbering.

### AC16 - No-progress loops stop automatically

A deterministic repeated orchestration state cannot trigger unbounded automatic continuation.

### AC17 - Status explains launch and retry state

The host can project launch shape, effective readiness, current phase, execution, attempt status, retry budgets, failure classification, gate, and eligible next action from canonical state.

### AC18 - Status has no independent authority

Status can be regenerated from canonical records and cannot disagree with them through independent mutation.

### AC19 - Existing exposure separation remains enforced

Implementation exposure cannot contaminate protected evaluator execution through retry or readiness reuse.

### AC20 - Existing successful governed workflows still succeed

The new orchestration semantics do not require unnecessary human intervention for a normal successful implementation/evaluation path.

## Required deterministic tests

The spike should prefer deterministic fixtures over expensive live-provider calls.

At minimum add coverage for:

1. canonical role/grant state produces the expected launch shape;
2. repository-read/private-write role shape maps correctly to provider-native permissions;
3. provider translation dropping required private/scratch write capability fails before exposure;
4. provider translation broadening repository write capability fails closed;
5. missing required worker/tool capability fails readiness;
6. supervising model cannot substitute an ad hoc provider invocation;
7. provider launch failure before semantic attempt;
8. authentication/readiness failure;
9. containment startup failure;
10. unwritable scratch/private workspace;
11. readiness succeeds followed by semantic execution;
12. process/provider failure after governed exposure;
13. operational retry budget exhaustion;
14. semantic retry budget unaffected by operational failures;
15. explicit human-authorized retry after automatic exhaustion;
16. human retry does not expand authority;
17. repeated no-progress orchestration stops;
18. changed relevant state progresses rather than falsely triggering loop detection;
19. failed readiness produces no protected exposure;
20. status projection accurately represents canonical launch shape and each retry/failure state;
21. existing normal successful workflow regression.

Use live-provider execution only where a property cannot be established deterministically.

Do not create permanent live fixtures merely to exercise failure states that can be represented faithfully by deterministic adapters/fixtures.

## Implementation guidance

Prefer extending the current host authority model rather than adding another coordination layer.

In particular:

- launch shape should be derived from host-owned grant/role state;
- retry history should be derived from host-owned execution/allocation records;
- provider adapters should report operational facts rather than decide semantic authority;
- provider adapters should translate canonical launch semantics rather than reconstruct them;
- the supervising model should not decide whether a retry is operational or semantic;
- status should be host-derived;
- provider-specific failure wording should be normalized at the adapter boundary;
- avoid one-off exceptions for historical 014f/014j failures.

The implementation should make the historical failure patterns impossible or well-defined generically, not encode those individual incidents as policy.

## Non-goals

014l MUST NOT expand into:

- persistent or resumable provider sessions;
- provider conversation lifecycle management;
- telemetry/cost accounting beyond data strictly necessary for retry semantics;
- token/context optimisation;
- cached semantic summaries;
- progressive context exposure;
- provider-neutral skill redesign;
- skill-evaluator architecture;
- broad kernel decomposition;
- transactional semantic finalization beyond changes strictly required to support this spike;
- final operator UX redesign;
- Stockdif resurrection or new Stockdif canary work;
- reinterpretation or repair of historical evaluator verdicts/evidence;
- removal of historical failed attempts.

Those belong to later work.

## Relationship to subsequent spikes

014l establishes correct launch, readiness, and retry semantics.

Expected follow-on ownership remains:

- **014m** - canonical-state authority, transactional semantic finalization, runtime-generation identity, richer status/CLI, and architecture cleanup;
- **015** - telemetry and cost observability;
- **016** - durable/resumable sessions and explicit continuation authority;
- **017** - provider-neutral skills and skill-evaluation architecture;
- **018** - bounded/progressive context, content-addressed caching, and context decomposition.

014l should leave clean architectural seams for those spikes without implementing them prematurely.

## Evidence and verification

The implementation should produce normal governed evidence for:

- host-derived canonical launch shape;
- provider translation preserving authority shape;
- launch-shape mismatch failing before exposure;
- operational versus semantic attempt separation;
- readiness-before-exposure;
- bounded retry behavior;
- explicit human retry authority;
- no-progress stopping;
- status projection;
- regression behavior.

Evaluator verification should focus on whether the semantics are generic and fail-closed, not merely whether historical 014f/014j scenarios can be reproduced.

Temporary evaluator fixtures should not be deleted automatically. Any fixture that demonstrates a useful stable invariant should be identified for possible inclusion in the permanent deterministic test suite.

## As-Built expectations

The As-Built should reconstruct behavior primarily from implementation and repository diffs before relying on spike summaries.

It should explicitly record:

- the final canonical launch-shape representation and ownership;
- provider translation semantics;
- the final semantic-attempt boundary;
- operational versus semantic retry representation;
- retry-budget semantics;
- human retry authority semantics;
- readiness architecture and invalidation behavior;
- no-progress identity/detection behavior;
- status projection source of truth;
- any deliberate divergence from this brief.

## Completion condition

014l is complete when Harness can reliably answer both:

> What exact governed runtime shape is this role supposed to receive, and did the provider actually supply it?

and:

> Did the role fail, or did Harness fail to get the role into a state where it could meaningfully try?

and then apply the correct retry, authority, exposure, and history semantics without manual forensic interpretation.
