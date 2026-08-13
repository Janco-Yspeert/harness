# Spike 004 — Session Backend Abstraction

## Goal

Prove that a Harness session can be treated as a logical product entity whose
lifecycle is independent of the mechanism used to control its underlying
execution environment.

The current implementation uses a PTY-backed Bash process. PTY support should
remain a valid backend and useful fallback mechanism, but Harness core should
not depend on PTY-specific behaviour or concepts.

This spike should introduce and validate a boundary between:

- Harness session lifecycle and transport behaviour; and
- the backend that actually performs the work.

The spike is successful if the existing PTY-backed behaviour can operate through
that boundary and Harness can also manage a deliberately non-PTY backend through
the same core lifecycle.

---

## Primary question

> Can Harness separate its logical session model from the mechanism used to
> control the underlying execution or agent session?

A successful result should provide evidence that a future backend could
represent something fundamentally different from a local terminal—for example, a
Codex session, Claude integration, remote-control service, or API-backed
agent—without requiring Harness core to be redesigned around that backend.

The spike does **not** need to prove compatibility with any specific external AI
provider.

---

## Context

Spike 003 established the current Harness session lifecycle:

- `POST /sessions` creates the active session and returns `201` with `{ id }`.
- `DELETE /sessions/:id` stops that session and returns `204`.
- WebSocket attachment occurs at `/sessions/:id/ws`.
- Unknown or stale session IDs return `404`.
- Only one Harness session may exist at a time.
- Concurrent creation attempts result in one successful creation and `409`
  responses for the others.
- Only one client may be attached to a session at a time.
- A second attachment attempt receives `409` without disturbing the existing
  client.
- Disconnecting the WebSocket detaches the client but does not terminate the
  session.
- Explicit deletion terminates the session and closes an attached WebSocket.
- When the backing Bash process exits, the Harness session is removed and any
  attached client is closed.
- Session IDs are UUIDs and are not reused during the host lifetime.
- `host.close()` and process shutdown perform session cleanup.

These behaviours should remain the observable baseline unless a change is
required to establish the backend boundary.

The current implementation should be considered evidence from the previous
spike, not a specification of the internal architecture.

### Manual-testing observation

Manual browser testing after Spike 003 exposed a lifecycle problem:

> After exiting the Bash session, the web application cannot successfully
> proceed to a newly created and attached session.

It is not yet established whether the defect is in host-side session cleanup,
singleton-slot release, browser-side stale state, or the interaction between
those layers.

Spike 004 must preserve the intended invariant that backend-initiated
termination fully ends the current Harness session and allows a subsequent
session to be created and attached successfully.

The implementation should fix the behaviour if necessary as part of preserving
that invariant, without expanding the spike into a broader web-client redesign.

---

## Desired conceptual boundary

Harness should move toward a structure conceptually resembling:

```text
Harness session
      |
      v
Session backend boundary
      |
      +-- PTY backend
      |
      +-- future Codex backend
      |
      +-- future Claude backend
      |
      +-- future remote/API backend
```

The exact interface, classes, method names, event representation, and internal
structure are **not prescribed by this brief**.

Part of the purpose of the spike is to discover the smallest useful abstraction.

The implementation should therefore avoid designing an elaborate general-purpose
plugin system or attempting to predict every capability future AI providers may
expose.

---

## Harness session lifecycle

A Harness session remains the domain-level entity managed by the host.

Its lifecycle must not depend on the backend being:

- a local process;
- a shell;
- a PTY;
- a subprocess spawned by Harness; or
- something whose identity or lifetime can be represented by a process ID.

The backend supplies the execution mechanism beneath that logical session.

Harness remains responsible for the externally observable session lifecycle.

---

## Backend startup semantics

Backend startup may be synchronous or asynchronous.

The exact implementation is not prescribed.

However, the externally observable lifecycle is defined as follows:

### Session creation

When `POST /sessions` begins creating a session:

1. The single-session slot becomes reserved for that creation attempt.
2. Other concurrent creation attempts must not start another backend.
3. Concurrent `POST /sessions` requests while startup is in progress must
   receive `409`.
