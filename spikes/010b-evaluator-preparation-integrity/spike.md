# Spike 010b — Evaluator Preparation Integrity

## Goal

Repair the evaluator-preparation and freeze-integrity defect exposed while running
Spike 010a.

Spike 010a demonstrated that a criterion-complete public coverage map is not
sufficient by itself to establish that the frozen evaluator bundle is actually
ready for verification. A revision may appear complete at the criterion level
while still referencing executable or non-executable evidence procedures that
were not fully materialized, validated, or resolvable before freeze.

The result is an invalid evidence-producing boundary:

```text
frozen acceptance criteria
        ↓
criterion-level coverage map
        ↓
evaluator declares preparation complete
        ↓
implementation
        ↓
verification allocated
        ↓
evaluator discovers its own frozen evidence procedure is missing
```

That defect must be caught before evaluator freeze and before verification
allocation.

Spike 010b makes "evaluator frozen" a validated state rather than a conversational
or documentary assertion.

It does not attempt to rescue Spike 010a by rewriting its evaluator, verification
history, implementation attempts, or canonical authority state.

## Lineage and current state

Spike 010b is a process successor to the blocked Spike 010a cycle.

Spike 010a remains preserved as historical evidence. Its public authority history
shows:

```text
brief frozen
→ Design Map frozen
→ evaluation prepared
→ implementation attempts 001–004
→ verification attempts 001–005 with recorded terminal results where applicable
→ verification attempt 006 allocated against canonical implementation 004
```

Verification attempt 006 has no fabricated terminal PASS/FAIL result. During the
evaluator boundary for that attempt, the evaluator determined that its frozen
criterion-complete revision still referenced declared evidence procedures that
had not actually been implemented as frozen evaluator cases. Evaluation could
therefore not honestly proceed.

Implementation attempt 004 remains unchanged.

The later repository methodology correction at commit `16ee4ed` made autonomous
workflow continuation explicit in `AGENTS.md` and introduced evaluator v9
post-implementation repair provenance and repeated-correction scrutiny. That
change does not retroactively govern or rewrite Spike 010a's frozen evaluator
semantics.

Spike 010b starts from the repository state containing that correction.

## Process-successor exception

The current canonical `successor-linked` transition was introduced for a
human-rejected predecessor. Spike 010a is not human-rejected; it is blocked by a
methodology/evidence-model defect before a trustworthy verification result for
attempt 006.

Do not manufacture a human rejection, verification result, evaluator result, or
other canonical event merely to make Spike 010a fit the existing successor
transition.

This brief therefore declares a narrow process exception before Spike 010b
implementation:

- Spike 010a remains immutable and blocked at its recorded state.
- Spike 010b may proceed as a publicly named process successor to Spike 010a.
- This brief and its committed Git provenance are the substitute public lineage
  evidence for this bootstrap case.
- No synthetic `successor-linked` event is required if the current authority
  cannot legally represent a blocked-process predecessor.
- This exception does not authorize bypassing ordinary authority transitions
  within Spike 010b.
- General blocked-predecessor successor semantics are a non-goal unless the
  Design Map demonstrates that a small change is required to make this spike's
  own forward path coherent.

## Scope

### 1. Criterion-specific evidence records

Evaluator preparation must establish one explicit evidence record for every
material frozen acceptance criterion before freeze.

"One record per criterion" does not mean "one executable test per criterion."

Multiple criterion records may legitimately reference the same executable case,
static inspection, public regression, provenance check, or composite evidence
when that evidence actually establishes each criterion.

Each criterion record must state enough criterion-specific reasoning to explain
why its referenced evidence is sufficient. Merely assigning several criteria to
a broad case label without recording the individual inference is insufficient.

A criterion record must identify, at minimum, equivalents of:

```text
criterion identity
frozen authority source
evidence mode
evidence procedure/case identity
required/optional disposition
criterion-specific sufficiency reason
```

The exact schema belongs to the Design Map.

### 2. Evidence procedure materialization

Every evidence procedure referenced by the frozen evaluator must exist before
freeze.

For executable evidence, preparation must confirm that the referenced evaluator
case and all required support material are present in the candidate evaluator
bundle.

For non-executable evidence, preparation must confirm that the inspection or
public/manual evidence procedure is concretely defined and can be performed
without inventing candidate-specific semantics after implementation.

A frozen evaluator must not contain references equivalent to:

