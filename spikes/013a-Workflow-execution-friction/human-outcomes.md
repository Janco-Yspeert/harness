# Human Outcomes — Spike 013a

This document records the human architectural conclusions drawn from Spike 013a after technical verification and acceptance.

It is deliberately separate from `outcome.md`, which remains the methodology's skill-produced Outcome artifact.

This document is historical decision context. It does not replace canonical workflow authority, and future requirements described here become governing only when incorporated into `GOALS.md`, a frozen spike brief, methodology configuration, or another appropriate authoritative artifact.

## Result

Spike 013a is accepted.

The final implementation candidate was:

`c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88`

Cycle 002 ultimately achieved independent verification PASS with all 35 frozen acceptance criteria satisfied.

The spike established that Harness can mechanically bind governed work to exact authority and contract identities, execute protected roles through real providers, distinguish provider-process completion from semantic role completion, preserve durable execution evidence, retry failed executions without rewriting history, and recover workflow execution from canonical authority.

The spike also exposed architectural problems that should not be repaired by adding further special cases to the existing design.

Those findings motivate the next kernel-consolidation work.

## The Main Conclusion

The useful core of Harness has survived the experimentation.

The current layering has not.

The project should preserve the hard boundaries that prevented real failures while removing machinery that exists primarily to reconcile, narrate, or recover duplicated representations of those boundaries.

The direction after 013a is therefore simplification, not abandonment of rigor.

## One Canonical Authority

The most important architectural problem exposed by 013a is the continued existence of competing representations of workflow progress.

Canonical `workflow.jsonl` authority, local `.workflow/state.json`, and host-owned execution state can all contain true information, but they answer different questions.

Only canonical methodology authority should decide what is permitted next.

Operational run state should describe what happened during execution.

Local runner state may remain temporarily as cache or diagnostic information, but it must not independently determine methodology eligibility.

The As-Built dispatch failure after final verification demonstrated this directly:

- canonical authority correctly recorded verification PASS;
- the evaluator run correctly remained semantically blocked because its final direct Git publication failed;
- local runner state consequently did not contain the completion fact required by the As-Built CLI gate;
- As-Built therefore became incorrectly unavailable despite canonical methodology state being sufficient to proceed.

No history should have been rewritten to make those facts agree.

The architecture should instead eliminate the need for them to agree.

## Keep the Authority Ledger, Not the Storage Format

`workflow.jsonl` should remain the single physical canonical authority record for the immediate next work.

The architectural abstraction is an append-only Authority Ledger.

The JSONL representation is an implementation detail that may change later.

A replacement store must eventually become the sole active authority store through an explicit migration or cutover.

Harness should not introduce another authority store beside JSONL and attempt to keep both synchronized.

## Skills, Contracts, and Workflow Policy Should Be Separate

The current skills combine semantic instructions with considerable deterministic bookkeeping.

These concerns should separate into three layers.

### Skill

The agent-facing instructions describing how to reason and perform a role.

This is where semantic judgment belongs.

### Skill Contract

Machine-readable deterministic constraints around that role, including where appropriate:

- required inputs;
- preconditions;
- exact contract identity;
- workspace access;
- capabilities;
- permitted host actions;
- structured outputs;
- postconditions;
- human-interaction permissions.

Harness should enforce these mechanically.

### Workflow Policy

Machine-readable methodology configuration describing:

- which roles exist;
- eligibility;
- transitions;
- automatic continuation;
- correction and retry behaviour;
- human gates;
- escalation rules.

Harness's own development workflow should remain a first-class methodology, but it should be configuration consumed by the Harness kernel rather than logic hard-coded into that kernel.

## Role Authority Must Be Independent of Execution Mode

Harness should authorize a role before deciding how it is executed.

The same resolved role authority should support:

- granting the role to an already-running eligible session; or
- spawning an independent worker.

Spawning a new process should be required where isolation, provenance, workspace boundaries, or provider capabilities require it.

It should not be required merely because a role has a distinct name.

The intended primitive is a resolved Role Grant containing exact authority, role, contract, candidate/basis identity, workspace access and capabilities.

## Workflow-Level Execution Authority

A human instruction to run or continue a workflow should be represented explicitly rather than repeatedly reconstructed at each phase.

A Workflow Execution Grant should authorize routine automatic continuation within a bounded scope.

Individual Role Grants should be derived beneath it.

This should support the intended behaviour:

`run/continue workflow`

followed by routine progression until Harness reaches:

- a human gate;
- exhausted retry/repair policy;
- ambiguous or unknown transition;
- specification or methodology defect;
- required root-authority change;
- unavailable eligible executor;
- or another configured escalation condition.

Routine implementation correction, renewed evaluation, evaluator repair and renewed evaluation should not repeatedly require the human to say "continue."

Observation remains different from execution authority.

A question such as "what happened?" must not itself authorize further work.

## Do Not Let Automatic Recovery Dig a Hole

The workflow should continue autonomously while it is making recognizable progress.

Repeated equivalent failure should become an escalation signal rather than another automatic retry.

Examples include:

- repeated infrastructure failure at the same boundary;
- correction without a new candidate identity;
- evaluator repair without a new evaluator identity;
- repeated semantically equivalent failure;
- exhausted configured retries;
- a transition requiring changed frozen authority.

Harness should suspend and ask the human rather than continuing indefinitely.

## Session Provenance and Eligibility

Attached execution requires eligibility to belong to the particular session, not merely the provider.

Harness should track exposure that it can observe.

A session that has received private evaluator material cannot later become implementation-eligible merely because access is removed.

That exposure cannot be undone.

Where Harness controls private workspace access, this should be recorded mechanically and used when resolving a Role Grant.

If Harness cannot observe an exposure—for example because a human manually pasted hidden information into another session—any declaration about that exposure is necessarily weaker evidence and should remain distinguishable from mechanically observed provenance.

## The Orchestrator Should Use Harness

The orchestrator should not normally assume workflow roles merely because it is capable of performing them.

Its default responsibilities should become:

- observe;
- diagnose;
- obtain or continue workflow execution authority when the human has requested execution;
- ask Harness what work is eligible;
- ask Harness to execute that work;
- await the result;
- continue according to workflow policy.

It may perform a role inline only when Harness determines that the current session is eligible and grants that role to it.

Fallback or direct role assumption should still require Harness authority.

The orchestrator skill should ultimately describe how to use Harness rather than reproduce the workflow itself.

## Semantic Result and Operational Result Must Separate Further

013a correctly separated process completion from semantic role disposition.

The final evaluator run exposed another required separation.

The evaluator substantively established:

- verification result: PASS;
- all 35 criteria satisfied;
- promotion artifacts produced.

But its Harness role disposition became blocked because the evaluator's own final Git push was denied by provider sandbox network policy.

These are separate facts.

Future execution should represent independently:

- provider/process lifecycle;
- role execution disposition;
- semantic methodology result;
- privileged host-action results.

For example:

- role result: succeeded;
- evaluator result: PASS;
- promotion: succeeded;
- publication: failed.

A single `blocked` field should not have to encode all of them.

## Privileged Actions Should Be Host-Mediated

The final publication failure provided strong evidence for a cleaner capability model.

`git-publish` should not mean:

> the worker receives GitHub network access and may execute `git push`.

It should mean:

> the worker is authorized to request publication of an exact result within its Role Grant.

Harness should then mechanically validate and perform the operation using host-held credentials.

The agent receives authority to request an outcome, not the raw privileged mechanism.

The same distinction should apply to other privileged host actions where appropriate.

Credentials should remain host resources rather than agent capabilities or workflow evidence.

## Promotion Should Split Semantic Decision From Mechanical Action

Promotion currently requires the evaluator to perform considerable bookkeeping.

There are two distinct concerns:

1. deciding what evidence is semantically eligible for promotion;
2. faithfully performing promotion.

The evaluator may legitimately need to make the first decision.

Harness should increasingly own the second:

- read approved private artifacts;
- preserve exact bytes;
- calculate identities;
- verify identities;
- copy to allowed public locations;
- generate deterministic metadata;
- commit;
- publish.

The Harness host is the appropriate trusted broker between public and evaluator-private workspaces.

Kernel access to a private workspace does not imply access by the orchestrator or implementation agent.

## Model Bookkeeping Should Move Into Harness

A large amount of current evaluator and workflow complexity exists because agents must manually perform deterministic clerical work, including:

- allocating attempt numbers;
- managing ledgers;
- freezing artifacts;
- calculating identities;
- copying evidence;
- preserving promotion layouts;
- updating manifests;
- sequencing transitions.

The resulting work then requires further evaluation to confirm that the model performed the bookkeeping correctly.

The future rule should be:

> If Harness can derive or perform an operation deterministically, the model should not be responsible for carrying it out correctly through prose or filesystem choreography.

Agents should make semantic judgments.

Harness should perform deterministic mechanics.

## As-Built Remains Canonical

