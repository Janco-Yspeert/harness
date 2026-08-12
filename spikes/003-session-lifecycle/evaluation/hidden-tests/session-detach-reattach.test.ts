import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

import {
  buildQueryCommand,
  collectOutputFor,
  connect,
  createSession,
  disconnect,
  readBashPid,
  sendAndWait,
} from "./helpers.ts";

test("E10: detaching does not stop the session; reattach reaches the same shell process", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(host.url, id);
    const firstPid = await readBashPid(first);
    await disconnect(first);

    const second = await connect(host.url, id);
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
    const first = await connect(host.url, id);

    const cd = buildQueryCommand("CD_DONE");
    await sendAndWait(first, `cd /tmp && ${cd.command}`, cd.pattern);

    const exportVar = buildQueryCommand("EXPORT_DONE");
    await sendAndWait(
      first,
      `export HARNESS_TEST_VAR=marker_value && ${exportVar.command}`,
      exportVar.pattern,
    );
    await disconnect(first);

    const second = await connect(host.url, id);

    const pwdQuery = buildQueryCommand("PWD", "$PWD");
    const pwdMatch = await sendAndWait(
      second,
      pwdQuery.command,
      pwdQuery.pattern,
    );
    assert.equal(pwdMatch[1], "/tmp");

    const envQuery = buildQueryCommand("ENV", "$HARNESS_TEST_VAR");
    const envMatch = await sendAndWait(
      second,
      envQuery.command,
      envQuery.pattern,
    );
    assert.equal(envMatch[1], "marker_value");
    await disconnect(second);
  } finally {
    await host.close();
  }
});

test("E12: output produced while detached is not retained or replayed on reattach", async () => {
  const host = await startHarnessHost(0);
  try {
    const id = await createSession(host.url);
    const first = await connect(host.url, id);

    // `disown` removes the job from Bash's job table so no job-control
    // "Done" notification (which would otherwise quote this command's own
    // source text) is printed later — validated empirically, see
    // eval-spec.md's Pre-Freeze Integrity Gate.
    await sendAndWait(
      first,
      "( sleep 0.5; echo __HARNESS_STALE_MARKER__ ) & disown; echo __HARNESS_BG_STARTED__",
      /__HARNESS_BG_STARTED__\r?\n/,
    );
    await disconnect(first);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const second = await connect(host.url, id);
    const collected = collectOutputFor(second, 300);
    const fresh = buildQueryCommand("FRESH_MARKER");
    await sendAndWait(second, fresh.command, fresh.pattern);
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
