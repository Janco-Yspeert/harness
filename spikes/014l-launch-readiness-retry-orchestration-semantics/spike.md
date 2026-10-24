# Spike 014l - Launch, Readiness, Retry, and Orchestration Semantics

**Status:** Revised draft after Brief Readiness; not frozen

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
3. Spawned execution proves material-free runtime readiness before semantic allocation.
4. Attached execution proves compatibility of the existing session before semantic allocation.
5. Operational launch/setup failures have their own durable launch-attempt identity and do not become semantic attempts.
6. `kernel.allocation` is the canonical event that commits a semantic attempt.
7. Automatic operational retry authority is exactly bounded and independent from semantic role retry policy.
8. Human-authorized retries are explicit and bound to one exhausted operational or semantic retry state.
9. Repeated automatic semantic continuation cannot loop indefinitely without meaningful state progress.
10. The existing root-only `resolve` observation exposes a canonical status projection sufficient to explain launch, readiness, retry, attempt, and no-progress state.

## Core execution model

014l defines two distinct loops separated by one canonical semantic-attempt boundary.

### Operational loop

For spawned execution:

    resolve eligible role
        |
        v
    derive proposed Role Grant semantics
    and canonical launch shape
        |
        v
    derive launch-intent identity
        |
        v
    record operational launch attempt
        |
        v
    material-free readiness probe
        |
        +---- failure ---> operational retry, bounded by launch intent
        |
        v
    readiness PASS

For attached execution:

    resolve eligible role
        |
        v
    derive proposed Role Grant semantics
    and canonical attachment shape
        |
        v
    validate existing session compatibility
        |
        +---- failure ---> operational refusal before semantic attempt
        |
        v
    compatibility PASS

### Semantic loop

After successful spawned readiness or attached compatibility:

    register/select governed session as applicable
        |
        v
    kernel.allocation
        |
        +---- SEMANTIC ATTEMPT COMMITS HERE
        |
        v
    role onAllocate transition / attempt projection
        |
        v
    record required exposure provenance
        |
        v
    deliver governed assignment / skill / contract / workspaces
        |
        v
    semantic role execution
        |
        v
    semantic result / transition
        |
        +---- governed semantic correction/retry as policy permits

## Canonical semantic-attempt boundary

### Semantic commit event

`kernel.allocation` is the canonical event that commits a semantic attempt.

A semantic attempt does not exist before that event.

Once `kernel.allocation` has been appended, that semantic attempt is irrevocably part of history even if assignment delivery, provider startup, process execution, result handshake, or later semantic work fails.

Harness MUST NOT retroactively reclassify a committed semantic allocation as operational in order to preserve retry budget.

### Required ordering

For every governed semantic attempt, the following ordering is normative:

1. resolve role eligibility and the proposed Role Grant semantics;
2. derive the canonical launch/attachment shape;
3. complete the applicable pre-semantic readiness or compatibility check;
4. select or register the governed session as applicable, without delivering governed role material;
5. append `kernel.allocation`, binding the semantic execution and Role Grant;
6. emit any role `onAllocate` transition and attempt-counter projection;
7. append required non-public exposure provenance before the corresponding workspace/material is delivered;
8. deliver the governed assignment, pinned skill, contract, bindings, and workspaces;
9. begin semantic role execution.

A session MAY be registered before `kernel.allocation`, but registration alone MUST NOT expose governed assignment content, role skill content, role contract content, candidate content, evaluator-private content, or non-public workspace content.

The proposed Role Grant MAY be derived before readiness, but it MUST NOT be durably bound to a semantic execution before `kernel.allocation`.

### Attempt numbering

Semantic attempt numbering MUST derive from committed semantic allocation history in the applicable methodology scope.

Operational launch attempts do not increment semantic attempt numbering.

A role `onAllocate` counter may continue to project the methodology-visible attempt number, but that projection MUST correspond to host-owned committed semantic allocations rather than operational launches.

## Operational launch attempts

Every spawned pre-semantic launch/readiness try MUST have its own durable operational launch-attempt identity.

The operational launch-attempt record MUST bind at least:

- workflow/cycle scope;
- resolved role;
- execution mode;
- predecessor semantic execution where applicable;
- launch-intent identity;
- canonical launch-shape identity;
- adapter/provider identity;
- runtime/configuration generation identity available to the host;
- normalized outcome/failure classification.

Operational launch-attempt records MUST NOT:

- create a semantic execution;
- append `kernel.allocation`;
- increment a methodology attempt counter;
- record governed role exposure that did not occur;
- consume semantic role retry budget;
- consume workflow semantic allocation or automatic-work budget.

Operational history remains append-only.

## Canonical launch shape

Harness MUST derive and provide the exact structured launch shape required for each governed role execution.

The orchestrator or supervising model MUST NOT reconstruct provider invocation semantics from prose, historical examples, repository conventions, or previous executions.

For spawned execution, the canonical launch shape MUST include, where applicable:

- provider/adapter identity;
- role and role mode;
- model/profile selection where governed;
- repository/workspace access shape;
- private/scratch workspace access;
- allowed host actions/tools;
- containment profile;
- required invocation/skill/contract identities;
- assignment/input binding identities;
- exposure class;
- expected result/action interface.

For attached execution, Harness MUST derive an equivalent canonical attachment shape containing the role, execution mode, required session/profile capabilities, workspace/access shape, isolation requirements, model/reasoning constraints, exposure constraints, assigned contract/skill identities, and expected result/action interface.

### Launch-shape ownership

Harness owns the semantic launch specification.

Provider adapters own only the deterministic translation of that specification into provider-native invocation.

The supervising/orchestrating model may request an eligible governed action, but MUST NOT construct the authority-bearing provider invocation itself.

Provider adapters MUST NOT reinterpret the requested authority or infer additional capabilities.

### Effective launch validation

The effective provider launch MUST be checked against the canonical launch shape before governed semantic allocation wherever incompatibility is detectable without governed role material.

A mismatch between requested and effective launch capability is an operational readiness failure.

Examples include:

- a role requiring read-only repository access plus writable private scratch being translated into globally read-only execution;
- required worker/MCP capability being absent from the effective runtime;
- provider defaults broadening repository or tool access beyond the role grant;
- required invocation mode or result channel not being available;
- the adapter silently selecting a materially different profile or authority shape.

Such failures:

- MUST occur before `kernel.allocation` where detectable;
- MUST be recorded durably as operational launch attempts;
- MUST consume operational rather than semantic retry budget;
- MUST NOT be repaired by the supervising model inventing an alternate launch command;
- MUST fail closed where the effective launch shape cannot be proven compatible with the granted shape.

## Spawned readiness topology

014l uses one readiness topology for one-shot provider adapters:

> a separate, material-free readiness probe followed by a distinct one-shot semantic launch.

014l MUST NOT implement a two-stage semantic provider conversation or persistent provider session in order to satisfy readiness.

### Material allowed during readiness

The readiness probe MAY receive only material necessary to prove provider/runtime viability, including:

- provider executable and adapter identity;
- selected profile/model/reasoning selectors;
- containment profile;
- canonical capability and permission shape;
- synthetic or empty probe-owned workspaces that reproduce required read/write/isolation modes;
- public non-semantic runtime configuration required to start the adapter;
- tool/worker endpoints required to test connectivity;
- a fixed harmless probe instruction or computation.

The probe MUST NOT receive:

- spike brief content as a work assignment;
- candidate implementation content;
- evaluator-private material;
- role-specific semantic work prompts;
- assigned skill contents;
- assigned contract contents;
- non-public governed workspace contents;
- semantic input artifacts whose content is part of the role assignment.

Host-side deterministic checks MAY inspect actual filesystem metadata, path existence, mount construction, and writeability without exposing governed content to the provider.

Where provider behaviour must be tested, synthetic/empty workspaces SHOULD reproduce the effective permission and containment shape without exposing governed content.

### Readiness requirements

The spawned readiness probe MUST demonstrate, where applicable:

- provider availability and process startup;
- authentication;
- required worker/tool connectivity;
- containment startup;
- required synthetic workspace shape;
- writable scratch/private storage semantics;
- effective role tool permissions;
- harmless process/computation capability;
- compatibility between canonical and effective launch shape.

A failed readiness probe:

- is recorded as an operational launch attempt;
- consumes operational retry budget;
- consumes no semantic attempt;
- produces no semantic role result;
- MUST NOT create semantic attempt numbering or governed exposure provenance.

### Readiness freshness

014l does not introduce reusable readiness caching across semantic launches.

A successful readiness result is:

- bound to one exact launch-intent identity;
- bound to the adapter/provider executable identity and host-known runtime/configuration generation;
- single-use;
- consumed by the immediately following semantic allocation/launch;
- invalid if any component of the launch-intent identity changes before semantic allocation;
- invalid if a contradictory operational failure occurs before semantic allocation.

An operational retry performs a fresh readiness probe.

Long-lived caching, shared readiness leases, or reuse across unrelated semantic launches belongs to later optimisation work.

## Attached execution

Attached governed execution is in scope for 014l.

Attached execution does not perform spawned-provider translation or launch a material-free provider probe because the provider/session already exists.

Before `kernel.allocation`, Harness MUST derive the canonical attachment shape and validate the existing session using host-known canonical provenance.

The compatibility check MUST include, where applicable:

- session/profile identity;
- required capabilities;
- required workspace modes;
- isolation/private-workspace requirements;
- model/reasoning constraints that are enforceable for attached mode;
- accumulated exposure provenance, including forbidden-exposure checks;
- whether the session is currently eligible to execute another role;
- required host/tool/action compatibility.

An attached compatibility failure before `kernel.allocation` is operational, not semantic.

Because 014l does not create or control the already-running provider process, attached compatibility failures are NOT automatically retried against the same incompatible session. The host stops with the normalized operational refusal.

Selecting a different session or materially changing the required attachment shape creates a new launch intent.

After attached compatibility succeeds, the same canonical semantic-attempt boundary, allocation ordering, semantic retry rules, no-progress rules, and status projection apply as for spawned execution.

Existing exposure prohibitions remain authoritative. In particular, implementation-exposed attached state MUST NOT be reused for protected evaluator execution.

## Operational retry policy

### Fixed budget

014l introduces a host-owned operational retry budget with an effective value of exactly **three automatic retries after the initial failed operational launch attempt**.

Thus one unchanged spawned launch intent can produce at most:

- one initial operational launch attempt; plus
- three automatic operational retries.

The operational budget is infrastructure policy for 014l. It is not a methodology semantic retry limit and is not configured per role in this spike.

Existing semantic role retry limits neither reduce nor extend this operational retry budget.

Operational launch attempts do not consume semantic `maxAllocations`, semantic `maxAutomaticWork`, or methodology attempt counters.

After the third automatic operational retry fails, Harness MUST stop automatic operational continuation for that launch intent.

### Launch-intent identity

Operational retry usage accumulates under one canonical launch-intent identity.

The identity MUST be a deterministic digest of normalized canonical fields equivalent to:

- workflow/cycle scope identity;
- role;
- execution mode;
- predecessor semantic execution identity where applicable;
- candidate/input binding identity relevant to the role;
- trusted/candidate methodology identity where applicable;
- evaluator revision identity where applicable;
- canonical launch/attachment-shape digest;
- host runtime/configuration generation digest;
- effective authority-scope digest.

The identity MUST explicitly ignore:

- operational launch-attempt UUID;
- semantic execution UUID not yet created;
- session UUID created only for the current launch;
- timestamps;
- retry counters;
- raw provider diagnostic strings;
- failure classification;
- reissued Workflow Grant or Role Grant UUID where its effective authority scope is identical.

A change to any included semantic/runtime/authority field creates a new launch intent and therefore a new operational retry budget.

Changing only an ignored bookkeeping or diagnostic field does not reset the budget.

A sequence such as authentication failure followed by scratch failure followed by connectivity failure remains the same launch intent if the included launch-intent fields are unchanged.

## Semantic retry policy

Semantic retry begins only after `kernel.allocation` has committed a semantic attempt.

Semantic retry continues to obey the role's existing methodology retry semantics, terminal disposition rules, exposure constraints, and semantic retry bounds.

Operational launch failures before `kernel.allocation` MUST NOT increment or exhaust semantic retry counts.

