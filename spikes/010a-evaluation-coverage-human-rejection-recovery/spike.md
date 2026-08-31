# Spike 010a — Evaluation Coverage and Human-Rejection Recovery

## Goal

Repair the two methodology gaps exposed by the rejected Spike 010 cycle:

1. evaluator verification can currently return `PASS` without durable criterion-level evidence that every material frozen acceptance criterion was actually covered; and
2. the workflow authority has no canonical recovery path after technical verification, promotion, and As-Built complete successfully but the human acceptance gate rejects the implementation.

Spike 010a is a successor correction to Spike 010, not a new unrelated product question.

It must preserve Spike 010 exactly as historical evidence and establish a forward path that does not rewrite its frozen brief, implementation, evaluator artifacts, PASS, promotion, As-Built, or human rejection.

Harness must remain a methodology authority, not a semantic evaluator, autonomous reviewer, or project manager.

The intended boundary is:

```text
Frozen brief defines required outcomes
                ↓
Evaluator freezes criterion-level evidence obligations
                ↓
Implementation is produced
                ↓
Verification executes the frozen evaluator contract
                ↓
Harness validates:
- provenance
- coverage completeness
- transition legality
                ↓
Technical PASS may be recorded
                ↓
Promotion
                ↓
As-Built
                ↓
Human acceptance
        ↙               ↘
     ACCEPT             REJECT
                          ↓
              preserved successor path
```

Harness validates that required evidence relationships exist.

It does not decide whether the implementation, evaluator judgment, or human judgment is substantively correct.

## Lineage

Spike 010 is the predecessor of this spike.

Spike 010 reached the genuine human gate through a provenance-valid technical cycle:

```text
implementation attempt 001
→ e4be145fd17def9e46d42587c2804f3ff08a778c
→ public authority verification 002
→ evaluator-private attempt 001
→ evaluator revision 001
→ PASS
→ promotion
→ As-Built
→ human rejection
```

The earlier public authority verification `001` remains preserved but non-promotable because it lacked the required evaluator-private allocation before candidate evaluation.

The fresh verification path corrected that provenance defect without rewriting history.

Human review then found material contract coverage that the evaluator had not established:

- repository workflow skills had not been updated to consult/update the new methodology authority at canonical boundaries; and
- the visible tests did not demonstrate the frozen implementation-failure recovery, evaluator-defect recovery, and broader rejection/state-transition paths required by the Spike 010 brief.

The resulting PASS was therefore provenance-valid for the evaluator contract that actually ran, but the evaluator contract itself had insufficient traceability to the full frozen acceptance criteria.

That is treated as an **evaluator coverage defect** discovered at human acceptance.

Spike 010 also exposed a second methodology gap: after

```text
PASS
→ promotion
→ As-Built
→ human rejection
```

the new authority had no explicit legal forward path that preserved the old cycle while allowing a materially revised frozen contract.

Spike 010 remains immutable historical evidence.

Spike 010a is the revised successor contract.

## Naming and successor semantics

Harness should support successor spike identifiers such as:

```text
010
010a
010b
```

where needed.

The suffix indicates a materially revised successor contract for the same underlying spike objective after the prior frozen contract can no longer be safely continued.

This is distinct from:

- `implementation 002`: implementation retry under the same frozen contract;
- `evaluator revision 002`: evaluator correction under the same frozen contract; and
- `011`: a genuinely new spike/question.

Spike 010a must not require a generic first-class runtime concept called a "cycle" unless implementation evidence demonstrates that one is necessary.

The methodology only requires an unambiguous predecessor/successor relationship and preservation of immutable historical identifiers.

The exact public representation of that relationship is a Design Map decision.

## Scope

### 1. Criterion-level evaluator coverage map

Evaluator preparation must freeze a machine-readable coverage map connecting every material frozen acceptance criterion to the evaluator evidence plan.

Conceptually:

```text
acceptance criterion
→ evaluator requirement/invariant
→ evaluation case or frozen public/manual evidence plan
→ coverage mode
```

