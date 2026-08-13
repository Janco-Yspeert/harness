import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  buildQueryCommand,
  connect,
  createSession,
  deleteJson,
  disconnect,
  postJson,
  sendAndWait,
} from "./helpers.ts";

// Baseline regression, adapted unchanged from spike 003's promoted hidden
// tests (spikes/003-session-lifecycle/evaluation/hidden-tests/
// session-create.test.ts). Uses the default construction path (no
// `options` argument), which must keep behaving exactly as before per I11.

test("E1: creates a session and returns a stable id", async () => {
  const host = await startHarnessHost(0);
  try {
    const response = await postJson(`${host.url}/sessions`);
    assert.equal(response.status, 201);
    assert.ok(
      response.contentType?.includes("application/json"),
      `expected application/json, got ${String(response.contentType)}`,
    );
    const body = response.body as { id?: unknown };
    assert.equal(typeof body.id, "string");
    assert.ok((body.id as string).length > 0);
  } finally {
    await host.close();
  }
});

test("E2: a second create while active is rejected and the existing session is unaffected", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);

    const second = await postJson(`${host.url}/sessions`);
    assert.equal(second.status, 409);

    const socket = await connect(host.url, id);
    const { command, pattern } = buildQueryCommand("STILL_ALIVE");
    await sendAndWait(socket, command, pattern);
    await disconnect(socket);
  } finally {
    await host.close();
  }
});

test("E3: exactly one of several concurrent creates succeeds", async () => {
  const host = await startHarnessHost(0);
  try {
    const attempts = await Promise.all(
      Array.from({ length: 8 }, () => postJson(`${host.url}/sessions`)),
    );
    const created = attempts.filter((r) => r.status === 201);
    const conflicted = attempts.filter((r) => r.status === 409);
    assert.equal(
      created.length,
      1,
      `expected exactly one 201, got statuses ${attempts.map((r) => r.status).join(",")}`,
    );
    assert.equal(conflicted.length, attempts.length - 1);
  } finally {
    await host.close();
  }
});

test("E4: session ids are unique across repeated create/stop cycles", async () => {
  const host = await startHarnessHost(0);
  try {
    const ids = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const id = await createSession(host.url);
      assert.ok(!ids.has(id), `session id ${id} was reused`);
      ids.add(id);

      const stopped = await deleteJson(`${host.url}/sessions/${id}`);
      assert.equal(stopped.status, 204);
    }
    assert.equal(ids.size, 3);
  } finally {
    await host.close();
  }
});
