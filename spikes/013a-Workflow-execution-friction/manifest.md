# Spike 013a Manifest

## Run 001 — Brief Readiness

- Skill: `brief-readiness` v3
- Input: working-tree `spike.md`
- Result: `Not ready to freeze`
- Output: `feedback.md`; immutable reviewed snapshot under `preliminary/001/`
- Operational outcome: the allocated `brief-readiness` attempt is recorded as
  `blocked` in `.workflow/state.json`; no canonical freeze authority was
  recorded.
- Repository evidence inspected: public workflow authority/runner and
  host-owned execution surfaces, evaluator invocation contract, visible
  workflow tests, and relevant public Spike 011–013 history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; relevant public-source and test inspection.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Brief Readiness (pre-freeze retry bootstrap)

- Skill: `brief-readiness` v3
- Input: revised working-tree `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
- Prior execution: host-owned `brief-readiness` attempt 1,
  run `d5f53a95-873b-4c13-b882-0f415839bc9f`, durably recorded as `blocked` in
  `.workflow/state.json`.
- Authority path: frozen pre-freeze retry bootstrap; this review retains the
  same pending methodology attempt and does not fabricate, delete, or rewrite
  operational runner history.
- Result: `Ready to freeze`
- Output: `feedback.md`
- Repository evidence inspected: revised brief and prior readiness evidence;
  public workflow authority, runner and host-run surfaces; evaluator invocation
  contract; visible workflow tests; and public Spike 011–013 history.
- Restricted evaluator material inspected: none.
- Checks: complete brief review; revision-to-prior-findings comparison;
  relevant public-source and visible-test inspection; `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Design Map (Spike 013a bootstrap exception)

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  with committed provenance `c543cae`.
- Authority path: direct host-owned allocation under the Spike 013a bootstrap
  exception. Canonical `brief-frozen` authority is the upstream source; no
  historical runner dispatch or completion was fabricated.
- Result: `READY`
- Output: `design-map.md`
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
- Repository evidence inspected: frozen brief and readiness result; public
  canonical and operational workflow state; public workflow authority, runner,
  host-run, backend and visible-test surfaces; prior public Design Maps; and
  `GOALS.md`.
- Restricted evaluator material inspected: none.
- Checks: frozen brief SHA-256 and Git provenance; Design Map boundary review;
  `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Evaluator Preparation

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  working-tree `skills/evaluator/SKILL.md` confirmed byte-identical)
- Input: frozen `spike.md`
  (`sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`)
  and frozen `design-map.md`
  (`sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`)
- Result: `Frozen` (evaluator revision `001`)
- Output: public `eval-requirements.md` and `coverage-map.json` (35 criterion
  records, all required, readiness attestation `integrityValidation: PASS`)
- Mandatory executable hidden coverage: 5 cases, each reusing the existing
  public `tools/workflow.ts` CLI seam; each exercised against the
  pre-implementation baseline before freeze (4 fail for their documented
  defect reason, 1 passes and is frozen as a non-regression control)
- Mandatory non-executable coverage: 12 procedures, spanning
  implementation-owned visible regression obligations, two reserved bounded
  live-provider fixtures (Claude, Codex), one host-boundary crossing
  requirement, and one composite readiness/provenance check, per the frozen
  brief's evidence requirements
- Pre-freeze structural integrity validation: `PASS`, 0 diagnostics; the
  final public `coverage-map.json` was additionally confirmed to validate
  against the repository's own `evaluation-prepared` authority-transition
  check via a disposable fixture
- Repository evidence inspected: public workflow-run/host/backend surfaces,
  the canonical `workflow.jsonl` authority engine and its CLI, the shared
  evaluator-integrity structural validator, existing public regression tests,
  and prior evaluator-preparation precedent (Spike 012)
- Restricted evaluator material inspected: none beyond this spike's own
  private evaluator workspace, which this run authored
- Checks: pinned-authority byte-identity confirmation; `npm test`,
  `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `git diff --check` all green at the preparation commit; five hidden tests
  individually exercised against the baseline; structural integrity
  validation; real-authority-validator acceptance of the public artifact
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Implementation

