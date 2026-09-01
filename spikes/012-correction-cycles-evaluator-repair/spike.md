# Spike 012 — Correction Cycles and Evaluator Repair

## Goal

Make post-verification and post-human-rejection recovery a first-class,
forward-only part of the Harness methodology.

Spike 012 must establish two related capabilities:

1. a human rejection may close one immutable correction cycle and, when the
   frozen product contract has not changed, legally open another cycle in the
   **same spike**; and
2. a frozen evaluator with a demonstrated evaluator defect may be corrected
   through an explicit **repair** operation without rerunning full evaluator
   preparation or obscuring what changed.

The resulting model must preserve every prior implementation attempt,
verification result, promoted evaluator revision, As-Built record, and human
decision exactly as historical evidence.

The purpose is not to make rejection cheap by weakening authority. It is to
distinguish:

```text
same frozen success condition, another correction cycle
```

from:

```text
the success condition itself changed, therefore a successor contract is needed
```

## Motivation

Spike 011 exposed a process defect after a technically passing cycle.

Its frozen contract already required bounded, unattended routine worker
execution. Verification attempt 001 reported PASS, promotion and As-Built were
completed, and human review then rejected the cycle with:

- primary classification: `IMPLEMENTATION_GAP`; and
- secondary finding: `EVALUATOR_COVERAGE_DEFECT`.

The frozen brief and Design Map did not need revision.

The appropriate recovery should therefore have been:

```text
repair the evaluator evidence plan
→ produce a corrected implementation attempt
→ verify again
→ obtain a new human decision
```

inside Spike 011.

The current authority/runner cannot express that recovery coherently:

- implementation retry is permitted only after failed evaluator verification;
- human rejection is effectively terminal for later human acceptance;
- PASS, promotion, As-Built, and human decision are represented as spike-global
  facts rather than cycle-scoped facts; and
- the evaluator skill has only `prepare` and `verify` modes even though
  `verify` already describes post-implementation evaluator correction.

Spike 012 repairs that methodology model.

## Context and preserved history

Spike 011 has been squash-merged to `main` through PR #20. Its human rejection
and all preceding technical evidence remain authoritative historical facts.

Spike 012 must not rewrite Spike 011, manufacture a successor for it, or
retroactively pretend that correction-cycle support existed during its first
cycle.

After Spike 012 is accepted, the new authority model must be capable of
legally opening a forward-only second correction cycle for the preserved Spike
011 rejection without changing the identities of Spike 011's frozen brief or
Design Map.

## Core model

### A cycle is not an implementation attempt

A **correction cycle** begins with a frozen evaluator state and ends at a human
acceptance/rejection decision.

Implementation and verification retries may occur *within* a cycle.

For example:

```text
Spike NNN
  Cycle 001
    evaluator revision 001
    implementation attempt 001
    verification attempt 001 FAIL (implementation)
    implementation attempt 002
    verification attempt 002 PASS
    promotion
    As-Built
    human REJECTED

  Cycle 002
    evaluator revision 002 (only if repair is required)
    implementation attempt 003
    verification attempt 003 PASS
    promotion
    As-Built
    human ACCEPTED
```

Exact numbering mechanics are Design Map freedom, but the authority must make
cycle identity explicit and must not confuse:

- correction cycle;
- implementation attempt;
- verification attempt;
- evaluator revision; or
- executor/process execution attempt.

### Human rejection closes a cycle, not necessarily the spike

A human rejection is immutable and closes the current correction cycle.

A new correction cycle may be opened only when the rejection is repairable
without changing the frozen product contract.

At minimum, these human findings are same-contract repairable:

- `IMPLEMENTATION_GAP`;
- `EVALUATOR_COVERAGE_DEFECT`; or
- both together.

A rejection requiring `SPECIFICATION_CHANGE` is **not** same-spike repairable.
It requires the existing successor/new-brief path.

`OTHER_HUMAN_REJECTION` must not automatically authorize a correction cycle;
the authority must require a classification that establishes that the frozen
contract remains sufficient.

