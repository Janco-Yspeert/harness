import assert from "node:assert/strict";
import test from "node:test";

import {
  collectMessagesFor,
  connect,
  disconnect,
  driveNormalTurn,
  randomFreePort,
  sendInput,
  startAttachedCodexSession,
  waitForServerMessage,
  waitForTurnStart,
} from "./helpers.ts";

// E17 — Detach does not end the Codex backend; an active turn continues
// while detached; reattach continues working.
// Verifies: R14, N12.
test("E17: detach does not end an active turn; reattach continues working", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);

    socket.close(); // detach without stopping the session
    await new Promise((resolve) => setTimeout(resolve, 200));

    const getWhileDetached = await fetch(`${host.url}/sessions/${id}`);
    assert.equal(getWhileDetached.status, 200);
    assert.equal(
      peer.requestLog.filter((r) => r.method === "turn/interrupt").length,
      0,
      "detaching must not interrupt the active turn",
    );

    await driveNormalTurn(peer, turnStart, {
      threadId,
      finalText: "finished while detached",
    });

    const reattached = await connect(host.url, id);
    try {
      const outputPromise = waitForServerMessage(
        reattached,
        (m) => m.type === "output",
      );
      sendInput(reattached, "after reattach\r");
      const secondTurnStart = await waitForTurnStart(peer);
      await driveNormalTurn(peer, secondTurnStart, {
        threadId,
        finalText: "ok-after-reattach",
      });
      // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was assert.equal (reference equality
      // on an object literal always fails; see verify-2026-08-14-diagnostics/README.md).
      assert.deepEqual(await outputPromise, {
        type: "output",
        data: "ok-after-reattach",
      });
    } finally {
      reattached.close();
    }
  } finally {
    await host.close();
    peer.exit();
  }
});

// E18 — Events produced while detached are not required to be replayed, and
// Harness does not corrupt state trying to.
// Verifies: R14 (explicit non-requirement).
test("E18: detached completion does not corrupt state; client remains usable after reattach", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);

    // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was a bare socket.close() with no
    // await, racing the reattach connect() below against the close
    // handshake actually completing server-side (server-side session.socket
    // is only cleared once the "close" event fires) — see
    // verify-2026-08-14-diagnostics/README.md.
    await disconnect(socket); // detach before any delta is emitted
    await driveNormalTurn(peer, turnStart, {
      threadId,
      deltas: ["De", "tached"],
      finalText: "Detached",
    });

    const reattached = await connect(host.url, id);
    try {
      const messagesAfterReattach = await collectMessagesFor(reattached, 300);
      assert.equal(
        messagesAfterReattach.length,
        0,
        "no crash-induced spurious messages after reattach",
      );

      const outputPromise = waitForServerMessage(
        reattached,
        (m) => m.type === "output",
      );
      sendInput(reattached, "fresh turn\r");
      const freshTurnStart = await waitForTurnStart(peer);
      await driveNormalTurn(peer, freshTurnStart, {
        threadId,
        finalText: "fresh-ok",
      });
      // DIAGNOSTIC/EVALUATOR-REPAIR FIX: was assert.equal.
      assert.deepEqual(await outputPromise, {
        type: "output",
        data: "fresh-ok",
      });
    } finally {
      reattached.close();
    }

    const getResponse = await fetch(`${host.url}/sessions/${id}`);
    assert.equal(getResponse.status, 200);
  } finally {
    await host.close();
    peer.exit();
  }
});
