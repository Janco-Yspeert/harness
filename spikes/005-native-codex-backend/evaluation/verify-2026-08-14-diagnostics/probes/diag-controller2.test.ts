import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import test from "node:test";

import {
  autoHandshake,
  makeCodexBackendFactoryController,
  postJson,
  randomFreePort,
  startHost,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

const LOG = "/tmp/claude-1000/-home-velveteen-vk-code-harness/11be3209-276d-4dab-a8ff-9da160552e71/scratchpad/diag-controller2.out";
function log(msg: string): void {
  appendFileSync(LOG, `${Date.now()} ${msg}\n`);
}

test("diag2: await attempt(2) before firing 2nd POST deadlocks", async () => {
  log("start");
  const port = await randomFreePort();
  log("got port " + port);
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  log("host started");

  const firstHandshake = autoHandshake((await controller.attempt(1)).peer);
  log("attempt(1) resolved");
  const created = await postJson(`${host.url}/sessions`);
  log("first POST resolved " + created.status);
  assert.equal(created.status, 201);
  await firstHandshake;
  log("first handshake done, about to await attempt(2)");

  const secondHandshake = autoHandshake((await controller.attempt(2)).peer);
  log("attempt(2) resolved!");
  const retry = await postJson(`${host.url}/sessions`);
  log("retry resolved " + retry.status);
  await secondHandshake;
  log("second handshake done");

  await host.close();
  log("done");
});
