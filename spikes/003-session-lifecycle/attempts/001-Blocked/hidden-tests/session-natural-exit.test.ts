import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  attemptAttach,
  connect,
  postJson,
  sendInput,
  waitForClose,
} from "./helpers.ts";

async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  assert.equal(response.status, 201);
  return (response.body as { id: string }).id;
}

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

test("E19: the shell exiting on its own is treated like a stop", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));

    const closed = waitForClose(socket, 5000);
    sendInput(socket, "exit\r");
    await closed;

    const reattach = await attemptAttach(wsUrlFor(host.url, id));
    assert.equal(reattach.ok, false);
    if (!reattach.ok) assert.equal(reattach.status, 404);

    const recreated = await postJson(`${host.url}/sessions`);
    assert.equal(recreated.status, 201);
  } finally {
    await host.close();
  }
});
