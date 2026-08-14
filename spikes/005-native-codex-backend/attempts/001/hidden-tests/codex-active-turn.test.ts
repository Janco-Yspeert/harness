import assert from "node:assert/strict";
import test from "node:test";

import {
  driveNormalTurn,
  randomFreePort,
  sendInput,
  startAttachedCodexSession,
  waitForServerMessage,
  waitForTurnStart,
} from "./helpers.ts";

const TURN_ACTIVE_MESSAGE = {
  type: "error" as const,
  code: "turn_active",
  data: "Codex is already working on a turn.",
};

// E12 — Input during an active turn is rejected with turn_active, never
// queued, steered, or allowed to start a second turn.
// Verifies: R11, N4, I2. Assumption: A1.
test("E12: input during an active turn is rejected turn_active, not queued/steered/duplicated", async () => {
  const port = await randomFreePort();
  const { host, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "first\r"); // turn/start issued; peer will hold its response
    const firstTurnStart = await waitForTurnStart(peer);

    const rejectionPromise = waitForServerMessage(
      socket,
      (m) => m.type === "error",
    );
    sendInput(socket, "second\r"); // must be rejected, not started as a new turn
    const rejection = await rejectionPromise;
    assert.deepEqual(rejection, TURN_ACTIVE_MESSAGE);

    assert.equal(
      peer.requestLog.filter((r) => r.method === "turn/start").length,
      1,
    );
    assert.equal(
      peer.requestLog.filter((r) => r.method === "turn/steer").length,
      0,
    );

    // Complete the first (only) turn, then confirm the session works normally afterward.
    const outputPromise = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    await driveNormalTurn(peer, firstTurnStart, {
      threadId,
      finalText: "done",
    });
    assert.equal(await outputPromise, { type: "output", data: "done" });

    const thirdOutput = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    sendInput(socket, "third\r");
    const thirdTurnStart = await waitForTurnStart(peer);
    await driveNormalTurn(peer, thirdTurnStart, {
      threadId,
      finalText: "third-ok",
    });
    assert.equal(await thirdOutput, { type: "output", data: "third-ok" });
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E13 — The busy window begins before turn/start's own response resolves.
// Verifies: R11, I2, I3. Assumption: A1.
test("E13: busy window begins before turn/start's own response resolves", async () => {
  const port = await randomFreePort();
  const { host, peer, socket } = await startAttachedCodexSession(port);
  try {
    sendInput(socket, "first\r");
    await waitForTurnStart(peer); // observed, but deliberately left unanswered

    const rejectionPromise = waitForServerMessage(
      socket,
      (m) => m.type === "error",
      2000,
    );
    sendInput(socket, "second\r");
    const rejection = await rejectionPromise;
    assert.deepEqual(rejection, TURN_ACTIVE_MESSAGE);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E14 — The active turn, thread, Harness session, and WebSocket remain
// unchanged and usable after a rejected instruction.
// Verifies: R11 (closing clause).
test("E14: session/thread/socket remain usable after a rejected instruction", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "first\r");
    const firstTurnStart = await waitForTurnStart(peer);

    const rejectionPromise = waitForServerMessage(
      socket,
      (m) => m.type === "error",
    );
    sendInput(socket, "second\r");
    await rejectionPromise;

    assert.equal(socket.readyState, socket.OPEN);
    const getResponse = await fetch(`${host.url}/sessions/${id}`);
    assert.equal(getResponse.status, 200);

    const outputPromise = waitForServerMessage(
      socket,
      (m) => m.type === "output",
    );
    await driveNormalTurn(peer, firstTurnStart, {
      threadId,
      finalText: "unaffected",
    });
    assert.equal(await outputPromise, {
      type: "output",
      data: "unaffected",
    });
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});
