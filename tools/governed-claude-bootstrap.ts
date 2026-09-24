import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildClaudeWorkflowCommand } from "../src/claude-workflow.ts";
import { workflowScratchEnvironment } from "../src/workflow-backend.ts";
import type { ResolvedWorkflowRunSpec } from "../src/workflow-run.ts";

// This is a deliberately narrow, human-authorized bootstrap executor for
// Spike 014c. It exists only to launch the pre-014c pinned Claude evaluator
// while the production governed adapters are the candidate under evaluation.
// It is not a general executor registry, does not write workflow authority,
// and is selected only by an explicitly named bootstrap profile.
const WORKFLOW = "014c-governed-executor-integration";
const MAX_DIAGNOSTIC_BYTES = 8_192;
const DIAGNOSTIC_ROOT = "/tmp/harness-014c-private/bootstrap-diagnostics";

type Json = Record<string, unknown>;

type ProviderFailureCategory =
  | "authentication"
  | "permission"
  | "configuration"
  | "sandbox"
  | "provider"
  | "unknown";

export interface ProviderFailureMetadata {
  readonly exitCode: number | null;
  readonly stdout: "empty" | "present";
  readonly stderr: "empty" | "present";
  readonly source: "structured-stdout" | "stderr" | "none";
  readonly category: ProviderFailureCategory;
  readonly code?: string;
  readonly structure?: UnknownStructuredFailureMetadata;
}

export interface UnknownStructuredFailureMetadata {
  readonly fields: readonly string[];
  readonly identifiers: Readonly<Record<string, string>>;
  readonly stdoutBytes: number;
  readonly stderrBytes: number;
  readonly stdoutDigest: string;
  readonly stderrDigest: string;
}

const PROVIDER_ERROR_CODES = new Map<string, ProviderFailureCategory>([
  ["authentication_error", "authentication"],
  ["invalid_api_key", "authentication"],
  ["permission_error", "permission"],
  ["configuration_error", "configuration"],
  ["invalid_request_error", "configuration"],
  ["sandbox_error", "sandbox"],
  ["error_during_execution", "provider"],
  ["rate_limit_error", "provider"],
  ["overloaded_error", "provider"],
]);

const CONFIGURATION_DISCOVERY_VARIABLES = [
  "PATH",
  "HOME",
  "USER",
  "LOGNAME",
  "LANG",
  "LC_ALL",
  "CLAUDE_CONFIG_DIR",
  "XDG_CONFIG_HOME",
] as const;

type ConfigurationDiscoveryVariable =
  (typeof CONFIGURATION_DISCOVERY_VARIABLES)[number];

const STRUCTURED_FAILURE_FIELDS = ["type", "subtype", "code", "error"];
const STRUCTURED_ERROR_FIELDS = ["type", "code"];
const IDENTIFIER = /^[A-Za-z0-9_.:-]{1,128}$/;

export function bootstrapPermissionProfile(
  role: string,
): "evaluator" | "repo-local-worker" {
  return role.startsWith("evaluator-") ? "evaluator" : "repo-local-worker";
}

export function bootstrapWorkspaceSelection(
  role: string,
  workspaces: readonly string[],
): string | undefined {
  return bootstrapPermissionProfile(role) === "evaluator"
    ? workspaces[1]
    : workspaces[0];
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`missing ${name}`);
  return value;
}

function digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function object(value: unknown, name: string): Json {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name} must be an object`);
  return value as Json;
}

function text(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0)
    throw new Error(`${name} must be a nonempty string`);
  return value;
}

function bounded(value: string): string {
  return value
    .slice(-MAX_DIAGNOSTIC_BYTES)
    .replaceAll(/(?:Bearer\s+|HARNESS_SESSION_TOKEN=)[^\s"']+/g, "[redacted]");
}

export function bootstrapProviderEnvironment(
  environment: NodeJS.ProcessEnv,
  scratch: string,
): Record<string, string> {
  const forwarded: Record<string, string> = {};
  for (const name of CONFIGURATION_DISCOVERY_VARIABLES) {
    const value = environment[name];
    if (value !== undefined) forwarded[name] = value;
  }
  return { ...forwarded, ...workflowScratchEnvironment(scratch) };
}

export function bootstrapConfigurationPresence(
  environment: NodeJS.ProcessEnv,
): Record<ConfigurationDiscoveryVariable, boolean> {
  return Object.fromEntries(
    CONFIGURATION_DISCOVERY_VARIABLES.map((name) => [
      name,
      environment[name] !== undefined,
    ]),
  ) as Record<ConfigurationDiscoveryVariable, boolean>;
}

function providerErrorCode(value: unknown): string | undefined {
  return typeof value === "string" && PROVIDER_ERROR_CODES.has(value)
    ? value
    : undefined;
}

function boundedIdentifier(value: unknown): string | undefined {
  return typeof value === "string" && IDENTIFIER.test(value)
    ? value
    : undefined;
}

function unknownStructuredFailureMetadata(
  envelope: Json,
  error: Json | undefined,
  stdout: string,
  stderr: string,
): UnknownStructuredFailureMetadata {
  const fields = STRUCTURED_FAILURE_FIELDS.filter(
    (field) => envelope[field] !== undefined,
  );
  if (error !== undefined) {
    fields.push(
      ...STRUCTURED_ERROR_FIELDS.filter(
        (field) => error[field] !== undefined,
      ).map((field) => `error.${field}`),
    );
  }
  const identifiers: Record<string, string> = {};
  for (const [field, value] of [
    ["type", envelope.type],
    ["subtype", envelope.subtype],
    ["code", envelope.code],
    ["error.type", error?.type],
    ["error.code", error?.code],
  ] as const) {
    const identifier = boundedIdentifier(value);
    if (identifier !== undefined) identifiers[field] = identifier;
  }
  return {
    fields,
    identifiers,
    stdoutBytes: Buffer.byteLength(stdout),
    stderrBytes: Buffer.byteLength(stderr),
    stdoutDigest: digest(stdout),
    stderrDigest: digest(stderr),
  };
}

// A nonzero Claude process can still emit a structured error on stdout. Keep
// only a deliberately small provider vocabulary: stdout may otherwise contain
// evaluator instructions, model prose, or other material that must never
// escape the private evaluator boundary.
export function providerFailureMetadata(
  exitCode: number | null,
  stdout: string,
  stderr: string,
): ProviderFailureMetadata {
  let code: string | undefined;
  let structured = false;
  let structure: UnknownStructuredFailureMetadata | undefined;
  try {
    const envelope = object(JSON.parse(stdout), "Claude failure output");
    structured = true;
    const error =
      envelope.error !== null &&
      typeof envelope.error === "object" &&
      !Array.isArray(envelope.error)
        ? (envelope.error as Json)
        : undefined;
    code = [envelope.subtype, error?.type, error?.code, envelope.type]
      .map(providerErrorCode)
      .find((candidate) => candidate !== undefined);
    if (code === undefined)
      structure = unknownStructuredFailureMetadata(
        envelope,
        error,
        stdout,
        stderr,
      );
  } catch {
    // Unstructured stdout is intentionally not retained or interpreted.
  }
  const category =
    code === undefined
      ? "unknown"
      : (PROVIDER_ERROR_CODES.get(code) ?? "unknown");
  return {
    exitCode,
    stdout: stdout.length === 0 ? "empty" : "present",
    stderr: stderr.length === 0 ? "empty" : "present",
    source: structured
      ? "structured-stdout"
      : stderr.length > 0
        ? "stderr"
        : "none",
    category,
    ...(code === undefined ? {} : { code }),
    ...(structure === undefined ? {} : { structure }),
  };
}

function recordBootstrapDiagnostic(
  execution: Json,
  role: string,
  phase: "pre-launch" | "provider",
  error: unknown,
  provider?: ProviderFailureMetadata,
): void {
  try {
    mkdirSync(DIAGNOSTIC_ROOT, { recursive: true, mode: 0o700 });
    appendFileSync(
      join(DIAGNOSTIC_ROOT, `${WORKFLOW}.jsonl`),
      `${JSON.stringify({
        at: new Date().toISOString(),
        execution: text(execution.id, "execution id"),
        role,
        phase,
        message: bounded(
          error instanceof Error ? error.message : String(error),
        ),
        ...(provider === undefined ? {} : { provider }),
        configuration: bootstrapConfigurationPresence(process.env),
      })}\n`,
      { encoding: "utf8", mode: 0o600 },
    );
  } catch {
    // Diagnostic retention must never weaken or replace the governed result
    // protocol. The host will still record a failed process when launch fails.
  }
}

async function request(
  url: string,
  session: string,
  token: string,
  method: "GET" | "POST",
  body?: Json,
): Promise<Json> {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "x-harness-session": session,
      "content-type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = object(await response.json(), "host response");
  if (!response.ok)
    throw new Error(
      typeof payload.error === "string" ? payload.error : "host request failed",
    );
  return payload;
}

function resultSchema(contract: Json): Json {
  const methodology = object(
    contract.methodology ?? {},
    "contract methodology",
  );
  const properties: Json = {};
  for (const [field, values] of Object.entries(methodology)) {
    if (
      !Array.isArray(values) ||
      !values.every((value) => typeof value === "string")
    )
      throw new Error("invalid pinned methodology vocabulary");
    properties[field] = { type: "string", enum: values };
  }
  const results = contract.results;
  if (
    !Array.isArray(results) ||
    !results.every((value) => typeof value === "string")
  )
    throw new Error("invalid pinned result vocabulary");
  return {
    type: "object",
    additionalProperties: false,
    required: ["disposition", "methodology"],
    properties: {
      disposition: { type: "string", enum: results },
      methodology: {
        type: "object",
        additionalProperties: false,
        required: [],
        properties,
      },
    },
  };
}

function parseStructuredResult(output: string): Json {
  const envelope = object(JSON.parse(output), "Claude JSON output");
  const candidate =
    envelope.structured_output ?? envelope.structuredOutput ?? envelope.result;
  if (typeof candidate === "string")
    return object(JSON.parse(candidate), "Claude result");
  return object(candidate, "Claude result");
}

function bootstrapSpec(
  role: string,
  grant: Json,
  skill: Json,
): ResolvedWorkflowRunSpec {
  const workspaces = grant.workspaces;
  if (!Array.isArray(workspaces) || workspaces.length === 0)
    throw new Error("assignment has no workspaces");
  const paths = workspaces.map((workspace) =>
    text(object(workspace, "workspace").path, "workspace path"),
  );
  const capabilities = grant.capabilities;
  if (
    !Array.isArray(capabilities) ||
    !capabilities.every((value) => typeof value === "string")
  )
    throw new Error("assignment capabilities are invalid");
  const translated = new Set<string>(["repository-read"]);
  if (capabilities.includes("repository-write"))
    translated.add("workspace-write");
  if (capabilities.includes("local-computation")) {
    translated.add("local-computation");
    translated.add("child-process");
    translated.add("test-build-lint-format");
  }
  if (capabilities.includes("git-inspect")) translated.add("git-inspect");
  if (capabilities.includes("git-commit")) translated.add("git-commit");
  return {
    slot: { workflow: WORKFLOW, phase: role },
    role,
    executor: "claude",
    invocationMode: "delegated",
    workspaces: paths,
    permissionProfile: {
      id: bootstrapPermissionProfile(role),
      workspaces: paths,
      capabilities: [...translated],
    },
    skill: text(skill.path, "skill path"),
    skillVersion: "bootstrap",
    contract: {
      content: text(skill.content, "skill content"),
      name: role,
      path: text(skill.path, "skill path"),
      version: "bootstrap",
      identity: text(skill.identity, "skill identity"),
      deliveryMode: "claude-system-contract",
    },
    allocationAuthority: grant,
    verificationAuthority: null,
    orchestrator: "014c-human-bootstrap",
    prompt: null,
  };
}

function systemPrompt(
  execution: Json,
  grant: Json,
  skill: Json,
  contract: Json,
): string {
  const role = text(grant.role, "role");
  return (
    `You are the exact governed Harness worker for ${role}. This is an explicit human-authorized bootstrap execution for Spike 014c, not authority to alter Harness history.\n\n` +
    `Assignment identity: ${text(execution.id, "execution id")}\n` +
    `Role Grant identity: ${text(grant.id, "role grant id")}\n` +
    `Pinned skill identity: ${text(skill.identity, "skill identity")}\n` +
    `Pinned skill bytes follow; never reload its mutable working-tree path:\n\n${text(skill.content, "skill content")}\n\n` +
    `Pinned role contract: ${JSON.stringify(contract)}\n` +
    `Host-bound input identities: ${JSON.stringify(grant.inputs ?? {})}\n\n` +
    "Use only the granted workspaces and capabilities. Do not call legacy /workflow-runs, write workflow ledgers, publish, push, expose credentials, or infer any authority. Complete the role then return only the schema-constrained semantic result."
  );
}

async function main(): Promise<void> {
  const host = requiredEnvironment("HARNESS_URL");
  const workflow = requiredEnvironment("HARNESS_WORKFLOW");
  const session = requiredEnvironment("HARNESS_SESSION");
  const token = requiredEnvironment("HARNESS_SESSION_TOKEN");
  if (workflow !== WORKFLOW)
    throw new Error("bootstrap executor is scoped to Spike 014c only");
  const assignment = await request(
    `${host}/governed/${encodeURIComponent(workflow)}/sessions/${encodeURIComponent(session)}`,
    session,
    token,
    "GET",
  );
  const assignments = assignment.assignments;
  if (!Array.isArray(assignments) || assignments.length !== 1)
    throw new Error("bootstrap executor requires exactly one assignment");
  const bound = object(assignments[0], "assignment");
  const execution = object(bound.execution, "execution");
  const grant = object(bound.grant, "role grant");
  const skill = object(bound.skill, "skill");
  const contract = object(bound.contract, "contract");
  const role = text(grant.role, "role");
  if (
    !role.startsWith("evaluator-") &&
    ![
      "brief-readiness",
      "design-map",
      "implementation",
      "as-built",
      "outcome",
    ].includes(role)
  )
    throw new Error("bootstrap executor role is not permitted");
  if (
    digest(text(skill.content, "skill content")) !==
    text(skill.identity, "skill identity")
  )
    throw new Error("pinned skill identity mismatch");
  const spec = bootstrapSpec(role, grant, skill);
  const launchWorkspace = bootstrapWorkspaceSelection(role, spec.workspaces);
  if (launchWorkspace === undefined) {
    const error = new Error("assignment has no launch workspace");
    recordBootstrapDiagnostic(execution, role, "pre-launch", error);
    throw error;
  }
  const scratch = mkdtempSync(join(tmpdir(), "harness-014c-bootstrap-"));
  mkdirSync(join(scratch, "cache"));
  mkdirSync(join(scratch, "npm-cache"));
  let providerStarted = false;
  let failureMetadata: ProviderFailureMetadata | undefined;
  try {
    const command = [...buildClaudeWorkflowCommand(spec, "", scratch)];
    const systemIndex = command.indexOf("--system-prompt");
    const markerIndex = command.indexOf("--");
    if (systemIndex < 0 || markerIndex < 0)
      throw new Error("Claude bootstrap command is malformed");
    command[systemIndex + 1] = systemPrompt(execution, grant, skill, contract);
    command.splice(
      markerIndex,
      0,
      "--output-format",
      "json",
      "--json-schema",
      JSON.stringify(resultSchema(contract)),
    );
    const [program, ...args] = command;
    const child = spawn(text(program, "provider program"), args, {
      cwd: launchWorkspace,
      stdio: ["ignore", "pipe", "pipe"],
      env: bootstrapProviderEnvironment(process.env, scratch),
    });
    providerStarted = true;
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => (stdout += chunk));
    child.stderr.on("data", (chunk: string) => (stderr += chunk));
    const exit = await new Promise<number | null>((resolveExit, reject) => {
      child.once("error", reject);
      child.once("exit", resolveExit);
    });
    if (exit !== 0) {
      failureMetadata = providerFailureMetadata(exit, stdout, stderr);
      throw new Error(
        `Claude exited with ${String(exit)} (${failureMetadata.category}; ${failureMetadata.source})`,
      );
    }
    const result = parseStructuredResult(stdout);
    const methodology = object(result.methodology, "semantic methodology");
    await request(
      `${host}/governed/${encodeURIComponent(workflow)}/executions/${encodeURIComponent(text(execution.id, "execution id"))}/result`,
      session,
      token,
      "POST",
      {
        disposition: text(result.disposition, "semantic disposition"),
        methodology,
      },
    );
  } catch (error) {
    recordBootstrapDiagnostic(
      execution,
      role,
      providerStarted ? "provider" : "pre-launch",
      error,
      failureMetadata,
    );
    throw error;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  void main().catch((error: unknown) => {
    process.stderr.write(
      `${bounded(error instanceof Error ? error.message : String(error))}\n`,
    );
    process.exitCode = 1;
  });
}