4. Harness starts the selected backend.
5. `201` may only be returned once the backend has successfully started and is
   usable.
6. Only then is the newly created Harness session considered successfully
   established.

Therefore:

> `201 Created` means that the backing session has successfully started and the
> Harness session is usable.

The implementation must not return `201` while backend startup is still
unresolved.

### Startup failure

If backend startup fails:

- no active Harness session may remain;
- any resources acquired during the failed startup attempt must be released;
- the reserved singleton slot must become available again; and
- a later session creation attempt must be able to proceed normally.

Backend startup must be failure-safe. If startup fails after acquiring
backend-specific resources, the backend is responsible for releasing those
resources before the startup operation reports failure. Harness is responsible
for releasing Harness-level creation state, including the reserved singleton
slot.

The normal backend finalization invariant applies only after startup has
completed successfully.

The exact HTTP status returned for backend startup failure is not prescribed by
this spike and should not be treated as part of the evaluator contract unless
required by existing application behaviour.

The implementation must not leave the host permanently occupied by a failed or
partially created session.

---

## Required backend capabilities

The backend boundary must support the capabilities required by the existing
Harness session lifecycle.

At minimum, Harness core needs some mechanism by which it can:

- start or establish the backing session;
- provide client input to it;
- receive backend-produced output;
- detect that the backing session has ended independently;
- explicitly stop the backing session; and
- ensure backend resources are finalized when the Harness session ends.

These are lifecycle and capability requirements rather than required interface
methods.

The implementation may discover that some capabilities belong elsewhere or
should be represented differently.

---

## Data-plane scope

For Spike 004, the backend data plane may remain deliberately simple.

The implemented backend boundary may use:

- string input; and
- string output.

This is acceptable evidence for the purpose of this spike.

The existing browser WebSocket protocol may therefore remain based on messages
equivalent to:

```text
input: string
output: string
```

The spike does **not** require a generic structured event model for AI
providers.

A future Codex, Claude, or API-backed session may expose structured events,
approval requests, tool calls, status transitions, metadata, or other semantics
that cannot be represented cleanly as terminal-like strings.

Those possibilities are an **architectural pressure test**, not a requirement
for the current backend boundary.

The outcome should identify the string-based data plane as a limitation if it
appears likely to require revision when the first genuinely structured backend
is introduced.

Do not introduce a universal provider-event model merely to make the abstraction
appear more future-proof.

---

## PTY backend

The existing Bash/PTY implementation must be moved behind the new backend
boundary.

Existing externally observable session behaviour should remain substantially
unchanged.

Harness code outside the PTY backend should not need knowledge of PTY-specific
implementation details such as:

- Bash process creation;
- process IDs;
- PTY handles or file descriptors;
- Unix process signalling;
- shell process termination as a special lifecycle case; or
- other local-process-specific control mechanics.

Some terminal concepts may still legitimately exist at protocol or client
boundaries where Harness intentionally exposes terminal functionality.

For example, terminal dimensions or terminal-oriented display behaviour need not
be artificially forced into a generic backend abstraction if they are not
relevant to logical session management.

The important distinction is that:

> Harness session ownership and lifecycle must not depend on a session
> necessarily being a terminal process.

---

## Non-PTY backend proof

The spike must include a second backend implementation used for automated
verification.

This backend must **not** create:

- a PTY;
- shell;
- subprocess;
- child process; or
- equivalent local execution process.

A simple in-memory or fake backend is sufficient.

It should be capable of exercising the relevant Harness lifecycle, including:

- successful startup;
- receiving input;
- producing output;
- explicit termination;
- backend-initiated termination; and
- finalization.

The purpose of this backend is not to simulate Codex or Claude accurately.

Its purpose is to prove that Harness core can operate a session whose lifecycle
is not derived from a local terminal process.

Tests that only instantiate an isolated backend implementation are not
sufficient by themselves.

Verification must exercise the real Harness session-management path far enough
to demonstrate that the logical session lifecycle is genuinely
backend-independent.

---

## Backend construction and verification seam

Harness must expose a normal programmatic construction seam through which tests
can provide a backend implementation or backend factory.

