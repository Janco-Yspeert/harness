// Spike 014c deterministic governed-executor tests. No provider is ever
// called: provider discovery and event streams are mocked through the host's
// programmatic seams, while the real host, kernel, adapters, worker protocol,
// MCP tool server and relay run end to end.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  buildGovernedClaudeCommand,
  governedClaudePermissions,
} from "../src/claude-workflow.ts";
import {
  ADAPTERS,
  locateProvider,
  planLaunch,
  validateProductionExecutors,
} from "../src/executors/adapters.ts";
import { providerEnvironment } from "../src/executors/governed.ts";
import {
  parseWorkerRequest,
  WORKER_OPERATIONS,
  WORKER_PROTOCOL_SCHEMAS,
} from "../src/executors/protocol.ts";
import { handleMessage } from "../src/executors/worker-tools.ts";
import { startHarnessHost } from "../src/index.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import { ExecutionKernel } from "../src/kernel/execution.ts";
import { identity, readLedger } from "../src/kernel/ledger.ts";
import { loadDefinition } from "../src/kernel/methodology.ts";
import type {
  Execution,
  ExecutorProfile,
  RoleGrant,
  WorkflowGrant,
} from "../src/kernel/model.ts";
import {
  assertTrustedMethodology,
  trustedDefinition,
} from "../src/kernel/trust.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";
import { assertBoundedExecutorCommand } from "../src/workflow-backend.ts";
import { trustFixtureMethodology } from "./support/trusted-fixture.ts";

const repository = resolve(".");
const fixtureSource = resolve("fixtures/governed-smoke");
const fakeProvider = resolve("tools/fixtures/fake-provider.ts");
const rootToken = "test-human-root-credential-014c-0000000000";
const auth = {
  authorization: `Bearer ${rootToken}`,
  "content-type": "application/json",
};
const ALL = [
  "repository-read",
  "repository-write",
  "local-computation",
  "git-inspect",
  "git-commit",
];
const claudeProfile: ExecutorProfile = {
  id: "claude",
  provider: "claude",
  modes: ["spawned"],
  capabilities: ALL,
  isolation: ["private-workspace"],
  available: true,
};
const codexProfile: ExecutorProfile = {
  id: "codex",
  provider: "codex",
  modes: ["spawned"],
  capabilities: ALL,
  isolation: [],
  available: true,
};
const PROMOTION = "smoke-claude-promotion";
const CODEX = "smoke-codex";

interface Scenario {
  steps?: Array<{
    tool: string;
    args?: Record<string, unknown>;
    promotion?: { candidate?: string; attempt?: number; identity?: string };
  }>;
  exit?: number;
  model?: string;
  mcpStatus?: string;
  denials?: Array<{ tool_name: string }>;
  events?: unknown[];
  hang?: boolean;
  resultError?: boolean;
}

