import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  attemptAttach,
  connect,
  deleteJson,
  disconnect,
  pidAlive,
  postJson,
  readBashPid,
  spawnBackgroundJob,
  waitForClose,
  waitForPidExit,
} from "./helpers.ts";

async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  assert.equal(response.status, 201);
  return (response.body as { id: string }).id;
}

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

test("E13: stopping a session returns 204 only once cleanup is complete and the slot is reusable", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));
    const pid = await readBashPid(socket);
    await disconnect(socket);

    const stopped = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopped.status, 204);

    assert.equal(
      pidAlive(pid),
      false,
      `bash process ${pid} was still alive immediately after 204`,
    );

    const recreated = await postJson(`${host.url}/sessions`);
    assert.equal(recreated.status, 201);
  } finally {
    await host.close();
  }
});

test("E14: stopping a session while attached closes the client connection", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));

    const closed = waitForClose(socket);
    const stopped = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopped.status, 204);
    await closed;
  } finally {
    await host.close();
  }
});

test("E15: stopping a session terminates process-group descendants", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));
    const bgPid = await spawnBackgroundJob(socket, "sleep 60");
    await disconnect(socket);

    const stopped = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopped.status, 204);

    await waitForPidExit(bgPid, 3000);
  } finally {
    await host.close();
  }
});

test("E16: stopping a never-issued session id returns 404", async () => {
  const host = await startHarnessHost(0);
  try {
    const stopped = await deleteJson(`${host.url}/sessions/never-issued-id`);
    assert.equal(stopped.status, 404);
  } finally {
    await host.close();
  }
});

test("E17: stopping an already-stopped session id returns 404, not 204", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(first.status, 204);

    const second = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(second.status, 404);
  } finally {
    await host.close();
  }
});

test("E18: stopping the wrong id while a session is active returns 404 and leaves the active session running", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const stopped = await deleteJson(
      `${host.url}/sessions/some-other-unrelated-id`,
    );
    assert.equal(stopped.status, 404);

    const result = await attemptAttach(wsUrlFor(host.url, id));
    assert.equal(result.ok, true);
    if (result.ok) await disconnect(result.socket);
  } finally {
    await host.close();
  }
});