The exact TypeScript shape is intentionally unspecified.

Reasonable approaches may include:

- constructor injection;
- a backend factory parameter;
- dependency injection;
- configuration supplied when constructing the host; or
- another minimal explicit mechanism.

The seam must allow evaluator-owned test backends to participate in the same
lifecycle as the production PTY backend.

Verification must not require:

- monkey-patching module internals;
- replacing imports through test-only hacks;
- mutating private module state; or
- bypassing the normal Harness host/session lifecycle.

The backend contract itself need not necessarily be exported as a public
production API, and the repository's fake backend need not necessarily become
production code.

Do not build a general backend registry, provider-discovery mechanism, dynamic
plugin loader, or user-facing backend-selection system unless the spike
demonstrates that such machinery is genuinely necessary.

---

## Session identity

A Harness session remains the externally visible entity identified by the
session UUID.

The backend may have:

- its own identifier;
- multiple internal identifiers; or
- no meaningful identifier at all.

Harness must not require its own session ID to be synonymous with:

- a process ID;
- PTY identifier;
- provider session ID;
- thread ID;
- remote-control ID; or
- any other backend-specific identifier.

If the implementation introduces a distinction between Harness session identity
and backend identity, that distinction should remain internal for this spike.

---

## Backend termination and finalization

Harness must distinguish between:

1. Harness explicitly stopping a session; and
2. the backend independently reporting that it has ended.

Both must ultimately result in:

- backend resources being finalized;
- the Harness session becoming stale/unavailable;
- any attached client being closed where required by the established lifecycle;
  and
- the singleton session slot becoming available again.

### Finalization invariant

Every backend that has successfully started must be finalized exactly once.

"Exactly once" here describes the observable lifecycle responsibility, not
necessarily a requirement that a particular method be called exactly one time
internally.

The implementation may use idempotent operations or internal guards if useful.

The required invariant is:

> A successfully started backend cannot be abandoned without finalization, and
> competing lifecycle paths must not perform conflicting cleanup.

### Harness-initiated stop

When Harness explicitly stops a session:

1. Harness initiates backend termination.
2. Backend termination and required finalization complete.
3. The Harness session is removed.
4. The singleton session slot is released.
5. `DELETE /sessions/:id` may then return `204`.

Therefore:

> `204 No Content` means that the backend has stopped and the session's required
> finalization has completed.

### Backend-initiated termination

When the backend independently terminates:

1. Harness observes the termination.
2. Harness performs any remaining required finalization.
3. Harness removes the logical session.
4. Any attached client is closed.
5. The singleton slot is released.

Harness must not respond to backend-initiated termination by redundantly
initiating another stop operation against an already-ended backend unless the
backend contract explicitly makes such behaviour safe and necessary.

### Termination races

Lifecycle handling must remain deterministic and safe when events occur close
together, including cases such as:

```text
Harness initiates stop
→ backend reports termination
→ cleanup/finalization completes
```

or:

```text
backend reports termination
→ client concurrently requests DELETE
```

The implementation must avoid duplicate teardown, uncaught errors, stale
sessions, leaked slots, or other inconsistent lifecycle states.

The exact internal state machine is not prescribed.

---

## Stop/finalization failure scope

Spike 004 does **not** attempt to design generic failure semantics for a backend
that:

- refuses to stop;
- hangs indefinitely;
- loses remote connectivity;
- rejects cancellation;
- cannot confirm termination; or
- fails during finalization.

All backend implementations used to satisfy this spike must support successful,
finite stop and finalization behaviour.

The PTY backend may retain its existing mechanisms for ensuring termination.

The fake backend should be deterministic.

Generic timeout, retry, zombie-session, partial-failure, and remote-provider
recovery semantics are deferred until a real backend demonstrates the need for
them.

This avoids introducing speculative distributed-systems lifecycle states before
the first real remote backend exists.

---

## Browser/client behaviour

The existing minimal browser client should continue to support the lifecycle
established in Spike 003:

- create session;
- attach;
- detach;
- send input;
- receive output;
- stop session.

No substantial UI redesign is required.

The browser does not need to select backend types.