// A disposable copy of the committed smoke fixture, with its own test-only
// trust root, one temporary workflow and temporary workspaces.
function smoke(
  t: TestContext,
  options: {
    scenario?: Scenario;
    executors?: ExecutorProfile[];
    locate?: boolean;
  } = {},
) {
  const dir = mkdtempSync(join(tmpdir(), "governed-exec-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const root = join(dir, "project");
  cpSync(fixtureSource, root, { recursive: true });
  rmSync(join(root, "methodology", "trusted.jsonl"), { force: true });
  const trusted = trustFixtureMethodology(root, {
    policy: "methodology/policy.json",
    methodologyPaths: ["methodology/contracts", "methodology/skills"],
    history: "methodology/trusted.jsonl",
  });
  const workflowDir = join(dir, "workflow");
  const privateDir = join(dir, "private");
  cpSync(join(root, "data"), workflowDir, { recursive: true });
  cpSync(join(root, "private"), privateDir, { recursive: true });
  const project = loadProject(join(root, "project.json"));
  project.workflows.smoke = {
    directory: workflowDir,
    ledger: "workflow.jsonl",
    workspaces: {
      repository: {
        id: "smoke-repository",
        path: workflowDir,
        mode: "write",
        exposure: "public",
      },
      private: {
        id: "smoke-private",
        path: privateDir,
        mode: "write",
        exposure: "smoke-private",
      },
    },
  };
  const evidence = join(dir, "provider-evidence.json");
  const scenarioPath = join(dir, "scenario.json");
  writeFileSync(
    scenarioPath,
    JSON.stringify({ evidence, ...(options.scenario ?? {}) }),
  );
  const launched: string[] = [];
  return {
    dir,
    root,
    workflowDir,
    privateDir,
    project,
    trusted,
    evidence,
    launched,
    ledger: join(workflowDir, "workflow.jsonl"),
    options: {
      rootToken,
      project,
      executors: options.executors ?? [claudeProfile, codexProfile],
      privateDataRoot: join(dir, "host-private"),
      validators: {},
      selectExecutor: (grant: RoleGrant, profiles: ExecutorProfile[]) =>
        profiles.find(
          (profile) =>
            profile.provider === (grant.role === CODEX ? "codex" : "claude"),
        ) ?? profiles[0],
      providerRuntime: {
        ...(options.locate === false
          ? {
              locate: (program: string) => ({
                ok: false as const,
                reason: `${program} provider is not installed on the host PATH`,
              }),
            }
          : {
              locate: (program: string) => ({
                ok: true as const,
                path: `/opt/provider/${program}`,
              }),
            }),
        humanWaitMs: 2000,
        spawnProvider: ((
          program: string,
          args: readonly string[],
          spawnOptions: object,
        ) => {
          launched.push(program);
          return spawn(
            process.execPath,
            [fakeProvider, scenarioPath, program, ...args],
            spawnOptions,
          );
        }) as unknown as typeof spawn,
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- typed test view of a JSON response.
async function call<T>(
  url: string,
  path: string,
  body?: object,
): Promise<{ status: number; value: T }> {
  const response = await fetch(`${url}/governed/smoke/${path}`, {
    headers: auth,
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, value: (await response.json()) as T };
}

async function run(
  t: TestContext,
  role: string,
  scenario: Scenario,
  extra: { executor?: { model?: string; reasoning?: string } } = {},
  executors?: ExecutorProfile[],
) {
  const f = smoke(t, { scenario, ...(executors ? { executors } : {}) });
  const host = await startHarnessHost(0, { governed: f.options });
  t.after(() => host.close());
  const grant = await call<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: false,
    delegation: ["spawned"],
    maxAllocations: 2,
    roles: [role],
    ...extra,
  });
  assert.equal(grant.status, 201, JSON.stringify(grant.value));
  const started = await call<{ execution?: Execution; category?: string }>(
    host.url,
    "continue",
    { workflowGrant: grant.value.grant.id, mode: "spawned", role },
  );
  return { f, host, grant: grant.value.grant, started };
}

async function settled(url: string, id: string): Promise<Execution> {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const { value } = await call<{ execution: Execution }>(
      url,
      `executions/${id}`,
    );
    if (!["allocated", "running"].includes(value.execution.process))
      return value.execution;
    await delay(50);
  }
  throw new Error("execution did not settle");
}

function providerEvidence(path: string): {
  pid: number;
  argv: string[];
  envKeys: string[];
  cwd: string;
  tools?: { tools: Array<{ name: string }> };
  results?: Array<{ isError: boolean; structuredContent?: unknown }>;
} {
  return JSON.parse(readFileSync(path, "utf8")) as ReturnType<
    typeof providerEvidence
  >;
}

void test("AC08/AC09/AC07: Claude adapter delivers the exact assignment, relays a typed result and a host-validated promotion", async (t) => {
  const { f, host, started } = await run(t, PROMOTION, {
    steps: [
      { tool: "assignment" },
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
      { tool: "requestAction", promotion: {} },
    ],
  });
  assert.equal(started.status, 201, JSON.stringify(started.value));
  const execution = await settled(host.url, started.value.execution?.id ?? "");
  assert.equal(execution.process, "exited");
  assert.equal(execution.result?.disposition, "succeeded");
  assert.deepEqual(execution.result.methodology, { smoke: "PASS" });
  assert.equal(execution.actions[0]?.status, "succeeded");
  assert.equal(execution.transition?.status, "recorded");
  assert.deepEqual(execution.executor?.confirmed, {
    model: "fake-model",
    reasoning: null,
  });
  assert.deepEqual(f.launched, ["/opt/provider/claude"]);
  const promoted = readFileSync(
    join(f.workflowDir, "promoted", "promotion-bytes.txt"),
  );
  assert.deepEqual(
    promoted,
    readFileSync(join(fixtureSource, "private", "promotion-bytes.txt")),
  );
  const transitions = readLedger(f.ledger).map((event) => event.transition);
  assert.ok(transitions.includes("smoke-promotion-recorded"));
  assert.ok(transitions.includes("claude-smoked"));
  const evidence = providerEvidence(f.evidence);
  assert.deepEqual(
    evidence.tools?.tools.map((tool) => tool.name),
    [...WORKER_OPERATIONS],
  );
  const assignment = evidence.results?.[0]?.structuredContent as {
    protocolVersion: number;
    execution: string;
    skill: { content: string; identity: string };
  };
  const skillBytes = readFileSync(
    join(fixtureSource, "methodology/skills/smoke-claude-promotion.md"),
    "utf8",
  );
  assert.equal(assignment.protocolVersion, 1);
  assert.equal(assignment.execution, execution.id);
  assert.equal(assignment.skill.content, skillBytes);
  assert.equal(assignment.skill.identity, identity(skillBytes));
  // Protected roles launch inside their private workspace.
  assert.equal(evidence.cwd, f.privateDir);
  const systemPrompt =
    evidence.argv[evidence.argv.indexOf("--system-prompt") + 1];
  assert.ok(systemPrompt?.includes(skillBytes));
  // Safe mode would disable the Harness MCP server; each ambient exclusion is
  // kept explicitly instead.
  assert.ok(!evidence.argv.includes("--safe-mode"));
  for (const flag of [
    "--strict-mcp-config",
    "--restricted",
    "--disable-slash-commands",
  ])
    assert.ok(evidence.argv.includes(flag), flag);
  assert.equal(
    evidence.argv[evidence.argv.indexOf("--setting-sources") + 1],
    "",
  );
  assert.doesNotThrow(() => {
    assertBoundedExecutorCommand(evidence.argv);
  });
});

void test("AC10: a PASS survives an omitted required promotion; nothing is inferred from clean exit", async (t) => {
  const { f, host, started } = await run(t, PROMOTION, {
    steps: [
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
    ],
  });
  const execution = await settled(host.url, started.value.execution?.id ?? "");
  assert.equal(execution.process, "exited");
  assert.equal(execution.result?.disposition, "succeeded");
  assert.equal(execution.actions.length, 0);
  assert.notEqual(execution.transition?.status, "recorded");
  assert.deepEqual(
    execution.diagnostics?.map((d) => d.category),
    ["action-omitted"],
  );
  const transitions = readLedger(f.ledger).map((event) => event.transition);
  assert.ok(!transitions.includes("smoke-promotion-recorded"));
  assert.ok(!transitions.includes("claude-smoked"));
  assert.ok(!existsSync(join(f.workflowDir, "promoted")));
});

void test("AC10: denied and failed promotions keep the PASS and never record promotion", async (t) => {
  for (const [promotion, category] of [
    [{ candidate: `sha256:${"0".repeat(64)}` }, "action-denied"],
    [{ identity: `sha256:${"1".repeat(64)}` }, "action-failed"],
  ] as const) {
    const { f, host, started } = await run(t, PROMOTION, {
      steps: [
        {
          tool: "submitResult",
          args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
        },
        { tool: "requestAction", promotion },
      ],
    });
    const execution = await settled(
      host.url,
      started.value.execution?.id ?? "",
    );
    assert.equal(execution.result?.disposition, "succeeded");
    assert.equal(execution.actions.length, 1);
    assert.notEqual(execution.actions[0]?.status, "succeeded");
    assert.notEqual(execution.transition?.status, "recorded");
    assert.ok(
      execution.diagnostics?.some((d) => d.category === category),
      JSON.stringify(execution.diagnostics),
    );
    const transitions = readLedger(f.ledger).map((event) => event.transition);
    assert.ok(!transitions.includes("smoke-promotion-recorded"));
    assert.ok(!existsSync(join(f.workflowDir, "promoted")));
  }
});

void test("semantic BLOCKED Design Map stops automatic retry even when its pinned policy permits it", async (t) => {
  const f = smoke(t, {
    scenario: {
      steps: [
        {
          tool: "submitResult",
          args: { disposition: "blocked", methodology: {} },
        },
      ],
      denials: [{ tool_name: "Bash" }],
    },
  });
  const policyPath = join(f.root, "methodology", "policy.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as {
    roles: Record<string, Record<string, unknown>>;
  };
  const promotion = policy.roles[PROMOTION];
  assert.ok(promotion);
  policy.roles = Object.fromEntries(
    Object.entries(policy.roles).filter(([role]) => role !== PROMOTION),
  );
  policy.roles["design-map"] = {
    ...promotion,
    retry: { dispositions: ["blocked", "failed", "interrupted"], limit: 2 },
  };
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  trustFixtureMethodology(f.root, {
    policy: "methodology/policy.json",
    methodologyPaths: ["methodology/contracts", "methodology/skills"],
    history: "methodology/trusted.jsonl",
  });

  const host = await startHarnessHost(0, { governed: f.options });
  t.after(() => host.close());
  const grant = await call<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: true,
    delegation: ["spawned"],
    maxAllocations: 3,
    roles: ["design-map"],
  });
  assert.equal(grant.status, 201, JSON.stringify(grant.value));
  const started = await call<{ execution: Execution }>(host.url, "continue", {
    workflowGrant: grant.value.grant.id,
    mode: "spawned",
    role: "design-map",
  });
  assert.equal(started.status, 201, JSON.stringify(started.value));
  const blocked = await settled(host.url, started.value.execution.id);
  await delay(300);

  assert.equal(blocked.result?.disposition, "blocked");
  assert.ok(
    blocked.diagnostics?.some(
      (diagnostic) => diagnostic.category === "permission-denied",
    ),
    "the original provider diagnostic remains attached to the blocked execution",
  );
  const executions = await call<{ executions: Execution[] }>(
    host.url,
    "executions",
  );
  assert.equal(executions.value.executions.length, 1);
  assert.deepEqual(executions.value.executions[0]?.result, blocked.result);
  const stopped = readLedger(f.ledger).filter(
    (event) => event.transition === "kernel.continuation-stopped",
  );
  assert.equal(stopped.length, 1);
  assert.match(String(stopped[0]?.evidence.reason), /semantic BLOCKED result/);
});

void test("candidate Harness policy never makes semantic BLOCKED retryable", () => {
  const policy = JSON.parse(
    readFileSync(join(repository, "methodologies/harness/policy.json"), "utf8"),
  ) as {
    roles: Record<string, { retry: { dispositions: string[] } }>;
  };
  for (const [role, definition] of Object.entries(policy.roles))
    assert.ok(
      !definition.retry.dispositions.includes("blocked"),
      `${role} must leave semantic BLOCKED to an explicit recovery`,
    );
});

void test("a canonical unanswered human request blocks retries and successors after worker exit and host restart", async (t) => {
  const f = smoke(t, {
    scenario: {
      steps: [
        {
          tool: "requestHuman",
          args: { kind: "input", question: "Choose the archival policy." },
        },
      ],
    },
  });
  f.options.providerRuntime.humanWaitMs = 30;
  const contractPath = join(
    f.root,
    "methodology",
    "contracts",
    "smoke-claude-promotion.json",
  );
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as {
    human: string[];
  };
  contract.human = ["input"];
  writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  const policyPath = join(f.root, "methodology", "policy.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8")) as {
    roles: Record<string, { retry: { dispositions: string[]; limit: number } }>;
  };
  const promotion = policy.roles[PROMOTION];
  assert.ok(promotion);
  promotion.retry = {
    dispositions: ["failed", "interrupted"],
    limit: 2,
  };
  writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  trustFixtureMethodology(f.root, {
    policy: "methodology/policy.json",
    methodologyPaths: ["methodology/contracts", "methodology/skills"],
    history: "methodology/trusted.jsonl",
  });

  const host = await startHarnessHost(0, { governed: f.options });
  const grant = await call<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: true,
    delegation: ["spawned"],
    maxAllocations: 3,
    roles: [PROMOTION],
  });
  assert.equal(grant.status, 201, JSON.stringify(grant.value));
  const started = await call<{ execution: Execution }>(host.url, "continue", {
    workflowGrant: grant.value.grant.id,
    mode: "spawned",
    role: PROMOTION,
  });
  assert.equal(started.status, 201, JSON.stringify(started.value));
  const terminal = await settled(host.url, started.value.execution.id);
  await delay(100);

  const request = terminal.requests[0];
  assert.ok(request, "the worker recorded a canonical request");
  assert.equal(request.response, null);
  assert.equal(terminal.process, "failed");
  assert.ok(
    terminal.diagnostics?.some((d) => d.category === "missing-result"),
    "the original exit diagnostic remains attached to the request's worker",
  );
  assert.equal(f.launched.length, 1, "automatic retry did not launch");
  const beforeRestart = readLedger(f.ledger);
  assert.equal(
    beforeRestart.filter((event) => event.transition === "kernel.human-request")
      .length,
    1,
  );

  await host.close();
  const restarted = await startHarnessHost(0, { governed: f.options });
  t.after(() => restarted.close());
  const retry = await call<{ kind: string; reason: string }>(
    restarted.url,
    "continue",
    {
      workflowGrant: grant.value.grant.id,
      mode: "spawned",
      role: PROMOTION,
      predecessor: terminal.id,
    },
  );
  assert.equal(retry.status, 409);
  assert.equal(retry.value.kind, "gate");
  assert.equal(
    retry.value.reason,
    `canonical human request outstanding: ${request.id}`,
  );
  assert.equal(f.launched.length, 1, "restart did not revive or replace it");
  const answered = await call<Execution>(
    restarted.url,
    `executions/${terminal.id}/respond`,
    { request: request.id, value: "retain the existing bound" },
  );
  assert.equal(answered.status, 200, JSON.stringify(answered.value));
  assert.equal(answered.value.process, "failed");
  assert.equal(answered.value.attention, "terminal");
  assert.equal(
    answered.value.requests[0]?.response?.value,
    "[private human response]",
  );
  const resolved = await call<{ kind: string }>(
    restarted.url,
    `resolve/${grant.value.grant.id}`,
  );
  assert.equal(resolved.status, 200);
  assert.equal(resolved.value.kind, "grant");
  assert.equal(f.launched.length, 1, "answering a gate remains read-only");
  const afterRestart = readLedger(f.ledger);
  assert.equal(
    afterRestart.filter((event) => event.transition === "kernel.human-request")
      .length,
    1,
  );
  assert.equal(
    afterRestart.filter((event) => event.transition === "kernel.human-response")
      .length,
    1,
  );
});