- Skill: `implementation` v3
- Input: frozen `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`,
  frozen `design-map.md`
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`,
  and committed public evaluator-preparation checkpoint `545a037`.
- Result: candidate implementation with host-owned execution bindings, semantic
  role-result validation, 013a pinned evaluator-authority enforcement, explicit
  canonical checkpoint adoption, and non-consuming dispatch planning.
- Restricted evaluator material inspected: none.
- Checks: `npm test` (62 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 006 — Evaluator Verification (attempt 001)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit
  `33fa7c44adfab2164a07d949431857f620e0a816` (attempt 1), all frozen public
  inputs confirmed byte-identical to their frozen identities (no
  specification drift)
- Result: `FAIL` (`IMPLEMENTATION_FAILURE`), attempt `001`
- Output: `verification-feedback-001.md`
- Mandatory executable hidden coverage: 5 cases exercised; 3 pass, 2 fail. One
  case required an in-attempt evaluator correction (a construction defect
  exposed by the candidate's own correct fix elsewhere) before its result
  could be trusted; both the original and corrected forms reach the same
  conclusion for this candidate
- Mandatory non-executable coverage: exercised via diagnostic probes against
  the real allocation/authorization code paths and one bounded, real,
  live-provider fixture executed end-to-end through a real local Harness host
  to the real Codex executor. The paired Claude live-provider scenario was
  not attempted this attempt: a diagnostic probe found no safe, isolated
  fixture target exists under the current implementation, and the human
  operator declined the risk of using real production spike state instead; its
  two criteria are recorded `BLOCKED`, not passed via a substitute
- Repository evidence inspected: the full implementation diff against the
  frozen pre-implementation commit, the real workflow-run allocation and
  registry code, and the live fixture's own process output
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read and, for one case, corrected under the post-implementation
  evaluator-repair rules)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (62 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `git diff --check` all green at the implementation
  commit; structural integrity re-validation after the in-attempt correction
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Implementation Retry (attempt 002)

- Skill: `implementation` v3
- Input: unchanged frozen `spike.md`
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`,
  unchanged frozen `design-map.md`
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`,
  unchanged public `eval-requirements.md`
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`,
  unchanged `coverage-map.json`
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`,
  and sanitized public `verification-feedback-001.md` from evaluator revision
  `002`.
- Result: candidate retry with host-resolved repository contract identities and
  delivery modes, workflow-owned canonical evaluator delegation, automatic
  structured provider role results, linked non-successful execution retries,
  and evidence-aware authority transition availability.
- Candidate content identity before this manifest entry:
  `sha256:a4e53b00aefbe2754cb2f831f273e612ceb671f2f08f446c77f5c24cfeb4a6f2`
  (Git binary diff for the implementation, visible tests and implementation
  report against the prior public checkpoint, excluding unrelated work and this
  manifest).
- Restricted evaluator material inspected: none.
- Checks: `npm test` (69 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` all pass. Mandatory live
  Claude/Codex provider verification remains allocated to independent evaluator
  verification and was not claimed by implementation.
- Measurement cutoff: immediately before this manifest update.

## Run 008 — Evaluator Verification (attempt 002)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit
  `05bc7d9e47d58f35734c8e158eafd43b153e38e2` (attempt 2), all frozen public
  inputs confirmed byte-identical to their frozen identities (no
  specification drift)
- Result: `BLOCKED` (`INFRASTRUCTURE_FAILURE`), attempt `002`. Evaluator
  revision `002` unchanged; no correction needed this attempt.
- Output: `verification-feedback-002.md`
- Mandatory executable hidden coverage: 5/5 pass, including both cases that
  failed in attempt 001
- Mandatory non-executable coverage: 32 of 35 mandatory criteria confirmed
  satisfied this attempt, including every criterion that failed in attempt
  001, via diagnostic probes against the real allocation/authorization code
  and two further bounded, real, live-provider fixtures executed end-to-end
  through a real local Harness host to the real Codex executor (one
  confirming rejection of unverified contract claims and fully automatic,
  unattended semantic role-result reporting with no manual step). The
  remaining 3 criteria - the paired live-Claude scenario and the Spike 011
  readiness claim that depends on it - are `BLOCKED`: this evaluator's own
  execution environment declined to launch the required Claude agent
  process, a session-level restriction external to the candidate
  implementation
- Repository evidence inspected: the full implementation diff against the
  prior attempt, the real workflow-run allocation and registry code, and
  both live fixtures' own process output
