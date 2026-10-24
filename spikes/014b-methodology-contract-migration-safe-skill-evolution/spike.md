# Spike 014b — Methodology Contract Migration and Safe Skill Evolution

## Status and relationship to Spike 014a

Spike 014a is paused on a prerequisite methodology/kernel migration problem.

Real bootstrap execution of Spike 014a established that the current production Harness skills and their configured role contracts do not yet form a coherent governed-execution methodology. Some skills still contain assumptions from the pre-kernel workflow: direct publication, role-owned canonical transitions, mismatched semantic-result vocabularies, incomplete capability declarations, and authority discovery that should instead be bound by Harness.

Continuing to repair these incompatibilities one role at a time inside Spike 014a would conflate defects in the generic kernel with defects in the Harness methodology running on top of it.

Spike 014b therefore performs one coherent migration of the active Harness methodology before Spike 014a resumes.

Spike 014b does **not** redesign the domain purpose of the existing skills. Its purpose is to make their execution contracts, structured results, evidence production, Git behavior, authority boundaries, and versioning model agree.

After Spike 014b is accepted, Spike 014a resumes and remains responsible for proving that the generic kernel can execute the migrated methodology end to end.

---

# Bootstrap process exception

The current Harness methodology cannot safely govern its own migration. Spike 014b therefore uses an explicit one-time human bootstrap authority.

For this spike only:

- the human approves and freezes `spike.md` directly;
- the Design Map is produced under direct human authority rather than by the current Design Map skill;
- the Design Map must contain or bind the complete Skill ↔ Contract Fidelity Matrix required below;
- evaluator `prepare` and `verify` use the exact evaluator skill snapshot frozen at the pre-014b baseline;
- implementation uses the exact implementation skill snapshot frozen at the same baseline;
- candidate edits to `skills/evaluator/SKILL.md`, `skills/implementation/SKILL.md`, their contracts, or any other methodology component do not alter those bootstrap authorities;
- Brief Readiness, Design Map, As-Built, Outcome, and ordinary automatic workflow continuation are not required to establish authority for this spike;
- no candidate evaluator may evaluate or promote itself;
- no role may gain direct publication authority as a bootstrap workaround;
- human acceptance is the final authority for promoting the resulting coherent methodology set.

The exact baseline commit and content identities of the evaluator and implementation skill snapshots must be recorded before evaluator preparation.

If the frozen baseline evaluator cannot fairly evaluate the candidate without changing its acceptance semantics, stop for explicit human review. Do not silently substitute the candidate evaluator or construct another recursive evaluator exception.

This exception expires when Spike 014b is accepted.

---

# Question

Can Harness migrate its complete active methodology onto one coherent governed-role contract, while preserving existing domain semantics and establishing a safe active-versus-candidate evolution path in which future skill changes cannot alter the authority evaluating those changes?

---

# Scope

Spike 014b covers every active Harness methodology role and its bound skill, contract, configured policy, evidence requirements, and privileged-action boundary.

The current roles are:

- Brief Readiness;
- Design Map;
- evaluator prepare;
- evaluator repair;
- implementation;
- evaluator verify;
- As-Built;
- Outcome.

The orchestrator is not itself a methodology role and must not be forced into the role-result taxonomy. Its assumptions about role results and continuation must nevertheless remain compatible with the resulting methodology.

---

# 1\. Complete Skill ↔ Contract Fidelity Audit

Before implementation changes begin, create a complete fidelity matrix for every active role.

For each role, compare at least:

- required inputs and their authority/provenance;
- workspaces;
- read/write exposure;
- human interaction;
- repository capabilities;
- Git capabilities;
- semantic role dispositions;
- methodology-result fields and vocabulary;
- conditional result invariants;
- produced artifacts;
- produced repository checkpoint;
- private evidence, where applicable;
- requested privileged host actions;
- authoritative trigger or predecessor;
- postconditions;
- canonical transition expected after successful host validation.

Every material finding must receive exactly one disposition:

- `MATCH`
- `SKILL_MUST_CHANGE`
- `CONTRACT_MUST_CHANGE`
- `KERNEL_SUPPORT_REQUIRED`
- `INTENTIONALLY_ARTIFACT_ONLY`

`KERNEL_SUPPORT_REQUIRED` findings are not to be worked around inside skill prose. They become explicit requirements to carry back into Spike 014a.

The final matrix is part of the frozen 014b Design Map and evaluator authority.

---

# 2\. Common governed-role boundary

All migrated skills must obey the same architectural boundary.

A skill may:

- inspect its explicitly supplied authority and inputs;
- read and write within its granted workspaces;
- perform its domain task;
- run local computation and permitted checks;
- inspect Git;
- create its own local repository checkpoint where required;
- report its semantic Role Result;
- report the exact evidence it produced;
- request privileged host actions through the governed interface.

A skill must not:

- push or publish Git commits itself;
- acquire publication credentials;
- mutate canonical workflow authority directly;
- allocate the next role;
- record its own canonical transition;
- select a different authoritative skill/evaluator version;
- promote itself;
- treat process exit as semantic success;
- infer authority merely from repository files or prose when Harness is required to bind that authority.

A successful role checkpoint is produced locally by the skill. Harness validates the resulting evidence and performs any authorized publication or other privileged action.

The exact representation of produced commits and post-execution host-action requests may be finalized by Spike 014a if the current generic kernel interface cannot yet express it. The methodology requirement is fixed here: a future commit SHA is produced by execution and must not be predicted or pre-bound as though it existed before the role ran.

---

# 3\. Git checkpoint contract

Every currently active Harness methodology role produces durable repository evidence. Therefore every active role contract must permit the repository operations required to create its own checkpoint:

- `repository-read`
- `repository-write`
- `local-computation`
- `git-inspect`
- `git-commit`

Additional workspaces or protections remain role-specific.

`git-publish` is not a worker capability.

Network or credential access must not be added merely to support publication.

A successful artifact-producing role ends with its complete public output in an exact local Git commit and reports that commit as produced evidence. The manifest entry, where the methodology requires one, remains part of that role-owned checkpoint.

For evaluator roles, repository Git authority must not accidentally grant publication or weaken evaluator-private isolation. If the current executor/capability model cannot make repository `.git` writable for an authorized commit without widening unrelated authority, record that as `KERNEL_SUPPORT_REQUIRED` for Spike 014a.

---

# 4\. Semantic-result reconciliation

Spike 014b must reconcile the complete semantic vocabulary of every active skill with its configured contract. Similar words in prose must not automatically become methodology enums.

The following distinctions remain explicit:

- provider/process lifecycle;
- semantic role disposition;
- role-specific methodology result;
- artifact findings/details;
- privileged host-action result.

The generic semantic role dispositions remain:

- `succeeded`
- `blocked`
- `refused`
- `failed`

Role-specific methodology facts are added only when they affect workflow meaning, routing, or durable historical interpretation.

## Brief Readiness

The machine-level verdict remains binary:

- `READY`
- `NOT_READY`

The current human-readable verdict **Ready after minor clarification** maps to `READY` with the clarification retained as a non-blocking finding. It is not a third workflow state.

## Evaluator verify

The authoritative failure classifications are exactly:

- `IMPLEMENTATION_FAILURE`
- `EVALUATOR_DEFECT`
- `SPECIFICATION_AMBIGUITY`
- `SPECIFICATION_DRIFT`
- `INFRASTRUCTURE_FAILURE`

`SPECIFICATION_DEFECT` must not silently replace ambiguity or drift.

Verification results remain:

- `PASS`
- `FAIL`
- `BLOCKED`

with the following invariants:

- `PASS` carries no failure classification;
- every non-`PASS` result carries exactly one valid classification.

If the current kernel cannot express these cross-field constraints generically, the contract must still describe them and the missing enforcement is recorded for Spike 014a.

## Evaluator prepare

Preparation blocking because the public contract is insufficient remains a `blocked` role disposition. Internal evaluator readiness/integrity PASS facts remain evaluator evidence unless they are independently required for workflow routing.

Do not create methodology enums merely to mirror every internal evaluator check.

## Evaluator repair

Repair authority must be an explicit bound input.

The skill must not discover permission to repair merely by searching mutable repository state.

A repair invocation must bind the exact authoritative defect trigger, including the relevant source evaluator revision and either:

- a finalized verification result classified `EVALUATOR_DEFECT`; or
- an explicitly authorized human correction carrying the existing evaluator-coverage-defect semantics.

A successful repair need not invent a redundant `REPAIRED` methodology result when successful completion plus exact repair evidence already establishes that fact.

## Design Map and Implementation

When either role encounters an unresolved frozen-contract problem that requires upstream revision, `blocked` remains sufficient for this migration unless a distinct machine-routed result is demonstrably required.

Do not invent a detailed routing taxonomy merely because explanatory prose exists.

## As-Built

`Missing`, `Contradictory`, and `Extra` remain artifact findings. They may coexist and are not a singular methodology result.

## Outcome

Normal completion and authorized process-exception completion must be distinguishable as structured historical facts.

