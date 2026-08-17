# Spike 007 Outcome — Structured Session Events

## Result and exact provenance

**PASS.** Evaluator revision 1 passed all 12 mandatory cases (17 test bodies)
against the clean implementation commit
`20f88674409e9e2a2f3fca83869206c8b2b67943`. The exact result and evaluator
suite are promoted in commit `d2cee91fcb39c6ef2a2f6cd4c078d5dbe75f6587`.
As-Built completed in `af87157e9b5c327bd008c5912f254fd552bac90f`.

- Brief identity:
  `sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
- Design Map identity:
  `sha256:f77725941c6e5b6c0658d4bee7406afa19a2f53bfb915c394e9efcdbbb10d421`
- Evaluation requirements identity:
  `sha256:160c87200ca3c534a31b9bc1d10d0f476088b3f99d2a8cd5b9ebb6c9b6b90a58`
- Evaluation result identity:
  `sha256:d1ce11b3b11ff95fbe17287a045fc114d2eb68ff789a31c3c7d2dea19ef6894e`
- As-Built identity:
  `sha256:412a67f8c4bdbc2fb7d08d0c43f9bf4e67bf424e67c8c277b9efa1f9d5a8a65d`
- Branch: `feat/spike-007`

## What Was Established

Harness can expose backend-neutral lifecycle facts through a dedicated
host-level structured event stream without changing the existing session text
and interaction channel. `session.started` and `session.ended` use Harness
session identity, are emitted in lifecycle order at most once, and behave the
same for PTY and Codex-backed sessions.

The lifecycle boundary survived the important failure and concurrency cases.
Failed startup emits no start event. Explicit deletion, natural backend exit,
and host shutdown permanently end the public session and emit one end event.
Racing end triggers coalesce, and backend finalization failure does not erase
the Harness-level fact that the session ended. Event-client attachment remains
independent of session and backend lifecycle.

The stream is deliberately live-only. Connected observers receive the same
event serialized for the transition; disconnected or late observers receive no
history or snapshot. This proves the domain and transport boundary, not replay,
persistence, recovery, attention state, or detached-client resynchronization.

## Implementation Summary

`GET /events/ws` owns an in-memory set of event observers alongside, but
separate from, `/sessions/:id/ws`. The host session coordinator constructs a
closed Conduit-aligned `meta`/`data` envelope for each lifecycle transition,
serializes it once, and broadcasts it to sockets open at that moment.

The envelope contains a fresh event UUID, lifecycle type, schema version,
Harness session identity as `streamId`, correlation identity, UTC timestamp,
and `source: "harness"`; `data` is empty. The implementation copied the minimal
shape from the pinned Conduit contract but introduced no Conduit package,
runtime validation, provider schema, event bus, broker, or persistence layer.

Backends remain unaware of the public event contract. Existing host-owned
startup publication and coalesced removal paths provide ordering and
deduplication, preserving the existing backend API and session WebSocket
semantics.

## Evaluation Evidence

The sole verification attempt passed 12/12 mandatory cases and 17/17 underlying
test bodies on its first run. The complete hidden suite was then run twice more
for timing confidence, producing 17/17 passes each time with no flakes or
skips. The public regression suite passed 25/25 on the evaluated commit.

Coverage included real PTY and Codex process paths, exact envelope shape,
fan-out, no replay, failed startup suppression, explicit and natural ending,
end races, finalization failure, host shutdown, channel isolation, backend
neutrality, and absence of a Conduit dependency. No evaluator defect,
specification ambiguity, infrastructure failure, or non-mandatory finding was
reported.

Promotion preserved the exact frozen evaluator revision and attempt result.
The promoted attempt ledger alone changed its `resultPath` from the private to
the public location. That was disclosed contemporaneously but means the ledger
was not byte-identical to its private source under the stronger evaluator v7
rules adopted afterward. The suite, freeze metadata, hidden tests, and result
that support the PASS were not changed.

## Material History

The first Brief Readiness pass blocked freeze with two blockers and one material
clarification. The revised brief passed on the second review. Design Map then
fixed the minimal envelope and lifecycle ownership, and evaluator preparation
froze 12 mandatory cases after positive and negative controls. One evaluator
connection-helper hang was found and corrected before freeze.

Implementation passed visible checks and independent evaluation without an
implementation retry or evaluator revision. Promotion and As-Built followed.
Post-verification review then exposed a workflow provenance weakness in the
promotion procedure: rewriting the ledger path blurred the boundary between
copied historical evidence and new public bookkeeping. Evaluator v7 corrected
that lifecycle for future spikes. This methodology correction did not change
Spike 007 runtime behavior or its evaluation result.

## Decisions

- Structured lifecycle facts belong to Harness and are projected by the host,
  not leaked from provider-native event schemas.
- Structured events use a dedicated host-level channel; raw backend interaction
  and output remain on the session-specific WebSocket.
- The minimal Conduit-aligned envelope is adopted as copied protocol structure,
  without adding Conduit as a dependency or committing Harness to its broader
  semantics.
- Start publication follows successful public session installation; end
  publication follows permanent removal of that identity, even when backend
  cleanup reports failure.
- Event observers do not own session lifecycle, and the event channel does not
  participate in the existing singleton client attachment rule.
- Replay, persistence, offsets, acknowledgements, snapshots, reasons, and
  richer payloads remain excluded until a concrete product requirement defines
  them.

## Discoveries

The existing session coordinator already contained the useful lifecycle seam.
Placing publication at installation and removal preserved exactly-once behavior
without inventing another state machine—an unusually successful encounter with
not adding architecture.

Backend neutrality was achievable without widening `SessionBackend`: both PTY
and Codex already report lifecycle into common host transitions. The structured
event boundary therefore required host projection, not a universal provider
event framework.

Live fan-out is enough to prove separation of domain protocol from transport,
but it is intentionally poor as a supervisory history. A detached supervisor
can miss both start and end facts and has no recovery mechanism. That is a
known product gap, not a defect in this frozen spike.

The revised workflow successfully caught contract ambiguity before freeze and
distinguished evaluator preparation from implementation. It also revealed that
promotion provenance needed stricter semantics. End-to-end dogfooding worked,
but the paperwork dragon still found one loose scale.

## Deferred Concerns

- Replay, snapshots, persistence, cursors, and detached-client
  resynchronization.
- Multiple concurrent Harness sessions; the event endpoint is host-scoped, but
  the current active-session model remains singleton.
- Structured attention, approval, question, progress, failure, completion, and
  provider activity events.
- Lifecycle reason/status and cleanup-result metadata beyond an empty payload.
- Authentication and authorization for a remote control surface; this spike
  remains within the existing localhost-oriented development posture.
- Long-term evolution and compatibility rules for the copied Conduit-aligned
  envelope.
- A future promotion format that cleanly separates byte-exact historical
  artifacts from public relocation metadata, as evaluator v7 now requires.

## Skill Versions and Workflow Cost

Material runs used Brief Readiness v3, Design Map v2, evaluator v6 for prepare,
verify, and promotion, implementation v3, As-Built v2, and Outcome v3. The
post-verification promotion-contract correction used the system
`skill-creator` and produced evaluator v7. All manifest entries were recorded
contemporaneously; none is marked retrospective.

Reliably recorded workflow scale includes two readiness passes, one Design Map,
one evaluator revision, one implementation attempt, one verification attempt,
12 mandatory cases comprising 17 test bodies, three clean mandatory-suite runs,
and a 25-test public regression run. Token, context, duration, and agent-turn
totals were unavailable and are not estimated.

## Next Step

Define the smallest recovery contract for a supervisor that connects late or
reconnects after interruption. A current-state snapshot plus an ordered replay
boundary is the likely next experiment; persistence technology should remain an
implementation choice until that externally observable contract is settled.