### Frozen product authority remains spike-global

The frozen brief and frozen Design Map remain the spike-level product contract.

Opening a new correction cycle must bind their exact existing identities.

A same-spike correction cycle must not:

- revise the frozen brief;
- revise the frozen Design Map;
- silently reinterpret acceptance criteria;
- add behavior absent from frozen authority; or
- use evaluator repair to create a new product requirement.

If either frozen product artifact must materially change, same-spike correction
is prohibited and a successor is required.

## Scope

### 1. Introduce explicit correction-cycle authority

Add a forward-only authority transition equivalent to:

```text
correction-cycle-opened
```

The exact event name is frozen by the Design Map.

The transition must identify at least:

- new cycle identity;
- prior cycle identity;
- triggering human-rejection evidence;
- repairable rejection classification(s);
- frozen brief identity;
- frozen Design Map identity;
- whether implementation correction is required;
- whether evaluator repair is required; and
- evaluator revision inherited from the prior cycle, when applicable.

A cycle may be opened only from a closed human-rejected cycle.

The authority must prevent:

- opening two active correction cycles from the same rejection;
- opening a correction cycle after human acceptance;
- opening one for a specification-changing rejection;
- reopening by mutating/removing the prior human decision; or
- claiming different brief/Design Map identities.

### 2. Preserve legacy cycle-1 history without rewriting it

Existing spike histories predate explicit cycle identifiers.

The updated authority must interpret the existing initial workflow history as
**Cycle 001** without editing those historical records.

New cycle-scoped records must carry an unambiguous cycle binding.

The authority must be able to evaluate Spike 011's existing
`human-rejected` event, including its primary `IMPLEMENTATION_GAP` and
secondary `EVALUATOR_COVERAGE_DEFECT` finding, as eligible for a future
same-spike correction cycle.

This spike must not actually reopen Spike 011 before Spike 012 itself is
accepted.

### 3. Make PASS, promotion, As-Built, and human decision cycle-scoped

Authority state must no longer answer these questions only as permanent
spike-global booleans:

- has any verification ever passed?
- has any promotion ever occurred?
- has any As-Built ever occurred?
- has any human rejection ever occurred?

For the active/current cycle, it must be possible to determine:

- current evaluator revision;
- current implementation handoff;
- verification allocation/result;
- whether the current cycle has a trustworthy PASS;
- whether that cycle's promotion is complete;
- whether that cycle's As-Built is complete; and
- whether that cycle has a human decision.

A PASS, promotion, As-Built, or human rejection from Cycle 001 must not satisfy
the corresponding prerequisite for Cycle 002.

Historical cycle state remains queryable and immutable.

### 4. Allow implementation correction after human rejection

The workflow runner/authority must allow a new implementation attempt in a
correction cycle when that cycle was opened with an implementation-correction
finding.

This is distinct from the existing implementation retry caused by a failed
technical verification.

Both paths remain valid:

```text
technical verification identifies implementation failure
→ retry implementation within current cycle
```

and:

```text
technical PASS
→ human identifies implementation gap
→ close cycle
→ open correction cycle
→ new implementation attempt
```

The runner must not require a fabricated failed evaluator verification merely
to make the second path legal.

### 5. Add evaluator `repair` mode

Change the evaluator contract from:

```text
prepare
verify
```

to:

```text
prepare
verify
repair
```

with distinct responsibilities:

- `prepare`: derive and freeze independent evaluation before implementation
  exposure;
- `verify`: execute the frozen evaluator and classify the result without
  modifying that evaluator during the allocated verification attempt;
- `repair`: correct an already-demonstrated evaluator defect while preserving
  the frozen definition of success.

The implemented evaluator skill version must expose and document the new mode.

### 6. Repair requires an authoritative defect trigger

Evaluator repair must not be an unconstrained request to improve an evaluator.

A repair must bind to immutable authoritative evidence of an evaluator defect,
such as:

- a finalized verification attempt classified `EVALUATOR_DEFECT`; or
- a closed human correction cycle containing
  `EVALUATOR_COVERAGE_DEFECT`.

The repair trigger must identify enough public-safe information to establish
what defect is being corrected, including affected criterion/procedure
identifiers where they are known.

A model observation, conversation comment, or unrecorded suspicion is not
sufficient authority for repair.

### 7. Verify discovers defects; repair changes the evaluator

A validly allocated `verify` attempt must never silently mutate the frozen
evaluator it is executing.

If verification discovers a material evaluator defect:

1. finalize the allocated attempt forward-only with the appropriate non-PASS
   result/classification;
2. record the defect in the immutable attempt result/ledger;
3. preserve the evaluator revision used by that attempt; and
4. invoke `repair` as a separate workflow operation before any corrected
   revision is used.

This makes the distinction observable:

```text
verification discovered the defect
repair produced the corrected evaluator revision
```

### 8. Repair is bounded and incremental, not full preparation

A repair must begin from an exact frozen source evaluator revision.

It may change only evaluator material necessary to correct the authoritative
defect.

Unrelated evaluator requirements, procedures, cases, tests, mappings, and
interpretations must remain unchanged in semantics and, where not structurally
forced to change, unchanged in content identity.

Repair must not repeat the complete semantic derivation performed by
`prepare` merely because one criterion's evidence was defective.

After the bounded change, run the complete deterministic evaluator-integrity
validation over the **resulting full revision** before it may become usable.

Thus:

```text
semantic repair scope = bounded to the demonstrated defect
structural integrity validation = whole resulting evaluator revision
```

### 9. Repair may change evidence, not success semantics

The governing invariant is:

> Evaluator repair may change the means of establishing a frozen requirement;
> it may not change the requirement being established.

A repair may, for example, replace an insufficient static assertion with a
positive executable observation when the frozen criterion already required the
observed behavior.

A repair may not:

- introduce a new product requirement;
- require an implementation-specific internal seam absent from frozen
  authority;
- weaken a frozen criterion;
- strengthen it beyond frozen authority;
- adopt a candidate-shaped representation merely because the implementation
  exposed one; or
- change a public contract after seeing the implementation.

If a fair evaluator cannot be repaired without such a change, classify the
problem as specification/methodology/evidence-model work and use the successor
path.

### 10. Public evaluation requirements remain frozen during repair

`eval-requirements.md` is pre-implementation public authority and must not be
silently rewritten during post-implementation repair.

If repairing the evaluator requires a materially new public testability seam or
a change to the public evaluation requirements, repair must block and classify
that as outside same-contract evaluator repair.

A repaired evaluator revision must nevertheless have a new immutable public-safe
binding that identifies:

- source evaluator revision;
- resulting evaluator revision;
- frozen product/evaluation-requirement identities;
- affected public criterion identifiers;
- integrity-validation PASS; and
- no change to acceptance semantics.

The exact artifact/path format is Design Map freedom. Historical public bindings
must remain immutable and re-verifiable.

### 11. Create an immutable evaluator repair record

Every successful or terminally blocked repair operation must create a durable
private repair record.

For a successful repair it must identify at least:

- repair identifier;
- trigger type and authoritative trigger identity;
- source evaluator revision and identity;
- resulting evaluator revision and identity;
- affected criterion/procedure identifiers;
- concise defect description;
- concise description of the correction;
- identities of changed evaluator artifacts;
- explicit attestation that frozen success semantics did not change;
- frozen brief, Design Map, and public evaluation-requirement identities;
- integrity-validation result; and
- executor/skill identity where available.

The repair record must make it possible to answer later:

> Why does evaluator revision N+1 exist, and exactly what defect did it repair?

without reconstructing the answer from conversation history.

Repair records remain private while the evaluator is private. When a later PASS
makes the corresponding evaluator evidence eligible for promotion, the safe
repair history must be promoted or otherwise canonically represented without
rewriting it.

