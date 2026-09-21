# Spike 014b — Post-Verification Human Review

## Status

**PROMOTION HOLD — human acceptance not yet recorded.**

Evaluator verification attempt 1 recorded a genuine `PASS` against implementation
commit:

`0d000d94e22016381f0642905b731474c4dd0afe`

using the frozen Spike 014b bootstrap evaluator v11 and evaluator revision `001`.

That PASS remains valid historical evidence for what the frozen evaluator actually
checked. This review does not rewrite, invalidate, or retrospectively alter that
verification result.

A subsequent independent repository/architecture review found material defects in
the Spike 014b candidate that should be corrected before human acceptance and
methodology trust promotion.

The defects below are derived from the already-frozen Spike 014b brief and Design
Map. They do not add new product requirements or alter the definition of success.

The existing Spike 014a `KERNEL_SUPPORT_REQUIRED` handback remains unchanged.
Runtime integration of trusted-methodology selection into the generic kernel is
still a Spike 014a responsibility and is explicitly **not** treated as a new
014b defect here.

---

## Review classification

The candidate should not be promoted in its current form.

The findings are primarily **implementation defects in the 014b
methodology-evolution mechanism**.

Because evaluator revision `001` reported AC01–AC18 PASS while several of the
findings below materially affect AC12–AC16 and the contract-fidelity guarantees,
the human review also identifies an **evaluator coverage/sufficiency defect**:
the frozen evaluator did not falsify these second-order authority properties.

That evaluator finding does not authorize new acceptance semantics. Any evaluator
repair must be traceable directly to the frozen brief, frozen Design Map, and
this review's identification of missed existing requirements.

---

# Material defects

## D01 — Promoted methodology identity is not bound to the promoted revision

### Current behavior

`promoteMethodology()` validates the supplied `candidate.manifest`, but it does
not rebuild the methodology manifest from `candidate.revision` and require the
rebuilt identity to equal `candidate.manifest.id`.

A caller can therefore construct a candidate object in which:

- `revision` names commit B; and
- `manifest` contains the coherent methodology from commit A.

Promotion can then append a trusted event recording methodology A with revision B.

### Why this matters

Spike 014b exists to establish one exact coherent methodology identity. A trusted
history entry must never claim that a methodology came from a revision whose
actual bytes produce a different methodology.

### Required correction

Before promotion, reconstruct the candidate methodology from the exact candidate
revision and require exact equality with the supplied candidate manifest and
identity.

Trusted-history validation should likewise be able to prove that each stored
`methodology` identity corresponds to the stored `revision`, when the referenced
revision is available in the repository.

---

## D02 — PASS authority is not bound to the exact candidate being promoted

### Current behavior

Ordinary trusted-methodology promotion checks that:

- explicit human promotion authority exists;
- the evaluator methodology named in the authority is the current trusted
  methodology; and
- the candidate did not evaluate itself.

It does **not** prove that the supplied PASS evidence evaluated the exact
candidate methodology/revision now being promoted.

A PASS for candidate A can therefore be cited while promoting candidate B if the
caller supplies otherwise structurally valid authority.

### Why this matters

The central trust invariant is not merely "N evaluated something before N+1 was
promoted". It is:

> trusted methodology N evaluated this exact candidate N+1, and the human
> promotion decision applies to that same candidate.

### Required correction

Promotion authority must bind at least:

- evaluated candidate methodology identity;
- evaluated candidate revision;
- evaluating trusted methodology identity;
- PASS result/evidence identity.

Promotion must reject any mismatch between those fields and the candidate being
promoted.

The bootstrap form must likewise bind the explicit human-bootstrap evidence to
the exact candidate/revision rather than accepting only a non-empty evidence
string.

---

## D03 — `exercise` does not exercise candidate methodology behavior

### Current behavior

`exerciseMethodology()` currently:

1. runs `check`;
2. creates an unrelated temporary Git repository;
3. writes a generic `role-evidence.json`;
4. commits it; and
5. proves trusted methodology history did not change.

It does not execute a candidate role, consume a candidate role contract, produce
a role-specific expected artifact, or otherwise demonstrate compatibility
between a candidate skill and its contract.

### Why this matters

The frozen brief requires a bounded disposable exercise sufficiently strong to
show that the migrated methodology is internally coherent and that skills can
produce their expected artifacts/checkpoints without direct publication.

A generic `git init && git commit` proves the environment can create a Git
commit. It does not prove the candidate methodology can perform even a bounded
representative role exercise.

### Required correction

