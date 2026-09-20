import assert from "node:assert/strict";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { startHarnessHost } from "../src/index.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";
import { ExecutionKernel } from "../src/kernel/execution.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import {
  appendLedger,
  contentId,
  identity,
  required,
} from "../src/kernel/ledger.ts";
import type {
  Execution,
  ExecutorProfile,
  Project,
  RoleContract,
  RoleGrant,
  Session,
  Telemetry,
  WorkflowGrant,
  WorkflowPolicy,
} from "../src/kernel/model.ts";

const worker = resolve("tools/fixtures/governed-executor.ts");
const rootToken = "test-human-root-credential-014-000000000";
const auth = {
  authorization: `Bearer ${rootToken}`,
  "content-type": "application/json",
};
const profiles: ExecutorProfile[] = [
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
function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Kernel proof",
      GIT_AUTHOR_EMAIL: "proof@example.invalid",
      GIT_COMMITTER_NAME: "Kernel proof",
      GIT_COMMITTER_EMAIL: "proof@example.invalid",
    },
  }).trim();
}
function fixture(t: TestContext, name = "unit") {
  const parent = process.env.HARNESS_PROOF_ROOT ?? tmpdir();
  mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(join(parent, `kernel-${name}-`));
  const root = join(dir, "project");
  const workflow = "work-item";
  mkdirSync(join(root, "items", workflow), { recursive: true });
  mkdirSync(join(dir, "private-proof-fixture"));
  if (!process.env.HARNESS_PROOF_ROOT)
    t.after(() => {
      rmSync(dir, { recursive: true, force: true });
    });
  const contract: RoleContract = {
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
  const policy: WorkflowPolicy = {
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
  json(join(root, "policy.json"), policy);
  json(join(root, "contracts/produce.json"), contract);
  mkdirSync(join(root, "skills"));
  writeFileSync(
    join(root, "skills/produce.md"),
    "Produce the configured public artifact.\n",
  );
  writeFileSync(join(root, "items", workflow, "input.txt"), "one\n");
  const project: Project = {
    schemaVersion: 1,
    id: `project-${name}`,
    root,
    policy: "policy.json",
    workflows: {
      [workflow]: { directory: `items/${workflow}`, ledger: "authority.jsonl" },
    },
    workspaces: {
      repository: { id: "repo", path: root, mode: "write", exposure: "public" },
      evaluation: {
        id: "isolated-fixture",
        path: join(dir, "private-proof-fixture"),
        mode: "read",
        exposure: "evaluator-private",
      },
    },
    remotes: { publication: join(dir, "remote.git") },
  };
  const kernel = new ExecutionKernel({ project, executors: profiles });
  const authorize = () =>
    kernel.authorize(workflow, {
      continuation: true,
      delegation: ["attached", "spawned"],
      maxAllocations: 8,
    });
  const event = (transition: string, evidence: object = {}) =>
    appendLedger(kernel.path(workflow), transition, evidence);
  return {
    dir,
    root,
    workflow,
    project,
    kernel,
    contract,
    policy,
    authorize,
    event,
  };
}
function allocate(
  f: ReturnType<typeof fixture>,
  grant: WorkflowGrant,
  role = "produce",
  session?: Session,
) {
  const current = session ?? f.kernel.register(f.workflow, "fixture").session;
  return f.kernel.allocate(f.workflow, grant.id, {
    mode: "attached",
    session: current.id,
    role,
  });
}
async function api<T>(
  url: string,
  path: string,
  body?: object,
  headers = auth,
): Promise<T> {
  const response = await fetch(`${url}/governed/work-item/${path}`, {
    headers,
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  const value = await response.text();
  assert.ok(response.ok, `${String(response.status)}: ${value}`);
  return JSON.parse(value) as T;
}
async function until<T>(
  read: () => Promise<T>,
  ready: (value: T) => boolean,
): Promise<T> {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const value = await read();
    if (ready(value)) return value;
    await delay(25);
  }
  throw new Error("timed out awaiting externally observable condition");
}
async function external(
  url: string,
  session: Session,
  token: string,
  wait = false,
): Promise<ChildProcess> {
  const child = spawn(process.execPath, [worker, ...(wait ? ["--wait"] : [])], {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      PATH: process.env.PATH ?? "",
      HARNESS_URL: url,
      HARNESS_WORKFLOW: "work-item",
      HARNESS_SESSION: session.id,
      HARNESS_SESSION_TOKEN: token,
    },
  });
  await once(child, "spawn");
  return child;
}

void test("TR1: configured Harness As-Built resolves from canonical PASS/promotion despite blocked publication and absent/stale local history", (t) => {
  const f = fixture(t, "canonical");
  cpSync("methodologies", join(f.root, "methodologies"), { recursive: true });
  for (const name of [
    "brief-readiness",
    "design-map",
    "evaluator",
    "implementation",
    "as-built",
    "outcome",
  ]) {
    mkdirSync(join(f.root, "skills", name));
    cpSync(`skills/${name}/SKILL.md`, join(f.root, "skills", name, "SKILL.md"));
  }
  f.project.policy = "methodologies/harness/policy.json";
  f.event("brief-frozen");
  f.event("design-map-frozen");
  f.event("evaluation-prepared");
  f.event("implementation-handoff", { commit: "a".repeat(40), attempt: 1 });
  f.event("verification-finalized", { result: "PASS" });
  f.event("promotion-recorded");
  const local = join(f.root, "items", f.workflow, ".workflow");
  mkdirSync(local);
  json(join(local, "state.json"), {
    records: [
      {
        phase: "evaluator-verify",
        outcome: "blocked",
        reason: "publication transport failure",
      },
    ],
  });
  const k = new ExecutionKernel({
    project: f.project,
    executors: profiles,
    validators: harnessValidators,
  });
  const grant = k.authorize(f.workflow, {
    continuation: true,
    delegation: ["attached"],
    maxAllocations: 8,
  });
  const before = readFileSync(k.path(f.workflow), "utf8");
  const original = k.inspect(f.workflow, grant.id);
  assert.equal(original.kind, "grant");
  assert.equal(original.grant.role, "as-built");
  rmSync(local, { recursive: true });
  const fresh = new ExecutionKernel({
    project: f.project,
    executors: profiles,
    validators: harnessValidators,
  });
  assert.deepEqual(fresh.inspect(f.workflow, grant.id), original);
  mkdirSync(local);
  json(join(local, "state.json"), {
    records: [{ phase: "outcome", outcome: "complete" }],
  });
  assert.deepEqual(fresh.inspect(f.workflow, grant.id), original);
  assert.equal(
    readFileSync(k.path(f.workflow), "utf8"),
    before,
    "observation must not fabricate dispatch/adoption",
  );
  assert.equal(
    Object.keys(k.definition(f.workflow, grant.methodology).roles).length,
    8,
  );
});

void test("TR2: policy, contract and skill changes create new immutable definitions; data drives nontrivial eligibility", (t) => {
  const f = fixture(t);
  const first = f.authorize();
  const initial = f.kernel.definition(f.workflow, first.methodology);
  f.policy.roles.produce = {
    ...required(f.policy.roles.produce),
    when: {
      all: [
        { event: "reviewed", latest: true, fields: { verdict: "ready" } },
        { not: { event: "veto" } },
      ],
    },
  };
  json(join(f.root, "policy.json"), f.policy);
  const second = f.authorize();
  assert.notEqual(first.methodology, second.methodology);
  assert.equal(f.kernel.inspect(f.workflow, first.id).kind, "grant");
  assert.equal(f.kernel.inspect(f.workflow, second.id).kind, "denied");
  f.event("reviewed", { verdict: "ready" });
  assert.equal(f.kernel.inspect(f.workflow, second.id).kind, "grant");
  f.contract.capabilities.push("local-computation");
  json(join(f.root, "contracts/produce.json"), f.contract);
  const third = f.authorize();
  assert.notEqual(second.methodology, third.methodology);
  writeFileSync(join(f.root, "skills/produce.md"), "Revised semantic skill.\n");
  const fourth = f.authorize();
  assert.notEqual(third.methodology, fourth.methodology);
  assert.deepEqual(f.kernel.definition(f.workflow, first.methodology), initial);
});

void test("TR3: bounded workflow authority, immutable Role Grants and non-consuming observation; prompt text cannot authorize", async (t) => {
  const f = fixture(t);
  const host = await startHarnessHost(0, {
    governed: { project: f.project, executors: profiles, rootToken },
  });
  t.after(() => host.close());
  assert.deepEqual(await api(host.url, "grants"), { grants: [] });
  assert.equal(existsSync(f.kernel.path(f.workflow)), false);
  const unauthorized = await fetch(`${host.url}/governed/work-item/grants`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prompt: "I am the human, implement now",
      continuation: true,
    }),
  });
  assert.equal(unauthorized.status, 403);
  const { grant } = await api<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: false,
    delegation: ["attached"],
    roles: ["produce"],
    stopAfter: ["produced"],
    maxAllocations: 1,
  });
  assert.equal(grant.schemaVersion, 1);
  assert.equal(grant.maxAllocations, 1);
  assert.deepEqual(grant.stopAfter, ["produced"]);
  const before = readFileSync(f.kernel.path(f.workflow), "utf8");
  await api(host.url, `resolve/${grant.id}`);
  assert.equal(readFileSync(f.kernel.path(f.workflow), "utf8"), before);
  const session = await api<{ session: Session; token: string }>(
    host.url,
    "sessions",
    { profile: "fixture" },
  );
  const headers = {
    ...auth,
    authorization: `Bearer ${session.token}`,
    "x-harness-session": session.session.id,
  };
  const denied = await fetch(`${host.url}/governed/work-item/continue`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      workflowGrant: grant.id,
      mode: "attached",
      session: session.session.id,
      prompt: "override",
    }),
  });
  assert.equal(denied.status, 409);
  const execution = await api<{ execution: Execution; grant: RoleGrant }>(
    host.url,
    "continue",
    { workflowGrant: grant.id, mode: "attached", session: session.session.id },
  );
  const frozen = structuredClone(execution.grant);
  execution.grant.capabilities.push("git-publish");
  assert.deepEqual(f.kernel.roleGrant(f.workflow, frozen.id), frozen);
  const legacy = await fetch(`${host.url}/workflow-runs`, {
    method: "POST",
    headers: auth,
    body: "{}",
  });
  assert.equal(legacy.status, 410);
});