void test("worker prose does not create a human gate", async (t) => {
  const { host, started, f } = await run(t, PROMOTION, {
    steps: [
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
    ],
    events: [
      {
        type: "assistant",
        content: "Should I continue? This prose is not a canonical request.",
      },
    ],
  });
  const execution = await settled(host.url, started.value.execution?.id ?? "");
  assert.equal(execution.result?.disposition, "succeeded");
  assert.equal(execution.requests.length, 0);
  assert.equal(
    readLedger(f.ledger).filter(
      (event) => event.transition === "kernel.human-request",
    ).length,
    0,
  );
});

void test("AC08/AC12: unconfigured actions are denied by the host; tool arguments cannot select another execution", async (t) => {
  const { host, started, f } = await run(t, CODEX, {
    steps: [
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
      {
        tool: "requestAction",
        args: {
          kind: "promotion",
          candidate: "x",
          evaluatorRevision: "001",
          attempt: 1,
          artifacts: [{ source: "a", destination: "a", identity: "x" }],
        },
      },
      {
        tool: "requestAction",
        args: {
          kind: "publication",
          workspace: "repository",
          commit: "a".repeat(40),
          ref: "refs/heads/main",
        },
      },
      {
        tool: "submitResult",
        args: {
          disposition: "succeeded",
          methodology: { smoke: "PASS" },
          execution: "another-execution",
        },
      },
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
      { tool: "requestHuman", args: { kind: "input", question: "May I?" } },
    ],
  });
  const execution = await settled(host.url, started.value.execution?.id ?? "");
  assert.equal(execution.process, "exited");
  assert.equal(execution.requests.length, 0);
  assert.deepEqual(
    execution.actions.map((action) => [action.request.kind, action.status]),
    [
      ["promotion", "denied"],
      ["publication", "denied"],
    ],
  );
  const results = providerEvidence(f.evidence).results ?? [];
  assert.equal(results[3]?.isError, true);
  // Duplicate completion is rejected; the first result is retained.
  assert.equal(results[4]?.isError, true);
  // A human request the pinned contract does not permit is host-denied.
  assert.equal(results[5]?.isError, true);
  assert.equal(
    readLedger(f.ledger).filter((event) => event.transition === "kernel.result")
      .length,
    1,
  );
  assert.equal(execution.transition?.status, "recorded");
});