### 12. Preserve revision and attempt history

Repair creates a new evaluator revision.

It must never overwrite the source revision.

Verification attempts remain bound to the exact revision they used.

If verification attempt 001 used evaluator revision 001 and a repair creates
revision 002, the history must remain capable of stating:

```text
verification 001 → evaluator revision 001
repair 001       → revision 001 → revision 002
verification 002 → evaluator revision 002
```

Attempt identifiers and evaluator revision identifiers remain monotonically
allocated and are never reused.

### 13. Support evaluator repair inside a cycle and after human rejection

Evaluator repair has two legitimate placements.

#### Verification-discovered evaluator defect

```text
Cycle N
  implementation candidate
  verify against evaluator revision R
  → BLOCKED/FAIL: EVALUATOR_DEFECT
  repair R → R+1
  reverify unchanged implementation against R+1
```

No human correction cycle is required merely because the evaluator itself was
defective during technical verification.

#### Human-discovered evaluator coverage defect

```text
Cycle N
  technical PASS
  promotion
  As-Built
  human REJECTED: EVALUATOR_COVERAGE_DEFECT
  cycle closes

Cycle N+1
  evaluator repair R → R+1
  implementation correction if also required
  fresh verification
```

Both must be representable without a new spike brief when the frozen product
contract is unchanged.

### 14. Structured multi-finding human rejection

New human-rejection evidence must be able to represent more than one material
finding without forcing one to become an untyped prose note.

At minimum it must support a primary classification plus additional typed
findings, or an equivalent structured representation.

The authority must remain backward-compatible with existing rejection records,
including Spike 011's current `classification` plus `secondaryFinding`
shape, without rewriting that event.

### 15. Successor path remains strict

Same-spike correction is not a substitute for successor lineage.

The authority must continue to require a successor/new brief when:

- the frozen brief must change;
- the frozen Design Map must materially change;
- the human rejection is `SPECIFICATION_CHANGE`;
- evaluator repair would require new public product semantics or a new
  implementation-shaped seam; or
- a methodology/evidence-model defect cannot be corrected under already-frozen
  Spike 012 authority.

A rejected cycle may therefore be terminal for that spike even though
correction-cycle machinery exists.

### 16. Authority status must expose cycle state clearly

The public authority status surface must expose enough information for an
orchestrator or human to tell, without reconstructing JSONL manually:

- current cycle identity;
- whether the current cycle is open or closed;
- current evaluator revision;
- current implementation attempt, if any;
- current/final verification state;
- promotion state for the current cycle;
- As-Built state for the current cycle;
- human decision for the current cycle;
- whether same-spike correction is permitted;
- why it is or is not permitted; and
- predecessor/successor lineage where applicable.

Historical cycles must remain distinguishable.

### 17. Autonomous continuation semantics

Opening a valid correction cycle is a workflow transition, not inherently a
human gate once the human rejection and its classifications have already been
recorded.

When the recorded rejection unambiguously authorizes same-spike correction and
the required recovery is mechanically determined, the orchestrator may continue
without asking the human to approve the existence of the next cycle.

Likewise, an evaluator defect already finalized by verification may flow into
evaluator `repair` without a new human decision.

The human remains authoritative for the next acceptance/rejection decision.

### 18. Regression coverage

Visible deterministic tests must demonstrate at least:

- a legacy cycle-1 history remains valid without mutation;
- a repairable human rejection can open exactly one Cycle 002;
- Spike-011-shaped primary + secondary rejection findings are recognized;
- a specification-changing rejection cannot open a correction cycle;
- a human-accepted cycle cannot be reopened;
- Cycle 001 PASS/promotion/As-Built do not satisfy Cycle 002 prerequisites;
- implementation correction after human rejection is legal without fabricating
  a failed verification;
- technical implementation retry after failed verification still works within
  the same cycle;
- verification-discovered evaluator defect can authorize repair without opening
  a human correction cycle;
