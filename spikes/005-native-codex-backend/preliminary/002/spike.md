# Spike 005 — Native Codex Backend

## Goal

Prove that Harness can supervise a real Codex session through a provider-native integration rather than through PTY/terminal control, while preserving the backend-independent Harness session lifecycle established in Spike 004.

This spike introduces a real Codex backend using Codex App Server.

The purpose is **not** merely to make Codex answer a prompt through Harness.

The purpose is to use a genuinely different backend to pressure-test the abstractions established in Spike 004 and discover which concepts are actually common between:

- a PTY-backed shell;
- a simple injected fake backend; and
- a structured, provider-native AI coding agent.

The spike should prefer evidence from the real provider over preserving abstractions merely because they were convenient in Spike 004.

---

## Primary question

> Can Harness supervise a real Codex thread through a provider-native backend while preserving Harness's own session lifecycle and without forcing Codex's structured semantics into PTY-shaped abstractions?

A successful result should tell us:

- whether the existing session/backend boundary survives contact with a real provider;
- how a Harness session relates to a provider-owned persistent conversation;
- whether the current string input/output contract remains useful;
- which Codex semantics can reasonably remain provider-specific;
- which structured concepts, if any, now need to become first-class Harness concepts; and
- what the next spike should actually address.

The existing `SessionBackend` contract is evidence from Spike 004, not an API that must be preserved unchanged.

If the real integration demonstrates that the boundary or vocabulary is wrong, changing it is a valid and potentially desirable spike result.

---

## Context

Spike 004 established that:

- a Harness session is a logical product entity rather than a PTY or process;
- Harness session identity is independent of backend identity;
- backend startup may be asynchronous;
- `201` means the backend has successfully started and the Harness session is usable;
- the singleton slot is reserved while backend creation is in progress;
- failed startup releases the reservation;
- Harness-initiated stop and backend-initiated termination converge on one guarded ending/finalization path;
- `204` is returned only after backend termination and required finalization complete;
- backend-independent session management can operate against both the PTY backend and an injected non-process backend;
- client detachment does not end the Harness session;
- stale browser session IDs can be detected through `GET /sessions/:id`; and
- the existing string input/output backend contract has **not** been proven against a real structured provider.

Spike 004 deliberately deferred:

- real Codex integration;
- structured provider events;
- approval requests;
- tool-call representation;
- agent state;
- provider-specific stop failure;
- history and replay;
- persistent provider-session recovery;
- multi-session supervision; and
- attempts to create a universal AI-provider abstraction.

Spike 005 addresses only the first real-provider boundary and the architectural consequences directly exposed by it.

---

## Integration target

The real backend for this spike is **Codex App Server**.

App Server exposes a provider-native protocol with persistent threads, turns within those threads, incremental structured events, interruption, and distinct provider-side identity.

For this spike, Harness must target only the **non-experimental protocol surface**.

Harness must not opt into:

```text
capabilities.experimentalApi = true
```

Omitting the capability, or explicitly setting it to `false`, keeps the client on the non-experimental App Server API surface.

The phrase **non-experimental protocol surface** in this brief refers only to that protocol gating. It must not be interpreted as a claim about the maturity status of App Server itself.

---

## Protocol/schema baseline

App Server protocol schemas are specific to the Codex CLI version that generated them.

Spike 005 must therefore freeze a concrete protocol baseline before implementation/evaluation freeze.

Before the spike is frozen:

1. Record the exact locally installed Codex CLI version using `codex --version`.
2. Generate a schema bundle from that same installation using the supported App Server schema-generation command.
3. Commit that generated schema baseline with the Spike 005 artifacts.
4. Record the generating Codex CLI version alongside the schema.

A reasonable repository location is:

```text
spikes/005-native-codex-backend/
    protocol/
        app-server-schema/
        README.md
```

The exact directory structure is not prescribed.

The committed README or equivalent provenance artifact must identify the exact Codex CLI version that generated the schema.

The implementation and deterministic evaluator peer must target this **frozen schema baseline**, rather than independently assuming whatever protocol happens to be installed later.

The CLI currently supports generating either TypeScript definitions or a JSON Schema bundle; either is acceptable provided the chosen artifact is sufficient to establish the frozen protocol contract.

A newer Codex installation may be used for later live smoke testing if compatible, but it must not silently redefine the frozen deterministic evaluator contract.

---

## Transport

The initial real integration should use the local App Server's standard stdio transport.

