// Spike 014h deterministic containment tests: fixture processes run through the
// one production launcher (`containedLaunch`) against sacrificial roots, and
// every effect is checked from the host side. No provider is called.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
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
import { join } from "node:path";
import test, { type TestContext } from "node:test";

import { AdapterRefusal } from "../src/executors/adapters.ts";
import {
  assertWorkspaces,
  containedLaunch,
  locateContainment,
  probeContainment,
} from "../src/executors/containment.ts";

interface Fixture {
  dir: string;
  repo: string;
  evaluation: string;
  sibling: string;
  checkout: string;
  home: string;
  scratch: string;
  program: string;
  bwrap: string;
}

// Sacrificial roots. `program` is a shell fixture that probes what it can do
// and reports into the scratch directory.
function fixture(t: TestContext): Fixture {
  const located = locateContainment([]);
  assert.ok(located.ok, "bubblewrap is required for containment tests");
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "fs-isolation-")));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const f: Fixture = {
    dir,
    repo: join(dir, "repo"),
    evaluation: join(dir, "evaluation-private"),
    sibling: join(dir, "sibling"),
    checkout: join(dir, "harness-checkout"),
    home: join(dir, "home"),
    scratch: join(dir, "scratch"),
    program: join(dir, "bin", "worker"),
    bwrap: located.path,
  };
  for (const path of [
    f.repo,
    f.evaluation,
    f.sibling,
    f.checkout,
    f.home,
    f.scratch,
    join(dir, "bin"),
  ])
    mkdirSync(path);
  writeFileSync(join(f.repo, "granted.txt"), "granted\n");
  writeFileSync(join(f.evaluation, "secret.txt"), "evaluator-private\n");
  writeFileSync(join(f.sibling, "sibling.txt"), "sibling\n");
  writeFileSync(join(f.checkout, "checkout.txt"), "checkout\n");
  writeFileSync(join(f.home, "real-home-secret.txt"), "home-secret\n");
  symlinkSync(f.sibling, join(f.repo, "link-out"));
  execFileSync("git", ["init", "-q", "-b", "main", f.repo]);
  const out = join(f.scratch, "report");
  const check = (name: string, command: string): string =>
    `if ( ${command} ) >/dev/null 2>&1; then echo ${name}=yes; else echo ${name}=no; fi >> '${out}'`;
  writeFileSync(
    f.program,
    [
      "#!/bin/sh",
      check("read-repo", `cat '${f.repo}/granted.txt'`),
      check("write-repo", `echo new > '${f.repo}/created.txt'`),
      check("edit-repo", `echo edit >> '${f.repo}/granted.txt'`),
      check("delete-repo", `rm '${f.repo}/granted.txt'`),
      check(
        "git-commit-repo",
        `git -C '${f.repo}' -c user.name=t -c user.email=t@example.invalid commit --allow-empty -q -m fixture`,
      ),
      check("write-scratch", `echo ok > '${f.scratch}/scratch-file'`),
      check("read-evaluation", `cat '${f.evaluation}/secret.txt'`),
      check("write-evaluation", `echo x > '${f.evaluation}/inside.txt'`),
      check("read-sibling", `cat '${f.sibling}/sibling.txt'`),
      check("write-sibling", `echo x > '${f.sibling}/escaped.txt'`),
      check("read-checkout", `cat '${f.checkout}/checkout.txt'`),
      check("read-real-home", `cat '${f.home}/real-home-secret.txt'`),
      check("symlink-escape", `cat '${f.repo}/link-out/sibling.txt'`),
      check("dotdot-escape", `cat '${f.repo}/../sibling/sibling.txt'`),
      check("dotdot-write", `echo x > '${f.repo}/../escaped-dotdot.txt'`),
      check("home-is-synthetic", `test "$HOME" = '${f.scratch}/home'`),
      "",
    ].join("\n"),
  );
  chmodSync(f.program, 0o755);
  return f;
}

