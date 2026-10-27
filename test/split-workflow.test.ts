// Spike 015 deterministic split-workflow tests: configuration, preflight and
// grant access over real Git repositories. Omitted `workflowWorkspace` keeps
// the historical single-repository meaning.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

import { loadProject } from "../src/kernel/configuration.ts";
import { launchWorkspaces } from "../src/executors/governed.ts";
import { ExecutionKernel } from "../src/kernel/execution.ts";
import { identity } from "../src/kernel/ledger.ts";
import type {
  ExecutorProfile,
  Project,
  RoleContract,
  RoleGrant,
  WorkflowPolicy,
} from "../src/kernel/model.ts";
import { splitWorkflow, workflowRepositoryRoot } from "../src/kernel/model.ts";
import {
  assertBindingAdvance,
  assertSplitGrant,
  committedBinding,
  validateCommitBinding,
} from "../src/kernel/resolver.ts";
import { assertExternalProject } from "../src/kernel/roots.ts";

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "Split fixture",
  GIT_AUTHOR_EMAIL: "split@example.invalid",
  GIT_COMMITTER_NAME: "Split fixture",
  GIT_COMMITTER_EMAIL: "split@example.invalid",
};
function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", env }).trim();
}
function repo(path: string, origin?: string): string {
  mkdirSync(path, { recursive: true });
  git(path, ["init", "-q", "-b", "main"]);
  writeFileSync(join(path, "README.md"), "x\n");
  git(path, ["add", "."]);
  git(path, ["commit", "-q", "-m", "baseline"]);
  if (origin) git(path, ["remote", "add", "origin", origin]);
  return path;
}

interface Fixture {
  dir: string;
  config: Record<string, unknown>;
  write: () => string;
}

function fixture(
  t: TestContext,
  change: (config: Record<string, unknown>, dir: string) => void = () => {},
  split = true,
): Fixture {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "split-workflow-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  repo(join(dir, "methodology"), "https://github.com/acme/harness.git");
  repo(join(dir, "source"), "git@github.com:acme/app.git");
  if (split) {
    repo(join(dir, "docs"), "git@github.com:acme/app-docs.git");
    mkdirSync(join(dir, "docs", "spikes", "001"), { recursive: true });
  } else mkdirSync(join(dir, "source", "spikes", "001"), { recursive: true });
  mkdirSync(join(dir, "private"));
  mkdirSync(join(dir, "config"));
  const workspaces: Record<string, unknown> = {
    repository: {
      id: "source",
      path: ".",
      mode: "write",
      exposure: "public",
    },
    evaluation: {
      id: "private",
      path: "../private",
      mode: "write",
      exposure: "evaluator-private",
    },
  };
  if (split)
    workspaces.workflow = {
      id: "docs",
      path: "../docs",
      mode: "write",
      exposure: "public",
    };
  const config: Record<string, unknown> = {
    schemaVersion: 1,
    id: "app",
    root: "../source",
    methodologyRoot: "../methodology",
    origin: "github.com/acme/app",
    ...(split
      ? {
          workflowWorkspace: "workflow",
          workflowOrigin: "github.com/acme/app-docs",
        }
      : {}),
    policy: "policy.json",
    trustedHistory: "trusted.jsonl",
    validatorSources: {},
    workflowDirectory: "spikes",
    ledgerName: "workflow.jsonl",
    workspaces,
    remotes: {},
  };
  change(config, dir);
  return {
    dir,
    config,
    write: () => {
      const path = join(dir, "config", "app.project.json");
      writeFileSync(path, JSON.stringify(config, null, 2));
      return path;
    },
  };
}
const preflight = (f: Fixture) =>
  assertExternalProject(loadProject(f.write()), {
    privateDataRoot: join(f.dir, "host-private"),
  });
const workspaceOf = (c: Record<string, unknown>, name: string) => {
  const workspace = (
    c.workspaces as Record<string, { id: string; path: string; mode: string }>
  )[name];
  assert.ok(workspace);
  return workspace;
};

