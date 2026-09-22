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
  `evaluatorRevision: "002"`; its content identity is the SHA-256 of the
  formatted `freeze.json`. Revision 001's prior bundle and freeze metadata
  are preserved unchanged at `.eval/revisions/001/`.

## Pre-Freeze Integrity Gate

- Shared helpers: none beyond Node's built-in `node:test`/`node:assert` and
  `node:fs`/`node:path`; each hidden test is self-contained and reads only
  already-public repository files (`methodologies/harness/**`,
  `skills/*/SKILL.md`, `spikes/014b-.../{spike.md,design-map.md,bootstrap/authority.md}`).
  No evaluator-authored support module exists in this revision, so no
  separate helper self-check is required.
- For each mandatory executable case (E1-E5, at revision 001 preparation
  time): each was run against the current unimplemented baseline (project
  commit `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`) via
  `node --test .hidden-test/*.test.ts`. Result: 16 sub-assertions total, 10
  pass / 6 fail. Every failure corresponds exactly to a gap the frozen
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
- For the two cases added under revision 002 (E6, E7, post-verification
  repair): each was run against the implementation commit
  `0d000d94e22016381f0642905b731474c4dd0afe` (the same commit already
  finalized `PASS` under revision 001, per this repair's own posture that
  it repairs the evaluator, not the implementation). E6 failed for exactly
  the intended reason ("Missing expected exception") before its exemption
  logic needed any adjustment. E7 initially flagged two dangling events
  (`implementation.json`'s `implementationFeedback` and
  `evaluator-repair.json`'s `human-evaluator-correction-authorized`); the
  latter was confirmed to be a legitimate `human-*` exemption and the
  exemption pattern was generalized accordingly, after which E7 correctly
  isolated only the genuine `implementationFeedback` gap. A positive
  control for E7 (temporarily wiring a matching policy outcome for
  `implementation-feedback-recorded`, then reverting) confirmed the test
  passes once the gap is closed. Both new test files typecheck with 0
  errors and are clean under `eslint`/`prettier --check` (same
  temporary-copy-under-`test/` method as revision 001).
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

### Added under evaluator revision 002 (post-verification repair)

An explicit human bootstrap clarification, received mid-repair, fixed the
scope of this revision: D01-D07 do not automatically become seven new
mandatory criteria; a finding may strengthen coverage only where it
demonstrates failure to satisfy an already-frozen, *unambiguous*
requirement; Harness's threat model is cooperative fallible agents, not
adversarial hardening, so the smallest structural/truthfulness check is
preferred over anti-forgery machinery. Under that clarification, only D01,
D03, and D05 became requirements below; D02, D04, D06, and D07 are recorded
as non-blocking observations, not frozen acceptance criteria (see "Not
accepted as a distinct requirement").

- **R21** - Promotion must reject a candidate whose supplied `manifest` does
  not correspond to a reconstruction of the methodology built from its own
  claimed `revision`. A caller (or a hand-edited candidate object) must not
  be able to splice the manifest of one commit onto the revision identity
  of another and have promotion accept it. This is the minimal structural
  check needed to preserve one coherent methodology identity, not an
  anti-forgery/adversarial-authority requirement. Source: frozen brief §6,
  §7 ("candidate constructs... a complete manifest from one exact
  repository revision"); AC12. Trigger: post-verification human review D01
  (`post-verification-review.md`, committed `08a138d`), scoped per explicit
  human bootstrap clarification.
- **R23** - `exercise` must truthfully perform the bounded compatibility/
  smoke-test function frozen brief §7/§9 already requires: it must
  demonstrably reference something genuinely derived from the specific
  candidate's own content (e.g. its manifest identity or a specific role/
  skill identifier), not only a generic environment-capability proof (e.g.
  an unrelated `git init && git commit`) that would be byte-identical for
  any candidate regardless of content. This is a minimal truthfulness
  check; it does not require full role or workflow simulation. Source:
  frozen brief §7 "exercise", §9 "Validation and exercise" ("sufficiently
  to prove... skills can produce their expected artifacts/checkpoints
  without direct publication"); AC16. Trigger: D03, scoped per explicit
  human bootstrap clarification ("do not require full role/workflow
  simulation").
- **R25** - Every event name a role contract's `inputs[].event` references
  must be producible — either by some role's configured policy
  `outcomes[].transition`/`onAllocate.transition`, or because it is a
  recognized human/root authority-declared event Harness records directly
  (the same category `human-accepted`/`human-rejected` already occupy). An
  input bound to an event nothing can ever produce is an unresolved
  contract/policy mismatch. Source: frozen brief AC02 ("No known mismatch
  is silently normalized by worker prose or generic kernel
  special-casing"). Trigger: D05, confirmed by explicit human bootstrap
  clarification as "a material existing-contract defect... directly within
  Spike 014b's skill/contract/policy fidelity requirement."

Not accepted as a distinct requirement, per explicit human bootstrap
clarification received mid-repair ("D02, D04, D06, and D07 must not become
new promotion-blocking requirements merely because the human review raised
them... unless the original frozen authority independently and
unambiguously requires the specific behavior"):

- **D02** ("PASS authority is not bound to the exact candidate being
  promoted") — this repair initially drafted D02 as a blocking C-C
  requirement (R22); that was overreach and has been withdrawn per the
  clarification. The Design Map's "promote... records the validated
  candidate identity and evidence" language is suggestive but not
  unambiguous on the specific binding D02 demands, and the clarification's
  threat-model note (cooperative fallible agents, not adversarial hardening)
  places this in future-hardening territory rather than a current defect.
  Recorded as a non-blocking design observation.
- **D04** ("`check` validates only a subset of the fidelity contract it
  claims to validate") — not independently actionable without either
  inventing an open-ended, unbounded new implementation-shaped test seam or
  substantially duplicating what M-A/M-B/E1 already cover; its own
  "Required correction" text explicitly cautions against "brittle pattern
  matching" and endorses keeping semantic prose review as human/evaluator
  review, which is exactly the existing M-A/M-B split.
- **D06** ("evaluator result cross-field invariant is not represented by the
  machine contract") — this repair initially drafted D06 as a blocking M-B
  requirement (R24); that was overreach and has been withdrawn per the
  clarification. The frozen Design Map's own disposition for this exact
  dimension is a single merged `KERNEL_SUPPORT_REQUIRED` row, not a
  distinct `SKILL_MUST_CHANGE` plus `CONTRACT_MUST_CHANGE` pair, so it is
  not unambiguous that a contract-level (as opposed to skill-prose) field is
  independently required. Recorded as a non-blocking design observation.
- **D07** ("trusted-history append is vulnerable to concurrent promotion
  races") — identifies a genuine general software-engineering concern, but
  neither the frozen `spike.md` nor the frozen `design-map.md` contains any
  requirement concerning concurrent promotion, locking, or serialization
  (confirmed by direct text search: zero matches for "concurren", "race",
  "lock", or "serializ" in either frozen document). Per this skill's own
  repair rule, "[b]ehavior absent from frozen authority is a specification
  defect requiring a new brief cycle, not an evaluator repair" — D07 is
  recorded here as an out-of-scope observation for a possible future brief,
  not folded into this evaluator revision's acceptance semantics.

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
- **I5** *(added under revision 002)* - A promoted trusted-history event's
  recorded methodology identity always corresponds to a reconstruction of
  its recorded revision. Derived from R21.

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
- **N7** *(added under revision 002)* - Promotion never accepts a candidate
  whose manifest does not reconstruct from its own claimed revision. (R21)

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
- **E6** *(added under revision 002)* - `promotion-binds-exact-revision`
  - Purpose: falsify D01 — verify `promoteMethodology` rejects a candidate
    whose manifest does not correspond to its own claimed revision.
  - Requirements/invariants verified: R21; I5 (revision-binding component).
  - Preconditions: none; constructs its own disposable temp-repo fixture
    from the candidate commit's actual `methodologies/`, `skills/`, and
    `src/methodologies/harness-public.ts` content, via the already-exported
    `buildMethodologyManifest`/`candidateMethodology`/`promoteMethodology`
    functions — no new field or seam.
  - Action: `node --test .hidden-test/promotion-binds-exact-revision.test.ts`.
  - Expected observable outcome: the assertion passes (promotion throws for
    the spliced candidate).
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/promotion-binds-exact-revision.test.ts`.
  - Pre-freeze exercise: run against the unimplemented (pre-D01-fix)
    candidate commit `0d000d94e22016381f0642905b731474c4dd0afe` and
    confirmed to fail for exactly the intended reason ("Missing expected
    exception"), proving the oracle discriminates real behavior rather than
    vacuously passing.
- **E7** *(added under revision 002)* - `contract-event-producers-bound`
  - Purpose: falsify D05 — verify no role contract's `inputs[].event`
    references an event nothing can produce.
  - Requirements/invariants verified: R25.
  - Preconditions: final candidate commit checked out.
  - Action: `node --test .hidden-test/contract-event-producers-bound.test.ts`.
  - Expected observable outcome: no offending (contract, input, event)
    triple found.
  - Mandatory: yes. Coverage mode: executable.
  - Test file: `.hidden-test/contract-event-producers-bound.test.ts`.
  - Pre-freeze exercise: run against the unimplemented (pre-D05-fix)
    candidate commit and confirmed to fail, flagging exactly
    `implementation.json`'s `implementationFeedback` input bound to the
    unproducible `implementation-feedback-recorded` event (and, before the
    exemption list was finalized, also correctly flagging
    `evaluator-repair.json`'s `human-evaluator-correction-authorized`,
    confirming the test's discriminating power); a positive control
    (temporarily wiring a matching policy outcome, then reverting) was
    exercised and confirmed the test passes once the gap is closed.
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
  - Considered under revision 002 and not added: the post-verification
    review's D06 ("evaluator result cross-field invariant is not
    represented by the machine contract") would have added a sixth sub-check
    requiring `evaluator-verify.json` itself (not only skill prose) to carry
    a declarative field for the PASS/classification invariant. Per explicit
    human bootstrap clarification received mid-repair, this is not
    independently and unambiguously required by frozen text (the Design
    Map's own disposition for this dimension is a single merged
    `KERNEL_SUPPORT_REQUIRED` row) and remains a non-blocking design
    observation, not a frozen requirement.
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
  - Requirements/invariants verified: R19, R20, R23 *(R23 added under
    revision 002)*; I4; N6.
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
    in-place rewrite of a prior trusted identity). **Added under revision
    002, bounded per explicit human clarification:** additionally confirm
    (R23) that `exercise` truthfully performs its already-required bounded
    compatibility/smoke-test function by demonstrably referencing something
    genuinely derived from the specific candidate's own content, not a
    scenario that would be byte-identical for any candidate regardless of
    content. This is a minimal truthfulness check, not a requirement for
    full role or workflow simulation.
  - Considered under revision 002 and not added: the post-verification
    review's D02 ("PASS authority is not bound to the exact candidate being
    promoted") would have added a requirement that promotion authority bind
    the evaluated candidate methodology identity, evaluated candidate
    revision, evaluating trusted methodology identity, and PASS evidence
    identity to the exact candidate being promoted, rejecting a
    structurally-valid-but-wrong-candidate authority object even when not
    self-referential. Per explicit human bootstrap clarification received
    mid-repair, this is not independently and unambiguously required by
    frozen text and falls under Harness's cooperative-agent (not
    adversarial-hardening) threat model; it remains a non-blocking design
    observation. D04 ("`check` validates only a subset of the fidelity
    contract it claims to validate") was similarly considered and not
    added — see "Not accepted as a distinct requirement" above.
  - Expected observable outcome: `npm test` green on the implementation's
    own mechanism tests, including a genuine contradiction-rejection test
    and a candidate-specific exercise test; manual inspection finds no
    self-evaluation or in-place-rewrite path.
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
| R21 *(rev 002)* | E6 | executable | promotion-binds-exact-revision.test.ts |
| R23 *(rev 002)* | C-C | composite | none (implementation's own `test/*.test.ts`) |
| R25 *(rev 002)* | E7 | executable | contract-event-producers-bound.test.ts |
| I1 | E2, M-B | executable + manual | evaluator-verify-vocabulary.test.ts |
| I2 | E1, E3, M-B | executable + manual | contracts-git-checkpoint-and-exposure.test.ts, skills-no-direct-publication.test.ts |
| I3 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| I4 | C-C | composite | none |
| I5 *(rev 002)* | E6 | executable | promotion-binds-exact-revision.test.ts |
| N1 | E1 | executable | contracts-git-checkpoint-and-exposure.test.ts |
| N2 | E3 | executable | skills-no-direct-publication.test.ts |
| N3 | E2 | executable | evaluator-verify-vocabulary.test.ts |
| N4 | E4 | executable | outcome-completion-mode.test.ts |
| N5 | M-B | manual | none |
| N6 | C-C | composite | none |
| N7 *(rev 002)* | E6 | executable | promotion-binds-exact-revision.test.ts |

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

- Revision 001: initial frozen version, prepared under the Spike 014b
  bootstrap exception against `spike.md` (`e2bd3fa3...`) and
  `design-map.md`/`bootstrap/authority.md` (`f141bb02...`). Verified PASS
  (attempt 001) against implementation commit `0d000d94...`; promoted
  (archived) under that PASS.
- Revision 002 (this document): post-verification evaluator repair.
  Trigger: explicit human post-verification review
  `post-verification-review.md` (committed `08a138d`), which this repair
  independently re-derived against frozen authority rather than accepted at
  face value. Mid-repair, an explicit human bootstrap clarification fixed
  the scope: D01-D07 do not automatically become seven new mandatory
  criteria, and only a finding demonstrating failure to satisfy an
  already-frozen, unambiguous requirement may strengthen coverage. Under
  that clarification: **D05 accepted** (R25, case E7) as a material
  existing-contract defect directly within scope; **D01 accepted only in
  its minimal structural sense** (R21, case E6) — not an anti-forgery
  requirement; **D03 accepted only bounded to exercise's already-required
  truthfulness** (R23, strengthens C-C) — not full role/workflow
  simulation; **D02, D04, D06, D07 recorded as non-blocking design
  observations**, not frozen requirements (see "Not accepted as a distinct
  requirement"). This repair's own first draft had initially added D02 (as
  R22) and D06 (as R24) as blocking requirements before the clarification
  arrived; both were withdrawn and never frozen — see the "Not accepted"
  entries for D02/D06 above, which record this as repair overreach that was
  caught and corrected before freeze, not authority. Preserves revision
  001's prior identity and bundle unchanged at `.eval/revisions/001/`.
  Adds R21, R23, R25, I5, N7, cases E6-E7, and lightly strengthens C-C's
  decision rule for R23 only. Acceptance semantics unchanged: every added
  requirement is traced to text already present in the frozen
  `spike.md`/`design-map.md` (see each requirement's "Source" citation
  above); no new product requirement was introduced, and verification
  attempt 001's `PASS` result and its evidence remain immutable historical
  fact — this repair does not retroactively alter or invalidate it, per the
  review document's own explicit statement that it "does not rewrite,
  invalidate, or retrospectively alter that verification result." Attempt
  001 remains bound to evaluator revision 001; only a new verification
  attempt (not yet run as of this repair) would be evaluated against
  revision 002.
