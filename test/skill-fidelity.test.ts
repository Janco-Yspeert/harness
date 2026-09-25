// Spike 014d skill ↔ contract ↔ MCP ↔ artifact ↔ policy fidelity (Design Map
// C7). Every test here runs the candidate's real Harness policy, contracts and
// skill bytes through the production governed host, the registered Claude
// adapter, the real MCP worker tool server and the real kernel. Only the
// provider process is replaced, through the host's programmatic test seam, by
// `tools/fixtures/fake-provider.ts` following each role's matrix row.
//
// Layer (b) below is SCRIPTED COMPLIANCE: it proves the host, contracts and
// transitions accept exactly the matrix behavior and reject deviations. It is
// never evidence of real provider behavior; see the spike's evidence records.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { startHarnessHost } from "../src/index.ts";
import { loadProject } from "../src/kernel/configuration.ts";
import {
  appendLedger,
  contentId,
  identity,
  readLedger,
} from "../src/kernel/ledger.ts";
import type {
  ExecutorProfile,
  LedgerEvent,
  RoleContract,
  WorkflowGrant,
} from "../src/kernel/model.ts";
import { harnessValidators } from "../src/methodologies/harness-public.ts";
import { buildMethodologyManifest } from "../src/methodology-evolution.ts";
import {
  MAX_ACTION_ARTIFACTS,
  WORKER_OPERATIONS,
} from "../src/executors/protocol.ts";
import { PROMOTION_PLAN_PATH } from "../tools/archive-manifest.ts";
import { trustFixtureMethodology } from "./support/trusted-fixture.ts";

const repository = resolve(".");
const fakeProvider = resolve("tools/fixtures/fake-provider.ts");
const rootToken = "test-human-root-credential-014d-0000000000";
const auth = {
  authorization: `Bearer ${rootToken}`,
  "content-type": "application/json",
};
const WORKFLOW = "demo";
const DIR = `spikes/${WORKFLOW}`;
const claude: ExecutorProfile = {
  id: "claude",
  provider: "claude",
  modes: ["spawned"],
  capabilities: [
    "repository-read",
    "repository-write",
    "local-computation",
    "git-inspect",
    "git-commit",
  ],
  isolation: ["private-workspace"],
  available: true,
};
const policy = JSON.parse(
  readFileSync("methodologies/harness/policy.json", "utf8"),
) as {
  roles: Record<
    string,
    { contract: string; skill: string; outcomes: Array<{ transition: string }> }
  >;
};
const ROLES = Object.keys(policy.roles).sort();

// The fidelity matrix in machine form. `evidence/fidelity-matrix.md` is the
// human-reviewable projection; a test below keeps the two consistent.
const MATRIX: Record<
  string,
  {
    operations: string[];
    artifacts: string[];
    vocabulary: string[];
    transitions: string[];
  }
> = {
  "brief-readiness": {
    operations: ["assignment", "submitResult"],
    artifacts: ["spike.md", "feedback.md", "manifest.md"],
    vocabulary: ["succeeded", "READY", "NOT_READY"],
    transitions: ["brief-frozen", "readiness-blocked"],
  },
  "design-map": {
    operations: ["assignment", "submitResult"],
    artifacts: ["design-map.md", "manifest.md"],
    vocabulary: ["succeeded", "blocked"],
    transitions: ["design-map-frozen"],
  },
  "evaluator-prepare": {
    operations: ["assignment", "submitResult"],
    artifacts: ["coverage-map.json", "eval-requirements.md", "manifest.md"],
    vocabulary: ["succeeded", "blocked"],
    transitions: ["evaluation-prepared"],
  },
  implementation: {
    operations: ["assignment", "submitResult"],
    artifacts: ["manifest.md"],
    vocabulary: ["succeeded", "blocked", "failed"],
    transitions: ["implementation-handoff"],
  },
  "evaluator-verify": {
    operations: ["assignment", "submitResult", "requestAction"],
    artifacts: [
      "verification-result.json",
      "manifest.md",
      PROMOTION_PLAN_PATH,
      "tools/archive-manifest.ts",
      "promotionPlan",
    ],
    vocabulary: [
      "succeeded",
      "PASS",
      "FAIL",
      "BLOCKED",
      "IMPLEMENTATION_FAILURE",
      "EVALUATOR_DEFECT",
      "SPECIFICATION_AMBIGUITY",
      "SPECIFICATION_DRIFT",
      "INFRASTRUCTURE_FAILURE",
    ],
    transitions: ["verification-finalized", "promotion-recorded"],
  },
  "evaluator-repair": {
    operations: ["assignment", "submitResult"],
    artifacts: ["coverage-map.json", "manifest.md"],
    vocabulary: ["succeeded", "blocked"],
    transitions: ["evaluator-repair-recorded"],
  },
  "as-built": {
    operations: ["assignment", "submitResult"],
    artifacts: ["as-built.md", "manifest.md", "promotion-recorded"],
    vocabulary: ["succeeded", "blocked"],
    transitions: ["as-built-recorded"],
  },
  outcome: {
    operations: ["assignment", "submitResult"],
    artifacts: ["outcome.md", "manifest.md"],
    vocabulary: ["succeeded", "blocked", "STANDARD", "PROCESS_EXCEPTION"],
    transitions: ["outcome-recorded"],
  },
};

interface Step {
  tool?: string;
  args?: Record<string, unknown>;
  write?: {
    workspace: "repository" | "private";
    path: string;
    content: string;
  };
  commit?: { message: string; paths: string[] };
  promotion?: {
    fromPlan?: boolean;
    candidate?: string;
    attempt?: number;
    omitPlan?: boolean;
    padTo?: number;
  };
}

