// Registered, repository-owned governed provider adapters.
//
// Exactly two adapters exist: "claude" and "codex". Each translates a
// host-resolved Role Grant into supported provider configuration by reusing
// the existing provider command construction, and parses the provider's
// structured event stream into public-safe observations. Adapters never
// allocate, authorize, infer results or actions, or re-resolve skills.
import { accessSync, constants, realpathSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, isAbsolute, join, relative, resolve } from "node:path";

import {
  buildGovernedClaudeCommand,
  GOVERNED_WORKER_TOOL_SERVER,
  governedClaudeCapabilities,
  governedClaudePermissions,
} from "../claude-workflow.ts";
import type {
  DiagnosticCategory,
  ExecutorProfile,
  RoleGrant,
  Workspace,
} from "../kernel/model.ts";
import {
  assertBoundedExecutorCommand,
  codexExecCommand,
} from "../workflow-backend.ts";
import { WORKER_OPERATIONS } from "./protocol.ts";

export type ProviderId = "claude" | "codex";
export const REGISTERED_ADAPTERS: readonly ProviderId[] = ["claude", "codex"];

export class AdapterRefusal extends Error {
  readonly category: DiagnosticCategory;
  constructor(category: DiagnosticCategory, message: string) {
    super(message);
    this.category = category;
  }
}

export type ProviderEvent =
  | {
      kind: "confirmed";
      model: string | null;
      reasoning: string | null;
      version: string | null;
    }
  | { kind: "tools-unavailable"; detail: string }
  | { kind: "permission-denied"; detail: string }
  | { kind: "rate-limited"; detail: string }
  | { kind: "provider-error"; detail: string };

export interface AdapterCommandInput {
  readonly grant: RoleGrant;
  readonly workspaces: readonly Workspace[];
  readonly scratch: string;
  // Per-execution loopback relay and its relay-only key (never a host
  // credential). Both reach only the Harness tool server's environment.
  readonly relay: { port: number; key: string };
  readonly nodePath: string;
  readonly workerToolsPath: string;
  readonly system: string;
  readonly prompt: string;
  readonly model?: string;
  readonly reasoning?: string;
  readonly maxTurns?: number;
}

export interface ProviderAdapter {
  readonly id: ProviderId;
  // Literal program name, located only through the host PATH.
  readonly program: string;
  readonly capabilities: readonly string[];
  // Whether an exact constraint can be enforced (requested) and attested
  // (confirmed from provider-reported evidence).
  readonly model: { enforce: boolean; attest: boolean };
  readonly reasoning: { enforce: boolean; attest: boolean };
  // Whether the provider confines reads to the granted workspaces, which is
  // required for protected and forbidden-exposure grants.
  readonly privateWorkspace: boolean;
  checkCapabilities(capabilities: readonly string[]): void;
  command(input: AdapterCommandInput): string[];
  parse(line: string): ProviderEvent[];
}

type Json = Record<string, unknown>;
function parseJson(line: string): Json | undefined {
  try {
    const value: unknown = JSON.parse(line);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Json)
      : undefined;
  } catch {
    return undefined;
  }
}
function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