- Restricted evaluator material inspected: this spike's own private
  evaluator workspace (read only; no correction was needed)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (69 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `git diff --check` all green at the implementation
  commit; repository state confirmed unchanged by both live fixtures
- Measurement cutoff: immediately before this manifest update.

## Run 009 — Evaluator Verification (attempt 003)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `05bc7d9e47d58f35734c8e158eafd43b153e38e2`
  (unchanged from attempt 002 — confirmed no source changes since)
- Result: `FAIL` (`IMPLEMENTATION_FAILURE`), attempt `003`. Evaluator
  revision `002` unchanged; no correction needed.
- Output: `verification-feedback-003.md`
- Basis: new live-provider evidence gathered outside this evaluator's own
  execution environment (which had declined to launch the required agent
  process in attempt 002) was independently corroborated against primary,
  session-level artifacts before being treated as admissible, then applied
  to the three criteria attempt 002 left `BLOCKED`
- Mandatory coverage this attempt: 32 of 35 mandatory criteria remain
  satisfied, re-confirmed against the unchanged implementation. The 3
  criteria previously `BLOCKED` are now `FAIL`: two independent, replicated,
  real live-Claude executions through the candidate's actual delegated-role
  dispatch path both resulted in refusal
- Repository evidence inspected: independent corroboration of the new
  evidence's provenance; full re-run of mandatory executable coverage and
  the public regression suite against the unchanged implementation
- Restricted evaluator material inspected: this spike's own private
  evaluator workspace (read only; no correction was needed)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (69 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `git diff --check` all green; repository state
  confirmed unaffected by the newly-corroborated evidence
- Measurement cutoff: immediately before this manifest update.

## Run 010 — Implementation characterization after verification 003

- Skill: `implementation` v3.
- Input: implementation `05bc7d9e47d58f35734c8e158eafd43b153e38e2`, complete
  public verification feedback 003 (and prior feedback), unchanged frozen brief
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`,
  Design Map
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`,
  evaluation requirements
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`,
  and coverage map
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`.
- Result: BLOCKED at provider characterization. Claude Code 2.1.270 received
  appended and native-agent context but refused the synthetic protected role
  through both mechanisms. A defensible trusted delivery boundary was not
  established. No candidate or implementation handoff; evaluator revision 002,
  evaluator protection, production source, tests, and prior evidence unchanged.
- Output: `claude-characterization-003.md`
  `sha256:e1e8a87eac8b62cd6e431990d5b330a6d4f116d198b9cba2421d9420e8133484`;
  `claude-characterization-003.json`
  `sha256:7cb21e9903f74c3494123243dedd03f1eba604c87bb22ae9fcf6a1d34293e16b`.
- Checks: seven completed bounded Claude characterization calls; two initial
  sandboxed calls timed out. Provisional public regression failed as expected
  at missing provider delivery mode, then was withdrawn with the unproven
  design. JSON parses; repository formatting check and `git diff --check` pass;
  source/test/skill diff confirmed empty. Full tests, typecheck and lint were
  not rerun because no implementation change survived characterization.
- Restricted evaluator material inspected: none. LP1 was not exercised.
- Measurement cutoff: immediately before this manifest update.

## Run 011 — Direct role versus Skill characterization

- Skill context: `implementation` v3; characterization only, with production
  implementation and handoff explicitly deferred by the user.
- Input: prior characterization checkpoint
  `7e88d9a01857925e286c2afbea3e2dca6a8b96b4`, user-specified probes A–E,
  unchanged evaluated implementation
  `05bc7d9e47d58f35734c8e158eafd43b153e38e2`, and unchanged frozen authority.
- Result: Conclusion 3, bounded to Claude Code 2.1.270. Protected invocation
  controls refused. Direct execution with the wrapper present read both markers
  but rejected role reporting; with the wrapper absent it refused. A separate
  metadata-free contract also refused. No successful semantic role result;
  no provider/environment availability failure. No candidate or handoff.
- Output: `characterization-004/report.md`
  `sha256:0a8fac5f2ecaebe4b646cad98cc46ef29ac67ae251f385925f4a1c6091febadf`;
  `characterization-004/evidence.json`
  `sha256:e82129a414988fc03cda3088954c180b0ad9eae1d439a64934e69853f61f44cc`;
  `characterization-004/run.py`
  `sha256:fa75430852bfb3411094139f90e3eef1e7c3b126d9d9b4d2e85dbb407f3659de`.
- Checks: five completed provider calls, all exit 0; exact A–D contract identity
  and C/D command equality verified; provider Skill discovery confirmed;
  tool calls and filesystem access corroborated C's reads; zero fixture write
  events and unchanged file snapshots for all calls. Existing semantic-result
  parser accepted A/B/E refusals and rejected C/D missing final results.
  Evidence invariants, repository formatting, and `git diff --check` pass.
  Full tests, typecheck, and lint were not rerun: source/tests/skills and
  canonical Spike 013a authority are unchanged.
- Restricted evaluator material inspected: none. LP1 and evaluator revision 002
  were untouched. Only the synthetic wrapper moved between probes; the real
  evaluator invocation protection remains unchanged.
- Measurement cutoff: immediately before this manifest update.