Grouping multiple acceptance criteria into a broader evaluator requirement is allowed.

Loss of criterion-level traceability is not.

Every material acceptance criterion must have an explicit frozen disposition.

Suitable coverage modes may include equivalents of:

```text
EXECUTABLE
PUBLIC_REGRESSION
MANUAL_PUBLIC_EVIDENCE
NOT_APPLICABLE
BLOCKED
```

The exact representation, field names, and vocabulary may be established by the Design Map.

### 2. Coverage completeness before evaluator freeze

Evaluator preparation must not represent a revision as complete while a material frozen acceptance criterion has no declared evidence path.

Where the contract has no fair implementation-independent executable seam, the evaluator must not invent candidate-shaped hidden tests.

Instead it must explicitly freeze the available evidence mode.

For example:

```text
criterion:
  workflow skills consult/update methodology authority

coverage:
  MANUAL_PUBLIC_EVIDENCE

evidence plan:
  inspect the repository-owned workflow skill contracts at the evaluated commit
```

or:

```text
criterion:
  <material criterion>

coverage:
  BLOCKED

reason:
  frozen public contract does not provide a fair evaluable seam
```

A material blocked criterion prevents the evaluator revision from representing itself as ready for an ordinary complete verification PASS.

Evaluator v8's existing principle remains valid:

> hidden tests are optional when no fair implementation-independent seam exists.

Spike 010a adds:

> criterion-level coverage accounting is not optional.

### 3. Verification must account for every mapped criterion

Verification must produce terminal coverage results against the exact frozen evaluator revision.

Harness need not parse test semantics or decide whether prose evidence is persuasive.

The evaluator supplies the criterion-level result.

Harness validates structurally that:

- the verification references the exact frozen evaluator revision;
- that revision contains a complete criterion-level coverage map;
- every required mapped criterion has a terminal result;
- no required criterion remains missing, blocked, or unevaluated when overall result is `PASS`; and
- the overall verification result is structurally compatible with the criterion-level results.

A claimed overall `PASS` with incomplete required coverage must be rejected through the supported authority interface.

### 4. Preserve evaluator judgment boundaries

Harness must still not infer:

- whether implementation genuinely satisfies a criterion;
- whether a test oracle is sound;
- whether manual public evidence is persuasive;
- whether an evaluator classification is intellectually correct;
- whether a criterion is semantically important beyond what the frozen contract states; or
- whether the human should agree with the evaluator.

Those remain evaluator/human judgments.

Harness validates completeness, identity, provenance, and transition consequences.

### 5. Explicit human rejection transition

Add a canonical transition representing human rejection.

Conceptually:

```text
human-rejected
```

The exact CLI and evidence schema may be established by the Design Map.

Human rejection must be legal only when the workflow is genuinely waiting for human acceptance.

It must preserve, unchanged:

- implementation attempt;
- exact implementation commit;
- verification allocation and terminal result;
- evaluator revision and evaluator attempt identity where publicly represented;
- promoted evidence;
- As-Built;
- all prior canonical workflow events; and
- the rejection itself.

No previous event may be rewritten to simplify the history.

### 6. Human rejection classification

Human rejection should carry a bounded public classification sufficient to explain the recovery requirement.

At minimum support distinctions equivalent to:

```text
IMPLEMENTATION_GAP
EVALUATOR_COVERAGE_DEFECT
SPECIFICATION_CHANGE
OTHER_HUMAN_REJECTION
```

The exact vocabulary may be refined by the Design Map.

Harness does not infer the classification.

The human/orchestrator supplies it.

A committed public acceptance/rejection artifact may carry richer rationale.

### 7. Acceptance artifact provenance

Where human acceptance or rejection is represented by a public artifact such as:

```text
acceptance.md
```

the authority should validate its repository path, deterministic content identity, and Git provenance before recording the canonical human decision.

The prose shape of that artifact is not itself a machine contract unless deliberately frozen as one.

### 8. Human rejection closes the predecessor acceptance path

After human rejection, canonical status must represent the prior cycle as technically verified but not accepted.

