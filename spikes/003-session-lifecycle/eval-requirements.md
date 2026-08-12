# Evaluation Requirements

## Testability Requirements

- **T1** — The CLI entrypoint (the code that runs when the module is executed
  directly, e.g. `npm start` / `node src/index.ts`) must allow the listening
  port to be overridden via the `PORT` environment variable, falling back to the
  existing default port when `PORT` is not set.
  - Reason: `startHarnessHost` already accepts a `port` parameter, but the CLI
    entrypoint needs a way to be started as an isolated, addressable process.
    Verifying that Harness shutdown cleans up the active session on `SIGINT` and
    `SIGTERM` (an explicit spike requirement) requires starting the real
    entrypoint as a separate OS process and sending it real signals — a fixed,
    non-overridable port makes that evaluation unreliable (port conflicts with
    any other running instance, or with parallel test runs).
  - Source: derived from the explicit `SIGINT`/`SIGTERM` shutdown requirement in
    `spike.md`, combined with the project's own guidance to avoid fixed ports in
    tests when an alternative exists.
  - Implementation impact: minimal — read `process.env.PORT` (parsed as a
    number) where the entrypoint currently calls `startHarnessHost()`. Does not
    change the HTTP/WebSocket contract.

No other testability requirements were identified. Session ids, PTY output, and
shell state are all observable through the HTTP and WebSocket surface the spike
already defines.

## Evaluator Assumptions

- **A1** — The existing WebSocket message envelope for attached-session traffic
  (a JSON object shaped like `{"type":"input","data":...}` for client→server
  messages and `{"type":"output","data":...}` for server→client messages)
  continues unchanged, since the spike requires that "the existing bidirectional
  PTY behaviour must continue to work" and does not redefine the wire format.
  Evaluation impact: hidden tests drive the PTY and read its output using this
  existing envelope.
- **A2** — "Stable session ID" means an opaque string that does not change for
  the lifetime of the session; no particular ID format, encoding, or generation
  strategy is assumed. Evaluation impact: hidden tests treat session IDs as
  opaque values and never assert on their internal structure.
- **A3** — "Concurrently" for the purposes of the concurrent-`POST /sessions`
  requirement is exercised by dispatching multiple requests without awaiting
  between them (e.g. via `Promise.all`), consistent with Node's single-process
  event-loop model, rather than requiring true OS-level parallel execution.
- **A4** — A rejected WebSocket upgrade (`404`/`409`) is observed at the HTTP
  upgrade response itself (i.e. the upgrade never reaches
  `101 Switching Protocols`), not by first accepting the connection and then
  closing it.

## Blocking Questions

None.

## Environment Requirements

- Hidden tests run with the project's existing test tooling (`node --test`,
  native TypeScript execution) and its existing dependencies (`ws`, `node-pty`).
  No additional dependency is required.
- One hidden test starts the real CLI entrypoint as a child OS process (see T1)
  and exercises `SIGINT`/`SIGTERM`. This requires the ability to spawn child
  processes and send POSIX signals, which is only meaningful on the project's
  supported Ubuntu/Linux host.
- No external services, network access, or additional environment variables
  beyond `PORT` (see T1) are required.