Make `exercise` perform at least one representative, disposable candidate
methodology scenario that consumes the candidate's actual contract/skill
definition and demonstrates:

- candidate authority remains untrusted;
- the exercised role is resolved from the candidate methodology;
- the role's declared checkpoint/artifact behavior is represented;
- a local checkpoint can be produced;
- no publication occurs; and
- trusted methodology identity remains unchanged.

The exercise may remain intentionally small and need not reproduce the full
Harness workflow or generic kernel execution that belongs to Spike 014a.

---

## D04 — `check` validates only a subset of the fidelity contract it claims to validate

### Current behavior

`checkMethodology()` usefully checks several important properties, including:

- active role set;
- policy/skill/contract links;
- common capability vocabulary;
- evaluator isolation shape;
- worker-publication prohibitions;
- selected postconditions;
- evaluator classification vocabulary;
- repair input names;
- As-Built artifact-only result semantics;
- Outcome completion modes; and
- selected worker-authority prose patterns.

However, it does not materially validate several dimensions named by the frozen
fidelity matrix and Design Map, including broad role-specific input fidelity,
trigger/predecessor relationships, human-interaction semantics, and several
cross-component authority relationships.

### Why this matters

The frozen Design Map defines `check` as the structural coherence guard for a
coherent candidate methodology. A candidate can currently drift in important
ways while still returning `valid: true`.

### Required correction

Strengthen `check` so its claimed validation surface matches the material
fidelity rules frozen by 014b.

Do not attempt to encode every sentence of every skill as brittle pattern
matching. Prefer explicit structural invariants where the methodology has a
machine-readable representation, and keep genuinely semantic prose review as
human/evaluator review.

At minimum, deterministic contract/policy relationships that can be checked
without guessing should be checked.

---

## D05 — Implementation retry feedback input has no configured producer

### Current behavior

`methodologies/harness/contracts/implementation.json` declares optional input:

`implementationFeedback`

from event:

`implementation-feedback-recorded`

The migrated implementation skill says retries consume only sanitized public
feedback bound from the exact earlier confirmed implementation failure.

The configured policy contains no outcome or host transition that produces
`implementation-feedback-recorded`.

### Why this matters

The migrated skill therefore describes a bounded feedback authority that the
configured methodology cannot actually supply.

This is an internal skill/contract/policy mismatch of exactly the kind Spike
014b was created to eliminate.

### Required correction

Define one coherent feedback binding.

Either:

- configure a public feedback event/artifact transition that is produced from
  the exact finalized `IMPLEMENTATION_FAILURE` verification and consumed by the
  implementation retry; or
- bind the retry feedback directly from an existing exact verification event and
  committed feedback artifact if that is the smaller coherent representation.

Do not leave authority discoverable from ambient repository state or prose.

---

## D06 — Evaluator result cross-field invariant is not represented by the machine contract

### Current behavior

The evaluator skill correctly states:

- `PASS` carries no classification; and
- every `FAIL` or `BLOCKED` carries exactly one valid classification.

`evaluator-verify.json` only declares independent value vocabularies for
`result` and `classification`.

The generic kernel's ability to enforce dependent-field constraints remains a
known Spike 014a handback.

### Why this matters

The frozen 014b brief explicitly requires the **target methodology contract** to
represent the invariant even if generic enforcement is deferred to 014a.

The current candidate documents it in skill prose but does not make it part of
the structured role contract.

### Required correction

Add a declarative contract representation of the dependent-field invariant,
without adding evaluator-specific branching to the generic kernel.

Spike 014a remains responsible for teaching generic contract validation to
enforce that representation.

---

## D07 — Trusted-history append is vulnerable to concurrent promotion races

### Current behavior

Promotion:

1. reads current trusted history;
2. computes `sequence = history.length + 1`;
3. appends one line.

The append itself is durable, but there is no serialization around the
read/validate/append transaction.

Two concurrent human-authorized promotions can both observe the same current
trusted identity and append competing events with the same next sequence.

### Why this matters

`trusted.jsonl` is intended to be append-only canonical trust history. It must
not be possible for concurrent writers to create an invalid or ambiguous trust
chain.

### Required correction

Serialize the promotion transaction with a repository-local lock or another
small single-writer mechanism appropriate to the current Harness scope.

After acquiring the lock, re-read and revalidate the trusted head before
appending.

Do not build distributed locking.

---

# Explicit non-defect / Spike 014a handback

## Trusted methodology is not yet the runtime selector

The new `trusted.jsonl` identity is not yet wired into the generic kernel's
normal methodology-definition allocation path. Current runtime code can still
construct definitions from configured working-tree paths.

