// Spike 014e deterministic external-project tests: methodology/project root
// separation, grant source/runtime binding, fail-closed root, provenance and
// origin checks, and host-owned bubblewrap containment probed black-box
// through the real governed launch path. No provider is ever called: a
// placeholder program stands in for a registered adapter.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  AdapterRefusal,
  planLaunch,
  ADAPTERS,
} from "../src/executors/adapters.ts";
import {
  containedLaunch,
  locateContainment,
  probeNestedSandbox,
} from "../src/executors/containment.ts";
import { startHarnessHost } from "../src/index.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import { identity, readLedger } from "../src/kernel/ledger.ts";
import { loadDefinition } from "../src/kernel/methodology.ts";
import type {
  Execution,
  ExecutorProfile,
  LedgerEvent,
  Project,
  RoleGrant,
  WorkflowGrant,
} from "../src/kernel/model.ts";
import { roleInputs } from "../src/kernel/resolver.ts";
import { normalizeOrigin } from "../src/kernel/roots.ts";
import { trustedBinding, trustedDefinition } from "../src/kernel/trust.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";
import { trustFixtureMethodology } from "./support/trusted-fixture.ts";

const repository = resolve(".");
const rootToken = "test-human-root-credential-014e-0000000000";
const auth = {
  authorization: `Bearer ${rootToken}`,
  "content-type": "application/json",
};
const gitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: "External fixture",
  GIT_AUTHOR_EMAIL: "external-fixture@example.invalid",
  GIT_COMMITTER_NAME: "External fixture",
  GIT_COMMITTER_EMAIL: "external-fixture@example.invalid",
};
function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    env: gitEnv,
  }).trim();
}
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

interface External {
  dir: string;
  harness: string;
  stockdif: string;
  hidden: string;
  bin: string;
  configPath: string;
  config: Record<string, unknown>;
  ledger: string;
  trusted: { revision: string; methodology: string };
}

// A disposable "Harness" methodology repository (the governed-smoke fixture
// methodology with a committed test-only trust root), a separate "Stockdif"
// project repository, a private evaluation workspace and an external project
// configuration living outside both repositories.
function external(
  t: TestContext,
  change: (config: Record<string, unknown>, f: External) => void = () => {},
): External {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "external-project-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const harness = join(dir, "harness");
  mkdirSync(harness);
  cpSync(
    resolve("fixtures/governed-smoke/methodology"),
    join(harness, "methodology"),
    { recursive: true },
  );
  rmSync(join(harness, "methodology", "trusted.jsonl"), { force: true });
  git(harness, ["init", "-q", "-b", "main"]);
  const trusted = trustFixtureMethodology(harness, {
    policy: "methodology/policy.json",
    methodologyPaths: ["methodology/contracts", "methodology/skills"],
    history: "methodology/trusted.jsonl",
  });
  git(harness, ["add", "-f", "methodology/trusted.jsonl"]);
  git(harness, ["commit", "-q", "-m", "trust root"]);
  git(harness, [
    "remote",
    "add",
    "origin",
    "https://github.com/Janco-Yspeert/harness.git",
  ]);
  const stockdif = join(dir, "stockdif");
  const workflowDir = join(stockdif, "spikes", "smoke");
  mkdirSync(workflowDir, { recursive: true });
  cpSync(resolve("fixtures/governed-smoke/data"), workflowDir, {
    recursive: true,
  });
  git(stockdif, ["init", "-q", "-b", "feat/spike-001"]);
  git(stockdif, ["add", "."]);
  git(stockdif, ["commit", "-q", "-m", "baseline"]);
  git(stockdif, [
    "remote",
    "add",
    "origin",
    "git@github.com:Janco-Yspeert/stockdif.git",
  ]);
  const hidden = join(dir, "stockdif-hidden");
  cpSync(resolve("fixtures/governed-smoke/private"), hidden, {
    recursive: true,
  });
  const bin = join(dir, "bin");
  mkdirSync(bin);
  mkdirSync(join(dir, "config"));
  const configPath = join(dir, "config", "stockdif.project.json");
  const config: Record<string, unknown> = {
    schemaVersion: 1,
    id: "stockdif",
    root: "../stockdif",
    methodologyRoot: "../harness",
    origin: "github.com/Janco-Yspeert/stockdif",
    policy: "methodology/policy.json",
    trustedHistory: "methodology/trusted.jsonl",
    validatorSources: {},
    workflowDirectory: "spikes",
    ledgerName: "workflow.jsonl",
    workspaces: {
      repository: {
        id: "stockdif-repository",
        path: ".",
        mode: "write",
        exposure: "public",
      },
      private: {
        id: "stockdif-hidden",
        path: "../stockdif-hidden",
        mode: "write",
        exposure: "smoke-private",
      },
    },
    remotes: {},
  };
  const f: External = {
    dir,
    harness,
    stockdif,
    hidden,
    bin,
    configPath,
    config,
    ledger: join(workflowDir, "workflow.jsonl"),
    trusted,
  };
  change(config, f);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return f;
}

