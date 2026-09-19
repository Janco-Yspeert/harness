# Harness Goals

## Purpose

Harness is a local control plane for AI coding work.

Its job is to make AI-assisted development easier to delegate, govern, observe and recover across agents and providers without requiring the human to continuously supervise every process.

Harness has two related product concerns:

1. **Governed execution** — running development roles under explicit authority, capability, provenance and evidence boundaries.
2. **Agent supervision** — observing multiple ongoing agent sessions, surfacing work that needs attention, and allowing the human to intervene without owning the lifetime of the underlying work.

These should share a host substrate where that is useful, but neither should distort the other.

The immediate development priority is to make governed execution small, portable and useful on real projects. Multi-agent supervision and remote attention remain core product goals rather than prerequisites for proving the workflow system.

Harness is not intended to replace Codex, Claude Code, an IDE, or the native interfaces of individual providers.

## Primary User

Harness is initially for a developer working on an Ubuntu machine who uses capable AI coding agents as part of normal software development.

The developer should be able to:

- ask Harness to execute development work;
- allow an existing eligible agent session to perform an authorized role;
- let Harness launch an independent agent where isolation or provenance requires it;
- allow routine workflow work to continue without repeated human prompting;
- see when work completes, fails, stalls, or genuinely requires human input;
- inspect trustworthy evidence of what happened;
- work across providers, repositories and projects;
- disconnect and later resume observation without implicitly terminating the work.

Harness should optimize for this developer workflow before becoming a broader orchestration platform.

## AI-First Development

Harness is deliberately AI-first.

Capable agents should perform most of the implementation, verification, analysis, diagnosis, documentation and routine workflow progression.

The human remains the root authority for:

- product intent;
- acceptance and rejection;
- methodology changes;
- exceptional authority;
- decisions that cannot safely be derived from existing policy and evidence.

Harness should reduce clerical work performed by models.

If Harness can deterministically allocate an identity, hash an artifact, preserve evidence, apply a mechanical transition, perform a privileged host action, or derive a known fact, the model should not be responsible for recreating that fact correctly in prose.

AI should spend its effort on reasoning.

Harness should spend its effort on mechanics.

## Roles, Not Processes

A development role is conceptually separate from the process or agent that performs it.

Authority should first answer:

> Is this role permitted, under what contract, against what exact inputs, and with what capabilities?

Only then should Harness decide how the role is executed.

A permitted role may be:

- granted to an existing eligible session; or
- performed by a newly launched isolated agent.

Spawning a new process is necessary when isolation, independent provenance, incompatible capabilities, private information, or execution policy requires it.

It should not be required merely because the methodology uses a named role.

A process or session may perform a governed role only after Harness has bound that role to it.

## Human Root Authority

Harness mechanics exist to preserve human authority, not replace it.

The human must be able to authorize bounded corrections, exceptions and methodology changes without rewriting history.

Exceptional authority should be explicit, scoped and forward-only.

A human exception may change what is permitted next.

It must not make a historical event un-happen.

Harness must not require methodology-specific code exceptions merely to recover from changing the methodology itself. Bootstrap, upgrade and recovery authority should use generic root-authority mechanisms rather than hard-coded knowledge of particular spikes or workflows.

## One Canonical Authority

Harness must have exactly one canonical authority history for a governed workflow.

That history records authoritative facts such as:

- grants;
- workflow decisions;
- human authority;
- accepted role results;
- methodology transitions;
- bounded exceptions.

Operational run records, caches, generated reports, local runner state, provider output and evidence artifacts may contribute facts to authority resolution, but they are not independent sources of methodology authority.

A derived representation should be disposable and reconstructable from canonical authority plus its referenced immutable evidence.

Harness should not maintain two state machines that must remain synchronized by convention.

The current JSONL authority ledger may remain the physical representation while it is useful.

The architectural concept is the authority ledger, not the filename or storage format.

## Methodology Is Configuration Plus Skills

Harness should not hard-code its own development methodology into the execution kernel.

A governed methodology should be representable through three distinct kinds of input:

### Skills

Agent-facing semantic instructions describing how to reason and perform a role.

