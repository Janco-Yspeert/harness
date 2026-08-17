# Spike 007 — Workflow Manifest

This append-only record preserves material workflow runs for Spike 007.

## Run 001 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Not ready to freeze`
- Input: `spike.md`
- Input content identity:
  `sha256:9ec0a2cca29b18e0970d443cedc75979a38f1cb7c90a566dcfc81406341c57ec`
- Outputs: `feedback.md`, `preliminary/001/spike.md`, and
  `preliminary/001/feedback.md`
- Feedback content identity:
  `sha256:c7cd957862793854090dc8388ab338c09f096a4a5dc4bd15d38ccba9a767eeca`
- Findings: 2 blockers, 1 material clarification
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, `src/index.ts`,
  `src/session-backend.ts`, `public/client.js`, visible session lifecycle,
  backend, and Codex integration tests, package tooling, and public Outcomes for
  Spikes 003–005
- Restricted evaluator material inspected: none
- Checks: both preliminary files compared byte-identical with their live
  counterparts; feedback formatting passed; `git diff --check` passed for the
  Spike 007 directory before this manifest update
- Runtime tests: not run because this review made no implementation change
- Input lines: 270
- Feedback lines: 108
- Limitation: the worktree was already dirty with an unrelated Spike 006 path
  rename; it was not modified by this run
- Git checkpoint: not committed or pushed because the draft is untracked on
  protected `main` amid unrelated worktree changes, not on the canonical
  `feat/spike-007` workflow branch
- Measurement cutoff: immediately before this manifest update

## Run 002 — Brief Readiness

- Recorded: contemporaneously
- Skill: `brief-readiness` v3
- Agent/tool: Codex
- Result: `Ready to freeze`
- Input: revised `spike.md`
- Input content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Output: `feedback.md`
- Output content identity:
  `sha256:d0ebd3d5a18262ef740ae21454c38342743ba0e8a2a9bcfa41de2c924fec10f3`
- Findings: none
- Prior findings resolved: 2 blockers and 1 material clarification from Run 001
- Repository evidence inspected: `AGENTS.md`, `GOALS.md`, the preserved Run 001
  feedback, `src/index.ts`, `src/session-backend.ts`, `public/client.js`, visible
  session lifecycle, backend, and Codex integration tests, package tooling, and
  public Outcomes for Spikes 003–005
- External evidence inspected: the public canonical Conduit protocol repository
  named by the brief, at its moving head for feasibility only; immutable
  revision selection remains a Design Map responsibility
- Restricted evaluator material inspected: none
- Checks: feedback formatting passed; `git diff --check` passed for the Spike
  007 directory before this manifest update
- Runtime tests: not run because this review made no implementation change
- Input lines: 617
- Feedback lines: 61
- Preliminary snapshot: none, because the review passed
- Measurement cutoff: immediately before this manifest update

## Run 003 — Design Map

- Recorded: contemporaneously
- Skill: `design-map` v2
- Agent/tool: Codex
- Result: `COMPLETE`
- Frozen brief: `spike.md`
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen brief Git provenance: `b1a2ecc`
- Output: `design-map.md`
- Output content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Conduit protocol reference:
  `29ef1c88f8d2c805319f671c901872fb82036356`
- Shared contracts established: exact minimal lifecycle envelope, Conduit schema
  identity and root-event semantics, `/events/ws` transport boundary, Harness
  lifecycle ownership, broadcast connection ownership, and existing public
  evaluation seam
- Repository evidence inspected: frozen brief and readiness history,
  `AGENTS.md`, `GOALS.md`, `src/index.ts`, `src/session-backend.ts`, visible
  lifecycle/backend tests, and workflow contracts
- External evidence inspected: the pinned Conduit protocol README, canonical
  JSON schema, minimal-event fixture, root-message fixture, and conformance
  documentation
- Restricted evaluator material inspected: none
- Checks: Design Map formatting passed; `git diff --check` passed for the Spike
  007 directory before this manifest update
- Runtime tests: not run because no implementation changed
- Design Map lines: 112
- Measurement cutoff: immediately before this manifest update

## Run 004 — Evaluator `prepare`

