import assert from "node:assert/strict";
import test from "node:test";

import {
  collectMessagesFor,
  driveNormalTurn,
  randomFreePort,
  respondTurnStarted,
  sendInput,
  startAttachedCodexSession,
  waitForTurnStart,
} from "./helpers.ts";

// E15 — Unmodeled-but-valid non-text provider notifications do not corrupt
// the session or crash the host.
// Verifies: R12.
test("E15: unmodeled non-text provider notifications do not corrupt the session", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    const messagesPromise = collectMessagesFor(socket, 1500);

    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);
    const turnId = respondTurnStarted(peer, turnStart.id);

    // Real, schema-conformant but Harness-unmodeled notifications, matching
    // shapes empirically observed against the actual installed App Server
    // (see eval-spec.md's Pre-Freeze Integrity Gate), interleaved with a
    // normal turn sequence.
    peer.notify("thread/status/changed", {
      threadId,
      status: { type: "active", activeFlags: [] },
    });
    peer.notify("turn/started", {
      threadId,
      turn: { id: turnId, items: [], status: "inProgress" },
    });
    peer.notify("mcpServer/startupStatus/updated", {
      threadId,
      name: "codex_apps",
      status: "ready",
      error: null,
      failureReason: null,
    });

    const agentItemId = "agent-item-e15";
    peer.notify("item/started", {
      item: {
        type: "agentMessage",
        id: agentItemId,
        text: "",
        phase: "final_answer",
        memoryCitation: null,
      },
      startedAtMs: Date.now(),
      threadId,
      turnId,
    });
    peer.notify("item/agentMessage/delta", {
      threadId,
      turnId,
      itemId: agentItemId,
      delta: "Hi",
    });
    peer.notify("thread/tokenUsage/updated", {
      threadId,
      turnId,
      tokenUsage: {
        total: {
          totalTokens: 1,
          inputTokens: 1,
          cachedInputTokens: 0,
          cacheWriteInputTokens: 0,
          outputTokens: 0,
        },
      },
    });
    peer.notify("item/completed", {
      item: {
        type: "agentMessage",
        id: agentItemId,
        text: "Hi",
        phase: "final_answer",
        memoryCitation: null,
      },
      completedAtMs: Date.now(),
      threadId,
      turnId,
    });
    peer.notify("account/rateLimits/updated", {
      rateLimits: {
        limitId: "codex",
        limitName: null,
        primary: { usedPercent: 1, windowDurationMins: 1, resetsAt: 0 },
        secondary: null,
        credits: { hasCredits: false, unlimited: false, balance: "0" },
        individualLimit: null,
      },
    });
    peer.notify("turn/completed", {
      threadId,
      turn: { id: turnId, items: [], status: "completed" },
    });

    const messages = await messagesPromise;
    const outputs = messages.filter((m) => m.type === "output") as {
      type: "output";
      data: string;
    }[];
    assert.equal(
      outputs.map((m) => m.data).join(""),
      "Hi",
      "unmodeled events must not appear as spurious output",
    );

    // Host process is still alive and the session is still usable afterward.
    const getResponse = await fetch(`${host.url}/sessions/${id}`);
    assert.equal(getResponse.status, 200);
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});

// E16 — Provider identifiers never leak into Harness session identity.
// Verifies: R4, R13.
test("E16: provider identifiers never leak into Harness session identity", async () => {
  const port = await randomFreePort();
  const { host, id, peer, threadId, socket } =
    await startAttachedCodexSession(port);
  try {
    sendInput(socket, "hello\r");
    const turnStart = await waitForTurnStart(peer);
    const { turnId, userItemId, agentItemId } = await driveNormalTurn(
      peer,
      turnStart,
      { threadId, finalText: "Hi" },
    );

    const providerIds = [threadId, turnId, userItemId, agentItemId];
    for (const providerId of providerIds) {
      assert.notEqual(
        id,
        providerId,
        `Harness id must not equal provider id ${providerId}`,
      );
      assert.ok(
        !id.includes(providerId),
        `Harness id must not embed provider id ${providerId}`,
      );
      assert.ok(
        !providerId.includes(id),
        `provider id ${providerId} must not embed the Harness id`,
      );
    }
  } finally {
    socket.close();
    await host.close();
    peer.exit();
  }
});
