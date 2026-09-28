import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import {
  buildMethodologyManifest,
  parseTrustedHistory,
  readTrustedHistory,
  type MethodologyManifest,
  type TrustedMethodologyEvent,
} from "../methodology-evolution.ts";
import { identity } from "./ledger.ts";
import { definitionFrom, inside } from "./methodology.ts";
import type {
  ArtifactValidators,
  MethodologyDefinition,
  MethodologySourceBinding,
  Project,
} from "./model.ts";
import { external, methodologyRoot } from "./roots.ts";

function deny(reason: string): never {
  throw new Error(`trust equivalence denied: ${reason}`);
}

function firstLine(error: unknown): string {
  return (error as Error).message.split("\n")[0] ?? "unknown";
}

interface TrustedSource {
  readonly record: TrustedMethodologyEvent;
  readonly manifest: MethodologyManifest;
  readonly repository: string;
  readonly prefix: string;
}

// Where trusted methodology authority is read from. `pin` is the exact
// methodology-repository commit whose committed trusted history is used; an
// external project always reads committed history (default: the methodology
// repository's current HEAD). `runtimeRoot` holds the running validator
// implementations that the equivalence gate compares.
export interface TrustOptions {
  readonly pin?: string;
  readonly runtimeRoot?: string;
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" });
}

// Resolves the latest human-trusted record and rebuilds its manifest from that
// record's exact revision. Readable working-tree files are never trusted
// merely because they exist. Methodology bytes come only from the methodology
// root's own Git repository, never from an external project's repository.
function trustedSource(
  project: Project,
  options: TrustOptions = {},
): TrustedSource {
  if (!project.trustedHistory)
    deny(`project ${project.id} declares no trusted methodology history`);
  const root = methodologyRoot(project);
  let repository: string;
  let prefix: string;
  try {
    repository = git(root, ["rev-parse", "--show-toplevel"]).trim();
    prefix = relative(realpathSync(repository), realpathSync(root));
    if (prefix === ".." || prefix.startsWith("../") || isAbsolute(prefix))
      throw new Error("methodology root is outside its repository");
  } catch (error) {
    deny(`methodology repository is unavailable (${firstLine(error)})`);
  }
  let history: TrustedMethodologyEvent[];
  if (external(project) || options.pin !== undefined) {
    let text: string;
    try {
      const pin = git(repository, [
        "rev-parse",
        "--verify",
        `${options.pin ?? "HEAD"}^{commit}`,
      ]).trim();
      text = git(repository, [
        "show",
        `${pin}:${prefix ? `${prefix}/` : ""}${project.trustedHistory}`,
      ]);
    } catch {
      deny(`project ${project.id} has no committed trusted methodology record`);
    }
    try {
      history = parseTrustedHistory(text);
    } catch (error) {
      deny(
        `trusted methodology history is unreadable or invalid (${firstLine(error)})`,
      );
    }
  } else {
    if (!existsSync(resolve(root, project.trustedHistory)))
      deny(`project ${project.id} has no trusted methodology record`);
    try {
      history = readTrustedHistory(inside(root, project.trustedHistory));
    } catch (error) {
      deny(
        `trusted methodology history is unreadable or invalid (${firstLine(error)})`,
      );
    }
  }
  const record = history.at(-1);
  if (!record) deny(`project ${project.id} has no trusted methodology record`);
  let manifest: MethodologyManifest;
  try {
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
      `trusted methodology revision ${record.revision} is not reconstructible (${firstLine(error)})`,
    );
  }
  if (manifest.id !== record.methodology)
    deny(
      `reconstructed manifest ${manifest.id} does not equal trusted record ${record.methodology}`,
    );
  return { record, manifest, repository, prefix };
}

// The methodology every new Workflow Execution Grant binds: the latest trusted
// record's committed bytes, read from Git objects at its exact revision. A
// candidate working tree (edited, staged or committed) can neither satisfy nor
// defeat this resolution, so trusted N stays usable while N+1 is developed in
// the same checkout. The definition still passes the full component
// equivalence gate, including the running validator implementations.
export function trustedDefinition(
  project: Project,
  validators: ArtifactValidators = {},
  options: TrustOptions = {},
): MethodologyDefinition {
  const { record, repository, prefix } = trustedSource(project, options);
  let definition: MethodologyDefinition;
  try {
    definition = definitionFrom(
      project.policy,
      (path) =>
        execFileSync(
          "git",
          ["show", `${record.revision}:${prefix ? `${prefix}/` : ""}${path}`],
          { cwd: repository, encoding: "utf8", stdio: "pipe" },
        ),
      validators,
    );
  } catch (error) {
    deny(
      `trusted methodology revision ${record.revision} is not loadable (${firstLine(error)})`,
    );
  }
  assertTrustedMethodology(project, definition, options);
  return definition;
}

// The host-written methodology source recorded in every new Workflow
// Execution Grant (design-map D3).
export function trustedBinding(
  project: Project,
  options: TrustOptions = {},
): MethodologySourceBinding {
  const { record, manifest, repository } = trustedSource(project, options);
  return {
    methodologyRepository: realpathSync(repository),
    trusted: {
      sequence: record.sequence,
      manifest: manifest.id,
      revision: record.revision,
    },
  };
}

// A kernel definition is trusted only when it is the component-equivalent
// projection of the project's latest human-trusted manifest, reconstructed at
// that record's exact revision. The two aggregate identities differ by schema,
// so every component is compared instead.
export function assertTrustedMethodology(
  project: Project,
  definition: MethodologyDefinition,
  options: TrustOptions = {},
): { record: TrustedMethodologyEvent; manifest: MethodologyManifest } {
  const { record, manifest } = trustedSource(project, options);
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
      current = identity(
        readFileSync(
          inside(options.runtimeRoot ?? methodologyRoot(project), trusted.path),
        ),
      );
    } catch {
      deny(`validator source ${name} is unavailable`);
    }
    if (current !== trusted.identity)
      deny(`validator source ${name} differs from the trusted methodology`);
  }
  return { record, manifest };
}
