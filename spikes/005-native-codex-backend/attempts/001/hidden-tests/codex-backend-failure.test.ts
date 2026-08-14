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
test("E26: fatal App Server termination (idle) ends the session; replacement is creatable", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  const { captured, restore } = captureConsole();
  try {
    const firstHandshake = autoHandshake((await controller.attempt(1)).peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    await firstHandshake;
    const id = (created.body as { id: string }).id;
    const firstPeer = (await controller.attempt(1)).peer;
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

    const secondHandshake = autoHandshake((await controller.attempt(2)).peer);
    const retry = await postJson(`${host.url}/sessions`);
    assert.equal(retry.status, 201);
    await secondHandshake;
    const retryId = (retry.body as { id: string }).id;
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
test("E27: fatal App Server termination mid-turn ends the session; replacement is creatable", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstHandshake = autoHandshake((await controller.attempt(1)).peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    await firstHandshake;
    const id = (created.body as { id: string }).id;
    const firstPeer = (await controller.attempt(1)).peer;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(firstPeer);
    respondTurnStarted(firstPeer, turnStart.id);

    const closePromise = waitForClose(socket, 3000);
    firstPeer.exit(1); // unexpected termination mid-turn, no preceding DELETE
    await closePromise;

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondHandshake = autoHandshake((await controller.attempt(2)).peer);
    const retry = await postJson(`${host.url}/sessions`);
    assert.equal(retry.status, 201);
    await secondHandshake;
    const retryId = (retry.body as { id: string }).id;
    const retrySocket = await connect(host.url, retryId);
    retrySocket.close();
  } finally {
    await host.close();
    for (const attemptNumber of [1, 2]) {
      void controller.attempt(attemptNumber).then((a) => a.peer.exit());
    }
  }
});
