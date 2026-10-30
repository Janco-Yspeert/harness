# Spike 015a — Bootstrap-Closed Completion Path

**Status:** Draft for Brief Readiness and human review; not frozen

**Technical baseline:** Spike 015 candidate
1159f66422796c14a68428990ae93768ce3102fd.

**Trusted predecessor:** methodology sequence 7,
sha256:bea2ae256165b900a40e4cefd0fa98cfad665b5511bf2107f02b785f3fe00eea,
revision 3e753a4a732c87fc5b42e9e3cf771482aba6a522.

**Depends on:** accepted 014i candidate-subject observation boundary, accepted
014j bootstrap-closed preparation substrate, accepted 014k forward-only
adoption semantics, and the complete technical baseline represented by Spike
015 candidate 1159f664.

## Purpose

Repair the frozen Spike 015 specification/evidence-model defect without
reopening its technical implementation.

The successor establishes one narrow completion mechanism: a workflow may
declare a post-adoption split-repository coding-smoke obligation. The host,
rather than worker prose or an unchecked human assertion, validates the
resulting real Implementation handoff, source/docs lineage, brokered docs
evidence, and project check. A sequence-8 Outcome then requires that validated
record only for workflows that declared the obligation.

This spike deliberately separates two contexts:

1. **Pre-adoption certification under sequence 7.** Trusted sequence 7
   independently evaluates a candidate sequence-8 runtime/methodology and may
   authorize adoption without requiring a sequence-8 workflow or live
   post-adoption smoke.
2. **Fresh post-adoption operation under sequence 8.** A newly allocated,
   explicitly obligated workflow performs the real coding smoke. Its Outcome
   cannot complete until the host-validated record exists.

A sequence-7 Workflow Grant remains pinned to sequence 7 after adoption.
Adoption does not rewrite it, migrate it, or cause a sequence-8 Outcome
predicate to govern it retroactively.

## Context

The independent technical review of the exact Spike 015 candidate assessed
AC01–AC13 as technically supported by public evidence. It did not create an
authoritative evaluator PASS and did not inspect the private evaluator
revision. Treat that candidate as the implementation baseline.

Spike 015's AC14/AC15 arrangement has a circular completion model. A valid,
trusted, split-capable runtime is needed for the production coding smoke, but
the smoke was previously described as though it were necessary before that
runtime could receive the adoption authority that makes it valid.

The existing successful label-normalizer experiment is useful historical
technical evidence. Its runtime
29eb21bbb2e6a4d3d7c324e49086704ab622d8d3 is code-identical to the candidate's
runtime/test tree; its methodology
94f51d98ec45369dbbd26a7a56b49b3ed94897ae is test-only. It may inform fixture
design and expected completion-record fields. It is not, and must never be
relabelled as, sequence-8 post-adoption authority or completion evidence.

The pre-existing containment failure observed only with a Harness checkout
under /tmp is an independent operational concern. Preserve it for separate
investigation. Do not expand this spike into a containment rewrite.

## Question

Can Harness, using trusted sequence 7, independently evaluate one sequence-8
candidate that adds a narrow host-validated coding-smoke completion gate, adopt
that candidate through the existing forward-only path, and then require the
gate only for a fresh sequence-8 workflow that explicitly declared it?

## Authority model

    trusted sequence 7
      |
      | evaluates candidate sequence 8 through deterministic evidence
      v
    sequence-7 PASS / promotion / As-Built / human acceptance
      |
      | existing explicit adoption authority
      v
    trusted sequence 8 appended forward-only
      |
      | fresh Workflow Grant (never a migrated sequence-7 grant)
      v
    declared split-coding-smoke workflow
      |
      | real registered-provider Implementation + host validation
      v
    completion-smoke-recorded
      |
      v
    sequence-8 Outcome eligibility

Candidate code may be tested before adoption as software under evaluation.
It may not supply the authority by which sequence 7 evaluates or adopts it.

## Scope

Implement one optional, closed completion obligation: split-coding-smoke.

### 1. Frozen declaration

A workflow declares the obligation with a committed public
completion-obligation.json in its workflow directory. The host validates it
while recording the workflow's Brief-freeze facts and appends a canonical
completion-obligation-declared event only when it is valid.

The declaration has a closed shape:

- schemaVersion 1;
- kind split-coding-smoke;
- an exact source workspace and docs workflow workspace identity;
- one exact project check command vector and a source-relative working
  directory;
- the exact allowlisted brokered-docs evidence destination;
- the content identity and committed docs binding of the declaration.

The declaration is committed workflow input, not a request parameter and not
worker prose. An absent declaration creates no event and preserves the
ordinary legacy completion path.

