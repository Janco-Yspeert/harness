# Evaluation Requirements

## Testability Requirements

- **TR1** — Requirement: `npm run workflow -- status <spike>` must print, as its
  entire stdout (surrounding whitespace only), one JSON document parseable by
  `JSON.parse`, shaped as `{ "records": [...] }`. `records` lists every
  init/dispatch/job/outcome event recorded so far, in chronological (append)
  order. Each element carries at least a `phase` field (one of the seven
  canonical phase identifiers in TR4) and an `attempt` field (a positive
  integer). A given phase+attempt pair may be represented by more than one
  array element as its lifecycle progresses (for example, one element for its
  dispatch and a separate later element for its recorded outcome); a fact
  about a phase+attempt is determined by scanning every matching element, not
  by assuming one merged element. An element reflecting a `--execute` dispatch
  includes a `job` object with at least: `pid` (number — the OS process id of
  the detached executor process), `command` (a string or array of strings
  identifying the invoked program and arguments), `logPath` (a string path to
  the job's combined-output log file), and `live` (boolean, computed at the
  moment `status` runs — true iff the OS process identified by `pid` is
  currently running, never derived from reading `logPath`'s content). An
  element reflecting a recorded terminal outcome includes an `outcome` field
  whose value is exactly `"complete"`, `"blocked"`, or `"failed"`.
  Reason: the brief and Design Map require the runner to record and report
  phase/attempt identity, job PID/command/log path, and liveness, and require
  `status` to print this as JSON, but leave exact schema/storage details as
  implementation freedom. This is the minimal shared shape a correct
  implementation and independent evaluation can agree on without constraining
  internal storage. Source: brief "`status` reports recorded job metadata and
  liveness without parsing agent output" and "`status` prints the current
  phase records as JSON"; Design Map "`status` may report liveness for a
  recorded job without inspecting its output." Implementation impact:
  `status`'s JSON-printing code must expose these fields; the on-disk
  `.workflow/state.json` storage format remains free.

- **TR2** — Requirement: every operation the brief/Design Map require the
  runner to reject — an unknown phase; a `<spike>` argument that is not a
  normalized `spikes/NNN-*/` path resolving beneath the repository root
  (including traversal or an arbitrary directory); a phase dispatch that
  skips a required prior phase; redispatch of `evaluator-prepare` after any
  recorded outcome for it; recording a second terminal outcome for a
  phase+attempt that already has one — exits with a non-zero process exit
  code, writes its error to stderr, and makes no change to
  `<spike>/.workflow/state.json` and no process launch. Reason: evaluation
  needs one reliable, error-message-independent signal to detect a rejection
  deterministically. Source: brief "reject an unknown phase, a non-spike
  path, a transition that skips a prior phase, and a duplicate terminal
  outcome..."; "evaluator prepare cannot be repeated by this runner."
  Implementation impact: validation must occur, and fail via a non-zero exit
  code, before any state write or process spawn.

- **TR3** — Requirement: because the brief specifies invoking the executor by
  its bare program name (`codex`, `claude`) via an argument vector without a
  shell, the operating-system executable lookup for that name uses the
  invoking process's inherited `PATH` (confirmed empirically: Node's
  `child_process.spawn` with `shell: false` performs the same `PATH` search a
  shell would, given a bare command name that contains no path separator). No
  hardcoded absolute interpreter path may replace this lookup. Reason:
  evaluation constructs and observes real subprocess launches by placing
  fixture executables named `codex`/`claude` earlier on `PATH`, without ever
  installing or invoking a genuine Codex or Claude CLI. Source: brief "invoke
  Codex using `codex exec --cd <repository-root>`... Claude using `claude -p
  --permission-mode manual`"; Design Map "Argument vectors—not a
  shell—construct the Codex and Claude commands." Implementation impact:
  none beyond what the brief already requires; this makes an already-necessary
  consequence explicit and records that it was validated for evaluation.