Skills may contain judgment that cannot sensibly be reduced to deterministic rules.

### Skill Contracts

Machine-consumable definitions of the mechanically enforceable boundary around a role.

These may define:

- required inputs;
- deterministic preconditions;
- allowed capabilities;
- workspace access;
- permitted host actions;
- structured outputs;
- deterministic postconditions;
- human-interaction permissions.

The contract must not attempt to mechanize inherently semantic judgments merely because they are important.

### Workflow Policy

Machine-consumable configuration describing how roles compose.

This may include:

- role eligibility;
- transitions;
- automatic continuation;
- retry and repair policy;
- bounded correction behaviour;
- human gates;
- escalation conditions.

Harness's own development process should remain a first-class bundled methodology, but it is not kernel law.

Other projects should be able to use different methodologies without changing Harness source code.

## Pinned Methodology

A running workflow should be governed by an exact, immutable methodology definition.

The relevant workflow policy, contracts and skill identities should be pinned for that execution.

Changing the methodology creates a new definition for future authority.

It does not silently reinterpret historical work.

Harness must permit methodology evolution without requiring the old methodology to recursively prove the legitimacy of every future methodology.

## Automatic Continuation

Routine workflow progression should continue without repeatedly asking the human to approve mechanically implied next steps.

When the human authorizes workflow execution, Harness should be able to continue through ordinary transitions until it reaches a genuine gate.

For example, an implementation defect may lead to implementation correction and renewed verification; an evaluator defect may lead to evaluator repair and renewed verification.

This should not require the human to repeatedly say "continue."

Automatic continuation must nevertheless be bounded.

Harness should stop and request human involvement when progress is no longer routine, including cases such as:

- repeated or non-progressing failure;
- exhausted configured retry or repair policy;
- ambiguity about the appropriate classification or transition;
- required changes to frozen authority;
- no valid next transition;
- unavailable eligible executors;
- methodology or specification defects;
- explicit human gates.

Harness should continue by default, but it should recognize when continuing would merely dig a deeper hole.

## Workflow Execution Authority

An explicit workflow execution authority should represent the human's instruction to run or continue a workflow.

It should define:

- the workflow scope;
- the pinned methodology;
- whether routine continuation is authorized;
- allowed delegation behaviour;
- declared stopping conditions.

Individual role authority should be derived beneath that workflow-level authority.

Observation is not execution authority.

A question such as:

> What happened?

must not silently become:

> Continue the workflow.

## Execution Identity and Provenance

Every governed execution should have a stable Harness identity independent of the caller connection.

Harness should track enough execution provenance to determine whether an existing session remains eligible for a role.

In particular, exposure to private evaluation material cannot be undone by later removing filesystem access.

If a session has received evaluator-private material, Harness should be able to make that fact part of future eligibility decisions.

Where Harness controls access, this provenance should be mechanically recorded rather than based on the agent's recollection.

Eligibility applies to a particular execution identity or session, not to a provider in general.

## Isolation and Private Evidence

Independent verification requires meaningful separation from implementation.

Harness should support private evaluator workspaces and other protected evidence without relying only on prompt instructions for secrecy.

The Harness host may act as the trusted broker across protected boundaries.

It may need access to both public and private material in order to:

- enforce access rules;
- validate identities;
- preserve evidence;
- perform approved promotion;
- expose only permitted information.

Access by Harness does not imply access by every caller or agent.

Private evaluator information should not leak into an implementation-capable session merely because the workflow is being orchestrated from that session.

## Host-Mediated Privileged Actions

A role's authority to request an outcome should not necessarily give the agent the raw mechanism required to perform that outcome.

For example, permission to publish a commit need not imply direct Git network access.

A role may request an allowed host action.

Harness may then:

- validate the request against the role's authority;
- enforce exact branch, identity, ancestry and path constraints;
- use host-held credentials;
- perform the privileged action;
- record its independent outcome.

Promotion follows the same general principle.

An agent may need to make a semantic decision about what is eligible for promotion.

Harness should perform deterministic copying, hashing, preservation and publication where possible.

Credentials are host resources, not evidence and not automatically agent capabilities.

## Execution Results Are Multi-Dimensional

