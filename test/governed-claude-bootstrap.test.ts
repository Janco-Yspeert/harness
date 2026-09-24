import assert from "node:assert/strict";
import test from "node:test";

import { claudeWorkflowDirectory } from "../src/claude-workflow.ts";
import type { ResolvedWorkflowRunSpec } from "../src/workflow-run.ts";
import {
  bootstrapPermissionProfile,
  bootstrapWorkspaceSelection,
  providerFailureMetadata,
} from "../tools/governed-claude-bootstrap.ts";

void test("the pre-correction implementation fixture reproduces the missing workspace", () => {
  const preCorrection = {
    permissionProfile: {
      id: "evaluator",
      workspaces: ["/fixture/repository"],
    },
    contract: { deliveryMode: "claude-system-contract" },
  } as unknown as ResolvedWorkflowRunSpec;

  assert.equal(claudeWorkflowDirectory(preCorrection), undefined);
});

void test("evaluator roles retain the private evaluator workspace", () => {
  assert.equal(bootstrapPermissionProfile("evaluator-prepare"), "evaluator");
  assert.equal(
    bootstrapWorkspaceSelection("evaluator-prepare", [
      "/fixture/repository",
      "/fixture/evaluator-private",
    ]),
    "/fixture/evaluator-private",
  );
});

void test("implementation roles use their granted repository workspace", () => {
  assert.equal(
    bootstrapPermissionProfile("implementation"),
    "repo-local-worker",
  );
  assert.equal(
    bootstrapWorkspaceSelection("implementation", ["/fixture/repository"]),
    "/fixture/repository",
  );
});

void test("bootstrap diagnostics retain allowlisted structured provider errors only", () => {
  assert.deepEqual(
    providerFailureMetadata(
      1,
      JSON.stringify({
        type: "error",
        error: { type: "authentication_error", message: "do not retain me" },
      }),
      "",
    ),
    {
      exitCode: 1,
      stdout: "present",
      stderr: "empty",
      source: "structured-stdout",
      category: "authentication",
      code: "authentication_error",
    },
  );
});

void test("bootstrap diagnostics do not preserve unstructured provider output", () => {
  assert.deepEqual(
    providerFailureMetadata(1, "private model prose", "provider failed"),
    {
      exitCode: 1,
      stdout: "present",
      stderr: "present",
      source: "stderr",
      category: "unknown",
    },
  );
});
