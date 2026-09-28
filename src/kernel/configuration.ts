import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Project } from "./model.ts";
import { object } from "./ledger.ts";

// Expected repository identity form (design-map D5).
export const ORIGIN = /^github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

// Paths and discovery are project configuration, never methodology inference.
export function loadProject(path: string): Project {
  const raw = JSON.parse(readFileSync(path, "utf8")) as Project & {
    workflowDirectory?: string;
    ledgerName?: string;
  };
  if (
    (raw.methodologyRoot !== undefined &&
      (typeof raw.methodologyRoot !== "string" || !raw.methodologyRoot)) ||
    (raw.origin !== undefined &&
      (typeof raw.origin !== "string" || !ORIGIN.test(raw.origin)))
  )
    throw new Error("invalid project methodology root or origin declaration");
  if (object(raw).schemaVersion !== 1 || !raw.id || !raw.root || !raw.policy)
    throw new Error("invalid project configuration");
  if (
    (raw.trustedHistory !== undefined &&
      (typeof raw.trustedHistory !== "string" || !raw.trustedHistory)) ||
    (raw.validatorSources !== undefined &&
      !Object.values(object(raw.validatorSources)).every(
        (source) => typeof source === "string" && source.length > 0,
      ))
  )
    throw new Error(
      "invalid project trusted-history or validator-source declaration",
    );
  const root = resolve(dirname(path), raw.root);
  const workflows = { ...raw.workflows };
  if (raw.workflowDirectory)
    for (const entry of readdirSync(resolve(root, raw.workflowDirectory), {
      withFileTypes: true,
    }))
      if (entry.isDirectory())
        workflows[entry.name] ??= {
          directory: `${raw.workflowDirectory}/${entry.name}`,
          ledger: raw.ledgerName ?? "workflow.jsonl",
        };
  return {
    schemaVersion: 1,
    id: raw.id,
    root,
    policy: raw.policy,
    workflows: Object.fromEntries(
      Object.entries(workflows).map(([key, workflow]) => [
        key,
        {
          ...workflow,
          ...(workflow.workspaces
            ? {
                workspaces: Object.fromEntries(
                  Object.entries(workflow.workspaces).map(
                    ([name, workspace]) => [
                      name,
                      { ...workspace, path: resolve(root, workspace.path) },
                    ],
                  ),
                ),
              }
            : {}),
        },
      ]),
    ),
    workspaces: Object.fromEntries(
      Object.entries(raw.workspaces).map(([key, workspace]) => [
        key,
        { ...workspace, path: resolve(root, workspace.path) },
      ]),
    ),
    remotes: Object.fromEntries(
      Object.entries(raw.remotes).map(([key, remote]) => [
        key,
        resolve(root, remote),
      ]),
    ),
    ...(raw.trustedHistory ? { trustedHistory: raw.trustedHistory } : {}),
    // Absent: the methodology root is the project root (self-development and
    // every historical configuration load unchanged).
    ...(raw.methodologyRoot
      ? { methodologyRoot: resolve(dirname(path), raw.methodologyRoot) }
      : {}),
    ...(raw.origin ? { origin: raw.origin } : {}),
    ...(raw.validatorSources
      ? { validatorSources: { ...raw.validatorSources } }
      : {}),
  };
}
