# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/007-structured-session-events`
- Current project commit when prepared: `0139517629f8abd4bd113e97d3708037137a0e35`
  (`main`-tracked branch `feat/spike-007`, working tree clean)
- Hash of `spike.md`:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Hash of `design-map.md`:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Hash of `eval-requirements.md`:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Canonical evaluator skill path: `skills/evaluator/SKILL.md`
- Evaluator skill name and contract version: `evaluator`, contract version `6`
- Evaluator skill content identity:
  `sha256:9ec48c1cae0cbc6abaa67ae166ac99b03aed459febff630c46cb6f574c5fe237`
  (last modified at commit `e7a9d51d125923e0a5d70735c549deb3c76bdd68`)
- Evaluation revision identity: `1`

## Pre-Freeze Integrity Gate

- **Shared helpers identified and independently validated:**
  - `support/envelope.ts` (`assertEnvelope`, `looksLikeEnvelope`) — validated
    by `support/envelope.selfcheck.test.ts` against one fully conforming
    hand-built sample and ten deliberately non-conforming variants (extra
    root property, extra meta property, missing meta property, wrong
    `kind`, unknown `type`, mismatched `correlationId`, non-RFC3339
    timestamp, non-UTC timestamp, non-empty `data`, malformed JSON), plus a
    positive/negative check that it distinguishes envelopes from session
    output/error frames. All 13 self-check cases passed before freeze.
  - `support/helpers.ts` (`MemoryBackend`, `createSession`, `connectEvents`,
    `connectSession`, `waitUntil`, `collectRaw`, etc.) is a close variant of
    the already-proven helpers in the public repository's own
    `test/session-backend.integration.test.ts` and
    `test/session-lifecycle.integration.test.ts` (same `MemoryBackend`
    shape, same `waitUntil` polling technique). No independent
    re-validation beyond the empirical WebSocket-broadcast probe below was
    judged necessary for this generic scaffolding.
  - `awaitOpen` (inside `helpers.ts`) was itself found defective during
    preparation: it originally awaited only the `"open"` event, which hung
    indefinitely against a rejected upgrade instead of failing. This was
    caught by the negative-control run below (against the current,
    unimplemented repository) and fixed to race `"open"` against
    `"unexpected-response"`, `"error"`, and a bounded timeout before this
    evaluation froze.

- **Oracle validity / falsifiability, per mandatory case:** every mandatory
  case (E1–E12; see Evaluation Cases) was run twice before freeze — once as
  a **positive control** against a small throwaway reference server built
  only for this validation (never committed, discarded after use) that
  implements the frozen envelope/endpoint contract, and once as a
  **negative control** against the current, unimplemented public
  repository. Result: all 17 mandatory-case test bodies passed against the
  compliant reference and failed against the unimplemented repository, in
  every case for the same, correctly diagnosed reason — the WebSocket
  upgrade to `/events/ws` is rejected with HTTP 404 (the endpoint does not
  yet exist) — never a hang, timeout ambiguity, or unrelated crash. This
  confirms each assertion is achievable by a correct implementation and
  fails for the intended reason against an incorrect (here, absent) one.
  `no-conduit-dependency.test.ts` (E12) is a static repository check
  independent of the endpoint; it was separately positive/negative
  controlled by temporarily adding a `@conduit-events/sdk` dependency to a
  backed-up copy of `package.json`, confirming the assertion fails for the
  intended reason, then restoring the original file (confirmed via
  `git status --porcelain`).

- **Material runtime/OS/library/protocol assumptions validated:** the one
  genuinely new mechanism this spike introduces — broadcasting one
  serialized message to every currently-connected WebSocket client, with no
  replay for a client that connects later — was validated empirically
  against the `ws` library directly (independent of any Harness code)
  before any hidden test was written: a client connected before two
  broadcasts received both, in order; a client that connected only after
  those two broadcasts received none of them but did receive a third,
  later broadcast. This is the same broadcast primitive the frozen Design
  Map assumes implementation will use, and the same technique the hidden
  fan-out/no-replay cases (E9, E10) exercise through the real HTTP/WebSocket
  surface.

