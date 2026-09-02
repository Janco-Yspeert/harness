# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/012-correction-cycles-evaluator-repair`
- Project commit at preparation:
  `6f46363053e4e8c48054599439e52747ba595239` (`feat/spike-012`)
- `spike.md`:
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
  (frozen at `a3742a84d523bfd0c04576761355e4f08edc1dd4`)
- `design-map.md`:
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`
  (frozen at `6b83954f1871e170046664bff14311ec647f266d`)
- `eval-requirements.md`:
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`
- Canonical evaluator skill: `skills/evaluator/SKILL.md`
- Evaluator skill name / contract version: `evaluator` v10
- Evaluator skill content identity:
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
- Evaluation revision identity: content identity of the formatted
  `.eval/freeze.json` for revision `001`

### Bootstrap process exception

The frozen `spike.md` "Evaluator skill versioning and bootstrap" section pins
the Spike 012 evaluator execution contract - for both `prepare` and `verify` -
to the exact pre-implementation evaluator skill. The pin is recorded publicly in
`spikes/012-correction-cycles-evaluator-repair/bootstrap/`:

- `bootstrap/evaluator-skill.md` - exact committed copy of the pre-implementation
  `skills/evaluator/SKILL.md`.
- `bootstrap/evaluator-authority.json` - binds `evaluator`, contract version
  `10`, source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`, source path
  `skills/evaluator/SKILL.md`, and identity
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`.

At the preparation commit the working-tree `skills/evaluator/SKILL.md` is
byte-identical to `bootstrap/evaluator-skill.md`
(`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`), so
this preparation is already executing the pinned contract. `.eval/freeze.json`
records the bootstrap-authority binding under `bootstrapAuthority`, and the
Spike 012 verification result must bind the same identity. The newly implemented
`repair` mode and correction-cycle authority are the implementation under test;
per the frozen brief they must not grade, repair, recover, or certify the Spike
012 evaluator cycle before human acceptance, and any bootstrap evaluator
correction would follow only the pinned v10 `verify` post-implementation
correction semantics, not the new `repair` mode.

## Pre-Freeze Integrity Gate

Recorded before Status was set to Frozen. Full evidence in
`pre-freeze-integrity-checklist.md`; summarised in `.eval/freeze.json`
`integrityChecks` and `preFreezeIntegrityValidation`.

- Shared helpers: none. This revision freezes no executable hidden test and no
  evaluator helper script. Every evidence procedure is either a visible
  regression obligation the frozen brief places on the implementation
  (`test/*.test.ts` run through `npm test`; acceptance criterion AC29), a static
  inspection of the frozen implementation source and skill material at the
  evaluated commit, or a `git` / command-exit provenance inspection. `hash.mjs`
  in the private workspace parent is a disposable identity calculator, not part
  of any frozen revision.
- Mandatory executable cases (E1-E23) are visible-regression obligations that the
  implementation must materialize (brief scope 1-18; AC01-AC26, AC29). They are
  exercised at `prepare` only through the controlled pre-implementation baseline
  permitted by evaluator v10: at `6f46363` `npm test` is green (53/53);
  `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check` each exit 0; and inspection of `tools/workflow.ts`,
  `tools/evaluator-integrity.ts`, `src/workflow-backend.ts`, and
  `skills/evaluator/SKILL.md` at the preparation commit confirms that no
  correction-cycle authority transition (`correction-cycle-opened`), no
  `evaluator-repair-recorded` transition, no cycle-scoped authority state, and no
  evaluator `repair` mode exist yet, and that `authorityState` still answers
  PASS / promotion / As-Built / human-decision only as spike-global facts, so
  E1-E23 have real falsifying power once implemented. No candidate implementation
  exists at freeze; none was used to shape any frozen case.
- Mandatory non-executable cases (S1-S6, P1-P3): each frozen procedure in
  `case-manifest.json` names a concrete artifact or command, a concrete
  inspection question, and a concrete decision rule. None defers "what will be
  inspected" until after candidate exposure. S1-S6 name repository regions
  (`skills/evaluator/SKILL.md`, `tools/workflow.ts`,
  `tools/evaluator-integrity.ts`, the implementation's own correction-cycle and
  repair modules wherever placed, `spikes/012-.../bootstrap/`, and Spike 012's
  own `workflow.jsonl` / `evaluation/**`) whose exact file layout is Design Map
  implementation freedom; the inspection question and decision rule are fully
  concrete regardless of where the implementation places the code.
- Runtime assumptions validated at `6f46363`: Node `v24.18.0` present
  (`>=24.12.0`); `npm test` (53 tests, 53 pass); `npm run typecheck`,
  `npm run lint`, `npm run format:check`, and `git diff --check` clean;
  `node tools/workflow.ts authority status
  spikes/012-correction-cycles-evaluator-repair` parses the two recorded
  authority events and reports `technicalVerification` `NOT_PASSED`,
  `humanDecision` `NOT_READY`, and no cycle-scoped fields.
- Harness parse/compile/execute: `tools/evaluator-integrity.ts` and
  `tools/workflow.ts` execute under `npm test` and via direct invocation; the
  prepared AC coverage bundle passes `validatePreparedEvaluatorBundle` /
  `prepareEvaluatorBundle` with `integrity.status` `PASS` and empty diagnostics;
  the frozen `coverage-map.json` parses as JSON and satisfies the current
  `validatePreparedMap` shape (30 unique criterion records, readiness attestation
  with `integrityValidation: "PASS"` and a non-empty `validatorResultBinding`).

