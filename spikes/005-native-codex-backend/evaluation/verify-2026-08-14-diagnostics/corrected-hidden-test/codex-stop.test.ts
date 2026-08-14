import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  connect,
  createCodexBackend,
  deleteJson,
  emitInterruptedTurnCompleted,
  getJson,
  isPendingAfter,
  makeCodexBackendFactoryController,
  makeFakeAppServer,
  makeUnkillableAppServerProcess,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startAttachedCodexSession,
  startHost,
  waitForTurnStart,
} from "./helpers.ts";

// DIAGNOSTIC/EVALUATOR-REPAIR NOTE (see verify-2026-08-14-diagnostics/README.md):
// E19, E21, and E22 originally retried session creation via
// `createSession(host.url)`/`startAttachedCodexSession`'s single captured
// `peer`, which is only ever wired to ONE successful backend attempt — any
// retry on that same host tries to reuse the already-exited peer process,
// whose `initialize` request can never be answered, deadlocking the test.
// Fixed here by using `makeCodexBackendFactoryController` (fresh peer per
// attempt) for the retry, matching the pattern already used correctly by E25.

// E19 — DELETE on an idle Codex session finalizes App Server before 204;
// does not call permanent thread deletion; GET reflects the same
// session-exists concept afterward; a subsequent POST (fresh peer) succeeds.
// Verifies: R15, I5, I6, I7.
test("E19: DELETE on idle session finalizes App Server before 204, no thread/delete", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;

    const response = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(response.status, 204);
    await firstPeer.waitForExit(3000);
    assert.equal(
      firstPeer.requestLog.filter((r) => r.method === "thread/delete").length,
      0,
    );

    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
  } finally {
    await host.close();
    for (const n of [1, 2]) {
      void controller.attempt(n).then((a) => a.peer.exit());
    }
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
  const controller = makeCodexBackendFactoryController((_n, peer) => ({
    cwd: "/tmp",
    spawnAppServer: () => peer.appServerProcess,
    interruptGraceMs: graceMs,
  }));
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    const { threadId } = await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(firstPeer);
    const turnId = respondTurnStarted(firstPeer, turnStart.id);

    const start = Date.now();
    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await firstPeer.waitForRequest("turn/interrupt");
    assert.deepEqual(interruptRequest.params, { threadId, turnId });
    firstPeer.respond(interruptRequest.id, {}); // acknowledged, but the terminal event is deliberately never sent

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
    socket.close();

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
  } finally {
    await host.close();
    for (const n of [1, 2]) {
      void controller.attempt(n).then((a) => a.peer.exit());
    }
  }
});

// E22 — Bounded fallback also triggers when the interrupt request itself
// fails.
// Verifies: R17, N10.
test("E22: bounded fallback triggers when turn/interrupt itself fails", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController((_n, peer) => ({
    cwd: "/tmp",
    spawnAppServer: () => peer.appServerProcess,
    interruptGraceMs: 150,
  }));
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(firstPeer);
    respondTurnStarted(firstPeer, turnStart.id);

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await firstPeer.waitForRequest("turn/interrupt");
    firstPeer.respondError(interruptRequest.id, {
      code: -32000,
      message: "simulated interrupt failure",
    });

    const response = await deletePromise;
    assert.equal(response.status, 204);
    socket.close();

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
  } finally {
    await host.close();
    for (const n of [1, 2]) {
      void controller.attempt(n).then((a) => a.peer.exit());
    }
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
// Verifies: R18, N10.
//
// DIAGNOSTIC/EVALUATOR-REPAIR FIX (see verify-2026-08-14-diagnostics/README.md):
// the frozen v1 oracle had the peer ignore SIGTERM only. Any implementation
// that correctly escalates to SIGKILL after a SIGTERM timeout — the normal,
// correct way to build this, since SIGKILL cannot be ignored by any process
// — passed regardless of whether bounded-fallback failure was handled
// correctly at all. Replaced with makeUnkillableAppServerProcess, which
// intercepts kill() entirely (never delivers any signal), modeling a process
// genuinely stuck in an uninterruptible OS wait state. Against this oracle,
// this specific implementation revision hangs indefinitely rather than
// eventually reporting failure — see eval-result.md. The bounded wait below
// (10s) is an evaluator-chosen, disclosed bound distinguishing "never
// resolves" from "resolves 204/error"; spike.md does not specify an exact
// number for this step, only that Harness "must not wait indefinitely"
// (N10).
test("E24: failure to finalize even through fallback uses the existing failure path", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => makeUnkillableAppServerProcess(peer),
        interruptGraceMs: 150,
      }),
  });
  try {
    const handshakeDone = autoHandshake(peer);
    const created = await postJson(`${host.url}/sessions`);
    assert.equal(created.status, 201);
    await handshakeDone;
    const id = (created.body as { id: string }).id;
    const socket = await connect(host.url, id);

    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    respondTurnStarted(peer, turnStart.id);

    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respond(interruptRequest.id, {}); // acknowledged, terminal event withheld -> fallback attempted, kill() never actually lands

    const BOUND_MS = 10_000;
    const timedOut = Symbol("timed-out");
    const outcome = await Promise.race([
      deletePromise,
      new Promise((resolve) => setTimeout(() => resolve(timedOut), BOUND_MS)),
    ]);
    assert.notEqual(
      outcome,
      timedOut,
      `DELETE must not wait indefinitely for finalization to succeed (N10); still unresolved after ${String(BOUND_MS)}ms`,
    );
    const response = outcome as Awaited<typeof deletePromise>;
    assert.notEqual(response.status, 204);
    assert.ok(response.status >= 500);
    socket.close();
  } finally {
    // Reap the real process FIRST, bypassing the unkillable wrapper: if the
    // implementation's own stop() is still stuck awaiting this process's
    // exit (the scenario under test), host.close() would itself hang
    // forever awaiting that same stuck promise if called first.
    peer.child.kill("SIGKILL");
    await peer.waitForExit(3000).catch(() => undefined);
    await host.close();
  }
});

// E25 — Provider process exit racing with Harness-initiated DELETE does not
// produce duplicate/conflicting finalization.
// Verifies: R19, N3.
//
// DIAGNOSTIC/EVALUATOR-REPAIR FIX: the frozen v1 version awaited
// `controller.attempt(2)` (and even `attempt(1)`) *before* firing the POST
// that would trigger that attempt, deadlocking immediately. Fixed by firing
// the request first and awaiting the attempt concurrently.
test("E25: provider process exit racing with DELETE does not corrupt session state", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1);
    const created = postJson(`${host.url}/sessions`);
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;

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

    const secondAttemptPromise = controller.attempt(2);
    const retry = postJson(`${host.url}/sessions`);
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
  } finally {
    await host.close();
    for (const attemptNumber of [1, 2]) {
      void controller.attempt(attemptNumber).then((a) => a.peer.exit());
    }
  }
});
