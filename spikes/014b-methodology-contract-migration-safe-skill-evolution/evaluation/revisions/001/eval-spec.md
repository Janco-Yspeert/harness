# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/014b-methodology-contract-migration-safe-skill-evolution`
- Current project commit at preparation time: `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`
- `spike.md` content identity: `sha256:d627fd302a04e778f4100fef2b897df16e4c97c3fb728e9bfcd3bf7dc30d298a` (committed `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`)
- `design-map.md` content identity: `sha256:2f12c72f8a382a44a53c4478ee08379d136f652f382305a88f63fb16711f3b40` (committed `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`)
- `bootstrap/authority.md` content identity: `sha256:c63fddcb220444158c98b5e1aef5f5116a1ee1d2bd803c7aa0369cf753b33809` (committed `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`)
- `eval-requirements.md` content identity: `sha256:f66af67075b5b91aa522397fc2b9b16f0577b917bdba31111af7dc04f9f25c47`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md`
- Evaluator skill name/contract version: `evaluator`, v11
- Evaluator skill content identity (the **sole authority for this spike's
  `prepare`/`verify`**, per the explicit Spike 014b bootstrap exception):
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`
  (Git blob `b9e2601dbd4575cfbafc8d1ab4cc81f8c434fe51`, evaluator tree
  `821e1a85e75c43794eba2e0d820be9b46e05ba15`, at
  `../harness-014b-authority/skills/evaluator/`, confirmed byte-identical to
  the plain working-tree copy at preparation time)
- Evaluation revision identity: recorded in `.eval/freeze.json` as
  `evaluatorRevision: "001"`; its content identity is the SHA-256 of the
  formatted `freeze.json`.

## Pre-Freeze Integrity Gate

- Shared helpers: none beyond Node's built-in `node:test`/`node:assert` and
  `node:fs`/`node:path`; each hidden test is self-contained and reads only
  already-public repository files (`methodologies/harness/**`,
  `skills/*/SKILL.md`, `spikes/014b-.../{spike.md,design-map.md,bootstrap/authority.md}`).
  No evaluator-authored support module exists in this revision, so no
  separate helper self-check is required.
- For each mandatory executable case (E1-E5): each was run against the
  current unimplemented baseline (project commit `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`)
  via `node --test .hidden-test/*.test.ts`. Result: 16 sub-assertions total,
  10 pass / 6 fail. Every failure corresponds exactly to a gap the frozen
  Design Map's fidelity matrix already names (missing `git-inspect`/`git-commit`
  on all 8 contracts; missing `forbiddenExposure` on `brief-readiness.json`;
  `evaluator-verify.json` still carrying the retired `SPECIFICATION_DEFECT`
  classification instead of the frozen 5-value set; `outcome.json`'s
  `methodology` object still empty; five skill files still instructing the
  worker to `push`). Every pass is a fact already true today (no
  `git-publish` capability anywhere; workspaces already `{repository}` or
  `{repository, evaluation}`; evaluator contracts already `protected: true`
  with the `evaluation` workspace; `as-built.json`/`design-map.json`
  `methodology` already `{}`; `evaluator-verify.json.methodology.result`
  already exactly `PASS`/`FAIL`/`BLOCKED`; no skill already claims
  `git-publish`; bootstrap evidence already present and correct). One
  negative control was additionally exercised: a temporary, uncommitted
  mutation of `evaluator-verify.json` (`result` narrowed to `["PASS","FAIL"]`,
  dropping `BLOCKED`) was made, the regression-guard sub-test was re-run and
  confirmed to fail for exactly that reason, and the file was restored
  (`git status --porcelain` confirmed clean afterward). Each hidden test
  file typechecks with 0 errors under the project's own `tsc --noEmit` and
  is clean under `eslint`/`prettier --check` (verified via temporary copies
  placed under `test/`, then removed; `git status --porcelain` confirmed
  clean afterward).