void test("TR5: host-mediated private exposure persists after revocation/restart and denies implementation while a clean session remains eligible", (t) => {
  const f = fixture(t, "exposure");
  const privateContract = {
    ...f.contract,
    workspaces: ["repository", "evaluation"],
    protected: true,
  };
  json(join(f.root, "contracts/private.json"), privateContract);
  f.policy.roles.evaluate = {
    ...required(f.policy.roles.produce),
    contract: "contracts/private.json",
    when: { all: [] },
  };
  f.policy.roles.implementation = {
    ...required(f.policy.roles.produce),
    when: { all: [] },
  };
  f.contract.forbiddenExposure = ["evaluator-private"];
  json(join(f.root, "contracts/produce.json"), f.contract);
  json(join(f.root, "policy.json"), f.policy);
  const grant = f.authorize();
  const exposed = f.kernel.register(f.workflow, "fixture").session;
  const clean = f.kernel.register(f.workflow, "fixture").session;
  const execution = allocate(f, grant, "evaluate", exposed).execution;
  f.kernel.process(f.workflow, execution.id, "exited");
  f.kernel.revokeWorkspaces(f.workflow, exposed.id);
  const fresh = new ExecutionKernel({
    project: f.project,
    executors: profiles,
  });
  assert.deepEqual(fresh.session(exposed.id).workspaces, []);
  assert.deepEqual(fresh.session(exposed.id).exposures, ["evaluator-private"]);
  assert.equal(
    fresh.inspect(f.workflow, grant.id, "implementation", clean.id).kind,
    "grant",
  );
  assert.deepEqual(
    fresh.inspect(f.workflow, grant.id, "implementation", exposed.id),
    { kind: "denied", reason: "session provenance prohibits role" },
  );
  assert.throws(
    () =>
      fresh.allocate(f.workflow, grant.id, {
        role: "implementation",
        session: exposed.id,
        mode: "attached",
      }),
    /provenance/,
  );
});

