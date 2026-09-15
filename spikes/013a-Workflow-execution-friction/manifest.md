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

## Run 012 — Claude protected execution correction (implementation attempt 3)

- Skill: `implementation` v3.
- Inputs: characterization checkpoint
  `22203ccfe17af8e5ca57c09d2613027cf9f4ebc3`; user-authorized clean-role
  characterization result on Claude Code 2.1.270; public verification feedback
  003 against implementation `05bc7d9e47d58f35734c8e158eafd43b153e38e2`;
  unchanged frozen brief, Design Map, evaluation requirements and coverage-map
  identities recorded in Run 010 and rechecked against committed provenance.
- Governing evaluator: revision `002`, unchanged. Historical revision-001
  provenance discrepancies deliberately untouched. No evaluator preparation,
  verification, promotion or private-material access.
- Result: IMPLEMENTED; fresh candidate for independent evaluation. Host-captured
  contract bytes reach protected delegated Claude through replacement system
  context. The host alone selects this delivery after canonical validation.
  Clean provider configuration, capability-derived tools, declared workspaces,
  unchanged semantic parsing and protected human Skill preserved. Codex and
  ordinary Claude retain their existing execution behavior.
- Output: `implementation-report.md`, `adapter-characterization-005/`, three
  production source files, the workflow CLI and two public test files.
  Aggregate output identity `sha256:a98a5448c5d29f98b0e9b6a78d9a3e2256a5354ec53d4eb034cbb71d5ca4e60b` is SHA-256 of a compact,
  key-sorted JSON map from the following repository-relative paths to their
  SHA-256 byte identities (UTF-8; separators comma and colon; no final newline):
  - `spikes/013a-Workflow-execution-friction/adapter-characterization-005/evidence.json`
  - `spikes/013a-Workflow-execution-friction/adapter-characterization-005/report.md`
  - `spikes/013a-Workflow-execution-friction/adapter-characterization-005/run.mjs`
  - `spikes/013a-Workflow-execution-friction/implementation-report.md`
  - `src/claude-workflow.ts`
  - `src/workflow-backend.ts`
  - `src/workflow-run.ts`
  - `test/workflow-run.integration.test.ts`
  - `test/workflow.test.ts`
  - `tools/workflow.ts`
- Verification: initial focused regression failed on the old delivery mode;
  final full suite 69/69 passed, typecheck, lint, format:check and diff checks
  passed. Final source/test/CLI diff reviewed for unrelated provider changes.
  Frozen input hashes and evaluator Skill/bootstrap diff remain unchanged.
- Live evidence: two bounded synthetic adapter iterations succeeded on Claude
  Code 2.1.270; final run retained in `adapter-characterization-005/evidence.json`.
  Final host run `1a02c10c-d16e-4932-87c6-817f5d0e1d2f` returned succeeded,
  observed host elapsed time 7385 ms. Both fresh marker contents reported;
  zero observed workspace changes and identical snapshots. Unauthorized request
  returned HTTP 400 before launch. No LP1 consumed.
- Limitations: full frozen evaluator command/write permission sufficiency and
  original refusal resolution remain for LP1. No blanket Bash approval or
  unrestricted permission bypass was introduced. Managed host policy remains
  applicable. The pre-existing Spike 011 ledger edit is excluded.
- Measurement cutoff: immediately before this manifest update. Candidate commit
  and canonical handoff follow; they are not part of the measurements above.

## Run 013 — Claude unattended command correction (implementation attempt 4)

- Skill: `implementation` v3.
- Inputs: candidate `77a23e89ef4718d2c93506c01ed42e0634109ecd`,
  verification-attempt-004 runtime observation, unchanged frozen brief and
  Design Map, pinned evaluator bootstrap v11
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
  and the user's three-workspace scratch clarification. Evaluator revision,
  allocation evidence and verification attempt 4 were not changed or finalized.
- Result: IMPLEMENTED; fresh candidate for independent evaluation. Protected
  delegated Claude derives bounded command-family approvals from the evaluator
  capabilities and layers them inside a mandatory strict OS sandbox. The local
  backend creates candidate, private-evaluator and unique run-scratch runtime
  workspaces, routes temp/cache state to scratch, exposes scratch diagnostically
  and removes it on exit. Unsandboxed retry, excluded commands, bare Bash and
  permission bypass remain disabled.
