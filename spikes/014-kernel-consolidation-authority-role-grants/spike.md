# Spike 014 — Kernel Consolidation: Authority, Role Grants, and Execution Binding

## Goal

Consolidate Harness around one generic governed-execution kernel.

Spike 014 should prove that Harness can decide, authorize, bind, execute, observe, and continue governed development work from:

- one canonical authority ledger;
- one pinned methodology definition;
- machine-readable skill contracts;
- workflow policy;
- execution provenance;
- and explicit human root authority;

without depending on duplicated local workflow state, hard-coded Harness methodology phases, provider prose, or process-specific assumptions.

The result should make the next workflow transition mechanically derivable from canonical authority and configured methodology, while keeping semantic reasoning inside skills rather than moving it into the kernel.

The central question is:

> Can Harness derive one exact execution grant from canonical authority and configured methodology, bind it either to an eligible existing session or to a new isolated executor, and continue safely without maintaining a second workflow authority model?

This is a kernel-consolidation spike.

It is deliberately not a complete workflow-product rewrite.

---

# Human execution instruction for this spike

The user intends to use **Astra for implementation**.

Any Codex-driven workflow preparation for Spike 014 may proceed through:

1. Brief Readiness;
2. Design Map;
3. evaluator preparation.

It must then stop.

Codex must not begin implementation, assume the implementation role, or continue automatically into implementation for this spike unless the human explicitly changes this instruction.

Implementation is to be initiated separately by the human using Astra.

This is an execution instruction for Spike 014, not a permanent provider-selection rule for Harness.

---

# Why this spike exists

Spikes 008–013a established useful hard boundaries:

- append-only workflow authority;
- frozen brief and evaluator provenance;
- independent evaluator roles;
- host-owned execution identity;
- role and provider separation;
- content-addressed evidence;
- correction cycles;
- semantic role results distinct from process exit;
- protected evaluator delegation;
- durable execution evidence;
- bounded provider capabilities;
- and host-mediated commit publication.

Those mechanisms prevented real failures.

However, the accumulated architecture now contains duplicated and methodology-specific machinery that repeatedly creates new failure modes.

Spike 014 exists to preserve the boundaries that proved necessary while removing the duplicated control structures around them.

---

# Primary scars

## 1. Canonical authority and local workflow state disagree

Spike 013a fixed one canonical-adoption defect and then reproduced the same structural defect at a later phase.

Canonical authority recorded:

```text
verification-finalized: PASS
promotion-recorded
```

but the local dispatch path for As-Built still refused because it required an evaluator-verify completion proxy derived from operational run state.

Both facts were historically truthful:

- the evaluator had substantively produced a genuine PASS;
- its host-level role disposition was blocked by a later publication failure.

The defect was that local execution history had become a second prerequisite for methodology progression even though canonical authority already stated the relevant methodology fact directly.

Spike 014 must fix this structurally rather than adding another phase-specific adoption exception.

---

## 2. Process, semantic result, and host action were conflated

The final Spike 013a evaluator established all 35 required criteria as satisfied and produced a genuine PASS.

Its later direct `git push` failed because provider sandbox policy denied network publication.

The resulting run remained truthfully blocked.

A single disposition could not adequately represent:

```text
provider process: completed
role reasoning: completed
verification result: PASS
promotion: complete
publication: failed
```

These are different facts.

Spike 014 must make them independently representable.

---

## 3. Harness methodology remains embedded in kernel code

Current workflow machinery still knows concrete methodology concepts such as:

- Brief Readiness;
- Design Map;
- evaluator preparation;
- implementation;
- evaluator verification;
- As-Built;
- Outcome;
- evaluator repair.

It also resolves concrete repository paths such as `skills/<role>/SKILL.md` and `spikes/<id>`.

The rewritten `GOALS.md` explicitly rejects this architecture.

Harness's development workflow should remain a first-class configured methodology.

It should not remain kernel law.

---

## 4. Protected execution still depends too much on process shape

Spike 013a correctly proved protected evaluator delegation.

However, every governed role still effectively assumes a newly launched provider process.

The new product direction requires a role to be grantable either to:

- an already-running eligible session; or
- a newly spawned isolated executor.

Authority must attach to an execution identity.

It must not be inferred from which process happened to be started.

---

## 5. Session exposure is not part of eligibility

Harness currently has no durable generic representation of facts such as:

```text
session X has received evaluator-private material
```

Removing access later does not make that session able to unsee private evidence.

Future role eligibility must be able to use this history.

---

## 6. Human authority still leaks through prose and exceptions

The methodology has repeatedly required bounded human exceptions or recovery instructions.

Those decisions are currently represented inconsistently through:

- workflow events;
- process exception documents;
- orchestrator prose;
- special-case bootstrap logic.

The human is the root authority.

Harness needs a generic way to represent bounded root-authorized changes without hard-coding particular spikes or rewriting history.

---

# Governing principles

Spike 014 is governed by the current `GOALS.md`.

In particular:

> Harness has exactly one canonical methodology authority.

> Skills own semantic reasoning.

> Contracts own deterministic role boundaries.

> Workflow policy owns methodology composition.

> The kernel owns identity, authority, capabilities, execution binding, provenance, host actions, and evidence mechanics.

> A human response that changes what an execution is permitted to do must become canonical authority.

> Exceptional authority changes what may happen next; it does not rewrite what already happened.

> A running workflow remains bound to the methodology definition under which it was authorized.

> If Harness can perform bookkeeping deterministically, the model should not be responsible for recreating it correctly through prose.

---

# Target architecture

Conceptually:

```text
SKILL.md
semantic role reasoning
        |
        v

skill contract ------------------\
                                  \
workflow policy ------------------> MethodologyDefinition
                                    |
canonical AuthorityLedger --------> AuthorityResolver
                                    |
execution provenance -------------/
                                    |
                             WorkflowExecutionGrant
                                    |
                                 RoleGrant
                              /             \
                     attached session     spawned executor
                              \             /
                              host-owned execution
                                      |
                              semantic RoleResult
                                      |
                            permitted host actions
                                      |
                           postcondition resolution
                                      |
                           canonical authority event
                                      |
                       continuation or human gate
```

The names may change in the Design Map.

The semantic boundaries may not.

---

# Scope

## 1. One canonical Authority Ledger

Harness must have exactly one canonical methodology authority history.

For Spike 014, the existing `workflow.jsonl` representation remains the physical backing store unless the Design Map establishes an equally simple single-store replacement.

Do not introduce a second canonical store.

All code that determines workflow authority must access canonical history through one authority abstraction.

That abstraction may normalize legacy events internally.

The kernel must not require every historical event to already use a new generic schema.

The important invariant is:

> One canonical ledger, one interpretation path.

Operational run records, evidence files, caches, generated reports, local runner state, and provider output may supply facts.

They do not independently grant methodology authority.

### Required consequence

Deleting or recreating local `.workflow` operational state must not change what methodology role is legally eligible next.

---

## 2. Retire local workflow state as an authority source

`.workflow/state.json` may temporarily remain for:

- diagnostics;
- UI convenience;
- execution cache;
- local history projection;
- migration compatibility.

It must not decide:

- whether a methodology phase is complete;
- whether a role may execute;
- whether a correction is required;
- whether As-Built is eligible;
- whether Outcome is eligible;
- or what canonical transition may occur next.

No phase-specific adoption workaround satisfies this requirement.

The fix must be structural.

A fresh runner must derive legal next actions from:

- canonical authority;
- the pinned methodology definition;
- immutable referenced artifacts;
- and relevant operational facts exposed through supported host interfaces.

It must not fabricate prior dispatch history.

---

## 3. Methodology Definition

Harness must represent the exact methodology governing a workflow execution as an immutable, content-addressed definition.

The exact storage representation is Design Map freedom.

Conceptually, the definition must bind:

- workflow-policy identity;
- skill-contract identities;
- relevant skill identities;
- schema/version information;
- and any other immutable methodology material required to resolve authority.

For example:

```text
MethodologyDefinition
  identity
  schemaVersion
  workflowPolicyIdentity
  skillContracts
  skillIdentities
```

A running Workflow Execution Grant must bind one exact Methodology Definition.

Changing workflow policy, a contract, or a governing skill creates a new definition for future execution.

It must not silently reinterpret an already-authorized execution.

---

## 4. Workflow policy must leave the kernel

The kernel must not require semantic knowledge of Harness's development phases.

Harness's own SDLC must be represented as configured workflow policy.

The exact policy syntax remains Design Map freedom.

The policy must be capable of expressing the current methodology semantics required by this spike without becoming a general programming language.

At minimum it must represent:

- role availability;
- deterministic eligibility predicates;
- role transitions;
- semantic-result-dependent continuation;
- retry/correction routing;
- human gates;
- bounded automatic continuation;
- stop/escalation conditions.

The design should prefer a deliberately narrow declarative model over an embedded scripting language.

The kernel must not need conditionals such as:

```text
if role === "as-built"
if spike === "013a"
if classification === "EVALUATOR_COVERAGE_DEFECT"
```

unless those concepts are supplied as configured data interpreted generically.

---

## 5. Skill contracts

Each governed role must have a machine-readable contract separate from its semantic `SKILL.md`.