Conceptually:

```text
technical verification: PASS
promotion: complete
As-Built: complete
human decision: REJECTED
accepted completion: false
```

The authority must not continue to report merely `human acceptance pending`.

It must also not report ordinary successful spike completion.

### 9. Human rejection does not rewrite technical PASS

Human rejection is a later methodology event.

It must not mutate or reclassify the earlier evaluator result.

In particular:

```text
human rejection ≠ verification FAIL
human rejection ≠ verification BLOCKED
human rejection ≠ IMPLEMENTATION_FAILURE
human rejection ≠ EVALUATOR_DEFECT verification result
human rejection ≠ SPECIFICATION_DRIFT verification result
```

A human may discover an implementation, evaluator, or specification problem after a valid technical PASS.

That later discovery must be preserved as a distinct event.

### 10. Material rejection may require a successor spike

Where human rejection establishes that the frozen contract itself must materially change, the authority must permit a successor contract such as `010a` rather than pretending the original spike can simply continue.

The predecessor must remain immutable.

The successor relationship must be explicit and publicly reconstructible.

The authority should be able to answer conceptually:

```text
Spike 010
→ human rejected
→ successor 010a permitted/recorded

Spike 010a
→ predecessor 010
→ new frozen brief
→ new Design Map as required
→ freshly prepared evaluator
→ implementation attempt 001
→ ...
```

Attempt numbering remains local to the successor spike contract.

No predecessor attempt/revision identifier may be reused as though it belonged to the successor.

### 11. Do not over-generalize successor state

Spike 010a need not introduce a generic workflow-cycle framework.

A lightweight predecessor/successor relationship is sufficient if it makes the history unambiguous.

The Design Map should prefer the smallest representation that supports:

- immutable predecessor history;
- successor lineage;
- fresh frozen inputs;
- local attempt/revision numbering;
- legal-next-transition reporting; and
- later Outcome synthesis.

### 12. Workflow-skill integration

Update the relevant repository-owned workflow skills so that canonical methodology boundaries introduced by Spike 010 and Spike 010a use the methodology authority rather than relying only on prose manifests or conversational claims.

At minimum inspect and update where applicable:

- Brief Readiness;
- Design Map;
- evaluator prepare;
- implementation handoff;
- verification allocation/finalization;
- evaluator correction/retry;
- promotion;
- As-Built;
- human acceptance/rejection; and
- Outcome.

The authority is the canonical methodology-state source where the corresponding transition exists.

Human-readable manifests remain useful historical context but must not contradict or substitute for canonical authority state.

This requirement explicitly closes the missing Spike 010 workflow-skill integration criterion discovered at human review.

### 13. Outcome requires canonical human acceptance

An ordinary successful Outcome must require explicit canonical human acceptance.

The state:

```text
verification PASS
→ promotion complete
→ As-Built complete
→ human REJECTED
```

must not permit ordinary successful Outcome.

A later accepted successor may synthesize the predecessor rejection as historical evidence.

### 14. Status must answer what happens after rejection

Canonical status must expose enough information for an autonomous orchestrator to distinguish:

```text
technical verification PASS
promotion complete
As-Built complete
human acceptance pending
human accepted
human rejected
successor required/permitted
```

After human rejection it must answer:

- what was technically verified;
- whether promotion and As-Built completed;
- the human decision;
- the rejection classification;
- whether the predecessor is closed for accepted completion;
- whether a successor contract is required/permitted;
- which predecessor the successor references; and
- what canonical transitions are legal now.

## Bootstrap process exception

Spike 010a changes the evaluator methodology and workflow authority that would normally govern parts of its own execution.

That creates an unavoidable bootstrap boundary.

This exception is declared before the Spike 010a brief is frozen and applies only to this successor spike.

### Bootstrap rule

Spike 010a evaluator preparation and verification run under the previously authoritative evaluator v8 process.

However, the frozen Spike 010a contract itself requires the evaluator to produce criterion-level coverage accounting as explicit evaluation evidence.

The evaluator used for Spike 010a must therefore:

1. prepare under evaluator v8;
2. freeze a criterion-level coverage map satisfying this brief before implementation begins;
3. allocate verification before candidate evaluation according to the existing evaluator provenance rules;
4. verify the exact committed Spike 010a implementation against that already-frozen evaluator revision; and
5. preserve normal evaluator defect/revision history if the frozen evaluator itself proves defective.

The evaluator skill implementation produced by Spike 010a does **not** retroactively govern Spike 010a's own preparation or verification.

It becomes authoritative only for later successor/new spikes after Spike 010a is accepted.

This exception must not be expanded retroactively to excuse:

- missing evaluator allocation;
- changed frozen evidence after implementation;
- uncommitted implementation verification;
- incomplete promotion;
- skipped As-Built;
- fabricated human acceptance; or
- altered predecessor history.

If other workflow skills changed by Spike 010a cannot safely govern their own earlier phase, the same principle applies narrowly: the previously authoritative skill governs that phase, while the frozen Spike 010a contract supplies any additional explicit evidence obligations.

## Trust boundary

Spike 010a remains within the cooperative same-user methodology boundary established by Spike 010.

It does not prevent a shell-capable same-user process from:

- directly editing workflow records;
- modifying Git history;
- bypassing the supported CLI;
- fabricating files; or
- impersonating a nominal human transition.

Those require stronger capability/isolation mechanisms.

Spike 010a must not claim hostile-process security.

## Non-goals

- no semantic interpretation of acceptance criteria by Harness;
- no automatic evaluator test generation;
- no requirement that every criterion have hidden tests;
- no requirement that every criterion be executable;
- no automatic judgment of evaluator quality;
- no autonomous human-acceptance decision;
- no cryptographic proof that a caller is human;
- no rewriting of Spike 010 historical artifacts;
- no changing Spike 010 PASS into FAIL;
- no generic workflow-cycle framework unless demonstrably required;
- no scheduler or project manager;
- no OS-level sandbox or separate Unix identity;
- no remote workflow API;
- no unrelated Harness runtime/daemon feature work.

## Acceptance Criteria

1. Evaluator preparation produces a frozen criterion-level coverage map for every material frozen acceptance criterion.

2. No material acceptance criterion may disappear merely because evaluator requirements aggregate multiple brief criteria.

3. Every material criterion has an explicit frozen evidence mode.

4. Absence of hidden tests remains valid where justified, but absence of a criterion-level evidence plan does not.

5. Evaluator preparation cannot represent itself as complete while a material criterion has no evaluable or explicitly blocked disposition.

6. Verification records terminal criterion-level coverage results against the exact frozen evaluator revision.

7. The authority rejects overall `PASS` when any required mapped criterion is missing, blocked, or unevaluated.

8. Harness validates coverage completeness structurally without deciding semantically whether implementation satisfies the criterion.

9. A canonical human-rejection transition exists and is distinct from human acceptance.

10. Human rejection preserves prior implementation, verification PASS, promotion, evaluator provenance, As-Built, and canonical workflow history unchanged.

11. Human rejection may carry a bounded classification and public reason/evidence.

12. Where an acceptance/rejection artifact is used, its public identity and Git provenance are mechanically validated.

13. Status clearly distinguishes technical PASS, promotion complete, As-Built complete, human acceptance pending, human accepted, and human rejected.

14. A technically passing but human-rejected spike is not considered accepted completion.

15. Human rejection does not rewrite or reclassify the prior evaluator PASS.

16. A material rejection can require/permit a distinguishable successor spike contract such as `010a`.

17. The predecessor/successor relationship is explicit and reconstructible from public canonical state.

18. Attempt and evaluator-revision identifiers remain unambiguous across predecessor and successor spikes.

19. A generic first-class cycle abstraction is not required unless the Design Map demonstrates a concrete need for it.

20. Relevant repository workflow skills consult and update the canonical methodology authority at methodology boundaries rather than relying only on prose manifests.

21. Ordinary Outcome cannot complete from a human-rejected predecessor.