- Output: `implementation-report.md`, `adapter-characterization-006/`, four
  production source files and one public test file. Aggregate output identity
  `sha256:38e4084ae0b62069a0d65c44d8dfd5caf6eef8de816f1d2e40ab413ab38c04a8`
  is SHA-256 of a compact key-sorted JSON map from those nine repository-relative
  paths to their SHA-256 byte identities.
- Live evidence: Claude Code 2.1.270 production-adapter run
  `12f9570f-fae9-4137-95e3-47e6d5b03622` returned host-validated `succeeded`
  in 25,848 ms. Git status/diff/show, npm test, typecheck, private bookkeeping
  and scratch writes ran unattended; an undeclared `/tmp` sibling was masked;
  the candidate stayed clean; and scratch was absent after exit. No LP1 or
  evaluator verification ran.
- Verification: `npm run check` passed typecheck, lint, format and 70/70 tests;
  `git diff --check` passed; characterization evidence JSON parses. One prior
  full-check invocation lost six Node test workers and hung without diagnostics;
  clean standalone and full-suite reruns passed. Frozen bootstrap/source Skill
  hashes and `disable-model-invocation: true` were rechecked unchanged. Codex
  construction and semantic result parsing regressions remain green.
- Host prerequisite: Claude strict sandboxing requires Ubuntu `bubblewrap` and
  `socat`. This host lacks system `socat`; the live probe used a package extracted
  only into `/tmp`. Production fails closed until the host installs it.
- Restricted evaluator material inspected: none. The pre-existing Spike 011
  ledger edit was preserved and excluded.
- Measurement cutoff: immediately before this manifest update. The candidate
  commit follows and is not included above. Canonical `implementation-handoff`
  cannot yet be recorded: the protected authority reports no human rejection
  opening a new implementation attempt after attempt 6's `BLOCKED` result.

## Run 017 — Authority-status AC27 correction

- Skill: `implementation` v3. Restricted evaluator material inspected: none.
- Finding: full-evidence validation of attempt-5 `implementation-handoff`
  against `cfa33cf` returned allowed. The prior status result was a display
  defect: it validated with empty evidence and mistook the missing `commit` for
  a structural prohibition.
- Result: status now classifies the common missing-evidence validation outcome
  as `available-requires-evidence`, while retaining `unavailable` for genuine
  structural failure and existing correction-cycle behavior. Public regression
  covers a finalized `BLOCKED` verification, next handoff availability, valid
  handoff evidence, and an unavailable promotion transition.
- Verification: `test/workflow.test.ts` 21/21; typecheck, lint, formatting and
  diff checks pass. The aggregate `npm test` invocation still exits non-zero
  without diagnostics in this environment while individual test files pass.
- Measurement cutoff: immediately before this manifest update. The attempt-5
  candidate commit and canonical handoff/allocation follow and are not included.

## Run 014 — Evaluator Verification (attempt 004)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `3edb31603c1b97eb4f2d52b56c52d4965962113d`
  (implementation attempt 4), all frozen public inputs confirmed byte-identical
  to their frozen identities (no specification drift)
- Result: `BLOCKED` (`INFRASTRUCTURE_FAILURE`), attempt `004`. Evaluator
  revision `002` unchanged; no correction needed.
- Output: `verification-feedback-004.md`
- Mandatory executable hidden coverage: 5/5 pass (fresh run against this
  commit)
- Mandatory non-executable coverage: 33 of 35 mandatory criteria confirmed
  satisfied this attempt, re-confirmed fresh where affected and cited by
  reference for the unaffected Codex-path criteria. The paired live-Claude
  scenario and the Spike 011 readiness criterion that depends on it remain
  `BLOCKED`: this evaluator attempted the full frozen live-Claude fixture
  procedure for real against this exact candidate (a disposable fixture
  spike, a real locally started Harness host, a genuine allocation, a genuine
  process-launch attempt), and the required Claude executor was confirmed
  unavailable in this session's own environment (`spawn claude ENOENT`) - a
  session-level restriction external to the candidate implementation
