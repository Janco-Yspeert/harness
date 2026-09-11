# Spike 013 — Workflow Execution Friction and Delegated Role Authority

## Context

Harness now has host-owned workflow runs, explicit workflow authority, correction cycles, evaluator repair, executor selection, permission profiles, and durable separation between methodology authority and operational execution state.

Using those mechanisms to reopen Spike 011 exposed several failures in the actual workflow experience. Some are CLI and state-management defects. One is a direct incompatibility between Harness orchestration and the current Claude/evaluator-skill invocation model.

### Observed Spike 011 Cycle 002 failure

Spike 011 Cycle 002 was validly opened from the preserved Cycle 001 human rejection. That rejection requires both an implementation correction and evaluator repair.

Harness then allocated this host-owned workflow run:

```text
workflow: 011-host-owned-workflow-runs
phase: evaluator-repair
executor: claude
permissionProfile: repo-local-worker
```

The host successfully launched Claude with the evaluator-repair role.

Claude did **not** perform the repair.

It read `skills/evaluator/SKILL.md`, observed that the skill is marked:

```yaml
disable-model-invocation: true
```

and interpreted the skill's explicit-invocation guard as prohibiting execution from a delegated Harness prompt.

Claude responded, in substance:

> The evaluator skill is reserved for explicit user invocation. A prompt saying
> "Use the evaluator repository skill in repair mode" does not count as the user
> invoking `/evaluator repair ...`, so I will not perform the evaluator workflow.

It instructed the human to run:

```text
/evaluator repair spikes/011-host-owned-workflow-runs
```

manually.

This is not the desired Harness operating model.

The original evaluator guard exists for a good reason: an implementation agent, orchestrator, or arbitrary prompt must not be able to decide to assume evaluator authority.

However, Harness now has an explicit workflow authority and host-owned role-allocation mechanism. A legitimate Harness allocation of an evaluator role needs a way to constitute **real delegated authority**, distinguishable from an ordinary prompt merely claiming to possess that authority.

The desired property is therefore not:

> Models may invoke the evaluator skill.

Nor is it:

> Only a human typing a slash command may invoke the evaluator skill.

It is:

> A protected evaluator role may execute only when explicitly invoked by the
> human or when mechanically authorized by a valid Harness evaluator-role
> allocation.

The exact mechanism by which Claude or another executor recognizes that delegated authority remains an implementation/design question for this spike. Merely changing the prose prompt to sound more authoritative is insufficient.

### Secondary observed failure: Claude refusal recorded as completion

Although Claude explicitly refused to perform the assigned evaluator-repair role, its process exited normally.

Harness subsequently reported:

```text
status: completed
terminalDisposition: completed
terminalReason: null
```

This demonstrates that Harness currently conflates two different facts:

```text
the provider process terminated successfully
```

and:

```text
the allocated methodology role completed successfully
```

They are not equivalent.

For the observed run, the accurate semantics were closer to:

```text
process: completed
role: refused / blocked / not-completed
```

The exact role-disposition vocabulary remains a Design Map decision, but Harness must no longer treat normal provider-process termination as sufficient evidence that the allocated methodology role was performed.

### Other observed workflow friction

The same Spike 011 recovery attempt exposed additional problems:

1. `authority status` reported `correctionPermitted: true` while its apparent `legalTransitions` omitted `correction-cycle-opened`.

2. Running `workflow dispatch evaluator-repair <spike>` without `--execute` printed the provider command but consumed the operational dispatch attempt.

3. Pre-execution failure, including an unavailable Harness host, can leave operational state that requires manual repair before retry.

4. A successful host allocation returns control with insufficient operator feedback. The human had to inspect workflow state, recover the run ID, query `/workflow-runs/<id>`, and then query `/workflow-runs/<id>/log` to discover that Claude had refused the role.

Together these failures leave the human acting as glue between workflow authority, the Harness host, provider execution, protected repository skills, and workflow state.

## Objective

Make an already-authorized Harness workflow executable with substantially less human mediation.

In particular, prove that Harness can legitimately delegate a protected evaluator role to Claude without requiring the human to manually translate that allocation into a `/evaluator ...` slash command.

A valid Harness workflow-role allocation must be capable of:

* carrying mechanically distinguishable delegated authority;
* allowing the selected executor to execute the corresponding protected repository skill;
* preserving evaluator-role isolation;
* exposing useful run state;
* and reporting whether the methodology role actually completed rather than merely whether the provider process exited.

Spike 013 is successful when the blocked Spike 011 Cycle 002 evaluator-repair path can be resumed through Harness without requiring the human to manually invoke `/evaluator repair`, edit `.workflow` state, or infer successful role completion from raw Claude output.

## Delegated evaluator authority

The current combination of Claude and `disable-model-invocation: true` is explicitly in scope.

Spike 013 must determine how a host-authorized Harness evaluator allocation is represented to the executor so that Claude can distinguish:

```text
ordinary model/prompt request
    → evaluator invocation forbidden
```

from:

```text
valid Harness evaluator-role allocation
    → evaluator invocation authorized
```

The solution must not rely solely on wording such as:

```text
This is the evaluator-repair role in the canonical Harness workflow.
```

That is only a claim made inside a prompt and can be reproduced by an unauthorized caller.

The authorization must be grounded in something Harness controls and can validate.

Possible mechanisms may include changes to skill invocation semantics, executor invocation mode, host-provided authority context, a dedicated delegated entry point, or another mechanism established by the Design Map.

The brief deliberately does not prescribe which mechanism is correct.

However, simply removing `disable-model-invocation`, deleting the evaluator guard, or telling Claude to ignore it does **not** satisfy the spike.

Provider-specific accommodation for Claude is acceptable where Claude's invocation model genuinely requires it, but the methodology-level authority semantics should not unnecessarily become Claude-specific.

## Process outcome versus role outcome

Harness must distinguish provider execution lifecycle from methodology-role outcome.

At minimum the resulting model must be capable of representing the observed case:

```text
Claude launched
Claude returned normally
Claude refused evaluator-repair
```

without reporting the evaluator-repair role itself as successfully completed.

The exact representation is implementation freedom.

A successful provider exit may be evidence about process health. It is not sufficient authority for advancing methodology state.

## Dispatch and observability requirements

A prospective dispatch inspection must not consume an execution attempt.

A genuine dispatch must make it obvious that a host-owned run was allocated and expose enough information to inspect it.

Pre-execution allocation/host failures must be retryable without manually editing ignored workflow-state JSON.

The operator must have a straightforward way to determine:

* workflow and role;
* run identity;
* executor;
* process state;
* methodology-role disposition;
* and relevant output/log location.

A browser UI is not required.

## Authority-status correctness

`authority status` must not describe the subset of transitions that happen to validate against empty evidence as though that were the definitive list of legal next transitions.

Evidence-bearing transitions such as `correction-cycle-opened` must be discoverable when structurally available, together with an indication that evidence is required.

The exact status representation remains open.

## Evaluator / methodology bootstrap exception

Spike 013 is likely to modify `skills/evaluator/SKILL.md`, its `disable-model-invocation` behavior, its explicit-invocation guard, or closely related evaluator invocation semantics.

That creates the same class of self-reference problem previously encountered when Harness changed its evaluator methodology.

The evaluator used to prepare and verify Spike 013 must therefore be pinned **before implementation** to an immutable pre-Spike-013 evaluator authority.

Its exact content identity and committed provenance must be recorded.

Evaluation execution must mechanically bind that pinned authority rather than resolving the potentially modified `skills/evaluator/SKILL.md` from the candidate working tree.

The candidate must not be able to modify the evaluator authority by which it is judged.

This process exception exists specifically because the spike may alter the mechanism that normally determines whether and how the evaluator itself can be invoked.

It does not waive independent evaluation.

If the pinned evaluator cannot fairly evaluate the proposed new behavior without changing acceptance semantics after seeing the implementation, the spike must block rather than silently adopting the modified evaluator.

## Explicit non-goals

Spike 013 does not:

* redesign the entire Harness methodology;
* introduce Light / Standard / Rigorous profiles;
* solve the broader question of whether a small repository change should enter a Harness workflow;
* implement token/cost telemetry;
* implement general model/reasoning configuration;
* require a browser workflow UI;
* introduce generic agent-to-agent communication;
* remove evaluator independence;
* or make protected skills freely model-invocable.

The broader workflow-entry/friction problem remains a later spike.