- Recorded: contemporaneously
- Skill: `evaluator` v6, mode `prepare`
- Agent/tool: Claude Code
- Result: prepared and frozen (evaluation revision 1)
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen Design Map content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Output: `eval-requirements.md`
- Output content identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Blocking questions: none; the frozen brief and Design Map left no material
  ambiguity preventing fair evaluation
- Testability requirements published: 4
- Evaluator assumptions published: 4
- Mandatory evaluation cases frozen: 12, exercising both PTY- and
  Codex-backed sessions where the brief requires backend-neutral coverage
- Repository evidence inspected: frozen brief, Design Map, and readiness
  history; `src/index.ts`, `src/session-backend.ts`, `src/pty-backend.ts`,
  `src/codex-backend.ts`; the existing public integration test suites for
  session lifecycle, session backend injection, and Codex backend
  behaviour; `package.json`
- Restricted evaluator material inspected/produced: private `eval-spec.md`,
  a private hidden-test suite, and a private case manifest, all under the
  mirrored `harness-hidden` spike path
- Pre-freeze integrity gate: shared evaluator helpers independently
  validated (positive and negative hand-built samples); every mandatory
  case positive-controlled against a throwaway, uncommitted reference
  implementation of the frozen contract and negative-controlled against
  the current, unimplemented repository, confirming each failure/pass was
  for the intended reason; the one materially new runtime mechanism
  (live WebSocket broadcast with no replay for late joiners) was
  additionally validated empirically, independent of Harness code, before
  any hidden test was written; one connection-helper defect (hangs on a
  rejected upgrade instead of failing) was found and fixed during this
  process, before freeze
- Runtime tests: public `npm test` confirmed passing on the frozen commit
  before preparation began; no implementation change was made
- Checks: `git diff --check` passed for the Spike 007 directory before this
  manifest update; the public working tree was confirmed clean after a
  temporary, uncommitted dependency-injection probe used to validate one
  case's negative control
- Measurement cutoff: immediately before this manifest update

## Run 005 — Implementation

- Recorded: contemporaneously
- Skill: `implementation` v3
- Agent/tool: Codex
- Result: candidate prepared for independent evaluation
- Inputs: frozen `spike.md`, frozen `design-map.md`, public
  `eval-requirements.md`, `AGENTS.md`, `GOALS.md`, and public implementation
  feedback
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen Design Map content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Evaluation requirements content identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Input Git provenance: brief `b1a2ecc`, Design Map `0139517`, evaluator
  preparation `7dd8b8f`
- Output: host-owned `/events/ws` live lifecycle broadcast and visible session
  event integration tests
- Output identity: the containing implementation commit; resolved after commit
- Files changed before this manifest entry: `src/index.ts` and
  `test/session-events.integration.test.ts`
- Decisions: lifecycle transitions construct one closed Conduit-aligned envelope
  and serialize it once for every live observer; event connections remain
  independent of the existing singleton session attachment and backends remain
  unaware of the public event contract
- Tests/checks: `npm test` passed (25 tests); `npm run typecheck` passed;
  changed-file ESLint and Prettier checks passed; `git diff --check` passed
- Skipped check: repository-wide `npm run lint` could not traverse the
  sandbox-exposed `.codex` directory (`ENOENT` from ESLint); direct linting of
  every changed TypeScript file passed
- Restricted evaluator material inspected: none
- Measurement cutoff: immediately before this manifest update

## Run 006 — Evaluator `verify`

- Recorded: contemporaneously
- Skill: `evaluator` v6, mode `verify`
- Agent/tool: Claude Code
- Result: `PASS` (verification attempt `001`)
- Implementation evaluated: branch `feat/spike-007`, commit `20f8867`
- Evaluator revision used: `1` (unchanged from Run 004)
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen Design Map content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Evaluation requirements content identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Drift check: brief, Design Map, public evaluation requirements, private
  eval-spec, case manifest, every hidden test and support file, and the
  evaluator skill file were re-hashed against the Run 004 freeze record;
  every identity matched exactly, confirming no specification drift
- Mandatory evaluation cases: 12 of 12 passed (17 of 17 underlying mandatory
  test bodies, run three times for determinism confidence; 0 failures across
  all runs)
