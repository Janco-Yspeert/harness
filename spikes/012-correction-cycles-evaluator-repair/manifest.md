# Spike 012 Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Input: `spike.md` at `git:b7f442aed5d5cfe2722aec40f2fab0eb059e2884`
- Result: `Ready to freeze`
- Output: `feedback.md`
- Repository evidence inspected: public workflow authority/runner and
  evaluator-integrity implementation, visible workflow/evaluator tests, and
  public Spike 011 recovery history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; relevant public-source and test inspection.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Design Map

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
- Result: shared contract established
- Output: `design-map.md`
- Key decision: `correction-cycle-opened` and
  `evaluator-repair-recorded` are forward-only authority bindings; Spike 012's
  evaluator uses an exact committed pre-implementation skill snapshot as its
  operative instruction source.
- Checks: frozen brief provenance and relevant public workflow/evaluator
  contracts inspected; `git diff --check` passed.
- Measurement cutoff: immediately before this manifest update.

## Bootstrap Exception — Runner-State Adoption Gap

- Public authority already contained valid `brief-frozen` and
  `design-map-frozen` checkpoints before any local `.workflow/state.json`
  existed. The local runner cannot adopt them without fabricating history or
  repeating completed semantic roles.
- Authorized handling: remaining Spike 012 roles are allocated directly through
  the Harness host-owned workflow-run surface. `workflow.jsonl` remains the
  only methodology authority; no `.workflow` history was created.
