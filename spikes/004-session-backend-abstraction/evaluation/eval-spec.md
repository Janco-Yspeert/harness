# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/004-session-backend-abstraction`
- Project commit at draft time: `c44b945e4de4cbe7e42e01e74e4f58be01eb7527` (both
  `spike.md` and `eval-requirements.md` are new, currently-untracked files as of
  this commit — the hashes below are the authoritative record, not a commit
  reference)
- Hash of `spike.md` (git blob sha1, `git hash-object`):
  `eabf70dad1aff1d8b3a01f50a876a97c307c2505`
- Hash of `eval-requirements.md` (git blob sha1, `git hash-object`, computed
  **after** `prettier --write`): `54dafa15582438d57bd32f66b95df3ea6143879a`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md`
- Evaluator skill revision: the file is clean (no local modifications) at draft
  time; its content hash (`git hash-object`) is
  `5444be2b04859aab38f58ded0b04cc18bcab32bb`, last touched by commit
  `d1d82767189846e04ac0a44b3ad50d866673051f` ("feat: add explicit session
  lifecycle (#3)") — the same skill revision used to freeze spike 003's
  evaluation.

## Relationship to prior attempts

This is the first `prepare` pass for spike 004. `spike.md` itself is already a
revised brief —
`spikes/004-session-backend-abstraction/attempts/original-spike.md` records an
earlier, less-specified draft (no startup synchronization semantics, no
`GET /sessions/:id`, no finalization/race detail) that this evaluator did not
participate in producing. No prior evaluator attempt exists for this spike.

## Explicit Requirements

- **R1** — `POST /sessions` with no active/reserved session creates a session
  through the selected backend and, once the backend has successfully started,
  returns `201 Created` with JSON body `{"id": "<session-id>"}`, media type
  `application/json`. (spike.md, "Session creation"; baseline carried from
  spike 003)
- **R2** — A newly created session's ID differs from every session ID previously
  issued by that host process. (spike.md, Context: "Session IDs are UUIDs and
  are not reused during the host lifetime")
- **R3** — Only one active or startup-reserved session exists at a time; a
  `POST /sessions` while another session is active, or while another session's
  backend startup is in progress, is rejected `409 Conflict`. (spike.md,
  "Session creation" steps 1–3; baseline)
- **R4** — Under concurrent `POST /sessions` requests with no active/reserved
  session, exactly one eventually succeeds (`201`); all others receive `409`.
  (spike.md, "Session creation"; baseline; Success criterion 5)
- **R5** — `201` is returned only once backend startup has succeeded and the
  session is usable; the implementation must not return `201` while backend
  startup is unresolved. (spike.md, "Session creation" step 5; Success criterion
  4; Failure signal)
- **R6** — If backend startup fails: no active Harness session remains; any
  resources acquired during the failed attempt are released; the singleton slot
  becomes available again; a later creation attempt can proceed normally
  (create, attach, exchange input/output). (spike.md, "Startup failure"; Success
  criteria 5, 6)
- **R7** — A client attaches over WebSocket at `/sessions/:id/ws`; when `:id` is
  the active session, the upgrade is accepted and bidirectional backend behavior
  works (client input reaches the backend; backend-produced output reaches the
  client). (spike.md, "Required backend capabilities"; baseline)
- **R8** — If `:id` is unknown, or refers to a session that is no longer active
  (explicitly stopped, backend-exited, or never issued), the WebSocket upgrade
  is rejected `404`. (baseline, unaffected regression)
- **R9** — Only one client may be attached at a time; a second attach attempt is
  rejected `409`, and the existing connection is left active and unchanged.
  (baseline, unaffected regression)
- **R10** — Disconnecting the WebSocket does not stop the underlying session; a
  later client can reattach with the same ID and continue interacting with the
  same backend session, including for the injected non-PTY backend. (baseline;
  spike.md "Backend independence" 5, 6)
- **R11** — `DELETE /sessions/:id` for the active session initiates backend
  termination, and only after required finalization completes does it remove the
  Harness session, release the singleton slot, and return `204`. (spike.md,
  "Harness-initiated stop"; Success criteria 8, 9)
- **R12** — `DELETE /sessions/:id` when `:id` does not identify the active
  session returns `404`. (baseline, unaffected regression)
- **R13** — If a client is attached when the session is stopped — whether
  explicitly or via backend-initiated termination — the attached WebSocket
  connection is closed by the server. (spike.md, "Harness-initiated stop";
  "Backend-initiated termination")
- **R14** — If the backend terminates on its own (independent of an explicit
  `DELETE`): Harness observes the termination, performs any remaining required
  finalization, removes the Harness session, closes any attached client, and
  releases the singleton slot — such that a subsequent `POST /sessions` succeeds
  and can be attached to normally. (spike.md, "Backend-initiated termination";
  "Bash/backend exit recovery"; Success criteria 13, 14)
- **R15** — `GET /sessions/:id` returns `200` when the Harness session currently
  exists and `404` when the ID is unknown or stale. (spike.md, "Bash/backend
  exit recovery", explicit)
- **R16** — A non-PTY, non-process backend (creating no PTY, shell, subprocess,
  or child process) supplied through the construction seam (T1/T2) can, through
  the real Harness session-management path (not by instantiating the backend in
  isolation), be created, attached to, exchange input/output, be detached from,
  be reattached to, be explicitly stopped, and independently terminate.
  (spike.md, "Non-PTY backend proof"; "Backend independence"; Success
  criterion 3)
- **R17** — `host.close()` finalizes the active backend, of either backend type,
  and releases the active Harness session. (spike.md, "Shutdown semantics")
- **R18** — The real CLI entry point continues to clean up an active PTY-backed
  session on `SIGINT` and on `SIGTERM`. (spike.md, "Shutdown semantics":
  "Existing PTY-backed signal shutdown behaviour should remain
  regression-covered"; baseline)
- **R19** — Harness continues to bind only to `127.0.0.1`. (baseline, unaffected
  regression)
- **R20** — An explicit, normal programmatic construction seam exists through
  which independent tests can supply a backend implementation or factory,
  without monkey-patching module internals, replacing imports, mutating private
  module state, or otherwise bypassing normal Harness host/session construction.
  (spike.md, "Backend construction and verification seam"; Success criterion 11)
  — realized via T1/T2 in `eval-requirements.md`.
- **R21** — Every backend that has successfully started is finalized as part of
  ending its Harness session, regardless of whether termination was
  Harness-initiated or backend-initiated, without conflicting or duplicate
  teardown. (spike.md, "Finalization invariant"; Success criterion 8)

## Derived Invariants

- **I1** — The singleton slot is reserved synchronously as part of handling a
  `POST /sessions` request, before the selected backend's (possibly
  asynchronous) startup work begins or resolves — a second `POST` fired while
  the first's backend startup is still pending is rejected `409`, not only once
  `201` has already been returned. Derived from R3 + R5 combined with spike.md's
  explicit ordering (slot reserved as step 1; backend started as step 4; `201`
  only after step 5).
- **I2** — A rejected (`409`) `POST` — whether due to an already-active session
  or startup-in-progress — does not disturb the existing or in-progress session;
  once that session's `201` (or existing attachment) is available, it continues
  to function normally. Derived from R3/R4, extending the established pattern
  (spike 003 I2) to the startup-in-progress case.
- **I3** — A rejected (`409`) second WebSocket attach does not disturb the first
  attached client's connection or its ability to exchange input/output. Derived
  directly from R9.
- **I4** — WebSocket upgrade rejections (`404`/`409`) occur at the HTTP upgrade
  response itself; the implementation must not accept the upgrade (`101`) and
  then immediately close the connection to signal rejection. Carried from
  established baseline behavior (spike 003 I6), unaffected by this spike.
- **I5** — `GET /sessions/:id` reflects the same underlying "session currently
  exists" concept as WebSocket-attach-eligibility and DELETE-eligibility: an ID
  that is `404` for attach/DELETE is also `404` for GET, and an ID that is
  attachable/deletable is `200` for GET. Derived from R8/R12/R15 all referring
  to the same active-session concept, and spike.md's explicit framing of GET as
  the mechanism for checking "whether a known Harness session still exists."
- **I6** — The singleton slot is available for a new `POST /sessions`
  immediately once a definitive terminal state has been reached (`204` returned
  for an explicit stop, or backend-initiated termination fully processed) — no
  additional delay. Derived from R11/R14 combined with baseline.
- **I7** — Repeated create/stop (or create / backend-exit) cycles continue to
  yield pairwise-distinct session IDs, including across a mix of PTY and
  injected-backend sessions. Derived from R2 applied iteratively.
- **I8** — A `DELETE` for an ID that was previously active but has since been
  stopped or independently terminated (i.e. calling `DELETE` again for a former
  session) returns `404`, not `204`; former session IDs are not retained or
  treated specially. Derived from R12 combined with the established "stopped
  sessions are not retained" rule.
- **I9** — When Harness explicitly stops a session and the backend also
  (near-simultaneously) reports independent termination, no uncaught error
  occurs, the `DELETE` request still resolves, and the session reaches the same
  terminal state (removed, slot released) as an ordinary stop. Derived from
  R21 + spike.md's first named termination race.
- **I10** — When a backend reports independent termination and a client
  concurrently issues `DELETE` for that session, no session-state corruption
  occurs (no duplicate/conflicting teardown, no leaked slot, no uncaught error);
  the system converges to session-removed/slot-released either way, and a
  subsequent `POST` succeeds. The exact HTTP status returned to that specific
  racing `DELETE` is not prescribed (see A5). Derived from R21 + spike.md's
  second named termination race + N3.
- **I11** — The default construction path (`startHarnessHost(port)` with no
  `options`) continues to use the production PTY backend, so the mere existence
  of the new seam does not change baseline PTY behavior. Derived from spike.md
  ("the PTY backend may remain the default and only user-visible backend")
  combined with T1.
- **I12** — The `:id` path parameter is checked for equality against the active
  session's ID on attach, stop, **and** GET — an arbitrary or unrelated ID is
  treated as unknown even while a different session is active. Derived from
  R8/R12/R15 combined with the established non-goal against assuming "Harness
  can only ever identify one session" (spike 003 I1, extended to GET).

## Negative Requirements

- **N1** — `201` must never be observed before backend startup has succeeded.
  (spike.md, explicit; Failure signal)
- **N2** — A failed backend startup must never leave the singleton slot
  occupied. (Failure signal; mirrors R6)
- **N3** — Backend termination, of either kind, must never leave Harness unable
  to create a subsequent session. (Failure signal; mirrors R14)
- **N4** — Harness must not require its own session ID to double as a process
  ID, PTY identifier, provider session ID, thread ID, remote-control ID, or
  other backend-specific identifier. (spike.md, "Session identity"; Failure
  signal) — evidenced structurally: the injected backend has no such identifier
  at all, and the full lifecycle still functions through every
  backend-independence case (E22, E26–E29, E33 below). Not asserted via a
  dedicated runtime check (there is nothing meaningful to assert beyond "it
  worked with a backend that has no identifier at all").
- **N5** — Verifying the non-PTY backend must not rely on instantiating or
  exercising it in isolation, bypassing the real Harness session-management
  path. (spike.md, "Non-PTY backend proof", explicit; Failure signal) — a
  constraint on the evaluator's own test design, satisfied by construction:
  every hidden test that exercises the injected backend does so only through
  `startHarnessHost` plus the public HTTP/WebSocket surface.
- **N6** — PTY output produced while no client is attached must not be retained
  or replayed to a later-attached client. (established baseline non-goal,
  unaffected regression; spike 003 N3)
- **N7** — A stopped/terminated session's former ID must not be retained or
  treated specially for attach, stop, or GET. (established baseline, spike 003
  N4, extended to GET via I5)
- **N8** — Verification of the seam must not require monkey-patching module
  internals, replacing imports via test-only hacks, mutating private module
  state, or otherwise bypassing normal Harness host/session construction.
  (spike.md, "Backend construction and verification seam", explicit) — a
  constraint on the evaluator's own test design, satisfied by construction: the
  hidden tests only ever call the public `startHarnessHost` function and the
  HTTP/WebSocket surface it exposes.

## Evaluation Methodology Note

N5 and N8 are design constraints on the evaluator's own hidden tests, not
independently testable product behaviors, so they are not assigned a dedicated
evaluation case. They are satisfied by construction: reviewing `.hidden-test/**`
shows every case reaching the injected backend only through
`startHarnessHost(port, { createBackend })` and the ordinary HTTP/WebSocket
surface — never through module-internal access. N4 is likewise evidenced
structurally by every fake-backend case rather than by a dedicated assertion
(see N4 above).

## Evaluation Cases

### Create / Startup

- **E1** — Purpose: baseline session-creation contract (PTY, default backend).
  Verifies: R1. Preconditions: fresh host, no active session. Action:
  `POST /sessions`. Expected: `201`, `content-type` includes `application/json`,
  body is JSON `{"id": "<non-empty string>"}`. Mandatory: yes.

- **E2** — Purpose: singleton enforcement; rejection doesn't disturb the
  existing session. Verifies: R3, I2. Preconditions: one active session (PTY, ID
  `A`). Action: second `POST /sessions`; then attach to `A` and exchange
  input/output proving real execution. Expected: second `POST` returns `409`;
  attach to `A` still succeeds and the backend still responds. Mandatory: yes.

- **E3** — Purpose: creation race has exactly one winner. Verifies: R4.
  Preconditions: fresh host. Action: fire several `POST /sessions` requests
  without awaiting between them (PTY, default backend). Expected: exactly one
  `201`; all others `409`. Mandatory: yes. Assumption: A1.

- **E4** — Purpose: ID uniqueness across create/stop cycles. Verifies: R2, I7.
  Preconditions: fresh host. Action: create, stop, create, stop, create (three
  cycles, PTY). Expected: all three issued IDs are pairwise distinct. Mandatory:
  yes.

- **E5** — Purpose: singleton slot is reserved, and `201` withheld, for the full
  duration of asynchronous backend startup — not just until some session becomes
  active. Verifies: R4, R5, I1, N1. Preconditions: fresh host constructed with a
  `createBackend` factory whose returned promise is under test control (T1/T2).
  Action: fire a first `POST /sessions` (startup deliberately left pending);
  fire a second `POST /sessions` without awaiting the first; await the second's
  response; only then resolve the first backend's startup and await the first
  response. Expected: the second response is `409` and arrives without needing
  the first startup to resolve; the first response only arrives (and is `201`)
  after startup is explicitly resolved. Mandatory: yes. Assumption: A1.

- **E6** — Purpose: failed backend startup is failure-safe. Verifies: R6, N1,
  N2. Preconditions: fresh host constructed with a `createBackend` factory under
  test control. Action: `POST /sessions`; reject the pending backend startup.
  Expected: the response is not `201` (and is `>= 400`); a subsequent
  `POST /sessions` on the same host succeeds (`201`) and can be attached to with
  working input/output exchange. Mandatory: yes. Assumption: A3.

### Attach

- **E7** — Purpose: baseline attach + bidirectional backend behavior, proving
  genuine command execution (not merely PTY echo of typed input). Verifies: R7.
  Preconditions: one active PTY session (ID `A`). Action: attach at
  `/sessions/A/ws`; send a command whose marker cannot appear in the raw
  typed/echoed input, only in genuine backend output; read output. Expected:
  upgrade succeeds; the constructed marker is observed in output. Mandatory:
  yes.

- **E8** — Purpose: attaching to a never-issued ID is rejected. Verifies: R8,
  I4. Preconditions: one active session (ID `A`); a syntactically different,
  never-issued ID `X`. Action: attempt attach at `/sessions/X/ws`. Expected:
  upgrade rejected `404` at the HTTP response (never reaches `101`). Mandatory:
  yes. Assumption: A4.

- **E9** — Purpose: attaching to a previously stopped session's ID is rejected,
  not retained. Verifies: R8, N7. Preconditions: session created and stopped (ID
  `A`, now inactive). Action: attempt attach at `/sessions/A/ws`. Expected:
  upgrade rejected `404`. Mandatory: yes. Assumption: A4.

- **E10** — Purpose: verify the active session's ID is actually checked on
  attach, not merely "some session is active." Verifies: R8, I12. Preconditions:
  one active session (ID `A`); a distinct, never-issued ID `X`. Action: attempt
  attach at `/sessions/X/ws` while `A` is active. Expected: upgrade rejected
  `404`; `A` remains attachable afterward. Mandatory: yes. Assumption: A4.

- **E11** — Purpose: single-attachment enforcement; rejection doesn't disturb
  the existing client. Verifies: R9, I3. Preconditions: one active session (ID
  `A`) with one client already attached. Action: attempt a second attach at
  `/sessions/A/ws`; then exchange input/output on the first client. Expected:
  second attach rejected `409` at the HTTP response; first client remains open
  and functional. Mandatory: yes. Assumption: A4.

### Detach / Reattach (PTY)

- **E12** — Purpose: detach does not stop the session; reattach reaches the same
  backend session. Verifies: R10. Preconditions: one active PTY session (ID `A`)
  with an attached client. Action: read `$BASHPID`; close the client without
  stopping the session; attach a new client to `A`; read `$BASHPID` again.
  Expected: both values are identical. Mandatory: yes.

- **E13** — Purpose: shell state survives detach/reattach. Verifies: R10.
  Preconditions: one active PTY session (ID `A`) with an attached client.
  Action: change working directory and export a distinctive environment
  variable; detach; reattach; read `$PWD` and the variable. Expected: both
  reflect the values set before detaching. Mandatory: yes.

- **E14** — Purpose: PTY output produced while detached is not
  retained/replayed. Verifies: N6. Preconditions: one active PTY session (ID
  `A`) with an attached client. Action: start a `disown`'d background job that
  prints a distinctive marker after a short delay; detach before the marker is
  printed; wait past the delay; reattach; send a new command producing a second,
  different marker; inspect output up to and including the second marker.
  Expected: the first (stale) marker does not appear. Mandatory: yes.

### Stop

- **E15** — Purpose: `204` genuinely means cleanup is complete and the slot is
  reusable. Verifies: R11, I6. Preconditions: one active PTY session (ID `A`);
  capture `$BASHPID`. Action: `DELETE /sessions/A`. Expected: `204`; immediately
  after, the captured PID is no longer a live OS process; a subsequent
  `POST /sessions` immediately succeeds. Mandatory: yes.

- **E16** — Purpose: stop while attached closes the client. Verifies: R13.
  Preconditions: one active PTY session (ID `A`) with an attached client.
  Action: `DELETE /sessions/A`. Expected: the attached WebSocket connection is
  closed by the server; the `DELETE` returns `204`. Mandatory: yes.

- **E17** — Purpose: stop of a never-issued ID. Verifies: R12. Preconditions: no
  active session with the tested ID. Action:
  `DELETE /sessions/<never-issued-id>`. Expected: `404`. Mandatory: yes.

- **E18** — Purpose: stop is not idempotent-successful; second delete of an
  already-stopped session is `404`. Verifies: R12, N7, I8. Preconditions:
  session created and stopped (ID `A`). Action: `DELETE /sessions/A` again.
  Expected: `404` (not `204`). Mandatory: yes.

- **E19** — Purpose: the active session's ID is actually checked on stop, not
  merely "some session is active." Verifies: R12, I12. Preconditions: one active
  session (ID `A`); a distinct, never-issued ID `X`. Action:
  `DELETE /sessions/X` while `A` is active. Expected: `404`; `A` remains active
  and attachable afterward. Mandatory: yes.

### Backend-initiated termination and recovery

- **E20** — Purpose: PTY backend exiting on its own is treated like an explicit
  stop from the client/API perspective (baseline regression). Verifies: R14.
  Preconditions: one active PTY session (ID `A`) with an attached client.
  Action: send input that causes the backend process to exit on its own (the
  `exit` builtin) rather than calling `DELETE`. Expected: the attached WebSocket
  is closed by the server; a subsequent attach to `A` is rejected `404`; a
  subsequent `POST /sessions` succeeds. Mandatory: yes.

- **E21** — Purpose: full server-observable recovery sequence after independent
  backend termination, PTY backend — this is the fix for the manual-testing
  observation in spike.md. Verifies: R14, R15, I5, R13, N7. Preconditions: one
  active PTY session (ID `A`) with an attached client. Action, in order: (1)
  cause the backend to exit independently; (2) observe the attached WebSocket
  close; (3) `GET /sessions/A` → expect `404`; (4) `POST /sessions` → expect
  `201` with a new ID `B`; (5) attach to `B`; (6) exchange input/output on `B`
  proving genuine execution. Expected: every step succeeds as described.
  Mandatory: yes.

- **E22** — Purpose: equivalent recovery-sequence coverage for the injected
  non-PTY backend, proving the same lifecycle is genuinely backend-independent.
  Verifies: R14, R16, I5, R13 (intermediate), N3, N4 (structural).
  Preconditions: one active session on a host constructed with a controllable
  backend factory (ID `A`) with an attached client. Action, in order: (1)
  trigger the backend's own independent-exit notification (not `stop()`); (2)
  observe the attached WebSocket close; (3) `GET /sessions/A` → expect `404`;
  (4) `POST /sessions` on the same host (a fresh backend instance from the same
  factory) → expect `201` with a new ID `B`; (5) attach to `B`; (6) exchange
  input/output on `B`. Expected: every step succeeds as described, using a
  backend that at no point created a PTY, shell, or subprocess. Mandatory: yes.

### GET /sessions/:id

- **E23** — Purpose: existence check for an active session. Verifies: R15.
  Preconditions: one active PTY session (ID `A`). Action: `GET /sessions/A`.
  Expected: `200`. Mandatory: yes.

- **E24** — Purpose: existence check for an unknown ID. Verifies: R15.
  Preconditions: a never-issued ID `X`. Action: `GET /sessions/X`. Expected:
  `404`. Mandatory: yes.

- **E25** — Purpose: existence check for a stopped/former session ID, and that
  the active session's actual ID is what's checked (not "any session exists").
  Verifies: R15, I5, I12, N7. Preconditions: session created and stopped (ID
  `A`); separately, one active session (ID `C`) with a distinct never-issued ID
  `X`. Action: `GET /sessions/A` (former); `GET /sessions/X` while `C` is
  active. Expected: both `404`; `GET /sessions/C` (control) is `200`. Mandatory:
  yes.

### Backend independence (non-PTY)

- **E26** — Purpose: baseline create + bidirectional input/output through the
  real Harness path, non-PTY backend. Verifies: R16, R7 (analog). Preconditions:
  fresh host constructed with a controllable backend factory. Action:
  `POST /sessions`; resolve startup; attach; send input; have the backend emit
  output in response; read it. Expected: `201` (only after startup resolves —
  reuses E5's ordering guarantee); the attached client receives exactly the
  output the backend emitted; the backend's `write` receives exactly the input
  the client sent. Mandatory: yes.

- **E27** — Purpose: detach doesn't terminate the non-PTY backend session;
  reattach continues working. Verifies: R16, R10 (analog). Preconditions: one
  active session on the controllable backend (ID `A`) with an attached client.
  Action: detach without stopping; reattach; exchange input/output again.
  Expected: reattachment succeeds; the same backend instance continues to
  receive input and produce output (no new backend instance was created by the
  factory). Mandatory: yes.

- **E28** — Purpose: explicit stop finalizes the non-PTY backend before `204`.
  Verifies: R11 (analog), R16, R21. Preconditions: one active session on the
  controllable backend (ID `A`), configured with a deliberate delay on `stop()`.
  Action: `DELETE /sessions/A`. Expected: the `204` response does not arrive
  before the backend's `stop()` promise resolves; the backend's `stop()` was
  invoked at least once; a subsequent `POST /sessions` on the same host
  succeeds. Mandatory: yes.

### Finalization races

- **E29** — Purpose: no duplicate/conflicting teardown when Harness explicitly
  stops a session and the backend also reports independent termination at
  essentially the same time. Verifies: R21, I9. Preconditions: one active
  session on the controllable backend (ID `A`) with an attached client. Action:
  issue `DELETE /sessions/A`; without awaiting it, trigger the backend's
  independent-exit notification. Expected: no uncaught error/unhandled rejection
  occurs; the `DELETE` request resolves to some definitive response within a
  normal timeout; afterward `GET /sessions/A` is `404`; a subsequent
  `POST /sessions` succeeds. Mandatory: yes. Assumption: A1, A5.

- **E30** — Purpose: no session-state corruption when a backend reports
  independent termination and a client concurrently issues an explicit `DELETE`.
  Verifies: R21, I10, N3. Preconditions: one active session on the controllable
  backend (ID `A`) with an attached client. Action: trigger the backend's
  independent-exit notification; without awaiting anything, issue
  `DELETE /sessions/A`. Expected: no uncaught error/unhandled rejection; the
  `DELETE` resolves to some definitive response (its exact status is not
  asserted — see A5); afterward `GET /sessions/A` is `404`; a subsequent
  `POST /sessions` succeeds and can be attached to and used normally. Mandatory:
  yes. Assumption: A1, A5.

### Shutdown

- **E31** — Purpose: programmatic host shutdown cleans up the active PTY session
  (baseline regression). Verifies: R17. Preconditions: one active PTY session
  with a captured shell PID. Action: invoke the host's programmatic
  shutdown/close mechanism. Expected: after shutdown completes, the captured PID
  is not a live OS process. Mandatory: yes.

- **E32** — Purpose: programmatic host shutdown finalizes a non-PTY backend.
  Verifies: R17, R21, R16. Preconditions: one active session on the controllable
  backend. Action: invoke the host's programmatic shutdown/close mechanism.
  Expected: the backend's `stop()` is invoked at least once before `close()`
  resolves. Mandatory: yes.

- **E33** — Purpose: `SIGINT` and `SIGTERM` shutdown paths clean up the active
  PTY session (baseline regression). Verifies: R18. Preconditions: the real CLI
  entry point running as a separate OS process (using the established `PORT`
  override), with one active session and a captured shell PID. Action: send
  `SIGINT`; repeat independently with `SIGTERM`. Expected: in both cases, after
  the process exits, the captured PID is no longer a live OS process. Mandatory:
  yes.

### Networking

- **E34** — Purpose: regression check that the localhost-only posture is
  unchanged. Verifies: R19. Preconditions: a running host. Action: inspect the
  bound address. Expected: `127.0.0.1`. Mandatory: yes.

## Coverage Matrix

| ID  | Covered by                                            | Executable                            | Test file(s)                                                                                                                                                                                              |
| --- | ----------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | E1                                                    | yes                                   | session-create.test.ts                                                                                                                                                                                    |
| R2  | E4                                                    | yes                                   | session-create.test.ts                                                                                                                                                                                    |
| R3  | E2                                                    | yes                                   | session-create.test.ts                                                                                                                                                                                    |
| R4  | E3, E5                                                | yes                                   | session-create.test.ts, session-startup.test.ts                                                                                                                                                           |
| R5  | E5                                                    | yes                                   | session-startup.test.ts                                                                                                                                                                                   |
| R6  | E6                                                    | yes                                   | session-startup.test.ts                                                                                                                                                                                   |
| R7  | E7                                                    | yes                                   | session-attach.test.ts                                                                                                                                                                                    |
| R8  | E8, E9, E10                                           | yes                                   | session-attach.test.ts                                                                                                                                                                                    |
| R9  | E11                                                   | yes                                   | session-attach.test.ts                                                                                                                                                                                    |
| R10 | E12, E13, E27                                         | yes                                   | session-detach-reattach.test.ts, session-backend-independence.test.ts                                                                                                                                     |
| R11 | E15, E28                                              | yes                                   | session-stop.test.ts, session-backend-independence.test.ts                                                                                                                                                |
| R12 | E17, E18, E19                                         | yes                                   | session-stop.test.ts                                                                                                                                                                                      |
| R13 | E16, E21, E22                                         | yes                                   | session-stop.test.ts, session-recovery.test.ts                                                                                                                                                            |
| R14 | E20, E21, E22                                         | yes                                   | session-recovery.test.ts                                                                                                                                                                                  |
| R15 | E21, E23, E24, E25                                    | yes                                   | session-recovery.test.ts, session-get.test.ts                                                                                                                                                             |
| R16 | E22, E26, E27, E28                                    | yes                                   | session-recovery.test.ts, session-backend-independence.test.ts                                                                                                                                            |
| R17 | E31, E32                                              | yes                                   | session-shutdown.test.ts                                                                                                                                                                                  |
| R18 | E33                                                   | yes                                   | session-shutdown.test.ts                                                                                                                                                                                  |
| R19 | E34                                                   | yes                                   | session-networking.test.ts                                                                                                                                                                                |
| R20 | E22, E26, E27, E28, E32                               | yes (structural, no hacks)            | session-recovery.test.ts, session-backend-independence.test.ts, session-shutdown.test.ts                                                                                                                  |
| R21 | E28, E29, E30, E32                                    | yes                                   | session-backend-independence.test.ts, session-finalization-races.test.ts, session-shutdown.test.ts                                                                                                        |
| I1  | E5                                                    | yes                                   | session-startup.test.ts                                                                                                                                                                                   |
| I2  | E2                                                    | yes                                   | session-create.test.ts                                                                                                                                                                                    |
| I3  | E11                                                   | yes                                   | session-attach.test.ts                                                                                                                                                                                    |
| I4  | E8                                                    | yes                                   | session-attach.test.ts                                                                                                                                                                                    |
| I5  | E21, E22, E25                                         | yes                                   | session-recovery.test.ts, session-get.test.ts                                                                                                                                                             |
| I6  | E15                                                   | yes                                   | session-stop.test.ts                                                                                                                                                                                      |
| I7  | E4                                                    | yes                                   | session-create.test.ts                                                                                                                                                                                    |
| I8  | E18                                                   | yes                                   | session-stop.test.ts                                                                                                                                                                                      |
| I9  | E29                                                   | yes                                   | session-finalization-races.test.ts                                                                                                                                                                        |
| I10 | E30                                                   | yes                                   | session-finalization-races.test.ts                                                                                                                                                                        |
| I11 | (baseline PTY tests use no `options` argument at all) | yes (structural)                      | session-create.test.ts, session-attach.test.ts, session-detach-reattach.test.ts, session-stop.test.ts, session-recovery.test.ts (E20/E21), session-shutdown.test.ts (E31/E33), session-networking.test.ts |
| I12 | E10, E19, E25                                         | yes                                   | session-attach.test.ts, session-stop.test.ts, session-get.test.ts                                                                                                                                         |
| N1  | E5, E6                                                | yes                                   | session-startup.test.ts                                                                                                                                                                                   |
| N2  | E6                                                    | yes                                   | session-startup.test.ts                                                                                                                                                                                   |
| N3  | E6, E21, E22, E30                                     | yes                                   | session-startup.test.ts, session-recovery.test.ts, session-finalization-races.test.ts                                                                                                                     |
| N4  | E22, E26, E27, E28                                    | structural, not a dedicated assertion | session-recovery.test.ts, session-backend-independence.test.ts                                                                                                                                            |
| N5  | (all fake-backend cases)                              | structural, not a dedicated assertion | n/a — see Evaluation Methodology Note                                                                                                                                                                     |
| N6  | E14                                                   | yes                                   | session-detach-reattach.test.ts                                                                                                                                                                           |
| N7  | E9, E18, E21, E25                                     | yes                                   | session-attach.test.ts, session-stop.test.ts, session-recovery.test.ts, session-get.test.ts                                                                                                               |
| N8  | (all hidden tests)                                    | structural, not a dedicated assertion | n/a — see Evaluation Methodology Note                                                                                                                                                                     |

This mapping must agree with `.hidden-test/manifest.json`.

## Out of Scope

- Exact response bodies/content-types for `409`/`404`/failed-startup responses
  (not specified by spike.md).
- The exact HTTP status code for a failed backend-startup `POST /sessions`
  response, beyond "not `201`" (spike.md, explicit; A3).
- The exact HTTP status code returned to whichever request "loses" the E30
  termination race (spike.md does not prescribe it; A5).
- Session ID format/encoding/generation algorithm beyond uniqueness (A2).
- The browser's own `public/client.js` JS logic for discarding vs. retaining a
  stored session ID after a failed WebSocket attach/closure (A6) — verified
  manually/by code inspection, not by an automated hidden test, per spike.md's
  explicit allowance and the repository's current lack of DOM/browser test
  tooling. The host-side `GET /sessions/:id` contract and the full
  server-observable recovery sequences (E21, E22) remain mandatory and
  automated.
- Whether Harness's generic termination handling happens to call the backend's
  `stop()` again after observing `onExit` — T2 makes this safe either way, so
  neither calling nor not calling it redundantly is asserted.
- Cleanup of PTY descendant/background processes in separate process groups —
  out of scope per spike 003's own narrowed contract, unchanged by this spike
  (spike.md does not reopen it).
- Structured provider events, capability negotiation, or any non-string
  data-plane behavior (explicit non-goals).
- Multiple simultaneous Harness sessions, user-selectable backend types, backend
  plugin discovery (explicit non-goals).
- Precise interleaving/observable state _during_ a cleanup window, before a
  terminal response (`204`/`404`/removal) has actually been returned —
  postconditions once that response arrives are what's specified, not the window
  itself (carried from spike 003's own Limitations).
- The internal class/module structure of the production PTY backend, beyond it
  being reachable through a T1/T2-conforming adapter and passing every baseline
  regression case.

## Limitations

- E5, E6, E22, E26–E30, E32 all depend on the `ControllableBackend` test
  helper's ability to hold backend startup pending, resolve/reject it on
  command, and simulate output/exit/stop-delay from outside the real Harness
  code path. This is exactly what T1/T2 (published in `eval-requirements.md`)
  exist to make possible; the helper is independently self-checked (see
  Pre-Freeze Integrity Gate) before any mandatory case relies on it.
- E29/E30 (termination races) rely on A1/A5: Node's single-threaded event loop
  and firing events without an intervening `await`, not true OS-level
  concurrency — consistent with the project's own established pattern for
  concurrency tests (`test/session-lifecycle.integration.test.ts`).
- The browser-side portion of the stale-session-recovery requirement (A6) is
  evidenced only by manual verification / code inspection at `verify` time,
  which is weaker assurance than the automated coverage used elsewhere in this
  spec. This reflects spike.md's own explicit allowance for repositories without
  proportionate browser-test tooling, not an evaluator shortcut.
- Baseline regression cases (E1, E4, E7–E9, E11–E20, E23–E25 [`C` control], E31,
  E33–E34) are adapted from spike 003's own promoted, previously verified
  hidden-test suite (`spikes/003-session-lifecycle/evaluation/hidden-tests/`,
  public historical record) rather than re-derived from scratch, per spike.md's
  own "Existing tests may be reused or adjusted where appropriate." This reduces
  the risk of reintroducing a harness defect already discovered and fixed during
  spike 003 (see that spec's "Relationship to Attempt 001"), but it does mean
  this spec inherits that suite's design rather than independently re-deriving
  it.
- N4/N5/N8 are evidenced structurally rather than through a dedicated runtime
  assertion (see Evaluation Methodology Note above); a verifier should confirm
  this structural claim by reading the hidden-test source itself (it is short
  and this is a normal part of `verify`'s "inspect the implementation and
  relevant visible tests" step, applied here to the evaluator's own test source
  instead).

## Pre-Freeze Integrity Gate

All checks below passed before `Status` was set to `Frozen`.

### Shared helpers identified and validated

Two categories of non-trivial shared helper exist in `.hidden-test/helpers.ts`,
both independently validated in `helpers.selfcheck.test.ts` (9/9 passing, run in
isolation, unrelated to the Harness implementation under test):

- **Connection/PTY-query helpers** (`connect`, `rejectedUpgrade`,
  `buildQueryCommand`) — carried over unchanged from spike 003's own promoted,
  previously-validated self-checks (positive/negative controls for upgrade
  accept/reject; negative controls proving `buildQueryCommand`'s marker is
  immune to PTY echo and Bash job-control noise, positive control proving it
  matches genuine output). Reusing spike 003's already-proven mechanics here is
  a deliberate application of "minimize evaluator cleverness" rather than
  re-deriving fresh (and potentially freshly buggy) versions.
- **`makeControllableBackend` / `makeBackendFactoryController`** — new for spike
  004, used by 12 of the 34 mandatory cases (E5, E6, E22, E26–E30, E32 directly;
  the rest indirectly share the same design). Independently validated with six
  self-check tests covering: the factory promise staying pending until
  `resolveStart()` (positive control) and rejecting on `rejectStart()` (negative
  control); `write`/`onData`/`onExit` wiring: input recorded in order,
  output/exit listeners fire with the right payloads; `stop()`'s call-count
  tracking and its `setStopDelayMs` ordering guarantee (positive control
  mirroring E28's own ordering assertion, checked at 30ms into a 150ms delay);
  and `makeBackendFactoryController` handing out a genuinely distinct backend
  per invocation while reporting `invocationCount` accurately, with a negative
  control confirming `attempt(n)` stays pending until the corresponding factory
  invocation actually happens (not merely "eventually resolves regardless").
- Each helper is small and single-purpose (`ControllableBackend` only tracks its
  own state; `BackendFactoryController` only sequences `ControllableBackend`
  instances) rather than one do-everything utility, so a single helper defect
  cannot silently invalidate more mandatory cases than necessary — each of the
  34 mandatory-case tests makes its own explicit assertions on top of these
  helpers rather than delegating pass/fail judgement to the helper itself.
- The one necessary type-level accommodation of testing an as-yet-unimplemented
  seam (`startHost`'s cast to `StartHarnessHostWithBackend`, documented in its
  own doc comment in `helpers.ts`) was itself exercised, not merely asserted
  safe: every seam-dependent hidden test successfully invoked the real
  `startHarnessHost` through it (see Harness Validated Mechanically below).

### Oracle and falsifiability validated per mandatory case

For status-code-only cases with no PTY/backend content dependency (E1, E2's
`409`, E3, E4, E8–E10, E15, E17–E19, E23–E25, E31, E33, E34) the oracle is a
direct HTTP/WS status comparison — deterministic, needs no further control per
the gate's own "do not build elaborate controls for trivial, deterministic
assertions" guidance.

For cases whose oracle depends on genuine PTY execution or reattached state
(E2's still-alive check, E7, E11–E14, E20, E21), the oracle is
`buildQueryCommand`/`readBashPid`, already validated above and by spike 003's
own gate — an implementation that only echoes input, or that doesn't actually
persist/isolate backend state, would fail these; a correct one satisfies them.

For the new asynchronous-startup cases (E5, E6):

- E5's core assertion (`controller.invocationCount === 1` after a rejected
  concurrent `POST`) is falsifiable in both directions: an implementation that
  starts a second backend for every concurrent `POST` (ignoring the singleton
  reservation during startup) would report `invocationCount 2` and fail; one
  that correctly reserves the slot synchronously before starting the backend
  reports `1` and passes. Confirmed failing today (against the
  pre-implementation baseline, where the seam doesn't exist at all and the
  factory is never invoked, `invocationCount` is `0`, i.e. the assertion fails
  clearly and immediately rather than passing by accident — see Harness
  Validated Mechanically below).
- E5's ordering assertion (second response arrives without needing the first
  startup resolved) is falsifiable: an implementation that serializes request
  handling on the first backend's startup completing would leave `secondPending`
  unresolved until `first.resolveStart()` is called — which never happens before
  the assertion — so the test would hang/timeout rather than spuriously pass.
- E6's assertions (non-`201` status, then a working subsequent session) are
  falsifiable: an implementation that leaves the singleton slot occupied after a
  failed startup would make the second `POST` return `409` instead of `201`,
  failing `assert.equal(created.status, 201)`.

For the non-PTY backend-independence cases (E26–E28) and the recovery sequences
(E21, E22): the oracle directly inspects `backend.received` / drives
`backend.emitOutput`/`emitExit`, so an implementation that doesn't actually wire
client input to the injected backend's `write`, or doesn't deliver `onData`
output to the client, or doesn't call `stop()` before `204`, fails these
directly and observably (confirmed today — see below, E26 and E28 both fail with
a precise, on-topic assertion message under the current pre-implementation
baseline, not a generic timeout).

For the finalization-race cases (E29, E30): the oracle is deliberately loose on
the exact "losing" response's status (per A5) and strict on the convergent
postconditions (`GET` afterward `404`, next `POST` not `409`). An implementation
with a genuine duplicate-teardown or leaked-slot bug would fail the
postcondition checks; the loose middle assertion cannot mask that, since it only
accepts `204` or `404` (any other status, a hang, or an uncaught error still
fails the test).

### Material runtime assumptions validated

- **Concurrent-POST ordering (A1), extended to the async-startup case.**
  Validated empirically with a throwaway `node:http` diagnostic (not retained as
  a hidden-test artifact) before relying on it in E5: a bare HTTP server that
  synchronously reserves a slot and only resolves its response after an explicit
  50ms-delayed async step, hit with `Promise.all([fetch, fetch])` fired without
  an intervening `await`, reserved the slot for request A and rejected request B
  _before_ request A's async step ever resolved, in 5/5 runs. This is exactly
  the shape E5 relies on (reservation happens synchronously; the second request
  doesn't need to wait for the first's async resolution to be rejected).
- **`node --test` executing hidden `.ts` sources via a relative import into the
  main project.** Confirmed directly (a throwaway smoke test, since removed,
  exercised `startHarnessHost` from this exact private location via
  `../../../../harness/src/index.ts` and passed against the current
  implementation) before building the real suite on top of the same import path.

No ambiguity was exposed by either validation.

### Harness validated mechanically

- **Formatting.** `eval-requirements.md` (public) and every file under
  `.hidden-test/` pass `prettier --config .prettierrc.json --check` (the
  project's own config, applied explicitly since files outside the project tree
  don't inherit it automatically) — run and fixed, including one genuine
  markdown authoring defect this caught (a line-wrapped path inside a code span
  that had literally split the path with a space), _before_ the hashes recorded
  in this document's `Source` section were computed.
- **Type-checking.** `tsc --noEmit` against a temporary `tsconfig.json` placed
  inside the project root (required so the `types: ["node"]` entry in the
  extended base config still resolves against the project's own `node_modules`;
  a temp config located outside the project tree, e.g. under `/tmp`, fails with
  `TS2688: Cannot find type definition file for 'node'`), extending the
  project's own `tsconfig.json` with `include` widened to this spike's private
  `.hidden-test/**/*.ts`, reports **zero errors**. Two rounds of real type
  errors were caught and fixed this way (not pre-implementation noise):
  `BackendFactory`'s permissive `SessionBackend | Promise<SessionBackend>` /
  `void | Promise<void>` return types don't support `.then()`/`assert.rejects`
  directly, requiring either a narrower concrete return type on the test-only
  `ControllableBackend`/`BackendFactoryController` helpers (used for
  `.factory()`) or an explicit `Promise.resolve(...)` wrapper (used for the one
  `.stop()` call site in `helpers.selfcheck.test.ts`) — both now fixed and
  reflected in the current `helpers.ts`/`helpers.selfcheck.test.ts`. The
  temporary tsconfig itself was not retained.
- **Discovery and execution.** All 13 hidden-test files (2 support + 11 case
  files, 44 total `test()` invocations covering 34 mandatory evaluation cases)
  are discovered and run by `node --test` when given explicit paths, consistent
  with the project's own `test/session-lifecycle.integration.test.ts` pattern of
  plain `node --test`.
- **Distinguishing expected pre-implementation failures from harness defects.**
  A full run against the current (pre-abstraction) codebase — which has no
  `GET /sessions/:id` route and silently ignores any second argument to
  `startHarnessHost` (running the real PTY backend regardless of what's passed)
  — was used specifically to confirm the harness itself executes cleanly, not to
  require passing results:
  - The 9 support self-checks: **9/9 pass** (fully implementation-independent).
  - The 21 baseline-regression cases carried over from spike 003 (E1–E4, E7–E20
    excluding the new E5/E6, E31, E33 ×2, E34): **all pass**, confirming the
    reused spike-003 mechanics still work unmodified against the current
    PTY-only implementation, and that nothing in this spec's adaptation
    (renumbering, import paths) broke them.
  - The `GET`-dependent cases (E23, E25, and E21's intermediate `GET` check)
    fail cleanly with a precise `404 !== 200` assertion — the route doesn't
    exist yet, exactly as expected, not a hang or crash.
  - The seam-dependent cases (E5, E6, E22, E26–E28, E32) each fail in one of two
    clean, informative ways: a fast, precise assertion failure naming exactly
    what's missing (e.g. E5: "expected exactly one backend-startup attempt, saw
    0"; E26: `backend.received` expected `['hello-backend']`, got `[]`; E28:
    "204 arrived before the backend's stop() delay elapsed"; E32: "host.close()
    did not invoke the backend's stop()"), or a bounded timeout (E6, E22, E27)
    when the test's own logic depends on a factory invocation that never happens
    pre-implementation. Using
    `node --test --test-force-exit --test-timeout=6000-8000` bounded every run
    to well under a minute per file; without `--test-force-exit`, a test that
    times out while a real PTY child process it spawned is still alive (because
    its own `host.close()` in `finally` never got a chance to run) leaves the
    overall `node` process unable to exit on its own — an artifact of testing an
    unimplemented seam, not a defect in the tests, and not a concern at `verify`
    time once `host.close()` genuinely runs to completion in every path.
  - **E29 and E30 (the finalization races) currently pass**, but not for a
    meaningful reason: since the seam is ignored today, these tests
    transparently degrade into "create a real PTY session, `DELETE` it, `GET` a
    route that doesn't exist yet (falls through to a generic `404` handler that
    happens to coincide with the expected stale-session `404`), then create a
    new session" — every individual assertion happens to hold for unrelated
    reasons. This is recorded here explicitly rather than left as an unexamined
    green result: it is not evidence the races are well-designed, only that they
    don't currently error out. Their real falsifiability argument (above, under
    "Oracle and falsifiability") does not depend on today's coincidental pass
    and will be re-examined against genuine race behavior at `verify` time once
    the seam exists.
  - No leftover Bash/PTY processes were observed after each bounded run
    completed (spot-checked via `pgrep`), aside from the processes deliberately
    left orphaned mid-hang by the two `--test-force-exit` cases described above,
    which `--test-force-exit` reaps along with the node process itself.

Distinguishing "expected pre-implementation failure" from "evaluator defect"
throughout the above: every failure traces to a concrete, named missing piece of
the not-yet-built implementation (no `GET` route; the second `startHarnessHost`
argument being silently ignored), never to an error inside the hidden-test code
itself (no stack trace pointing into `helpers.ts`, no unhandled promise
rejection reported by `node --test` outside the two intentionally-bounded
timeouts).

## Revision History

- v1 (frozen) — first `prepare` pass for spike 004. 21 explicit requirements, 12
  derived invariants, 8 negative requirements, 34 evaluation cases (all
  mandatory), 6 evaluator assumptions, 2 testability requirements, no blocking
  questions. Pre-freeze integrity gate passed: shared helpers independently
  self-checked (9/9), oracle/falsifiability reviewed per case, two material
  runtime assumptions validated empirically, and the full hidden-test suite
  executed against the pre-implementation baseline to confirm the harness itself
  runs cleanly (baseline regressions and support self-checks pass;
  seam-dependent cases fail informatively or time out boundedly, as expected
  before implementation).
