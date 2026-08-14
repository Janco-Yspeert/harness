import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  connect,
  getJson,
  makeCodexBackendFactoryController,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startHost,
  waitForClose,
  waitForTurnStart,
} from "./helpers.ts";

const originals = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};
function captureConsole(): { captured: string[]; restore: () => void } {
  const captured: string[] = [];
  const capture =
    (name: string) =>
    (...args: unknown[]) => {
      captured.push(
        `[${name}] ` +
          args
            .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
            .join(" "),
      );
    };
  console.error = capture("error");
  console.warn = capture("warn");
  console.log = capture("log");
  return {
    captured,
    restore: () => {
      console.error = originals.error;
      console.warn = originals.warn;
      console.log = originals.log;
    },
  };
}

// E26 — Fatal App Server termination (idle) ends the session per the
// established lifecycle.
// Verifies: R20, N3.
//
// DIAGNOSTIC/EVALUATOR-REPAIR FIX (see verify-2026-08-14-diagnostics/README.md):
// the frozen v1 version awaited controller.attempt(1)/attempt(2) *before*
// firing the POST that would trigger each attempt, deadlocking on the very
// first line of real logic. Fixed by firing the request first.
test("E26: fatal App Server termination (idle) ends the session; replacement is creatable", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  const { captured, restore } = captureConsole();
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;
    const socket = await connect(host.url, id);

    const closePromise = waitForClose(socket, 3000);
    firstPeer.exit(1); // unexpected termination, no preceding DELETE
    await closePromise;

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);
    assert.ok(
      captured.length > 0,
      "a server-side diagnostic entry should be recorded for the fatal termination",
    );

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
    const retryId = (retryResponse.body as { id: string }).id;
    const retrySocket = await connect(host.url, retryId);
    retrySocket.close();
  } finally {
    restore();
    await host.close();
    for (const attemptNumber of [1, 2]) {
      void controller.attempt(attemptNumber).then((a) => a.peer.exit());
    }
  }
});

// E27 — Fatal termination during an active turn also ends the session
// correctly.
// Verifies: R20.
// DIAGNOSTIC/EVALUATOR-REPAIR FIX: same fire-then-attempt ordering fix as E26.
test("E27: fatal App Server termination mid-turn ends the session; replacement is creatable", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(firstPeer);
    respondTurnStarted(firstPeer, turnStart.id);

    const closePromise = waitForClose(socket, 3000);
    firstPeer.exit(1); // unexpected termination mid-turn, no preceding DELETE
    await closePromise;

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
    const retryId = (retryResponse.body as { id: string }).id;
    const retrySocket = await connect(host.url, retryId);
    retrySocket.close();
  } finally {
    await host.close();
    for (const attemptNumber of [1, 2]) {
      void controller.attempt(attemptNumber).then((a) => a.peer.exit());
    }
  }
});