void test("AC11: missing result, crash, rate limit, tool denial, rejected result and unavailable tools are classified", async (t) => {
  const cases: Array<[Scenario, string, string[]]> = [
    [{ steps: [{ tool: "assignment" }] }, "failed", ["missing-result"]],
    [{ exit: 3 }, "failed", ["provider-crashed"]],
    [
      {
        events: [{ type: "assistant", error: "rate_limit" }],
        resultError: true,
        exit: 1,
      },
      "failed",
      ["rate-limited", "provider-error", "rate-limited"],
    ],
    [
      {
        denials: [{ tool_name: "Bash" }],
        steps: [
          {
            tool: "submitResult",
            args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
          },
        ],
      },
      "exited",
      ["permission-denied"],
    ],
    [
      {
        steps: [
          {
            tool: "submitResult",
            args: { disposition: "succeeded", methodology: { smoke: "MAYBE" } },
          },
        ],
      },
      "failed",
      ["result-rejected", "missing-result"],
    ],
    [
      { mcpStatus: "failed" },
      "failed",
      ["assignment-not-delivered", "assignment-not-delivered"],
    ],
  ];
  for (const [scenario, process, categories] of cases) {
    const { host, started } = await run(t, CODEX, scenario, {}, [
      { ...claudeProfile, id: "claude-for-codex-role" },
    ]);
    const execution = await settled(
      host.url,
      started.value.execution?.id ?? "",
    );
    assert.equal(execution.process, process, JSON.stringify(scenario));
    assert.deepEqual(
      execution.diagnostics?.map((d) => d.category) ?? [],
      categories,
      JSON.stringify(scenario),
    );
    assert.equal(
      execution.category ?? null,
      process === "exited" ? null : categories.at(-1),
    );
  }
});

void test("AC11: cancellation terminates the actual provider process and leaves inspectable status", async (t) => {
  const { f, host, started } = await run(t, CODEX, { hang: true });
  const id = started.value.execution?.id ?? "";
  const deadline = Date.now() + 10000;
  while (!existsSync(f.evidence) && Date.now() < deadline) await delay(25);
  const { pid } = providerEvidence(f.evidence);
  const cancelled = await call<Execution>(
    host.url,
    `executions/${id}/cancel`,
    {},
  );
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.value.process, "cancelled");
  assert.equal(cancelled.value.category, "cancelled");
  const until = Date.now() + 10000;
  let alive = true;
  while (alive && Date.now() < until) {
    try {
      process.kill(pid, 0);
      await delay(25);
    } catch {
      alive = false;
    }
  }
  assert.equal(alive, false, "provider process must be terminated");
  const execution = await settled(host.url, id);
  assert.equal(execution.process, "cancelled");
});

void test("AC12/AC03: provider environment and records never carry host or provider credentials", async (t) => {
  const saved = {
    HARNESS_ROOT_TOKEN: process.env.HARNESS_ROOT_TOKEN,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };
  process.env.HARNESS_ROOT_TOKEN = rootToken;
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-not-a-real-key";
  process.env.OPENAI_API_KEY = "sk-test-not-a-real-key";
  t.after(() => {
    for (const [key, value] of Object.entries(saved))
      if (value === undefined) Reflect.deleteProperty(process.env, key);
      else process.env[key] = value;
  });
  const { f, host, started } = await run(t, PROMOTION, {
    steps: [
      {
        tool: "submitResult",
        args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
      },
      { tool: "requestAction", promotion: {} },
    ],
  });
  await settled(host.url, started.value.execution?.id ?? "");
  const evidence = providerEvidence(f.evidence);
  for (const key of [
    "HARNESS_ROOT_TOKEN",
    "HARNESS_SESSION_TOKEN",
    "HARNESS_SESSION",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
  ])
    assert.ok(!evidence.envKeys.includes(key), key);
  const ledger = readFileSync(f.ledger, "utf8");
  assert.ok(!ledger.includes(rootToken));
  assert.ok(!evidence.argv.join(" ").includes(rootToken));
  assert.ok(!ledger.includes("not-a-real-key"));
  const env = providerEnvironment("/scratch", {
    PATH: "/usr/bin",
    HOME: "/home/x",
    HARNESS_SESSION_TOKEN: "secret",
    ANTHROPIC_API_KEY: "secret",
  });
  assert.equal(env.PATH, "/usr/bin");
  assert.equal(env.HARNESS_SESSION_TOKEN, undefined);
  assert.equal(env.ANTHROPIC_API_KEY, undefined);
});