const pub = (path: string, content: string): Step => ({
  write: { workspace: "repository", path: `${DIR}/${path}`, content },
});
const priv = (path: string, content: string): Step => ({
  write: { workspace: "private", path, content },
});
const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const commit = (message: string, ...paths: string[]): Step => ({
  commit: { message, paths: paths.map((path) => `${DIR}/${path}`) },
});
const submit = (
  methodology: Record<string, string> = {},
  disposition = "succeeded",
): Step => ({ tool: "submitResult", args: { disposition, methodology } });
const ident = (workspace: "repository" | "private", path: string): string =>
  `{{identity:${workspace}:${path}}}`;

function coverage(revision: string): string {
  return json({
    schemaVersion: 1,
    spike: WORKFLOW,
    evaluationRequirements: ident("repository", `${DIR}/eval-requirements.md`),
    readiness: {
      skill: "evaluator",
      evaluatorRevision: revision,
      privateInventoryIdentity: ident(
        "private",
        `.eval/revisions/${revision}/freeze.json`,
      ),
      validatorResultBinding: `sha256:${"2".repeat(64)}`,
      integrityValidation: "PASS",
      criterionRecordCount: 1,
    },
    criteria: [
      {
        id: "AC1",
        frozenAuthority: "spike.md AC1",
        mode: "PUBLIC_REGRESSION",
        required: true,
        procedures: ["R-REG"],
        sufficiency: "fixture criterion for the scripted fidelity exercise",
      },
    ],
  });
}

function revisionBundle(revision: string): Step[] {
  return [
    priv(`.eval/revisions/${revision}/freeze.json`, `freeze ${revision}\n`),
    priv(`.eval/revisions/${revision}/eval-spec.md`, `spec ${revision}\n`),
  ];
}

function revisionArtifact(revision: string): Record<string, unknown> {
  return {
    kind: "evaluator-revision",
    eligible: true,
    evaluatorRevision: revision,
    source: `.eval/revisions/${revision}`,
    destination: `revisions/${revision}`,
    inventory: {
      "freeze.json": ident(
        "private",
        `.eval/revisions/${revision}/freeze.json`,
      ),
      "eval-spec.md": ident(
        "private",
        `.eval/revisions/${revision}/eval-spec.md`,
      ),
    },
  };
}

// Attempts: [evaluatorRevision, result] in order; the last one is terminal.
function verifySteps(
  attempts: Array<[string, "PASS" | "FAIL" | "BLOCKED"]>,
  options: {
    classification?: string;
    plan?: "eligible" | "ineligible" | "none";
    promotion?: Step["promotion"] | false;
    requestTwice?: boolean;
  } = {},
): Step[] {
  const last = attempts.length;
  const [revision, result] = attempts[last - 1] ?? ["001", "PASS"];
  const steps: Step[] = [
    priv(
      ".eval/attempt-ledger.json",
      json({
        schemaVersion: 2,
        attempts: attempts.map(([, status], index) => ({
          id: String(index + 1).padStart(3, "0"),
          status,
        })),
      }),
    ),
    priv(
      `.eval/attempts/${String(last).padStart(3, "0")}/eval-result.md`,
      `attempt ${String(last)} ${result}\n`,
    ),
  ];
  const plan = options.plan ?? (result === "PASS" ? "eligible" : "none");
  if (plan === "eligible") {
    const revisions = [...new Set(attempts.map(([value]) => value))];
    steps.push(
      priv(
        PROMOTION_PLAN_PATH,
        json({
          schemaVersion: 2,
          kind: "evaluator-promotion-plan",
          decision: "ELIGIBLE",
          candidate: "{{input:candidate}}",
          evaluatorRevision: revision,
          attempt: last,
          attempts: attempts.map(([value, status], index) => ({
            attempt: index + 1,
            evaluatorRevision: value,
            result: status,
          })),
          revisions: revisions.map((value) => ({
            evaluatorRevision: value,
            eligible: true,
          })),
          artifacts: [
            {
              kind: "attempt-ledger",
              eligible: true,
              source: ".eval/attempt-ledger.json",
              destination: "attempt-ledger.json",
              identity: ident("private", ".eval/attempt-ledger.json"),
            },
            ...attempts.map((_, index) => {
              const id = String(index + 1).padStart(3, "0");
              return {
                kind: "terminal-attempt",
                eligible: true,
                attempt: index + 1,
                source: `.eval/attempts/${id}/eval-result.md`,
                destination: `attempts/${id}/eval-result.md`,
                identity: ident(
                  "private",
                  `.eval/attempts/${id}/eval-result.md`,
                ),
              };
            }),
            ...revisions.map(revisionArtifact),
          ],
        }),
      ),
    );
  } else if (plan === "ineligible")
    steps.push(
      priv(
        PROMOTION_PLAN_PATH,
        json({
          schemaVersion: 2,
          kind: "evaluator-promotion-plan",
          decision: "INELIGIBLE",
          reason: "fixture revision keeps private mechanics",
        }),
      ),
    );
  const methodology: Record<string, string> =
    result === "PASS"
      ? { result }
      : { result, classification: options.classification ?? "" };
  steps.push(
    pub(
      "verification-result.json",
      json({
        schemaVersion: 1,
        commit: "{{input:candidate}}",
        evaluatorRevision: "{{input:evaluatorRevision}}",
        ...methodology,
        coverageResults: { AC1: result === "PASS" ? "SATISFIED" : "BLOCKED" },
        ...(plan === "none"
          ? {}
          : {
              promotionPlan: {
                identity: ident("private", PROMOTION_PLAN_PATH),
                decision: plan === "eligible" ? "ELIGIBLE" : "INELIGIBLE",
              },
            }),
      }),
    ),
    pub("manifest.md", `# Manifest\n\nverify attempt ${String(last)}\n`),
    commit(
      `verify attempt ${String(last)}`,
      "verification-result.json",
      "manifest.md",
    ),
    submit(methodology),
  );
  if (result === "PASS" && plan === "eligible" && options.promotion !== false) {
    steps.push({ promotion: { fromPlan: true, ...options.promotion } });
    if (options.requestTwice) steps.push({ promotion: { fromPlan: true } });
  }
  return steps;
}