void test("TR6/TR11: semantic PASS survives later action failure, dimensions stay separate, telemetry cannot veto execution", (t) => {
  const f = fixture(t, "dimensions");
  const telemetry: Telemetry[] = [];
  const k = new ExecutionKernel({
    project: f.project,
    executors: profiles,
    telemetry: (event) => {
      telemetry.push(event);
      throw new Error("collector unavailable");
    },
  });
  const parent = k.authorize(f.workflow, {
    continuation: true,
    delegation: ["attached"],
    maxAllocations: 3,
  });
  const { session } = k.register(f.workflow, "fixture");
  const { execution } = k.allocate(f.workflow, parent.id, {
    session: session.id,
    mode: "attached",
  });
  k.process(f.workflow, execution.id, "running", 123);
  k.result(f.workflow, execution.id, "succeeded", { verification: "PASS" });
  k.process(f.workflow, execution.id, "exited");
  const success = k.execution(f.workflow, execution.id).result;
  k.publish(
    f.workflow,
    execution.id,
    "repository",
    "a".repeat(40),
    "refs/heads/proof",
  );
  const record = k.execution(f.workflow, execution.id);
  assert.deepEqual(record.result, success);
  assert.equal(record.process, "exited");
  assert.equal(record.result?.methodology.verification, "PASS");
  assert.equal(record.actions[0]?.status, "denied");
  assert.ok(telemetry.some((e) => e.type === "host-action" && e.action));
  assert.ok(
    telemetry.every(
      (e) =>
        e.execution === execution.id &&
        e.workflowGrant === parent.id &&
        e.roleGrant === execution.roleGrant,
    ),
  );
  assert.throws(
    () => k.result(f.workflow, execution.id, "failed", {}),
    /not permitted/,
  );
});

void test("TR8: bounded generic root authority permits forward recovery without rewriting a blocked result or grant", (t) => {
  const f = fixture(t, "root");
  const parent = f.authorize();
  const prior = allocate(f, parent);
  f.kernel.process(f.workflow, prior.execution.id, "running");
  f.kernel.result(f.workflow, prior.execution.id, "blocked", {});
  f.kernel.process(f.workflow, prior.execution.id, "exited");
  f.event("produced");
  assert.equal(f.kernel.inspect(f.workflow, parent.id).kind, "denied");
  const prefix = readFileSync(f.kernel.path(f.workflow), "utf8");
  const old = f.kernel.execution(f.workflow, prior.execution.id);
  const root = f.kernel.root(
    f.workflow,
    parent.id,
    "produce",
    "bounded corrective action",
    1,
  );
  assert.equal(root.schemaVersion, 1);
  const session = f.kernel.register(f.workflow, "fixture").session;
  const next = f.kernel.allocate(f.workflow, parent.id, {
    role: "produce",
    session: session.id,
    mode: "attached",
    predecessor: prior.execution.id,
  });
  assert.notEqual(next.execution.id, prior.execution.id);
  assert.equal(next.execution.predecessor, prior.execution.id);
  assert.equal(next.grant.rootAuthority, root.id);
  assert.ok(readFileSync(f.kernel.path(f.workflow), "utf8").startsWith(prefix));
  assert.deepEqual(f.kernel.execution(f.workflow, prior.execution.id), old);
  assert.deepEqual(f.kernel.roleGrant(f.workflow, prior.grant.id), prior.grant);
});