Harness may launch and own a local `codex app-server` process as infrastructure for the backend.

This remains a structured provider integration, **not** PTY control.

Harness must communicate through the App Server protocol rather than through terminal emulation or CLI-screen scraping.

A different App Server transport may be used only if repository or platform constraints demonstrate a concrete reason.

---

## Desired conceptual model

The spike should test a model broadly resembling:

```text
Harness host
    |
    v
Harness session
    id: Harness UUID
    |
    v
Codex backend
    |
    +-- App Server transport/process
    |
    v
Codex thread
    id: provider thread ID
    |
    +-- Turn 1
    |
    +-- Turn 2
    |
    +-- ...
```

These entities must remain conceptually distinct.

In particular:

> A Harness session is not a Codex thread ID.

and:

> A Codex turn is not a Harness session.

---

## Harness session to Codex thread mapping

For Spike 005:

> One active Harness session maps to one Codex thread.

The Codex backend must create a new Codex thread during successful backend startup.

The resulting Codex thread ID is backend/provider state and must remain distinct from the Harness session UUID.

The backend may retain the provider thread ID internally for the lifetime of the Harness session.

The browser does not need to know the Codex thread ID.

No endpoint for exposing provider IDs is required.

---

## Backend startup

The Spike 004 startup contract remains in force.

When creating a Codex-backed Harness session:

1. Harness reserves the singleton session slot.
2. The Codex backend establishes its App Server infrastructure/transport.
3. The App Server connection completes its required initialization handshake.
4. The backend creates a Codex thread.
5. Only once the Codex backend and thread are ready for use may Harness session creation succeed.
6. `POST /sessions` then returns `201`.

App Server requires initialization before normal thread/turn operations on a connection.

Therefore:

> `201` for a Codex-backed session means that Harness has successfully established the Codex backend and created the provider thread required by that Harness session.

If startup fails:

- backend-owned partially acquired resources must be cleaned up;
- Harness must release its session-creation reservation;
- no active Harness session may remain; and
- a later creation attempt must still be possible.

Do not introduce generic retry or degraded-session behaviour for App Server startup failure in this spike.

---

## Authentication

Harness does not implement OpenAI authentication.

The Codex backend should use the existing authentication available to the locally installed Codex environment.

Harness must not:

- request OpenAI credentials through the browser;
- store OpenAI credentials;
- copy Codex credential files;
- implement token refresh;
- implement an OAuth flow;
- proxy credentials to the phone/client; or
- expose credentials through Harness APIs.

Authentication setup remains an external prerequisite for real-Codex operation.

---

## Diagnostic and error surfacing

Spike 005 requires a deliberately narrow diagnostic contract.

### Startup failures

If Codex/App Server cannot start or initialize successfully:

- the existing Harness session-creation failure path is used;
- no active Harness session remains;
- the singleton reservation is released; and
- sanitized diagnostic details must be available in server-side logging.

The browser does not require provider-specific authentication or App Server error UX.

### Runtime fatal errors

If the Codex backend encounters a fatal runtime condition that makes the backend unusable:

- sanitized details must be logged server-side;
- the backend follows the established backend-initiated termination lifecycle;
- the Harness session ends;
- an attached client is closed according to the established lifecycle; and
- a replacement Harness session can subsequently be created.

### Sanitization

Server diagnostics must not expose:

- access tokens;
- authentication credentials;
- secrets;
- raw sensitive authorization material; or
- other credential-bearing data.

Provider error objects may be summarized or sanitized before logging.

Spike 005 does **not** require browser-visible rendering of provider authentication errors, structured Codex errors, or diagnostic metadata.

---

## Runtime backend selection

Spike 005 needs a normal, non-test-only way to run Harness with the Codex backend.

The exact mechanism is not prescribed.

It may be:

- host configuration;
- command-line configuration;
- environment configuration;
- construction configuration; or
- another small explicit runtime seam.

The browser does **not** need provider selection.

For this spike, the host may still be launched in either:

- PTY mode; or
- Codex mode.

Do not build a provider registry, dynamic plugin loader, backend discovery system, or provider-selection UI.

---

## Codex thread and turn lifecycle

Codex distinguishes a long-lived thread from individual turns. A thread is the conversation; a turn is one user request and the resulting agent work.

Harness must preserve this distinction.

### Starting a turn

When the Codex-backed Harness session is idle and receives a user text instruction, the backend starts a new Codex turn on the existing Codex thread.

Conceptually:

```text
Harness user instruction
        |
        v
existing Codex thread
        |
        v
new Codex turn
```

The exact internal API shape is not prescribed.

### Turn completion

A Codex turn completing does **not** end the Harness session.

After a completed turn:

- the Harness session remains active;
- the browser may remain attached;
- the Codex thread remains associated with the Harness session; and
- another user instruction can start another turn on that same thread.

This is a required semantic difference from PTY process exit.

### Multiple sequential turns

The same Harness session must support at least two sequential Codex turns on the same Codex thread.

The second turn must not create:

- a replacement Harness session; or
- a replacement Codex thread.

This proves that Harness supervision represents a provider conversation/session rather than one model invocation.

---

## Input during an active turn

Spike 005 does not implement Codex turn steering, user-input queuing, or overlapping turns.

Codex App Server exposes provider-native steering, but Harness deliberately does not expose that capability in this spike.

The observable Harness contract is:

> User input received while a Codex turn is active is rejected.

It must:

- not start another turn;
- not invoke `turn/steer`;
- not be queued for later execution;
- not interrupt the active turn;
- not close the WebSocket; and
- not be silently discarded.

The client must receive an explicit Harness-generated error message:

```json
{
  "type": "error",
  "code": "turn_active",
  "data": "Codex is already working on a turn."
}
```

The active Codex turn, Codex thread, Harness session, and attached WebSocket must remain otherwise unchanged.

The browser must display this error sufficiently for the user to know that the submitted instruction was rejected.

This error is a **Harness control/error message**, not Codex agent output.

The implementation may therefore need to evolve the current PTY-oriented `write(): void` abstraction or WebSocket message handling.

That is permitted.

The spike must not preserve a misleading API merely to avoid changing the Spike 004 interface.

---

## Structured provider events

Codex App Server emits structured lifecycle and item events rather than a terminal byte stream, including agent-message deltas, item lifecycle events, turn lifecycle, command/tool activity, file changes, and other provider events.

This is a primary architectural pressure point for Spike 005.

### Agent-text projection

For this spike, textual Codex agent output may be projected onto the existing Harness string-output channel.

The authoritative projection rule is:

> Stream `item/agentMessage/delta` text as it arrives.

For each Codex agent-message item:

1. Track whether one or more agent-message deltas have been emitted to Harness.
2. If deltas were emitted, forward those deltas exactly once and **do not subsequently emit the completed agent-message text again**.
3. When the matching completed item arrives, use it for lifecycle/bookkeeping as required but do not duplicate text already delivered through deltas.
4. If no deltas were observed for that agent-message item, Harness may emit its completed final text once as a fallback.

App Server exposes incremental `item/agentMessage/delta` notifications alongside item lifecycle notifications.

Conceptually:

```text
Agent message item
      |
      +-- deltas observed
      |       |
      |       +--> stream deltas
      |       +--> do not repeat completed text
      |
      +-- no deltas observed
              |
              +--> emit completed text once
```

The evaluator must verify that the final agent response is not displayed twice merely because both incremental and completed representations were received.

### Other structured events

Harness must **not** blindly serialize every structured Codex event into strings and pretend the existing data model is universally sufficient.

Events such as:

- command/tool activity;
- file changes;
- approval requests;
- turn lifecycle;
- provider metadata;
- usage metadata;
- structured errors; and
- other non-agent-message items

may remain unsupported or backend-internal for Spike 005 unless one is essential to the minimum real integration.

The outcome must record which significant event categories were encountered and whether they suggest a future Harness-level structured event model.

This spike is explicitly allowed to conclude:

> The string data plane was sufficient for displaying agent text but is not sufficient as the long-term Harness/provider contract.

That would be useful evidence, not a failure.

---

## Do not preserve false abstraction

The implementation must not contort Codex into PTY terminology simply to avoid changing code introduced in Spike 004.

In particular, the spike should examine whether concepts such as:

- `input`;
- `output`;
- `exit`;
- `stop`;
- `start`; and
- backend ownership

still mean the same thing for Codex.

Renaming or refining the backend contract is allowed if real provider semantics demonstrate a concrete need.

Do not generalize the resulting Codex-specific concepts into a universal `AgentBackend` unless evidence from this spike establishes a genuinely common Harness concept.

---

## Turn interruption and Harness stop

Codex App Server supports `turn/interrupt`; after successful interruption, the turn reaches a terminal `turn/completed` event with interrupted status.

