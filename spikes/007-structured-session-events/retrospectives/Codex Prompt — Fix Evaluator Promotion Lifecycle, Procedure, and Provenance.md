# Task: Fix evaluator promotion lifecycle, procedure, and artifact provenance

Update the Harness evaluator skill to correct three related problems in the promotion workflow:

1. **Promotion is currently being deferred until after human acceptance.**
2. **Promotion is under-specified enough that the evaluator reconstructs the procedure from historical spikes during execution.**
3. **Promotion is currently treating historical evaluator artifacts as material to rewrite or recreate, rather than preserving the exact artifacts that actually participated in verification.**

These should be fixed together as one narrow evaluator-skill revision.

Do not redesign unrelated parts of the evaluator methodology.

---

# 1. Correct the promotion lifecycle

The current workflow is being interpreted as:

```text
Evaluator PREPARE
      ↓
freeze evaluator artifacts
      ↓
Implementation
      ↓
Evaluator VERIFY
      ↓
PASS
      ↓
Human acceptance
      ↓
PROMOTE
```

This is not the intended lifecycle.

The intended lifecycle is:

```text
Evaluator PREPARE
      ↓
freeze evaluator artifacts
      ↓
Implementation
      ↓
Evaluator VERIFY
      ↓
PASS
      ↓
PROMOTE eligible evaluator artifacts
      ↓
Human acceptance
      ↓
Outcome / spike completion
```

Evaluator verification and human acceptance are separate gates.

A successful evaluator `PASS` establishes that the implementation satisfies the frozen machine-verifiable evaluation contract.

At that point, evaluator-owned promotion work should be completed before control is yielded to the human acceptance gate.

Human acceptance gates final product/spike acceptance. It does **not** ordinarily gate evaluator-artifact promotion.

---

## Behaviour on VERIFY failure

If verification fails:

- do not promote evaluator artifacts;
- preserve failure evidence according to the existing evaluator rules;
- follow the existing correction/revision workflow;
- do not proceed as though the evaluator cycle passed.

---

## Behaviour on VERIFY PASS

If verification passes:

1. determine promotion eligibility using the existing promotion rules;
2. promote eligible artifacts immediately;
3. preserve the exact verification evidence associated with that PASS;
4. update the required manifests/ledgers/promotion metadata;
5. verify the integrity of promoted artifacts;
6. complete all evaluator-owned PASS work;
7. only then yield to human acceptance.

The normal PASS path must **not pause for human permission before promotion**.

Avoid ambiguous terminology such as:

```text
accepted PASS
```

unless the methodology explicitly defines that as a separate evaluator state.

A machine-verifiable evaluator result should simply be `PASS` or `FAIL` according to the evaluator contract. Human acceptance is a separate later gate.

---

# 2. Make promotion procedurally deterministic

During Spike 007, after being manually instructed to promote, the evaluator had to reason about:

- which previous spike represented the "strongest precedent";
- how `evaluation/` should be structured;
- how `attempts/001/` should be structured;
- which private artifacts should be copied;
- whether an unchanged suite should be copied or referenced;
- how previous conventions interacted with the current evaluator contract.

Promotion itself then consumed several minutes.

This indicates that promotion is still being treated as a methodology-discovery task.

That is not desirable.

By the time verification has passed, promotion should be primarily a **deterministic bookkeeping and preservation operation**.

Normal promotion should not require the evaluator to:

- find a "strongest existing precedent";
- inspect previous spikes to infer normal directory layout;
- reverse-engineer copy/reference conventions;
- rediscover which files constitute historical evidence;
- reinterpret unchanged-suite rules from old examples;
- reread historical material merely to gain confidence about the procedure.

Historical spikes may remain useful while **designing or revising the skill**, but the resulting evaluator skill must itself become the normative procedural contract.

---

## Required promotion procedure

Inspect the current evaluator skill, manifests, and repository conventions and encode the normal promotion procedure explicitly.

Do not blindly copy Spike 005 or Spike 007. Extract the generic rule they are intended to embody.

The revised skill should make explicit, where applicable:

- the canonical public promotion location;
- the purpose and structure of `evaluation/`;
- how `attempts/NNN/` numbering is allocated;
- what constitutes a verification attempt;
- exactly which artifacts constitute attempt evidence;
- exactly which artifacts constitute a frozen evaluator revision;
- which artifacts are copied;
- which artifacts are referenced rather than duplicated;
- what happens when the evaluator revision used by a passing attempt is already preserved unchanged;
- what happens when a corrected/new evaluator revision exists;
- how first-attempt PASS differs, if at all, from later-attempt PASS;
- what manifests or ledger entries are written;
- what hashes or identities must be preserved;
- what integrity checks are required after promotion;
- which actions must complete before control passes to human acceptance.