The host MUST NOT relabel a committed semantic attempt as operational merely because its later failure was provider/process-related.

## Human-authorized retry

A human may explicitly authorize retry after either an operational or semantic automatic budget is exhausted.

Human retry authority MUST:

- identify whether it extends an operational or semantic retry budget;
- bind to the exact exhausted budget identity and exhaustion event/state;
- preserve existing candidate, evaluator, exposure, workspace, role, launch-shape, and authority scope unless separately authorized;
- authorize a finite number of additional retries;
- be recorded durably.

By default, one explicit human retry authorization permits exactly one additional retry.

A human MAY explicitly authorize a larger finite count N. The durable authority must record N.

Human authorization does not silently become methodology policy, does not alter the underlying default automatic budget, and does not erase previous exhaustion history.

For operational retry, changing the effective authority/launch scope instead of merely extending the exhausted budget creates a new launch intent and requires the ordinary authority checks for that new intent.

## Deterministic no-progress detection

Operational transient retry is governed exclusively by the operational retry budget above and does not participate in semantic no-progress comparison.

No-progress detection applies to automatic **semantic** continuation.

### Canonical semantic progress identity

After each semantic resolution point at which Harness could automatically continue, the host MUST construct a canonical normalized progress object containing exactly the semantic fields equivalent to:

- workflow/cycle scope identity;
- current workflow phase;
- currently eligible semantic role;
- candidate/input binding identity relevant to that role;
- trusted/candidate methodology identity where applicable;
- evaluator revision identity where applicable;
- last terminal semantic disposition;
- semantic feedback/result content identity relevant to the next action;
- pending transition state;
- normalized gate or unresolved semantic reason class;
- sorted set of eligible semantic action kinds;
- effective authority-scope digest for those eligible semantic actions.

The progress identity is the deterministic digest of that canonical normalized object.

The normalization MUST explicitly ignore:

- semantic execution UUIDs;
- session UUIDs;
- operational launch-attempt identities;
- Workflow Grant or Role Grant UUIDs whose effective scope is equivalent;
- timestamps;
- retry counters;
- process PIDs;
- raw provider diagnostics;
- non-semantic log/evidence record identities that do not alter any included semantic field.

### Stop rule

Immediately before starting another automatic semantic continuation, Harness MUST compare the newly resolved semantic progress identity with the identity at the preceding automatic semantic resolution point.

If they are equal, Harness MUST NOT start another automatic semantic execution.

It MUST stop in a human-gated state with normalized reason `repeated-no-progress` or the repository's exact equivalent.

One repeated equivalent semantic state is sufficient to stop automatic continuation.

If any included progress field changes, the state is progress and automatic continuation may proceed subject to normal authority and retry policy.

A human may explicitly authorize a further semantic retry from a `repeated-no-progress` state. That authorization permits only its bounded retry count and does not erase no-progress history. If the authorized retry resolves to the same canonical progress identity again, automatic continuation stops again.

## Status projection

014l MUST extend the existing root-only workflow `resolve` GET observation as the public host projection surface for launch/retry/orchestration status.

No second status store or independent authority surface may be introduced.

The `resolve` response MUST expose, either directly or in one canonical nested status object, at least:

- current workflow/cycle scope and phase;
- currently eligible role/action;
- active semantic execution, if any;
- active/most recent operational launch attempt, if any;
- launch-intent identity;
- requested role/profile and execution mode;
- canonical launch or attachment-shape identity and safe summary;
- provider/adapter selected for spawned mode;
- readiness or attached-compatibility state;
- effective capability/readiness result;
- whether `kernel.allocation` has committed the current semantic attempt;
- current semantic attempt number;
- operational retries used and remaining for the current launch intent;
- automatic semantic retries used and remaining under existing role policy;
- last normalized operational or semantic failure classification;
- current gate/stop reason;
- current semantic progress identity where one exists;
- currently eligible next action or actions;
- authority required for any otherwise-eligible privileged action;
- any normalized launch-shape incompatibility.

Sensitive provider-private or evaluator-private content MUST NOT be exposed merely to satisfy status.

The status projection MUST be regenerable from canonical host records and MUST NOT be independently mutable.

A richer human-facing CLI rendering belongs to subsequent architecture cleanup.

