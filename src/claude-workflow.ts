import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

import type { ResolvedWorkflowRunSpec } from "./workflow-run.ts";

// This adapter consumes a host-resolved spec. The HTTP request parser cannot
// populate contract content or select this delivery mode; canonical allocation
// validation in workflow-run.ts is the authority boundary.
export function claudeWorkflowDirectory(
  spec: ResolvedWorkflowRunSpec,
): string | undefined {
  const workspaces = spec.permissionProfile.workspaces;
  return spec.contract.deliveryMode === "claude-system-contract" &&
    spec.permissionProfile.id === "evaluator"
    ? workspaces[1]
    : workspaces[0];
}

// Capability-to-Claude-permission translation, shared by every Claude
// execution mode. If Harness's resolved permission profile grants a
// capability, this is the one place that decides which bounded provider
// tool/command family actually exposes it -- a worker's real permissions
// must come from here, never from whatever ambient CLAUDE.md/settings the
// launching account happens to have (that dependency is exactly what left
// ordinary implementation workers unable to complete their own git
// publication despite already holding git-commit/git-publish).
//
// git-publish only becomes a direct `git push` grant for a profile the host
// is willing to let push over the network itself (currently every profile:
// see the git-publish comment below for the evaluator caveat). A future
// network-isolated profile can hold git-publish without this ever granting
// Bash push access, and instead rely solely on the host-mediated
// WorkflowRunRegistry#publishCommit endpoint.
export function resolveClaudeCapabilityTools(
  capabilities: ReadonlySet<string>,
  options: { allowDirectPush: boolean },
): { tools: string[]; allowedTools: string[] } {
  const tools: string[] = [];
  const allowedTools: string[] = [];
  if (capabilities.has("repository-read")) tools.push("Read", "Glob", "Grep");
  if (capabilities.has("workspace-write")) tools.push("Edit", "Write");
  if (
    capabilities.has("child-process") &&
    capabilities.has("local-computation")
  ) {
    tools.push("Bash");
  }
  // Bounded by subcommand, never the blanket "Bash(git *)" this replaced --
  // that would equally admit `git reset --hard`, `git push --force`,
  // `git branch -D`, and every other destructive git operation regardless of
  // which specific git capability was actually granted.
  if (capabilities.has("git-inspect"))
    allowedTools.push(
      "Bash(git status *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git show *)",
      "Bash(git rev-parse *)",
      "Bash(git cat-file *)",
      "Bash(git merge-base *)",
    );
  if (capabilities.has("git-commit"))
    allowedTools.push("Bash(git add *)", "Bash(git commit *)");
  if (capabilities.has("git-publish") && options.allowDirectPush)
    allowedTools.push("Bash(git push *)");
  if (capabilities.has("test-build-lint-format"))
    allowedTools.push("Bash(npm *)", "Bash(npx *)");
  if (capabilities.has("local-computation"))
    allowedTools.push("Bash(node *)", "Bash(python3 *)");
  return { tools, allowedTools };
}

// Safe mode excludes CLAUDE.md, memory, plugins, hooks, skills and other
// customizations. Restricted mode confines file tools to declared dirs.
// Managed host policy still applies; candidate settings cannot grant access.
// Shared by the legacy protected contract mode and governed execution.
export const CLAUDE_PROTECTED_FLAGS = [
  "--safe-mode",
  "--restricted",
  "--disable-slash-commands",
  "--strict-mcp-config",
  "--setting-sources",
  "",
] as const;

// Governed execution needs exactly one MCP server: the repository-owned Harness
// worker tool server passed with --mcp-config. Safe mode disables every MCP
// server, including an explicitly passed one (observed in the 014c live smoke:
// init reported no connected "harness" server). Governed launches therefore
// keep each ambient exclusion without safe mode: --strict-mcp-config admits only
// the passed config, --setting-sources "" loads no user/project/local settings
// (and so no CLAUDE.md, hooks or enabled plugins), --disable-slash-commands
// removes skills and commands, and --restricted keeps file tools inside the
// declared directories.
export const GOVERNED_CLAUDE_FLAGS: readonly string[] =
  CLAUDE_PROTECTED_FLAGS.filter((flag) => flag !== "--safe-mode");

// OS sandbox for command execution: block siblings of every granted workspace
// (notably arbitrary /tmp entries), then re-open only the exact allocation.
export function claudeSandboxSettings(workspaces: readonly string[]): string {
  return JSON.stringify({
    permissions: { blockReadsOutsideWorkingDirectories: true },
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      autoAllowBashIfSandboxed: true,
      allowUnsandboxedCommands: false,
      excludedCommands: [],
      filesystem: {
        denyRead: [
          ...new Set(workspaces.map((workspace) => dirname(workspace))),
        ],
        allowRead: [...workspaces],
      },
    },
  });
}