- Required regression: public `npm test` passed (25/25) on the evaluated
  commit
- Evaluator defects found: none
- Specification ambiguities found: none
- Public feedback artifact: none emitted (only required on confirmed
  implementation failure; this attempt passed)
- Restricted evaluator material inspected/produced: private
  `.eval/attempts/001/eval-result.md`, private attempt-ledger entry `001`
- Runtime tests: hidden mandatory suite and public regression suite executed
  as above; no implementation change was made during verification
- Checks: `git diff --check` passed for the Spike 007 directory before this
  manifest update; public working tree confirmed clean before and after
  verification
- Measurement cutoff: immediately before this manifest update

## Run 007 — Evaluator Promotion

- Recorded: contemporaneously
- Skill: `evaluator` v6, mode `verify` (Promotion step)
- Agent/tool: Claude Code
- Result: promoted
- Promoted after: accepted successful result (attempt `001`, `PASS`) and
  completion of the active implementation loop (single attempt, no retry
  needed)
- Promoted evaluator revision: `1` (the only revision this cycle produced;
  no evaluator defect required a corrected revision, so no superseded
  revision was promoted)
- Promoted contents: `evaluation/eval-spec.md`, `evaluation/freeze.json`,
  `evaluation/attempt-ledger.json` (complete, 1 entry), `evaluation/hidden-tests/**`
  (8 mandatory hidden-test files, case manifest, and support helpers/self-check,
  byte-identical to what actually ran); `attempts/001/eval-result.md`
  (byte-identical immutable per-attempt result) plus explanatory
  `evaluation/README.md` and `attempts/001/README.md`
- Anti-duplication: the evaluator suite was promoted once at `evaluation/`
  and linked from `attempts/001/` rather than duplicated there, per the
  evaluator skill's promotion rule, since the sole attempt ran against the
  sole/final revision
- Fidelity check: every promoted file byte-diffed against its private
  source before commit; all matched exactly except the two files
  necessarily updated for the new public path (`attempt-ledger.json`'s
  `resultPath`, documented in `evaluation/README.md`) — no other content
  was rebuilt, regenerated, or summarized in place of the original evidence
- Private material remains in place: `harness-hidden/spikes/007-structured-session-events/`
  was not deleted or modified by promotion
- Checks: `git diff --check` passed for the Spike 007 directory before this
  manifest update; public working tree confirmed clean after staging only
  the promoted paths
- Measurement cutoff: immediately before this manifest update

## Run 008 — Evaluator promotion contract correction

- Recorded: contemporaneously
- Skill: `skill-creator` (system skill)
- Agent/tool: Codex
- Result: evaluator contract revised from v6 to v7
- Inputs: active evaluator v6 contract and templates, repository workflow
  instructions, public Spike 006 methodology, and public Spike 007 promotion
  history; no active evaluator-private workspace was inspected
- Outputs: deterministic post-`PASS`, pre-human-acceptance promotion lifecycle;
  canonical `evaluation/` layout; explicit attempt/revision identities and
  copied/referenced/not-promoted metadata; byte-exact archival and hash-equality
  rules; exact evaluator v6 historical archive
- Related active documentation aligned: `AGENTS.md` and `README.md`
- Historical Spike 007 finding: its Run 007 record expressly states that the
  promoted `evaluation/attempt-ledger.json` changed `resultPath`; therefore that
  ledger is not byte-identical to its private source under v7. Historical files
  were not modified.
- Independent review: initial review found four lifecycle/provenance procedure
  defects; all were corrected. Final review found no remaining blocker and
  determined all six required scenarios from the v7 contract without consulting
  historical precedent.
- Validation: Prettier passed; `git diff --check` passed; archived evaluator v6
  SHA-256 matched the prior active contract; `npm run check` passed once with all
  25 tests, then a later parallel test launch failed at worker level without
  assertion output; isolated affected test and full serial suite both passed
  (25/25). The generic `quick_validate.py` remains incompatible with the
  evaluator's intentional Claude-specific frontmatter and rejected the unchanged
  extra keys.
