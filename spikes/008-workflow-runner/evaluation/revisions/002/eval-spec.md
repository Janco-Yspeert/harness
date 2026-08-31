# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/008-workflow-runner`
- Current project commit when frozen: `3ac7c206e50b6da2f7d632dc9da68978a21ac712`
- `spike.md` content identity:
  `sha256:15a6c7b432ae6fe1ffb876867d41506f5571b64427ed377f0d4d62cbefaa8c9b`
- `design-map.md` content identity:
  `sha256:b57bfb2e8bb302717eff8549da56f23c85089e1f72e1165bf17264dc1be3d8fd`
- `eval-requirements.md` content identity:
  `sha256:449873a0355cc377294d0ca1fa144a2d7d77347c4e96e4dd72b18bdea422a53a`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md` (repository path
  `.claude/skills/evaluator/SKILL.md`)
- Evaluator skill name and contract version: `evaluator`, version 7
- Evaluator skill content identity:
  `sha256:ca26532a3011caef8de2f027c6bb32be81d46bd451cc855db1bd0ad8983fd238`
- Evaluation revision identity: `002` (corrects revision `001`; see Revision
  History below)

## Pre-Freeze Integrity Gate

- **Discovered duplicate draft generations.** On entering `prepare`, the
  private workspace already contained two complete, mutually incompatible
  hidden-test generations left by an earlier, interrupted preparation pass:
  one built on `support/spike-fixture.ts` + `support/fixture-bin.ts` +
  `support/cli.ts::runWorkflow` (9 test files, mtimes 18:29–18:33), and one
  built on `support/scratchSpike.ts` + `support/fakeBin.ts` +
  `support/cli.ts::runCli` (6 test files + 3 self-check files, mtimes
  18:24–18:29), sharing only `support/phases.ts`. The two generations were
  never merged: the on-disk `support/cli.ts` and `support/phases.ts` matched
  only the `runWorkflow`-based generation (exporting `runWorkflow` but not the
  `runCli`/`OWNER`/`SKILL`/`HIDDEN_MECHANIC_SUBSTRINGS` symbols the other
  generation's tests imported), so every test file in the `runCli`-based
  generation failed to type-check (`TS2305: has no exported member`).
  File-modification order established that the `runWorkflow`-based generation
  was authored second (its last file postdates the other generation's last
  file by several minutes) and is what the shared support files currently
  implement — no version of `runCli`/`scratchSpike`/`fakeBin`/`state`/
  `gitSnapshot`/`hiddenWorkspace` was ever left in a working state. No `.eval/
  freeze.json` existed, so nothing had been frozen against either generation.
  The `runCli`-based generation (`state-and-path.test.ts`,
  `ordering-and-progression.test.ts`, `dry-run-and-execute.test.ts`,
  `duplicate-outcome.test.ts`, `unknown-phase.test.ts`,
  `no-side-effects.test.ts`, `support/scratchSpike.ts`, `support/fakeBin.ts`,
  `support/state.ts`, `support/gitSnapshot.ts`, `support/hiddenWorkspace.ts`,
  and the three `*.selfcheck.test.ts` files) was deleted as orphaned,
  unfrozen draft material. The `runWorkflow`-based generation was kept and is
  the sole basis of this evaluation revision.
- **Type-checked the retained suite.** Ran `tsc --noEmit` over the retained
  `.hidden-test/**/*.ts` with the public project's own `tsconfig.json`
  compiler options (via a scratch include-only config pointing at the hidden
  directory, since the hidden tree sits outside the project's own
  `tsconfig.json` `include`). This surfaced three real defects in the
  retained generation, all fixed before freeze:
  - `support/progress.ts` and `valid-progression.test.ts` indexed
    `PHASE_ORDER` (a `readonly` tuple) by a running numeric loop variable
    under `noUncheckedIndexedAccess`, producing `Phase | undefined`. Fixed by
    iterating with `for (const phase of PHASE_ORDER.slice(...))` /
    `PHASE_ORDER.entries()` instead of manual indexing.
  - `execute-detached-jobs.test.ts` narrowed `StatusJob["command"]` (`string |
    readonly string[]`) with `Array.isArray(job.command) ? job.command.join(" ")
    : job.command` inside a `test("...", async () => {...})` callback. This is
    a reproducible TypeScript 6.0.3 narrowing defect, not a logic error:
    `Array.isArray` fails to narrow a `readonly T[]` union member anywhere in
    a file that contains a top-level `await` (confirmed with a minimal,
    isolated repro reduced to a bare `await Promise.resolve();` plus the same
    ternary, with no test-runner or assertion library involved). `typeof
    command === "string"` narrows correctly under the same conditions and was
    substituted in both occurrences.
  After these three fixes, the full retained suite type-checks with zero
  errors under the project's compiler options.
- **Executed the retained suite pre-implementation.** Ran every retained test
  file individually under `node --test` against the unmodified public
  repository (no `workflow` npm script exists yet). Every test failed
  predictably because `npm run --silent workflow -- ...` fails with "Missing
  script: workflow" (non-zero exit, empty stdout) — confirmed by inspecting
  each failure's assertion diff and, for `rejections.test.ts`, a
  `JSON.parse` `SyntaxError` on the resulting empty stdout, not by any
  `TypeError`/`ReferenceError`/unhandled exception. This confirms the harness
  itself parses, compiles, and executes end-to-end (spike-fixture
  creation/cleanup, subprocess spawning, and JSON/assertion plumbing all
  function), and that failures occur for the intended reason (absent
  implementation) rather than a broken oracle.
- **Validated TR3 (bare-name `PATH` resolution) empirically.** Reproduced the
  exact mechanism `support/fixture-bin.ts` and the product implementation
  will both rely on: `child_process.spawn("codex", [...], { shell: false,
  env: { PATH: "<fixture-dir>:" + inheritedPath } })` against a throwaway
  executable named `codex` placed on a prepended `PATH`, run outside any test
  framework. The bare name resolved and the fixture ran (exit code 0, its
  stdout marker observed), confirming Node's `spawn` performs the same
  `PATH` search a shell would for a bare command name with no path
  separator, independent of test-runner machinery.
- **Validated the `.gitignore` oracle mechanism.** Confirmed `git
  check-ignore -q <path>` against the real repository returns exit code `0`
  for a path matched by an ignore rule (`node_modules`), exit code `1` for a
  tracked or otherwise unmatched path (`package.json`, a nonexistent
  untracked path), matching `gitignore.test.ts`'s `isGitIgnored` helper's
  interpretation of those codes.
- **Confirmed Prettier formatting.** `npx prettier --check
  spikes/008-workflow-runner/eval-requirements.md` reported the file already
  matches the project's Prettier configuration; its content identity above
  was computed from that formatted content.

## Explicit Requirements

- **R1** — The seven canonical phases and their fixed agent ownership are:
  Codex owns `brief-readiness`, `design-map`, `implementation`, `as-built`,
  `outcome`; Claude owns `evaluator-prepare`, `evaluator-verify`. Each
  `<phase>` literal matches its repository skill directory name (TR4 in
  `eval-requirements.md`). Source: `spike.md` "define the canonical phases
  and their responsible agent"; `design-map.md` "fixed ownership and prompt
  identity."
- **R2** — `init <spike>` creates an append-only local `.workflow/state.json`
  in the target spike. Source: `spike.md` "create an append-only, local
  `.workflow/state.json`..."
- **R3** — `dispatch <phase> <spike>` requires the immediately prior
  canonical phase to have a recorded `complete` outcome, except for the first
  phase, and writes a dispatch record. Source: `spike.md` "`dispatch`
  requires the prior phase to have a `complete` outcome, except for the first
  phase. It writes a dispatch record..."
- **R4** — `<spike>` must be a normalized `spikes/NNN-*/` path resolving
  beneath the repository root; every command rejects any other path
  (non-spike, traversal, absolute-outside-repo). Source: `spike.md`
  "reject...a non-spike path"; `design-map.md` "accepts only a normalized
  relative `spikes/NNN-*/` path beneath the repository root."
- **R5** — `dispatch`/`record` reject an unknown `<phase>` literal (any value
  outside the seven named in R1). Source: `spike.md` "reject an unknown
  phase."
- **R6** — `dispatch` rejects a transition that skips a prior phase, both for
  the immediately-next phase and for a phase further ahead. Source:
  `spike.md` "reject...a transition that skips a prior phase"; `design-map.md`
  "The fixed phase order is..."
- **R7** — `record` rejects a second terminal outcome for the same numbered
  phase+attempt, regardless of whether the second outcome value matches the
  first. Source: `spike.md` "reject...a duplicate terminal outcome for the
  same numbered phase attempt."
- **R8** — The retry loop is modeled as monotonically numbered attempts per
  phase; a failed `evaluator-verify` outcome — and only that — permits the
  next numbered `implementation` attempt; every earlier attempt's records
  remain present and unchanged. Source: `spike.md` "model the
  implementation/evaluator retry loop as monotonically numbered attempts...";
  "A failed evaluator verify opens the next implementation attempt;
  otherwise no earlier phase can be reopened."; `design-map.md` "Earlier
  attempt records remain immutable when a retry begins."
- **R9** — `evaluator-prepare` can never be redispatched by this runner,
  regardless of its own recorded outcome (including a non-`complete`
  terminal outcome) or of any later implementation retry. Source: `spike.md`
  "evaluator prepare cannot be repeated by this runner."
- **R10** — `dispatch` renders a phase-specific prompt/command that names the
  target spike and the phase's owning repository skill, and never embeds
  evaluator-private paths, filenames, or test mechanics. Source: `spike.md`
  "render a phase-specific prompt that names the target spike and the
  corresponding repository skill, without embedding evaluator-private paths
  or test mechanics."
- **R11** — By default (no `--execute`), `dispatch` prints the selected
  executor command to stdout, writes only a dispatch record, and starts no
  process. Source: `spike.md` "by default, print the selected executor
  command without starting it."
- **R12** — With `--execute`, `dispatch` starts the installed Codex or Claude
  CLI as a detached local child process (not a child of the runner
  invocation), returns promptly without waiting for it to exit, and records
  its PID, exact invoked command, log path, and launch time. Source:
  `spike.md` "start the installed Codex or Claude CLI only when `--execute`
  is supplied, as a detached local child rather than a child of the runner
  invocation"; "record its PID, command, log path, and launch time in
  state."
- **R13** — Codex is invoked as `codex exec --cd <repository-root>` and
  Claude as `claude -p --permission-mode manual`, each with the rendered
  prompt appended; both are constructed as argument vectors without a shell,
  resolved via bare program name against the inherited `PATH`. Source:
  `spike.md` "invoke Codex using... Claude using..."; `design-map.md`
  "Argument vectors—not a shell—construct the Codex and Claude commands."
- **R14** — A detached job's combined stdout+stderr is written to one local,
  per-spike, Git-ignored log file at the path recorded in state. Source:
  `spike.md` "write each detached job's combined output to a local ignored
  per-spike log."
- **R15** — A subprocess's exit is never itself a recorded outcome; only an
  explicit `record` call establishes a phase+attempt's outcome, and no
  successor phase unlocks without it. Source: `spike.md` "`record` is a
  separate explicit operation because a process exiting successfully does
  not prove the skill did its job."; `design-map.md` "A process exit is not
  completion; `record` remains the only completion authority."
- **R16** — `status <spike>` prints, as its entire stdout, one JSON document
  reporting the current phase records (TR1's shape in `eval-requirements.md`),
  including recorded job PID/command/logPath and a liveness value computed
  from real OS process state (not from reading the job's log). Source:
  `spike.md` "`status` reports recorded job metadata and liveness without
  parsing agent output"; "`status` prints the current phase records as
  JSON."; `design-map.md` "`status` may report liveness for a recorded job
  without inspecting its output."
- **R17** — `cancel <phase> <spike>` sends a termination signal only to the
  currently recorded live job for that specific phase, leaving any other
  phase's simultaneously live job unaffected. Source: `spike.md` "`cancel`
  sends a termination signal only to the recorded live job."; `design-map.md`
  "`cancel` may terminate only the currently recorded job for that phase."
- **R18** — `.workflow/state.json` and every job log file live under
  `<spike>/.workflow/` and are excluded from Git tracking by a repository
  ignore rule. Source: `spike.md` "The `.workflow/` directory is ignored by
  Git..."; "must add an ignore rule for `.workflow/`."

## Derived Invariants

- **I1** — The seven-phase order and per-phase ownership are fixed and never
  configurable per invocation. Derived from: R1, R6; `design-map.md` "The
  fixed phase order is..."
- **I2** — Job metadata (PID/command/logPath/liveness) is operational
  bookkeeping only; it never itself establishes a recorded outcome, frozen
  evaluation provenance, or human acceptance. Derived from: R15;
  `design-map.md` "Job metadata is operational only; it does not establish
  frozen provenance, evaluation validity, or human acceptance."
- **I3** — State and job records are append-only; a later command never
  rewrites or removes an earlier record, including across a permitted
  retry. Derived from: R2, R8; `design-map.md` "Its versioned JSON state
  records append-only phase and job events"; "Earlier attempt records
  remain immutable when a retry begins."

## Negative Requirements

- **N1** — The runner makes no Git commit, push, branch, or merge; performs
  no evaluator-private read or hidden-workspace creation; bypasses no
  permission mechanism; and never itself claims/records a phase outcome as a
  side effect of dispatch, process exit, or any other implicit event. Source:
  `spike.md` "make no Git commit, push, branch, merge, evaluator-private
  read, hidden workspace creation, permission bypass, or automatic
  phase-success claim."

## Evaluation Cases

- **E1** — Purpose: `init` produces a well-formed, empty local state that
  `status` can read back per TR1's shape, and an uninitialized spike never
  fabricates a recorded outcome. Verifies: R2, R16. Preconditions: a
  throwaway `spikes/999-*/` fixture directory. Action: run `init` then
  `status`; separately, run `status` on a never-`init`ed fixture. Expected:
  `status` output parses as `{ records: [...] }` with every element's
  `phase`/`attempt` well-typed, and no element reports an `outcome` before
  anything was recorded. Mandatory: yes. Test: `state-and-init.test.ts`.
- **E2** — Purpose: a full valid progression through all seven canonical
  phases only unlocks each phase after its predecessor is recorded
  `complete`, and `status` accumulates an append-only, growing record.
  Verifies: R1, R3, R6, I1, I3. Preconditions: an `init`ed fixture.
  Action: for each phase in canonical order, attempt the next phase early
  (expect rejection), then dispatch and record the current phase complete.
  Expected: every early attempt is rejected; every in-order dispatch/record
  succeeds; `status` reports every phase attempt 1 as `complete` at the end.
  Mandatory: yes. Test: `valid-progression.test.ts`.
- **E3** — Purpose: the sole permitted reopening — a failed
  `evaluator-verify` opens the next numbered `implementation` attempt — works
  end to end, and prior attempt records remain present. Verifies: R8, I3.
  Preconditions: a fixture advanced through `evaluator-prepare` complete.
  Action: dispatch/record `implementation` attempt 1 complete, dispatch/record
  `evaluator-verify` attempt 1 failed; confirm `as-built` stays locked;
  dispatch/record `implementation` attempt 2 and `evaluator-verify` attempt 2
  complete; confirm `as-built` now unlocks. Expected: attempt 1's
  `implementation`/`evaluator-verify` records remain readable with their
  original outcomes after attempt 2 completes. Mandatory: yes. Test:
  `retry-loop.test.ts` (first case).
- **E4** — Purpose: `evaluator-prepare` can never be redispatched by this
  runner, whether it was recorded with a non-`complete` terminal outcome or
  with `complete`, and never becomes redispatchable again during or after a
  later implementation retry loop. Verifies: R9. Two independent fixtures
  are used rather than one, because R7 forbids recording a second terminal
  outcome for the same numbered phase+attempt regardless of value, so a
  single `evaluator-prepare` attempt cannot legitimately be recorded
  `blocked` and then `complete`. Preconditions: two fixtures, each advanced
  to `evaluator-prepare`. Action (sub-case A): dispatch/record
  `evaluator-prepare` with a non-`complete` terminal outcome (`blocked`),
  attempt redispatch (expect rejection). Action (sub-case B): on the second
  fixture, dispatch/record `evaluator-prepare` `complete`, attempt redispatch
  (expect rejection); run a full failed-then-retried
  `implementation`/`evaluator-verify` cycle, attempt redispatch once more
  (expect rejection every time). Mandatory: yes. Test: `retry-loop.test.ts`
  (second and third cases).
- **E5** — Purpose: the four mandated rejections (TR2) each leave state
  unchanged. Verifies: R4, R5, R6, R7. Preconditions: fresh fixtures per
  sub-case. Action/expected, one sub-case per requirement: an unknown phase
  literal is rejected for both `dispatch` and `record`, and never appears in
  `status`; a set of non-spike paths (non-numeric prefix, `..` traversal,
  absolute outside the repo) is rejected by `init`/`status`/`dispatch`; a
  transition skipping ahead (both by one phase and by two) is rejected and
  never appears in `status`; a duplicate terminal outcome for an
  already-recorded phase+attempt is rejected whether or not the duplicate's
  value matches the original, and exactly one outcome remains recorded.
  Mandatory: yes. Test: `rejections.test.ts`.
- **E6** — Purpose: default `dispatch` (no `--execute`) is a true dry run.
  Verifies: R11. Preconditions: an `init`ed fixture; poisoned `codex`,
  `claude`, and `git` fixture executables placed first on `PATH` that would
  leave unmistakable evidence if ever invoked. Action: dispatch a
  Codex-owned phase and (separately) a Claude-owned phase without
  `--execute`. Expected: the printed command names the selected executor;
  none of the poisoned binaries are ever invoked; `status` records no job
  metadata for the dispatch. Mandatory: yes. Assumption: A2. Test:
  `dry-run.test.ts`.
- **E7/E8** — Purpose: `--execute` launches the owner's real CLI as a
  detached, non-blocking process with the exact stated argument vector, and
  records complete job metadata. Verifies: R12, R13, R14, R16. Preconditions:
  an `init`ed fixture (advanced to `evaluator-prepare` for the Claude-owned
  sub-case); a fixture `codex`/`claude` executable on `PATH` that sleeps
  briefly before exiting and emits a marker to stdout. Action: dispatch with
  `--execute` for a Codex-owned phase, then separately for the Claude-owned
  `evaluator-prepare`. Expected: `dispatch` returns well before the
  fixture's sleep completes; `status` reports a `job` object with a numeric
  `pid` that is genuinely alive immediately after dispatch and `live: true`;
  the recorded command matches `codex exec --cd <repository-root> <prompt>`
  (resp. `claude -p --permission-mode manual <prompt>`) exactly, invoked
  exactly once; after the fixture exits, the recorded log file contains its
  marker and `status` reports `live: false`. Mandatory: yes. Assumptions:
  A2, A3, A4. Test: `execute-detached-jobs.test.ts` (first two cases).
- **E9** — Purpose: a launched process's exit — even a clean, zero-status
  exit — is never itself treated as an implicit outcome. Verifies: R15, I2.
  Preconditions: an `init`ed fixture; a fixture `codex` that exits 0 quickly.
  Action: dispatch with `--execute`, wait for the fixture to exit, then
  attempt to dispatch the next phase before any `record` call; then call
  `record` explicitly and retry. Expected: the next-phase dispatch is
  rejected until the explicit `record`; no outcome appears in `status` before
  it; the next-phase dispatch succeeds only after the explicit `record`.
  Mandatory: yes. Test: `execute-detached-jobs.test.ts` (third case).
- **E10** — Purpose: `status` liveness reflects real OS process state, not
  the job's log content. Verifies: R16. Preconditions: an `init`ed fixture; a
  fixture `codex` that withholds its stdout marker until just before exit
  (so the log is empty while the process is still genuinely alive — a
  log-content-based liveness heuristic would misreport this). Action:
  dispatch with `--execute`; read `status` and the log file while the
  process is still running; wait for real exit; read `status` again.
  Expected: `live: true` while the log is still empty and the process is
  genuinely alive; `live: false` only once the process has actually exited.
  Mandatory: yes. Assumption: A1. Test:
  `status-liveness-and-cancel.test.ts` (first case).
- **E11** — Purpose: `cancel` terminates only the targeted phase's currently
  recorded live job, leaving a different phase's simultaneously live job
  untouched. Verifies: R17. Preconditions: an `init`ed fixture; a
  long-sleeping fixture `codex`. Action: start a live `--execute` job for
  `brief-readiness`, record it complete (independent of liveness), start
  another live `--execute` job for `design-map` while the first is still
  running, then `cancel brief-readiness`. Expected: the `brief-readiness`
  job's process actually terminates; the `design-map` job's process remains
  alive throughout; `status` reflects `live: false` / `live: true`
  respectively afterward. Mandatory: yes. Assumption: A1. Test:
  `status-liveness-and-cancel.test.ts` (second case).
- **E12** — Purpose: the rendered prompt/command names the target spike and
  the owning phase's repository skill, for both a Codex-owned and a
  Claude-owned phase, and never leaks evaluator-private paths or mechanics.
  Verifies: R1, R10, I1. Preconditions: an `init`ed fixture advanced through
  `design-map` complete. Action: dispatch (dry run) `brief-readiness`, then
  `evaluator-prepare`. Expected: each printed command contains the fixture's
  relative spike path and the phase's owning skill name (`brief-readiness`,
  `evaluator`), and contains none of `-hidden`, `.hidden-test`, `.eval/`,
  `eval-spec.md`, `freeze.json`, `attempt-ledger`. Mandatory: yes. Test:
  `prompt-ownership.test.ts`.
- **E13** — Purpose: `.workflow/state.json` and a job's log file are
  excluded from Git tracking by a real repository ignore rule. Verifies:
  R18. Preconditions: an `init`ed fixture; for the log sub-case, a fixture
  `codex` executed via `--execute`. Action: run `git check-ignore -q` and
  `git status --porcelain` against the real repository for the state file's
  absolute path and, separately, the recorded log file's absolute path.
  Expected: both paths are reported ignored, and the ignored `.workflow/`
  directory never appears as untracked in `git status`. Mandatory: yes.
  Test: `gitignore.test.ts`.

## Coverage Matrix

| Requirement/Invariant | Cases  | Coverage type | Hidden test file(s)               |
| ---------------------- | ------ | -------------- | ---------------------------------- |
| R1                     | E2, E12 | executable     | `valid-progression.test.ts`, `prompt-ownership.test.ts` |
| R2                     | E1     | executable     | `state-and-init.test.ts`           |
| R3                     | E2     | executable     | `valid-progression.test.ts`        |
| R4                     | E5     | executable     | `rejections.test.ts`               |
| R5                     | E5     | executable     | `rejections.test.ts`               |
| R6                     | E2, E5 | executable     | `valid-progression.test.ts`, `rejections.test.ts` |
| R7                     | E5     | executable     | `rejections.test.ts`               |
| R8                     | E3     | executable     | `retry-loop.test.ts`               |
| R9                     | E4     | executable     | `retry-loop.test.ts`               |
| R10                    | E12    | executable     | `prompt-ownership.test.ts`         |
| R11                    | E6     | executable     | `dry-run.test.ts`                  |
| R12                    | E7/E8  | executable     | `execute-detached-jobs.test.ts`    |
| R13                    | E7/E8  | executable     | `execute-detached-jobs.test.ts`    |
| R14                    | E7/E8, E13 | executable | `execute-detached-jobs.test.ts`, `gitignore.test.ts` |
| R15                    | E9     | executable     | `execute-detached-jobs.test.ts`    |
| R16                    | E1, E10 | executable    | `state-and-init.test.ts`, `status-liveness-and-cancel.test.ts` |
| R17                    | E11    | executable     | `status-liveness-and-cancel.test.ts` |
| R18                    | E13    | executable     | `gitignore.test.ts`                |
| I1                     | E2, E12 | executable     | `valid-progression.test.ts`, `prompt-ownership.test.ts` |
| I2                     | E9     | executable     | `execute-detached-jobs.test.ts`    |
| I3                     | E2, E3 | executable     | `valid-progression.test.ts`, `retry-loop.test.ts` |
| N1 (private-path/no-implicit-outcome clauses) | E9, E12 | executable | `execute-detached-jobs.test.ts`, `prompt-ownership.test.ts` |
| N1 (no-Git-write/no-evaluator-private-read clauses) | — | not independently covered | see Limitations |

This mapping agrees with `.hidden-test/manifest.json`.

## Out of Scope

- The real Codex or Claude CLI's own behavior; evaluation never installs or
  invokes a genuine agent binary (A2).
- The content/quality of the rendered prompt text beyond the required
  spike-path, skill-name, and forbidden-substring checks in E12.
- The evaluator skill's own `prepare`/`verify` behavior when the runner
  dispatches it; this spike only dispatches the skill, it does not
  reimplement or validate it.
- Human acceptance, and any behavior of `npm run typecheck` / `lint` /
  `format:check` / `git diff --check` — those are required public
  regressions checked during `verify`, not hidden evaluation cases here.
- The on-disk JSON schema of `.workflow/state.json` beyond the `status`
  output shape fixed by TR1; storage format is implementation freedom per
  the Design Map.
- Non-POSIX (e.g. Windows) process-signal behavior.

## Limitations

- No case independently proves the runner never performs a Git write
  (commit/push/branch/merge) or never reads evaluator-private paths (the
  git-write and evaluator-private-read clauses of N1). E13 shows the
  ignored files are never *tracked*, and E12 shows evaluator-private
  *paths* are never printed, but neither directly observes the absence of a
  stray `git commit`/`git add -f` or a stray read under `<project>-hidden/`.
  A future revision could add a case that snapshots `git log`/`git status`
  before and after a representative command sequence.
- A1's ~1-second liveness-transition polling tolerance is an evaluation
  timing assumption; an unusually slow or heavily loaded host could produce
  a flaky liveness assertion unrelated to a genuine implementation defect.
  This is a known limitation of black-box process-liveness testing.
- E9 exercises "process exit is never an implicit outcome" only for a clean
  (`exitCode: 0`) fixture exit; a non-zero fixture exit is not separately
  exercised, though R15 draws no such distinction and no separate defect
  class is expected there.

## Revision History

Initial frozen revision `001`. No prior revision exists. See the Pre-Freeze
Integrity Gate above for the pre-freeze cleanup of an orphaned, never-frozen
draft hidden-test generation discovered in the private workspace; that
cleanup preceded this revision's freeze and is not itself a correction of a
frozen revision.

### Revision `002` — correction of an `EVALUATOR_DEFECT` found during `verify` attempt `001`

Attempt `001`'s `verify` run against implementation commit
`git:e147e0f757699552d8d6e02a15618996174770a3` found that the second
`test(...)` case in `retry-loop.test.ts` (covering E4/R9) recorded a
`blocked` outcome for `evaluator-prepare` attempt 1 and then attempted to
record a `complete` outcome for the same phase+attempt, asserting the second
`record` call must succeed. This directly contradicts R7 ("`record` rejects
a second terminal outcome for the same numbered phase+attempt, regardless of
whether the second outcome value matches the first"), which is independently
frozen and independently, correctly verified by `rejections.test.ts` (E5) —
including its own "a second, different terminal outcome for the same
attempt must also be rejected" sub-case, run against the same implementation
commit. Both R7 and R9 are independent bullet points in `spike.md` with no
stated precedence or carve-out for `evaluator-prepare`; no requirement
licenses double-recording one attempt to exercise R9 under two different
outcome values. The implementation's rejection of the second `record` call
was confirmed correct (per R7), not defective; the hidden test's action
script was defective.

Correction: split the single "record blocked then complete" fixture into
two independent fixtures/`test(...)` cases — one that records
`evaluator-prepare` `blocked` and checks redispatch is rejected, and one
that records `evaluator-prepare` `complete` (with no prior outcome on that
attempt) and checks redispatch is rejected both immediately and after a full
failed-then-retried `implementation`/`evaluator-verify` cycle. This
preserves R9's full coverage (both outcome values, and the retry-loop
persistence claim) without violating R7. Only `retry-loop.test.ts` changed;
every other hidden test, support file, and this specification's other
content is unchanged from revision `001` (see the coverage-matrix and
requirement text above, and the unchanged content identities recorded in
`freeze.json` for every file other than `retry-loop.test.ts` and this
`eval-spec.md`).

Revision `001`'s exact frozen bundle (this file and `.hidden-test/**` as
they stood at revision `001`, plus its `freeze.json`) is preserved unchanged
under `.eval/revisions/001/` before this correction, per the evaluator
skill's correction procedure. Revision `001` is not eligible for public
promotion: its `retry-loop.test.ts` could never pass against any correct
implementation, so it does not provide durable, repeatable regression
coverage.