export function buildClaudeWorkflowCommand(
  spec: ResolvedWorkflowRunSpec,
  ordinaryPrompt: string,
  scratchWorkspace?: string,
): string[] {
  const workspaces = spec.permissionProfile.workspaces;
  const capabilities = new Set(spec.permissionProfile.capabilities);
  if (spec.contract.deliveryMode !== "claude-system-contract") {
    // Ordinary (non-protected) execution: no evaluator hidden workspace,
    // system-prompt replacement, or strict OS sandbox -- those remain
    // evaluator/system-contract-specific. This mode's workspace already is
    // the whole granted repository, so it gains nothing from the sandbox's
    // filesystem fencing; forcing it on would only add an unrelated
    // bubblewrap/socat host dependency to routine implementation dispatch.
    // It still gets the same capability-derived tool/command translation and
    // a deterministic, host-owned permission decision instead of depending
    // on the launching account's own settings.
    const { tools, allowedTools } = resolveClaudeCapabilityTools(capabilities, {
      allowDirectPush: true,
    });
    return [
      "claude",
      "-p",
      "--setting-sources",
      "",
      "--permission-prompts",
      "none",
      "--tools",
      tools.join(","),
      ...(allowedTools.length === 0
        ? []
        : ["--allowedTools", allowedTools.join(",")]),
      "--permission-mode",
      capabilities.has("workspace-write") ? "acceptEdits" : "dontAsk",
      ...workspaces.slice(1).flatMap((workspace) => ["--add-dir", workspace]),
      "--",
      ordinaryPrompt,
    ];
  }

  const identity = `sha256:${createHash("sha256").update(spec.contract.content).digest("hex")}`;
  if (identity !== spec.contract.identity) {
    throw new Error(
      "Claude system contract identity does not match the resolved binding",
    );
  }
  // The frozen, pinned evaluator contract's own text ("commit and push...")
  // still assumes direct push capability; switching it to host-mediated-only
  // publication is deferred rather than done silently here, since that
  // would change what a currently-immutable frozen contract can actually do.
  // git-publish is still bounded to the specific `git push` subcommand
  // rather than the previous blanket `git *`, and the host-mediated
  // WorkflowRunRegistry#publishCommit primitive exists and is available for
  // any role/contract that does not need direct push capability.
  const { tools, allowedTools } = resolveClaudeCapabilityTools(capabilities, {
    allowDirectPush: true,
  });
  const permitsCommands = tools.includes("Bash");
  if (permitsCommands && scratchWorkspace === undefined) {
    throw new Error(
      "Claude evaluator command execution requires host-created run scratch",
    );
  }
  const commandWorkspaces = [
    ...workspaces,
    ...(scratchWorkspace === undefined ? [] : [scratchWorkspace]),
  ];
  const sandboxSettings = permitsCommands
    ? claudeSandboxSettings(commandWorkspaces)
    : undefined;
  const parameters = {
    mode: spec.role.slice("evaluator-".length),
    spike: spec.allocationAuthority.workflow,
    CLAUDE_PROJECT_DIR: workspaces[0],
    contractPath: resolve(workspaces[0] ?? process.cwd(), spec.contract.path),
  };
  const system = `You are executing the allocated ${spec.role} role. The host has already validated this allocation. Execute the following exact contract directly as your role; this is separate from the human-facing Skill invocation surface.
Execution parameters for the contract (project root, mode, spike and source path): ${JSON.stringify(parameters)}

${spec.contract.content}

Harness role-result protocol: after completing the contract's required work and checks, emit one final line:
HARNESS_ROLE_RESULT {"disposition":"succeeded"}
Use "blocked", "refused", or "failed" when appropriate, with an optional JSON string field "reason". Process completion alone is not role success.`;
  return [
    "claude",
    "-p",
    ...CLAUDE_PROTECTED_FLAGS,
    ...(sandboxSettings === undefined ? [] : ["--settings", sandboxSettings]),
    "--tools",
    tools.join(","),
    ...(allowedTools.length === 0
      ? []
      : ["--allowedTools", allowedTools.join(",")]),
    "--permission-mode",
    capabilities.has("workspace-write") ? "acceptEdits" : "dontAsk",
    "--permission-prompts",
    "none",
    "--no-session-persistence",
    ...commandWorkspaces
      .filter((workspace) => workspace !== claudeWorkflowDirectory(spec))
      .flatMap((workspace) => ["--add-dir", workspace]),
    // Pass captured content as a replacement system prompt. No adapter file
    // lookup, candidate-controlled prompt file, or temporary workspace grant.
    "--system-prompt",
    system,
    "--",
    `Work target: ${spec.slot.workflow}; phase: ${spec.slot.phase}; attempt: ${spec.slot.methodologyAttempt ?? "none"}.\n${spec.prompt ?? "Perform the allocated work."}`,
  ];
}