- Unrelated worktree content preserved: untracked
  `retrospectives/prepare-retrospective.md` was not modified.
- Measurement cutoff: immediately before this manifest update

## Run 009 — As-Built

- Recorded: contemporaneously
- Skill: `as-built` v2
- Agent/tool: Codex
- Result: complete; no **Missing** or **Contradictory** discrepancies; **Extra**
  post-verification evaluator-contract and retrospective structure recorded
- Inspected implementation revision:
  `20f88674409e9e2a2f3fca83869206c8b2b67943`
- Frozen brief content identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Frozen Design Map content identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Public evaluation requirements content identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Final verification inspected: attempt `001`, `PASS`, evaluator revision `1`
- Additional repository state inspected: evaluator contract v7
  (`sha256:ca26532a3011caef8de2f027c6bb32be81d46bd451cc855db1bd0ad8983fd238`)
  and five Spike 007 retrospective/prompt artifacts
- Output: `as-built.md`
- Output content identity:
  `sha256:412a67f8c4bdbc2fb7d08d0c43f9bf4e67bf424e67c8c277b9efa1f9d5a8a65d`
- Repository evidence inspected: exact implementation diff and files at the
  inspected revision, relevant pre-change host lifecycle code, visible event
  integration tests, frozen brief, frozen Design Map, public evaluation
  requirements, promoted final evaluation result, evaluator v7 correction and
  templates, repository workflow documentation, five Spike 007
  retrospective/prompt artifacts, and workflow manifest
- Restricted evaluator material inspected: none; only promoted public
  historical evaluation evidence was read
- Checks: repository typecheck, lint, and formatting passed; changed-artifact
  formatting passed; `git diff --check` passed; archived evaluator v6 matched
  the prior active contract byte-for-byte
- Evaluation: not rerun; the skill requires reconstruction of the already
  verified revision rather than another evaluation pass
- Runtime tests: a fresh sandboxed launch failed at the Node worker level
  without assertion output because integration tests could not use loopback
  sockets; `npm test` outside that sandbox passed all 25 tests
- Implementation diff: 2 implementation files changed, 286 insertions and 3
  deletions, excluding its contemporaneous manifest entry
- As-Built lines: 106
- Retrospective artifacts inspected: 5 files, 1,335 lines
- Authorized checkpoint scope: evaluator v7 contract work, its Run 008 manifest
  entry, five Spike 007 retrospective/prompt artifacts, this As-Built, and this
  Run 009 entry
- Measurement cutoff: immediately before this manifest update

## Run 010 — Outcome

- Recorded: contemporaneously
- Skill: `outcome` v3
- Agent/tool: Codex
- Result: `PASS`; final historical synthesis complete
- Implementation revision:
  `20f88674409e9e2a2f3fca83869206c8b2b67943`
- Accepted evaluation: attempt `001`, `PASS`, evaluator revision `1`
- Promoted evaluation checkpoint:
  `d2cee91fcb39c6ef2a2f6cd4c078d5dbe75f6587`
- As-Built checkpoint:
  `af87157e9b5c327bd008c5912f254fd552bac90f`
- Output: `outcome.md`
- Output content identity:
  `sha256:75095fb2a8ae94d0f418b49bc3a2711888cd7d79e9d3b0e2207f1274da851248`
- Evidence inspected: frozen brief, Design Map, public evaluation requirements,
  workflow manifest, readiness feedback, As-Built, promoted freeze metadata,
  promoted attempt ledger and result, promoted evaluation README, relevant Git
  commits and ancestry, and selective prior public Outcomes
- Restricted evaluator material inspected: promoted public historical evidence
  for Spike 007 only; no active private evaluator workspace was inspected
- Checks before this manifest update: recorded artifact identities matched
  current files; implementation, promotion, and As-Built commits and ancestry
  confirmed; Outcome passed Prettier; `git diff --check` passed
- Runtime tests: not rerun; Outcome changes documentation only and relies on the
  accepted evaluation and the fresh verification recorded by As-Built
- Outcome lines: 173
- Statistics omitted: token, context, duration, and agent-turn totals were not
  reliably available
- Measurement cutoff: immediately before this manifest update