## Failure classification

Operational failures MUST be classified sufficiently to support deterministic retry and diagnosis.

The host MUST distinguish at least categories equivalent to:

- provider unavailable/start failure;
- authentication failure;
- containment/setup failure;
- workspace/storage readiness failure;
- required connectivity/tool failure;
- launch-shape incompatibility;
- attached-session incompatibility;
- pre-allocation readiness failure;
- post-allocation execution/process failure;
- semantic terminal failure;
- operational retry exhaustion;
- repeated semantic no-progress.

Provider-specific raw errors MAY be retained as evidence, but provider wording MUST NOT become orchestration semantics.

## Authority invariants

014l MUST preserve the following:

- the host remains authoritative for role eligibility and automatic continuation;
- the host is authoritative for the semantic launch/attachment specification;
- provider adapters translate but do not reinterpret authority;
- `kernel.allocation` is the sole semantic-attempt commit event;
- operational launch attempts do not become semantic attempts;
- retry never implies expanded workspace or tool permission;
- retry never implies expanded exposure;
- retry never changes candidate/evaluator identity unless separately governed;
- implementation-exposed state cannot be reused as protected evaluator state;
- human authority remains explicit where automatic authority has ended;
- failure remains durably visible even where no semantic attempt occurred;
- fail-closed behavior remains the default where authority, effective capability, readiness, attachment compatibility, or progress state is ambiguous.

## Acceptance criteria

### AC1 - Canonical launch/attachment shape is host-derived

Spawned and attached governed role execution derives its required runtime shape from canonical role/grant state rather than from supervising-model reconstruction.

### AC2 - Provider translation preserves authority shape

Spawned provider translation neither drops required capabilities nor broadens granted capabilities.

### AC3 - Spawned readiness topology is material-free and one-shot

A spawned one-shot provider passes a separate material-free, single-use readiness probe bound to the exact launch intent before semantic allocation.

### AC4 - Attached execution has an explicit compatibility path

Attached execution validates the existing session against the canonical attachment shape before semantic allocation and does not invent spawned-provider probe semantics.

### AC5 - Operational launch attempts have distinct durable identity

A spawned readiness attempt is durably recorded without creating a semantic execution or semantic attempt.

### AC6 - kernel.allocation is the semantic-attempt commit

No semantic attempt exists before `kernel.allocation`; after it is appended, the semantic attempt is irrevocably part of history.

### AC7 - Allocation ordering is deterministic

Role `onAllocate` transition/counter projection occurs after `kernel.allocation`, and required non-public exposure provenance is appended after allocation but before the corresponding governed material is delivered.

### AC8 - Readiness failure preserves confidentiality

A failed spawned readiness probe can be demonstrated without spike work assignment content, candidate content, evaluator-private content, assigned skill contents, assigned contract contents, or other non-public semantic role material.

### AC9 - Effective launch shape is validated before semantic allocation

Where detectable without governed role material, canonical/effective spawned launch incompatibility is an operational failure before `kernel.allocation`.

### AC10 - Launch mismatch cannot consume semantic attempt budget

A pre-allocation launch/readiness mismatch is durably recorded without creating a semantic attempt or incrementing semantic attempt numbering.

### AC11 - Orchestrator cannot repair launch semantics ad hoc

The supervising model cannot bypass a launch-shape failure by inventing provider commands, flags, permissions, or alternate invocation machinery outside the governed adapter path.

### AC12 - Operational retry budget is exact and independently keyed

One unchanged spawned launch intent receives one initial operational attempt plus exactly three automatic operational retries, keyed by the normative launch-intent identity and independent from semantic role retry policy.

### AC13 - Operational budget reset semantics are deterministic

Only a change to an included launch-intent field creates a new operational retry budget; failure class, retry UUIDs, timestamps, diagnostics, and equivalent grant reissuance do not reset it.

### AC14 - Semantic retry remains separately governed

Semantic retry begins only after `kernel.allocation` and continues to obey existing methodology retry semantics unaffected by pre-allocation operational failures.

### AC15 - Retry cannot broaden authority

Automatic or human-authorized retry cannot implicitly expand workspace, tools, role, exposure class, candidate/evaluator scope, or launch/attachment shape.