void test("AC04/AC13: unregistered, generated, uninstalled or unenforceable launches cannot start", async (t) => {
  // No registered adapter: an arbitrary provider name without a command.
  const bridge = smoke(t, {
    executors: [{ ...claudeProfile, id: "bridge", provider: "tmp-bridge" }],
  });
  const noAdapterHost = await startHarnessHost(0, { governed: bridge.options });
  t.after(() => noAdapterHost.close());
  const cases: Array<{
    host: string;
    role: string;
    category: string;
    ledger: string;
    extra?: object;
  }> = [
    {
      host: noAdapterHost.url,
      role: PROMOTION,
      category: "no-adapter",
      ledger: bridge.ledger,
    },
  ];
  const missing = smoke(t, { locate: false });
  const missingHost = await startHarnessHost(0, { governed: missing.options });
  t.after(() => missingHost.close());
  cases.push({
    host: missingHost.url,
    role: CODEX,
    category: "provider-not-installed",
    ledger: missing.ledger,
  });
  const constrained = smoke(t, {
    executors: [
      { ...claudeProfile, reasoning: "high" },
      { ...codexProfile, model: "gpt-exact" },
    ],
  });
  const constrainedHost = await startHarnessHost(0, {
    governed: constrained.options,
  });
  t.after(() => constrainedHost.close());
  cases.push(
    {
      host: constrainedHost.url,
      role: CODEX,
      category: "provider-config-invalid",
      ledger: constrained.ledger,
      extra: { executor: { model: "gpt-exact" } },
    },
    {
      host: constrainedHost.url,
      role: PROMOTION,
      category: "provider-config-invalid",
      ledger: constrained.ledger,
      extra: { executor: { reasoning: "high" } },
    },
  );
  for (const item of cases) {
    const grant = await call<{ grant: WorkflowGrant }>(item.host, "grants", {
      continuation: false,
      delegation: ["spawned"],
      maxAllocations: 2,
      roles: [item.role],
      ...(item.extra ?? {}),
    });
    assert.equal(grant.status, 201, JSON.stringify(grant.value));
    const refused = await call<{ error: string; category: string }>(
      item.host,
      "continue",
      { workflowGrant: grant.value.grant.id, mode: "spawned", role: item.role },
    );
    assert.equal(refused.status, 409);
    assert.equal(refused.value.category, item.category, refused.value.error);
    assert.ok(
      !readLedger(item.ledger).some(
        (event) =>
          event.transition === "kernel.allocation" &&
          (event.evidence.grant as RoleGrant).workflowGrant ===
            grant.value.grant.id,
      ),
    );
  }
  for (const f of [bridge, missing, constrained])
    assert.deepEqual(f.launched, []);
});

void test("AC04/EA1: provider discovery never selects or executes a temporary or workspace program", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "provider-locate-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const marker = join(dir, "executed");
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "claude"), `#!/bin/sh\ntouch ${marker}\n`);
  chmodSync(join(bin, "claude"), 0o755);
  assert.equal(locateProvider("claude", bin, []).ok, false);
  assert.equal(locateProvider("claude", `relative:${bin}`, []).ok, false);
  assert.equal(existsSync(marker), false);
  // An installed program outside temporary and workspace roots is located
  // (not executed); the same directory is refused when it is a workspace.
  const node = locateProvider("node", "/usr/bin:/usr/local/bin", []);
  assert.equal(node.ok, true);
  assert.equal(locateProvider("node", "/usr/bin", ["/usr"]).ok, false);
});

void test("AC04/AC13/TR5: production executor configuration admits only registered adapters", () => {
  const good = validateProductionExecutors([claudeProfile, codexProfile]);
  assert.equal(good.length, 2);
  for (const [profile, pattern] of [
    [{ ...claudeProfile, command: ["/tmp/bridge.js"] }, /command/],
    [
      { ...claudeProfile, provider: "claude-bootstrap" },
      /unregistered provider/,
    ],
    [{ ...claudeProfile, program: "/tmp/claude" }, /unsupported field program/],
    [{ ...codexProfile, isolation: ["private-workspace"] }, /isolation/],
    [{ ...claudeProfile, reasoning: "high" }, /cannot enforce a reasoning/],
    [
      { ...claudeProfile, capabilities: ["network"] },
      /no mapping for capability/,
    ],
  ] as const)
    assert.throws(() => validateProductionExecutors([profile]), pattern);
  assert.throws(() => validateProductionExecutors({}), /array/);
});

void test("014e: public execution selects Codex, protected execution selects Sonnet, and neither implicitly selects Opus", () => {
  const configured = validateProductionExecutors(
    JSON.parse(
      readFileSync(resolve("harness.executors.json"), "utf8"),
    ) as unknown,
  );
  assert.deepEqual(
    configured.map(({ id, model, available }) => ({ id, model, available })),
    [
      { id: "codex-sol-medium", model: "gpt-5.6-sol", available: true },
      { id: "claude-sonnet", model: "sonnet", available: true },
      {
        id: "claude-production",
        model: "claude-opus-5-5",
        available: false,
      },
    ],
  );
  const kernel = new ExecutionKernel({
    project: loadProject(resolve("harness.project.json")),
    executors: configured,
  });
  const grant = (protectedRole: boolean, model?: string) =>
    ({
      capabilities: ALL,
      executorConstraints: {
        protected: protectedRole,
        forbiddenExposure: [],
        ...(model ? { model } : {}),
      },
    }) as unknown as RoleGrant;

  assert.equal(kernel.select(grant(true), "spawned")?.id, "claude-sonnet");
  assert.equal(kernel.select(grant(false), "spawned")?.id, "codex-sol-medium");
  assert.equal(
    kernel.select(grant(true, "claude-opus-5-5"), "spawned"),
    undefined,
  );
});

