import assert from "node:assert/strict";
import type { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import test from "node:test";
import { PassThrough } from "node:stream";

import { ADAPTERS } from "../src/executors/adapters.ts";
import { runProviderReadiness } from "../src/kernel/host.ts";

const shape = {
  schemaVersion: 1,
  mode: "spawned",
  role: "implementation",
  provider: "claude",
  profile: "p",
  capabilities: ["repository-read"],
  workspaces: [{ id: "w", path: "/w", mode: "read", exposure: "public" }],
  isolation: [],
  containment: "fixture",
  hostActions: {},
  contractIdentity: "c",
  skillIdentity: "s",
  inputBindingsIdentity: "i",
  exposureClasses: [],
  forbiddenExposure: [],
  protected: true,
  resultInterface: "harness-worker-protocol-v1",
} as unknown as Parameters<typeof runProviderReadiness>[0]["shape"];

function probe(lines: object[]) {
  return runProviderReadiness({
    shape,
    adapter: ADAPTERS.claude,
    program: "claude",
    profile: {},
    plan: {},
    spawnProvider: (() => {
      const child = new EventEmitter() as EventEmitter & {
        stdout: PassThrough;
        kill: () => void;
      };
      child.stdout = new PassThrough();
      child.kill = () => undefined;
      setImmediate(() => {
        for (const line of lines)
          child.stdout.write(JSON.stringify(line) + "\n");
        child.stdout.end();
        setTimeout(() => child.emit("exit", 0, null), 20);
      });
      return child;
    }) as unknown as typeof spawn,
  });
}

const init = {
  type: "system",
  subtype: "init",
  model: "m",
  mcp_servers: [{ name: "harness", status: "connected" }],
};
const called = {
  type: "user",
  tool_use_result: { structuredContent: { ready: true } },
};

void test("014l readiness: connection alone is not positive tool evidence", async () => {
  assert.equal((await probe([init])).state, "failed");
});

void test("014l readiness: a confirmed readiness call passes", async () => {
  assert.equal((await probe([init, called])).state, "passed");
});

void test("014l readiness: permission denial is a readiness failure, not authentication", async () => {
  const denied = await probe([
    init,
    called,
    {
      type: "result",
      permission_denials: [{ tool_name: "mcp__harness__readiness" }],
    },
  ]);
  assert.equal(denied.state, "failed");
  assert.equal(denied.failure, "pre-allocation-readiness-failure");
});
