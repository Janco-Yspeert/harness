# Spike 011 — Host-Owned Workflow Runs

## Goal

Prove that Harness, rather than an orchestrating Codex/ChatGPT conversation,
owns the lifecycle, identity, visibility, and replacement semantics of delegated
workflow role executions.

The orchestrator remains free to make non-deterministic decisions about how to
recover or which permitted executor to use. Harness owns the durable operational
facts:

- which workflow run is canonical;
- whether it is still active;
- which executor owns it;
- where it is working;
- what process/provider session belongs to it;
- how it ended;
- whether replacement is permitted; and
- what execution/accounting evidence the run produced.

This is an inversion-of-control spike.

It does **not** yet make Harness responsible for deciding the next methodology
phase. The Codex app may remain the bootstrap orchestrator for this cycle, but it
must request canonical role execution through Harness rather than owning child
process lifecycle itself.

## Product thesis

Harness already has a product principle that the host owns agent work and that
clients may attach and detach without owning session lifetime.

Recent methodology cycles exposed the same requirement at the workflow layer.

An orchestrating application can correctly respect Harness's semantic authority
while still losing operational track of a delegated evaluator, launching a
replacement unnecessarily, burning additional model work, and polluting a shared
workspace.

A conversation turn is not a sufficient process registry.

Spike 011 applies the original Harness host/session thesis to methodology role
execution:

```text
Harness owns execution truth and lifecycle.
Codex reasons over that truth and chooses among legal actions.
```

## Context and preserved work

Spike 010c is complete as historical evidence and has a forward-only human
rejection classified as `IMPLEMENTATION_GAP`.

Spike 011 is **not** the corrective successor for those implementation gaps.
The remaining Spike 010c evaluator-integrity defects are deliberately deferred
to a later corrective cycle if required.

Spike 011 may cite the observed orchestration failures from Spikes 008–010c as
motivation, but must not rewrite those histories or imply that their technical
results are repaired by this spike.

## Scope

### 1. The existing Harness host/runtime owns workflow executions

Workflow role executions must be owned by the existing Harness host/runtime
architecture under `src/`.

Spike 011 must not satisfy host ownership by creating a separate
methodology-specific daemon, workflow daemon, or second long-lived service beside
the existing Harness host.

Shared lower-level execution/run abstractions may be introduced where interactive
sessions and workflow runs require different domain semantics, but they must be
integrated into the existing Harness host lifecycle rather than creating a
parallel control plane.

Starting a role execution through the supported workflow/run interface must not
make the initiating Codex conversation, shell, browser, or CLI process the owner
of that execution.

A client may disconnect after requesting a run. While the Harness host remains
alive:

- the delegated worker continues according to its own lifecycle;
- Harness retains the canonical run record;
- the run remains inspectable;
- completion/failure remains observable; and
- a later client can reconnect and inspect the same run.

Daemon-restart persistence is not required by this spike.

### 1A. Reuse product runtime without collapsing domain concepts

Spike 011 should reuse and generalize the existing Harness host/session/backend
substrate where it is genuinely shared.

It must not assume that an interactive user session and a workflow role execution
are the same domain object merely because both are host-owned.

The Design Map should make the smallest useful separation between:

- shared execution concerns such as identity, lifecycle, backend/provider,
  events, logs, cancellation, and process/session ownership;
- interactive-session concerns such as client attachment and user input; and
- workflow-run concerns such as role/phase slot, execution attempt, permission
  profile, replacement semantics, and completion binding.

The current single-active-session implementation may be generalized as required
to support independently identifiable concurrent executions. That
generalization should serve the broader Harness runtime rather than exist only
inside methodology tooling.

### 2. Canonical workflow-run identity

Every workflow-owned execution has a stable Harness run identity and a durable
host-side record for the lifetime of the host.

The run record must carry enough information to answer at least:

- workflow/spike identity;
- workflow phase or role slot;
- methodology/workflow attempt identity where one exists;
- execution attempt identity;
- role;
- skill and skill version when known;
- actual executor/provider;
- invocation mode such as delegated, direct, retry, or fallback;
- reason for retry/replacement/fallback when applicable;
- allowed workspace(s);
- permission profile identity;
- process id and/or provider session identity when available;
- created/started/last-activity/terminal timestamps;
- current lifecycle status;
- terminal disposition/reason;
- parent/orchestrator identity when reliably available; and
- diagnostic log/event location.

Do not invent unavailable provider/model metadata.

### 3. Execution attempt is distinct from methodology attempt

Operational worker replacement must not silently mutate methodology semantics.

Harness must distinguish:

```text
workflow/evaluator attempt
```

from:

```text
execution attempt for the worker process/session
```

For example, replacing a Claude process that failed to launch correctly may
create execution attempt 002 for the same evaluator-preparation workflow slot
without manufacturing a new frozen evaluator revision or verification attempt.

The exact identifiers are Design Map freedom, but the distinction must be
observable and testable.

### 4. One active canonical execution per run slot

For the scope of Spike 011, a workflow role slot may have at most one active
canonical execution attempt.

A repeated start request for an already-active slot must:

- return/identify the existing active run, or
- fail with an explicit conflict;

and must **not** spawn a second worker.

The check and allocation must be concurrency-safe within one Harness host.

This rule applies even when multiple clients or orchestrator turns make the same
request.

Later workflow work may explicitly permit parallel executions for particular
roles. Spike 011 does not.

### 5. Explicit cancellation, replacement, retry, and fallback

An active worker may not be silently replaced.

Before Harness allocates a replacement execution, the previous execution must
have an explicit terminal disposition such as:

- failed;
- cancelled; or
- replaced.

The replacement record must preserve:

- the prior execution identity;
- the new execution identity;
- the reason for replacement; and
- any executor change.

Fallback is legitimate.

For example, if delegated As-Built execution fails and Codex is selected as the
fallback executor, Harness must be able to represent:

```text
role: as-built
executor: codex
mode: fallback
reason: delegated executor failed
```

rather than making the fallback indistinguishable from the originally intended
execution path.

### 6. Workflow dispatch uses the existing Harness host-owned run mechanism

The existing methodology workflow runner must no longer directly own detached
child-process execution for canonical workflow runs.

The supported `tools/workflow.ts` execution path (or its Design-Map-approved
successor) must request/attach to a run owned by the existing Harness host/runtime
architecture. It must not dispatch through a methodology-only process supervisor
that bypasses the product host.

A directly launched Codex/Claude process outside this mechanism may exist on the
host, but it is **not** a canonical execution for the workflow slot merely
because it writes plausible artifacts.

Completion recorded through the workflow runner must correspond to the terminal
state of the canonical run allocated for that phase/attempt.

This spike does not otherwise redesign the public artifact authority in
`workflow.jsonl`.

### 7. Minimum run event surface

Harness must expose structured run events sufficient to supervise the owned
execution without treating raw terminal text as workflow state.

At minimum the observable lifecycle must distinguish equivalents of:

- allocated;
- started/running;
- activity/output observed;
- terminal completion;
- terminal failure;
- cancellation; and
- replacement.

Where the executor/provider exposes a meaningful permission-blocked or
attention-needed event cheaply, Harness may surface it, but full normalized
permission-event handling is not required for Spike 011.

Provider-specific events may be retained alongside the normalized lifecycle.

The existing Harness structured-event/domain protocol should be reused where
natural rather than inventing a second unrelated event system.

### 8. Raw executor text is diagnostic, not canonical methodology evidence

Harness must retain enough stdout/stderr or provider text/event detail to debug
and supervise an owned run.

That execution log is associated with the run and remains inspectable.

However:

- raw Claude/Codex conversation text is not automatically a frozen methodology
  artifact;
- downstream roles do not automatically receive the previous role's transcript;
- workflow completion is not inferred from a phrase in agent output; and
- canonical methodology evidence remains the explicit artifacts, Git
  provenance, authority records, and run receipts required by the relevant
  contracts.

A later retention policy may prune old diagnostic logs. Spike 011 need not
define long-term archival retention.

### 9. Routine role-authorized work must be non-interactive

