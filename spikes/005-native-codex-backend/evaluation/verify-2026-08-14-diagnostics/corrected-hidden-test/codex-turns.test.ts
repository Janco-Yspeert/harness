import assert from "node:assert/strict";
import test from "node:test";

import {
  collectMessagesFor,
  driveNormalTurn,
  randomFreePort,
  sendInput,
  startAttachedCodexSession,
  waitForServerMessage,
  waitForTurnStart,
} from "./helpers.ts";

// E7 — User text starts a turn on the existing thread with the trailing PTY
// \r stripped before it reaches the provider.
// Verifies: R7, N13 (Codex side).
test("E7: trailing PTY \\r is stripped before reaching turn/start", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);
    assert.equal(turnStart.threadId, threadId);
    assert.equal(turnStart.text, "hello");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E8 — Recoverable turn/start failure returns the backend to idle with
// exactly one turn_start_failed message; the session and thread survive; a
// later instruction succeeds on the same thread.
// Verifies: R8, I4.
test("E8: recoverable turn/start failure yields exactly one turn_start_failed and a later turn succeeds", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    const errorPromise = waitForServerMessage(
      socket,
      (m) => m.type === "error",
    );
    sendInput(socket, "first attempt\r");
    const turnStart = await waitForTurnStart(peer);
    peer.respondError(turnStart.id, {
      code: -32001,
      message: "simulated turn/start failure",
    });

    const errorMessage = await errorPromise;
    assert.deepEqual(errorMessage, {
      type: "error",
      code: "turn_start_failed",
      data: "Codex could not start the turn.",
    });

    // No stray turn_active/turn_start_failed messages beyond the one above.
    const extra = await collectMessagesFor(socket, 300);
    assert.equal(
      extra.filter((m) => m.type === "error").length,
      0,
      "no additional error messages should follow the single turn_start_failed",
    );

    const outputPromise = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    sendInput(socket, "second attempt\r");
    const secondTurnStart = await waitForTurnStart(peer);
    assert.equal(secondTurnStart.threadId, threadId);
    await driveNormalTurn(peer, secondTurnStart, { threadId, finalText: "ok" });
    const output = await outputPromise;
    assert.deepEqual(output, { type: "output", data: "ok" }); // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was assert.equal (reference equality on an object literal always fails)
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E9 — Agent-message deltas reach the client; completed text is not
// duplicated once deltas were observed.
// Verifies: R10, N5.
test("E9: deltas forwarded, completed text not duplicated", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    const messagesPromise = collectMessagesFor(socket, 1500);
    sendInput(socket, "say hello\r");
    const turnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, turnStart, {
      threadId,
      deltas: ["Hel", "lo"],
      finalText: "Hello",
    });
    const messages = await messagesPromise;

    const outputs = messages.filter((m) => m.type === "output") as {
      type: "output";
      data: string;
    }[];
    const concatenated = outputs.map((m) => m.data).join("");
    assert.equal(concatenated, "Hello");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E10 — Completed text is used as a fallback exactly once when no deltas
// were observed for that item.
// Verifies: R10 (fallback branch).
test("E10: completed text used as fallback exactly once when no deltas were emitted", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    const messagesPromise = collectMessagesFor(socket, 1500);
    sendInput(socket, "say hello\r");
    const turnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, turnStart, {
      threadId,
      deltas: [],
      finalText: "Hello",
    });
    const messages = await messagesPromise;

    const outputs = messages.filter((m) => m.type === "output") as {
      type: "output";
      data: string;
    }[];
    const concatenated = outputs.map((m) => m.data).join("");
    assert.equal(concatenated, "Hello");
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E11 — Turn completion does not end the session; a second sequential turn
// reuses the same thread.
// Verifies: R9, I8.
test("E11: session survives turn completion; second turn reuses the same thread", async () => {
  const port = await randomFreePort();
  const { host, peer, id, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    const firstOutput = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    sendInput(socket, "first\r");
    const firstTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, firstTurnStart, { threadId, finalText: "one" });
    assert.deepEqual(await firstOutput, { type: "output", data: "one" }); // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was assert.equal

    const getStillActive = await fetch(`${host.url}/sessions/${id}`);
    assert.equal(getStillActive.status, 200);
    assert.equal(socket.readyState, socket.OPEN);

    const secondOutput = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    sendInput(socket, "second\r");
    const secondTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, secondTurnStart, {
      threadId,
      finalText: "two",
    });
    assert.deepEqual(await secondOutput, { type: "output", data: "two" }); // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was assert.equal

    const threadStartRequests = peer.requestLog.filter(
      (r) => r.method === "thread/start",
    );
    assert.equal(
      threadStartRequests.length,
      1,
      "no second thread/start call should have reached the peer",
    );
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});