For normal application use during this spike, the PTY backend may remain the
default and only user-visible backend.

The fake backend may be available exclusively through programmatic test
injection.

### Bash/backend exit recovery

The manual-testing defect described earlier must be covered.

When the active Bash process exits—or, more generally, when the active backend
terminates independently—the browser/host interaction must allow the user to
proceed to a new session.

WebSocket attachment failure or unexpected WebSocket closure does not by itself
prove that the Harness session has ended. Browser WebSocket APIs do not expose
the HTTP status of a failed upgrade reliably enough for the client to make that
distinction.

Harness must therefore provide a minimal HTTP mechanism through which the
browser can determine whether a known Harness session still exists.

For this spike:

`GET /sessions/:id`

must return:

- `200` when the Harness session currently exists; and
- `404` when the session ID is unknown or stale.

No broader session-inspection API is required.

After an unexpected WebSocket closure or failed reattachment attempt, the
browser may use this check before deciding whether to discard its stored session
ID.

If the existence check returns 404, the browser must discard the stale ID and
return to a state from which a new session can be created.

If the session still exists, or if session existence cannot be determined
because the HTTP request itself fails, the browser must retain the session ID.

Deliberate detach and ordinary connection loss must not themselves discard the
stored session ID.

At minimum, automated verification must demonstrate this sequence:

1. Create a session.
2. Attach a client.
3. Cause the backend to terminate independently.
4. Verify that the original Harness session becomes stale.
5. Create a new session successfully.
6. Attach to the new session successfully.
7. Exchange input/output with the new session successfully.

The browser-side stale-session recovery must also be verified.

Browser verification sequence:

1. Create and attach to a session.
2. Cause the backend to terminate.
3. Observe the WebSocket close.
4. Have the browser check GET /sessions/:id.
5. Receive 404.
6. Verify that the browser discards the stale session ID and returns to a state
   where session creation is available.
7. Create and attach to a new session successfully.

If WebSocket attachment fails or the socket closes unexpectedly, but GET
/sessions/:id returns 200, the browser must retain the stored session ID and
remain capable of reattachment. It must not treat connection failure alone as
evidence that the Harness session has ended.

If the repository already has a proportionate mechanism for automated
browser/client-state testing, automated coverage should verify the stale-ID
transition above.

Otherwise, explicit manual browser verification is acceptable for this spike.
Introducing substantial new browser-test infrastructure solely for this
regression is not required.

This requirement should be exercised against the PTY backend where practical
because it represents the observed browser behaviour.

Equivalent lifecycle coverage should also exist for the injected non-PTY
backend.

The fix may involve host lifecycle handling, browser state handling, or both.

No broader browser architecture work is required.

---

## Shutdown semantics

Programmatic host shutdown remains part of the generic backend lifecycle.

For any active backend:

> `host.close()` must finalize the backend and release the active Harness
> session.

The non-PTY injected backend must be verified through this programmatic
`host.close()` path.

The fake backend does **not** need to be selectable through the normal
command-line runtime solely so that SIGINT/SIGTERM integration tests can
exercise it.

Existing PTY-backed signal shutdown behaviour should remain regression-covered:

- SIGINT cleanup;
- SIGTERM cleanup.

Signal handling itself does not need to become backend-selectable as part of
this spike.

---

## Required verification

Verification should demonstrate at least the following.

### Existing PTY behaviour

The PTY-backed implementation continues to support the relevant behaviour
established in Spike 003, including:

- session creation;
- successful backend startup before `201`;
- singleton creation semantics;
- attachment;
- input and output;
- detach without session termination;
- reattachment;
- explicit session deletion;
- Bash exit removing the Harness session;
- attached-client closure after Bash exit;
- creation of a new session after Bash exit;
- successful attachment to that new session;
- cleanup through `host.close()`;
- existing SIGINT/SIGTERM cleanup behaviour;
- browser recovery from a stale session ID after Bash exit, either through
  automated client-state coverage or explicit manual verification as defined
  above;
- browser stale-session recovery using the HTTP session-existence check,
  including both the 404 stale-session case and the 200 still-existing-session
  case.