void test("TR10: concurrent continuation deduplicates; changed input and explicit retries keep separate identities and durable lineage", async (t) => {
  const f = fixture(t, "idempotency");
  const host = await startHarnessHost(0, {
    governed: { project: f.project, executors: profiles, rootToken },
  });
  t.after(() => host.close());
  const { grant } = await api<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: true,
    delegation: ["attached"],
    maxAllocations: 8,
  });
  const { session } = await api<{ session: Session }>(host.url, "sessions", {
    profile: "fixture",
  });
  const request = {
    workflowGrant: grant.id,
    session: session.id,
    mode: "attached",
    role: "produce",
  };
  const [one, two] = await Promise.all([
    api<{ execution: Execution }>(host.url, "continue", request),
    api<{ execution: Execution }>(host.url, "continue", request),
  ]);
  assert.equal(one.execution.id, two.execution.id);
  assert.equal(f.kernel.executions(f.workflow).length, 1);
  f.kernel.process(f.workflow, one.execution.id, "running");
  f.kernel.result(f.workflow, one.execution.id, "blocked", {});
  f.kernel.process(f.workflow, one.execution.id, "exited");
  const next = await api<{ execution: Execution }>(host.url, "continue", {
    ...request,
    predecessor: one.execution.id,
  });
  assert.notEqual(next.execution.id, one.execution.id);
  assert.equal(next.execution.predecessor, one.execution.id);
  await host.close();
  const recovered = new ExecutionKernel({
    project: f.project,
    executors: profiles,
  });
  assert.equal(
    recovered.execution(f.workflow, next.execution.id).process,
    "interrupted",
  );
  assert.equal(
    recovered.execution(f.workflow, one.execution.id).result?.disposition,
    "blocked",
  );
  writeFileSync(
    join(f.root, "items/work-item/input.txt"),
    "changed review input\n",
  );
  const revised = recovered.inspect(f.workflow, grant.id, "produce");
  assert.equal(revised.kind, "grant");
  assert.notEqual(
    revised.grant.inputs.input,
    f.kernel.roleGrant(f.workflow, one.execution.roleGrant).inputs.input,
  );
});

void test("TR4/TR7/TR9: real attached process waits/resumes the same execution and host publishes an exact commit to a local bare remote", async (t) => {
  const f = fixture(t, "attached-publication-wait");
  git(f.root, ["init", "-b", "proof"]);
  git(f.root, ["add", "."]);
  git(f.root, ["commit", "-m", "base"]);
  const base = git(f.root, ["rev-parse", "HEAD"]);
  git(f.dir, ["init", "--bare", "remote.git"]);
  git(f.root, [
    "push",
    required(f.project.remotes.publication),
    "HEAD:refs/heads/proof",
  ]);
  writeFileSync(join(f.root, "new.txt"), "candidate\n");
  git(f.root, ["add", "new.txt"]);
  git(f.root, ["commit", "-m", "candidate"]);
  const candidate = git(f.root, ["rev-parse", "HEAD"]);
  f.event("candidate", { commit: candidate, base });
  f.contract.inputs.push(
    { name: "candidate", event: "candidate", field: "commit" },
    { name: "base", event: "candidate", field: "base" },
  );
  f.contract.publication = {
    workspace: "repository",
    remote: "publication",
    ref: "refs/heads/proof",
    commitInput: "candidate",
    baseInput: "base",
  };
  json(join(f.root, "contracts/produce.json"), f.contract);
  const host = await startHarnessHost(0, {
    governed: { project: f.project, executors: profiles, rootToken },
  });
  t.after(() => host.close());
  const registration = await api<{ session: Session; token: string }>(
    host.url,
    "sessions",
    { profile: "fixture" },
  );
  const child = await external(
    host.url,
    registration.session,
    registration.token,
    true,
  );
  t.after(() => {
    child.kill();
  });
  let stderr = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });
  const exited = once(child, "exit");
  const preGrantPid = child.pid;
  assert.ok(preGrantPid);
  assert.equal(f.kernel.executions(f.workflow).length, 0);
  const { grant } = await api<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: false,
    delegation: ["attached"],
    maxAllocations: 1,
  });
  const allocated = await api<{ execution: Execution; grant: RoleGrant }>(
    host.url,
    "continue",
    {
      workflowGrant: grant.id,
      mode: "attached",
      session: registration.session.id,
    },
  );
  const waiting = await until(
    () =>
      api<{ execution: Execution }>(
        host.url,
        `executions/${allocated.execution.id}`,
      ),
    (v) => v.execution.attention === "WAITING_FOR_HUMAN",
  );
  assert.equal(waiting.execution.pid, preGrantPid);
  assert.equal(waiting.execution.process, "running");
  process.kill(preGrantPid, 0);
  const request = required(waiting.execution.requests[0]);
  const executorHeaders = {
    ...auth,
    authorization: `Bearer ${registration.token}`,
    "x-harness-session": registration.session.id,
  };
  const forged = await fetch(
    `${host.url}/governed/work-item/executions/${allocated.execution.id}/respond`,
    {
      method: "POST",
      headers: executorHeaders,
      body: JSON.stringify({ request: request.id, value: "approve myself" }),
    },
  );
  assert.equal(forged.status, 409);
  const mismatch = await fetch(
    `${host.url}/governed/work-item/executions/${allocated.execution.id}/respond`,
    {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ request: "wrong-request", value: "yes" }),
    },
  );
  assert.equal(mismatch.status, 409);
  await api(host.url, `executions/${allocated.execution.id}/respond`, {
    request: request.id,
    value: "yes",
  });
  const [code] = (await exited) as unknown[];
  assert.equal(code, 0, stderr);
  const final = await api<{ execution: Execution; grant: RoleGrant }>(
    host.url,
    `executions/${allocated.execution.id}`,
  );
  assert.equal(final.execution.id, allocated.execution.id);
  assert.equal(final.execution.session, registration.session.id);
  assert.equal(final.execution.result?.disposition, "succeeded");
  assert.equal(final.execution.process, "exited");
  assert.equal(f.kernel.executions(f.workflow).length, 1);
  const action = required(final.execution.actions[0]);
  assert.equal(action.status, "succeeded", action.reason ?? "");
  assert.equal(action.before, base);
  assert.equal(action.after, candidate);
  assert.equal(action.request.commit, candidate);
  assert.equal(action.request.ref, "refs/heads/proof");
  assert.equal(action.directPublication, false);
  assert.equal(
    git(f.dir, ["--git-dir=remote.git", "rev-parse", "refs/heads/proof"]),
    candidate,
  );
  assert.equal(
    git(f.root, ["remote"]),
    "",
    "executor repository has no configured remote",
  );
  assert.ok(
    !final.grant.capabilities.some((c) =>
      ["network", "git-publish"].includes(c),
    ),
  );
  const events = f.kernel.events(f.workflow);
  const rootIndex = events.findIndex(
    (e) => e.transition === "kernel.root" && e.evidence.request === request.id,
  );
  const responseIndex = events.findIndex(
    (e) =>
      e.transition === "kernel.human-response" &&
      e.evidence.request === request.id,
  );
  assert.ok(rootIndex >= 0 && rootIndex < responseIndex);
  assert.deepEqual(events[rootIndex]?.evidence.decision, {
    response: required(final.execution.requests[0]?.response).id,
    value: "yes",
  });
  const proof = {
    schemaVersion: 1,
    processStartedBeforeGrant: preGrantPid,
    registration: {
      session: registration.session.id,
      registeredAt: registration.session.registeredAt,
    },
    workflowGrant: grant,
    waiting: waiting.execution,
    final,
    ledgerIdentity: identity(readFileSync(f.kernel.path(f.workflow))),
    executorEvidenceIdentity: identity(
      readFileSync(join(f.root, "executor-evidence.jsonl")),
    ),
  };
  json(join(f.dir, "proof.json"), proof);
  if (process.env.HARNESS_PROOF_ROOT)
    t.diagnostic(
      `durable real-boundary evidence: ${join(f.dir, "proof.json")}`,
    );
});