- For each mandatory non-executable case (M-A, M-B, C-C): M-A's public/manual
  evidence plan (direct review of the already-frozen, already-committed
  Design Map fidelity matrix and kernel-handback table) was exercised now,
  since that artifact is frozen and cannot change during implementation; it
  fairly establishes AC01/AC02/AC18 without inventing a candidate-specific
  seam. M-B and C-C's plans require the final candidate's skill prose and
  implementation report, which do not exist yet; their decision rules are
  concretely defined below and do not depend on any implementation-specific
  interpretation adopted after the fact.
- Material runtime assumption validated empirically: Node's native
  TypeScript execution (`node --test <file>.ts`) works against this
  repository's `"type": "module"` configuration under the locally available
  `v24.18.0` (repository `engines` states `>=24.12.0`); confirmed by
  actually running all five hidden test files above.
- The harness itself (this bundle) parses, compiles, and executes: confirmed
  by the `node --test` run above and by running
  `node tools/evaluator-integrity.ts` against the assembled bundle (see
  `.eval/freeze.json` `integrityChecks`).

## Explicit Requirements

- **R1** - Every active role contract (`brief-readiness`, `design-map`,
  `evaluator-prepare`, `evaluator-repair`, `evaluator-verify`,
  `implementation`, `as-built`, `outcome`) grants `git-inspect` and
  `git-commit`. Source: frozen brief §3 "Git checkpoint contract"; AC03.
- **R2** - No active role contract grants `git-publish`, or any
  network/publish/credential-shaped capability. Source: frozen brief §2, §3
  ("`git-publish` is not a worker capability"); AC04.
- **R3** - Every active role contract's `workspaces` remain within
  `{repository, evaluation}`. Source: frozen Design Map "Shared
  governed-role contract"; AC04.
- **R4** - Each `protected: true` evaluator role contract
  (`evaluator-prepare`, `evaluator-repair`, `evaluator-verify`) declares the
  `evaluation` workspace. Source: frozen Design Map fidelity matrix
  ("Workspaces and read/write exposure" rows); AC02 evaluator-workspace
  component.
- **R5** - Every non-evaluator active role contract (`brief-readiness`,
  `design-map`, `implementation`, `as-built`, `outcome`) declares
  `forbiddenExposure` including `"evaluator-private"`. Source: frozen Design
  Map fidelity matrix ("Workspaces and read/write exposure" rows); AC02.
- **R6** - `as-built.json`'s `methodology` object remains empty; `Missing`,
  `Contradictory`, `Extra` remain artifact findings, never a singular
  workflow result. Source: frozen brief §4 "As-Built"; AC10.
- **R7** - `design-map.json`'s `methodology` object remains empty
  (`INTENTIONALLY_ARTIFACT_ONLY`). Source: frozen Design Map fidelity matrix
  row; regression guard.
- **R8** - `evaluator-verify.json`'s `methodology.classification` is exactly
  `{IMPLEMENTATION_FAILURE, EVALUATOR_DEFECT, SPECIFICATION_AMBIGUITY,
  SPECIFICATION_DRIFT, INFRASTRUCTURE_FAILURE}`; `SPECIFICATION_DEFECT` must
  not appear anywhere under `methodologies/`. Source: frozen brief §4
  "Evaluator verify"; AC07.
- **R9** - `evaluator-verify.json`'s `methodology.result` remains exactly
  `{PASS, FAIL, BLOCKED}`. Source: frozen brief §4; regression guard.
- **R10** - `outcome.json`'s `methodology` object exposes a completion-mode
  fact distinguishing a `STANDARD`-shaped value from a
  `PROCESS_EXCEPTION`-shaped value (exact field name free), and never
  combines a `PASS`-shaped value with the `PROCESS_EXCEPTION`-shaped value
  in the same enum. Source: frozen brief §4 "Outcome"; AC11.