- repair cannot occur without an authoritative evaluator-defect trigger;
- repair produces a new revision while preserving the source revision;
- a repaired revision must pass full structural integrity validation before
  becoming current;
- verification remains bound to the exact evaluator revision used;
- a second human decision is possible only after the new cycle completes its own
  PASS/promotion/As-Built sequence; and
- historical cycle evidence remains unchanged.

The tests must not require live paid provider calls.

## Spike 011 recovery proof

Spike 012 must include a deterministic regression fixture representing the
material authority history of Spike 011 through its existing human rejection.

Without modifying Spike 011 itself, the fixture must demonstrate that after the
Spike 012 authority implementation:

1. its historical events are interpreted as Cycle 001;
2. its `IMPLEMENTATION_GAP` plus `EVALUATOR_COVERAGE_DEFECT` rejection is
   eligible for same-spike correction;
3. a valid Cycle 002 opening would require both implementation correction and
   evaluator repair; and
4. the frozen brief and Design Map identities remain those from Cycle 001.

Actual reopening of the real Spike 011 is deferred until Spike 012 has passed
technical evaluation and human acceptance.

## Evaluator skill versioning and bootstrap

Spike 012 changes the evaluator skill itself, so its own evaluation is a
bootstrap case.

The evaluator contract used to prepare and verify Spike 012 must be frozen from
the pre-implementation evaluator semantics (v10 or the exact committed
pre-implementation version).

The newly implemented evaluator `repair` mode must **not** be used as the
grading authority that proves its own correctness during this spike.

The Design Map must make the bootstrap provenance explicit.

Visible regression tests and static/provenance inspection may verify the new
repair contract and authority behavior without requiring a live evaluator repair
against Spike 012 itself.

If Spike 012's own cycle is human-rejected before this change is accepted, the
pre-Spike-012 authority rules still govern its recovery; do not retroactively use
the implementation under evaluation to authorize its own same-spike correction.

## Non-goals

- no repair of Spike 011's Claude permission implementation inside Spike 012;
- no actual opening of Spike 011 Cycle 002 before Spike 012 human acceptance;
- no change to Spike 011 historical artifacts;
- no general rewrite of the brief-readiness or Design Map skills;
- no change to the fundamental human acceptance/rejection gate;
- no generic workflow/DAG engine;
- no agent-neutral skill conversion;
- no methodology install/package mechanism;
- no provider permission-broker redesign;
- no new Claude/Codex runtime integration;
- no automatic semantic judgment by deterministic authority code;
- no weakening of immutable evaluator revisions or verification attempts;
- no automatic specification change under the label of repair;
- no requirement to rerun full evaluator preparation for a bounded repair;
- no requirement for live paid-provider tests.

## Acceptance Criteria

1. The authority represents an explicit correction-cycle identity distinct from
   implementation attempt, verification attempt, evaluator revision, and
   executor/process execution attempt.

2. Existing pre-cycle histories are interpreted as Cycle 001 without rewriting
   historical records.

3. A human-rejected cycle classified `IMPLEMENTATION_GAP` may open exactly one
   same-spike correction cycle while preserving the frozen brief and Design Map
   identities.

4. A human-rejected cycle containing `EVALUATOR_COVERAGE_DEFECT` may open a
   correction cycle that requires evaluator repair.

5. A rejection containing both implementation and evaluator findings may require
   both corrections in the new cycle.

6. Spike 011's existing primary `IMPLEMENTATION_GAP` plus secondary
   `EVALUATOR_COVERAGE_DEFECT` evidence is recognized by a deterministic
   regression fixture as eligible for Cycle 002 without editing Spike 011.

7. A `SPECIFICATION_CHANGE` rejection cannot open a same-spike correction
   cycle and continues to require successor lineage.

8. A human-accepted cycle cannot be reopened.

9. Cycle 001 PASS, promotion, As-Built, and human decision do not satisfy Cycle
   002's corresponding prerequisites.

10. A correction-cycle implementation attempt is legal after a human
    `IMPLEMENTATION_GAP` without fabricating a failed evaluator verification.

