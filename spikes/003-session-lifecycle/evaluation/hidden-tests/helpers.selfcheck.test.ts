import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { WebSocketServer, WebSocket } from "ws";

import {
  buildQueryCommand,
  connect,
  disconnect,
  rejectedUpgrade,
} from "./helpers.ts";

// SUPPORT ONLY — these validate the shared evaluator helpers in isolation,
// independent of the Harness implementation under test. They are evaluator
// infrastructure per the pre-freeze integrity gate, not evaluation cases;
// see manifest.json's "support" list. Failing one of these means the hidden
// tests that depend on the helper cannot be trusted, and should be treated
// as an EVALUATOR_DEFECT signal, not evidence about the implementation.

interface Fixture {
  url: string;
  close: () => Promise<void>;
}

/**
 * A minimal WebSocket-upgrade fixture, independent of Harness, used only to
 * validate connect()/rejectedUpgrade() in isolation. Mirrors the
 * /sessions/:id/ws path shape only so the same helper functions (which are
 * intentionally not parameterized on path shape) can be exercised unchanged.
 */
function startFixture(): Promise<Fixture> {
  return new Promise((resolve, reject) => {
    const server: Server = createServer();
    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      const id = pathname.match(/^\/sessions\/([^/]+)\/ws$/)?.[1];

      if (id === "reject-404") {
        socket.end("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
        return;
      }
      if (id === "reject-409") {
        socket.end("HTTP/1.1 409 Conflict\r\nConnection: close\r\n\r\n");
        return;
      }
      wss.handleUpgrade(request, socket, head, (webSocket) => {
        wss.emit("connection", webSocket, request);
      });
    });

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      const address = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${String(address.port)}`,
        close(): Promise<void> {
          return new Promise((res) => {
            wss.close(() => {
              server.close(() => res());
            });
          });
        },
      });
    });
  });
}

test("SUPPORT: connect() resolves an open socket on a successful upgrade (positive control)", async () => {
  const fixture = await startFixture();
  try {
    const socket = await connect(fixture.url, "ok");
    assert.equal(socket.readyState, WebSocket.OPEN);
    await disconnect(socket);
  } finally {
    await fixture.close();
  }
});

test("SUPPORT: rejectedUpgrade() reports the real HTTP status without throwing (negative control)", async () => {
  const fixture = await startFixture();
  try {
    assert.equal(await rejectedUpgrade(fixture.url, "reject-404"), 404);
    assert.equal(await rejectedUpgrade(fixture.url, "reject-409"), 409);
  } finally {
    await fixture.close();
  }
});

test("SUPPORT: buildQueryCommand's marker is immune to PTY echo and Bash job-control noise", () => {
  const { command, pattern, head, tail } = buildQueryCommand(
    "SELFCHECK",
    "$SOME_VAR",
  );

  // Negative control 1: the raw typed command text (as a terminal would
  // locally echo it back, verbatim) must not itself satisfy the pattern —
  // this is exactly attempt 001's second confirmed defect (E11).
  assert.equal(
    pattern.test(`${command}\r\n`),
    false,
    "pattern matched the raw echoed command text instead of real output",
  );

  // Negative control 2: Bash's own job-control "Done" notification quotes a
  // background job's source command verbatim when reporting completion —
  // this is exactly attempt 001's third confirmed defect (E12). A
  // notification that happens to reference this command must not satisfy
  // the pattern either.
  const jobControlNoise = `[1]+  Done                    ( sleep 0.5; ${command} )\r\n`;
  assert.equal(
    pattern.test(jobControlNoise),
    false,
    "pattern matched a synthetic Bash job-control notification",
  );

  // Positive control: the real output Bash would print after evaluating the
  // command (head expanded via the shell variable, concatenated with tail,
  // a colon, and the queried value) must satisfy the pattern and capture
  // the value.
  const realOutputLine = `${head}${tail}:some-value\r\n`;
  const match = realOutputLine.match(pattern);
  assert.notEqual(match, null, "pattern failed to match genuine output");
  assert.equal(match?.[1], "some-value");
});
