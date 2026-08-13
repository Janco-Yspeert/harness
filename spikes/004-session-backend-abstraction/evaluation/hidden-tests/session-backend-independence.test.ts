import assert from "node:assert/strict";
import test from "node:test";

import {
  connect,
  createSession,
  deleteJson,
  disconnect,
  makeControllableBackend,
  sendInput,
  startHost,
  waitForOutput,
} from "./helpers.ts";

// New for spike 004: the non-PTY backend proof, exercised entirely through
// the real Harness session-management path (never by instantiating the
// backend in isolation — see N5).

test("E26: create, attach, and exchange input/output through the real path, non-PTY backend", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const host = await startHost(0, { createBackend: backend.factory });
  try {
    const id = await createSession(host.url);
    const socket = await connect(host.url, id);

    const output = waitForOutput(socket, /__ECHO_OK__/);
    sendInput(socket, "hello-backend");
    assert.deepEqual(backend.received, ["hello-backend"]);
    backend.emitOutput("__ECHO_OK__");
    await output;

    await disconnect(socket);
  } finally {
    await host.close();
  }
});

test("E27: detaching does not terminate the non-PTY backend session; reattach continues working on the same backend instance", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const host = await startHost(0, { createBackend: backend.factory });
  try {
    const id = await createSession(host.url);
    const first = await connect(host.url, id);
    sendInput(first, "before-detach");
    await disconnect(first);

    const second = await connect(host.url, id);
    const output = waitForOutput(second, /__AFTER_REATTACH__/);
    sendInput(second, "after-reattach");
    backend.emitOutput("__AFTER_REATTACH__");
    await output;

    // Both inputs landed on the same backend instance — proving detach
    // never tore it down and reattach never created a new one.
    assert.deepEqual(backend.received, ["before-detach", "after-reattach"]);
    await disconnect(second);
  } finally {
    await host.close();
  }
});

test("E28: explicit stop finalizes the non-PTY backend before 204 is returned", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  backend.setStopDelayMs(150);
  const host = await startHost(0, { createBackend: backend.factory });
  try {
    const id = await createSession(host.url);

    let resolved = false;
    const stopPromise = deleteJson(`${host.url}/sessions/${id}`).then(
      (response) => {
        resolved = true;
        return response;
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(
      resolved,
      false,
      "204 arrived before the backend's stop() delay elapsed",
    );

    const response = await stopPromise;
    assert.equal(response.status, 204);
    assert.ok(
      backend.stopCalls >= 1,
      "explicit DELETE did not invoke the backend's stop()",
    );

    const recreated = await fetch(`${host.url}/sessions`, { method: "POST" });
    assert.notEqual(
      recreated.status,
      409,
      "the singleton slot was not released after the non-PTY backend stopped",
    );
  } finally {
    await host.close();
  }
});
