# Spike 007 — Structured Session Events

## Goal

Introduce the smallest useful Harness-level structured event model for session lifecycle activity.

Harness currently exposes session lifecycle through its HTTP/WebSocket control surface and projects backend output to attached session clients. The next product direction requires Harness to represent meaningful activity as structured events rather than treating all observable agent activity as undifferentiated text.

This spike establishes that boundary with a deliberately small lifecycle slice.

It must not attempt to build the complete event, attention, approval, replay, persistence, or resynchronization model.

---

## Primary question

> Can Harness expose a small set of backend-neutral structured session lifecycle events over a dedicated host-level event stream while preserving existing session and text-stream behavior?

A successful spike should establish a structural foundation that later work can extend toward attention-worthy agent activity, approvals, questions, failures, completion, replay, and detached-client resynchronization.

---

# Scope

Introduce:

- a Harness-level structured event representation;
- a dedicated host-level WebSocket for structured Harness events;
- a `session.started` event;
- a `session.ended` event; and
- backend-neutral lifecycle projection across the existing PTY and Codex backends.

Structured Harness events are separate from existing session-specific text and interaction traffic.

The existing session WebSocket remains responsible for session interaction and backend output.

The new host-level event WebSocket is responsible for structured Harness events.

---

# Structured event channel

Harness must expose a dedicated host-level WebSocket endpoint for structured events.

The intended endpoint is:

```text
/events/ws
```

Equivalent naming may be used only if required by an existing repository convention discovered during Design Map work.

This endpoint is not scoped to a particular session.

A connected event client may therefore observe structured events concerning any Harness session that produces events while that client is connected.

## Live-only semantics

For Spike 007, the event stream is live-only.

A client connected to the event WebSocket receives structured events emitted after its connection is successfully established.

This spike does not provide:

- historical event replay;
- current-state snapshots;
- replay on connection;
- recovery of events emitted before connection;
- event persistence;
- offsets or cursors;
- acknowledgement semantics; or
- detached-client resynchronization.

A client connecting after a `session.started` event has already occurred does not receive that historical event.

That behavior is intentional for this spike.

Replay and resynchronization are deferred product concerns.

---

# Existing session WebSocket

The existing session-specific WebSocket remains responsible for:

- client interaction with the session;
- backend/session input;
- existing raw or projected backend output; and
- existing session-connection lifecycle behavior.

Structured Harness events introduced by this spike must not be mixed into the existing raw text/output stream.

The introduction of `/events/ws` must not change the existing session WebSocket's public semantics except where required to preserve compatibility with the new independent event channel.

Future structured Harness events should use the structured event boundary rather than being encoded as raw text.

---

# Harness event semantics

Harness structured events represent Harness-level domain facts.

They must not simply expose:

- Codex App Server messages;
- PTY implementation details;
- process-specific events; or
- another backend's native event schema

as the Harness public event contract.

Provider/backend-specific behavior may determine when Harness emits an event, but the public event itself represents a Harness concept.

The event model is owned by Harness rather than by an individual backend.

Equivalent lifecycle behavior across the PTY and Codex backends must therefore produce equivalent public Harness events.

---

# `session.started`

`session.started` represents the successful creation of an active Harness session.

It must be emitted exactly once for each successfully started Harness session.

The event occurs only after backend startup has succeeded sufficiently for Harness to consider the session successfully created and available under its public session identity.

## Startup failure

If session startup fails and the session is not successfully established:

- no `session.started` event is emitted for that attempted session;
- the failed attempt must not appear as a successfully started Harness session merely because an internal backend or process was temporarily created.

The existing public startup failure behavior remains authoritative for HTTP/session creation semantics.

## Identity

`session.started` refers to the Harness session identity.

Provider-specific identities such as:

- Codex thread IDs;
- turn IDs;
- PTY/process IDs; or
- provider connection identifiers

must not substitute for the Harness session identity in the public lifecycle event.

---

# `session.ended`

`session.ended` represents the permanent end of a Harness session identity.

It must be emitted exactly once for each successfully started session when Harness permanently removes that session from its active session set.

This includes at least:

- explicit session deletion through the existing public session lifecycle; and
- natural backend/process termination that causes Harness to remove the session.

## Backend finalization failure

The Harness-level session lifecycle is distinct from the success of every underlying cleanup operation.

If Harness permanently removes the public session identity but an underlying backend stop/finalization operation reports an error, the Harness session is still considered ended for the purpose of this event.

