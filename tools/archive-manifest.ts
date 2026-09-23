import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

export interface ArchiveArtifact {
  source: string;
  destination: string;
  identity: string;
}

interface EligibleBundle {
  kind: "attempt-ledger" | "terminal-attempt" | "evaluator-revision";
  eligible: true;
  source: string;
  destination: string;
}

interface IneligibleDecision {
  schemaVersion: 1;
  kind: "evaluator-promotion-plan";
  decision: "INELIGIBLE";
  reason: string;
}

interface EligibleDecision {
  schemaVersion: 1;
  kind: "evaluator-promotion-plan";
  decision: "ELIGIBLE";
  candidate: string;
  evaluatorRevision: string;
  attempt: number;
  artifacts: EligibleBundle[];
}

export type PromotionDecision = IneligibleDecision | EligibleDecision;

export interface ArchiveManifest {
  schemaVersion: 1;
  decisionIdentity: string;
  candidate: string;
  evaluatorRevision: string;
  attempt: number;
  artifacts: ArchiveArtifact[];
}

export class ArchiveManifestError extends Error {}

function identity(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function relativePath(value: unknown, name: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.startsWith("/") ||
    value.split(/[\\/]/).includes("..")
  )
    throw new ArchiveManifestError(
      `${name} must be a normalized relative path`,
    );
  return value;
}

function sourcePath(root: string, path: string): string {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    throw new ArchiveManifestError(
      "archive source escapes evaluator workspace",
    );
  return output;
}

function files(root: string, path: string): string[] {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink())
    throw new ArchiveManifestError(
      "archive source must not be a symbolic link",
    );
  if (stat.isFile()) return [relative(root, path)];
  if (!stat.isDirectory())
    throw new ArchiveManifestError(
      "archive source must be a regular file or directory",
    );
  return readdirSync(path, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => files(root, resolve(path, entry.name)));
}

function decision(value: unknown): PromotionDecision {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new ArchiveManifestError(
      "promotion eligibility decision must be an object",
    );
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== 1 || raw.kind !== "evaluator-promotion-plan")
    throw new ArchiveManifestError(
      "invalid evaluator promotion eligibility decision",
    );
  if (raw.decision === "INELIGIBLE") {
    if (typeof raw.reason !== "string" || raw.reason.trim().length === 0)
      throw new ArchiveManifestError(
        "ineligible promotion decision requires a reason",
      );
    return raw as unknown as IneligibleDecision;
  }
  if (
    raw.decision !== "ELIGIBLE" ||
    typeof raw.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.candidate) ||
    typeof raw.evaluatorRevision !== "string" ||
    !/^\d{3}$/.test(raw.evaluatorRevision) ||
    !Number.isSafeInteger(raw.attempt) ||
    (raw.attempt as number) < 1 ||
    !Array.isArray(raw.artifacts) ||
    raw.artifacts.length === 0
  )
    throw new ArchiveManifestError(
      "invalid eligible evaluator promotion decision",
    );
  const artifacts = raw.artifacts as unknown[];
  const kinds = new Map<string, number>();
  const sources = new Set<string>();
  const destinations = new Set<string>();
  for (const artifact of artifacts) {
    if (
      typeof artifact !== "object" ||
      artifact === null ||
      Array.isArray(artifact)
    )
      throw new ArchiveManifestError("invalid promotion eligibility artifact");
    const item = artifact as Record<string, unknown>;
    if (
      !["attempt-ledger", "terminal-attempt", "evaluator-revision"].includes(
        item.kind as string,
      ) ||
      item.eligible !== true
    )
      throw new ArchiveManifestError(
        "promotion artifact lacks an eligible recorded decision",
      );
    const source = relativePath(item.source, "promotion artifact source");
    const destination = relativePath(
      item.destination,
      "promotion artifact destination",
    );
    if (sources.has(source) || destinations.has(destination))
      throw new ArchiveManifestError("promotion artifact paths must be unique");
    sources.add(source);
    destinations.add(destination);
    kinds.set(item.kind as string, (kinds.get(item.kind as string) ?? 0) + 1);
  }
  if (kinds.get("attempt-ledger") !== 1 || !kinds.get("terminal-attempt"))
    throw new ArchiveManifestError(
      "eligible promotion decision must include the attempt ledger and terminal attempt history",
    );
  return raw as unknown as EligibleDecision;
}

