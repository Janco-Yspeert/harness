import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  attemptAttach,
  connect,
  deleteJson,
  disconnect,
  postJson,
  sendAndWait,
} from "./helpers.ts";

async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  assert.equal(response.status, 201);
  return (response.body as { id: string }).id;
}

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

test("E5: attaching to the active session allows bidirectional PTY interaction", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));
    await sendAndWait(
      socket,
      "echo __HARNESS_ROUNDTRIP__",
      /__HARNESS_ROUNDTRIP__\r?\n/,
    );
    await disconnect(socket);
  } finally {
    await host.close();
  }
});

test("E6: attaching to a never-issued session id is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    await createSession(host.url);
    const result = await attemptAttach(wsUrlFor(host.url, "never-issued-id"));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 404);
  } finally {
    await host.close();
  }
});

test("E7: attaching to a previously stopped session id is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const stopped = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopped.status, 204);

    const result = await attemptAttach(wsUrlFor(host.url, id));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 404);
  } finally {
    await host.close();
  }
});

test("E8: attaching with the wrong id while a session is active is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    await createSession(host.url);
    const result = await attemptAttach(
      wsUrlFor(host.url, "some-other-unrelated-id"),
    );
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 404);
  } finally {
    await host.close();
  }
});

test("E9: a second attach attempt is rejected with 409 and the first client is unaffected", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(wsUrlFor(host.url, id));

    const second = await attemptAttach(wsUrlFor(host.url, id));
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.status, 409);

    await sendAndWait(
      first,
      "echo __HARNESS_FIRST_STILL_ALIVE__",
      /__HARNESS_FIRST_STILL_ALIVE__\r?\n/,
    );
    await disconnect(first);
  } finally {
    await host.close();
  }
});