The `session.ended` event therefore reflects the Harness session lifecycle, not a guarantee that every provider or process cleanup operation succeeded without error.

This spike does not add structured reason, status, or cleanup-result metadata to `session.ended`.

Such distinctions may be introduced by later event types or payload revisions when required by product behavior.

## Ordering

For every successfully started session:

```text
session.started
→
session.ended
```

`session.ended` must never precede `session.started` for the same Harness session.

Each occurs at most once for that session.

---

# Client attachment is separate from session lifecycle

Session lifecycle and client attachment lifecycle are distinct concepts.

A Harness session may exist without a client currently attached to its session-specific WebSocket.

Clients may also detach and later reattach while the same Harness session continues to exist.

Therefore:

- `session.started` does not mean a client attached;
- `session.ended` does not mean a client detached; and
- this spike does not introduce `session.attached` or `session.detached` events.

Client-presence events may be introduced later if they become meaningful product-level facts.

---

# Conduit Events protocol alignment

Harness structured events introduced by this spike must adopt the envelope structure and relevant field semantics of the Conduit Events protocol as the architectural basis for Harness structured events.

The canonical external reference is:

`https://github.com/Conduit-Events/conduit-protocol`

Conduit is an architectural protocol reference for this spike.

It is not a runtime dependency.

## Pinned protocol reference

The Design Map must inspect the Conduit protocol and record the exact Git revision used as the reference for Spike 007.

The frozen Design Map must identify:

- the Conduit protocol revision inspected;
- the relevant envelope conventions adopted by Harness; and
- any material divergence deliberately chosen for Harness.

The moving head of the external Conduit repository does not automatically change the frozen Harness Spike 007 contract.

Only decisions captured in the frozen Harness brief and Design Map are binding on implementation and evaluation.

## Envelope adoption

Harness events should use the Conduit envelope shape rather than inventing a separate Harness-specific event envelope.

Relevant Conduit envelope concepts include:

- message/event identity;
- message kind;
- semantic event type;
- protocol version;
- stream identity;
- correlation identity;
- causation identity where applicable;
- timestamp;
- logical source;
- event payload data; and
- extensions where appropriate.

Spike 007 should implement only the parts of the envelope required by the pinned Conduit protocol and this spike's event types.

Do not add speculative Harness-specific metadata merely because future events might need it.

## Session stream identity

For lifecycle events introduced by this spike, the Conduit stream identity should represent the Harness session.

The Harness session ID therefore provides the natural stream identity for:

- `session.started`; and
- `session.ended`.

The exact mapping must be recorded in the Design Map.

## Source

The public event source must describe the Harness-level producer rather than exposing provider-native identities as though they were independent event protocols.

The exact source convention should follow the pinned Conduit reference and be recorded in the Design Map.

## Correlation and causation

Where the pinned Conduit protocol requires a correlation identity for a root message, follow its defined root-message semantics.

Spike 007 does not require meaningful cross-event causation chains beyond what the Conduit envelope itself requires.

Do not invent future approval/tool/turn correlation behavior in this spike.

---

# No Conduit runtime dependency

Spike 007 does not introduce:

- a dependency on a Conduit SDK/package;
- RabbitMQ or another broker;
- Conduit transport adapters;
- cross-language event transport;
- cross-process messaging infrastructure; or
- runtime calls into another Conduit repository.

The required envelope model should be represented locally within Harness.

This preserves protocol alignment without coupling Harness runtime behavior to the external Conduit project.

Later work may reconsider direct schema/package reuse if that produces a concrete benefit.

---

# Event representation

The structured representation should remain deliberately small.

Payloads for `session.started` and `session.ended` do not need additional speculative business data merely to justify the envelope.

Where the Conduit envelope allows an empty event payload and no additional event-specific information is required by this brief, an empty payload is acceptable.

The event representation must remain serializable as JSON over the event WebSocket.

A client must be able to determine from the structured message itself:

- that it is a structured event;
- its semantic event type;
- the Harness session/stream to which it belongs;
- its event identity;
- its timestamp; and
- other metadata required by the adopted Conduit envelope.

---

# Event WebSocket behavior

The dedicated event WebSocket must expose serialized Harness structured events.

## Connection

A client may connect to the event WebSocket independently of creating or attaching to a particular Harness session.

Connecting does not itself produce a historical lifecycle event.

## Delivery

Every connected event client should receive each Harness structured event emitted while that client remains successfully connected.

