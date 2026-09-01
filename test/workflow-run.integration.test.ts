import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import {
  buildExecutorCommand,
  startHarnessHost,
  type HarnessHost,
  type ResolvedWorkflowRunSpec,
  type SessionBackend,
  type WorkflowRunBackend,
  type WorkflowRunBackendContext,
  type WorkflowRunBackendFactory,
  type WorkflowRunExitOutcome,
} from "../src/index.ts";

const repositoryRoot = process.cwd();

// In-memory workflow backend: the visible suite drives every host-owned-run
// behaviour through this factory seam, so it never needs a live paid provider.
class FakeWorkflowBackend implements WorkflowRunBackend {
  readonly pid: number;
  readonly providerSessionId: string;
  stopped = false;
  #activity: ((chunk: string) => void) | undefined;
  #exit: ((outcome: WorkflowRunExitOutcome) => void) | undefined;

  constructor(pid: number) {
    this.pid = pid;
    this.providerSessionId = `provider-session-${String(pid)}`;
  }

  onActivity(listener: (chunk: string) => void): void {
    this.#activity = listener;
  }

  onExit(listener: (outcome: WorkflowRunExitOutcome) => void): void {
    this.#exit = listener;
  }

  stop(): void {
    this.stopped = true;
  }

  emit(chunk: string): void {
    this.#activity?.(chunk);
  }

  finish(outcome: WorkflowRunExitOutcome): void {
    this.#exit?.(outcome);
  }
}

class NoopSessionBackend implements SessionBackend {
  write(): { accepted: true } {
    return { accepted: true };
  }
  onData(): void {}
  onError(): void {}
  onExit(): void {}
  stop(): void {}
}

interface Harness {
  readonly host: HarnessHost;
  readonly created: FakeWorkflowBackend[];
}

async function startHarness(): Promise<Harness> {
  const created: FakeWorkflowBackend[] = [];
  const createWorkflowBackend: WorkflowRunBackendFactory = (
    context: WorkflowRunBackendContext,
  ) => {
    void context;
    const backend = new FakeWorkflowBackend(4200 + created.length);
    created.push(backend);
    return backend;
  };
  const host = await startHarnessHost(0, {
    createBackend: () => new NoopSessionBackend(),
    createWorkflowBackend,
  });
  return { host, created };
}

interface RunRecord {
  readonly runId: string;
  readonly status: string;
  readonly [key: string]: unknown;
}

function baseRequest(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    slot: { workflow: "011", phase: "implementation", methodologyAttempt: "1" },
    role: "implementation",
    executor: "claude",
    workspace: "/repo/harness",
    ...overrides,
  };
}

