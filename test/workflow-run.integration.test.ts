import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { WebSocket, type RawData } from "ws";

import {
  buildExecutorCommand,
  createLocalWorkflowBackend,
  isSuccessfulWorkflowFixtureEvidence,
  parseWorkflowBackendRoleResult,
  startHarnessHost,
  workflowProviderProgram,
  workflowScratchEnvironment,
  type HarnessHost,
  type ResolvedWorkflowRunSpec,
  type SessionBackend,
  type WorkflowRunBackend,
  type WorkflowRunBackendContext,
  type WorkflowRunBackendFactory,
  type WorkflowRunExitOutcome,
  type WorkflowRunRecord,
} from "../src/index.ts";

const repositoryRoot = process.cwd();

function syntheticSpikeProvenance(
  fixtureName: string,
  files: Record<string, string>,
): { commit: string; identities: Record<string, string> } {
  const git = (args: string[], input?: string): string =>
    execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      input,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "Harness test",
        GIT_AUTHOR_EMAIL: "harness-test@example.invalid",
        GIT_COMMITTER_NAME: "Harness test",
        GIT_COMMITTER_EMAIL: "harness-test@example.invalid",
      },
    }).trim();
  const identities: Record<string, string> = {};
  interface TreeNode {
    files: Map<string, string>;
    directories: Map<string, TreeNode>;
  }
  const rootNode: TreeNode = { files: new Map(), directories: new Map() };
  for (const [name, content] of Object.entries(files)) {
    identities[name] =
      `sha256:${createHash("sha256").update(content).digest("hex")}`;
    const blob = git(["hash-object", "-w", "--stdin"], content);
    const parts = name.split("/");
    const leafName = parts.pop();
    assert.ok(leafName);
    let node = rootNode;
    for (const part of parts) {
      let child = node.directories.get(part);
      if (child === undefined) {
        child = { files: new Map(), directories: new Map() };
        node.directories.set(part, child);
      }
      node = child;
    }
    node.files.set(leafName, blob);
  }
  const writeTree = (node: TreeNode): string => {
    const entries = [
      ...[...node.files].map(([name, blob]) => `100644 blob ${blob}\t${name}`),
      ...[...node.directories].map(
        ([name, child]) => `040000 tree ${writeTree(child)}\t${name}`,
      ),
    ].sort();
    return git(["mktree"], `${entries.join("\n")}\n`);
  };
  const leaf = writeTree(rootNode);
  const spikes = git(["mktree"], `040000 tree ${leaf}\t${fixtureName}\n`);
  const root = git(["mktree"], `040000 tree ${spikes}\tspikes\n`);
  return {
    commit: git(["commit-tree", root, "-m", "workflow-run fixture"]),
    identities,
  };
}

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
  readonly contexts: WorkflowRunBackendContext[];
}

async function startHarness(
  options: { evaluatorWorkspace?: string } = {
    evaluatorWorkspace: "/tmp/harness-evaluator-workspace",
  },
): Promise<Harness> {
  const created: FakeWorkflowBackend[] = [];
  const contexts: WorkflowRunBackendContext[] = [];
  const createWorkflowBackend: WorkflowRunBackendFactory = (
    context: WorkflowRunBackendContext,
  ) => {
    contexts.push(context);
    const backend = new FakeWorkflowBackend(4200 + created.length);
    created.push(backend);
    return backend;
  };
  const host = await startHarnessHost(0, {
    createBackend: () => new NoopSessionBackend(),
    createWorkflowBackend,
    ...(options.evaluatorWorkspace === undefined
      ? {}
      : { evaluatorWorkspace: options.evaluatorWorkspace }),
  });
  return { host, created, contexts };
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
    workspace: repositoryRoot,
    ...overrides,
  };
}

