import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  connect,
  createSession,
  disconnect,
  makeControllableBackend,
  pidAlive,
  randomFreePort,
  readBashPid,
  spawnHarnessCli,
  startHost,
} from "./helpers.ts";

// E31/E33 are baseline regression, adapted from spike 003's promoted hidden
// tests (session-shutdown.test.ts). E32 is new for spike 004: the
// non-PTY-backend equivalent of E31, proving host.close() finalizes
// whichever backend is active, not specifically a PTY/Bash process.

test("E31: programmatic shutdown terminates the active session's own PTY/Bash process", async () => {
  const host = await startHarnessHost(0);
  const id = await createSession(host.url);
  const socket = await connect(host.url, id);
  const shellPid = await readBashPid(socket);
  await disconnect(socket);

  await host.close();

  assert.equal(
    pidAlive(shellPid),
    false,
    `shell pid ${shellPid} still alive after programmatic shutdown`,
  );
});

test("E32: programmatic shutdown finalizes a non-PTY backend", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const host = await startHost(0, { createBackend: backend.factory });
  const response = await fetch(`${host.url}/sessions`, { method: "POST" });
  assert.equal(response.status, 201);

  await host.close();

  assert.ok(
    backend.stopCalls >= 1,
    "host.close() did not invoke the backend's stop()",
  );
});

async function assertSignalCleansUpSession(
  signal: NodeJS.Signals,
): Promise<void> {
  const port = await randomFreePort();
  const proc = await spawnHarnessCli(port);

  try {
    const id = await createSession(proc.url);
    const socket = await connect(proc.url, id);
    const shellPid = await readBashPid(socket);
    await disconnect(socket);

    proc.signal(signal);
    await proc.waitForExit();

    assert.equal(
      pidAlive(shellPid),
      false,
      `shell pid ${shellPid} still alive after ${signal} shutdown`,
    );
  } finally {
    // Guarantee the spawned CLI process never outlives the test, even if an
    // assertion above threw before the signal was sent.
    if (pidAlive(proc.pid)) {
      proc.signal("SIGKILL");
      await proc.waitForExit();
    }
  }
}

test("E33: SIGINT shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGINT");
});

test("E33: SIGTERM shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGTERM");
});
