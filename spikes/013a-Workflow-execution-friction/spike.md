# Spike 013a — Deterministic Workflow Execution and State Adoption

## Origin

Spike 013 was started on `feat/spike-013`.

Before implementation:

* Brief Readiness completed and the brief was frozen.
* The Design Map was created and frozen.
* An immutable pre-implementation evaluator snapshot was pinned.

The workflow then blocked before evaluator preparation.

The newly initialized workflow runner could not adopt the already-valid Brief Readiness and Design Map checkpoints recorded in canonical authority. It required those phases to have been dispatched and completed through its own `.workflow` operational state, while direct completion was correctly refused because those phases had not been dispatched by that runner.

No operational history was fabricated and implementation did not begin.

That failure, together with earlier Spike 011 recovery attempts, exposed a broader set of closely related defects in Harness workflow execution. They materially affect the frozen Spike 013 contract, so they are addressed in this successor spike rather than by modifying the frozen Spike 013 brief.

Spike 013 remains preserved as the blocked predecessor.

---

# Problem

Harness now has substantial methodology machinery:

* canonical workflow authority;
* frozen Brief Readiness and Design Map checkpoints;
* host-owned workflow runs;
* correction cycles;
* evaluator preparation, verification and repair;
* executor selection;
* named permission profiles;
* operational runner state;
* and explicit separation between implementation and evaluation roles.

However, using those mechanisms in real workflows has exposed a gap between **workflow authority** and **workflow execution**.

Harness can often prove that a role ought to happen without being able to deterministically make that role happen.

The human is still required to bridge several layers manually:

```text
canonical methodology authority
        ↓
workflow runner
        ↓
host-owned execution
        ↓
provider
        ↓
repository skill
        ↓
semantic role outcome
```

The central question for this spike is:

> Once Harness has legitimately authorized a governed workflow role, can it deterministically bind that role to the intended repository contract, execute it through the selected provider, observe its semantic outcome, and continue from durable authority without requiring the human to impersonate the orchestration layer?

---

# Observed failures

## 1. Claude refused a valid delegated evaluator role

During Spike 011 Cycle 002, Harness validly allocated a host-owned `evaluator-repair` run to Claude.

The run identified:

```text
workflow: 011-host-owned-workflow-runs
phase: evaluator-repair
executor: claude
permission profile: repo-local-worker
```

The host successfully launched Claude.

Claude did not perform the evaluator repair.

It read `skills/evaluator/SKILL.md`, observed that the skill was protected from model invocation and interpreted its explicit-invocation guard as requiring the human to manually invoke:

```text
/evaluator repair spikes/011-host-owned-workflow-runs
```

Claude treated the Harness delegation as an ordinary natural-language request rather than as valid evaluator authority.

This exposed a real conflict between two desirable properties.

Harness must preserve:

> An implementation agent, arbitrary prompt or ordinary orchestrator cannot simply decide to become the evaluator.

But Harness must also support:

> A genuinely authorized Harness evaluator-role allocation can cause the evaluator role to execute without requiring the human to manually repeat that authorization through a provider-specific slash command.

The desired rule is therefore:

> A protected evaluator role may execute when explicitly invoked by the human or when mechanically authorized by a valid Harness evaluator-role allocation.

Natural-language claims of authority are insufficient.

---

## 2. Codex skill execution is ambiguous

Codex has behaved differently.

During workflow execution it reports statements such as:

> “I’m using the Harness Brief Readiness skill…”

or:

> “I’m now using the Design Map skill…”

and then proceeds to perform the role.

From the current execution record it is not reliably clear whether Codex:

* invoked a provider-native skill mechanism;
* received the repository skill through orchestration context;
* read `SKILL.md` and executed it directly;
* or independently reproduced the expected workflow behavior.

This may produce correct results, but it is not deterministic enough for governed workflow execution.

Harness should not depend on individual providers deciding what “use this skill” means.

---

