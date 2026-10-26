import assert from "node:assert/strict";
import type { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { PassThrough } from "node:stream";

import { ADAPTERS } from "../src/executors/adapters.ts";
import {
  readinessTimeoutMs,
  runProviderReadiness,
} from "../src/kernel/host.ts";

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

function probe(
  lines: object[],
  options: {
    stderr?: string[];
    delayMs?: number;
    exitCode?: number;
    profile?: { readinessTimeoutMs?: number };
    privateRoot?: string;
    attempt?: string;
    onSpawn?: (cwd: string) => void;
    waitForKill?: boolean;
  } = {},
) {
  return runProviderReadiness({
    shape,
    adapter: ADAPTERS.claude,
    program: "claude",
    profile: options.profile ?? {},
    plan: {},
    ...(options.privateRoot && options.attempt
      ? {
          privateDiagnostics: {
            root: options.privateRoot,
            attempt: options.attempt,
          },
        }
      : {}),
    spawnProvider: ((
      _program: string,
      _args: readonly string[],
      launch: { cwd?: string },
    ) => {
      const child = new EventEmitter() as EventEmitter & {
        stdout: PassThrough;
        stderr: PassThrough;
        kill: (signal?: string) => void;
      };
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = (signal) => {
        if (options.waitForKill)
          setTimeout(() => child.emit("exit", null, signal ?? "SIGTERM"), 5);
      };
      setImmediate(() => {
        options.onSpawn?.(launch.cwd ?? "");
        for (const line of lines)
          child.stdout.write(JSON.stringify(line) + "\n");
        for (const line of options.stderr ?? [])
          child.stderr.write(`${line}\n`);
        child.stdout.end();
        child.stderr.end();
        if (!options.waitForKill)
          setTimeout(
            () => child.emit("exit", options.exitCode ?? 0, null),
            options.delayMs ?? 20,
          );
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

void test("readiness: Codex receives a bounded sixty-second default while configured profiles override it", () => {
  assert.equal(readinessTimeoutMs({ provider: "codex", profile: {} }), 60_000);
  assert.equal(
    readinessTimeoutMs({
      provider: "codex",
      profile: { readinessTimeoutMs: 45_000 },
    }),
    45_000,
  );
});

void test("readiness: a delayed successful probe completes before its configured deadline", async () => {
  const result = await probe([init, called], {
    // Scaled-down timing proves the deadline is profile controlled; the Codex
    // default above is deliberately 60 seconds, rather than the old 15.
    profile: { readinessTimeoutMs: 1_000 },
    delayMs: 30,
  });
  assert.equal(result.state, "passed");
});

void test("readiness: private diagnostics retain distinct redacted subcauses within their byte bound", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "readiness-diagnostics-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const cases: Array<{
    name: string;
    lines: object[];
    exitCode?: number;
    waitForKill?: boolean;
    expected: string;
  }> = [
    {
      name: "provider error",
      lines: [{ type: "assistant", error: "bad" }],
      expected: "provider-error",
    },
    {
      name: "rate limit",
      lines: [{ type: "assistant", error: "rate_limit" }],
      expected: "rate-limited",
    },
    {
      name: "permission",
      lines: [{ type: "result", permission_denials: [{}] }],
      expected: "permission-denied",
    },
    {
      name: "missing mcp",
      lines: [init],
      expected: "missing-mcp-confirmation",
    },
    {
      name: "provider exit",
      lines: [],
      exitCode: 1,
      expected: "provider-exit",
    },
    { name: "timeout", lines: [], waitForKill: true, expected: "timeout" },
  ];
  for (const [index, entry] of cases.entries()) {
    const attempt = `attempt-${String(index)}`;
    const result = await probe(entry.lines, {
      ...(entry.exitCode === undefined ? {} : { exitCode: entry.exitCode }),
      ...(entry.waitForKill === undefined
        ? {}
        : { waitForKill: entry.waitForKill }),
      profile: { readinessTimeoutMs: entry.waitForKill ? 1_000 : 1_000 },
      privateRoot: root,
      attempt,
      stderr: [
        "Bearer secret-value OPENAI_API_KEY=also-secret",
        "x".repeat(10_000),
      ],
    });
    assert.equal(result.state, "failed", entry.name);
    const path = join(root, "provider-diagnostics", `${attempt}.jsonl`);
    const text = readFileSync(path, "utf8");
    assert.match(text, new RegExp(`"cause":"${entry.expected}"`));
    assert.doesNotMatch(text, /secret-value|also-secret/);
    assert.ok(Buffer.byteLength(text) <= 262_144);
    assert.ok(text.includes('"event"') || entry.lines.length === 0);
  }
});

void test("readiness: timeout reaps the provider before removing synthetic workspaces", async () => {
  let spawnedCwd = "";
  const result = await probe([], {
    waitForKill: true,
    profile: { readinessTimeoutMs: 1_000 },
    onSpawn: (cwd) => {
      spawnedCwd = cwd;
    },
  });
  assert.equal(result.failure, "pre-allocation-readiness-failure");
  // The fake provider emits exit only after kill; completing after that event
  // proves finally ran after reaping, not immediately when the timer fired.
  assert.equal(existsSync(spawnedCwd), false);
});