## Explicit Requirements

Sources are the frozen `spike.md` acceptance criteria (AC01-AC30), the frozen
`spike.md` scope and model sections, and the frozen Design Map. Existing
behavior and tests are evidence, not automatic requirements.

- **R1** - The authority represents an explicit correction-cycle identity that is
  distinct from, and never conflated with, an implementation attempt, a
  verification attempt, an evaluator revision, and an executor/process execution
  attempt. (AC01; brief "Core model", scope 1; Design Map "Shared contracts")
- **R2** - The updated authority interprets existing pre-cycle workflow history
  as Cycle 001 without editing those historical records, and new cycle-scoped
  records carry an unambiguous cycle binding. (AC02; brief scope 2; Design Map
  "Shared contracts")
- **R3** - A closed, human-rejected cycle whose finding is `IMPLEMENTATION_GAP`
  may open exactly one same-spike correction cycle, and that opening binds the
  unchanged frozen brief and frozen Design Map identities. (AC03; brief "Human
  rejection closes a cycle", scope 1, 3; Design Map "Design decisions")
- **R4** - A closed, human-rejected cycle containing `EVALUATOR_COVERAGE_DEFECT`
  may open a correction cycle whose opening records that evaluator repair is
  required. (AC04; brief scope 1, 13; Design Map "Design decisions")
- **R5** - A rejection carrying both an implementation finding and an evaluator
  finding may open a correction cycle that records both implementation
  correction and evaluator repair as required. (AC05; brief scope 1, 13)
- **R6** - A deterministic regression fixture derived from Spike 011's public
  authority history recognizes its primary `IMPLEMENTATION_GAP` plus secondary
  `EVALUATOR_COVERAGE_DEFECT` rejection as eligible for a Cycle 002 that requires
  both implementation correction and evaluator repair, interprets Spike 011's
  historical events as Cycle 001, and preserves the Cycle 001 frozen brief and
  Design Map identities - without editing Spike 011. (AC06; brief "Spike 011
  recovery proof", scope 2; Design Map "Invariants")
- **R7** - A human rejection classified `SPECIFICATION_CHANGE` cannot open a
  same-spike correction cycle and continues to require the successor / new-brief
  lineage; an unqualified `OTHER_HUMAN_REJECTION` does not automatically
  authorize a correction cycle. (AC07; brief "Human rejection closes a cycle",
  scope 15; Design Map "Design decisions")
- **R8** - A human-accepted cycle cannot be reopened. (AC08; brief scope 1;
  Design Map "Invariants")
- **R9** - Cycle 001's PASS, promotion, As-Built, and human decision do not
  satisfy the corresponding prerequisites for Cycle 002; a new cycle begins with
  no implementation, verification, promotion, As-Built, or human decision, and
  historical cycle state remains queryable and immutable. (AC09; brief scope 3;
  Design Map "Design decisions", "Invariants")
- **R10** - A correction-cycle implementation attempt is legal after a human
  `IMPLEMENTATION_GAP` finding without a fabricated failed evaluator
  verification. (AC10; brief scope 4; Design Map "Design decisions")
- **R11** - The existing implementation retry caused by a genuine failed
  technical verification remains legal within the current cycle. (AC11; brief
  scope 4; Design Map "Design decisions")
- **R12** - At the implementation commit the evaluator skill exposes and
  documents three explicit modes - `prepare`, `verify`, and `repair` - with
  non-overlapping responsibilities, and its integer contract version is advanced
  past 10. (AC12; brief scope 5)
- **R13** - A validly allocated `verify` attempt never mutates the frozen
  evaluator it is executing; when verification discovers a material evaluator
  defect the attempt is finalized forward-only with the appropriate non-PASS
  result and the defect is recorded in the immutable attempt result/ledger
  before any repair begins. (AC13; brief scope 7, 12, "Verify discovers defects";
  Design Map "Invariants")
- **R14** - Evaluator `repair` requires a binding to immutable authoritative
  evidence of an evaluator defect (a finalized verification attempt classified
  `EVALUATOR_DEFECT`, or a closed human correction cycle containing
  `EVALUATOR_COVERAGE_DEFECT`) and rejects a request grounded only in a model
  observation, conversation comment, or unrecorded suspicion. (AC14; brief scope
  6; Design Map "Design decisions")
- **R15** - A successful repair begins from an exact frozen source evaluator
  revision, never overwrites it, and creates a distinguishable new evaluator
  revision. (AC15; brief scope 8, 12; Design Map "Design decisions")
- **R16** - A repair changes only evaluator material necessary to correct the
  authoritative defect; it does not rerun the complete semantic derivation
  performed by `prepare` as a required process step, and unrelated evaluator
  requirements, procedures, cases, tests, mappings, and interpretations remain
  unchanged in semantics and, where not structurally forced to change, unchanged
  in content identity. (AC16; brief scope 8; Design Map "Design decisions")
- **R17** - After the bounded change, the complete deterministic
  evaluator-integrity validation runs over the entire resulting evaluator
  revision, and the resulting revision may become current only after that
  validation passes. (AC17; brief scope 8; Design Map "Design decisions")
- **R18** - A repair cannot change the frozen brief, the frozen Design Map, the
  public `eval-requirements.md`, or the frozen definition of success; it may
  change the means of establishing a frozen requirement but not the requirement
  being established. (AC18; brief scope 9, 10; Design Map "Design decisions")
- **R19** - If a fair evaluator cannot be repaired without a materially new
  public testability seam, a new product requirement, or an
  implementation-shaped internal seam, the repair blocks and is classified onto
  the specification / methodology / evidence-model successor path rather than
  silently changing public authority. (AC19; brief scope 9, 10; Design Map
  "Design decisions")
- **R20** - Every successful or terminally blocked repair creates an immutable
  private repair record and a public-safe binding that together identify the
  repair identifier, the trigger type and authoritative trigger identity, the
  source and resulting evaluator revisions and identities, the affected
  criterion/procedure identifiers, a concise defect and correction description,
  the identities of changed evaluator artifacts, an explicit attestation that
  frozen success semantics did not change, the frozen brief / Design Map / public
  evaluation-requirement identities, and the integrity-validation result. (AC20;
  brief scope 11; Design Map "Shared contracts")
- **R21** - Verification attempts remain durably bound to the exact evaluator
  revision they executed, and attempt and evaluator-revision identifiers remain
  monotonically allocated and are never reused. (AC21; brief scope 12; Design
  Map "Invariants")
- **R22** - Authority and promotion evidence can distinguish evaluator revisions
  and repair lineage without overwriting earlier frozen or promoted evidence.
  (AC22; brief scope 12; Design Map "Shared contracts")
- **R23** - New human-rejection evidence can represent more than one material
  typed finding (a primary classification plus additional typed findings, or an
  equivalent structured representation), while the authority remains
  backward-compatible with existing legacy `classification` plus
  `secondaryFinding` records without rewriting them. (AC23; brief scope 14;
  Design Map "Design decisions")
- **R24** - After a repairable human rejection and a legal correction-cycle
  opening, the workflow can progress through the new cycle's own implementation,
  verification, promotion, As-Built, and a fresh human acceptance/rejection
  decision. (AC24; brief scope 13; Design Map "Design decisions")
- **R25** - The public authority status surface exposes the current cycle
  identity and open/closed state, the current evaluator revision, the current
  implementation attempt, the current/final verification state, the current
  cycle's promotion / As-Built / human-decision state, whether same-spike
  correction is permitted and why, and predecessor/successor lineage where
  applicable; historical cycles remain distinguishable. (AC25; brief scope 16;
  Design Map "Shared contracts")
- **R26** - A valid, mechanically determined correction-cycle opening or
  evaluator-defect-to-repair flow does not create an unnecessary human gate
  before the next acceptance/rejection decision; the human remains authoritative
  for that next decision. (AC26; brief scope 17; Design Map "Invariants")
- **R27** - Spike 012 evaluator `prepare` and `verify` are both governed by an
  exact, provenance-verifiable pre-implementation evaluator skill identity
  through an operational mechanism (committed `bootstrap/evaluator-skill.md`
  bound by `bootstrap/evaluator-authority.json`) that the workflow dispatcher
  consumes instead of resolving `skills/evaluator/SKILL.md` from the working tree
  for those phases; the prepared freeze and the verification result each bind
  that bootstrap-authority identity, proving the post-implementation evaluator
  skill was not substituted as Spike 012's grading authority. (AC27; brief
  "Evaluator skill versioning and bootstrap", "Verification of the bootstrap
  boundary"; Design Map "Shared contracts")
- **R28** - The Spike 012 implementation does not use its newly implemented
  evaluator `repair` mode or correction-cycle authority to grade, repair,
  recover, or certify Spike 012 itself before human acceptance; Spike 012's own
  `workflow.jsonl` carries no `correction-cycle-opened` or
  `evaluator-repair-recorded` transition, and its evaluator cycle is governed by
  the pinned v10 contract and predecessor recovery semantics. (AC28; brief
  "Bootstrap evaluator defects", "Bootstrap human rejection", "Verification of
  the bootstrap boundary"; Design Map "Invariants")
- **R29** - Visible deterministic regression coverage exercises the
  correction-cycle, evaluator-repair, legacy-history, and successor-boundary
  behaviours without live paid-provider calls. (AC29; brief scope 18)
- **R30** - The pre-existing workflow authority/provenance tests,
  evaluator-integrity tests, host-owned workflow-run tests, session/backend
  tests, typecheck, lint, formatting, and `git diff --check` remain green at the
  implementation commit. (AC30; brief scope 18)

## Derived Invariants

- **I1** - A correction cycle begins with a frozen evaluator state and ends at a
  human acceptance/rejection decision; implementation and verification retries
  may occur within a cycle. Cycle identity, implementation-attempt identity,
  verification-attempt identity, evaluator-revision identity, and
  executor/process-attempt identity are five distinct identifier spaces. (from
  R1, R10, R11; brief "Core model"; Design Map "Shared contracts")
- **I2** - A new correction cycle may be opened only from a closed
  human-rejected cycle and only when the recorded rejection is repairable
  without changing the frozen product contract (a normalized finding set
  containing `IMPLEMENTATION_GAP` and/or `EVALUATOR_COVERAGE_DEFECT` and no
  `SPECIFICATION_CHANGE`); at most one Cycle N+1 is opened per rejection, and it
  cannot be opened after acceptance or by mutating/removing the prior human
  decision. (from R3, R4, R5, R7, R8; brief scope 1; Design Map "Design
  decisions")
- **I3** - The frozen brief and frozen Design Map remain the spike-level product
  contract; opening a new correction cycle binds their exact existing
  identities and never revises them, silently reinterprets acceptance criteria,
  adds behavior absent from frozen authority, or uses evaluator repair to create
  a new product requirement. (from R3, R6, R18; brief "Frozen product authority
  remains spike-global")
- **I4** - PASS, promotion, As-Built, and a human decision satisfy prerequisites
  only within their own cycle; a new cycle starts with none of them, and
  historical cycle state stays queryable and immutable. (from R9, R24; Design
  Map "Invariants")
- **I5** - Evaluator repair is a distinct operation, not a `verify` side effect:
  it starts only from immutable evaluator-defect evidence, preserves the source
  revision, creates the next revision and the private repair record, and then
  runs the full structural integrity validation over the whole resulting
  revision before that revision is recorded as current. (from R13, R14, R15,
  R17, R20; Design Map "Design decisions")
- **I6** - Evaluator repair may change the means of establishing a frozen
  requirement but not the requirement being established, the frozen brief, the
  frozen Design Map, the public evaluation requirements, or acceptance
  semantics; a needed materially new public seam or semantic change blocks
  repair onto the successor / methodology path. (from R16, R18, R19; brief scope
  9, 10; Design Map "Design decisions")
- **I7** - Every correction-cycle, evaluator-repair, attempt, and
  evaluator-revision identity is append-only and never reused; verification
  attempts stay bound to the exact evaluator revision they used; Cycle 001
  history remains queryable unchanged. (from R2, R15, R21, R22; Design Map
  "Invariants")
- **I8** - Spike 012's pinned pre-implementation evaluator contract governs its
  `prepare`, its `verify`, and any bootstrap recovery; its newly implemented
  `repair` and correction-cycle facilities may be inspected and tested but may
  not grade, repair, recover, or certify that bootstrap cycle before human
  acceptance, and a rejected Spike 012 follows predecessor successor semantics.
  (from R27, R28; brief "Evaluator skill versioning and bootstrap"; Design Map
  "Invariants")
- **I9** - Opening a valid correction cycle, or flowing a finalized evaluator
  defect into `repair`, is a workflow transition and not inherently a human gate
  once the human rejection and its classifications are recorded; the human
  remains authoritative for the next acceptance/rejection decision. (from R26;
  brief scope 17)

## Negative Requirements

- **N1** - A same-spike correction cycle must not revise the frozen brief,
  revise the frozen Design Map, silently reinterpret acceptance criteria, add
  behavior absent from frozen authority, or use evaluator repair to create a new
  product requirement.
- **N2** - The authority must prevent opening two active correction cycles from
  the same rejection, opening a correction cycle after human acceptance, opening
  one for a specification-changing rejection, reopening by mutating or removing
  the prior human decision, and claiming brief/Design-Map identities that differ
  from Cycle 001.
- **N3** - An unqualified `OTHER_HUMAN_REJECTION` must not automatically
  authorize a correction cycle; the authority must require a classification that
  establishes that the frozen contract remains sufficient.
- **N4** - A validly allocated `verify` attempt must never silently mutate the
  frozen evaluator it is executing, and must never leave a discovered evaluator
  defect without a terminal disposition on the allocated attempt.
- **N5** - Evaluator repair must not be an unconstrained request to improve an
  evaluator; a model observation, conversation comment, or unrecorded suspicion
  is not sufficient authority for repair.
- **N6** - A repair must not introduce a new product requirement, require an
  implementation-specific internal seam absent from frozen authority, weaken a
  frozen criterion, strengthen it beyond frozen authority, adopt a
  candidate-shaped representation merely because the implementation exposed one,
  or change a public contract after seeing the implementation.
- **N7** - The public `eval-requirements.md` must not be silently rewritten
  during post-implementation repair; a needed materially new public testability
  seam makes the repair block rather than proceed.
- **N8** - Repair must never overwrite the source evaluator revision; attempt
  and evaluator-revision identifiers must never be reused.
- **N9** - Spike 012 must not rewrite, repair, or otherwise alter the public
  artifacts, promoted `evaluation/**`, or `workflow.jsonl` timeline of Spike 011
  (or of Spikes 003, 007, 008, 009, 010, 010a, 010b, 010c), manufacture a
  successor for Spike 011, retroactively pretend correction-cycle support existed
  during Spike 011's first cycle, or actually open Spike 011 Cycle 002 before
  Spike 012 human acceptance.
- **N10** - The newly implemented evaluator `repair` mode and correction-cycle
  authority must not be used as the grading or recovery authority that proves
  their own correctness during Spike 012.
- **N11** - The change must not weaken immutable evaluator revisions or
  verification attempts, perform an automatic specification change under the
  label of repair, or make deterministic authority code perform an automatic
  semantic judgment.

## Evaluation Cases

See `case-manifest.json` for the machine-readable form. Every case is mandatory.
`.hidden-test/manifest.json` records that no evaluator-authored executable
hidden test is frozen in this revision.

- **E1** - public regression (`test/*.test.ts` via `npm test`). Verifies R1; I1;
  N11. Coverage mode: executable public regression; materialized by
  implementation (brief scope 1; AC01). Expected observable outcome: the
  authority (and its status surface / event model) represents a correction-cycle
  identity as its own identifier space, and a deterministic test shows a single
  cycle spanning multiple implementation attempts and multiple verification
  attempts, with the evaluator-revision identity and any executor/process-attempt
  identity remaining separately observable and never collapsed into the cycle
  identity. No hidden test: the identifier shapes and status JSON spellings are
  Design Map implementation freedom.
- **E2** - public regression. Verifies R2; I1, I7; N9. Coverage mode: executable
  public regression; materialized by implementation (brief scope 2; AC02).
  Expected observable outcome: a fixture carrying an unannotated pre-cycle
  `workflow.jsonl` history is interpreted by the updated authority as Cycle 001;
  the historical bytes are not rewritten; the authority derives the Cycle 001
  state rather than retrofitting `cycle` fields into legacy events; and new
  cycle-scoped records it writes carry an explicit cycle binding.
- **E3** - public regression. Verifies R3; I2, I3; N1, N2. Coverage mode:
  executable public regression; materialized by implementation (brief scope 1, 3;
  AC03). Expected observable outcome: from a closed cycle whose human rejection
  is `IMPLEMENTATION_GAP`, opening a correction cycle succeeds exactly once, the
  opening evidence binds the unchanged frozen brief and Design Map identities,
  and a second opening from the same rejection is refused.
- **E4** - public regression. Verifies R4; I2, I5. Coverage mode: executable
  public regression; materialized by implementation (brief scope 1, 13; AC04).
  Expected observable outcome: from a closed cycle whose rejection contains
  `EVALUATOR_COVERAGE_DEFECT`, the correction-cycle opening records that
  evaluator repair is required.
- **E5** - public regression. Verifies R5; I2. Coverage mode: executable public
  regression; materialized by implementation (brief scope 1, 13; AC05). Expected
  observable outcome: a rejection carrying both an implementation finding and an
  evaluator finding opens a correction cycle whose opening records both
  implementation correction and evaluator repair as required.
- **E6** - public regression (Spike 011 recovery fixture). Verifies R6; I2, I3,
  I7; N9. Coverage mode: executable public regression; materialized by
  implementation (brief "Spike 011 recovery proof"; AC06). Expected observable
  outcome: a deterministic fixture built from Spike 011's public `workflow.jsonl`
  demonstrates that the post-Spike-012 authority (1) interprets Spike 011's
  historical events as Cycle 001, (2) treats its primary `IMPLEMENTATION_GAP`
  plus secondary `EVALUATOR_COVERAGE_DEFECT` rejection as eligible for a
  same-spike Cycle 002, (3) determines that a valid Cycle 002 opening requires
  both implementation correction and evaluator repair, and (4) keeps the frozen
  brief and Design Map identities from Cycle 001 - with no write to
  `spikes/011-host-owned-workflow-runs/**`.
- **E7** - public regression. Verifies R7; I2; N1, N2, N3. Coverage mode:
  executable public regression; materialized by implementation (brief scope 1,
  15; AC07). Expected observable outcome: a human rejection classified
  `SPECIFICATION_CHANGE` cannot open a same-spike correction cycle and the
  successor / new-brief path remains required; an unqualified
  `OTHER_HUMAN_REJECTION` likewise does not automatically authorize a correction
  cycle.
- **E8** - public regression. Verifies R8; I2, I4. Coverage mode: executable
  public regression; materialized by implementation (brief scope 1; AC08).
  Expected observable outcome: once a cycle is human-accepted, no correction
  cycle can be opened from it.
- **E9** - public regression. Verifies R9; I4. Coverage mode: executable public
  regression; materialized by implementation (brief scope 3; AC09). Expected
  observable outcome: with Cycle 001 carrying PASS, promotion, As-Built, and a
  human decision, Cycle 002 still reports each of its own prerequisites as unmet
  until it satisfies them itself, and Cycle 001's historical state remains
  queryable and unchanged.
- **E10** - public regression. Verifies R10; I1. Coverage mode: executable
  public regression; materialized by implementation (brief scope 4; AC10).
  Expected observable outcome: in a correction cycle opened with an
  implementation-correction finding, a new implementation attempt is accepted
  without any preceding failed evaluator verification in that cycle.
- **E11** - public regression. Verifies R11; I1. Coverage mode: executable
  public regression; materialized by implementation (brief scope 4; AC11).
  Expected observable outcome: within one cycle, a failed technical verification
  still permits a further implementation attempt and re-verification, exactly as
  before.
- **E12** - public regression. Verifies R13; I5, I7; N4. Coverage mode:
  executable public regression; materialized by implementation (brief scope 7,
  12; AC13). Expected observable outcome: a `verify` attempt allocated against
  evaluator revision R stays bound to R; when it discovers a material evaluator
  defect it is finalized forward-only with a non-PASS result and the defect is
  recorded in the immutable attempt result/ledger, and no corrected revision is
  usable until a separate repair operation has run.
- **E13** - public regression. Verifies R14; I5; N5. Coverage mode: executable
  public regression; materialized by implementation (brief scope 6; AC14).
  Expected observable outcome: a repair invoked with a binding to a finalized
  `EVALUATOR_DEFECT` verification attempt or a closed
  `EVALUATOR_COVERAGE_DEFECT` human cycle proceeds; a repair invoked with no such
  authoritative trigger (only a free-text reason) is refused.
- **E14** - public regression. Verifies R15, R16, R21; I7; N8. Coverage mode:
  executable public regression; materialized by implementation (brief scope 8,
  12; AC15, AC16, AC21). Expected observable outcome: a successful repair leaves
  the source evaluator revision byte-for-byte intact, creates a new revision with
  a distinct identifier and identity, changes only defect-related artifacts (a
  diff of the two revisions shows unrelated artifacts identical in content
  identity), and every verification attempt still resolves to the exact revision
  it executed; revision and attempt identifiers are monotonic and never reused.
- **E15** - public regression. Verifies R17; I5. Coverage mode: executable
  public regression; materialized by implementation (brief scope 8; AC17).
  Expected observable outcome: repair runs the complete deterministic
  evaluator-integrity validation over the entire resulting revision; a resulting
  revision that fails that validation is not recorded as current and the repair
  does not complete.
- **E16** - public regression. Verifies R18, R19; I3, I6; N1, N6, N7. Coverage
  mode: executable public regression; materialized by implementation (brief scope
  9, 10; AC18, AC19). Expected observable outcome: a repair attempt that would
  change the frozen brief, the frozen Design Map, the public
  `eval-requirements.md`, or acceptance semantics is refused; a repair that would
  require a materially new public testability seam or a new product requirement
  blocks and is classified onto the successor / methodology path rather than
  silently changing public authority; a repair that only swaps an insufficient
  evidence procedure for a stronger one that establishes the same frozen
  criterion is allowed.
- **E17** - public regression. Verifies R20; I5. Coverage mode: executable
  public regression; materialized by implementation (brief scope 11; AC20).
  Expected observable outcome: each completed or terminally blocked repair
  creates an immutable repair record and a public-safe binding that together
  carry the repair identifier, trigger type and identity, source and resulting
  revision identifiers and identities, affected criterion/procedure identifiers,
  concise defect and correction descriptions, changed-artifact identities, the
  semantic-preservation attestation, the frozen brief / Design Map /
  evaluation-requirement identities, and the integrity-validation result.
- **E18** - public regression. Verifies R22; I7. Coverage mode: executable
  public regression; materialized by implementation (brief scope 12; AC22).
  Expected observable outcome: authority and promotion evidence can name and
  distinguish evaluator revision 001 and a later revision 002 and the repair
  lineage between them, and promoting the later revision does not overwrite the
  earlier frozen or promoted evidence.
- **E19** - public regression. Verifies R23; N11. Coverage mode: executable
  public regression; materialized by implementation (brief scope 14; AC23).
  Expected observable outcome: a new human-rejection record can carry a primary
  classification plus one or more additional typed findings, and the authority
  reads Spike 011's existing `classification` plus `secondaryFinding` record
  through the same normalized finding set without rewriting that event.
- **E20** - public regression. Verifies R24; I4. Coverage mode: executable
  public regression; materialized by implementation (brief scope 13; AC24).
  Expected observable outcome: after a legal correction-cycle opening, the new
  cycle can record its own implementation handoff, verification allocation and
  PASS, promotion, As-Built, and a fresh human decision, each checked against
  that cycle's own prerequisites.
- **E21** - public regression. Verifies R25; I1, I4. Coverage mode: executable
  public regression; materialized by implementation (brief scope 16; AC25).
  Expected observable outcome: the public authority status surface reports the
  current cycle identity and open/closed state, the current evaluator revision,
  the current implementation attempt, the current/final verification state, the
  current cycle's promotion / As-Built / human-decision state, whether same-spike
  correction is permitted and the reason, and predecessor/successor lineage,
  with historical cycles still distinguishable - without a caller parsing
  `workflow.jsonl` by hand.
- **E22** - public regression. Verifies R26; I9. Coverage mode: executable
  public regression; materialized by implementation (brief scope 17; AC26).
  Expected observable outcome: when the recorded rejection unambiguously
  authorizes same-spike correction, or when a finalized evaluator defect flows
  into `repair`, the transition proceeds without a new human approval gate for
  the existence of the next cycle or the repair; the human decision gate remains
  only at the next acceptance/rejection.
- **E23** - public regression. Verifies R29; I1. Coverage mode: executable
  public regression; materialized by implementation (brief scope 18; AC29).
  Expected observable outcome: the repository's visible test suite contains
  deterministic coverage for the correction-cycle, evaluator-repair,
  legacy-history, and successor-boundary behaviours (the brief scope 18 list),
  and the suite runs to completion through `npm test` with no live paid
  Codex/Claude provider call.
- **S1** - static inspection of `skills/evaluator/SKILL.md` (or its
  Design-Map-approved successor) at the evaluated commit. Verifies R12. Coverage
  mode: static inspection. Evidence plan: confirm the skill exposes three
  explicit modes `prepare`, `verify`, and `repair`; that each has a documented,
  non-overlapping responsibility (`prepare` derives and freezes before
  implementation exposure, `verify` executes the frozen evaluator and classifies
  without modifying it during the allocated attempt, `repair` corrects an
  already-demonstrated evaluator defect while preserving the frozen definition of
  success); and that the integer contract version is greater than 10.
- **S2** - static inspection of the evaluator skill `verify` and `repair` mode
  text and the repair implementation module at the evaluated commit. Verifies
  R13, R14, R16, R17, R18, R19; I5, I6; N4, N5, N6, N7. Coverage mode: static
  inspection. Evidence plan: confirm the `verify` text forbids mutating the
  frozen evaluator during an allocated attempt and requires finalize-then-record
  before repair; and that the `repair` text and code require an authoritative
  defect trigger, keep the change bounded to the demonstrated defect rather than
  rerunning full `prepare`, run the full structural integrity validation over the
  whole resulting revision before it becomes current, forbid changing the frozen
  brief / Design Map / public `eval-requirements.md` / acceptance semantics, and
  block onto the successor path when a materially new public seam or product
  requirement would be needed.
- **S3** - static inspection of `spikes/012-correction-cycles-evaluator-repair/
  bootstrap/` and the workflow dispatcher's evaluator-phase wiring at the
  evaluated commit. Verifies R27; I8; N10. Coverage mode: static inspection.
  Evidence plan: confirm `bootstrap/evaluator-skill.md` is byte-identical to the
  pinned pre-implementation `skills/evaluator/SKILL.md`
  (`sha256:fa8168a3...c38b`); that `bootstrap/evaluator-authority.json` binds the
  skill name, contract version, source Git object, and SHA-256 identity; and that
  the workflow dispatcher, for the Spike 012 `evaluator-prepare` and
  `evaluator-verify` phases, loads and supplies that pinned material as the
  operative instruction source instead of resolving
  `skills/evaluator/SKILL.md` from the working tree.
- **S4** - static inspection of Spike 012's own `workflow.jsonl`, `manifest.md`,
  and `evaluation/**` at the evaluated commit. Verifies R28; I8; N10. Coverage
  mode: static inspection. Evidence plan: confirm Spike 012's `workflow.jsonl`
  carries no `correction-cycle-opened` or `evaluator-repair-recorded` transition,
  that the Spike 012 evaluator `prepare`/`verify` evidence binds the pinned v10
  bootstrap-authority identity rather than the post-implementation evaluator
  skill, and that no newly implemented correction-cycle transition or `repair`
  operation was used to grade, repair, recover, or certify the Spike 012 cycle.
- **S5** - static inspection of the correction-cycle-opening authority code and
  the evaluator `repair` blocking path at the evaluated commit. Verifies R7, R19;
  I2, I3, I6; N1, N2. Coverage mode: static inspection. Evidence plan: confirm
  the authority still requires the successor / new-brief lineage when the frozen
  brief must change, when the frozen Design Map must materially change, when the
  human rejection is `SPECIFICATION_CHANGE`, when evaluator repair would require
  new public product semantics or a new implementation-shaped seam, or when a
  methodology / evidence-model defect cannot be corrected under already-frozen
  Spike 012 authority; and that a rejected cycle can therefore be terminal for
  the spike.
- **S6** - static inspection of the cycle-derivation authority code at the
  evaluated commit. Verifies R1, R2; I1, I7; N9, N11. Coverage mode: static
  inspection. Evidence plan: confirm the authority derives the active cycle and
  its evaluator / implementation / verification / promotion / As-Built /
  human-decision state from the append-only history, represents cycle identity as
  its own append-only zero-padded identifier distinct from implementation
  attempt, verification attempt, evaluator revision, and executor/process
  attempt, does not mutate or retrofit `cycle` fields into legacy events, and
  performs no automatic semantic judgment in deterministic code.
- **P1** - provenance inspection. Verifies R29, R30. Coverage mode: provenance
  inspection. Evidence plan: at the evaluated commit run `npm test`,
  `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check`; require each to exit 0; require the pre-existing workflow
  authority/provenance suite (`test/workflow.test.ts`), the evaluator-integrity
  suite (`test/evaluator-integrity.test.ts`), the host-owned workflow-run suite,
  and the session/backend suites (`session-lifecycle`, `session-backend`,
  `session-events`, `codex-backend`) to remain green; and confirm the visible
  suite completes without a live paid provider call.
- **P2** - provenance inspection. Verifies R6; N9. Coverage mode: provenance
  inspection. Evidence plan: at the evaluated commit, require the public
  artifacts, promoted `evaluation/**`, and `workflow.jsonl` timeline of Spike 011
  (and of Spikes 003, 007, 008, 009, 010, 010a, 010b, 010c) to be byte-for-byte
  identical to their pre-Spike-012 state (`git diff <pre-012-base>..<evaluated-
  commit> -- spikes/003-* spikes/007-* spikes/008-* spikes/009-* spikes/010*
  spikes/011-*` shows no change under those trees); require no new verification
  result, rejection, correction-cycle, or lineage event on any of those
  timelines.
- **P3** - provenance inspection. Verifies R27, R28; I8. Coverage mode:
  provenance inspection. Evidence plan: confirm the Spike 012 evaluator freeze
  metadata and the Spike 012 verification result each record the
  bootstrap-authority identity
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
  (`evaluator` v10, source commit `b7f442ae`); confirm no Spike 012 evaluator
  evidence cites a post-implementation evaluator skill identity as its grading
  authority; and confirm no `evaluator repair` operation and no correction-cycle
  transition appear in the Spike 012 evaluator cycle evidence.

## Coverage Matrix

| Requirement | Cases          | Mode                  |
| ----------- | -------------- | --------------------- |
| R1          | E1, S6         | executable + static   |
| R2          | E2, S6         | executable + static   |
| R3          | E3             | executable            |
| R4          | E4             | executable            |
| R5          | E5             | executable            |
| R6          | E6, P2         | executable + provenance |
| R7          | E7, S5         | executable + static   |
| R8          | E8             | executable            |
| R9          | E9             | executable            |
| R10         | E10            | executable            |
| R11         | E11            | executable            |
| R12         | S1             | static                |
| R13         | E12, S2        | executable + static   |
| R14         | E13, S2        | executable + static   |
| R15         | E14            | executable            |
| R16         | E14, S2        | executable + static   |
| R17         | E15, S2        | executable + static   |
| R18         | E16, S2        | executable + static   |
| R19         | E16, S2, S5    | executable + static   |
| R20         | E17            | executable            |
| R21         | E14            | executable            |
| R22         | E18            | executable            |
| R23         | E19            | executable            |
| R24         | E20            | executable            |
| R25         | E21            | executable            |
| R26         | E22            | executable            |
| R27         | S3, P3         | static + provenance   |
| R28         | S4, P3         | static + provenance   |
| R29         | E23, P1        | executable + provenance |
| R30         | P1             | provenance            |

Every mandatory invariant and negative requirement is covered transitively:
I1 (E1, E10, E11, E21, E22, S6), I2 (E3, E4, E5, E6, E7, E8, S5), I3 (E3, E6,
E16, S5), I4 (E8, E9, E20, E21), I5 (E4, E12, E13, E15, E17, S2), I6 (E16, S2,
S5), I7 (E2, E6, E14, E18, S6), I8 (S3, S4, P3), I9 (E22);
N1 (E3, E7, E16, S5), N2 (E3, E7, E8, S5), N3 (E7), N4 (E12, S2), N5 (E13, S2),
N6 (E16, S2), N7 (E16, S2), N8 (E14), N9 (E2, E6, P2), N10 (S3, S4, P3),
N11 (E1, E19, S6).

Nothing in this suite is evaluated by a frozen executable hidden test authored
by the evaluator. Executable coverage is the implementation's own visible
regression suite, exercised through `npm test` (mandated by AC29). This mapping
agrees with `.hidden-test/manifest.json` and `case-manifest.json`.

Anything that cannot be evaluated automatically: S1-S6 are read by a human/agent
inspector against a concrete decision rule; P1-P3 are command-exit and `git`
provenance checks.

## Out of Scope

- Whether any individual visible test is intellectually persuasive or a
  criterion is well phrased.
- Repair of Spike 011's Claude permission implementation, or any actual reopening
  of Spike 011 Cycle 002 (brief non-goals; deferred until after Spike 012 human
  acceptance).
- Any general rewrite of the brief-readiness or Design Map skills, a generic
  workflow/DAG engine, an agent-neutral skill conversion, a methodology
  install/package mechanism, a provider permission-broker redesign, or new
  Claude/Codex runtime integration (brief "Non-goals").
- The fundamental human acceptance/rejection gate itself (brief "Non-goals").
- Human product acceptance, which is a separate later gate.

## Limitations

- E1-E23 are visible-regression obligations. Preparation confirms the seam
  exists and is currently unmet (no correction-cycle authority, no
  `evaluator-repair-recorded` transition, no cycle-scoped authority state, and no
  evaluator `repair` mode at `6f46363`) but cannot exercise the not-yet-written
  scenarios; `verify` runs them against the frozen implementation.
- S1-S6 assert the presence and binding force of behavioural and architectural
  properties, not that a particular file layout or naming is optimal. Their
  targets' exact repository locations are Design Map implementation freedom; the
  inspection questions and decision rules are concrete regardless of location.
- The Design Map leaves the internal authority representation, the status JSON
  shape, the private repair-record format, executor command wiring, and the test
  fixture location as implementation freedom; the evaluation asserts observable
  behaviour and information content, not a specific surface.
- `tools/evaluator-integrity.ts` validates a supplied bundle description, not the
  physical bundle (Spike 010c `IMPLEMENTATION_GAP`); the supplementary pre-freeze
  checklist performs the physical-existence and hash-recomputation checks for
  this revision.
- Spike 012's own evaluator cycle runs under the pinned pre-implementation v10
  contract; the newly implemented `repair` mode is therefore evaluated as
  implementation, and any bootstrap evaluator correction during Spike 012
  `verify` would use only the pinned v10 post-implementation correction
  semantics.

## Revision History

- Revision `001` - initial frozen revision. Prepared under the pinned
  pre-implementation evaluator skill `evaluator` v10
  (`sha256:fa8168a3...c38b`) per the frozen `spike.md` bootstrap process
  exception. No prior revision.