export function buildArchiveManifest(
  root: string,
  decisionPath = ".eval/promotion-plan.json",
): ArchiveManifest {
  const workspace = resolve(root);
  const decisionRelative = relativePath(
    decisionPath,
    "promotion decision path",
  );
  const path = sourcePath(workspace, decisionRelative);
  let bytes: Buffer;
  try {
    bytes = readFileSync(path);
  } catch {
    throw new ArchiveManifestError(
      `missing recorded evaluator promotion eligibility decision: ${decisionRelative}`,
    );
  }
  const plan = decision(JSON.parse(bytes.toString("utf8")));
  if (plan.decision === "INELIGIBLE")
    throw new ArchiveManifestError(
      `recorded evaluator promotion decision is ineligible: ${plan.reason}`,
    );

  const artifacts: ArchiveArtifact[] = [];
  const destinations = new Set<string>();
  for (const bundle of plan.artifacts) {
    const source = sourcePath(
      workspace,
      relativePath(bundle.source, "promotion artifact source"),
    );
    const stat = lstatSync(source);
    if (stat.isSymbolicLink())
      throw new ArchiveManifestError(
        "archive source must not be a symbolic link",
      );
    if (
      (bundle.kind === "evaluator-revision" && !stat.isDirectory()) ||
      (bundle.kind !== "evaluator-revision" && !stat.isFile())
    )
      throw new ArchiveManifestError(
        `recorded ${bundle.kind} source has the wrong type`,
      );
    const listed = files(workspace, source);
    if (listed.length === 0)
      throw new ArchiveManifestError(
        "eligible evaluator revision bundle is empty",
      );
    const bundleRoot = relative(workspace, source);
    for (const item of listed) {
      const suffix = relative(bundleRoot, item);
      const destination = stat.isFile()
        ? bundle.destination
        : `${bundle.destination}/${suffix}`;
      if (destination === "promotion.json" || destinations.has(destination))
        throw new ArchiveManifestError(
          "promotion destination is reserved or duplicated",
        );
      destinations.add(destination);
      artifacts.push({
        source: item,
        destination,
        identity: identity(readFileSync(sourcePath(workspace, item))),
      });
    }
  }
  return {
    schemaVersion: 1,
    decisionIdentity: identity(bytes),
    candidate: plan.candidate,
    evaluatorRevision: plan.evaluatorRevision,
    attempt: plan.attempt,
    artifacts,
  };
}

function usage(): never {
  throw new ArchiveManifestError(
    "Usage: archive-manifest --source-root <private-workspace> --decision <relative-plan-path> --output <path>",
  );
}

function main(args: string[]): void {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key || !value || !key.startsWith("--") || values.has(key)) usage();
    values.set(key, value);
  }
  const root = values.get("--source-root");
  const plan = values.get("--decision");
  const output = values.get("--output");
  if (!root || !plan || !output || values.size !== 3) usage();
  const workspace = resolve(root);
  const destination = resolve(output);
  const delta = relative(workspace, destination);
  if (delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".."))
    throw new ArchiveManifestError(
      "archive manifest output must be outside evaluator workspace",
    );
  const manifest = buildArchiveManifest(workspace, plan);
  mkdirSync(dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${String(process.pid)}`;
  writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`, {
    flag: "wx",
  });
  renameSync(temporary, destination);
  process.stdout.write(
    `${JSON.stringify({ artifacts: manifest.artifacts.length, decisionIdentity: manifest.decisionIdentity })}\n`,
  );
}

if (import.meta.main) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