function launch(
  f: Fixture,
  workspaces: Array<{ path: string; mode: "read" | "write" }>,
  extra: { program?: string } = {},
): Record<string, string> {
  const command = containedLaunch({
    bwrap: f.bwrap,
    provider: "codex",
    program: extra.program ?? f.program,
    args: [],
    cwd: workspaces[0]?.path ?? f.scratch,
    workspaces,
    scratch: f.scratch,
    nodePath: process.execPath,
    toolFiles: [],
    masked: [],
    protectedRoots: [f.checkout, f.home],
    env: { PATH: "/usr/bin:/bin" },
    sourceEnv: { HOME: f.home, PATH: process.env.PATH ?? "" },
  });
  const run = spawnSync(command.program, command.args, {
    env: command.env,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  const report = Object.fromEntries(
    readFileSync(join(f.scratch, "report"), "utf8")
      .trim()
      .split("\n")
      .map((line) => line.split("=") as [string, string]),
  );
  // The `..` write lands in the namespace's private tmpfs /tmp (EA3); the
  // host-side check in untouched() is the evidence, not the self-report.
  delete report["dotdot-write"];
  return report;
}

function untouched(f: Fixture): void {
  // Host-side proof that nothing outside the grant changed.
  assert.equal(existsSync(join(f.sibling, "escaped.txt")), false);
  assert.equal(existsSync(join(f.evaluation, "inside.txt")), false);
  assert.equal(existsSync(join(f.dir, "escaped-dotdot.txt")), false);
  assert.equal(
    readFileSync(join(f.sibling, "sibling.txt"), "utf8"),
    "sibling\n",
  );
  assert.equal(
    readFileSync(join(f.home, "real-home-secret.txt"), "utf8"),
    "home-secret\n",
  );
}

// A `..` write lands in the namespace's private tmpfs /tmp (EA3); untouched()
// proves from the host that it never reached a host path.
const DENIED = {
  "read-evaluation": "no",
  "write-evaluation": "no",
  "read-sibling": "no",
  "write-sibling": "no",
  "read-checkout": "no",
  "read-real-home": "no",
  "symlink-escape": "no",
  "dotdot-escape": "no",
  "home-is-synthetic": "yes",
  "write-scratch": "yes",
};

void test("014h AC02/AC04: a public worker uses its granted repository and scratch; private, sibling, checkout and real-home paths are unavailable", (t) => {
  const f = fixture(t);
  const report = launch(f, [{ path: f.repo, mode: "write" }]);
  assert.deepEqual(report, {
    "read-repo": "yes",
    "write-repo": "yes",
    "edit-repo": "yes",
    "delete-repo": "yes",
    "git-commit-repo": "yes",
    ...DENIED,
  });
  // Host side: the granted writes landed, nothing else did.
  assert.equal(existsSync(join(f.repo, "created.txt")), true);
  assert.equal(existsSync(join(f.repo, "granted.txt")), false);
  assert.equal(
    execFileSync("git", ["-C", f.repo, "log", "--format=%s"], {
      encoding: "utf8",
    }).trim(),
    "fixture",
  );
  assert.equal(readFileSync(join(f.scratch, "scratch-file"), "utf8"), "ok\n");
  untouched(f);
});

void test("014h AC03/B2: a read-granted repository rejects create, edit, delete and Git commits at the process boundary", (t) => {
  const f = fixture(t);
  const report = launch(f, [{ path: f.repo, mode: "read" }]);
  assert.deepEqual(report, {
    "read-repo": "yes",
    "write-repo": "no",
    "edit-repo": "no",
    "delete-repo": "no",
    "git-commit-repo": "no",
    ...DENIED,
  });
  assert.equal(existsSync(join(f.repo, "created.txt")), false);
  assert.equal(readFileSync(join(f.repo, "granted.txt"), "utf8"), "granted\n");
  assert.equal(
    spawnSync("git", ["-C", f.repo, "rev-parse", "--verify", "HEAD"]).status,
    128,
    "no commit was created",
  );
  untouched(f);
});

void test("014h AC07/B1/B3: repository read + evaluator-private write + scratch; other roots stay unavailable even by known path", (t) => {
  const f = fixture(t);
  const report = launch(f, [
    { path: f.repo, mode: "read" },
    { path: f.evaluation, mode: "write" },
  ]);
  assert.equal(report["read-repo"], "yes");
  assert.equal(report["write-repo"], "no");
  assert.equal(report["delete-repo"], "no");
  assert.equal(report["read-evaluation"], "yes");
  assert.equal(report["write-evaluation"], "yes");
  assert.equal(report["write-scratch"], "yes");
  assert.equal(report["read-sibling"], "no");
  assert.equal(report["write-sibling"], "no");
  assert.equal(report["read-checkout"], "no");
  assert.equal(report["read-real-home"], "no");
  assert.equal(readFileSync(join(f.evaluation, "inside.txt"), "utf8"), "x\n");
  assert.equal(existsSync(join(f.repo, "created.txt")), false);
  assert.equal(existsSync(join(f.sibling, "escaped.txt")), false);
});

void test("014h B1: a workspace granted through a symlink is resolved before binding", (t) => {
  const f = fixture(t);
  const alias = join(f.dir, "alias");
  symlinkSync(f.repo, alias);
  const report = launch(f, [{ path: alias, mode: "read" }]);
  assert.equal(report["read-repo"], "yes");
  assert.equal(report["write-repo"], "no");
  untouched(f);
});

void test("014h AC11/B1: unresolvable, duplicate, conflicting and scratch-overlapping workspaces and exposed protected runtime roots are refused", (t) => {
  const f = fixture(t);
  const input = (
    workspaces: Array<{ path: string; mode: "read" | "write" }>,
    extra: { program?: string; protectedRoots?: string[] } = {},
  ) =>
    containedLaunch({
      bwrap: f.bwrap,
      provider: "codex",
      program: extra.program ?? f.program,
      args: [],
      cwd: f.repo,
      workspaces,
      scratch: f.scratch,
      nodePath: process.execPath,
      toolFiles: [],
      masked: [],
      protectedRoots: extra.protectedRoots ?? [f.checkout],
      env: {},
      sourceEnv: { HOME: f.home, PATH: process.env.PATH ?? "" },
    });
  const nested = join(f.repo, "nested");
  mkdirSync(nested);
  const refused = (fn: () => unknown): void => {
    assert.throws(
      fn,
      (error: unknown) =>
        error instanceof AdapterRefusal &&
        error.category === "provider-config-invalid",
    );
  };
  refused(() => input([{ path: join(f.dir, "missing"), mode: "read" }]));
  refused(() =>
    input([
      { path: f.repo, mode: "read" },
      { path: f.repo, mode: "read" },
    ]),
  );
  refused(() =>
    input([
      { path: f.repo, mode: "read" },
      { path: nested, mode: "write" },
    ]),
  );
  refused(() => input([{ path: f.dir, mode: "read" }]));
  refused(() => input([{ path: "/", mode: "read" }]));
  refused(() => {
    assertWorkspaces([{ path: join(f.dir, "missing"), mode: "write" }]);
  });
  // A runtime binding that would expose a protected root.
  refused(() =>
    input([{ path: f.repo, mode: "read" }], {
      protectedRoots: [f.repo, join(f.dir, "bin")],
    }),
  );
  // Compatible nesting (same mode) is representable.
  assert.doesNotThrow(() =>
    input([
      { path: f.repo, mode: "write" },
      { path: nested, mode: "write" },
    ]),
  );
});

void test("014h AC11: unavailable namespaces are reported as permission-denied and never fall back", (t) => {
  const f = fixture(t);
  const failing = join(f.dir, "failing-bwrap");
  writeFileSync(failing, "#!/bin/sh\nexit 1\n");
  chmodSync(failing, 0o755);
  assert.throws(
    () => {
      probeContainment(failing);
    },
    (error: unknown) =>
      error instanceof AdapterRefusal && error.category === "permission-denied",
  );
  assert.doesNotThrow(() => {
    probeContainment(f.bwrap);
  });
});