async function allocate(
  host: HarnessHost,
  overrides: Record<string, unknown> = {},
): Promise<{ status: number; run: RunRecord; duplicate: boolean }> {
  const response = await fetch(`${host.url}/workflow-runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(baseRequest(overrides)),
  });
  const body = (await response.json()) as {
    run: RunRecord;
    duplicate: boolean;
    error?: string;
  };
  return { status: response.status, run: body.run, duplicate: body.duplicate };
}

async function getRun(host: HarnessHost, runId: string): Promise<RunRecord> {
  const response = await fetch(`${host.url}/workflow-runs/${runId}`);
  assert.equal(response.status, 200);
  return ((await response.json()) as { run: RunRecord }).run;
}

async function connectEvents(host: HarnessHost): Promise<WebSocket> {
  const socket = new WebSocket(`${host.url.replace("http", "ws")}/events/ws`);
  await once(socket, "open");
  return socket;
}

interface HarnessEvent {
  readonly meta: {
    readonly id: string;
    readonly kind: string;
    readonly type: string;
    readonly version: string;
    readonly streamId: string;
    readonly correlationId: string;
    readonly timestamp: string;
    readonly source: string;
  };
  readonly data: Record<string, unknown>;
}

function rawToString(raw: RawData): string {
  if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString("utf8");
  return raw.toString("utf8");
}

function collectEvents(socket: WebSocket): HarnessEvent[] {
  const events: HarnessEvent[] = [];
  socket.on("message", (raw: RawData) => {
    events.push(JSON.parse(rawToString(raw)) as HarnessEvent);
  });
  return events;
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
}

void test("a host-owned run outlives its client and is inspectable by identity", async () => {
  const { host, created } = await startHarness();
  const events = await connectEvents(host);
  const seen = collectEvents(events);
  try {
    const { status, run, duplicate } = await allocate(host, {
      role: "implementation",
      orchestrator: "codex-bootstrap",
    });
    assert.equal(status, 201);
    assert.equal(duplicate, false);

    // Every enumerated run-record field is present in a stable observable form;
    // unavailable provider/model metadata is null, not fabricated.
    assert.equal(typeof run.runId, "string");
    assert.equal(run.workflow, "011");
    assert.equal(run.phase, "implementation");
    assert.equal(run.methodologyAttempt, "1");
    assert.equal(run.executionAttempt, 1);
    assert.equal(run.role, "implementation");
    assert.equal(run.skill, null);
    assert.equal(run.skillVersion, null);
    assert.equal(run.executor, "claude");
    assert.equal(run.invocationMode, "delegated");
    assert.equal(run.replacementReason, null);
    assert.equal(run.previousExecutionId, null);
    assert.deepEqual(run.workspaces, ["/repo/harness"]);
    assert.equal(
      (run.permissionProfile as { id: string }).id,
      "repo-local-worker",
    );
    assert.equal(run.orchestrator, "codex-bootstrap");
    assert.equal(run.pid, 4200);
    assert.equal(run.providerSessionId, "provider-session-4200");
    assert.equal(run.status, "running");
    assert.equal(run.terminalDisposition, null);
    assert.match(run.createdAt as string, /^\d{4}-\d{2}-\d{2}T.*Z$/);
    assert.match(run.startedAt as string, /^\d{4}-\d{2}-\d{2}T.*Z$/);
    assert.equal(run.lastActivityAt, null);
    assert.equal(run.terminalAt, null);
    assert.equal(run.logLocation, `/workflow-runs/${run.runId}/log`);

    // The initiating client disconnects; the host-owned run is not lost.
    events.close();
    await once(events, "close");
    await settle();
    const afterDisconnect = await getRun(host, run.runId);
    assert.equal(afterDisconnect.status, "running");
    assert.equal(created.at(0)?.stopped, false);
    assert.ok(
      !seen.some((event) =>
        ["workflow-run.failed", "workflow-run.cancelled"].includes(
          event.meta.type,
        ),
      ),
    );

    // Completion remains observable to a later client, by the same identity.
    created.at(0)?.finish({ ok: true });
    await settle();
    const terminal = await getRun(host, run.runId);
    assert.equal(terminal.status, "completed");
    assert.equal(terminal.terminalDisposition, "completed");
    assert.match(terminal.terminalAt as string, /^\d{4}-\d{2}-\d{2}T.*Z$/);
  } finally {
    if (events.readyState === WebSocket.OPEN) events.close();
    await host.close();
  }
});

void test("concurrent and repeated starts for one slot produce a single worker", async () => {
  const { host, created } = await startHarness();
  try {
    const responses = await Promise.all(
      Array.from({ length: 6 }, () => allocate(host)),
    );
    const statuses = responses.map((response) => response.status).sort();
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 201]);
    const ids = new Set(responses.map((response) => response.run.runId));
    assert.equal(ids.size, 1);
    assert.equal(created.length, 1);
    for (const response of responses) {
      if (response.status === 200) assert.equal(response.duplicate, true);
    }

    // A later duplicate returns the existing run, still without a new worker.
    const again = await allocate(host);
    assert.equal(again.status, 200);
    assert.equal(again.duplicate, true);
    assert.equal(again.run.runId, [...ids][0]);
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("replacement terminalizes the prior execution before allocating the next", async () => {
  const { host, created } = await startHarness();
  const events = await connectEvents(host);
  const seen = collectEvents(events);
  try {
    const first = await allocate(host, { executor: "claude" });
    assert.equal(first.status, 201);

    // A plain allocation cannot produce a replacement while the prior run is
    // active: it returns the existing run and spawns no second worker.
    const duplicate = await allocate(host, { executor: "claude" });
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.run.runId, first.run.runId);
    assert.equal(created.length, 1);

    const reason = "delegated executor failed to launch";
    const replaceResponse = await fetch(
      `${host.url}/workflow-runs/${first.run.runId}/replace`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason, executor: "codex" }),
      },
    );
    assert.equal(replaceResponse.status, 201);
    const { previous, next } = (await replaceResponse.json()) as {
      previous: RunRecord;
      next: RunRecord;
    };

    assert.equal(previous.status, "replaced");
    assert.equal(previous.terminalDisposition, "replaced");
    assert.equal(previous.terminalReason, reason);
    assert.equal(created.at(0)?.stopped, true);

    assert.equal(next.executionAttempt, 2);
    assert.equal(next.previousExecutionId, first.run.runId);
    assert.equal(next.replacementReason, reason);
    assert.equal(next.executor, "codex");
    assert.equal(next.invocationMode, "fallback");
    // Operational replacement does not manufacture a new methodology attempt.
    assert.equal(next.methodologyAttempt, previous.methodologyAttempt);
    assert.equal(
      (next.accounting as { replacementCount: number }).replacementCount,
      1,
    );
    assert.equal(created.length, 2);

    // The successor is allocated only after the predecessor is terminal.
    assert.ok(
      Date.parse(previous.terminalAt as string) <=
        Date.parse(next.createdAt as string),
    );
    await settle();
    const replacedIndex = seen.findIndex(
      (event) =>
        event.meta.type === "workflow-run.replaced" &&
        event.meta.streamId === first.run.runId,
    );
    const allocatedIndex = seen.findIndex(
      (event) =>
        event.meta.type === "workflow-run.allocated" &&
        event.meta.streamId === next.runId,
    );
    assert.ok(replacedIndex >= 0 && allocatedIndex > replacedIndex);

    // The superseded run is no longer the canonical execution for the slot.
    const staleReplace = await fetch(
      `${host.url}/workflow-runs/${first.run.runId}/replace`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "again" }),
      },
    );
    assert.equal(staleReplace.status, 409);
  } finally {
    if (events.readyState === WebSocket.OPEN) events.close();
    await host.close();
  }
});

void test("structured lifecycle events reuse the Harness event envelope", async () => {
  const { host, created } = await startHarness();
  const events = await connectEvents(host);
  const seen = collectEvents(events);
  try {
    const completed = await allocate(host, {
      slot: { workflow: "011", phase: "phase-a", methodologyAttempt: "1" },
    });
    created.at(-1)?.emit("progress line\n");
    created.at(-1)?.finish({ ok: true });

    const failed = await allocate(host, {
      slot: { workflow: "011", phase: "phase-b", methodologyAttempt: "1" },
    });
    created.at(-1)?.finish({ ok: false, reason: "boom" });

    const cancelled = await allocate(host, {
      slot: { workflow: "011", phase: "phase-c", methodologyAttempt: "1" },
    });
    await fetch(`${host.url}/workflow-runs/${cancelled.run.runId}/cancel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });

    const replaced = await allocate(host, {
      slot: { workflow: "011", phase: "phase-d", methodologyAttempt: "1" },
    });
    await fetch(`${host.url}/workflow-runs/${replaced.run.runId}/replace`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "swap" }),
    });
    await settle();

    const typesFor = (runId: string): string[] =>
      seen
        .filter((event) => event.meta.streamId === runId)
        .map((event) => event.meta.type);
    assert.deepEqual(typesFor(completed.run.runId), [
      "workflow-run.allocated",
      "workflow-run.started",
      "workflow-run.activity",
      "workflow-run.completed",
    ]);
    assert.deepEqual(typesFor(failed.run.runId), [
      "workflow-run.allocated",
      "workflow-run.started",
      "workflow-run.failed",
    ]);
    assert.ok(typesFor(cancelled.run.runId).includes("workflow-run.cancelled"));
    assert.ok(typesFor(replaced.run.runId).includes("workflow-run.replaced"));

    const sample = seen.find(
      (event) => event.meta.type === "workflow-run.completed",
    );
    assert.ok(sample);
    assert.deepEqual(Object.keys(sample.meta).sort(), [
      "correlationId",
      "id",
      "kind",
      "source",
      "streamId",
      "timestamp",
      "type",
      "version",
    ]);
    assert.equal(sample.meta.kind, "event");
    assert.equal(sample.meta.version, "1.0.0");
    assert.equal(sample.meta.source, "harness");
    assert.equal(sample.meta.correlationId, sample.meta.id);
    assert.equal(sample.meta.streamId, completed.run.runId);
    assert.equal(sample.data.runId, completed.run.runId);
  } finally {
    if (events.readyState === WebSocket.OPEN) events.close();
    await host.close();
  }
});

