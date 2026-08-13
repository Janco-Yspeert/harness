# Spike 004 — Session Backend Abstraction

## Goal

Prove that a Harness session can be treated as a logical product entity whose lifecycle is independent of the mechanism used to control its underlying execution environment.

The current implementation uses a PTY-backed Bash process. PTY support should remain a valid backend and useful fallback mechanism, but Harness core should not depend on PTY-specific behaviour or concepts.

This spike should introduce and validate a boundary between:

- Harness session lifecycle and transport behaviour; and
- the backend that actually performs the work.

The spike is successful if the existing PTY-backed behaviour can operate through that boundary and Harness can also manage a deliberately non-PTY backend through the same core lifecycle.

---

## Primary question

> Can Harness separate its logical session model from the mechanism used to control the underlying execution or agent session?

A successful result should provide evidence that a future backend could represent something fundamentally different from a local terminal—for example, a Codex session, Claude integration, remote-control service, or API-backed agent—without requiring Harness core to be redesigned around that backend.

The spike does **not** need to prove compatibility with any specific external AI provider.

---

## Context

Spike 003 established the current Harness session lifecycle:

- `POST /sessions` creates the active session and returns `201` with `{ id }`.
- `DELETE /sessions/:id` stops that session and returns `204`.
- WebSocket attachment occurs at `/sessions/:id/ws`.
- Unknown or stale session IDs return `404`.
- Only one Harness session may exist at a time.
- Concurrent creation attempts result in one successful creation and `409` responses for the others.
- Only one client may be attached to a session at a time.
- A second attachment attempt receives `409` without disturbing the existing client.
- Disconnecting the WebSocket detaches the client but does not terminate the session.
- Explicit deletion terminates the session and closes an attached WebSocket.
- When the backing Bash process exits, the Harness session is removed and any attached client is closed.
- Session IDs are UUIDs and are not reused during the host lifetime.
- `host.close()` and process shutdown perform session cleanup.

These behaviours should remain the observable baseline unless a change is required to establish the backend boundary.

The current implementation should be considered evidence from the previous spike, not a specification of the internal architecture.

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

The exact interface, classes, method names, event representation, and internal structure are **not prescribed by this brief**.

Part of the purpose of the spike is to discover the smallest useful abstraction.

The implementation should therefore avoid designing an elaborate general-purpose plugin system or attempting to predict every capability future AI providers may expose.

---

## Required backend capabilities

The backend boundary must support the capabilities required by the existing Harness session lifecycle.

At minimum, Harness core needs some mechanism by which it can:

- establish or start the backing session;
- provide client input to it;
- receive output or equivalent backend-produced data;
- detect that the backing session has ended;
- explicitly stop the backing session; and
- release backend resources when the Harness session ends.

These are capability requirements rather than required interface methods.

The implementation may discover that some capabilities belong elsewhere or should be expressed differently.

---

## PTY backend

The existing Bash/PTY implementation must be moved behind the new backend boundary.

Existing externally observable session behaviour should remain substantially unchanged.

Harness code outside the PTY backend should not need knowledge of PTY-specific implementation details such as:

- Bash;
- process IDs;
- PTY file descriptors;
- process signalling;
- terminal dimensions;
- shell exit behaviour as a special case; or
- other Unix-terminal-specific lifecycle details.

Some terminal concepts may still legitimately exist at protocol or client boundaries where Harness intentionally exposes terminal functionality. The purpose of this spike is not to pretend terminals do not exist.

The important distinction is that **Harness session ownership and lifecycle must not depend on a session necessarily being a terminal process**.

---

## Non-PTY backend proof

The spike must include a second backend implementation used for automated verification.

This backend must **not** create a PTY, shell, subprocess, or equivalent local execution process.

A simple in-memory or fake backend is sufficient.

It should be capable of exercising the relevant Harness lifecycle, including:

- creation/start;
- receiving input;
- producing output or backend events;
- explicit termination;
- spontaneous/backend-initiated termination; and
- cleanup.

The purpose of this backend is not to simulate Codex or Claude accurately.

Its purpose is to prove that Harness core can operate a session whose lifecycle is not derived from a local terminal process.

Tests that directly instantiate isolated backend classes are not sufficient by themselves. Verification must exercise enough of the Harness session-management path to demonstrate that the core lifecycle is genuinely backend-independent.

---

## Session identity

A Harness session remains the externally visible entity identified by the session UUID.

The backend may have its own identity or no identity at all.

Harness must not require its own session ID to be synonymous with:

- a process ID;
- PTY identifier;
- provider session ID;
- thread ID;
- remote-control ID; or
- any other backend-specific identifier.

If the implementation introduces a distinction between Harness session identity and backend identity, that distinction should remain internal for this spike.

---

## Backend termination

Harness must distinguish between:

1. Harness explicitly stopping a session; and
2. the backend independently reporting that it has ended.

Both must result in the Harness session becoming stale/unavailable according to the lifecycle already established in Spike 003.

The implementation must avoid lifecycle loops such as:

```text
Harness stops backend
→ backend reports exit
→ Harness attempts to stop backend again
→ duplicate cleanup / error
```

Cleanup and lifecycle transitions should remain deterministic and safe if backend termination and Harness termination occur close together.

No requirement is made for retaining exit status or termination reason after the session has been removed.

---

## Browser/client behaviour

The existing minimal browser client should continue to support the lifecycle established in Spike 003:

- create session;
- attach;
- detach;
- send input;
- receive output;
- stop session.

No substantial UI redesign is required.

The browser does not need to select backend types.

For normal application use during this spike, the PTY backend may remain the default and only user-visible backend.

The fake backend may be available exclusively through tests or dependency injection.

---

## Backend selection and construction