This spike asks the narrower question:

> Once Harness has legitimately allocated a governed role, can it actually cause that role to execute without the human impersonating the orchestration layer?

## Acceptance criteria

**AC01 — Claude delegated evaluator execution**

A valid host-owned Harness evaluator-role allocation can cause Claude to execute the protected evaluator role without requiring the human to manually enter `/evaluator ...`.

**AC02 — Explicit invocation remains valid**

Direct human invocation of the evaluator remains a valid authorization path.

**AC03 — No authority by prompt wording**

An ordinary Claude/model invocation cannot obtain evaluator authority merely by containing text claiming to be a Harness evaluator allocation.

**AC04 — No opportunistic evaluator invocation**

Implementation agents and other ordinary workflow roles cannot independently elect to invoke or become the evaluator.

**AC05 — Mechanically grounded delegation**

Harness delegated evaluator authority is represented through a mechanism controlled and validated by Harness rather than solely through natural-language instruction.

**AC06 — Process/role distinction**

Harness durably distinguishes provider/process lifecycle from methodology-role disposition.

**AC07 — Claude refusal is not role success**

A controlled Claude run that exits normally while refusing or blocking its assigned role must not be represented as successful completion of that role.

**AC08 — Successful role completion is observable**

A successful delegated evaluator execution produces a machine-readable role-complete outcome distinguishable from process exit alone.

**AC09 — Non-consuming inspection**

Inspecting or planning a prospective dispatch does not consume an execution attempt.

**AC10 — Recoverable pre-execution failure**

Host-unreachable, allocation, or equivalent failure before genuine worker execution can be retried without manually editing `.workflow/state.json`.

**AC11 — Dispatch visibility**

Successful dispatch immediately exposes the host-owned run identity, role, executor and useful status/inspection information.

**AC12 — Run observability**

The operator can straightforwardly determine process state, methodology-role disposition and relevant output for a host-owned workflow run.

**AC13 — Honest authority status**

Authority status does not present empty-evidence validation results as the definitive set of legal next transitions.

**AC14 — Correction transition discoverability**

The preserved Spike-011-shaped repairable rejection state exposes `correction-cycle-opened` as an available evidence-bearing transition.

**AC15 — Durable history**

Retry/recovery semantics do not erase genuine historical executions or rewrite canonical workflow authority.

**AC16 — Bootstrap evaluator isolation**

Spike 013 preparation and verification use an immutable pre-Spike-013 evaluator authority whose identity and provenance are mechanically bound to the evaluation execution path.

**AC17 — Evaluator mutation cannot judge itself**

Changes to the working evaluator skill or invocation semantics cannot replace the frozen evaluator authority used to verify Spike 013.

**AC18 — Actual host-boundary evidence**

At least one bounded integration path establishes actual delegated protected-role execution through the Harness host.

Static inspection of command construction, permission profiles, prompts, or configuration is insufficient.

**AC19 — Actual Claude evidence**

At least one bounded evaluation uses the real Claude executor path sufficiently to demonstrate that the original refusal condition has been resolved.

A provider-free mock alone cannot establish this criterion.

**AC20 — Spike 011 recovery readiness**

After Spike 013 passes, the existing open Spike 011 Cycle 002 evaluator-repair role can be retried through Harness without manual `/evaluator repair` invocation or manual `.workflow` state repair.

Spike 013 does not itself advance Spike 011 authority.

## Completion boundary

Spike 013 ends after independent verification against the pinned pre-Spike-013 evaluator authority, normal promotion/As-Built where applicable, and human acceptance.

Do not advance Spike 011 as part of Spike 013 implementation or evaluation.

After Spike 013 is accepted, resume the already-open Spike 011 Cycle 002 through the corrected workflow path.

That real Spike 011 recovery is the first production use of the mechanism established here.

## Follow-on

The intended sequence after Spike 013 is:

1. resume and complete Spike 011 Cycle 002;
2. implement executor cost/token/time/model/reasoning telemetry and configuration;
3. separately address workflow-entry and lightweight-change friction;
4. continue methodology portability, agent neutrality, and installability work.

The governing principle for Spike 013 is:

> Harness authority should authorize work; the human should not have to re-authorize the same work by manually speaking the executor's private invocation dialect.