If multiple event clients are connected, each should receive the same emitted lifecycle event.

This spike does not define acknowledgement or consumer-group semantics.

The event WebSocket is a live broadcast observation channel.

## Disconnection

Disconnecting from the event WebSocket:

- does not stop any Harness session;
- does not change session lifecycle;
- does not create replay obligations; and
- does not require Harness to persist missed events.

## Ordering

Events emitted by Harness must be delivered to a given connected event client in the order Harness emits them.

For a given session, that ensures the observable lifecycle ordering:

```text
session.started
→
session.ended
```

This spike does not establish stronger ordering guarantees across unrelated sessions beyond the order presented by the live event stream.

---

# Existing behavior

The spike must preserve the existing public behavior established by earlier spikes except where the frozen Spike 007 contract explicitly extends it.

In particular:

- existing session creation behavior remains available;
- existing session attachment behavior remains available;
- existing backend text/output projection remains available;
- existing explicit session deletion remains available;
- existing backend lifecycle and cleanup behavior remains intact;
- existing session-specific WebSocket behavior remains intact; and
- both PTY and Codex-backed sessions remain usable.

Structured events are an addition to the current Harness control surface.

They are not a replacement for the current session interaction model.

---

# Backend neutrality

The structured event contract belongs above the backend-specific implementation boundary.

Both current backends must produce equivalent Harness lifecycle semantics.

The implementation may use different internal signals from different backends to determine that a Harness lifecycle transition occurred.

Those differences must not leak into the public event type or envelope shape.

This spike does not require backend-native events to be normalized beyond the two Harness lifecycle facts defined here.

---

# Design Map expectations

The Design Map should remain compact.

It should settle structural decisions required to implement and independently evaluate this spike, including at least:

- where Harness lifecycle events are owned/emitted;
- how the event WebSocket observes those events;
- how the event representation relates to existing session/output paths;
- where backend-specific lifecycle signals become Harness-level events;
- the pinned Conduit protocol Git revision;
- adopted Conduit envelope conventions;
- the mapping between Harness session identity and Conduit stream identity;
- any deliberate Conduit divergence;
- the smallest useful event-publishing seam for evaluation; and
- meaningful implementation freedoms.

The Design Map must not expand the spike into:

- a general event bus;
- persistence;
- replay;
- provider-event normalization;
- attention semantics; or
- future approval design.

If Design Map work reveals a new externally observable behavior that this brief has not settled, return to the brief rather than silently deciding it in the Design Map.

---

# Evaluation expectations

Evaluation should establish the externally observable structured-event contract without prescribing unnecessary internal architecture.

At minimum, evaluation should be able to determine that:

- a successful session start emits one `session.started`;
- a failed startup does not emit `session.started`;
- ending a successfully started session emits one `session.ended`;
- explicit deletion and natural backend termination produce the required Harness-level end semantics;
- a cleanup/finalization error does not prevent the Harness-level ended event if the public session identity is permanently removed;
- `session.started` precedes `session.ended` for the same session;
- lifecycle events identify the correct Harness session/stream;
- PTY and Codex sessions expose equivalent Harness lifecycle semantics;
- event clients connected before an event occurs receive it;
- multiple event clients receive emitted lifecycle events;
- clients connecting after an event occurred do not receive historical replay;
- structured events are distinguishable from ordinary session text/output;
- session text/output behavior remains intact;
- event-stream disconnection does not alter session lifecycle;
- provider-native event schemas have not become the public Harness event contract;
- the event envelope conforms to the Conduit-derived contract recorded in the frozen Design Map; and
- no Conduit runtime or transport dependency has been introduced.

Public evaluation requirements may expose any testability seam genuinely required for fair evaluation.

Hidden evaluation must not require a broader event architecture than this brief establishes.

---

# Methodology objective

Spike 007 is the first end-to-end exercise of the development workflow produced by Spike 006.

It must use the normal workflow without the Spike 006 process exception:

1. Brief Readiness
2. brief freeze
3. Design Map
4. Design Map freeze
5. evaluator `prepare`
6. evaluation freeze
7. implementation
8. evaluator `verify`
9. retry where genuinely required
10. As-Built
11. Outcome

The spike manifest must preserve available execution statistics and workflow provenance as defined by repository-wide methodology.

The workflow should be allowed to encounter real failures naturally.

Do not deliberately sabotage implementation or evaluator artifacts merely to force retry paths.