void test("TR4/TR10/TR11: real spawned execution survives caller disconnect and continues by configured result policy; explicit schema/selection seams", async (t) => {
  const f = fixture(t, "spawned");
  f.policy.roles.check = {
    ...required(f.policy.roles.produce),
    when: { all: [{ event: "produced" }, { not: { event: "checked" } }] },
    outcomes: [{ disposition: "succeeded", transition: "checked" }],
  };
  json(join(f.root, "policy.json"), f.policy);
  const telemetry: Telemetry[] = [];
  const host = await startHarnessHost(0, {
    governed: {
      project: f.project,
      executors: profiles,
      rootToken,
      telemetry: (e) => {
        telemetry.push(e);
        return Promise.reject(new Error("usage unavailable"));
      },
      selectExecutor: (grant, available) => {
        assert.equal(grant.schemaVersion, 1);
        assert.equal(available[0]?.provider, "repository-fixture");
        return available[0];
      },
    },
  });
  t.after(() => host.close());
  const { grant } = await api<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: true,
    delegation: ["spawned"],
    stopAfter: ["checked"],
    maxAllocations: 2,
  });
  const launched = await api<{ execution: Execution; grant: RoleGrant }>(
    host.url,
    "continue",
    { workflowGrant: grant.id, mode: "spawned" },
  );
  // The allocating HTTP call is over. Every following call is an independent observer.
  const final = await until(
    () => api<{ executions: Execution[] }>(host.url, "executions"),
    (v) =>
      v.executions.length === 2 &&
      v.executions.every((e) => e.process === "exited"),
  );
  assert.ok(
    final.executions.every((e) => e.result?.disposition === "succeeded"),
  );
  assert.notEqual(final.executions[0]?.id, final.executions[1]?.id);
  assert.notEqual(final.executions[0]?.session, final.executions[1]?.session);
  const observed = await api<{ execution: Execution }>(
    host.url,
    `executions/${launched.execution.id}`,
  );
  assert.equal(observed.execution.id, launched.execution.id);
  assert.ok(telemetry.some((e) => e.type === "allocated"));
  assert.ok(telemetry.every((e) => e.workflowGrant === grant.id));
  for (const execution of final.executions) {
    assert.equal(execution.schemaVersion, 1);
    assert.equal(execution.result?.schemaVersion, 1);
    assert.equal(
      f.kernel.roleGrant(f.workflow, execution.roleGrant).schemaVersion,
      1,
    );
  }
  assert.equal(
    f.kernel.definition(f.workflow, grant.methodology).schemaVersion,
    1,
  );
  json(join(f.dir, "proof.json"), {
    schemaVersion: 1,
    workflowGrant: grant,
    launched,
    final,
    ledgerIdentity: contentId(f.kernel.events(f.workflow)),
  });
  if (process.env.HARNESS_PROOF_ROOT)
    t.diagnostic(`durable spawned evidence: ${join(f.dir, "proof.json")}`);
});

