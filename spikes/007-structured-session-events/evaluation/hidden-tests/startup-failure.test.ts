// Case E4.
//
// A failed session startup must emit no session.started for that attempt,
// and the failed attempt must not appear as a successfully started Harness
// session. The event channel must remain live afterward: a subsequent
// successful session on the same connected event client must still be
// observed, proving the earlier silence was the correct absence of an
// event rather than a dead or broken channel.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";
import { createCodexBackend } from "../../../../harness/src/codex-backend.ts";
import { assertEnvelope } from "./support/envelope.ts";
import {
  collectRaw,
  connectEvents,
  createSession,
  Deferred,
  disconnect,
  settle,
  waitUntil,
} from "./support/helpers.ts";

const fixture = new URL(
  "../../../../harness/fixtures/fake-app-server.mjs",
  import.meta.url,
);

await test("PTY-style: rejected backend construction emits no session.started, channel stays live", async () => {
  const failure = new Deferred<never>();
  let attempts = 0;
  const host = await startHarnessHost(0, {
    createBackend: () => {
      attempts += 1;
      return failure.promise;
    },
  });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);

      const attempt = fetch(`${host.url}/sessions`, { method: "POST" });
      await waitUntil(() => attempts === 1);
      failure.reject(new Error("deliberate startup failure"));
      const response = await attempt;
      assert.notEqual(response.status, 201);

      await settle();
      assert.equal(
        messages.length,
        0,
        "no session.started may be emitted for a failed startup attempt",
      );
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});

await test("Codex: failed thread creation emits no session.started, and the channel remains live for the next success", async () => {
  const directory = await mkdtemp(join(tmpdir(), "spike007-codex-startup-fail-"));
  let attempt = 0;
  const host = await startHarnessHost(0, {
    createBackend: () => {
      const mode = attempt++ === 0 ? "fail-thread" : "success";
      return createCodexBackend({
        cwd: directory,
        spawnAppServer: () =>
          spawn(process.execPath, [fixture.pathname, mode], {
            stdio: ["pipe", "pipe", "pipe"],
          }),
      });
    },
  });
  try {
    const events = await connectEvents(host);
    try {
      const { messages } = collectRaw(events);

      const failed = await fetch(`${host.url}/sessions`, { method: "POST" });
      assert.notEqual(failed.status, 201);
      await settle();
      assert.equal(messages.length, 0);

      const id = await createSession(host);
      await waitUntil(() => messages.length === 1);
      const started = assertEnvelope(messages[0]);
      assert.equal(started.meta.type, "session.started");
      assert.equal(started.meta.streamId, id);
    } finally {
      await disconnect(events);
    }
  } finally {
    await host.close();
  }
});
