# Design Map — Spike 007 Structured Session Events

## Shared contracts

The frozen brief is `spikes/007-structured-session-events/spike.md` with content
identity
`sha256:39f0282af77befbe503cdbffb432ca108d30b1b6c05a3f37cba82fcb6635efe2`
and committed provenance at `b1a2ecc`.

The Conduit protocol reference is pinned to Git revision
`29ef1c88f8d2c805319f671c901872fb82036356`. The binding protocol artifact is
`schemas/conduit-message.schema.json` at that revision, schema identifier
`urn:conduit:schema:message:1.0.0`. Its minimal-event fixture and root-message
derivation rules clarify the schema where needed.

Every Spike 007 lifecycle event has this public JSON shape:

```json
{
  "meta": {
    "id": "<unique opaque non-empty event ID>",
    "kind": "event",
    "type": "session.started | session.ended",
    "version": "1.0.0",
    "streamId": "<Harness session ID>",
    "correlationId": "<same value as meta.id>",
    "timestamp": "<UTC RFC 3339 date-time>",
    "source": "harness"
  },
  "data": {}
}
```

The envelope root and `meta` are closed: no other properties are present.
`causationId` and `extensions` are omitted. These are root Harness lifecycle
facts, not children of one another; chronological succession does not make
`session.started` the cause of `session.ended`.

`GET /events/ws` is the host-level WebSocket upgrade surface. Successful
connections receive complete JSON envelopes as individual text messages. It is
independent of `/sessions/:id/ws`; neither endpoint tunnels the other's message
types.

The existing exported `startHarnessHost` surface and
`HarnessHostOptions.createBackend` injection seam are sufficient for independent
evaluation. Evaluation can connect real WebSocket clients and drive successful
startup, failed startup, explicit deletion, natural backend exit, finalization
failure, detachment, and host shutdown without a new public event-publisher API.

## Design decisions

Harness session coordination owns event creation and publication. Backends
continue to report lifecycle through the existing `SessionBackend` contract;
they do not construct public envelopes or acquire knowledge of the event
transport. This keeps PTY and Codex lifecycle projection identical above the
backend boundary.

The host owns a collection of event-stream connections distinct from the
single optional session attachment. Publishing fans one serialized envelope out
to every event connection that is open at publication time. Event-stream
connection loss removes only that observer and has no backend or session side
effect.

Event creation is part of the guarded Harness lifecycle transition:

- `session.started` is created once when startup becomes a published active
  Harness session, never for a failed or discarded startup attempt.
- `session.ended` is created once when that published identity is permanently
  removed, regardless of whether backend finalization resolved or rejected.
- All ending triggers share the existing coalesced ending ownership so races
  between deletion, backend exit, and host shutdown cannot create duplicates.

No stronger ordering between the HTTP response, a concurrent existence query,
and event delivery is added beyond the frozen brief. Host shutdown must still
publish the end fact for a started session before dismantling the event channel.

## Invariants

- Each event ID is unique within a host lifetime and is unrelated to provider
  identifiers.
- `meta.streamId` equals the public Harness session ID exactly.
- `meta.kind`, `meta.version`, and `meta.source` are respectively `event`,
  `1.0.0`, and `harness` for both lifecycle types.
- `meta.correlationId` equals `meta.id`; `causationId` is absent.
- A connected observer sees at most one start and one end event for a session,
  in that order, and all observers receive the same envelope instance for a
  given lifecycle fact rather than independently generated equivalents.
- Detach, reattach, input, output, turn completion, and recoverable backend
  errors do not create lifecycle events.
- Events emitted without an observer are discarded. Connection and reconnection
  never synthesize events or state.
- Event publication does not alter the established HTTP status, session
  attachment, backend finalization, or text/output behavior.
- No provider-native payload or identity appears in either lifecycle envelope.
- No Conduit package, runtime, transport, broker, persistence, validation
  framework, or copied future-event machinery is required.

## Implementation freedom

Implementation may choose its in-memory connection collection, serialization
helper, ID generator, clock access, and internal event type representation. It
may add private helpers or modules where they earn their keep; no class hierarchy,
event bus, dependency, or prescribed file layout is part of this contract.

The host may ignore or close on client-to-server messages sent to `/events/ws`.
That behavior is outside Spike 007 evaluation because the channel is specified
only as an observation surface.

No standalone schema-validation API is required. Conformance may be established
from observable envelopes, and implementation may enforce the small closed
shape through TypeScript construction rather than a runtime JSON Schema
dependency.
