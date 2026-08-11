# Harness

Harness is an Ubuntu-hosted control plane for supervising multiple AI coding
agents from one place.

The product direction and architectural constraints are documented in
[`GOALS.md`](./GOALS.md) and [`AGENTS.md`](./AGENTS.md).

## Requirements

- Node.js 24.12 or newer
- npm 11 or newer

## Spike 1: bidirectional PTY control

This spike runs one interactive Bash process in a real PTY and connects a single
browser to it over WebSocket. Both the HTTP and WebSocket server are bound to
`127.0.0.1`; they are deliberately unavailable from other machines.

Install dependencies and start the host:

```sh
npm install
npm start
```

Open <http://127.0.0.1:3000> in a browser on the same Ubuntu machine. Enter
`pwd`, `echo hello`, and `ls` in the command field and confirm that Bash output
appears above it. Closing the page disconnects the WebSocket but does not stop
the Bash process while the host remains running. Press Ctrl+C in the host
terminal to stop Harness and its Bash child.

During development:

```sh
npm run dev
npm test
npm run check
```

This project uses Node's native TypeScript type stripping at runtime. TypeScript
syntax must therefore remain erasable; `npm run typecheck` performs static type
checking separately.

### Known spike limitations

- There is one Bash process and at most one connected browser.
- PTY output is not retained or replayed while no browser is connected.
- A newly connected browser sees only output produced after it connects.
- ANSI control sequences are displayed as plain text rather than interpreted.
- The command form sends complete lines; it is not a full terminal keyboard.
- There is no authentication. Localhost-only binding prevents network exposure,
  but any local process able to connect can control Bash. This is strictly a
  development-only security posture, not a complete trust boundary.
