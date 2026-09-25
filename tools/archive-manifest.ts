// Evaluator promotion plan -> archive manifest.
//
// This module is the single definition of the evaluator promotion plan: its
// path, schema version and validation. The evaluator skill, the
// evaluator-verify contract (`promotion.plan`), tests and the host action all
// use this one definition. The utility reads only the real persisted plan; it
// never reconstructs a plan from prose or a public hash.
import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
  type Stats,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import { MAX_ACTION_ARTIFACTS } from "../src/executors/protocol.ts";

// The one plan path, relative to the evaluator's private source workspace.
export const PROMOTION_PLAN_PATH = ".eval/promotion-plan.json";
// The supported plan schema. Version 2 added the required attempt history,
// revision decisions and recorded source identities/inventories.
export const PROMOTION_PLAN_SCHEMA_VERSION = 2;
// The plan itself is archived at this reserved destination so the public
// `promotionPlan.identity` is independently checkable against its bytes.
export const PROMOTION_PLAN_DESTINATION = "promotion-plan.json";
// B, the worker protocol's one requestAction artifact bound (defined in
// src/executors/protocol.ts). A larger eligible manifest is refused here; its
// PASS stays genuine but archival is truthfully incomplete.
export const MAX_PROMOTION_ARTIFACTS = MAX_ACTION_ARTIFACTS;

export interface ArchiveArtifact {
  source: string;
  destination: string;
  identity: string;
}

type AttemptResult = "PASS" | "FAIL" | "BLOCKED";

interface FileBundle {
  kind: "attempt-ledger" | "terminal-attempt";
  eligible: true;
  source: string;
  destination: string;
  identity: string;
  attempt?: number;
}

interface RevisionBundle {
  kind: "evaluator-revision";
  eligible: true;
  source: string;
  destination: string;
  evaluatorRevision: string;
  // Exact bundle inventory: path relative to `source` -> sha256 identity.
  inventory: Record<string, string>;
}

type EligibleBundle = FileBundle | RevisionBundle;

interface IneligibleDecision {
  schemaVersion: typeof PROMOTION_PLAN_SCHEMA_VERSION;
  kind: "evaluator-promotion-plan";
  decision: "INELIGIBLE";
  reason: string;
  candidate?: string;
  evaluatorRevision?: string;
  attempt?: number;
}

interface EligibleDecision {
  schemaVersion: typeof PROMOTION_PLAN_SCHEMA_VERSION;
  kind: "evaluator-promotion-plan";
  decision: "ELIGIBLE";
  candidate: string;
  evaluatorRevision: string;
  attempt: number;
  // The complete attempt history of the cycle, 1..attempt, in order.
  attempts: Array<{
    attempt: number;
    evaluatorRevision: string;
    result: AttemptResult;
  }>;
  // One explicit decision per evaluator revision used by the history.
  revisions: Array<
    | { evaluatorRevision: string; eligible: true }
    | { evaluatorRevision: string; eligible: false; reason: string }
  >;
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

function fail(message: string): never {
  throw new ArchiveManifestError(message);
}

function identity(bytes: Buffer | string): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function relativePath(value: unknown, name: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.startsWith("/") ||
    value.split(/[\\/]/).some((part) => part === ".." || part === "")
  )
    fail(`${name} must be a normalized relative path`);
  return value;
}

function sourcePath(root: string, path: string): string {
  const output = resolve(root, path);
  const delta = relative(root, output);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("archive source escapes evaluator workspace");
  return output;
}

function contentIdentity(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^sha256:[a-f0-9]{64}$/.test(value))
    fail(`${name} must be a sha256 content identity`);
  return value;
}

function revisionId(value: unknown, name: string): string {
  if (typeof value !== "string" || !/^\d{3}$/.test(value))
    fail(`${name} must be a three-digit evaluator revision`);
  return value;
}

function positive(value: unknown, name: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1)
    fail(`${name} must be a positive integer`);
  return value as number;
}

function files(root: string, path: string): string[] {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) fail("archive source must not be a symbolic link");
  if (stat.isFile()) return [relative(root, path)];
  if (!stat.isDirectory())
    fail("archive source must be a regular file or directory");
  return readdirSync(path, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => files(root, resolve(path, entry.name)));
}