---

# Methodology observations

The Spike 007 Outcome should explicitly record useful evidence about the revised workflow, including where available:

- Brief Readiness findings and number of passes;
- whether the first readiness pass identified the deliberately unresolved product decisions in the original draft;
- any additional material issue it discovered;
- whether subsequent readiness findings remained bounded and useful;
- whether the Design Map remained compact;
- whether the Design Map materially helped implementation or evaluation;
- evaluator preparation cost and available execution statistics;
- implementation cost and available execution statistics;
- verification attempts and classifications;
- evaluator defects, if any;
- implementation retries, if any;
- usefulness and size of As-Built;
- usefulness and size of Outcome;
- manifest usefulness; and
- material workflow friction observed during the spike.

These observations are evidence about this workflow execution, not proof that the methodology is generally optimal.

---

# Non-goals

Spike 007 does not introduce:

- event persistence;
- historical event replay;
- state snapshots on event-stream connection;
- detached-client resynchronization;
- replay offsets or cursors;
- event acknowledgements;
- attention or priority semantics;
- approval handling;
- agent questions;
- tool-call normalization;
- provider-event normalization beyond the lifecycle behavior required by this spike;
- `session.attached` or `session.detached` events;
- structured session-end reason/status modeling;
- a general-purpose event bus;
- RabbitMQ or another broker;
- a Conduit SDK/runtime dependency;
- cross-language messaging;
- multi-session orchestration changes;
- daemon-restart persistence;
- remote/public-network access;
- a new end-user UI; or
- a comprehensive event schema for future Harness functionality.

Later spikes may build on the structured event boundary established here.

---

# Acceptance criteria

The spike succeeds when all of the following are true:

1. Harness exposes a dedicated host-level structured event WebSocket.

2. Structured Harness events are not mixed into the existing session text/output WebSocket.

3. Harness structured events use the Conduit envelope structure and relevant field semantics defined by the pinned Conduit protocol revision recorded in the Design Map.

4. No Conduit runtime, SDK, broker, transport, or cross-language dependency is introduced.

5. A successfully established Harness session emits exactly one `session.started`.

6. A failed session startup emits no `session.started`.

7. A successfully started session emits exactly one `session.ended` when Harness permanently removes its public session identity.

8. Both explicit deletion and natural backend termination produce the required Harness-level session-ended semantics.

9. A backend cleanup/finalization error does not suppress `session.ended` where Harness nevertheless permanently removes the session identity.

10. `session.started` precedes `session.ended` for the same session.

11. Lifecycle events use the Harness session identity as their session/stream identity rather than provider-specific thread, turn, PTY, or process identities.

12. Equivalent PTY-backed and Codex-backed lifecycle behavior produces equivalent public Harness events.

13. A client connected to the event WebSocket receives structured events emitted after connection.

14. Multiple simultaneously connected event clients each receive emitted lifecycle events.

15. A client connecting after an event has already occurred does not receive historical replay.

16. Event WebSocket connection or disconnection does not itself change Harness session lifecycle.

17. Clients can distinguish structured Harness events from ordinary backend/session output.

18. Existing session creation, attachment, text/output, deletion, cleanup, and backend behavior required by previous spikes continues to work.

19. Provider-native protocol events are not exposed directly as the Harness public event contract.

20. The Design Map records the exact Conduit protocol revision used as the architectural reference.

21. The Design Map records any material Conduit conventions adopted or deliberately diverged from.

22. No event persistence, replay, snapshotting, resynchronization, attention/approval system, attachment-event model, or general event bus is introduced.

23. Public tests and repository checks pass.

24. The complete normal Spike 006 workflow is exercised without a process exception.

25. The Spike 007 Outcome records both the product result and useful observations about the first end-to-end use of the revised methodology.

---

# Successful outcome

A successful Spike 007 establishes the first structured Harness-level event boundary:

- a stable Harness event envelope;
- a dedicated live host-level event stream;
- backend-neutral session lifecycle events; and
- an architectural relationship with the Conduit event protocol without runtime coupling.

It should leave later work able to ask richer questions such as:

- Which agent activity requires human attention?
- How should approvals and questions be represented?
- Which backend/provider events should become Harness-level domain events?
- What structured state must a detached client recover?
- Which events need persistence or replay?
- How should replay and live delivery converge for reconnecting clients?

Those concerns are deliberately deferred until the smallest structured lifecycle model has been implemented and independently evaluated.