void test("execution logs are inspectable diagnostics, not methodology evidence", async () => {
  const { host, created } = await startHarness();
  try {
    const first = await allocate(host, {
      slot: { workflow: "011", phase: "phase-a", methodologyAttempt: "1" },
    });
    created.at(-1)?.emit("SECRET agent transcript line\n");
    await settle();

    const logResponse = await fetch(
      `${host.url}/workflow-runs/${first.run.runId}/log`,
    );
    assert.equal(logResponse.status, 200);
    assert.match(logResponse.headers.get("content-type") ?? "", /^text\/plain/);
    assert.match(await logResponse.text(), /SECRET agent transcript line/);

    // The run record points to the log location; it never embeds the raw
    // transcript as an artifact or as downstream role context.
    const record = await getRun(host, first.run.runId);
    for (const key of ["transcript", "context", "output", "conversation"]) {
      assert.ok(!(key in record), `run record must not carry ${key}`);
    }
    assert.equal(record.logLocation, `/workflow-runs/${first.run.runId}/log`);

    // A later run for another slot does not inherit the previous run's log.
    const second = await allocate(host, {
      slot: { workflow: "011", phase: "phase-b", methodologyAttempt: "1" },
    });
    assert.equal(
      await (
        await fetch(`${host.url}/workflow-runs/${second.run.runId}/log`)
      ).text(),
      "",
    );
  } finally {
    await host.close();
  }
});

