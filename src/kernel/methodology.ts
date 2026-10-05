import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { contentId, identity, object, text } from "./ledger.ts";
import type {
  MethodologyDefinition,
  Project,
  RoleContract,
  WorkflowPolicy,
  ArtifactValidators,
} from "./model.ts";

// An evidence destination is a plain relative path under the workflow
// directory: no absolute path, dot segments, Git metadata or backslashes. A
// trailing "/" declares a directory prefix in a contract allowlist.
export function evidencePath(path: unknown, prefix = false): boolean {
  if (typeof path !== "string" || path.length === 0 || path.length > 512)
    return false;
  if (path.startsWith("/") || path.includes("\\") || path.includes("\0"))
    return false;
  const trimmed = prefix ? path.replace(/\/$/, "") : path;
  if (prefix && trimmed === path) return false;
  return (
    trimmed.length > 0 &&
    trimmed
      .split("/")
      .every(
        (part) =>
          part !== "" &&
          part !== "." &&
          part !== ".." &&
          part.toLowerCase() !== ".git",
      )
  );
}
// A contract that mediates evidence writes must not also hold direct write or
// commit authority: the host could not then keep the workspace read-only.
export function validEvidenceContract(contract: RoleContract): boolean {
  const evidence = contract.evidence;
  if (evidence === undefined) return true;
  return (
    typeof evidence.workspace === "string" &&
    contract.workspaces.includes(evidence.workspace) &&
    !contract.capabilities.includes("repository-write") &&
    !contract.capabilities.includes("git-commit") &&
    Array.isArray(evidence.destinations) &&
    evidence.destinations.length > 0 &&
    evidence.destinations.every(
      (item) =>
        typeof item === "string" && evidencePath(item, item.endsWith("/")),
    )
  );
}
export function inside(root: string, path: string): string {
  const absolute = resolve(root, path);
  const delta = relative(realpathSync(root), realpathSync(absolute));
  if (delta === ".." || delta.startsWith("../") || isAbsolute(delta))
    throw new Error("path escapes its configured workspace");
  return absolute;
}
export function loadDefinition(
  project: Project,
  validators: ArtifactValidators = {},
): MethodologyDefinition {
  return definitionFrom(
    project.policy,
    (path) =>
      readFileSync(
        inside(project.methodologyRoot ?? project.root, path),
        "utf8",
      ),
    validators,
  );
}

// Builds a kernel definition from a policy path and a project-relative reader.
// The reader decides where methodology bytes come from: the working tree for
// historical/test kernels, or exact Git objects for trusted resolution.
export function definitionFrom(
  policyPath: string,
  read: (path: string) => string,
  validators: ArtifactValidators = {},
): MethodologyDefinition {
  const parsed: unknown = JSON.parse(read(policyPath));
  const rawPolicy = object(parsed);
  const policy = parsed as WorkflowPolicy;
  if (
    rawPolicy.schemaVersion !== 1 ||
    !Number.isSafeInteger(policy.maxAllocations) ||
    policy.maxAllocations < 1 ||
    (rawPolicy.humanDecisions !== undefined &&
      (typeof rawPolicy.humanDecisions !== "object" ||
        rawPolicy.humanDecisions === null ||
        Array.isArray(rawPolicy.humanDecisions)))
  )
    throw new Error("invalid workflow policy version/bound");
  object(policy.roles);
  const roles: MethodologyDefinition["roles"] = {};
  const validatorIdentities: Record<string, string> = {};
  for (const [name, entry] of Object.entries(policy.roles)) {
    const contract = JSON.parse(read(text(entry.contract))) as RoleContract;
    if (
      object(contract).schemaVersion !== 1 ||
      !Array.isArray(contract.inputs) ||
      !Array.isArray(contract.capabilities) ||
      !Array.isArray(contract.workspaces) ||
      !Array.isArray(contract.forbiddenExposure) ||
      !Array.isArray(contract.results) ||
      !Array.isArray(contract.human) ||
      !Array.isArray(contract.postconditions) ||
      (contract.resultConstraints !== undefined &&
        !Array.isArray(contract.resultConstraints)) ||
      !validEvidenceContract(contract) ||
      (contract.promotion !== undefined &&
        (!contract.workspaces.includes(contract.promotion.sourceWorkspace) ||
          !contract.workspaces.includes(
            contract.promotion.destinationWorkspace,
          ) ||
          !contract.promotion.destination ||
          !contract.promotion.candidateInput ||
          !contract.promotion.revisionInput ||
          !contract.promotion.allocationEvent ||
          !contract.promotion.attemptField ||
          !contract.promotion.transition ||
          (contract.promotion.plan !== undefined &&
            (typeof contract.promotion.plan !== "string" ||
              !contract.promotion.plan)) ||
          (contract.promotion.derive !== undefined &&
            contract.promotion.plan !== undefined)))
    )
      throw new Error(`invalid contract for ${name}`);
    if (
      contract.capabilities.includes("git-publish") ||
      contract.capabilities.includes("network")
    )
      throw new Error("governed publication is host-mediated");
    if (!Number.isSafeInteger(entry.retry.limit) || entry.retry.limit < 0)
      throw new Error("invalid retry bound");
    for (const constraint of contract.resultConstraints ?? []) {
      if (
        (constraint.required !== undefined &&
          !Array.isArray(constraint.required)) ||
        (constraint.absent !== undefined && !Array.isArray(constraint.absent))
      )
        throw new Error(`invalid result constraint for ${name}`);
    }
    for (const name of [
      ...contract.inputs.map((i) => i.validator),
      ...entry.outcomes.map((o) => o.evidence?.validator),
    ])
      if (name) {
        const validator = validators[name];
        if (!validator)
          throw new Error(`required artifact validator unavailable: ${name}`);
        validatorIdentities[name] = validator.identity;
      }
    const skillContent = read(text(entry.skill));
    roles[name] = {
      policy: entry,
      contract,
      contractIdentity: contentId(contract),
      skill: {
        path: entry.skill,
        identity: identity(skillContent),
        content: skillContent,
      },
    };
  }
  for (const [name, decision] of Object.entries(policy.humanDecisions ?? {})) {
    const rawDecision = object(decision);
    if (
      !name ||
      typeof rawDecision.transition !== "string" ||
      rawDecision.when === undefined ||
      typeof rawDecision.bindings !== "object" ||
      rawDecision.bindings === null ||
      Array.isArray(rawDecision.bindings) ||
      !Array.isArray(rawDecision.requiredStrings ?? []) ||
      !Array.isArray(rawDecision.requiredStringArrays ?? [])
    )
      throw new Error(`invalid human decision: ${name}`);
  }
  const definition = {
    schemaVersion: 1 as const,
    policyIdentity: contentId(policy),
    policy,
    roles,
    validators: validatorIdentities,
  };
  return { ...definition, id: contentId(definition) };
}
