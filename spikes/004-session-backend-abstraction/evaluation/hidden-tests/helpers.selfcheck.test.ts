import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { WebSocketServer, WebSocket } from "ws";

import {
  buildQueryCommand,
  connect,
  disconnect,
  makeBackendFactoryController,
  makeControllableBackend,
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
 * validate connect()/rejectedUpgrade() in isolation. Carried over from
 * spike 003's promoted self-check (same helpers, same mechanics, unchanged
 * by spike 004).
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

  assert.equal(
    pattern.test(`${command}\r\n`),
    false,
    "pattern matched the raw echoed command text instead of real output",
  );

  const jobControlNoise = `[1]+  Done                    ( sleep 0.5; ${command} )\r\n`;
  assert.equal(
    pattern.test(jobControlNoise),
    false,
    "pattern matched a synthetic Bash job-control notification",
  );

  const realOutputLine = `${head}${tail}:some-value\r\n`;
  const match = realOutputLine.match(pattern);
  assert.notEqual(match, null, "pattern failed to match genuine output");
  assert.equal(match?.[1], "some-value");
});

test("SUPPORT: makeControllableBackend's factory stays pending until resolveStart(), then resolves to a conforming backend", async () => {
  const backend = makeControllableBackend();
  let settled = false;
  const startPromise = backend.factory();
  void startPromise.then(() => {
    settled = true;
  });

  // Give the event loop a couple of ticks: still must not have settled.
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    settled,
    false,
    "factory's promise settled before resolveStart() was called",
  );

  backend.resolveStart();
  const session = await startPromise;
  assert.equal(typeof session.write, "function");
  assert.equal(typeof session.onData, "function");
  assert.equal(typeof session.onExit, "function");
  assert.equal(typeof session.stop, "function");
});

test("SUPPORT: makeControllableBackend's factory rejects on rejectStart() (negative control for startup failure)", async () => {
  const backend = makeControllableBackend();
  const startPromise = backend.factory();
  const error = new Error("selfcheck simulated failure");
  backend.rejectStart(error);
  await assert.rejects(startPromise, (thrown: unknown) => thrown === error);
});

test("SUPPORT: makeControllableBackend records input, delivers output/exit, and counts stop() calls", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const session = await backend.factory();

  session.write("hello");
  session.write("world");
  assert.deepEqual(backend.received, ["hello", "world"]);

  const observedOutput: string[] = [];
  session.onData((data) => observedOutput.push(data));
  backend.emitOutput("chunk-1");
  backend.emitOutput("chunk-2");
  assert.deepEqual(observedOutput, ["chunk-1", "chunk-2"]);

  let exited = false;
  session.onExit(() => {
    exited = true;
  });
  assert.equal(exited, false);
  backend.emitExit();
  assert.equal(exited, true);

  assert.equal(backend.stopCalls, 0);
  await session.stop();
  assert.equal(backend.stopCalls, 1);
  // stop() is safe to call again (T2's idempotency contract) — this only
  // checks the fake backend's own call counter increments; it deliberately
  // does not assert anything about how many times a correct Harness
  // implementation should call it (see eval-spec.md's Out of Scope).
  await session.stop();
  assert.equal(backend.stopCalls, 2);
});

test("SUPPORT: makeControllableBackend's stop() respects setStopDelayMs (positive control for E28's ordering assertion)", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const session = await backend.factory();
  backend.setStopDelayMs(150);

  let resolved = false;
  const stopPromise = Promise.resolve(session.stop()).then(() => {
    resolved = true;
  });

  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(resolved, false, "stop() resolved before its configured delay");

  await stopPromise;
  assert.equal(resolved, true);
});

test("SUPPORT: makeBackendFactoryController hands out a fresh backend per invocation and reports invocation count (used by E5, E6)", async () => {
  const controller = makeBackendFactoryController();
  assert.equal(controller.invocationCount, 0);

  const firstPromise = controller.factory();
  assert.equal(controller.invocationCount, 1);
  const first = await controller.attempt(1);
  first.resolveStart();
  const firstSession = await firstPromise;
  assert.equal(typeof firstSession.write, "function");

  const secondPromise = controller.factory();
  assert.equal(controller.invocationCount, 2);
  const second = await controller.attempt(2);
  assert.notEqual(second, first, "second attempt reused the first backend");
  second.rejectStart(new Error("selfcheck"));
  await assert.rejects(secondPromise);
});

test("SUPPORT: makeBackendFactoryController's attempt(n) resolves once that invocation happens, even if awaited beforehand (negative control: never calling factory() must leave it pending)", async () => {
  const controller = makeBackendFactoryController();
  let settled = false;
  void controller.attempt(1).then(() => {
    settled = true;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(
    settled,
    false,
    "attempt(1) settled before the factory was ever invoked",
  );

  controller.factory();
  const backend = await controller.attempt(1);
  assert.equal(typeof backend.resolveStart, "function");
});