Provider process exit, semantic role success, methodology result and privileged host-action results are different facts.

Harness should preserve those distinctions.

For example, it should be possible to represent truthfully:

- evaluator semantic result: PASS;
- role reasoning completed successfully;
- promotion action: complete;
- publication action: failed.

One overloaded "completed" or "blocked" flag should not have to carry all of those meanings.

Workflow policy may use these facts when deciding what is eligible next.

## Human Interaction

Governed agents should be able to request human input without manufacturing human authority.

Harness should eventually support structured states such as:

- needs input;
- needs approval;
- needs root authority;
- waiting for human.

A worker waiting for legitimate human input should not have to die and consume a fresh execution merely because interactive prompting was disabled.

When a human response changes what an execution is permitted to do, that authority must be recorded canonically rather than existing only as conversation text.

Private agents should be able to ask the human a question through Harness without unnecessarily exposing private evaluator material to the orchestrating agent.

Human interaction should remain governed and bounded rather than becoming unrestricted agent prompting.

## Durable Execution Handles

Launching work and waiting for work are separate concerns.

Harness should return stable execution identities that callers can inspect or await.

A long wait should not require correctness to depend on one network request, terminal, client process or model session remaining connected.

A caller should be able to reconnect and continue waiting for the same work.

Caller disconnection must not imply cancellation.

Cancellation itself should be explicit and preserve established history.

## Idempotency and Concurrency

Repeated or concurrent requests to continue the same canonical workflow state must not accidentally launch duplicate work.

For a given authority basis, the next automatically selected role should be allocated at most once unless the methodology explicitly permits a retry or replacement.

Reconnects, repeated commands and multiple observers must not create competing authority.

## Provider and Model Neutrality

Codex and Claude Code are the initial providers.

Neither should define Harness's product model.

Harness should represent provider-independent concepts such as:

- role;
- authority;
- capability;
- workspace;
- execution;
- result;
- human request;
- host action.

Provider adapters may translate these into provider-specific APIs, tools and restrictions.

Harness should not pretend provider differences do not exist.

Executor selection should eventually support policy over:

- provider;
- model;
- reasoning depth;
- isolation requirements;
- available capabilities;
- availability and usage limits;
- cost.

Provider or usage exhaustion should be able to trigger an allowed executor fallback without changing the semantic role or methodology.

Semantic failure should not be silently hidden by provider switching unless the workflow explicitly permits that behaviour.

Skills should ultimately be agent-neutral, with provider-specific wrappers or adapters where needed.

## Telemetry

Harness needs to make its own cost and friction measurable.

Telemetry is observational evidence, not workflow authority.

The architecture should permit measurement of:

- wall-clock execution time;
- model execution time where available;
- time waiting for human input;
- retries and repairs;
- human interruptions;
- provider/model selection;
- provider usage and token consumption where measurable;
- Harness orchestration overhead;
- host actions and their results.

Harness-observed measurements and agent-reported measurements should remain distinguishable.

A failure to collect telemetry must not invalidate otherwise correct workflow work.

Provider usage may initially require approximate or provider-specific mechanisms such as before/after usage snapshots.

The measurement mechanism may improve over time without changing the execution model.

## Host Ownership

The Harness host owns Harness execution state.

Client lifetime, network lifetime, workflow lifetime, agent-session lifetime and underlying process lifetime are separate concepts.

Clients may disconnect without implicitly terminating work.

Harness should preserve completed authority and results across client failures.

Longer term, host restart behaviour should preserve the fact that work existed even when an underlying process cannot be reattached.

## Agent Supervision and Unified Attention

Governed workflow execution is the immediate product focus, but the original supervision goal remains important.

Harness should eventually provide a unified view across active agent work and answer:

> What is working, what is finished, and what needs me?

Meaningful states are more valuable than raw terminal output.

Useful attention states include:

- working;
- waiting;
- needs input;
- needs approval;
- blocked;
- completed;
- failed.

Multiple concurrent sessions, remote observation and intervention remain intended product capabilities.

They should build on the same execution identity, lifecycle, event and human-interaction substrate where appropriate.