const claude: ProviderAdapter = {
  id: "claude",
  program: "claude",
  capabilities: governedClaudeCapabilities(),
  model: { enforce: true, attest: true },
  // No supported, attestable per-invocation effort control is used here, so
  // an exact effort constraint blocks rather than being optimistically met.
  reasoning: { enforce: false, attest: false },
  privateWorkspace: true,
  checkCapabilities(capabilities) {
    try {
      governedClaudePermissions(capabilities, WORKER_OPERATIONS);
    } catch (error) {
      throw new AdapterRefusal(
        "provider-config-invalid",
        (error as Error).message,
      );
    }
  },
  command(input) {
    return buildGovernedClaudeCommand({
      workspaces: input.workspaces.map((workspace) => ({
        path: workspace.path,
        mode: workspace.mode,
      })),
      capabilities: input.grant.capabilities,
      workerOperations: WORKER_OPERATIONS,
      scratch: input.scratch,
      mcpConfig: JSON.stringify({
        mcpServers: {
          [GOVERNED_WORKER_TOOL_SERVER]: {
            type: "stdio",
            command: input.nodePath,
            args: [input.workerToolsPath],
            env: {
              HARNESS_WORKER_RELAY: String(input.relay.port),
              HARNESS_WORKER_RELAY_KEY: input.relay.key,
            },
          },
        },
      }),
      system: input.system,
      prompt: input.prompt,
      ...(input.model === undefined ? {} : { model: input.model }),
      ...(input.maxTurns === undefined ? {} : { maxTurns: input.maxTurns }),
    });
  },
  // Claude Code `--output-format stream-json` events.
  parse(line) {
    const event = parseJson(line);
    if (!event) return [];
    const events: ProviderEvent[] = [];
    if (event.type === "system" && event.subtype === "init") {
      events.push({
        kind: "confirmed",
        model: stringValue(event.model),
        reasoning: null,
        version: stringValue(event.claude_code_version),
      });
      const servers = Array.isArray(event.mcp_servers) ? event.mcp_servers : [];
      const harness = servers.find(
        (server): server is Json =>
          server !== null &&
          typeof server === "object" &&
          (server as Json).name === GOVERNED_WORKER_TOOL_SERVER,
      );
      if (harness?.status !== "connected")
        events.push({
          kind: "tools-unavailable",
          detail: "Harness worker tool server is not connected",
        });
    }
    if (event.error === "rate_limit")
      events.push({ kind: "rate-limited", detail: "provider rate limit" });
    else if (typeof event.error === "string" && event.type === "assistant")
      events.push({ kind: "provider-error", detail: "provider API error" });
    if (event.type === "result") {
      const denials = Array.isArray(event.permission_denials)
        ? event.permission_denials
        : [];
      for (const denial of denials) {
        const tool =
          denial !== null && typeof denial === "object"
            ? stringValue((denial as Json).tool_name)
            : null;
        events.push({
          kind: "permission-denied",
          detail: `provider denied tool ${tool ?? "unknown"}`,
        });
      }
      if (event.is_error === true)
        events.push({
          kind: "provider-error",
          detail: `provider result ${stringValue(event.subtype) ?? "error"}`,
        });
    }
    return events;
  },
};

const CODEX_INHERENT = ["repository-read", "local-computation", "git-inspect"];
const CODEX_WRITE = ["repository-write", "git-commit"];
function tomlString(value: string): string {
  return JSON.stringify(value);
}

const codex: ProviderAdapter = {
  id: "codex",
  program: "codex",
  capabilities: [...CODEX_INHERENT, ...CODEX_WRITE],
  // `codex exec --json` does not report the effective model or effort, so an
  // exact constraint cannot be attested and therefore blocks allocation.
  model: { enforce: true, attest: false },
  reasoning: { enforce: true, attest: false },
  // The Codex sandbox restricts writes, not reads.
  privateWorkspace: false,
  // Codex sandboxes always permit reading, command execution and Git
  // inspection, and workspace-write always permits commits. Any grant whose
  // capabilities differ from what the selected sandbox actually provides is a
  // mismatch and fails closed.
  checkCapabilities(capabilities) {
    const unknown = capabilities.find(
      (capability) => !codex.capabilities.includes(capability),
    );
    if (unknown !== undefined)
      throw new AdapterRefusal(
        "provider-config-invalid",
        `capability ${unknown} has no reviewed Codex permission mapping`,
      );
    const missing = CODEX_INHERENT.find(
      (capability) => !capabilities.includes(capability),
    );
    if (missing !== undefined)
      throw new AdapterRefusal(
        "provider-config-invalid",
        `Codex sandbox cannot withhold ${missing}`,
      );
    if (
      capabilities.includes("repository-write") !==
      capabilities.includes("git-commit")
    )
      throw new AdapterRefusal(
        "provider-config-invalid",
        "Codex sandbox grants repository-write and git-commit only together",
      );
  },
  command(input) {
    const primary = input.workspaces[0];
    if (!primary) throw new Error("governed Codex launch requires a workspace");
    const write = input.grant.capabilities.includes("repository-write");
    return codexExecCommand(
      primary.path,
      write
        ? input.workspaces
            .slice(1)
            .filter((workspace) => workspace.mode === "write")
            .map((workspace) => workspace.path)
        : [],
      write ? "workspace-write" : "read-only",
      [
        "--json",
        "--ephemeral",
        "--skip-git-repo-check",
        "--ignore-user-config",
        "--ignore-rules",
        "-c",
        'approval_policy="never"',
        "-c",
        "sandbox_workspace_write.network_access=false",
        "-c",
        `mcp_servers.${GOVERNED_WORKER_TOOL_SERVER}.command=${tomlString(input.nodePath)}`,
        "-c",
        `mcp_servers.${GOVERNED_WORKER_TOOL_SERVER}.args=[${tomlString(input.workerToolsPath)}]`,
        "-c",
        `mcp_servers.${GOVERNED_WORKER_TOOL_SERVER}.env={HARNESS_WORKER_RELAY=${tomlString(String(input.relay.port))},HARNESS_WORKER_RELAY_KEY=${tomlString(input.relay.key)}}`,
        ...(input.model === undefined ? [] : ["-m", input.model]),
        ...(input.reasoning === undefined
          ? []
          : ["-c", `model_reasoning_effort=${tomlString(input.reasoning)}`]),
      ],
      `${input.system}\n\n${input.prompt}`,
    );
  },
  // `codex exec --json` events.
  parse(line) {
    const event = parseJson(line);
    if (!event) return [];
    if (event.type === "turn.failed" || event.type === "error")
      return [{ kind: "provider-error", detail: `provider ${event.type}` }];
    const item =
      event.item !== null && typeof event.item === "object"
        ? (event.item as Json)
        : undefined;
    if (
      event.type === "item.completed" &&
      item?.type === "command_execution" &&
      item.status === "declined"
    )
      return [
        { kind: "permission-denied", detail: "provider declined a command" },
      ];
    return [];
  },
};