// Governed execution: one reviewed mapping from Harness contract capabilities
// to the Claude tool families above. A capability without an entry fails
// closed; nothing here can widen into unrestricted permission mode or push.
const GOVERNED_CLAUDE_CAPABILITIES: Readonly<
  Record<string, readonly string[]>
> = {
  "repository-read": ["repository-read"],
  "repository-write": ["workspace-write"],
  "local-computation": [
    "local-computation",
    "child-process",
    "test-build-lint-format",
  ],
  "git-inspect": ["git-inspect"],
  "git-commit": ["git-commit"],
};
export const GOVERNED_WORKER_TOOL_SERVER = "harness";

export function governedClaudeCapabilities(): readonly string[] {
  return Object.keys(GOVERNED_CLAUDE_CAPABILITIES);
}

export function governedClaudePermissions(
  capabilities: readonly string[],
  workerOperations: readonly string[],
): {
  tools: string[];
  allowedTools: string[];
  disallowedTools: string[];
  permissionMode: "acceptEdits" | "dontAsk";
  commands: boolean;
} {
  const families = new Set<string>();
  for (const capability of capabilities) {
    const mapped = GOVERNED_CLAUDE_CAPABILITIES[capability];
    if (mapped === undefined)
      throw new Error(
        `capability ${capability} has no reviewed Claude permission mapping`,
      );
    for (const family of mapped) families.add(family);
  }
  const { tools, allowedTools } = resolveClaudeCapabilityTools(families, {
    allowDirectPush: false,
  });
  return {
    tools,
    allowedTools: [
      ...allowedTools,
      ...workerOperations.map(
        (operation) => `mcp__${GOVERNED_WORKER_TOOL_SERVER}__${operation}`,
      ),
    ],
    // Publication is only ever the host-configured requestAction.
    disallowedTools: ["Bash(git push)", "Bash(git push *)"],
    permissionMode: families.has("workspace-write") ? "acceptEdits" : "dontAsk",
    commands: tools.includes("Bash"),
  };
}

export interface GovernedClaudeLaunch {
  // The first workspace is the provider working directory.
  readonly workspaces: ReadonlyArray<{ path: string; mode: "read" | "write" }>;
  readonly capabilities: readonly string[];
  readonly workerOperations: readonly string[];
  readonly scratch: string;
  readonly mcpConfig: string;
  readonly system: string;
  readonly prompt: string;
  readonly model?: string;
  readonly maxTurns?: number;
}

export function buildGovernedClaudeCommand(
  launch: GovernedClaudeLaunch,
): string[] {
  const permissions = governedClaudePermissions(
    launch.capabilities,
    launch.workerOperations,
  );
  const paths = launch.workspaces.map((workspace) => workspace.path);
  const commandWorkspaces = [...paths, launch.scratch];
  const readOnly = launch.workspaces
    .filter((workspace) => workspace.mode === "read")
    .flatMap((workspace) => [
      `Edit(/${workspace.path}/**)`,
      `Write(/${workspace.path}/**)`,
    ]);
  return [
    "claude",
    "-p",
    ...GOVERNED_CLAUDE_FLAGS,
    "--mcp-config",
    launch.mcpConfig,
    ...(permissions.commands
      ? ["--settings", claudeSandboxSettings(commandWorkspaces)]
      : []),
    "--tools",
    permissions.tools.join(","),
    "--allowedTools",
    permissions.allowedTools.join(","),
    "--disallowedTools",
    [...permissions.disallowedTools, ...readOnly].join(","),
    "--permission-mode",
    permissions.permissionMode,
    "--permission-prompts",
    "none",
    "--no-session-persistence",
    ...commandWorkspaces.slice(1).flatMap((path) => ["--add-dir", path]),
    ...(launch.model === undefined ? [] : ["--model", launch.model]),
    ...(launch.maxTurns === undefined
      ? []
      : ["--max-turns", String(launch.maxTurns)]),
    "--output-format",
    "stream-json",
    "--verbose",
    "--system-prompt",
    launch.system,
    "--",
    launch.prompt,
  ];
}