A workflow-owned worker must be able to perform ordinary work within its
declared workspace without repeatedly interrupting the human for command-level
approval.

The permission model should be capability/workspace-oriented rather than a
fragile list of individual shell binaries.

A standard repository-local worker profile must permit, within its allowed
workspace(s), ordinary operations such as:

- repository reads;
- role-authorized file creation/editing;
- arbitrary local computation needed by the role, including shell child
  processes such as Python/Node utilities;
- test/build/typecheck/lint/format commands;
- normal Git inspection;
- Git staging and commit where the active role permits it; and
- the workflow's ordinary local bookkeeping.

Evaluator preparation may additionally require an explicitly declared private
evaluator workspace.

The run must record which permission profile was applied.

### 10. Preserve sandbox/security boundaries

Non-interactive does not mean unrestricted host authority.

Spike 011 must not require routine use of Codex
`--dangerously-bypass-approvals-and-sandbox`, Claude
`bypassPermissions`, or an equivalent unrestricted-host mode.

The initial provider adapter may use a provider-native sandbox/permission mode or
another bounded local mechanism that allows arbitrary local computation **inside
explicitly permitted workspace boundaries**.

Operations outside the role's delegated boundary may fail or surface as
attention/permission state. They must not justify silently launching a second
worker.

A narrow bootstrap exception for a specific provider limitation must be explicit
in the Design Map and execution record; unrestricted execution must not become
the default permission profile.

### 11. Lightweight execution accounting

Harness must record cheaply and directly observable run metrics sufficient to
start evaluating orchestration cost.

At minimum, where available without model estimation:

- allocated/start/end timestamps;
- elapsed run time;
- executor/provider;
- number of execution attempts/replacements for the slot; and
- terminal disposition.

If provider-native token, usage, or cost statistics are directly available,
they may be recorded.

Do not estimate tokens or cost manually and do not make unavailable usage data a
blocking requirement.

### 12. Codex remains the bootstrap orchestrator for this spike

Spike 011 does not require a fully autonomous Harness workflow scheduler.

For this cycle, Codex may continue to decide actions such as:

- start the next explicitly known role;
- inspect an active run;
- cancel a genuinely stuck run;
- request a replacement;
- select an allowed fallback executor; or
- perform a permitted role itself through a newly allocated Harness run.

The important inversion is that Codex no longer owns the delegated worker
process/session or silently creates a second canonical execution.

Progress reports and conversation turns are clients of Harness-owned state, not
the source of that state.

## Failure and recovery semantics

For the scope of this spike:

```text
ACTIVE
  ├─ normal terminal success → COMPLETED
  ├─ worker/process failure → FAILED
  ├─ explicit cancellation → CANCELLED
  └─ explicit replacement → REPLACED
```

Only a terminal prior execution can be followed by a replacement execution for
the same slot.

A client disappearing does **not** terminalize the run.

An unknown/lost client does **not** imply the worker is lost.

A worker whose liveness cannot be established must be explicitly classified
before replacement rather than treated as absent by assumption.

Exact lifecycle naming may differ in the Design Map as long as these semantics
are preserved.

## Non-goals

- no wholesale rewrite of `GOALS.md` in this spike; product-language changes
  should follow demonstrated implementation evidence from Spike 011 rather than
  pre-empt it;
- no correction of the remaining Spike 010c evaluator-integrity implementation
  gaps;
- no fully deterministic methodology phase scheduler;
- no Harness-owned automatic decision of which phase comes next;
- no full agent-neutral skill rewrite;
- no methodology installation/package system;
- no complete permission broker or human approval UI;
- no full Claude structured-hooks/native-backend integration;
- no requirement that Codex and Claude expose identical event vocabularies;
- no provider-independent token/cost accounting;
- no daemon-restart workflow persistence;
- no worktree automation;
- no hostile same-user security/isolation proof;
- no remote/mobile workflow UI;
- no generic distributed job scheduler;
- no automatic feeding of executor transcripts into later roles.

## Acceptance Criteria