- Evaluator-preparation execution `2662cb4a-dc2f-4192-919d-6c2f031f9f78`
  (Codex, bootstrap evaluator v10
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`)
  terminally failed before work when the installed Codex CLI rejected the
  obsolete bounded approval flag.
- Its host-owned replacement
  `86938621-621e-4479-af79-e35ae704cb13` (Claude, same evaluator authority)
  also terminally failed before work because the backend passed the prompt as
  an argument to Claude's variadic `--add-dir` option. Both run identities,
  terminal dispositions, and replacement provenance remain host records.
- The narrow workflow-backend compatibility repair is necessary before another
  host-owned evaluator execution can exist; it does not reconstruct runner
  state or change frozen methodology authority.

## Run 003 — Evaluator Preparation Dispatch Blocked

- Role: `evaluator-prepare`, direct Harness-host allocation under the approved
  Spike-012 runner-state exception.
- Bootstrap evaluator: `evaluator` v10 from
  `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`,
  `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`.
- Canonical Claude run `c47c7a56-14fe-496a-b7dd-56b46d08e5e8` completed with
  no evaluator artifacts or authority transition. It followed replacement
  `9c7d3201-915d-4df7-8fa7-44324d03f233`, which likewise completed without
  preparing evaluation; both logs show the executor refusing to perform the
  configured user-invoked evaluator role.
- Earlier operational records remain preserved: Codex run
  `2662cb4a-dc2f-4192-919d-6c2f031f9f78` failed on an obsolete CLI flag;
  Claude run `86938621-621e-4479-af79-e35ae704cb13` failed on prompt parsing;
  run `9b6293a6-4667-42a7-b2a3-f6d2752e0241` was cancelled after its child
  exited without the old backend recording a terminal event.
- Result: `BLOCKED` — repeated evaluator-executor policy refusal. No private
  evaluator artifact, public evaluation artifact, `.workflow` history, or
  `evaluation-prepared` authority event was fabricated.
- Required recovery: invoke the evaluator through its configured user-triggered
  entry point, or explicitly change that executor configuration. This is a
  runner/executor integration finding, not a specification or implementation
  failure.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Evaluator Prepare

- Skill: `evaluator` v10 (prepare mode), executed through the configured
  user-triggered entry point under the frozen `spike.md` bootstrap process
  exception. At the preparation commit
  `6f46363053e4e8c48054599439e52747ba595239` the working-tree
  `skills/evaluator/SKILL.md` is byte-identical to
  `bootstrap/evaluator-skill.md`
  (`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`),
  so preparation already ran the pinned pre-implementation evaluator contract.
- Result: evaluator revision `001` frozen; pre-freeze integrity validation
  passed.
- Frozen inputs: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
  (`a3742a8`) and `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`
  (`6b83954`).
- Public outputs: `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`;
  `coverage-map.json`
  `sha256:3af9e8ccaa25f0f1767c11170556f169676e182be20d05fe68b1384ff6f8976c`
  (30 criterion records AC01-AC30 + readiness attestation + bootstrap-authority
  binding).
- Evaluation shape: 32 evaluator procedures (23 public executable regression
  materialized by the implementation's own visible suite per AC29, 6 static
  inspection, 3 provenance inspection); 0 evaluator-authored executable hidden
  tests — the frozen Design Map leaves the authority representation, status
  shape, repair-record format, executor wiring, and fixture location as
  implementation freedom and the brief mandates visible deterministic coverage.
- Pre-freeze integrity validation: PASS. Mechanical
  `tools/evaluator-integrity.ts` over the prepared coverage bundle (30 criteria,
  32 procedures) returned `status: PASS` with empty diagnostics; a supplementary
  deterministic checklist covered physical file existence, content-hash
  recomputation, public/private consistency, and confirmed no verification
  attempt was allocated during `prepare`.
- Controlled pre-implementation baseline: `npm test` 53/53; `npm run typecheck`,
  `npm run lint`, `npm run format:check`, `git diff --check` clean; no
  correction-cycle authority transition, no `evaluator-repair-recorded`
  transition, no cycle-scoped authority state, and no evaluator `repair` mode
  exist at `6f46363`; Spikes 003-011 public artifacts and timelines unchanged by
  `feat/spike-012`.
- Bootstrap boundary: the frozen evaluator freeze binds the pinned
  bootstrap-authority identity `sha256:fa8168a3...c38b` (`evaluator` v10, source
  commit `b7f442ae`); the Spike 012 verification result must bind the same
  identity, and the newly implemented `repair` mode / correction-cycle authority
  are implementation under test, not Spike 012's grading authority.
- Restricted evaluator material inspected: this cycle's own private bundle only.
- Blocking questions: none.
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Implementation

- Skill: `implementation` v3.
- Frozen inputs: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`;
  public `coverage-map.json`
  `sha256:3af9e8ccaa25f0f1767c11170556f169676e182be20d05fe68b1384ff6f8976c`.
- Result: implemented pinned Spike-012 bootstrap evaluator invocation,
  correction-cycle authority, and evaluator repair v11.
- Bootstrap authority: deterministic command resolution rehashes the committed
  v10 snapshot `sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`
  and its source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`, supplies
  that material as host-run verification authority, and does not resolve the
  current evaluator skill for Spike 012 prepare/verify.
- Visible regression coverage: bootstrap provenance/invocation, legacy Cycle
  001 interpretation, repairable Cycle 002 opening and cycle-local completion
  state, and evaluator-defect-triggered revision repair lineage.
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `npm test` (56 passing), and `git diff --check`.
- Restricted evaluator material inspected: none. No implementation handoff or
  `.workflow` history was created.
- Measurement cutoff: immediately before this manifest update.

## Run 006 — Implementation Attempt 002

- Skill: `implementation` v3.
- Frozen inputs: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`.
- Result: fixed the direct host `POST /workflow-runs` allocation path for
  Spike 012 `evaluator-verify`. The host now reads and validates the committed
  bootstrap authority and evaluator-skill snapshot, hashes the snapshot and
  pinned Git source object, rejects caller authority/skill mismatches, and
  persists the non-null canonical verification authority in its run record.
- Outputs: `src/workflow-run.ts`
  `sha256:748b633ca956238edf1819b6f175c9893cb8475988ec1962c1e48a0cd3084590`;
  `test/workflow-run.integration.test.ts`
  `sha256:a24ecc97c3ac85959024fea33379e56c488a53b7c1c7a1f6ad12f20557cc002d`.
- Verification: provider-free direct-HTTP regression passed; full suite passed
  serially as `npm test -- --test-concurrency=1` (57 passing); `npm run
  typecheck`, `npm run lint`, `npm run format:check`, and `git diff --check`
  passed. The default parallel `npm test` invocation could not complete in the
  sandbox, where each test file failed during concurrent host startup without
  diagnostics; the same complete suite passed under Node's supported serial
  concurrency option.
- Restricted evaluator material inspected: none. Attempt 001 remains finalized
  FAIL; no evaluator repair/correction cycle, authority handoff, or `.workflow`
  state was created.
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Evaluator Verify (attempt 002)

- Skill: `evaluator` verify mode, executed under the frozen `spike.md` bootstrap
  process exception against the pinned pre-implementation evaluator contract
  `evaluator` v10
  (`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`,
  source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`). The
  post-implementation `skills/evaluator/SKILL.md` was not used as grading
  authority; the newly implemented `repair` mode and correction-cycle authority
  were treated only as implementation under test.
- Implementation evaluated: `feat/spike-012` @
  `31be00bae7e76a314edc0cbdaecc0362bfd57814`, implementation attempt 2.
- Frozen evaluator revision: `001`, canonical identity
  `sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`.
- Frozen inputs verified byte-identical at the evaluated commit: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`;
  `coverage-map.json`
  `sha256:3af9e8ccaa25f0f1767c11170556f169676e182be20d05fe68b1384ff6f8976c`. No
  specification drift; no frozen evaluator material modified during
  verification.
- Result: **FAIL**, classification `IMPLEMENTATION_FAILURE`.
- Aggregate: 30 frozen acceptance criteria; 24 satisfied, 6 materially
  unsatisfied (`AC06`, `AC07`, `AC08`, `AC19`, `AC24`, `AC29`). 0 evaluator
  defects, 0 specification ambiguities, 0 infrastructure failures, 0
  specification drift.
- Repository validation at the evaluated commit (all green): `npm test`
  (57 pass / 0 fail), `npm run typecheck`, `npm run lint`, `npm run
  format:check`, `git diff --check` all exit 0; the pre-existing
  workflow-authority, evaluator-integrity, host-owned workflow-run, and
  session/backend suites remain green; the suite runs with no live paid provider
  call. Spikes 003–011 public artifacts, promoted `evaluation/**`, and
  `workflow.jsonl` timelines are byte-for-byte unchanged by `feat/spike-012`.
- Failure summary: the correction-cycle authority, cycle-scoped completion
  state, evaluator `repair` mode (skill contract version advanced to 11),
  structured multi-finding human rejection, cycle-aware status surface, and the
  Spike 012 evaluator bootstrap-authority binding are implemented, but the
  visible deterministic regression suite omits coverage that frozen `spike.md`
  scope 18, the "Spike 011 recovery proof" section, and `AC29` explicitly
  require: no Spike 011 recovery-proof fixture (`AC06`); no executable coverage
  that a `SPECIFICATION_CHANGE` / `OTHER_HUMAN_REJECTION` rejection cannot open a
  correction cycle (`AC07`); no test that a human-accepted cycle cannot be
  reopened (`AC08`); no executable coverage of the repair-blocks-to-successor
  path (`AC19`); the corrected cycle's own PASS / promotion / As-Built /
  fresh-human-decision sequence is not exercised (`AC24`); and consequently the
  "successor-boundary" behaviour family has no visible deterministic coverage
  (`AC29`).
- Public feedback: `verification-feedback-002.md`.
- Promotion: none (result is not PASS). Implementation retries against the
  unchanged frozen evaluator revision `001`; `prepare` is not rerun.
- Restricted evaluator material inspected: this cycle's own frozen bundle only.
- Measurement cutoff: immediately before this manifest update.

## Run 008 — Implementation Attempt 003

- Skill: `implementation` v3.
- Frozen inputs remained unchanged: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`.
- Result: added provider-free deterministic authority regressions for the six
  public verification findings: an isolated fixture reconstructed from public
  Spike 011 Cycle 001 evidence; specification-changing and bare `OTHER` human
  rejection refusal; accepted-cycle no-reopen; terminal blocked repair routed to
  successor lineage while an evidence-procedure-only repair remains legal; and
  Cycle 002's own handoff, verification PASS, promotion, As-Built, and fresh
  human decision.
- Output identities: `tools/workflow.ts`
  `sha256:e3d8567eae1f32ba05724eebe5ebe9048fa58a592b021f21e6d479caa4b9e0db`;
  `test/workflow.test.ts`
  `sha256:c5b9675e3ee2708d7aac474fb829bcdd6a379f95b60e4d1cc86aeffea776fd64`.
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `git diff --check`, and `npm test -- --test-concurrency=1` (61 passing) all
  passed. No test requires a live provider.
- Restricted evaluator material inspected: none. No evaluator revision,
  frozen authority, evaluation artifact, Spike 012 correction-cycle/repair
  event, or implementation handoff was changed or recorded.
- Measurement cutoff: immediately before this manifest update.

## Run 009 — Evaluator Verify (attempt 003)

- Skill: `evaluator` verify mode, executed under the frozen `spike.md` bootstrap
  process exception against the pinned pre-implementation evaluator contract
  `evaluator` v10
  (`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`,
  source commit `b7f442aed5d5cfe2722aec40f2fab0eb059e2884`). The
  post-implementation `skills/evaluator/SKILL.md` was inspected only as
  implementation-under-test for the frozen static cases, never as grading
  authority; the newly implemented `repair` mode and correction-cycle authority
  were not used to grade, repair, recover, or certify this cycle.
- Implementation evaluated: `feat/spike-012` @
  `8c379025b5c4f99b464e0d03c8c15773c5a84acc`, implementation attempt 3.
- Frozen evaluator revision: `001`, canonical identity
  `sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`.
- Frozen inputs verified byte-identical at the evaluated commit: `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  `eval-requirements.md`
  `sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`;
  `coverage-map.json`
  `sha256:3af9e8ccaa25f0f1767c11170556f169676e182be20d05fe68b1384ff6f8976c`. No
  specification drift; no frozen evaluator material modified during
  verification.
- Result: **PASS**.
- Aggregate: 30 frozen acceptance criteria, all 30 satisfied; 32 evaluation
  procedures (E1–E23, S1–S6, P1–P3), all pass. 0 evaluator defects, 0
  specification ambiguities, 0 infrastructure failures, 0 specification drift. 7
  documented reservations concerning test-assertion depth within the frozen
  Design Map's representation freedom; none meets a frozen decision rule for a
  FAIL.
- Repository validation at the evaluated commit (all green): `npm test`
  (61 pass / 0 fail), `npm run typecheck`, `npm run lint`, `npm run
  format:check`, `git diff --check` all exit 0; the pre-existing
  workflow-authority, evaluator-integrity, host-owned workflow-run, and
  session/backend suites remain green; the suite runs with no live paid provider
  call. Spikes 003–011 public artifacts, promoted `evaluation/**`, and
  `workflow.jsonl` timelines are byte-for-byte unchanged by `feat/spike-012`.
- Closes the six criteria that attempt 002 recorded as `IMPLEMENTATION_FAILURE`
  (`AC06`, `AC07`, `AC08`, `AC19`, `AC24`, `AC29`) via four new visible
  deterministic tests plus a bounded blocked-repair authority path traceable to
  frozen brief scope 9–11, 15.
- Promotion: performed in Run 010 after explicit user confirmation. Human product
  acceptance remains a separate, later gate.
- Restricted evaluator material inspected: this cycle's own frozen bundle only.
- Measurement cutoff: immediately before this manifest update.

## Run 010 — Evaluation Promotion

- Trigger: finalized PASS of verification attempt `003` (Run 009), promoted with
  explicit user confirmation. No new verification attempt was allocated.
- Skill: `evaluator` (v10 pinned bootstrap contract) promotion procedure.
- Overall promoted result: **PASS**; passing attempt `003`
  (`git:8c379025b5c4f99b464e0d03c8c15773c5a84acc`).
- Evaluator revision `001`
  (`sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`):
  eligible as an all-or-nothing bundle and promoted; `notPromotedRevisions`
  empty.
- Public layout under `spikes/012-correction-cycles-evaluator-repair/evaluation/`:
  `attempt-ledger.json`; `attempts/002/eval-result.md` (FAIL, retained) and
  `attempts/003/eval-result.md` (PASS), copied byte-for-byte; `freeze/001.json`
  (byte-for-byte copy of the frozen evaluator-revision metadata);
  `revisions/001/` (`eval-spec.md`, `criterion-records.md`, `case-manifest.json`,
  `manifest.json`, `pre-freeze-integrity-checklist.md` — the exact frozen
  bundle); and newly generated `promotion.json`.
- Integrity check: the SHA-256 of every promoted historical file was recomputed
  and equals its recorded source identity; the canonical revision identity
  (`sha256` of `freeze/001.json`) equals both attempts' recorded
  evaluator-revision identity and the private ledger; every `freeze/001.json`
  artifact identity equals the corresponding `revisions/001/` file; every ledger
  `resultIdentity` equals its promoted result file. No mismatch. `promotion.json`
  is the only newly generated artifact; no historical artifact was edited,
  normalized, or regenerated.
- The `spikes/` tree is `.prettierignore`d; promoted artifacts are exempt from
  `format:check` / lint.
- Promoted evaluation is committed and pushed separately from implementation.
- Measurement cutoff: immediately before this manifest update.

## Run 011 — As-Built

- Skill: `as-built` v2.
- Inspected implementation: `feat/spike-012` @
  `8c379025b5c4f99b464e0d03c8c15773c5a84acc` (implementation attempt 3),
  together with the subsequent authority-only handoff/allocation/finalization
  records and the canonical promoted evaluation.
- Inputs: frozen `spike.md`
  `sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`;
  frozen `design-map.md`
  `sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`;
  promoted evaluator revision `001`
  `sha256:db248e53dd0466d7d43ae682dbbb4f9fe08537b64a1536e971341d919bfd09f6`;
  promoted verification attempt `003` PASS.
- Result: `as-built.md` records the implemented correction-cycle authority,
  evaluator v11 repair boundary, pinned-v10 bootstrap invocation path, visible
  provider-free regression coverage, and the Spike 011 non-mutation boundary.
  No Missing, Contradictory, or material Extra behavior was observed against the
  promoted frozen contract.
- Evidence retained: the promoted evaluation keeps verification attempt `002`
  FAIL and attempt `003` PASS; it does not rewrite either result or evaluator
  revision. The bootstrap runner-state adoption exception remains in force only
  as recorded process evidence; no `.workflow` history was fabricated.
- Restricted evaluator material inspected: promoted public evaluation artifacts
  only.
- Checks: inspected the exact candidate diff, surrounding authority/host/evaluator
  sources, visible regression evidence, promoted verification result, and
  promotion inventory; `git diff --check` passed.
- Measurement cutoff: immediately before this manifest update.
