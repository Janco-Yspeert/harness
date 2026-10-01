// Spike 014g: host-mediated evidence writes for roles that hold no direct
// repository write or commit authority.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
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

import { ADAPTERS, planLaunch } from "../src/executors/adapters.ts";
import { parseWorkerRequest } from "../src/executors/protocol.ts";
import { buildGovernedClaudeCommand } from "../src/claude-workflow.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import { ExecutionKernel } from "../src/kernel/execution.ts";
import { identity, required } from "../src/kernel/ledger.ts";
import { loadDefinition } from "../src/kernel/methodology.ts";
import type {
  ExecutorProfile,
  Project,
  RoleContract,
  RoleGrant,
  WorkflowPolicy,
} from "../src/kernel/model.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";

const worker = resolve("tools/fixtures/governed-executor.ts");
const profiles: ExecutorProfile[] = [
  {
    id: "fixture",
    provider: "repository-fixture",
    modes: ["attached"],
    capabilities: [
      "repository-read",
      "repository-write",
      "local-computation",
      "git-inspect",
      "git-commit",
    ],
    isolation: ["private-workspace"],
    available: true,
    command: [process.execPath, worker],
  },
];
const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "Operator",
  GIT_AUTHOR_EMAIL: "operator@example.invalid",
  GIT_COMMITTER_NAME: "Operator",
  GIT_COMMITTER_EMAIL: "operator@example.invalid",
};
function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env,
  }).trim();
}
function write(path: string, value: unknown): void {
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fixture(t: TestContext, legacy = false) {
  const dir = mkdtempSync(join(tmpdir(), "evidence-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const root = join(dir, "project");
  const workflow = "item";
  mkdirSync(join(root, "items", workflow), { recursive: true });
  mkdirSync(join(dir, "private"));
  const contract: RoleContract = {
    schemaVersion: 1,
    workspaces: ["repository", "evaluation"],
    capabilities: legacy
      ? [
          "repository-read",
          "repository-write",
          "local-computation",
          "git-inspect",
          "git-commit",
        ]
      : ["repository-read", "local-computation"],
    forbiddenExposure: [],
    protected: true,
    inputs: [],
    results: ["succeeded", "failed"],
    methodology: {},
    human: ["input"],
    postconditions: legacy ? ["verification-result.json"] : [],
    ...(legacy
      ? {}
      : {
          evidence: {
            workspace: "repository",
            destinations: ["result.json", "notes/"],
          },
        }),
  };
  const policy: WorkflowPolicy = {
    schemaVersion: 1,
    roles: {
      [legacy ? "evaluator-verify" : "verify"]: {
        contract: "contracts/verify.json",
        skill: "skills/verify.md",
        when: { not: { event: "done" } },
        retry: { dispositions: ["failed"], limit: 1 },
        outcomes: [{ disposition: "succeeded", transition: "done" }],
      },
    },
    gates: [],
    maxAllocations: 4,
  };
  write(join(root, "policy.json"), policy);
  write(join(root, "contracts/verify.json"), contract);
  mkdirSync(join(root, "skills"));
  writeFileSync(join(root, "skills/verify.md"), "Verify.\n");
  writeFileSync(join(root, "items", workflow, "manifest.md"), "# Manifest\n");
  writeFileSync(join(root, "unrelated.txt"), "one\n");
  git(root, ["init", "-q", "-b", "main"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "base"]);
  const project: Project = {
    schemaVersion: 1,
    id: "evidence",
    root,
    policy: "policy.json",
    workflows: {
      [workflow]: { directory: `items/${workflow}`, ledger: "authority.jsonl" },
    },
    workspaces: {
      repository: { id: "repo", path: root, mode: "write", exposure: "public" },
      evaluation: {
        id: "private",
        path: join(dir, "private"),
        mode: "write",
        exposure: "evaluator-private",
      },
    },
    remotes: {},
  };
  const kernel = new ExecutionKernel({ project, executors: profiles });
  const grant = kernel.authorize(workflow, {
    continuation: true,
    delegation: ["attached"],
    maxAllocations: 4,
    inline: true,
  });
  if (legacy)
    kernel.root(
      workflow,
      grant.id,
      "evaluator-verify",
      `legacy-evaluator-publication-compatibility trusted-methodology=9169ccf runtime=${"a".repeat(40)}`,
    );
  const session = kernel.register(workflow, "fixture").session;
  const run = kernel.allocate(workflow, grant.id, {
    mode: "attached",
    session: session.id,
    role: legacy ? "evaluator-verify" : "verify",
  });
  kernel.process(workflow, run.execution.id, "running");
  const actions = () =>
    kernel
      .events(workflow)
      .filter((event) => event.transition.startsWith("kernel.action-"));
  return { root, workflow, kernel, run, actions, contract, project };
}

void test("legacy evaluator publication compatibility is root-authorized, bounded to its required result, and preserves existing write authority", (t) => {
  const f = fixture(t, true);
  const grant = f.run.grant;
  assert.equal(
    required(grant.workspaces.find((workspace) => workspace.id === "repo"))
      .mode,
    "write",
  );
  assert.ok(grant.capabilities.includes("repository-write"));
  assert.ok(grant.capabilities.includes("git-commit"));
  assert.deepEqual(grant.hostActions.evidence, {
    workspace: "repository",
    workspaceId: "repo",
    destinations: ["verification-result.json"],
  });
  assert.deepEqual(grant.legacyEvidenceCompatibility, {
    trustedMethodologyCommit: "9169ccf",
    runtimeCommit: "a".repeat(40),
    rootAuthority: grant.rootAuthority,
    destination: "verification-result.json",
    existingCapabilities: ["repository-write", "git-commit"],
  });
  assert.deepEqual(
    planLaunch(ADAPTERS.claude, grant, {
      id: "legacy-claude",
      provider: "claude",
      modes: ["spawned"],
      capabilities: grant.capabilities,
      isolation: ["private-workspace"],
      available: true,
    }),
    {},
  );

  const denied = f.kernel.recordEvidence(f.workflow, f.run.execution.id, [
    { destination: "manifest.md", content: "nope\n" },
  ]);
  assert.equal(denied.status, "denied");
  const published = f.kernel.recordEvidence(f.workflow, f.run.execution.id, [
    {
      destination: "verification-result.json",
      content: '{"result":"PASS"}\n',
    },
  ]);
  assert.equal(published.status, "succeeded", published.reason ?? "");
  assert.match(published.after ?? "", /^[a-f0-9]{40}$/);
});

void test("014g: the grant records read-only repository access, no direct write or commit, and the mediated action", (t) => {
  const f = fixture(t);
  const grant = f.run.grant;
  assert.equal(
    required(grant.workspaces.find((w) => w.id === "repo")).mode,
    "read",
  );
  assert.equal(
    required(grant.workspaces.find((w) => w.id === "private")).mode,
    "write",
  );
  assert.deepEqual(grant.capabilities, [
    "repository-read",
    "local-computation",
  ]);
  assert.deepEqual(grant.hostActions.evidence, {
    workspace: "repository",
    workspaceId: "repo",
    destinations: ["result.json", "notes/"],
  });
});

void test("014g TR1: a destination outside the allowlist is denied and leaves nothing written", (t) => {
  const f = fixture(t);
  const head = git(f.root, ["rev-parse", "HEAD"]);
  const attempts = [
    "unrelated.txt",
    "../unrelated.txt",
    "/etc/passwd",
    "notes/../../unrelated.txt",
    ".git/config",
    "notes/.git/x",
    "result.json.extra",
  ];
  for (const destination of attempts) {
    const action = f.kernel.recordEvidence(f.workflow, f.run.execution.id, [
      { destination: "result.json", content: "{}\n" },
      { destination, content: "changed\n" },
    ]);
    assert.equal(action.status, "denied", destination);
    assert.match(action.reason ?? "", /outside role contract/);
  }
  assert.equal(git(f.root, ["rev-parse", "HEAD"]), head);
  assert.equal(existsSync(join(f.root, "items/item/result.json")), false);
  assert.equal(readFileSync(join(f.root, "unrelated.txt"), "utf8"), "one\n");
  assert.equal(
    git(f.root, ["status", "--porcelain", "--untracked-files=no"]),
    "",
  );
  const results = f.actions().filter((e) => e.transition.endsWith("result"));
  assert.equal(results.length, attempts.length);
  assert.ok(results.every((e) => e.evidence.status === "denied"));
});

void test("014g TR1: an allowed request writes and commits only the supplied bytes, attributed to the execution and recorded in the ledger", (t) => {
  const f = fixture(t);
  const base = git(f.root, ["rev-parse", "HEAD"]);
  // Unrelated dirty and staged work must never enter the evidence commit.
  writeFileSync(join(f.root, "unrelated.txt"), "dirty\n");
  writeFileSync(join(f.root, "staged.txt"), "staged\n");
  git(f.root, ["add", "staged.txt"]);
  const id = f.run.execution.id;
  const manifest = "# Manifest\n\nentry\n";
  const files = [
    { destination: "result.json", content: '{"result":"PASS"}\n' },
    { destination: "manifest.md", content: manifest },
    { destination: "notes/a/b.md", content: "note\n" },
  ];
  // manifest.md is not allowlisted in this fixture.
  assert.equal(f.kernel.recordEvidence(f.workflow, id, files).status, "denied");
  const action = f.kernel.recordEvidence(
    f.workflow,
    id,
    files.filter((file) => file.destination !== "manifest.md"),
  );
  assert.equal(action.status, "succeeded", action.reason ?? "");
  assert.equal(action.before, base);
  assert.equal(action.after, git(f.root, ["rev-parse", "HEAD"]));
  assert.equal(git(f.root, ["rev-parse", "HEAD^"]), base);
  assert.deepEqual(
    git(f.root, ["show", "--name-only", "--format=", "HEAD"])
      .split("\n")
      .sort(),
    ["items/item/notes/a/b.md", "items/item/result.json"],
  );
  assert.equal(
    git(f.root, ["show", "HEAD:items/item/result.json"]),
    '{"result":"PASS"}',
  );
  assert.equal(
    git(f.root, ["log", "-1", "--format=%an <%ae>"]),
    `harness-execution-${id} <${id}@harness.invalid>`,
  );
  assert.match(
    git(f.root, ["log", "-1", "--format=%B"]),
    new RegExp(`Harness-Execution: ${id}`),
  );
  // Unrelated work stays exactly as it was.
  assert.equal(readFileSync(join(f.root, "unrelated.txt"), "utf8"), "dirty\n");
  assert.equal(git(f.root, ["diff", "--cached", "--name-only"]), "staged.txt");
  const request = required(
    f.actions().findLast((e) => e.transition === "kernel.action-request"),
  ).evidence as { kind: string; files: Array<Record<string, unknown>> };
  assert.equal(request.kind, "evidence");
  assert.deepEqual(request.files[0], {
    destination: "result.json",
    identity: identity(Buffer.from('{"result":"PASS"}\n')),
    bytes: 18,
  });
  const recorded = required(
    f.actions().findLast((e) => e.transition === "kernel.action-result"),
  ).evidence;
  assert.equal(recorded.status, "succeeded");
  assert.equal(recorded.after, action.after);
  assert.equal(
    f.kernel.execution(f.workflow, id).actions.at(-1)?.request.kind,
    "evidence",
  );
});

void test("014g TR1: a symbolic link, an unchanged file or a stopped execution records nothing", (t) => {
  const f = fixture(t);
  const id = f.run.execution.id;
  const head = git(f.root, ["rev-parse", "HEAD"]);
  mkdirSync(join(f.root, "items/item/notes"));
  symlinkSync(
    join(f.root, "unrelated.txt"),
    join(f.root, "items/item/result.json"),
  );
  const linked = f.kernel.recordEvidence(f.workflow, id, [
    { destination: "result.json", content: "x\n" },
  ]);
  assert.equal(linked.status, "failed");
  assert.equal(readFileSync(join(f.root, "unrelated.txt"), "utf8"), "one\n");
  rmSync(join(f.root, "items/item/result.json"));
  const first = f.kernel.recordEvidence(f.workflow, id, [
    { destination: "notes/x.md", content: "x\n" },
  ]);
  assert.equal(first.status, "succeeded");
  const same = f.kernel.recordEvidence(f.workflow, id, [
    { destination: "notes/x.md", content: "x\n" },
  ]);
  assert.equal(same.status, "failed");
  assert.equal(git(f.root, ["rev-parse", "HEAD"]), required(first.after));
  assert.notEqual(head, first.after);
  f.kernel.process(f.workflow, id, "cancelled");
  const stopped = f.kernel.recordEvidence(f.workflow, id, [
    { destination: "notes/y.md", content: "y\n" },
  ]);
  assert.equal(stopped.status, "denied");
  assert.equal(existsSync(join(f.root, "items/item/notes/y.md")), false);
});

void test("014g: a contract that mediates evidence and also holds direct write or commit authority is refused", (t) => {
  const f = fixture(t);
  for (const capability of ["repository-write", "git-commit"]) {
    write(join(f.root, "contracts/verify.json"), {
      ...f.contract,
      capabilities: [...f.contract.capabilities, capability],
    });
    assert.throws(
      () => loadDefinition(f.project, harnessValidators),
      /invalid contract for verify/,
    );
  }
  write(join(f.root, "contracts/verify.json"), {
    ...f.contract,
    evidence: { workspace: "repository", destinations: ["../escape"] },
  });
  assert.throws(
    () => loadDefinition(f.project, harnessValidators),
    /invalid contract for verify/,
  );
});

void test("014g SC5: a launch that cannot enforce the composition is refused with no fallback to a write grant", (t) => {
  const f = fixture(t);
  const grant = f.run.grant;
  const profile: ExecutorProfile = {
    id: "claude",
    provider: "claude",
    modes: ["spawned"],
    capabilities: ["repository-read", "local-computation", "git-inspect"],
    isolation: ["private-workspace"],
    available: true,
  };
  assert.deepEqual(planLaunch(ADAPTERS.claude, grant, profile), {});
  const writable: RoleGrant = {
    ...grant,
    workspaces: grant.workspaces.map((w) => ({ ...w, mode: "write" as const })),
  };
  assert.throws(
    () => planLaunch(ADAPTERS.claude, writable, profile),
    /read-only workspace/,
  );
  const committing: RoleGrant = {
    ...grant,
    capabilities: [...grant.capabilities, "repository-write", "git-commit"],
  };
  assert.throws(
    () => planLaunch(ADAPTERS.claude, committing, profile),
    /no direct write or commit/,
  );
});

void test("014g: the Claude launch for a mediated grant holds no write or commit tool and denies command writes to the read-only repository", (t) => {
  const f = fixture(t);
  const command = buildGovernedClaudeCommand({
    workspaces: f.run.grant.workspaces
      .toSorted((a) => (a.exposure === "public" ? 1 : -1))
      .map((w) => ({ path: w.path, mode: w.mode })),
    capabilities: f.run.grant.capabilities,
    workerOperations: ["assignment", "submitResult", "requestAction"],
    scratch: "/scratch",
    mcpConfig: "{}",
    system: "system",
    prompt: "prompt",
  });
  const flag = (name: string): string =>
    required(command[command.indexOf(name) + 1]);
  assert.ok(!flag("--tools").split(",").includes("Write"));
  assert.ok(!flag("--tools").split(",").includes("Edit"));
  assert.ok(!flag("--allowedTools").includes("git commit"));
  assert.ok(!flag("--allowedTools").includes("git add"));
  assert.equal(flag("--permission-mode"), "dontAsk");
  const settings = JSON.parse(flag("--settings")) as {
    sandbox: { filesystem: { denyWrite: string[] } };
  };
  assert.deepEqual(settings.sandbox.filesystem.denyWrite, [f.root]);
  assert.match(flag("--disallowedTools"), new RegExp(`Write\\(/${f.root}/`));
});

void test("014g: the evidence request is a typed, bounded worker operation", () => {
  const parsed = parseWorkerRequest("requestAction", {
    kind: "evidence",
    files: [{ destination: "a.md", content: "text" }],
  });
  assert.deepEqual(parsed, {
    operation: "requestAction",
    kind: "evidence",
    files: [{ destination: "a.md", content: "text" }],
  });
  for (const bad of [
    { kind: "evidence" },
    { kind: "evidence", files: [] },
    { kind: "evidence", files: [{ destination: "a.md" }] },
    {
      kind: "evidence",
      files: [{ destination: "a.md", content: "x", mode: 1 }],
    },
    {
      kind: "evidence",
      files: [{ destination: "a.md", content: "x" }],
      extra: 1,
    },
    {
      kind: "evidence",
      files: [{ destination: "a.md", content: "x".repeat(70_000) }],
    },
  ])
    assert.throws(() => parseWorkerRequest("requestAction", bad), /invalid/);
});

void test("014g AC04/TR3: the real evaluator-verify contract mediates evidence generically through the existing contract fields", () => {
  const project = loadProject(resolve("harness.project.json"));
  const contract = required(
    loadDefinition(project, harnessValidators).roles["evaluator-verify"],
  ).contract;
  assert.equal(contract.protected, true);
  assert.deepEqual(contract.workspaces, ["repository", "evaluation"]);
  assert.deepEqual(contract.capabilities, [
    "repository-read",
    "local-computation",
    "git-inspect",
  ]);
  assert.deepEqual(contract.evidence, {
    workspace: "repository",
    destinations: ["verification-result.json", "manifest.md", "feedback.md"],
  });
  assert.equal(
    JSON.stringify(contract.evidence).match(/spike|stockdif|014/i),
    null,
  );
});