For Spike 005, explicitly stopping a Codex-backed Harness session must use the following contract.

### No active turn

If no Codex turn is active:

1. finalize/close the Codex backend;
2. terminate or release backend-owned App Server infrastructure as required;
3. remove the Harness session;
4. close an attached browser connection as required by the established lifecycle;
5. release the singleton slot; and
6. return `204`.

### Active turn: graceful interruption

If a Codex turn is active:

1. issue `turn/interrupt` for the active provider turn;
2. await a successful interrupt response;
3. await the corresponding terminal `turn/completed` event with interrupted status;
4. finalize the Codex backend;
5. remove the Harness session;
6. release the singleton slot; and
7. return `204`.

The interrupt request/terminal-event sequence is the preferred graceful path.

### Active turn: bounded fallback

Harness must not wait indefinitely for graceful provider interruption.

After requesting interruption, the Codex backend has a **maximum five-second grace period** to reach the required interrupted terminal state.

Fallback teardown is permitted when:

- the interrupt request fails;
- the App Server/backend becomes unusable during interruption; or
- the interrupted terminal event has not been observed within five seconds of initiating interruption.

On fallback:

1. the backend may forcibly terminate/release its locally owned App Server infrastructure as required;
2. remaining backend resources must be finalized;
3. the Harness session is removed; and
4. the singleton slot is released.

If this fallback successfully finalizes the Harness backend:

> `DELETE /sessions/:id` returns `204`.

`204` therefore means that Harness has successfully stopped and finalized the backend it owns. It does not guarantee that the external provider supplied every preferred graceful-interruption acknowledgement.

Only if Harness cannot successfully finalize the backend even through bounded fallback should deletion use the existing failure path, currently represented by an HTTP failure such as `500`.

The outcome must record:

- whether live Codex stop completed gracefully;
- whether bounded fallback was exercised; and
- why fallback was necessary if it occurred.

---

## Stopping Harness does not delete provider history

Stopping a Harness session must **not** deliberately permanently delete the associated Codex thread.

App Server exposes permanent thread deletion as a separate provider operation.

For Spike 005:

> Ending Harness supervision and deleting provider conversation history are different operations.

`DELETE /sessions/:id` ends the Harness session and its active backend supervision.

It does not call permanent provider-thread deletion merely because Harness is stopping.

The Codex thread ID does not need to be exposed or retained by Harness after the Harness session ends.

Resuming that old thread through a future Harness session is explicitly deferred.

---

## Backend-initiated termination

A completed Codex **turn** is not backend termination.

Backend-initiated Harness-session termination instead corresponds to loss or termination of the provider-control backend itself, such as:

- App Server process exit;
- App Server transport closure that makes the backend unusable; or
- another fatal backend condition from which the current backend cannot continue.

When the Codex backend terminates independently:

- the Harness session must end according to the Spike 004 lifecycle;
- sanitized diagnostics should identify the fatal backend condition where available;
- an attached client must be closed as appropriate;
- the session becomes stale;
- `GET /sessions/:id` must subsequently return `404`; and
- a replacement Harness session must be creatable.

Do not treat ordinary turn completion as one of these events.

---

## Detach and reattach

Spike 004 detach semantics remain in force.

Disconnecting the browser must not:

- stop the Harness session;
- stop the Codex backend;
- interrupt the active Codex turn merely because the client disappeared; or
- destroy the Codex thread.

The client must remain able to reattach while the Harness session still exists.

### Work while detached

A Codex turn may continue while no browser is attached.

Spike 005 does **not** require Harness to replay agent output or provider events that occurred while detached.

This is deliberate.

The outcome must record the resulting user-visible behaviour and whether it strengthens the need for:

- event buffering;
- history retrieval;
- state resynchronization; or
- provider-backed replay

in a future spike.

Do not solve detached history opportunistically in Spike 005.

---

## Browser behaviour

Keep the existing browser deliberately small.

For a Codex-backed session it must remain possible to:

- create the Harness session;
- attach;
- submit textual instructions;
- display textual Codex agent output without duplication;
- receive/display the `turn_active` Harness error when input is rejected during an active turn;
- detach;
- reattach;
- submit another sequential instruction after a completed turn; and
- stop the Harness session.

No Codex-specific dashboard is required.

Do not add:

- tool-call rendering;
- file-diff rendering;
- approval UI;
- token usage;
- model selectors;
- effort selectors;
- provider thread IDs;
- turn history UI;
- provider selection; or
- structured agent-status UI.

