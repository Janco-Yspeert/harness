# Spike 014b Bootstrap Authority

## Status

This record establishes the explicit bootstrap authority for Spike 014b.

Spike 014b cannot safely be governed by the current active Harness methodology because that methodology is itself the subject of the migration. The spike therefore proceeds under the one-time human bootstrap exception declared in its frozen brief.

This authority is fixed before evaluator preparation or implementation begins.

---

## Baseline

Bootstrap baseline commit:

`e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`

Commit subject:

`docs(spike-014b): add methodology contract migration brief`

The immutable detached authority worktree was created from that exact commit at:

`../harness-014b-authority`

It must remain detached and unmodified for the duration of Spike 014b.

The ordinary Harness worktree is the mutable candidate workspace.

---

## Evaluator authority

The sole evaluator instruction authority for Spike 014b `prepare` and `verify` is the evaluator bundle from the bootstrap baseline.

Evaluator tree identity:

`821e1a85e75c43794eba2e0d820be9b46e05ba15`

Evaluator `SKILL.md` Git blob identity:

`b9e2601dbd4575cfbafc8d1ab4cc81f8c434fe51`

Evaluator `SKILL.md` SHA-256 content identity:

`5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`

Authoritative evaluator path:

`../harness-014b-authority/skills/evaluator/`

This frozen evaluator bundle governs both evaluator preparation and final verification.

Any candidate edits to:

`skills/evaluator/**`

in the mutable Harness worktree are candidate methodology changes only. They do not alter evaluator authority for Spike 014b.

The candidate evaluator must never evaluate, promote, or otherwise establish authority for itself during this spike.

---

## Implementation authority

The sole implementation instruction authority for Spike 014b is the implementation skill from the same bootstrap baseline.

Implementation `SKILL.md` Git blob identity:

`c9a340b00e31352bcd0abc5751a2703b96baa2c5`

Implementation `SKILL.md` SHA-256 content identity:

`bd10992f2d46103e603063230fe2c7dc150f876cee14e23b320a669312682605`

Authoritative implementation path:

`../harness-014b-authority/skills/implementation/SKILL.md`

Candidate edits to:

`skills/implementation/**`

in the mutable Harness worktree do not alter the implementation authority governing this spike.

---

## Public contract authority

The Spike 014b brief is human-approved bootstrap authority:

`spikes/014b-methodology-contract-migration-safe-skill-evolution/spike.md`

It is committed at the bootstrap baseline:

`e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`

The Design Map and Skill ↔ Contract Fidelity Matrix will be produced separately under direct human bootstrap authority.

The current Design Map skill is not authoritative for producing that artifact.

Once the human approves and commits the Design Map, its exact commit and content identity must be recorded before evaluator preparation begins.

---

## Bootstrap execution rules

For Spike 014b only:

* the human is the workflow/orchestration authority;
* the human controls publication of public checkpoints;
* evaluator `prepare` and `verify` use the frozen evaluator bundle identified above;
* implementation uses the frozen implementation skill identified above;
* candidate methodology files may be edited without changing the authority governing the current spike;
* ordinary Harness automatic continuation is not authority for this bootstrap cycle;
* Brief Readiness, Design Map, As-Built, and Outcome skills are not required to establish workflow authority;
* workers may create authorized local Git checkpoints;
* workers must not publish or push as part of their role authority;
* public publication is performed separately under human bootstrap authority;
* private evaluator evidence remains in the existing sibling `harness-hidden` workspace;
* evaluator-private material must not be exposed to implementation.

Where the frozen evaluator or implementation skill contains pre-migration instructions that conflict with the explicit Spike 014b bootstrap exception, the frozen Spike 014b brief and this authority record govern the bootstrap mechanics.

This exception does not permit changing the substantive evaluator acceptance semantics.

---

## Evaluation continuity

Evaluator preparation and verification must use the same frozen evaluator authority identified in this record.

The intended authority relationship is:

```text
frozen methodology N
        |
        | prepare / evaluate
        v
candidate methodology N+1
        |
        | human acceptance and promotion
        v
trusted methodology N+1
```

If the frozen evaluator cannot fairly evaluate the candidate without changing the definition of success, evaluator execution must stop for explicit human review.

The candidate evaluator must not be substituted.

---

## Expiry

This bootstrap authority expires when Spike 014b is accepted or abandoned.

If Spike 014b is accepted, the accepted candidate methodology becomes the trusted methodology for future workflow grants according to the promotion mechanism established by the spike.

Existing Spike 014b evaluation evidence remains bound to the frozen bootstrap authority recorded here.
