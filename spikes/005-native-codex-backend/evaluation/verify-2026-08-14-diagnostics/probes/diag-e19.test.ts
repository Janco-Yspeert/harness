import assert from "node:assert/strict";
import test from "node:test";

import {
  deleteJson,
  randomFreePort,
  startAttachedCodexSession,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

test("diag E19 with instrumentation", async () => {
  const port = await randomFreePort();
  console.error("t0", Date.now());
  const { host, id, peer } = await startAttachedCodexSession(port);
  console.error("t1 attached", Date.now(), "peer pid", peer.pid);

  peer.child.on("exit", (code, signal) => {
    console.error("PEER PROCESS EXITED", Date.now(), { code, signal });
  });

  console.error("issuing DELETE", Date.now());
  const response = await deleteJson(`${host.url}/sessions/${id}`);
  console.error("DELETE resolved", Date.now(), response.status);
  assert.equal(response.status, 204);

  await host.close();
  peer.exit();
});
