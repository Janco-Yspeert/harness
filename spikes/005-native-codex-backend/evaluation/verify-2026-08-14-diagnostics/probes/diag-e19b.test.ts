import assert from "node:assert/strict";
import test from "node:test";

import {
  createSession,
  deleteJson,
  randomFreePort,
  startAttachedCodexSession,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

test("diag E19 with retry create", async () => {
  const port = await randomFreePort();
  const { host, id, peer } = await startAttachedCodexSession(port);
  const response = await deleteJson(`${host.url}/sessions/${id}`);
  assert.equal(response.status, 204);
  console.error("about to retry createSession", Date.now());
  const retryId = await createSession(host.url);
  console.error("retry createSession resolved", Date.now(), retryId);

  await host.close();
  peer.exit();
});