export const ADAPTERS: Readonly<Record<ProviderId, ProviderAdapter>> = {
  claude,
  codex,
};

export function registeredAdapter(
  provider: string,
): ProviderAdapter | undefined {
  return (REGISTERED_ADAPTERS as readonly string[]).includes(provider)
    ? ADAPTERS[provider as ProviderId]
    : undefined;
}

const TEMPORARY_ROOTS = ["/tmp", "/var/tmp", "/dev/shm"];
function real(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}
function within(root: string, path: string): boolean {
  const delta = relative(root, path);
  return delta === "" || (!delta.startsWith("..") && !isAbsolute(delta));
}

// Locate an installed provider without executing anything. Only absolute
// host PATH entries are searched, and any candidate in a temporary directory
// or inside a project/executor workspace is rejected, so a generated wrapper
// can never be selected as the provider program.
export function locateProvider(
  program: string,
  path: string | undefined,
  excluded: readonly string[],
): { ok: true; path: string } | { ok: false; reason: string } {
  const forbidden = [...TEMPORARY_ROOTS, tmpdir(), ...excluded].map(real);
  const allowed = (candidate: string): boolean =>
    !forbidden.some((root) => within(root, real(candidate)));
  for (const entry of (path ?? "").split(delimiter)) {
    if (!entry || !isAbsolute(entry) || !allowed(entry)) continue;
    const candidate = join(entry, program);
    try {
      if (!statSync(candidate).isFile()) continue;
      accessSync(candidate, constants.X_OK);
    } catch {
      continue;
    }
    if (allowed(candidate)) return { ok: true, path: candidate };
  }
  return {
    ok: false,
    reason: `${program} provider is not installed on the host PATH`,
  };
}

const PROFILE_KEYS = [
  "id",
  "provider",
  "modes",
  "capabilities",
  "isolation",
  "available",
  "model",
  "reasoning",
  "usage",
  "cost",
  "maxTurns",
];

