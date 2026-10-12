import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { buildGovernedClaudeCommand } from "../src/claude-workflow.ts";
import {
  containedLaunch,
  locateContainment,
} from "../src/executors/containment.ts";
import { hostEvidenceBinders } from "../src/executors/evidence-bindings.ts";
import { identity, required } from "../src/kernel/ledger.ts";

void test("operator hotfix binds Claude filesystem authority to the host", () => {
  const command = buildGovernedClaudeCommand({
    workspaces: [
      { path: "/work/repository", mode: "read" },
      { path: "/work/evaluation", mode: "write" },
    ],
    capabilities: ["repository-read", "local-computation"],
    workerOperations: ["assignment", "submitResult", "requestAction"],
    scratch: "/work/scratch",
    mcpConfig: "{}",
    system: "system",
    prompt: "prompt",
    unattendedProtected: true,
  });
  const settings = JSON.parse(
    command[command.indexOf("--settings") + 1] ?? "null",
  ) as {
    permissions: { blockReadsOutsideWorkingDirectories: boolean };
    sandbox: { filesystem: unknown; network: unknown; credentials: unknown };
  };
  assert.equal(settings.permissions.blockReadsOutsideWorkingDirectories, false);
  assert.deepEqual(settings.sandbox.filesystem, { disabled: true });
  assert.ok(settings.sandbox.network);
  assert.ok(settings.sandbox.credentials);
});

void test("operator hotfix publishes and enforces the verification accounting projection", (t) => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "hotfix-accounting-")));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const workflow = join(root, "spike");
  mkdirSync(workflow);
  const coverage = `${JSON.stringify({
    readiness: {
      evaluatorRevision: "001",
      privateInventoryIdentity: `sha256:${"0".repeat(64)}`,
      validatorResultBinding: `sha256:${"1".repeat(64)}`,
      integrityValidation: "PASS",
    },
    criteria: [
      {
        id: "AC01",
        frozenAuthority: "spike.md AC01",
        mode: "PUBLIC_REGRESSION",
        required: true,
        procedures: ["P1"],
        sufficiency: "P1 proves AC01.",
      },
    ],
  })}\n`;
  writeFileSync(join(workflow, "coverage-map.json"), coverage);
  const candidate = "c".repeat(40);
  const bound = required(hostEvidenceBinders["verification-accounting"]).bind({
    projectRoot: root,
    workflowDirectory: "spike",
    inputs: {
      coverage: identity(Buffer.from(coverage)),
      candidate,
      evaluatorRevision: "001",
    },
    terminalOutcomes: [
      {
        disposition: "succeeded",
        methodology: { result: "PASS" },
        requiredMethodology: [],
        allowedMethodology: {},
      },
      {
        disposition: "succeeded",
        methodology: { result: "BLOCKED" },
        requiredMethodology: ["classification"],
        allowedMethodology: {
          classification: ["INFRASTRUCTURE_FAILURE"],
        },
      },
    ],
  });
  const properties = bound.schema.properties as Record<string, unknown>;
  assert.deepEqual(properties.commit, { const: candidate });
  assert.deepEqual(properties.evaluatorRevision, { const: "001" });
  assert.doesNotThrow(() => {
    bound.validate({
      schemaVersion: 1,
      commit: candidate,
      evaluatorRevision: "001",
      result: "PASS",
      coverageResults: { AC01: "SATISFIED" },
    });
  });
  assert.throws(() => {
    bound.validate({
      schemaVersion: 1,
      candidate,
      evaluatorRevision: "001",
      result: "BLOCKED",
      classification: "AUTHENTICATION_FAILURE",
      coverage: { AC01: "not-run" },
    });
  }, /identity mismatch|allowed classification/);
});

void test("operator hotfix preserves read-only repository and private write mounts", (t) => {
  const located = locateContainment([]);
  assert.ok(located.ok);
  const root = realpathSync(mkdtempSync(join(tmpdir(), "hotfix-containment-")));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  const repository = join(root, "repository");
  const evaluation = join(root, "evaluation");
  const scratch = join(root, "scratch");
  const bin = join(root, "bin");
  for (const path of [repository, evaluation, scratch, bin]) mkdirSync(path);
  writeFileSync(join(repository, "visible"), "yes\n");
  const program = join(bin, "claude");
  writeFileSync(
    program,
    `#!/bin/sh
test "$(cat '${repository}/visible')" = yes
! touch '${repository}/denied' 2>/dev/null
touch '${evaluation}/allowed'
`,
  );
  chmodSync(program, 0o755);
  const launch = containedLaunch({
    bwrap: located.path,
    provider: "claude",
    program,
    args: [],
    cwd: repository,
    workspaces: [
      { path: repository, mode: "read" },
      { path: evaluation, mode: "write" },
    ],
    scratch,
    nodePath: process.execPath,
    toolFiles: [],
    masked: [],
    protectedRoots: [],
    env: { PATH: "/usr/bin:/bin" },
  });
  const result = spawnSync(launch.program, launch.args, {
    env: launch.env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(evaluation, "allowed")).length, 0);
  assert.equal(existsSync(join(repository, "denied")), false);
});
