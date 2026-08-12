# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/003-session-lifecycle`
- Project commit at draft time: `839c5114a01bb2014ef0c3da7765c6560f33c9df`
  (`spike.md` has local uncommitted changes since that commit — narrowing the
  "Session cleanup" section; its content hash below is authoritative)
- Hash of `spike.md` (git blob sha1): `0d8ce484dcceaed641febb359e2467897431513f`
- Hash of `eval-requirements.md` (git blob sha1):
  `e27760d0dd8742455123d841f5536111efb96dc1`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md`
- Evaluator skill revision: the skill file has local uncommitted changes
  (hardened after the attempt-001 verification); its own content hash (git
  hash-object) at draft time is `5444be2b04859aab38f58ded0b04cc18bcab32bb`.
  The last commit that touched this file is
  `db2aa4aa82d0f947342161859a0319e643c53984` ("chore: establish AI-first
  spike workflow"); the current content is the hardened revision described
  in that commit's follow-up (pre-freeze integrity gate, oracle/falsifiability
  validation, material-runtime-assumption validation, diagnostic probes,
  provenance recording).

## Relationship to Attempt 001

This is a second `prepare` pass for the same spike, superseding the archived
attempt at `spikes/003-session-lifecycle/attempts/001-Blocked/` (public) and
`harness-hidden/spikes/003-session-lifecycle/attempts/001-Blocked/` (private).
Attempt 001's `verify` returned `BLOCKED` for two independent reasons, both
addressed before this draft:

1. `spike.md`'s "Session cleanup" section has been narrowed to explicitly
   exclude descendant/background processes in separate process groups from
   the mandatory cleanup guarantee (previously ambiguous — see attempt 001's
   Finding 4). This removes the entire descendant-process-cleanup testing
   question from this spec's mandatory scope.
2. Attempt 001's hidden-test harness had three confirmed evaluator defects
   (a WebSocket-rejection helper that crashed on cleanup; a PTY-echo/regex
   collision that captured typed input instead of real command output; a
   Bash job-control "Done" notification that could satisfy an
   output-replay assertion for the wrong reason). This draft's hidden tests
   are rebuilt from scratch using patterns proven safe against these same
   failure modes — see the Pre-Freeze Integrity Gate section below.

## Explicit Requirements

- **R1** — `POST /sessions` with no active session creates a Bash/PTY session,
  assigns a stable ID, returns `201 Created` with JSON body
  `{"id": "<session-id>"}` and media type `application/json`. (spike.md,
  "Create a session")
- **R2** — A newly created session's ID differs from every session ID
  previously issued by that host process. (spike.md, "Create a session")
- **R3** — Only one active session is supported; a `POST /sessions` while a
  session is already active is rejected with `409 Conflict`. (spike.md,
  "Create a session")
- **R4** — Under concurrent `POST /sessions` requests while no session is
  active, exactly one succeeds; all others receive `409 Conflict`. (spike.md,
  "Create a session")
- **R5** — A client attaches over WebSocket at `/sessions/:id/ws`; when `:id`
  is the active session, the upgrade is accepted and bidirectional PTY
  behaviour (input to Bash, output to client) works. (spike.md, "Attach to a
  session")
- **R6** — If `:id` is unknown or refers to a previously stopped session, the
  WebSocket upgrade is rejected with `404 Not Found`. (spike.md, "Attach to a
  session")
- **R7** — Only one client may be attached at a time; a second attach attempt
  is rejected with `409 Conflict`, and the existing connection is left active
  and unchanged. (spike.md, "Attach to a session")
- **R9** — Disconnecting the WebSocket does not stop the underlying session; a
  later client can reattach with the same ID and continue interacting with the
  same shell; shell state (e.g. working directory, environment variables) set
  before disconnection survives reattachment. (spike.md, "Detach and
  reattach")
- **R10** — `DELETE /sessions/:id` for the active session terminates the
  PTY/Bash process, removes it from active state, prevents further
  attachment/interaction with that ID, and returns `204 No Content` only after
  cleanup completes (not merely upon request), including when Bash exits
  independently during cleanup. (spike.md, "Stop a session")
- **R11** — `DELETE /sessions/:id` when `:id` does not identify the active
  session returns `404 Not Found`. (spike.md, "Stop a session")
- **R12** — After a session is stopped, a new session may be created via
  `POST /sessions` and receives a new session ID. (spike.md, "Stop a session")
- **R13** — If a client is attached when the session is stopped, the attached
  WebSocket is closed, the underlying session is terminated, and no further
  client input can reach the terminated PTY. (spike.md, "Stop a session")
- **R14** — If the Bash process exits on its own (no explicit `DELETE`), the
  session is removed from active state, any attached WebSocket client is
  closed, and a new session may be created via `POST /sessions`. (spike.md,
  "Natural session exit")
- **R16** — After natural exit, the session's former ID is treated as unknown,
  the same as any other unknown or stopped session ID. (spike.md, "Natural
  session exit")
- **R17** _(narrowed from attempt 001)_ — Stopping a session, or shutting down
  Harness, terminates the PTY/Bash process owned directly by the session and
  closes any attached client. The spike explicitly does not require Harness
  to discover or terminate descendant/background processes that have moved
  into separate process groups — that is deferred to a future spike. (spike.md,
  "Session cleanup")
- **R18** — All supported Harness shutdown paths — the programmatic host
  shutdown mechanism, `SIGINT`, and `SIGTERM` — clean up the active session
  before the host finishes shutting down; after shutdown cleanup completes,
  the active PTY/Bash session is no longer running. (spike.md, "Harness
  shutdown")
- **R19** — Harness continues to bind only to `127.0.0.1`. (spike.md,
  "Networking")

## Derived Invariants

- **I1** — The `:id` path parameter is checked for equality against the
  active session's ID on both attach and stop; an arbitrary or unrelated ID
  is treated as unknown (`404`) even while a session is active. Derived from
  R6/R11 combined with the spike's explicit non-goal instruction that the
  implementation must "avoid public contracts that assume Harness can only
  ever identify one session."
- **I2** — A rejected (`409`) second `POST /sessions` must not alter the
  existing active session's state or ID. Derived from R3 combined with R7's
  "existing client connection active and unchanged" pattern applied
  symmetrically to session creation.
- **I3** — A rejected (`409`) second WebSocket attach must not disturb the
  first attached client's connection or ability to exchange input/output.
  Derived directly from R7's explicit text.
- **I4** — The active session slot is available for a new `POST /sessions`
  immediately once `204` has been returned for a `DELETE`, without additional
  delay. Derived from R10 ("active session slot is available for reuse") and
  R12.
- **I6** — WebSocket rejections (`404`/`409`) occur at the HTTP upgrade
  response itself; the implementation must not accept the upgrade (`101`) and
  then immediately close the connection to signal rejection. Derived from the
  spike's explicit phrase "reject the WebSocket upgrade with ...".
- **I7** — Repeating the stop/create cycle multiple times continues to yield
  distinct session IDs each time (not just once). Derived from R2 applied
  iteratively.
- **I8** — A `DELETE` for an ID that was previously the active session but has
  since been stopped (i.e. calling `DELETE` twice for the same former
  session) returns `404`, not `204`. Derived from R11 combined with the
  "stopped sessions are not retained" rule.

## Negative Requirements

- **N3** — Output produced by the PTY while no client is attached must not be
  retained or replayed to a later-attached client. (spike.md, non-goals: "Do
  not retain or replay PTY output while no client is attached.")
- **N4** — A stopped session's ID must not be retained or treated specially;
  it is indistinguishable from any other unknown ID for both attach and stop.
  (spike.md, "Stopped sessions are not retained" — stated twice.)

## Evaluation Cases

### Create

- **E1** — Purpose: verify basic session creation contract.
  Verifies: R1.
  Preconditions: fresh host, no active session.
  Action: `POST /sessions`.
  Expected: `201`, `content-type` includes `application/json`, body is JSON
  `{"id": "<non-empty string>"}`.
  Mandatory: yes.

- **E2** — Purpose: verify single-active-session enforcement and that
  rejection doesn't disturb the existing session.
  Verifies: R3, I2.
  Preconditions: one active session (ID `A`).
  Action: second `POST /sessions`; then attach to `A` and exchange
  input/output proving real execution (not just echo).
  Expected: second `POST` returns `409`; attach to `A` still succeeds and the
  shell still responds.
  Mandatory: yes.

- **E3** — Purpose: verify creation race has exactly one winner.
  Verifies: R4.
  Preconditions: fresh host, no active session.
  Action: fire several `POST /sessions` requests without awaiting between
  them.
  Expected: exactly one `201`; all others `409`.
  Mandatory: yes.
  Assumption: A3.

- **E4** — Purpose: verify ID uniqueness across create/stop cycles.
  Verifies: R2, I7, R12.
  Preconditions: fresh host.
  Action: create, stop, create, stop, create (three cycles).
  Expected: all three issued IDs are pairwise distinct.
  Mandatory: yes.

### Attach

- **E5** — Purpose: baseline attach + bidirectional PTY behaviour, proving
  genuine command execution (not merely PTY echo of the typed input).
  Verifies: R5.
  Preconditions: one active session (ID `A`).
  Action: attach at `/sessions/A/ws`; send a command whose marker is
  constructed so the target string cannot appear in the raw typed/echoed
  input, only in Bash's real output; read output.
  Expected: upgrade succeeds; the constructed marker is observed in output.
  Mandatory: yes.
  Assumption: A1, A2.

- **E6** — Purpose: attaching to a never-issued ID is rejected.
  Verifies: R6, I6.
  Preconditions: one active session (ID `A`); a syntactically different,
  never-issued ID `X`.
  Action: attempt attach at `/sessions/X/ws`.
  Expected: upgrade rejected with `404` at the HTTP response (never reaches
  `101`).
  Mandatory: yes.
  Assumption: A4.

- **E7** — Purpose: attaching to a previously stopped session's ID is
  rejected, not retained.
  Verifies: R6, N4.
  Preconditions: session created and stopped (ID `A`, now inactive).
  Action: attempt attach at `/sessions/A/ws`.
  Expected: upgrade rejected with `404`.
  Mandatory: yes.
  Assumption: A4.

- **E8** — Purpose: verify the active session's ID is actually checked on
  attach, not merely "some session is active."
  Verifies: R6, I1.
  Preconditions: one active session (ID `A`); a distinct, never-issued ID `X`.
  Action: attempt attach at `/sessions/X/ws` while `A` is active.
  Expected: upgrade rejected with `404`.
  Mandatory: yes.
  Assumption: A4.

- **E9** — Purpose: verify single-attachment enforcement and that rejection
  doesn't disturb the existing client.
  Verifies: R7, I3.
  Preconditions: one active session (ID `A`) with one client already
  attached.
  Action: attempt a second attach at `/sessions/A/ws`; then exchange
  input/output (genuine-execution marker) on the first client.
  Expected: second attach rejected with `409` at the HTTP response; first
  client remains open and functional.
  Mandatory: yes.
  Assumption: A4.

### Detach / Reattach

- **E10** — Purpose: verify detach does not stop the session and reattach
  reaches the same shell process.
  Verifies: R9.
  Preconditions: one active session (ID `A`) with an attached client.
  Action: read `$BASHPID`; close the client without stopping the session;
  attach a new client to `A`; read `$BASHPID` again.
  Expected: both `$BASHPID` values are identical.
  Mandatory: yes.

- **E11** — Purpose: verify shell state survives detach/reattach.
  Verifies: R9.
  Preconditions: one active session (ID `A`) with an attached client.
  Action: change working directory and export a distinctive environment
  variable (both set via commands whose markers are constructed to avoid
  PTY-echo collision); detach; reattach; read `$PWD` and the environment
  variable using the same collision-safe technique.
  Expected: both reflect the values set before detaching.
  Mandatory: yes.

- **E12** — Purpose: verify PTY output produced while detached is not
  retained/replayed.
  Verifies: N3.
  Preconditions: one active session (ID `A`) with an attached client.
  Action: start a `disown`'d background job that prints a distinctive marker
  after a short delay (disowning suppresses Bash's own job-control "Done"
  notification, which would otherwise echo the job's source command text and
  falsely satisfy a naive substring check); detach before the marker is
  printed; wait past the delay; reattach; send a new command producing a
  second, different marker; inspect all output received on the new
  connection up to and including the second marker.
  Expected: the first (stale) marker does not appear in output delivered to
  the reattached client.
  Mandatory: yes.

### Stop

- **E13** — Purpose: verify `204` genuinely means cleanup is complete and the
  slot is reusable.
  Verifies: R10, I4, R17.
  Preconditions: one active session (ID `A`); capture `$BASHPID` for `A`.
  Action: `DELETE /sessions/A`.
  Expected: `204`; immediately after the response, the captured PID is no
  longer a live OS process; a subsequent `POST /sessions` immediately
  succeeds with `201`.
  Mandatory: yes.

- **E14** — Purpose: verify stop while attached closes the client.
  Verifies: R13.
  Preconditions: one active session (ID `A`) with an attached client.
  Action: `DELETE /sessions/A`.
  Expected: the attached WebSocket connection is closed by the server; the
  `DELETE` returns `204`.
  Mandatory: yes.

- **E15** — Purpose: verify stop of a never-issued ID.
  Verifies: R11.
  Preconditions: no active session with the tested ID (fresh host or
  different active session).
  Action: `DELETE /sessions/<never-issued-id>`.
  Expected: `404`.
  Mandatory: yes.

- **E16** — Purpose: verify stop is not idempotent-successful; second delete
  of an already-stopped session is `404`.
  Verifies: R11, N4, I8.
  Preconditions: session created and stopped (ID `A`).
  Action: `DELETE /sessions/A` again.
  Expected: `404` (not `204`).
  Mandatory: yes.

- **E17** — Purpose: verify the active session's ID is actually checked on
  stop, not merely "some session is active."
  Verifies: R11, I1.
  Preconditions: one active session (ID `A`); a distinct, never-issued ID `X`.
  Action: `DELETE /sessions/X` while `A` is active.
  Expected: `404`; session `A` remains active and attachable afterward.
  Mandatory: yes.

### Natural exit

- **E18** — Purpose: verify Bash exiting on its own is treated like an
  explicit stop from the client/API perspective.
  Verifies: R14, R16.
  Preconditions: one active session (ID `A`) with an attached client.
  Action: send input that causes the shell process to exit on its own (the
  `exit` builtin) rather than calling `DELETE`.
  Expected: the attached WebSocket is closed by the server; a subsequent
  attach attempt to `A` is rejected `404`; a subsequent `POST /sessions`
  succeeds.
  Mandatory: yes.

### Shutdown

- **E19** — Purpose: verify programmatic host shutdown cleans up the active
  session's own PTY/Bash process.
  Verifies: R17, R18 (programmatic path).
  Preconditions: one active session with a captured shell PID.
  Action: invoke the host's programmatic shutdown/close mechanism.
  Expected: after shutdown completes, the captured PID is not a live OS
  process.
  Mandatory: yes.

- **E20** — Purpose: verify `SIGINT` and `SIGTERM` shutdown paths clean up
  the active session's own PTY/Bash process.
  Verifies: R18 (signal paths).
  Preconditions: the real CLI entrypoint running as a separate OS process
  (using the `PORT` override from T1), with one active session and a captured
  shell PID.
  Action: send `SIGINT` to the process; repeat independently and send
  `SIGTERM`.
  Expected: in both cases, after the process exits, the captured shell PID
  is no longer a live OS process.
  Mandatory: yes.
  Testability requirement: T1.

### Networking

- **E21** — Purpose: regression check that the localhost-only posture is
  unchanged.
  Verifies: R19.
  Preconditions: a running host.
  Action: inspect the bound address.
  Expected: bound address is `127.0.0.1`.
  Mandatory: yes.

## Coverage Matrix

| ID  | Covered by     | Executable | Test file(s)                                   |
| --- | -------------- | ---------- | ---------------------------------------------- |
| R1  | E1             | yes        | session-create.test.ts                         |
| R2  | E4             | yes        | session-create.test.ts                         |
| R3  | E2             | yes        | session-create.test.ts                         |
| R4  | E3             | yes        | session-create.test.ts                         |
| R5  | E5             | yes        | session-attach.test.ts                         |
| R6  | E6, E7, E8     | yes        | session-attach.test.ts                         |
| R7  | E9             | yes        | session-attach.test.ts                         |
| R9  | E10, E11       | yes        | session-detach-reattach.test.ts                |
| R10 | E13            | yes        | session-stop.test.ts                           |
| R11 | E15, E16, E17  | yes        | session-stop.test.ts                           |
| R12 | E4, E13        | yes        | session-create.test.ts, session-stop.test.ts   |
| R13 | E14            | yes        | session-stop.test.ts                           |
| R14 | E18            | yes        | session-natural-exit.test.ts                   |
| R16 | E18            | yes        | session-natural-exit.test.ts                   |
| R17 | E13, E19       | yes        | session-stop.test.ts, session-shutdown.test.ts |
| R18 | E19, E20       | yes        | session-shutdown.test.ts                       |
| R19 | E21            | yes        | session-networking.test.ts                     |
| I1  | E8, E17        | yes        | session-attach.test.ts, session-stop.test.ts   |
| I2  | E2             | yes        | session-create.test.ts                         |
| I3  | E9             | yes        | session-attach.test.ts                         |
| I4  | E13            | yes        | session-stop.test.ts                           |
| I6  | E6, E7, E8, E9 | yes        | session-attach.test.ts                         |
| I7  | E4             | yes        | session-create.test.ts                         |
| I8  | E16            | yes        | session-stop.test.ts                           |
| N3  | E12            | yes        | session-detach-reattach.test.ts                |
| N4  | E7, E16        | yes        | session-attach.test.ts, session-stop.test.ts   |

This mapping must agree with `.hidden-test/manifest.json`.

## Out of Scope

- Exact response bodies/content-types for `409` and `404` responses (spike.md
  states the `409` body is not part of the contract; no body shape is
  specified for `404`s either).
- Behaviour of HTTP methods other than `POST`/`DELETE` on `/sessions` and
  `/sessions/:id`, and any method other than the WebSocket upgrade on
  `/sessions/:id/ws` (not specified by the spike).
- Session ID format, encoding, or generation algorithm (opaque per A2).
- Exit status, exit code, signal, or termination reason of the Bash process
  (explicit non-goal).
- **Cleanup of descendant or background processes in separate process
  groups** — explicitly out of scope per the narrowed "Session cleanup"
  section and the new non-goal "Do not guarantee cleanup of background or
  descendant processes outside the PTY/Bash process group directly managed
  by Harness." No mandatory case asserts this either way.
- Persistence of sessions across a full Harness _process_ restart in any
  sense beyond "a fresh process starts with no active session" (already
  implied by in-memory-only state; not separately tested as its own case).
- Precise interleaving of a `POST /sessions` that arrives while a `DELETE`
  cleanup is in flight but before `204` has been returned — the spec
  specifies postconditions once `204` is returned, not the observable state
  during the cleanup window itself.

## Limitations

- E3 and E9 (concurrency races) rely on Node's single-threaded event-loop
  model to make "exactly one winner" achievable without true OS parallelism,
  consistent with the project's own established test pattern (see
  `test/spike.integration.test.ts`, which already exercises this exact race
  with `Promise.all`).
- E20 depends on being able to spawn the real CLI entrypoint as a child
  process and control its port via `PORT` (T1). The current implementation
  already wires this; if a future implementation wires a differently-named
  variable, that is a `SPECIFICATION_AMBIGUITY`/`EVALUATOR_DEFECT` to
  distinguish from a real `IMPLEMENTATION_FAILURE`, not an automatic fail —
  verification must check T1 compliance independently before concluding E20
  failed.
- The "no active session at fresh host startup" precondition assumed by E1's
  setup is exercised implicitly by every test's setup step; it is not
  separately asserted as its own mandatory case.

## Pre-Freeze Integrity Gate

All four checks passed before `Status` was set to `Frozen`.

### Shared helpers identified and validated

Two non-trivial shared helpers were identified in `.hidden-test/helpers.ts`:

- **Connection-rejection helper** (`connect` / `rejectedUpgrade`) — used by
  10 of the 21 mandatory cases (E2, E5–E9, E13, E17, E18, plus setup in
  several others). This is exactly the helper that crashed in attempt 001.
  Independently validated in `helpers.selfcheck.test.ts` against a minimal
  local WebSocket-upgrade fixture, unrelated to Harness: a positive control
  (server accepts → `connect()` resolves an open socket) and a negative
  control (server rejects with `404`/`409` → `rejectedUpgrade()` resolves
  that status without throwing). Both pass. The implementation deliberately
  mirrors the exact pattern already proven in the project's own visible test
  (`test/spike.integration.test.ts`'s `rejectedUpgrade`) rather than
  attempt 001's bespoke (and buggy) `.terminate()`-based cleanup.
- **Execution-marker builder** (`buildQueryCommand`) — used by every case
  that must prove genuine Bash execution rather than PTY local-echo (E2, E5,
  E9, E11) or that must avoid Bash's job-control notification confound
  (indirectly informs E12's design). Independently validated in the same
  self-check file with three assertions: the raw typed/echoed command text
  does not satisfy the pattern (negative control 1, attempt 001's second
  confirmed defect); a synthetic Bash job-control "Done" notification
  quoting the command does not satisfy the pattern either (negative control
  2, attempt 001's third confirmed defect); and the genuine post-execution
  output line does satisfy the pattern and captures the correct value
  (positive control). All three pass.

Both self-checks are marked `"support"` in `manifest.json`, not represented
as evaluation cases.

A single helper defect cannot silently invalidate more mandatory cases than
necessary here: the two helpers are small, single-purpose functions (not one
do-everything utility), each independently self-checked, and 21 separate
mandatory-case tests each make their own explicit assertions on top of them
rather than delegating pass/fail judgement to the helper itself.

### Oracle and falsifiability validated per mandatory case

For status-code-only cases (E1, E3, E4, E6–E8, E13–E17, E21) the oracle is a
direct HTTP/WS status comparison — deterministic and needs no further
control per the gate's own guidance ("do not build elaborate controls for
trivial, deterministic assertions").

For cases whose oracle depends on PTY output content (E2, E5, E9, E10, E11,
E12, E18):

- E2, E5, E9 ("still alive" / "genuine execution" checks) use
  `buildQueryCommand`, validated above — an implementation that only echoes
  input without executing it would fail these (no real output line would
  ever appear), and a correct implementation satisfies them.
- E10 uses `$BASHPID`, captured via `buildQueryCommand`'s `\d+`-safe
  wrapper — an implementation that spawns a _new_ shell on reattach
  (instead of reusing the existing one) would fail this by producing a
  different PID; a correct implementation satisfies it.
- E11's `$PWD`/environment-variable checks use the same collision-safe
  construction — an implementation that doesn't actually persist shell
  state across detach/reattach would fail this (wrong or empty value); one
  that does persist state satisfies it.
- E12 (no replay) uses a `disown`'d background job — validated empirically
  (see Material Runtime Assumptions below) to eliminate the one confound
  that made attempt 001's version of this case unfalsifiable. An
  implementation that buffers and replays stale PTY output on reattach
  would fail this by producing the stale marker on the new connection; one
  that doesn't buffer satisfies it.
- E18 (natural exit) checks the WebSocket `close` event plus a follow-up
  `404`/`201` — an implementation that doesn't detect process exit
  independently of an explicit `DELETE` would fail this (the socket would
  never close, and the timeout would fail the test); one that does detect
  it satisfies it.

### Material runtime assumptions validated

Two non-obvious PTY/Bash behaviours were validated empirically with a
throwaway `node-pty` diagnostic before being relied on (see the session
transcript; not retained as a hidden-test artifact):

1. A command constructed as `h=<head>; echo "${h}<tail>:<expr>"` never
   contains the contiguous string `<head><tail>` in its own raw/echoed text,
   only in Bash's real evaluated output — confirmed directly against this
   project's actual `node-pty`-spawned interactive Bash (`--noprofile
