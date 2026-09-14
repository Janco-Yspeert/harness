import { createHash } from "node:crypto";
import { resolve } from "node:path";

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

export function buildClaudeWorkflowCommand(
  spec: ResolvedWorkflowRunSpec,
  ordinaryPrompt: string,
): string[] {
  const workspaces = spec.permissionProfile.workspaces;
  if (spec.contract.deliveryMode !== "claude-system-contract") {
    return [
      "claude",
      "-p",
      "--permission-mode",
      "acceptEdits",
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
  const capabilities = new Set(spec.permissionProfile.capabilities);
  const tools: string[] = [];
  if (capabilities.has("repository-read")) tools.push("Read", "Glob", "Grep");
  if (capabilities.has("workspace-write")) tools.push("Edit", "Write");
  if (
    capabilities.has("child-process") &&
    capabilities.has("local-computation")
  ) {
    // Availability is not blanket approval. Claude's normal command permission
    // checks still apply; unattended approval requests are denied, never bypassed.
    tools.push("Bash");
  }
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
    // Safe mode excludes CLAUDE.md, memory, plugins, hooks, skills and other
    // customizations. Restricted mode confines file tools to declared dirs.
    // Managed host policy still applies; candidate settings cannot grant access.
    "--safe-mode",
    "--restricted",
    "--disable-slash-commands",
    "--strict-mcp-config",
    "--setting-sources",
    "",
    "--tools",
    tools.join(","),
    "--permission-mode",
    capabilities.has("workspace-write") ? "acceptEdits" : "dontAsk",
    "--permission-prompts",
    "none",
    "--no-session-persistence",
    ...workspaces
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