As-Built should remain a canonical Harness methodology skill.

Its intended future role is stronger than the current skill.

It should first independently reconstruct material changes from:

- Git history;
- diffs;
- resulting code;
- resulting tests.

Only after forming that independent account should it inspect earlier role summaries.

It should then compare:

- implemented reality against agent/role reports;
- implemented reality against the frozen brief;
- implemented reality against the Design Map.

It should identify:

- omissions;
- overstatements;
- discrepancies;
- contradictory implementation;
- material contract drift;
- material extra architecture;

while distinguishing those from legitimate implementation freedom.

This evidence-first sequencing is not yet fully represented in the current As-Built skill and should be addressed through the future skill-upgrade process.

## Methodology and Skill Upgrades Need Their Own Process

Changing the rules that govern Harness is currently too difficult because the normal workflow recursively depends on those same rules.

Skill and contract upgrades should eventually use a separate, lighter methodology-maintenance process.

Semantic skill changes and deterministic contract changes should remain distinguishable.

A methodology upgrade changes the rules for future execution.

A process exception authorizes a bounded departure for one historical situation.

These should never be conflated.

## Generic Root Authority Must Replace Bootstrap Exceptions

013a accumulated special bootstrap and recovery logic because the system being changed was also responsible for authorizing its own change.

Harness needs a small explicit root of trust.

Human root authority should be able to issue generic, bounded, append-only exceptions and methodology upgrades.

Exceptions should be data, not code.

They should be:

- explicit;
- scoped;
- identity-bound;
- forward-only;
- auditable;
- optionally one-shot or expiry-bound.

There should be no future equivalent of:

`if spike === "013a"`.

Harness must not require methodology-specific code exceptions to recover from changing that methodology.

## Methodology Definitions Must Be Pinned

A running workflow should bind an immutable Methodology Definition containing exact identities for the workflow policy, skill contracts, and relevant skills.

An execution that starts under methodology M1 remains governed by M1.

Creating M2 should affect future authority rather than silently reinterpret existing history.

This should allow Harness to evolve its own methodology without recursive attempts to make the old methodology retroactively govern the new one.

## Human Interaction Should Become First-Class

Private workers currently often operate in non-interactive mode and terminate when human intervention would otherwise have been useful.

Refusal rather than unauthorized improvisation is desirable.

Repeatedly restarting expensive executions is not.

A governed worker should eventually be able to suspend in a structured:

`WAITING_FOR_HUMAN`

state.

It may request:

- information;
- approval for an already-defined action;
- root authority for a genuinely new permission or exception.

The request should travel through Harness.

A human response that changes what the run is authorized to do must become canonical authority rather than remaining only in conversational prose.

Where the request contains evaluator-private information, Harness should be able to expose it directly to the human without exposing it to an implementation-capable orchestrator session.

## Waiting Must Be Resumable

The orchestrator needs a first-class way to know when delegated Harness work finishes.

An `await` experience is sufficient initially, even for long-running work, provided correctness does not depend on one socket or CLI process remaining connected.

Execution should return a durable Execution Handle.

A caller should be able to reconnect and await the same work later.

Caller disconnection must not imply cancellation.

Cancellation should be explicit.

## Idempotency and Concurrency Matter

Two callers or reconnecting orchestrators must not accidentally launch duplicate work for the same authority basis.

For a given canonical basis, automatic continuation should allocate the next role at most once unless workflow policy explicitly authorizes retry or replacement.

This is a kernel invariant rather than an orchestrator convention.

## Restart State Must Not Vanish

Full process resurrection after a Harness daemon restart is not required immediately.

However, durable authority and execution identity must not disappear.

If Harness restarts while a provider execution was running and cannot reattach, that execution may become interrupted or lost.

It must not become nonexistent.

## Executor Selection Is a Policy Concern

Provider, model and reasoning depth should ultimately be selectable per role.

The architectural seam should support:

- provider preference;
- model choice;
- reasoning depth;
- isolation requirements;
- capability requirements;
- provider availability;
- usage limits;
- cost.

For example:

- Codex preferred;
- Codex usage exhausted;
- Claude eligible;
- automatically select Claude.

Provider fallback should address execution availability.

Semantic implementation failure should not automatically cause provider switching unless methodology policy explicitly permits it.

Skills should ultimately become agent-neutral, with provider-specific wrappers/adapters rather than provider semantics embedded in the skill itself.

## Telemetry Must Be Designed In

The next kernel should expose telemetry hooks even if meaningful measurement is implemented in a later spike.