This is operationally important, but it is **not a new Spike 014b defect**.

The frozen 014b Design Map explicitly records durable trusted-versus-candidate
runtime selection and already-bound validator availability as remaining generic
kernel support for Spike 014a.

Therefore this review does not ask 014b to wire trust selection into
`ExecutionKernel`.

Until Spike 014a completes that handback, promotion of a methodology records the
trusted methodology decision for future governed execution but does not, by
itself, prove that the current runtime mechanically selects that trusted
methodology.

---

# Proposed bootstrap-safe correction process

## 1. Hold promotion

Do not:

- archive the current PASS as final accepted promotion evidence;
- append the candidate methodology to trusted history;
- run Outcome; or
- treat Spike 014b as accepted.

Preserve verification attempt 1 and commit
`8e7d5284308c3c5aacf08c1ec5884dbb38da263d` unchanged as historical evidence.

## 2. Human decision on this review

The human should explicitly decide whether this review is accepted as a
post-verification correction record.

If accepted, record the decision as:

- candidate acceptance withheld / rejected for correction;
- implementation defects D01–D07;
- evaluator coverage/sufficiency defect because evaluator revision `001`
  reported PASS without detecting material frozen-contract violations; and
- acceptance semantics unchanged.

This human decision becomes the bootstrap authority for the correction cycle.

## 3. Repair the evaluator before changing implementation

Use the **same pinned pre-014b evaluator v11 skill** from the immutable bootstrap
authority bundle.

Do not use candidate evaluator v12 as authority.

Invoke evaluator `repair` under explicit human bootstrap authority, using this
review as the human `EVALUATOR_COVERAGE_DEFECT` trigger.

The repair may strengthen evaluation only for requirements already present in
the frozen 014b brief and Design Map. It must not introduce candidate-shaped
acceptance semantics.

Preserve evaluator revision `001` and create a distinct corrected evaluator
revision.

## 4. Re-verify the unchanged candidate

Before implementation changes, run the repaired frozen evaluator against the
same implementation commit:

`0d000d94e22016381f0642905b731474c4dd0afe`

The expected purpose is to prove that the repaired evaluator can now falsify the
known defects without moving the implementation target.

A non-PASS result should produce only sanitized public feedback for
implementation.

Do not rerun semantic `prepare`.

## 5. Correct implementation under frozen bootstrap implementation authority

Use the same pinned implementation v3 bootstrap skill from baseline:

`e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`

Candidate edits to the active implementation/evaluator skills remain content,
not authority.

The implementation receives:

- the original frozen brief;
- original frozen Design Map;
- original public evaluation requirements;
- this accepted human review/correction record; and
- sanitized public feedback from the repaired evaluator verification.

Implement only the smallest coherent correction for D01–D07.

Do not implement the existing Spike 014a generic-kernel handback inside 014b.

Produce a new exact local implementation checkpoint. Human bootstrap authority
performs publication.

## 6. Verify the corrected candidate with the repaired evaluator

Use the same pinned evaluator v11 **skill authority**, now operating the repaired
frozen evaluator revision produced in step 3.

Do not rerun `prepare`.

Verify the new exact implementation candidate.

Preserve all prior attempts and evaluator revision lineage.

## 7. Repeat independent human review

Even after evaluator PASS, explicitly re-check D01–D07 against the final
candidate.

The repaired evaluator is evidence, not a replacement for the human acceptance
gate.

## 8. Only then perform the two promotions

After:

- repaired evaluator PASS;
- D01–D07 human review PASS; and
- explicit human acceptance,

perform, in order:

1. evaluator evidence archival/promotion;
2. human methodology trust promotion of the exact evaluated candidate.

The methodology promotion event must bind the exact candidate methodology,
candidate revision, evaluator authority, PASS evidence, and human acceptance.

## 9. Resume Spike 014a

After 014b is accepted and its corrected methodology identity is trusted, resume
Spike 014a against that exact methodology.

Spike 014a remains responsible for the existing generic-kernel handback,
including trusted-methodology runtime selection.

---

# Why this correction does not require a new brief

D01–D07 do not alter scope or introduce new success criteria.

They are failures to fully realize already-frozen 014b requirements concerning:

- coherent methodology identity;
- exact trust/evaluation provenance;
- meaningful candidate exercise;
- structural fidelity checking;
- bound retry authority;
- structured result invariants; and
- durable monotonic promotion.

The appropriate process is therefore a bounded correction cycle under the
existing frozen 014b authority, not a successor specification spike.