Prefer a procedure structurally equivalent to:

```text
PASS
  → identify exact frozen evaluator revision used
  → identify exact verification result/evidence
  → allocate attempt number
  → preserve attempt evidence
  → copy/reference exact frozen evaluator artifacts according to revision identity
  → update promotion metadata
  → verify hashes/identity
  → yield to human acceptance
```

rather than:

```text
PASS
  → inspect previous spikes
  → infer appropriate convention
  → recreate public versions of the artifacts
```

---

# 3. Preserve historical artifacts exactly

This is a critical provenance invariant.

Promotion is an archival operation.

The purpose of promoted evaluation artifacts is to preserve the evaluator and evidence that **actually participated in the completed verification**.

Therefore:

> **An artifact promoted as historical evaluation evidence must be byte-identical to the frozen/source artifact it represents.**

Promotion must not regenerate or editorially recreate historical evaluator artifacts.

The evaluator must not:

- rewrite them;
- normalize them;
- "clean them up";
- improve wording;
- recreate them from memory;
- summarize them into replacements;
- alter headings or commentary;
- change terminology;
- add explanatory prose inside them;
- otherwise produce a new version that merely represents the same intended content.

If an artifact already exists as part of the frozen evaluator or completed verification evidence, preserve **that exact artifact**.

Use copying, linking, or explicit referencing according to the repository's canonical promotion model.

---

## Copy versus reference

Preserve the existing rule that an unchanged evaluator suite should not be needlessly duplicated.

However, make the mechanics unambiguous.

For example:

- if the frozen evaluator revision is not yet present in the public promotion area, preserve its exact artifacts there;
- if an already-promoted evaluator revision is byte-identical to the revision used for a later attempt, reference that canonical revision rather than creating a second editorial copy;
- each attempt should still preserve/reference enough information to prove exactly which evaluator revision produced its result.

The agent should not decide this by prose interpretation of previous spikes.

It should be mechanically determinable from revision identity/hashes and the current repository state.

---

# Newly generated promotion metadata

Promotion may sometimes require **new metadata that did not exist during evaluation**, such as:

- a promotion manifest entry;
- an attempt-to-evaluator-revision reference;
- a compact index;
- a pointer to canonical promoted artifacts.

This is distinct from historical evidence.

Any newly generated promotion metadata must:

- be explicitly defined by the skill;
- be clearly identifiable as promotion-time metadata;
- never masquerade as an artifact that existed during evaluator freeze or verification;
- avoid making unnecessary semantic claims about the evaluation;
- use mechanically derived facts where possible.

Do not generate explanatory prose simply because a directory would look nicer with a README.

If a README/index is not required by the promotion contract, do not invent one during promotion.

If a README/index **is** required, specify exactly what information it contains and make clear that it is promotion metadata, not frozen historical evidence.

In particular, avoid phrases such as:

```text
accepted PASS
```

that can accidentally encode a different lifecycle from the actual evaluator contract.

---

# Hash and identity verification

After promotion, verify mechanically that preserved historical artifacts match their sources.

Where practical, the skill should require:

- source hash;
- promoted artifact hash;
- equality check;
- evaluator revision identity;
- verification attempt identity.

A promotion must not be considered complete if an artifact claimed to be a preserved frozen evaluator artifact differs from its source.

If the repository already has canonical hashing/integrity mechanisms, use them rather than introducing another competing scheme.

---

# Historical documents are immutable evidence

Do not edit historical evaluation artifacts merely because the current skill contract has changed.

The skill revision should govern **future execution**.

Existing historical documents should remain historical records unless the repository already contains an explicit correction mechanism for factual/provenance defects.

Do not opportunistically rewrite previous spike history to make it conform to the new wording.

If inspection reveals that an already-created Spike 007 promotion artifact was regenerated or editorially changed rather than exactly preserved, report that fact separately.

Do not silently "repair history" as part of this skill revision.

---

# Promotion eligibility is unchanged

Do not broaden the semantic meaning of promotion.

Promotion should still occur only where an evaluator artifact satisfies the existing criteria for durable/public regression coverage.

This task changes:

- **when** promotion happens;
- **how** promotion is performed;
- **how strictly provenance is preserved**.

It does not mean:

- every hidden test is automatically public;
- every private evaluator artifact must be promoted;
- every PASS necessarily has promotable tests;
- human judgment is forbidden where the existing methodology genuinely requires it.

If the current skill contains valid promotion-eligibility criteria, preserve them.

