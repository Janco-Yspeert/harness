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

Current App Server exposes a provider-native protocol with:

- an initialization handshake;
- persistent Codex threads;
- turns within those threads;
- incremental structured notifications;
- turn completion;
- turn interruption;
- provider-specific thread identity; and
- structured item types beyond plain agent text.

For this spike, Harness should use the stable App Server surface only.

Do not opt into experimental App Server APIs merely to make the integration richer.

### Transport

The initial real integration should use the local App Server's standard stdio transport.

This is a structured protocol integration, **not** PTY control.

Harness may launch and own a local `codex app-server` process as infrastructure for the backend. The existence of that local process does not make the Codex backend a PTY backend: Harness must interact with Codex through the App Server protocol rather than through terminal input/output.

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
5. Only once the Codex backend and thread are ready for use may the Harness session creation succeed.
6. `POST /sessions` then returns `201`.

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

Codex currently supports cached local authentication through either ChatGPT sign-in or API-key authentication.

Harness must not:

- request OpenAI credentials through the browser;
- store OpenAI credentials;
- copy Codex credential files;
- implement token refresh;
- implement an OAuth flow;
- proxy credentials to the phone/client; or
- expose credentials through Harness APIs.

Authentication setup remains an external prerequisite for real-Codex operation.

Authentication errors encountered through normal App Server operation should be surfaced sufficiently for diagnosis but do not require a generalized authentication UX.

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

Codex distinguishes a long-lived thread from individual turns. A thread represents the conversation; a turn represents one user request and the resulting agent work.

Harness must preserve this distinction.

### Starting a turn

When the Codex-backed Harness session is idle and receives a user text instruction, the backend should start a new Codex turn on the existing Codex thread.

Conceptually:

```text
Harness input
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

The second turn must not create a replacement Harness session or a replacement Codex thread.

This proves that Harness supervision represents a provider conversation/session rather than one model invocation.

---

## Input during an active turn

Spike 005 does not attempt to define general steering, queuing, concurrent prompt, or interruption UX.

The required proof uses **sequential turns**:

```text
turn starts
→ turn completes
→ next user instruction
→ next turn starts
```

Codex App Server currently supports provider-native steering of an in-flight turn, but Harness does not need to expose that behaviour in this spike.

If user input arrives while a Codex turn is already active, the implementation must not corrupt the session or accidentally create overlapping turns.

The exact temporary behaviour may be narrow—for example rejecting or declining unsupported concurrent input internally—but it must be documented in the outcome.

Do not design a general input queue or steering model solely for this spike.

---

## Structured provider events

Codex App Server emits structured lifecycle and item events rather than a terminal byte stream. These include thread and turn lifecycle notifications, agent-message deltas, command/tool activity, file changes, and other provider-specific events.

This is a primary architectural pressure point for Spike 005.

### Agent text

For this spike, textual agent output may be projected onto the existing Harness string-output channel.

For example:

```text
Codex agent message delta
        |
        v
Harness string output
        |
        v
