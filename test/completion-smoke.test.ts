import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";

import {
  assertCommittedTestTarget,
  evaluateCompletionFacts,
  outcomeAllocationPermitted,
  parseCompletionObligation,
  type CompletionCheckFacts,
  type CompletionCheckResult,
} from "../src/completion-smoke.ts";
import { ExecutionKernel } from "../src/kernel/execution.ts";
import {
  appendLedger,
  contentId,
  identity,
  required,
} from "../src/kernel/ledger.ts";
import { makeLaunchAttempt } from "../src/kernel/orchestration.ts";
import type {
  ExecutorProfile,
  MethodologyDefinition,
  Project,
  RoleContract,
  WorkflowPolicy,
} from "../src/kernel/model.ts";

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: "Completion fixture",
  GIT_AUTHOR_EMAIL: "completion@example.invalid",
  GIT_COMMITTER_NAME: "Completion fixture",
  GIT_COMMITTER_EMAIL: "completion@example.invalid",
};
function git(root: string, args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
      env,
    }).trim();
  } catch (error) {
    const completed = error as { status?: unknown; stdout?: unknown };
    if (completed.status === 0 && typeof completed.stdout === "string")
      return completed.stdout.trim();
    throw error;
  }
}
function repository(path: string, origin: string): string {
  mkdirSync(path, { recursive: true });
  git(path, ["init", "-q", "-b", "main"]);
  git(path, ["remote", "add", "origin", origin]);
  return path;
}
function contract(overrides: Partial<RoleContract> = {}): RoleContract {
  return {
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
    postconditions: [],
    ...overrides,
  };
}

const obligation = {
  schemaVersion: 1,
  kind: "split-coding-smoke",
  sourceWorkspace: "source",
  workflowWorkspace: "docs",
  testTarget: "test/smoke.test.js",
  evidenceDestination: "manifest.md",
} as const;