- **Harness itself parses, compiles, and executes:** confirmed via the
  existing public suite (`npm test`) passing on the frozen commit before
  this evaluation was prepared, and via the reference-implementation smoke
  run above successfully driving real `POST /sessions`,
  `GET /sessions/:id`, `DELETE /sessions/:id`, `/sessions/:id/ws`, and a
  bolted-on `/events/ws` end to end.

All checks above completed successfully before Status was set to Frozen.

## Explicit Requirements

- **R1** — Harness exposes a dedicated host-level WebSocket upgrade at
  `/events/ws`, independent of any particular session.
  Source: brief "Structured event channel"; Design Map "Shared contracts."
- **R2** — A successfully established Harness session (backend startup
  succeeds sufficiently that `POST /sessions` returns `201` with a public
  session id) emits exactly one `session.started` to connected event
  clients. Source: brief "`session.started`"; acceptance criterion 5.
- **R3** — A failed session startup emits no `session.started` for that
  attempt. Source: brief "Startup failure"; acceptance criterion 6.
- **R4** — Explicit session deletion of a successfully started session
  emits exactly one `session.ended` once Harness permanently removes the
  session identity. Source: brief "`session.ended`"; acceptance criteria
  7–8.
- **R5** — Natural backend/process termination that causes Harness to
  remove the session also emits exactly one `session.ended`. Source: brief
  "`session.ended`"; acceptance criterion 8.
- **R6** — A backend cleanup/finalization error does not suppress
  `session.ended` when the public session identity is nevertheless
  permanently removed. Source: brief "Backend finalization failure";
  Design Map "Design decisions"; acceptance criterion 9.
- **R7** — For a given session, `session.started` is observed by a given
  connected client strictly before `session.ended`. Source: brief
  "Ordering"; acceptance criterion 10.
- **R8** — `meta.streamId` equals the Harness public session id. Source:
  brief "Identity," "Session stream identity"; Design Map "Invariants";
  acceptance criterion 11.
- **R9** — The event envelope conforms exactly to the closed shape
  recorded in the Design Map (`meta.id`, `meta.kind`, `meta.type`,
  `meta.version`, `meta.streamId`, `meta.correlationId`, `meta.timestamp`,
  `meta.source`; `data`; no other root or meta properties; no
  `causationId`/`extensions`). Source: Design Map "Shared contracts,"
  "Invariants"; acceptance criterion 3.
- **R10** — Equivalent PTY-backed and Codex-backed lifecycle transitions
  produce an equivalent public event sequence/shape. Source: brief
  "Harness event semantics," "Backend neutrality"; acceptance criterion 12.
- **R11** — A client connected before an event is emitted receives it.
  Source: brief "Connection," "Delivery"; acceptance criterion 13.
- **R12** — Multiple simultaneously connected clients each receive the same
  emitted event. Source: brief "Delivery"; Design Map "Invariants";
  acceptance criterion 14.
- **R13** — A client connecting after an event has already occurred does
  not receive that historical event. Source: brief "Live-only semantics";
  acceptance criterion 15.
- **R14** — Structured events and session text/output are never mixed on
  each other's channel. Source: brief "Existing session WebSocket";
  acceptance criteria 2, 17.
- **R15** — Connecting or disconnecting the event WebSocket does not itself
  change session lifecycle or session usability. Source: brief
  "Disconnection"; acceptance criterion 16.
- **R16** — Existing session creation, attachment, text/output, deletion,
  cleanup, and backend behaviour required by previous spikes continues to
  work. Source: brief "Existing behavior"; acceptance criterion 18.
  Coverage: the public repository's own existing regression suite
  (`test/*.test.ts` via `npm test`), not a new hidden test.
- **R17** — No Conduit runtime, SDK, broker, transport, or cross-language
  dependency is introduced. Source: brief "No Conduit runtime dependency";
  acceptance criterion 4.
- **R18** — Provider-native identities/payloads (Codex thread/turn ids, PTY
  process ids) do not appear as the event's `streamId`, `type`, or `data`.
  Source: brief "Identity," "Harness event semantics"; acceptance
  criterion 19.

## Derived Invariants

- **I1** — Each event type is published at most once per session (R2, R3,
  R5, R6).
- **I2** — `session.started` precedes `session.ended` for the same session
  observer; `session.ended` never precedes `session.started` (R7).