- **R11** - No active role skill (`brief-readiness`, `design-map`,
  `evaluator`, `implementation`, `as-built`, `outcome`) instructs the worker
  itself to `push`, or claims `git-publish` as its own capability in prose.
  Source: frozen brief §2, §3, §5; AC04.
- **R12** - `spikes/014b-.../bootstrap/authority.md`, `spike.md`, and
  `design-map.md` remain present and `authority.md` preserves the recorded
  bootstrap baseline commit and frozen evaluator/implementation content
  identities through to the final candidate commit. Source: frozen brief
  "Bootstrap process exception"; AC17.
- **R13** - Every material finding in the frozen Design Map's Skill ↔
  Contract Fidelity Matrix (all 8 roles, all listed dimensions) is resolved
  to agree with its recorded target disposition, or is explicitly
  `KERNEL_SUPPORT_REQUIRED` and left undisturbed rather than silently
  worked around in skill prose. Source: frozen brief §1, AC01, AC02.
- **R14** - No active role skill instructs the worker to record its own
  canonical transition (e.g. "record `brief-frozen`", "record
  `implementation-handoff`"); skill prose attributes that recording to
  Harness after checkpoint validation. Source: frozen Design Map "Shared
  governed-role contract"; AC04.
- **R15** - Each migrated skill's completion/postcondition section instructs
  the worker to report the exact produced local commit. Source: frozen
  brief §2 ("a future commit SHA is produced by execution and must not be
  predicted or pre-bound"); AC05.
- **R16** - `skills/brief-readiness/SKILL.md` explicitly states that "Ready
  after minor clarification" maps to machine verdict `READY` (retaining the
  clarification as a non-blocking finding), not a third workflow state.
  Source: frozen brief §4 "Brief Readiness"; AC06.
- **R17** - The evaluator skill or contract documents the invariant that
  `PASS` carries no classification and every non-`PASS` result carries
  exactly one valid classification. Source: frozen brief §4 "Evaluator
  verify"; AC08.
- **R18** - `evaluator-repair.json`'s inputs (or the evaluator skill's
  repair-mode prose) bind an exact authoritative defect trigger (a finalized
  `EVALUATOR_DEFECT` verification result or an explicit human
  `EVALUATOR_COVERAGE_DEFECT` correction), not authority discoverable merely
  from mutable repository state. Source: frozen brief §4 "Evaluator repair";
  AC09.
- **R19** - The implementation provides a bounded mechanism realizing
  `candidate`/`check`/`diff`/`exercise`/`promote` semantics (TR1), with
  visible regression evidence including rejection of at least one
  deliberately contradictory skill/contract fixture. Source: frozen brief
  §7, §8; AC12-AC16.
- **R20** - The complete candidate methodology (policy + all 8 role
  contracts + all 8 role skills + material validators) has one
  deterministic, stable identity; editing any skill (including evaluator)
  produces a distinct candidate identity that does not alter the identity
  already bound to a running workflow grant, and a candidate evaluator never
  supplies authority over itself. Source: frozen brief §6, §8; frozen
  Design Map "Coherent methodology identity and safe evolution"; AC12,
  AC13, AC14.

## Derived Invariants

- **I1** - `PASS` carries no classification; every `FAIL`/`BLOCKED` carries
  exactly one valid classification from the fixed 5-value set. Derived from
  R8, R17.
- **I2** - A role never records its own canonical transition and never
  pushes/publishes directly; publication and transition-recording are
  exclusively Harness-owned host actions. Derived from R11, R14.
- **I3** - Evaluator-private material never becomes reachable by a
  non-evaluator role contract. Derived from R5.
- **I4** - A candidate methodology identity never supplies evaluator
  authority over itself; only explicit human promotion changes the trusted
  identity for future grants. Derived from R20, frozen brief §8 "Evaluator
  recursion rule".

## Negative Requirements

