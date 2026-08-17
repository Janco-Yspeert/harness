# Spike 007 — Structured Session Events

## Goal

Introduce the smallest useful Harness-level structured event model for session lifecycle activity.

Harness currently exposes session lifecycle through its HTTP/WebSocket control surface and projects backend output to attached clients. The next product direction requires Harness to represent meaningful activity as structured state rather than treating all observable agent activity as undifferentiated text.

This spike establishes that boundary with a deliberately small lifecycle slice.

It must not attempt to build the complete event, attention, approval, replay, or persistence model.

---

## Primary question

> Can Harness expose a small set of backend-neutral structured session lifecycle events while preserving existing session and text-stream behavior?

A successful spike should establish a structural foundation that later work can extend toward attention-worthy agent activity, approvals, questions, failures, completion, and detached-client resynchronization.

---

## Scope

Introduce Harness-level structured lifecycle events representing at least:

- a session becoming started; and
- a session becoming ended.

Each structured event must identify:

- the event type; and
- the Harness session to which it belongs.

Clients must be able to receive these events through the Harness control surface.

The event model must be owned by Harness rather than by an individual backend.

The PTY and Codex backends must therefore participate in the same Harness-level lifecycle semantics rather than exposing different public event contracts for equivalent session activity.

Existing text/output interaction must continue to work.

---

## Harness events versus backend events

Harness structured events represent Harness-level semantics.

They must not simply expose Codex App Server messages, PTY implementation details, or another backend's native protocol as the public Harness event contract.

Provider/backend-specific information may inform how Harness determines that an event occurred, but the public event itself should represent a Harness concept.

This spike does not attempt to normalize the complete event surface of any backend.

---

## Conduit Events architectural awareness

The separate Conduit Events project contains existing work on language-neutral event envelopes, event metadata, schema design, and cross-language event compatibility.

That work should be reviewed before the structured Harness event representation is settled.

Harness should avoid gratuitously inventing an incompatible event model where an existing Conduit convention provides a useful and appropriate precedent.

However, this spike does not introduce a dependency on Conduit Events.

In particular, it does not require:

- the Conduit SDK;
- RabbitMQ or another message broker;
- cross-process event transport;
- cross-language Harness clients;
- Conduit protocol compatibility; or
- adoption of the complete Conduit event envelope.

Conduit is an architectural reference for this spike, not a runtime dependency or externally required protocol.

The Design Map should record any Conduit-derived convention that is deliberately adopted and any material divergence that is deliberately chosen.

---

## Client behavior

Structured lifecycle events are delivered to clients using the Harness control surface.

They are additive to existing output behavior.

Existing clients relying on the current session/output behavior should not lose that functionality merely because structured lifecycle events now exist.

A client should be able to distinguish a structured Harness event from ordinary backend/output text.

---

## Session lifecycle

A session-started event represents successful session startup.

A session-ended event represents the end of a Harness session.

Lifecycle events must use the Harness session identity rather than a provider-specific thread, turn, PTY, or process identity.

Equivalent PTY-backed and Codex-backed session lifecycle should produce equivalent Harness event semantics.

---

## Event representation

The structured representation should be deliberately small.

Do not design an envelope around hypothetical future requirements.

The representation may include metadata where it is already justified by this spike or by an established architectural convention that is useful to preserve.

Avoid introducing provider-specific fields into the general Harness event contract.

The event representation should remain extensible enough that later Harness-level event types do not require replacing the basic structured-event boundary established here.

---

## Existing behavior

The spike must preserve the existing public behavior established by previous spikes except where the frozen Spike 007 contract explicitly extends it.

In particular:

- existing session creation behavior remains available;
- existing session attachment behavior remains available;
- existing backend text/output projection remains available;
- existing explicit session deletion remains available;
- existing backend lifecycle and cleanup behavior remains intact; and
- both supported backends remain usable.

Structured events are an addition to the current control surface, not a replacement for the current text interaction model.

---

## Evaluation expectations

Evaluation should establish the externally observable structured-event contract without prescribing unnecessary internal architecture.

At minimum, evaluation should be able to determine that:

- required lifecycle activity produces the required Harness-level structured event;
- events identify the correct Harness session;
- equivalent lifecycle behavior is backend-neutral;
- clients can distinguish structured lifecycle events from ordinary output;
- existing text/output behavior continues to work; and
- no provider-native event schema has accidentally become the public Harness contract.

Public evaluation requirements may expose any testability seam genuinely required for fair evaluation.

Hidden evaluation must not require a broader event architecture than this brief establishes.

---

## Methodology objective

Spike 007 is also the first end-to-end exercise of the development workflow produced by Spike 006.

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

The spike manifest must preserve available execution statistics and workflow provenance as defined by the repository-wide methodology.

The workflow should be allowed to encounter real failures naturally.

Do not deliberately sabotage implementation or evaluator artifacts merely to exercise retry behavior.

---

## Methodology observations

The Spike 007 Outcome should explicitly record useful evidence about the revised workflow, including where available:

- whether Brief Readiness identified material missing decisions in the draft brief;
- whether its findings were bounded and useful;
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

## Non-goals

Spike 007 does not introduce:

- event persistence;
- historical event replay;
- detached-client resynchronization;
- attention or priority semantics;
- approval handling;
- agent questions;
- tool-call normalization;
- provider-event normalization beyond the lifecycle behavior required by this spike;
- a general-purpose event bus;
- RabbitMQ or another broker;
- a Conduit runtime dependency;
- cross-language messaging;
- multi-session orchestration;
- daemon-restart persistence;
- remote/public-network access;
- a new end-user UI; or
- a comprehensive event schema for future Harness functionality.

Later spikes may build on the structured boundary established here.

---

## Acceptance criteria

The spike succeeds when:

1. Harness exposes structured events for the required session lifecycle activity.

2. Structured events identify their Harness session.

3. Clients can distinguish structured Harness events from ordinary text/output.

4. Lifecycle event semantics are backend-neutral across the PTY and Codex backends.

5. Provider-native protocol events are not exposed directly as the Harness public event contract.

6. Existing session and text/output behavior required by previous spikes continues to work.

7. No Conduit runtime, broker, or cross-language dependency is introduced.

8. The resulting event representation does not gratuitously conflict with relevant Conduit event-design conventions reviewed during Design Map work.

9. No event persistence, replay, resynchronization, attention/approval system, or general event bus is introduced.

10. Public tests and repository checks pass.

11. The complete Spike 006 workflow is exercised without a process exception.

12. The Spike 007 Outcome records both the product result and useful observations about the first end-to-end use of the revised methodology.

---

## Successful outcome

A successful Spike 007 establishes only the first structured Harness-level event boundary.

It should leave later work able to ask richer questions such as:

- Which agent activity requires human attention?
- How should approvals and questions be represented?
- What structured state must a detached client recover?
- Which events or state need replay or resynchronization?

Those concerns are deliberately deferred until the smallest structured lifecycle model has been implemented and evaluated.