- **I3** — `meta.streamId` is stable and equal to the Harness session id
  across both of that session's events, and distinct across sessions (R8).
- **I4** — The envelope root and `meta` object are closed: exactly the
  documented keys, no more, no fewer (R9).
- **I5** — All observers connected at publication time receive
  content-identical envelopes for the same lifecycle fact (R12).
- **I6** — Connection time gates event visibility: only events emitted
  after a successful connection are ever delivered to that client (R13).

## Negative Requirements

- **N1** — No `session.attached` or `session.detached` event type is ever
  published. Source: brief "Client attachment is separate from session
  lifecycle."
- **N2** — `data` carries no additional properties beyond the empty object
  for `session.started`/`session.ended`. Source: brief "Event
  representation"; Design Map "Shared contracts."
- **N3** — No replay, snapshot, or historical delivery occurs on
  connection (covered by R13/I6, restated here as a negative requirement
  per the brief's "This spike does not provide" list).
- **N4** — Event-WebSocket disconnection does not stop any session, does
  not change session lifecycle, and does not require Harness to persist
  missed events. Source: brief "Disconnection."
- **N5** — A failed startup attempt does not leak a session id nor emit
  `session.started` merely because an internal backend/process was
  temporarily created. Source: brief "Startup failure."

## Evaluation Cases

- **E1** — Purpose: a successful PTY-backed session start emits exactly
  one conforming `session.started`. Verifies: R1, R2, R8, R9; I3.
  Preconditions: event client connected before session creation.
  Action: `POST /sessions` with the default (PTY) backend. Expected
  observable outcome: exactly one envelope arrives, `meta.type ===
  "session.started"`, `meta.streamId` equals the returned session id, and
  the envelope parses under the frozen shape. Mandatory. Assumptions: A1,
  A2.

- **E2** — Purpose: explicit deletion emits exactly one `session.ended`
  strictly after `session.started`. Verifies: R4, R7; I1, I2.
  Preconditions: as E1, session already started. Action:
  `DELETE /sessions/:id`. Expected observable outcome: `DELETE` returns
  `204`; exactly one further envelope arrives with
  `meta.type === "session.ended"` and the same `streamId`; the two events'
  ids differ. Mandatory. Assumptions: A1.

- **E3** — Purpose: an equivalent Codex-backed lifecycle produces the same
  public event sequence/shape as PTY, with its own distinct `streamId`.
  Verifies: R2, R8, R9, R10, R18; I3. Preconditions: Codex backend driven
  by the repository's existing `fixtures/fake-app-server.mjs` success mode.
  Action: create and delete a Codex-backed session; compare against a
  PTY-backed run of the same scenario. Expected observable outcome:
  identical `meta.type` sequence (`["session.started",
  "session.ended"]`) for both backends; identical constant `meta` fields
  (`kind`, `version`, `source`); empty `data`; distinct `streamId` values
  per session. Mandatory. Assumptions: A1, A2.

- **E4** — Purpose: a failed startup emits no `session.started`, and the
  channel remains live. Verifies: R3, R10; N5. Preconditions: event client
  connected; a backend factory that fails for PTY-style (a rejecting
  construction promise) and for Codex (`fail-thread` fixture mode).
  Action: attempt session creation via each failing factory. Expected
  observable outcome: `POST /sessions` does not return `201`; no envelope
  is observed after a bounded wait; a subsequent successful session on the
  same connection still produces its `session.started`, proving the
  channel was never broken. Mandatory. Assumptions: A1, A2, A3.

- **E5** — Purpose: natural backend/process termination emits exactly one
  `session.ended`, for both backends. Verifies: R5, R10; I1.
  Preconditions: session started and attached. Action: PTY — send shell
  `exit`; Codex — send the fixture's `exit-backend` input. Expected
  observable outcome: the session socket closes, the session identity
  becomes `404`, and exactly one further envelope with
  `meta.type === "session.ended"` and the correct `streamId` arrives.
  Mandatory. Assumptions: A1, A2.

- **E6** — Purpose: a race between backend-initiated exit and a
  close-together explicit deletion still yields exactly one
  `session.ended` (no duplicate). Verifies: R5; I1. Preconditions:
  in-memory backend double. Action: trigger `backend.exit()` and issue
  `DELETE /sessions/:id` concurrently, mirroring the public repository's
  own proven "coalesces backend exit and a close-together delete"
  scenario. Expected observable outcome: exactly one `session.ended`
  envelope is observed regardless of DELETE's resulting status; the
  backend's `stop()` is called exactly once. Mandatory. Assumptions: A1,
  A2.

- **E7** — Purpose: a backend finalization/cleanup error does not suppress
  `session.ended` once the identity is permanently removed. Verifies: R6;
  I1. Preconditions: (a) an in-memory backend whose `stop()` rejects; (b)
  the Codex backend wired to a process double that never exits on its own
  (mirroring the public repository's own "returns 500 when forced App
  Server teardown cannot finalize" scenario). Action: `DELETE
  /sessions/:id`. Expected observable outcome: DELETE does not return
  `204` (reports the finalization error), the session identity becomes
  `404`, and exactly one `session.ended` envelope with the correct
  `streamId` is still observed. Mandatory. Assumptions: A1, A2.

- **E8** — Purpose: real, live-emitted envelopes conform exactly to the
  frozen closed shape. Verifies: R9, R18; I4; N2. Preconditions: a
  completed start→end lifecycle. Action: parse both real envelopes with
  the validated `assertEnvelope` oracle. Expected observable outcome: root
  keys are exactly `{meta, data}`; meta keys are exactly the eight
  documented keys; `kind`/`version`/`source` hold their constant values;
  `correlationId === id`; `timestamp` matches a UTC RFC 3339 pattern;
  `data` is `{}`; the two events' ids differ. Mandatory. Assumptions: A4.

- **E9** — Purpose: multiple simultaneously connected clients receive
  identical emitted envelopes. Verifies: R11, R12; I5. Preconditions: two
  event clients connected before session creation. Action: create and
  delete a session. Expected observable outcome: both clients' first
  received frame are byte-identical, and both clients' second received
  frame are byte-identical. Mandatory. Assumptions: A1, A2.

- **E10** — Purpose: a late-joining client receives no historical replay
  but does receive subsequent live events. Verifies: R13; I6.
  Preconditions: one client connected before `session.started`; a second
  client connects only after `session.started` was already observed by the
  first, and before `session.ended`. Action: delete the session. Expected
  observable outcome: the late client receives exactly one envelope
  (`session.ended`) and never receives `session.started`; the early client
  receives both, in order. Mandatory. Assumptions: A3.

- **E11** — Purpose: channel separation and lifecycle independence from
  the event channel. Verifies: R14, R15; N1, N4. Preconditions: a session
  with both an attached session socket and a connected event socket.
  Action / expected observable outcome, three sub-scenarios: (a) session
  echo output never parses as a structured envelope on the session socket,
  and no `{type: "output"|"error"}` frame ever appears on the event
  socket; (b) connecting and disconnecting an event client before session
  deletion does not change the session's `200`/usable status, and the
  session still deletes normally afterward; (c) detaching and reattaching
  the session socket, then deleting the session, produces exactly the
  event-type sequence `["session.started", "session.ended"]` on the event
  socket — no `session.attached`/`session.detached` or any other type.
  Mandatory. Assumptions: none beyond A1.

- **E12** — Purpose: no Conduit runtime/SDK or broker dependency is
  declared. Verifies: R17. Preconditions: none. Action: read the public
  `package.json`. Expected observable outcome: no declared dependency name
  matches Conduit or a known broker package. Mandatory. Assumptions: none.

## Coverage Matrix

| Identifier | Case(s)     | Executable? | Hidden test file(s)                        |
| ---------- | ----------- | ----------- | ------------------------------------------- |
| R1         | E1          | Yes         | `lifecycle-core.test.ts`                    |
| R2         | E1, E3      | Yes         | `lifecycle-core.test.ts`                    |
| R3         | E4          | Yes         | `startup-failure.test.ts`                   |
| R4         | E2          | Yes         | `lifecycle-core.test.ts`                    |
| R5         | E5, E6      | Yes         | `natural-exit-and-races.test.ts`            |
| R6         | E7          | Yes         | `finalization-failure.test.ts`              |
| R7         | E2          | Yes         | `lifecycle-core.test.ts`                    |
| R8         | E1, E3      | Yes         | `lifecycle-core.test.ts`                    |
| R9         | E1, E8      | Yes         | `lifecycle-core.test.ts`, `envelope-shape.test.ts` |
| R10        | E3, E4, E5  | Yes         | `lifecycle-core.test.ts`, `startup-failure.test.ts`, `natural-exit-and-races.test.ts` |
| R11        | E9          | Yes         | `fanout-and-replay.test.ts`                 |
| R12        | E9          | Yes         | `fanout-and-replay.test.ts`                 |
| R13        | E10         | Yes         | `fanout-and-replay.test.ts`                 |
| R14        | E11         | Yes         | `channel-and-lifecycle-isolation.test.ts`   |
| R15        | E11         | Yes         | `channel-and-lifecycle-isolation.test.ts`   |
| R16        | —           | Yes (manual invocation of existing suite) | public `test/*.test.ts` via `npm test` (not a hidden test) |
| R17        | E12         | Yes         | `no-conduit-dependency.test.ts`             |
| R18        | E3, E8      | Yes         | `lifecycle-core.test.ts`, `envelope-shape.test.ts` |
| I1         | E2, E5, E6, E7 | Yes      | `lifecycle-core.test.ts`, `natural-exit-and-races.test.ts`, `finalization-failure.test.ts` |
| I2         | E2          | Yes         | `lifecycle-core.test.ts`                    |
| I3         | E1, E3      | Yes         | `lifecycle-core.test.ts`                    |
| I4         | E8          | Yes         | `envelope-shape.test.ts`                    |
| I5         | E9          | Yes         | `fanout-and-replay.test.ts`                 |
| I6         | E10         | Yes         | `fanout-and-replay.test.ts`                 |
| N1         | E11         | Yes         | `channel-and-lifecycle-isolation.test.ts`   |
| N2         | E8          | Yes         | `envelope-shape.test.ts`                    |
| N3         | E10         | Yes         | `fanout-and-replay.test.ts`                 |
| N4         | E11         | Yes         | `channel-and-lifecycle-isolation.test.ts`   |
| N5         | E4          | Yes         | `startup-failure.test.ts`                   |

This mapping agrees with `.hidden-test/manifest.json`.

## Out of Scope

- Event persistence, historical replay, state snapshots, offsets/cursors,
  or acknowledgement semantics (brief non-goals).
- `session.attached`/`session.detached` events beyond confirming their
  absence (N1).
- Structured session-end reason/status metadata (brief explicitly excludes
  this from `session.ended`'s payload for this spike).
- Attention/approval/question semantics, tool-call normalization, or any
  general-purpose event bus.
- Internal architecture choices (in-memory connection collection,
  serialization helper, id generator, clock access, internal event-type
  representation, module layout) — Design Map "Implementation freedom."
- Client-to-server messages sent to `/events/ws` — Design Map explicitly
  places this outside evaluation.
- Multi-session or multi-host behaviour beyond the existing single active
  session slot already established by prior spikes.

## Limitations

- E4's assertion that no `session.started` was emitted relies on a bounded
  wait (A3) rather than a proof of absence; the paired "channel remains
  live" check mitigates but does not eliminate the residual risk of an
  event arriving just past the bound.
- E9's "identical envelope" check compares serialized frame content
  received by independent WebSocket clients; it is strong evidence of a
  single shared publication rather than independently generated
  equivalents, but does not inspect server-internal object identity.
- Real PTY- and Codex-backed cases (E1, E3, E5, E7, E11) spawn real
  processes (bash, and the Node-based fake App Server fixture); as with the
  existing public integration suite, these are subject to ordinary
  process-scheduling timing variance, bounded by generous `waitUntil`
  polling rather than fixed sleeps.
- R16 (existing behaviour) is covered by the public repository's own
  regression suite rather than a new hidden test; verification records its
  pass/fail as a required regression alongside the mandatory hidden cases.

## Revision History

- Revision 1 (this document): initial frozen evaluation, prepared before
  Spike 007 implementation began. No prior revision exists.
