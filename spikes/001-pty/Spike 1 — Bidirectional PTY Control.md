# Spike 1 — Bidirectional PTY Control

## Goal

Build the smallest possible proof that a browser client can interact with a
process running inside a PTY managed by the Harness host process.

The success condition is:

> I can open a browser, type a shell command such as `pwd`, have it executed by
> Bash running under Harness on Ubuntu, and see the resulting terminal output in
> the browser.

This is an exploratory spike.

It is intended to prove the control loop and expose any important PTY or
WebSocket behaviour before we design the broader session architecture.

Read and follow `AGENTS.md` and `GOALS.md` before making changes.

## Scope

Implement:

- A Node.js 24 host process written in TypeScript.
- A WebSocket endpoint.
- A single Bash process running inside a real PTY.
- Streaming PTY output from the host to the connected browser.
- Sending browser input back to the PTY.
- A minimal browser client with:
  - an output area;
  - a text input;
  - a way to send input to Bash.

The host and browser should run on the same Ubuntu machine for this spike.

Bind only to localhost.

## Expected Flow

```text
Browser
   │
   │ WebSocket
   ▼
Harness host
   │
   │ PTY
   ▼
Bash
```

When the user sends:

```text
pwd
```

the browser should send the appropriate input to Harness, including the newline
or Enter input required by the PTY.

Bash executes the command.

PTY output is streamed back through the WebSocket and displayed in the browser.

Basic interactive commands should work, including:

```text
pwd
echo hello
ls
```

## Runtime and TypeScript

Use:

- Node.js 24.
- TypeScript.
- ESM.
- npm.

Use Node's native TypeScript type stripping for execution.

The application should therefore run directly from `.ts` source, for example:

```bash
node src/index.ts
```

Do not introduce a TypeScript runtime or transpilation tool such as:

- `tsx`
- `ts-node`
- Babel
- SWC
- esbuild

unless native Node execution proves insufficient for a concrete reason
discovered during this spike.

Install TypeScript locally as a development dependency and use:

```bash
tsc --noEmit
```

for static type checking.

Do not depend on globally installed TypeScript tooling.

Configure TypeScript so that code remains compatible with Node's native type
stripping.

Prefer erasable TypeScript syntax.

Avoid TypeScript features requiring runtime transformation.

## Frameworks

Do not use a backend framework.

In particular, do not introduce:

- NestJS.
- Express.
- Fastify.
- Hapi.
- A dependency injection framework.
- A controller/service/module architecture.

Use Node's standard library for the host wherever practical.

For example, `node:http` is sufficient for any HTTP server functionality
required by this spike.

The purpose of the spike is PTY and WebSocket behaviour, not
application-framework design.

## Dependencies

Keep dependencies minimal.

Expected dependencies are approximately:

- `ws` for WebSockets.
- `node-pty` for PTY support.

Expected development dependencies are approximately:

- `typescript`.
- `@types/node`.
- any type package genuinely required by the chosen dependencies.

Do not add libraries for functionality available simply through Node's standard
library.

Do not add protocol validation libraries such as Zod yet unless the spike
reveals an immediate requirement.

## PTY

Use a real pseudo-terminal rather than ordinary `child_process` stdin/stdout
pipes.

`node-pty` is an acceptable and expected choice unless there is a concrete
reason to use something else.

Run Bash inside the PTY.

Harness owns the Bash process.

For this spike, it is acceptable for Bash to terminate when the Harness host
process terminates.

If the browser disconnects, do not terminate Bash merely because the WebSocket
connection closed.

No reconnect or reattachment behaviour is required yet.

## WebSocket Protocol

Keep the WebSocket protocol deliberately small.

For this spike, messages may be as simple as:

```json
{
  "type": "input",
  "data": "pwd\n"
}
```

and:

```json
{
  "type": "output",
  "data": "..."
}
```

Do not implement the full Harness protocol yet.

Do not implement Conduit-shaped envelopes yet.

The purpose of this spike is to prove:

```text
browser → WebSocket → PTY → Bash
```

and:

```text
Bash → PTY → WebSocket → browser
```

Protocol design can be addressed independently once this works.

## Browser Client

Keep the client deliberately primitive.

Use plain HTML, CSS, and JavaScript unless a frontend framework solves an
immediate problem encountered during the spike.

Do not introduce:

- React.
- Vue.
- Svelte.
- Angular.
- A frontend build system.

The browser client only needs to make the control loop easy to exercise.

Correct behaviour matters more than appearance.

A complete terminal emulator is not required.

It is acceptable for the initial output area to display streamed text without
accurately reproducing every ANSI terminal feature.

If ANSI behaviour prevents useful testing, report the limitation rather than
building a terminal emulator during this spike.

## Connection Behaviour

Support one browser connection.

Multiple connected clients are not required.

On browser disconnect:

- the WebSocket connection should be cleaned up;
- the Bash process should remain alive while the Harness host remains alive.

On host shutdown:

- close sockets cleanly where practical;
- terminate the PTY child process;
- avoid obvious orphaned resources.

Do not implement reconnection or session recovery yet.

## Explicitly Out of Scope

Do not implement:

- Codex integration.
- Claude Code integration.
- Agent adapters.
- Provider discovery.
- Structured provider APIs.
- Multiple sessions.
- Multiple agents.
- A `SessionManager`.
- Session persistence.
- Reattachment.
- Daemon-restart persistence.
- Authentication.
- Device pairing.
- LAN access.
- Public-network access.
- Android support.
- Push notifications.
- Conduit integration.
- Full Harness message envelopes.
- Semantic terminal-output parsing.
- Approval handling.
- Agent-state detection.
- Git integration.
- Worktree management.
- Task orchestration.
- Agent-to-agent orchestration.
- tmux integration.
- A database.
- A persistence layer.
- A plugin system.
- A generic transport abstraction.
- A generic agent abstraction.
- A full terminal emulator.

Do not implement the next logical feature simply because it appears obvious.

## Testing

Add focused automated tests where they provide meaningful value.

Do not construct an elaborate mocked architecture merely to increase unit-test
coverage.

The most important validation for this spike is a real end-to-end test on
Ubuntu.

Verify manually:

1. Start the Harness host process.
2. Open the browser client.
3. Establish the WebSocket connection.
4. Send `pwd`.
5. Confirm that Bash returns the actual working directory.
6. Send `echo hello`.
7. Confirm that `hello` appears.
8. Send `ls`.
9. Confirm that output appears and the same Bash process remains interactive.
10. Disconnect or close the browser.
11. Confirm that the Bash process is not terminated solely because the client
    disconnected.

Where practical, add automated tests for logic that can be tested without
mocking away the PTY behaviour being investigated.

## Type Checking and Checks

Before completion, run at least:

```bash
npm test
```

if tests exist, and:

```bash
npm run typecheck
```

or the equivalent local `tsc --noEmit` command.

Do not add linting or formatting infrastructure unless it already exists or is
explicitly requested.

## Developer Commands

Provide simple npm scripts where useful.

A likely minimal set is:

```json
{
  "scripts": {
    "start": "node src/index.ts",
    "dev": "node --watch src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "..."
  }
}
```

The exact scripts may differ if there is a concrete technical reason.

Avoid creating a build step unless it is actually required.

## README

Add a short README section explaining:

- prerequisites;
- dependency installation;
- how to start Harness;
- how to open the browser client;
- which URL to use;
- how to perform the manual verification;
- any known limitations discovered during the spike.

Keep this documentation focused on running the spike.

## Deliverables

At completion:

- Harness runs directly from TypeScript source on Node 24.
- TypeScript passes static type checking.
- A Bash process runs inside a PTY.
- A browser connects over WebSocket.
- Browser input reaches Bash.
- Bash output reaches the browser.
- Browser disconnect does not by itself terminate Bash.
- The service is bound only to localhost.
- No unnecessary framework or architecture has been introduced.
- Relevant tests and checks pass.
- The README explains how to reproduce the result.

## Completion Report

When finished, report:

1. Files added or changed.
2. Dependencies introduced and why each was required.
3. Important implementation choices.
4. How to start the host and browser client.
5. How bidirectional PTY behaviour was verified.
6. Tests and type checks that were run.
7. Any limitations or unexpected PTY/WebSocket behaviour.
8. Anything learned that may affect later Harness architecture.

Do not implement those later architectural changes as part of this spike.

## Spike Principle

This spike should answer one question:

> Can Harness reliably control a real PTY-backed process through a browser over
> WebSocket on Ubuntu?

If the answer is yes, stop.

Do not turn the proof into the final Harness architecture.