Existing tests may be reused or adjusted where appropriate.

### Startup behaviour

Verification must demonstrate that:

1. `201` is not returned before backend startup succeeds.
2. The singleton slot is reserved while backend startup is in progress.
3. Concurrent creation attempts during startup receive `409`.
4. Failed backend startup does not leave an active Harness session.
5. Failed backend startup releases any reserved singleton slot.
6. A later creation attempt can succeed after startup failure.

The exact HTTP error status for the failed startup request does not need to be
asserted unless another established contract requires it.

### Backend independence

Using the non-PTY backend:

1. A Harness session can be created successfully.
2. Backend startup completes before `201`.
3. Input from the attached client reaches the backend.
4. Backend-produced string output reaches the attached client.
5. Client detachment does not terminate the backend session.
6. The client can reattach to the same Harness session while it remains alive.
7. Explicit deletion stops and finalizes the backend.
8. `204` is returned only after required backend finalization completes.
9. Backend-initiated termination removes the Harness session.
10. Backend-initiated termination closes an attached client.
11. Backend-initiated termination releases the singleton slot.
12. A new session can be created after backend-initiated termination.
13. A client can attach successfully to that new session.
14. `host.close()` finalizes the backend.
15. Session-management code does not require a PTY, shell, process ID, or local
    process for the above lifecycle to function.

### Finalization/race behaviour

Verification should exercise enough competing lifecycle paths to demonstrate
that termination is safe and deterministic.

At minimum, the evaluator should be able to establish that:

- finalization is not observably duplicated;
- explicit stop followed by backend termination notification does not cause an
  error or stale state;
- backend termination followed closely by an explicit delete does not corrupt
  session state; and
- the singleton slot is eventually released exactly as required by the
  lifecycle.

The evaluator may use additional tests to verify that PTY-specific assumptions
have not leaked into the generic session-management layer.

---

## Architectural pressure test

The implementation and outcome should specifically examine whether the resulting
abstraction could plausibly support a backend with characteristics such as:

- the backing agent already exists remotely rather than being spawned by
  Harness;
- backend startup involves an asynchronous API request;
- input is sent through an API rather than stdin;
- output arrives asynchronously from a remote service;
- the backend has its own provider-specific session identifier;
- backend termination may be reported remotely rather than through local process
  exit; and
- stopping the Harness session may mean disconnecting, cancelling, terminating,
  or releasing a remote resource rather than killing a process.

The spike does not need to implement these behaviours.

Structured provider events are explicitly outside the implemented data-plane
scope for this spike.

If supporting any of these possibilities would require substantial speculation
or a much broader abstraction, prefer the narrower abstraction and record the
limitation.

---

## Design constraint: avoid false universality

Do not attempt to create a universal AI-agent interface in this spike.

PTY sessions, Codex sessions, Claude sessions, remote-control sessions, and
future agent APIs may have materially different capabilities.

The goal is to separate the **common Harness lifecycle** from backend-specific
execution mechanics, not to force all future providers into an artificially
identical feature model.

Provider-specific capabilities may remain outside the abstraction until a future
spike demonstrates a concrete need for them.

Likewise, the current string-based input/output contract should not be mistaken
for a claim that all future backends naturally expose string streams.

---

## Non-goals

- Multiple simultaneous Harness sessions.
- User-selectable backend types.
- Real Codex integration.
- Real Claude integration.
- Codex Remote Control integration.
- Generic AI-agent provider abstractions.
- Structured provider-event modelling.
- Backend capability negotiation.
- Backend plugin discovery or dynamic loading.
- Daemon-restart persistence.
- Restoring remote sessions after Harness restarts.
- Terminal output replay or history.
- Semantic parsing of terminal output.
- Structured AI-agent state such as `working`, `waiting`, `needs_approval`, or
  `complete`.
- Approval workflows.
- Task orchestration.
- Multi-agent coordination.
- Worktrees.
- Authentication.
- Public-network exposure.
- Android client work.
- PTY descendant/background-process ownership and cleanup.
- General-purpose Linux process supervision.
- Generic backend stop-failure semantics.
- Retry policies for remote backends.
- Zombie or degraded session states.
- Remote-connectivity recovery.
- Exit-status retention.
- Guaranteeing that every future backend can satisfy the same lifecycle
  semantics.