- **N1** - No contract grants `git-publish`. (R2)
- **N2** - No skill instructs the worker to `push`. (R11)
- **N3** - `evaluator-verify.json.methodology.classification`, and no other
  file under `methodologies/`, contains `SPECIFICATION_DEFECT`. (R8)
- **N4** - `outcome.json`'s completion-mode enum never combines a
  `PASS`-shaped value with a `PROCESS_EXCEPTION`-shaped value. (R10)
- **N5** - No migrated skill claims canonical transition authority for
  itself. (R14)
- **N6** - The candidate evaluator must not evaluate, promote, or establish
  authority for itself during Spike 014b. (brief "Bootstrap process
  exception"; A3/A2 assumptions)

## Evaluation Cases

- **E1** - `contracts-git-checkpoint-and-exposure`
  - Purpose: statically verify the git-checkpoint and evaluator-private
    exposure targets across all 8 committed role contracts.
  - Requirements/invariants verified: R1, R3, R4, R5, R6, R7; I2 (contract
    component), I3.
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/contracts-git-checkpoint-and-exposure.test.ts`.
  - Expected observable outcome: all 7 sub-assertions pass.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/contracts-git-checkpoint-and-exposure.test.ts`.
- **E2** - `evaluator-verify-vocabulary`
  - Purpose: verify the evaluator classification vocabulary fidelity.
  - Requirements/invariants verified: R8, R9; N3; I1 (vocabulary component).
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/evaluator-verify-vocabulary.test.ts`.
  - Expected observable outcome: all 3 sub-assertions pass.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/evaluator-verify-vocabulary.test.ts`.
- **E3** - `skills-no-direct-publication`
  - Purpose: verify no migrated skill instructs direct Git publication.
  - Requirements/invariants verified: R2 (skill component), R11; N1
    (skill component), N2.
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/skills-no-direct-publication.test.ts`.
  - Expected observable outcome: both sub-assertions pass.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/skills-no-direct-publication.test.ts`.
- **E4** - `outcome-completion-mode`
  - Purpose: verify Outcome's structured completion-mode fact.
  - Requirements/invariants verified: R10; N4.
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/outcome-completion-mode.test.ts`.
  - Expected observable outcome: both sub-assertions pass.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/outcome-completion-mode.test.ts`.
- **E5** - `bootstrap-evidence-durable`
  - Purpose: verify the bootstrap exception evidence remains durable.
  - Requirements/invariants verified: R12.
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/bootstrap-evidence-durable.test.ts`.
  - Expected observable outcome: both sub-assertions pass.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/bootstrap-evidence-durable.test.ts`.
- **M-A** - `frozen-fidelity-matrix-review`
  - Purpose: confirm AC01/AC02/AC18's underlying artifact-completeness facts.
  - Requirements/invariants verified: R13.
  - Preconditions: none beyond the already-frozen `design-map.md`.
  - Procedure: direct review of `design-map.md`'s "Skill ↔ Contract
    Fidelity Matrix" (confirms all 8 roles, all listed dimensions, each with
    exactly one disposition) and "Generic kernel handback to Spike 014a"
    table (confirms every `KERNEL_SUPPORT_REQUIRED` item is recorded).
    Because `design-map.md` is frozen and the implementation does not edit
    it, this fact cannot regress between preparation and verification; it is
    re-confirmed at verify time only by re-checking `design-map.md`'s
    content identity against the frozen value in `.eval/freeze.json`
    (already required by the evaluator skill's "Establish immutable inputs"
    step).
  - Expected observable outcome: identity match; no further action needed.
  - Mandatory: yes. Coverage mode: public/manual evidence (frozen artifact,
    already established; no stable implementation-independent seam is
    needed or justified since the artifact does not change).
  - Reason no hidden test: the underlying fact is about a document already
    frozen before this evaluation began; a hidden test would duplicate
    direct inspection without adding falsifying power, since implementation
    is contractually barred from editing `design-map.md`.