function fixture(
  t: TestContext,
  options: {
    declaration?: unknown;
    check?: CompletionCheckResult;
    readiness?: boolean;
    commandProfile?: boolean;
    unsafeArtifact?: boolean;
    alterDeclarationAfterFreeze?: boolean;
    sequence?: number;
    providerEvidence?: boolean;
    staleEvidence?: boolean;
    originDrift?: boolean;
    directEvidence?: boolean;
    noSourceChange?: boolean;
  } = {},
) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "completion-fixture-")));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const source = repository(
    join(root, "source"),
    "git@github.com:acme/completion-source.git",
  );
  const docs = repository(
    join(root, "docs"),
    "git@github.com:acme/completion-docs.git",
  );
  mkdirSync(join(source, "test"), { recursive: true });
  writeFileSync(
    join(source, "test/smoke.test.js"),
    [
      "const test=require('node:test');",
      "test('feature',()=>{require('../feature.js')})\n",
    ].join(""),
  );
  writeFileSync(join(source, "README.md"), "baseline\n");
  git(source, ["add", "."]);
  git(source, ["commit", "-q", "-m", "baseline"]);
  const baseline = git(source, ["rev-parse", "HEAD"]);
  const workflow = "001";
  const directory = join(docs, "spikes", workflow);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "spike.md"), "# Frozen brief\n");
  writeFileSync(join(directory, "manifest.md"), "# Manifest\n");
  if (options.declaration !== null)
    writeFileSync(
      join(directory, "completion-obligation.json"),
      `${JSON.stringify(options.declaration ?? obligation, null, 2)}\n`,
    );
  git(docs, ["add", "."]);
  git(docs, ["commit", "-q", "-m", "workflow"]);

  const brief = contract({
    methodology: { verdict: ["READY"] },
    postconditions: ["spike.md"],
  });
  const implementation = contract({
    postconditions: ["manifest.md"],
    workflowEvidence: { destinations: ["manifest.md"] },
  });
  const outcome = contract({
    inputs: [
      {
        name: "declaration",
        event: "completion-obligation-declared",
        field: "identity",
        optional: true,
      },
      {
        name: "completionRecord",
        event: "completion-smoke-recorded",
        field: "recordIdentity",
        optional: true,
      },
      {
        name: "processException",
        event: "process-exception-evidence-recorded",
        field: "evidenceIdentity",
        optional: true,
      },
    ],
    methodology: { completionMode: ["STANDARD", "PROCESS_EXCEPTION"] },
    postconditions: ["outcome.md"],
  });
  const policy: WorkflowPolicy = {
    schemaVersion: 1,
    roles: {
      "brief-readiness": {
        contract: "brief.json",
        skill: "brief.md",
        when: { not: { event: "brief-frozen" } },
        retry: { dispositions: ["failed"], limit: 1 },
        outcomes: [
          {
            disposition: "succeeded",
            methodology: { verdict: "READY" },
            transition: "brief-frozen",
            evidence: { artifact: "spike.md" },
          },
        ],
      },
      implementation: {
        contract: "implementation.json",
        skill: "implementation.md",
        when: {
          all: [
            { event: "brief-frozen" },
            { not: { event: "implementation-handoff" } },
          ],
        },
        retry: { dispositions: ["failed"], limit: 1 },
        outcomes: [
          {
            disposition: "succeeded",
            transition: "implementation-handoff",
            evidence: { commitHead: true },
          },
        ],
      },
      outcome: {
        contract: "outcome.json",
        skill: "outcome.md",
        when: {
          all: [
            { event: "implementation-handoff" },
            { not: { event: "outcome-recorded" } },
          ],
        },
        retry: { dispositions: ["failed"], limit: 2 },
        outcomes: [
          {
            disposition: "succeeded",
            methodology: { completionMode: "STANDARD" },
            transition: "outcome-recorded",
            evidence: { artifact: "outcome.md" },
          },
          {
            disposition: "succeeded",
            methodology: { completionMode: "PROCESS_EXCEPTION" },
            transition: "outcome-recorded",
            evidence: { artifact: "outcome.md" },
          },
        ],
      },
    },
    gates: [],
    maxAllocations: 6,
  };
  const bound = (name: string, value: RoleContract) => ({
    policy: required(policy.roles[name]),
    contract: value,
    contractIdentity: contentId(value),
    skill: { path: `${name}.md`, identity: identity(name), content: name },
  });
  const definitionBody: Omit<MethodologyDefinition, "id"> = {
    schemaVersion: 1,
    policyIdentity: contentId(policy),
    policy,
    roles: {
      "brief-readiness": bound("brief-readiness", brief),
      implementation: bound("implementation", implementation),
      outcome: bound("outcome", outcome),
    },
    validators: {},
  };
  const definition: MethodologyDefinition = {
    ...definitionBody,
    id: contentId(definitionBody),
  };
  const project: Project = {
    schemaVersion: 1,
    id: "completion-project",
    root: source,
    policy: "unused.json",
    origin: "github.com/acme/completion-source",
    workflowWorkspace: "workflow",
    workflowOrigin: "github.com/acme/completion-docs",
    workflows: {
      [workflow]: { directory: `spikes/${workflow}`, ledger: "workflow.jsonl" },
    },
    workspaces: {
      repository: {
        id: "source",
        path: source,
        mode: "write",
        exposure: "public",
      },
      workflow: { id: "docs", path: docs, mode: "write", exposure: "public" },
    },
    remotes: {},
  };
  const profile: ExecutorProfile = {
    id: "codex-production",
    provider: "codex",
    modes: ["attached", "spawned"],
    capabilities: implementation.capabilities,
    isolation: ["private-workspace"],
    available: true,
    ...(options.commandProfile
      ? { command: [process.execPath, "fixture.js"] }
      : {}),
  };
  const passing = (base: string, candidate: string): CompletionCheckResult => ({
    satisfying: true,
    reason: null,
    baseline: facts(base, 1),
    final: facts(candidate, 0),
  });
  let trustedSequence = options.sequence ?? 8;
  const kernel = new ExecutionKernel({
    project,
    executors: [profile],
    methodologySource: () => definition,
    methodologyBinding: () => ({
      methodologyRepository: source,
      trusted: {
        sequence: trustedSequence,
        manifest: definition.id,
        revision: baseline,
      },
      runtime: { repository: source, commit: baseline },
    }),
    completionRunner: (input) =>
      options.check ?? passing(input.baseline, input.candidate),
  });
  const grant = kernel.authorize(workflow, {
    continuation: true,
    delegation: ["attached", "spawned"],
    roles: ["brief-readiness", "implementation", "outcome"],
    maxAllocations: 6,
    inline: true,
  });
  const session = kernel.register(workflow, profile.id).session;
  return {
    root,
    source,
    docs,
    workflow,
    directory,
    baseline,
    kernel,
    grant,
    session,
    settings: options,
    adoptSequenceEight: () => {
      trustedSequence = 8;
    },
  };
}