## 3. Process completion was mistaken for role completion

The Claude evaluator-repair process exited normally after refusing to perform the role.

Harness recorded the run as completed.

Those are different facts.

The observed reality was approximately:

```text
provider process: completed
allocated evaluator role: not completed
reason: executor refused role
```

A successful provider exit cannot by itself authorize methodology advancement.

Harness needs an observable semantic outcome for the allocated role in addition to the provider/process lifecycle.

---

## 4. Canonical workflow authority cannot reliably be adopted by a fresh runner

Spike 013 itself exposed this defect.

Canonical authority already recorded valid frozen Brief Readiness and Design Map checkpoints.

A newly initialized runner had no corresponding local `.workflow` dispatch history.

The runner therefore could neither:

* proceed from the authoritative completed checkpoints; nor
* legally manufacture the missing local execution history.

This leaves workflow continuity dependent on ephemeral operational state even though Harness already has durable canonical authority.

A restarted, fresh or replacement runner must be able to resume a workflow from authoritative state without pretending historical runner events occurred.

---

## 5. Dispatch inspection can consume execution state

A workflow dispatch command used to inspect a prospective evaluator-repair execution printed the provider command but also consumed a dispatch attempt in `.workflow`.

A command that appears to be inspection or planning must not mutate operational history as though real execution began.

---

## 6. Pre-execution failures can strand operational state

When the Harness host was unavailable, execution failed before a real worker run was established.

Retrying then required operational-state repair.

A host-unreachable, allocation or equivalent pre-execution failure must not require manual editing of `.workflow` state before retry.

---

## 7. Dispatch observability is too weak

A successful execution allocation currently provides insufficient immediate information.

The human has had to recover a run ID from state and query host endpoints manually to determine:

* which run was created;
* which executor was used;
* whether it was still running;
* whether it actually performed the role;
* and what output it produced.

The orchestration path should make these facts directly discoverable.

---

## 8. Authority status can misrepresent legal next actions

`authority status` has reported states such as:

```text
correctionPermitted: true
```

while omitting `correction-cycle-opened` from apparent legal transitions.

The current behavior appears capable of conflating:

> transition validates with empty evidence

with:

> transition is structurally available.

Evidence-bearing transitions must remain discoverable as available transitions even when additional evidence is required before recording them.

---

# Objective

Make governed Harness workflow execution deterministic and resumable.

After this spike, Harness must be able to take a valid methodology-role allocation and establish:

```text
role
  ↓
authority
  ↓
exact repository contract
  ↓
provider-specific execution/delivery
  ↓
observable semantic role outcome
```

without relying on provider prose, fabricated operational history or repeated human authorization.

The selected implementation may use different provider-specific mechanisms for Codex and Claude.

The methodology semantics must remain equivalent.

---

# Deterministic skill and contract binding

For every governed role execution, Harness must be able to establish:

* the methodology role being executed;
* the exact repository skill or contract governing that role;
* the immutable identity/version of that contract where freezing is required;
* the authority permitting execution;
* the executor receiving the role;
* and the mechanism by which that contract was made effective for that executor.

Harness does not need to require one universal provider-native skill mechanism.

Valid implementation approaches may include:

* native provider skill invocation;
* host-supplied frozen skill content;
* repository contract loading;
* a dedicated Harness skill runner;
* or another mechanism justified by the Design Map.

The implementation remains open.

The following is not sufficient evidence:

```text
“I’m using the evaluator skill.”
```

Nor is:

```text
“This is the evaluator role in the canonical Harness workflow.”
```

Provider output is diagnostic evidence, not methodology authority.

Harness must know what contract governed the execution independently of what the model claims.

---

# Delegated authority source and validation boundary

Protected repository roles, especially evaluator roles, must remain protected from opportunistic invocation.

An ordinary implementation agent, orchestrator, provider process, or API caller must not gain evaluator authority merely by:

* asking for it;
* embedding authoritative-looking prose in a prompt;
* reading the evaluator skill and electing to follow it;
* supplying an evaluator role or skill name in a request;
* or invoking a technically available execution path.

Valid evaluator execution may originate only from:

1. explicit authorized human invocation; or
2. a mechanically valid Harness evaluator-role allocation derived from canonical workflow authority.

For delegated execution, canonical Harness workflow authority is the source of methodology authority. The ability to construct or submit a host workflow-run request, reach the local Harness API, or populate fields such as role, executor, permission profile, or skill does not itself authorize the protected role.

Before launching a protected role, Harness must validate that the current canonical workflow state permits that role to execute.

For evaluator roles, the validated delegation must bind at minimum:

* the target workflow or spike;
* the phase or methodology role being executed;
* the applicable methodology attempt or correction cycle where one exists;
* the exact evaluator or role-contract authority being invoked;
* and the executor receiving the delegated authority.

The host-owned run must retain an inspectable binding to that validated authority so that later execution and verification can establish not merely that an evaluator-shaped process ran, but that it ran under the correct workflow authority.

The exact representation of this delegation remains a Design Map decision. The implementation may use a capability, structured authority record, signed or unsigned token, host-owned binding, or another mechanism, provided that the authority is mechanically validated and cannot be manufactured by provider prose or an ordinary caller.

Explicit human evaluator invocation may use a different authorization path from delegated Harness execution. Both must preserve the same underlying protection: protected roles cannot self-authorize.

The Spike 013a bootstrap path is not exempt from this boundary. Any bootstrap allocation must derive from the frozen canonical authority explicitly permitted by this brief, must record that the bootstrap exception was used, and must preserve the same minimum role, attempt, contract, and executor binding.

Removing evaluator invocation protections globally, weakening `disable-model-invocation` into an advisory convention, or treating any successful `POST /workflow-runs` request as sufficient evaluator authority does not satisfy this spike.


---

# Provider-specific execution

Harness may require different adapters for Codex and Claude.

That is acceptable.

The invariant is methodology-level equivalence:

```text
Harness role allocation
        ↓
exact contract resolved
        ↓
authority validated
        ↓
provider-specific execution
        ↓
semantic role result
```

The spike must explicitly characterize what supported execution means for both Codex and Claude rather than assuming they interpret repository skills identically.

---

# Authoritative semantic role result

Provider process termination does not determine methodology-role success.

A methodology role may reach a successful terminal disposition only from a Harness-validated role result associated with the allocation that created the run.

That result must bind at minimum:

* the host-owned run identity;
* the allocated workflow role;
* the applicable methodology attempt/cycle;
* and the exact resolved role/skill contract authority.

Provider output may contribute evidence used to construct or validate that result, but arbitrary provider prose or an unvalidated provider-emitted success marker is not itself methodology authority.

Harness owns validation of the role result before it may affect canonical workflow progression.

Only a validated successful semantic role result may satisfy a workflow prerequisite that requires completion of that governed role.

A normal process exit without such a result must not unlock the corresponding canonical transition.

Blocked, refused, failed, missing, contradictory or invalid role-result evidence must leave the required methodology role incomplete.

The exact result schema, transport, persistence format and role-disposition vocabulary remain Design Map freedom.

---

# Runner adoption and resume

Canonical authority is the durable methodology record.

Operational `.workflow` state is execution machinery.

A newly initialized, restarted or replacement runner must be able to derive its next legitimate action from canonical authority without fabricating historical runner activity.

For example:

```text
canonical authority:
  brief frozen
  design map frozen
  evaluator not prepared

local operational history:
  no brief-readiness dispatch
  no design-map dispatch

result:
  adopt authoritative completed checkpoints
  next required phase = evaluator preparation
```

The runner must not manufacture historical records such as:

```text
dispatch brief-readiness
complete brief-readiness
dispatch design-map
complete design-map
```

if those events did not occur through that runner.

Adoption should be explicit and inspectable.