// Validates a parsed plan against the one supported schema. Throws
// ArchiveManifestError for any unsupported, incomplete or unsafe plan.
export function parsePromotionPlan(value: unknown): PromotionDecision {
  if (!isRecord(value))
    fail("promotion eligibility decision must be an object");
  if (value.kind !== "evaluator-promotion-plan")
    fail("invalid evaluator promotion eligibility decision");
  if (value.schemaVersion !== PROMOTION_PLAN_SCHEMA_VERSION)
    fail(
      `unsupported evaluator promotion plan schemaVersion ${String(value.schemaVersion)}`,
    );
  if (value.decision === "INELIGIBLE") {
    if (typeof value.reason !== "string" || value.reason.trim().length === 0)
      fail("ineligible promotion decision requires a reason");
    return value as unknown as IneligibleDecision;
  }
  if (
    value.decision !== "ELIGIBLE" ||
    typeof value.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(value.candidate)
  )
    fail("invalid eligible evaluator promotion decision");
  const evaluatorRevision = revisionId(
    value.evaluatorRevision,
    "evaluatorRevision",
  );
  const attempt = positive(value.attempt, "attempt");

  // Complete attempt history: exactly 1..attempt, terminal PASS last.
  if (!Array.isArray(value.attempts) || value.attempts.length !== attempt)
    fail("promotion plan must record the complete attempt history");
  const historyRevisions = new Set<string>();
  for (const [index, entry] of (value.attempts as unknown[]).entries()) {
    if (!isRecord(entry) || entry.attempt !== index + 1)
      fail("promotion plan attempt history is incomplete or out of order");
    historyRevisions.add(
      revisionId(entry.evaluatorRevision, "attempt evaluatorRevision"),
    );
    if (!["PASS", "FAIL", "BLOCKED"].includes(entry.result as string))
      fail("promotion plan attempt history has an invalid result");
  }
  const terminal = (value.attempts as Array<Record<string, unknown>>).at(-1);
  if (
    terminal?.result !== "PASS" ||
    terminal.evaluatorRevision !== evaluatorRevision
  )
    fail("promotion plan terminal attempt must be the passing attempt");

  // One explicit decision per revision used by the history.
  if (!Array.isArray(value.revisions))
    fail("promotion plan must record revision eligibility decisions");
  const eligibleRevisions = new Set<string>();
  const decided = new Set<string>();
  for (const entry of value.revisions as unknown[]) {
    if (!isRecord(entry)) fail("invalid revision eligibility decision");
    const revision = revisionId(
      entry.evaluatorRevision,
      "revision decision evaluatorRevision",
    );
    if (decided.has(revision) || !historyRevisions.has(revision))
      fail("revision eligibility decisions must match the attempt history");
    decided.add(revision);
    if (entry.eligible === true) eligibleRevisions.add(revision);
    else if (
      entry.eligible !== false ||
      typeof entry.reason !== "string" ||
      entry.reason.trim().length === 0
    )
      fail("an ineligible revision decision requires a reason");
  }
  if (decided.size !== historyRevisions.size)
    fail("every evaluator revision in the history requires a decision");

  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0)
    fail("invalid eligible evaluator promotion decision");
  const sources = new Set<string>();
  const destinations = new Set<string>();
  const attempts = new Set<number>();
  const bundledRevisions = new Set<string>();
  let ledgers = 0;
  for (const artifact of value.artifacts as unknown[]) {
    if (!isRecord(artifact)) fail("invalid promotion eligibility artifact");
    if (
      !["attempt-ledger", "terminal-attempt", "evaluator-revision"].includes(
        artifact.kind as string,
      ) ||
      artifact.eligible !== true
    )
      fail("promotion artifact lacks an eligible recorded decision");
    const source = relativePath(artifact.source, "promotion artifact source");
    const destination = relativePath(
      artifact.destination,
      "promotion artifact destination",
    );
    if (sources.has(source) || destinations.has(destination))
      fail("promotion artifact paths must be unique");
    sources.add(source);
    destinations.add(destination);
    if (artifact.kind === "evaluator-revision") {
      const revision = revisionId(
        artifact.evaluatorRevision,
        "revision bundle evaluatorRevision",
      );
      if (!eligibleRevisions.has(revision) || bundledRevisions.has(revision))
        fail("revision bundles must match the eligible revision decisions");
      bundledRevisions.add(revision);
      if (
        !isRecord(artifact.inventory) ||
        Object.keys(artifact.inventory).length === 0
      )
        fail("revision bundle requires its frozen inventory");
      for (const [path, item] of Object.entries(artifact.inventory)) {
        relativePath(path, "revision inventory path");
        contentIdentity(item, "revision inventory identity");
      }
    } else {
      contentIdentity(artifact.identity, "promotion artifact identity");
      if (artifact.kind === "attempt-ledger") ledgers += 1;
      else {
        const number = positive(artifact.attempt, "terminal attempt number");
        if (number > attempt || attempts.has(number))
          fail("terminal attempts must match the attempt history");
        attempts.add(number);
      }
    }
  }
  if (ledgers !== 1 || attempts.size !== attempt)
    fail(
      "eligible promotion decision must include the attempt ledger and terminal attempt history",
    );
  if (bundledRevisions.size !== eligibleRevisions.size)
    fail("every eligible evaluator revision requires its complete bundle");
  return value as unknown as EligibleDecision;
}