// Production executor configuration: every profile must name a registered
// adapter. No command, program path or unknown key can be configured, so no
// environment variable or configuration file can launch a fixture command or
// a generated bridge.
export function validateProductionExecutors(raw: unknown): ExecutorProfile[] {
  if (!Array.isArray(raw))
    throw new Error("executor configuration must be an array of profiles");
  const ids = new Set<string>();
  return raw.map((value, index) => {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      throw new Error(`executor profile ${String(index)} must be an object`);
    const profile = value as Json;
    const name =
      typeof profile.id === "string" && profile.id ? profile.id : undefined;
    if (!name) throw new Error(`executor profile ${String(index)} needs an id`);
    if (ids.has(name)) throw new Error(`duplicate executor profile ${name}`);
    ids.add(name);
    if ("command" in profile)
      throw new Error(
        `executor profile ${name} must not configure a command; production profiles launch only registered adapters (claude, codex)`,
      );
    const extra = Object.keys(profile).find(
      (key) => !PROFILE_KEYS.includes(key),
    );
    if (extra !== undefined)
      throw new Error(
        `executor profile ${name} has unsupported field ${extra}`,
      );
    const adapter = registeredAdapter(String(profile.provider));
    if (!adapter)
      throw new Error(
        `executor profile ${name} names unregistered provider adapter ${String(profile.provider)}`,
      );
    const strings = (key: string): string[] => {
      const items = profile[key];
      if (
        !Array.isArray(items) ||
        !items.every((item) => typeof item === "string")
      )
        throw new Error(`executor profile ${name} ${key} must be strings`);
      return items;
    };
    const modes = strings("modes");
    if (
      modes.length === 0 ||
      !modes.every((mode) => mode === "attached" || mode === "spawned")
    )
      throw new Error(`executor profile ${name} has invalid modes`);
    const capabilities = strings("capabilities");
    const unmapped = capabilities.find(
      (capability) => !adapter.capabilities.includes(capability),
    );
    if (unmapped !== undefined)
      throw new Error(
        `executor profile ${name}: ${adapter.id} adapter has no mapping for capability ${unmapped}`,
      );
    const isolation = strings("isolation");
    if (
      !isolation.every((item) => item === "private-workspace") ||
      (isolation.length > 0 && !adapter.privateWorkspace)
    )
      throw new Error(
        `executor profile ${name}: ${adapter.id} adapter cannot enforce the declared isolation`,
      );
    if (typeof profile.available !== "boolean")
      throw new Error(`executor profile ${name} needs boolean availability`);
    for (const key of ["model", "reasoning"] as const) {
      const constraint = profile[key];
      if (constraint === undefined) continue;
      if (typeof constraint !== "string" || !constraint)
        throw new Error(`executor profile ${name} ${key} must be a string`);
      if (!adapter[key].enforce)
        throw new Error(
          `executor profile ${name}: ${adapter.id} adapter cannot enforce a ${key} constraint`,
        );
    }
    if (
      profile.maxTurns !== undefined &&
      (typeof profile.maxTurns !== "number" ||
        !Number.isSafeInteger(profile.maxTurns) ||
        profile.maxTurns < 1)
    )
      throw new Error(`executor profile ${name} maxTurns must be positive`);
    return structuredClone(profile) as unknown as ExecutorProfile;
  });
}

// Pre-allocation launch planning. Refusals carry a diagnostic category and
// happen before any session, allocation or process exists.
export function planLaunch(
  adapter: ProviderAdapter,
  grant: RoleGrant,
  profile: ExecutorProfile,
): { model?: string; reasoning?: string } {
  adapter.checkCapabilities(grant.capabilities);
  if (
    (grant.executorConstraints.protected ||
      grant.executorConstraints.forbiddenExposure.length > 0) &&
    !adapter.privateWorkspace
  )
    throw new AdapterRefusal(
      "provider-config-invalid",
      `${adapter.id} adapter cannot enforce private-workspace read isolation`,
    );
  const plan: { model?: string; reasoning?: string } = {};
  for (const key of ["model", "reasoning"] as const) {
    const exact = grant.executorConstraints[key];
    const requested = exact ?? profile[key];
    if (requested === undefined) continue;
    const support = adapter[key];
    if (!support.enforce || (exact !== undefined && !support.attest))
      throw new AdapterRefusal(
        "provider-config-invalid",
        `${adapter.id} adapter cannot enforce and attest the exact ${key} constraint`,
      );
    plan[key] = requested;
  }
  return plan;
}

export function checkedCommand(
  adapter: ProviderAdapter,
  program: string,
  input: AdapterCommandInput,
): { program: string; args: string[] } {
  const command = adapter.command(input);
  assertBoundedExecutorCommand(command);
  if (command[0] !== adapter.program)
    throw new Error("adapter command does not launch its registered provider");
  return { program, args: command.slice(1) };
}
