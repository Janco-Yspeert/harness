// Spike 014c real-provider governed smoke test (Design Map §7). OPT-IN ONLY:
// run with `npm run smoke:governed`. It is excluded from `npm test` and
// `npm run check`, makes real Claude and Codex calls, and never retries.
//
// It uses the production governed host, the production executor
// validation, the registered claude/codex adapters and real provider
// discovery. There is no command profile, mock provider, provider runtime
// seam or alternate pipeline. The committed fixture must already carry its
// human-approved trust root (fixtures/governed-smoke/methodology/trusted.jsonl);
// without it the production trust gate denies the grant and the run stops.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  locateProvider,
  validateProductionExecutors,
} from "../../src/executors/adapters.ts";
import { startHarnessHost } from "../../src/index.ts";
import { loadProject } from "../../src/kernel/configuration.ts";
import { identity, readLedger } from "../../src/kernel/ledger.ts";
import type {
  Execution,
  RoleGrant,
  WorkflowGrant,
} from "../../src/kernel/model.ts";

const fixture = resolve("fixtures/governed-smoke");
const output = resolve(
  process.env.HARNESS_SMOKE_OUTPUT ?? join(tmpdir(), "harness-governed-smoke"),
);
const MAX_TURNS = 8;
const selectedRoles = (
  process.env.HARNESS_SMOKE_ROLES ?? "smoke-codex,smoke-claude-promotion"
).split(",");
const repositoryMode = process.env.HARNESS_SMOKE_REPOSITORY_MODE ?? "write";
assert.ok(
  repositoryMode === "read" || repositoryMode === "write",
  "HARNESS_SMOKE_REPOSITORY_MODE must be read or write",
);

function executables(root: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) found.push(...executables(path));
    else if (entry.isFile() && (statSync(path).mode & 0o111) !== 0)
      found.push(path);
  }
  return found;
}

