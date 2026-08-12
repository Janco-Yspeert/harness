# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/003-session-lifecycle`
- Project commit at freeze time: `db2aa4aa82d0f947342161859a0319e643c53984`
  (note: `spike.md` was untracked/uncommitted at freeze time; its content hash
  below is authoritative for drift detection)
- Hash of `spike.md` (git blob sha1): `68e65a91d4034cfa387f2d21bfd0ad5343d0fd69`
- Hash of `eval-requirements.md` (git blob sha1):
  `3d01b0c07c3d9929d18bcd4c06853615eabcf8e8`

## Explicit Requirements

- **R1** — `POST /sessions` with no active session creates a Bash/PTY session,
  assigns a stable ID, returns `201 Created` with JSON body
  `{"id": "<session-id>"}` and media type `application/json`. (spike.md, "Create
  a session")
- **R2** — A newly created session's ID differs from every session ID previously
  issued by that host process. (spike.md, "Create a session")
- **R3** — Only one active session is supported; a `POST /sessions` while a
  session is already active is rejected with `409 Conflict`. (spike.md, "Create
  a session")
- **R4** — Under concurrent `POST /sessions` requests while no session is
  active, exactly one succeeds; all others receive `409 Conflict`. (spike.md,
  "Create a session")
- **R5** — A client attaches over WebSocket at `/sessions/:id/ws`; when `:id` is
  the active session, the upgrade is accepted and bidirectional PTY behaviour
  (input to Bash, output to client) works. (spike.md, "Attach to a session")
- **R6** — If `:id` is unknown or refers to a previously stopped session, the
  WebSocket upgrade is rejected with `404 Not Found`. (spike.md, "Attach to a
  session")
- **R7** — Only one client may be attached at a time; a second attach attempt is
  rejected with `409 Conflict`, and the existing connection is left active and
  unchanged. (spike.md, "Attach to a session")
- **R9** — Disconnecting the WebSocket does not stop the underlying session; a
  later client can reattach with the same ID and continue interacting with the
  same shell; shell state (e.g. working directory, environment variables) set
  before disconnection survives reattachment. (spike.md, "Detach and reattach")
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
  session is removed from active state, any attached WebSocket client is closed,
  and a new session may be created via `POST /sessions`. (spike.md, "Natural
  session exit")
- **R16** — After natural exit, the session's former ID is treated as unknown,
  the same as any other unknown or stopped session ID. (spike.md, "Natural
  session exit")
- **R17** — Stopping a session (or Harness shutdown) terminates Bash and
  processes still belonging to the PTY's managed process group before cleanup
  completes. (spike.md, "Session cleanup")
- **R18** — All supported Harness shutdown paths — the programmatic host
  shutdown mechanism, `SIGINT`, and `SIGTERM` — clean up the active session
  before the host finishes shutting down; after shutdown cleanup completes, the
  active PTY/Bash session is no longer running. (spike.md, "Harness shutdown")
- **R19** — Harness continues to bind only to `127.0.0.1`. (spike.md,
  "Networking")

## Derived Invariants

- **I1** — The `:id` path parameter is checked for equality against the active
  session's ID on both attach and stop; an arbitrary or unrelated ID is treated
  as unknown (`404`) even while a session is active. Derived from R6/R11
  combined with the spike's explicit non-goal instruction that the
  implementation must "avoid public contracts that assume Harness can only ever
  identify one session" — the endpoint must genuinely check the identifier, not
  merely check "is any session active."
- **I2** — A rejected (`409`) second `POST /sessions` must not alter the
  existing active session's state or ID. Derived from R3 combined with R7's
  explicit "existing client connection active and unchanged" pattern applied
  symmetrically to session creation.
- **I3** — A rejected (`409`) second WebSocket attach must not disturb the first
  attached client's connection or ability to exchange input/output. Derived
  directly from R7's explicit text.
- **I4** — The active session slot is available for a new `POST /sessions`
  immediately once `204` has been returned for a `DELETE`, without additional
  delay. Derived from R10 ("active session slot is available for reuse") and
  R12.
- **I6** — WebSocket rejections (`404`/`409`) occur at the HTTP upgrade response
  itself; the implementation must not accept the upgrade (`101`) and then
  immediately close the connection to signal rejection. Derived from the spike's
  explicit phrase "reject the WebSocket upgrade with ...".
- **I7** — Repeating the stop/create cycle multiple times continues to yield
  distinct session IDs each time (not just once). Derived from R2 applied
  iteratively.
- **I8** — A `DELETE` for an ID that was previously the active session but has
  since been stopped (i.e. calling `DELETE` twice for the same former session)
  returns `404`, not `204`. Derived from R11 combined with the "stopped sessions
  are not retained" rule.

## Negative Requirements

- **N3** — Output produced by the PTY while no client is attached must not be
  retained or replayed to a later-attached client. (spike.md, non-goals: "Do not
  retain or replay PTY output while no client is attached.")
- **N4** — A stopped session's ID must not be retained or treated specially; it
  is indistinguishable from any other unknown ID for both attach and stop.
  (spike.md, "Stopped sessions are not retained" — stated twice.)

## Evaluation Cases

### Create

- **E1** — Purpose: verify basic session creation contract. Verifies: R1.
  Preconditions: fresh host, no active session. Action: `POST /sessions`.
  Expected: `201`, `content-type` includes `application/json`, body is JSON
  `{"id": "<non-empty string>"}`. Mandatory: yes.

- **E2** — Purpose: verify single-active-session enforcement and that rejection
  doesn't disturb the existing session. Verifies: R3, I2. Preconditions: one
  active session (ID `A`). Action: second `POST /sessions`; then attach to `A`
  and exchange input/output. Expected: second `POST` returns `409`; attach to
  `A` still succeeds and the shell still responds. Mandatory: yes.

- **E3** — Purpose: verify creation race has exactly one winner. Verifies: R4.
  Preconditions: fresh host, no active session. Action: fire several
  `POST /sessions` requests without awaiting between them. Expected: exactly one
  `201`; all others `409`. Mandatory: yes. Assumption: A3.

- **E4** — Purpose: verify ID uniqueness across create/stop cycles. Verifies:
  R2, I7, R12. Preconditions: fresh host. Action: create, stop, create, stop,
  create (three cycles). Expected: all three issued IDs are pairwise distinct.
  Mandatory: yes.

### Attach

- **E5** — Purpose: baseline attach + bidirectional PTY behaviour. Verifies: R5.
  Preconditions: one active session (ID `A`). Action: attach at
  `/sessions/A/ws`; send input; read output. Expected: upgrade succeeds; a
  distinctive marker sent as input is echoed back through PTY output. Mandatory:
  yes. Assumption: A1, A2.

- **E6** — Purpose: attaching to a never-issued ID is rejected. Verifies: R6,
  I6. Preconditions: one active session (ID `A`); a syntactically different,
  never-issued ID `X`. Action: attempt attach at `/sessions/X/ws`. Expected:
  upgrade rejected with `404` at the HTTP response (never reaches `101`).
  Mandatory: yes. Assumption: A4.

- **E7** — Purpose: attaching to a previously stopped session's ID is rejected,
  not retained. Verifies: R6, N4. Preconditions: session created and stopped (ID
  `A`, now inactive). Action: attempt attach at `/sessions/A/ws`. Expected:
  upgrade rejected with `404`. Mandatory: yes. Assumption: A4.

- **E8** — Purpose: verify the active session's ID is actually checked on
  attach, not merely "some session is active." Verifies: R6, I1. Preconditions:
  one active session (ID `A`); a distinct, never-issued ID `X`. Action: attempt
  attach at `/sessions/X/ws` while `A` is active. Expected: upgrade rejected
  with `404` (not accepted as if any active session matches). Mandatory: yes.
  Assumption: A4.

- **E9** — Purpose: verify single-attachment enforcement and that rejection
  doesn't disturb the existing client. Verifies: R7, I3. Preconditions: one
  active session (ID `A`) with one client already attached. Action: attempt a
  second attach at `/sessions/A/ws`; then exchange input/output on the first
  client. Expected: second attach rejected with `409` at the HTTP response;
  first client remains open and functional. Mandatory: yes. Assumption: A4.

### Detach / Reattach

- **E10** — Purpose: verify detach does not stop the session and reattach
  reaches the same shell process. Verifies: R9. Preconditions: one active
  session (ID `A`) with an attached client. Action: read `$BASHPID`; close the
  client without stopping the session; attach a new client to `A`; read
  `$BASHPID` again. Expected: both `$BASHPID` values are identical. Mandatory:
  yes.

- **E11** — Purpose: verify shell state survives detach/reattach. Verifies: R9.
  Preconditions: one active session (ID `A`) with an attached client. Action:
  change working directory and export a distinctive environment variable;
  detach; reattach; read `$PWD` and the environment variable. Expected: both
  reflect the values set before detaching. Mandatory: yes.

- **E12** — Purpose: verify PTY output produced while detached is not
  retained/replayed. Verifies: N3. Preconditions: one active session (ID `A`)
  with an attached client. Action: start a background job that prints a
  distinctive marker after a short delay; detach before the marker is printed;
  wait past the delay; reattach; send a new command producing a second,
  different marker; inspect all output received on the new connection up to and
  including the second marker. Expected: the first (stale) marker does not
  appear in output delivered to the reattached client. Mandatory: yes.

### Stop

- **E13** — Purpose: verify `204` genuinely means cleanup is complete and the
  slot is reusable. Verifies: R10, I4, R17. Preconditions: one active session
  (ID `A`); capture `$BASHPID` for `A`. Action: `DELETE /sessions/A`. Expected:
  `204`; immediately after the response, the captured PID is no longer a live OS
  process; a subsequent `POST /sessions` immediately succeeds with `201`.
  Mandatory: yes.

- **E14** — Purpose: verify stop while attached closes the client and blocks
  further input. Verifies: R13. Preconditions: one active session (ID `A`) with
  an attached client. Action: `DELETE /sessions/A`. Expected: the attached
  WebSocket connection is closed by the server; the `DELETE` returns `204`.
  Mandatory: yes.

- **E15** — Purpose: verify process-group descendants are also terminated.
  Verifies: R17. Preconditions: one active session (ID `A`) with an attached
  client. Action: start a long-running background child process inside the shell
  and capture its PID; `DELETE /sessions/A`. Expected: after `204`, the
  background child's PID is no longer a live OS process. Mandatory: yes.

- **E16** — Purpose: verify stop of a never-issued ID. Verifies: R11.
  Preconditions: no active session with the tested ID (fresh host or different
  active session). Action: `DELETE /sessions/<never-issued-id>`. Expected:
  `404`. Mandatory: yes.

- **E17** — Purpose: verify stop is not retried/idempotent-successful; second
  delete of an already-stopped session is `404`. Verifies: R11, N4, I8.
  Preconditions: session created and stopped (ID `A`). Action:
  `DELETE /sessions/A` again. Expected: `404` (not `204`). Mandatory: yes.

- **E18** — Purpose: verify the active session's ID is actually checked on stop,
  not merely "some session is active." Verifies: R11, I1. Preconditions: one
  active session (ID `A`); a distinct, never-issued ID `X`. Action:
  `DELETE /sessions/X` while `A` is active. Expected: `404`; session `A` remains
  active and attachable afterward. Mandatory: yes.

### Natural exit

- **E19** — Purpose: verify Bash exiting on its own is treated like an explicit
  stop from the client/API perspective. Verifies: R14, R16. Preconditions: one
  active session (ID `A`) with an attached client. Action: send input that
  causes the shell process to exit on its own (e.g. the `exit` builtin) rather
  than calling `DELETE`. Expected: the attached WebSocket is closed by the
  server; a subsequent attach attempt to `A` is rejected `404`; a subsequent
  `POST /sessions` succeeds. Mandatory: yes.

### Shutdown

- **E20** — Purpose: verify programmatic host shutdown cleans up the active
  session and its process-group descendants. Verifies: R17, R18 (programmatic
  path). Preconditions: one active session with a captured shell PID and a
  captured background-child PID. Action: invoke the host's programmatic
  shutdown/close mechanism. Expected: after shutdown completes, neither PID is a
  live OS process. Mandatory: yes.

- **E21** — Purpose: verify `SIGINT` and `SIGTERM` shutdown paths clean up the
  active session. Verifies: R18 (signal paths). Preconditions: the real CLI
  entrypoint running as a separate OS process (using the `PORT` override from
  T1), with one active session and a captured shell PID. Action: send `SIGINT`
  to the process; repeat the scenario independently and send `SIGTERM`.
  Expected: in both cases, after the process exits, the captured shell PID is no
  longer a live OS process. Mandatory: yes. Testability requirement: T1.

### Networking

- **E22** — Purpose: regression check that the localhost-only posture is
  unchanged. Verifies: R19. Preconditions: a running host. Action: inspect the
  bound address. Expected: bound address is `127.0.0.1` (not `0.0.0.0` or any
  other interface). Mandatory: yes.

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
| R11 | E16, E17, E18  | yes        | session-stop.test.ts                           |
| R12 | E4, E13        | yes        | session-create.test.ts, session-stop.test.ts   |
| R13 | E14            | yes        | session-stop.test.ts                           |
| R14 | E19            | yes        | session-natural-exit.test.ts                   |
| R16 | E19            | yes        | session-natural-exit.test.ts                   |
| R17 | E15, E20       | yes        | session-stop.test.ts, session-shutdown.test.ts |
| R18 | E20, E21       | yes        | session-shutdown.test.ts                       |
| R19 | E22            | yes        | session-networking.test.ts                     |
| I1  | E8, E18        | yes        | session-attach.test.ts, session-stop.test.ts   |
| I2  | E2             | yes        | session-create.test.ts                         |
| I3  | E9             | yes        | session-attach.test.ts                         |
| I4  | E13            | yes        | session-stop.test.ts                           |
| I6  | E6, E7, E8, E9 | yes        | session-attach.test.ts                         |
| I7  | E4             | yes        | session-create.test.ts                         |
| I8  | E17            | yes        | session-stop.test.ts                           |
| N3  | E12            | yes        | session-detach-reattach.test.ts                |
| N4  | E7, E17        | yes        | session-attach.test.ts, session-stop.test.ts   |

This mapping agrees with `.hidden-test/manifest.json`.

Nothing in the mandatory contract lacks executable coverage.

## Out of Scope

- Exact response bodies/content-types for `409` and `404` responses (spike.md
  states the `409` body is not part of the contract; no body shape is specified
  for `404`s either).
- Behaviour of HTTP methods other than `POST`/`DELETE` on `/sessions` and
  `/sessions/:id`, and any method other than the WebSocket upgrade on
  `/sessions/:id/ws` (not specified by the spike).
- Session ID format, encoding, or generation algorithm (opaque per A2).
- Exit status, exit code, signal, or termination reason of the Bash process
  (explicit non-goal).
- Recovery/cleanup of independently daemonized processes that deliberately
  detach from the session's process group (explicit exclusion in "Session
  cleanup").
- Persistence of sessions across a full Harness _process_ restart in any sense
  beyond "a fresh process starts with no active session" (already implied by
  in-memory-only state; not separately tested as its own case).
- Precise interleaving of a `POST /sessions` that arrives while a `DELETE`
  cleanup is in flight but before `204` has been returned. The spec specifies
  the postconditions once `204` is returned, but not the observable state during
  the cleanup window itself; asserting a specific outcome there would impose an
  implementation-specific interpretation of an underspecified interleaving. See
  Limitations.

## Limitations

- E3 and E9 (concurrency races) rely on Node's single-threaded event-loop model
  to make "exactly one winner" achievable without true OS parallelism. If the
  check-then-set logic for session/attachment state is ever split across an
  `await` boundary, these tests still validate the observable outcome correctly,
  but they cannot diagnose _why_ a race was lost.
- E21 depends on being able to spawn the real CLI entrypoint as a child process
  and control its port via `PORT` (T1). If the implementation wires `PORT`
  differently than expected (e.g. a different variable name), this is an
  `EVALUATOR_DEFECT`/`SPECIFICATION_AMBIGUITY` to distinguish from a real
  `IMPLEMENTATION_FAILURE` during verification, since T1 only recommends `PORT`
  as the variable name in `eval-requirements.md` — verification must check for
  T1 compliance independently before concluding E21 failed.
- The "no active session at fresh host startup" precondition assumed by E1's
  setup is exercised implicitly by every test's setup step (each test starts a
  fresh host and expects the first `POST /sessions` to succeed); it is not
  separately asserted as its own mandatory case.
- The DELETE-during-cleanup interleaving noted in Out of Scope is not given
  executable coverage; this is a deliberate scope limitation, not a gap in
  otherwise-mandatory coverage.

## Revision History

- v1 (initial, frozen at preparation time): established as above. No subsequent
  revisions.