A crude browser is acceptable.

The architecture, lifecycle, and provider boundary are what this spike is testing.

---

## Approval and sandbox scope

Codex App Server can issue provider-native approval requests for operations such as commands and file changes.

Harness does not implement approval interaction in Spike 005.

The real smoke workload should therefore use a deliberately restricted configuration/workspace that avoids requiring Harness to answer interactive approvals.

The spike must not weaken host security merely to avoid implementing approvals.

If approval events are nevertheless encountered:

- they must not be masqueraded as ordinary agent text;
- the event should be captured in sanitized diagnostics or outcome evidence as appropriate; and
- the outcome should record the architectural pressure exposed by it.

Approval handling remains deferred.

---

## Working directory / verification workspace

The Codex thread must operate against an explicit working directory appropriate to the spike.

The live integration should use a disposable fixture or verification workspace rather than depending on Codex modifying the Harness implementation repository.

The exact fixture layout is not prescribed.

The live smoke should require only enough repository/workspace context to prove:

- a real Codex thread was created;
- Codex accepted real turns;
- agent text streamed back;
- the same thread accepted a later sequential turn; and
- Harness lifecycle remained intact.

Do not make successful evaluation depend on Codex producing a particular source-code patch.

---

## App Server process ownership

If Harness launches the local App Server process for a Codex backend, that process is backend infrastructure.

Provider protocol lifecycle and Harness session lifecycle must remain distinct from the operating-system process mechanics used to host App Server.

App Server spawning, stdio framing, process exit, protocol initialization, and provider request IDs should remain Codex-backend implementation concerns rather than generic Harness-session concepts.

Do not leak App Server process IDs or request IDs into Harness session identity.

---

## Provider protocol verification seam

The implementation must be independently testable without requiring every evaluator test to consume a real model or external service.

There must be a normal programmatic seam through which evaluator tests can substitute the real App Server process/peer with a deterministic protocol peer or equivalent controlled test double.

The exact implementation is not prescribed.

Possible approaches include:

- configurable App Server executable/process construction;
- injected transport creation;
- injected protocol-client construction; or
- another narrow provider-specific seam.

The evaluator must not need to monkey-patch module internals.

The fake/protocol peer must target the **committed frozen App Server schema baseline**.

It should exercise the **actual asynchronous transport/framing path used by the Codex backend**, not merely call backend callbacks directly.

This requirement follows directly from the evaluator defects discovered in prior spikes: helper correctness in isolation is insufficient evidence when the production path contains asynchronous transport behaviour.

---

## Deterministic automated verification

The majority of mandatory evaluation must not depend on model wording, network latency, account quotas, or stochastic model behaviour.

Using a deterministic App Server protocol peer/test double, automated verification should cover at least:

### Protocol baseline

1. The deterministic peer and implementation target the committed Spike 005 schema baseline.
2. Initialization does not opt into `experimentalApi`.
3. Tests do not rely on methods or fields outside the frozen non-experimental protocol baseline.

### Startup

4. App Server transport is established.
5. Required initialization occurs before thread operations.
6. A Codex thread is created.
7. Harness does not return `201` until backend/thread startup succeeds.
8. The Harness UUID remains independent from the provider thread ID.
9. Failed App Server startup/thread creation cleans up and releases the singleton slot.
10. Startup failures produce sanitized server-side diagnostic evidence without requiring browser-specific provider error UX.

### Turns

11. User text starts a Codex turn on the current provider thread.
12. Agent-message deltas reach the attached browser through Harness.
13. If deltas were emitted, completed-item text is not subsequently duplicated.
14. If no deltas were emitted for an agent-message item, completed text may be projected exactly once as fallback.
15. Turn completion does not end the Harness session.
16. A second sequential user instruction starts another turn on the **same Codex thread**.
17. Completion of that second turn still does not end the Harness session.

### Active-turn input rejection

18. A second user instruction received while a turn is active does not create another turn.
19. It does not call provider steering.
20. It is not queued.
21. It does not interrupt the active turn.
22. Harness sends exactly one client-visible error with:

```json
{
  "type": "error",
  "code": "turn_active",
  "data": "Codex is already working on a turn."
}
```

23. The active turn and Harness session remain usable after the rejected input.

### Structured events

24. Non-text provider events do not need to be rendered as terminal output merely to satisfy the existing string channel.
25. Provider request IDs, item IDs, turn IDs, and thread IDs do not replace Harness identity.
26. Unexpected but valid non-text events do not corrupt the Harness session lifecycle.

