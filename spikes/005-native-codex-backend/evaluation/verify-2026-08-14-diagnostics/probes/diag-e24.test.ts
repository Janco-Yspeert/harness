import assert from "node:assert/strict";
import test from "node:test";

import {
  createCodexBackend,
  deleteJson,
  makeFakeAppServer,
  makeUnkillableAppServerProcess,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startHost,
  waitForTurnStart,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";
import { autoHandshake, connect } from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

test("corrected E24: failure to finalize even through fallback uses the existing failure path", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({ cwd: "/tmp", spawnAppServer: () => makeUnkillableAppServerProcess(peer), interruptGraceMs: 150 }),
  });
  try {
    const handshakeDone = autoHandshake(peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    await handshakeDone;
    const id = (created.body as { id: string }).id;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    respondTurnStarted(peer, turnStart.id);

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respond(interruptRequest.id, {}); // acknowledged, terminal event withheld -> fallback attempted, but kill() never lands

    const response = await deletePromise;
    console.log("corrected E24 response status:", response.status);
    assert.notEqual(response.status, 204);
    assert.ok(response.status >= 500);
    console.log("corrected E24: PASS");
    socket.close();
  } finally {
    await host.close();
    peer.child.kill("SIGKILL");
  }
});
