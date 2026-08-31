# Spike 010c — Evaluator Integrity Enforcement

## Goal

Close the remaining evaluator-integrity gap exposed by human review of Spike 010b.

Spike 010b established useful preparation structure:

- one criterion-specific evidence record per material acceptance criterion;
- a private evaluator inventory identity;
- a public-safe readiness attestation;
- authority rejection when readiness is not declared `PASS`; and
- forward-only handling of evaluator-integrity defects discovered after
  verification allocation.

However, the critical preparation guarantee is still too weak.

The public authority can prove:

```text
readiness attestation says FAIL
→ evaluation-prepared is rejected
```

but the workflow does not yet provide a sufficiently mechanical guarantee that
the **producer** of that attestation detects an internally incomplete evaluator
bundle.

Spike 010c must establish that guarantee without turning Harness into a semantic
judge of evaluator quality.

## Context and preserved history

Spike 010b remains immutable historical evidence.

Its canonical public state currently records:

```text
technical verification PASS
→ promotion recorded
→ As-Built recorded
→ human decision pending
```

Human review subsequently identified two evaluator-integrity concerns:

1. the visible regression used to support the missing-procedure criterion proves
   that the authority rejects a failed readiness attestation, but does not itself
   prove that evaluator preparation mechanically detects a declared procedure
   whose required material is absent; and
2. the promoted evaluator result reports `13 of 13` mandatory cases while
   naming 14 procedure identifiers, demonstrating that evaluator result
   accounting can contradict the frozen inventory.

These findings must not rewrite Spike 010b's PASS, promotion, As-Built, evaluator
result, workflow note, or canonical authority history.

The fact that evaluator v10 participated in Spike 010b verification is preserved
as bootstrap history. Spike 010c does not classify that fact by itself as an
evaluation failure.

## Scope

### 1. Mechanically validate the evaluator bundle before readiness PASS

Evaluator preparation must include a deterministic, machine-executable
pre-freeze integrity validator over the candidate evaluator bundle.

The validator must consume the actual prepared evaluator structures used for
freeze, rather than trusting a manually supplied readiness result.

At minimum it must mechanically establish structural properties equivalent to:

- every required criterion evidence record references existing procedure/case
  identifiers;
- every referenced procedure/case has a concrete definition in the prepared
  evaluator bundle;
- every procedure declared executable references all required executable/support
  material;
- every required referenced file exists and participates in the candidate freeze
  inventory;
- every prepared procedure maps back to the criterion records it establishes;
- every required criterion maps forward to prepared evidence;
- required criterion/procedure dispositions are complete; and
- the public-safe criterion projection agrees structurally with the private
  prepared bundle.

The Design Map may define the validator's exact input schemas, location, and
command surface.

The validator may operate on private evaluator material. It must not require that
hidden cases, private paths, fixtures, or grader logic become public.

### 2. Reproduce the original missing-procedure failure directly

Visible or otherwise durable evaluator-readiness regression evidence must create
the actual invalid condition rather than pre-setting the expected validation
result.

Conceptually:

```text
criterion ACx
→ procedure E3 declared required
→ evaluator bundle/inventory omits E3's required material
→ preparation-integrity validator runs
→ FAIL
→ evaluator revision cannot freeze
→ readiness PASS cannot be emitted
→ evaluation-prepared cannot become canonical
```

A test that starts with:

```text
integrityValidation = FAIL
```

and confirms that the public authority rejects it is useful authority coverage,
but is not sufficient evidence for this criterion by itself.

### 3. Preserve the public/private authority boundary

The public methodology authority remains an attestation consumer.

It may validate:

- the public criterion projection;
- evaluator revision identity;
- private inventory identity as an opaque identity;
- validator/result identity or equivalent public-safe binding; and
- that the preparation-integrity result is `PASS`.

It must not inspect evaluator-private contents or decide whether a hidden test is
semantically good.

The preparation validator is responsible for mechanically producing the
readiness result from the actual candidate evaluator bundle.

### 4. Derive evaluator accounting from frozen evidence

Evaluator attempt/result accounting must not depend on manually maintained
counts that can contradict the frozen bundle.

Where an evaluator result reports quantities such as:

```text
mandatory cases: N of N
criterion records: N
procedures: N
executable cases: N
```

those quantities must be derived from, or mechanically checked against, the
frozen evaluator inventory/case manifest/criterion records used by that attempt.

A terminal result must not be valid when its structured accounting contradicts
the frozen identities it references.

Human-readable prose may summarize the derived accounting, but may not be the
sole authoritative source of those counts.

### 5. Validate positive and negative preparation paths

The integrity mechanism must demonstrate both:

```text
complete prepared bundle
→ validator PASS
→ freeze permitted
```

and:

```text
structurally incomplete prepared bundle
→ validator FAIL
→ freeze prohibited
```

At minimum the negative evidence must cover a missing required procedure/file
relationship of the class that escaped Spike 010b's evidence.

Additional structural negative cases are permitted when they exercise the same
frozen validator contract without expanding semantic scope.

### 6. Keep semantic evaluator judgement outside the validator

The deterministic validator establishes structural integrity, not substantive
truth.

It must not decide:

- whether a criterion is well designed;
- whether a hidden test oracle is intellectually correct;
- whether static/manual evidence is persuasive;
- whether implementation satisfies a criterion; or
- whether the evaluator should have chosen a different evidence strategy.