### AC16 - Human retry is explicit and bounded

After automatic exhaustion, additional operational or semantic retry requires durable human authority bound to the exact exhausted budget/state and finite retry count.

### AC17 - Failure history remains append-only

Operational failures remain visible in durable history even though they do not become semantic attempts.

### AC18 - Attempt numbering reflects semantic work

Semantic attempt numbering is derived from committed semantic allocation history; operational launch attempts create no gaps or inflated semantic attempt count.

### AC19 - No-progress identity is canonical

Semantic no-progress uses the exact normalized field set and ignored-field rules defined by this brief rather than execution/session UUID churn or model inference.

### AC20 - One repeated semantic state stops automatic continuation

If the newly resolved semantic progress identity equals the immediately preceding automatic semantic progress identity, Harness stops before launching another automatic semantic execution.

### AC21 - Operational retry is not semantic no-progress

Repeated operational readiness failures use the operational retry budget and do not independently trip semantic no-progress detection.

### AC22 - resolve exposes the normative status projection

The existing root-only `resolve` GET observation exposes all minimum launch, readiness, allocation-boundary, retry, failure, progress, gate, and eligible-action fields required by this brief.

### AC23 - Status has no independent authority

The status projection is regenerated from canonical records and cannot disagree with them through independent mutation.

### AC24 - Existing exposure separation remains enforced

Implementation exposure cannot contaminate protected evaluator execution through retry, attached reuse, or readiness mechanisms.

### AC25 - Existing successful governed workflows still succeed

The new orchestration semantics do not require unnecessary human intervention for a normal successful attached or spawned implementation/evaluation path.

## Required deterministic tests

The spike should prefer deterministic fixtures over expensive live-provider calls.

At minimum add coverage for:

1. canonical role/grant state produces the expected spawned launch shape;
2. canonical role/grant state produces the expected attached attachment shape;
3. repository-read/private-write spawned shape maps correctly to provider-native permissions;
4. provider translation dropping required private/scratch write capability fails before `kernel.allocation`;
5. provider translation broadening repository write capability fails closed;
6. missing required worker/tool capability fails readiness;
7. readiness probe receives no governed semantic role material;
8. readiness PASS is single-use and bound to one exact launch intent;
9. changed launch intent invalidates an unused readiness PASS;
10. provider launch/authentication failure creates a durable operational launch attempt but no semantic allocation;
11. containment startup failure creates no semantic attempt;
12. unwritable synthetic scratch/private workspace semantics fail readiness;
13. attached incompatible session fails before semantic allocation;
14. attached compatible session reaches the same `kernel.allocation` semantic boundary;
15. `kernel.allocation` precedes role `onAllocate` transition/counter projection;
16. non-public exposure provenance is appended after semantic allocation and before corresponding governed delivery;
17. process/provider failure after `kernel.allocation` consumes the semantic attempt;
18. one launch intent permits one initial operational attempt plus exactly three automatic retries;
19. changing only failure class does not reset operational retry budget;
20. changing a normative launch-intent field creates a new operational retry budget;
21. semantic retry budget is unaffected by pre-allocation operational failures;
22. explicit human-authorized operational retry after exhaustion is bounded to the exhausted launch intent;
23. explicit human-authorized semantic retry after semantic exhaustion is bounded to the exact semantic state;
24. human retry does not expand authority;
25. semantically identical automatic resolution despite new execution/session/grant UUIDs produces the same progress identity;
26. changed semantic feedback/candidate/phase produces a different progress identity;
27. one repeated equivalent semantic progress identity stops automatic continuation;
28. operational retries do not trigger semantic no-progress;
29. failed readiness produces no protected exposure;
30. `resolve` status accurately represents launch intent, readiness, allocation boundary, retry budgets, progress identity, gate, and eligible actions;
31. status is reproducible from canonical records and has no independent mutation path;
32. existing normal attached workflow regression;
33. existing normal spawned workflow regression.

Use live-provider execution only where a property cannot be established deterministically.

Do not create permanent live fixtures merely to exercise failure states that can be represented faithfully by deterministic adapters/fixtures.

## Implementation guidance

Prefer extending the current host authority model rather than adding another coordination layer.