The target methodology should distinguish at least:

- `STANDARD`
- `PROCESS_EXCEPTION`

without ever representing a process exception as evaluator `PASS`.

The exact field name is implementation freedom.

---

# 5\. Skill migration

Update every active skill so that its instructions faithfully implement its resulting role contract.

The migration must remove obsolete procedural assumptions including, where present:

- `git push` or worker-owned publication;
- direct canonical workflow mutation;
- role-owned next-phase dispatch;
- self-selected evaluator or skill versions;
- authority inferred from mutable working-tree content;
- references to legacy workflow mechanisms as forward authority;
- instructions requiring a worker to complete privileged post-processing before it may truthfully report its domain result.

Each skill must distinguish its own domain completion from later host actions.

Where a role has produced a valid local checkpoint but publication subsequently fails, that publication failure must not rewrite the role's genuine semantic result.

No intentional domain-semantic redesign is permitted except for the explicit reconciliation decisions frozen by this spike.

---

# 6\. Coherent methodology version

Harness must stop treating individually discovered current skill files as an implicit coherent methodology.

Spike 014b must establish an immutable identity for a complete methodology set containing at least:

- policy;
- every active role contract;
- every active skill definition;
- relevant validator identities;
- any other material configured authority required to interpret role results.

A workflow binds to one coherent methodology identity.

A candidate skill edit creates a candidate methodology identity. It does not mutate the identity governing an already-authorized workflow.

Mixed accidental sets such as an old evaluator with an unreviewed new contract, or a new skill with a stale policy, must be detectable rather than silently treated as one version.

---

# 7\. Safe future skill evolution

Provide the smallest durable mechanism needed to make future methodology edits routine rather than another bootstrap event.

The mechanism must support the semantics of:

**candidate**

Create or identify a candidate methodology set distinct from the currently trusted set.

**check**

Validate structural coherence, role-contract compatibility, identity integrity, and forbidden authority patterns.

**diff**

Show the material methodology changes between trusted and candidate sets, including changed skills, contracts, policy, validators, capabilities, result vocabularies, and privileged-action requirements.

**exercise**

Run bounded tests or disposable role exercises against the candidate without making it authoritative for existing workflows.

**promote**

Under explicit human authority, make the validated candidate the trusted methodology for future workflow grants.

These need not be five literal CLI commands.

The implementation may use Git identities, content-addressed manifests, release/lock metadata, or another small mechanism. Do not build a general skill registry or package manager.

---

# 8\. Evaluator recursion rule

A candidate authority-bearing skill never governs the workflow evaluating that candidate.

For ordinary methodology evolution:

``` text
trusted methodology N
        |
        | evaluates candidate
        v
candidate methodology N+1
        |
        | explicit human promotion
        v
trusted methodology N+1
```

Running workflows remain bound to N.

After promotion, new workflows may bind to N+1.

If N genuinely cannot evaluate N+1 because the authority contract itself has changed incompatibly, the process stops at an explicit human bootstrap gate. Harness must not disguise this as ordinary evaluator repair or dynamically make N+1 authoritative over itself.

---

# 9\. Validation and exercise

The migrated methodology must be validated independently of Spike 014a's eventual full-kernel proof.

At minimum, validation must prove:

- every active skill/contract appears in the fidelity matrix;
- every known mismatch has an explicit resolution;
- all artifact-producing active roles have the required local Git checkpoint authority;
- no active skill requires direct `git push` or publication credentials;
- no active skill claims canonical transition authority;
- the evaluator result vocabulary exactly matches its contract;
- invalid evaluator cross-field combinations are rejected by the candidate contract/validator design;
- evaluator repair requires an exact authoritative trigger;
- Brief Readiness's three prose verdict forms map deterministically to its two machine verdicts;
- artifact-only findings are not accidentally promoted into workflow enums;
- Outcome preserves the distinction between standard completion and process exception;
- candidate skill edits cannot replace the trusted evaluator governing the candidate;
- deliberately contradictory skill/contract fixtures are detected;
- the complete candidate methodology has one stable identity.

Where practical, use disposable repositories to exercise real skill behavior, including local Git checkpoint creation, without granting direct publication.

These exercises prove methodology compatibility. They do not substitute for Spike 014a's later proof that the production governed kernel correctly enforces the migrated contracts and host actions.

---

# 10\. Spike 014b evaluation authority

Before evaluator preparation:

1. record the exact bootstrap baseline commit;
2. preserve the exact evaluator skill content/identity used for 014b authority;
3. preserve the exact implementation skill content/identity used for the implementation instruction set;
4. freeze the human-approved brief and human-approved Design Map/fidelity matrix.