- **M-B** - `skill-prose-authority-boundary-review`
  - Purpose: judge fidelity of prose-level semantic requirements that
    Design Map/brief deliberately leave with free wording.
  - Requirements/invariants verified: R14 (self-recording component), R15,
    R16, R17, R18; N5.
  - Preconditions: final candidate commit checked out.
  - Procedure: at verify time, read the final `skills/*/SKILL.md` for the 8
    active roles and the two contracts (`evaluator-repair.json`, plus the
    evaluator skill's repair-mode prose). For R14: confirm the grammatical
    subject of every "record `<transition>`" sentence is Harness/the host,
    not the worker skill itself (a plain substring check cannot distinguish
    "Harness records X after validating..." from "record X"; this needs
    reading comprehension). For R15: confirm each skill's
    completion/postcondition section instructs reporting the exact produced
    commit. For R16: confirm the explicit "Ready after minor clarification
    maps to READY" statement is present. For R17: confirm the
    PASS-has-no-classification / non-PASS-has-exactly-one-classification
    invariant is stated somewhere in the evaluator skill or
    `evaluator-verify.json`. For R18: confirm `evaluator-repair.json`'s
    `inputs` (or the skill's repair-mode text) bind an exact trigger
    identity rather than deriving repair eligibility from ambient mutable
    state.
  - Expected observable outcome: each of the 5 sub-checks holds for every
    applicable file.
  - Mandatory: yes. Coverage mode: manual review (`MANUAL_REVIEW`).
  - Reason no hidden test: each sub-check requires judging the semantic
    subject/intent of prose sentences (who performs an action, whether an
    invariant is *stated*, whether a trigger is *bound* vs. merely
    *discoverable*), which a pattern match cannot fairly decide without
    risking a false PASS on reworded-but-noncompliant prose or a false FAIL
    on compliant prose using different wording than a hidden test assumed;
    the frozen brief/Design Map explicitly leave exact wording as freedom
    (R16's target phrase is the one exception already fixed verbatim by the
    frozen Design Map row, but even there a hidden regex would be fragile
    against equally-compliant rephrasing, so it remains manual).
- **C-C** - `methodology-evolution-mechanism`
  - Purpose: judge the new `candidate`/`check`/`diff`/`exercise`/`promote`
    mechanism (TR1) and the coherent-identity/candidate-isolation
    properties it must exhibit.
  - Requirements/invariants verified: R19, R20; I4; N6.
  - Preconditions: final candidate commit checked out; implementation's own
    As-Built/implementation report identifies the mechanism's entry
    point(s) by path (TR1 implementation impact).
  - Procedure: run `npm test` and inspect the implementation's own tests
    covering: candidate construction and diff-vs-trusted detection; `check`
    rejecting at least one evaluator-reviewable deliberately contradictory
    skill/contract fixture the implementation wrote; `diff` reporting
    component-level material changes; `exercise` running a bounded
    disposable scenario without granting trusted authority or publishing;
    `promote` requiring explicit simulated human authority and changing
    only the identity used by *future* grants, leaving an already-bound
    workflow grant on the prior identity. Then manually inspect the
    identified entry point(s) to confirm no code path lets a candidate
    (including a candidate evaluator) supply the authority that checks that
    same candidate (AC13/AC14), and that promotion is monotonic (no
    in-place rewrite of a prior trusted identity).
  - Expected observable outcome: `npm test` green on the implementation's
    own mechanism tests, including a genuine contradiction-rejection test;
    manual inspection finds no self-evaluation or in-place-rewrite path.
  - Mandatory: yes. Coverage mode: `COMPOSITE` (public executable regression
    + manual source inspection).
  - Reason hidden coverage is not (further) justified: the mechanism's
    command/API shape and storage layout are explicit Design Map
    implementation freedom ("Command names and storage layout are
    implementation freedom"); an evaluator-authored hidden test would have
    to invent that shape before it exists, which the frozen contract
    forbids inventing merely for hidden-test convenience.

## Coverage Matrix

| Requirement/Invariant/Negative | Case(s) | Coverage | Hidden test file(s) |
| --- | --- | --- | --- |
| R1 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R2 | E1 (contract), E3 (skill) | executable | contracts-git-checkpoint-and-exposure.test.ts, skills-no-direct-publication.test.ts |
| R3 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R4 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R5 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R6 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R7 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| R8 | E2 | executable | evaluator-verify-vocabulary.test.ts |
| R9 | E2 | executable | evaluator-verify-vocabulary.test.ts |
| R10 | E4 | executable | outcome-completion-mode.test.ts |
| R11 | E3 | executable | skills-no-direct-publication.test.ts |
| R12 | E5 | executable | bootstrap-evidence-durable.test.ts |
| R13 | M-A | public/manual | none (frozen artifact) |
| R14 | M-B | manual | none |
| R15 | M-B | manual | none |
| R16 | M-B | manual | none |
| R17 | M-B | manual | none |
| R18 | M-B | manual | none |
| R19 | C-C | composite | none (implementation's own `test/*.test.ts`) |
| R20 | C-C | composite | none (implementation's own `test/*.test.ts`) |
| I1 | E2, M-B | executable + manual | evaluator-verify-vocabulary.test.ts |
| I2 | E1, E3, M-B | executable + manual | contracts-git-checkpoint-and-exposure.test.ts, skills-no-direct-publication.test.ts |
| I3 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| I4 | C-C | composite | none |
| N1 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| N2 | E3 | executable | skills-no-direct-publication.test.ts |
| N3 | E2 | executable | evaluator-verify-vocabulary.test.ts |
| N4 | E4 | executable | outcome-completion-mode.test.ts |
| N5 | M-B | manual | none |
| N6 | C-C | composite | none |

This mapping agrees with `.hidden-test/manifest.json` and `case-manifest.json`.

## Out of Scope

- Every `KERNEL_SUPPORT_REQUIRED` finding in the frozen Design Map (RoleResult
  typed evidence channel, conditional-result contract validation,
  checkpoint validation binding, post-execution host-action requests,
  evaluator promotion as a host action, workspace-qualified private
  evidence, protected Git writes, capability vocabulary unification,
  canonical-transition ownership by the host). These are explicitly handed
  back to Spike 014a and are not evaluated as 014b defects.
- Actual kernel/executor enforcement of any migrated contract (no running
  Harness host process is required or used by this evaluation).
- The orchestrator skill's own content, except incidental compatibility.
- A full skill-registry/package-manager-shaped methodology evolution system
  (explicit non-goal, frozen brief "Non-goals").

## Limitations

- M-B's manual-review cases rely on evaluator reading comprehension of
  prose rather than an automated oracle; a differently-worded but
  compliant migration could require judgment calls not fully anticipated
  here. The decision rules above are written to be as concrete as
  practical to bound that judgment.
- C-C accepts the implementation's own test suite as primary evidence for
  the new mechanism's behavior (per Design Map "Implementation freedom"),
  corroborated by manual inspection rather than an independent
  evaluator-authored adversarial harness; this provides weaker independent
  falsification than a hidden test would, which is the explicit tradeoff
  the frozen Design Map accepts by reserving the mechanism's shape as
  implementation freedom.
- This evaluation does not itself exercise Spike 014a's kernel against the
  migrated methodology; AC16 "candidate exercise" is judged only against the
  bounded, disposable scenarios the frozen brief requires, not a full
  production workflow run.

## Revision History

- Revision 001 (this document): initial frozen version, prepared under the
  Spike 014b bootstrap exception against `spike.md` (`e2bd3fa3...`) and
  `design-map.md`/`bootstrap/authority.md` (`f141bb02...`).
