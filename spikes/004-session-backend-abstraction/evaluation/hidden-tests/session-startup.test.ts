import assert from "node:assert/strict";
import test from "node:test";

import {
  connect,
  disconnect,
  makeBackendFactoryController,
  sendInput,
  startHost,
  waitForOutput,
} from "./helpers.ts";

// New for spike 004: asynchronous backend-startup semantics (T1/T2 seam).

test("E5: the singleton slot is reserved, and 201 withheld, for the full duration of async backend startup", async () => {
  const controller = makeBackendFactoryController();
  const host = await startHost(0, { createBackend: controller.factory });
  try {
    const firstPending = fetch(`${host.url}/sessions`, { method: "POST" });
    const secondPending = fetch(`${host.url}/sessions`, { method: "POST" });

    // The second request must be rejected without waiting for the first
    // backend's startup to resolve at all — if the implementation instead
    // serialized on the first startup completing, this would hang until
    // the test's own timeout, since resolveStart() is not called yet.
    const second = await secondPending;
    assert.equal(second.status, 409);

    // A rejected concurrent creation attempt must not itself have started
    // a second backend (spike.md: "other concurrent creation attempts must
    // not start another backend").
    assert.equal(
      controller.invocationCount,
      1,
      `expected exactly one backend-startup attempt, saw ${controller.invocationCount}`,
    );

    const first = await controller.attempt(1);
    first.resolveStart();
    const firstResponse = await firstPending;
    assert.equal(firstResponse.status, 201);
  } finally {
    await host.close();
  }
});

test("E6: failed backend startup is failure-safe: no 201, slot released, later creation succeeds normally", async () => {
  const controller = makeBackendFactoryController();
  const host = await startHost(0, { createBackend: controller.factory });
  try {
    const firstPending = fetch(`${host.url}/sessions`, { method: "POST" });
    const first = await controller.attempt(1);
    first.rejectStart(new Error("simulated startup failure"));
    const failed = await firstPending;
    assert.notEqual(failed.status, 201);
    assert.ok(
      failed.status >= 400,
      `expected a failure status for the failed-startup response, got ${failed.status}`,
    );

    const secondPending = fetch(`${host.url}/sessions`, { method: "POST" });
    const second = await controller.attempt(2);
    second.resolveStart();
    const created = await secondPending;
    assert.equal(created.status, 201);
    const { id } = (await created.json()) as { id: string };

    const socket = await connect(host.url, id);
    try {
      const output = waitForOutput(socket, /__RECOVERED_OK__/);
      sendInput(socket, "ping");
      second.emitOutput("__RECOVERED_OK__");
      await output;
      assert.deepEqual(second.received, ["ping"]);
    } finally {
      await disconnect(socket);
    }
  } finally {
    await host.close();
  }
});
