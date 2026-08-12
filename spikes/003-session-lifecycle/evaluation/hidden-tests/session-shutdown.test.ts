import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  connect,
  createSession,
  disconnect,
  pidAlive,
  randomFreePort,
  readBashPid,
  spawnHarnessCli,
} from "./helpers.ts";

test("E19: programmatic shutdown terminates the active session's own PTY/Bash process", async () => {
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
    // assertion above threw before the signal was sent (attempt 001's
    // shutdown tests originally leaked this process on early failure).
    if (pidAlive(proc.pid)) {
      proc.signal("SIGKILL");
      await proc.waitForExit();
    }
  }
}

test("E20: SIGINT shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGINT");
});

test("E20: SIGTERM shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGTERM");
});
