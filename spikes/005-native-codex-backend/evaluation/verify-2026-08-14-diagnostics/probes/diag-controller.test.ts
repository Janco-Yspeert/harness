import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  makeCodexBackendFactoryController,
  postJson,
  randomFreePort,
  startHost,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

test("diag: await attempt(2) before firing 2nd POST deadlocks", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });

  const firstHandshake = autoHandshake((await controller.attempt(1)).peer);
  const created = await postJson(`${host.url}/sessions`);
  assert.equal(created.status, 201);
  await firstHandshake;
  console.error("first session created, about to await attempt(2) BEFORE firing 2nd POST", Date.now());

  // Reproduces the exact pattern from E25/E26/E27: awaiting attempt(2) before
  // the triggering POST is ever sent.
  const secondHandshake = autoHandshake((await controller.attempt(2)).peer);
  console.error("controller.attempt(2) resolved?!", Date.now());
  const retry = await postJson(`${host.url}/sessions`);
  console.error("retry resolved", Date.now(), retry.status);
  await secondHandshake;

  await host.close();
});