The contract must contain only mechanically enforceable facts.

Potential fields include:

- role identity;
- schema/version;
- skill identity;
- required inputs;
- deterministic preconditions;
- workspace grants;
- direct execution capabilities;
- permitted host actions;
- accepted structured result forms;
- deterministic postconditions;
- human-interaction permissions.

Subjective requirements must remain in the semantic skill.

For example:

```text
"artifact exists"
```

may be a deterministic postcondition.

```text
"design is thoughtful"
```

is not.

The Design Map may choose JSON, YAML, TOML, or another repository-owned representation.

---

## 6. Authority Resolver

Harness must have one generic authority-resolution path.

Given:

- canonical authority;
- pinned Methodology Definition;
- requested workflow;
- requested role;
- relevant immutable artifacts;
- execution provenance;
- and existing operational facts where policy explicitly uses them;

the resolver must either:

- produce an exact grant;
- identify a human gate;
- identify a policy stop;
- or deny the request with a machine-readable reason.

The resolver must not require the orchestrator to reproduce policy logic in prose.

The resolver must not depend on local runner completion flags when canonical authority already states the relevant methodology fact.

---

## 7. Workflow Execution Grant

A human instruction to run or continue governed work must become an explicit first-class execution authority.

The exact name may change.

Conceptually:

```text
WorkflowExecutionGrant
  identity
  workflow/project scope
  methodologyDefinitionIdentity
  authorityBasis
  continuation policy
  delegation policy
  stopping conditions
```

The grant represents authority for Harness to continue routine configured work within its bounded scope.

It must not imply unlimited authority.

It should be possible to encode stopping conditions such as:

- human acceptance;
- explicit human gate;
- unknown/unhandled result;
- exhausted retry or correction policy;
- root-authority change required;
- no eligible executor;
- repeated non-progressing failure.

Observation alone must not create a Workflow Execution Grant.

A request such as:

```text
What happened?
```

must remain observation.

A request such as:

```text
Run/continue the workflow.
```

may create or continue execution authority.

---

## 8. Role Grant

Every governed role execution must be based on one exact resolved grant.

Conceptually:

```text
RoleGrant
  identity
  workflowExecutionGrantIdentity
  authorityBasis
  methodologyDefinitionIdentity
  role
  skillIdentity
  contractIdentity
  candidate/input identities
  workspace grants
  direct capabilities
  permitted host actions
  execution constraints
```

A role grant must be immutable.

It must be inspectable.

It must be independently distinguishable from:

- the provider process;
- the semantic result;
- the canonical transition produced after successful completion.

A role may not be performed merely because an agent claims that role in prose.

---

## 9. Attached and spawned execution

The same Role Grant model must support two execution modes.

### Spawned execution

Harness starts a new provider execution under the resolved Role Grant.

This remains appropriate when:

- private isolation is required;
- the current session is ineligible;
- provider capabilities differ;
- policy requires independence;
- or a clean execution identity is otherwise necessary.

### Attached execution

Harness grants the role to an already-running eligible session.

Attached execution must not be a bypass around authority.

The current session must receive the same mechanically resolved Role Grant.

At least one real attached-session role execution must cross the Harness boundary during Spike 014.

A mock-only or type-only representation is insufficient.

---

## 10. Execution provenance and exposure

Harness must maintain monotonic provenance sufficient to determine whether an existing execution/session remains eligible for a role.

At minimum, the design must support an exposure fact equivalent to:

```text
evaluator-private material observed
```

If Harness grants a session access to private evaluator material, that exposure remains part of the execution/session provenance after the workspace grant is removed.

The session cannot become implementation-eligible merely because access was later revoked.

Harness need only guarantee provenance for exposure it can mechanically observe.

Unobservable manual disclosure by the human or another external channel may be represented separately as declared/attested provenance if the Design Map finds that useful.

It must not be falsely presented as mechanically proven.

### Required proof

A session that has not seen private evaluator material may receive an implementation Role Grant if all other policy predicates pass.

A session that has received evaluator-private material must be mechanically denied that same implementation Role Grant.

No prompt wording may override the denial.

---

## 11. Capabilities and host actions are different

A direct capability means the executor itself may perform an operation within its sandbox/workspace.

Examples may include:

- repository read;
- repository-local write;
- local computation;
- tests/build/lint;
- Git inspection;
- Git commit.

A host action means the executor may request Harness to perform a privileged deterministic operation.

Examples may include:

- publish exact commit;
- promote approved evaluator evidence;
- another future host-brokered operation.

The skill contract must define the vocabulary of permitted host actions.

The Role Grant must narrow that permission to the concrete execution.