---

## Success criteria

The spike is successful if:

1. Harness's logical session lifecycle is no longer inherently coupled to the
   PTY implementation.
2. The existing PTY-backed session works through the introduced backend boundary
   without materially regressing Spike 003 behaviour.
3. A non-PTY, non-process backend can participate in the same Harness session
   lifecycle through that boundary.
4. `201` represents a successfully started and usable backend.
5. Concurrent creation while backend startup is in progress preserves the
   singleton invariant.
6. Failed backend startup cleans up and releases the singleton slot.
7. Core session management handles both Harness-initiated and backend-initiated
   termination deterministically.
8. Every successfully started backend is finalized as part of ending its Harness
   session.
9. `204` represents completed backend termination and required finalization.
10. Backend-specific identity and implementation details do not become the
    identity of the Harness session.
11. An explicit programmatic seam exists through which independent tests can
    provide a backend implementation or factory.
12. The generic lifecycle works without requiring a PTY, shell, process ID, or
    local process.
13. Backend-initiated termination releases the current session such that a new
    session can be created and attached.
14. The observed browser failure after Bash exit is resolved sufficiently for
    the user to create, attach to, and use a subsequent session.
15. The resulting design remains deliberately small and does not attempt to
    predict the full interface of future AI providers.
16. The outcome provides enough evidence to judge whether the abstraction is a
    reasonable foundation for a future genuinely different backend.

---

## Failure signals

The spike should be considered unsuccessful or architecturally suspect if any of
the following are required:

- generic session-management code needs to inspect or manipulate
  PTY/process-specific lifecycle state;
- the fake backend requires terminal or process concepts merely to fit the
  abstraction;
- backend termination semantics are inseparable from Bash/process exit;
- the Harness session ID must double as a backend-specific identifier;
- `201` can be returned before backend startup succeeds;
- failed startup can leave the singleton slot occupied;
- backend termination can leave Harness unable to create a subsequent session;
- finalization ownership is ambiguous enough to permit resource abandonment or
  conflicting duplicate cleanup;
- the evaluator must monkey-patch internals or bypass normal Harness
  construction to supply a fake backend;
- substantial provider-specific behaviour must be added to the supposedly
  generic session layer;
- structured provider events must be invented merely to satisfy the abstraction;
- the abstraction becomes significantly larger or more complex than the current
  lifecycle requires;
- existing externally observable behaviour regresses without demonstrating a
  necessary architectural trade-off; or
- the second backend can only be tested by bypassing the real Harness session
  lifecycle.

A failed spike is still useful if it demonstrates that the proposed common
boundary is premature or incorrectly located.

---

## Outcome questions

The spike outcome should answer:

1. **Where is the backend boundary now located?**
2. **What is the minimum contract between Harness session management and a
   backend?**
3. **Which concepts remain genuinely common across PTY and non-PTY sessions?**
4. **Which concepts were discovered to be PTY-specific and moved out of Harness
   core?**
5. **Did any apparently generic concepts turn out to be terminal assumptions in
   disguise?**
6. **How is asynchronous backend startup represented, and when does a Harness
   session become active?**
7. **How are Harness-initiated termination and backend-initiated termination
   reconciled?**
8. **Where does finalization responsibility live, and how is conflicting or
   duplicate teardown prevented?**
9. **Did the implementation resolve the inability to create and attach to a new
   session after Bash/backend exit?**
10. **Does the abstraction plausibly accommodate a remotely hosted agent session
    that Harness did not create as a local process?**
11. **What limitations arise from retaining a string-based input/output data
    plane?**
12. **What would likely need to change when implementing the first real non-PTY
    backend, particularly one exposing structured events?**
13. **Did the spike expose any reason that multi-session supervision should not
    be attempted next?**

Treat a successful result from this spike as evidence about this spike.

Do not generalize the backend abstraction as broadly validated across AI
providers until it has been exercised against at least one genuinely different
real backend.