- Repository evidence inspected: the full implementation diff against the
  prior attempt, the real workflow-run allocation/registry/backend code, and
  this attempt's own real fixture-allocation output
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read only; no correction was needed)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (70/70), `npm run typecheck`, `npm run lint`, and
  `git diff --check` all green at the implementation commit; `npm run
  format:check` confirmed clean when scoped to exactly the Git-tracked file
  set (the unscoped invocation reports a non-zero exit solely due to
  permission-masked, untracked, non-repository scaffolding entries specific to
  this evaluation session, unrelated to the candidate)
- Measurement cutoff: immediately before this manifest update.

## Run 015 — Evaluator Verification adjudication (attempt 005 / canonical attempt 006)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `3edb31603c1b97eb4f2d52b56c52d4965962113d`
  (implementation attempt 4), unchanged since attempt 004; a continuation of
  the canonical attempt-5 `BLOCKED` cycle following its own later, genuinely
  successful outer Harness-to-Claude protected-role execution (see
  `verification-attempt-005-primary-evidence.md`)
- Result: `BLOCKED` (`INFRASTRUCTURE_FAILURE`), private attempt `005`
  (canonical attempt `6`). Evaluator revision `002` unchanged; no correction
  needed or performed.
- Output: `verification-feedback-005.md`,
  `verification-attempt-006-lp1-adjudication.md`
- Scope: this attempt adjudicated whether canonical attempt 5's own successful
  protected-role execution already establishes the frozen live-Claude
  fixture requirement (AC08/AC09/AC34), without rerunning implementation,
  `prepare`, the visible/hidden suites, typecheck/lint/diff checks, Codex
  evidence, or any live-Claude fixture. It determined that a distinct frozen
  property remains genuinely unproven — see
  `verification-attempt-006-lp1-adjudication.md` — and therefore stopped
  before attempting any new fixture.
- Mandatory non-executable coverage: 33 of 35 mandatory criteria re-affirmed
  by reference to attempt 004's unchanged, drift-free evidence (confirmed via
  fresh re-hash of every frozen input and a `git log`/`git diff --stat`
  showing only evaluator/documentation commits since the evaluated commit).
  AC08, AC09, and dependent AC34 remain `BLOCKED` for the same
  executor-availability reason as attempts 002 and 004.
- Repository evidence inspected: the public canonical `workflow.jsonl`
  history, `verification-attempt-005-primary-evidence.md`, prior private
  attempt results, the frozen brief's "Scenario prerequisites"/"Evidence
  requirements" sections, and the frozen Design Map's "Design decisions".
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read only; no correction was needed), including prior private
  fixture evidence from verification attempt 002.
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check (fresh re-hash of brief, Design Map, public evaluation requirements,
  coverage-map, bootstrap snapshot, private spec/case-manifest, and every
  hidden test file — all unchanged); implementation-commit stability check.
- Measurement cutoff: immediately before this manifest update.

## Run 016 — LP1 host-mediated fixture correction

- Skill: `implementation` v3; frozen public Spike 013a brief, Design Map and
  evaluation requirements read. Restricted evaluator material inspected: none.
- Input: implementation attempt 4 at `3edb31603c1b97eb4f2d52b56c52d4965962113d`;
  the existing Spike 011 ledger edit was preserved and excluded.
- Result: added a fixed Harness-owned LP1 child-fixture allocation. It derives
  a Claude/evaluator-v11 child only from an active canonical Spike 013a
  evaluator-verify parent and exposes the child binding through normal run
  inspection. No generic nested-provider API or evaluator shell permission was
  added.
- Verification: focused LP1 regressions pass; direct per-file suite runs pass
  (21 workflow-run, 11 Codex backend, 5 evaluator-integrity, 6 session-backend,
  4 session-events, 4 session-lifecycle); typecheck, lint, formatting and diff
  checks pass. The aggregate `npm test` invocation exits non-zero with no test
  diagnostic in this environment although those same six files pass directly.
- Live characterization: a fake outer parent plus real Harness child allocation
  reached real Claude process launch using daemon-only executable configuration;
  the child exited code 1 without a semantic role result. The evaluator-role log
  was not inspected. This is implementation characterization, not verification
  and does not consume LP1.
- Measurement cutoff: immediately before this manifest update. Candidate commit
  and implementation handoff follow and are not included above.

## Run 018 — Evaluator Verification (attempt 006 / canonical attempt 008)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `5ff1a1bfc22a7e44bda19cf155c39903d7bd7feb`
  (implementation attempt 6), all frozen public inputs confirmed byte-identical
  to their frozen identities (no specification drift)
