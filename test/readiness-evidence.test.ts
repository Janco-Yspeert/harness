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
import { redact } from "../src/kernel/execution.ts";

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
    stdoutChunks?: string[];
    stderrChunks?: string[];
    afterExitLines?: object[];
    onKill?: (signal: string | undefined, cwd: string) => void;
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
        options.onKill?.(signal, launch.cwd ?? "");
        if (options.waitForKill)
          setTimeout(() => {
            child.emit("exit", null, signal ?? "SIGTERM");
            child.emit("close", null, signal ?? "SIGTERM");
          }, 5);
      };
      setImmediate(() => {
        options.onSpawn?.(launch.cwd ?? "");
        const write = () => {
          for (const chunk of options.stdoutChunks ??
            lines.map((line) => `${JSON.stringify(line)}\n`))
            child.stdout.write(chunk);
          for (const chunk of options.stderrChunks ??
            (options.stderr ?? []).map((line) => `${line}\n`))
            child.stderr.write(chunk);
        };
        write();
        if (!options.waitForKill) {
          if (options.afterExitLines) {
            child.emit("exit", options.exitCode ?? 0, null);
            for (const line of options.afterExitLines)
              child.stdout.write(JSON.stringify(line) + "\n");
            child.stdout.end();
            child.stderr.end();
            child.emit("close", options.exitCode ?? 0, null);
            return;
          }
          child.stdout.end();
          child.stderr.end();
          setTimeout(() => {
            child.emit("exit", options.exitCode ?? 0, null);
            child.emit("close", options.exitCode ?? 0, null);
          }, options.delayMs ?? 20);
        }
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

class VirtualClock {
  #now = 0;
  #next = 0;
  #tasks = new Map<number, { at: number; callback: () => void }>();

  setTimeout = (
    callback: () => void,
    delay: number,
  ): ReturnType<typeof setTimeout> => {
    const id = this.#next++;
    this.#tasks.set(id, { at: this.#now + delay, callback });
    return id as unknown as ReturnType<typeof setTimeout>;
  };

  clearTimeout = (handle: ReturnType<typeof setTimeout>): void => {
    this.#tasks.delete(handle as unknown as number);
  };

  advance(milliseconds: number): void {
    const target = this.#now + milliseconds;
    let next = this.#nextBefore(target);
    while (next) {
      const [id, task] = next;
      this.#tasks.delete(id);
      this.#now = task.at;
      task.callback();
      next = this.#nextBefore(target);
    }
    this.#now = target;
  }

  #nextBefore(
    target: number,
  ): [number, { at: number; callback: () => void }] | undefined {
    return [...this.#tasks.entries()]
      .filter(([, task]) => task.at <= target)
      .sort(([, left], [, right]) => left.at - right.at)[0];
  }
}

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

void test("readiness: Codex confirmation can arrive after the old deadline but before its configured deadline", async () => {
  const clock = new VirtualClock();
  const child = new EventEmitter() as EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
    kill: () => void;
  };
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () =>
    assert.fail("Codex deadline fired at the obsolete timeout");
  const result = runProviderReadiness({
    shape,
    adapter: { ...ADAPTERS.claude, id: "codex" },
    program: "codex",
    profile: {},
    plan: {},
    timers: clock,
    spawnProvider: (() => child) as unknown as typeof spawn,
  });
  clock.advance(15_001);
  child.stdout.write(`${JSON.stringify(init)}\n${JSON.stringify(called)}\n`);
  child.stdout.end();
  child.stderr.end();
  child.emit("exit", 0, null);
  child.emit("close", 0, null);
  assert.equal((await result).state, "passed");
});

void test("readiness: JSON, plaintext, and malformed credential-shaped output are redacted", () => {
  for (const value of [
    '{"outer":{"api_key":"EXAMPLE_SECRET","items":[{"Password":"hunter2"}]}}',
    "Bearer bearer-secret refresh_token=refresh-secret Cookie: cookie-secret",
    '{"access_token":"unfinished-secret',
  ]) {
    const safe = redact(value);
    assert.doesNotMatch(
      safe,
      /EXAMPLE_SECRET|hunter2|bearer-secret|refresh-secret|cookie-secret|unfinished-secret/,
    );
    assert.match(safe, /redacted/i);
  }
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
        '{"nested":{"refresh_token":"json-secret","cookies":[{"password":"array-secret"}]}}',
        "x".repeat(10_000),
      ],
    });
    assert.equal(result.state, "failed", entry.name);
    const path = join(root, "provider-diagnostics", `${attempt}.jsonl`);
    const text = readFileSync(path, "utf8");
    assert.match(text, new RegExp(`"cause":"${entry.expected}"`));
    assert.doesNotMatch(
      text,
      /secret-value|also-secret|json-secret|array-secret/,
    );
    assert.ok(Buffer.byteLength(text) <= 262_144);
    assert.ok(text.includes('"event"') || entry.lines.length === 0);
  }
});

