# Spike 012 — Verification Feedback (attempt 002)

- Evaluator: `evaluator` verify mode, executed under the pinned Spike 012
  bootstrap evaluator contract `evaluator` v10
  (`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`,
  source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`), per the frozen
  `spike.md` bootstrap process exception. `skills/evaluator/SKILL.md` from the
  working tree was not used as grading authority.
- Implementation evaluated: `feat/spike-012` @ `31be00b`, implementation attempt
  `2`.
- Frozen evaluator revision: `001`
  (`sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`).
- Frozen inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
  `coverage-map.json`) all byte-identical to their frozen identities — no
  specification drift.

## Result

**FAIL — `IMPLEMENTATION_FAILURE`.**

Repository validation is green at the evaluated commit: `npm test` (57 pass / 0
fail), `npm run typecheck`, `npm run lint`, `npm run format:check`, and
`git diff --check` all exit 0; the pre-existing workflow-authority,
evaluator-integrity, host-owned workflow-run, and session/backend suites remain
green; the suite runs with no live paid provider call. Spikes 003–011 public
artifacts, promoted `evaluation/**`, and `workflow.jsonl` timelines are
byte-for-byte unchanged by `feat/spike-012`.

The correction-cycle authority, cycle-scoped completion state, evaluator
`repair` mode (skill contract version advanced to 11), structured multi-finding
human rejection, the cycle-aware `authority status` surface, and the Spike 012
evaluator bootstrap-authority binding at the workflow dispatcher and the
workflow-run host are all implemented, and the static/provenance/executable
evidence for `AC01`–`AC05`, `AC09`–`AC18`, `AC20`–`AC23`, `AC25`–`AC28`, and
`AC30` is passing.

Verification fails because the **visible deterministic regression suite omits
coverage that the frozen brief scope 18, the "Spike 011 recovery proof"
section, and `AC29` explicitly require**. The authority *code* implements the
behaviours below; what is missing is the mandated visible regression
materialization.

## Violated public requirements

### 1. `AC06` / `spike.md` "Spike 011 recovery proof" / `eval-requirements.md` TR7

- Expected: a deterministic visible regression fixture, derived from Spike 011's
  public preserved authority history through its existing `human-rejected` event
  (primary `IMPLEMENTATION_GAP`, secondary `EVALUATOR_COVERAGE_DEFECT`), that
  demonstrates the post-Spike-012 authority (1) interprets Spike 011's events as
  Cycle 001, (2) treats that rejection as eligible for same-spike Cycle 002, (3)
  determines a valid Cycle 002 opening requires both implementation correction
  and evaluator repair, and (4) keeps the Cycle 001 frozen brief and Design Map
  identities — without any write to `spikes/011-host-owned-workflow-runs/**`.
- Observed: no test in `test/` references Spike 011, reconstructs its authority
  history, or asserts those four conclusions. The correction-cycle test uses a
  synthetic `classification` + `secondaryFinding` rejection, not a Spike 011
  fixture.

### 2. `AC07` / `spike.md` scope 15, scope 18

- Expected: a visible test showing a `human-rejected` event classified
  `SPECIFICATION_CHANGE` cannot open a same-spike correction cycle (successor /
  new-brief path still required), and that an unqualified
  `OTHER_HUMAN_REJECTION` does not automatically authorize a correction cycle.
- Observed: no visible test exercises `SPECIFICATION_CHANGE` or bare
  `OTHER_HUMAN_REJECTION` rejection against correction-cycle opening. (The
  authority code implements this guard; the executable half of the criterion is
  missing.)

### 3. `AC08` / `spike.md` scope 1, scope 18

- Expected: a visible test that drives a cycle to `human-accepted` and then
  shows every `correction-cycle-opened` attempt from it refused.
- Observed: no visible test records `human-accepted` followed by a refused
  correction-cycle opening.

### 4. `AC19` / `spike.md` scope 9, 10, 15

- Expected: a visible test showing a repair that would require a materially new
  public testability seam or a new product requirement blocks and is classified
  onto the successor / methodology path (not a silent public-authority change),
  and that a repair which only swaps an insufficient evidence procedure for a
  stronger one establishing the same frozen criterion is allowed.
- Observed: the single repair test exercises only the authoritative-trigger and
  monotonic-revision requirements. No blocked repair, terminal blocked repair
  record, successor/methodology routing, or evidence-procedure-swap repair is
  exercised.

### 5. `AC24` / `spike.md` scope 13, scope 18

- Expected: after a legal `correction-cycle-opened`, a visible test showing the
  new cycle recording its own implementation handoff, verification allocation
  and PASS, promotion, As-Built, and a fresh human decision, each checked
  against that cycle's own prerequisites.
- Observed: the correction-cycle test opens Cycle 002 and records one Cycle 002
  `implementation-handoff`, then stops. No Cycle 002 verification, promotion,
  As-Built, or second human decision is exercised anywhere.

### 6. `AC29` / `spike.md` scope 18

- Frozen requirement: "Visible deterministic regression coverage exercises the
  correction-cycle, evaluator-repair, legacy-history, **and successor-boundary**
  behaviors without live paid-provider calls."
- Observed: the correction-cycle, evaluator-repair, and legacy-history families
  have visible coverage. The **successor-boundary** family does not
  (`SPECIFICATION_CHANGE` refusal, repair-blocks-to-successor, and accepted-cycle
  no-reopen are all absent — items 2, 3, 4 above). `AC29` therefore fails.

## What is required to pass

Add visible deterministic regression tests (no live paid provider calls;
deterministic fixtures per `eval-requirements.md` TR2) that materialize the
scenarios above. In particular, `spike.md` scope 18's enumerated list is a "must
demonstrate at least" contract; the items currently unmet are:

- a specification-changing rejection cannot open a correction cycle;
- a human-accepted cycle cannot be reopened;
- Spike-011-shaped primary + secondary rejection findings are recognized from a
  fixture derived from Spike 011's preserved public authority evidence (the
  "Spike 011 recovery proof" fixture);
- a repaired revision blocked path routes to the successor / methodology lineage
  when a new public seam or product requirement would be needed;
- a second human decision is possible only after the new cycle completes its own
  PASS / promotion / As-Built sequence.

Retry is against the same frozen evaluator revision `001`; `prepare` is not
rerun.