void test("014c live smoke: real Codex and Claude through the production governed host", async (t) => {
  const trustRoot = join(fixture, "methodology", "trusted.jsonl");
  assert.ok(
    existsSync(trustRoot),
    "fixture trust root is absent: a human must approve the fixture first",
  );
  const rootToken = randomBytes(32).toString("hex");
  const dir = mkdtempSync(join(tmpdir(), "harness-live-smoke-"));
  const workflowDir = join(dir, "workflow");
  const privateDir = join(dir, "private");
  cpSync(join(fixture, "data"), workflowDir, { recursive: true });
  cpSync(join(fixture, "private"), privateDir, { recursive: true });
  const project = loadProject(join(fixture, "project.json"));
  project.workflows["smoke-001"] = {
    directory: workflowDir,
    ledger: "workflow.jsonl",
    workspaces: {
      repository: {
        id: "smoke-repository",
        path: workflowDir,
        mode: repositoryMode,
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
  const executors = validateProductionExecutors([
    {
      id: "claude",
      provider: "claude",
      model: process.env.HARNESS_SMOKE_CLAUDE_MODEL ?? "sonnet",
      modes: ["spawned"],
      capabilities: ["repository-read", "local-computation", "git-inspect"],
      isolation: ["private-workspace"],
      available: true,
      maxTurns: MAX_TURNS,
    },
    {
      id: "codex",
      provider: "codex",
      model: process.env.HARNESS_SMOKE_CODEX_MODEL ?? "gpt-5.6-sol",
      reasoning: process.env.HARNESS_SMOKE_CODEX_REASONING ?? "medium",
      modes: ["spawned"],
      capabilities: ["repository-read", "local-computation", "git-inspect"],
      isolation: [],
      available: true,
      maxTurns: MAX_TURNS,
    },
  ]);
  const host = await startHarnessHost(0, {
    governed: {
      rootToken,
      project,
      executors,
      validators: {},
      privateDataRoot: join(dir, "host-private"),
      selectExecutor: (grant: RoleGrant, profiles) =>
        profiles.find(
          (profile) =>
            profile.provider ===
            (grant.role === "smoke-codex" ? "codex" : "claude"),
        ),
    },
  });
  t.after(() => host.close());
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- typed test view of a JSON response.
  const call = async <T>(path: string, body?: object) => {
    const response = await fetch(`${host.url}/governed/smoke-001/${path}`, {
      headers: {
        authorization: `Bearer ${rootToken}`,
        "content-type": "application/json",
      },
      ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, value: (await response.json()) as T };
  };
  const located = Object.fromEntries(
    ["claude", "codex"].map((program) => [
      program,
      locateProvider(program, process.env.PATH, [fixture, dir]),
    ]),
  );
  const versions = Object.fromEntries(
    Object.entries(located).map(([program, result]) => [
      program,
      result.ok
        ? execFileSync(result.path, ["--version"], { encoding: "utf8" }).trim()
        : null,
    ]),
  );
  const runs: Record<string, Execution> = {};
  for (const role of selectedRoles) {
    const grant = await call<{ grant: WorkflowGrant; error?: string }>(
      "grants",
      {
        continuation: false,
        delegation: ["spawned"],
        maxAllocations: 1,
        roles: [role],
      },
    );
    assert.equal(grant.status, 201, JSON.stringify(grant.value));
    const started = await call<{ execution: Execution; error?: string }>(
      "continue",
      { workflowGrant: grant.value.grant.id, mode: "spawned", role },
    );
    assert.equal(started.status, 201, JSON.stringify(started.value));
    const deadline = Date.now() + 600_000;
    let execution = started.value.execution;
    while (
      ["allocated", "running"].includes(execution.process) &&
      Date.now() < deadline
    ) {
      await delay(1000);
      execution = (
        await call<{ execution: Execution }>(`executions/${execution.id}`)
      ).value.execution;
    }
    runs[role] = execution;
  }
  const ledgerPath = join(workflowDir, "workflow.jsonl");
  const ledger = readFileSync(ledgerPath);
  const promoted = join(workflowDir, "promoted", "promotion-bytes.txt");
  mkdirSync(output, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const ledgerCopy = join(output, `smoke-${stamp}-workflow.jsonl`);
  writeFileSync(ledgerCopy, ledger);
  const record = {
    schemaVersion: 1,
    at: new Date().toISOString(),
    fixture: "fixtures/governed-smoke",
    trustRoot: JSON.parse(
      readFileSync(trustRoot, "utf8").trim().split("\n").at(-1) ?? "null",
    ) as unknown,
    providers: Object.fromEntries(
      Object.entries(located).map(([program, result]) => [
        program,
        {
          located: result.ok ? result.path : result.reason,
          version: versions[program],
        },
      ]),
    ),
    executions: Object.fromEntries(
      Object.entries(runs).map(([role, execution]) => [
        role,
        {
          process: execution.process,
          category: execution.category ?? null,
          failure: execution.failure,
          diagnostics: execution.diagnostics ?? [],
          executor: execution.executor,
          filesystemIsolation: execution.filesystemIsolation ?? null,
          workspaces: execution.workspaces ?? [],
          syntheticHome: execution.syntheticHome ?? false,
          result: execution.result,
          actions: execution.actions.map((action) => ({
            kind: action.request.kind,
            status: action.status,
            reason: action.reason,
          })),
          transition: execution.transition ?? null,
        },
      ]),
    ),
    events: readLedger(ledgerPath).map((event) => event.transition),
    promotedBytes: existsSync(promoted)
      ? identity(readFileSync(promoted))
      : null,
    ledger: { file: ledgerCopy, identity: identity(ledger) },
    generatedExecutables: [
      ...executables(workflowDir),
      ...executables(privateDir),
    ],
  };
  writeFileSync(
    join(output, `smoke-${stamp}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
  );
  process.stdout.write(
    `smoke evidence: ${join(output, `smoke-${stamp}.json`)}\n`,
  );
  assert.deepEqual(record.generatedExecutables, []);
  for (const provider of selectedRoles.map((role) =>
    role === "smoke-codex" ? "codex" : "claude",
  ))
    assert.ok(located[provider]?.ok, `${provider} is not installed`);
  if (selectedRoles.includes("smoke-codex"))
    assert.equal(runs["smoke-codex"]?.result?.disposition, "succeeded");
  if (selectedRoles.includes("smoke-claude-promotion")) {
    assert.equal(
      runs["smoke-claude-promotion"]?.result?.disposition,
      "succeeded",
    );
    if (repositoryMode === "write") {
      assert.equal(
        runs["smoke-claude-promotion"].actions[0]?.status,
        "succeeded",
      );
      assert.ok(record.events.includes("smoke-promotion-recorded"));
      assert.equal(
        record.promotedBytes,
        identity(readFileSync(join(fixture, "private", "promotion-bytes.txt"))),
      );
    } else {
      assert.equal(runs["smoke-claude-promotion"].actions[0]?.status, "denied");
      assert.equal(record.promotedBytes, null);
    }
  }
});