22. A later accepted successor may preserve and reference the rejected predecessor as historical evidence.

23. Visible tests demonstrate a complete criterion-coverage PASS path.

24. Visible tests demonstrate rejection of PASS with a missing mandatory criterion result.

25. Visible tests demonstrate a manual/public-evidence criterion participating successfully without hidden tests.

26. Visible tests demonstrate:

```text
verification PASS
→ promotion
→ As-Built
→ human REJECT
```

while preserving all prior canonical state.

27. Visible tests demonstrate that human rejection does not mutate the prior PASS.

28. Visible tests demonstrate legal successor progression after material human rejection.

29. Visible tests demonstrate illegal attempts to:

- record Outcome after human rejection;
- overwrite the rejected human decision;
- reuse immutable verification attempts;
- rewrite the prior PASS; and
- silently continue the rejected predecessor as though its frozen contract were still open.

30. Visible tests demonstrate the implementation-failure recovery path required by Spike 010:

```text
implementation 001
→ verification FAIL / IMPLEMENTATION_FAILURE
→ implementation 002
→ verification 002
```

31. Visible tests demonstrate the evaluator-defect recovery path required by Spike 010:

```text
implementation 001
→ evaluator revision 001
→ verification BLOCKED / EVALUATOR_DEFECT
→ evaluator revision 002
→ later verification against unchanged implementation 001
```

32. A blocked evaluator defect does not create a new implementation attempt.

33. Invalid transitions leave canonical methodology history unchanged.

34. The repository-owned workflow skills required by this brief have visible evidence establishing their authority integration.

35. `npm test`, `npm run typecheck`, lint, formatting checks, and `git diff --check` pass.

## Evidence expectations

Independent evaluation should focus on:

- the stable public workflow-authority interface;
- criterion-level coverage completeness;
- predecessor/successor state;
- human rejection preservation;
- repository-owned workflow skill integration; and
- the recovery paths missed by Spike 010's evaluator.

The evaluator must explicitly map every Acceptance Criterion above before freezing.

Do not collapse the criteria into broad requirements without preserving criterion-level traceability.

Executable hidden tests are appropriate only where they add fair independent black-box coverage.

Where repository inspection or public evidence is the correct seam, freeze that evidence plan explicitly.

A future reviewer should be able to ask:

```text
Which frozen evidence established AC20?
```

and obtain an unambiguous answer without reconstructing evaluator intent from prose.

## Research questions

Record useful evidence during the spike:

1. Does criterion-level coverage mapping materially prevent evaluator blind spots, or mostly add bookkeeping?

2. Is acceptance-criterion granularity sufficient, or do some criteria need explicit sub-obligations?

3. Can the public authority validate coverage completeness without becoming tightly coupled to evaluator-private mechanics?

4. Does human-rejection classification need the full proposed vocabulary in practice?

5. Is predecessor/successor identity sufficient, or does implementation reveal a real need for a general cycle abstraction?

6. Should a later spike establish a stronger public-authority/evaluator-private handshake for allocation and coverage state?

7. Which remaining methodology guarantees require capability isolation rather than additional cooperative workflow states?

These are observations, not additional implementation requirements.

## Process

Spike 010 historical artifacts are read-only evidence.

Do not modify its:

- frozen brief;
- Design Map;
- evaluator revision;
- implementation;
- verification history;
- promoted evaluation;
- As-Built; or
- recorded human rejection.

Spike 010a should run through the normal Harness methodology subject only to the explicit bootstrap process exception above:

1. Brief Readiness;
2. freeze this Spike 010a brief;
3. Design Map;
4. evaluator prepare under the bootstrap rule;
5. implementation;
6. evaluator verification;
7. promotion;
8. As-Built;
9. human acceptance;
10. Outcome.

This brief is initially introduced on the existing Spike 010 feature branch so the rejected predecessor and its successor contract remain adjacent during transition.

The implementation branch/ref strategy for the successor may be finalized before freeze, but the successor identity itself is `010a`.

No retroactive process exception is permitted.