The executor may not invent arbitrary host action names or parameters.

---

## 12. Host-mediated publication is the mandatory privileged-action proof

Spike 013a introduced a host-mediated `publishCommit` path but retained direct provider publication behaviour.

Spike 014 must establish host-mediated publication as the governed model.

A role authorized to publish must request publication of an exact commit.

Harness must mechanically validate, as applicable:

- Role Grant authorization;
- exact commit identity;
- branch;
- permitted ancestry/base;
- repository/workspace identity;
- any path or scope restrictions required by the contract.

Harness then performs the network publication using host-held credentials.

The executor does not require raw GitHub network credentials merely because publication is authorized.

A provider sandbox denying direct `git push` must not make a substantively successful role fail if its contract expects host-mediated publication.

### Promotion

The architecture must support the same semantic/mechanical split for promotion.

However, full migration of all evaluator promotion mechanics into the host is not mandatory for Spike 014 unless it is required by the chosen design or is cheap enough not to expand the spike materially.

The mandatory proof is publication.

---

## 13. Multi-dimensional execution result

Harness must represent the following independently:

### Process state

Examples:

- allocated;
- running;
- exited;
- failed to launch;
- cancelled;
- interrupted.

### Semantic role result

Examples:

- succeeded;
- blocked;
- refused;
- failed.

### Methodology result

Role-specific structured semantic facts, such as:

```text
verification: PASS
classification: IMPLEMENTATION_FAILURE
```

where permitted by the role contract.

### Host-action result

Examples:

- publication succeeded;
- publication failed;
- promotion succeeded;
- action denied.

A later host action failure must not retroactively change a genuine semantic result.

Workflow completion may still depend on required postconditions and host actions.

The distinction must remain observable.

---

## 14. Human interaction protocol

A governed worker must be able to request legitimate human input without fabricating authority and without necessarily terminating its execution.

The kernel must support a structured waiting state equivalent to:

```text
WAITING_FOR_HUMAN
```

The interaction model must distinguish at least conceptually:

- information/input request;
- approval of an already-defined action;
- request for new/root authority.

The exact enum and transport remain Design Map freedom.

A role contract must state what kinds of human interaction the role is permitted to request.

### Authority rule

If a human response changes what the execution is permitted to do, the response must produce canonical authority before the execution uses that new permission.

The model's conversation text alone is insufficient.

### Private request rule

Harness must be able to carry a private evaluator's human request to the human without necessarily exposing the request content to an implementation-capable orchestrator session.

A high-quality UI is not required.

### Required bounded proof

At least one governed execution must:

1. enter a waiting-for-human state;
2. remain the same execution identity;
3. receive a permitted human response through Harness;
4. resume;
5. reach a later terminal semantic result;

without consuming a replacement execution merely because human input was needed.

---

## 15. Generic bounded root-authority mechanism

Harness must support generic human-root authority for exceptional forward progress.

This mechanism must be represented as data interpreted generically by the authority resolver.

It must not require code such as:

```text
if spike === "014"
```

A bounded root-authority record must be able to specify, at minimum:

- exact workflow/project scope;
- authority basis;
- permitted exception or change;
- relevant identities;
- human/root origin;
- one-shot or bounded lifetime where applicable;
- reason/audit context.

A root-authority event may permit a future action that current policy would otherwise deny.

It must not:

- falsify a prior semantic result;
- rewrite a blocked run into success;
- delete historical evidence;
- alter an immutable old Role Grant;
- retroactively reinterpret an old Methodology Definition.

The Design Map should distinguish normal methodology activation/change from an exceptional override where useful.

---

## 16. Idempotent continuation and allocation

Automatic continuation must be idempotent.

Repeated calls such as:

```text
continue
continue
reconnect and continue
two callers continue concurrently
```

must not create duplicate execution for the same canonical authority basis.

For a given eligible transition, the next Role Grant/allocation must be uniquely identifiable from stable authority/basis identity.

If the workflow permits retry or replacement, the new allocation must be explicitly distinguishable and linked to the prior execution.

Attempt counters may remain useful human labels.

They must not be the foundational identity mechanism.

---

## 17. Identity model

Spike 014 must reduce reliance on overloaded attempt numbers.

It does not need to collapse every existing counter into one integer.

The design should distinguish stable identities such as:

- project/workspace identity;
- Methodology Definition identity;
- Workflow Execution Grant identity;
- canonical authority/basis identity;
- Role Grant identity;
- execution/run identity;
- candidate commit identity;
- skill identity;
- contract identity;
- structured result identity;
- correction/replacement lineage.

Existing counters such as:

- methodology cycle;
- canonical verification attempt;
- evaluator-private attempt;
- execution attempt;