### 2. Host-validated completion operation

After a qualifying Implementation handoff, Harness automatically derives a
completion attempt from canonical facts. It records completion-smoke-recorded
only after all checks below pass; otherwise it records a bounded failed
completion attempt that cannot satisfy Outcome.

The successful public-safe completion-smoke.json and canonical event bind:

- the obligation identity and declaration docs binding;
- the exact adopted methodology identity, trusted sequence and runtime binding;
- the exact Workflow Grant and Role Grant;
- a real registered-provider, non-inline Implementation allocation and provider
  confirmation;
- the accepted semantic Implementation handoff;
- the allocation source/docs snapshot pair;
- the source candidate binding, including repository identity, origin, full
  commit, path/content identity where applicable, ancestry from the allocation
  source snapshot, and a non-empty source-tree delta;
- the brokered evidence action, exact docs evidence binding, and ancestry from
  the allocation docs snapshot;
- the host-run check command identity, exact checked source commit, exit status,
  bounded stdout/stderr identities, and containment identity.

The host runs the frozen check in a fresh disposable checkout of the exact
source candidate, under existing containment, with no credentials, Git hooks,
or writable project/docs mounts. The check is not a generic worker command
endpoint. It exists solely to execute the one committed command of this
declared obligation after the exact qualifying handoff.

The host derives all record fields from canonical allocation, process, result,
action, Git, and check facts. A worker statement that a check passed, or a human
statement that a smoke occurred, has no authority to create the record.

The host commits the public-safe record in the docs repository through the
existing host-owned local checkpoint pattern. It does not push or publish.

### 3. Sequence-8 Outcome gate

The sequence-8 policy adds a conditional eligibility branch:

- no completion-obligation-declared event: retain the existing Outcome
  predicate unchanged;
- declared split-coding-smoke obligation: require a current,
  identity-valid completion-smoke-recorded event bound to the declaration
  before Outcome allocation and before STANDARD Outcome recording.

The sequence-8 Outcome contract receives declaration and completion-record
identities as inputs when present. Its artifact cites them. The host record,
not the Outcome worker, establishes their relationship.

### 4. Sequence-7 certification closeout

The certification workflow for this spike remains governed by sequence 7.
After its independent PASS, promotion, As-Built and human acceptance, it may
record the existing sequence-7 STANDARD Outcome only on the existing
sequence-7 conditions.

Its Outcome must truthfully state that:

- the grant is pinned to sequence 7;
- sequence-8 smoke enforcement is not applicable to that historical workflow;
- adoption is forward-only; and
- a distinct fresh sequence-8 workflow is required to exercise the obligation.

It must not claim that a sequence-8 predicate governed its closeout, nor cite
the historical experiment as post-adoption proof.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| **BC01** | Every mandatory pre-adoption criterion is independently verifiable under trusted sequence 7. No required evidence depends on sequence-8 authority, a post-adoption grant, or a real post-adoption smoke. Evaluator Prepare must stop before freeze if this is false. |
| **BC02** | A completion obligation is accepted only from the committed, closed declaration artifact and exact docs binding. Its absence preserves historical workflow behavior. |
| **BC03** | A successful record requires a genuine registered-provider Implementation allocation, provider confirmation, accepted semantic handoff, source candidate ancestry and a non-empty source change; fixture, inline, prose-only and fake-provider substitutes are refused. |
| **BC04** | A successful record requires the bounded host-brokered docs evidence action and a descended docs checkpoint. Direct worker docs writes, stale docs HEAD and unrelated docs commits cannot substitute. |
| **BC05** | The host runs the exact declared check against a disposable checkout of the exact source candidate under credential-free containment. Non-zero exit, command drift, checkout drift, output truncation or containment failure prevents a successful record. |
| **BC06** | The completion record binds the adopted methodology/runtime identity, obligation, grants, semantic handoff, source/docs Git lineages, evidence action and host check. It is host-derived and cannot be fabricated through worker prose or unchecked human assertion. |
| **BC07** | A fresh sequence-8 declared workflow cannot allocate or record a STANDARD Outcome without its matching successful completion record. An undeclared sequence-8 workflow and every legacy workflow retain existing completion behavior. |
| **BC08** | Adoption is non-retroactive: a pre-adoption sequence-7 grant remains sequence 7, and its truthful closeout neither claims nor receives sequence-8 enforcement. A fresh grant after adoption binds sequence 8. |
| **BC09** | All original 015 verification, implementation, experimental and review evidence remains immutable. Historical experimental smoke can be used only as non-authoritative design or deterministic-fixture evidence. |
| **BC10** | The candidate introduces no second evaluator, trust authority, workflow engine, generic arbitrary-command surface, remote publication power, or containment rewrite. |

