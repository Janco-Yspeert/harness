/* global process, setTimeout */

import { appendFileSync } from "node:fs";
import { createInterface } from "node:readline";

const mode = process.argv[2] ?? "success";
const logPath = process.argv[3];
let turnNumber = 0;
let failedTurn = false;

function log(value) {
  if (logPath !== undefined)
    appendFileSync(logPath, `${JSON.stringify(value)}\n`);
}

function send(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function completeTurn(turnId, text, emitDelta = true) {
  const itemId = `item-${turnId}`;
  if (emitDelta) {
    send({
      method: "item/agentMessage/delta",
      params: { threadId: "provider-thread", turnId, itemId, delta: text },
    });
  }
  send({
    method: "item/completed",
    params: {
      threadId: "provider-thread",
      turnId,
      completedAtMs: Date.now(),
      item: { type: "agentMessage", id: itemId, text },
    },
  });
  send({
    method: "turn/completed",
    params: {
      threadId: "provider-thread",
      turn: { id: turnId, status: "completed", items: [], error: null },
    },
  });
}

createInterface({ input: process.stdin }).on("line", (line) => {
  const message = JSON.parse(line);
  log(message);

  if (message.method === "initialize") {
    send({ id: message.id, result: { userAgent: "fake" } });
    return;
  }
  if (message.method === "initialized") return;
  if (message.method === "thread/start") {
    if (mode === "fail-thread") {
      send({
        id: message.id,
        error: { code: -32000, message: "secret-start" },
      });
    } else {
      send({ id: message.id, result: { thread: { id: "provider-thread" } } });
    }
    return;
  }
  if (message.method === "turn/start") {
    if (mode === "fail-turn-once" && !failedTurn) {
      failedTurn = true;
      send({ id: message.id, error: { code: -32001, message: "secret-turn" } });
      return;
    }
    turnNumber += 1;
    const turnId = `turn-${String(turnNumber)}`;
    const text = message.params.input[0].text;
    send({
      id: message.id,
      result: {
        turn: { id: turnId, status: "inProgress", items: [], error: null },
      },
    });
    if (text === "exit-backend") {
      setTimeout(() => process.exit(17), 10);
    } else if (text !== "hold") {
      setTimeout(
        () =>
          completeTurn(
            turnId,
            `reply-${String(turnNumber)}`,
            text !== "no-delta",
          ),
        10,
      );
    }
    return;
  }
  if (message.method === "turn/interrupt") {
    if (mode !== "hang-interrupt") {
      send({ id: message.id, result: {} });
      send({
        method: "turn/completed",
        params: {
          threadId: "provider-thread",
          turn: {
            id: message.params.turnId,
            status: "interrupted",
            items: [],
            error: null,
          },
        },
      });
    }
  }
});