- **TR4** — Requirement: the `<phase>` argument literal for each canonical
  phase is exactly the kebab-case identifier matching its repository skill
  directory name: `brief-readiness`, `design-map`, `implementation`,
  `as-built`, `outcome` (Codex-owned), and `evaluator-prepare`,
  `evaluator-verify` (Claude-owned; both name the shared `evaluator` skill,
  distinguished by its `prepare`/`verify` mode). Reason: the brief names
  phases only in prose ("Brief Readiness", "evaluator prepare", ...);
  evaluation must invoke `dispatch`/`record` with concrete argument strings.
  Source: brief "define the canonical phases and their responsible agent";
  repository skill directories `skills/brief-readiness`, `skills/design-map`,
  `skills/implementation`, `skills/as-built`, `skills/outcome`,
  `skills/evaluator`. Implementation impact: the seven accepted `<phase>`
  values are fixed to these literals; any other literal is an unknown phase
  under TR2.

- **TR5** — Requirement: the literal path `<spike>/.workflow/state.json` (as
  named verbatim in the brief) and every job log file the runner writes are
  located under `<spike>/.workflow/` and are excluded from Git tracking by a
  repository ignore rule. Reason: evaluation checks real ignoredness with
  `git check-ignore` against these concrete paths. Source: brief "create an
  append-only, local `.workflow/state.json`"; "write each detached job's
  combined output to a local ignored per-spike log"; Design Map "job output
  lives in the same local directory"; "must add an ignore rule for
  `.workflow/`." Implementation impact: none beyond what the brief already
  requires; this fixes the concrete paths evaluation checks.

## Evaluator Assumptions

- **A1** — Assumption: a job's "currently live" state is checked by signaling
  the recorded PID without delivering a real signal (POSIX signal 0) rather
  than by any other liveness technique, tolerating ordinary process
  start/exit scheduling delay (evaluation waits up to roughly one second where
  a transition is expected). Evaluation impact: liveness assertions poll
  rather than sample exactly once at zero delay.

- **A2** — Assumption: evaluation substitutes fixture executables named
  `codex`/`claude` (ordinary POSIX shell scripts) earlier on `PATH` than any
  real installed binary; "no real agent invoked" is evidenced by the
  fixture's own invocation log, not by the absence of a real Codex/Claude
  installation. Evaluation impact: cases that exercise `--execute` require a
  `PATH` the evaluation controls; they do not require or assume a real Codex
  or Claude CLI is absent from the host.

- **A3** — Assumption: "combined output" (brief) means both the detached
  process's stdout and stderr land in the same recorded log file; evaluation
  writes distinguishable fixture output to stdout only and confirms it
  appears in that file, without asserting a specific stdout/stderr
  interleaving order.

- **A4** — Assumption: `<repository-root>` in `codex exec --cd
  <repository-root>` is the absolute path of the public project root the
  `npm run workflow` invocation resolves against. Evaluation impact: the
  fixture `codex` invocation's recorded `--cd` argument is compared against
  that absolute path.

## Blocking Questions

None. The frozen brief and Design Map, together with TR1–TR5 above, settle
phase identifiers, rejection signaling, the state-inspection surface, the
executor-substitution seam, and the Git-ignored paths well enough for fair,
black-box evaluation. No material ambiguity was found that would prevent it.
Remaining details (on-disk state-file schema, liveness technique, log format,
error presentation) are explicitly reserved as implementation freedom by the
Design Map and are not evaluated beyond the shapes fixed above.

## Environment Requirements

- Node.js `>=24.12.0` (per `package.json` `engines`), run with the public
  project's own dependencies and working directory (the repository root).
- POSIX process-signal facilities (`kill(pid, 0)` liveness checks, `SIGTERM`
  delivery) on the existing Ubuntu host; no additional runtime is required.
- The real `git` CLI is used by evaluation itself to confirm `.gitignore`
  behavior for `.workflow/`; this is evaluation infrastructure, not something
  the runner under test is expected to invoke.
- No external services, environment variables, or additional test tooling
  beyond the public project's existing `node --test` runner are required.