function workspacePath(
  config: Record<string, unknown>,
  name: string,
  path: string,
): void {
  const workspace = (config.workspaces as Record<string, { path: string }>)[
    name
  ];
  assert.ok(workspace);
  workspace.path = path;
}

function hostOptions(
  f: External,
  extra: {
    runtimeRoot?: string;
    bwrap?: string;
    project?: Project;
    executors?: ExecutorProfile[];
    privateDataRoot?: string;
  } = {},
) {
  return {
    rootToken,
    project: extra.project ?? loadProject(f.configPath),
    executors: extra.executors ?? [claudeProfile, codexProfile],
    privateDataRoot: extra.privateDataRoot ?? join(f.dir, "host-private"),
    validators: {},
    selectExecutor: (grant: RoleGrant, profiles: ExecutorProfile[]) =>
      profiles.find(
        (profile) =>
          profile.provider ===
          (grant.role === "smoke-codex" ? "codex" : "claude"),
      ) ?? profiles[0],
    providerRuntime: {
      runtimeRoot: extra.runtimeRoot ?? f.harness,
      ...(extra.bwrap ? { bwrap: extra.bwrap } : {}),
      locate: (program: string) => ({
        ok: true as const,
        path: join(f.bin, program),
      }),
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

async function grant(
  url: string,
  role: string,
): Promise<{
  status: number;
  value: { grant: WorkflowGrant; error?: string };
}> {
  return call(url, "grants", {
    continuation: false,
    delegation: ["spawned"],
    maxAllocations: 2,
    roles: [role],
  });
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

void test("014e AC01/TR1: the unchanged Harness config and an external config bind the same exact trusted N+1 from committed Harness history", (t) => {
  const harness = loadProject("harness.project.json");
  assert.equal(harness.methodologyRoot, undefined);
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "external-n1-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const project = join(dir, "project");
  mkdirSync(join(project, "spikes"), { recursive: true });
  git(project, ["init", "-q"]);
  const configPath = join(dir, "external.json");
  writeFileSync(
    configPath,
    JSON.stringify({
      schemaVersion: 1,
      id: "external",
      root: "project",
      methodologyRoot: repository,
      policy: "methodologies/harness/policy.json",
      trustedHistory: "methodologies/harness/trusted.jsonl",
      validatorSources: {
        "prepared-coverage": "src/methodologies/harness-public.ts",
        "verification-accounting": "src/methodologies/harness-public.ts",
      },
      workflowDirectory: "spikes",
      workspaces: {},
      remotes: {},
    }),
  );
  const externalProject = loadProject(configPath);
  assert.equal(externalProject.methodologyRoot, repository);
  assert.equal(externalProject.root, project);
  const self = trustedDefinition(harness, harnessValidators);
  const other = trustedDefinition(externalProject, harnessValidators);
  assert.equal(other.id, self.id);
  const binding = trustedBinding(externalProject);
  assert.deepEqual(binding.trusted, {
    sequence: 5,
    manifest:
      "sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb",
    revision: "9169ccf7d4543c214e7b7890ee29e428a5f8c01a",
  });
  assert.equal(binding.methodologyRepository, realpathSync(repository));
  // Nothing methodology-shaped exists in the external project.
  assert.equal(existsSync(join(project, "methodologies")), false);
  assert.equal(existsSync(join(project, "skills")), false);
});

void test("014e AC01/D3/TR3: an external grant records the methodology repository, trusted record and exact runtime commit, and stays pinned", async (t) => {
  const f = external(t);
  const host = await startHarnessHost(0, { governed: hostOptions(f) });
  t.after(() => host.close());
  const granted = await grant(host.url, "smoke-codex");
  assert.equal(granted.status, 201, JSON.stringify(granted.value));
  const head = git(f.harness, ["rev-parse", "HEAD"]);
  assert.deepEqual(granted.value.grant.source, {
    methodologyRepository: f.harness,
    trusted: {
      sequence: 1,
      manifest: f.trusted.methodology,
      revision: f.trusted.revision,
    },
    runtime: { repository: f.harness, commit: head },
  });
  // The ledger lives in the project repository and records the grant.
  const events = readLedger(f.ledger);
  assert.ok(
    events.some(
      (e) =>
        e.transition === "kernel.workflow-grant" &&
        e.evidence.id === granted.value.grant.id,
    ),
  );
  const listed = await call<{ grants: WorkflowGrant[] }>(host.url, "grants");
  assert.equal(listed.value.grants[0]?.source?.runtime?.commit, head);
  // A later working-tree edit of the trusted history makes the runtime
  // uncommitted: no new grant, and the active grant is unchanged.
  appendFileSync(join(f.harness, "methodology", "trusted.jsonl"), "\n");
  const refused = await grant(host.url, "smoke-codex");
  assert.equal(refused.status, 409);
  assert.match(String(refused.value.error), /uncommitted/);
  git(f.harness, ["checkout", "--", "methodology/trusted.jsonl"]);
  // A later Harness commit changes the runtime: refused, never swapped.
  writeFileSync(join(f.harness, "later.txt"), "later\n");
  git(f.harness, ["add", "later.txt"]);
  git(f.harness, ["commit", "-q", "-m", "later"]);
  const moved = await grant(host.url, "smoke-codex");
  assert.equal(moved.status, 409);
  assert.match(String(moved.value.error), /runtime commit changed/);
  const after = await call<{ grant: WorkflowGrant }>(
    host.url,
    `grants/${granted.value.grant.id}`,
  );
  assert.deepEqual(after.value.grant, granted.value.grant);
});

void test("014e D3: an external host reads trusted history only at its start commit; later methodology commits do not change new grants", async (t) => {
  const runtime = realpathSync(mkdtempSync(join(tmpdir(), "runtime-")));
  t.after(() => {
    rmSync(runtime, { recursive: true, force: true });
  });
  git(runtime, ["init", "-q"]);
  writeFileSync(join(runtime, "runtime.txt"), "runtime\n");
  git(runtime, ["add", "."]);
  git(runtime, ["commit", "-q", "-m", "runtime"]);
  const f = external(t);
  const host = await startHarnessHost(0, {
    governed: hostOptions(f, { runtimeRoot: runtime }),
  });
  t.after(() => host.close());
  const first = await grant(host.url, "smoke-codex");
  assert.equal(first.status, 201, JSON.stringify(first.value));
  // A methodology promotion committed after host start.
  appendFileSync(
    join(f.harness, "methodology", "skills", "smoke-codex.md"),
    "\nChanged.\n",
  );
  const next = trustFixtureMethodology(f.harness, {
    policy: "methodology/policy.json",
    methodologyPaths: ["methodology/contracts", "methodology/skills"],
    history: "methodology/trusted.jsonl",
  });
  git(f.harness, ["add", "-f", "methodology/trusted.jsonl"]);
  git(f.harness, ["commit", "-q", "-m", "promote"]);
  assert.notEqual(next.methodology, f.trusted.methodology);
  const second = await grant(host.url, "smoke-codex");
  assert.equal(second.status, 201, JSON.stringify(second.value));
  assert.equal(second.value.grant.methodology, first.value.grant.methodology);
  const source = second.value.grant.source;
  assert.ok(source);
  assert.equal(source.trusted.manifest, f.trusted.methodology);
  assert.equal(source.runtime?.commit, git(runtime, ["rev-parse", "HEAD"]));
});

void test("014e D2: an external project needs committed trusted history in the methodology repository", async (t) => {
  const f = external(t);
  git(f.harness, ["rm", "-q", "--cached", "methodology/trusted.jsonl"]);
  git(f.harness, ["commit", "-q", "-m", "untrack"]);
  const host = await startHarnessHost(0, { governed: hostOptions(f) });
  t.after(() => host.close());
  const refused = await grant(host.url, "smoke-codex");
  assert.equal(refused.status, 409);
  assert.match(String(refused.value.error), /committed trusted methodology/);
});

void test("014e AC02/AC03/AC04/D5: invalid roots, workspaces, remotes, origins and runtimes refuse host start", async (t) => {
  const cases: Array<{
    name: string;
    pattern: RegExp;
    change?: (config: Record<string, unknown>, f: External) => void;
    after?: (f: External) => void;
    options?: (f: External) => Parameters<typeof hostOptions>[1];
  }> = [
    {
      name: "origin mismatch",
      pattern: /does not match/,
      after: (f) => {
        git(f.stockdif, [
          "remote",
          "set-url",
          "origin",
          "https://github.com/Janco-Yspeert/other.git",
        ]);
      },
    },
    {
      name: "unrecognized origin spelling",
      pattern: /unrecognized spelling/,
      after: (f) => {
        git(f.stockdif, [
          "remote",
          "set-url",
          "origin",
          join(f.dir, "remote.git"),
        ]);
      },
    },
    {
      name: "missing origin remote",
      pattern: /no origin remote/,
      after: (f) => {
        git(f.stockdif, ["remote", "remove", "origin"]);
      },
    },
    {
      name: "origin swapped to the methodology repository",
      pattern: /names the methodology repository/,
      change: (config) => {
        config.origin = "github.com/Janco-Yspeert/harness";
      },
    },
    {
      name: "project root identical to the methodology root",
      pattern: /overlap/,
      change: (config) => {
        config.methodologyRoot = "../stockdif";
      },
    },
    {
      name: "project root inside the methodology repository",
      pattern: /top level|overlap/,
      change: (config, f) => {
        mkdirSync(join(f.harness, "project", "spikes"), { recursive: true });
        config.root = "../harness/project";
        config.workspaces = {};
      },
    },
    {
      name: "methodology root is not a Git repository",
      pattern: /not inside a Git repository/,
      change: (config, f) => {
        mkdirSync(join(f.dir, "plain"));
        config.methodologyRoot = "../plain";
      },
    },
    {
      name: "missing private workspace",
      pattern: /does not exist/,
      change: (config) => {
        workspacePath(config, "private", "../absent");
      },
    },
    {
      name: "private workspace inside the project repository",
      pattern: /private workspace private overlaps the project repository/,
      change: (config, f) => {
        mkdirSync(join(f.stockdif, "hidden"));
        workspacePath(config, "private", "hidden");
      },
    },
    {
      name: "symlink-escaping private workspace",
      pattern: /private workspace private overlaps the project repository/,
      change: (config, f) => {
        symlinkSync(f.stockdif, join(f.dir, "link"));
        workspacePath(config, "private", "../link");
      },
    },
    {
      name: "public workspace escaping into the methodology repository",
      pattern: /overlaps the methodology repository/,
      change: (config, f) => {
        symlinkSync(f.harness, join(f.stockdif, "escape"));
        workspacePath(config, "repository", "escape");
      },
    },
    {
      name: "overlapping workspaces",
      pattern: /overlaps workspace/,
      change: (config, f) => {
        mkdirSync(join(f.hidden, "nested"));
        (config.workspaces as Record<string, unknown>).other = {
          id: "other",
          path: "../stockdif-hidden/nested",
          mode: "read",
          exposure: "smoke-private",
        };
      },
    },
    {
      name: "remote naming the methodology repository",
      pattern: /remote harness names the methodology repository/,
      change: (config) => {
        config.remotes = { harness: "../harness" };
      },
    },
    {
      name: "private data root inside a workspace",
      pattern: /private data root overlaps/,
      options: (f) => ({ privateDataRoot: join(f.hidden, "host-private") }),
    },
    {
      name: "uncommitted runtime",
      pattern: /uncommitted changes/,
      after: (f) => {
        appendFileSync(join(f.harness, "methodology", "policy.json"), "\n");
      },
    },
  ];
  for (const item of cases) {
    const f = external(t, item.change);
    item.after?.(f);
    await assert.rejects(
      async () => {
        const host = await startHarnessHost(0, {
          governed: hostOptions(f, item.options?.(f) ?? {}),
        });
        await host.close();
      },
      item.pattern,
      item.name,
    );
    assert.equal(existsSync(f.ledger), false, item.name);
  }
});

void test("014e D5: only the recognized GitHub spellings normalize to an origin identity", () => {
  for (const url of [
    "https://github.com/Janco-Yspeert/stockdif",
    "https://github.com/Janco-Yspeert/stockdif.git",
    "git@github.com:Janco-Yspeert/stockdif.git",
    "ssh://git@github.com/Janco-Yspeert/stockdif.git",
  ])
    assert.equal(normalizeOrigin(url), "github.com/Janco-Yspeert/stockdif");
  for (const url of [
    "http://github.com/Janco-Yspeert/stockdif",
    "https://gitlab.com/Janco-Yspeert/stockdif",
    "https://github.com.evil/Janco-Yspeert/stockdif",
    "/srv/git/stockdif.git",
    "file:///srv/git/stockdif.git",
  ])
    assert.equal(normalizeOrigin(url), undefined, url);
  assert.throws(() => {
    const dir = mkdtempSync(join(tmpdir(), "origin-"));
    try {
      writeFileSync(
        join(dir, "p.json"),
        JSON.stringify({
          schemaVersion: 1,
          id: "x",
          root: ".",
          policy: "p",
          origin: "https://github.com/a/b",
          workspaces: {},
          remotes: {},
        }),
      );
      loadProject(join(dir, "p.json"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, /origin/);
});

void test("014e AC02: committed-input provenance is checked in the project repository, never in the methodology repository", (t) => {
  const f = external(t);
  const project = loadProject(f.configPath);
  const definition = loadDefinition(project);
  const base = definitionRole(definition);
  const bytes = readFileSync(join(f.stockdif, "spikes", "smoke", "marker.txt"));
  const role = {
    ...base,
    contract: {
      ...base.contract,
      inputs: [{ name: "brief", event: "brief-frozen", committed: true }],
    },
  };
  const event = (commit: string): LedgerEvent[] => [
    {
      transition: "brief-frozen",
      evidence: { path: "marker.txt", identity: identity(bytes), commit },
    },
  ];
  const own = git(f.stockdif, ["rev-parse", "HEAD"]);
  assert.deepEqual(roleInputs(project, "smoke", role, event(own), definition), {
    brief: identity(bytes),
  });
  // The identical path and bytes committed only in the methodology repository.
  mkdirSync(join(f.harness, "spikes", "smoke"), { recursive: true });
  writeFileSync(join(f.harness, "spikes", "smoke", "marker.txt"), bytes);
  git(f.harness, ["add", "spikes"]);
  git(f.harness, ["commit", "-q", "-m", "same path"]);
  const foreign = git(f.harness, ["rev-parse", "HEAD"]);
  assert.throws(() =>
    roleInputs(project, "smoke", role, event(foreign), definition),
  );
});

function definitionRole(definition: ReturnType<typeof loadDefinition>) {
  const role = definition.roles["smoke-codex"];
  assert.ok(role);
  return role;
}

void test("014e D4: containment makes forbidden-exposure grants eligible for every adapter only when enforced", () => {
  const grant = {
    capabilities: ["repository-read", "local-computation", "git-inspect"],
    executorConstraints: { protected: false, forbiddenExposure: ["private"] },
  } as unknown as RoleGrant;
  assert.throws(
    () => planLaunch(ADAPTERS.codex, grant, codexProfile),
    /read isolation/,
  );
  assert.deepEqual(planLaunch(ADAPTERS.codex, grant, codexProfile, true), {});
});

// A placeholder provider: records what it could and could not do inside the
// launch environment into its working directory, then exits without a
// semantic result.
function probe(f: External, program: string, output: string): void {
  const home = process.env.HOME ?? "/root";
  const bare = join(f.dir, "remote.git");
  if (!existsSync(bare)) git(f.dir, ["init", "-q", "--bare", bare]);
  // Only the (bubblewrap-created) mount-point directories leading to a D4
  // runtime binding may appear under the real home inside containment: the
  // read-only worker-tools closure, the Node runtime, and the scratch,
  // workspace and placeholder-program bindings when temporary directories
  // live under home. Any other entry is real home content.
  const synthetic = [
    repository,
    realpathSync(process.execPath),
    realpathSync(tmpdir()),
    f.dir,
  ]
    .map((path) => relative(home, path))
    .filter((toward) => !toward.startsWith("..") && !isAbsolute(toward))
    .map((toward) => toward.split("/")[0] ?? "")
    .filter((entry) => entry !== "")
    .map((entry) => ` -e '${entry}'`)
    .join("");
  const unexpected = synthetic
    ? `ls -A '${home}' | grep -v -x -F${synthetic}`
    : `ls -A '${home}'`;
  const script = `#!/bin/sh
out="${output}"
check() { if eval "$2" >/dev/null 2>&1; then echo "$1=yes"; else echo "$1=no"; fi; }
{
  check read-private "cat '${join(f.hidden, "promotion-bytes.txt")}'"
  check write-methodology "touch '${join(f.harness, "pwned")}'"
  check write-harness "touch '${join(repository, ".containment-probe")}'"
  check read-real-home "test -n \\"\\$(${unexpected})\\""
  check read-host-private "ls '${join(f.dir, "host-private")}'"
  check ledger-content "test -s '${f.ledger}'"
  check write-own "touch ./probe-owned"
  check git-push "git -C '${f.stockdif}' push '${bare}' HEAD:refs/heads/pushed"
  check ssh-agent "test -n \\"$SSH_AUTH_SOCK\\""
  check github-token "test -n \\"$GITHUB_TOKEN$GH_TOKEN\\""
  echo "home=$HOME"
} > "$out"
exit 0
`;
  writeFileSync(join(f.bin, program), script);
  chmodSync(join(f.bin, program), 0o755);
}

function results(path: string): Record<string, string> {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .trim()
      .split("\n")
      .map((line) => line.split("=") as [string, string]),
  );
}

void test("014e AC03/AC04/D4: contained public and protected workers see only their granted workspaces, no Harness writes and no Git credentials", async (t) => {
  const f = external(t);
  const publicOut = join(f.stockdif, "probe-public.txt");
  const protectedOut = join(f.hidden, "probe-protected.txt");
  probe(f, "codex", publicOut);
  probe(f, "claude", protectedOut);
  const saved = {
    SSH_AUTH_SOCK: process.env.SSH_AUTH_SOCK,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };
  process.env.SSH_AUTH_SOCK = join(f.dir, "agent.sock");
  process.env.GITHUB_TOKEN = "ghp_test_token_not_real";
  t.after(() => {
    for (const [key, value] of Object.entries(saved))
      if (value === undefined) Reflect.deleteProperty(process.env, key);
      else process.env[key] = value;
  });
  const host = await startHarnessHost(0, { governed: hostOptions(f) });
  t.after(() => host.close());
  for (const role of ["smoke-codex", "smoke-claude-promotion"]) {
    const granted = await grant(host.url, role);
    assert.equal(granted.status, 201, JSON.stringify(granted.value));
    const started = await call<{ execution: Execution }>(host.url, "continue", {
      workflowGrant: granted.value.grant.id,
      mode: "spawned",
      role,
    });
    assert.equal(started.status, 201, JSON.stringify(started.value));
    const execution = await settled(host.url, started.value.execution.id);
    assert.equal(execution.process, "failed");
  }
  const { home: publicHome, ...pub } = results(publicOut);
  assert.deepEqual(pub, {
    "read-private": "no",
    "write-methodology": "no",
    "write-harness": "no",
    "read-real-home": "no",
    "read-host-private": "no",
    "ledger-content": "no",
    "write-own": "yes",
    "git-push": "no",
    "ssh-agent": "no",
    "github-token": "no",
  });
  assert.notEqual(publicHome, process.env.HOME);
  const { home: protectedHome, ...prot } = results(protectedOut);
  assert.deepEqual(prot, {
    "read-private": "yes",
    "write-methodology": "no",
    "write-harness": "no",
    "read-real-home": "no",
    "read-host-private": "no",
    "ledger-content": "no",
    "write-own": "yes",
    "git-push": "no",
    "ssh-agent": "no",
    "github-token": "no",
  });
  assert.notEqual(protectedHome, process.env.HOME);
  assert.equal(existsSync(join(f.harness, "pwned")), false);
  assert.equal(existsSync(join(repository, ".containment-probe")), false);
  assert.equal(
    git(join(f.dir, "remote.git"), ["branch", "--list", "pushed"]),
    "",
  );
});

// H2 correction: the operator's Node runtime lived under the operator home.
// Containment exposes that runtime (D4) as the Node executable, its global
// modules and their launcher links, never the rest of its installation prefix
// or of the home directory. Probed black-box inside a real namespace.
void test("014e D4 (H2): a Node runtime under the operator home exposes only the runtime, not its prefix siblings or the rest of home", (t) => {
  const located = locateContainment([]);
  assert.ok(located.ok, "bubblewrap is required for containment tests");
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "node-home-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const home = join(dir, "home");
  const local = join(home, ".local");
  const nodeBin = join(local, "bin");
  mkdirSync(nodeBin, { recursive: true });
  copyFileSync(realpathSync(process.execPath), join(nodeBin, "node"));
  chmodSync(join(nodeBin, "node"), 0o755);
  const npm = join(local, "lib", "node_modules", "npm", "bin");
  mkdirSync(npm, { recursive: true });
  writeFileSync(
    join(npm, "npm-cli.js"),
    '#!/usr/bin/env node\nconsole.log("npm-ok");\n',
  );
  chmodSync(join(npm, "npm-cli.js"), 0o755);
  symlinkSync("../lib/node_modules/npm/bin/npm-cli.js", join(nodeBin, "npm"));
  writeFileSync(join(nodeBin, "unrelated-tool"), "#!/bin/sh\n");
  mkdirSync(join(local, "share", "keyrings"), { recursive: true });
  writeFileSync(join(local, "share", "keyrings", "login.keyring"), "secret");
  mkdirSync(join(home, ".ssh"));
  writeFileSync(join(home, ".ssh", "id_ed25519"), "secret");
  const workspace = join(dir, "workspace");
  const scratch = join(dir, "scratch");
  const bin = join(dir, "bin");
  for (const path of [workspace, scratch, bin]) mkdirSync(path);
  const output = join(workspace, "probe.txt");
  writeFileSync(
    join(bin, "codex"),
    `#!/bin/sh
check() { if eval "$2" >/dev/null 2>&1; then echo "$1=yes"; else echo "$1=no"; fi; }
{
  check run-node "'${join(nodeBin, "node")}' -e 'process.exit(0)'"
  check run-npm "npm | grep -q npm-ok"
  check read-prefix-sibling "ls '${join(local, "share")}'"
  check read-bin-sibling "test -e '${join(nodeBin, "unrelated-tool")}'"
  check read-ssh "ls '${join(home, ".ssh")}'"
  echo "home=$(ls -A '${home}' | tr '\\n' ',')"
  echo "prefix=$(ls -A '${local}' | tr '\\n' ',')"
} > '${output}'
`,
  );
  chmodSync(join(bin, "codex"), 0o755);
  const path = `${nodeBin}:/usr/bin:/bin`;
  const command = containedLaunch({
    bwrap: located.path,
    provider: "codex",
    program: join(bin, "codex"),
    args: [],
    cwd: workspace,
    workspaces: [{ path: workspace, mode: "write" }],
    scratch,
    nodePath: join(nodeBin, "node"),
    toolFiles: [],
    masked: [],
    protectedRoots: [home],
    env: { PATH: path },
    sourceEnv: { HOME: home, PATH: path },
  });
  const run = spawnSync(command.program, command.args, {
    env: command.env,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(results(output), {
    "run-node": "yes",
    "run-npm": "yes",
    "read-prefix-sibling": "no",
    "read-bin-sibling": "no",
    "read-ssh": "no",
    home: ".local,",
    prefix: "bin,lib,",
  });
});

void test("014e D4/TR4: a contained provider still reaches the Harness worker tools and its typed result is accepted", async (t) => {
  const f = external(t);
  // The offline fake provider and its module closure, installed beside the
  // placeholder program so containment exposes them read-only.
  for (const [from, to] of [
    ["tools/fixtures/fake-provider.ts", "tools/fixtures/fake-provider.ts"],
    ["tools/archive-manifest.ts", "tools/archive-manifest.ts"],
    ["src/executors/protocol.ts", "src/executors/protocol.ts"],
  ] as const) {
    mkdirSync(join(f.bin, to, ".."), { recursive: true });
    cpSync(resolve(from), join(f.bin, to));
  }
  writeFileSync(join(f.bin, "package.json"), '{"type":"module"}\n');
  const evidence = join(f.stockdif, "provider-evidence.json");
  writeFileSync(
    join(f.bin, "scenario.json"),
    JSON.stringify({
      evidence,
      steps: [
        {
          tool: "submitResult",
          args: { disposition: "succeeded", methodology: { smoke: "PASS" } },
        },
      ],
    }),
  );
  writeFileSync(
    join(f.bin, "codex"),
    `#!/bin/sh\nexec node '${join(f.bin, "tools/fixtures/fake-provider.ts")}' '${join(f.bin, "scenario.json")}' codex "$@"\n`,
  );
  chmodSync(join(f.bin, "codex"), 0o755);
  const host = await startHarnessHost(0, { governed: hostOptions(f) });
  t.after(() => host.close());
  const granted = await grant(host.url, "smoke-codex");
  assert.equal(granted.status, 201, JSON.stringify(granted.value));
  const started = await call<{ execution: Execution }>(host.url, "continue", {
    workflowGrant: granted.value.grant.id,
    mode: "spawned",
    role: "smoke-codex",
  });
  assert.equal(started.status, 201, JSON.stringify(started.value));
  const execution = await settled(host.url, started.value.execution.id);
  assert.equal(execution.process, "exited", JSON.stringify(execution));
  assert.equal(execution.result?.disposition, "succeeded");
  assert.ok(readLedger(f.ledger).some((e) => e.transition === "codex-smoked"));
  const observed = JSON.parse(readFileSync(evidence, "utf8")) as {
    envKeys: string[];
    cwd: string;
  };
  assert.equal(observed.cwd, f.stockdif);
  for (const key of ["SSH_AUTH_SOCK", "GH_TOKEN", "GITHUB_TOKEN"])
    assert.equal(observed.envKeys.includes(key), false, key);
});

void test("014e D4: unavailable containment or an unwrapped fixture command is refused before any session or allocation", async (t) => {
  const f = external(t);
  probe(f, "codex", join(f.stockdif, "never.txt"));
  const failing = join(f.dir, "failing-bwrap");
  writeFileSync(failing, "#!/bin/sh\nexit 1\n");
  chmodSync(failing, 0o755);
  const host = await startHarnessHost(0, {
    governed: hostOptions(f, { bwrap: failing }),
  });
  t.after(() => host.close());
  const granted = await grant(host.url, "smoke-codex");
  assert.equal(granted.status, 201);
  const refused = await call<{ category?: string }>(host.url, "continue", {
    workflowGrant: granted.value.grant.id,
    mode: "spawned",
    role: "smoke-codex",
  });
  assert.equal(refused.status, 409);
  assert.equal(refused.value.category, "permission-denied");
  const fixture: ExecutorProfile = {
    ...codexProfile,
    id: "fixture",
    command: ["/bin/true"],
  };
  const second = await startHarnessHost(0, {
    governed: hostOptions(f, { executors: [fixture] }),
  });
  t.after(() => second.close());
  const other = await grant(second.url, "smoke-codex");
  const unwrapped = await call<{ category?: string }>(second.url, "continue", {
    workflowGrant: other.value.grant.id,
    mode: "spawned",
    role: "smoke-codex",
  });
  assert.equal(unwrapped.status, 409);
  assert.equal(unwrapped.value.category, "provider-config-invalid");
  const events = readLedger(f.ledger);
  assert.equal(
    events.filter((e) =>
      ["kernel.session", "kernel.allocation"].includes(e.transition),
    ).length,
    0,
  );
  assert.equal(existsSync(join(f.stockdif, "never.txt")), false);
});

// H3 correction: a provider's own nested sandbox (Codex builds one with
// bubblewrap and protects /tmp/.git as a writable root) must be able to start
// inside host containment. The namespace root stays read-only; the private
// /tmp tmpfs, which exposes and persists no host path, is writable. Probed
// black-box inside a real namespace.
void test("014e D4 (H3): a nested provider sandbox that creates new mount points on its writable roots starts inside containment", (t) => {
  const located = locateContainment([]);
  assert.ok(located.ok, "bubblewrap is required for containment tests");
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "nested-sandbox-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const workspace = join(dir, "workspace");
  const scratch = join(dir, "scratch");
  const bin = join(dir, "bin");
  for (const path of [workspace, scratch, bin]) mkdirSync(path);
  const output = join(workspace, "nested.txt");
  const marker = `harness-h3-${String(process.pid)}-${String(Date.now())}`;
  const nested = [
    `'${located.path}'`,
    "--unshare-user --unshare-pid --unshare-net --die-with-parent",
    "--ro-bind / / --dev /dev --proc /proc --bind /tmp /tmp",
    `--bind '${workspace}' '${workspace}'`,
    "--ro-bind /dev/null /tmp/.git",
    "-- /bin/sh -c 'test -e /tmp/.git'",
  ].join(" ");
  writeFileSync(
    join(bin, "codex"),
    `#!/bin/sh
{
  if ${nested} >/dev/null 2>&1; then echo nested-sandbox=yes; else echo nested-sandbox=no; fi
  if touch '/${marker}' 2>/dev/null; then echo write-root=yes; else echo write-root=no; fi
  if touch '/tmp/${marker}' 2>/dev/null; then echo write-private-tmp=yes; else echo write-private-tmp=no; fi
} > '${output}'
`,
  );
  chmodSync(join(bin, "codex"), 0o755);
  const command = containedLaunch({
    bwrap: located.path,
    provider: "codex",
    program: join(bin, "codex"),
    args: [],
    cwd: workspace,
    workspaces: [{ path: workspace, mode: "write" }],
    scratch,
    nodePath: process.execPath,
    toolFiles: [],
    masked: [],
    protectedRoots: [repository],
    env: { PATH: "/usr/bin:/bin" },
  });
  const run = spawnSync(command.program, command.args, {
    env: command.env,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(results(output), {
    "nested-sandbox": "yes",
    "write-root": "no",
    "write-private-tmp": "yes",
  });
  // The namespace /tmp is private: nothing reaches the host.
  assert.equal(existsSync(join("/tmp", marker)), false);
  assert.equal(existsSync(join("/", marker)), false);
});

// A bubblewrap that creates the outer containment, but whose nested sandbox
// (identified by its own network namespace, which containment itself never
// requests) cannot start.
function nestedDenyingBwrap(dir: string, real: string): string {
  const home = join(dir, "nested-deny");
  mkdirSync(home);
  const path = join(home, "bwrap");
  writeFileSync(
    path,
    `#!/bin/sh
for arg in "$@"; do
  [ "$arg" = "--" ] && break
  if [ "$arg" = "--unshare-net" ]; then
    echo "bwrap: Can't mkdir /tmp/.git: Read-only file system" >&2
    exit 1
  fi
done
exec '${real}' "$@"
`,
  );
  chmodSync(path, 0o755);
  return path;
}

void test("014e D4 (H3): the nested-sandbox probe passes under real containment and refuses when the nested sandbox cannot start", (t) => {
  const located = locateContainment([]);
  assert.ok(located.ok, "bubblewrap is required for containment tests");
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "nested-probe-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const workspace = join(dir, "workspace");
  mkdirSync(workspace);
  const input = {
    provider: "codex" as const,
    cwd: workspace,
    workspaces: [{ path: workspace, mode: "write" as const }],
    nodePath: process.execPath,
    masked: [],
    protectedRoots: [repository],
  };
  probeNestedSandbox({ ...input, bwrap: located.path });
  const deny = nestedDenyingBwrap(dir, located.path);
  assert.throws(
    () => {
      probeNestedSandbox({ ...input, bwrap: deny });
    },
    (error: unknown) =>
      error instanceof AdapterRefusal &&
      error.category === "provider-config-invalid" &&
      error.message.includes("nested sandbox cannot start"),
  );
});

void test("014e D4 (H3): a Codex worker whose nested sandbox cannot start is refused before any session or allocation; Claude remains eligible", async (t) => {
  const f = external(t);
  const located = locateContainment([]);
  assert.ok(located.ok, "bubblewrap is required for containment tests");
  const started = join(f.stockdif, "codex-started.txt");
  writeFileSync(join(f.bin, "codex"), `#!/bin/sh\ntouch '${started}'\n`);
  chmodSync(join(f.bin, "codex"), 0o755);
  writeFileSync(join(f.bin, "claude"), "#!/bin/sh\nexit 0\n");
  chmodSync(join(f.bin, "claude"), 0o755);
  const host = await startHarnessHost(0, {
    governed: hostOptions(f, {
      bwrap: nestedDenyingBwrap(f.dir, located.path),
    }),
  });
  t.after(() => host.close());
  const granted = await grant(host.url, "smoke-codex");
  assert.equal(granted.status, 201, JSON.stringify(granted.value));
  const refused = await call<{ category?: string }>(host.url, "continue", {
    workflowGrant: granted.value.grant.id,
    mode: "spawned",
    role: "smoke-codex",
  });
  assert.equal(refused.status, 409, JSON.stringify(refused.value));
  assert.equal(refused.value.category, "provider-config-invalid");
  assert.equal(
    readLedger(f.ledger).filter((e) =>
      ["kernel.session", "kernel.allocation"].includes(e.transition),
    ).length,
    0,
  );
  assert.equal(existsSync(started), false);
  // The refusal leaves the pre-authorized Claude substitution available:
  // Claude builds no nested sandbox, so the same host still allocates it.
  const claude = await grant(host.url, "smoke-claude-promotion");
  assert.equal(claude.status, 201, JSON.stringify(claude.value));
  const allocated = await call<{ execution: Execution }>(host.url, "continue", {
    workflowGrant: claude.value.grant.id,
    mode: "spawned",
    role: "smoke-claude-promotion",
  });
  assert.equal(allocated.status, 201, JSON.stringify(allocated.value));
  await settled(host.url, allocated.value.execution.id);
});