function facts(commit: string, exitCode: number): CompletionCheckFacts {
  return {
    commit,
    outcome: "exited",
    exitCode,
    signal: null,
    timedOut: false,
    outputOverflow: false,
    outputIdentity: "sha256:" + "0".repeat(64),
  };
}

function freezeAndImplement(
  f: ReturnType<typeof fixture>,
  readiness = true,
  implementationMode: "spawned" | "attached" = "spawned",
) {
  const brief = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "brief-readiness",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, brief.execution.id, "running", 100);
  const frozen = f.kernel.result(f.workflow, brief.execution.id, "succeeded", {
    verdict: "READY",
  });
  assert.equal(
    frozen.transition?.status,
    "recorded",
    frozen.transition?.reason ?? "brief freeze blocked",
  );
  f.kernel.process(f.workflow, brief.execution.id, "exited");
  if (f.settings.alterDeclarationAfterFreeze)
    writeFileSync(
      join(f.directory, "completion-obligation.json"),
      `${JSON.stringify(
        { ...obligation, testTarget: "late.test.js" },
        null,
        2,
      )}\n`,
    );
  const launch = makeLaunchAttempt({
    workflowGrant: f.grant.id,
    role: "implementation",
    mode: "spawned",
    predecessor: null,
    launchIntent: "sha256:" + "1".repeat(64),
    shapeIdentity: "sha256:" + "2".repeat(64),
    shapeSummary: {
      role: "implementation",
      capabilities: [],
      workspaces: [],
      forbiddenExposure: [],
      protected: false,
      containment: "bwrap",
      executor: {},
    },
    adapter: "codex",
    runtimeGeneration: "sha256:" + "3".repeat(64),
    ordinal: 1,
    readiness: "passed",
    compatibility: "not-applicable",
    outcome: "ready",
    failure: null,
    effective: {},
    readinessIdentity: "sha256:" + "4".repeat(64),
    consumed: false,
  });
  if (readiness && implementationMode === "spawned") {
    f.kernel.recordLaunchAttempt(f.workflow, launch);
    f.kernel.consumeReadiness(
      f.workflow,
      launch.id,
      launch.launchIntent,
      launch.shapeIdentity,
    );
  }
  const run = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "implementation",
    session: f.session.id,
    mode: implementationMode,
    ...(implementationMode === "spawned"
      ? {
          contained: true,
          executorPlan: { model: "gpt-5", reasoning: "medium" },
          ...(f.settings.providerEvidence === false
            ? {}
            : {
                providerLaunch: {
                  launchAttempt: launch.id,
                  adapter: "codex" as const,
                  provenance: "adapter-double" as const,
                },
              }),
        }
      : { inline: true }),
  });
  f.kernel.process(f.workflow, run.execution.id, "running", 101);
  const action = f.settings.directEvidence
    ? undefined
    : f.kernel.recordEvidence(f.workflow, run.execution.id, [
        {
          destination: "manifest.md",
          content: "# Manifest\n\nimplementation\n",
        },
      ]);
  if (action) assert.equal(action.status, "succeeded", action.reason ?? "");
  else {
    writeFileSync(join(f.directory, "manifest.md"), "# Manifest\n\ndirect\n");
    git(f.docs, ["add", "spikes/001/manifest.md"]);
    git(f.docs, ["commit", "-q", "-m", "direct docs write"]);
  }
  if (f.settings.staleEvidence) {
    writeFileSync(join(f.directory, "unrelated.md"), "later docs checkpoint\n");
    git(f.docs, ["add", "spikes/001/unrelated.md"]);
    git(f.docs, ["commit", "-q", "-m", "later docs checkpoint"]);
  }
  if (f.settings.originDrift)
    (f.kernel.project as { workflowOrigin?: string }).workflowOrigin =
      "github.com/acme/drifted-docs";
  if (!f.settings.noSourceChange) {
    writeFileSync(join(f.source, "feature.js"), "module.exports=true\n");
    git(f.source, ["add", "feature.js"]);
    git(f.source, ["commit", "-q", "-m", "implement feature"]);
  }
  if (f.settings.unsafeArtifact)
    mkdirSync(join(f.directory, "completion-smoke.json"));
  const result = f.kernel.result(f.workflow, run.execution.id, "succeeded", {});
  assert.equal(
    result.transition?.status,
    f.settings.directEvidence ? "blocked" : "recorded",
  );
  f.kernel.process(f.workflow, run.execution.id, "exited");
  return { run, action, candidate: git(f.source, ["rev-parse", "HEAD"]) };
}