may remain where they describe genuinely different concepts.

Their relationships must be explicit rather than inferred from coincident numbers.

---

## 18. Execution Handle and await seam

Starting governed work must return or expose a durable identity that callers can later inspect or await.

The exact CLI/API may remain minimal.

The model must not assume correctness depends on one HTTP request, CLI process, socket, or orchestrator turn remaining open for the entire execution.

Conceptually:

```text
ExecutionHandle
  identity
  workflowExecutionGrantIdentity
  roleGrantIdentity
  run identity
  observable state
```

A caller disconnecting must not imply cancellation.

A later caller must be able to discover the same execution and terminal state.

### Restart boundary

Full provider-process resurrection after a Harness host restart is not required.

However, the data model must not require an in-memory-only identity.

If Harness cannot reattach to a previously running execution after restart, that execution should be representable as interrupted/lost rather than nonexistent.

---

## 19. Failure categories

The kernel must not collapse materially different conditions into one generic `blocked` state.

At minimum the model must be able to distinguish facts equivalent to:

- semantic role failure;
- provider failure;
- infrastructure failure;
- authority denial;
- workflow-policy stop;
- human gate/wait;
- host-action failure;
- cancellation;
- interruption/lost execution.

The workflow policy decides what these conditions imply.

The kernel preserves the distinctions.

A large universal failure taxonomy is not required.

---

## 20. Telemetry seam

Spike 014 must establish telemetry hooks in the execution model.

It does not need to implement full cost accounting.

Telemetry is observational evidence.

It must not become workflow authority.

The model must be able to correlate telemetry with stable identities such as:

- Workflow Execution Grant;
- Role Grant;
- execution/run;
- provider/executor.

Harness-observed and agent/provider-reported telemetry must remain distinguishable.

### Harness-observed examples

- allocated/start/terminal timestamps;
- wall-clock time;
- retry/replacement counts;
- host actions;
- waiting-for-human intervals;
- actual selected executor/provider.

### Future provider usage examples

- usage snapshot before;
- usage snapshot after;
- calculated usage delta;
- token/model usage where a provider exposes it.

A provider usage collector may return `unavailable` in Spike 014.

Failure to collect telemetry must never make an otherwise valid role fail.

The implementation should expose a minimal telemetry sink/hook rather than requiring agents to remember a `record telemetry` action.

---

## 21. Executor-policy seam

Provider/model/reasoning selection is not implemented fully in Spike 014.

The kernel must nevertheless avoid baking today's fixed executor assumptions into Role Grant semantics.

The design should leave an explicit executor-selection seam capable of later considering:

- provider;
- model;
- reasoning depth;
- provider capabilities;
- isolation requirements;
- provider availability;
- usage/quota availability;
- cost.

A future policy such as:

```text
prefer Codex
Codex usage exhausted
Claude eligible
→ use Claude
```

must not require changing the authority model.

Provider fallback for availability must remain distinguishable from semantic correction after bad work.

---

## 22. Provider capability seam

Harness must not assume all providers support identical execution features.

The design should allow provider adapters or executor profiles to declare relevant capabilities such as:

- attached-session support;
- isolated-session support;
- structured contract delivery;
- system-instruction control;
- tool restrictions;
- structured role results;
- usage reporting;
- reasoning controls;
- resumability.

Full discovery or negotiation is not required in Spike 014.

The kernel must simply avoid encoding one provider's mechanism as universal methodology semantics.

---

## 23. Workspace identity and lifetime

Workspace access must be explicit enough to support:

- role grants;
- private-evidence boundaries;
- session provenance;
- future portability.

The design should represent, as needed:

- workspace identity;
- project/repository identity;
- visibility/exposure class;
- read/write mode;
- owner/grant;
- lifetime.

Spike 014 does not need a generalized workspace manager.

The evaluator-private exposure proof must use the same conceptual workspace/provenance model that future projects can use.

---

## 24. Project portability boundary

The normal kernel path must no longer depend on Harness-specific assumptions such as:

- repository name;
- `spikes/<id>` layout;
- hard-coded `ROLE_CONTRACTS`;
- fixed `skills/<role>/SKILL.md` locations;
- Spike-specific bootstrap branches;
- hard-coded Harness development phase names.

Harness's repository may provide configuration that resolves those paths.

The kernel should consume project/methodology configuration rather than know them intrinsically.

A full installer is not required in Spike 014.

A real second-project pilot is a later forcing function.

---

## 25. Schema versions

New persistent structures introduced by Spike 014 must carry explicit schema/version information where practical.

This includes at least the durable representations of:

- Methodology Definition;
- Workflow Execution Grant;
- Role Grant;
- structured role result;
- root-authority record;
- host-action request/result;