--norc -i`), not assumed from general PTY theory.
2. `( <command> ) & disown` suppresses Bash's job-control "Done"
   notification entirely for that job — confirmed directly against the same
   Bash configuration. Without `disown`, the notification would echo the
   job's source command text on the next interactive prompt, which is
   exactly what made attempt 001's E12 unfalsifiable.

No ambiguity was exposed by this validation (unlike attempt 001's
process-group validation, which did expose a real spike ambiguity — that
ambiguity has since been resolved in `spike.md` itself and is reflected in
this spec's narrowed R17).

### Harness validated mechanically

- All hidden test files (including the two support files) are discovered
  and executed by `node --test` when given explicit paths.
- `tsc --noEmit` against a temporary config extending the project's
  `tsconfig.json` (with `include` widened to the hidden-test directory)
  reports zero errors.
- `eval-requirements.md` and every file under `.hidden-test/` pass
  `prettier --check` (the project's format-check) — run and fixed _before_
  the hashes recorded in this document's `Source` section were computed, per
  the evaluator skill's Formatting section.
- A full run of all 25 test invocations (3 support + 22 mandatory-case
  invocations covering 21 cases, E20 run once per signal) against the
  current implementation (`839c5114a01bb2014ef0c3da7765c6560f33c9df` plus
  uncommitted `spike.md`) completed in ~5.2s with 25/25 passing and no
  leftover processes. A clean pass here is not required by this gate (only
  that the harness _runs_ reliably is), but it is recorded as useful
  context: it means this freeze is not being finalized blind.

## Revision History

- v2 (this document) — second `prepare` pass for spike 003, following
  attempt 001's `BLOCKED` verification. Supersedes attempt 001's frozen spec
  (archived, not deleted, under `attempts/001-Blocked/`). Reflects: (a) the
  narrowed R17 removing descendant-process-cleanup from mandatory scope; (b)
  hidden tests rebuilt to avoid attempt 001's three confirmed evaluator
  defects, using patterns validated in the Pre-Freeze Integrity Gate below
  and cross-checked against `test/spike.integration.test.ts`'s established,
  already-proven helper patterns.
- v1 — attempt 001's initial frozen version (archived under
  `attempts/001-Blocked/`; verification result `BLOCKED`, not promoted).