void test("completion declaration is closed and rejects unsafe or mismatched values", (t) => {
  const f = fixture(t);
  assert.deepEqual(
    parseCompletionObligation(JSON.stringify(obligation), f.kernel.project),
    obligation,
  );
  assert.doesNotThrow(() => {
    assertCommittedTestTarget(f.source, f.baseline, {
      ...obligation,
      workingDirectory: "application",
    });
  });
  assert.throws(() => {
    assertCommittedTestTarget(f.source, f.baseline, {
      ...obligation,
      testTarget: "test/missing.test.js",
    });
  });
  for (const bad of [
    { ...obligation, extra: true },
    { ...obligation, evidenceDestination: "other.md" },
    { ...obligation, testTarget: "../escape.test.js" },
    { ...obligation, sourceWorkspace: "unknown" },
    { ...obligation, workflowWorkspace: "unknown" },
    { ...obligation, workingDirectory: "/tmp" },
    { ...obligation, testTarget: "test/smoke.txt" },
  ])
    assert.throws(() =>
      parseCompletionObligation(JSON.stringify(bad), f.kernel.project),
    );
});

void test("bounded check semantics require baseline exit 1 and final exit 0", () => {
  const base = facts("a".repeat(40), 1);
  const final = facts("b".repeat(40), 0);
  assert.equal(evaluateCompletionFacts(base, final).satisfying, true);
  for (const bad of [
    { ...base, exitCode: 0 },
    { ...base, exitCode: 2 },
    { ...base, signal: "SIGKILL" },
    { ...base, timedOut: true },
    { ...base, outputOverflow: true },
    { ...base, outcome: "spawn-error" as const, exitCode: null },
    {
      ...base,
      outcome: "timeout" as const,
      exitCode: null,
      timedOut: true,
    },
    {
      ...base,
      outcome: "overflow" as const,
      exitCode: null,
      outputOverflow: true,
    },
    {
      ...base,
      outcome: "signal" as const,
      exitCode: null,
      signal: "SIGKILL",
    },
  ])
    assert.equal(evaluateCompletionFacts(bad, final).satisfying, false);
  for (const bad of [
    { ...final, exitCode: 1 },
    { ...final, signal: "SIGTERM" },
    { ...final, timedOut: true },
    { ...final, outputOverflow: true },
    { ...final, outcome: "spawn-error" as const, exitCode: null },
    {
      ...final,
      outcome: "timeout" as const,
      exitCode: null,
      timedOut: true,
    },
    {
      ...final,
      outcome: "overflow" as const,
      exitCode: null,
      outputOverflow: true,
    },
    {
      ...final,
      outcome: "signal" as const,
      exitCode: null,
      signal: "SIGTERM",
    },
  ])
    assert.equal(evaluateCompletionFacts(base, bad).satisfying, false);
});

void test("sequence-8 handoff creates one bound completion attempt and success record", (t) => {
  const f = fixture(t);
  const completed = freezeAndImplement(f);
  const events = f.kernel.events(f.workflow);
  const declarations = events.filter(
    (event) => event.transition === "completion-obligation-declared",
  );
  const attempts = events.filter(
    (event) => event.transition === "completion-smoke-attempted",
  );
  const records = events.filter(
    (event) => event.transition === "completion-smoke-recorded",
  );
  assert.equal(declarations.length, 1);
  assert.equal(attempts.length, 1);
  const attempt = required(attempts[0]);
  assert.equal(
    attempt.evidence.satisfying,
    true,
    JSON.stringify(attempt.evidence.reason ?? "completion was non-satisfying"),
  );
  assert.equal(records.length, 1);
  const valid = required(records[0]);
  assert.equal(valid.evidence.candidate, completed.candidate);
  assert.equal(valid.evidence.providerProvenance, "adapter-double");
  assert.equal(completed.run.execution.executor?.confirmed.model, null);
  assert.equal(valid.evidence.workflowEvidenceCommit, completed.action?.after);
  assert.ok(
    readFileSync(join(f.directory, "completion-smoke.json"), "utf8").includes(
      completed.candidate,
    ),
  );
  f.kernel.finalizeCompletionSmoke(f.workflow);
  assert.equal(
    f.kernel
      .events(f.workflow)
      .filter((event) => event.transition === "completion-smoke-attempted")
      .length,
    1,
  );
  assert.equal(
    f.kernel.inspect(f.workflow, f.grant.id, "outcome").kind,
    "grant",
  );
  appendLedger(f.kernel.path(f.workflow), "completion-smoke-recorded", {
    ...valid.evidence,
    recordIdentity: "sha256:" + "f".repeat(64),
  });
  assert.equal(
    f.kernel.inspect(f.workflow, f.grant.id, "outcome").kind,
    "denied",
  );
});

