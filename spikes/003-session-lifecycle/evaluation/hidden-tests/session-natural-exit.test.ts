import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  connect,
  createSession,
  postJson,
  rejectedUpgrade,
  sendInput,
} from "./helpers.ts";

test("E18: the shell exiting on its own is treated like a stop", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);

    const closed = once(socket, "close");
    sendInput(socket, "exit\r");
    await closed;

    assert.equal(await rejectedUpgrade(host.url, id), 404);

    const recreated = await postJson(`${host.url}/sessions`);
    assert.equal(recreated.status, 201);
  } finally {
    await host.close();
  }
});
