import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import {
  buildMethodologyManifest,
  readTrustedHistory,
  type MethodologyManifest,
  type TrustedMethodologyEvent,
} from "../methodology-evolution.ts";
import { identity } from "./ledger.ts";
import { inside } from "./methodology.ts";
import type { MethodologyDefinition, Project } from "./model.ts";

function deny(reason: string): never {
  throw new Error(`trust equivalence denied: ${reason}`);
}

// Before a new Workflow Execution Grant binds a methodology, the project's
// current kernel definition must be the component-equivalent projection of its
// latest human-trusted manifest, reconstructed at that record's exact
// revision. Readable working-tree files are never trusted merely because they
// exist. The two aggregate identities differ by schema, so every component is
// compared instead.
export function assertTrustedMethodology(
  project: Project,
  definition: MethodologyDefinition,
): { record: TrustedMethodologyEvent; manifest: MethodologyManifest } {
  if (!project.trustedHistory)
    deny(`project ${project.id} declares no trusted methodology history`);
  if (!existsSync(resolve(project.root, project.trustedHistory)))
    deny(`project ${project.id} has no trusted methodology record`);
  let history: TrustedMethodologyEvent[];
  try {
    history = readTrustedHistory(inside(project.root, project.trustedHistory));
  } catch (error) {
    deny(
      `trusted methodology history is unreadable or invalid (${
        (error as Error).message.split("\n")[0] ?? "unknown"
      })`,
    );
  }
  const record = history.at(-1);
  if (!record) deny(`project ${project.id} has no trusted methodology record`);
  let manifest: MethodologyManifest;
  try {
    const repository = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: project.root,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
    const prefix = relative(
      realpathSync(repository),
      realpathSync(project.root),
    );
    if (prefix === ".." || prefix.startsWith("../") || isAbsolute(prefix))
      throw new Error("project root is outside its repository");
    const built = buildMethodologyManifest(
      repository,
      record.revision,
      project.policy,
      {
        projectPrefix: prefix,
        validatorSources: project.validatorSources ?? {},
      },
    );
    if (built.revision !== record.revision)
      throw new Error("trusted revision is not exact");
    manifest = built.manifest;
  } catch (error) {
    deny(
      `trusted methodology revision ${record.revision} is not reconstructible (${
        (error as Error).message.split("\n")[0] ?? "unknown"
      })`,
    );
  }
  if (manifest.id !== record.methodology)
    deny(
      `reconstructed manifest ${manifest.id} does not equal trusted record ${record.methodology}`,
    );
  if (definition.policyIdentity !== manifest.policy.identity)
    deny("active policy differs from the trusted methodology");
  const trustedRoles = Object.keys(manifest.roles).sort();
  const activeRoles = Object.keys(definition.roles).sort();
  if (trustedRoles.join("\n") !== activeRoles.join("\n"))
    deny("active role set differs from the trusted methodology");
  for (const [name, role] of Object.entries(definition.roles)) {
    const trusted = manifest.roles[name];
    if (!trusted || trusted.contract.identity !== role.contractIdentity)
      deny(`role contract ${name} differs from the trusted methodology`);
    if (
      trusted.skill.identity !== role.skill.identity ||
      trusted.skill.path !== role.skill.path
    )
      deny(`role skill ${name} differs from the trusted methodology`);
  }
  for (const [name, active] of Object.entries(definition.validators))
    if (manifest.validators[name]?.identity !== active)
      deny(`validator ${name} differs from the trusted methodology`);
  for (const [name, trusted] of Object.entries(manifest.validators)) {
    let current: string;
    try {
      current = identity(readFileSync(inside(project.root, trusted.path)));
    } catch {
      deny(`validator source ${name} is unavailable`);
    }
    if (current !== trusted.identity)
      deny(`validator source ${name} differs from the trusted methodology`);
  }
  return { record, manifest };
}