void test("permission profiles are bounded, named, and recorded on the run", async () => {
  const { host } = await startHarness();
  try {
    const standard = (
      await allocate(host, {
        slot: { workflow: "011", phase: "phase-a", methodologyAttempt: "1" },
        workspace: "/repo/harness",
      })
    ).run.permissionProfile as {
      id: string;
      workspaces: string[];
      capabilities: string[];
    };
    assert.equal(standard.id, "repo-local-worker");
    assert.deepEqual(standard.workspaces, ["/repo/harness"]);
    assert.ok(standard.capabilities.includes("child-process"));
    assert.ok(standard.capabilities.includes("test-build-lint-format"));
    assert.ok(standard.capabilities.includes("git-commit"));

    const evaluator = (
      await allocate(host, {
        slot: { workflow: "011", phase: "phase-b", methodologyAttempt: "1" },
        workspace: "/repo/harness",
        permissionProfile: "evaluator",
        evaluatorWorkspace: "/repo/harness-evaluator",
      })
    ).run.permissionProfile as {
      id: string;
      workspaces: string[];
      capabilities: string[];
    };
    assert.equal(evaluator.id, "evaluator");
    // The evaluator profile differs only by the declared private workspace.
    assert.deepEqual(evaluator.workspaces, [
      "/repo/harness",
      "/repo/harness-evaluator",
    ]);
    assert.deepEqual(evaluator.capabilities, standard.capabilities);

    // No profile grants an unrestricted-host capability.
    for (const capability of evaluator.capabilities) {
      assert.doesNotMatch(
        capability,
        /bypass|unrestricted|dangerous|skip-permission/i,
      );
    }

    // The evaluator profile must declare its private workspace explicitly.
    const missing = await fetch(`${host.url}/workflow-runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        baseRequest({
          slot: { workflow: "011", phase: "phase-c", methodologyAttempt: "1" },
          permissionProfile: "evaluator",
        }),
      ),
    });
    assert.equal(missing.status, 400);
  } finally {
    await host.close();
  }
});

void test("the default local backend uses a bounded, non-interactive executor mode", () => {
  const spec = (
    executor: string,
    workspaces: string[],
  ): ResolvedWorkflowRunSpec => ({
    slot: { workflow: "011", phase: "implementation", methodologyAttempt: "1" },
    role: "implementation",
    executor,
    invocationMode: "delegated",
    workspaces,
    permissionProfile: {
      id: workspaces.length > 1 ? "evaluator" : "repo-local-worker",
      workspaces,
      capabilities: [],
    },
    skill: null,
    skillVersion: null,
    verificationAuthority: null,
    orchestrator: null,
    prompt: "do the work",
  });

  const codex = buildExecutorCommand(spec("codex", ["/repo/harness"]));
  assert.ok(codex.includes("--sandbox") && codex.includes("workspace-write"));
  assert.ok(!codex.includes("--approve-for-me"));
  assert.ok(!codex.includes("--ask-for-approval"));
  assert.ok(!codex.includes("--dangerously-bypass-approvals-and-sandbox"));

  const claude = buildExecutorCommand(
    spec("claude", ["/repo/harness", "/repo/harness-evaluator"]),
  );
  assert.ok(
    claude.includes("--permission-mode") && claude.includes("acceptEdits"),
  );
  assert.ok(claude.includes("--add-dir"));
  assert.ok(claude.includes("/repo/harness-evaluator"));
  assert.equal(claude.at(-2), "--");
  assert.ok(!claude.includes("--dangerously-skip-permissions"));
  assert.ok(!claude.includes("bypassPermissions"));
});

void test("run accounting is derived from directly observable facts", async () => {
  const { host, created } = await startHarness();
  try {
    const first = await allocate(host);
    created.at(-1)?.finish({ ok: true });
    await settle();
    const record = await getRun(host, first.run.runId);
    const accounting = record.accounting as Record<string, unknown>;
    assert.match(accounting.allocatedAt as string, /Z$/);
    assert.match(accounting.startedAt as string, /Z$/);
    assert.match(accounting.endedAt as string, /Z$/);
    assert.equal(typeof accounting.elapsedMs, "number");
    assert.ok((accounting.elapsedMs as number) >= 0);
    assert.equal(accounting.executor, "claude");
    assert.equal(accounting.executionAttempt, 1);
    assert.equal(accounting.replacementCount, 0);
    assert.equal(accounting.terminalDisposition, "completed");

    // Provider usage/cost data is omitted rather than estimated.
    const serialized = JSON.stringify(record);
    for (const key of ["tokens", "cost", "usage"]) {
      assert.ok(!serialized.includes(key), `record must not fabricate ${key}`);
    }
  } finally {
    await host.close();
  }
});

void test("the workflow-run surface belongs to the existing Harness host", async () => {
  const { host } = await startHarness();
  const events = await connectEvents(host);
  const seen = collectEvents(events);
  try {
    // The same host, on the same base URL and event stream, serves both
    // interactive sessions and workflow runs - not a separate daemon.
    const sessionResponse = await fetch(`${host.url}/sessions`, {
      method: "POST",
    });
    assert.equal(sessionResponse.status, 201);
    const run = await allocate(host);
    assert.equal(run.status, 201);
    await settle();
    assert.ok(seen.some((event) => event.meta.type === "session.started"));
    assert.ok(
      seen.some((event) => event.meta.type === "workflow-run.allocated"),
    );

    // The workflow runner is a client of this surface and no longer owns
    // detached worker processes itself.
    const runnerSource = readFileSync(
      new URL("../tools/workflow.ts", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(runnerSource, /detached/);
    assert.doesNotMatch(runnerSource, /from "node:process"/);
    assert.match(runnerSource, /\/workflow-runs/);
  } finally {
    if (events.readyState === WebSocket.OPEN) events.close();
    await host.close();
  }
});

function runWorkflow(
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("node", ["tools/workflow.ts", ...args], {
      cwd: repositoryRoot,
      env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
    child.on("close", (status) => {
      resolve({ status, stdout, stderr });
    });
  });
}

interface ToolFixture {
  readonly host: HarnessHost;
  readonly created: FakeWorkflowBackend[];
  readonly spike: string;
  readonly spikePath: string;
  readonly env: NodeJS.ProcessEnv;
}

async function startToolFixture(
  suffix: string,
  after: (cleanup: () => Promise<void>) => void,
): Promise<ToolFixture> {
  const { host, created } = await startHarness();
  const spike = `spikes/999-workflow-run-${String(process.pid)}${suffix}`;
  const spikePath = join(repositoryRoot, spike);
  mkdirSync(spikePath, { recursive: true });
  after(async () => {
    rmSync(spikePath, { recursive: true, force: true });
    await host.close();
  });
  const env: NodeJS.ProcessEnv = { ...process.env, HARNESS_HOST_URL: host.url };
  delete env.NODE_TEST_CONTEXT;
  return { host, created, spike, spikePath, env };
}

function jobRunId(spikePath: string): string {
  const state = JSON.parse(
    readFileSync(join(spikePath, ".workflow", "state.json"), "utf8"),
  ) as { records: Array<{ job?: { runId: string } }> };
  const job = state.records.find((record) => record.job !== undefined)?.job;
  assert.ok(job);
  return job.runId;
}

void test("tools/workflow.ts binds phase completion to a terminally complete run", async (t) => {
  const { host, created, spike, spikePath, env } = await startToolFixture(
    "-bind",
    t.after.bind(t),
  );
  const ok = async (args: string[]): Promise<void> => {
    const result = await runWorkflow(args, env);
    assert.equal(result.status, 0, result.stderr);
  };
  await ok(["init", spike]);
  for (const phase of ["brief-readiness", "design-map", "evaluator-prepare"]) {
    await ok(["dispatch", phase, spike]);
    await ok(["record", phase, spike, "complete"]);
  }

  await ok(["dispatch", "implementation", spike, "--execute"]);
  const runId = jobRunId(spikePath);
  // The runner attached to a host-owned run rather than spawning its own worker.
  assert.equal((await getRun(host, runId)).status, "running");

  const early = await runWorkflow(
    ["record", "implementation", spike, "complete"],
    env,
  );
  assert.notEqual(early.status, 0);
  assert.match(early.stderr, /not completed/);

  created.at(-1)?.finish({ ok: true });
  await settle();
  await ok(["record", "implementation", spike, "complete"]);
});

void test("a non-complete canonical run cannot satisfy the workflow runner", async (t) => {
  const { host, spike, spikePath, env } = await startToolFixture(
    "-ac19",
    t.after.bind(t),
  );
  const ok = async (args: string[]): Promise<void> => {
    const result = await runWorkflow(args, env);
    assert.equal(result.status, 0, result.stderr);
  };
  await ok(["init", spike]);
  for (const phase of ["brief-readiness", "design-map", "evaluator-prepare"]) {
    await ok(["dispatch", phase, spike]);
    await ok(["record", phase, spike, "complete"]);
  }
  await ok(["dispatch", "implementation", spike, "--execute"]);
  const runId = jobRunId(spikePath);

  // A directly cancelled run - or any plausible external process that is not
  // the terminally complete canonical run - does not satisfy completion.
  await fetch(`${host.url}/workflow-runs/${runId}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const result = await runWorkflow(
    ["record", "implementation", spike, "complete"],
    env,
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cancelled, not completed/);
});