void test("split configuration resolves the ledger in the docs repository", (t) => {
  const f = fixture(t);
  const project = loadProject(f.write());
  assert.ok(splitWorkflow(project));
  assert.equal(workflowRepositoryRoot(project), join(f.dir, "docs"));
  assert.equal(project.root, join(f.dir, "source"));
  assert.deepEqual(Object.keys(project.workflows), ["001"]);
  const roots = preflight(f);
  assert.equal(roots.workflowRepository, join(f.dir, "docs"));
  assert.equal(roots.projectRepository, join(f.dir, "source"));
});

void test("omitted workflowWorkspace keeps single-repository meaning", (t) => {
  const f = fixture(t, undefined, false);
  const project = loadProject(f.write());
  assert.ok(!splitWorkflow(project));
  assert.equal(workflowRepositoryRoot(project), project.root);
  assert.equal(preflight(f).workflowRepository, undefined);
});

void test("workflowWorkspace naming repository is not split", (t) => {
  const f = fixture(
    t,
    (c) => {
      c.workflowWorkspace = "repository";
    },
    false,
  );
  assert.ok(!splitWorkflow(loadProject(f.write())));
});

const loadRefusals: Array<
  [string, (c: Record<string, unknown>) => void, RegExp]
> = [
  [
    "missing source origin",
    (c) => {
      delete c.origin;
    },
    /requires project origin/,
  ],
  [
    "missing workflowOrigin",
    (c) => {
      delete c.workflowOrigin;
    },
    /requires workflowOrigin/,
  ],
  [
    "workflowOrigin without split",
    (c) => {
      c.workflowWorkspace = "repository";
    },
    /requires a distinct workflow workspace/,
  ],
  [
    "unknown workflow workspace",
    (c) => {
      c.workflowWorkspace = "nope";
    },
    /configured public workspace/,
  ],
  [
    "private workflow workspace",
    (c) => {
      c.workflowWorkspace = "evaluation";
    },
    /configured public workspace/,
  ],
  [
    "read-only workflow workspace",
    (c) => {
      workspaceOf(c, "workflow").mode = "read";
    },
    /writable public workspace/,
  ],
  [
    "duplicate workspace identity",
    (c) => {
      workspaceOf(c, "workflow").id = "source";
    },
    /distinct identities/,
  ],
  [
    "malformed workflowOrigin",
    (c) => {
      c.workflowOrigin = "not-an-origin";
    },
    /invalid project workflow/,
  ],
];
for (const [name, change, pattern] of loadRefusals)
  void test(`load refuses ${name}`, (t) => {
    const f = fixture(t, (c) => {
      change(c);
    });
    assert.throws(() => loadProject(f.write()), pattern);
  });

void test("preflight refuses an origin mismatch", (t) => {
  const f = fixture(t, (c) => {
    c.workflowOrigin = "github.com/acme/other";
  });
  assert.throws(() => preflight(f), /workflow origin remote does not match/);
});

void test("preflight refuses a docs repository without an origin", (t) => {
  const f = fixture(t);
  git(join(f.dir, "docs"), ["remote", "remove", "origin"]);
  assert.throws(() => preflight(f), /no origin remote/);
});

void test("preflight refuses docs nested in source", (t) => {
  const f = fixture(t, (c, dir) => {
    repo(join(dir, "source", "docs"), "git@github.com:acme/app-docs.git");
    mkdirSync(join(dir, "source", "docs", "spikes", "001"), {
      recursive: true,
    });
    workspaceOf(c, "workflow").path = "docs";
  });
  assert.throws(() => preflight(f), /overlap/);
});

void test("preflight refuses docs that equal the source repository", (t) => {
  const f = fixture(t, (c, dir) => {
    mkdirSync(join(dir, "source", "spikes", "001"), { recursive: true });
    workspaceOf(c, "workflow").path = ".";
  });
  assert.throws(() => preflight(f), /overlap|equals|top level/);
});

void test("preflight refuses a symlinked docs path into source", (t) => {
  const f = fixture(t, (c, dir) => {
    mkdirSync(join(dir, "source", "spikes", "001"), { recursive: true });
    symlinkSync(join(dir, "source"), join(dir, "docs-link"));
    workspaceOf(c, "workflow").path = "../docs-link";
  });
  assert.throws(() => preflight(f), /overlap|equals|top level/);
});