void test("TR2/TR3: all eight bundled roles resolve pinned public inputs; damaged evaluator readiness and frozen input drift deny allocation", (t) => {
  const f = fixture(t, "roster");
  cpSync("methodologies", join(f.root, "methodologies"), { recursive: true });
  for (const name of [
    "brief-readiness",
    "design-map",
    "evaluator",
    "implementation",
    "as-built",
    "outcome",
  ]) {
    mkdirSync(join(f.root, "skills", name));
    cpSync(`skills/${name}/SKILL.md`, join(f.root, "skills", name, "SKILL.md"));
  }
  f.project.policy = "methodologies/harness/policy.json";
  const item = join(f.root, "items/work-item");
  writeFileSync(join(item, "spike.md"), "public frozen brief\n");
  writeFileSync(join(item, "design-map.md"), "public frozen design\n");
  writeFileSync(
    join(item, "eval-requirements.md"),
    "public frozen requirements\n",
  );
  const coverage = {
    evaluationRequirements: identity(
      readFileSync(join(item, "eval-requirements.md")),
    ),
    readiness: {
      integrityValidation: "PASS",
      evaluatorRevision: "001",
      privateInventoryIdentity: `sha256:${"1".repeat(64)}`,
      validatorResultBinding: `sha256:${"2".repeat(64)}`,
    },
    criteria: [
      {
        id: "AC1",
        frozenAuthority: "public fixture",
        mode: "PUBLIC_REGRESSION",
        required: true,
        procedures: ["visible-test"],
        sufficiency: "public fixture validates this boundary",
      },
    ],
  };
  json(join(item, "coverage-map.json"), coverage);
  git(f.root, ["init", "-b", "candidate"]);
  git(f.root, ["add", "."]);
  git(f.root, ["commit", "-m", "freeze public inputs"]);
  const commit = git(f.root, ["rev-parse", "HEAD"]);
  for (const [transition, path] of [
    ["brief-frozen", "spike.md"],
    ["design-map-frozen", "design-map.md"],
    ["evaluation-prepared", "coverage-map.json"],
  ])
    f.event(required(transition), {
      path,
      commit,
      identity: identity(readFileSync(join(item, required(path)))),
    });
  f.event("implementation-handoff", { commit, attempt: 1 });
  const k = new ExecutionKernel({
    project: f.project,
    executors: profiles,
    validators: harnessValidators,
  });
  const parent = k.authorize(f.workflow, {
    continuation: true,
    delegation: ["attached"],
    maxAllocations: 20,
  });
  for (const role of Object.keys(
    k.definition(f.workflow, parent.methodology).roles,
  )) {
    k.root(
      f.workflow,
      parent.id,
      role,
      `bounded roster inspection for ${role}`,
    );
    const resolved = k.inspect(f.workflow, parent.id, role);
    assert.equal(resolved.kind, "grant", role);
    assert.equal(resolved.grant.role, role);
    assert.equal(
      resolved.grant.contractIdentity,
      k.definition(f.workflow, parent.methodology).roles[role]
        ?.contractIdentity,
    );
  }
  writeFileSync(
    join(item, "eval-requirements.md"),
    "changed public requirements\n",
  );
  k.root(f.workflow, parent.id, "implementation", "input validation proof");
  const denied = k.inspect(f.workflow, parent.id, "implementation");
  assert.equal(denied.kind, "denied");
  assert.match(denied.reason, /identity binding mismatch/);
  assert.throws(
    () =>
      harnessValidators["prepared-coverage"]?.validate({
        ...coverage,
        readiness: { ...coverage.readiness, integrityValidation: "FAIL" },
      }),
    /passing readiness/,
  );
});

void test("TR8/TR10: duplicate retry survives its bound, one-shot root grants cannot be reused for changed inputs, and restart retains lineage", (t) => {
  const f = fixture(t, "bounded-retry");
  required(f.policy.roles.produce).retry.limit = 1;
  json(join(f.root, "policy.json"), f.policy);
  const parent = f.authorize();
  const session = f.kernel.register(f.workflow, "fixture").session;
  const initial = allocate(f, parent, "produce", session);
  f.kernel.process(f.workflow, initial.execution.id, "running");
  f.kernel.result(f.workflow, initial.execution.id, "blocked", {});
  f.kernel.process(f.workflow, initial.execution.id, "exited");
  const request = {
    role: "produce",
    session: session.id,
    mode: "attached" as const,
    predecessor: initial.execution.id,
  };
  const retry = f.kernel.allocate(f.workflow, parent.id, request);
  assert.equal(
    f.kernel.allocate(f.workflow, parent.id, request).execution.id,
    retry.execution.id,
  );
  f.kernel.recover();
  assert.equal(
    f.kernel.execution(f.workflow, retry.execution.id).process,
    "interrupted",
  );
  assert.throws(
    () =>
      f.kernel.allocate(f.workflow, parent.id, {
        ...request,
        predecessor: retry.execution.id,
      }),
    /retry policy denied/,
  );
  f.event("produced");
  f.kernel.root(f.workflow, parent.id, "produce", "one bounded recovery");
  const recovery = allocate(f, parent, "produce", session);
  f.kernel.process(f.workflow, recovery.execution.id, "exited");
  writeFileSync(
    join(f.root, "items/work-item/input.txt"),
    "different basis input\n",
  );
  assert.equal(f.kernel.inspect(f.workflow, parent.id, "produce").kind, "stop");
});