11. Existing implementation retry after genuine failed technical verification
    remains legal within the current cycle.

12. The evaluator skill exposes explicit `prepare`, `verify`, and `repair`
    modes with non-overlapping responsibilities.

13. `verify` does not mutate the frozen evaluator during an allocated attempt;
    an evaluator defect is finalized and recorded before repair begins.

14. `repair` requires immutable authoritative evidence of an evaluator defect
    and rejects an ungrounded repair request.

15. A successful repair preserves the source evaluator revision and creates a
    distinguishable new revision.

16. Repair is bounded to the demonstrated evaluator defect and does not rerun
    complete semantic preparation as a required process step.

17. The entire resulting repaired evaluator revision must pass deterministic
    structural integrity validation before it may become current.

18. Repair cannot change the frozen brief, Design Map, public
    `eval-requirements.md`, or acceptance semantics.

19. If repair requires a materially new public testability seam or product
    requirement, it blocks rather than silently changing public authority.

20. Every repair has an immutable repair record binding trigger, source revision,
    resulting revision, affected criteria/procedures, changed artifact
    identities, frozen authority identities, semantic-preservation attestation,
    and integrity result.

21. Verification attempts remain durably bound to the exact evaluator revision
    they executed.

22. Authority and promotion evidence can distinguish evaluator revisions and
    repair lineage without overwriting earlier frozen/promoted evidence.

23. New human rejection evidence can represent multiple typed findings, while
    the authority remains compatible with existing legacy
    `classification`/ `secondaryFinding` records.

24. After a repairable human rejection and legal correction-cycle opening, the
    workflow can progress through its own implementation/verification,
    promotion, As-Built, and a new human decision.

25. Authority status exposes current cycle, evaluator revision, implementation
    and verification state, cycle-scoped promotion/As-Built/human state, and
    whether/why same-spike correction is permitted.

26. A valid mechanically determined correction cycle or evaluator repair does
    not create an unnecessary human gate before the next acceptance/rejection
    decision.

27. The Spike 012 implementation does not use its newly implemented evaluator
    repair mode as the grading authority that proves that same repair mode.

28. Visible deterministic regression coverage exercises the correction-cycle,
    evaluator-repair, legacy-history, and successor-boundary behaviors without
    live paid-provider calls.

29. Existing workflow authority/provenance tests, evaluator-integrity tests,
    host-owned workflow-run tests, session/backend tests, typecheck, lint,
    formatting, and `git diff --check` remain green.

## Expected post-012 recovery for Spike 011

If Spike 012 is accepted, the intended next operation is not a new Spike 011a.

Instead:

```text
Spike 011 Cycle 001
  preserved human REJECTED

→ record correction-cycle-opened for Cycle 002
  implementationCorrection: true
  evaluatorRepair: true
  frozen brief: unchanged
  frozen Design Map: unchanged

→ evaluator repair
  revision 001 → revision 002
  repair E10/AC14 evidence only

→ implementation attempt 002
  fix bounded non-interactive Claude routine execution

→ fresh verification against evaluator revision 002

→ cycle-scoped promotion

→ cycle-scoped As-Built

→ new human acceptance/rejection
```

The exact implementation/evaluator attempt numbers must follow the existing
monotonic ledgers rather than being inferred from this example.

## Expected methodology sequence for Spike 012

1. commit this draft brief on `feat/spike-012`;
2. run Brief Readiness under the existing methodology;
3. freeze the brief only after PASS;
4. freeze a Design Map;
5. prepare Spike 012 evaluation using the pre-implementation evaluator contract;
6. implement correction-cycle authority and evaluator repair;
7. verify against the frozen pre-implementation evaluator;
8. promote only after trustworthy PASS;
9. create As-Built;
10. obtain human acceptance/rejection; and
11. create Outcome only after acceptance.

After accepted completion, use the new process to resume Spike 011 rather than
creating a lettered product successor for an unchanged frozen contract.