void test("preflight refuses a private root inside the docs repository", (t) => {
  const f = fixture(t, (c, dir) => {
    mkdirSync(join(dir, "docs", "private"));
    workspaceOf(c, "evaluation").path = "../docs/private";
  });
  assert.throws(() => preflight(f), /overlaps/);
});

void test("preflight refuses a host-private root inside the docs repository", (t) => {
  const f = fixture(t);
  assert.throws(
    () =>
      assertExternalProject(loadProject(f.write()), {
        privateDataRoot: join(f.dir, "docs", "host"),
      }),
    /private data root overlaps/,
  );
});

void test("preflight refuses a host-private root inside methodology", (t) => {
  const f = fixture(t);
  assert.throws(
    () =>
      assertExternalProject(loadProject(f.write()), {
        privateDataRoot: join(f.dir, "methodology", "host"),
      }),
    /private data root overlaps/,
  );
});

void test("preflight refuses docs that are not a Git top level", (t) => {
  const f = fixture(t, (c, dir) => {
    mkdirSync(join(dir, "plain", "spikes", "001"), { recursive: true });
    workspaceOf(c, "workflow").path = "../plain";
  });
  assert.throws(() => preflight(f), /Git repository|top level/);
});

function grant(project: Project, change: Partial<RoleGrant> = {}): RoleGrant {
  const sourceCommit = git(project.root, ["rev-parse", "HEAD"]);
  const docs = project.workspaces.workflow;
  assert.ok(docs);
  const docsCommit = git(docs.path, ["rev-parse", "HEAD"]);
  return {
    schemaVersion: 1,
    id: "g",
    role: "implementation",
    inputs: {},
    workspaces: [],
    capabilities: [],
    access: { repository: "write", workflow: "read" },
    gitCommit: ["repository"],
    commits: {
      source: {
        workspace: "repository",
        repository: "source",
        origin: "github.com/acme/app",
        commit: sourceCommit,
      },
      workflow: {
        workspace: "workflow",
        repository: "docs",
        origin: "github.com/acme/app-docs",
        commit: docsCommit,
      },
    },
    hostActions: {},
    ...change,
  } as unknown as RoleGrant;
}

void test("split grants need an access map and may not widen it", (t) => {
  const project = loadProject(fixture(t).write());
  const docs = project.workspaces.workflow;
  const source = project.workspaces.repository;
  assert.ok(docs && source);
  const mounted = (
    sourceMode: "read" | "write",
    docsMode: "read" | "write",
  ) => [
    { ...source, mode: sourceMode },
    { ...docs, mode: docsMode },
  ];
  assertSplitGrant(
    project,
    grant(project, { workspaces: mounted("write", "read") }),
  );
  // Implementation holds no ambient docs write.
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant(project, { workspaces: mounted("write", "write") }),
    );
  }, /exceeds its access map/);
  // Docs-authoring roles hold no source write.
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant(project, {
        workspaces: mounted("write", "write"),
        access: { repository: "read", workflow: "write" },
        gitCommit: ["workflow"],
      }),
    );
  }, /exceeds its access map/);
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant(project, {
        workspaces: mounted("write", "read"),
        access: undefined as never,
      }),
    );
  }, /lacks per-workspace access/);
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant(project, {
        workspaces: mounted("write", "read"),
        gitCommit: ["workflow"],
      }),
    );
  }, /requires workspace write/);
});

void test("repository-qualified bindings refuse wrong repo, content and ancestry", (t) => {
  const project = loadProject(fixture(t).write());
  const docs = project.workspaces.workflow;
  assert.ok(docs);
  const commit = git(docs.path, ["rev-parse", "HEAD"]);
  const binding = committedBinding(
    project,
    "workflow",
    commit,
    "README.md",
    identity("x\n"),
  );
  validateCommitBinding(project, "workflow", binding, {
    path: "README.md",
    sha256: identity("x\n"),
  });
  assert.throws(() => {
    validateCommitBinding(project, "repository", {
      ...binding,
      workspace: "repository",
    });
  }, /wrong repository|origin mismatch|unavailable/);
  assert.throws(() => {
    validateCommitBinding(project, "workflow", {
      ...binding,
      sha256: identity("wrong"),
    });
  }, /content mismatch/);
  writeFileSync(join(docs.path, "README.md"), "next\n");
  git(docs.path, ["add", "README.md"]);
  git(docs.path, ["commit", "-q", "-m", "next"]);
  const next = committedBinding(
    project,
    "workflow",
    git(docs.path, ["rev-parse", "HEAD"]),
  );
  assertBindingAdvance(project, binding, next);
  assert.throws(() => {
    assertBindingAdvance(project, next, binding);
  }, /not descended/);
});