void test("TR5/TR9: private human payloads are host-owned; another executor cannot inspect or answer them", async (t) => {
  const f = fixture(t, "private-human");
  f.contract.protected = true;
  f.contract.workspaces.push("evaluation");
  json(join(f.root, "contracts/produce.json"), f.contract);
  const privateDataRoot = join(f.dir, "host-human-data");
  const host = await startHarnessHost(0, {
    governed: {
      project: f.project,
      executors: profiles,
      rootToken,
      privateDataRoot,
    },
  });
  t.after(() => host.close());
  const { grant } = await api<{ grant: WorkflowGrant }>(host.url, "grants", {
    continuation: false,
    delegation: ["attached"],
    maxAllocations: 1,
  });
  const worker = await api<{ session: Session; token: string }>(
    host.url,
    "sessions",
    { profile: "fixture" },
  );
  const observer = await api<{ session: Session; token: string }>(
    host.url,
    "sessions",
    { profile: "fixture" },
  );
  const ownerHeaders = {
    ...auth,
    authorization: `Bearer ${worker.token}`,
    "x-harness-session": worker.session.id,
  };
  const observerHeaders = {
    ...auth,
    authorization: `Bearer ${observer.token}`,
    "x-harness-session": observer.session.id,
  };
  const { execution } = await api<{ execution: Execution }>(
    host.url,
    "continue",
    { workflowGrant: grant.id, mode: "attached", session: worker.session.id },
  );
  await api(
    host.url,
    `executions/${execution.id}/started`,
    { pid: 123 },
    ownerHeaders,
  );
  const request = await api<{ id: string }>(
    host.url,
    `executions/${execution.id}/human`,
    {
      kind: "root",
      question: "synthetic confidential review detail",
      permission: "synthetic private permission",
    },
    ownerHeaders,
  );
  const forbidden = await fetch(
    `${host.url}/governed/work-item/executions/${execution.id}`,
    { headers: observerHeaders },
  );
  assert.equal(forbidden.status, 409);
  const human = await api<{ execution: Execution }>(
    host.url,
    `executions/${execution.id}`,
  );
  assert.equal(
    human.execution.requests[0]?.question,
    "synthetic confidential review detail",
  );
  await api(host.url, `executions/${execution.id}/respond`, {
    request: request.id,
    value: "synthetic confidential answer",
  });
  const resumed = await api<{ execution: Execution }>(
    host.url,
    `executions/${execution.id}`,
    undefined,
    ownerHeaders,
  );
  assert.equal(
    resumed.execution.requests[0]?.response?.value,
    "synthetic confidential answer",
  );
  const publicLedger = readFileSync(f.kernel.path(f.workflow), "utf8");
  assert.doesNotMatch(
    publicLedger,
    /synthetic confidential|synthetic private permission/,
  );
  assert.ok(existsSync(join(privateDataRoot, `${request.id}.json`)));
  await api(host.url, `executions/${execution.id}/exited`, {}, ownerHeaders);
});

void test("TR2: configured committed-artifact transitions advance the canonical ledger and preserve semantic success when a postcondition blocks", (t) => {
  const f = fixture(t, "transition");
  required(f.policy.roles.produce).outcomes = [
    {
      disposition: "succeeded",
      transition: "produced",
      evidence: { artifact: "output.md" },
    },
  ];
  json(join(f.root, "policy.json"), f.policy);
  git(f.root, ["init", "-b", "proof"]);
  writeFileSync(
    join(f.root, "items/work-item/output.md"),
    "committed output\n",
  );
  git(f.root, ["add", "."]);
  git(f.root, ["commit", "-m", "output"]);
  const parent = f.authorize();
  const run = allocate(f, parent);
  f.kernel.process(f.workflow, run.execution.id, "running");
  const result = f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    verification: "PASS",
  });
  assert.equal(result.transition?.status, "recorded");
  const fact = required(
    f.kernel.events(f.workflow).find((e) => e.transition === "produced"),
  );
  assert.equal(fact.evidence.path, "output.md");
  assert.equal(
    fact.evidence.identity,
    identity(readFileSync(join(f.root, "items/work-item/output.md"))),
  );
  assert.equal(fact.evidence.commit, git(f.root, ["rev-parse", "HEAD"]));
  f.kernel.process(f.workflow, run.execution.id, "exited");
  f.kernel.root(
    f.workflow,
    parent.id,
    "produce",
    "exercise failing artifact provenance",
  );
  const next = allocate(f, parent);
  f.kernel.process(f.workflow, next.execution.id, "running");
  writeFileSync(
    join(f.root, "items/work-item/output.md"),
    "uncommitted drift\n",
  );
  const blocked = f.kernel.result(
    f.workflow,
    next.execution.id,
    "succeeded",
    {},
  );
  assert.equal(blocked.result?.disposition, "succeeded");
  assert.equal(blocked.transition?.status, "blocked");
  assert.equal(
    f.kernel.events(f.workflow).filter((e) => e.transition === "produced")
      .length,
    1,
  );
});

