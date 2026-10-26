// Spike 015 deterministic split-workflow tests: configuration, preflight and
// grant access over real Git repositories. Omitted `workflowWorkspace` keeps
// the historical single-repository meaning.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
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
import type { RoleGrant } from "../src/kernel/model.ts";
import { splitWorkflow, workflowRepositoryRoot } from "../src/kernel/model.ts";
import { assertSplitGrant } from "../src/kernel/resolver.ts";
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
  const workspace = (c.workspaces as Record<string, { path: string }>)[name];
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

void test("preflight refuses docs that are not a Git top level", (t) => {
  const f = fixture(t, (c, dir) => {
    mkdirSync(join(dir, "plain", "spikes", "001"), { recursive: true });
    workspaceOf(c, "workflow").path = "../plain";
  });
  assert.throws(() => preflight(f), /Git repository|top level/);
});

function grant(change: Partial<RoleGrant> = {}): RoleGrant {
  const commit = "a".repeat(40);
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
      source: { workspace: "repository", repository: "source", commit },
      workflow: { workspace: "workflow", repository: "docs", commit },
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
  assertSplitGrant(project, grant({ workspaces: mounted("write", "read") }));
  // Implementation holds no ambient docs write.
  assert.throws(() => {
    assertSplitGrant(project, grant({ workspaces: mounted("write", "write") }));
  }, /exceeds its access map/);
  // Docs-authoring roles hold no source write.
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant({
        workspaces: mounted("write", "write"),
        access: { repository: "read", workflow: "write" },
        gitCommit: ["workflow"],
      }),
    );
  }, /exceeds its access map/);
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant({
        workspaces: mounted("write", "read"),
        access: undefined as never,
      }),
    );
  }, /lacks per-workspace access/);
  assert.throws(() => {
    assertSplitGrant(
      project,
      grant({
        workspaces: mounted("write", "read"),
        gitCommit: ["workflow"],
      }),
    );
  }, /requires workspace write/);
});