function scripts(
  overrides: Record<string, Step[]> = {},
): Record<string, Step[]> {
  return {
    "brief-readiness": [
      pub("feedback.md", "# Readiness\n\nReady to freeze.\n"),
      pub("manifest.md", "# Manifest\n\nreadiness\n"),
      commit("readiness", "feedback.md", "manifest.md"),
      submit({ verdict: "READY" }),
    ],
    "design-map": [
      pub("design-map.md", "# Design Map\n"),
      pub("manifest.md", "# Manifest\n\ndesign map\n"),
      commit("design map", "design-map.md", "manifest.md"),
      submit(),
    ],
    "evaluator-prepare": [
      priv("eval-spec.md", "private spec\n"),
      ...revisionBundle("001"),
      pub("eval-requirements.md", "# Evaluation Requirements\n"),
      pub("coverage-map.json", coverage("001")),
      pub("manifest.md", "# Manifest\n\nprepare\n"),
      commit(
        "prepare",
        "eval-requirements.md",
        "coverage-map.json",
        "manifest.md",
      ),
      submit(),
    ],
    implementation: [
      {
        write: {
          workspace: "repository",
          path: "src/feature.txt",
          content: "candidate feature\n",
        },
      },
      pub("manifest.md", "# Manifest\n\nimplementation\n"),
      {
        commit: {
          message: "implementation",
          paths: ["src/feature.txt", `${DIR}/manifest.md`],
        },
      },
      submit(),
    ],
    "evaluator-verify": verifySteps([["001", "PASS"]]),
    "as-built": [
      pub("as-built.md", "# As-Built\n\nNo discrepancies.\n"),
      pub("manifest.md", "# Manifest\n\nas-built\n"),
      commit("as-built", "as-built.md", "manifest.md"),
      submit(),
    ],
    outcome: [
      pub("outcome.md", "# Outcome\n\nCOMPLETE\n"),
      pub("manifest.md", "# Manifest\n\noutcome\n"),
      commit("outcome", "outcome.md", "manifest.md"),
      submit({ completionMode: "STANDARD" }),
    ],
    ...overrides,
  };
}

function git(root: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Fidelity fixture",
      GIT_AUTHOR_EMAIL: "fidelity@example.invalid",
      GIT_COMMITTER_NAME: "Fidelity fixture",
      GIT_COMMITTER_EMAIL: "fidelity@example.invalid",
    },
  }).trim();
}

