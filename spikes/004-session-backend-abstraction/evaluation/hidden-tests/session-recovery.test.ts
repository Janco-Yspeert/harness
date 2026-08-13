import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  buildQueryCommand,
  connect,
  createSession,
  disconnect,
  getJson,
  makeBackendFactoryController,
  postJson,
  rejectedUpgrade,
  sendAndWait,
  sendInput,
  startHost,
  waitForClose,
  waitForOutput,
} from "./helpers.ts";

// E20 is baseline regression, adapted from spike 003's promoted
// "session-natural-exit.test.ts" (unchanged assertions). E21 and E22 are
// new for spike 004: the full server-observable recovery sequence that
// fixes the manual-testing observation in spike.md ("Bash/backend exit
// recovery"), exercised against both backend types.

test("E20: the backend exiting on its own is treated like a stop (baseline regression)", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);

    const closed = waitForClose(socket);
    sendInput(socket, "exit\r");
    await closed;

    assert.equal(await rejectedUpgrade(host.url, id), 404);

    const recreated = await postJson(`${host.url}/sessions`);
    assert.equal(recreated.status, 201);
  } finally {
    await host.close();
  }
});

test("E21: full recovery sequence after independent backend termination, PTY backend", async () => {
  const host = await startHarnessHost(0);
  try {
    const staleId = await createSession(host.url);
    const socket = await connect(host.url, staleId);

    // (1) cause the backend to exit independently; (2) observe the close.
    const closed = waitForClose(socket);
    sendInput(socket, "exit\r");
    await closed;

    // (3) the original session is now stale.
    assert.equal(
      (await getJson(`${host.url}/sessions/${staleId}`)).status,
      404,
    );

    // (4) a new session can be created.
    const newId = await createSession(host.url);
    assert.notEqual(newId, staleId);

    // (5) attach to it, (6) and exchange input/output proving genuine
    // execution on the new session.
    const newSocket = await connect(host.url, newId);
    const { command, pattern } = buildQueryCommand("RECOVERED");
    await sendAndWait(newSocket, command, pattern);
    await disconnect(newSocket);
  } finally {
    await host.close();
  }
});

test("E22: full recovery sequence after independent backend termination, non-PTY backend", async () => {
  const controller = makeBackendFactoryController();
  const host = await startHost(0, { createBackend: controller.factory });
  try {
    const firstPending = fetch(`${host.url}/sessions`, { method: "POST" });
    const first = await controller.attempt(1);
    first.resolveStart();
    const firstCreated = await firstPending;
    assert.equal(firstCreated.status, 201);
    const { id: staleId } = (await firstCreated.json()) as { id: string };

    const socket = await connect(host.url, staleId);

    // (1) trigger the backend's own independent-exit notification (never
    // calls stop() itself); (2) observe the close.
    const closed = waitForClose(socket);
    first.emitExit();
    await closed;

    // (3) the original session is now stale.
    assert.equal(
      (await getJson(`${host.url}/sessions/${staleId}`)).status,
      404,
    );

    // (4) a new session can be created on the same host — this requires
    // the implementation to invoke the factory again for a genuinely new
    // backend instance (`controller.attempt(2)` would hang, failing the
    // test via timeout, if it didn't), proving the whole sequence works
    // without ever touching a PTY, shell, or subprocess.
    const secondPending = fetch(`${host.url}/sessions`, { method: "POST" });
    const second = await controller.attempt(2);
    assert.notEqual(
      second,
      first,
      "the new session reused the stale backend instance",
    );
    second.resolveStart();
    const secondCreated = await secondPending;
    assert.equal(secondCreated.status, 201);
    const { id: newId } = (await secondCreated.json()) as { id: string };
    assert.notEqual(newId, staleId);

    // (5) attach, (6) exchange input/output on the new session.
    const newSocket = await connect(host.url, newId);
    const output = waitForOutput(newSocket, /__RECOVERED_NON_PTY__/);
    sendInput(newSocket, "ping");
    second.emitOutput("__RECOVERED_NON_PTY__");
    await output;
    assert.deepEqual(second.received, ["ping"]);
    await disconnect(newSocket);
  } finally {
    await host.close();
  }
});
