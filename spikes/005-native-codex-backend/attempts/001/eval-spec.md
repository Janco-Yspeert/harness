# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/005-native-codex-backend`
- Project commit at draft time: `c4827dee40a8d4108db43a38b0d44a5da5694ffd`
  (`chore: final review pre-commit`) — `spike.md`, `feedback.md`, and
  `protocol/**` are all committed and unmodified in the working tree at this
  commit.
- Hash of `spike.md` (git blob sha1, `git hash-object`):
  `6f161110d42f5024295d843a4373b7e7eb7ec974`
- Hash of `eval-requirements.md` (git blob sha1, `git hash-object`, computed
  **after** `prettier --write`): `f9a20f93eb10f3fc00071c43bc7d09193820d6ab`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md`
- Evaluator skill revision: the file is clean (no local modifications) at draft
  time; last touched by commit `9e2dde1` ("chore: strengthen spike workflow
  provenance (#6)"); content hash (`git hash-object`):
  `05cd00edf2ae3ecbda1abdc7baa43e3881c4ee66`.
- Protocol/schema baseline: `spikes/005-native-codex-backend/protocol/`,
  generated from `codex-cli 0.147.0` (see
  `spikes/005-native-codex-backend/protocol/README.md`), committed at the same
  project commit above.

## Relationship to prior attempts

This is the first `prepare` pass for spike 005. `spike.md`'s own review
(`spikes/005-native-codex-backend/feedback.md`) records a "Ready to freeze"
verdict with no blocking material clarifications; this evaluator did not
participate in that review and treats `spike.md` as already frozen product
input. No prior evaluator attempt exists for this spike.

## Explicit Requirements

### Protocol baseline

- **R1** — A Codex-backed session's App Server `initialize` request never sets
  `capabilities.experimentalApi` to `true` (omitted or explicitly `false` are
  both acceptable). (spike.md, "Integration target," explicit; deterministic-
  verification item 2; Success criterion 3)
- **R2** — The Codex-backend implementation and the deterministic evaluator peer
  both target the committed Spike 005 App Server schema baseline
  (`protocol/app-server-schema/`, `codex-cli 0.147.0`) rather than an
  independently assumed protocol. (spike.md, "Protocol/schema baseline";
  deterministic-verification item 1; Success criterion 2) — see Evaluation
  Methodology Note: evidenced structurally, not by a dedicated case.

### Startup

- **R3** — `POST /sessions` for a Codex-backed host establishes the App Server
  transport, completes the required `initialize` handshake, and creates a Codex
  thread — in that order — before returning `201`. (spike.md, "Backend startup,"
  steps 1–6; deterministic-verification items 4–8; Success criteria 6, 8)
- **R4** — The Harness session UUID returned by `201` is never equal to, and is
  not derived from, the Codex thread ID created for that session. (spike.md,
  "Harness session to Codex thread mapping," explicit; deterministic-
  verification item 8; Success criteria 4, 5, 19)
- **R5** — If App Server startup or thread creation fails: no active Harness
  session remains; resources acquired during the failed attempt are released;
  the singleton slot becomes available again; a later creation attempt succeeds
  normally (create, attach, exchange a turn). (spike.md, "Backend startup," "If
  startup fails"; deterministic-verification item 9)
- **R6** — Startup failures produce sanitized server-side diagnostic evidence,
  without requiring browser-specific provider error UX and without leaking
  credentials. (spike.md, "Diagnostic and error surfacing" > "Startup
  failures"/"Sanitization"; deterministic-verification item 10; Success
  criterion 7)

### Turns

- **R7** — When an idle Codex-backed Harness session receives user text over the
  attached WebSocket, the backend starts a new Codex turn (`turn/start`) on the
  existing thread; the text delivered as Codex provider input is the user's
  logical instruction with the browser's trailing PTY carriage-return terminator
  (`\r`) stripped. (spike.md, "Starting a turn," explicit;
  deterministic-verification items 11, 16)
- **R8** — If `turn/start` fails before a turn is established, but the Codex
  backend remains usable: the failure is recorded in sanitized server
  diagnostics; the Harness session remains active; the backend returns to idle;
  no Codex turn is considered active; the client receives exactly one
  `{"type":"error","code":"turn_start_failed","data":"Codex could not start the turn."}`
  message; a subsequent instruction can start a new turn normally. (spike.md,
  "Then define failed turn startup," explicit; deterministic-verification items
  12–14; Success criterion 26)
- **R9** — A completed Codex turn does not end the Harness session: the browser
  may remain attached, the Codex thread remains associated with the session, and
  another user instruction can start another turn on that same thread.
  (spike.md, "Turn completion," explicit; deterministic-verification items
  20–22; Success criteria 10, 11)
- **R10** — Agent-message text reaching the client follows the delta-first
  projection rule: for a given agent-message item, if one or more
  `item/agentMessage/delta` notifications were observed, those deltas are
  forwarded to the client and the later completed item text for that same item
  is **not** forwarded again; if no deltas were observed for that item, the
  completed text may be forwarded exactly once as fallback. (spike.md,
  "Agent-text projection," explicit; deterministic-verification items 17–19;
  Success criterion 9)

### Active-turn input rejection

- **R11** — User input received on the attached WebSocket while a Codex turn is
  active — including the synchronous "busy" interval that begins the moment
  Harness accepts an instruction for an idle session, strictly before the
  corresponding `turn/start` request's asynchronous round trip resolves — is
  rejected: it does not start another turn; it does not call `turn/steer`; it is
  not queued for later execution; it does not interrupt the active turn; it does
  not close the WebSocket; it is not silently discarded. The client receives
  exactly one
  `{"type":"error","code":"turn_active","data":"Codex is already working on a turn."}`
  message. The active turn, Codex thread, Harness session, and attached
  WebSocket remain otherwise unchanged and usable afterward. (spike.md, "Input
  during an active turn," explicit; deterministic-verification items 15, 23–28;
  Success criterion 12)

### Structured events

- **R12** — Non-text, non-agent-message Codex provider events that Harness does
  not model (e.g. `thread/status/changed`, `thread/tokenUsage/updated`,
  `account/rateLimits/updated`, or another valid-but-unmodeled notification) do
  not need to be rendered as terminal output, and must not corrupt the Harness
  session lifecycle or crash the host process. (spike.md, "Other structured
  events," explicit; deterministic-verification items 29, 31)
- **R13** — Provider request IDs, item IDs, turn IDs, and thread IDs never
  replace or become part of Harness session identity. (spike.md, "App Server
  process ownership," explicit; deterministic-verification item 30; Success
  criterion 19)

### Detachment

- **R14** — Browser detachment does not end the Codex backend and does not
  interrupt the active turn merely because the client disappeared; an active
  turn may continue while no browser is attached; the browser can reattach while
  the Harness session still exists; replay of events missed while detached is
  not required. (spike.md, "Detach and reattach," explicit;
  deterministic-verification items 32–35; Success criterion 13)

### Stop — idle

- **R15** — Deleting an idle Codex-backed Harness session (no active turn)
  finalizes backend resources (App Server transport/process) before `204` is
  returned, and does not invoke permanent provider-thread deletion. (spike.md,
  "No active turn"; "Stopping Harness does not delete provider history";
  deterministic-verification items 36–37; Success criterion 17)

### Stop — active turn

- **R16** — Deleting a session with an active turn issues `turn/interrupt` for
  that turn (correct `threadId`/`turnId`) and, on the graceful path, awaits both
  a successful interrupt acknowledgement and the terminal `turn/completed` event
  with interrupted status before final backend teardown and `204`. (spike.md,
  "Active turn: graceful interruption," explicit; deterministic-verification
  items 38–40; Success criterion 14)
- **R17** — Bounded fallback teardown is permitted, and on successful
  finalization still results in `204`, when: the interrupt request fails; the
  backend becomes unusable during interruption; or the interrupted terminal
  event has not been observed within the configured grace period (T3 in
  `eval-requirements.md`; production default 5000ms). (spike.md, "Active turn:
  bounded fallback," explicit; deterministic-verification items 41–42; Success
  criteria 15, 16)
- **R18** — If Harness cannot successfully finalize the backend even through
  bounded fallback, deletion uses the existing failure path (a non-`204`
  status). (spike.md, "Active turn: bounded fallback," explicit;
  deterministic-verification item 43)
- **R19** — Provider process exit racing with a Harness-initiated `DELETE` does
  not produce duplicate or conflicting finalization. (spike.md, general
  finalization-race concern carried from the Spike 004 contract still in force;
  deterministic-verification item 44)

### Backend failure

- **R20** — Fatal App Server/backend termination (independent of ordinary turn
  completion) ends the Harness session per the established lifecycle: sanitized
  diagnostics identify the fatal condition where available; an attached client
  is closed; the session becomes stale (`GET /sessions/:id` → `404`); a
  replacement Harness session can subsequently be created and attached.
  (spike.md, "Backend-initiated termination," explicit;
  deterministic-verification items 45–49; Success criterion 18)

### Regression

- **R21** — Existing PTY-backed session behavior — creation, singleton
  enforcement, attach, detach/reattach, stop, backend-initiated termination and
  recovery, `GET` existence check, programmatic shutdown, and the localhost-only
  networking posture — remains materially intact, unaffected by the Codex
  integration existing in the codebase. (spike.md, "Regression," explicit;
  deterministic-verification items 50–51; Success criterion 22)
- **R22** — PTY-specific code does not acquire Codex-specific behavior, and
  generic Harness session management does not become littered with App Server
  protocol details. (spike.md, "Do not preserve false abstraction";
  "Regression," item 51; Failure signals)

### Runtime selection and authentication (verified by inspection — see

Evaluation Methodology Note)

- **R23** — A normal, non-test-only mechanism exists to run Harness with the
  Codex backend (spike.md leaves the exact mechanism unspecified). (spike.md,
  "Runtime backend selection," explicit)
- **R24** — A live smoke against the real, locally installed, authenticated
  Codex App Server is performed and recorded somewhere in the
  implementation/evaluation/outcome workflow before the spike is treated as a
  meaningful real-provider proof. (spike.md, "Live Codex smoke verification,"
  explicit; Success criterion 21)

## Derived Invariants

- **I1** — Concurrent `POST /sessions` while a Codex backend's startup (App
  Server `initialize` + `thread/start`) is in progress is rejected `409` without
  disturbing that in-progress startup; only one App Server process and one
  thread are ever created for that attempt. Derived from R3 combined with the
  generic singleton-reservation-before-async-startup invariant established by
  Spike 004 and explicitly still in force ("Spike 004 startup contract remains
  in force").
- **I2** — Turn-active busy state begins synchronously when Harness accepts user
  input for an idle Codex session, strictly before the corresponding
  `turn/start` request's asynchronous round trip resolves. Derived directly from
  spike.md's explicit "the Codex backend becomes busy synchronously ... before
  the asynchronous `turn/start` request is sent."
- **I3** — Turn-active busy state ends only at the turn's terminal
  `turn/completed` event, or at `turn/start`'s own failure (R8) — not merely at
  `turn/start`'s JSON-RPC response, which (per the empirically-confirmed
  protocol behavior — see Pre-Freeze Integrity Gate) only acknowledges turn
  acceptance and arrives well before the turn's own work, and any of its
  item/delta notifications, are complete. Derived from spike.md's explicit "The
  backend remains busy until either: the resulting turn reaches its terminal
  `turn/completed` state; or the `turn/start` attempt fails before a turn is
  successfully established."
- **I4** — Exactly one Harness-generated `turn_active` or `turn_start_failed`
  error message is produced per rejected or failed instruction attempt — not
  zero, and not more than one. Derived from R8 ("exactly one client-visible
  `turn_start_failed` error message") and R11 ("exactly one client-visible
  error").
- **I5** — `GET /sessions/:id` reflects the same "session currently exists"
  concept as WebSocket-attach-eligibility and `DELETE`-eligibility for
  Codex-backed sessions, unchanged from the Spike 004 baseline contract. Derived
  from "Spike 004 startup contract remains in force" combined with the
  already-established GET/attach/DELETE consistency.
- **I6** — The singleton slot becomes available again immediately once a
  Codex-backed session reaches a definitive terminal state (`204` for explicit
  stop via either the graceful or fallback path, or backend-initiated
  termination fully processed) — no additional delay — regardless of which
  teardown path was used. Derived from R15/R16/R17/R20 combined with the Spike
  004 baseline invariant.
- **I7** — Ending Harness supervision of a Codex-backed session, through any
  stop or termination path, never issues a permanent-deletion request (e.g.
  `thread/delete`) to App Server. Derived directly from spike.md, "Stopping
  Harness does not delete provider history," explicit.
- **I8** — A second sequential Codex turn on the same Harness session targets
  the same Codex thread ID as the first turn; no second `thread/start` call
  reaches App Server for that session. Derived from spike.md, "Multiple
  sequential turns," explicit ("The second turn must not create ... a
  replacement Codex thread").
- **I9** — Repeated create/stop cycles for Codex-backed sessions continue to
  yield pairwise-distinct Harness session IDs (mirrors the Spike 004 baseline
  ID-uniqueness invariant, unaffected by backend type). Derived from the generic
  session-ID-uniqueness contract carried from Spike 003/004, unaffected by this
  spike.
- **I10** — Programmatic host shutdown (`host.close()`) finalizes an active
  Codex-backed session's App Server process/transport before the shutdown
  promise resolves, mirroring the existing PTY-backend shutdown contract.
  Derived from the Spike 004 finalization invariant ("every backend that has
  successfully started is finalized ... regardless of whether termination was
  Harness-initiated or backend-initiated") applied to the Codex backend.

## Negative Requirements

- **N1** — `201` must never be observed before App Server initialization and
  thread creation have both succeeded. (spike.md, explicit; Failure signal;
  mirrors R3)
- **N2** — A failed Codex backend startup must never leave the singleton slot
  occupied. (Failure signal; mirrors R5)
- **N3** — Codex backend termination, of either kind (explicit stop or fatal
  independent termination), must never leave Harness unable to create a
  subsequent session. (Failure signal; mirrors R20)
- **N4** — Input received during an active turn must never be silently
  discarded, queued, used to call `turn/steer`, or allowed to start a second
  concurrent turn. (spike.md, explicit; Failure signal; mirrors R11)
- **N5** — Agent-message text must never be delivered to the client twice for
  the same agent-message item merely because both incremental and completed
  representations were received from App Server. (spike.md, explicit; Failure
  signal; mirrors R10)
- **N6** — Harness must not opt into `capabilities.experimentalApi = true`.
  (spike.md, explicit; Failure signal; mirrors R1)
- **N7** — Harness must not implement OpenAI authentication: no browser-facing
  credential prompts, no credential storage, no copying of Codex credential
  files, no token refresh, no OAuth flow, no credential proxying to the client,
  no credential exposure through Harness APIs. (spike.md, "Authentication,"
  explicit) — see Evaluation Methodology Note: an absence-of-feature claim,
  evidenced by code inspection at `verify`, not a dedicated runtime assertion.
- **N8** — Server diagnostics/logs for Codex-backend startup and runtime
  failures must not contain access tokens, authentication credentials, secrets,
  or other raw sensitive authorization material. (spike.md, "Sanitization,"
  explicit; mirrors R6)
- **N9** — Stop while a Codex turn is active must not tear down App Server
  immediately without first attempting graceful interruption and observing
  either the interrupted terminal event or the bounded grace-period expiry.
  (spike.md, Failure signal, explicit; mirrors R16/R17)
- **N10** — Harness stop must not wait indefinitely for provider interruption;
  teardown must complete (gracefully or via fallback) within the configured
  grace period plus a bounded finalization allowance. (spike.md, Failure signal,
  explicit; mirrors R17)
- **N11** — Successful bounded-fallback finalization must not be treated as an
  implementation failure merely because the provider did not complete the
  graceful interruption sequence. (spike.md, Failure signal, explicit) — see
  Evaluation Methodology Note: a constraint on the evaluator's own judgment when
  classifying E21/E22 results, not itself a runtime assertion.
- **N12** — A client disconnect must never terminate active Codex work.
  (spike.md, Failure signal, explicit; mirrors R14)
- **N13** — PTY-backed sessions must not be affected by Codex-specific input
  normalization: the trailing PTY carriage return must still reach the PTY
  backend unchanged. (spike.md, "Starting a turn," explicit: "PTY-backed
  sessions must retain their existing terminal-input behaviour"; mirrors
  R21/R22)

## Evaluation Methodology Note

- **R2** (protocol/schema-baseline targeting) is evidenced structurally rather
  than by one dedicated case: the deterministic App Server peer used by every
  Codex-backed case is built directly from the frozen schema bundle (method
  names, parameter shapes, and notification shapes below are all drawn from
  `protocol/app-server-schema/*.json`, cross-checked against the real installed
  `codex-cli 0.147.0` binary — see Pre-Freeze Integrity Gate). An implementation
  targeting a different or assumed protocol would fail essentially every
  mandatory Codex-backed case (E2, E7, E9–E11, etc.), not merely appear to pass
  by accident.
- **N7** (no OpenAI-authentication implementation) and **N11** (fallback success
  is not itself a failure) are not independently exercisable via a runtime
  assertion — N7 is an absence-of-feature claim with nothing positive to assert
  beyond "credential material never appeared" (already covered by N8/E6's
  sanitization check), and N11 is a rule governing how the evaluator itself
  interprets E21–E24's results rather than a product behavior. Both are assessed
  by code inspection at `verify` time, consistent with the evaluator skill's own
  guidance to prefer objective executable evaluation "where possible" — these
  two have no meaningful executable form.
- **R23** (normal runtime backend-selection mechanism) and **R24** (live smoke
  performed) are outcome/implementation-process requirements, not requirements
  the deterministic hidden-test suite can exercise without a live, authenticated
  Codex environment (see eval-requirements.md A6/A7). Both are assessed by
  inspection/documentation review at `verify` time: R23 by confirming a normal
  (non-test-only) path exists to select the Codex backend; R24 by confirming the
  implementation or outcome record documents a performed live smoke, per
  spike.md's own explicit allowance that absent authentication "must not be
  misclassified as an implementation defect."

## Evaluation Cases

### Protocol baseline

- **E1** — Purpose: Harness never opts into `experimentalApi`. Verifies: N6, R1.
  Preconditions: fresh host constructed with the Codex backend via T1/T2,
  deterministic peer configured to record the raw `initialize` request params it
  receives. Action: `POST /sessions` (drives startup through completion).
  Expected: the captured `initialize` params show `capabilities.experimentalApi`
  is either absent/`undefined` or `false` — never `true`. Mandatory: yes.

### Startup

- **E2** — Purpose: `201` arrives only after both `initialize` and
  `thread/start` resolve, in that order; the Harness ID differs from the
  provider thread ID. Verifies: R3, R4, N1. Preconditions: fresh host, peer
  under test control holding both the `initialize` and `thread/start` responses
  pending until explicitly released. Action: `POST /sessions`; confirm the
  response is still unresolved while `initialize` is pending; release
  `initialize`'s response (still no session-creation response); release
  `thread/start`'s response; await the `POST` response. Expected: `201` arrives
  only after both releases, with a JSON body `{"id": "<UUID>"}` whose `id` is
  not equal to the peer's issued thread ID. Mandatory: yes.
- **E3** — Purpose: concurrent `POST` during Codex startup is rejected without
  disturbing the in-progress startup, and starts exactly one App Server thread.
  Verifies: R3, I1. Preconditions: fresh host, peer holding `thread/start`'s
  response pending. Action: fire a first `POST /sessions` (startup left
  pending); fire a second `POST /sessions` without awaiting the first; await the
  second; only then release the peer's `thread/start` response; await the first.
  Expected: the second response is `409` and arrives without needing the first
  startup to resolve; the first response only arrives (and is `201`) after the
  release; exactly one `thread/start` request ever reached the peer. Mandatory:
  yes. Assumption: standard single-threaded Node ordering, consistent with prior
  spikes' concurrency cases.
- **E4** — Purpose: failed App Server `initialize` is failure-safe. Verifies:
  R5, N1, N2. Preconditions: fresh host, peer configured to return a JSON-RPC
  error for `initialize`. Action: `POST /sessions`. Expected: the response is
  not `201` (and is `>= 400`); a subsequent `POST /sessions` on the same host,
  with a working peer, succeeds (`201`) and can be attached to with a working
  turn exchanged. Mandatory: yes. Assumption: A4.
- **E5** — Purpose: failed `thread/start` (after successful `initialize`) is
  failure-safe. Verifies: R5, N1, N2. Preconditions: fresh host, peer configured
  to succeed `initialize` but return a JSON-RPC error for `thread/start`.
  Action: `POST /sessions`. Expected: response not `201`; a subsequent
  `POST /sessions` succeeds. Mandatory: yes. Assumption: A4.
- **E6** — Purpose: startup diagnostics are recorded and sanitized. Verifies:
  R6, N8. Preconditions: fresh host with server-side diagnostic output captured
  by intercepting `console.error`/`console.warn`/`console.log` (see
  eval-requirements.md A8); peer configured to fail `initialize` with an error
  whose `message`/`data` contains a planted, distinctive fake-secret-looking
  token. Action: `POST /sessions`; inspect captured diagnostic output. Expected:
  a diagnostic entry referencing the failure is recorded; the planted token
  string does not appear verbatim anywhere in captured output (the
  implementation is free to summarize/redact/omit the offending field entirely).
  Mandatory: yes. Assumption: A8.

### Turns

- **E7** — Purpose: user text starts a turn on the existing thread with the
  browser's trailing PTY `\r` stripped before reaching the provider. Verifies:
  R7, N13 (Codex side). Preconditions: one active Codex session, attached.
  Action: send WS input `{"type":"input","data":"hello\r"}` (matching the real
  browser client's trailing-CR convention). Expected: the peer receives exactly
  one `turn/start` request whose `params.threadId` equals the session's thread
  and whose `params.input` is `[{"type":"text","text":"hello"}]` — no trailing
  `\r`. Mandatory: yes.
- **E8** — Purpose: recoverable `turn/start` failure returns the backend to idle
  with exactly one `turn_start_failed` message; the Harness session and thread
  survive; a later instruction succeeds on the same thread. Verifies: R8, I4.
  Preconditions: one active Codex session, attached; peer configured to fail the
  next `turn/start` request only. Action: send input; collect client messages;
  then send a second input once the peer is healthy again (peer drives a normal
  turn to completion). Expected: exactly one
  `{"type":"error","code":"turn_start_failed","data":"Codex could not start the turn."}`
  message is received (and no `turn_active` message for this attempt); the
  second input's `turn/start` targets the same thread ID and its turn completes
  normally, with output reaching the client. Mandatory: yes.
- **E9** — Purpose: agent-message deltas reach the client; completed text is not
  duplicated once deltas were observed. Verifies: R10, N5. Preconditions: one
  active Codex session, attached. Action: send input; peer emits, for one
  agent-message item: `item/started` (empty text), two `item/agentMessage/delta`
  notifications (`"Hel"`, `"lo"`), `item/completed` (full text `"Hello"`), then
  `turn/completed` (`status: "completed"`). Collect all client `output` messages
  for the turn. Expected: the concatenation of collected output equals exactly
  `"Hello"` — each delta forwarded once, the later completed text not forwarded
  again. Mandatory: yes.
- **E10** — Purpose: completed text is used as a fallback exactly once when no
  deltas were observed for that item. Verifies: R10 (fallback branch).
  Preconditions: one active Codex session, attached. Action: send input; peer
  emits `item/started`, `item/completed` (text `"Hello"`) with **no**
  intervening delta notifications, then `turn/completed`. Expected: client
  output equals exactly `"Hello"`, delivered exactly once. Mandatory: yes.
- **E11** — Purpose: turn completion does not end the session; a second
  sequential turn reuses the same thread. Verifies: R9, I8. Preconditions: one
  active Codex session. Action: send input #1; peer completes turn #1 (delta +
  completed + `turn/completed`); confirm `GET /sessions/:id` is still `200` and
  the WS is still open; send input #2; peer completes turn #2. Expected: both
  turns' `turn/start` requests carry the same `threadId` (the peer never
  receives a second `thread/start` call for this session); the session remains
  active throughout; turn #2's output reaches the client. Mandatory: yes.

### Active-turn input rejection

- **E12** — Purpose: input during an active turn is rejected with `turn_active`,
  never queued, steered, or allowed to start a second turn. Verifies: R11, N4,
  I2. Preconditions: one active Codex session, attached; peer holding the
  pending `turn/start` request's response (simulating the in-flight/active
  interval). Action: send input #1 (issues `turn/start`, peer holds the
  response); immediately send input #2 on the same WS. Expected: the client
  receives exactly one
  `{"type":"error","code":"turn_active","data":"Codex is already working on a turn."}`
  message; the peer never receives a second `turn/start` request or any
  `turn/steer` request; after releasing the first `turn/start` response and
  driving the turn to `turn/completed`, a third input succeeds and starts a new
  turn normally on the same thread. Mandatory: yes. Assumption: A1.
- **E13** — Purpose: the busy window begins before `turn/start`'s own response
  resolves, not merely once some later "turn is active" state is reached.
  Verifies: R11, I2, I3. Preconditions: as E12, peer holding `turn/start`'s
  response pending specifically (not yet acknowledged at all). Action: send
  input #1; before the peer's `turn/start` response is released, send input #2.
  Expected: input #2 is rejected `turn_active` even though `turn/start` has not
  yet resolved at all for input #1. Mandatory: yes. Assumption: A1.
- **E14** — Purpose: the active turn, thread, Harness session, and WebSocket
  remain unchanged and usable after a rejected instruction. Verifies: R11
  (closing clause). Preconditions: as E12. Action: after observing the
  `turn_active` rejection, confirm the WS `readyState` is still `OPEN` and
  `GET /sessions/:id` is still `200`; then let the original turn complete
  normally. Expected: the original turn's output still arrives unaffected by the
  rejected input. Mandatory: yes.

### Structured events

- **E15** — Purpose: unmodeled-but-valid non-text provider notifications do not
  corrupt the session or crash the host. Verifies: R12. Preconditions: one
  active Codex session, attached. Action: send input; peer emits several real,
  schema-conformant but Harness-unmodeled notifications (e.g.
  `thread/status/changed`, `thread/tokenUsage/updated`,
  `account/rateLimits/updated`) interleaved with a normal
  delta/completed/`turn/completed` sequence. Expected: no uncaught
  error/unhandled rejection occurs in the host process; client output equals
  exactly the agent text (the unmodeled notifications do not appear as spurious
  output); the session remains usable for a subsequent turn. Mandatory: yes.
- **E16** — Purpose: provider identifiers never leak into Harness session
  identity. Verifies: R4, R13. Preconditions: one active Codex session, one full
  turn exchanged. Action: compare the Harness session ID (from `POST`/`GET`)
  against every provider-generated identifier observed during the turn (thread
  ID, turn ID, item ID). Expected: the Harness session ID is never equal to, and
  does not contain as a substring, any provider-generated identifier. Mandatory:
  yes.

### Detachment

- **E17** — Purpose: detach does not end the Codex backend; an active turn
  continues while detached; reattach continues working. Verifies: R14, N12.
  Preconditions: one active Codex session, attached, with an in-progress turn
  (peer holding turn completion pending). Action: close the WS without stopping
  the session; wait briefly; release the peer's turn completion; reattach.
  Expected: `GET /sessions/:id` remains `200` throughout; the peer never
  receives an interrupt/kill signal merely because the client disconnected;
  reattachment succeeds; a subsequent turn on the same thread works normally.
  Mandatory: yes.
- **E18** — Purpose: events produced while detached are not required to be
  replayed, and Harness does not corrupt state trying to. Verifies: R14
  (explicit non-requirement). Preconditions: as E17, detach spans an
  agent-message delta the client never receives. Action: detach before any delta
  is emitted; peer emits deltas and completes the turn while detached; reattach;
  collect output received strictly after reattachment. Expected: no crash or
  corrupted session state from the detached completion; the reattached client
  can still exchange input/output normally on a fresh turn. (Whether
  pre-detachment deltas are replayed is explicitly not asserted either way — see
  Out of Scope.) Mandatory: yes.

### Stop — idle

- **E19** — Purpose: `DELETE` on an idle Codex session finalizes App Server
  before `204`; does not call permanent thread deletion. Verifies: R15, I6, I7.
  Preconditions: one active, idle Codex session (no turn in progress). Action:
  `DELETE /sessions/:id`. Expected: `204`; the peer observes its
  process/transport being terminated as part of finalization; the peer never
  received a `thread/delete` request; a subsequent `POST /sessions` immediately
  succeeds. Mandatory: yes.

### Stop — active turn

- **E20** — Purpose: graceful interrupt path — `DELETE` during an active turn
  issues `turn/interrupt` and awaits the interrupted terminal event before
  `204`. Verifies: R16, N9. Preconditions: one active Codex session with an
  in-progress turn (peer holding turn completion pending). Action:
  `DELETE /sessions/:id`; after a short delay, have the peer acknowledge
  `turn/interrupt` and then emit `turn/completed` with `status: "interrupted"`.
  Expected: the peer receives exactly one `turn/interrupt` request with the
  correct `threadId`/`turnId` before any forced termination signal; the `DELETE`
  response (`204`) does not arrive until after the interrupted `turn/completed`
  notification has been emitted. Mandatory: yes.
- **E21** — Purpose: bounded fallback triggers when the interrupted terminal
  event does not arrive within the configured grace period. Verifies: R17, N10.
  Preconditions: one active Codex session constructed with a small
  `interruptGraceMs` override (T3, e.g. 150ms); active turn in progress; peer
  acknowledges `turn/interrupt` but never emits the terminal `turn/completed`.
  Action: `DELETE /sessions/:id`; measure elapsed time to `204`. Expected: `204`
  arrives only after roughly `interruptGraceMs` has elapsed (bounded, not
  near-instant, not unbounded); a subsequent `POST` succeeds. Mandatory: yes.
- **E22** — Purpose: bounded fallback also triggers when the interrupt request
  itself fails. Verifies: R17, N10. Preconditions: as E21 (small grace period);
  peer returns a JSON-RPC error for `turn/interrupt`. Action:
  `DELETE /sessions/:id`. Expected: `204` (fallback finalization succeeds)
  within a bounded time; a subsequent `POST` succeeds. Mandatory: yes.
- **E23** — Purpose: the production default grace period is materially five
  seconds, not some other value. Verifies: R17 (default value). Run once (see
  eval-requirements.md T3 and Limitations). Preconditions: one active Codex
  session constructed **without** an `interruptGraceMs` override (default path);
  active turn in progress; peer acknowledges `turn/interrupt` but never emits
  the terminal event. Action: `DELETE /sessions/:id`; measure wall-clock elapsed
  time to `204`. Expected: elapsed time falls within roughly 4.5s–7s. Mandatory:
  yes.
- **E24** — Purpose: failure to finalize even through bounded fallback uses the
  existing deletion failure path. Verifies: R18. Preconditions: active turn in
  progress, small grace period; peer's process deliberately does not exit even
  when signaled (see Limitations for how this is simulated deterministically and
  safely cleaned up). Action: `DELETE /sessions/:id`. Expected: response is not
  `204` (existing failure path), observed within a bounded test timeout.
  Mandatory: yes.
- **E25** — Purpose: provider process exit racing with Harness-initiated
  `DELETE` does not produce duplicate/conflicting finalization. Verifies: R19,
  N3. Preconditions: one active, idle Codex session (no turn active, to isolate
  this race from the interrupt path). Action: issue `DELETE /sessions/:id`;
  without awaiting it, have the peer's process exit on its own at essentially
  the same time. Expected: no uncaught error/unhandled rejection in the host
  process; `DELETE` resolves to some definitive response within a normal
  timeout; afterward `GET /sessions/:id` is `404`; a subsequent `POST` succeeds.
  Mandatory: yes.

### Backend failure

- **E26** — Purpose: fatal App Server termination (idle) ends the session per
  the established lifecycle. Verifies: R20, N3. Preconditions: one active Codex
  session, attached, idle (no turn active). Action: the peer's process exits
  unexpectedly, with no preceding `DELETE`. Expected: the attached WS is closed
  by the server; `GET /sessions/:id` → `404`; a server-side diagnostic entry is
  recorded; `POST /sessions` succeeds with a new ID and can be attached to and
  used normally (fresh peer instance). Mandatory: yes.
- **E27** — Purpose: fatal termination during an active turn also ends the
  session correctly. Verifies: R20. Preconditions: one active Codex session,
  attached, turn in progress. Action: the peer's process exits unexpectedly
  mid-turn, with no preceding `DELETE`. Expected: same postconditions as E26.
  Mandatory: yes.

### Regression (PTY)

- **E28** — Purpose: PTY-backed session lifecycle remains intact with the Codex
  integration present in the codebase, using the host's default (no-options)
  construction path. Verifies: R21, R22. Preconditions: fresh host via
  `startHarnessHost(port)` (no options — PTY backend). Action: create → attach →
  exchange genuine PTY input/output (not mere echo) → detach → reattach → stop
  (`204`) → `GET` (`404`) → create again. Expected: every step behaves per the
  established Spike 004 baseline contract. Mandatory: yes.
- **E29** — Purpose: PTY trailing-`\r` handling is unaffected by Codex input
  normalization. Verifies: N13. Preconditions: one active PTY session, attached.
  Action: send WS input with a trailing `\r` forming a real shell command that
  produces a distinctive, non-echo-derived marker. Expected: genuine PTY output
  for the executed command is observed (proving the `\r` still reaches the PTY
  as Enter, unaffected by Codex-path stripping logic). Mandatory: yes.
- **E30** — Purpose: Codex-backed session IDs remain pairwise distinct across
  create/stop cycles. Verifies: I9. Preconditions: fresh host with the Codex
  backend (peer configured to succeed immediately). Action: create, stop,
  create, stop, create (three cycles). Expected: all three issued IDs are
  pairwise distinct. Mandatory: yes.
- **E31** — Purpose: programmatic host shutdown finalizes an active Codex-backed
  session. Verifies: I10. Preconditions: one active Codex session (idle).
  Action: invoke the host's programmatic shutdown/close mechanism. Expected: the
  peer's process/transport is finalized (process exit observed, or equivalent
  transport-close signal) before `close()` resolves. Mandatory: yes.

## Coverage Matrix

| ID  | Covered by                      | Executable                            | Test file(s)                                           |
| --- | ------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| R1  | E1                              | yes                                   | codex-protocol-baseline.test.ts                        |
| R2  | (all Codex cases)               | structural, not a dedicated assertion | n/a — see Evaluation Methodology Note                  |
| R3  | E2, E3                          | yes                                   | codex-startup.test.ts                                  |
| R4  | E2, E16                         | yes                                   | codex-startup.test.ts, codex-structured-events.test.ts |
| R5  | E4, E5                          | yes                                   | codex-startup.test.ts                                  |
| R6  | E6                              | yes                                   | codex-startup.test.ts                                  |
| R7  | E7                              | yes                                   | codex-turns.test.ts                                    |
| R8  | E8                              | yes                                   | codex-turns.test.ts                                    |
| R9  | E11                             | yes                                   | codex-turns.test.ts                                    |
| R10 | E9, E10                         | yes                                   | codex-turns.test.ts                                    |
| R11 | E12, E13, E14                   | yes                                   | codex-active-turn.test.ts                              |
| R12 | E15                             | yes                                   | codex-structured-events.test.ts                        |
| R13 | E16                             | yes                                   | codex-structured-events.test.ts                        |
| R14 | E17, E18                        | yes                                   | codex-detach-reattach.test.ts                          |
| R15 | E19                             | yes                                   | codex-stop.test.ts                                     |
| R16 | E20                             | yes                                   | codex-stop.test.ts                                     |
| R17 | E21, E22, E23                   | yes                                   | codex-stop.test.ts                                     |
| R18 | E24                             | yes                                   | codex-stop.test.ts                                     |
| R19 | E25                             | yes                                   | codex-stop.test.ts                                     |
| R20 | E26, E27                        | yes                                   | codex-backend-failure.test.ts                          |
| R21 | E28                             | yes                                   | codex-regression-pty.test.ts                           |
| R22 | E28, E29                        | yes                                   | codex-regression-pty.test.ts                           |
| R23 | (verify-time inspection)        | manual                                | n/a — see Evaluation Methodology Note                  |
| R24 | (verify-time inspection)        | manual                                | n/a — see Evaluation Methodology Note                  |
| I1  | E3                              | yes                                   | codex-startup.test.ts                                  |
| I2  | E12, E13                        | yes                                   | codex-active-turn.test.ts                              |
| I3  | E13                             | yes                                   | codex-active-turn.test.ts                              |
| I4  | E8, E12                         | yes                                   | codex-turns.test.ts, codex-active-turn.test.ts         |
| I5  | E19 (GET checks throughout)     | yes                                   | codex-stop.test.ts                                     |
| I6  | E19                             | yes                                   | codex-stop.test.ts                                     |
| I7  | E19                             | yes                                   | codex-stop.test.ts                                     |
| I8  | E11                             | yes                                   | codex-turns.test.ts                                    |
| I9  | E30                             | yes                                   | codex-regression-pty.test.ts                           |
| I10 | E31                             | yes                                   | codex-regression-pty.test.ts                           |
| N1  | E2, E4, E5                      | yes                                   | codex-startup.test.ts                                  |
| N2  | E4, E5                          | yes                                   | codex-startup.test.ts                                  |
| N3  | E25, E26                        | yes                                   | codex-stop.test.ts, codex-backend-failure.test.ts      |
| N4  | E12                             | yes                                   | codex-active-turn.test.ts                              |
| N5  | E9                              | yes                                   | codex-turns.test.ts                                    |
| N6  | E1                              | yes                                   | codex-protocol-baseline.test.ts                        |
| N7  | (verify-time inspection)        | manual                                | n/a — see Evaluation Methodology Note                  |
| N8  | E6                              | yes                                   | codex-startup.test.ts                                  |
| N9  | E20                             | yes                                   | codex-stop.test.ts                                     |
| N10 | E21, E22                        | yes                                   | codex-stop.test.ts                                     |
| N11 | (evaluator judgment on E21–E24) | n/a — see Evaluation Methodology Note | n/a                                                    |
| N12 | E17                             | yes                                   | codex-detach-reattach.test.ts                          |
| N13 | E7, E29                         | yes                                   | codex-turns.test.ts, codex-regression-pty.test.ts      |

This mapping must agree with `.hidden-test/manifest.json`.

## Out of Scope

- The exact internal shape of the object `createCodexBackend` resolves to beyond
  satisfying whatever `SessionBackend`-shaped (or evolved) interface Harness's
  own session management uses — every mandatory case exercises it only through
  the public HTTP/WebSocket surface (spike.md, "Do not preserve false
  abstraction," explicit).
- Exact response bodies/content-types for `409`/`404`/failed-startup responses
  beyond what R3–R6 specify (not specified by spike.md).
- The exact HTTP status code for a failed Codex-backend-startup `POST /sessions`
  response, beyond "not `201`" (spike.md does not prescribe one; mirrors Spike
  004's A3-equivalent, restated here as A4).
- Whether pre-detachment agent-message deltas are replayed to a later-reattached
  client — spike.md explicitly does not require this either way for Spike 005
  (E18 confirms absence of corruption/crash only, not a specific
  replay/no-replay outcome).
- Exact model wording, token usage, or any live-model-dependent content (the
  entire mandatory hidden-test suite is deterministic; live Codex smoke
  verification is separately required by spike.md but is not part of this
  evaluation specification's automated coverage — see R24/A7).
- Structured rendering of approval requests, tool-call activity, file changes,
  or other non-agent-message item types beyond confirming they do not corrupt
  the session (E15) — explicit non-goals.
- Multiple simultaneous Harness sessions, user-selectable providers, provider
  discovery/plugin frameworks (explicit non-goals).
- Resuming a previously-created Codex thread into a new Harness session,
  persistence of Harness-to-provider identity mappings across restart (explicit
  non-goals).
- Precise interleaving/observable state _during_ a cleanup window, before a
  terminal response (`204`/`404`/removal) has actually been returned —
  postconditions once that response arrives are what is specified (carried from
  Spike 003/004's own Limitations).
- The internal class/module structure of the Codex backend beyond it being
  reachable through the T1/T2-conforming construction seam and passing every
  mandatory case.
- R23 (runtime backend-selection mechanism) and R24 (live smoke performed):
  assessed by inspection at `verify`, not automated (see Evaluation Methodology
  Note).
- N7 (no OpenAI-authentication implementation): assessed by inspection at
  `verify` (see Evaluation Methodology Note).

## Limitations

- E2, E3, E4, E5, E8, E12, E13, E17, E20–E25, E26, E27, E30 all depend on the
  deterministic App Server peer's ability to: hold specific JSON-RPC responses
  pending and release them on command; emit specific notifications on command,
  in a specified order; simulate its own unexpected process exit; and report
  exactly what requests it received, in order, with their parameters. This
  helper (`.hidden-test/fixtures/fake-app-server.ts` plus its
  `.hidden-test/helpers.ts` control wrapper) is independently self-checked
  before any mandatory case relies on it — see Pre-Freeze Integrity Gate.
- The fake App Server peer runs as a genuinely separate, `fork()`-ed Node.js
  child process communicating the real protocol over real stdio pipes
  (newline-delimited JSON, per the empirically-confirmed A2 assumption), with a
  second, Node-IPC-based channel used **only** for test control (holding/
  releasing responses, commanding notification emission, commanding process
  exit). The Codex-backend implementation under test only ever sees the stdio
  channel — it has no visibility into, and cannot distinguish, the control
  channel's existence. This preserves T2's requirement that the implementation
  exercise genuine asynchronous process/stdio transport rather than a direct
  in-process callback fake.
- E24 (fallback finalization itself fails) is simulated by having the fake
  peer's process register a handler that ignores `SIGTERM`, so that if the
  implementation attempts a normal graceful-kill fallback it will not observe
  the process exiting; the test hidden-test harness force-kills (`SIGKILL`) that
  process itself during cleanup regardless of the assertion outcome, so no
  orphaned process survives a test run. This is the only mandatory case that
  deliberately holds a child process open past its wall-clock timeout; it is
  bounded by `node --test`'s per-test timeout.
- E23 is the only case in this specification that waits on the real, undisclosed
  5-second default rather than an overridden short value, consistent with
  spike.md's own "Evaluation discipline" instruction to avoid sleeping for real
  five-second intervals "throughout the suite" (not "at all") — see
  eval-requirements.md T3.
- Baseline PTY regression cases (E28, E29) reuse the already-validated
  connection/PTY-query helper patterns (`connect`, `rejectedUpgrade`,
  `buildQueryCommand`/`readBashPid`) carried over from Spike 003/004's own
  promoted, previously-verified hidden-test suites
  (`spikes/004-session-backend-abstraction/evaluation/hidden-tests/ helpers.ts`),
  per spike.md's own "Existing tests may be reused or adjusted where
  appropriate" and the evaluator skill's "minimize evaluator cleverness"
  guidance, rather than re-derived from scratch.
- R23/R24/N7 have no executable hidden-test coverage by design (see Evaluation
  Methodology Note); `verify` must assess them by direct code inspection and,
  for R24, by checking the implementation/outcome record for a documented
  live-smoke run, weaker assurance than the automated coverage used elsewhere in
  this spec.
- The deterministic peer's shapes for `thread/start`'s response, `turn/start`'s
  response, `turn/interrupt`'s response, and every notification used above were
  derived from a real, empirically-observed handshake, turn, and interrupt
  sequence against the actual installed `codex-cli 0.147.0` binary (see
  Pre-Freeze Integrity Gate) — not solely from static reading of the schema
  bundle — but the peer does not attempt to model every field App Server
  actually returns (e.g. full `Thread`/`Turn` metadata), only the fields this
  specification's cases depend on. An implementation reading additional real
  fields the fake peer omits is free to do so; no case depends on their absence.

## Pre-Freeze Integrity Gate

All checks below passed before `Status` was set to `Frozen`.

### Shared helpers identified and validated

Non-trivial shared helpers live in `.hidden-test/fixtures/fake-app-server.ts`
(the deterministic peer process) and `.hidden-test/helpers.ts` (the parent-side
control wrapper and Codex-specific choreography built on top of it). All are
independently validated in `helpers.selfcheck.test.ts` (10/10 passing, run in
isolation, unrelated to whether the Codex-backend implementation under test
exists):

- **`makeFakeAppServer` / the fork+stdio+IPC transport itself** — validated
  end-to-end through the real transport boundary it is used across (per the
  gate's own requirement that a helper exercised through an asynchronous
  process/stdio boundary be validated through that same boundary, not only
  in-process): a real JSON-RPC request line is written to the forked child's
  real stdin, observed via the real IPC "request" event, responded to via the
  real IPC "respond" command, and the resulting real stdout line is read back
  and asserted byte-for-byte
  (`selfcheck: fake app-server round-trips a request/response over the real stdio transport`).
  A negative control confirms a malformed input line is reported (not crashed
  on) and does not corrupt subsequent request handling. `waitForRequest`'s FIFO
  queue/waiter logic is validated on both branches (message-arrives-first and
  waiter-registered-first). `ignoreSigterm`/`exit` are validated with both a
  positive control (default SIGTERM handling exits promptly, `signal: null`
  confirming a voluntary `process.exit(0)` rather than being signal-killed) and
  a negative control (with `ignoreSigterm()` engaged, SIGTERM is demonstrably
  not fatal within a bounded wait, and only `SIGKILL` — which cannot be ignored
  — reliably cleans it up, matching how E24 is designed).
- **`autoHandshake`** — validated by writing real `initialize`/`thread/start`
  request lines to a real peer and asserting the exact real response lines
  produced (correct `id` echo, `thread.id`/`thread.cwd` reflecting the supplied
  options).
- **`driveNormalTurn` / `waitForTurnStart`** — validated by asserting the exact
  9-line notification sequence (one response + 8 notifications) matches the
  sequence empirically observed against the real installed App Server (see
  Material runtime assumptions below), including that concatenated delta chunks
  and the completed item's own `text` both equal the configured final text
  (protects against the no-duplication logic being asserted against the wrong
  signal).
- **`makeCodexBackendFactoryController`** — validated with a positive control (a
  second attempt only resolves once a second factory invocation genuinely
  happens) and confirmed to hand out a distinct underlying peer process (`pid`)
  per invocation.
- **`isPendingAfter`** — validated with both a positive control (an
  already-settled, and an already-rejected, promise report `false` immediately)
  and a negative control (a promise settling after 300ms reports `true` at the
  50ms mark).
- **`createCodexBackend`'s dynamic-import seam** — validated to fail cleanly and
  informatively (`ERR_MODULE_NOT_FOUND` naming the exact expected path) before
  `src/codex-backend.ts` exists, rather than hanging, throwing an unrelated
  error, or silently resolving.

Each helper is small and single-purpose (the peer script only frames/routes
JSON-RPC; `autoHandshake`/`driveNormalTurn`/`waitForTurnStart` are separate,
narrowly-scoped functions; `makeCodexBackendFactoryController` only sequences
peer instances) rather than one do-everything utility, so a single helper defect
cannot silently invalidate more mandatory cases than necessary — each of the 31
mandatory-case tests makes its own explicit assertions on top of these helpers.

### Oracle and falsifiability validated per mandatory case

For status-code-only cases with no protocol-content dependency (E1's overall
shape, parts of E2–E6, E19's `204`/`404`, E20–E25's `204`/non-`204`, E26/E27's
`404`), the oracle is a direct HTTP status/JSON-body comparison — deterministic
and needing no further control per the gate's own "do not build elaborate
controls for trivial, deterministic assertions" guidance.

For cases whose oracle depends on the deterministic peer's own state
(`requestLog` filtering, exact request `params`, response timing via
`isPendingAfter` or elapsed-`Date.now()`), each is falsifiable in both
directions:

- **E1/N6** — an implementation that opts into `experimentalApi: true` fails the
  direct boolean comparison; a correct one passes. Confirmed today (see below)
  that the case fails for the expected pre-implementation reason (backend never
  starts), not by accident.
- **E2/E3 (ordering/singleton)** — mirrors Spike 004's E5 falsifiability
  argument, extended to two sequential async steps: an implementation that
  returns `201` before both `initialize` and `thread/start` resolve, or that
  starts a second App Server process/thread for a concurrent `POST`, is caught
  directly by `isPendingAfter`/`invocationCount`-equivalent (`requestLog`
  filtering) assertions; one that correctly gates on both steps passes.
- **E8/E9/E10 (delta/no-duplication)** — an implementation that forwards both
  deltas and the completed text would produce concatenated output longer than
  the configured final text (e.g. `"HelloHello"`), failing the exact-string
  equality; one that drops deltas entirely and never uses the fallback would
  produce empty/short output. Only the specified behavior produces the exact
  expected string in each of E9's (deltas-observed) and E10's
  (no-deltas-observed) scenarios — these are deliberately complementary positive
  controls for the two branches of R10.
- **E12/E13 (turn_active)** — an implementation that silently drops the second
  input produces no error message at all (assertion times out, distinguishable
  from a wrong-but-present message); one that queues or steers it produces a
  second `turn/start` or a `turn/steer` request in `requestLog`, failing the
  "exactly one turn/start, zero turn/steer" assertion; one that races a second
  `turn/start` before the busy flag is set is caught by E13 specifically holding
  the first `turn/start` unanswered.
- **E20 (graceful interrupt ordering)** — the two `isPendingAfter` checks
  bracket the exact two events (`turn/interrupt` ack, then the interrupted
  terminal event) that must both occur before `204`; an implementation that
  tears down immediately after issuing `turn/interrupt` (without awaiting
  either) would fail the first `isPendingAfter` check; one that awaits the ack
  but not the terminal event would fail the second.
- **E21/E22/E23/E24 (bounded fallback timing)** — E21/E22 assert a _lower_ bound
  (fallback must not fire near-instantly, proving it genuinely waited for the
  grace period) and an _upper_ bound (must not hang indefinitely); E23 does the
  same against the real, undisclosed default; E24 asserts the _absence_ of `204`
  when even fallback cannot succeed (peer ignores `SIGTERM`), which only a
  genuine finalization-failure path can produce — an implementation that always
  reports `204` regardless of backend state would fail this directly.
- **E25/E19 (races/idle stop)** — the oracle is deliberately loose on
  intermediate detail and strict on convergent postconditions (`GET` afterward
  `404`, next `POST` not blocked, no uncaught error/unhandled rejection),
  mirroring Spike 004's E29/E30 finalization-race design; a genuine
  duplicate-teardown or leaked-slot defect fails the postcondition checks
  regardless of which intermediate response "wins".
- **E28/E29 (PTY regression)** — reuse Spike 003/004's own already-validated
  `buildQueryCommand`/`readBashPid` oracle (immune to PTY echo/job-control
  noise; proven by that spike's own gate), applied here to confirm the Codex
  integration's mere presence in the codebase does not regress PTY behavior.
  **These two cases pass today, against the current pre-implementation
  codebase** (see below) — direct, currently-green evidence that the oracle and
  the regression path both work, not merely an argument.

### Material runtime assumptions validated

- **App Server wire framing (A2).** Validated empirically against the actual
  installed `codex app-server --stdio` binary (`codex-cli 0.147.0`, matching the
  frozen schema baseline) with a throwaway Python diagnostic script (not
  retained as a hidden-test artifact): a real `initialize` request written as
  one line terminated by `\n` produced exactly one `\n`-terminated JSON response
  line, confirming newline-delimited framing rather than `Content-Length`-header
  framing.
- **Turn/notification event ordering and shapes.** Validated empirically with a
  second throwaway diagnostic: a real `thread/start` → `turn/start` → (deltas) →
  `turn/completed` sequence against the real installed binary produced exactly
  the notification sequence and field shapes that `driveNormalTurn` reproduces
  (`turn/start`'s own response arrives before `turn/started`; `item/started` for
  the agent-message item carries empty `text`; `item/agentMessage/delta` carries
  incremental `delta` chunks; `item/completed` carries the full final `text`;
  `turn/completed` carries `turn.status`). This directly grounds I3 ("busy ends
  at `turn/completed`, not at `turn/start`'s own response").
- **Interrupt acknowledgement and timing.** The same diagnostic issued
  `turn/interrupt` against a real in-progress turn: the response (`result: {}`)
  and the interrupted `turn/completed` (`status: "interrupted"`) both arrived in
  well under 100ms locally — confirming the real protocol shape E20's ordering
  assertions depend on, and confirming five real seconds is a generous bound
  rather than a value the real provider itself would routinely need (informing
  why E23's bounded real-time wait is safe to run once).
- **Pre-initialization and invalid-reference error behavior.** A third throwaway
  diagnostic confirmed: `thread/start` before `initialize` returns a normal
  JSON-RPC error (`code: -32600, message: "Not initialized"`) and the process
  remains alive and usable afterward; `turn/start` referencing an unknown
  `threadId` likewise returns a normal JSON-RPC error and leaves the process
  alive. This grounds the assumption (A4) that startup/turn failures are
  ordinary recoverable JSON-RPC errors on a live process, not process crashes —
  exactly the failure mode the deterministic peer's `respondError`/`respond`
  commands are designed to simulate.
- **`node --test` executing hidden `.ts` sources, including a dynamically
  `import()`-ed sibling `.ts` module, against the real project.** Confirmed
  directly: every hidden-test file in `.hidden-test/**` is discovered and run by
  `node --test` given explicit file paths (consistent with this project's own
  `test/*.integration.test.ts` pattern), and `createCodexBackend`'s
  `import(pathToFileURL(...).href)` call reaches real ESM module resolution
  (proven by it failing with `ERR_MODULE_NOT_FOUND` naming the exact expected
  path, rather than a TypeScript- or bundler-level failure).

No ambiguity was exposed by any of the above validations.

### Harness validated mechanically

- **Formatting.** `eval-requirements.md` (public), `eval-spec.md` (this
  document), and every file under `.hidden-test/**` pass
  `prettier --config .prettierrc.json --check` (the project's own config,
  applied explicitly since files outside the project tree don't inherit it
  automatically) — run and fixed before the hashes recorded in this document's
  `Source` section were (re-)computed.
- **Type-checking.** `tsc --noEmit` against a temporary `tsconfig.json` placed
  inside the project root (required so the `types: ["node"]` entry in the
  extended base config still resolves against the project's own `node_modules`),
  extending the project's own `tsconfig.json` with `include` widened to this
  spike's private `.hidden-test/**/*.ts`, reports **zero errors**. Several real
  type errors were caught and fixed this way during construction (not
  pre-implementation noise): `ChildProcess`'s TypeScript-nullable
  `stdin`/`stdout` typing (real at compile time even though guaranteed non-null
  at runtime for this specific `stdio` configuration) required introducing
  `FakeAppServer.stdin`/`.stdout`/ `.appServerProcess` accessors that isolate
  the one known-safe narrowing to a single place, instead of scattering non-null
  assertions across every call site. The temporary tsconfig was not retained.
- **Discovery and execution.** All 12 hidden-test files (2 support + 10 case
  files, 41 total `test()` invocations covering 31 mandatory evaluation cases
  plus 10 support self-checks) are discovered and run by `node --test` when
  given explicit paths.
- **Distinguishing expected pre-implementation failures from harness defects.**
  A full run against the current (pre-implementation) codebase — which has no
  `src/codex-backend.ts` at all — was used specifically to confirm the harness
  itself executes cleanly, not to require passing behavioral results:
  - The 10 support self-checks: **10/10 pass**, fully independent of whether the
    Codex-backend implementation exists.
  - The 2 PTY-only regression cases (E28, E29): **both pass**, confirming the
    existing PTY lifecycle is genuinely unaffected by the Codex integration's
    mere presence in the codebase, using the exact same `startHost`/construction
    path as every other case in this suite.
  - Every one of the 29 remaining mandatory Codex-backed cases fails, in one of
    two clean, informative, bounded ways — never a hang, crash, or confusing
    error:
    - Cases going through `startAttachedCodexSession` (which checks the
      `POST /sessions` status before proceeding) fail **fast** (single-digit to
      double-digit milliseconds) with a precise
      `Error: startAttachedCodexSession: expected 201, got 500`, itself caused
      by a clean, informative `ERR_MODULE_NOT_FOUND` naming the exact expected
      (not-yet-created) module path, logged via the implementation's own
      existing `console.error("Failed to start session backend", ...)` path.
    - Cases that construct the host directly and then wait on a specific peer
      request that can now never arrive (because `createBackend()` rejects
      before ever invoking `spawnAppServer`) fail via a **bounded timeout** at
      the configured `--test-timeout` (8000ms in this run), exactly mirroring
      Spike 004's own documented pattern for seam-dependent pre-implementation
      cases ("a bounded timeout ... when the test's own logic depends on a
      factory invocation that never happens pre-implementation").
  - No test in either category produced an uncaught exception or unhandled
    rejection unrelated to the expected `ERR_MODULE_NOT_FOUND` chain (checked by
    scanning full run output for stray `TypeError`/`ReferenceError`/crash
    signatures — none found), and no orphaned `fake-app-server` child processes
    survived any full-suite run (checked via `pgrep` after each run, using
    `--test-force-exit` consistent with this project's own established pattern
    for bounding hidden-test runs).
  - This run was repeated after the formatting/type-fix pass above and produced
    the identical pass/fail/cancelled counts (12 pass / 21 fail / 8 "cancelled"
    — a `node --test`-internal accounting distinction between
    immediately-failing and timeout-bounded subtests, not a substantive
    difference; every individual case name and outcome was byte-identical across
    both runs), confirming the formatting pass did not silently break anything.

Distinguishing "expected pre-implementation failure" from "evaluator defect"
throughout the above: every failure traces to a concrete, named missing piece of
the not-yet-built implementation (`src/codex-backend.ts` does not exist), never
to an error inside the hidden-test code itself.

## Revision History

- v1 (frozen) — first `prepare` pass for spike 005. 24 explicit requirements (22
  automated + 2 verify-time-inspection), 10 derived invariants, 13 negative
  requirements (11 automated + 2 methodology-only), 31 evaluation cases (all
  mandatory, 41 total `test()` invocations across 10 case files plus 2 support
  files), 8 evaluator assumptions, 3 testability requirements, no blocking
  questions. Pre-freeze integrity gate passed: shared helpers independently
  self-checked (10/10, including an end-to-end check through the real
  fork/stdio/IPC transport boundary), oracle/falsifiability reviewed per case,
  five material runtime/protocol assumptions validated empirically against the
  real installed `codex-cli 0.147.0` App Server binary, and the full hidden-test
  suite executed against the pre-implementation baseline to confirm the harness
  itself runs cleanly (2 PTY-only regression cases and 10 support self-checks
  pass; all 29 Codex-backed cases fail informatively — fast rejection or bounded
  timeout — as expected before implementation, with no crashes, no unhandled
  rejections, and no orphaned processes).
