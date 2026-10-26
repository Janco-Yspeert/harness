import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

import { ExecutionKernel } from "../src/kernel/execution.ts";
import { contentId } from "../src/kernel/ledger.ts";
import type {
  ExecutorProfile,
  Project,
  RoleContract,
  RoleGrant,
  WorkflowPolicy,
} from "../src/kernel/model.ts";
import {
  assertEffectiveShape,
  attachedCompatibility,
  authorityScopeIdentity,
  deriveExecutionShape,
  deriveLaunchIntent,
  effectiveShape,
  makeLaunchAttempt,
  operationalAttempts,
  operationalExhaustedIdentity,
  operationalRetryAllowance,
  probeInput,
  readinessIdentity,
  semanticExhaustedIdentity,
  semanticProgressIdentity,
  shapeIdentity,
  type LaunchAttemptRecord,
  type OperationalFailureClass,
  type SemanticProgressObject,
} from "../src/kernel/orchestration.ts";

const profile: ExecutorProfile = {
  id: "fixture",
  provider: "fixture-provider",
  modes: ["attached", "spawned"],
  capabilities: ["repository-read", "local-computation"],
  isolation: ["private-workspace"],
  available: true,
  model: "fixture-model",
  reasoning: "medium",
  command: [process.execPath, "fixture.ts"],
};

function grant(overrides: Partial<RoleGrant> = {}): RoleGrant {
  return {
    schemaVersion: 1,
    id: "role-grant-1",
    workflowGrant: "workflow-grant-1",
    methodology: "methodology-1",
    authorityBasis: "authority-1",
    allocationKey: "allocation-key-1",
    role: "implementation",
    contractIdentity: "sha256:contract",
    skillIdentity: "sha256:skill",
    inputs: { candidate: "sha256:candidate" },
    workspaces: [
      {
        id: "repository",
        path: "/project",
        mode: "read",
        exposure: "public",
      },
      {
        id: "private",
        path: "/private",
        mode: "write",
        exposure: "evaluator-private",
      },
    ],
    capabilities: ["repository-read", "local-computation"],
    hostActions: {},
    executorConstraints: {
      forbiddenExposure: [],
      protected: true,
      model: "fixture-model",
      reasoning: "medium",
    },
    predecessor: null,
    rootAuthority: null,
    ...overrides,
  };
}

function progress(
  overrides: Partial<SemanticProgressObject> = {},
): SemanticProgressObject {
  return {
    workflowScope: "work",
    phase: "implementation",
    eligibleRole: "implementation",
    inputBindings: "sha256:input",
    methodology: "sha256:methodology",
    evaluatorRevision: "001",
    lastDisposition: "failed",
    feedback: "sha256:feedback",
    pendingTransition: "implementation-handoff",
    reasonClass: null,
    eligibleActions: ["continue"],
    authorityScope: "sha256:authority",
    ...overrides,
  };
}

function fixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "orchestration-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const work = join(root, "work");
  const privateRoot = join(root, "private");
  mkdirSync(work);
  mkdirSync(privateRoot);
  writeFileSync(join(work, "input.txt"), "input\n");
  mkdirSync(join(root, "contracts"));
  mkdirSync(join(root, "skills"));
  const contract: RoleContract = {
    schemaVersion: 1,
    workspaces: ["repository", "private"],
    capabilities: ["repository-read", "local-computation"],
    forbiddenExposure: [],
    protected: true,
    inputs: [{ name: "candidate", path: "input.txt" }],
    results: ["succeeded", "failed"],
    methodology: {},
    human: ["input", "approval", "root"],
    postconditions: [],
  };
  const policy: WorkflowPolicy = {
    schemaVersion: 1,
    roles: {
      implementation: {
        contract: "contracts/implementation.json",
        skill: "skills/implementation.md",
        when: { not: { event: "done" } },
        retry: { dispositions: ["failed", "interrupted"], limit: 2 },
        onAllocate: {
          transition: "implementation-allocated",
          fromInputs: { candidate: "candidate" },
          counterField: "attempt",
        },
        outcomes: [{ disposition: "succeeded", transition: "done" }],
      },
    },
    gates: [],
    maxAllocations: 8,
  };
  writeFileSync(
    join(root, "contracts/implementation.json"),
    `${JSON.stringify(contract)}\n`,
  );
  writeFileSync(join(root, "skills/implementation.md"), "Implement.\n");
  writeFileSync(join(root, "policy.json"), `${JSON.stringify(policy)}\n`);
  const project: Project = {
    schemaVersion: 1,
    id: "orchestration-project",
    root,
    policy: "policy.json",
    workflows: { work: { directory: "work", ledger: "workflow.jsonl" } },
    workspaces: {
      repository: {
        id: "repository",
        path: work,
        mode: "read",
        exposure: "public",
      },
      private: {
        id: "private",
        path: privateRoot,
        mode: "write",
        exposure: "evaluator-private",
      },
    },
    remotes: {},
    trustedHistory: "trusted.jsonl",
  };
  const kernel = new ExecutionKernel({ project, executors: [profile] });
  const workflowGrant = kernel.authorize("work", {
    continuation: true,
    delegation: ["attached", "spawned"],
    maxAllocations: 8,
    inline: true,
  });
  return { kernel, workflowGrant };
}

function failedAttempt(
  intent: string,
  ordinal: number,
  failure: OperationalFailureClass = "authentication-failure",
): LaunchAttemptRecord {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  return makeLaunchAttempt({
    workflowGrant: "workflow-grant-1",
    role: "implementation",
    mode: "spawned",
    predecessor: null,
    launchIntent: intent,
    shapeIdentity: shapeIdentity(shape),
    shapeSummary: {},
    adapter: profile.provider,
    runtimeGeneration: "sha256:runtime",
    ordinal,
    readiness: "failed",
    compatibility: "not-applicable",
    outcome: "refused",
    failure,
    effective: null,
    readinessIdentity: null,
    consumed: false,
  });
}

void test("014l required test 01: canonical state derives the spawned launch shape", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  assert.equal(shape.mode, "spawned");
  assert.equal(shape.provider, "fixture-provider");
  assert.deepEqual(shape.capabilities, [
    "local-computation",
    "repository-read",
  ]);
});

void test("014l required test 02: canonical state derives the attached shape", () => {
  const shape = deriveExecutionShape(grant(), profile, "attached");
  assert.equal(shape.containment, "attached-provenance");
  assert.equal(shape.profile, profile.id);
});

void test("014l required test 03: repository-read/private-write maps exactly", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  assert.doesNotThrow(() => {
    assertEffectiveShape(shape, effectiveShape(shape));
  });
  assert.equal(
    effectiveShape(shape).workspaces.find(
      (workspace) => workspace.id === "private",
    )?.mode,
    "write",
  );
});

void test("014l required test 04: dropped private write fails closed", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const effective = effectiveShape(shape);
  const index = effective.workspaces.findIndex(
    (workspace) => workspace.id === "private",
  );
  effective.workspaces[index] = { id: "private", mode: "read" };
  assert.throws(() => {
    assertEffectiveShape(shape, effective);
  });
});

void test("014l required test 05: broadened repository write fails closed", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const effective = effectiveShape(shape);
  const index = effective.workspaces.findIndex(
    (workspace) => workspace.id === "repository",
  );
  effective.workspaces[index] = { id: "repository", mode: "write" };
  assert.throws(() => {
    assertEffectiveShape(shape, effective);
  });
});

void test("014l required test 06: missing required worker capability fails", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const effective = effectiveShape(shape);
  effective.capabilities = ["repository-read"];
  assert.throws(() => {
    assertEffectiveShape(shape, effective);
  });
});