Those remain evaluator or human judgements.

### 7. Preserve post-implementation evaluator boundaries

The frozen evaluator contract still governs candidate verification.

A preparation-integrity mechanism may prove defective after implementation
exposure, but correction must follow the existing bounded evaluator-repair rules
and immutable revision history.

Do not modify the validator merely to make the current implementation pass.

A missing acceptance semantic is a specification/process successor issue, not a
validator patch.

## Bootstrap process exception

Spike 010c changes the evaluator preparation-integrity mechanism that would
normally help govern its own evaluator preparation.

This exception is declared before brief freeze.

For Spike 010c only:

1. evaluator v10 from the current repository may be used as the bootstrap
   evaluator contract even though Spike 010b has not been human-accepted;
2. this use is a controlled bootstrap dependency and does not imply acceptance
   or retroactive completion of Spike 010b;
3. before Spike 010c implementation begins, its evaluator must freeze the
   criterion/evidence strategy and all candidate evaluation semantics;
4. the evaluator-preparation executor must use the strongest integrity checks
   available before implementation and preserve their exact evidence;
5. the implementation produced by Spike 010c may introduce the corrected
   validator mechanism;
6. that new mechanism may participate in Spike 010c verification when its use is
   explicitly recorded as bootstrap/self-hosting provenance;
7. use of the new mechanism during verification must not alter the already-frozen
   acceptance criteria, evidence strategy, cases, or result semantics; and
8. no historical Spike 010b artifact may be rewritten to make the bootstrap
   lineage appear cleaner.

This exception exists because Harness is self-hosting methodology tooling. It is
not general permission for an implementation to redefine its own evaluator after
candidate exposure.

## Process-successor lineage

Spike 010c is a corrective successor to Spike 010b based on human review of the
010b evidence chain.

Do not fabricate a `human-rejected`, `verification-finalized`, or
`successor-linked` event in Spike 010b merely to permit this draft to exist.

If the canonical authority cannot yet represent a process successor from the
current 010b state, the committed Spike 010c brief and its Git provenance are the
bootstrap lineage evidence for this corrective cycle.

This exception does not define general successor semantics. Broader workflow
lineage belongs to later methodology work.

## Non-goals

- no rewrite of Spike 010b historical evidence;
- no claim that evaluator v10 participating in 010b verification invalidates the
  cycle by itself;
- no general agent-neutrality work;
- no general actor/executor provenance framework;
- no redesign of Brief Readiness;
- no general deterministic workflow-phase contract;
- no As-Built fallback redesign;
- no broad promotion/As-Built authority-provenance redesign;
- no one-test-per-criterion requirement;
- no mandatory hidden-test requirement;
- no semantic evaluator-quality oracle;
- no generic cycle framework;
- no hostile same-user isolation;
- no unrelated Harness runtime/product work.

## Acceptance Criteria

1. Evaluator preparation has a deterministic machine-executable integrity
   validator over the actual candidate evaluator bundle.

2. The validator mechanically rejects a required criterion/procedure reference
   whose required evaluator material is absent.

3. The missing-procedure negative path is constructed as an incomplete prepared
   bundle; the test does not simply pre-set `integrityValidation: FAIL`.

4. A failed integrity validation prevents private evaluator freeze.

5. A failed integrity validation prevents emission/recording of a valid readiness
   PASS for that evaluator revision.

6. A failed preparation therefore cannot reach canonical
   `evaluation-prepared`.

7. A structurally complete prepared evaluator bundle can pass the same validator
   and proceed to freeze.

8. Criterion → procedure and procedure → criterion traceability are
   mechanically checked in both directions.

9. Required evaluator files/support material are checked against the actual
   prepared bundle/freeze inventory.

10. Public-safe readiness evidence is mechanically bound to the validator result
    and evaluator/inventory identity without exposing evaluator-private content.

11. The public authority remains a structural attestation consumer and does not
    become a semantic evaluator.

12. Terminal evaluator result accounting is derived from or mechanically checked
    against the frozen evaluator bundle and cannot contradict its case/procedure
    inventory.

13. Regression evidence demonstrates rejection of deliberately inconsistent
    evaluator-result accounting equivalent to the Spike 010b `13 of 13` while
    naming 14 procedures defect.

14. Non-executable/static/manual/provenance evidence remains valid when properly
    prepared; the integrity validator does not force executable coverage where
    no fair executable seam exists.

15. Spike 010b remains unchanged as historical evidence.

16. Any use of the Spike 010c-produced evaluator-integrity mechanism during its
    own verification is explicitly recorded as bootstrap/self-hosting
    provenance and does not change frozen evaluation semantics.

17. Repository validation passes: tests, typecheck, lint, formatting, and
    `git diff --check`.

## Expected workflow

1. commit this draft on `feat/spike-010c`;
2. run Brief Readiness;
3. resolve findings and freeze the brief;
4. create and freeze the Design Map;
5. prepare and freeze evaluation under the declared bootstrap exception;
6. implement the integrity validator and accounting correction;
7. verify against the already-frozen evaluation;
8. preserve any bootstrap/self-hosting executor/mechanism provenance;
9. promote only after a trustworthy PASS;
10. create As-Built;
11. obtain human acceptance or rejection; and
12. create Outcome.

Do not use Spike 010c to solve the broader orchestrator/agent-neutrality or
deterministic-phase architecture. Those are explicit follow-on methodology work.