```text
criterion → executable case E3
```

when no such frozen executable case actually exists.

### 3. Pre-freeze evaluator integrity validation

Before a private evaluator revision may be frozen, evaluator preparation must run
a deterministic integrity validation over the candidate bundle.

The validation must establish structural consistency equivalent to:

- every material frozen criterion has exactly one explicit criterion evidence
  record or another Design-Map-approved unambiguous representation;
- every required criterion has a non-missing evidence disposition;
- every referenced evaluator requirement/case/procedure exists;
- every executable case references actual frozen evaluator files or another
  concrete executable representation;
- every non-executable procedure is explicitly defined;
- every frozen evaluator case/procedure maps back to the criterion(s) it is
  intended to establish;
- no required evidence reference is orphaned;
- no required criterion is silently covered only by a broad grouping;
- the private freeze inventory contains every evaluator file that the frozen
  bundle depends on; and
- the public-safe coverage representation and private evaluator bundle are
  mutually consistent.

The exact validator implementation and where its output is stored belong to the
Design Map.

### 4. Executable-case readiness

A declared mandatory executable case must be exercised during `prepare` under
controlled pre-implementation conditions before freeze.

Preparation must verify, where applicable:

- the case is discoverable/runnable;
- setup and teardown complete;
- helpers and fixtures resolve;
- the success path can succeed under a controlled condition;
- the failure oracle can fail for the intended reason under a controlled
  condition; and
- the case does not depend on candidate implementation behavior to define its
  contract.

This preserves evaluator v9's existing prohibition against running the prepared
evaluator against the actual implementation candidate during `prepare`.

### 5. Non-executable evidence remains first-class

Spike 010b must not turn the evaluator into a requirement for hidden tests or
one-test-per-criterion coverage.

Static inspection, public regression evidence, provenance inspection, artifact
inspection, manual public evidence, and composite evidence remain valid when
they are the strongest fair implementation-independent evidence available.

However, each required non-executable evidence plan must itself be prepared and
resolvable before freeze.

"Manual" or "static" is not permission to defer deciding what will be inspected
until after candidate exposure.

### 6. Freeze only after readiness passes

Evaluator freeze must be downstream of successful evaluator integrity
validation.

If readiness validation fails:

- do not freeze the evaluator revision;
- do not record evaluator preparation as complete;
- do not begin implementation;
- do not allocate verification;
- correct the evaluator while still in the pre-implementation preparation
  phase; and
- preserve any preparation diagnostics required by the methodology without
  pretending an invalid draft was frozen.

The Design Map may determine whether a failed pre-freeze draft needs durable
private revision history. It must not create public evidence that falsely claims
a valid frozen evaluator.

### 7. Public authority boundary

For authority-enabled spikes, `evaluation-prepared` must mean that the
evaluator has passed its required pre-freeze integrity validation.

Harness still does not need to understand hidden evaluator semantics.

The public authority may validate public-safe identities, counts, inventories,
or attestations where useful, but it must not require hidden evaluator contents
to become public.

The Design Map should choose the smallest public-safe evidence sufficient to
prevent an orchestrator from treating an unvalidated evaluator draft as a valid
prepared revision.

### 8. Verification allocation must not precede evaluator readiness

A verification attempt must not be allocated against an evaluator revision whose
preparation/freeze integrity has not been established.

The intended order is:

```text
criterion/evidence plan complete
→ all referenced procedures materialized
→ evaluator integrity validation PASS
→ evaluator freeze
→ public-safe preparation authority recorded
→ implementation handoff
→ verification allocation
→ verification
```

Ordinary progress reporting does not alter this order.

### 9. Evaluator-integrity failure after allocation

The methodology must define a forward-only outcome when a verification attempt
has already been validly allocated and a frozen evaluator integrity defect is
then discovered before or during candidate evaluation.

Future attempts must not be left indefinitely ambiguous merely because the
evaluator could not run.

The corrected methodology must preserve:

- the verification allocation;
- the implementation identity;
- evaluator revision identity;
- the integrity failure;
- whether candidate evaluation actually began; and
- a terminal non-PASS disposition sufficient to continue the methodology
  without fabricating an implementation failure.

The exact classification vocabulary belongs to the Design Map. It must not
misclassify a missing evaluator procedure as an implementation defect.

Spike 010b does not retroactively create a result for Spike 010a verification
attempt 006.

