import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  collectOutputFor,
  connect,
  disconnect,
  postJson,
  readBashPid,
  sendAndWait,
  spawnBackgroundJob,
} from "./helpers.ts";

async function createSession(hostUrl: string): Promise<string> {
  const response = await postJson(`${hostUrl}/sessions`);
  assert.equal(response.status, 201);
  return (response.body as { id: string }).id;
}

function wsUrlFor(hostUrl: string, id: string): string {
  return hostUrl.replace("http://", "ws://") + `/sessions/${id}/ws`;
}

test("E10: detaching does not stop the session; reattach reaches the same shell process", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(wsUrlFor(host.url, id));
    const firstPid = await readBashPid(first);
    await disconnect(first);

    const second = await connect(wsUrlFor(host.url, id));
    const secondPid = await readBashPid(second);
    assert.equal(secondPid, firstPid);
    await disconnect(second);
  } finally {
    await host.close();
  }
});

test("E11: shell state set before detaching survives reattachment", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(wsUrlFor(host.url, id));

    await sendAndWait(
      first,
      "cd /tmp && echo __HARNESS_CD_DONE__",
      /__HARNESS_CD_DONE__\r?\n/,
    );
    await sendAndWait(
      first,
      "export HARNESS_TEST_VAR=__HARNESS_ENV_MARKER__ && echo __HARNESS_EXPORT_DONE__",
      /__HARNESS_EXPORT_DONE__\r?\n/,
    );
    await disconnect(first);

    const second = await connect(wsUrlFor(host.url, id));
    const pwd = await sendAndWait(
      second,
      `printf '%s:%s\\n' __HARNESS_PWD__ "$PWD"`,
      /__HARNESS_PWD__:(.+)\r?\n/,
    );
    assert.equal(pwd[1], "/tmp");

    const env = await sendAndWait(
      second,
      "echo __HARNESS_ENV__:$HARNESS_TEST_VAR",
      /__HARNESS_ENV__:(\S*)\r?\n/,
    );
    assert.equal(env[1], "__HARNESS_ENV_MARKER__");
    await disconnect(second);
  } finally {
    await host.close();
  }
});

test("E12: output produced while detached is not retained or replayed on reattach", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(wsUrlFor(host.url, id));

    await spawnBackgroundJob(first, "sleep 0.5; echo __HARNESS_STALE_MARKER__");
    await disconnect(first);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const second = await connect(wsUrlFor(host.url, id));
    const collected = collectOutputFor(second, 300);
    await sendAndWait(
      second,
      "echo __HARNESS_FRESH_MARKER__",
      /__HARNESS_FRESH_MARKER__\r?\n/,
    );
    const earlyOutput = await collected;

    assert.ok(
      !earlyOutput.includes("__HARNESS_STALE_MARKER__"),
      `stale output was replayed to the reattached client: ${JSON.stringify(earlyOutput)}`,
    );
    await disconnect(second);
  } finally {
    await host.close();
  }
});