void test("AC04/AC13/TR3/TR5: the production entrypoint refuses a generated bridge without executing it", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "entrypoint-bridge-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const marker = join(dir, "bridge-ran");
  const script = join(dir, "bridge.sh");
  writeFileSync(script, `#!/bin/sh\ntouch ${marker}\n`);
  chmodSync(script, 0o755);
  const config = join(dir, "executors.json");
  writeFileSync(
    config,
    JSON.stringify([{ ...claudeProfile, command: [script] }]),
  );
  // A disposable project: a host started against the live repository would
  // recover (interrupt) its genuinely running executions.
  const project = smoke(t);
  const child = spawn(process.execPath, ["src/index.ts"], {
    cwd: repository,
    env: {
      PATH: process.env.PATH ?? "",
      PORT: "0",
      HARNESS_ROOT_TOKEN: rootToken,
      HARNESS_PROJECT_CONFIG: join(project.root, "project.json"),
      HARNESS_EXECUTOR_CONFIG: config,
      HARNESS_PRIVATE_DATA_ROOT: join(dir, "private"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk: string) => (stderr += chunk));
  const [code] = (await once(child, "exit")) as [number | null];
  assert.notEqual(code, 0);
  assert.match(stderr, /refused to start/);
  assert.match(stderr, /command/);
  assert.doesNotMatch(stderr, /TypeError|ReferenceError/);
  assert.equal(existsSync(marker), false);
});

void test("AC14/TR3: the production entrypoint listens with registered adapters and keeps legacy /workflow-runs retired", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "entrypoint-legacy-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const config = join(dir, "executors.json");
  writeFileSync(config, JSON.stringify([claudeProfile, codexProfile]));
  const project = smoke(t);
  const child = spawn(process.execPath, ["src/index.ts"], {
    cwd: repository,
    env: {
      PATH: "/usr/bin:/bin",
      PORT: "0",
      HARNESS_ROOT_TOKEN: rootToken,
      HARNESS_PROJECT_CONFIG: join(project.root, "project.json"),
      HARNESS_EXECUTOR_CONFIG: config,
      HARNESS_PRIVATE_DATA_ROOT: join(dir, "private"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill("SIGTERM"));
  let stdout = "";
  child.stdout.setEncoding("utf8");
  const url = await new Promise<string>((resolveUrl, reject) => {
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      const match = /listening at (http:\/\/127\.0\.0\.1:\d+)/.exec(stdout);
      if (match?.[1]) resolveUrl(match[1]);
    });
    child.once("exit", () => {
      reject(new Error("host exited"));
    });
  });
  const legacy = await fetch(`${url}/workflow-runs`, {
    method: "POST",
    headers: auth,
    body: "{}",
  });
  assert.equal(legacy.status, 410);
});

void test("AC14: 014a canonical history and Harness trust records are unchanged since brief freeze", () => {
  const freeze = "889507128fed99db3e0af9aed7856b4d30b934cd";
  const at = (path: string): Buffer =>
    execFileSync("git", ["show", `${freeze}:${path}`], { cwd: repository });
  const ledger =
    "spikes/014a-kernel-hardening-authority-cutover/workflow.jsonl";
  assert.deepEqual(readFileSync(ledger), at(ledger));
  const trusted = "methodologies/harness/trusted.jsonl";
  assert.ok(
    readFileSync(trusted).subarray(0, at(trusted).length).equals(at(trusted)),
  );
});

void test("AC06: one reviewed capability mapping per provider, failing closed without push or bypass", () => {
  const full = governedClaudePermissions(ALL, WORKER_OPERATIONS);
  assert.deepEqual(full.tools, [
    "Read",
    "Glob",
    "Grep",
    "Edit",
    "Write",
    "Bash",
  ]);
  assert.ok(full.allowedTools.includes("Bash(git commit *)"));
  assert.ok(!full.allowedTools.some((tool) => tool.includes("push")));
  assert.ok(full.disallowedTools.includes("Bash(git push *)"));
  assert.equal(full.permissionMode, "acceptEdits");
  for (const operation of WORKER_OPERATIONS)
    assert.ok(full.allowedTools.includes(`mcp__harness__${operation}`));
  const read = governedClaudePermissions(
    ["repository-read"],
    WORKER_OPERATIONS,
  );
  assert.deepEqual(read.tools, ["Read", "Glob", "Grep"]);
  assert.equal(read.permissionMode, "dontAsk");
  assert.equal(read.commands, false);
  assert.throws(
    () => governedClaudePermissions(["network"], WORKER_OPERATIONS),
    /no reviewed Claude permission mapping/,
  );
  const command = buildGovernedClaudeCommand({
    workspaces: [
      { path: "/work/private", mode: "write" },
      { path: "/work/public", mode: "read" },
    ],
    capabilities: ALL,
    workerOperations: WORKER_OPERATIONS,
    scratch: "/work/scratch",
    mcpConfig: "{}",
    system: "system",
    prompt: "prompt",
  });
  assert.doesNotThrow(() => {
    assertBoundedExecutorCommand(command);
  });
  const disallowed = command[command.indexOf("--disallowedTools") + 1] ?? "";
  assert.match(disallowed, /Edit\(\/\/work\/public\/\*\*\)/);
  assert.equal(command[command.indexOf("--setting-sources") + 1], "");
  assert.throws(() => {
    assertBoundedExecutorCommand([
      ...command,
      "--permission-mode",
      "bypassPermissions",
    ]);
  });
  const codex = ADAPTERS.codex;
  assert.doesNotThrow(() => {
    codex.checkCapabilities(ALL);
  });
  assert.doesNotThrow(() => {
    codex.checkCapabilities([
      "repository-read",
      "local-computation",
      "git-inspect",
    ]);
  });
  assert.throws(() => {
    codex.checkCapabilities(["repository-read"]);
  }, /cannot withhold/);
  assert.throws(() => {
    codex.checkCapabilities([...ALL.filter((c) => c !== "git-commit")]);
  }, /only together/);
  const protectedGrant = {
    capabilities: ALL,
    executorConstraints: { protected: true, forbiddenExposure: [] },
  } as unknown as RoleGrant;
  assert.throws(
    () => planLaunch(codex, protectedGrant, codexProfile),
    /private-workspace read isolation/,
  );
  assert.deepEqual(
    planLaunch(ADAPTERS.claude, protectedGrant, claudeProfile),
    {},
  );
});

void test("AC07: an exact model is requested and must be confirmed by the provider before a result is accepted", async (t) => {
  const exact = "claude-exact-model";
  const confirmed = await run(
    t,
    PROMOTION,
    {
      model: exact,
      steps: [
        {
          tool: "submitResult",
          args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
        },
        { tool: "requestAction", promotion: {} },
      ],
    },
    { executor: { model: exact } },
    [{ ...claudeProfile, model: exact }],
  );
  const good = await settled(
    confirmed.host.url,
    confirmed.started.value.execution?.id ?? "",
  );
  assert.deepEqual(good.executor?.requested, { model: exact });
  assert.equal(good.executor.confirmed.model, exact);
  assert.equal(good.result?.disposition, "succeeded");
  const argv = providerEvidence(confirmed.f.evidence).argv;
  assert.equal(argv[argv.indexOf("--model") + 1], exact);
  const mismatch = await run(
    t,
    PROMOTION,
    {
      model: "some-other-model",
      steps: [
        {
          tool: "submitResult",
          args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
        },
      ],
    },
    { executor: { model: exact } },
    [{ ...claudeProfile, model: exact }],
  );
  const bad = await settled(
    mismatch.host.url,
    mismatch.started.value.execution?.id ?? "",
  );
  assert.equal(bad.process, "failed");
  assert.equal(bad.category, "provider-config-invalid");
  assert.equal(bad.result, null);
  assert.equal(bad.executor?.confirmed.model, "some-other-model");
});

void test("AC08: the versioned worker protocol is typed, provider-neutral and cannot carry binding or credentials", async () => {
  assert.equal(WORKER_PROTOCOL_SCHEMAS.version, 1);
  assert.deepEqual(Object.keys(WORKER_PROTOCOL_SCHEMAS.operations), [
    ...WORKER_OPERATIONS,
  ]);
  assert.throws(
    () =>
      parseWorkerRequest("submitResult", {
        disposition: "succeeded",
        methodology: {},
        token: "x",
      }),
    /unexpected field token/,
  );
  assert.throws(() => parseWorkerRequest("diagnostic", {}), /one of/);
  assert.throws(
    () => parseWorkerRequest("requestAction", { kind: "deploy" }),
    /one of/,
  );
  assert.deepEqual(
    parseWorkerRequest("requestHuman", { kind: "input", question: "q" }),
    { operation: "requestHuman", kind: "input", question: "q" },
  );
  const list = (await handleMessage(
    { port: 1, key: "k" },
    {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    },
  )) as { result: { tools: Array<{ name: string }> } };
  assert.deepEqual(
    list.result.tools.map((tool) => tool.name),
    [...WORKER_OPERATIONS],
  );
  const unknown = (await handleMessage(
    { port: 1, key: "k" },
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "diagnostic", arguments: {} },
    },
  )) as { result: { isError: boolean } };
  assert.equal(unknown.result.isError, true);
  // Both providers receive the identical tool server and operations.
  const input = {
    grant: {
      capabilities: ALL,
      executorConstraints: { protected: false, forbiddenExposure: [] },
    } as unknown as RoleGrant,
    workspaces: [
      { id: "w", path: "/work", mode: "write" as const, exposure: "public" },
    ],
    scratch: "/scratch",
    relay: { port: 40000, key: "relay-key" },
    nodePath: "/usr/bin/node",
    workerToolsPath: "/repo/src/executors/worker-tools.ts",
    system: "system",
    prompt: "prompt",
  };
  const claudeArgs = ADAPTERS.claude.command(input);
  const codexArgs = ADAPTERS.codex.command(input);
  assert.ok(
    claudeArgs.join(" ").includes("/repo/src/executors/worker-tools.ts"),
  );
  assert.ok(
    codexArgs.join(" ").includes("/repo/src/executors/worker-tools.ts"),
  );
  assert.ok(codexArgs.includes("--json"));
  assert.ok(codexArgs.includes("--ignore-user-config"));
  assert.doesNotThrow(() => {
    assertBoundedExecutorCommand(codexArgs);
  });
});