In particular:

- derive proposed Role Grant semantics before readiness without durably committing a semantic allocation;
- give operational launch attempts their own host-owned record/identity;
- make `kernel.allocation` the canonical semantic-attempt commit;
- derive semantic attempt numbering from committed host allocation history;
- derive launch/attachment shapes from host-owned grant/role state;
- keep the spawned readiness probe material-free and single-use;
- validate attached sessions from canonical host-known provenance rather than provider reinvocation;
- derive retry history from host-owned operational-attempt and semantic-allocation records;
- provider adapters should report operational facts rather than decide semantic authority;
- provider adapters should translate canonical launch semantics rather than reconstruct them;
- the supervising model should not decide whether a retry is operational or semantic;
- compute semantic progress identity deterministically from the normative field set;
- extend the existing root-only `resolve` observation rather than creating a second status authority;
- normalize provider-specific failure wording at the adapter boundary;
- avoid one-off exceptions for historical 014f/014j failures.

The implementation should make the historical failure patterns impossible or well-defined generically, not encode those individual incidents as policy.

## Non-goals

014l MUST NOT expand into:

- persistent or resumable provider sessions;
- two-stage semantic provider conversations;
- provider conversation lifecycle management;
- reusable readiness caching across semantic launches;
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

014l establishes correct launch, readiness, semantic-boundary, retry, and no-progress semantics.

Expected follow-on ownership remains:

- **014m** - canonical-state authority, transactional semantic finalization, runtime-generation identity, richer status/CLI, and architecture cleanup;
- **015** - telemetry and cost observability;
- **016** - durable/resumable sessions and explicit continuation authority;
- **017** - provider-neutral skills and skill-evaluation architecture;
- **018** - bounded/progressive context, content-addressed caching, and context decomposition.

014l should leave clean architectural seams for those spikes without implementing them prematurely.

## Evidence and verification

The implementation should produce normal governed evidence for:

- host-derived canonical spawned launch shape;
- host-derived canonical attached attachment shape;
- provider translation preserving authority shape;
- material-free single-use readiness;
- attached compatibility before semantic allocation;
- durable operational launch-attempt identity;
- `kernel.allocation` as the semantic-attempt commit;
- normative allocation/exposure/delivery ordering;
- operational versus semantic retry separation;
- exact operational retry budget and launch-intent reset semantics;
- bounded human retry authority;
- canonical semantic progress identity and one-repeat stop rule;
- root-only `resolve` status projection;
- regression behavior.

Evaluator verification should focus on whether the semantics are generic, deterministic, and fail-closed, not merely whether historical 014f/014j scenarios can be reproduced.

Temporary evaluator fixtures should not be deleted automatically. Any fixture that demonstrates a useful stable invariant should be identified for possible inclusion in the permanent deterministic test suite.

## As-Built expectations

The As-Built should reconstruct behavior primarily from implementation and repository diffs before relying on spike summaries.

It should explicitly record:

- the final operational launch-attempt record and identity;
- the final launch-intent normalization/digest;
- the final canonical launch/attachment-shape representation and ownership;
- provider translation semantics;
- spawned material-free readiness topology and single-use freshness rule;
- attached compatibility semantics;
- `kernel.allocation` as the final semantic-attempt boundary;
- actual ordering of allocation, role `onAllocate`, exposure provenance, and governed material delivery;
- semantic attempt-number derivation;
- operational and semantic retry representation;
- exact operational retry budget;
- human retry authority semantics;
- canonical semantic progress normalization and stop rule;
- `resolve` status projection source of truth;
- any deliberate divergence from this brief.

## Completion condition

014l is complete when Harness can reliably answer all of the following from canonical host state:

> What exact governed runtime shape is this role supposed to receive?

> Before semantic allocation, did the spawned runtime prove readiness or did the attached session prove compatibility?

> Has `kernel.allocation` committed a semantic attempt yet?

> If execution failed, did Harness fail operationally or did the semantic role actually get a committed attempt?

> What exact operational or semantic retry budget applies, and why?

> Has automatic semantic continuation made meaningful canonical progress?

and then apply the correct retry, authority, exposure, history, and stop semantics without manual forensic interpretation.