Run evaluator `prepare` against those frozen authorities.

Implementation may then change any in-scope methodology skill or contract, including the active evaluator and implementation skill files.

Verification must still use the original frozen bootstrap evaluator snapshot.

The candidate evaluator has no authority over Spike 014b.

The evaluator must test the explicit 014b contract and may not introduce new methodology semantics merely because it prefers a different skill architecture.

---

# Non-goals

Spike 014b does not:

- finish the outstanding Spike 014a kernel corrections;
- prove full production workflow execution through the governed kernel;
- redesign the purpose of Brief Readiness, Design Map, evaluator, implementation, As-Built, or Outcome;
- add the proposed future PR/SOLID/generics/TDD review skills;
- solve runtime context-budget optimization;
- build a general plugin or skill marketplace;
- create distributed methodology-version coordination;
- require automatic promotion without human authority;
- remove the need for exceptional human bootstrap authority when the trust root itself changes incompatibly.

---

# Acceptance criteria

**AC01 — Complete fidelity matrix**

Every active role has a reviewed Skill ↔ Contract Fidelity entry covering inputs, capabilities, workspaces, human interaction, dispositions, methodology result, evidence, Git checkpoint, host actions, and transition expectations.

**AC02 — No unresolved silent mismatch**

Every material mismatch is resolved or explicitly classified `KERNEL_SUPPORT_REQUIRED`. No known mismatch is silently normalized by worker prose or generic kernel special-casing.

**AC03 — Local checkpoint authority is coherent**

Every currently active artifact-producing role can create its required local repository checkpoint under its target contract. No role requires direct publication.

**AC04 — Privileged actions remain host-owned**

No migrated skill performs direct Git publication, canonical authority mutation, promotion, or next-role allocation.

**AC05 — Exact produced revision**

Every successful checkpoint-producing role reports the exact local commit that contains its role-owned public evidence.

**AC06 — Brief Readiness fidelity**

All documented Brief Readiness conclusions map deterministically to `READY` or `NOT_READY`, with minor clarification remaining non-blocking metadata/evidence.

**AC07 — Evaluator vocabulary fidelity**

Every valid evaluator classification is represented exactly by the evaluator-verify contract. `SPECIFICATION_DEFECT` does not substitute for ambiguity or drift.

**AC08 — Evaluator cross-field semantics**

The target contract represents the invariant that PASS has no classification and every non-PASS result has exactly one valid classification.

**AC09 — Repair authority is bound**

Evaluator repair cannot begin without an exact authoritative defect trigger and source evaluator identity.

**AC10 — Artifact findings remain artifact findings**

As-Built discrepancy categories and other multi-valued diagnostic/detail vocabularies are not incorrectly converted into singular workflow results.

**AC11 — Process exception is durable**

Outcome records normal completion and authorized process-exception completion as distinct structured historical facts; process exception is never evaluator PASS.

**AC12 — Coherent methodology identity**

The complete candidate methodology has one stable identity that binds its policy, skills, contracts, and material validators.

**AC13 — Candidate isolation**

Editing any skill, including evaluator, produces a candidate methodology and cannot alter the methodology authority of an already-bound workflow.

**AC14 — N evaluates N+1**

The frozen pre-014b evaluator can prepare and verify the candidate without the candidate evaluator gaining authority over its own migration.

**AC15 — Contradiction detection**

At least one deliberately contradictory skill/contract fixture is rejected by the candidate validation machinery.

**AC16 — Candidate exercise**

The migrated methodology can be exercised in bounded disposable scenarios sufficiently to prove its contracts are internally coherent and its skills can produce their expected artifacts/checkpoints without direct publication.

**AC17 — Bootstrap evidence is explicit**

The 014b exception, frozen evaluator identity, frozen implementation identity, human-authored Design Map authority, evaluation evidence, candidate methodology identity, and human promotion decision are durably recorded.

**AC18 — 014a handback is explicit**

Any remaining requirement that belongs to generic kernel execution rather than methodology definition is recorded explicitly for Spike 014a. The promoted 014b methodology provides the coherent target that 014a must execute.

---

# Completion

Spike 014b completes only when:

- the complete methodology migration is implemented;
- the candidate methodology passes the frozen bootstrap evaluator;
- the human accepts and promotes that coherent methodology set; and
- Spike 014a has an exact accepted methodology identity from which to resume its end-to-end kernel work.

No claim that Spike 014a itself is complete follows from 014b acceptance.
