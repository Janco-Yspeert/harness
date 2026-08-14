import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  createSession,
  deleteJson,
  emitInterruptedTurnCompleted,
  getJson,
  isPendingAfter,
  makeCodexBackendFactoryController,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startAttachedCodexSession,
  startHost,
  waitForTurnStart,
} from "./helpers.ts";

// E19 — DELETE on an idle Codex session finalizes App Server before 204;
// does not call permanent thread deletion; GET reflects the same
// session-exists concept afterward.
// Verifies: R15, I5, I6, I7.
test("E19: DELETE on idle session finalizes App Server before 204, no thread/delete", async () => {
  const port = await randomFreePort();
  const { host, id, peer } = await startAttachedCodexSession(port);
  try {
    const response = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(response.status, 204);
    await peer.waitForExit(3000);
    assert.equal(
      peer.requestLog.filter((r) => r.method === "thread/delete").length,
      0,
    );

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const retryId = await createSession(host.url);
    assert.ok(retryId.length > 0);
  } finally {
    await host.close();
    peer.exit();
  }
});

// E20 — Graceful interrupt path: DELETE during an active turn issues
// turn/interrupt and awaits the interrupted terminal event before 204.
// Verifies: R16, N9.
test("E20: graceful interrupt path awaits interrupt ack and interrupted turn/completed before 204", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    assert.deepEqual(interruptRequest.params, { threadId, turnId });

    assert.equal(
      await isPendingAfter(deletePromise, 150),
      true,
      "204 must not arrive before interrupt is even acknowledged",
    );
    peer.respond(interruptRequest.id, {});
    assert.equal(
      await isPendingAfter(deletePromise, 150),
      true,
      "204 must not arrive before the interrupted terminal event",
    );
    emitInterruptedTurnCompleted(peer, threadId, turnId);

    const response = await deletePromise;
    assert.equal(response.status, 204);
    assert.equal(
      peer.requestLog.filter((r) => r.method === "turn/interrupt").length,
      1,
    );
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E21 — Bounded fallback triggers when the interrupted terminal event does
// not arrive within the configured grace period.
// Verifies: R17, N10.
test("E21: bounded fallback triggers when the interrupted terminal event never arrives", async () => {
  const port = await randomFreePort();
  const graceMs = 150;
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(
    port,
    "/tmp",
    { interruptGraceMs: graceMs },
  );
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);

    const start = Date.now();
    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    assert.deepEqual(interruptRequest.params, { threadId, turnId });
    peer.respond(interruptRequest.id, {}); // acknowledged, but the terminal event is deliberately never sent

    const response = await deletePromise;
    const elapsed = Date.now() - start;
    assert.equal(response.status, 204);
    assert.ok(
      elapsed >= graceMs - 50,
      `fallback fired too early: ${String(elapsed)}ms`,
    );
    assert.ok(
      elapsed < graceMs + 4000,
      `fallback took unexpectedly long: ${String(elapsed)}ms`,
    );

    const retryId = await createSession(host.url);
    assert.ok(retryId.length > 0);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E22 — Bounded fallback also triggers when the interrupt request itself
// fails.
// Verifies: R17, N10.
test("E22: bounded fallback triggers when turn/interrupt itself fails", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(
    port,
    "/tmp",
    { interruptGraceMs: 150 },
  );
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    respondTurnStarted(peer, turnStart.id);
    void threadId;

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respondError(interruptRequest.id, {
      code: -32000,
      message: "simulated interrupt failure",
    });

    const response = await deletePromise;
    assert.equal(response.status, 204);

    const retryId = await createSession(host.url);
    assert.ok(retryId.length > 0);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E23 — The production default grace period is materially five seconds.
// Verifies: R17 (default value). Run once — see eval-requirements.md T3.
test("E23: the default interrupt grace period is materially five seconds", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port); // no interruptGraceMs override: production default
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);
    void threadId;
    void turnId;

    const start = Date.now();
    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respond(interruptRequest.id, {}); // acknowledged, terminal event deliberately withheld

    const response = await deletePromise;
    const elapsed = Date.now() - start;
    assert.equal(response.status, 204);
    assert.ok(
      elapsed >= 4500,
      `default grace period fired too early: ${String(elapsed)}ms`,
    );
    assert.ok(
      elapsed <= 7000,
      `default grace period took unexpectedly long: ${String(elapsed)}ms`,
    );
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E24 — Failure to finalize even through bounded fallback uses the existing
// deletion failure path.
// Verifies: R18.
test("E24: failure to finalize even through fallback uses the existing failure path", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(
    port,
    "/tmp",
    { interruptGraceMs: 150 },
  );
  try {
    peer.ignoreSigterm(); // the backend's normal fallback termination signal will not stop this process
    await new Promise((resolve) => setTimeout(resolve, 100)); // let the IPC command land

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);
    void threadId;
    void turnId;

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respond(interruptRequest.id, {}); // acknowledged, terminal event withheld -> fallback attempted, but process won't die

    const response = await deletePromise;
    assert.notEqual(response.status, 204);
    assert.ok(response.status >= 500);
  } finally {
    socket.close();
    await host.close();
    peer.child.kill("SIGKILL"); // SIGKILL cannot be ignored; guarantees no orphaned process survives this test
  }
});

// E25 — Provider process exit racing with Harness-initiated DELETE does not
// produce duplicate/conflicting finalization.
// Verifies: R19, N3.
test("E25: provider process exit racing with DELETE does not corrupt session state", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstHandshake = autoHandshake((await controller.attempt(1)).peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    await firstHandshake;
    const id = (created.body as { id: string }).id;
    const firstPeer = (await controller.attempt(1)).peer;

    const uncaught: unknown[] = [];
    const onUncaught = (error: unknown): void => {
      uncaught.push(error);
    };
    process.on("uncaughtException", onUncaught);
    process.on("unhandledRejection", onUncaught);
    try {
      const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
      firstPeer.exit(); // racing independent termination, not awaited relative to the DELETE above
      const response = await deletePromise;
      assert.ok(
        response.status === 204 || response.status >= 400,
        `unexpected status ${String(response.status)}`,
      );
    } finally {
      process.off("uncaughtException", onUncaught);
      process.off("unhandledRejection", onUncaught);
    }
    assert.equal(
      uncaught.length,
      0,
      `no uncaught error/unhandled rejection expected, got: ${JSON.stringify(uncaught)}`,
    );

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondHandshake = autoHandshake((await controller.attempt(2)).peer);
    const retry = await postJson(`${host.url}/sessions`);
    assert.equal(retry.status, 201);
    await secondHandshake;
  } finally {
    await host.close();
    for (const attemptNumber of [1, 2]) {
      void controller.attempt(attemptNumber).then((a) => a.peer.exit());
    }
  }
});