void test("post-freeze working-tree declaration changes cannot alter the recorded obligation", (t) => {
  const f = fixture(t, { alterDeclarationAfterFreeze: true });
  freezeAndImplement(f);
  const declared = f.kernel
    .events(f.workflow)
    .findLast((event) => event.transition === "completion-obligation-declared");
  assert.equal(
    (declared?.evidence.declaration as { testTarget?: string }).testTarget,
    obligation.testTarget,
  );
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "completion-smoke-recorded"),
    true,
  );
});

void test("stale brokered evidence and configured origin drift remain non-satisfying", (t) => {
  const stale = fixture(t, { staleEvidence: true });
  freezeAndImplement(stale);
  assert.match(
    String(
      stale.kernel
        .events(stale.workflow)
        .findLast((event) => event.transition === "completion-smoke-attempted")
        ?.evidence.reason,
    ),
    /exact brokered manifest checkpoint|workflow checkpoint is stale/,
  );

  const drifted = fixture(t, { originDrift: true });
  freezeAndImplement(drifted);
  assert.match(
    String(
      drifted.kernel
        .events(drifted.workflow)
        .findLast((event) => event.transition === "completion-smoke-attempted")
        ?.evidence.reason,
    ),
    /methodology\/runtime\/origin binding drifted|origin mismatch/,
  );
});

void test("direct docs writes and an unchanged source candidate cannot satisfy completion", (t) => {
  const direct = fixture(t, { directEvidence: true });
  freezeAndImplement(direct);
  assert.equal(
    direct.kernel
      .events(direct.workflow)
      .some((event) => event.transition === "implementation-handoff"),
    false,
  );

  const unchanged = fixture(t, { noSourceChange: true });
  freezeAndImplement(unchanged);
  const attempt = required(
    unchanged.kernel
      .events(unchanged.workflow)
      .findLast((event) => event.transition === "completion-smoke-attempted"),
  );
  assert.equal(attempt.evidence.satisfying, false);
  const reason = attempt.evidence.reason;
  if (typeof reason !== "string") assert.fail("attempt reason is missing");
  assert.match(reason, /no source commit advance/);
});

void test("fake provider profiles, missing readiness, and failed checks remain non-satisfying", (t) => {
  const missing = fixture(t, { readiness: false });
  freezeAndImplement(missing, false);
  let events = missing.kernel.events(missing.workflow);
  assert.equal(
    events.findLast(
      (event) => event.transition === "completion-smoke-attempted",
    )?.evidence.satisfying,
    false,
  );

  const profileOnly = fixture(t, { providerEvidence: false });
  freezeAndImplement(profileOnly);
  events = profileOnly.kernel.events(profileOnly.workflow);
  assert.match(
    String(
      events.findLast(
        (event) => event.transition === "completion-smoke-attempted",
      )?.evidence.reason,
    ),
    /registered-provider launch provenance/,
  );
  assert.equal(
    events.some((event) => event.transition === "completion-smoke-recorded"),
    false,
  );

  const failed = fixture(t, {
    check: { satisfying: false, reason: "containment failure" },
  });
  freezeAndImplement(failed);
  events = failed.kernel.events(failed.workflow);
  assert.equal(
    events.findLast(
      (event) => event.transition === "completion-smoke-attempted",
    )?.evidence.reason,
    "containment failure",
  );
  assert.equal(
    events.some((event) => event.transition === "completion-smoke-recorded"),
    false,
  );

  const fake = fixture(t, { commandProfile: true });
  freezeAndImplement(fake);
  events = fake.kernel.events(fake.workflow);
  assert.match(
    String(
      events.findLast(
        (event) => event.transition === "completion-smoke-attempted",
      )?.evidence.reason,
    ),
    /production registered-provider/,
  );

  const inline = fixture(t);
  freezeAndImplement(inline, false, "attached");
  events = inline.kernel.events(inline.workflow);
  assert.match(
    String(
      events.findLast(
        (event) => event.transition === "completion-smoke-attempted",
      )?.evidence.reason,
    ),
    /contained spawned implementation/,
  );

  const checkpoint = fixture(t, { unsafeArtifact: true });
  freezeAndImplement(checkpoint);
  events = checkpoint.kernel.events(checkpoint.workflow);
  assert.match(
    String(
      events.findLast(
        (event) => event.transition === "completion-smoke-attempted",
      )?.evidence.reason,
    ),
    /destination is unsafe/,
  );
  assert.equal(
    events.some((event) => event.transition === "completion-smoke-recorded"),
    false,
  );
});