function ledgerMatches(bytes: Buffer, plan: EligibleDecision): void {
  let ledger: unknown;
  try {
    ledger = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("attempt ledger is not readable JSON");
  }
  const entries = isRecord(ledger) ? ledger.attempts : undefined;
  if (!Array.isArray(entries) || entries.length !== plan.attempts.length)
    fail("attempt ledger does not match the plan's attempt history");
  for (const [index, entry] of (entries as unknown[]).entries()) {
    const expected = plan.attempts[index];
    if (
      !expected ||
      !isRecord(entry) ||
      Number(entry.id) !== expected.attempt ||
      entry.status !== expected.result
    )
      fail("attempt ledger does not match the plan's attempt history");
  }
}

export function buildArchiveManifest(
  root: string,
  decisionPath = PROMOTION_PLAN_PATH,
): ArchiveManifest {
  const workspace = resolve(root);
  const decisionRelative = relativePath(
    decisionPath,
    "promotion decision path",
  );
  const path = sourcePath(workspace, decisionRelative);
  let bytes: Buffer;
  try {
    if (lstatSync(path).isSymbolicLink())
      fail("promotion decision must not be a symbolic link");
    bytes = readFileSync(path);
  } catch (error) {
    if (error instanceof ArchiveManifestError) throw error;
    fail(
      `missing recorded evaluator promotion eligibility decision: ${decisionRelative}`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("recorded evaluator promotion decision is not readable JSON");
  }
  const plan = parsePromotionPlan(parsed);
  if (plan.decision === "INELIGIBLE")
    fail(`recorded evaluator promotion decision is ineligible: ${plan.reason}`);

  const planIdentity = identity(bytes);
  const artifacts: ArchiveArtifact[] = [
    {
      source: decisionRelative,
      destination: PROMOTION_PLAN_DESTINATION,
      identity: planIdentity,
    },
  ];
  const destinations = new Set<string>([PROMOTION_PLAN_DESTINATION]);
  const add = (source: string, destination: string, bytes: Buffer): void => {
    if (destination === "promotion.json" || destinations.has(destination))
      fail("promotion destination is reserved or duplicated");
    destinations.add(destination);
    artifacts.push({ source, destination, identity: identity(bytes) });
  };
  for (const bundle of plan.artifacts) {
    const source = sourcePath(workspace, bundle.source);
    let stat: Stats;
    try {
      stat = lstatSync(source);
    } catch {
      fail(`recorded ${bundle.kind} source is missing: ${bundle.source}`);
    }
    if (stat.isSymbolicLink())
      fail("archive source must not be a symbolic link");
    if (bundle.kind === "evaluator-revision") {
      if (!stat.isDirectory())
        fail(`recorded ${bundle.kind} source has the wrong type`);
      const listed = files(workspace, source).map((item) => ({
        item,
        suffix: relative(relative(workspace, source), item)
          .split(sep)
          .join("/"),
      }));
      const inventory = Object.keys(bundle.inventory).sort();
      if (
        listed.length !== inventory.length ||
        listed.some(({ suffix }) => !Object.hasOwn(bundle.inventory, suffix))
      )
        fail(
          "evaluator revision bundle is partial or differs from its inventory",
        );
      for (const { item, suffix } of listed) {
        const content = readFileSync(sourcePath(workspace, item));
        if (identity(content) !== bundle.inventory[suffix])
          fail("evaluator revision bundle differs from its frozen inventory");
        add(item, `${bundle.destination}/${suffix}`, content);
      }
      continue;
    }
    if (!stat.isFile())
      fail(`recorded ${bundle.kind} source has the wrong type`);
    const content = readFileSync(source);
    if (identity(content) !== bundle.identity)
      fail(`recorded ${bundle.kind} source changed after planning`);
    if (bundle.kind === "attempt-ledger") ledgerMatches(content, plan);
    add(bundle.source, bundle.destination, content);
  }
  if (artifacts.length > MAX_PROMOTION_ARTIFACTS)
    fail(
      `archive manifest has ${String(artifacts.length)} artifacts, above the ${String(MAX_PROMOTION_ARTIFACTS)}-artifact host action bound`,
    );
  return {
    schemaVersion: 1,
    decisionIdentity: planIdentity,
    candidate: plan.candidate,
    evaluatorRevision: plan.evaluatorRevision,
    attempt: plan.attempt,
    artifacts,
  };
}

function usage(): never {
  fail(
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
  const plan = values.get("--decision") ?? PROMOTION_PLAN_PATH;
  const output = values.get("--output");
  if (
    !root ||
    !output ||
    [...values.keys()].some(
      (key) => !["--source-root", "--decision", "--output"].includes(key),
    )
  )
    usage();
  const workspace = resolve(root);
  const destination = resolve(output);
  const delta = relative(workspace, destination);
  if (delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".."))
    fail("archive manifest output must be outside evaluator workspace");
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
