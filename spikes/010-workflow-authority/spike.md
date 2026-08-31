# Spike 010 — Workflow Authority and Guarded Transitions

## Goal

Turn the repository-local Harness workflow tooling from primarily a phase runner
and bookkeeping mechanism into a small deterministic **methodology authority**.

Harness must validate whether canonical workflow transitions are legal, preserve
the provenance that makes those transitions meaningful, and expose what may
happen next.

It must **not** become the workflow orchestrator.

Coding agents remain responsible for reasoning, sequencing work, implementation
decisions, investigation, and failure classification. Human judgment remains
authoritative where the methodology requires it.

The intended boundary is:

```text
Agent / human decides what should happen
                ↓
        proposes transition
                ↓
        Harness validates:
        - current workflow state
        - required prior transitions
        - attempt/revision identities
        - public evidence and provenance
        - transition-specific invariants
                ↓
          ALLOW / DENY
                ↓
Agent / human continues orchestration
```

Harness is the border authority, not the project manager.

## Context

Spike 008 introduced a repository-local workflow runner.

Spike 009 corrected important runner semantics:

- implementation and evaluator-verification attempts are independently numbered;
- verification explicitly references the implementation it evaluates;
- blocked evaluator verification may be retried against an unchanged
  implementation;
- implementation retry requires a recorded implementation-failure path;
- executor choice is role-based rather than vendor-owned;
- failed executor launch does not consume an attempt; and
- the runner is repository-development tooling rather than Harness runtime
  behavior.

Spike 009 was deliberately executed **without using the runner as the
orchestrator**.

The surrounding ChatGPT/Codex agent successfully sequenced Brief Readiness,
Design Map, evaluator preparation, implementation, evaluator correction,
verification, promotion, As-Built, Outcome, Git handoffs, and related evidence.
The user was required only for final acceptance.

This is desirable evidence.

Harness does not need to reproduce orchestration that a capable agent host can
already perform.

However, Spike 009 also exposed the weakness of a passive bookkeeping model.

Evaluator revision `001` contained a genuine fixture defect. It was preserved
and corrected as revision `002`, but the defect was discovered while the
prepared evaluator was being validated against the candidate implementation
before an official verification attempt had been allocated.

The resulting implementation and evaluator evidence remained credible, but the
chronology was governed by agent discipline rather than mechanically enforced
workflow state.

A sufficiently autonomous agent should be allowed to orchestrate freely, but it
should not be able to accidentally smooth over distinctions such as:

- evaluator preparation versus verification;
- evaluator revision versus verification attempt;
- implementation failure versus evaluator defect;
- failed verification versus blocked verification;
- unchanged implementation versus implementation retry;
- PASS versus promotion;
- promotion versus human acceptance; or
- conversational claims versus committed provenance.

Evaluator v8 also establishes that hidden tests are optional when the frozen
contract does not provide a stable implementation-independent seam. The
methodology authority must preserve that distinction rather than treating the
existence of hidden tests as workflow completion evidence by itself.

Spike 010 establishes a deterministic authority for these boundaries.

## Scope

Update the repository-local workflow tooling introduced by Spikes 008 and 009.

### 1. Separate methodology authority from process dispatch

The workflow model must distinguish:

1. **operational execution**
   - dispatching an agent;
   - executor selection;
   - process launch;
   - logs;
   - liveness;
   - cancellation;

from:

2. **canonical methodology state**
   - frozen handoffs;
   - implementation identity;
   - evaluator revision identity;
   - verification allocation;
   - verification result;
   - retry eligibility;
   - promotion state;
   - final acceptance readiness.

Dispatching or launching a process must not by itself advance canonical
methodology state.

A phase may be performed entirely outside `workflow.ts`, including through an
existing ChatGPT, Codex, Claude Code, or other agent-host session, provided its
canonical result is later presented to the workflow authority through a valid
transition.

Existing process-dispatch functionality may remain as convenience tooling.

It is not the source of methodological truth.

### 2. Canonical guarded transitions

Provide a small machine-readable interface through:

```text
npm run workflow -- ...
```

that can:

- report the current canonical workflow state;
- report legal next transitions;
- validate a proposed transition without mutating canonical state; and
- record/advance a transition only when its required public evidence and prior
  state are valid.

The exact command names and argument shape may be established by the Design Map.

The public surface must preserve a clear distinction between:

```text
Can I do this?
```

and:

```text
Record that this canonical transition has occurred.
```

A rejected transition must leave canonical methodology state unchanged and
explain the violated public invariant.

### 3. Durable public methodology record

Canonical methodology history must not depend solely on ignored `.workflow/`
operational state.

Introduce a safe public workflow record under the spike directory, with exact
location and representation established by the Design Map.

The record must be:

- append-oriented;
- machine-readable;
- ordered;
- sufficient to reconstruct canonical methodology state;
- safe for normal public repository history; and
- free of evaluator-private mechanics.

`.workflow/` remains local operational state for jobs, logs, and other
non-canonical execution details.

The public workflow record must preserve enough information to establish
relevant relationships between:

- frozen public artifact identities;
- implementation attempts;
- committed implementation revisions;
- evaluator revisions;
- verification attempts;
- verification results/classifications;
- promotion; and
- later workflow gates.

Do not duplicate private evaluator contents into the public record.

### 4. Public provenance validation

Where a transition claims committed public provenance, Harness must verify
mechanically that the claim matches the repository.

At minimum this applies to:

- frozen brief identity and Git provenance;
- frozen Design Map identity and Git provenance;
- public evaluation-requirements identity where required;
- implementation handoff commit;
- promoted public evaluation evidence where promotion is claimed; and
- other public artifacts used as canonical transition evidence where practical.

Harness must reject stale, mismatched, missing, or otherwise mechanically
invalid public provenance.

Harness does not determine whether the contents are *good*.

It determines whether the claimed artifact and revision actually exist and
correspond to the declared identity.

### 5. Explicit implementation handoff

An implementation becomes eligible for independent verification only after a
canonical implementation handoff has been recorded.

The handoff must identify the exact committed implementation revision.

A verification attempt may not target an uncommitted or ambiguous candidate.

A new implementation handoff after implementation attempt `001` must represent
implementation attempt `002`, and so on.

The authority must not invent a new implementation attempt merely because
evaluator verification was blocked.

### 6. Verification must be allocated before candidate evaluation

A canonical evaluator verification attempt must be allocated **before** the
frozen evaluator is run against the candidate implementation.

Allocation must bind:

```text
verification attempt
→ implementation attempt
→ exact implementation revision
→ evaluator revision
```

Once allocated, that relationship is immutable.

A verification result must finalize an already-allocated attempt.

The workflow authority must reject an attempt to record a verification result
when no corresponding allocated verification attempt exists.

This requirement exists specifically to prevent candidate execution from being
retroactively described as evaluator preparation.

Evaluator preparation may validate its suite against controlled positive and
negative conditions as defined by the evaluator contract, but running the frozen
evaluator against the actual candidate belongs to an allocated verification
attempt.

### 7. Result and classification are judgments; consequences are deterministic

Harness must not infer whether a failure was caused by:

- implementation;
- evaluator;
- specification;
- infrastructure; or
- specification drift.

The evaluator/orchestrating agent supplies that judgment through the canonical
transition.

Harness does validate the structural consequences of the declared result and
classification.

At minimum support the evaluator classifications established by the current
evaluator contract:

```text
IMPLEMENTATION_FAILURE
EVALUATOR_DEFECT
SPECIFICATION_AMBIGUITY
INFRASTRUCTURE_FAILURE
SPECIFICATION_DRIFT
```

and terminal verification results:

```text
PASS
FAIL
BLOCKED
```

The authority must reject structurally contradictory result/classification
combinations.

It must not attempt to inspect hidden evaluator evidence to independently
determine the classification.

### 8. Implementation-failure recovery

After:

```text
implementation 001
verification 001 → FAIL
classification → IMPLEMENTATION_FAILURE
```

the workflow may open implementation attempt `002`.

The existing frozen evaluator revision remains the evaluation contract unless
separately invalidated through an allowed workflow path.

A later verification attempt must explicitly reference the new implementation
attempt and its exact committed revision.

A failed implementation verification must not be rewritten, reused, or silently
replaced.

### 9. Evaluator-defect recovery

After:

```text
implementation 001
evaluator revision 001
verification 001 → BLOCKED
classification → EVALUATOR_DEFECT
```

the implementation must remain unchanged unless another valid reason
independently requires a new implementation attempt.

The workflow may permit evaluator revision `002`.

The prior evaluator revision and verification attempt remain historical.

A later verification attempt may then bind:

```text
verification 002
→ implementation 001
→ unchanged implementation revision
→ evaluator revision 002
```

The authority must reject:

- silently replacing evaluator revision `001`;
- reusing verification attempt `001`;
- inventing implementation attempt `002` merely because the evaluator was
  defective; or
- promoting the blocked verification as though it passed.

### 10. Other blocked verification classes

`SPECIFICATION_AMBIGUITY`, `INFRASTRUCTURE_FAILURE`, and
`SPECIFICATION_DRIFT` must not automatically open an implementation retry or
permit promotion.

The authority may leave the workflow blocked and report the state requiring
correction.

Spike 010 need not automate every correction path for these classifications.

It must preserve the evidence and refuse invalid forward progress.

### 11. PASS and promotion are separate states