### 10. Post-implementation evaluator repair remains bounded

Evaluator v9's provenance rule remains authoritative:

- post-implementation evaluator changes must trace to frozen
  pre-implementation authority;
- implementation-shaped acceptance semantics must not be introduced;
- implementation failures change implementation, not evaluator semantics; and
- specification defects require a new brief cycle.

Spike 010b must make repeated evaluator-preparation failure operationally
meaningful.

After the methodology/evidence-model threshold defined by the evaluator contract
has been reached, another evaluator correction must not occur automatically.
The workflow must stop ordinary evaluator-revision churn and require the
appropriate process/specification successor path.

### 11. No evaluator-quality oracle in Harness

Harness must not become a semantic judge of whether a test is intellectually
good, whether manual evidence is persuasive, or whether a criterion should have
been written differently.

The preparation-integrity validator checks declared evaluator structure,
materialization, traceability, and executable readiness.

It does not prove that the evaluator's substantive judgment is correct.

### 12. Workflow integration

Inspect and update the repository-owned evaluator and any directly related
workflow/authority integration required to make the preparation/freeze boundary
real.

At minimum inspect:

- evaluator `prepare`;
- evaluator freeze metadata/inventory;
- public-safe criterion coverage representation;
- `evaluation-prepared` authority recording;
- verification allocation preconditions;
- verification integrity handling; and
- evaluator repair/retry guidance.

Do not expand into unrelated product/runtime work.

## Bootstrap evaluator exception for Spike 010b

Spike 010b changes the evaluator preparation rules that would normally govern its
own evaluator preparation.

The implementation produced by Spike 010b therefore cannot retroactively govern
its own pre-implementation evaluator.

This exception is declared before brief freeze and applies only to Spike 010b.

Spike 010b evaluator preparation runs under evaluator v9 plus the following
substitute evidence obligations:

1. Before Spike 010b implementation begins, the evaluator must create a
   criterion-complete evidence plan for the frozen Spike 010b brief.
2. Every criterion must have its own explicit evidence record with a
   criterion-specific sufficiency reason.
3. Every referenced executable case/procedure must actually be materialized in
   the private evaluator bundle before freeze.
4. Every mandatory executable case must be exercised under controlled
   pre-implementation positive/negative conditions where applicable.
5. Every mandatory non-executable evidence procedure must be concretely defined
   and confirmed resolvable before freeze.
6. The evaluator must perform and preserve a private pre-freeze integrity
   checklist covering criterion completeness, procedure existence, bidirectional
   traceability, bundle inventory, and public/private identity consistency.
7. Only after that checklist passes may the private evaluator revision freeze
   and public `evaluation-prepared` authority be recorded.
8. If the checklist fails, preparation remains pre-freeze and implementation
   must not start.
9. No candidate implementation may be used to construct or tune the frozen
   evaluator.
10. After implementation begins, ordinary evaluator v9 post-implementation
    repair constraints apply without relaxation.

The private checklist is substitute bootstrap evidence because evaluator v9 does
not yet provide the mechanical preparation-integrity mechanism that Spike 010b
is intended to implement.

This exception does not authorize:

- retroactive evaluator repair;
- skipped criterion evidence;
- unimplemented declared procedures;
- verification before evaluator freeze;
- implementation-specific hidden seams;
- fabricated verification results;
- rewriting Spike 010a;
- synthetic human rejection of Spike 010a; or
- bypassing the human acceptance gate.

The evaluator-preparation mechanism produced by Spike 010b becomes authoritative
only for later work after Spike 010b is accepted.

## Trust boundary

Spike 010b remains within Harness's cooperative same-user methodology boundary.

It does not attempt to defend against a hostile same-user shell process that can
rewrite Git history, mutate private evaluator files, or bypass the supported
workflow interface.

The goal is deterministic methodology integrity under cooperative agents, not an
OS security boundary.

## Non-goals

- no retroactive repair of Spike 010a verification attempt 006;
- no fabricated terminal result for Spike 010a;
- no change to Spike 010a implementation attempt 004;
- no requirement for one executable test per acceptance criterion;
- no requirement that hidden tests exist;
- no publication of evaluator-private cases or grader logic;
- no semantic evaluator-quality scoring by Harness;
- no generic workflow-cycle framework;
- no broad successor-state redesign unless required for this bootstrap path;
- no hostile-process isolation;
- no scheduler/project manager;
- no unrelated Harness runtime feature work;
- no agent-neutral evaluator rewrite in this spike unless required by the Design
  Map for the integrity mechanism itself.