if those are persisted as distinct artifacts.

A generalized migration framework is not required.

The spike should avoid introducing anonymous durable JSON shapes whose meaning cannot evolve safely.

---

# Simplification requirements

Spike 014 is not complete merely because new abstractions exist beside old ones.

The implementation must remove or demote obsolete authority paths where the new kernel supersedes them.

At minimum:

1. local `.workflow` state no longer participates in methodology eligibility;
2. methodology-specific phase ordering is no longer hard-coded into the kernel path used by the configured Harness workflow;
3. concrete role-contract lookup is supplied through methodology/project configuration rather than a kernel constant table;
4. canonical authority interpretation has one implementation path rather than separate CLI and host interpretations that can disagree;
5. provider prose remains diagnostic, not authority;
6. prior truthful blocked/failure history remains preserved.

The Design Map should identify additional safe deletions or consolidations.

---

# Harness self-hosting and bootstrap

Spike 014 modifies the machinery that governs Harness itself.

The implementation must not solve this by adding another Spike-014-specific code exception.

Any exceptional authority required to bootstrap or recover the new methodology must use the generic human-root authority mechanism introduced by this spike, or a narrowly documented pre-existing authority path that the frozen Design Map can justify without expanding methodology-specific kernel logic.

The intended invariant is:

> Harness must never require a methodology-specific code exception merely to recover from changing that methodology.

An old Methodology Definition need not prove that a new Methodology Definition is philosophically allowed to exist.

Human root authority may activate a new definition for future execution.

Historical workflows remain governed by the definition under which they were authorized unless an explicit forward-only migration/recovery decision says otherwise.

---

# As-Built boundary

As-Built remains part of Harness's configured development methodology.

Spike 014 must make As-Built eligibility derive from canonical authority and workflow policy.

The current As-Built semantic skill itself does not need its full evidence-first redesign in this spike.

A later skill/methodology-maintenance change may strengthen As-Built to:

1. independently reconstruct from Git/code/tests first;
2. then inspect prior summaries;
3. compare implementation against summaries and frozen intent.

Do not expand Spike 014 into that semantic skill rewrite unless required by the kernel refactor.

---

# Evaluator boundary

Spike 014 must preserve independent evaluator semantics and current security properties.

It must not:

- expose evaluator-private evidence to implementation-capable sessions;
- make protected evaluator roles generally model-invocable;
- weaken criterion coverage integrity;
- convert PASS into a provider-exit heuristic;
- or erase the public/private evidence distinction.

The kernel may take over deterministic evaluator bookkeeping where naturally required by the new authority/host-action model.

A broad evaluator-skill rewrite is not required.

---

# Orchestrator boundary

The orchestrator should increasingly become a client of Harness rather than an authority engine.

For this spike, the architecture must support the future rule:

```text
observe unless execution was authorized

when authorized:
  obtain/continue WorkflowExecutionGrant
  ask Harness what is eligible
  request execution
  await result
  continue until a configured gate
```

The orchestrator must not need to hard-code the methodology transition graph.

The orchestrator may perform an attached role only after Harness issues the corresponding Role Grant.

A complete orchestrator-skill rewrite is not mandatory for Spike 014 unless needed to prove attached execution.

---

# Acceptance criteria

## Canonical authority

**AC01 — One authority source**

For governed methodology progression, canonical authority has one backing ledger and one authority-resolution path.

**AC02 — Local runner state is non-authoritative**

Deleting/recreating local `.workflow` state does not change the next legally eligible methodology role.

**AC03 — Fresh-runner resume**

A fresh runner derives the correct next action from canonical authority and configured methodology without fabricating historical dispatch records.

**AC04 — As-Built regression**

A state equivalent to the Spike 013a scar — canonical verification PASS with an operational evaluator run blocked by a later publication failure — still permits As-Built when configured policy says PASS/promotion are sufficient.

---

## Methodology configuration

**AC05 — Pinned Methodology Definition**

Workflow execution binds an exact content-addressed methodology definition.

**AC06 — Configured workflow policy**

Harness's SDLC role ordering/eligibility is loaded as methodology configuration rather than intrinsic kernel phase logic.

**AC07 — Configured skill contracts**

The governed Harness roles resolve deterministic contracts through methodology/project configuration rather than a kernel `ROLE_CONTRACTS` table.

**AC08 — Historical definition stability**

Changing a methodology definition does not silently reinterpret a Workflow Execution Grant already bound to an older definition.

---

## Grants and authority

**AC09 — Workflow Execution Grant**

Human instruction to run/continue creates or binds explicit workflow-level execution authority with bounded continuation scope.