A verification `PASS` establishes only that the implementation satisfied the
frozen machine-verifiable evaluation contract.

It must not automatically establish:

- promotion completion;
- human acceptance;
- As-Built correctness; or
- Outcome completion.

Promotion may be recorded only after a canonical passing verification.

Where public promotion artifacts are claimed, Harness must mechanically verify
the public promoted evidence and its relationship to the passing verification to
the extent possible without evaluator-private access.

Promotion mechanics remain evaluator-owned.

Harness validates the gate; it does not recreate or normalize historical
evaluator artifacts.

### 12. Human acceptance remains explicit

The workflow state must distinguish:

```text
evaluation passed
promotion complete
As-Built complete
human acceptance pending
human acceptance recorded
Outcome complete
```

Human acceptance must never be inferred from:

- evaluator PASS;
- agent completion;
- process exit;
- As-Built completion; or
- the presence of an Outcome draft.

Spike 010 may provide an explicit mechanism for recording human acceptance.

It does **not** need to cryptographically authenticate that the caller is a
human.

Preventing an autonomous shell-capable agent from impersonating the human
acceptance action is a later capability/isolation problem.

The workflow must nevertheless represent the distinction accurately.

### 13. Agent workflow integration

Update the relevant repository workflow skills so that canonical methodology
transitions use the workflow authority rather than relying only on prose claims
in `manifest.md`.

The skills must treat the authority as the canonical source for questions such
as:

- whether a phase/result is eligible to be recorded;
- which implementation a verification targets;
- whether a verification attempt has been allocated;
- whether implementation retry is legal;
- whether evaluator correction is legal;
- whether promotion is legal; and
- whether the workflow is waiting for human acceptance.

Agents remain free to perform the actual work through any suitable host or
session.

Harness does not prescribe conversational orchestration.

Existing public manifests may remain useful human-readable execution history,
but must not contradict canonical machine-readable workflow state.

### 14. Status should answer “what now?”

Canonical status must provide enough machine-readable information for an
autonomous agent to determine:

```text
where am I?
what evidence is currently authoritative?
what transitions are currently legal?
what transition, if any, is blocked?
does this workflow currently require human acceptance?
```

This should allow a capable agent host to continue a normal spike without the
human monitoring each agent call.

Harness need not decide which legal action is strategically best.

It reports the border.

The orchestrator chooses the route.

## Trust boundary

Spike 010 establishes **methodological enforcement through the supported Harness
workflow interface**.

It does not claim hostile-process security.

A shell-capable agent running as the same Ubuntu user may still be technically
capable of:

- editing workflow files directly;
- modifying Git history;
- bypassing the CLI;
- invoking tools outside the methodology; or
- impersonating a nominal human command.

Preventing those actions requires a stronger capability boundary, such as
protected storage, a separate Unix identity, restricted evaluator workspace
access, a daemon/service boundary, or agent-host tool permissions.

Those mechanisms are deliberately deferred.

Spike 010 must not pretend the cooperative authority model is stronger than it
is.

The goal is to make correct methodology:

- explicit;
- machine-checkable;
- difficult to violate accidentally;
- visible when violated through the supported interface; and
- suitable for stronger enforcement later.

## Workflow semantics

The normal successful path remains conceptually:

```text
Brief Readiness
→ brief frozen
→ Design Map
→ Design Map frozen
→ evaluator prepared/frozen
→ implementation handoff
→ verification allocated
→ evaluator verification
→ verification PASS
→ promotion complete
→ As-Built
→ human acceptance
→ Outcome
```

Recovery branches exist around that sequence.

For example:

```text
implementation 001
→ verification 001 allocated
→ FAIL / IMPLEMENTATION_FAILURE
→ implementation 002
→ verification 002 allocated
→ ...
```

and:

```text
implementation 001
→ evaluator revision 001
→ verification 001 allocated
→ BLOCKED / EVALUATOR_DEFECT
→ evaluator revision 002
→ verification 002 allocated
   against implementation 001
→ ...
```

The exact internal state representation is implementation freedom.

## Non-goals

- no general workflow scheduler;
- no automatic phase chaining;
- no autonomous project manager;
- no requirement that Harness launch coding-agent processes;
- no replacement for ChatGPT, Codex, Claude Code, or another agent host;
- no semantic interpretation of agent reasoning or terminal output;
- no automatic failure classification;
- no automatic decision about which legal transition should happen next;
- no evaluator-private hidden-test inspection by the normal public workflow
  authority;
- no provider/plugin framework;
- no remote workflow API;
- no Harness runtime/daemon dependency on repository workflow tooling;
- no new mobile workflow UI;
- no OS-level sandbox;
- no separate Unix user or privilege service;
- no cryptographic human authentication;
- no defense against a malicious same-user shell process;
- no automatic Git push, merge, or pull-request management unless narrowly
  required for provenance validation;