void test("AC05/AC11: live-smoke defects stay fixed: the worker tool server is loadable and callable by both providers", () => {
  const input = {
    grant: {
      capabilities: ALL,
      executorConstraints: { protected: false, forbiddenExposure: [] },
    } as unknown as RoleGrant,
    workspaces: [
      { id: "w", path: "/work", mode: "write" as const, exposure: "public" },
    ],
    scratch: "/scratch",
    relay: { port: 40000, key: "relay-key" },
    nodePath: "/usr/bin/node",
    workerToolsPath: "/repo/src/executors/worker-tools.ts",
    system: "system",
    prompt: "prompt",
  };
  // Claude safe mode disables every MCP server, including --mcp-config.
  const claudeArgs = ADAPTERS.claude.command(input);
  assert.ok(!claudeArgs.includes("--safe-mode"));
  assert.ok(claudeArgs.includes("--strict-mcp-config"));
  // Codex declines unapproved MCP calls under approval_policy="never"; only
  // the Harness server is pre-approved, and no sandbox setting widens.
  const codexArgs = ADAPTERS.codex.command(input);
  const approvals = codexArgs.filter((arg) =>
    arg.includes("default_tools_approval_mode"),
  );
  assert.deepEqual(approvals, [
    'mcp_servers.harness.default_tools_approval_mode="approve"',
  ]);
  assert.ok(codexArgs.includes('approval_policy="never"'));
  assert.ok(!codexArgs.includes("danger-full-access"));
  // The observable reasons are classified with public-safe detail.
  assert.deepEqual(
    ADAPTERS.claude.parse(
      JSON.stringify({ type: "system", subtype: "init", mcp_servers: [] }),
    ),
    [
      { kind: "confirmed", model: null, reasoning: null, version: null },
      {
        kind: "tools-unavailable",
        detail: "Harness worker tool server is not connected (absent)",
      },
    ],
  );
  // A non-enum status is never echoed into public diagnostics.
  assert.deepEqual(
    ADAPTERS.claude
      .parse(
        JSON.stringify({
          type: "system",
          subtype: "init",
          mcp_servers: [{ name: "harness", status: "secret sk-ant-leak" }],
        }),
      )
      .at(-1),
    {
      kind: "tools-unavailable",
      detail: "Harness worker tool server is not connected (unknown)",
    },
  );
  assert.deepEqual(
    ADAPTERS.codex.parse(
      JSON.stringify({
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "harness",
          tool: "submitResult",
          status: "failed",
        },
      }),
    ),
    [
      {
        kind: "permission-denied",
        detail: "provider did not complete Harness tool submitResult",
      },
    ],
  );
});