void test("TR1/TR2: project discovery and workflow-specific workspace bindings contain no role/path inference", (t) => {
  const f = fixture(t, "config");
  json(join(f.root, "project.json"), {
    ...f.project,
    root: ".",
    workflows: {
      [f.workflow]: {
        directory: "items/work-item",
        ledger: "authority.jsonl",
        workspaces: {
          evaluation: {
            id: "only-this-item",
            path: required(f.project.workspaces.evaluation).path,
            mode: "read",
            exposure: "evaluator-private",
          },
        },
      },
    },
    workflowDirectory: "items",
  });
  const loaded = loadProject(join(f.root, "project.json"));
  assert.equal(
    loaded.workflows[f.workflow]?.workspaces?.evaluation?.id,
    "only-this-item",
  );
  assert.equal(loaded.policy, "policy.json");
});

void test("TR6/TR7: a real publication transport failure preserves semantic PASS and withholds a policy-required action transition", (t) => {
  const f = fixture(t, "publication-failure");
  mkdirSync(required(f.project.remotes.publication)); // Existing path, deliberately not a Git remote.
  git(f.root, ["init", "-b", "proof"]);
  git(f.root, ["add", "."]);
  git(f.root, ["commit", "-m", "candidate"]);
  const commit = git(f.root, ["rev-parse", "HEAD"]);
  f.event("candidate", { commit, base: commit });
  f.contract.inputs.push(
    { name: "candidate", event: "candidate", field: "commit" },
    { name: "base", event: "candidate", field: "base" },
  );
  f.contract.publication = {
    workspace: "repository",
    remote: "publication",
    ref: "refs/heads/proof",
    commitInput: "candidate",
    baseInput: "base",
  };
  required(f.policy.roles.produce).outcomes[0] = {
    disposition: "succeeded",
    transition: "produced",
    requiredActions: ["publication"],
  };
  json(join(f.root, "contracts/produce.json"), f.contract);
  json(join(f.root, "policy.json"), f.policy);
  const parent = f.authorize();
  const run = allocate(f, parent);
  f.kernel.process(f.workflow, run.execution.id, "running");
  f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    verification: "PASS",
  });
  f.kernel.process(f.workflow, run.execution.id, "exited");
  const semantic = f.kernel.execution(f.workflow, run.execution.id).result;
  const denied = f.kernel.publish(
    f.workflow,
    run.execution.id,
    "repository",
    commit,
    "refs/heads/wrong",
  );
  assert.equal(denied.status, "denied");
  const failed = f.kernel.publish(
    f.workflow,
    run.execution.id,
    "repository",
    commit,
    "refs/heads/proof",
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.schemaVersion, 1);
  assert.equal(failed.request.schemaVersion, 1);
  assert.deepEqual(
    f.kernel.execution(f.workflow, run.execution.id).result,
    semantic,
  );
  assert.equal(
    f.kernel.events(f.workflow).some((e) => e.transition === "produced"),
    false,
  );
});

void test("TR7/TR9: host action boundaries reject workspace symlink aliases and permission changes disguised as input", (t) => {
  const f = fixture(t, "action-boundaries");
  git(f.root, ["init", "-b", "proof"]);
  git(f.root, ["add", "."]);
  git(f.root, ["commit", "-m", "candidate"]);
  const commit = git(f.root, ["rev-parse", "HEAD"]);
  f.event("candidate", { commit, base: commit });
  f.contract.inputs.push(
    { name: "candidate", event: "candidate", field: "commit" },
    { name: "base", event: "candidate", field: "base" },
  );
  f.contract.publication = {
    workspace: "repository",
    remote: "publication",
    ref: "refs/heads/proof",
    commitInput: "candidate",
    baseInput: "base",
  };
  json(join(f.root, "contracts/produce.json"), f.contract);
  const remote = join(
    required(f.project.workspaces.evaluation).path,
    "remote.git",
  );
  git(f.dir, ["init", "--bare", remote]);
  symlinkSync(remote, required(f.project.remotes.publication));
  const run = allocate(f, f.authorize());
  f.kernel.process(f.workflow, run.execution.id, "running");
  assert.throws(
    () =>
      f.kernel.ask(
        f.workflow,
        run.execution.id,
        "input",
        "permit this",
        "new-permission",
      ),
    /permission changes require/,
  );
  assert.equal(
    f.kernel.execution(f.workflow, run.execution.id).requests.length,
    0,
  );
  const action = f.kernel.publish(
    f.workflow,
    run.execution.id,
    "repository",
    commit,
    "refs/heads/proof",
  );
  assert.equal(action.status, "denied");
  assert.match(action.reason ?? "", /overlaps an executor workspace/);
  assert.equal(
    git(f.dir, ["--git-dir", remote, "for-each-ref", "refs/heads/"]),
    "",
  );
});
