import assert from "node:assert/strict";
import test from "node:test";

import { claudeWorkflowDirectory } from "../src/claude-workflow.ts";
import type { ResolvedWorkflowRunSpec } from "../src/workflow-run.ts";
import {
  bootstrapPermissionProfile,
  bootstrapWorkspaceSelection,
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