---

# Preserve evaluator invariants

Do not weaken the existing evaluator architecture.

Preserve, unless resolving an actual contradiction requires otherwise:

- evaluator preparation before implementation;
- frozen evaluator identity;
- integrity/hash checks;
- public/private evaluator separation;
- evaluator revision/versioning rules;
- append-only historical evidence where currently required;
- failed-attempt preservation where currently required;
- rules preventing accidental deletion or loss of hidden tests during promotion;
- correction/revision rules;
- human acceptance as a final workflow gate;
- the distinction between evaluator verification and human product acceptance.

Do not opportunistically redesign:

- evaluator preparation;
- hidden-test generation;
- positive-control architecture;
- shared evaluator infrastructure;
- implementation workflow.

Keep this revision focused on promotion lifecycle, mechanics, and provenance.

---

# Skill versioning and history

Follow the repository's established skill-versioning rules.

If the current evaluator skill contract is immutable once used, create the appropriate new version and preserve the previous one.

Do not overwrite historical skill versions merely to simplify the repository.

The revised skill should become the authoritative specification for future promotion runs.

---

# Validation

After making the change, validate the evaluator skill end-to-end.

## Lifecycle validation

### VERIFY failure

Confirm that:

- promotion does not occur;
- failure evidence is preserved;
- the correction/revision path remains intact.

### VERIFY PASS

Confirm that:

- promotion occurs immediately after PASS;
- no human approval is required before normal evaluator-owned promotion work;
- promotion completes before human acceptance;
- human acceptance remains a later gate.

---

## Procedural validation

Consider a hypothetical spike with:

- a frozen evaluator revision;
- completed implementation;
- a passing verification result;
- private frozen evaluator artifacts;
- verification evidence;
- no access to historical spike examples.

Ask:

> Starting only from the revised evaluator skill and the artifacts of this hypothetical spike, can an evaluator determine exactly when and how to perform promotion without consulting an earlier spike for procedural guidance?

If not, identify and remove the remaining ambiguity.

---

## Provenance validation

Ask:

> Can an evaluator complete promotion without rewriting or regenerating any historical artifact that already exists?

The normal answer should be yes.

Explicitly confirm that the procedure distinguishes:

```text
historical evidence
```

from:

```text
new promotion-time metadata
```

and that historical evidence remains byte-identical to its source.

---

## Scenario validation

Walk the written procedure through at least these scenarios:

1. first verification attempt passes;
2. first attempt fails, evaluator revision is corrected, later attempt passes;
3. later passing attempt uses an evaluator revision already promoted unchanged;
4. PASS occurs but nothing qualifies for public test promotion;
5. promotion metadata is required but all historical evaluator artifacts already exist canonically;
6. the source and destination hashes unexpectedly differ.

For each scenario, the skill should make the expected behaviour determinable without consulting an old spike.

---

# Independent skill review

After implementing the revision, have the repository's normal independent reviewer inspect the revised skill.

Ask the reviewer specifically to identify:

- any wording that still permits:

```text
PASS → human acceptance → promotion
```

- any normal promotion step that requires consulting historical precedent;
- any historical artifact that the procedure tells the evaluator to recreate with `Write` rather than preserve exactly;
- any ambiguity between copying, linking, and referencing;
- any generated metadata that could be mistaken for frozen evidence;
- any ambiguous terminology such as `accepted PASS`;
- unclear attempt numbering;
- unclear evaluator-revision identity;
- unclear handling of unchanged evaluator revisions;
- contradictions with manifests, ledgers, or related workflow documentation.

Also ask:

> Could an evaluator following this skill accidentally rewrite history while believing it was performing promotion?

If yes, the revision is not complete.

Do not treat resemblance to a previous spike as sufficient validation.

The revised contract must stand on its own.

---

# Report

When complete, report:

- files changed;
- skill version created or modified;
- resulting evaluator PASS lifecycle;
- canonical promotion procedure now encoded;
- exact provenance rule now encoded;
- distinction between historical evidence and new promotion metadata;
- any existing wording that was contradictory or ambiguous;
- whether historical precedent is still required anywhere during normal promotion, and why if so;
- validation/checks run and results;
- independent review result;
- any already-existing Spike 007 promotion artifacts that appear to have been regenerated or altered rather than exactly preserved.

Do **not** modify those historical Spike 007 artifacts as part of this task unless the existing methodology contains an explicit, provenance-preserving correction mechanism and the task absolutely requires it.

Keep the implementation narrowly focused on making evaluator promotion:

**correctly ordered, deterministic, provenance-preserving, and self-contained.**