// E4 — New workflow grants bind immutable trusted N; working-tree bytes can
// neither satisfy nor defeat the gate. Legacy mutation stays retired.
// Frozen authority: spike.md §4, §7 and AC08/AC09; design-map.md C1 and
// Invariants ("A new workflow grant binds the latest human-trusted
// methodology, rebuilt from its exact revision ..."; "Existing grants keep N").
// Seams: startHarnessHost(port, { governed }) from src/index.ts, loadProject
// from src/kernel/configuration.ts, harnessValidators from
// src/methodologies/harness-public.ts, the committed harness.project.json and
// the host's authenticated POST /governed/<workflow>/grants route.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test, { type TestContext } from "node:test";
import { cloneProject, git, type Clone } from "./support/repo.ts";

const TOKEN = "e".repeat(48);

interface Host {
  readonly url: string;
  close(): Promise<void>;
}

async function startHost(clone: Clone, privateRoot: string): Promise<Host> {
  const index = (await import(
    `${pathToFileURL(join(clone.root, "src", "index.ts")).href}?host=${String(Date.now())}${String(Math.random())}`
  )) as {
    startHarnessHost(
      port: number,
      options: Record<string, unknown>,
    ): Promise<Host>;
  };
  const configuration = (await import(
    `${pathToFileURL(join(clone.root, "src", "kernel", "configuration.ts")).href}?c=${String(Math.random())}`
  )) as { loadProject(path: string): unknown };
  const validators = (await import(
    pathToFileURL(join(clone.root, "src", "methodologies", "harness-public.ts"))
      .href
  )) as { harnessValidators: unknown };
  const project = configuration.loadProject(
    join(clone.root, "harness.project.json"),
  );
  return index.startHarnessHost(0, {
    governed: {
      rootToken: TOKEN,
      project,
      executors: [],
      validators: validators.harnessValidators,
      privateDataRoot: privateRoot,
    },
  });
}

async function post(
  host: Host,
  path: string,
  body: unknown,
): Promise<{ status: number; text: string }> {
  const response = await fetch(`${host.url}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, text: await response.text() };
}

const GRANT = {
  continuation: false,
  delegation: ["spawned"],
  maxAllocations: 1,
};

interface Definition {
  readonly id: string;
  readonly policyIdentity: string;
  readonly roles: Record<
    string,
    { readonly skill: { readonly path: string; readonly identity: string } }
  >;
}

function recordedDefinition(root: string, workflow: string): Definition {
  const ledger = join(root, "spikes", workflow, "workflow.jsonl");
  assert.ok(existsSync(ledger), `granted workflow ${workflow} has a ledger`);
  const events = readFileSync(ledger, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(
      (line) => JSON.parse(line) as { transition: string; evidence: unknown },
    );
  const definition = events.find((e) => e.transition === "kernel.definition");
  assert.ok(definition, "a new grant records its bound kernel definition");
  return definition.evidence as Definition;
}

function trustedExpectation(root: string): {
  revision: string;
  skills: Record<string, { path: string; identity: string }>;
} {
  const history = readFileSync(
    join(root, "methodologies", "harness", "trusted.jsonl"),
    "utf8",
  )
    .split("\n")
    .filter(Boolean);
  const latest = JSON.parse(history.at(-1) ?? "{}") as { revision: string };
  const policy = JSON.parse(
    git(root, ["show", `${latest.revision}:methodologies/harness/policy.json`]),
  ) as { roles: Record<string, { skill: string }> };
  const skills: Record<string, { path: string; identity: string }> = {};
  for (const [role, entry] of Object.entries(policy.roles)) {
    const bytes = execShow(root, latest.revision, entry.skill);
    skills[role] = {
      path: entry.skill,
      identity: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    };
  }
  return { revision: latest.revision, skills };
}

function execShow(root: string, revision: string, path: string): Buffer {
  // Exact committed bytes (git() trims), as required for content identity.
  return execFileSync("git", ["show", `${revision}:${path}`], {
    cwd: root,
    stdio: "pipe",
  });
}

function assertBindsTrusted(
  definition: Definition,
  expected: ReturnType<typeof trustedExpectation>,
  label: string,
): void {
  assert.deepEqual(
    Object.keys(definition.roles).sort(),
    Object.keys(expected.skills).sort(),
    `${label}: bound role set equals trusted N's role set`,
  );
  for (const [role, skill] of Object.entries(expected.skills)) {
    assert.equal(
      definition.roles[role]?.skill.identity,
      skill.identity,
      `${label}: role ${role} binds trusted N's exact skill bytes`,
    );
  }
}