void test("malformed declarations fail brief freeze closed", (t) => {
  const f = fixture(t, { declaration: { ...obligation, unexpected: true } });
  const run = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "brief-readiness",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, run.execution.id, "running", 104);
  const result = f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    verdict: "READY",
  });
  const transition = required(result.transition);
  assert.equal(transition.status, "blocked");
  assert.match(transition.reason ?? "", /unknown field/);
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "brief-frozen"),
    false,
  );

  const predecessor = fixture(t, { sequence: 7 });
  const predecessorRun = predecessor.kernel.allocate(
    predecessor.workflow,
    predecessor.grant.id,
    {
      role: "brief-readiness",
      session: predecessor.session.id,
      mode: "attached",
      inline: true,
    },
  );
  predecessor.kernel.process(
    predecessor.workflow,
    predecessorRun.execution.id,
    "running",
    107,
  );
  const rejected = predecessor.kernel.result(
    predecessor.workflow,
    predecessorRun.execution.id,
    "succeeded",
    { verdict: "READY" },
  );
  const rejectedTransition = required(rejected.transition);
  assert.equal(rejectedTransition.status, "blocked");
  assert.match(rejectedTransition.reason ?? "", /fresh sequence-8/);
});

void test("Outcome requires current smoke for STANDARD and preserves explicit exception allocation", (t) => {
  const f = fixture(t, {
    check: { satisfying: false, reason: "test failed" },
  });
  freezeAndImplement(f);
  assert.equal(
    outcomeAllocationPermitted(
      f.kernel.events(f.workflow),
      f.kernel.project,
      f.workflow,
    ),
    false,
  );
  assert.equal(
    f.kernel.inspect(f.workflow, f.grant.id, "outcome").kind,
    "denied",
  );
  appendLedger(f.kernel.path(f.workflow), "process-exception-authorized", {
    authority: "human",
  });
  appendLedger(
    f.kernel.path(f.workflow),
    "process-exception-evidence-recorded",
    { evidenceIdentity: "sha256:" + "e".repeat(64) },
  );
  assert.equal(
    f.kernel.inspect(f.workflow, f.grant.id, "outcome").kind,
    "grant",
  );
  const run = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "outcome",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, run.execution.id, "running", 102);
  writeFileSync(join(f.directory, "outcome.md"), "PROCESS EXCEPTION\n");
  git(f.docs, ["add", "spikes/001/outcome.md"]);
  git(f.docs, ["commit", "-q", "-m", "outcome"]);
  const standard = f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    completionMode: "STANDARD",
  });
  assert.equal(standard.transition?.status, "blocked");
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "outcome-recorded"),
    false,
  );
});

void test("authorized PROCESS_EXCEPTION records the outstanding obligation without smoke success", (t) => {
  const f = fixture(t, {
    check: { satisfying: false, reason: "pilot unavailable" },
  });
  freezeAndImplement(f);
  appendLedger(f.kernel.path(f.workflow), "process-exception-authorized", {
    authority: "human",
    reason: "bounded fixture exception",
  });
  appendLedger(
    f.kernel.path(f.workflow),
    "process-exception-evidence-recorded",
    { evidenceIdentity: "sha256:" + "d".repeat(64) },
  );
  const run = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "outcome",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, run.execution.id, "running", 105);
  writeFileSync(
    join(f.directory, "outcome.md"),
    "COMPLETE — PROCESS EXCEPTION\n\nOutstanding: split-coding-smoke\n",
  );
  git(f.docs, ["add", "spikes/001/outcome.md"]);
  git(f.docs, ["commit", "-q", "-m", "exception outcome"]);
  const result = f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    completionMode: "PROCESS_EXCEPTION",
  });
  assert.equal(
    result.transition?.status,
    "recorded",
    result.transition?.reason ?? "",
  );
  const recorded = f.kernel
    .events(f.workflow)
    .findLast((event) => event.transition === "outcome-recorded");
  assert.equal(recorded?.evidence.completionMode, "PROCESS_EXCEPTION");
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "completion-smoke-recorded"),
    false,
  );
});