**AC10 — Observation is non-consuming**

Inspection/status/observation does not create execution authority or allocate a role.

**AC11 — Role Grant**

Every governed execution is bound to one exact immutable Role Grant derived from canonical authority and the pinned methodology.

**AC12 — No role by prose**

Provider or orchestrator text cannot grant itself a governed role.

---

## Attached/spawned execution and provenance

**AC13 — Spawned execution uses Role Grant**

A newly spawned executor runs under an inspectable Role Grant.

**AC14 — Real attached execution**

An already-running eligible session performs at least one real governed role under a Harness-issued Role Grant without spawning a replacement provider process for that role.

**AC15 — Private exposure recorded**

Harness mechanically records evaluator-private exposure when it grants that access to a session/execution identity.

**AC16 — Exposure is monotonic**

Removing the private workspace grant does not erase the recorded exposure.

**AC17 — Exposure affects eligibility**

A clean session may be implementation-eligible; the same policy denies implementation to a session that has seen evaluator-private material.

---

## Results and host actions

**AC18 — Result dimensions remain separate**

Process state, semantic role result, methodology result, and host-action result are independently observable.

**AC19 — Host action cannot rewrite semantic history**

A publication failure after a successful semantic role result does not retroactively turn that semantic result into failure.

**AC20 — Host-mediated publication**

An authorized executor can request publication of an exact commit and Harness validates and publishes it using host-owned credentials.

**AC21 — Direct push not required**

The governed publication proof succeeds without requiring the role executor to possess direct Git remote/network credentials.

---

## Root authority and human interaction

**AC22 — Generic bounded root authority**

A human can issue a bounded forward-only authority decision through one generic mechanism without Spike-specific kernel code.

**AC23 — Historical truth preserved**

A root-authority decision cannot mutate prior Role Grants, delete blocked runs, or rewrite earlier semantic results.

**AC24 — Waiting for human**

A real governed execution can enter a structured waiting-for-human state without terminating or consuming a replacement execution.

**AC25 — Resume same execution**

After a permitted human response, the same execution identity resumes and reaches a later terminal semantic result.

**AC26 — Authority-changing response is canonical**

If the human response grants new permission, the execution cannot use it until that permission is recorded in canonical authority.

---

## Idempotency and durability

**AC27 — Idempotent continuation**

Repeated or concurrent continuation requests for the same canonical basis do not allocate duplicate equivalent Role Grants/executions.

**AC28 — Retry/replacement remains explicit**

Where policy permits a retry/replacement, the new execution has a distinct identity and explicit lineage to the prior execution.

**AC29 — Durable execution identity**

A caller can later inspect/await the same execution by stable identity after the initiating caller disconnects.

**AC30 — Interrupted execution representable**

The model can preserve an execution as interrupted/lost after host recovery rather than treating it as nonexistent.

Full provider-process restoration is not required.

---

## Portability and seams

**AC31 — No Harness-path kernel dependency**

The normal authority/execution kernel does not intrinsically depend on `spikes/<id>`, fixed skill paths, or Harness-specific role names.

**AC32 — Telemetry hook exists**

Kernel lifecycle and host-action operations emit or expose telemetry through a non-authoritative seam correlated to stable execution/grant identities.

**AC33 — Telemetry failure is non-fatal**

Unavailable provider usage data does not invalidate otherwise successful governed work.

**AC34 — Executor policy can evolve**

The Role Grant/execution architecture leaves an explicit seam for future provider/model/reasoning/usage-aware selection without changing methodology authority semantics.

**AC35 — Schema evolution visible**

New durable grant/result/authority/action structures introduced by this spike have explicit schema/version identities where applicable.

---

# Required regression scenarios

The evaluator should include deterministic coverage for at least these scars.

## R1 — Canonical PASS, operational block

```text
canonical verification: PASS
promotion: complete
evaluator execution: blocked by publication transport
local runner state: absent/stale

expected:
As-Built eligibility derives from canonical authority + policy
```

## R2 — Local state deletion

```text
valid canonical workflow
remove .workflow/state.json
restart runner

expected:
same legal next role
no fabricated historical dispatch
```

## R3 — Duplicate continue

```text
two continue requests
same authority basis

expected:
one allocation / one canonical Role Grant
```

## R4 — Private exposure

```text
session A:
  evaluator-private exposure = false
  implementation otherwise eligible
→ grant allowed

session B:
  evaluator-private exposure = true
  same implementation request
→ grant denied
```

## R5 — Semantic success, publication failure

```text
role semantic result: succeeded
methodology result: PASS
publication: failed

expected:
all three facts remain independently observable
semantic PASS is not rewritten
workflow policy decides whether further action is needed
```