void test("E4a: new grants bind trusted N from its exact revision, unaffected by candidate working-tree bytes", async (t: TestContext) => {
  const clone = cloneProject("e4");
  const privateRoot = mkdtempSync(join(tmpdir(), "harness-014d-eval-e4p-"));
  t.after(() => {
    clone.dispose();
    rmSync(privateRoot, { recursive: true, force: true });
  });
  mkdirSync(join(clone.root, "spikes", "zz-eval-grant-clean"), {
    recursive: true,
  });
  mkdirSync(join(clone.root, "spikes", "zz-eval-grant-edited"), {
    recursive: true,
  });
  const expected = trustedExpectation(clone.root);

  const clean = await startHost(clone, privateRoot);
  let first: { status: number; text: string };
  try {
    first = await post(clean, "/governed/zz-eval-grant-clean/grants", GRANT);
  } finally {
    await clean.close();
  }
  assert.equal(
    first.status,
    201,
    `a new grant from the clean committed checkout succeeds: ${first.text}`,
  );
  const cleanDefinition = recordedDefinition(clone.root, "zz-eval-grant-clean");
  assertBindsTrusted(cleanDefinition, expected, "clean checkout");

  // Candidate working-tree edits to governed methodology inputs.
  appendFileSync(
    join(clone.root, "skills", "evaluator", "SKILL.md"),
    "\n<!-- evaluator fixture: uncommitted candidate edit -->\n",
  );
  appendFileSync(
    join(clone.root, "skills", "implementation", "SKILL.md"),
    "\n<!-- evaluator fixture: uncommitted candidate edit -->\n",
  );
  const edited = await startHost(clone, privateRoot);
  let second: { status: number; text: string };
  try {
    second = await post(edited, "/governed/zz-eval-grant-edited/grants", GRANT);
  } finally {
    await edited.close();
  }
  assert.equal(
    second.status,
    201,
    `working-tree edits must not defeat the trusted gate: ${second.text}`,
  );
  const editedDefinition = recordedDefinition(
    clone.root,
    "zz-eval-grant-edited",
  );
  assertBindsTrusted(editedDefinition, expected, "edited working tree");
  assert.equal(
    editedDefinition.id,
    cleanDefinition.id,
    "the bound definition is independent of working-tree bytes",
  );
});

void test("E4b: legacy workflow-run mutation stays retired under a governed host", async (t: TestContext) => {
  const clone = cloneProject("e4b");
  const privateRoot = mkdtempSync(join(tmpdir(), "harness-014d-eval-e4bp-"));
  t.after(() => {
    clone.dispose();
    rmSync(privateRoot, { recursive: true, force: true });
  });
  const index = (await import(
    `${pathToFileURL(join(clone.root, "src", "index.ts")).href}?legacy=${String(Math.random())}`
  )) as {
    startHarnessHost(
      port: number,
      options: Record<string, unknown>,
    ): Promise<Host>;
  };
  const configuration = (await import(
    pathToFileURL(join(clone.root, "src", "kernel", "configuration.ts")).href
  )) as { loadProject(path: string): unknown };
  const validators = (await import(
    pathToFileURL(join(clone.root, "src", "methodologies", "harness-public.ts"))
      .href
  )) as { harnessValidators: unknown };
  const host = await index.startHarnessHost(0, {
    legacyWorkflowExecution: true,
    governed: {
      rootToken: TOKEN,
      project: configuration.loadProject(
        join(clone.root, "harness.project.json"),
      ),
      executors: [],
      validators: validators.harnessValidators,
      privateDataRoot: privateRoot,
    },
  });
  try {
    for (const path of [
      "/workflow-runs",
      "/workflow-runs/eval-fixture",
      "/workflow-runs/eval-fixture/start",
      "/workflow-fixtures",
    ]) {
      const response = await post(host, path, { workflow: "eval-fixture" });
      assert.ok(
        [404, 405, 410].includes(response.status),
        `legacy mutation ${path} is refused (got ${String(response.status)})`,
      );
    }
  } finally {
    await host.close();
  }
  assert.equal(
    git(clone.root, [
      "status",
      "--porcelain",
      "--untracked-files=all",
      "--",
      "spikes",
    ]),
    "",
    "refused legacy requests create no workflow state",
  );
});