- no rewriting of Spike 008 or Spike 009 historical artifacts; and
- no attempt to update old workflow histories into the new canonical
  representation.

## Acceptance Criteria

1. Canonical methodology state is distinct from operational process-dispatch
   state.

2. `npm run workflow -- ...` provides a machine-readable way to:
   - inspect canonical state;
   - inspect legal next transitions;
   - validate a proposed transition without mutation; and
   - record a valid transition.

3. Invalid transitions are rejected without mutating canonical methodology
   state.

4. Canonical methodology history is stored as safe public workflow evidence
   rather than existing only in ignored `.workflow/` operational state.

5. Canonical state can be reconstructed from that durable workflow history.

6. Public artifact identities and claimed Git provenance are mechanically
   validated where required by the transition.

7. Implementation verification requires an exact committed implementation
   handoff.

8. A verification attempt must be allocated before its result can be recorded
   and must immutably identify:
   - verification attempt;
   - implementation attempt;
   - exact implementation revision; and
   - evaluator revision.

9. Tests demonstrate:

   ```text
   implementation 001
   → verification 001 FAIL / IMPLEMENTATION_FAILURE
   → implementation 002
   → verification 002
   ```

10. Tests demonstrate:

    ```text
    implementation 001
    → evaluator revision 001
    → verification 001 BLOCKED / EVALUATOR_DEFECT
    → evaluator revision 002
    → verification 002 against unchanged implementation 001
    ```

11. A blocked evaluator defect does not create a new implementation attempt.

12. A new implementation attempt is not permitted merely after evaluator defect,
    infrastructure failure, specification ambiguity, or specification drift.

13. PASS does not imply promotion, As-Built, human acceptance, or Outcome.

14. Promotion cannot be recorded without a passing canonical verification and
    mechanically consistent public promotion evidence.

15. Workflow status can distinguish a completed technical workflow that is
    waiting for human acceptance.

16. Relevant workflow skills consult and update canonical Harness workflow
    authority at methodology boundaries rather than relying only on prose
    execution history.

17. Existing agent dispatch/log/liveness/cancel functionality may remain, but
    using it is not required to complete a canonical workflow.

18. A spike performed through an already-running ChatGPT/Codex/Claude session
    can advance correctly through the methodology using only the guarded
    transition interface.

19. The implementation does not claim to prevent direct same-user
    filesystem/Git bypass and does not introduce OS-level isolation.

20. Visible tests exercise state transitions and rejection paths without
    invoking real coding agents or private evaluator material.

21. `npm test`, `npm run typecheck`, lint, formatting checks, and
    `git diff --check` pass.

## Evidence expectations

Evaluation should focus on observable workflow-state behavior, legal and illegal
transition paths, provenance validation, and recovery semantics.

Do not require:

- a particular class hierarchy;
- a particular state-machine library;
- a database;
- a daemon;
- a specific event representation;
- a specific hashing helper;
- a specific CLI parser; or
- internal state exposure beyond the stable public surfaces required for
  independent evaluation.

The Design Map should establish only those public representation or command
seams required for independent black-box evaluation.

Where equivalent implementations preserve the frozen semantics, leave the
choice to implementation.

Evaluator v8 must not invent hidden structural seams merely to automate a
criterion that can be fairly verified through frozen public/manual evidence.

## Research questions

Record useful evidence during this spike for later methodology work:

1. How much orchestration does the external Codex/ChatGPT host still perform once
   Harness owns transition legality?

2. Does the agent naturally consult canonical workflow status and continue
   correctly without human intervention?

3. Which remaining methodology rules are still only conventions because the
   agent can bypass them as the same Ubuntu user?

4. Which of those remaining rules appear important enough to justify a later
   real capability boundary?

5. Does process dispatch still provide material value once the external agent
   host handles orchestration, or is it becoming optional convenience
   infrastructure?

These are observations, not additional implementation requirements.

## Process

This is an ordinary Harness implementation spike.

Use:

```text
feat/spike-010
```

Run through the existing Harness methodology:

1. Brief Readiness;
2. frozen brief;
3. Design Map;
4. evaluator prepare;
5. implementation;
6. evaluator verify;
7. As-Built;
8. human acceptance; and
9. Outcome.

Because this spike changes workflow authority itself, the pre-Spike-010 runner
may be used only as execution/bookkeeping convenience where useful; the new
guarded-transition behavior cannot be required before it exists. Until the
implementation handoff establishes the new authority, the existing frozen
skills and artifacts remain the canonical methodology.

This is an explicit process exception established before the spike is frozen. It
must not be expanded retroactively to excuse unrelated methodology violations.

Spike 008 and Spike 009 are historical evidence and must not be modified.