Harness should not delay useful governed execution merely to complete the entire supervisory product first.

## Native Integration and PTY Fallback

Harness should prefer structured or officially supported provider integration where it provides useful semantics.

This may include:

- structured events;
- session identifiers;
- approval APIs;
- machine-readable results;
- usage data;
- tool restrictions;
- resumable sessions.

PTY integration remains a useful fallback.

PTY support should not define the architecture.

Interactive sessions and governed workflow runs may share low-level host execution primitives, but they need not be collapsed into one domain object.

## Project Portability

Harness must become usable on projects other than Harness itself.

Repository names, spike layouts, skill paths and bootstrap exceptions specific to the Harness repository must not be permanent kernel assumptions.

Projects should be able to configure:

- project/workspace identity;
- methodology;
- skill and contract locations;
- protected workspaces;
- executor policy.

Harness development itself is important dogfood, but self-hosting must not become an excuse for permanent recursive complexity.

A real external project is a required forcing function for the architecture.

## Security Direction

Harness controls software capable of reading and modifying source code, executing commands, accessing developer services and acting through privileged host resources.

Trust boundaries should therefore be explicit.

Important principles include:

- least practical capability;
- host-owned credentials;
- mechanically enforced private-workspace boundaries;
- no authority derived merely from model prose;
- bounded host actions;
- explicit execution identity;
- append-only authority;
- no accidental public exposure.

Harness does not need to become a complete security sandbox or secrets-management system.

Security mechanisms should correspond to real threat or failure boundaries rather than speculative completeness.

## What Belongs in the Kernel

The kernel should remain deliberately small.

It should understand generic concepts such as:

- identity;
- authority ledger;
- methodology definitions;
- workflow execution authority;
- role authority;
- execution provenance;
- capabilities;
- workspace grants;
- host actions;
- execution lifecycle;
- semantic results;
- deterministic predicates;
- human authority;
- bounded exceptions;
- telemetry hooks.

It should not need to understand the semantic meaning of names such as:

- Brief Readiness;
- As-Built;
- evaluator repair;
- implementation gap;
- correction cycle.

Those belong to configured methodology and skills.

A mechanism should earn its place in the kernel by enforcing a boundary that cannot safely be left to agent interpretation.

## Near-Term Direction

The immediate priorities are:

1. Consolidate the authority and execution kernel so there is one source of methodology authority and one role-grant model.
2. Establish declarative skill contracts and workflow policy without baking Harness's own development process into the kernel.
3. Support both attached and spawned governed execution under the same authority model.
4. Make routine workflow continuation resumable, bounded and observable.
5. Establish telemetry and provider-usage seams so the cost of Harness can be measured.
6. Remove Harness-repository assumptions from the normal execution path.
7. Install and use Harness on a real second project.
8. Harden the system based on failures observed in that real use.

Multi-session supervision, richer attention-state handling and remote clients remain important product work, but they should not postpone the external workflow pilot unless real usage demonstrates that they are prerequisites.

## Current Non-Goals

Harness is not currently intended to be:

- a replacement for Codex or Claude Code;
- a replacement for an IDE;
- a generic remote terminal product;
- a cloud-hosted development environment;
- a generic business workflow engine;
- an autonomous organization of agents;
- a system that removes human product judgment;
- a generalized distributed scheduler;
- a full secrets-management system;
- a perfect sandbox against a hostile local user;
- a requirement that every model judgment become deterministic.

Harness should not build machinery merely because machinery is possible.

## Architectural Tests

When adding a kernel mechanism, ask:

> What concrete failure or unsafe trust boundary requires this to be mechanical?

When adding methodology to the kernel, ask:

> Could this instead be expressed as a skill contract or workflow policy?

When adding agent instructions, ask:

> Is the model being asked to perform bookkeeping that Harness could derive or perform deterministically?

When adding recovery behaviour, ask:

> Does this preserve history and use generic authority, or are we hard-coding another special case?

When adding automation, ask:

> Can Harness continue safely without the human, and does it know when it should stop?

And at the product level:

> Does this make AI development easier to delegate, govern, observe or intervene in across providers?

If not, it probably does not belong in Harness yet.
