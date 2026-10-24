// Evaluator-owned fixture helpers. They drive only the public kernel/host
// interfaces already named by the frozen contract; no ledger is edited.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { TestContext } from "node:test";

export const root = resolve(process.env.HARNESS_EVAL_ROOT ?? process.cwd());
const load = async (path: string): Promise<any> =>
  import(pathToFileURL(resolve(root, path)).href);
export const { startHarnessHost } = await load("src/index.ts");
export const { ExecutionKernel } = await load("src/kernel/execution.ts");
export const { authorityBasis } = await load("src/kernel/resolver.ts");
export const { trustFixtureMethodology } = await load(
  "test/support/trusted-fixture.ts",
);
export const rootToken = "eval-human-root-credential-014f-0000000";
export const auth = {
  authorization: `Bearer ${rootToken}`,
  "content-type": "application/json",
};
const worker = resolve(root, "tools/fixtures/governed-executor.ts");
export const profiles = [
  {
    id: "fixture",
    provider: "repository-fixture",
    modes: ["attached", "spawned"],
    capabilities: ["repository-read", "repository-write", "local-computation"],
    isolation: ["private-workspace"],
    available: true,
    command: [process.execPath, worker],
  },
];
function json(path: string, value: unknown): void {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
export function fixture(t: TestContext, name: string) {
  const parent = process.env.HARNESS_PROOF_ROOT ?? tmpdir();
  mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(join(parent, `retire-${name}-`));
  const proj = join(dir, "project");
  const workflow = "work-item";
  const other = "other-item";
  for (const w of [workflow, other]) {
    mkdirSync(join(proj, "items", w), { recursive: true });
    writeFileSync(join(proj, "items", w, "input.txt"), "one\n");
  }
  mkdirSync(join(dir, "private-proof-fixture"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const contract = {
    schemaVersion: 1,
    workspaces: ["repository"],
    capabilities: ["repository-read", "repository-write"],
    forbiddenExposure: [],
    protected: false,
    inputs: [{ name: "input", path: "input.txt" }],
    results: ["succeeded", "failed", "blocked"],
    methodology: { verification: ["PASS", "FAIL"] },
    human: ["input", "approval", "root"],
    postconditions: [],
  };
  const policy = {
    schemaVersion: 1,
    roles: {
      produce: {
        contract: "contracts/produce.json",
        skill: "skills/produce.md",
        when: { not: { event: "produced" } },
        retry: { dispositions: ["failed", "blocked", "interrupted"], limit: 2 },
        outcomes: [{ disposition: "succeeded", transition: "produced" }],
      },
    },
    gates: [],
    maxAllocations: 8,
  };
  json(join(proj, "policy.json"), policy);
  json(join(proj, "contracts/produce.json"), contract);
  mkdirSync(join(proj, "skills"));
  writeFileSync(join(proj, "skills/produce.md"), "Produce the artifact.\n");
  const project = {
    schemaVersion: 1,
    id: `project-${name}`,
    root: proj,
    policy: "policy.json",
    workflows: {
      [workflow]: { directory: `items/${workflow}`, ledger: "authority.jsonl" },
      [other]: { directory: `items/${other}`, ledger: "authority.jsonl" },
    },
    workspaces: {
      repository: { id: "repo", path: proj, mode: "write", exposure: "public" },
      evaluation: {
        id: "isolated-fixture",
        path: join(dir, "private-proof-fixture"),
        mode: "read",
        exposure: "evaluator-private",
      },
    },
    remotes: { publication: join(dir, "remote.git") },
    trustedHistory: "trusted.jsonl",
  };
  const trust = () =>
    trustFixtureMethodology(proj, {
      policy: "policy.json",
      methodologyPaths: ["contracts", "skills"],
    });
  const kernel = new ExecutionKernel({ project, executors: profiles });
  const fresh = () => new ExecutionKernel({ project, executors: profiles });
  const authorize = (wf = workflow, extra: object = {}) =>
    kernel.authorize(wf, {
      continuation: true,
      delegation: ["attached", "spawned"],
      maxAllocations: 8,
      inline: true,
      ...extra,
    });
  const bytes = (wf = workflow) => readFileSync(kernel.path(wf), "utf8");
  const lines = (wf = workflow) => bytes(wf).split("\n").filter(Boolean);
  const session = () => kernel.register(workflow, "fixture").session;
  const start = (grant: { id: string }, extra: object = {}) =>
    kernel.allocate(workflow, grant.id, {
      mode: "attached",
      session: session().id,
      role: "produce",
      ...extra,
    });
  /** Allocate, run and finish an execution as a retry-eligible blocked result. */
  const terminal = (grant: { id: string }, extra: object = {}) => {
    const a = start(grant, extra);
    kernel.process(workflow, a.execution.id, "running", 4242);
    kernel.result(workflow, a.execution.id, "blocked", {});
    kernel.process(workflow, a.execution.id, "exited");
    return a;
  };
  return {
    dir,
    proj,
    workflow,
    other,
    project,
    kernel,
    fresh,
    authorize,
    trust,
    bytes,
    lines,
    session,
    start,
    terminal,
  };
}
export type Fixture = ReturnType<typeof fixture>;
export const retire = (f: Fixture, grant: string, reason = "retire stranded") =>
  f.kernel.retireWorkflowGrant(f.workflow, { workflowGrant: grant, reason });
export const retiredEvents = (f: Fixture, wf = f.workflow) =>
  f.kernel
    .events(wf)
    .filter((e: any) => e.transition === "kernel.workflow-grant-retired");
/** Assert an operation is refused and leaves the ledger byte-identical. */
export function refused(
  f: Fixture,
  op: () => unknown,
  pattern: RegExp,
  wf = f.workflow,
): void {
  const before = f.bytes(wf);
  assert.throws(op, pattern);
  assert.equal(f.bytes(wf), before, "a refusal must append nothing");
}
export async function api(
  url: string,
  path: string,
  body?: object,
  headers: Record<string, string> = auth,
  wf = "work-item",
): Promise<{ status: number; text: string; json: any }> {
  const response = await fetch(`${url}/governed/${wf}/${path}`, {
    headers,
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  return { status: response.status, text, json: parsed };
}
export const git = (cwd: string, args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