Two sources should remain distinguishable.

### Harness-observed

Examples:

- allocation/start/terminal timestamps;
- wall-clock time;
- retries;
- role execution count;
- host actions;
- actual provider/model selected;
- time waiting for human input.

### Provider or agent-reported

Examples:

- provider token/usage data where directly available;
- usage snapshots;
- role-specific reported statistics.

Where practical, Harness may measure provider usage through before/after provider usage snapshots and calculate a delta.

Agent-reported metrics must remain visibly different from mechanically observed metrics.

A failure to collect telemetry must never invalidate otherwise successful methodology work.

Human interventions should eventually be counted from structured Harness human-request events rather than relying on the skill to self-report them.

## Project Identity and Portability

The current architecture still contains Harness-repository assumptions such as spike paths, skill locations and bootstrap-specific knowledge.

Execution authority should ultimately bind explicit:

- project identity;
- repository/workspace identity;
- workflow instance identity.

Portability should be a deliberate consequence of configuration rather than a collection of renamed Harness paths.

A real second-project pilot remains an essential forcing function.

## Workspace Grants Need Explicit Meaning

Workspace access should become explicit and named rather than depending on positional or path conventions.

Useful concepts include:

- project;
- private evaluation;
- scratch;
- public evidence;
- private evidence.

A workspace grant should have an identity, visibility, access mode, ownership and lifetime.

Giving a session a protected workspace grant should update its persistent execution provenance.

## Schema Evolution Must Be Possible

New persistent objects introduced by the kernel should have explicit schema versions from the beginning.

This includes, where applicable:

- methodology definitions;
- workflow execution grants;
- role grants;
- human authority records;
- host-action requests/results;
- structured role results.

A full migration framework is not required immediately.

Anonymous persisted JSON shapes should nevertheless be avoided.

## Failure Categories Must Remain Distinguishable

The kernel should avoid collapsing materially different outcomes into a generic failure.

At least conceptually distinguish:

- semantic failure;
- provider failure;
- infrastructure failure;
- authority denial;
- workflow-policy stop;
- human gate;
- host-action failure;
- cancellation;
- interruption.

Workflow policy may decide how these categories affect continuation.

## 011 Cycle 002 Should Not Be Resumed Immediately

The frozen 013a brief stated that accepted 013a should immediately resume Spike 011 Cycle 002 as the first production use of the corrected machinery.

That was reasonable when 013a's resulting architecture was expected to be the path forward.

The final stages of 013a exposed deeper problems in that machinery:

- duplicate canonical/local workflow state;
- conflation of role result and later host-action failure;
- publication behaviour that should become host-mediated;
- continued methodology-specific logic inside the execution machinery.

The human decision is therefore to defer the Spike 011 Cycle 002 recovery until after the kernel-consolidation work rather than spend another cycle validating machinery that is about to change.

This does not alter 013a's frozen brief or historical acceptance.

After the new kernel exists, Spike 011 should be reconsidered.

It may serve as a valuable historical regression case under the new architecture, or its remaining correction cycle may be judged superseded by the later architecture and linked forward accordingly.

That decision should be made from the post-kernel state rather than now.

## Immediate Direction

The intended sequence after closing 013a is:

1. complete the canonical skill-produced `outcome.md`;
2. update `GOALS.md` to reflect the project's current direction;
3. design and run Spike 014 as a kernel-consolidation spike;
4. add execution communication and meaningful telemetry;
5. remove Harness-specific assumptions sufficiently to install and use Harness on a real second project;
6. harden based on that real use rather than another open-ended self-hosting cycle.

The kernel-consolidation work should include explicit concepts for:

- Authority Ledger;
- immutable Methodology Definition;
- Workflow Execution Grant;
- Role Grant;
- Execution Handle;
- Execution Provenance;
- capabilities and workspace grants;
- permitted host actions;
- structured human requests and root-authority responses;
- deterministic preconditions/postconditions;
- bounded automatic continuation;
- telemetry hooks.

The project should stop adding architecture once omission would no longer force a later change to the fundamental identity or authority model.

## Governing Lessons

Harness owns authority, identity, capabilities and evidence.

It should not unnecessarily own every reasoning decision.

Skills should own semantic reasoning.

Contracts should own mechanically enforceable role boundaries.

Workflow configuration should own methodology composition.

The kernel should enforce the generic mechanics beneath them.

The human remains root authority.

And every mechanism should continue to answer one question:

> What real failure or unsafe trust boundary made this necessary?