void test("the writable split workspace is the provider cwd", (t) => {
  const project = loadProject(fixture(t).write());
  const source = project.workspaces.repository;
  const docs = project.workspaces.workflow;
  assert.ok(source && docs);
  const base = grant(project, {
    workspaces: [
      { ...source, mode: "read" },
      { ...docs, mode: "write" },
    ],
    access: { repository: "read", workflow: "write" },
    gitCommit: ["workflow"],
  });
  assert.equal(launchWorkspaces(base)[0]?.id, "docs");
});

function splitKernelFixture(t: TestContext) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "split-kernel-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const source = repo(
    join(dir, "source"),
    "git@github.com:acme/kernel-source.git",
  );
  const docs = repo(join(dir, "docs"), "git@github.com:acme/kernel-docs.git");
  const methodology = repo(
    join(dir, "methodology"),
    "git@github.com:acme/harness.git",
  );
  const workflow = "001";
  mkdirSync(join(docs, "spikes", workflow), { recursive: true });
  writeFileSync(join(docs, "spikes", workflow, "manifest.md"), "# Manifest\n");
  git(docs, ["add", "."]);
  git(docs, ["commit", "-q", "-m", "workflow"]);
  const contract: RoleContract = {
    schemaVersion: 1,
    workspaces: ["repository"],
    capabilities: [
      "repository-read",
      "repository-write",
      "local-computation",
      "git-inspect",
      "git-commit",
    ],
    forbiddenExposure: ["evaluator-private"],
    protected: false,
    inputs: [],
    results: ["succeeded", "failed"],
    methodology: {},
    human: [],
    postconditions: ["manifest.md"],
    workflowEvidence: { destinations: ["manifest.md"] },
  };
  const policy: WorkflowPolicy = {
    schemaVersion: 1,
    roles: {
      implementation: {
        contract: "contracts/implementation.json",
        skill: "skills/implementation.md",
        when: { not: { event: "implementation-handoff" } },
        retry: { dispositions: ["failed"], limit: 1 },
        outcomes: [
          {
            disposition: "succeeded",
            transition: "implementation-handoff",
            evidence: { commitHead: true, counterField: "attempt" },
          },
        ],
      },
    },
    gates: [],
    maxAllocations: 2,
  };
  mkdirSync(join(methodology, "contracts"), { recursive: true });
  mkdirSync(join(methodology, "skills"), { recursive: true });
  writeFileSync(
    join(methodology, "contracts", "implementation.json"),
    `${JSON.stringify(contract)}\n`,
  );
  writeFileSync(
    join(methodology, "policy.json"),
    `${JSON.stringify(policy)}\n`,
  );
  writeFileSync(
    join(methodology, "skills", "implementation.md"),
    "Implement.\n",
  );
  git(methodology, ["add", "."]);
  git(methodology, ["commit", "-q", "-m", "methodology"]);
  const project: Project = {
    schemaVersion: 1,
    id: "split-kernel",
    root: source,
    methodologyRoot: methodology,
    policy: "policy.json",
    origin: "github.com/acme/kernel-source",
    workflowWorkspace: "workflow",
    workflowOrigin: "github.com/acme/kernel-docs",
    workflows: {
      [workflow]: {
        directory: `spikes/${workflow}`,
        ledger: "workflow.jsonl",
      },
    },
    workspaces: {
      repository: {
        id: "source",
        path: source,
        mode: "write",
        exposure: "public",
      },
      workflow: {
        id: "docs",
        path: docs,
        mode: "write",
        exposure: "public",
      },
    },
    remotes: {},
  };
  const profile: ExecutorProfile = {
    id: "fixture",
    provider: "fixture",
    modes: ["attached"],
    capabilities: contract.capabilities,
    isolation: [],
    available: true,
  };
  const kernel = new ExecutionKernel({ project, executors: [profile] });
  const workflowGrant = kernel.authorize(workflow, {
    continuation: true,
    delegation: ["attached"],
    roles: ["implementation"],
    maxAllocations: 2,
    inline: true,
  });
  const session = kernel.register(workflow, "fixture").session;
  const run = kernel.allocate(workflow, workflowGrant.id, {
    role: "implementation",
    session: session.id,
    mode: "attached",
  });
  kernel.process(workflow, run.execution.id, "running");
  return { source, docs, workflow, kernel, run };
}

