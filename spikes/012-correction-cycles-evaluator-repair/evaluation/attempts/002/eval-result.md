# Evaluation Result

## Overall Result

FAIL — classification `IMPLEMENTATION_FAILURE`.

## Evaluation Source

- Verification-attempt identifier: `002`
- Project commit evaluated: `feat/spike-012` @
  `31be00bae7e76a314edc0cbdaecc0362bfd57814` ("fix: bind Spike 012 verification
  authority at host"), implementation attempt `2`. Clean commit; the working
  tree at evaluation time (`248b420`) differs from `31be00b` only by two
  appended `workflow.jsonl` methodology lines (`implementation-handoff` and
  `verification-allocated` for attempt 2) and carries no implementation-content
  change. No evaluation was run against uncommitted changes.
- Frozen `eval-spec.md` identity:
  `sha256:974c49925e11dc8fdd2552f8681e276491b8428bef3724c80fe9e4d0d7f6c048`
- Spike brief (`spike.md`) identity:
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
  (frozen at `a3742a8`; byte-identical at the evaluated commit)
- Design Map (`design-map.md`) identity:
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`
  (frozen at `6b83954`; byte-identical at the evaluated commit)
- Public evaluation requirements (`eval-requirements.md`) identity:
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`
  (byte-identical at the evaluated commit)
- Public `coverage-map.json` identity:
  `sha256:3af9e8ccaa25f0f1767c11170556f169676e182be20d05fe68b1384ff6f8976c`
  (equals the `evaluation-prepared` evidence identity; byte-identical at the
  evaluated commit)
- Evaluator revision: `001`
- Canonical evaluator revision identity (content identity of the formatted
  `.eval/freeze.json`):
  `sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`
- Evaluator skill version: `10` (pinned pre-implementation bootstrap contract)
- Pinned bootstrap authority (operative evaluator contract for this
  verification):
  - name `evaluator`, contract version `10`
  - source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`,
    source path `skills/evaluator/SKILL.md`
  - content identity
    `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
  - snapshot `spikes/012-correction-cycles-evaluator-repair/bootstrap/evaluator-skill.md`
    (byte-identical to the pinned identity; verified this run)
  - authority binding
    `spikes/012-correction-cycles-evaluator-repair/bootstrap/evaluator-authority.json`
  - This verification was executed under that pinned snapshot as its sole
    operative evaluator contract. `skills/evaluator/SKILL.md` from the working
    tree was neither read nor used as evaluator authority. The newly implemented
    `repair` mode and correction-cycle authority were treated only as
    implementation under test.
- Evaluation timestamp: 2026-09-02T00:00:00Z (UTC date; see manifest for the
  measurement cutoff).

Private attempt-ledger path:
`<project>-hidden/spikes/012-correction-cycles-evaluator-repair/.eval/attempt-ledger.json`.
This result is immutable after the attempt completes and remains linked from
that ledger.

## Summary

- Passed mandatory cases: 24 of 32 evaluation procedures fully established their
  criteria (E1, E2, E3, E4, E5, E9, E10, E11, E12, E13, E14, E15, E17, E18, E19,
  E21, E22, S1, S2, S3, S4, S5, S6, P1, P2, P3 — see per-case notes; several
  carry documented reservations that were not scored as failures).
- Failed mandatory cases: 5 — E6, E7 (executable half), E8, E16 (blocking-path
  half), E20; plus the derived failure of E23.
- Materially unsatisfied acceptance criteria: `AC06`, `AC07`, `AC08`, `AC19`,
  `AC24`, `AC29`.
- Non-mandatory findings: 0.
- Evaluator defects discovered: 0.
- Specification ambiguities: 0.
- Infrastructure failures: 0.
- Specification drift: 0 (all frozen input and evaluator-revision identities
  matched exactly).

## Findings

### Finding 1 — `AC06` not satisfied: no Spike 011 recovery-proof regression fixture

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC06`, `R6`; evaluation cases `E6` (executable)
  and `P2` (provenance); frozen `spike.md` section "Spike 011 recovery proof";
  frozen Design Map "Invariants"; `eval-requirements.md` `TR7`.
- Expected contractual behaviour: the implementation must ship a deterministic
  visible regression fixture, derived from Spike 011's public preserved
  authority history through its existing `human-rejected` event (primary
  `IMPLEMENTATION_GAP`, secondary `EVALUATOR_COVERAGE_DEFECT`), that
  demonstrates the post-Spike-012 authority (1) interprets Spike 011's events as
  Cycle 001, (2) treats that rejection as eligible for a same-spike Cycle 002,
  (3) determines a valid Cycle 002 opening requires both implementation
  correction and evaluator repair, and (4) keeps the Cycle 001 frozen brief and
  Design Map identities — without any write to
  `spikes/011-host-owned-workflow-runs/**`.
- Observed behaviour: no test in the visible suite references Spike 011,
  reconstructs its authority history, or asserts any of the four required
  conclusions from preserved Spike 011 evidence. `grep -rn "011" test/` returns
  only unrelated host-run slot identifiers in
  `test/workflow-run.integration.test.ts`. The consolidated test "correction
  cycles keep legacy history immutable and scope all completion facts" exercises
  a *synthetic* `classification` + `secondaryFinding` rejection, not a fixture
  derived from Spike 011's real history.
- `P2` (provenance) is separately satisfied:
  `git diff 6adae1e..31be00b -- spikes/003-* spikes/007-* spikes/008-*
  spikes/009-* spikes/010* spikes/011-*` is empty, so no Spike 003–011 public
  artifact, promoted `evaluation/**`, or `workflow.jsonl` timeline was altered
  (negative requirement `N9` upheld). The failure is the *absence* of the
  mandated fixture, not a violation of `N9`.
- Diagnostic evidence: `test/*.test.ts` full-tree grep for `011`, `recovery`,
  `Spike 011`; `git show dd63c80 --stat` and `git show 31be00b --stat` (no
  fixture data file added anywhere).

### Finding 2 — `AC07` not satisfied: no executable coverage of the successor boundary

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC07`, `R7`; `AC07` is COMPOSITE over `E7`
  (executable) and `S5` (static). Frozen `spike.md` "Human rejection closes a
  cycle" and scope 15; frozen Design Map "Design decisions"; `spike.md` scope 18
  ("a specification-changing rejection cannot open a correction cycle").
- Expected contractual behaviour: a visible deterministic test must show that a
  `human-rejected` event classified `SPECIFICATION_CHANGE` cannot open a
  same-spike correction cycle (and that the successor / new-brief path remains
  required), and that an unqualified `OTHER_HUMAN_REJECTION` does not
  automatically authorize a correction cycle.
- Observed behaviour: no visible test records a `human-rejected` transition with
  classification `SPECIFICATION_CHANGE` or a bare `OTHER_HUMAN_REJECTION` and
  asserts that `correction-cycle-opened` is refused / `correctionPermitted` is
  `false` / successor lineage remains required. `grep -rn
  "SPECIFICATION_CHANGE\|OTHER_HUMAN_REJECTION" test/` returns nothing.
- `S5` (static inspection of the authority code) is satisfied: `tools/workflow.ts`
  `authorityState` computes `repairable` as the intersection of the normalized
  human findings with `{IMPLEMENTATION_GAP, EVALUATOR_COVERAGE_DEFECT}` and sets
  `correctionPermitted = repairable.length > 0 && !current.accepted`, with
  `correctionReason` "rejection requires successor lineage" otherwise; the
  `correction-cycle-opened` validator calls `fail(state.correctionReason)` when
  `!state.correctionPermitted`. The code is correct; the mandated executable
  half of the composite is missing, so `AC07` is not established.
- Diagnostic evidence: `tools/workflow.ts` lines ~928–952 and ~1032–1041; test
  grep above.

### Finding 3 — `AC08` not satisfied: no coverage of "a human-accepted cycle cannot be reopened"

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC08`, `R8`; evaluation case `E8`
  (PUBLIC_REGRESSION, sole procedure for `AC08`). Frozen `spike.md` scope 1 and
  scope 18 ("a human-accepted cycle cannot be reopened"); frozen Design Map
  "Invariants".
- Expected contractual behaviour: a visible deterministic test must drive a
  cycle to `human-accepted` and then show every `correction-cycle-opened`
  attempt from that cycle refused.
- Observed behaviour: no visible test records `human-accepted` followed by a
  refused `correction-cycle-opened`. The test "authority preserves a complete
  PASS through human rejection" only shows that `human-accepted` cannot follow
  `human-rejected`; it never accepts a cycle and then attempts to reopen it.
- The authority code does implement the guard
  (`correction-cycle-opened` requires `previous.rejectedEvent && !previous.accepted`,
  and `correctionPermitted` requires `!current.accepted`), but `AC08` is a
  PUBLIC_REGRESSION criterion with `E8` as its only evidence procedure, and
  `E8` is not materialized.
- Diagnostic evidence: `grep -rn "human-accepted" test/`; `tools/workflow.ts`
  `correction-cycle-opened` validator.

### Finding 4 — `AC24` not satisfied: the corrected cycle's own full sequence is not exercised

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC24`, `R24`; evaluation case `E20`
  (PUBLIC_REGRESSION, sole procedure). Frozen `spike.md` scope 13 and scope 18
  ("a second human decision is possible only after the new cycle completes its
  own PASS/promotion/As-Built sequence"); frozen Design Map "Design decisions".
- Expected contractual behaviour: after a legal `correction-cycle-opened`, a
  visible test must show the new cycle recording its own implementation handoff,
  verification allocation and PASS, promotion, As-Built, and a fresh human
  decision, each checked against that cycle's own prerequisites.
- Observed behaviour: the "correction cycles" test opens Cycle 002 and records a
  single Cycle 002 `implementation-handoff`, then stops. There is no Cycle 002
  `verification-allocated`, `verification-finalized` PASS, `promotion-recorded`,
  `as-built-recorded`, or second `human-*` decision anywhere in the visible
  suite. The claim that a corrected cycle "can progress through its own
  implementation/verification/promotion/As-Built/human-decision sequence" is
  therefore not demonstrated.
- Diagnostic evidence: `test/workflow.test.ts` lines 708–794 (the only Cycle
  002 test path); no cycle-scoped `promotion-recorded` / `as-built-recorded` /
  second `human-*` transition in `test/`.

### Finding 5 — `AC19` not satisfied: no executable coverage of the repair-blocks-to-successor path

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC19`, `R19`; `AC19` is COMPOSITE over `E16`
  (executable), `S2` and `S5` (static). Frozen `spike.md` scope 9, 10, 15;
  frozen Design Map "Design decisions".
- Expected contractual behaviour: a visible deterministic test must show that a
  repair which would require a materially new public testability seam or a new
  product requirement blocks and is classified onto the successor / methodology
  path (rather than silently changing public authority), and that a repair which
  only swaps an insufficient evidence procedure for a stronger one establishing
  the same frozen criterion is allowed.
- Observed behaviour: the visible suite has one repair test
  ("evaluator repair requires immutable defect evidence and preserves revision
  lineage"). It exercises the authoritative-trigger requirement and the
  monotonic-revision requirement only. No visible test exercises a blocked
  repair, a terminal `evaluator-repair-recorded` blocked record, or the
  successor / methodology routing; and no visible test exercises an
  evidence-procedure-swap repair that is allowed.
- `S2` and `S5` (static) are satisfied: the v11 `repair` section of
  `skills/evaluator/SKILL.md` states "do not ... alter acceptance semantics,
  introduce a product requirement, or demand a new public or
  implementation-shaped test seam. If that would be necessary, record a terminal
  blocked repair and route to the successor/methodology path", and
  `tools/workflow.ts` enforces the frozen brief / Design Map /
  `eval-requirements.md` identity match on `evaluator-repair-recorded`. The
  executable half of the composite is missing.
- Diagnostic evidence: `test/workflow.test.ts` lines 796–860; `git show dd63c80
  -- skills/evaluator/SKILL.md`.

### Finding 6 — `AC29` not satisfied: the "successor-boundary" behaviour family has no visible deterministic coverage

- Classification: `IMPLEMENTATION_FAILURE`
- Affected requirement / case: `AC29`, `R29`; evaluation cases `E23`
  (executable) and `P1` (provenance). Frozen `spike.md` scope 18 and AC29
  ("Visible deterministic regression coverage exercises the correction-cycle,
  evaluator-repair, legacy-history, and **successor-boundary** behaviors without
  live paid-provider calls").
- Frozen decision rule (`E23`): "Missing deterministic visible coverage for any
  of the four behaviour families, or a suite that needs a live paid provider
  call, is a FAIL for AC29."
- Observed behaviour: the visible suite has deterministic coverage for the
  correction-cycle family (open/duplicate-refuse), the evaluator-repair family
  (trigger requirement, revision lineage), and the legacy-history family (Cycle
  001 interpretation, byte-immutability). It has **no** coverage for the
  successor-boundary family: no `SPECIFICATION_CHANGE` rejection is refused a
  correction cycle (Finding 2), no repair is blocked onto the successor /
  methodology path (Finding 5), and no `human-accepted` cycle is refused reopen
  (Finding 3). `P1` (provenance) is independently satisfied — `npm test`
  (57 pass / 0 fail), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` all exit 0, and the suite runs
  with no live paid provider call — but `E23`'s behaviour-family requirement is
  not met, so `AC29` fails.
- Diagnostic evidence: full `test/` tree inspection (see Regression Results);
  Findings 2, 3, 5.

### Reservations (not scored as failures, recorded for the record)

- `AC04`: exercised only inside the both-findings ("correction cycles") test —
  the `EVALUATOR_COVERAGE_DEFECT` → `evaluatorRepair` mapping is checked there,
  but no test isolates a rejection whose sole repairable finding is
  `EVALUATOR_COVERAGE_DEFECT`.
- `AC15` / `AC16` / `AC21` (`E14`): the visible test asserts event-level revision
  lineage and non-reuse. "Source revision byte-for-byte intact" and "a diff of
  the two revisions shows unrelated artifacts identical in content identity" are
  not exercised, because the authority scope does not manage the private
  evaluator revision bundle (this is Design-Map implementation freedom for the
  repair-record format). Static `S2` covers the skill-text obligation.
- `AC17` (`E15`): the authority enforces `integrityValidation === "PASS"` on
  `evaluator-repair-recorded`, but no visible test shows a failing integrity
  validation blocking a revision from becoming current (positive-path only).
- `AC18` (`E16`): the authority enforces the frozen brief / Design Map /
  `eval-requirements.md` identity match, but no visible test negatively exercises
  a repair that attempts to change one of those identities.
- `AC20` (`E17`): the public `evaluator-repair-recorded` binding is checked, but
  the *private* immutable repair record's enumerated contents (concise defect
  description, correction description, changed-artifact identities) are only
  referenced through an opaque `repairRecordIdentity` and are not verified by
  any visible test.
- `AC22` (`E18`): revision distinction is shown at authority-status level; no
  visible test promotes a repaired revision and shows earlier frozen / promoted
  evidence left intact.
- `AC26` (`E22`): the absence of an added human gate is shown implicitly by the
  "correction cycles" test opening Cycle 002 without an intervening approval
  transition; there is no explicit assertion about gate absence.

## Regression Results

Run at the evaluated implementation tree (`feat/spike-012`, implementation
content of `31be00b`; verified byte-identical to `31be00b` except for two
`workflow.jsonl` methodology lines). Node `v24.18.0`.

| Check | Result |
| ----- | ------ |
| `npm test` (`node --test test/*.test.ts`) | pass — tests 57, pass 57, fail 0 |
| `npm run typecheck` (`tsc --noEmit`) | pass (exit 0) |
| `npm run lint` (`eslint .`) | pass (exit 0) |
| `npm run format:check` (`prettier --check .`) | pass (exit 0) |
| `git diff --check` | clean (exit 0) |

Pre-existing suites (all green at the evaluated commit):

| Suite | Tests |
| ----- | ----- |
| `test/workflow.test.ts` | 15 pass |
| `test/evaluator-integrity.test.ts` | 5 pass |
| `test/workflow-run.integration.test.ts` | 12 pass |
| `test/session-lifecycle.integration.test.ts` | 4 pass |
| `test/session-backend.integration.test.ts` | 6 pass |
| `test/session-events.integration.test.ts` | 4 pass |
| `test/codex-backend.integration.test.ts` | 11 pass |

`AC30` / `P1` (regression, typecheck, lint, formatting, `git diff --check`, and
the pre-existing workflow-authority / evaluator-integrity / host-owned
workflow-run / session-backend suites remain green) is **satisfied**. The
visible suite completes with no live paid Codex/Claude provider call
(`codex-backend` and session suites use bounded local/substituted executors; no
provider credentials are present or required).

`P2` (Spike 003–011 public artifacts, promoted `evaluation/**`, and
`workflow.jsonl` timelines byte-for-byte unchanged by `feat/spike-012`) is
**satisfied**: `git diff 6adae1e..31be00b -- spikes/003-* spikes/007-*
spikes/008-* spikes/009-* spikes/010* spikes/011-*` is empty, and a full
`git diff 6adae1e..31be00b -- spikes/ ':!spikes/012-*'` is empty.

## Diagnostic Probes

The following read-only probes were run to distinguish an implementation gap
from an evaluator or specification cause. They are supplementary and do not by
themselves change the Overall Result.

1. Full `test/` tree keyword sweep (`grep -rn` for `011`, `recovery`,
   `SPECIFICATION_CHANGE`, `OTHER_HUMAN_REJECTION`, `human-accepted`,
   `correction-cycle`, `evaluator-repair`, `Cycle 002`, `priorCycle`). Showed
   that correction-cycle / repair coverage lives only in `test/workflow.test.ts`
   in two consolidated tests plus one bootstrap-dispatch test, and that no test
   touches the `SPECIFICATION_CHANGE`, `OTHER_HUMAN_REJECTION`, `human-accepted`
   reopen, or Spike 011 fixture scenarios. Confirms Findings 1–3, 5, 6 are
   absence of coverage, not misread coverage.
2. `git show dd63c80 -- tools/workflow.ts` / `-- skills/evaluator/SKILL.md` and
   `git show 31be00b -- src/workflow-run.ts test/workflow-run.integration.test.ts`.
   Confirmed the authority *code* implements the successor-boundary guards, the
   repair-trigger guard, the whole-revision integrity gate, and the frozen
   identity gates — i.e. the failures are missing *visible regression
   materialization* (AC29 / scope 18 obligations placed on the implementation),
   not missing behaviour. This is why the classification is
   `IMPLEMENTATION_FAILURE` (the implementation did not ship mandated visible
   coverage) rather than `EVALUATOR_DEFECT`.
3. `sha256sum` recomputation of every frozen evaluator artifact
   (`eval-spec.md`, `criterion-records.md`, `case-manifest.json`,
   `.hidden-test/manifest.json`, `pre-freeze-integrity-checklist.md`) and of
   `.eval/freeze.json`; and of the frozen inputs at `31be00b`. All matched the
   frozen values in `.eval/freeze.json` and `.eval/inventory.txt`. Rules out
   `SPECIFICATION_DRIFT` and evaluator-integrity failure.

## Evaluator Integrity

- The frozen evaluation was **not** modified during verification. No frozen
  private artifact, `coverage-map.json`, `eval-requirements.md`, freeze
  metadata, or the pinned bootstrap snapshot was edited. Evaluator revision
  remains `001`
  (`sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`).
- Specification drift: **none detected**. `spike.md`, `design-map.md`,
  `eval-requirements.md`, `coverage-map.json`, and every hidden/support artifact
  match their frozen identities exactly at the evaluated commit.
- Evaluator defects discovered: **none**. Every failing criterion traces to an
  explicit frozen-authority obligation on the implementation (scope 18's
  enumerated "must demonstrate at least" list, the "Spike 011 recovery proof"
  section, and AC06 / AC07 / AC08 / AC19 / AC24 / AC29). The evaluator's frozen
  cases require exactly what the brief requires; no case over-reaches.
- `IMPLEMENTATION_FAILURE` pre-classification checklist applied:
  - Reran the passing suite in isolation and per-file (`node --test <file>`);
    the 57 passing tests genuinely pass. The failures are *absent* tests,
    confirmed by exhaustive `test/` tree inspection, not by a flaky oracle.
  - Helper / oracle integrity: the evaluation procedure for the failed cases is
    "does the visible deterministic suite contain coverage for behaviour X";
    verified by direct source reading of every `test/*.test.ts` file and by
    keyword sweep. No evaluator-authored executable hidden test exists in this
    revision (by design — `.hidden-test/manifest.json` lists all-empty `tests`),
    so there is no helper to mis-fire.
  - Setup / teardown: not applicable to an absence-of-coverage finding; the
    positive regression run used the project's own `npm` scripts and Node test
    runner in the repository working directory.
  - Ruled out evaluator cause: static inspection confirms the authority code
    implements the missing-coverage behaviours, so the evaluator did not
    misjudge behaviour; it correctly reports missing *visible coverage* that
    AC29 and scope 18 mandate.
  - Ruled out specification cause: `spike.md` scope 18 is an explicit
    enumerated "must demonstrate at least" list; the "Spike 011 recovery proof"
    section is an explicit deliverable; no ambiguity.
  - Ruled out infrastructure cause: all five validation commands exit 0; the
    suite runs to completion.

## Overall Assessment

The implementation at `31be00b` does **not** satisfy the frozen Spike 012
machine-verifiable evaluation contract.

The correction-cycle authority, cycle-scoped completion state, evaluator
`repair` mode (skill v11), multi-finding human rejection, cycle-aware status
surface, and the Spike 012 evaluator bootstrap-authority binding are
implemented and are supported by passing static, provenance, and executable
evidence for `AC01`–`AC05`, `AC09`–`AC18`, `AC20`–`AC23`, `AC25`–`AC28`, and
`AC30` (several with documented reservations).

However, the visible deterministic regression suite omits coverage that the
frozen brief scope 18, the "Spike 011 recovery proof" section, and `AC29`
explicitly require:

- `AC06` — no Spike 011 recovery-proof regression fixture exists;
- `AC07` — no executable test that a `SPECIFICATION_CHANGE` /
  `OTHER_HUMAN_REJECTION` rejection cannot open a same-spike correction cycle;
- `AC08` — no test that a human-accepted cycle cannot be reopened;
- `AC19` — no executable test of the repair-blocks-onto-successor path;
- `AC24` — the corrected cycle's own PASS / promotion / As-Built / fresh
  human-decision sequence is not exercised;
- `AC29` — consequently, the "successor-boundary" behaviour family has no
  visible deterministic coverage, which its frozen decision rule makes a FAIL.

Classification: `IMPLEMENTATION_FAILURE`. The implementation retries against
this same frozen evaluator revision `001`; `prepare` is not rerun.

## Public Feedback

Sanitized public implementation feedback was emitted at
`spikes/012-correction-cycles-evaluator-repair/verification-feedback-002.md`.
It states the violated public requirements (scope 18 enumerated coverage, the
"Spike 011 recovery proof" deliverable, and AC06 / AC07 / AC08 / AC19 / AC24 /
AC29), the expected vs. observed public behaviour, the `IMPLEMENTATION_FAILURE`
classification, and safe diagnostics. It exposes no hidden evaluator mechanics;
this full result remains private until promotion.

## Note on verification-attempt numbering

The private `.eval/attempt-ledger.json` produced at `prepare` was initialized
empty and this evaluator session is the first to run the frozen evaluation
against a candidate. The host methodology authority
(`spikes/012-correction-cycles-evaluator-repair/workflow.jsonl`) had already
recorded a `verification-allocated` / `verification-finalized` pair for
verification attempt `1` (finalized `FAIL` / `IMPLEMENTATION_FAILURE` with an
all-`UNEVALUATED` coverage map, committed at `5e22ea9` — a host-level
finalization with no evaluator-produced immutable result, no private ledger
entry, and no public feedback artifact), and a `verification-allocated` for
verification attempt `2` at `31be00b` (committed at `248b420`). To keep the
verification-attempt identifier space monotonic and non-reused (`R21`), this
result is allocated as attempt `002`, matching the durable host allocation. The
private ledger carries no `001` entry because no evaluator verification `001`
was ever executed to completion; that gap is a process-integrity observation
about the earlier host-level finalization, not something this attempt can or
should retroactively reconstruct.