The exact representation of an adoption record is an implementation decision.

---

# Dispatch semantics

Inspection and execution must be distinguishable.

A command or API operation used only to inspect or plan a dispatch must not consume an execution attempt.

Operational execution history should begin only when Harness has genuinely committed to execution according to the selected execution model.

A failure before a worker has genuinely begun must remain retryable without manual mutation of `.workflow` state.

Historical executions that genuinely occurred must remain preserved.

---

# Blocked role retry semantics

A governed methodology phase or attempt may require more than one host-owned execution run before it reaches a successful semantic role outcome.

Dispatching a role once does not by itself consume or complete the methodology phase.

If a host-owned execution terminates with a semantic outcome such as blocked, refused, unavailable, or another non-successful disposition that does not advance canonical authority, Harness must preserve that execution and allow another execution attempt for the same still-pending methodology phase where canonical authority continues to permit it.

For example:

```text
canonical phase:
  brief-readiness
  methodology attempt: 1
  state: pending

execution history:
  execution attempt 1: blocked
  execution attempt 2: running
```

The second execution must not rewrite, delete, or pretend the first execution did not occur.

Harness must distinguish:

* methodology attempt identity;
* execution-attempt identity;
* process lifecycle;
* and semantic role outcome.

A prior dispatch must prevent duplicate concurrent execution where appropriate, but must not permanently prevent retry after the previous execution has reached a non-successful terminal role disposition and canonical authority still identifies that phase as eligible.

The exact retry counter, identifier format, and concurrency mechanism remain Design Map decisions.

---

# Workflow and run observability

After a real dispatch, the operator or orchestrator must be able to discover, without reverse engineering internal files:

* the workflow;
* allocated role;
* methodology attempt where applicable;
* run identity;
* executor;
* contract/skill identity;
* contract delivery/invocation mode;
* provider/process state;
* semantic role disposition;
* and relevant output or follow mechanism.

A browser UI is not required.

CLI/API visibility is sufficient.

The result should support an orchestrator that can:

```text
allocate role
    ↓
receive run identity
    ↓
follow/poll
    ↓
observe terminal role result
    ↓
continue automatically
```

Routine workflow boundaries must not require human mediation merely because an execution moved from one phase to another.

---

# Authority status

Authority inspection must distinguish between:

* transition unavailable;
* transition available with no further evidence;
* transition available but requiring evidence.

An evidence-bearing transition must not disappear simply because status calculation used empty evidence.

The exact presentation is open.

---

# Spike 013a bootstrap exception

This spike modifies behavior required to execute this spike.

In particular, the existing runner cannot yet adopt valid canonical checkpoints created outside its current operational history.

Therefore Spike 013a receives the following narrow bootstrap exception.

Before the new adoption mechanism exists, a governed phase of Spike 013a may be allocated directly through the existing host-owned workflow execution surface when the local runner cannot represent already-valid upstream canonical authority.

This exception:

* must use canonical methodology authority as the source of truth;
* must not fabricate prior `.workflow` dispatch or completion history;
* must identify the exact upstream frozen authority from which the directly allocated role is permitted;
* must preserve genuine host-owned execution identity;
* must preserve role separation and permission constraints;
* and must be recorded as a bootstrap exception rather than ordinary runner history.

The exception exists only to allow implementation of the missing adoption capability.

It must not become the permanent mechanism for bypassing workflow-state consistency.

---

# Evaluator bootstrap and self-modification exception

**Pre-freeze retry bootstrap**: Until the retry behavior defined by this spike exists, Spike 013a may directly allocate a fresh host-owned execution of a still-pending pre-freeze role when canonical authority continues to identify that role as next and the previous execution is durably recorded as non-successful. The new run must reference the prior blocked execution and must not fabricate, delete, or overwrite runner history.

Spike 013a is likely to modify:

* `skills/evaluator/SKILL.md`;
* protected skill invocation behavior;
* delegated evaluator authority;
* executor integration with evaluator contracts;
* or closely related evaluator execution semantics.

The evaluator used to prepare and verify Spike 013a must therefore be pinned before implementation to an immutable pre-implementation evaluator authority.

That authority must have:

* deterministic content identity;
* committed provenance;
* and an execution path capable of proving which frozen authority was used.

The candidate implementation must not be able to replace the evaluator authority by modifying the working-tree evaluator skill.

The pinned evaluator remains authoritative for Spike 013a even if implementation changes the current evaluator contract.

This exception exists solely to break the evaluator self-modification cycle.

It does not waive independent evaluation.

If the pinned evaluator cannot fairly evaluate the new behavior without changing the frozen definition of success after implementation, the workflow must block rather than silently substitute a modified evaluator.

---

# Evidence requirements

Evaluation must prefer deterministic provider-free evidence where that is sufficient.

However, several defects in this spike are specifically provider-bound and cannot be established solely through static inspection or mocks.

Evidence must include:

## Reserved live-provider acceptance scenarios

Spike 013a must reserve bounded, reproducible live-provider scenarios before implementation.

These scenarios exist specifically to prove provider-bound behavior that cannot be established by mocks or static inspection.

### Claude protected evaluator delegation

The Claude scenario must:

* begin from canonical authority that legally permits a bounded evaluator role;
* use the evaluator workspace/access required by the frozen evaluator contract;
* allocate that role through the Harness host;
* bind the exact evaluator authority used by the run;
* execute through the real Claude adapter;
* require no manual `/evaluator ...` invocation after allocation;
* and produce a Harness-validated semantic role result visible through the normal run/workflow inspection surface.

The scenario must exercise the authority boundary which previously caused Claude to refuse delegated evaluator execution.

It may use a dedicated repository-owned fixture or bounded evaluation target rather than advancing Spike 011.

It must not require evaluator-private material to become public.

### Codex deterministic contract execution

The Codex scenario must:

* begin from canonical authority that legally permits a bounded governed role;
* allocate that role through the Harness host;
* bind an exact repository-owned role/skill contract;
* execute through the real Codex adapter;
* make the contract delivery/invocation mode inspectable;
* and produce a Harness-validated semantic role result.

The purpose is not to mandate a provider-native Codex skill primitive. It is to establish that Harness, rather than Codex prose, determines which contract governed the role.

### Scenario prerequisites

The Design Map may choose the smallest repository-owned fixtures needed to make these scenarios safe and reproducible.

Before evaluator preparation, the scenarios must identify:

* the role being exercised;
* canonical authority prerequisite;
* required workspace/access boundary;
* allowed repository side effects;
* expected semantic role result;
* and cleanup/isolation requirements.

They must not depend on selecting these properties opportunistically after seeing implementation behavior.

### Provider unavailability

Real-provider evidence required by this brief is mandatory.

If the required Claude or Codex executor is unavailable because of authentication, service availability, configuration, or equivalent external failure, the affected acceptance criterion is **blocked**, not passed using mocks as a substitute.

Provider-independent deterministic coverage should still run, but it cannot replace mandatory live-provider evidence.

A transient unavailable provider does not itself constitute an implementation failure unless the implementation caused the unavailability.


## Host boundary

At least one bounded integration must cross the real Harness host-owned workflow-run boundary.

Static examination of:

* prompts;
* command arrays;
* permission profiles;
* adapter configuration;
* or expected provider behavior

is not sufficient evidence of unattended governed execution.

This explicitly avoids repeating the Spike 011 verification mistake where constructed commands and permissions were treated as proof that the provider would actually perform the role.

---

# Spike 011 recovery

Spike 011 Cycle 002 remains open.

Do not advance its methodology authority during Spike 013a implementation or verification.

After Spike 013a is independently verified and accepted, Spike 011 Cycle 002 becomes the first production use of the corrected workflow execution path.