void test("AC05/AC11: a provider that cannot reach the Harness tools yields no result and a classified diagnostic", async (t) => {
  // The pre-fix live-smoke shapes, replayed through the real host: Codex
  // without pre-approved Harness tools, and Claude with no loaded server.
  const { host, started } = await run(t, CODEX, {
    events: [
      {
        type: "item.completed",
        item: {
          type: "mcp_tool_call",
          server: "harness",
          tool: "submitResult",
          status: "failed",
        },
      },
    ],
  });
  const execution = await settled(host.url, started.value.execution?.id ?? "");
  assert.equal(execution.process, "failed");
  assert.ok(!execution.result);
  assert.deepEqual(
    execution.diagnostics?.map((d) => d.category),
    ["permission-denied", "missing-result"],
  );
  const claude = await run(t, CODEX, { mcpStatus: "pending" }, {}, [
    { ...claudeProfile, id: "claude-for-codex-role" },
  ]);
  const unavailable = await settled(
    claude.host.url,
    claude.started.value.execution?.id ?? "",
  );
  assert.equal(unavailable.category, "assignment-not-delivered");
  assert.equal(
    unavailable.diagnostics?.[0]?.detail,
    "Harness worker tool server is not connected (pending)",
  );
});

void test("AC16/014d EA5: Harness binds trusted N's committed bytes; working-tree policy, contract and skill edits neither satisfy nor defeat it", (t) => {
  const project = loadProject("harness.project.json");
  const bound = trustedDefinition(project, harnessValidators);
  const trusted = assertTrustedMethodology(project, bound);
  const lines = readFileSync("methodologies/harness/trusted.jsonl", "utf8")
    .trim()
    .split("\n");
  assert.equal(
    trusted.record.methodology,
    (JSON.parse(lines.at(-1) ?? "{}") as { methodology: string }).methodology,
  );
  for (const [name, role] of Object.entries(trusted.manifest.roles)) {
    assert.equal(bound.roles[name]?.skill.identity, role.skill.identity);
    assert.equal(bound.roles[name].contractIdentity, role.contract.identity);
  }
  const dir = mkdtempSync(join(tmpdir(), "harness-trust-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const clone = join(dir, "clone");
  execFileSync("git", [
    "clone",
    "-q",
    "--shared",
    "--no-checkout",
    repository,
    clone,
  ]);
  execFileSync(
    "git",
    [
      "checkout",
      "-q",
      trusted.record.revision,
      "--",
      "methodologies",
      "skills",
      "src/methodologies",
    ],
    { cwd: clone },
  );
  mkdirSync(join(clone, "spikes"));
  cpSync("harness.project.json", join(clone, "harness.project.json"));
  cpSync(
    "methodologies/harness/trusted.jsonl",
    join(clone, "methodologies/harness/trusted.jsonl"),
  );
  const cloned = (): ReturnType<typeof loadProject> => {
    const value = loadProject(join(clone, "harness.project.json"));
    value.workflows = {};
    return value;
  };
  const resolved = () => trustedDefinition(cloned(), harnessValidators);
  // The component gate still denies any definition that is not N.
  const workingTree = () =>
    assertTrustedMethodology(
      cloned(),
      loadDefinition(cloned(), harnessValidators),
    );
  assert.equal(resolved().id, bound.id);
  for (const [path, pattern] of [
    ["methodologies/harness/policy.json", /active policy differs/],
    [
      "methodologies/harness/contracts/implementation.json",
      /role contract implementation differs/,
    ],
    ["skills/implementation/SKILL.md", /role skill implementation differs/],
  ] as const) {
    const file = join(clone, path);
    const original = readFileSync(file, "utf8");
    writeFileSync(
      file,
      path.endsWith(".json")
        ? JSON.stringify({ ...(JSON.parse(original) as object), edited: true })
        : `${original}\n// untrusted edit\n`,
    );
    assert.throws(workingTree, pattern, path);
    // New grants still resolve N's exact committed definition.
    assert.equal(resolved().id, bound.id, path);
    writeFileSync(file, original);
  }
  // The running validator implementation must still be N's.
  const validator = join(clone, "src/methodologies/harness-public.ts");
  const source = readFileSync(validator, "utf8");
  writeFileSync(validator, `${source}\n// untrusted edit\n`);
  assert.throws(resolved, /validator source .* differs/);
  writeFileSync(validator, source);
  assert.equal(resolved().id, bound.id);
  rmSync(join(clone, "methodologies/harness/trusted.jsonl"));
  assert.throws(
    resolved,
    /trust equivalence denied: project harness has no trusted/,
  );
});

void test("AC16/014d EA5: the synthetic fixture grants through its own trust root; uncommitted and committed candidate edits still bind trusted bytes", async (t) => {
  const f = smoke(t);
  const host = await startHarnessHost(0, { governed: f.options });
  t.after(() => host.close());
  const body = {
    continuation: false,
    delegation: ["spawned"],
    maxAllocations: 1,
    roles: [CODEX],
  };
  assert.equal((await call(host.url, "grants", body)).status, 201);
  const skill = join(f.root, "methodology/skills/smoke-codex.md");
  const trustedBytes = readFileSync(skill, "utf8");
  const boundSkills = (): string[] =>
    readLedger(f.ledger)
      .filter((event) => event.transition === "kernel.definition")
      .map(
        (event) =>
          (
            event.evidence as {
              roles: Record<string, { skill: { identity: string } }>;
            }
          ).roles[CODEX]?.skill.identity ?? "",
      );
  writeFileSync(skill, `${trustedBytes}\nUntrusted edit.\n`);
  assert.equal((await call(host.url, "grants", body)).status, 201);
  execFileSync("git", ["commit", "-qam", "candidate edit"], {
    cwd: f.root,
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@example.invalid",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@example.invalid",
    },
  });
  assert.equal((await call(host.url, "grants", body)).status, 201);
  const grants = readLedger(f.ledger).filter(
    (event) => event.transition === "kernel.workflow-grant",
  );
  assert.equal(grants.length, 3);
  // One definition, recorded once, carrying the trusted skill bytes only.
  assert.deepEqual(boundSkills(), [identity(trustedBytes)]);
  assert.equal(
    new Set(grants.map((event) => event.evidence.methodology)).size,
    1,
  );
  assert.match(f.trusted.methodology, /^sha256:[a-f0-9]{64}$/);
});
