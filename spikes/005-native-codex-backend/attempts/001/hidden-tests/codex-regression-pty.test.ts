import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  buildQueryCommand,
  connect,
  createCodexBackend,
  createSession,
  deleteJson,
  disconnect,
  getJson,
  makeFakeAppServer,
  postJson,
  randomFreePort,
  sendAndWait,
  startHost,
  type FakeAppServer,
} from "./helpers.ts";

// E28 — PTY-backed session lifecycle remains intact with the Codex
// integration present in the codebase, using the host's default
// (no-options) construction path.
// Verifies: R21, R22.
test("E28: PTY-backed baseline lifecycle remains intact (default construction, no Codex options)", async () => {
  const port = await randomFreePort();
  const host = await startHost(port); // no options at all: production PTY backend
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);

    const { command, pattern } = buildQueryCommand("REGRESSION");
    const match = await sendAndWait(socket, command, pattern);
    assert.ok(match[1] !== undefined);

    await disconnect(socket);
    const reattached = await connect(host.url, id);
    const second = buildQueryCommand("REGRESSION2");
    const secondMatch = await sendAndWait(
      reattached,
      second.command,
      second.pattern,
    );
    assert.ok(secondMatch[1] !== undefined);
    await disconnect(reattached);

    const stopResponse = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(stopResponse.status, 204);

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondId = await createSession(host.url);
    assert.notEqual(secondId, id);
    const secondSocket = await connect(host.url, secondId);
    await disconnect(secondSocket);
    await deleteJson(`${host.url}/sessions/${secondId}`);
  } finally {
    await host.close();
  }
});

// E29 — PTY trailing-\r handling is unaffected by Codex input normalization.
// Verifies: N13.
test("E29: PTY trailing \\r still reaches the shell as Enter (genuine execution, not echo)", async () => {
  const port = await randomFreePort();
  const host = await startHost(port);
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);
    const { command, pattern } = buildQueryCommand("CR_CHECK", "$((21 * 2))");
    const match = await sendAndWait(socket, command, pattern);
    assert.equal(match[1]?.trim(), "42");
    await disconnect(socket);
    await deleteJson(`${host.url}/sessions/${id}`);
  } finally {
    await host.close();
  }
});

// E30 — Codex-backed session IDs remain pairwise distinct across
// create/stop cycles.
// Verifies: I9.
test("E30: Codex-backed session ids are pairwise distinct across create/stop cycles", async () => {
  const port = await randomFreePort();
  const ids: string[] = [];
  const peers: FakeAppServer[] = [];
  const host = await startHost(port, {
    createBackend: () => {
      const peer = makeFakeAppServer();
      peers.push(peer);
      void autoHandshake(peer);
      return createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      });
    },
  });
  try {
    for (let i = 0; i < 3; i++) {
      const created = await postJson(`${host.url}/sessions`);
      assert.equal(created.status, 201);
      const id = (created.body as { id: string }).id;
      ids.push(id);
      const stopped = await deleteJson(`${host.url}/sessions/${id}`);
      assert.equal(stopped.status, 204);
    }
    assert.equal(
      new Set(ids).size,
      3,
      `expected 3 distinct ids, got ${JSON.stringify(ids)}`,
    );
  } finally {
    await host.close();
    for (const peer of peers) peer.exit();
  }
});

// E31 — Programmatic host shutdown finalizes an active Codex-backed session.
// Verifies: I10.
test("E31: host.close() finalizes an active Codex-backed session's App Server process", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      }),
  });
  const handshakeDone = autoHandshake(peer);
  const created = await postJson(`${host.url}/sessions`);
  assert.equal(created.status, 201);
  await handshakeDone;

  await host.close();
  await peer.waitForExit(3000);
});