- Result: `FAIL` (`IMPLEMENTATION_FAILURE`), private attempt `006` (canonical
  attempt `8`). Evaluator revision `002` unchanged; no correction needed or
  performed.
- Output: `verification-feedback-006.md`
- Mandatory executable hidden coverage: 5/5 pass (fresh run against this
  commit)
- Mandatory non-executable coverage: 32 of 35 mandatory criteria confirmed
  satisfied this attempt. AC08, AC09 (LP1) and dependent AC34 changed from
  `BLOCKED` to `NOT_SATISFIED`: this candidate's new host-mediated LP1
  fixture endpoint was found, by direct code-level construction (no live
  provider access required), to reject every parent allocation the
  repository's own canonical dispatcher can actually produce, because it
  checks an exact `slot.workflow` string the dispatcher never emits. A
  second, non-criterion-flipping regression sharing the same root cause
  (host-only configuration consumed unconditionally rather than scoped to
  the one canonical allocation it targets) was also found and reported.
- Repository evidence inspected: the full implementation diff since the
  previously-evaluated commit, the new `/workflow-fixtures/lp1` allocation
  logic and its added regression test, `tools/workflow.ts`'s real canonical
  dispatch construction, and this attempt's own isolated in-process
  allocation probe (no live provider process; fake session/workflow
  backends)
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read only; no correction was needed)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (74/74 with this evaluator's two candidate-relevant
  ambient environment variables unset; 71/74 with them present, as they
  genuinely are for this evaluator session - see Output), `npm run
  typecheck`, `npm run lint`, `npm run format:check` (scoped to Git-tracked
  files), and `git diff --check` all green at the implementation commit; E1-E5
  re-run fresh (5/5 pass)
- Measurement cutoff: immediately before this manifest update.

## Run 019 — Workflow-identity canonicalization correction

- Skill: `implementation` v3. Restricted evaluator material inspected: none.
- Input: implementation attempt 6 at
  `5ff1a1bfc22a7e44bda19cf155c39903d7bd7feb`; frozen brief
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`,
  Design Map
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`,
  evaluation requirements
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`,
  coverage map
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`,
  and sanitized public `verification-feedback-006.md`.
- Result: `IMPLEMENTED`. Workflow aliases now canonicalize at resolved-spec
  construction. The exact runner identifier and retained shorthand resolve to
  one host slot, canonical run identity, and allocation-authority identity;
  LP1 checks only the canonical full identifier.
- Output: implementation/test/report diff before this entry
  `sha256:d44de069c20a790be60930f756d6c504ec054d7252383595c49a825bae4bde35`.
- Verification: focused regression demonstrated the old split-slot failure and
  then passed; `npm test` 74/74, `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` pass.
- Live LP1: real loopback host, canonical full-ID parent
  `085ae8fa-d404-4042-898a-f70f57f2f71e`, real Claude child
  `9cc0a9a8-692f-444b-99a8-839626754741`, pinned evaluator v11 contract
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  child completed in 67,201 ms with a host-validated `succeeded` semantic
  result and read-only/no-side-effect fixture boundary.
- The pre-existing unrelated Spike 011 ledger edit was preserved and excluded.
- Measurement cutoff: immediately before this manifest update. Candidate
  commit and canonical implementation handoff follow and are not included.

## Run 020 — Evaluator Verification (attempt 007 / canonical attempt 009)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `2bce70339cc99cb2b7ccffe5623ae20627c65fc3`
  (implementation attempt 7), all frozen public inputs confirmed byte-identical
  to their frozen identities (no specification drift)
- Result: `BLOCKED` (`INFRASTRUCTURE_FAILURE`), private attempt `007`
  (canonical attempt `9`). Evaluator revision `002` unchanged; no correction
  needed or performed.
- Output: `verification-feedback-007.md`
- Mandatory executable hidden coverage: 5/5 pass (fresh run against this
  commit)