The existing evaluator-repair role should then be retried through Harness.

Success means the human is not required to:

* manually invoke `/evaluator repair`;
* fabricate operational history;
* edit `.workflow` state;
* or inspect raw provider output to decide whether the role completed.

Spike 011 then proceeds through its own correction cycle normally.

---

# Acceptance criteria

## Authority and deterministic contract resolution

**AC01 — Deterministic role contract**

Every governed workflow-role allocation deterministically resolves to the repository-owned skill or contract intended for that role.

**AC02 — Exact contract identity**

Where workflow authority requires a frozen or versioned contract, the host-owned execution record identifies the exact contract authority used.

**AC03 — Explicit execution/delivery mode**

Harness records how the governing contract was supplied or invoked for the selected executor.

Provider prose claiming to use a skill is not sufficient authority.

**AC04 — No authority by prompt wording**

An ordinary provider invocation cannot gain protected evaluator authority merely by containing text that claims to be an evaluator role or Harness allocation.

**AC05 — Protected-role delegation**

A valid Harness evaluator-role allocation can authorize the protected evaluator role without globally weakening evaluator invocation protection.

**AC06 — Explicit human invocation remains valid**

Direct authorized human evaluator invocation remains supported.

**AC07 — No opportunistic evaluator role**

Implementation agents or ordinary workflow roles cannot independently elect to become the evaluator.

---

## Provider execution

**AC08 — Claude delegated evaluator execution**

A valid Harness evaluator allocation can cause Claude to execute the protected evaluator role without requiring manual `/evaluator ...` invocation.

**AC09 — Real Claude regression evidence**

A bounded real Claude execution exercises the original refusal condition sufficiently to demonstrate that it has been resolved.

**AC10 — Codex execution characterized**

A bounded real Codex workflow-role execution records which exact contract governed the run and how it was delivered or invoked.

**AC11 — Provider-neutral semantics**

Codex and Claude may use different execution mechanisms, but valid equivalent Harness allocations preserve the same methodology authority semantics.

---

## Role outcome

**AC12 — Process and role are distinct**

Harness durably distinguishes provider/process lifecycle from methodology-role disposition.

**AC13 — Refusal is not role success**

A provider process that exits normally while refusing or blocking its assigned role must not be represented as successful completion of that role.

**AC14 — Role completion is observable**

Successful semantic role completion has machine-readable evidence distinguishable from process exit alone.

**AC15 — Workflow advancement uses role outcome**

Methodology progression requiring completion of a governed role cannot advance solely because the underlying provider process terminated successfully.

---

## Runner adoption and recovery

**AC16 — Canonical authority adoption**

A fresh/restarted runner can resume from already-valid canonical workflow authority without requiring matching historical `.workflow` dispatch records.

**AC17 — No fabricated operational history**

Adoption of authoritative checkpoints does not manufacture dispatch/completion events that did not occur through that runner.

**AC18 — Adoption is observable**

The operational state exposes that prior canonical authority was adopted or otherwise resumed rather than replayed.

**AC19 — Correct next phase**

After adoption, the runner derives the correct next eligible workflow phase from canonical authority.

**AC35 — Blocked execution is retryable**
When canonical authority still requires a phase and its prior host-owned execution ended in a non-successful terminal role disposition, Harness can allocate a fresh execution attempt for that same methodology phase without deleting or rewriting the earlier run.
---

## Dispatch semantics

**AC20 — Non-consuming inspection**

Inspecting or planning a prospective dispatch does not consume an execution attempt.

**AC21 — Recoverable pre-execution failure**

A host-unreachable, allocation or equivalent failure before genuine worker execution can be retried without manual `.workflow` mutation.

**AC22 — Historical executions preserved**

Retry and recovery behavior does not erase real prior executions or rewrite canonical authority.

---

## Observability

**AC23 — Immediate dispatch identity**

A successful dispatch exposes the created host-owned run identity, allocated role and executor.