void test("STANDARD Outcome records only with the current completion snapshot", (t) => {
  const f = fixture(t);
  freezeAndImplement(f);
  const run = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "outcome",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, run.execution.id, "running", 106);
  writeFileSync(join(f.directory, "outcome.md"), "COMPLETE — STANDARD\n");
  git(f.docs, ["add", "spikes/001/outcome.md"]);
  git(f.docs, ["commit", "-q", "-m", "standard outcome"]);
  const result = f.kernel.result(f.workflow, run.execution.id, "succeeded", {
    completionMode: "STANDARD",
  });
  assert.equal(
    result.transition?.status,
    "recorded",
    result.transition?.reason ?? "",
  );
});

void test("absent declaration preserves legacy behavior", (t) => {
  const f = fixture(t, { declaration: null });
  const brief = f.kernel.allocate(f.workflow, f.grant.id, {
    role: "brief-readiness",
    session: f.session.id,
    mode: "attached",
    inline: true,
  });
  f.kernel.process(f.workflow, brief.execution.id, "running", 103);
  f.kernel.result(f.workflow, brief.execution.id, "succeeded", {
    verdict: "READY",
  });
  assert.equal(
    f.kernel
      .events(f.workflow)
      .some((event) => event.transition === "completion-obligation-declared"),
    false,
  );
  assert.equal(outcomeAllocationPermitted(f.kernel.events(f.workflow)), true);
});

void test("methodology adoption is forward-only for workflow grants", (t) => {
  const f = fixture(t, { declaration: null, sequence: 7 });
  assert.equal(required(f.grant.source).trusted.sequence, 7);
  f.adoptSequenceEight();
  const fresh = f.kernel.authorize(f.workflow, {
    continuation: true,
    delegation: ["attached", "spawned"],
    roles: ["brief-readiness", "implementation", "outcome"],
    maxAllocations: 6,
    inline: true,
  });
  assert.equal(required(f.grant.source).trusted.sequence, 7);
  assert.equal(required(fresh.source).trusted.sequence, 8);
});

void test("later source or workflow checkpoints make a completion record non-current", (t) => {
  const sourceDrift = fixture(t);
  freezeAndImplement(sourceDrift);
  writeFileSync(join(sourceDrift.source, "later.js"), "module.exports=2\n");
  git(sourceDrift.source, ["add", "later.js"]);
  git(sourceDrift.source, ["commit", "-q", "-m", "later source"]);
  assert.equal(
    sourceDrift.kernel.inspect(
      sourceDrift.workflow,
      sourceDrift.grant.id,
      "outcome",
    ).kind,
    "denied",
  );

  const docsDrift = fixture(t);
  freezeAndImplement(docsDrift);
  writeFileSync(join(docsDrift.directory, "later.md"), "later\n");
  git(docsDrift.docs, ["add", "spikes/001/later.md"]);
  git(docsDrift.docs, ["commit", "-q", "-m", "later docs"]);
  assert.equal(
    docsDrift.kernel.inspect(docsDrift.workflow, docsDrift.grant.id, "outcome")
      .kind,
    "denied",
  );

  const laterHandoff = fixture(t);
  freezeAndImplement(laterHandoff);
  const prior = laterHandoff.kernel
    .events(laterHandoff.workflow)
    .findLast((event) => event.transition === "implementation-handoff");
  appendLedger(
    laterHandoff.kernel.path(laterHandoff.workflow),
    "implementation-handoff",
    { ...prior?.evidence, execution: "later-execution" },
  );
  assert.equal(
    laterHandoff.kernel.inspect(
      laterHandoff.workflow,
      laterHandoff.grant.id,
      "outcome",
    ).kind,
    "denied",
  );
});