- Mandatory non-executable coverage: 32 of 35 mandatory criteria confirmed
  satisfied this attempt. AC08, AC09 (LP1) and dependent AC34 changed from
  attempt 006's `NOT_SATISFIED` back to `BLOCKED`: this attempt confirmed,
  by starting a genuine real-backend Harness host and allocating a parent
  with the exact field values a real dispatch produces, that the prior
  allocation-logic defect is fixed (parent allocation now succeeds); the
  real backend's subsequent attempt to spawn the configured Claude executor
  for that parent then failed for a reason external to this implementation
  (the configured executor is unreachable from this evaluation session), so
  the required host-validated successful role disposition still could not be
  reached. The same non-criterion-flipping regression reported at attempt
  006 (host-only configuration consumed unconditionally) remains present and
  unfixed.
- Repository evidence inspected: the full implementation diff since the
  previously-evaluated commit, a real (non-fake-backend) in-process Harness
  host allocation and LP1-fixture exercise against it, and a bare
  environment/process-namespace check confirming no live host or executor is
  otherwise reachable from this evaluation session
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read only; no correction was needed)
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (74/74 with this evaluator's two candidate-relevant
  ambient environment variables unset; 71/74 with them present, as they
  genuinely are for this evaluator session - see Output), `npm run
  typecheck`, `npm run lint`, `npm run format:check` (scoped to Git-tracked
  files), and `git diff --check` all green at the implementation commit; E1-E5
  re-run fresh (5/5 pass)
- Measurement cutoff: immediately before this manifest update.

## Run 021 — Standalone generic fixture boundary

- Skill: `implementation` v3. Restricted evaluator material inspected: none.
- Input: implementation attempt 7 at
  `2bce70339cc99cb2b7ccffe5623ae20627c65fc3`; frozen brief
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`,
  Design Map
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`,
  evaluation requirements
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`,
  coverage map
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`,
  sanitized public `verification-feedback-007.md`, and the evaluator
  clarification that fixture launch shape is implementation freedom.
- Result: `IMPLEMENTED`. Replaced the Spike/LP1-specific active-parent endpoint
  with a generic candidate-commit-bound repository fixture operation. The
  standalone prerequisite is a current canonical implementation handoff with
  valid frozen public provenance and pinned protected-role authority; it does
  not allocate or fabricate formal verification history.
- Output: staged implementation/test/configuration/report diff before this
  entry
  `sha256:b0803b4b3d60cdeabbc0e24f198c455a6030b21a0416a8d0dd7e50e8065cb293`.
- Verification: focused workflow integration suite 23/23; `npm run check`
  including full suite 74/74, typecheck, lint and formatting; `git diff
  --check`. One earlier full-suite invocation terminated all workers before
  diagnostics; isolated and clean full reruns passed.
- Live LP1: deferred until this candidate is committed and recorded as the
  current handoff, because fixture bytes are deliberately resolved from that
  commit. No formal evaluator verification or paid provider fixture ran during
  implementation.
- The pre-existing unrelated Spike 011 ledger edit was preserved and excluded.
- Measurement cutoff: immediately before this manifest update. Candidate
  commit and canonical implementation handoff follow and are not included.

## Run 022 — Standalone real LP1 evidence

- Skill: `implementation` v3. Restricted evaluator material inspected: none.
- Input: exact candidate
  `bb541265d994aad1f1af30446bf0a19ad59e1537`, canonical implementation
  handoff attempt 8, repository fixture `lp1` resolved from that commit, and
  pinned evaluator v11 contract
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- Result: `SUCCEEDED`. The ordinary outer Harness daemon allocated one real
  Claude fixture run without an evaluator parent. Run
  `70410e45-d8e0-46c0-b343-6be74b8d4260` reached host process disposition
  `completed` and host-validated semantic role disposition `succeeded` in
  112,487 ms. No formal evaluator verification was allocated or run.
- Output: complete candidate-bound host run record and provider log in
  `lp1-primary-evidence-008.md`,
  `sha256:b2534cb812846af15953661778d2ed3d12d09da4f3cea2e3e4397b58099a96ae`.
- Binding: fixture `spike-013a-lp1`; definition
  `sha256:d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4`;
  handoff
  `sha256:20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed`;
  evaluator v11 through `claude-system-contract`; repository-read-only
  capability; permitted side effects `none`; correlation parent `null`.
- The pre-existing unrelated Spike 011 ledger edit remained untouched. The
  daemon was stopped after evidence capture.
- Measurement cutoff: immediately before this manifest update. Evidence commit
  and push follow and are not included.

