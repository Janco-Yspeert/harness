import assert from "node:assert/strict";
import test from "node:test";

import {
  autoHandshake,
  createCodexBackend,
  createSession,
  isPendingAfter,
  makeFakeAppServer,
  postJson,
  randomFreePort,
  startHost,
} from "./helpers.ts";

// E2 — 201 arrives only after both initialize and thread/start resolve, in
// order; the Harness ID differs from the provider thread ID.
// Verifies: R3, R4, N1.
test("E2: 201 withheld until both initialize and thread/start resolve; Harness id differs from thread id", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      }),
  });
  try {
    const created = postJson(`${host.url}/sessions`);

    const init = await peer.waitForRequest("initialize");
    assert.equal(
      await isPendingAfter(created, 150),
      true,
      "POST must not resolve before initialize is answered",
    );

    peer.respond(init.id, {
      userAgent: "fake/0.0.0",
      codexHome: "/fake",
      platformFamily: "unix",
      platformOs: "linux",
    });
    const start = await peer.waitForRequest("thread/start");
    assert.equal(
      await isPendingAfter(created, 150),
      true,
      "POST must not resolve before thread/start is answered",
    );

    const threadId = "thread-e2";
    peer.respond(start.id, {
      thread: {
        id: threadId,
        sessionId: threadId,
        cliVersion: "0.147.0-fake",
        createdAt: 0,
        updatedAt: 0,
        cwd: "/tmp",
        ephemeral: false,
        modelProvider: "openai",
        preview: "",
        source: "appServer",
        status: { type: "idle" },
        turns: [],
      },
    });

    const response = await created;
    assert.equal(response.status, 201);
    const { id } = response.body as { id: string };
    assert.notEqual(id, threadId);
  } finally {
    await host.close();
    peer.exit();
  }
});

// E3 — Concurrent POST during Codex startup is rejected without disturbing
// the in-progress startup, and starts exactly one App Server thread.
// Verifies: R3, I1.
test("E3: concurrent POST during Codex startup is rejected 409 without disturbing it", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      }),
  });
  try {
    // DIAGNOSTIC/EVALUATOR-REPAIR FIX (see verify-2026-08-14-diagnostics/README.md):
    // the frozen v1 version consumed the "initialize" request itself via a
    // bare waitForRequest() call and never responded to it, then separately
    // started autoHandshake() — which waits for a *second* initialize
    // request that can never arrive (startup only happens once, since the
    // second POST is rejected). That deadlocked every run. Let autoHandshake
    // own the entire handshake from the start instead.
    const first = postJson(`${host.url}/sessions`);
    const handshakeDone = autoHandshake(peer);
    await new Promise((resolve) => setTimeout(resolve, 100)); // let startup demonstrably begin

    const second = await postJson(`${host.url}/sessions`);
    assert.equal(second.status, 409);

    const firstResponse = await first;
    assert.equal(firstResponse.status, 201);
    await handshakeDone;

    const threadStartRequests = peer.requestLog.filter(
      (r) => r.method === "thread/start",
    );
    assert.equal(threadStartRequests.length, 1);
  } finally {
    await host.close();
    peer.exit();
  }
});

// E4 — Failed App Server initialize is failure-safe.
// Verifies: R5, N1, N2. Assumption: A4.
test("E4: failed initialize does not yield 201 and does not block a later session", async () => {
  const port = await randomFreePort();
  const badPeer = makeFakeAppServer();
  let attempt = 0;
  const goodPeer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () => {
      attempt++;
      const peer = attempt === 1 ? badPeer : goodPeer;
      return createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      });
    },
  });
  try {
    const created = postJson(`${host.url}/sessions`);
    const init = await badPeer.waitForRequest("initialize");
    badPeer.respondError(init.id, {
      code: -32000,
      message: "simulated initialize failure",
    });
    const response = await created;
    assert.notEqual(response.status, 201);
    assert.ok(response.status >= 400);

    const handshakeDone = autoHandshake(goodPeer);
    const retry = await postJson(`${host.url}/sessions`);
    assert.equal(retry.status, 201);
    await handshakeDone;
  } finally {
    await host.close();
    badPeer.exit();
    goodPeer.exit();
  }
});

// E5 — Failed thread/start (after successful initialize) is failure-safe.
// Verifies: R5, N1, N2. Assumption: A4.
test("E5: failed thread/start does not yield 201 and does not block a later session", async () => {
  const port = await randomFreePort();
  const badPeer = makeFakeAppServer();
  const goodPeer = makeFakeAppServer();
  let attempt = 0;
  const host = await startHost(port, {
    createBackend: () => {
      attempt++;
      const peer = attempt === 1 ? badPeer : goodPeer;
      return createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      });
    },
  });
  try {
    const created = postJson(`${host.url}/sessions`);
    const init = await badPeer.waitForRequest("initialize");
    badPeer.respond(init.id, {
      userAgent: "fake/0.0.0",
      codexHome: "/fake",
      platformFamily: "unix",
      platformOs: "linux",
    });
    const start = await badPeer.waitForRequest("thread/start");
    badPeer.respondError(start.id, {
      code: -32000,
      message: "simulated thread/start failure",
    });
    const response = await created;
    assert.notEqual(response.status, 201);
    assert.ok(response.status >= 400);

    const handshakeDone = autoHandshake(goodPeer);
    const retryId = await createSession(host.url);
    assert.ok(retryId.length > 0);
    await handshakeDone;
  } finally {
    await host.close();
    badPeer.exit();
    goodPeer.exit();
  }
});

// E6 — Startup diagnostics are recorded and sanitized.
// Verifies: R6, N8.
test("E6: startup-failure diagnostics are recorded and do not leak the raw secret", async () => {
  const port = await randomFreePort();
  const peer = makeFakeAppServer();
  const host = await startHost(port, {
    createBackend: () =>
      createCodexBackend({
        cwd: "/tmp",
        spawnAppServer: () => peer.appServerProcess,
      }),
  });
  const plantedSecret = `sk-selfcheck-secret-${Math.random().toString(36).slice(2)}`;
  const originals = {
    error: console.error,
    warn: console.warn,
    log: console.log,
  };
  const captured: string[] = [];
  const capture =
    (name: string) =>
    (...args: unknown[]) => {
      captured.push(
        `[${name}] ` +
          args
            .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
            .join(" "),
      );
    };
  console.error = capture("error");
  console.warn = capture("warn");
  console.log = capture("log");
  try {
    const created = postJson(`${host.url}/sessions`);
    const init = await peer.waitForRequest("initialize");
    peer.respondError(init.id, {
      code: -32000,
      message: "simulated failure",
      data: { authorization: `Bearer ${plantedSecret}` },
    });
    const response = await created;
    assert.notEqual(response.status, 201);

    const combined = captured.join("\n");
    assert.ok(
      !combined.includes(plantedSecret),
      `captured diagnostics must not include the raw secret; got: ${combined}`,
    );
  } finally {
    console.error = originals.error;
    console.warn = originals.warn;
    console.log = originals.log;
    await host.close();
    peer.exit();
  }
});
