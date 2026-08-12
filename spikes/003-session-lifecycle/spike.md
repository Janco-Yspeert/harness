---
type: implementation
---

# Spike 003: Session Lifecycle

## Brief

Introduce explicit Harness-owned session lifecycle around the existing PTY
control.

Harness must be able to create one in-memory Bash/PTY session, return a stable
session ID, allow a client to attach to that session, detach without terminating
it, and later reattach to the same running session.

The session must be explicitly stoppable through Harness.

This spike should remain intentionally small. Its purpose is to prove the
host/session ownership boundary and exercise the AI-first spike workflow
established by the previous process spike.

## Requirements

### Create a session

Provide an HTTP endpoint:

```text
POST /sessions
```

When no session is active:

- create a Bash/PTY session;
- assign it a stable session ID;
- return `201 Created`;
- return a JSON response with a media type of `application/json` containing the
  session ID as:

```json
{
  "id": "<session-id>"
}
```

Session IDs are opaque to clients and must not be reused during the lifetime of
the Harness host.

A newly created session must receive an ID different from all session IDs
previously issued by that host process.

Only one active session is supported in this spike.

If a session is already active, a second `POST /sessions` must be rejected with
`409 Conflict`.

If multiple `POST /sessions` requests are made concurrently while no session is
active, exactly one request may create the session successfully.

All other competing requests must receive `409 Conflict`.

The exact `409` response body is not part of the contract.

### Attach to a session

A client must be able to attach to the running session over WebSocket using:

`/sessions/:id/ws`

The `:id` path parameter identifies the session to attach to.

If the session exists and is active, the WebSocket connection is accepted. Once
the client is attached to the session, the existing bidirectional PTY behaviour
must continue to work:

- client input is sent to Bash;
- Bash output is returned to the attached client.

If the session ID is unknown or refers to a previously stopped session, reject
the WebSocket upgrade with `404 Not Found`.

Stopped sessions are not retained, so a previously used session ID is treated
the same as any other unknown session ID.

Only one client may be attached to the session at a time.

If a second client attempts to attach while another client is already connected:

- reject the WebSocket upgrade with `409 Conflict`;
- keep the existing client connection active and unchanged;
- do not replace, disconnect, or otherwise disturb the existing attachment.

### Browser client

Update the existing browser client to use the session lifecycle introduced by
this spike.

The browser must provide enough functionality to manually exercise the complete
session lifecycle:

- create a session using `POST /sessions`;
- attach to the created session using `/sessions/:id/ws`;
- disconnect the WebSocket without stopping the session;
- reattach to the same running session;
- stop the session using `DELETE /sessions/:id`.

The browser should display enough state to make the current session ID and
attachment state observable.

No polished UI or general session-management interface is required. The browser
remains a minimal development client for exercising Harness behaviour.

### Detach and reattach

Disconnecting the WebSocket client must not stop the underlying Bash/PTY
session.

A later client must be able to attach using the same session ID and continue
interacting with the same shell session.

Shell state established before disconnection must survive reattachment.

For example, changing the working directory or setting an environment variable
before disconnecting must still be observable after reconnecting.

### Stop a session

Provide an HTTP endpoint:

`DELETE /sessions/:id`

When `:id` identifies the active session:

- terminate its PTY/Bash process;
- remove it from active in-memory session state;
- prevent further attachment or interaction using that session ID;
- return `204 No Content`.

A successful `204 No Content` response means the session has been terminated,
removed from active state, and the active session slot is available for reuse.

The response must not be returned merely because termination has been requested.

If `:id` identifies the active session when the DELETE request is accepted,
return `204 No Content` after cleanup completes, including if the Bash process
exits independently while that cleanup is in progress.

If `:id` does not identify the active session, return `404 Not Found`.

Stopped sessions are not retained, so a previously used session ID is treated
the same as any other unknown session ID.

After the session has been stopped, a new session may be created with
`POST /sessions`.

The new session must receive a new session ID.

If a client is attached when the session is stopped:

- close the attached WebSocket;
- terminate the underlying session;
- ensure no further client input can reach the terminated PTY.

### Natural session exit

If the Bash process exits for any reason without an explicit
`DELETE /sessions/:id`:

- remove the session from active in-memory state;
- close any currently attached WebSocket client;
- allow a new session to be created with `POST /sessions`.

Harness does not need to retain or expose the exit status, exit code, signal, or
reason for termination as part of this spike.

After the process exits, its session ID is treated the same as any other unknown
or previously stopped session ID.

### Session cleanup

Stopping a session or shutting down Harness must terminate the PTY/Bash process
owned directly by the session and close any attached client.

This spike does not require Harness to discover or terminate descendant or
background processes that have moved into separate process groups.

Descendant-process cleanup is a known lifecycle concern and is deferred to a
future spike.

### Harness shutdown

All supported Harness shutdown paths must clean up the active session before the
host finishes shutting down. This includes the programmatic host shutdown
mechanism and the existing `SIGINT` and `SIGTERM` handlers.

After shutdown cleanup completes, the active PTY/Bash session must no longer be
running.

### Networking

The existing localhost-only security posture must remain unchanged.

Harness must continue to bind only to `127.0.0.1`.

## Done When

The spike demonstrates that:

1. A session can be explicitly created.
2. Harness returns a stable ID for the session.
3. A client can attach to the session and interact with Bash.
4. Disconnecting the client leaves the underlying session running.
5. A later client can reattach using the same session ID.
6. Shell state survives detach and reattach.
7. A second session cannot be created while the first is active.
8. The active session can be explicitly stopped.
9. A stopped or unknown session cannot be attached to.
10. A new session can be created after the previous one is stopped.
11. Harness shutdown cleans up the active child process.
12. The existing localhost-only networking constraint remains intact.
13. Relevant automated tests and existing project checks pass.

## Non-goals

- Do not support multiple simultaneous sessions.
- Do not support multiple simultaneously attached clients.
- Do not retain or replay PTY output while no client is attached.
- Do not retain stopped-session records.
- Do not model process exit status, failure state, exit codes, or termination
  reasons.
- Do not persist sessions across Harness restarts.
- Do not add authentication or public-network access.
- Do not add Codex, Claude, or other AI coding processes as session types.
- Do not add semantic parsing of terminal output.
- Do not add session listing or additional session-query APIs unless required to
  satisfy the stated spike behaviour.
- Do not implement multiple-session behaviour or infrastructure in this spike.
  The implementation should nevertheless avoid public contracts that assume
  Harness can only ever identify one session.
- Do not build a polished or general-purpose session-management UI.
- Do not guarantee cleanup of background or descendant processes outside the
  PTY/Bash process group directly managed by Harness.