## Run 023 — Evaluator Verification (attempt 008 / canonical attempt 010)

- Skill: `evaluator` v11 (pinned pre-implementation authority,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`;
  confirmed byte-identical to the working-tree evaluator skill at verify time)
- Input: implementation commit `bb541265d994aad1f1af30446bf0a19ad59e1537`
  (implementation attempt 8), all frozen public inputs confirmed byte-identical
  to their frozen identities (no specification drift); fresh standalone LP1
  primary evidence for this exact candidate, already committed at
  `lp1-primary-evidence-008.md` (Run 022), independently corroborated rather
  than accepted on its own prose.
- Result: `PASS`, private attempt `008` (canonical attempt `10`). Evaluator
  revision `002` unchanged; no correction needed or performed.
- Output: none (no confirmed implementation failure; no public feedback
  artifact required).
- Mandatory executable hidden coverage: 5/5 pass (fresh run against this
  commit).
- Mandatory non-executable coverage: all 35 mandatory criteria confirmed
  `SATISFIED`. 32 were unaffected by this attempt's sole implementation
  commit and re-confirmed fresh via the full regression suite. AC08, AC09
  (LP1) and dependent AC34 change from attempt 007's `BLOCKED` to `SATISFIED`:
  this evaluator independently, structurally corroborated the preserved
  standalone live-Claude fixture evidence against primary repository state
  the evidence's author did not control (exact historical `workflow.jsonl`
  and fixture-definition bytes, recomputed derived identities, and the
  candidate's own fixture-evidence validator applied by hand), rather than
  accepting it on its own prose or rerunning it from this evaluator's own
  environment (still independently confirmed unable to reach a live Claude
  executor).
- Repository evidence inspected: the full implementation diff since the
  previously-evaluated commit (`src/workflow-run.ts`, `src/index.ts`,
  `test/workflow-run.integration.test.ts`, `fixtures/lp1.json`), the
  preserved LP1 evidence record, and the actual committed Git history used to
  independently recompute its embedded derived identities.
- Restricted evaluator material inspected: this spike's own private evaluator
  workspace (read only; no correction was needed).
- Checks: pinned-authority byte-identity confirmation; frozen-input drift
  check; `npm test` (74/74), `npm run typecheck`, `npm run lint`,
  `npm run format:check` (scoped to Git-tracked files), and `git diff --check`
  all green at the implementation commit; E1-E5 re-run fresh (5/5 pass);
  independent recomputation of the LP1 evidence's `ledgerIdentity`,
  `handoffIdentity`/`basisIdentity`, and `definitionIdentity` from primary Git
  history, each an exact match.
- Promotion: completed. The complete evaluator-owned evidence chain (private
  attempt ledger, all eight immutable attempt results, evaluator revision
  `002`'s frozen bundle) is promoted canonically under `evaluation/**`; see
  `evaluation/promotion.json`.
- Measurement cutoff: immediately before this manifest update.

## Run 024 — As-Built

- Skill: `as-built` v2.
- Input: final evaluated implementation
  `bb541265d994aad1f1af30446bf0a19ad59e1537`; frozen brief
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`;
  frozen Design Map
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7c3723835e0721e8673554f93b407`; and
  promoted evaluator revision `002`, attempt `008`, `PASS`, result
  `sha256:8b818f23887a739a2dc177ec13df75f98017324a91a885bbf594f39fee1866e5`.
- Result: recorded the implemented execution-binding, semantic-result,
  canonical-adoption, retry, provider-delivery, and candidate-bound fixture
  behavior in `as-built.md`
  `sha256:44db0010074360f2e51797809fd022a449bdc0c680d8f6dbe65029047fbe03ee`.
- Contract comparison: no Missing, Contradictory, or material Extra behavior
  observed.
- Repository evidence inspected: final implementation diff and relevant
  source/test surfaces; frozen brief and Design Map; canonical workflow
  authority; and promoted evaluation attempt, bundle, and promotion record.
- Restricted evaluator material inspected: only promoted artifacts under this
  spike's `evaluation/**`, as authorized for As-Built synthesis.
- Checks: frozen identities and final implementation provenance confirmed;
  `git diff --check` passes before this manifest update. The pre-existing,
  unrelated uncommitted Spike 011 ledger edit was preserved and excluded.
- Measurement cutoff: immediately before this manifest update.
