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
  const policy = JSON.parse(
    readFileSync(inside(project.root, project.policy), "utf8"),
  ) as WorkflowPolicy;
  if (
    object(policy).schemaVersion !== 1 ||
    !Number.isSafeInteger(policy.maxAllocations) ||
    policy.maxAllocations < 1
  )
    throw new Error("invalid workflow policy version/bound");
  object(policy.roles);
  const roles: MethodologyDefinition["roles"] = {};
  const validatorIdentities: Record<string, string> = {};
  for (const [name, entry] of Object.entries(policy.roles)) {
    const contract = JSON.parse(
      readFileSync(inside(project.root, text(entry.contract)), "utf8"),
    ) as RoleContract;
    if (
      object(contract).schemaVersion !== 1 ||
      !Array.isArray(contract.inputs) ||
      !Array.isArray(contract.capabilities) ||
      !Array.isArray(contract.workspaces) ||
      !Array.isArray(contract.forbiddenExposure) ||
      !Array.isArray(contract.results) ||
      !Array.isArray(contract.human) ||
      !Array.isArray(contract.postconditions)
    )
      throw new Error(`invalid contract for ${name}`);
    if (
      contract.capabilities.includes("git-publish") ||
      contract.capabilities.includes("network")
    )
      throw new Error("governed publication is host-mediated");
    if (!Number.isSafeInteger(entry.retry.limit) || entry.retry.limit < 0)
      throw new Error("invalid retry bound");
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
    const skillContent = readFileSync(
      inside(project.root, text(entry.skill)),
      "utf8",
    );
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
  const definition = {
    schemaVersion: 1 as const,
    policyIdentity: contentId(policy),
    policy,
    roles,
    validators: validatorIdentities,
  };
  return { ...definition, id: contentId(definition) };
}