existing browser display
```

This allows the existing minimal browser to display real Codex responses without requiring a new client protocol first.

### Other structured events

Harness must **not** blindly serialize every structured Codex event into strings and pretend the existing data model is universally sufficient.

Events such as:

- tool/command activity;
- file changes;
- approval requests;
- turn lifecycle;
- provider metadata;
- usage metadata;
- structured errors; and
- other non-message items

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

Codex App Server supports interruption of an active turn. A successfully interrupted turn ends with an interrupted status.

For Spike 005, explicitly stopping a Codex-backed Harness session must behave as follows.

### No active turn

If no Codex turn is active:

1. finalize/close the Codex backend;
2. terminate or release backend-owned App Server infrastructure as required;
3. remove the Harness session;
4. close an attached browser connection as required by the established lifecycle;
5. release the singleton slot; and
6. return `204`.

### Active turn

If a Codex turn is active:

1. the backend should request interruption of that active turn;
2. the backend must then finalize its App Server resources;
3. the Harness session is removed;
4. the singleton slot is released; and
5. `DELETE /sessions/:id` may return `204`.

The backend may use provider-specific bounded cleanup/fallback appropriate to its locally owned App Server process so that the Spike 004 finite-finalization contract remains true.

Do not introduce a generic remote-provider stop-failure state machine in this spike.

---

## Stopping Harness does not delete provider history

Stopping a Harness session must **not** deliberately delete the associated persisted Codex thread.

Codex App Server distinguishes between operating on a thread and permanently deleting stored thread history.

For Spike 005:

> Ending Harness supervision and deleting provider conversation history are different operations.

`DELETE /sessions/:id` ends the Harness session and its active backend supervision.

It does not call the provider's permanent thread-delete operation merely because Harness is stopping.

The Codex thread ID does not need to be exposed or retained by Harness after the Harness session ends.

Resuming that old thread through a future Harness session is explicitly deferred.

---

## Backend-initiated termination

A completed Codex **turn** is not backend termination.

Backend-initiated Harness-session termination should instead correspond to loss or termination of the provider-control backend itself, such as:

- App Server process exit;
- App Server transport closure that makes the backend unusable; or
- another fatal backend condition from which the current backend cannot continue.

When the Codex backend terminates independently:

- the Harness session must end according to the Spike 004 lifecycle;
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
- display textual Codex agent output;
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

Codex App Server supports provider-native approval and sandbox semantics.

Harness does not implement approval interaction in Spike 005.

The real smoke workload should therefore use a deliberately restricted configuration that does not require Harness to answer interactive approval requests.

Prefer a disposable/read-only verification workspace for the live smoke where practical.

The spike must not weaken host security merely to avoid implementing approvals.

If approval events are nevertheless encountered, they should be recorded as evidence for the outcome rather than papered over as ordinary text output.

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

There must be a normal programmatic seam through which evaluator tests can substitute the real App Server endpoint/process with a deterministic protocol peer or equivalent controlled test double.

The exact implementation is not prescribed.

Possible approaches include:

- configurable App Server executable/process construction;
- injected transport creation;
- injected protocol-client construction; or
- another narrow provider-specific seam.

The evaluator must not need to monkey-patch module internals.

The fake/protocol peer should exercise the **actual asynchronous transport/framing path used by the Codex backend**, not merely call backend callbacks directly.

This requirement follows directly from the evaluator defects discovered in Spikes 003 and 004: helper correctness in isolation is insufficient evidence when the production path contains asynchronous transport behaviour.

---

## Deterministic automated verification

The majority of mandatory evaluation must not depend on model wording, network latency, account quotas, or stochastic model behaviour.

Using a deterministic App Server protocol peer/test double, automated verification should cover at least:

### Startup

1. App Server transport is established.
2. Required initialization occurs before thread operations.
3. A Codex thread is created.
4. Harness does not return `201` until backend/thread startup succeeds.
5. The Harness UUID remains independent from the provider thread ID.
6. Failed App Server startup/thread creation cleans up and releases the singleton slot.

### Turns

7. User text starts a Codex turn on the current provider thread.
8. Agent-message text/deltas reach the attached browser through Harness.
9. Turn completion does not end the Harness session.
10. A second sequential user instruction starts another turn on the **same Codex thread**.
11. Completion of that second turn still does not end the Harness session.

### Structured events

12. Non-text provider events do not need to be rendered as terminal output merely to satisfy the existing string channel.
13. Provider request IDs, item IDs, turn IDs, and thread IDs do not replace Harness identity.
14. Unexpected but valid non-text events do not corrupt the Harness session lifecycle.

### Detachment

15. Browser detachment does not end the Codex backend.
16. An active turn may continue while the browser is detached.
17. The browser can reattach while the Harness session remains active.
18. Replay of events missed while detached is not required.

### Stop

19. Deleting an idle Codex-backed Harness session finalizes backend resources before `204`.
20. Deleting a session with an active turn requests provider interruption before final backend teardown.
21. Harness stop does not deliberately invoke permanent Codex thread deletion.
22. Competing provider-exit and Harness-stop paths do not produce duplicate or conflicting finalization.

### Backend failure

23. App Server/backend termination ends the Harness session.
24. Attached clients are closed appropriately.
25. The stale session becomes unavailable through `GET /sessions/:id`.
26. A replacement Harness session can subsequently be created and attached.

### Regression

27. Existing PTY-backed behaviour remains materially intact.
28. The Codex integration does not move App Server/provider-specific concepts into PTY handling or generic Harness identity.

The evaluator may add further cases derived from the frozen contract.

---

## Live Codex smoke verification

In addition to deterministic automated evaluation, Spike 005 must be exercised against the locally installed, authenticated **real Codex App Server**.

This live verification exists to prove that the integration is not merely compatible with its own fake.

The live smoke should demonstrate at least:

1. launch Harness with the Codex backend through the normal runtime path;
2. create a Harness session;
3. successfully initialize the real App Server;
4. create a real Codex thread;
5. attach the browser;
6. submit a first textual instruction;
7. receive real Codex agent text through Harness;
8. allow the first turn to complete without ending the Harness session;
9. submit a second sequential instruction;
10. execute that second turn against the same Codex thread;
11. receive agent text again;
12. detach/reattach without destroying the Harness session; and
13. stop the Harness session successfully.

The smoke test must not assert exact model wording.

Its evidence is provider/lifecycle behaviour, not semantic model determinism.

A small second-turn instruction that naturally depends on the established thread context is desirable during manual verification, but exact answer content must not become a frozen evaluator oracle.

### Live-service availability

The deterministic evaluation remains responsible for exhaustive contract verification.

If the independent evaluator cannot access valid Codex authentication or the external OpenAI service, that absence must not be misclassified as an implementation defect.

However, the spike should not be declared a meaningful real-provider proof without a successful live smoke being performed and recorded somewhere in the implementation/evaluation/outcome workflow.

The final outcome must state clearly:

- whether live Codex verification was performed;
- under what environment;
- whether it passed;
- and whether any portions of the result relied only on deterministic protocol simulation.

---

## Evaluation discipline

Because this integration crosses asynchronous process/protocol boundaries, evaluator preparation must validate its test oracles across the real transport path.

In particular:

- writing to a transport is not automatically evidence that downstream processing has completed;
- receiving one protocol message is not automatically evidence that all causally related events have arrived;
- test fakes must preserve relevant asynchronous ordering;
- assertions against provider-side state must synchronize on contract-valid observable events; and
- helper self-tests should include at least one end-to-end check through the same transport path used by the production Codex backend.

Do not repeat the Spike 004 error of treating transport send as a delivery barrier.

---

## Existing HTTP and WebSocket contracts

The existing Harness lifecycle endpoints should remain substantially intact:

```text
POST   /sessions
GET    /sessions/:id
DELETE /sessions/:id
WS     /sessions/:id/ws
```

The browser WebSocket may continue carrying the current simple textual input/output representation for this spike.

No new general provider API is required.

If real Codex semantics make a small externally observable contract change unavoidable, document the reason and keep it as narrow as possible.

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
- General concurrent user input during an active turn.
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
2. A Harness session remains a distinct domain entity with its own UUID.
3. The Codex backend creates and owns a distinct provider thread ID.
4. Harness session creation waits for successful Codex backend/thread startup.
5. Real Codex agent text can reach the existing Harness client path.
6. A completed Codex turn does not end the Harness session.
7. At least two sequential turns can occur on the same Codex thread within one Harness session.
8. Client detachment does not terminate the Codex session/backend.
9. Harness can stop an active Codex-backed session and interrupt active work as required before finalization.
10. Stopping Harness does not deliberately delete the persisted Codex thread.
11. Fatal App Server/backend termination correctly ends the Harness session and releases the singleton slot.
12. Provider IDs and App Server process mechanics do not leak into Harness session identity.
13. Deterministic evaluator tests can exercise the Codex backend through a real asynchronous protocol seam without requiring a live model.
14. A live smoke against the real installed/authenticated Codex App Server succeeds and is recorded.
15. Existing PTY-backed behaviour remains materially intact.
16. The implementation does not introduce a speculative universal provider framework.
17. The outcome explicitly identifies which parts of the Spike 004 backend abstraction survived, which changed, and why.
18. The outcome provides concrete evidence for choosing the next spike rather than assuming multi-session remains next.

---

## Failure signals

The spike should be considered unsuccessful or architecturally suspect if:

- Codex is controlled by terminal emulation rather than through App Server;
- a Codex turn is treated as synonymous with a Harness session;
- turn completion destroys the Harness session;
- every user instruction creates a new Codex thread without a concrete reason;
- the Harness UUID is replaced by or derived from the Codex thread ID;
- Codex/App Server request IDs become Harness identity;
- the implementation stringifies all structured provider events merely to preserve the existing backend interface;
- PTY code acquires Codex-specific behaviour;
- generic Harness session management becomes littered with App Server protocol details;
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
5. **Does `input` remain a useful Harness concept, or is an instruction/turn concept emerging?**
6. **Does `output` remain useful beyond agent text?**
7. **How was Codex's structured event stream handled without prematurely inventing a universal event model?**
8. **Which structured Codex events appear likely to require first-class Harness representation next?**
9. **How does one Harness session map to the Codex thread and its turns?**
10. **What does Harness `stop` mean for an active Codex turn?**
11. **What provider state survives after the Harness session ends?**
12. **What happens when the browser is detached while Codex continues working?**
13. **How weak is the current no-replay behaviour in actual human use?**
14. **Did approval/tool/file-change events create immediate architectural pressure even though they were not implemented?**
15. **How much provider-specific behaviour remained correctly contained inside `CodexBackend`?**
16. **Was a real Codex smoke successfully performed, distinct from deterministic simulated evaluation?**
17. **Did the live provider expose behaviour that the deterministic fake failed to model?**
18. **What should Spike 006 address based on evidence from this integration?**

Do not assume in advance that Spike 006 must be multi-session.

If Spike 005 demonstrates that structured events, approval requests, state resynchronization, or another provider-native concern is a more fundamental blocker, the next spike should follow that evidence.

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

Before final frozen verification begins, the implementation under evaluation should have an immutable recorded identity, preferably a clean implementation commit.

After successful evaluation:

1. promoted evaluator artifacts should be committed separately; and
2. the final outcome should be written and committed separately.

The final outcome should distinguish:

- evaluated implementation commit;
- evaluation artifact commit; and
- outcome commit.

If unavoidable uncommitted changes are evaluated, the evaluator must record sufficient immutable patch provenance rather than silently treating the working tree as reproducible.

This is a workflow requirement carried forward from the provenance weakness identified in Spike 004.