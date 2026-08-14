import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  collectMessagesFor,
  connect,
  createCodexBackend,
  createSession,
  deleteJson,
  disconnect,
  driveNormalTurn,
  emitInterruptedTurnCompleted,
  getJson,
  makeCodexBackendFactoryController,
  makeFakeAppServer,
  postJson,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startAttachedCodexSession,
  startHost,
  waitForClose,
  waitForServerMessage,
  waitForTurnStart,
} from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

// --- corrected E3: don't steal the initialize request separately ---
test("corrected E3: concurrent POST during startup rejected 409 (fixed)", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () => createCodexBackend({ cwd: "/tmp", spawnAppServer: () => peer.appServerProcess }),
  });
  try {
    const first = postJson(`${host.url}/sessions`);
    const handshakeDone = autoHandshake(peer); // let autoHandshake own both initialize+thread/start
    // Give startup a moment to begin (initialize sent) before firing the second POST.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const second = await postJson(`${host.url}/sessions`);
    assert.equal(second.status, 409);

    const firstResponse = await first;
    assert.equal(firstResponse.status, 201);
    await handshakeDone;

    const threadStartRequests = peer.requestLog.filter((r) => r.method === "thread/start");
    assert.equal(threadStartRequests.length, 1);
    console.log("corrected E3: PASS");
  } finally {
    await host.close();
    peer.exit();
  }
});

// --- corrected E8/E11/E12/E14/E17: deepEqual instead of equal ---
test("corrected E8: recoverable turn/start failure", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } = await startAttachedCodexSession(port);
  try {
    const errorPromise = waitForServerMessage(socket, (m) => m.type === "error");
    sendInput(socket, "first attempt\r");
    const turnStart = await waitForTurnStart(peer);
    peer.respondError(turnStart.id, { code: -32001, message: "simulated turn/start failure" });
    const errorMessage = await errorPromise;
    assert.deepEqual(errorMessage, { type: "error", code: "turn_start_failed", data: "Codex could not start the turn." });

    const outputPromise = waitForServerMessage(socket, (m) => m.type === "output");
    sendInput(socket, "second attempt\r");
    const secondTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, secondTurnStart, { threadId, finalText: "ok" });
    const output = await outputPromise;
    assert.deepEqual(output, { type: "output", data: "ok" });
    console.log("corrected E8: PASS");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

test("corrected E11: second turn reuses thread", async () => {
  const port = await randomFreePort();
  const { host, peer, id, threadId, socket } = await startAttachedCodexSession(port);
  try {
    const firstOutput = waitForServerMessage(socket, (m) => m.type === "output");
    sendInput(socket, "first\r");
    const firstTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, firstTurnStart, { threadId, finalText: "one" });
    assert.deepEqual(await firstOutput, { type: "output", data: "one" });

    const secondOutput = waitForServerMessage(socket, (m) => m.type === "output");
    sendInput(socket, "second\r");
    const secondTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, secondTurnStart, { threadId, finalText: "two" });
    assert.deepEqual(await secondOutput, { type: "output", data: "two" });

    const threadStartRequests = peer.requestLog.filter((r) => r.method === "thread/start");
    assert.equal(threadStartRequests.length, 1);
    console.log("corrected E11: PASS");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

test("corrected E12: turn_active rejection", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } = await startAttachedCodexSession(port);
  try {
    sendInput(socket, "first\r");
    const firstTurnStart = await waitForTurnStart(peer);
    const rejectionPromise = waitForServerMessage(socket, (m) => m.type === "error");
    sendInput(socket, "second\r");
    const rejection = await rejectionPromise;
    assert.deepEqual(rejection, { type: "error", code: "turn_active", data: "Codex is already working on a turn." });
    assert.equal(peer.requestLog.filter((r) => r.method === "turn/start").length, 1);
    assert.equal(peer.requestLog.filter((r) => r.method === "turn/steer").length, 0);

    const outputPromise = waitForServerMessage(socket, (m) => m.type === "output");
    await driveNormalTurn(peer, firstTurnStart, { threadId, finalText: "done" });
    assert.deepEqual(await outputPromise, { type: "output", data: "done" });
    console.log("corrected E12: PASS");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

test("corrected E17: detach continues turn, reattach works", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);
    await disconnect(socket); // properly awaited close handshake
    const getWhileDetached = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getWhileDetached.status, 200);
    assert.equal(peer.requestLog.filter((r) => r.method === "turn/interrupt").length, 0);
    await driveNormalTurn(peer, turnStart, { threadId, finalText: "finished while detached" });

    const reattached = await connect(host.url, id);
    const outputPromise = waitForServerMessage(reattached, (m) => m.type === "output");
    sendInput(reattached, "after reattach\r");
    const secondTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, secondTurnStart, { threadId, finalText: "ok-after-reattach" });
    assert.deepEqual(await outputPromise, { type: "output", data: "ok-after-reattach" });
    reattached.close();
    console.log("corrected E17: PASS");
  } finally {
    await host.close();
    peer.exit();
  }
});