### Detachment

27. Browser detachment does not end the Codex backend.
28. An active turn may continue while the browser is detached.
29. The browser can reattach while the Harness session remains active.
30. Replay of events missed while detached is not required.

### Stop — idle

31. Deleting an idle Codex-backed Harness session finalizes backend resources before `204`.
32. Stop does not invoke permanent provider-thread deletion.

### Stop — active turn

33. Deleting a session with an active turn first requests `turn/interrupt`.
34. The graceful path waits for successful interrupt acknowledgement and terminal interrupted turn completion before final backend teardown.
35. Graceful completion results in `204`.
36. If interrupt fails or the terminal interrupted event does not arrive within five seconds, bounded fallback teardown is permitted.
37. Successful fallback finalization still results in `204`.
38. Failure to finalize even through fallback results in the existing deletion failure path.
39. Provider exit racing with Harness stop does not produce duplicate or conflicting finalization.

### Backend failure

40. Fatal App Server/backend termination ends the Harness session.
41. Attached clients are closed appropriately.
42. Sanitized runtime diagnostic evidence is produced.
43. The stale session becomes unavailable through `GET /sessions/:id`.
44. A replacement Harness session can subsequently be created and attached.

### Regression

45. Existing PTY-backed behaviour remains materially intact.
46. The Codex integration does not move App Server/provider-specific concepts into PTY handling or generic Harness identity.

The evaluator may add further cases derived from the frozen contract.

---

## Live Codex smoke verification

In addition to deterministic automated evaluation, Spike 005 must be exercised against the locally installed, authenticated **real Codex App Server**.

This live verification exists to prove that the integration is not merely compatible with its own fake.

The live smoke should demonstrate at least:

1. record the exact Codex CLI version used for the smoke;
2. launch Harness with the Codex backend through the normal runtime path;
3. create a Harness session;
4. successfully initialize the real App Server;
5. create a real Codex thread;
6. attach the browser;
7. submit a first textual instruction;
8. receive real Codex agent text through Harness without duplicate final output;
9. allow the first turn to complete without ending the Harness session;
10. submit a second sequential instruction;
11. execute that second turn against the same Codex thread;
12. receive agent text again;
13. detach/reattach without destroying the Harness session; and
14. stop the Harness session successfully.

Where practical, the live smoke should also exercise stop during an active turn and record whether:

- graceful interruption completed; or
- the five-second fallback path was required.

The smoke test must not assert exact model wording.

Its evidence is provider/lifecycle behaviour, not semantic model determinism.

A small second-turn instruction that naturally depends on established thread context is desirable during manual verification, but exact answer content must not become a frozen evaluator oracle.

### Live-service availability

The deterministic evaluation remains responsible for exhaustive contract verification.

If the independent evaluator cannot access valid Codex authentication or the external OpenAI service, that absence must not be misclassified as an implementation defect.

However, the spike should not be declared a meaningful real-provider proof without a successful live smoke being performed and recorded somewhere in the implementation/evaluation/outcome workflow.

The final outcome must state clearly:

- which Codex CLI version was used;
- whether it matched the schema-generating version;
- whether live Codex verification was performed;
- under what environment;
- whether it passed;
- whether graceful or fallback stop was observed; and
- which portions of the result relied only on deterministic protocol simulation.

---

## Evaluation discipline

Because this integration crosses asynchronous process/protocol boundaries, evaluator preparation must validate its test oracles across the real transport path.

In particular:

- writing to a transport is not automatically evidence that downstream processing has completed;
- receiving one protocol message is not automatically evidence that all causally related events have arrived;
- test fakes must preserve relevant asynchronous ordering;
- assertions against provider-side state must synchronize on contract-valid observable events;
- timeout/fallback tests must control time deterministically where practical rather than sleeping for real five-second intervals throughout the suite; and
- helper self-tests should include at least one end-to-end check through the same transport path used by the production Codex backend.

Do not treat transport send as a delivery barrier.

---

## Existing HTTP and WebSocket contracts

The existing Harness lifecycle endpoints should remain substantially intact:

```text
POST   /sessions
GET    /sessions/:id
DELETE /sessions/:id
WS     /sessions/:id/ws
```

Spike 005 extends the browser WebSocket message contract with one explicit Harness-generated rejection message:

```json
{
  "type": "error",
  "code": "turn_active",
  "data": "Codex is already working on a turn."
}
```

