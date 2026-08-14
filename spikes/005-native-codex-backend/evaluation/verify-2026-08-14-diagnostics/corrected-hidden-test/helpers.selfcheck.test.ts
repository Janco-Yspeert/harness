// Support: independent self-checks for the shared evaluator helpers used by
// Spike 005's mandatory evaluation cases. Not itself a set of evaluation
// cases (see manifest.json). Run in isolation, unrelated to whether the
// Codex-backend implementation under test exists yet — everything here
// exercises fixtures/fake-app-server.ts and the choreography helpers in
// helpers.ts directly, driving the real child-process/stdio/IPC transport by
// hand (simulating exactly what a real CodexBackend implementation would
// write/read), per the Pre-Freeze Integrity Gate's requirement that shared
// helpers be validated end-to-end through the real transport boundary they
// are used across, not merely in isolated calls.

import assert from "node:assert/strict";
import { createInterface } from "node:readline";
import test from "node:test";

import {
  autoHandshake,
  createCodexBackend,
  driveNormalTurn,
  isPendingAfter,
  makeCodexBackendFactoryController,
  makeFakeAppServer,
  makeUnkillableAppServerProcess,
  waitForTurnStart,
  type FakeAppServer,
} from "./helpers.ts";

/** Reads and JSON-parses the next `count` newline-delimited stdout lines. */
function readLines(peer: FakeAppServer, count: number): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const results: unknown[] = [];
    const rl = createInterface({ input: peer.stdout, crlfDelay: Infinity });
    const timer = setTimeout(() => {
      rl.close();
      reject(
        new Error(
          `Timed out waiting for ${String(count)} stdout lines; got ${String(results.length)}`,
        ),
      );
    }, 5000);
    rl.on("line", (line) => {
      if (results.length >= count) return; // guard against readline delivering multiple buffered lines synchronously past `count`
      const trimmed = line.trim();
      if (trimmed.length === 0) return;
      results.push(JSON.parse(trimmed));
      if (results.length >= count) {
        clearTimeout(timer);
        rl.close();
        resolve(results);
      }
    });
  });
}

function writeRequest(
  peer: FakeAppServer,
  id: unknown,
  method: string,
  params: unknown,
): void {
  peer.stdin.write(JSON.stringify({ id, method, params }) + "\n");
}

async function stopPeer(peer: FakeAppServer): Promise<void> {
  if (peer.child.exitCode !== null || peer.child.signalCode !== null) return;
  peer.child.kill("SIGKILL");
  await new Promise<void>((resolve) => {
    peer.child.once("exit", () => resolve());
  });
}

