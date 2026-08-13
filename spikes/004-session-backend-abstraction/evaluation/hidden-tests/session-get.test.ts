import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import { createSession, deleteJson, getJson } from "./helpers.ts";

// New for spike 004: GET /sessions/:id existence check.

test("E23: GET on an active session returns 200", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const response = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(response.status, 200);
  } finally {
    await host.close();
  }
});

test("E24: GET on a never-issued id returns 404", async () => {
  const host = await startHarnessHost(0);
  try {
    const response = await getJson(`${host.url}/sessions/never-issued-id`);
    assert.equal(response.status, 404);
  } finally {
    await host.close();
  }
});

test("E25: GET on a stopped session id returns 404, and GET checks the actual active id (not just 'a session exists')", async () => {
  const host = await startHarnessHost(0);
  try {
    const stoppedId = await createSession(host.url);
    const stopped = await deleteJson(`${host.url}/sessions/${stoppedId}`);
    assert.equal(stopped.status, 204);
    assert.equal(
      (await getJson(`${host.url}/sessions/${stoppedId}`)).status,
      404,
    );

    const activeId = await createSession(host.url);
    assert.equal(
      (await getJson(`${host.url}/sessions/some-other-unrelated-id`)).status,
      404,
    );
    assert.equal(
      (await getJson(`${host.url}/sessions/${activeId}`)).status,
      200,
    );
  } finally {
    await host.close();
  }
});
