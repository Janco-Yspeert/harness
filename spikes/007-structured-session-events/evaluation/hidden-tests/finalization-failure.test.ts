// Case E7.
//
// A backend cleanup/finalization error must not suppress session.ended once
// Harness has permanently removed the public session identity. This mirrors
// the public repository's own proven "returns 500 when forced App Server
// teardown cannot finalize" scenario, adding the structured-event assertion
// on top of that already-established behaviour.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  startHarnessHost,
  type SessionBackend,
} from "../../../../harness/src/index.ts";
import { createCodexBackend } from "../../../../harness/src/codex-backend.ts";
import { assertEnvelope } from "./support/envelope.ts";
import {
  collectRaw,
  connectEvents,
  createSession,
  deleteSession,
  disconnect,
  MemoryBackend,
  sessionStatus,
  waitUntil,
} from "./support/helpers.ts";

const fixture = new URL(
  "../../../../harness/fixtures/fake-app-server.mjs",
  import.meta.url,
);

class RejectingBackend extends MemoryBackend implements SessionBackend {
  override stop(): Promise<void> {
    this.stopCalls += 1;
    return Promise.reject(new Error("deliberate finalization failure"));
  }
}

await test("in-memory backend: stop() rejecting still yields exactly one session.ended once removed", async () => {
  const backend = new RejectingBackend();
  const host = await startHarnessHost(0, { createBackend: () => backend });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);

      const status = await deleteSession(host, id);
      assert.notEqual(status, 204, "the finalization error should surface on the DELETE response");
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => messages.length === 2);

      const ended = assertEnvelope(messages[1]);
      assert.equal(ended.meta.type, "session.ended");
      assert.equal(ended.meta.streamId, id);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});

await test("Codex: forced App Server teardown failure (500) still yields session.ended once the identity is removed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "spike007-codex-finalize-fail-"));
  const child = spawn(process.execPath, [fixture.pathname, "success"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  const processThatNeverExits = {
    stdin: child.stdin,
    stdout: child.stdout,
    stderr: child.stderr,
    pid: child.pid,
    on: (event: "exit", listener: (...args: unknown[]) => void) =>
      child.on(event, listener),
    kill: () => true,
  };
  const host = await startHarnessHost(0, {
    createBackend: () =>
      createCodexBackend({
        cwd: directory,
        spawnAppServer: () => processThatNeverExits as never,
      }),
  });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);
      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);

      const status = await deleteSession(host, id);
      assert.equal(status, 500);
      await waitUntil(async () => (await sessionStatus(host, id)) === 404);
      await waitUntil(() => messages.length === 2);

      const ended = assertEnvelope(messages[1]);
      assert.equal(ended.meta.type, "session.ended");
      assert.equal(ended.meta.streamId, id);
    } finally {
      await disconnect(events);
    }
  } finally {
    child.kill("SIGKILL");
    await once(child, "exit");
    await host.close();
  }
});
