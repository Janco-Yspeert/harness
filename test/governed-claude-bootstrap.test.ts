import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { claudeWorkflowDirectory } from "../src/claude-workflow.ts";
import type { ResolvedWorkflowRunSpec } from "../src/workflow-run.ts";
import {
  bootstrapPermissionProfile,
  bootstrapConfigurationPresence,
  bootstrapProviderEnvironment,
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

void test("bootstrap forwards only configuration discovery and overrides scratch paths", () => {
  const environment = {
    PATH: "/provider/bin",
    HOME: "/home/provider",
    USER: "provider",
    LOGNAME: "provider-login",
    LANG: "en_ZA.UTF-8",
    LC_ALL: "C",
    CLAUDE_CONFIG_DIR: "/private/claude-config",
    XDG_CONFIG_HOME: "/private/config",
    TMPDIR: "/ambient/tmp",
    XDG_CACHE_HOME: "/ambient/cache",
    ANTHROPIC_API_KEY: "must-not-forward",
    HARNESS_ROOT_TOKEN: "must-not-forward",
    HARNESS_SESSION_TOKEN: "must-not-forward",
    HTTPS_PROXY: "must-not-forward",
    UNRELATED: "must-not-forward",
  } as NodeJS.ProcessEnv;
  assert.deepEqual(
    bootstrapProviderEnvironment(environment, "/fixture/scratch"),
    {
      PATH: "/provider/bin",
      HOME: "/home/provider",
      USER: "provider",
      LOGNAME: "provider-login",
      LANG: "en_ZA.UTF-8",
      LC_ALL: "C",
      CLAUDE_CONFIG_DIR: "/private/claude-config",
      XDG_CONFIG_HOME: "/private/config",
      TMPDIR: "/fixture/scratch",
      TMP: "/fixture/scratch",
      TEMP: "/fixture/scratch",
      XDG_CACHE_HOME: "/fixture/scratch/cache",
      npm_config_cache: "/fixture/scratch/npm-cache",
      npm_config_update_notifier: "false",
    },
  );
  assert.deepEqual(bootstrapConfigurationPresence(environment), {
    PATH: true,
    HOME: true,
    USER: true,
    LOGNAME: true,
    LANG: true,
    LC_ALL: true,
    CLAUDE_CONFIG_DIR: true,
    XDG_CONFIG_HOME: true,
  });
});

void test("unknown structured errors retain only safe shape, identifiers and digests", () => {
  const stdout = JSON.stringify({
    type: "result",
    subtype: "unrecognized_provider_error",
    error: {
      type: "bootstrap_transport_failure",
      code: "E_BOOTSTRAP_42",
      message: "private evaluator output must not be retained",
    },
  });
  const metadata = providerFailureMetadata(1, stdout, "");
  assert.deepEqual(metadata, {
    exitCode: 1,
    stdout: "present",
    stderr: "empty",
    source: "structured-stdout",
    category: "unknown",
    structure: {
      fields: ["type", "subtype", "error", "error.type", "error.code"],
      identifiers: {
        type: "result",
        subtype: "unrecognized_provider_error",
        "error.type": "bootstrap_transport_failure",
        "error.code": "E_BOOTSTRAP_42",
      },
      stdoutBytes: Buffer.byteLength(stdout),
      stderrBytes: 0,
      stdoutDigest: `sha256:${createHash("sha256").update(stdout).digest("hex")}`,
      stderrDigest: `sha256:${createHash("sha256").update("").digest("hex")}`,
    },
  });
  assert.doesNotMatch(JSON.stringify(metadata), /private evaluator output/);
});