## Bootstrap-closure proof

| Criterion | Required evidence | Producing operation | Authority required to produce it | Authority available when evaluated | Lifecycle consumer |
| --- | --- | --- | --- | --- | --- |
| BC01 | Candidate tests and dependency audit | Deterministic test/inspection | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC02 | Declaration acceptance/refusal tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC03 | Synthetic ledgers, registered-adapter and Git fixture tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC04 | Evidence action, stale docs and wrong-root tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC05 | Disposable-checkout/contained-check tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC06 | Tamper, fake record, prose-only and wrong-binding tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC07 | Declared versus undeclared Outcome predicate tests | Candidate runtime under test | Existing evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC08 | Forward-only adoption fixture | Existing adoption code plus candidate tests | Existing human adoption model and evaluator test authority | Sequence 7 | Sequence-7 evaluator verdict |
| BC09 | Git/history inspection | Evaluator inspection | Repository-read and Git-inspect | Sequence 7 | Sequence-7 evaluator verdict |
| BC10 | Diff/architecture inspection and regression tests | Evaluator inspection/test | Existing evaluator authority | Sequence 7 | Sequence-7 evaluator verdict |

No mandatory row depends on a sequence-8 grant or on evidence that can only be
created after sequence-8 adoption. The actual real-provider smoke is a
post-adoption completion obligation, not a pre-adoption PASS prerequisite.

## Required implementation changes

Keep the candidate coherent and narrow:

- add typed completion-obligation, completion-attempt and completion-record
  models;
- add host validation/recording of the committed declaration;
- add the host-owned post-handoff contained check runner, reusing existing
  disposable-workspace and containment mechanisms;
- derive and commit the public-safe completion record through the workflow/docs
  checkpoint path;
- add the sequence-8 conditional Outcome predicate, contract inputs and
  artifact validation;
- extend methodology coherence validation only as needed to recognize the
  conditional completion contract;
- add deterministic tests for exact lineage, source delta, brokered docs
  evidence, fake-provider refusal, command/check failure, tampering, legacy
  workflows, sequence-7 pinning and fresh sequence-8 enforcement.

Do not modify the original 015 candidate, original evaluator material, trusted
history, historical ledgers, or the /tmp containment concern.

## Verification boundaries

Trusted sequence-7 evaluation must use real Git repositories and the actual
host/kernel seams for declaration binding, grant provenance, brokered evidence,
local checkpoints and Outcome eligibility. It may use deterministic registered
provider fixtures to establish candidate behavior. It must not require a live
provider or actual adoption to establish BC01–BC10.

The post-adoption smoke is separately required only after sequence 8 is
trusted, in a fresh declared workflow. It must use a supported real provider
and preserve the host completion record plus source/docs lineage.

## Recommended governed execution sequence

1. Draft this brief; run Brief Readiness under trusted sequence 7.
2. Freeze the brief and Design Map only after the bootstrap-closure table is
   mechanically checked.
3. Prepare independent evaluation under sequence 7.
4. Implement one sequence-8 candidate based on 1159f664.
5. Verify under sequence 7; promote, create As-Built and obtain human
   acceptance.
6. Close the sequence-7 certification workflow truthfully under its existing
   predicate.
7. Use the existing explicit human adoption route to append sequence 8.
8. Allocate a fresh sequence-8 workflow that declares split-coding-smoke.
9. Run a real supported-provider Implementation against a disposable split
   source/docs project.
10. Let the host produce and checkpoint the completion record.
11. Complete As-Built, acceptance and Outcome under sequence 8.

## Explicit non-goals

- Re-evaluating, changing or broadening Spike 015 AC01–AC13.
- Treating the experimental smoke as production adoption or backdating it as a
  completion record.
- Migrating or reinterpreting grants, ledgers or Outcomes created under
  sequence 7.
- Arbitrary post-handoff command execution, another evaluator framework, a new
  trust authority system, remote publication, or a containment rewrite.
- Repairing the independent /tmp containment concern.

## Freeze blocker

No unresolved authority question blocks freeze if the Design Map preserves this
boundary: the host check runner executes only the exact command committed in a
validated declaration, only after a qualifying fresh sequence-8 Implementation
handoff, and only in a disposable credential-free checkout. It is not exposed
as a general worker or operator command facility.

If that boundary cannot be implemented using the existing host containment and
disposable-workspace substrate, stop before freeze and split that prerequisite
into its own bootstrap-closed successor.