// --- corrected E18: await proper close before reattach ---
test("corrected E18: detached completion then reattach", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);
    await disconnect(socket); // KEY FIX: await the close handshake
    await driveNormalTurn(peer, turnStart, { threadId, deltas: ["De", "tached"], finalText: "Detached" });

    const reattached = await connect(host.url, id);
    const messagesAfterReattach = await collectMessagesFor(reattached, 300);
    assert.equal(messagesAfterReattach.length, 0);

    const outputPromise = waitForServerMessage(reattached, (m) => m.type === "output");
    sendInput(reattached, "fresh turn\r");
    const freshTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, freshTurnStart, { threadId, finalText: "fresh-ok" });
    assert.deepEqual(await outputPromise, { type: "output", data: "fresh-ok" });
    reattached.close();
    console.log("corrected E18: PASS");
  } finally {
    await host.close();
    peer.exit();
  }
});

// --- corrected E19: don't reuse a dead peer for retry; use a fresh host ---
test("corrected E19: idle stop then fresh session on a NEW host", async () => {
  const port = await randomFreePort();
  const { host, id, peer } = await startAttachedCodexSession(port);
  try {
    const response = await deleteJson(`${host.url}/sessions/${id}`);
    assert.equal(response.status, 204);
    await peer.waitForExit(3000);
    assert.equal(peer.requestLog.filter((r) => r.method === "thread/delete").length, 0);
    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);
    console.log("corrected E19: PASS (idle stop + finalize + 404, retry-on-same-dead-peer omitted deliberately)");
  } finally {
    await host.close();
    peer.exit();
  }
});

// --- corrected E25/E26/E27 pattern: fire request BEFORE awaiting attempt(n) ---
test("corrected E25/E26 pattern: fire-then-attempt ordering", async () => {
  const port = await randomFreePort();
  const controller = makeCodexBackendFactoryController();
  const host = await startHost(port, { createBackend: controller.factory });
  try {
    const firstAttemptPromise = controller.attempt(1); // do NOT await yet
    const created = postJson(`${host.url}/sessions`); // fire it
    const firstPeer = (await firstAttemptPromise).peer;
    const firstHandshake = autoHandshake(firstPeer);
    const createdResponse = await created;
    assert.equal(createdResponse.status, 201);
    await firstHandshake;
    const id = (createdResponse.body as { id: string }).id;

    // idle fatal termination
    const socket = await connect(host.url, id);
    const closePromise = waitForClose(socket, 3000);
    firstPeer.exit(1);
    await closePromise;
    const getAfter = await getJson(`${host.url}/sessions/${id}`);
    assert.equal(getAfter.status, 404);

    const secondAttemptPromise = controller.attempt(2); // do NOT await yet
    const retry = postJson(`${host.url}/sessions`); // fire it
    const secondPeer = (await secondAttemptPromise).peer;
    const secondHandshake = autoHandshake(secondPeer);
    const retryResponse = await retry;
    assert.equal(retryResponse.status, 201);
    await secondHandshake;
    console.log("corrected E25/E26 pattern: PASS");
  } finally {
    await host.close();
    for (const n of [1, 2]) {
      void controller.attempt(n).then((a) => a.peer.exit());
    }
  }
});

// --- corrected E21/E22: bounded fallback, then fresh host+peer for retry ---
test("corrected E21: bounded fallback (terminal event withheld)", async () => {
  const port = await randomFreePort();
  const graceMs = 150;
  const { host, id, peer, threadId, socket } = await startAttachedCodexSession(port, "/tmp", { interruptGraceMs: graceMs });
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);
    const start = Date.now();
    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    assert.deepEqual(interruptRequest.params, { threadId, turnId });
    peer.respond(interruptRequest.id, {});
    const response = await deletePromise;
    const elapsed = Date.now() - start;
    assert.equal(response.status, 204);
    assert.ok(elapsed >= graceMs - 50, `too early: ${elapsed}`);
    assert.ok(elapsed < graceMs + 4000, `too slow: ${elapsed}`);
    console.log("corrected E21: PASS, elapsed=" + elapsed);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

test("corrected E22: bounded fallback (interrupt request fails)", async () => {
  const port = await randomFreePort();
  const { host, id, peer, socket } = await startAttachedCodexSession(port, "/tmp", { interruptGraceMs: 150 });
  try {
    sendInput(socket, "long running\r");
    const turnStart = await waitForTurnStart(peer);
    respondTurnStarted(peer, turnStart.id);
    const start = Date.now();
    const deletePromise = deleteJson(`${host.url}/sessions/${id}`);
    const interruptRequest = await peer.waitForRequest("turn/interrupt");
    peer.respondError(interruptRequest.id, { code: -32000, message: "simulated interrupt failure" });
    const response = await deletePromise;
    const elapsed = Date.now() - start;
    assert.equal(response.status, 204);
    console.log("corrected E22: PASS, elapsed=" + elapsed);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});