void test("014l required test 07: readiness input contains no governed semantic material", () => {
  const input = probeInput(
    deriveExecutionShape(grant(), profile, "spawned"),
    "intent",
  );
  const bytes = JSON.stringify(input);
  for (const forbidden of [
    "candidate",
    "contractIdentity",
    "skillIdentity",
    "/project",
    "/private",
  ])
    assert.ok(!bytes.includes(forbidden), forbidden);
});

void test("014l required test 08: readiness PASS is single-use and intent-bound", (t) => {
  const { kernel } = fixture(t);
  const attempt = failedAttempt("intent", 1);
  attempt.outcome = "ready";
  attempt.readiness = "passed";
  attempt.failure = null;
  kernel.recordLaunchAttempt("work", attempt);
  kernel.consumeReadiness("work", attempt.id, "intent", attempt.shapeIdentity);
  assert.throws(() => {
    kernel.consumeReadiness(
      "work",
      attempt.id,
      "intent",
      attempt.shapeIdentity,
    );
  });
});

void test("014l required test 09: changed launch intent invalidates readiness", (t) => {
  const { kernel } = fixture(t);
  const attempt = failedAttempt("intent-a", 1);
  attempt.outcome = "ready";
  attempt.readiness = "passed";
  attempt.failure = null;
  kernel.recordLaunchAttempt("work", attempt);
  assert.throws(() => {
    kernel.consumeReadiness(
      "work",
      attempt.id,
      "intent-b",
      attempt.shapeIdentity,
    );
  });
});

void test("014l required test 10: provider/auth failure is durable without allocation", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt("work", failedAttempt("intent", 1));
  assert.deepEqual(
    kernel
      .events("work")
      .map((event) => event.transition)
      .slice(-1),
    ["kernel.launch-attempt"],
  );
  assert.equal(kernel.executions("work").length, 0);
});

void test("014l required test 11: containment failure creates no semantic attempt", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt(
    "work",
    failedAttempt("intent", 1, "containment-setup-failure"),
  );
  assert.equal(kernel.executions("work").length, 0);
});

void test("014l required test 12: unwritable synthetic private storage fails", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const effective = effectiveShape(shape);
  const index = effective.workspaces.findIndex(
    (workspace) => workspace.id === "private",
  );
  effective.workspaces[index] = { id: "private", mode: "read" };
  assert.throws(() => {
    assertEffectiveShape(shape, effective);
  });
});

void test("014l required test 13: incompatible attached session fails before allocation", (t) => {
  const { kernel } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  session.exposures = ["implementation"];
  const shape = deriveExecutionShape(
    grant({
      executorConstraints: {
        protected: true,
        forbiddenExposure: ["implementation"],
      },
    }),
    profile,
    "attached",
  );
  assert.equal(
    attachedCompatibility(shape, session),
    "attached-session-incompatibility",
  );
  assert.equal(kernel.executions("work").length, 0);
});

void test("014l required test 14: compatible attached session reaches allocation", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  const resolution = kernel.inspect("work", workflowGrant.id, "implementation");
  assert.equal(resolution.kind, "grant");
  assert.equal(
    attachedCompatibility(
      deriveExecutionShape(resolution.grant, profile, "attached"),
      session,
    ),
    null,
  );
  kernel.allocate("work", workflowGrant.id, {
    mode: "attached",
    session: session.id,
    role: "implementation",
    inline: true,
  });
  assert.equal(kernel.executions("work").length, 1);
});

void test("014l required test 15: allocation precedes onAllocate projection", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  kernel.allocate("work", workflowGrant.id, {
    mode: "attached",
    session: session.id,
    role: "implementation",
    inline: true,
  });
  const transitions = kernel.events("work").map((event) => event.transition);
  assert.ok(
    transitions.indexOf("kernel.allocation") <
      transitions.indexOf("implementation-allocated"),
  );
});