void test("readiness: oversized and newline-free streams stay bounded and never become parsed events", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "readiness-output-bound-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const result = await probe([], {
    privateRoot: root,
    attempt: "large-output",
    stdoutChunks: [
      "x".repeat(200_000),
      `\n${JSON.stringify(init)}\n${JSON.stringify(called)}\n`,
    ],
    stderrChunks: ["y".repeat(200_000)],
  });
  assert.equal(result.state, "passed");
  const text = readFileSync(
    join(root, "provider-diagnostics", "large-output.jsonl"),
    "utf8",
  );
  assert.match(text, /"kind":"output-truncated"/);
  assert.ok(Buffer.byteLength(text) <= 262_144);
});

void test("readiness: structured confirmation arriving after exit is accepted only after stream close", async () => {
  const result = await probe([init], { afterExitLines: [called] });
  assert.equal(result.state, "passed");
});

void test("readiness: timeout reaps the provider before removing synthetic workspaces", async () => {
  let spawnedCwd = "";
  let cleanupObservedBeforeExit = false;
  const signals: Array<string | undefined> = [];
  const result = await probe([], {
    waitForKill: true,
    profile: { readinessTimeoutMs: 1_000 },
    onSpawn: (cwd) => {
      spawnedCwd = cwd;
    },
    onKill: (signal, cwd) => {
      signals.push(signal);
      cleanupObservedBeforeExit = !existsSync(cwd);
    },
  });
  assert.equal(result.failure, "pre-allocation-readiness-failure");
  // The fake provider emits exit only after kill; completing after that event
  // proves finally ran after reaping, not immediately when the timer fired.
  assert.equal(existsSync(spawnedCwd), false);
  assert.deepEqual(signals, ["SIGTERM"]);
  assert.equal(cleanupObservedBeforeExit, false);
});

void test("readiness: SIGTERM escalates to SIGKILL without early cleanup or double completion", async () => {
  const clock = new VirtualClock();
  const signals: string[] = [];
  let cwd = "";
  const child = new EventEmitter() as EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
    kill: (signal: string) => void;
  };
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = (signal) => {
    signals.push(signal);
    assert.equal(existsSync(cwd), true);
  };
  const result = runProviderReadiness({
    shape,
    adapter: ADAPTERS.claude,
    program: "claude",
    profile: { readinessTimeoutMs: 1_000 },
    plan: {},
    timers: clock,
    spawnProvider: ((
      _program: string,
      _args: readonly string[],
      launch: { cwd?: string },
    ) => {
      cwd = launch.cwd ?? "";
      return child;
    }) as unknown as typeof spawn,
  });
  clock.advance(1_000);
  clock.advance(1_000);
  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  child.emit("exit", null, "SIGKILL");
  child.emit("close", null, "SIGKILL");
  const settled = await result;
  assert.equal(settled.failure, "pre-allocation-readiness-failure");
  assert.equal(existsSync(cwd), false);
});