1. Canonical workflow role executions requested through the supported workflow
   path are owned by the existing Harness host/runtime architecture rather than
   by the initiating client process or a new methodology-specific daemon.

2. A client can disconnect after launch without terminating or losing the
   Harness-owned run while the host remains alive.

3. A later client can inspect the same active or terminal run by stable Harness
   identity.

4. The run record contains workflow slot, execution-attempt, role, executor,
   invocation mode, workspace, permission-profile, lifecycle, timestamps, and
   available process/provider identity.

5. Methodology/workflow attempt identity and operational execution-attempt
   identity are represented separately.

6. Two concurrent/repeated start requests for the same active workflow slot
   produce at most one child/provider execution.

7. A duplicate start request returns the existing run or an explicit conflict
   rather than spawning another worker.

8. Replacement cannot be allocated while the prior canonical execution for that
   slot remains active.

9. Replacement terminalizes and preserves the prior execution and records the
   reason and executor/fallback change where applicable.

10. The canonical `tools/workflow.ts` execution path (or its approved successor)
    uses the existing Harness host-owned run mechanism rather than directly
    owning detached workflow child processes or routing through a parallel
    methodology-specific daemon.

11. A workflow phase cannot be recorded complete through that runner unless the
    canonical run for the matching phase/attempt is terminally complete.

12. Harness exposes structured run lifecycle events for allocation, start,
    activity/output, completion/failure, cancellation, and replacement.

13. Execution text/logs remain inspectable and tied to the run but are not
    automatically treated as frozen methodology evidence or downstream role
    context.

14. A standard workflow worker can perform routine repository-local reads,
    writes, arbitrary local computation, tests/checks, and role-permitted Git
    operations without per-command human prompts.

15. Evaluator execution can declare an additional private evaluator workspace
    without granting arbitrary unrestricted host access.

16. Routine workflow execution does not require unrestricted permission/sandbox
    bypass mode.

17. The applied permission profile is recorded on the run.

18. Run accounting records directly observable elapsed time, executor, execution
    attempt/replacement count, and terminal disposition.

19. Directly launching a plausible Codex/Claude process outside the Harness run
    mechanism does not create a canonical run or satisfy the workflow runner's
    completion requirement.

20. Visible regression coverage demonstrates client detachment, duplicate-launch
    prevention, replacement ordering, terminal-completion binding, event
    visibility, and diagnostic-log/noncanonical separation without requiring
    live paid provider calls.

21. Existing Harness session/backend behaviour remains green; repository tests,
    typecheck, lint, formatting, and `git diff --check` pass.

## Expected workflow for Spike 011 itself

Spike 011 is necessarily a bootstrap cycle because the host-owned workflow-run
mechanism does not exist at its start.

For this spike only:

1. the Codex app may continue orchestrating the existing methodology workflow;
2. existing `tools/workflow.ts` process dispatch may be used until the Spike
   011 implementation is available;
3. every delegated executor should still be treated as a single canonical
   bootstrap execution by the orchestrator;
4. before launching a replacement, the orchestrator must inspect and explicitly
   classify/terminate the previous execution rather than assuming it is gone;
5. avoid unrestricted sandbox/permission bypass unless a concrete provider
   limitation is encountered and recorded;
6. do not fabricate run receipts for pre-implementation work that occurred
   before the new mechanism existed; and
7. use the Spike 011-produced run mechanism during verification/demonstration
   where doing so does not change the frozen evaluator semantics.

After Spike 011 is accepted, later methodology cycles may rely on its
host-owned-run semantics.

## Expected methodology sequence

1. draft and commit this brief on `feat/spike-011`;
2. run Brief Readiness and freeze only after PASS;
3. create and freeze the Design Map;
4. prepare/freeze evaluation;
5. implement host-owned workflow runs;
6. verify the frozen contract;
7. promote only after trustworthy PASS;
8. create As-Built;
9. obtain human acceptance/rejection; and
10. create Outcome.

The next likely methodology/product work after this spike is deterministic
workflow phase/end-contract control over these host-owned runs. Agent neutrality
and methodology installability remain intentionally deferred until that workflow
kernel is stable enough to generalize.