void test("split implementation commits source and brokers docs evidence with an exact pair", (t) => {
  const f = splitKernelFixture(t);
  const sourceStart = git(f.source, ["rev-parse", "HEAD"]);
  const docsStart = git(f.docs, ["rev-parse", "HEAD"]);
  const commits = f.run.grant.commits;
  assert.ok(commits);
  assert.equal(commits.source.commit, sourceStart);
  assert.equal(commits.workflow.commit, docsStart);
  assert.deepEqual(f.run.grant.hostActions.evidence?.destinations, [
    "manifest.md",
  ]);
  assert.equal(
    f.run.grant.workspaces.find((workspace) => workspace.id === "source")?.mode,
    "write",
  );
  assert.equal(
    f.run.grant.workspaces.find((workspace) => workspace.id === "docs")?.mode,
    "read",
  );
  const action = f.kernel.recordEvidence(f.workflow, f.run.execution.id, [
    { destination: "manifest.md", content: "# Manifest\n\nimplementation\n" },
  ]);
  assert.equal(action.status, "succeeded", action.reason ?? "");
  assert.equal(action.binding?.workspace, "workflow");
  assert.equal(git(f.source, ["rev-parse", "HEAD"]), sourceStart);
  writeFileSync(join(f.source, "feature.txt"), "implemented\n");
  git(f.source, ["add", "feature.txt"]);
  git(f.source, ["commit", "-q", "-m", "implement"]);
  const completed = f.kernel.result(
    f.workflow,
    f.run.execution.id,
    "succeeded",
    {},
  );
  assert.equal(completed.transition?.status, "recorded");
  const handoff = f.kernel
    .events(f.workflow)
    .find((event) => event.transition === "implementation-handoff");
  assert.ok(handoff);
  assert.equal(handoff.evidence.commit, git(f.source, ["rev-parse", "HEAD"]));
  assert.equal(
    (handoff.evidence.candidateBinding as { workspace?: string }).workspace,
    "repository",
  );
  assert.equal(
    (handoff.evidence.repositories as { workflow?: { commit?: string } })
      .workflow?.commit,
    action.after,
  );
  assert.equal(
    existsSync(join(f.source, "spikes", f.workflow, "workflow.jsonl")),
    false,
  );
  assert.ok(existsSync(join(f.docs, "spikes", f.workflow, "workflow.jsonl")));
});

void test("a docs HEAD drift denies evidence and cannot create a combined transition", (t) => {
  const f = splitKernelFixture(t);
  writeFileSync(join(f.docs, "drift.txt"), "drift\n");
  git(f.docs, ["add", "drift.txt"]);
  git(f.docs, ["commit", "-q", "-m", "drift"]);
  const action = f.kernel.recordEvidence(f.workflow, f.run.execution.id, [
    { destination: "manifest.md", content: "# Manifest\n\nstale\n" },
  ]);
  assert.equal(action.status, "failed");
  assert.match(action.reason ?? "", /checkpoint is stale/);
  writeFileSync(join(f.source, "partial.txt"), "source only\n");
  git(f.source, ["add", "partial.txt"]);
  git(f.source, ["commit", "-q", "-m", "partial"]);
  const completed = f.kernel.result(
    f.workflow,
    f.run.execution.id,
    "succeeded",
    {},
  );
  assert.equal(completed.transition?.status, "blocked");
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "implementation-handoff"),
    false,
  );
});