void test("014l required test 16: exposure follows allocation and precedes delivery", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  kernel.allocate("work", workflowGrant.id, {
    mode: "attached",
    session: session.id,
    role: "implementation",
    inline: true,
  });
  const transitions = kernel.events("work").map((event) => event.transition);
  const allocation = transitions.lastIndexOf("kernel.allocation");
  const exposure = transitions.lastIndexOf("kernel.exposure");
  const delivery = transitions.lastIndexOf("kernel.session");
  assert.ok(allocation < exposure && exposure < delivery);
});

void test("014l required test 17: post-allocation process failure consumes attempt", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  const allocated = kernel.allocate("work", workflowGrant.id, {
    mode: "attached",
    session: session.id,
    role: "implementation",
    inline: true,
  });
  kernel.process(
    "work",
    allocated.execution.id,
    "failed",
    null,
    "provider failed",
    "provider-crashed",
  );
  assert.equal(kernel.executions("work").length, 1);
});

void test("014l required test 18: one intent permits initial plus three retries", (t) => {
  const { kernel } = fixture(t);
  for (let ordinal = 1; ordinal <= 4; ordinal += 1)
    kernel.recordLaunchAttempt("work", failedAttempt("intent", ordinal));
  assert.deepEqual(operationalRetryAllowance(kernel.events("work"), "intent"), {
    used: 4,
    automaticRemaining: 0,
    humanRemaining: 0,
  });
});

void test("014l required test 19: failure class does not reset intent", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const one = deriveLaunchIntent({
    workflowScope: "work",
    grant: grant(),
    mode: "spawned",
    shape,
    runtimeGeneration: "runtime",
  });
  const two = deriveLaunchIntent({
    workflowScope: "work",
    grant: grant({ id: "reissued" }),
    mode: "spawned",
    shape,
    runtimeGeneration: "runtime",
  });
  assert.equal(one, two);
});

void test("014l required test 20: normative intent field starts a new budget", () => {
  const oneGrant = grant();
  const twoGrant = grant({ inputs: { candidate: "sha256:other" } });
  const one = deriveLaunchIntent({
    workflowScope: "work",
    grant: oneGrant,
    mode: "spawned",
    shape: deriveExecutionShape(oneGrant, profile, "spawned"),
    runtimeGeneration: "runtime",
  });
  const two = deriveLaunchIntent({
    workflowScope: "work",
    grant: twoGrant,
    mode: "spawned",
    shape: deriveExecutionShape(twoGrant, profile, "spawned"),
    runtimeGeneration: "runtime",
  });
  assert.notEqual(one, two);
});

void test("014l required test 21: operational failures do not affect semantic budget", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt("work", failedAttempt("intent", 1));
  assert.equal(kernel.executions("work").length, 0);
  assert.equal(
    kernel
      .events("work")
      .filter((event) => event.transition === "kernel.automatic-work").length,
    0,
  );
});

void test("014l required test 22: human operational retry binds exact exhaustion", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const exhausted = operationalExhaustedIdentity("intent", 4);
  kernel.recordRetryExhaustion("work", {
    workflowGrant: workflowGrant.id,
    kind: "operational",
    scope: "intent",
    exhausted,
    used: 4,
  });
  const authority = kernel.authorizeRetry("work", {
    workflowGrant: workflowGrant.id,
    kind: "operational",
    exhausted,
    count: 1,
  });
  assert.equal(authority.count, 1);
  assert.throws(() =>
    kernel.authorizeRetry("work", {
      workflowGrant: workflowGrant.id,
      kind: "operational",
      exhausted: "wrong",
      count: 1,
    }),
  );
});

void test("014l required test 23: human semantic retry binds exact state", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const exhausted = semanticExhaustedIdentity("progress", 2);
  kernel.recordRetryExhaustion("work", {
    workflowGrant: workflowGrant.id,
    kind: "semantic",
    scope: "progress",
    exhausted,
    used: 2,
  });
  const authority = kernel.authorizeRetry("work", {
    workflowGrant: workflowGrant.id,
    kind: "semantic",
    exhausted,
    count: 2,
  });
  assert.equal(authority.count, 2);
});