## R6 — Human pause

```text
role running
→ requests allowed human input
→ WAITING_FOR_HUMAN
→ human responds through Harness
→ same run resumes
→ terminal result
```

## R7 — Generic root authority

A bounded human-root authority event changes what may happen next without:

- code special-casing Spike 014;
- editing old ledger events;
- rewriting a blocked run;
- or mutating an existing immutable Role Grant.

---

# Live-provider evidence

Spike 014 changes the authority/execution boundary.

Static inspection alone is not sufficient.

At least the following must cross real supported boundaries:

1. one real attached-session Role Grant execution;
2. one real spawned Role Grant execution;
3. one real host-mediated publication request;
4. one real structured human-wait/resume cycle.

The Design Map may combine these into fewer bounded scenarios where safe.

Mandatory evidence should not require an evaluator session itself to possess every provider/network capability.

Spike 013a established that production of live evidence may be separated from independent evaluator corroboration where:

- the producing run is real;
- the evidence is durable;
- identities are content-bound;
- the evaluator can independently corroborate primary evidence;
- and provider prose alone is not accepted as proof.

Preserve that lesson.

---

# Non-goals

Spike 014 does **not** need to:

- implement a polished workflow DSL;
- build a generalized scheduler;
- implement worker pools or priorities;
- build a full secrets manager;
- implement complete provider usage/token accounting;
- implement cost optimization;
- implement automatic model selection;
- implement full model/reasoning-depth configuration;
- fully rewrite all semantic skills;
- fully rewrite the evaluator;
- fully redesign As-Built;
- implement the methodology/skill-upgrade workflow;
- implement the installer/init experience;
- complete the real second-project pilot;
- complete multi-session supervision;
- build a remote client;
- build an attention UI;
- restore arbitrary provider processes across host restart;
- remove all historical legacy event schemas;
- collapse every attempt counter into one number;
- make every semantic judgment deterministic;
- create arbitrary agent-to-agent coordination.

The spike should preserve seams for later work without implementing those products prematurely.

---

# Deferred follow-on work

Expected follow-ons include:

## Telemetry and executor policy

Measure:

- provider/model usage;
- token/quota deltas where possible;
- wall-clock and model time;
- human-wait time;
- retries/repairs;
- human interventions;
- Harness overhead.

Then add role-level provider/model/reasoning policy and usage-aware fallback.

## Skill and methodology maintenance

Create a lighter governed process for:

- semantic skill changes;
- deterministic contract changes;
- workflow-policy changes;
- methodology activation.

## Portability and installation

Remove remaining Harness-repository assumptions and provide a usable init/install flow.

## External pilot

Install Harness on a real second project and treat failures there as the next architectural forcing function.

## Supervision product

Return to:

- multi-session supervision;
- richer attention states;
- remote clients;
- interactive provider approvals;

using the consolidated execution/identity substrate where appropriate.

---

# Spike 011 Cycle 002

Do not resume Spike 011 Cycle 002 before Spike 014.

After Spike 014 is accepted, reassess Spike 011.

If its open correction cycle maps naturally onto the new kernel, use it as a historical regression/dogfood case.

If resuming it would require recreating obsolete local-state/bootstrap semantics solely to satisfy an old workflow representation, treat its remaining cycle as historical evidence and decide explicitly whether it should be superseded or linked forward.

Spike 014 must not add compatibility machinery merely to force the old cycle to continue.

---

# Completion boundary

Spike 014 completes only after:

1. Brief Readiness passes and the brief is frozen;
2. the Design Map is frozen;
3. evaluator preparation completes and the evaluator authority is pinned;
4. the human explicitly initiates implementation using Astra, unless they later change that instruction;
5. implementation completes under the frozen brief and Design Map;
6. independent verification evaluates the exact implementation candidate;
7. required real-boundary evidence is independently corroborated;
8. promotion and As-Built complete according to the active Harness methodology;
9. the human makes the acceptance decision;
10. Outcome records the resulting architecture and remaining scars.

Automatic workflow preparation before implementation must stop after evaluator preparation for this spike.

Do not treat the instruction to use Astra for implementation as a permanent methodology rule.

---

# Governing test

For every mechanism added in Spike 014, ask:

> What real failure or unsafe trust boundary requires this to be mechanical?

For every methodology-specific rule, ask:

> Can this live in workflow policy or a skill contract instead of the kernel?

For every piece of model bookkeeping, ask:

> Can Harness derive or perform this deterministically?

And for the architecture as a whole:

> If local runner state disappears and provider prose is ignored, can canonical authority plus the pinned methodology still tell Harness exactly what may happen next, who may do it, and under what authority?