**AC24 — Run followability**

An orchestrator/operator can directly inspect or follow the run to a semantic terminal outcome.

**AC25 — Contract observability**

The run record exposes the governing contract identity and execution/delivery mode.

**AC26 — Role observability**

Run inspection exposes both process state and methodology-role disposition.

---

## Authority inspection

**AC27 — Evidence-aware transitions**

Authority status distinguishes unavailable transitions from transitions that are available but require evidence.

**AC28 — Correction transition discoverability**

A Spike-011-shaped repairable rejection state exposes the correction-cycle transition as structurally available even before its required evidence is supplied.

---

## Bootstrap integrity

**AC29 — Spike 013a runner bootstrap is bounded**

The temporary direct host-owned execution path used to overcome the pre-existing adoption defect is explicit, canonical-authority-backed, non-fabricating and scoped to this bootstrap problem.

**AC30 — Pinned evaluator authority**

Spike 013a evaluator preparation and verification use an immutable pre-implementation evaluator authority with deterministic identity and provenance.

**AC31 — Evaluator mutation cannot judge itself**

Candidate modifications to evaluator invocation semantics cannot replace the frozen evaluator authority used to verify Spike 013a.

---

## Integration and production readiness

**AC32 — Real host-boundary execution**

At least one bounded integration proves real governed execution across the Harness host boundary rather than only static adapter correctness.

**AC33 — Unattended governed progression**

Once a routine governed role has been legitimately allocated, the execution path can reach its semantic outcome without requiring the human to translate that allocation into provider-specific invocation instructions.

**AC34 — Spike 011 recovery readiness**

After Spike 013a acceptance, the existing Spike 011 Cycle 002 evaluator-repair can be retried through Harness without manual `/evaluator repair` invocation, fabricated workflow history or manual operational-state repair.

Spike 013a does not itself complete Spike 011.

---

# Non-goals

Spike 013a does not:

* redesign the complete Harness methodology;
* introduce Light / Standard / Rigorous workflow profiles;
* solve the broader question of whether every repository change should enter Harness workflow;
* make the implementation skill mandatory for ordinary edits;
* implement cost or token telemetry;
* implement general model/reasoning configuration;
* create a general scheduling system;
* create arbitrary agent-to-agent coordination;
* require a browser UI;
* require identical provider-native invocation mechanisms;
* remove evaluator independence;
* or make protected skills generally model-invocable.

The broader small-change/workflow-entry problem remains separate.

Executor cost, model and reasoning telemetry remains a later spike.

---

# Design freedom

The Design Map should determine the smallest architecture that satisfies this contract.

In particular, this brief does not freeze:

* the internal shape of delegated role authority;
* whether contract delivery uses native skills, repository reads, injected content or another mechanism;
* the exact role-disposition enum;
* the exact adoption record format;
* the CLI syntax for follow/poll;
* or the persistence representation used for operational adoption.

The design must preserve the semantic boundaries defined above.

---

# Completion boundary

Spike 013a completes only after:

1. Brief Readiness and Design Map are frozen normally;
2. the pre-implementation evaluator authority is pinned;
3. evaluator preparation completes using the permitted bootstrap path where required;
4. implementation completes;
5. independent verification runs against the pinned evaluator authority;
6. real Claude, Codex and host-boundary evidence required by this brief is established;
7. promotion and As-Built complete according to Harness methodology;
8. and the human makes the acceptance decision.

After acceptance:

1. resume the already-open Spike 011 Cycle 002;
2. use that workflow as the first production validation of the corrected machinery;
3. then proceed to executor model/reasoning/cost/token/time telemetry;
4. then separately address lightweight-change and workflow-entry friction.

---

# Governing principle

Harness authority should be sufficient to authorize Harness work.

The human should not have to repeat a valid workflow decision by manually speaking each executor's private invocation dialect.

And durable methodology authority should survive the loss, restart or replacement of the operational runner that happened to execute it.

---