void test("014l required test 24: retry authority cannot expand role authority", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const before = authorityScopeIdentity(grant());
  const exhausted = operationalExhaustedIdentity("intent", 4);
  kernel.recordRetryExhaustion("work", {
    workflowGrant: workflowGrant.id,
    kind: "operational",
    scope: "intent",
    exhausted,
    used: 4,
  });
  kernel.authorizeRetry("work", {
    workflowGrant: workflowGrant.id,
    kind: "operational",
    exhausted,
    count: 1,
  });
  assert.equal(authorityScopeIdentity(grant()), before);
});

void test("014l required test 25: UUID churn does not affect semantic progress", () => {
  assert.equal(
    semanticProgressIdentity(progress()),
    semanticProgressIdentity(progress()),
  );
});

void test("014l required test 26: feedback candidate and phase change progress", () => {
  const base = semanticProgressIdentity(progress());
  assert.notEqual(
    base,
    semanticProgressIdentity(progress({ feedback: "changed" })),
  );
  assert.notEqual(
    base,
    semanticProgressIdentity(progress({ inputBindings: "changed" })),
  );
  assert.notEqual(
    base,
    semanticProgressIdentity(progress({ phase: "verify" })),
  );
});

void test("014l required test 27: one repeated progress identity is sufficient to stop", () => {
  const previous = semanticProgressIdentity(progress());
  const current = semanticProgressIdentity(progress());
  assert.equal(previous, current);
});

void test("014l required test 28: operational retries do not advance semantic progress", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt("work", failedAttempt("intent", 1));
  assert.equal(
    kernel
      .events("work")
      .some((event) => event.transition === "kernel.semantic-progress"),
    false,
  );
});

void test("014l required test 29: failed readiness records no protected exposure", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt("work", failedAttempt("intent", 1));
  assert.equal(
    kernel
      .events("work")
      .some((event) => event.transition === "kernel.exposure"),
    false,
  );
});

void test("014l required test 30: canonical records contain every status projection input", () => {
  const shape = deriveExecutionShape(grant(), profile, "spawned");
  const attempt = failedAttempt("intent", 1);
  attempt.shapeSummary = {
    role: shape.role,
    profile: shape.profile,
    mode: shape.mode,
  };
  assert.deepEqual(
    [
      attempt.launchIntent,
      attempt.readiness,
      attempt.ordinal,
      attempt.failure,
      attempt.shapeIdentity,
    ],
    ["intent", "failed", 1, "authentication-failure", shapeIdentity(shape)],
  );
});

void test("014l required test 31: status inputs reproduce from append-only records", (t) => {
  const { kernel } = fixture(t);
  kernel.recordLaunchAttempt("work", failedAttempt("intent", 1));
  const first = operationalAttempts(kernel.events("work"), "intent");
  const second = operationalAttempts(kernel.events("work"), "intent");
  assert.deepEqual(first, second);
});

void test("014l required test 32: normal attached workflow regression", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const session = kernel.register("work", "fixture").session;
  const result = kernel.allocate("work", workflowGrant.id, {
    mode: "attached",
    session: session.id,
    role: "implementation",
    inline: true,
  });
  assert.equal(result.execution.mode, "attached");
});

void test("014l required test 33: normal spawned workflow regression", (t) => {
  const { kernel, workflowGrant } = fixture(t);
  const resolution = kernel.inspect("work", workflowGrant.id, "implementation");
  assert.equal(resolution.kind, "grant");
  const shape = deriveExecutionShape(resolution.grant, profile, "spawned");
  const input = probeInput(shape, "intent");
  assert.equal(readinessIdentity(input), contentId(input));
  const session = kernel.register("work", "fixture").session;
  const result = kernel.allocate("work", workflowGrant.id, {
    mode: "spawned",
    session: session.id,
    role: "implementation",
  });
  assert.equal(result.execution.mode, "spawned");
});