Existing textual input/output behaviour may otherwise remain simple for this spike.

This does **not** establish a general structured provider-event protocol.

It establishes only the minimum client-visible control/error behaviour necessary to make rejected user input unambiguous.

No new general provider HTTP API is required.

---

## Non-goals

- Codex Remote Control integration.
- Claude integration.
- Multiple active Harness sessions.
- Resuming an old Codex thread into a new Harness session.
- Persisting Harness-to-provider identity mappings across restart.
- Generic provider discovery.
- User-selectable providers in the browser.
- Universal `AgentBackend` design.
- A universal structured AI-event schema.
- Approval-request UI or workflows.
- Tool-call UI.
- File-change or diff UI.
- Token/cost reporting.
- Model or reasoning-effort selectors.
- Turn steering.
- Input queuing while a turn is active.
- Overlapping/concurrent Codex turns within one Harness session.
- Provider-independent command execution.
- Replay of events produced while detached.
- Full thread history.
- State resynchronization after long disconnection.
- Daemon-restart persistence.
- App Server reconnection/recovery after Harness restart.
- Generic remote-provider retry semantics.
- Generic degraded/zombie backend states.
- Permanent Codex thread deletion.
- Codex thread management UI.
- Rich browser provider-error UX.
- PTY descendant-process cleanup.
- Multi-agent coordination.
- Worktree orchestration.
- Public-network exposure.
- Authentication UI.
- Android-client development.

---

## Success criteria

The spike is successful if:

1. Harness can run a real Codex backend through Codex App Server rather than through PTY terminal control.
2. A concrete App Server protocol/schema baseline and generating Codex CLI version are committed before frozen evaluation.
3. Harness uses the non-experimental App Server protocol surface and does not opt into `experimentalApi`.
4. A Harness session remains a distinct domain entity with its own UUID.
5. The Codex backend creates and owns a distinct provider thread ID.
6. Harness session creation waits for successful Codex backend/thread startup.
7. Startup failures produce sufficient sanitized server diagnostics without leaking credentials.
8. Real Codex agent text can reach the existing Harness client path.
9. Agent-message delta/final-item handling does not duplicate completed responses.
10. A completed Codex turn does not end the Harness session.
11. At least two sequential turns can occur on the same Codex thread within one Harness session.
12. Input received during an active turn is explicitly rejected with the defined `turn_active` client error and is not silently lost, queued, steered, or executed concurrently.
13. Client detachment does not terminate the Codex session/backend.
14. Harness stop during an active turn attempts graceful interruption and waits for the interrupted terminal event.
15. Graceful interruption is bounded to five seconds before local backend fallback teardown is permitted.
16. Successful backend finalization, whether graceful or fallback, results in `204`.
17. Stopping Harness does not deliberately delete the persisted Codex thread.
18. Fatal App Server/backend termination correctly ends the Harness session and releases the singleton slot.
19. Provider IDs and App Server process mechanics do not leak into Harness session identity.
20. Deterministic evaluator tests can exercise the Codex backend through a real asynchronous protocol seam without requiring a live model.
21. A live smoke against the real installed/authenticated Codex App Server succeeds and is recorded.
22. Existing PTY-backed behaviour remains materially intact.
23. The implementation does not introduce a speculative universal provider framework.
24. The outcome explicitly identifies which parts of the Spike 004 backend abstraction survived, which changed, and why.
25. The outcome provides concrete evidence for choosing the next spike rather than assuming multi-session remains next.

---

## Failure signals

The spike should be considered unsuccessful or architecturally suspect if:

- no concrete version-specific App Server protocol baseline is frozen;
- implementation and evaluator independently target unspecified/current App Server schemas;
- Harness opts into experimental App Server APIs without a requirement to do so;
- Codex is controlled by terminal emulation rather than through App Server;
- a Codex turn is treated as synonymous with a Harness session;
- turn completion destroys the Harness session;
- every user instruction creates a new Codex thread without a concrete reason;
- the Harness UUID is replaced by or derived from the Codex thread ID;
- Codex/App Server request IDs become Harness identity;
- input received during an active turn is silently discarded;
- active-turn input is queued or steered despite the frozen rejection contract;
- rejected input closes or corrupts the Harness session;
- provider errors are exposed only through unsanitized logs or leak credentials;
- agent-message text is displayed twice because deltas and completed text are both forwarded;
- the implementation stringifies all structured provider events merely to preserve the existing backend interface;
- PTY code acquires Codex-specific behaviour;
- generic Harness session management becomes littered with App Server protocol details;
- DELETE sends `turn/interrupt` and immediately tears down App Server without waiting for the defined graceful evidence or bounded fallback;
- stop waits indefinitely for provider interruption;
- successful fallback finalization is incorrectly treated as an implementation failure merely because the provider did not complete the graceful interruption sequence;
- stopping Harness permanently deletes Codex history by default;
- a client disconnect terminates active Codex work;
- the implementation builds a broad provider/plugin framework that the spike does not require;
- deterministic tests bypass the actual asynchronous provider transport;
- evaluator assertions assume synchronous transport delivery without a contractual guarantee;
- the only evidence of Codex compatibility comes from a fake backend/protocol peer;
- the live integration can only work through test-only injection rather than a normal Harness runtime path; or
- preserving the Spike 004 interface is prioritized over representing real provider semantics correctly.

A failed result is still valuable if it clearly demonstrates that the Spike 004 abstraction is located incorrectly or that a first-class structured Harness event model is required before native providers can be represented cleanly.

---

## Outcome questions

The spike outcome should answer:

1. **Did the Spike 004 backend boundary survive a real Codex integration?**
2. **What changed in the backend contract, if anything, and why?**
3. **Which concepts proved genuinely common between PTY and Codex?**
4. **Which concepts were PTY assumptions disguised as generic abstractions?**
5. **Does `input` remain a useful Harness concept once input can be rejected because a turn is active?**
6. **Did the implementation need an explicit result/error path for user instructions?**
7. **Does `output` remain useful beyond agent text?**
8. **Did the delta-first text projection work cleanly, and were any provider message forms encountered that did not fit it?**
9. **How was Codex's structured event stream handled without prematurely inventing a universal event model?**
10. **Which structured Codex events appear likely to require first-class Harness representation next?**
11. **How does one Harness session map to the Codex thread and its turns?**
12. **What does Harness `stop` mean for an active Codex turn?**
13. **Did live stop reach graceful interrupted completion, or was five-second fallback required?**
14. **Is `204` after fallback an adequate long-term semantic for remote-provider backends, or merely sufficient for this local spike?**
15. **What provider state survives after the Harness session ends?**
16. **What happens when the browser is detached while Codex continues working?**
17. **How weak is the current no-replay behaviour in actual human use?**
18. **Did approval/tool/file-change events create immediate architectural pressure even though they were not implemented?**
19. **How much provider-specific behaviour remained correctly contained inside `CodexBackend`?**
20. **Was a real Codex smoke successfully performed, distinct from deterministic simulated evaluation?**
21. **Which Codex CLI/schema version formed the frozen protocol baseline, and did the live environment differ?**
22. **Did the live provider expose behaviour that the deterministic fake failed to model?**
23. **Were provider/authentication failures sufficiently diagnosable without adding browser-specific error UX?**
24. **What should Spike 006 address based on evidence from this integration?**

Do not assume in advance that Spike 006 must be multi-session.

If Spike 005 demonstrates that structured events, approval requests, state resynchronization, user-instruction semantics, or another provider-native concern is a more fundamental blocker, the next spike should follow that evidence.

---

## Expected architectural posture after the spike

A successful Spike 005 should leave Harness closer to:

```text
Harness session lifecycle
          |
          +----------------------+
          |                      |
          v                      v
     PTY backend            Codex backend
          |                      |
       Bash/PTY              App Server
                                 |
                              Codex thread
                                 |
                              Codex turns
```

This picture does **not** imply that PTY and Codex expose identical capabilities.

The shared layer should contain only concepts demonstrated to be meaningfully shared.

Provider-native behaviour should remain provider-native until Harness has a concrete product reason to elevate it into the common model.

---

## Provenance expectation

Before final frozen verification begins, the implementation under evaluation must have an immutable recorded identity, preferably a clean implementation commit.

The protocol/schema baseline must also be committed before evaluator freeze so that implementation and evaluator target the same provider contract.

After successful evaluation:

1. promoted evaluator artifacts must be committed separately; and
2. the final outcome must be written and committed separately.

The final outcome should distinguish:

- protocol/schema baseline and generating Codex CLI version;
- evaluated implementation commit;
- evaluation artifact commit; and
- outcome commit.

If unavoidable uncommitted implementation changes are evaluated, the evaluator must record sufficient immutable patch provenance rather than silently treating the working tree as reproducible.