## Acceptance Criteria

1. Evaluator preparation has an explicit pre-freeze integrity validation step.

2. Every material frozen acceptance criterion has an explicit criterion-specific
   evidence record before freeze.

3. Criterion-level evidence records include enough frozen-authority provenance
   and criterion-specific reasoning to explain why their referenced evidence is
   intended to establish that criterion.

4. Multiple criteria may share evidence, but broad grouping alone cannot replace
   criterion-level traceability.

5. Every declared executable evaluator case/procedure exists in the evaluator
   bundle before freeze.

6. Every declared non-executable evidence procedure is concretely defined and
   resolvable before freeze.

7. Every required evaluator case/procedure maps back to one or more frozen
   criteria, and every required frozen criterion maps to prepared evidence.

8. The evaluator freeze inventory contains all files/material required by the
   frozen evaluator bundle.

9. Public-safe coverage metadata and the private evaluator bundle are checked for
   structural consistency before freeze.

10. Mandatory executable cases are exercised during `prepare` under controlled
    implementation-independent conditions where applicable.

11. Evaluator preparation may not run or inspect the candidate implementation in
    order to shape the frozen evaluator.

12. A failed preparation-integrity check prevents evaluator freeze.

13. A failed preparation-integrity check prevents `evaluation-prepared` from
    being recorded as complete.

14. Implementation may not begin from an evaluator revision that failed
    preparation integrity.

15. Verification may not be allocated against an evaluator revision that has not
    passed the required preparation/freeze integrity boundary.

16. Hidden tests remain optional when no fair implementation-independent
    executable seam exists.

17. Non-executable/static/manual/provenance evidence remains valid when explicitly
    prepared and criterion-specific.

18. Discovery of evaluator bundle incompleteness after verification allocation
    is represented as an evaluator/integrity non-PASS condition, not an
    implementation failure.

19. A post-allocation evaluator-integrity failure preserves the allocation and
    implementation/evaluator identities without fabricating candidate results.

20. The methodology prevents indefinite post-implementation evaluator-revision
    churn after its repeated-correction/process-defect threshold is reached.

21. The preparation validator checks structure, materialization, traceability,
    and readiness without making Harness a semantic judge of evaluator quality.

22. Visible regression coverage demonstrates that an evaluator draft referencing
    a missing mandatory executable procedure cannot reach a valid frozen/prepared
    state.

23. Visible regression coverage demonstrates that a criterion-complete map whose
    evidence references are structurally incomplete is rejected before
    verification allocation.

24. Visible regression coverage demonstrates that shared evidence may
    legitimately support multiple criterion records when each criterion retains
    explicit traceability.

25. Visible regression coverage demonstrates that a non-executable evidence
    procedure can participate in a valid prepared evaluator when it is explicitly
    defined and resolvable.

26. Visible regression coverage demonstrates the forward-only handling of an
    evaluator-integrity failure discovered after verification allocation.

27. Spike 010a remains byte-for-byte historical evidence except for pre-existing
    repository-wide methodology changes already committed before Spike 010b.

28. No synthetic human rejection or retroactive verification result is introduced
    to manufacture 010a → 010b lineage.

29. Spike 010b's bootstrap evaluator satisfies the substitute pre-freeze evidence
    obligations declared in this brief before implementation starts.

30. Repository validation passes for the Spike 010b implementation: tests,
    typecheck, lint, formatting, and `git diff --check`.

## Expected workflow

Use the ordinary workflow with the bootstrap exception above:

1. commit this draft on `feat/spike-010b`;
2. run Brief Readiness;
3. resolve any findings and freeze the brief;
4. create and freeze the Design Map;
5. prepare the Spike 010b evaluator under evaluator v9 plus the declared
   bootstrap integrity obligations;
6. freeze evaluator only after the substitute pre-freeze integrity checklist
   passes;
7. implement;
8. verify against the already-frozen evaluator;
9. promote only after a trustworthy PASS;
10. create As-Built;
11. obtain human acceptance; and
12. create Outcome.

Do not continue Spike 010a's evaluator-revision sequence inside Spike 010b.
Attempt and evaluator revision numbering are local to Spike 010b.
