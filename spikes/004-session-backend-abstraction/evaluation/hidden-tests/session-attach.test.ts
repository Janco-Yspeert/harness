import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  buildQueryCommand,
  connect,
  createSession,
  deleteJson,
  disconnect,
  rejectedUpgrade,
  sendAndWait,
} from "./helpers.ts";

// Baseline regression, adapted from spike 003's promoted hidden tests
// (session-attach.test.ts), renumbered to this spec's E-ids. Default
// construction path only (I11).

test("E7: attaching to the active session allows genuine bidirectional backend execution", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);
    const { command, pattern } = buildQueryCommand("ROUNDTRIP");
    await sendAndWait(socket, command, pattern);
    await disconnect(socket);
  } finally {
    await host.close();
  }
});

test("E8: attaching to a never-issued session id is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    await createSession(host.url);
    assert.equal(await rejectedUpgrade(host.url, "never-issued-id"), 404);
  } finally {
    await host.close();
  }
});

test("E9: attaching to a previously stopped session id is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const stopped = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopped.status, 204);

    assert.equal(await rejectedUpgrade(host.url, id), 404);
  } finally {
    await host.close();
  }
});

test("E10: attaching with the wrong id while a session is active is rejected with 404", async () => {
  const host = await startHarnessHost(0);
  try {
    await createSession(host.url);
    assert.equal(
      await rejectedUpgrade(host.url, "some-other-unrelated-id"),
      404,
    );
  } finally {
    await host.close();
  }
});

test("E11: a second attach attempt is rejected with 409 and the first client is unaffected", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(host.url, id);

    assert.equal(await rejectedUpgrade(host.url, id), 409);

    const { command, pattern } = buildQueryCommand("FIRST_STILL_ALIVE");
    await sendAndWait(first, command, pattern);
    await disconnect(first);
  } finally {
    await host.close();
  }
});
