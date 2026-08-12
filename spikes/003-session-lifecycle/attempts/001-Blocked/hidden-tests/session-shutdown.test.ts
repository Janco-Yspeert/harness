import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  connect,
  disconnect,
  pidAlive,
  postJson,
  randomFreePort,
  readBashPid,
  spawnBackgroundJob,
  spawnHarnessCli,
} from "./helpers.ts";

async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  assert.equal(response.status, 201);
  return (response.body as { id: string }).id;
}

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

test("E20: programmatic shutdown terminates the active session and its process-group descendants", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const socket = await connect(wsUrlFor(host.url, id));
    const shellPid = await readBashPid(socket);
    const bgPid = await spawnBackgroundJob(socket, "sleep 60");
    await disconnect(socket);

    await host.close();

    assert.equal(
      pidAlive(shellPid),
      false,
      `shell pid ${shellPid} still alive after programmatic shutdown`,
    );
    assert.equal(
      pidAlive(bgPid),
      false,
      `background pid ${bgPid} still alive after programmatic shutdown`,
    );
  } finally {
    // startHarnessHost's close() is idempotent-safe to call again; this
    // guarantees the PTY/server are torn down even if an assertion above
    // threw before the primary close() call was reached.
    await host.close();
  }
});

async function assertSignalCleansUpSession(
  signal: NodeJS.Signals,
): Promise<void> {
  const port = await randomFreePort();
  const proc = await spawnHarnessCli(port);

  try {
    const id = await createSession(proc.url);
    const socket = await connect(wsUrlFor(proc.url, id));
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
    // assertion above threw before the signal was sent. A leaked child here
    // would keep this test file's own process alive indefinitely (spawned
    // children are ref'd by default), hanging the whole hidden-test run.
    if (pidAlive(proc.pid)) {
      proc.signal("SIGKILL");
      await proc.waitForExit();
    }
  }
}

test("E21: SIGINT shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGINT");
});

test("E21: SIGTERM shuts down and cleans up the active session", async () => {
  await assertSignalCleansUpSession("SIGTERM");
});
