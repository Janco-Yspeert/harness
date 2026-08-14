import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  createCodexBackend,
  makeFakeAppServer,
  postJson,
  randomFreePort,
  startHost,
} from "./helpers.ts";

// E1 — Harness never opts into capabilities.experimentalApi.
// Verifies: N6, R1.
test("E1: Codex-backed session initializes App Server without experimentalApi", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      }),
  });
  try {
    const handshakeDone = autoHandshake(peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    const { initializeParams } = await handshakeDone;

    const experimentalApi = initializeParams.capabilities?.experimentalApi;
    assert.notEqual(
      experimentalApi,
      true,
      `experimentalApi must not be true, got ${JSON.stringify(experimentalApi)}`,
    );
  } finally {
    await host.close();
    peer.exit();
  }
});
