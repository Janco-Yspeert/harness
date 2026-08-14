import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  connect,
  driveNormalTurn,
  getJson,
  makeCodexBackendFactoryController,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startAttachedCodexSession,
  startHost,
  waitForClose,
  waitForServerMessage,
  waitForTurnStart,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

test("corrected E14: session/thread/socket usable after rejection", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(port);
  try {
    sendInput(socket, "first\r");
    const firstTurnStart = await waitForTurnStart(peer);
    const rejectionPromise = waitForServerMessage(socket, (m) => m.type === "error");
    sendInput(socket, "second\r");
    await rejectionPromise;

    assert.equal(socket.readyState, socket.OPEN);
    const getResponse = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getResponse.status, 200);

    const outputPromise = waitForServerMessage(socket, (m) => m.type === "output");
    await driveNormalTurn(peer, firstTurnStart, { threadId, finalText: "unaffected" });
    assert.deepEqual(await outputPromise, { type: "output", data: "unaffected" });
    console.log("corrected E14: PASS");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

test("corrected E27: fatal termination mid-turn (fire-then-attempt ordering)", async () => {
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
    firstPeer.exit(1); // unexpected termination mid-turn
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
    console.log("corrected E27: PASS");
  } finally {
    await host.close();
    for (const n of [1, 2]) {
      void controller.attempt(n).then((a) => a.peer.exit());
    }
  }
});