// A disposable Harness project built from the candidate's real methodology,
// with its own test-only trust root, one workflow and a private evaluation
// workspace. It never touches Harness's own trusted history.
async function harness(t: TestContext, roles: Record<string, Step[]>) {
  const dir = mkdtempSync(join(tmpdir(), "harness-fidelity-"));
  t.after(() => {
    rmSync(dir, { recursive: true, force: true });
  });
  const root = join(dir, "project");
  const privateDir = join(dir, "evaluation-private");
  mkdirSync(join(root, DIR), { recursive: true });
  mkdirSync(join(root, "src/methodologies"), { recursive: true });
  mkdirSync(privateDir);
  cpSync("methodologies", join(root, "methodologies"), { recursive: true });
  rmSync(join(root, "methodologies/harness/trusted.jsonl"));
  for (const entry of Object.values(policy.roles))
    cpSync(entry.skill, join(root, entry.skill));
  cpSync(
    "src/methodologies/harness-public.ts",
    join(root, "src/methodologies/harness-public.ts"),
  );
  const validatorSources = {
    "prepared-coverage": "src/methodologies/harness-public.ts",
    "verification-accounting": "src/methodologies/harness-public.ts",
  };
  writeFileSync(
    join(root, "harness.project.json"),
    json({
      schemaVersion: 1,
      id: "fidelity",
      root: ".",
      policy: "methodologies/harness/policy.json",
      trustedHistory: "methodologies/harness/trusted.jsonl",
      validatorSources,
      workflowDirectory: "spikes",
      ledgerName: "workflow.jsonl",
      workspaces: {
        repository: {
          id: "fidelity-repository",
          path: ".",
          mode: "write",
          exposure: "public",
        },
      },
      remotes: {},
    }),
  );
  writeFileSync(join(root, DIR, "spike.md"), "# Demo spike\n\nAC1.\n");
  writeFileSync(join(root, ".gitignore"), `${DIR}/workflow.jsonl\n`);
  git(root, ["init", "-q", "-b", "main"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-q", "-m", "fixture project"]);
  const trusted = trustFixtureMethodology(root, {
    policy: "methodologies/harness/policy.json",
    methodologyPaths: ["methodologies/harness/contracts", "skills"],
    validatorSources,
    history: "methodologies/harness/trusted.jsonl",
  });
  const project = loadProject(join(root, "harness.project.json"));
  const workflow = project.workflows[WORKFLOW];
  assert.ok(workflow);
  workflow.workspaces = {
    repository: {
      id: "fidelity-repository",
      path: root,
      mode: "write",
      exposure: "public",
    },
    evaluation: {
      id: "fidelity-evaluation",
      path: privateDir,
      mode: "write",
      exposure: "evaluator-private",
    },
  };
  const evidence = join(dir, "provider");
  const scenarioPath = join(dir, "scenario.json");
  writeFileSync(scenarioPath, JSON.stringify({ evidence, roles }));
  const host = await startHarnessHost(0, {
    governed: {
      rootToken,
      project,
      executors: [claude],
      validators: harnessValidators,
      privateDataRoot: join(dir, "host-private"),
      providerRuntime: {
        locate: (program: string) => ({
          ok: true as const,
          path: `/opt/provider/${program}`,
        }),
        humanWaitMs: 2000,
        spawnProvider: ((
          program: string,
          args: readonly string[],
          options: object,
        ) =>
          spawn(
            process.execPath,
            [fakeProvider, scenarioPath, program, ...args],
            options,
          )) as unknown as typeof spawn,
      },
    },
  });
  t.after(() => host.close());
  const ledgerPath = join(root, DIR, "workflow.jsonl");
  // The response type is selected by the caller; fetch cannot infer it from a
  // route string or request body.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  const api = async <T>(
    path: string,
    body?: object,
  ): Promise<{ status: number; value: T }> => {
    const response = await fetch(`${host.url}/governed/${WORKFLOW}/${path}`, {
      headers: auth,
      ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, value: (await response.json()) as T };
  };
  const ledger = (): LedgerEvent[] =>
    existsSync(ledgerPath) ? readLedger(ledgerPath) : [];
  const transitions = (): string[] =>
    ledger()
      .map((event) => event.transition)
      .filter((name) => !name.startsWith("kernel."));
  const idle = (): boolean => {
    const events = ledger();
    const started = new Set(
      events
        .filter((event) => event.transition === "kernel.allocation")
        .map(
          (event) =>
            (event.evidence.execution as { id: string } | undefined)?.id ?? "",
        ),
    );
    for (const event of events)
      if (event.transition === "kernel.process") {
        const update = event.evidence.update as { process: string };
        if (!["allocated", "running"].includes(update.process))
          started.delete(event.evidence.execution as string);
      }
    return started.size === 0;
  };
  const settle = async (): Promise<void> => {
    const deadline = Date.now() + 60000;
    let quiet = 0;
    while (Date.now() < deadline) {
      quiet = idle() ? quiet + 1 : 0;
      if (quiet >= 6) return;
      await delay(100);
    }
    throw new Error(`workflow did not settle: ${transitions().join(", ")}`);
  };
  const grant = async (
    request: Record<string, unknown> = {},
  ): Promise<WorkflowGrant> => {
    const created = await api<{ grant: WorkflowGrant }>("grants", {
      continuation: true,
      delegation: ["spawned"],
      maxAllocations: 16,
      ...request,
    });
    assert.equal(created.status, 201, JSON.stringify(created.value));
    return created.value.grant;
  };
  const start = async (id: string): Promise<void> => {
    const started = await api("continue", {
      workflowGrant: id,
      mode: "spawned",
    });
    assert.equal(started.status, 201, JSON.stringify(started.value));
    await settle();
  };
  const resolved = async (
    id: string,
  ): Promise<{ kind: string; reason?: string }> =>
    (await api(`resolve/${id}`)).value as { kind: string; reason?: string };
  const providerRecords = (role: string) =>
    readdirSync(dir)
      .filter(
        (name) =>
          name.startsWith(`provider.${role}.`) && name.endsWith(".json"),
      )
      .sort()
      .map(
        (name) =>
          JSON.parse(readFileSync(join(dir, name), "utf8")) as {
            argv: string[];
            cwd: string;
            results?: Array<{
              structuredContent?: Record<string, unknown>;
              isError?: boolean;
              refused?: string;
              manifest?: { decisionIdentity: string; artifacts: unknown[] };
              response?: {
                structuredContent?: { action?: { status: string } };
                isError?: boolean;
              };
            }>;
          },
      );
  return {
    dir,
    root,
    privateDir,
    trusted,
    host,
    api,
    ledger,
    transitions,
    grant,
    start,
    settle,
    resolved,
    providerRecords,
    scenarioPath,
    evidence,
  };
}

function last(events: LedgerEvent[], transition: string): LedgerEvent {
  const event = events.findLast((item) => item.transition === transition);
  assert.ok(event, `missing ${transition}`);
  return event;
}

void test("014d AC01 (c): every real skill names its matrix operations, artifacts and result vocabulary", () => {
  assert.deepEqual(ROLES, Object.keys(MATRIX).sort());
  const matrixDoc = readFileSync(
    "spikes/014d-real-methodology-integration-extensible-skill-evolution/evidence/fidelity-matrix.md",
    "utf8",
  );
  for (const role of ROLES) {
    const entry = policy.roles[role];
    const row = MATRIX[role];
    assert.ok(entry && row, role);
    const skill = readFileSync(entry.skill, "utf8");
    const contract = JSON.parse(
      readFileSync(entry.contract, "utf8"),
    ) as RoleContract;
    for (const operation of row.operations) {
      assert.ok(WORKER_OPERATIONS.includes(operation as never), operation);
      assert.ok(
        skill.includes(`\`${operation}\``),
        `${role} names ${operation}`,
      );
    }
    for (const artifact of [...row.artifacts, ...contract.postconditions])
      assert.ok(skill.includes(artifact), `${role} names ${artifact}`);
    for (const value of [
      ...row.vocabulary,
      ...Object.values(contract.methodology).flat(),
    ])
      assert.ok(skill.includes(value), `${role} names ${value}`);
    assert.ok(contract.results.includes("succeeded"), role);
    for (const transition of row.transitions)
      assert.ok(
        entry.outcomes.some((outcome) => outcome.transition === transition) ||
          (transition === "promotion-recorded" &&
            contract.promotion?.transition === transition) ||
          (role === "as-built" && transition === "as-built-recorded"),
        `${role} routes ${transition}`,
      );
    // Only the evaluator roles are protected and hold the evaluation
    // workspace; every other role forbids evaluator-private exposure.
    assert.equal(
      contract.workspaces.includes("evaluation"),
      role.startsWith("evaluator-"),
      role,
    );
    if (!role.startsWith("evaluator-"))
      assert.ok(contract.forbiddenExposure.includes("evaluator-private"), role);
    // The human-reviewable matrix has a row for every role and its skill.
    assert.match(
      matrixDoc,
      new RegExp(`\\| \`${role}\` \\|[^\\n]*\`${entry.skill}\``),
      role,
    );
  }
  // One plan path and schema for skill, contract and utility.
  const verify = JSON.parse(
    readFileSync(
      "methodologies/harness/contracts/evaluator-verify.json",
      "utf8",
    ),
  ) as RoleContract;
  assert.equal(verify.promotion?.plan, PROMOTION_PLAN_PATH);
});

void test("014d AC01/AC03/AC05-scripted: one bounded grant carries all eight real roles through the production host; the human gate stops with its pending decision", async (t) => {
  const h = await harness(t, scripts());
  const grant = await h.grant();
  await h.start(grant.id);
  assert.deepEqual(h.transitions(), [
    "brief-frozen",
    "design-map-frozen",
    "evaluation-prepared",
    "implementation-handoff",
    "verification-allocated",
    "verification-finalized",
    "promotion-recorded",
    "as-built-recorded",
  ]);
  // No human request was needed between machine phases.
  assert.equal(
    h.ledger().filter((event) => event.transition === "kernel.human-request")
      .length,
    0,
  );
  // The real gate stops continuation and preserves the pending decision.
  const pending = await h.resolved(grant.id);
  assert.deepEqual(pending, {
    kind: "gate",
    reason: "human acceptance required",
  });

  // (a) Pinned bytes: each assignment delivered the exact trusted skill and
  // contract bytes that the fixture's trusted manifest records.
  const manifest = buildMethodologyManifest(
    h.root,
    h.trusted.revision,
    "methodologies/harness/policy.json",
    {
      validatorSources: {
        "prepared-coverage": "src/methodologies/harness-public.ts",
        "verification-accounting": "src/methodologies/harness-public.ts",
      },
    },
  ).manifest;
  assert.equal(manifest.id, h.trusted.methodology);
  for (const role of [
    "brief-readiness",
    "design-map",
    "evaluator-prepare",
    "implementation",
    "evaluator-verify",
    "as-built",
  ]) {
    const [record] = h.providerRecords(role);
    assert.ok(record, role);
    const assignment = record.results?.[0]?.structuredContent as {
      skill: { path: string; identity: string; content: string };
      contract: RoleContract;
      contractIdentity: string;
      roleGrant: { role: string; workspaces: Array<{ exposure: string }> };
    };
    const trusted = manifest.roles[role];
    assert.ok(trusted, role);
    assert.equal(assignment.roleGrant.role, role);
    assert.equal(
      assignment.skill.content,
      readFileSync(join(repository, trusted.skill.path), "utf8"),
    );
    assert.equal(assignment.skill.identity, trusted.skill.identity);
    assert.equal(assignment.contractIdentity, trusted.contract.identity);
    assert.equal(contentId(assignment.contract), trusted.contract.identity);
    // Non-evaluator roles never receive a private workspace; protected roles
    // launch inside theirs.
    const privateWorkspaces = assignment.roleGrant.workspaces.filter(
      (workspace) => workspace.exposure !== "public",
    );
    if (role.startsWith("evaluator-")) {
      assert.equal(privateWorkspaces.length, 1, role);
      assert.equal(record.cwd, h.privateDir, role);
    } else assert.equal(privateWorkspaces.length, 0, role);
    const system = record.argv[record.argv.indexOf("--system-prompt") + 1];
    assert.ok(system?.includes(assignment.skill.content), role);
  }

  // (b) Artifacts, commits and host-owned transitions.
  const events = h.ledger();
  for (const [transition, path] of [
    ["brief-frozen", "spike.md"],
    ["design-map-frozen", "design-map.md"],
    ["evaluation-prepared", "coverage-map.json"],
    ["verification-finalized", "verification-result.json"],
    ["as-built-recorded", "as-built.md"],
  ] as const) {
    const event = last(events, transition);
    const commitId = (event.evidence.artifactCommit ??
      event.evidence.commit) as string;
    assert.equal(
      event.evidence.identity,
      identity(
        execFileSync("git", ["show", `${commitId}:${DIR}/${path}`], {
          cwd: h.root,
        }),
      ),
      transition,
    );
  }
  const handoff = last(events, "implementation-handoff");
  assert.equal(
    git(h.root, [
      "show",
      `${handoff.evidence.commit as string}:src/feature.txt`,
    ]),
    "candidate feature",
  );
  // Real evaluator archival: plan -> manifest -> PASS -> one requestAction.
  const [verify] = h.providerRecords("evaluator-verify");
  const requested = verify?.results?.find((result) => result.manifest);
  assert.equal(
    requested?.response?.structuredContent?.action?.status,
    "succeeded",
  );
  const promotion = last(events, "promotion-recorded");
  const planBytes = readFileSync(join(h.privateDir, PROMOTION_PLAN_PATH));
  assert.equal(promotion.evidence.planIdentity, identity(planBytes));
  assert.ok(requested.manifest, "evaluator must request a promotion plan");
  assert.equal(requested.manifest.decisionIdentity, identity(planBytes));
  const evaluation = join(h.root, DIR, "evaluation");
  assert.deepEqual(
    readFileSync(join(evaluation, "promotion-plan.json")),
    planBytes,
  );
  for (const [destination, id] of Object.entries(
    promotion.evidence.artifacts as Record<string, string>,
  ))
    assert.equal(identity(readFileSync(join(evaluation, destination))), id);
  assert.equal(
    identity(readFileSync(join(evaluation, "promotion.json"))),
    promotion.evidence.promotionIdentity,
  );
  const result = JSON.parse(
    readFileSync(join(h.root, DIR, "verification-result.json"), "utf8"),
  ) as { promotionPlan: { identity: string; decision: string } };
  assert.deepEqual(result.promotionPlan, {
    identity: identity(planBytes),
    decision: "ELIGIBLE",
  });

  // The human decision is separate; Outcome follows it under the same grant.
  const accepted = await h.api<object>("decisions", {
    workflowGrant: grant.id,
    decision: "accept",
    evidence: {
      candidate: handoff.evidence.commit,
      verification: last(events, "verification-finalized").evidence
        .semanticResult,
      promotion: promotion.evidence.promotionIdentity,
      asBuilt: last(events, "as-built-recorded").evidence.semanticResult,
      cycle: "001",
    },
  });
  assert.equal(accepted.status, 201, JSON.stringify(accepted.value));
  await h.start(grant.id);
  const outcome = last(h.ledger(), "outcome-recorded");
  assert.equal(outcome.evidence.completionMode, "STANDARD");
  assert.deepEqual((await h.resolved(grant.id)).kind, "denied");
});

void test("014d AC01/AC07: readiness NOT_READY records readiness-blocked and gates; an explicit stop halts automatic continuation", async (t) => {
  const blocked = await harness(
    t,
    scripts({
      "brief-readiness": [
        pub("feedback.md", "# Readiness\n\nNot ready to freeze.\n"),
        pub("manifest.md", "# Manifest\n"),
        commit("readiness", "feedback.md", "manifest.md"),
        submit({ verdict: "NOT_READY" }),
      ],
    }),
  );
  const grant = await blocked.grant();
  await blocked.start(grant.id);
  assert.deepEqual(blocked.transitions(), ["readiness-blocked"]);
  // NOT_READY is a human gate: the unchanged brief is never re-reviewed
  // automatically. The brief is not frozen, so no later role can be
  // allocated either.
  assert.deepEqual(await blocked.resolved(grant.id), {
    kind: "gate",
    reason:
      "brief readiness is NOT_READY; revise the brief and re-review it only on explicit human authority",
  });
  const designMap = await blocked.api<{ kind: string }>(
    `resolve/${grant.id}?role=design-map`,
  );
  assert.notEqual(designMap.value.kind, "grant");
  assert.equal(
    blocked.ledger().filter((event) => event.transition === "kernel.allocation")
      .length,
    1,
  );

  const stopped = await harness(t, scripts());
  const bounded = await stopped.grant({ stopAfter: ["design-map-frozen"] });
  await stopped.start(bounded.id);
  assert.deepEqual(stopped.transitions(), [
    "brief-frozen",
    "design-map-frozen",
  ]);
  assert.deepEqual(await stopped.resolved(bounded.id), {
    kind: "stop",
    reason: "workflow stopping condition reached",
  });
});

void test("014d AC01/AC07: a result without its committed artifact keeps the semantic result and blocks the transition", async (t) => {
  const h = await harness(
    t,
    scripts({
      "design-map": [
        pub("design-map.md", "# Design Map\n"),
        pub("manifest.md", "# Manifest\n"),
        submit(),
      ],
    }),
  );
  const grant = await h.grant();
  await h.start(grant.id);
  assert.deepEqual(h.transitions(), ["brief-frozen"]);
  const blocked = h
    .ledger()
    .find((event) => event.transition === "kernel.transition-blocked");
  assert.match(
    String(blocked?.evidence.reason),
    /git show .*design-map\.md|committed provenance/,
  );
  const result = h
    .ledger()
    .filter((event) => event.transition === "kernel.result")
    .at(-1);
  assert.equal(result?.evidence.disposition, "succeeded");
});

// Runs the chain through a PASS whose promotion is scripted by `verify`, then
// returns the harness for assertions.
async function throughVerify(t: TestContext, verify: Step[]) {
  const h = await harness(t, scripts({ "evaluator-verify": verify }));
  const grant = await h.grant();
  await h.start(grant.id);
  return { h, grant };
}

async function assertIncompleteArchival(
  h: Awaited<ReturnType<typeof harness>>,
  grant: WorkflowGrant,
): Promise<void> {
  const events = h.ledger();
  // The genuine semantic PASS survives and is canonically finalized.
  assert.equal(last(events, "verification-finalized").evidence.result, "PASS");
  // Nothing fabricates archival or later completion.
  assert.ok(!events.some((event) => event.transition === "promotion-recorded"));
  assert.ok(!events.some((event) => event.transition === "as-built-recorded"));
  assert.ok(!existsSync(join(h.root, DIR, "evaluation", "promotion.json")));
  assert.deepEqual(await h.resolved(grant.id), {
    kind: "gate",
    reason:
      "verified PASS has no host-confirmed evaluator evidence promotion; archival is incomplete and needs recovery or an explicit process exception",
  });
}

void test("014d AC06: omitted, ineligible and refused-oversized promotion leave an authentic PASS with truthfully incomplete archival", async (t) => {
  for (const verify of [
    // Omitted request (or premature exit before it).
    verifySteps([["001", "PASS"]], { promotion: false }),
    // Explicit ineligible decision: never requested.
    verifySteps([["001", "PASS"]], { plan: "ineligible" }),
  ]) {
    const { h, grant } = await throughVerify(t, verify);
    await assertIncompleteArchival(h, grant);
    assert.equal(
      h.ledger().filter((event) => event.transition === "kernel.action-request")
        .length,
      0,
    );
  }
});

void test("014d AC06: wrong candidate, wrong attempt, omitted plan artifact and an over-bound request are denied without archival", async (t) => {
  for (const [promotion, expected] of [
    [{ candidate: "f".repeat(40) }, "denied"],
    [{ attempt: 7 }, "denied"],
    [{ omitPlan: true }, "denied"],
    [{ padTo: MAX_ACTION_ARTIFACTS + 1 }, "rejected"],
  ] as const) {
    const { h, grant } = await throughVerify(
      t,
      verifySteps([["001", "PASS"]], { promotion }),
    );
    await assertIncompleteArchival(h, grant);
    const [record] = h.providerRecords("evaluator-verify");
    const response = record?.results?.find(
      (result) => result.manifest,
    )?.response;
    if (expected === "rejected") {
      // The worker protocol schema bound refuses it before the host acts.
      assert.equal(response?.isError, true);
      assert.equal(
        h
          .ledger()
          .filter((event) => event.transition === "kernel.action-request")
          .length,
        0,
      );
    } else {
      assert.equal(response?.structuredContent?.action?.status, "denied");
      assert.ok(
        h
          .ledger()
          .some(
            (event) =>
              event.transition === "kernel.diagnostic" &&
              event.evidence.category === "action-denied",
          ),
      );
    }
  }
});

void test("014d AC06: a mutated source fails, and duplicate delivery never creates a second archive", async (t) => {
  const { h, grant } = await throughVerify(
    t,
    verifySteps([["001", "PASS"]], { requestTwice: true }),
  );
  const actions = h
    .ledger()
    .filter((event) => event.transition === "kernel.action-result");
  assert.deepEqual(
    actions.map((event) => event.evidence.status),
    ["succeeded", "failed"],
  );
  assert.match(String(actions[1]?.evidence.reason), /already exists/);
  assert.equal(
    h.ledger().filter((event) => event.transition === "promotion-recorded")
      .length,
    1,
  );
  // The duplicate delivery did not disturb the completed chain.
  assert.ok(h.transitions().includes("as-built-recorded"));
  assert.deepEqual(await h.resolved(grant.id), {
    kind: "gate",
    reason: "human acceptance required",
  });

  const mutated = await harness(
    t,
    scripts({
      "evaluator-verify": [
        ...verifySteps([["001", "PASS"]], { promotion: false }),
        // The attempt result changes after the plan recorded its identity.
        priv(".eval/attempts/001/eval-result.md", "changed after plan\n"),
        { promotion: { fromPlan: true } },
      ],
    }),
  );
  const mutatedGrant = await mutated.grant();
  await mutated.start(mutatedGrant.id);
  await assertIncompleteArchival(mutated, mutatedGrant);
  const [record] = mutated.providerRecords("evaluator-verify");
  assert.match(
    String(record?.results?.find((result) => result.refused)?.refused),
    /changed after planning/,
  );
});

void test("014d AC07: evaluator repair needs its exact trigger, preserves revision and attempt lineage, and archives the full history", async (t) => {
  const h = await harness(
    t,
    scripts({
      "evaluator-verify#1": verifySteps([["001", "BLOCKED"]], {
        classification: "EVALUATOR_DEFECT",
      }),
      "evaluator-repair": [
        ...revisionBundle("002"),
        pub("coverage-map.json", coverage("002")),
        pub("manifest.md", "# Manifest\n\nrepair\n"),
        commit("repair", "coverage-map.json", "manifest.md"),
        submit(),
      ],
      "evaluator-verify#2": verifySteps([
        ["001", "BLOCKED"],
        ["002", "PASS"],
      ]),
    }),
  );
  const grant = await h.grant();
  // Before any EVALUATOR_DEFECT, repair has no trigger and is not eligible.
  const early = await h.api<{ kind: string }>(
    `resolve/${grant.id}?role=evaluator-repair`,
  );
  assert.notEqual(early.value.kind, "grant");
  await h.start(grant.id);
  assert.deepEqual(h.transitions(), [
    "brief-frozen",
    "design-map-frozen",
    "evaluation-prepared",
    "implementation-handoff",
    "verification-allocated",
    "verification-finalized",
    "evaluator-repair-recorded",
    "verification-allocated",
    "verification-finalized",
    "promotion-recorded",
    "as-built-recorded",
  ]);
  const events = h.ledger();
  const allocations = events.filter(
    (event) => event.transition === "verification-allocated",
  );
  assert.deepEqual(
    allocations.map((event) => [
      event.evidence.attempt,
      event.evidence.evaluatorRevision,
    ]),
    [
      [1, "001"],
      [2, "002"],
    ],
  );
  // Revision 001 is preserved unchanged and both revisions are archived.
  assert.equal(
    readFileSync(join(h.privateDir, ".eval/revisions/001/freeze.json"), "utf8"),
    "freeze 001\n",
  );
  const promoted = Object.keys(
    last(events, "promotion-recorded").evidence.artifacts as Record<
      string,
      string
    >,
  ).sort();
  assert.deepEqual(promoted, [
    "attempt-ledger.json",
    "attempts/001/eval-result.md",
    "attempts/002/eval-result.md",
    "promotion-plan.json",
    "revisions/001/eval-spec.md",
    "revisions/001/freeze.json",
    "revisions/002/eval-spec.md",
    "revisions/002/freeze.json",
  ]);
  // The first finalized verification is never rewritten.
  const finals = events.filter(
    (event) => event.transition === "verification-finalized",
  );
  assert.deepEqual(
    finals.map((event) => [event.evidence.result, event.evidence.attempt]),
    [
      ["BLOCKED", 1],
      ["PASS", 2],
    ],
  );
});

void test("014d AC07: an IMPLEMENTATION_FAILURE binds its committed public feedback to the implementation retry, then a new attempt passes", async (t) => {
  const h = await harness(
    t,
    scripts({
      "evaluator-verify#1": verifySteps([["001", "FAIL"]], {
        classification: "IMPLEMENTATION_FAILURE",
      }),
      "evaluator-verify#2": verifySteps([
        ["001", "FAIL"],
        ["001", "PASS"],
      ]),
    }),
  );
  const grant = await h.grant();
  await h.start(grant.id);
  assert.deepEqual(h.transitions().slice(0, 11), [
    "brief-frozen",
    "design-map-frozen",
    "evaluation-prepared",
    "implementation-handoff",
    "verification-allocated",
    "verification-finalized",
    "implementation-handoff",
    "verification-allocated",
    "verification-finalized",
    "promotion-recorded",
    "as-built-recorded",
  ]);
  const retry = h.providerRecords("implementation")[1];
  const inputs = (
    retry?.results?.[0]?.structuredContent as { inputs: Record<string, string> }
  ).inputs;
  const failed = h
    .ledger()
    .find(
      (event) =>
        event.transition === "verification-finalized" &&
        event.evidence.result === "FAIL",
    );
  assert.equal(inputs.implementationFeedback, failed?.evidence.identity);
});

void test("014d AC07: Outcome follows only a real acceptance and truthfully reports an authorized process exception", async (t) => {
  const h = await harness(
    t,
    scripts({
      "evaluator-verify": verifySteps([["001", "PASS"]], { promotion: false }),
      outcome: [
        pub("outcome.md", "# Outcome\n\nCOMPLETE — PROCESS EXCEPTION\n"),
        pub("manifest.md", "# Manifest\n\noutcome\n"),
        commit("outcome", "outcome.md", "manifest.md"),
        submit({ completionMode: "PROCESS_EXCEPTION" }),
      ],
    }),
  );
  const grant = await h.grant();
  await h.start(grant.id);
  // Without promotion there is no As-Built and no ordinary acceptance.
  const refused = await h.api<{ error?: string }>("decisions", {
    workflowGrant: grant.id,
    decision: "accept",
    evidence: {},
  });
  assert.notEqual(refused.status, 201);
  const outcomeEarly = await h.api<{ kind: string }>(
    `resolve/${grant.id}?role=outcome`,
  );
  assert.notEqual(outcomeEarly.value.kind, "grant");
  // Test staging of explicit human exception authority and acceptance: the
  // current host exposes no production API for these events.
  const ledgerPath = join(h.root, DIR, "workflow.jsonl");
  const handoff = last(h.ledger(), "implementation-handoff");
  for (const [transition, evidence] of [
    ["process-exception-authorized", { reason: "fixture exception" }],
    [
      "process-exception-evidence-recorded",
      { evidenceIdentity: `sha256:${"3".repeat(64)}` },
    ],
    ["human-accepted", { candidate: handoff.evidence.commit }],
  ] as const)
    appendLedger(ledgerPath, transition, evidence);
  await h.start(grant.id);
  assert.equal(
    last(h.ledger(), "outcome-recorded").evidence.completionMode,
    "PROCESS_EXCEPTION",
  );
  assert.ok(
    !h.ledger().some((event) => event.transition === "promotion-recorded"),
  );
});

// TR6/C6: committed evidence names the exact candidate skill bytes and
// contract versions it expects to be exercised; those identities recompute.
void test("014d TR6: evidence skill identities and contract versions recompute from committed bytes", () => {
  const record = readFileSync(
    "spikes/014d-real-methodology-integration-extensible-skill-evolution/evidence/real-provider-runs.md",
    "utf8",
  );
  const rows = [
    ...record.matchAll(
      /`(skills\/[a-z-]+\/SKILL\.md)` \| (\d+) \| `([0-9a-f]{64})`/g,
    ),
  ];
  assert.deepEqual(
    rows.map((row) => row[1]).sort(),
    [
      ...new Set([
        ...Object.values(policy.roles).map((entry) => entry.skill),
        "skills/orchestrator/SKILL.md",
      ]),
    ].sort(),
  );
  for (const [, path = "", version, sha] of rows) {
    const bytes = readFileSync(path);
    assert.equal(identity(bytes), `sha256:${String(sha)}`, path);
    assert.match(
      bytes.toString("utf8"),
      new RegExp(`^Contract version: ${String(version)}$`, "m"),
      path,
    );
  }
});