The implementation needs a way to construct a Harness session with a particular backend implementation so that automated tests can exercise both the PTY backend and the non-PTY backend.

The mechanism is intentionally unspecified.

Possible approaches include dependency injection, a factory, constructor injection, configuration, or another minimal mechanism appropriate to the current codebase.

Do not build a general backend registry, provider discovery mechanism, plugin loader, or user-facing backend selection system unless the spike demonstrates that such machinery is genuinely necessary.

---

## Required verification

Automated verification should demonstrate at least the following.

### Existing PTY behaviour

The PTY-backed implementation continues to support the relevant behaviour established in Spike 003, including:

- session creation;
- attachment;
- input and output;
- detach without session termination;
- explicit session deletion;
- backend/shell exit removing the Harness session; and
- cleanup during host shutdown.

Existing tests may be reused or adjusted where appropriate.

### Backend independence

Using the non-PTY backend:

1. A Harness session can be created successfully.
2. Input from the attached client reaches the backend.
3. Backend-produced output reaches the attached client.
4. Client detachment does not terminate the backend session.
5. The client can reattach to the same Harness session while it remains alive.
6. Explicit deletion stops the backend and removes the Harness session.
7. Backend-initiated termination removes the Harness session and closes an attached client.
8. Host shutdown cleans up the backend.
9. Session-management code does not require a PTY, shell, or OS process for the above lifecycle to function.

The evaluator may use additional tests to verify that PTY-specific assumptions have not leaked into the generic session-management layer.

---

## Architectural pressure test

The implementation and outcome should specifically examine whether the resulting abstraction could plausibly support a backend with characteristics such as:

- the backing agent already exists remotely rather than being spawned by Harness;
- input is sent through an API rather than stdin;
- output arrives as structured or asynchronous events rather than terminal bytes;
- the backend has its own provider-specific session identifier;
- backend termination may be reported remotely rather than through local process exit; and
- stopping the Harness session may mean disconnecting, cancelling, terminating, or releasing a remote resource rather than killing a process.

The spike does not need to implement these behaviours.

If supporting these possibilities would require substantial speculation or a much broader abstraction, prefer the narrower abstraction and record the limitation.

---

## Design constraint: avoid false universality

Do not attempt to create a universal AI-agent interface in this spike.

PTY sessions, Codex sessions, Claude sessions, remote-control sessions, and future agent APIs may have materially different capabilities.

The goal is to separate the **common Harness lifecycle** from backend-specific execution mechanics, not to force all future providers into an artificially identical feature model.

Provider-specific capabilities may remain outside the abstraction until a future spike demonstrates a concrete need for them.

---

## Non-goals

- Multiple simultaneous Harness sessions.
- User-selectable backend types.
- Real Codex integration.
- Real Claude integration.
- Codex Remote Control integration.
- Generic AI-agent provider abstractions.
- Backend capability negotiation.
- Backend plugin discovery or dynamic loading.
- Daemon-restart persistence.
- Restoring remote sessions after Harness restarts.
- Terminal output replay or history.
- Semantic parsing of terminal output.
- Structured AI-agent state such as `working`, `waiting`, `needs_approval`, or `complete`.
- Approval workflows.
- Task orchestration.
- Multi-agent coordination.
- Worktrees.
- Authentication.
- Public-network exposure.
- Android client work.
- PTY descendant/background-process ownership and cleanup.
- General-purpose Linux process supervision.
- Exit-status retention.
- Guaranteeing that every future backend can satisfy the same lifecycle semantics.

---

## Success criteria

The spike is successful if:

1. Harness's logical session lifecycle is no longer inherently coupled to the PTY implementation.
2. The existing PTY-backed session works through the introduced backend boundary without materially regressing Spike 003 behaviour.
3. A non-PTY, non-process backend can participate in the same Harness session lifecycle through that boundary.
4. Core session management can react correctly to both Harness-initiated and backend-initiated termination.
5. Backend-specific identity and implementation details do not become the identity of the Harness session.
6. The resulting design remains deliberately small and does not attempt to predict the full interface of future AI providers.
7. The outcome provides enough evidence to judge whether the abstraction is a reasonable foundation for a future genuinely different backend.

---

## Failure signals

The spike should be considered unsuccessful or architecturally suspect if any of the following are required:

- generic session-management code needs to inspect or manipulate PTY/process-specific state;
- the fake backend requires terminal or process concepts merely to fit the abstraction;
- backend termination semantics are inseparable from Bash/process exit;
- the Harness session ID must double as a backend-specific identifier;
- substantial provider-specific behaviour must be added to the supposedly generic session layer;
- the abstraction becomes significantly larger or more complex than the current lifecycle requires;
- existing externally observable behaviour regresses without demonstrating a necessary architectural trade-off; or
- the second backend can only be tested by bypassing the real Harness session lifecycle.

A failed spike is still useful if it demonstrates that the proposed common boundary is premature or incorrectly located.

---

## Outcome questions

The spike outcome should answer:

1. **Where is the backend boundary now located?**
2. **What is the minimum contract between Harness session management and a backend?**
3. **Which concepts remain genuinely common across PTY and non-PTY sessions?**
4. **Which concepts were discovered to be PTY-specific and moved out of Harness core?**
5. **Did any apparently generic concepts turn out to be terminal assumptions in disguise?**
6. **How are Harness-initiated termination and backend-initiated termination reconciled?**
7. **Does the abstraction plausibly accommodate a remotely hosted agent session that Harness did not create as a local process?**
8. **What would likely need to change when implementing the first real non-PTY backend?**
9. **Did the spike expose any reason that multi-session supervision should not be attempted next?**

Treat a successful result from this spike as evidence about this spike. Do not generalize the backend abstraction as broadly validated across AI providers until it has been exercised against at least one genuinely different real backend.