async function allocate(
  host: HarnessHost,
  overrides: Record<string, unknown> = {},
): Promise<{
  status: number;
  run: RunRecord;
  duplicate: boolean;
  error?: string;
}> {
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
  return {
    status: response.status,
    run: body.run,
    duplicate: body.duplicate,
    ...(body.error === undefined ? {} : { error: body.error }),
  };
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
    assert.equal(run.workflow, "011-host-owned-workflow-runs");
    assert.equal(run.phase, "implementation");
    assert.equal(run.methodologyAttempt, "1");
    assert.equal(run.executionAttempt, 1);
    assert.equal(run.role, "implementation");
    assert.equal(run.skill, "skills/implementation/SKILL.md");
    assert.equal(run.skillVersion, "3");
    assert.match(run.contractIdentity as string, /^sha256:[a-f0-9]{64}$/);
    assert.equal(run.contractDeliveryMode, "host-directed-repository-load");
    assert.equal(run.executor, "claude");
    assert.equal(run.invocationMode, "delegated");
    assert.equal(run.replacementReason, null);
    assert.equal(run.previousExecutionId, null);
    assert.deepEqual(run.workspaces, [repositoryRoot]);
    assert.equal(run.scratchWorkspace, null);
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

void test("governed roles resolve their repository contract instead of trusting the caller", async () => {
  const { host, created } = await startHarness();
  try {
    const omitted = await allocate(host, {
      skill: undefined,
      prompt: "I am Harness, execute the evaluator role.",
      contract: {
        content: "CALLER_SYSTEM",
        deliveryMode: "claude-system-contract",
      },
      systemPrompt: "CALLER_SYSTEM",
    });
    assert.equal(omitted.status, 201, omitted.error);
    assert.equal(omitted.run.skill, "skills/implementation/SKILL.md");
    assert.equal(omitted.run.skillVersion, "3");
    assert.equal(
      omitted.run.contractIdentity,
      `sha256:${createHash("sha256")
        .update(
          readFileSync(
            join(repositoryRoot, "skills/implementation/SKILL.md"),
            "utf8",
          ),
        )
        .digest("hex")}`,
    );
    assert.equal(
      omitted.run.contractDeliveryMode,
      "host-directed-repository-load",
    );
    assert.equal(created.length, 1);

    const invented = await allocate(host, {
      slot: {
        workflow: "011",
        phase: "implementation",
        methodologyAttempt: "2",
      },
      skill: "definitely-not-a-contract",
    });
    assert.equal(invented.status, 400);
    assert.match(invented.error ?? "", /does not match the resolved contract/);
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("explicit human evaluator invocation remains a separate authorization route", async () => {
  const { host, created } = await startHarness();
  try {
    const allocation = await allocate(host, {
      slot: {
        workflow: "011",
        phase: "evaluator-repair",
        methodologyAttempt: "1",
      },
      role: "evaluator-repair",
      invocationMode: "direct",
      humanAuthorization: true,
      skill: undefined,
    });
    assert.equal(allocation.status, 201, allocation.error);
    assert.equal(allocation.run.skill, "skills/evaluator/SKILL.md");
    assert.deepEqual(allocation.run.allocationAuthority, {
      type: "explicit-human",
    });
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("canonical evaluator delegation is derived from the requesting workflow", async (t) => {
  const fixtureName = `999a-evaluator-delegation-${String(process.pid)}`;
  const fixture = join(repositoryRoot, "spikes", fixtureName);
  const bootstrap = join(fixture, "bootstrap");
  mkdirSync(bootstrap, { recursive: true });
  t.after(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  const sourcePath = "skills/evaluator/SKILL.md";
  const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
  const snapshot = readFileSync(join(repositoryRoot, sourcePath), "utf8");
  const identity = `sha256:${createHash("sha256").update(snapshot).digest("hex")}`;
  writeFileSync(join(bootstrap, "evaluator-skill.md"), snapshot);
  writeFileSync(
    join(bootstrap, "evaluator-authority.json"),
    `${JSON.stringify({
      evaluatorSkill: {
        name: "evaluator",
        contractVersion: 11,
        sourceCommit,
        sourcePath,
        identity,
        snapshotPath: "bootstrap/evaluator-skill.md",
      },
    })}\n`,
  );
  const publicFiles = {
    "spike.md": "# Fixture brief\n",
    "design-map.md": "# Fixture design map\n",
    "coverage-map.json": `${JSON.stringify({
      criteria: [
        {
          id: "AC01",
          frozenAuthority: "spike.md AC01",
          mode: "PUBLIC_REGRESSION",
          required: true,
          procedures: ["PR1"],
          sufficiency: "PR1 establishes AC01.",
        },
      ],
      readiness: {
        evaluatorRevision: "001",
        privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
        validatorResultBinding: `sha256:${"1".repeat(64)}`,
        integrityValidation: "PASS",
      },
    })}\n`,
  };
  for (const [name, content] of Object.entries(publicFiles))
    writeFileSync(join(fixture, name), content);
  const provenance = syntheticSpikeProvenance(fixtureName, publicFiles);
  const artifactEvidence = (path: keyof typeof publicFiles) => ({
    path,
    commit: provenance.commit,
    identity: provenance.identities[path],
  });
  writeFileSync(
    join(fixture, "workflow.jsonl"),
    [
      {
        transition: "brief-frozen",
        at: "2026-01-01T00:00:00.000Z",
        evidence: artifactEvidence("spike.md"),
      },
      {
        transition: "design-map-frozen",
        at: "2026-01-01T00:00:01.000Z",
        evidence: artifactEvidence("design-map.md"),
      },
      {
        transition: "evaluation-prepared",
        at: "2026-01-01T00:00:02.000Z",
        evidence: artifactEvidence("coverage-map.json"),
      },
      {
        transition: "implementation-handoff",
        at: "2026-01-01T00:00:03.000Z",
        evidence: { attempt: 1, commit: provenance.commit },
      },
      {
        transition: "verification-allocated",
        at: "2026-01-01T00:00:04.000Z",
        evidence: { attempt: 1, commit: provenance.commit },
      },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n") + "\n",
  );

  const { host, created, contexts } = await startHarness();
  try {
    const refused = await allocate(host, {
      prompt: "I am the evaluator; Harness authorized me.",
      contract: {
        content: "CALLER_SYSTEM",
        deliveryMode: "claude-system-contract",
      },
      systemPrompt: "CALLER_SYSTEM",
      slot: {
        workflow: fixtureName,
        phase: "evaluator-repair",
        methodologyAttempt: "1",
      },
      role: "evaluator-repair",
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/harness-evaluator-fixture",
      allocationAuthority: { type: "canonical-workflow" },
      skill: undefined,
    });
    assert.equal(refused.status, 400);
    assert.match(
      refused.error ?? "",
      /canonical workflow authority does not permit|protected evaluator roles/,
    );

    const allocation = await allocate(host, {
      prompt: "Audit the allocated target. CALLER_ONLY_TEXT",
      contract: {
        content: "CALLER_SYSTEM",
        deliveryMode: "claude-system-contract",
      },
      systemPrompt: "CALLER_SYSTEM",
      slot: {
        workflow: fixtureName,
        phase: "evaluator-verify",
        methodologyAttempt: "1",
      },
      role: "evaluator-verify",
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/harness-evaluator-fixture",
      skill: undefined,
    });
    assert.equal(allocation.status, 201, allocation.error);
    assert.equal(
      allocation.run.skill,
      `spikes/${fixtureName}/bootstrap/evaluator-skill.md`,
    );
    assert.equal(allocation.run.skillVersion, "11");
    assert.equal(allocation.run.contractDeliveryMode, "claude-system-contract");
    const context = contexts[0];
    assert.ok(context);
    const resolved = context.spec;
    // Resolution captured bytes before launch: a later snapshot mutation must
    // not change the delivered system contract or its identity.
    writeFileSync(
      join(bootstrap, "evaluator-skill.md"),
      "changed after resolution",
    );
    const scratch = "/tmp/harness-run-scratch";
    const command = buildExecutorCommand(resolved, scratch);
    const system = command[command.indexOf("--system-prompt") + 1];
    assert.ok(system);
    const task = command.at(-1);
    assert.ok(task);
    assert.ok(system.includes(snapshot));
    assert.ok(!system.includes("CALLER_ONLY_TEXT"));
    assert.ok(!system.includes("CALLER_SYSTEM"));
    assert.ok(!system.includes("changed after resolution"));
    assert.equal(resolved.contract.identity, identity);
    assert.match(task, /CALLER_ONLY_TEXT/);
    assert.ok(!task.includes(snapshot));
    assert.ok(!task.includes("HARNESS EXECUTION BINDING"));
    assert.ok(!task.includes("HARNESS_ROLE_RESULT"));
    for (const flag of [
      "--safe-mode",
      "--restricted",
      "--disable-slash-commands",
      "--strict-mcp-config",
      "--no-session-persistence",
    ])
      assert.ok(command.includes(flag));
    assert.equal(command[command.indexOf("--setting-sources") + 1], "");
    assert.equal(command[command.indexOf("--permission-prompts") + 1], "none");
    const settings = JSON.parse(
      command[command.indexOf("--settings") + 1] ?? "null",
    ) as Record<string, unknown>;
    const filesystem = (
      settings.sandbox as {
        filesystem: {
          denyRead: string[];
          allowRead: string[];
        };
      }
    ).filesystem;
    assert.deepEqual(filesystem.denyRead, [
      resolve(repositoryRoot, ".."),
      "/tmp",
    ]);
    assert.ok(filesystem.allowRead.includes(repositoryRoot));
    assert.ok(
      filesystem.allowRead.includes("/tmp/harness-evaluator-workspace"),
    );
    assert.ok(!filesystem.allowRead.includes("/tmp/harness-evaluator-fixture"));
    assert.ok(filesystem.allowRead.includes(scratch));
    assert.equal(
      command[command.indexOf("--tools") + 1],
      "Read,Glob,Grep,Edit,Write,Bash",
    );
    assert.equal(
      command[command.indexOf("--permission-mode") + 1],
      "acceptEdits",
    );
    assert.equal(
      command[command.indexOf("--allowedTools") + 1],
      "Bash(git *),Bash(npm *),Bash(npx *),Bash(node *),Bash(python3 *)",
    );
    assert.ok(!command.includes("--allowed-tools"));
    assert.ok(
      !command
        .filter((argument) => argument !== "--tools")
        .some((argument) => argument === "Bash" || argument === "Bash(*)"),
    );
    assert.deepEqual(resolved.workspaces.slice(0, 2), [
      repositoryRoot,
      "/tmp/harness-evaluator-workspace",
    ]);
    assert.ok(!resolved.workspaces.includes("/tmp/harness-evaluator-fixture"));
    assert.equal(command[command.indexOf("--add-dir") + 1], repositoryRoot);
    assert.ok(command.includes(scratch));
    assert.deepEqual(workflowScratchEnvironment(scratch), {
      TMPDIR: scratch,
      TMP: scratch,
      TEMP: scratch,
      XDG_CACHE_HOME: `${scratch}/cache`,
      npm_config_cache: `${scratch}/npm-cache`,
      npm_config_update_notifier: "false",
    });
    for (const flag of [
      "--bare",
      "--dangerously-skip-permissions",
      "bypassPermissions",
      "--plugin-dir",
      "--mcp-config",
    ])
      assert.ok(!command.includes(flag));
    assert.throws(
      () =>
        buildExecutorCommand(
          {
            ...resolved,
            contract: { ...resolved.contract, content: "substituted" },
          },
          scratch,
        ),
      /identity/,
    );
    const readOnly = buildExecutorCommand(
      {
        ...resolved,
        permissionProfile: {
          ...resolved.permissionProfile,
          capabilities: ["repository-read"],
        },
      },
      scratch,
    );
    assert.equal(readOnly[readOnly.indexOf("--tools") + 1], "Read,Glob,Grep");
    assert.equal(
      readOnly[readOnly.indexOf("--permission-mode") + 1],
      "dontAsk",
    );
    assert.equal(readOnly.includes("--settings"), false);
    assert.equal(readOnly.includes("--allowedTools"), false);

    assert.match(
      JSON.stringify(allocation.run.verificationAuthority),
      /canonical-workflow/,
    );
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("direct Spike 012 evaluator verification allocations resolve pinned bootstrap authority", async () => {
  const { host, created } = await startHarness();
  try {
    // This deliberately calls the host endpoint directly. It must not rely on
    // tools/workflow.ts having already supplied the bootstrap authority.
    const allocation = await allocate(host, {
      slot: {
        workflow: "012",
        phase: "evaluator-verify",
        methodologyAttempt: "2",
      },
      role: "evaluator-verify",
      workspace: repositoryRoot,
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/spike-012-evaluator",
    });
    assert.equal(allocation.status, 201, allocation.error);
    assert.equal(
      allocation.run.skill,
      "spikes/012-correction-cycles-evaluator-repair/bootstrap/evaluator-skill.md",
    );
    assert.equal(allocation.run.skillVersion, "10");
    assert.match(
      JSON.stringify(allocation.run.verificationAuthority),
      /canonical-workflow/,
    );
    assert.equal(created.length, 1);

    // Caller-provided authority cannot replace the host-validated snapshot.
    const mismatch = await fetch(`${host.url}/workflow-runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        baseRequest({
          slot: {
            workflow: "012",
            phase: "evaluator-verify",
            methodologyAttempt: "3",
          },
          role: "evaluator-verify",
          workspace: repositoryRoot,
          permissionProfile: "evaluator",
          evaluatorWorkspace: "/tmp/spike-012-evaluator",
          verificationAuthority: { identity: "sha256:not-the-pinned-skill" },
        }),
      ),
    });
    assert.equal(mismatch.status, 400);
    assert.match(
      ((await mismatch.json()) as { error: string }).error,
      /does not match canonical workflow authority/,
    );
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("Spike 013a binds its pinned evaluator authority and refuses prompt-shaped authority", async () => {
  const { host, created } = await startHarness();
  try {
    const allocated = await allocate(host, {
      slot: {
        workflow: "013a-Workflow-execution-friction",
        phase: "evaluator-prepare",
        methodologyAttempt: "1",
      },
      role: "evaluator-prepare",
      workspace: repositoryRoot,
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/spike-013a-evaluator",
    });
    assert.equal(allocated.status, 201, allocated.error);
    assert.equal(
      allocated.run.skill,
      "spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md",
    );
    assert.equal(allocated.run.skillVersion, "11");
    assert.equal(allocated.run.roleDisposition, "pending");
    assert.equal(created.length, 1);

    const shorthand = await allocate(host, {
      slot: {
        workflow: "013a",
        phase: "evaluator-prepare",
        methodologyAttempt: "1",
      },
      role: "evaluator-prepare",
      workspace: repositoryRoot,
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/spike-013a-evaluator",
    });
    assert.equal(shorthand.status, 200, shorthand.error);
    assert.equal(shorthand.duplicate, true);
    assert.equal(shorthand.run.runId, allocated.run.runId);
    assert.deepEqual(
      shorthand.run.allocationAuthority,
      allocated.run.allocationAuthority,
    );
    assert.equal(created.length, 1);

    created[0]?.finish({ ok: true });
    await settle();
    const exited = await getRun(host, allocated.run.runId);
    assert.equal(exited.status, "completed");
    assert.equal(exited.roleDisposition, "pending");

    const result = await fetch(
      `${host.url}/workflow-runs/${allocated.run.runId}/result`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: exited.role,
          methodologyAttempt: exited.methodologyAttempt,
          skill: exited.skill,
          skillVersion: exited.skillVersion,
          verificationAuthority: exited.verificationAuthority,
          disposition: "succeeded",
        }),
      },
    );
    assert.equal(result.status, 200);
    assert.equal(
      (await getRun(host, allocated.run.runId)).roleDisposition,
      "succeeded",
    );
  } finally {
    await host.close();
  }
});

void test("protected evaluator roles use host configuration, never caller worker permissions", async () => {
  const { host, created } = await startHarness({
    evaluatorWorkspace: "/tmp/host-owned-evaluator-workspace",
  });
  try {
    const allocation = await allocate(host, {
      slot: {
        workflow: "013a",
        phase: "evaluator-prepare",
        methodologyAttempt: "1",
      },
      role: "evaluator-prepare",
      workspace: repositoryRoot,
      permissionProfile: "repo-local-worker",
      evaluatorWorkspace: "/tmp/caller-controlled-workspace",
    });
    assert.equal(allocation.status, 201, allocation.error);
    const profile = allocation.run.permissionProfile as {
      id: string;
      workspaces: string[];
      capabilities: string[];
    };
    assert.equal(profile.id, "evaluator");
    assert.deepEqual(profile.workspaces.slice(0, 2), [
      repositoryRoot,
      "/tmp/host-owned-evaluator-workspace",
    ]);
    assert.ok(!profile.workspaces.includes("/tmp/caller-controlled-workspace"));
    assert.ok(profile.capabilities.includes("workspace-write"));
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("a protected evaluator allocation without host configuration is rejected before launch", async () => {
  const { host, created } = await startHarness({});
  try {
    const allocation = await allocate(host, {
      slot: {
        workflow: "013a",
        phase: "evaluator-prepare",
        methodologyAttempt: "1",
      },
      role: "evaluator-prepare",
      workspace: repositoryRoot,
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/caller-cannot-configure-host",
    });
    assert.equal(allocation.status, 400);
    assert.match(
      allocation.error ?? "",
      /evaluator permission profile requires a declared evaluatorWorkspace/,
    );
    assert.equal(created.length, 0);
  } finally {
    await host.close();
  }
});

void test("repository fixtures resolve from candidate bytes without caller-shaped execution", async (t) => {
  const fixtureName = `999b-workflow-fixture-${String(process.pid)}`;
  const fixture = join(repositoryRoot, "spikes", fixtureName);
  mkdirSync(join(fixture, "bootstrap"), { recursive: true });
  mkdirSync(join(fixture, "fixtures"), { recursive: true });
  t.after(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  const sourcePath = "skills/evaluator/SKILL.md";
  const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
  const snapshot = readFileSync(join(repositoryRoot, sourcePath), "utf8");
  const contractIdentity = `sha256:${createHash("sha256").update(snapshot).digest("hex")}`;
  const definition = `${JSON.stringify({
    version: 1,
    identity: "synthetic-read-only-evaluator",
    canonicalPrerequisite: "current-implementation-handoff",
    role: "evaluator-verify",
    executor: "claude",
    contract: {
      name: "evaluator",
      version: 11,
      identity: contractIdentity,
      deliveryMode: "claude-system-contract",
    },
    permissionProfile: "repository-read-only",
    permittedSideEffects: "none",
    expectedRoleDisposition: "succeeded",
    prompt: "Inspect the delivered contract and report the fixture outcome.",
  })}\n`;
  const publicFiles = {
    "spike.md": "# Fixture brief\n",
    "design-map.md": "# Fixture design map\n",
    "coverage-map.json": `${JSON.stringify({
      criteria: [
        {
          id: "AC01",
          frozenAuthority: "spike.md AC01",
          mode: "PUBLIC_REGRESSION",
          required: true,
          procedures: ["FX1"],
          sufficiency: "FX1 establishes AC01.",
        },
      ],
      readiness: {
        evaluatorRevision: "001",
        privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
        validatorResultBinding: `sha256:${"1".repeat(64)}`,
        integrityValidation: "PASS",
      },
    })}\n`,
    "fixtures/read-only.json": definition,
  };
  const provenance = syntheticSpikeProvenance(fixtureName, publicFiles);
  for (const [name, content] of Object.entries(publicFiles)) {
    const path = join(fixture, name);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, content);
  }
  writeFileSync(join(fixture, "bootstrap/evaluator-skill.md"), snapshot);
  writeFileSync(
    join(fixture, "bootstrap/evaluator-authority.json"),
    `${JSON.stringify({
      evaluatorSkill: {
        name: "evaluator",
        contractVersion: 11,
        sourceCommit,
        sourcePath,
        identity: contractIdentity,
        snapshotPath: "bootstrap/evaluator-skill.md",
      },
    })}\n`,
  );
  const artifact = (path: keyof typeof publicFiles) => ({
    path,
    commit: provenance.commit,
    identity: provenance.identities[path],
  });
  writeFileSync(
    join(fixture, "workflow.jsonl"),
    [
      { transition: "brief-frozen", evidence: artifact("spike.md") },
      {
        transition: "design-map-frozen",
        evidence: artifact("design-map.md"),
      },
      {
        transition: "evaluation-prepared",
        evidence: artifact("coverage-map.json"),
      },
      {
        transition: "implementation-handoff",
        evidence: { commit: provenance.commit, attempt: 1 },
      },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n") + "\n",
  );

  const { host, created, contexts } = await startHarness();
  try {
    const response = await fetch(`${host.url}/workflow-fixtures`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflow: fixtureName,
        fixture: "read-only",
        candidateCommit: provenance.commit,
      }),
    });
    assert.equal(response.status, 201);
    const child = ((await response.json()) as { run: RunRecord }).run;
    assert.equal(child.executor, "claude");
    assert.equal(child.role, "evaluator-verify");
    assert.equal(child.contractDeliveryMode, "claude-system-contract");
    assert.equal(child.workflow, fixtureName);
    assert.equal(child.phase, "fixture:read-only");
    const childFixture = child.fixture as Record<string, unknown>;
    assert.equal(childFixture.identity, "synthetic-read-only-evaluator");
    assert.equal(childFixture.candidateCommit, provenance.commit);
    assert.equal(
      childFixture.definitionIdentity,
      provenance.identities["fixtures/read-only.json"],
    );
    assert.equal(childFixture.parentRunId, null);
    assert.equal(created.length, 1);
    const childContext = contexts[0];
    assert.ok(childContext);
    assert.equal(childContext.spec.executor, "claude");
    assert.equal(childContext.spec.role, "evaluator-verify");
    assert.equal(childContext.spec.contract.identity, contractIdentity);
    assert.equal(childContext.spec.permissionProfile.id, "evaluator");
    assert.deepEqual(
      childContext.spec.permissionProfile.workspaces.slice(0, 2),
      [repositoryRoot, "/tmp/harness-evaluator-workspace"],
    );
    assert.ok(
      childContext.spec.permissionProfile.capabilities.includes(
        "workspace-write",
      ),
    );
    created[0]?.finish({
      ok: true,
      roleResult: { disposition: "succeeded" },
    });
    await settle();
    const completed = await getRun(host, child.runId);
    assert.equal(
      isSuccessfulWorkflowFixtureEvidence(
        completed as unknown as WorkflowRunRecord,
        {
          workflow: fixtureName,
          fixture: "read-only",
          candidateCommit: provenance.commit,
        },
      ),
      true,
    );
    assert.equal(
      isSuccessfulWorkflowFixtureEvidence(
        completed as unknown as WorkflowRunRecord,
        {
          workflow: fixtureName,
          fixture: "read-only",
          candidateCommit: sourceCommit,
        },
      ),
      false,
    );

    const arbitrary = await fetch(`${host.url}/workflow-fixtures`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflow: fixtureName,
        fixture: "read-only",
        candidateCommit: provenance.commit,
        role: "implementation",
        executor: "codex",
      }),
    });
    assert.equal(arbitrary.status, 400);
    assert.match(
      ((await arbitrary.json()) as { error: string }).error,
      /only accepts workflow, fixture, candidateCommit, and optional parentRunId/,
    );
    const stale = await fetch(`${host.url}/workflow-fixtures`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflow: fixtureName,
        fixture: "read-only",
        candidateCommit: sourceCommit,
        parentRunId: child.runId,
      }),
    });
    assert.equal(stale.status, 400);
    assert.match(
      ((await stale.json()) as { error: string }).error,
      /current canonical implementation handoff/,
    );
    assert.equal(created.length, 1);
  } finally {
    await host.close();
  }
});

void test("the daemon may grant only the fixed evaluator hidden sibling", async () => {
  const { host } = await startHarness();
  const prior = process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE;
  process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE = join(
    repositoryRoot,
    "..",
    "harness-hidden",
  );
  try {
    const allocation = await allocate(host, {
      slot: {
        workflow: "013a",
        phase: "evaluator-verify",
        methodologyAttempt: "5",
      },
      role: "evaluator-verify",
      executor: "claude",
      workspace: repositoryRoot,
      invocationMode: "direct",
      humanAuthorization: true,
      permissionProfile: "evaluator",
      evaluatorWorkspace: "/tmp/harness-evaluator-hidden-test",
    });
    assert.equal(allocation.status, 201, allocation.error);
    assert.deepEqual(
      (allocation.run.workspaces as string[]).at(-1),
      join(repositoryRoot, "..", "harness-hidden"),
    );
  } finally {
    if (prior === undefined)
      delete process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE;
    else process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE = prior;
    await host.close();
  }
});

void test("the host may configure Claude without granting it to workers", () => {
  const spec = { executor: "claude" } as ResolvedWorkflowRunSpec;
  assert.equal(
    workflowProviderProgram(spec, "claude", "/host-only/claude"),
    "/host-only/claude",
  );
  assert.equal(
    workflowProviderProgram(
      { ...spec, executor: "codex" },
      "codex",
      "/host-only/claude",
    ),
    "codex",
  );
});

void test("a structured provider result reaches the semantic outcome without a second actor", async () => {
  const { host, created } = await startHarness();
  try {
    const allocated = await allocate(host);
    assert.equal(allocated.status, 201, allocated.error);
    created[0]?.finish({
      ok: true,
      roleResult: { disposition: "succeeded" },
    });
    await settle();
    const terminal = await getRun(host, allocated.run.runId);
    assert.equal(terminal.status, "completed");
    assert.equal(terminal.roleDisposition, "succeeded");
    assert.equal(
      (terminal.roleResult as Record<string, unknown>).contractIdentity,
      terminal.contractIdentity,
    );
    assert.equal(
      (terminal.roleResult as Record<string, unknown>).contractDeliveryMode,
      terminal.contractDeliveryMode,
    );
  } finally {
    await host.close();
  }
});

void test("a terminal non-successful role result is retryable without rewriting the prior run", async () => {
  const { host, created } = await startHarness();
  try {
    const first = await allocate(host);
    created[0]?.finish({
      ok: true,
      roleResult: { disposition: "blocked", reason: "needs another pass" },
    });
    await settle();
    const preserved = await getRun(host, first.run.runId);
    assert.equal(preserved.roleDisposition, "blocked");

    const retry = await allocate(host);
    assert.equal(retry.status, 201, retry.error);
    assert.equal(retry.run.executionAttempt, 2);
    assert.equal(retry.run.previousExecutionId, first.run.runId);
    assert.equal(
      (await getRun(host, first.run.runId)).roleDisposition,
      "blocked",
    );

    created[1]?.finish({
      ok: true,
      roleResult: { disposition: "succeeded" },
    });
    await settle();
    const duplicate = await allocate(host);
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.run.runId, retry.run.runId);
    assert.equal(created.length, 2);
  } finally {
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
        workspace: repositoryRoot,
      })
    ).run.permissionProfile as {
      id: string;
      workspaces: string[];
      capabilities: string[];
    };
    assert.equal(standard.id, "repo-local-worker");
    assert.deepEqual(standard.workspaces, [repositoryRoot]);
    assert.ok(standard.capabilities.includes("child-process"));
    assert.ok(standard.capabilities.includes("test-build-lint-format"));
    assert.ok(standard.capabilities.includes("git-commit"));

    const evaluator = (
      await allocate(host, {
        slot: { workflow: "011", phase: "phase-b", methodologyAttempt: "1" },
        workspace: repositoryRoot,
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
      repositoryRoot,
      "/repo/harness-evaluator",
    ]);
    assert.deepEqual(evaluator.capabilities, standard.capabilities);
    for (const capability of [
      "repository-read",
      "workspace-write",
      "local-computation",
      "child-process",
      "test-build-lint-format",
      "git-inspect",
      "workflow-bookkeeping",
    ])
      assert.ok(evaluator.capabilities.includes(capability), capability);

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
    contract: {
      name: "implementation",
      content: "ordinary contract",
      path: "skills/implementation/SKILL.md",
      version: "3",
      identity: `sha256:${"0".repeat(64)}`,
      deliveryMode: "host-directed-repository-load",
    },
    allocationAuthority: { type: "host-workflow-allocation" },
    verificationAuthority: null,
    orchestrator: null,
    prompt: "do the work",
  });

  const codex = buildExecutorCommand(spec("codex", ["/repo/harness"]));
  assert.ok(codex.includes("--sandbox") && codex.includes("workspace-write"));
  assert.ok(!codex.includes("--approve-for-me"));
  assert.ok(!codex.includes("--ask-for-approval"));
  assert.ok(!codex.includes("--dangerously-bypass-approvals-and-sandbox"));
  assert.match(codex.at(-1) ?? "", /HARNESS_ROLE_RESULT/);
  assert.match(codex.at(-1) ?? "", /skills\/implementation\/SKILL\.md/);

  const claude = buildExecutorCommand(
    spec("claude", ["/repo/harness", "/repo/harness-evaluator"]),
  );
  assert.ok(
    claude.includes("--permission-mode") && claude.includes("acceptEdits"),
  );
  assert.ok(claude.includes("--add-dir"));
  assert.ok(claude.includes("/repo/harness-evaluator"));
  assert.equal(claude.at(-2), "--");
  assert.match(claude.at(-1) ?? "", /HARNESS_ROLE_RESULT/);
  assert.ok(!claude.includes("--dangerously-skip-permissions"));
  assert.ok(!claude.includes("bypassPermissions"));
  assert.ok(!claude.includes("--system-prompt"));
  assert.ok(!claude.includes("--safe-mode"));
  assert.ok(!codex.includes("--system-prompt"));
});

void test("Claude evaluator execution gets run-scoped scratch that is removed at exit", async () => {
  const fixture = mkdtempSync(join(tmpdir(), "harness-scratch-test-"));
  const fakeBin = join(fixture, "bin");
  const repository = join(fixture, "repository");
  const evaluator = join(fixture, "evaluator");
  mkdirSync(fakeBin);
  mkdirSync(repository);
  mkdirSync(evaluator);
  writeFileSync(
    join(fakeBin, "claude"),
    `#!/usr/bin/env node
console.log(JSON.stringify({args: process.argv.slice(2), env: {
  TMPDIR: process.env.TMPDIR, TMP: process.env.TMP, TEMP: process.env.TEMP,
  XDG_CACHE_HOME: process.env.XDG_CACHE_HOME,
  npm_config_cache: process.env.npm_config_cache,
  npm_config_update_notifier: process.env.npm_config_update_notifier,
}}));
setTimeout(() => console.log('HARNESS_ROLE_RESULT {"disposition":"succeeded"}'), 50);
`,
    { mode: 0o755 },
  );
  const oldPath = process.env.PATH;
  process.env.PATH = `${fakeBin}:${oldPath ?? ""}`;
  const content = "---\nname: evaluator\n---\nContract version: 1\n";
  const spec: ResolvedWorkflowRunSpec = {
    slot: {
      workflow: "999-scratch-probe",
      phase: "evaluator-verify",
      methodologyAttempt: "1",
    },
    role: "evaluator-verify",
    executor: "claude",
    invocationMode: "delegated",
    workspaces: [repository, evaluator],
    permissionProfile: {
      id: "evaluator",
      workspaces: [repository, evaluator],
      capabilities: [
        "repository-read",
        "workspace-write",
        "local-computation",
        "child-process",
      ],
    },
    skill: "skills/evaluator/SKILL.md",
    skillVersion: "1",
    contract: {
      name: "evaluator",
      content,
      path: "skills/evaluator/SKILL.md",
      version: "1",
      identity: `sha256:${createHash("sha256").update(content).digest("hex")}`,
      deliveryMode: "claude-system-contract",
    },
    allocationAuthority: { type: "canonical-workflow" },
    verificationAuthority: { type: "canonical-workflow" },
    orchestrator: null,
    prompt: "probe",
  };
  try {
    const backend = createLocalWorkflowBackend({ runId: "scratch-run", spec });
    const scratch = backend.scratchWorkspace;
    assert.ok(scratch);
    assert.ok(existsSync(scratch));
    let output = "";
    backend.onActivity((chunk) => {
      output += chunk;
    });
    const outcome = await new Promise<WorkflowRunExitOutcome>((resolveExit) => {
      backend.onExit(resolveExit);
    });
    assert.equal(outcome.ok, true);
    assert.equal(outcome.roleResult?.disposition, "succeeded");
    assert.equal(existsSync(scratch), false);
    const diagnostic = JSON.parse(output.split("\n")[0] ?? "null") as {
      args: string[];
      env: Record<string, string>;
    };
    assert.ok(diagnostic.args.includes(scratch));
    assert.deepEqual(diagnostic.env, workflowScratchEnvironment(scratch));
  } finally {
    process.env.PATH = oldPath;
    rmSync(fixture, { recursive: true, force: true });
  }
});

void test("the provider result protocol accepts only a final structured disposition", () => {
  assert.deepEqual(
    parseWorkflowBackendRoleResult(
      'ordinary prose\nHARNESS_ROLE_RESULT {"disposition":"blocked","reason":"missing input"}\n',
    ),
    { disposition: "blocked", reason: "missing input" },
  );
  assert.equal(
    parseWorkflowBackendRoleResult(
      'I succeeded, honestly\nHARNESS_ROLE_RESULT {"disposition":"succeeded","authority":"self-appointed"}\n',
    ),
    undefined,
  );
  assert.equal(parseWorkflowBackendRoleResult("looks good to me\n"), undefined);
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
  assert.match(early.stderr, /lacks a successful semantic role result/);

  created.at(-1)?.finish({ ok: true });
  await settle();
  const binding = await getRun(host, runId);
  const result = await fetch(`${host.url}/workflow-runs/${runId}/result`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      role: binding.role,
      methodologyAttempt: binding.methodologyAttempt,
      skill: binding.skill,
      skillVersion: binding.skillVersion,
      verificationAuthority: binding.verificationAuthority,
      disposition: "succeeded",
    }),
  });
  assert.equal(result.status, 200);
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
  assert.match(result.stderr, /lacks a successful semantic role result/);
});

void test("durable run evidence splits public/private by resolved permission profile", async (t) => {
  const fixtureName = `999f-durable-evidence-${String(process.pid)}`;
  const fixture = join(repositoryRoot, "spikes", fixtureName);
  const hiddenFixture = join(
    repositoryRoot,
    "..",
    "harness-hidden",
    "spikes",
    fixtureName,
  );
  mkdirSync(fixture, { recursive: true });
  t.after(() => {
    rmSync(fixture, { recursive: true, force: true });
    rmSync(hiddenFixture, { recursive: true, force: true });
  });

  const priorHidden = process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE;
  process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE = join(
    repositoryRoot,
    "..",
    "harness-hidden",
  );

  let ordinaryRunId: string;
  let protectedRunId: string;
  try {
    const { host, created } = await startHarness();
    try {
      const ordinary = await allocate(host, {
        slot: {
          workflow: fixtureName,
          phase: "implementation",
          methodologyAttempt: "1",
        },
      });
      assert.equal(ordinary.status, 201, ordinary.error);
      ordinaryRunId = ordinary.run.runId;
      created.at(-1)?.emit("public transcript line\n");
      created.at(-1)?.finish({
        ok: true,
        roleResult: { disposition: "succeeded", reason: "PUBLIC_REASON_TEXT" },
      });

      const protectedRun = await allocate(host, {
        slot: {
          workflow: fixtureName,
          phase: "evaluator-verify",
          methodologyAttempt: "1",
        },
        role: "evaluator-verify",
        invocationMode: "direct",
        humanAuthorization: true,
        skill: undefined,
      });
      assert.equal(protectedRun.status, 201, protectedRun.error);
      protectedRunId = protectedRun.run.runId;
      created.at(-1)?.emit("CONFIDENTIAL transcript detail 42\n");
      created.at(-1)?.finish({
        ok: true,
        roleResult: { disposition: "succeeded", reason: "PRIVATE_REASON_TEXT" },
      });
      await settle();
    } finally {
      await host.close();
    }
  } finally {
    if (priorHidden === undefined)
      delete process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE;
    else process.env.HARNESS_EVALUATOR_HIDDEN_WORKSPACE = priorHidden;
  }

  // Read every assertion below directly from disk, after the host and its
  // registry are closed: durable evidence must not depend on the writing
  // process's live memory.
  const publicOrdinaryPath = join(
    fixture,
    ".workflow",
    "runs",
    `${ordinaryRunId}.json`,
  );
  const publicOrdinary = JSON.parse(
    readFileSync(publicOrdinaryPath, "utf8"),
  ) as { runId: string; roleResult: { reason: string | null } };
  assert.equal(publicOrdinary.runId, ordinaryRunId);
  assert.equal(publicOrdinary.roleResult.reason, "PUBLIC_REASON_TEXT");
  assert.ok(
    !existsSync(
      join(hiddenFixture, ".workflow", "runs", `${ordinaryRunId}.json`),
    ),
    "an ordinary run must never be mirrored under harness-hidden",
  );

  const publicProtectedPath = join(
    fixture,
    ".workflow",
    "runs",
    `${protectedRunId}.json`,
  );
  const publicProtectedRaw = readFileSync(publicProtectedPath, "utf8");
  assert.ok(!publicProtectedRaw.includes("PRIVATE_REASON_TEXT"));
  assert.ok(!publicProtectedRaw.includes("CONFIDENTIAL transcript detail 42"));
  const publicProtected = JSON.parse(publicProtectedRaw) as {
    roleResult: { reason: string | null };
    logIdentity: string;
  };
  assert.equal(publicProtected.roleResult.reason, null);
  assert.equal(typeof publicProtected.logIdentity, "string");

  const hiddenRunsDir = join(hiddenFixture, ".workflow", "runs");
  const hiddenRecord = JSON.parse(
    readFileSync(join(hiddenRunsDir, `${protectedRunId}.json`), "utf8"),
  ) as { roleResult: { reason: string | null } };
  assert.equal(hiddenRecord.roleResult.reason, "PRIVATE_REASON_TEXT");
  const hiddenLog = readFileSync(
    join(hiddenRunsDir, `${protectedRunId}.log`),
    "utf8",
  );
  assert.equal(hiddenLog, "CONFIDENTIAL transcript detail 42\n");

  // Independent recomputation, mirroring how the evaluator corroborated
  // implementation attempt 8's LP1 evidence by hand for AC08/AC09: the
  // public logIdentity must match a fresh hash of the private log, computed
  // here from the primary file on disk rather than trusted from the record.
  const recomputedLogIdentity = `sha256:${createHash("sha256").update(hiddenLog).digest("hex")}`;
  assert.equal(publicProtected.logIdentity, recomputedLogIdentity);
});

void test("a new canonical verification allocation is not deduplicated against a prior successful one", async (t) => {
  const fixtureName = `999g-verification-dedup-${String(process.pid)}`;
  const fixture = join(repositoryRoot, "spikes", fixtureName);
  mkdirSync(fixture, { recursive: true });
  t.after(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  const publicFiles = {
    "spike.md": "# Fixture brief\n",
    "design-map.md": "# Fixture design map\n",
    "coverage-map.json": `${JSON.stringify({
      criteria: [
        {
          id: "AC01",
          frozenAuthority: "spike.md AC01",
          mode: "PUBLIC_REGRESSION",
          required: true,
          procedures: ["PR1"],
          sufficiency: "PR1 establishes AC01.",
        },
      ],
      readiness: {
        evaluatorRevision: "001",
        privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
        validatorResultBinding: `sha256:${"1".repeat(64)}`,
        integrityValidation: "PASS",
      },
    })}\n`,
  };
  for (const [name, content] of Object.entries(publicFiles))
    writeFileSync(join(fixture, name), content);
  const provenance = syntheticSpikeProvenance(fixtureName, publicFiles);
  const artifact = (path: keyof typeof publicFiles) => ({
    path,
    commit: provenance.commit,
    identity: provenance.identities[path],
  });
  const ledgerPath = join(fixture, "workflow.jsonl");
  const baseEvents = [
    { transition: "brief-frozen", evidence: artifact("spike.md") },
    { transition: "design-map-frozen", evidence: artifact("design-map.md") },
    {
      transition: "evaluation-prepared",
      evidence: artifact("coverage-map.json"),
    },
    {
      transition: "implementation-handoff",
      evidence: { commit: provenance.commit, attempt: 1 },
    },
    {
      transition: "verification-allocated",
      evidence: {
        commit: provenance.commit,
        implementationAttempt: 1,
        attempt: 1,
      },
    },
  ];
  writeFileSync(
    ledgerPath,
    `${baseEvents.map((event) => JSON.stringify(event)).join("\n")}\n`,
  );

  const { host, created } = await startHarness();
  try {
    const verifyRequest = {
      slot: {
        workflow: fixtureName,
        phase: "evaluator-verify",
        methodologyAttempt: "1",
      },
      role: "evaluator-verify",
    };
    const first = await allocate(host, verifyRequest);
    assert.equal(first.status, 201, first.error);
    created[0]?.finish({ ok: true, roleResult: { disposition: "succeeded" } });
    await settle();
    assert.equal(
      (await getRun(host, first.run.runId)).roleDisposition,
      "succeeded",
    );

    // A second, genuinely distinct canonical `verification-allocated` event
    // now targets the same (workflow, phase, methodologyAttempt) as the
    // first — exactly the shape of canonical verification attempts 11-15,
    // which all targeted the same implementation attempt in the real
    // Spike 013a ledger and previously collided on one host-run slot.
    const nextEvent = {
      transition: "verification-allocated",
      evidence: {
        commit: provenance.commit,
        implementationAttempt: 1,
        attempt: 2,
      },
    };
    writeFileSync(
      ledgerPath,
      `${[...baseEvents, nextEvent].map((event) => JSON.stringify(event)).join("\n")}\n`,
    );

    const second = await allocate(host, verifyRequest);
    assert.equal(second.status, 201, second.error);
    assert.equal(second.duplicate, false);
    assert.notEqual(second.run.runId, first.run.runId);
    assert.equal(second.run.executionAttempt, 1);
    assert.equal(second.run.previousExecutionId, null);
    assert.equal(created.length, 2);

    // The same new canonical authority remains idempotent on retry.
    const retry = await allocate(host, verifyRequest);
    assert.equal(retry.status, 200);
    assert.equal(retry.duplicate, true);
    assert.equal(retry.run.runId, second.run.runId);
    assert.equal(created.length, 2);

    // The superseded slot's own successful run is preserved, not rewritten.
    assert.equal(
      (await getRun(host, first.run.runId)).roleDisposition,
      "succeeded",
    );
  } finally {
    await host.close();
  }
});