test("selfcheck: fake app-server round-trips a request/response over the real stdio transport (positive control)", async () => {
  const peer = makeFakeAppServer();
  try {
    writeRequest(peer, 1, "initialize", {
      clientInfo: { name: "selfcheck", version: "0.0.0" },
    });
    const request = await peer.waitForRequest("initialize");
    assert.equal(request.id, 1);
    assert.deepEqual(request.params, {
      clientInfo: { name: "selfcheck", version: "0.0.0" },
    });

    const [line] = await Promise.all([
      readLines(peer, 1),
      Promise.resolve(peer.respond(1, { ok: true })),
    ]);
    assert.deepEqual(line[0], { id: 1, result: { ok: true } });
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: malformed input line is reported, not crashed on (negative control)", async () => {
  const peer = makeFakeAppServer();
  try {
    const parseErrors: unknown[] = [];
    peer.child.on("message", (raw: unknown) => {
      const event = raw as { event: string };
      if (event.event === "parseError") parseErrors.push(event);
    });
    peer.stdin.write("not json at all\n");
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert.equal(parseErrors.length, 1);
    assert.equal(peer.requestLog.length, 0);

    // Peer is still alive and functional after the malformed line.
    writeRequest(peer, "still-alive", "ping", {});
    const request = await peer.waitForRequest("ping");
    assert.equal(request.id, "still-alive");
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: waitForRequest resolves already-queued and not-yet-arrived requests correctly, in order (FIFO)", async () => {
  const peer = makeFakeAppServer();
  try {
    // Branch 1: message arrives before waitForRequest is called (queued path).
    writeRequest(peer, "a", "turn/start", { n: 1 });
    writeRequest(peer, "b", "turn/start", { n: 2 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const first = await peer.waitForRequest("turn/start");
    const second = await peer.waitForRequest("turn/start");
    assert.equal(first.id, "a");
    assert.equal(second.id, "b");

    // Branch 2: waitForRequest is called before the message arrives (waiter path).
    const pending = peer.waitForRequest("turn/start");
    writeRequest(peer, "c", "turn/start", { n: 3 });
    const third = await pending;
    assert.equal(third.id, "c");

    assert.deepEqual(
      peer.requestLog.map((r) => r.id),
      ["a", "b", "c"],
    );
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: ignoreSigterm makes the peer survive SIGTERM; without it, SIGTERM exits promptly (positive + negative control)", async () => {
  const normal = makeFakeAppServer();
  try {
    await normal.ready; // must not send the signal before the handler is registered
    normal.child.kill("SIGTERM");
    const { signal } = await normal.waitForExit(2000);
    assert.equal(signal, null); // process.exit(0) from within the handler, not signal-killed
  } finally {
    await stopPeer(normal);
  }

  const stubborn = makeFakeAppServer();
  try {
    await stubborn.ready;
    stubborn.ignoreSigterm();
    await new Promise((resolve) => setTimeout(resolve, 150)); // let the IPC command land
    stubborn.child.kill("SIGTERM");
    let exited = false;
    stubborn.child.once("exit", () => {
      exited = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.equal(
      exited,
      false,
      "peer should still be alive after SIGTERM while ignoring it",
    );
  } finally {
    await stopPeer(stubborn); // SIGKILL cannot be ignored; always cleans up
  }
});

test("selfcheck: peer.exit(code) commands the peer to exit with that code", async () => {
  const peer = makeFakeAppServer();
  try {
    peer.exit(7);
    const { code } = await peer.waitForExit(2000);
    assert.equal(code, 7);
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: autoHandshake satisfies a real initialize + thread/start exchange with correct shapes", async () => {
  const peer = makeFakeAppServer();
  try {
    const handshakeDone = autoHandshake(peer, { threadId: "fixed-thread-id" });
    writeRequest(peer, 1, "initialize", {
      clientInfo: { name: "cb", version: "0.0.0" },
      capabilities: { experimentalApi: false },
    });
    writeRequest(peer, 2, "thread/start", { cwd: "/tmp/selfcheck-cwd" });
    const [initLine, startLine] = await readLines(peer, 2);
    const result = await handshakeDone;

    assert.equal(result.threadId, "fixed-thread-id");
    assert.deepEqual(initLine, {
      id: 1,
      result: (initLine as { result: unknown }).result,
    });
    assert.deepEqual(startLine, {
      id: 2,
      result: {
        thread: (startLine as { result: { thread: unknown } }).result.thread,
      },
    });
    const thread = (
      startLine as { result: { thread: Record<string, unknown> } }
    ).result.thread;
    assert.equal(thread.id, "fixed-thread-id");
    assert.equal(thread.cwd, "/tmp/selfcheck-cwd");
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: driveNormalTurn emits the empirically-observed notification sequence with no delta duplication", async () => {
  const peer = makeFakeAppServer();
  try {
    writeRequest(peer, "turn-req-1", "turn/start", {
      threadId: "T1",
      input: [{ type: "text", text: "hi" }],
    });
    const turnStartPromise = waitForTurnStart(peer);
    // response + turn/started + item/started(user) + item/completed(user) +
    // item/started(agent) + 2 deltas + item/completed(agent) + turn/completed = 9 lines.
    // Read all 9 in one call: readline coalesces buffered chunks, so reading
    // this in two separate calls risks the second call missing lines already
    // consumed (and discarded) by the first reader's internal chunk parsing.
    const lines = readLines(peer, 9);
    const turnStart = await turnStartPromise;
    assert.equal(turnStart.threadId, "T1");
    assert.equal(turnStart.text, "hi");

    await driveNormalTurn(peer, turnStart, {
      threadId: "T1",
      turnId: "TURN1",
      deltas: ["Hel", "lo"],
      finalText: "Hello",
    });
    const collected = await lines;

    const methods = collected.map((m) =>
      "method" in (m as object)
        ? (m as { method: string }).method
        : `(response id=${JSON.stringify((m as { id: unknown }).id)})`,
    );
    assert.deepEqual(methods, [
      `(response id="turn-req-1")`,
      "turn/started",
      "item/started",
      "item/completed",
      "item/started",
      "item/agentMessage/delta",
      "item/agentMessage/delta",
      "item/completed",
      "turn/completed",
    ]);
    const turnCompleted = collected[8];
    assert.equal(
      (turnCompleted as { method: string }).method,
      "turn/completed",
    );
    assert.equal(
      (turnCompleted as { params: { turn: { status: string } } }).params.turn
        .status,
      "completed",
    );

    const deltaChunks = collected
      .filter(
        (m) => (m as { method?: string }).method === "item/agentMessage/delta",
      )
      .map((m) => (m as { params: { delta: string } }).params.delta);
    assert.equal(deltaChunks.join(""), "Hello");

    const completedTexts = collected
      .filter((m) => (m as { method?: string }).method === "item/completed")
      .map(
        (m) =>
          (m as { params: { item: { type: string; text?: string } } }).params
            .item,
      );
    const agentCompleted = completedTexts.find(
      (item) => item.type === "agentMessage",
    );
    assert.equal(agentCompleted?.text, "Hello");
  } finally {
    await stopPeer(peer);
  }
});

test("selfcheck: makeCodexBackendFactoryController hands out a distinct peer per invocation and tracks invocation count accurately", async () => {
  const controller = makeCodexBackendFactoryController();
  assert.equal(controller.invocationCount, 0);

  // Fire the factory twice without awaiting either fully (mirrors how tests
  // drive concurrent/sequential creation attempts).
  const attempt1Promise = controller.attempt(1);
  void controller.factory().catch(() => undefined); // will reject pre-implementation; irrelevant here
  const attempt1 = await attempt1Promise;
  assert.equal(controller.invocationCount, 1);

  const attempt2Promise = controller.attempt(2);
  let attempt2Resolved = false;
  void attempt2Promise.then(() => {
    attempt2Resolved = true;
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(
    attempt2Resolved,
    false,
    "attempt(2) must not resolve before a second invocation happens",
  );

  void controller.factory().catch(() => undefined);
  const attempt2 = await attempt2Promise;
  assert.equal(controller.invocationCount, 2);
  assert.notEqual(attempt1.peer.child.pid, attempt2.peer.child.pid);

  await stopPeer(attempt1.peer);
  await stopPeer(attempt2.peer);
});

test("selfcheck: isPendingAfter reports false for an already-settled promise and true for one still pending (positive + negative control)", async () => {
  const resolved = Promise.resolve(42);
  assert.equal(await isPendingAfter(resolved, 50), false);

  const rejected = Promise.reject(new Error("boom"));
  rejected.catch(() => undefined); // prevent unhandled-rejection noise
  assert.equal(await isPendingAfter(rejected, 50), false);

  const slow = new Promise((resolve) => setTimeout(() => resolve("done"), 300));
  assert.equal(await isPendingAfter(slow, 50), true);
  await slow; // let it settle before the test ends
});

// DIAGNOSTIC/EVALUATOR-REPAIR REVISION (see verify-2026-08-14-diagnostics/README.md).
// The frozen v1 self-check asserted that createCodexBackend's dynamic-import
// seam failed informatively before src/codex-backend.ts existed — a
// pre-implementation-only validation that necessarily stops applying once
// the module is real. This is the natural positive-control counterpart: the
// same seam must resolve to a real, structurally-correct SessionBackend once
// the module is present, using the fake peer so no live provider is needed.
test("selfcheck: createCodexBackend's dynamic-import seam resolves through the real module once it exists", async () => {
  const peer = makeFakeAppServer();
  try {
    const handshakeDone = autoHandshake(peer);
    const backend = await createCodexBackend({
      cwd: "/tmp",
      spawnAppServer: () => peer.appServerProcess,
    });
    await handshakeDone;
    assert.equal(typeof backend.write, "function");
    assert.equal(typeof backend.onData, "function");
    assert.equal(typeof backend.onExit, "function");
    assert.equal(typeof backend.stop, "function");
    await backend.stop();
  } finally {
    peer.exit();
  }
});

test("selfcheck: makeUnkillableAppServerProcess accepts kill() without ever forwarding it (positive + negative control)", async () => {
  const peer = makeFakeAppServer();
  try {
    const unkillable = makeUnkillableAppServerProcess(peer);
    const accepted = unkillable.kill("SIGTERM"); // positive control: kill() itself must still report success
    assert.equal(accepted, true);

    let exited = false;
    unkillable.on("exit", () => {
      exited = true;
    });
    unkillable.kill("SIGKILL");
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Negative control: even "SIGKILL" through the wrapper must not reach
    // the real process — unlike ignoring SIGTERM, this cannot be defeated
    // by any correct signal-escalation strategy.
    assert.equal(
      exited,
      false,
      "wrapped process must not exit no matter what signal is sent through it",
    );
    assert.equal(peer.child.exitCode, null);
    assert.equal(peer.child.signalCode, null);
  } finally {
    peer.child.kill("SIGKILL"); // reap the real process directly, bypassing the wrapper
  }
});
