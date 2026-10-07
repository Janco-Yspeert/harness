// Evaluation facts, attempt lifecycle and host-owned post-PASS archival.
//
// The evaluation fact (verdict, evidence identities, provenance) is immutable
// and owned by the evaluator path. The archive record is written only by the
// host, references the fact by identity and never rewrites it. Archive failure
// is recoverable as archive failure by re-running the archive.
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { canonical, contentId, identity } from "./kernel/ledger.ts";

export type Verdict = "PASS" | "FAIL" | "BLOCKED";
const VERDICTS: readonly string[] = ["PASS", "FAIL", "BLOCKED"];

interface AttemptBase {
  readonly attempt: number;
  readonly execution: string;
  readonly evaluatorRevision: string;
}
export type AttemptEntry =
  // Allocated, no finalized semantic result: execution provenance only.
  | (AttemptBase & { readonly state: "NONTERMINAL"; readonly reason: string })
  // A finalized result bound to its exact terminal artifact.
  | (AttemptBase & {
      readonly state: "TERMINAL";
      readonly result: Verdict;
      readonly artifact: { readonly path: string; readonly identity: string };
    })
  // Durable history proves the artifact existed; it is now unavailable.
  | (AttemptBase & {
      readonly state: "LOST";
      readonly result: Verdict;
      readonly artifact: { readonly path: string; readonly identity: string };
    });

// What the host observed for one allocated attempt. `recorded` is the durable
// authoritative history binding the terminal artifact (a prior record), never
// merely an expected archive path.
export interface ObservedAttempt {
  readonly attempt?: number;
  readonly execution: string;
  readonly evaluatorRevision: string;
  readonly nonterminalReason?: string;
  readonly result?: Verdict;
  readonly recorded?: { readonly path: string; readonly identity: string };
}

function safePath(root: string, path: string): string {
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (!path || delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    throw new Error(`path escapes evaluator workspace: ${path}`);
  return target;
}

function readRegular(root: string, path: string): Buffer | null {
  const target = safePath(root, path);
  if (!existsSync(target)) return null;
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error(`not a regular file: ${path}`);
  return readFileSync(target);
}

// Classifies the whole ordered attempt sequence. A never-produced artifact is
// not LOST; only a recorded-then-missing artifact is.
export function classifyAttempts(
  evaluatorRoot: string,
  observed: readonly ObservedAttempt[],
): AttemptEntry[] {
  return observed.map((entry, index): AttemptEntry => {
    const base = {
      attempt: entry.attempt ?? index + 1,
      execution: entry.execution,
      evaluatorRevision: entry.evaluatorRevision,
    };
    if (entry.result === undefined) {
      if (entry.recorded)
        throw new Error("a recorded artifact requires a finalized result");
      return {
        ...base,
        state: "NONTERMINAL",
        reason: entry.nonterminalReason ?? "no semantic result finalized",
      };
    }
    if (!VERDICTS.includes(entry.result) || !entry.recorded)
      throw new Error(
        "a terminal attempt must bind its result and recorded artifact identity",
      );
    const bytes = readRegular(evaluatorRoot, entry.recorded.path);
    if (bytes === null)
      return {
        ...base,
        state: "LOST",
        result: entry.result,
        artifact: entry.recorded,
      };
    if (identity(bytes) !== entry.recorded.identity)
      throw new Error(
        `terminal artifact changed since it was recorded: ${entry.recorded.path}`,
      );
    return {
      ...base,
      state: "TERMINAL",
      result: entry.result,
      artifact: entry.recorded,
    };
  });
}

export interface EvaluationFact {
  readonly schemaVersion: 1;
  readonly kind: "evaluation-fact";
  readonly result: Verdict;
  readonly candidate: string;
  readonly evaluatorRevision: string;
  readonly evaluatorRevisionIdentity: string;
  readonly resultIdentity: string;
  readonly attempts: readonly AttemptEntry[];
}

export function evaluationFactIdentity(fact: EvaluationFact): string {
  return contentId(fact);
}

function validateFact(fact: EvaluationFact): void {
  const last = fact.attempts.at(-1);
  if (
    !VERDICTS.includes(fact.result) ||
    !last ||
    last.state !== "TERMINAL" ||
    last.result !== fact.result ||
    last.artifact.identity !== fact.resultIdentity ||
    last.evaluatorRevision !== fact.evaluatorRevision ||
    fact.attempts.some((entry, index) => entry.attempt !== index + 1)
  )
    throw new Error(
      "evaluation fact must end in its own terminal result over an ordered attempt sequence",
    );
}

export interface ArchiveItem {
  readonly destination: string;
  readonly identity: string;
  // Exactly one of: a source path below the evaluator workspace, or generated
  // canonical bytes derived from the exact evidence identities.
  readonly source?: string;
  readonly content?: string;
}

export interface ArchivePlan {
  readonly evaluationFact: string;
  readonly items: readonly ArchiveItem[];
}

function parseFreeze(bytes: Buffer, revision: string): Record<string, string> {
  const raw = JSON.parse(bytes.toString("utf8")) as {
    evaluatorRevision?: unknown;
    artifacts?: unknown;
  };
  if (
    raw.evaluatorRevision !== revision ||
    typeof raw.artifacts !== "object" ||
    raw.artifacts === null ||
    Array.isArray(raw.artifacts)
  )
    throw new Error(`freeze metadata does not describe revision ${revision}`);
  const inventory = raw.artifacts as Record<string, string>;
  if (Object.keys(inventory).length === 0)
    throw new Error(`revision ${revision} has an empty inventory`);
  return inventory;
}

// Derives the archive plan from trusted policy (this function) and the exact
// evidence identities (the fact and the frozen revisions). There is no
// evaluator eligibility judgment. The active revision is archived directly
// from its canonical `.eval/` location; superseded revisions from
// `.eval/revisions/<id>/`. Any missing or changed required byte fails.
export function buildArchivePlan(
  evaluatorRoot: string,
  fact: EvaluationFact,
): ArchivePlan {
  validateFact(fact);
  const items: ArchiveItem[] = [];
  const factJson = `${canonical(fact)}\n`;
  items.push({
    destination: "evaluation-fact.json",
    identity: identity(factJson),
    content: factJson,
  });
  for (const entry of fact.attempts) {
    if (entry.state !== "TERMINAL") continue;
    const bytes = readRegular(evaluatorRoot, entry.artifact.path);
    if (bytes === null || identity(bytes) !== entry.artifact.identity)
      throw new Error(
        `terminal attempt ${String(entry.attempt)} artifact is missing or changed`,
      );
    items.push({
      source: entry.artifact.path,
      destination: `attempts/${String(entry.attempt).padStart(3, "0")}/eval-result.md`,
      identity: entry.artifact.identity,
    });
  }
  const revisions = [
    ...new Set(fact.attempts.map((entry) => entry.evaluatorRevision)),
  ].sort();
  for (const revision of revisions) {
    const active = revision === fact.evaluatorRevision;
    const base = active ? "" : `revisions/${revision}/`;
    const freezePath = `.eval/${base}freeze.json`;
    const freeze = readRegular(evaluatorRoot, freezePath);
    if (freeze === null)
      throw new Error(
        `evaluator revision ${revision} freeze metadata is missing`,
      );
    if (active && identity(freeze) !== fact.evaluatorRevisionIdentity)
      throw new Error("active evaluator revision identity mismatch");
    items.push({
      source: freezePath,
      destination: `freeze/${revision}.json`,
      identity: identity(freeze),
    });
    for (const [path, expected] of Object.entries(
      parseFreeze(freeze, revision),
    )) {
      const source = `.eval/${base}${path}`;
      const bytes = readRegular(evaluatorRoot, source);
      if (bytes === null || identity(bytes) !== expected)
        throw new Error(
          `revision ${revision} artifact is missing or changed: ${path}`,
        );
      items.push({
        source,
        destination: `revisions/${revision}/${path}`,
        identity: expected,
      });
    }
  }
  return { evaluationFact: evaluationFactIdentity(fact), items };
}

export interface ArchiveRecord {
  readonly schemaVersion: 1;
  readonly kind: "archive-record";
  // `incomplete`: archived faithfully, but known evidence is LOST.
  readonly state: "complete" | "incomplete" | "failed";
  readonly evaluationFact: string;
  readonly artifacts: readonly { destination: string; identity: string }[];
  readonly failure?: string;
}

export function archiveRecordIdentity(record: ArchiveRecord): string {
  return contentId(record);
}

// Host-owned byte movement. Stages beside the destination and renames only
// after every identity verifies, so a partial archive is never left behind or
// reported complete. Failure is returned as an archive record; the evaluation
// fact is never touched.
export function executeArchive(
  evaluatorRoot: string,
  fact: EvaluationFact,
  destination: string,
): ArchiveRecord {
  const factIdentity = evaluationFactIdentity(fact);
  const staging = `${destination}.staging`;
  try {
    if (existsSync(destination)) throw new Error("archive destination exists");
    const plan = buildArchivePlan(evaluatorRoot, fact);
    rmSync(staging, { recursive: true, force: true });
    for (const item of plan.items) {
      const bytes =
        item.content !== undefined
          ? Buffer.from(item.content)
          : readRegular(evaluatorRoot, item.source as string);
      if (bytes === null || identity(bytes) !== item.identity)
        throw new Error(
          `required bytes changed during archival: ${item.destination}`,
        );
      const target = join(staging, item.destination);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes, { mode: 0o444 });
    }
    const lost = fact.attempts.some((entry) => entry.state === "LOST");
    const record: ArchiveRecord = {
      schemaVersion: 1,
      kind: "archive-record",
      state: lost ? "incomplete" : "complete",
      evaluationFact: plan.evaluationFact,
      artifacts: plan.items.map((item) => ({
        destination: item.destination,
        identity: item.identity,
      })),
    };
    writeFileSync(
      join(staging, "archive-record.json"),
      `${canonical(record)}\n`,
      { mode: 0o444 },
    );
    renameSync(staging, destination);
    return record;
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    return {
      schemaVersion: 1,
      kind: "archive-record",
      state: "failed",
      evaluationFact: factIdentity,
      artifacts: [],
      failure: error instanceof Error ? error.message : String(error),
    };
  }
}

// Policy: only a complete archive of exactly this evaluation fact permits
// As-Built, adoption and promotion. It never inspects or alters the verdict.
export function closeoutPermitted(
  fact: EvaluationFact,
  record: ArchiveRecord,
): boolean {
  return (
    record.state === "complete" &&
    record.evaluationFact === evaluationFactIdentity(fact)
  );
}

export interface AllocatedAttempt {
  readonly attempt: number;
  readonly execution: string;
  readonly candidate: string;
  readonly evaluatorRevision: string;
  readonly semanticResults?: readonly {
    readonly execution: string;
    readonly result: Verdict;
  }[];
  readonly finalizations?: readonly {
    readonly attempt: number;
    readonly execution: string;
    readonly candidate: string;
    readonly evaluatorRevision: string;
    readonly result: Verdict;
  }[];
}

interface PrivateAttempt {
  readonly attempt: number;
  readonly implementation: string;
  readonly evaluatorRevision: string;
  readonly evaluatorRevisionIdentity: string;
  readonly status: "ALLOCATED" | Verdict;
  readonly resultPath?: string;
  readonly resultIdentity?: string;
}

function privateAttempts(value: unknown): PrivateAttempt[] {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("attempt ledger must be an object");
  const ledger = value as Record<string, unknown>;
  if (ledger.schemaVersion !== 2 || !Array.isArray(ledger.attempts))
    throw new Error("attempt ledger does not use the canonical schema");
  const seen = new Set<number>();
  return ledger.attempts.map((raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw))
      throw new Error("private attempt entry is malformed");
    const entry = raw as Record<string, unknown>;
    if (typeof entry.id !== "string" || !/^\d{3}$/.test(entry.id))
      throw new Error("private attempt entry is missing its canonical id");
    const attempt = Number(entry.id);
    if (attempt < 1 || String(attempt).padStart(3, "0") !== entry.id)
      throw new Error(`private attempt id is invalid: ${entry.id}`);
    if (seen.has(attempt))
      throw new Error(`duplicate private attempt id: ${entry.id}`);
    seen.add(attempt);
    if (
      typeof entry.implementation !== "string" ||
      typeof entry.evaluatorRevision !== "string" ||
      typeof entry.evaluatorRevisionIdentity !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(entry.evaluatorRevisionIdentity) ||
      typeof entry.status !== "string" ||
      !["ALLOCATED", ...VERDICTS].includes(entry.status)
    )
      throw new Error(`private attempt ${entry.id} is malformed`);
    if (entry.status === "ALLOCATED") {
      if (entry.resultIdentity !== null && entry.resultIdentity !== undefined)
        throw new Error(`allocated private attempt ${entry.id} has a result`);
      return {
        attempt,
        implementation: entry.implementation,
        evaluatorRevision: entry.evaluatorRevision,
        evaluatorRevisionIdentity: entry.evaluatorRevisionIdentity,
        status: "ALLOCATED",
      };
    }
    const expectedPath = `.eval/attempts/${entry.id}/eval-result.md`;
    if (
      entry.resultPath !== expectedPath ||
      typeof entry.resultIdentity !== "string" ||
      !/^sha256:[a-f0-9]{64}$/.test(entry.resultIdentity)
    )
      throw new Error(
        `terminal private attempt ${entry.id} cannot be bound to exact evidence`,
      );
    return {
      attempt,
      implementation: entry.implementation,
      evaluatorRevision: entry.evaluatorRevision,
      evaluatorRevisionIdentity: entry.evaluatorRevisionIdentity,
      status: entry.status as Verdict,
      resultPath: entry.resultPath,
      resultIdentity: entry.resultIdentity,
    };
  });
}

// Host derivation of the post-PASS archive from the private attempt ledger and
// the host's own allocation records. No evaluator-authored plan or eligibility
// decision is read.
export function deriveHostArchive(
  evaluatorRoot: string,
  candidate: string,
  allocations: readonly AllocatedAttempt[],
): ArchivePlan {
  const ledgerBytes = readRegular(evaluatorRoot, ".eval/attempt-ledger.json");
  if (ledgerBytes === null) throw new Error("attempt ledger is missing");
  const privateEntries = privateAttempts(
    JSON.parse(ledgerBytes.toString("utf8")),
  );
  if (allocations.length === 0) throw new Error("host has no allocations");
  allocations.forEach((allocation, index) => {
    if (allocation.attempt !== index + 1)
      throw new Error("host allocation history is not complete and ordered");
  });
  const allocationIds = new Set(allocations.map((item) => item.attempt));
  for (const entry of privateEntries)
    if (!allocationIds.has(entry.attempt))
      throw new Error(
        `private attempt ${String(entry.attempt).padStart(3, "0")} has no host allocation`,
      );
  const byAttempt = new Map(
    privateEntries.map((entry) => [entry.attempt, entry] as const),
  );
  const observed: ObservedAttempt[] = allocations.map((allocation) => {
    const attempt = String(allocation.attempt);
    const semantic = allocation.semanticResults ?? [];
    const finalized = allocation.finalizations ?? [];
    if (semantic.length > 1)
      throw new Error(`attempt ${attempt} has ambiguous semantic results`);
    if (finalized.length > 1)
      throw new Error(`attempt ${attempt} has ambiguous finalizations`);
    const result = semantic[0];
    const finalization = finalized[0];
    if (result && result.execution !== allocation.execution)
      throw new Error(`attempt ${attempt} semantic execution conflicts`);
    if (result && !VERDICTS.includes(result.result))
      throw new Error(`attempt ${attempt} semantic result is invalid`);
    if (
      finalization &&
      (finalization.attempt !== allocation.attempt ||
        finalization.execution !== allocation.execution ||
        finalization.candidate !== allocation.candidate ||
        finalization.evaluatorRevision !== allocation.evaluatorRevision)
    )
      throw new Error(`attempt ${attempt} finalization conflicts`);
    if (finalization && !result)
      throw new Error(`attempt ${attempt} finalized without a semantic result`);
    if (finalization && result && finalization.result !== result.result)
      throw new Error(`attempt ${attempt} result conflicts`);
    const entry = byAttempt.get(allocation.attempt);
    if (entry) {
      if (entry.implementation !== `git:${allocation.candidate}`)
        throw new Error(`private attempt ${attempt} candidate conflicts`);
      if (entry.evaluatorRevision !== allocation.evaluatorRevision)
        throw new Error(`private attempt ${attempt} revision conflicts`);
    }
    const base = {
      attempt: allocation.attempt,
      execution: allocation.execution,
      evaluatorRevision: allocation.evaluatorRevision,
    };
    if (!result) {
      if (entry && entry.status !== "ALLOCATED")
        throw new Error(
          `private attempt ${attempt} is terminal without a host semantic result`,
        );
      return {
        ...base,
        nonterminalReason: "no evaluator semantic result",
      };
    }
    if (!entry || entry.status === "ALLOCATED")
      throw new Error(
        `terminal evidence gap for attempt ${attempt}: exact private evidence is unavailable`,
      );
    if (entry.status !== result.result)
      throw new Error(`private attempt ${attempt} result conflicts`);
    return {
      ...base,
      result: result.result,
      recorded: {
        path: entry.resultPath as string,
        identity: entry.resultIdentity as string,
      },
    };
  });
  const attempts = classifyAttempts(evaluatorRoot, observed);
  const last = attempts.at(-1);
  const freeze = readRegular(evaluatorRoot, ".eval/freeze.json");
  if (
    !last ||
    last.state !== "TERMINAL" ||
    last.result !== "PASS" ||
    freeze === null
  )
    throw new Error("archive requires a terminal PASS and frozen revision");
  return buildArchivePlan(evaluatorRoot, {
    schemaVersion: 1,
    kind: "evaluation-fact",
    result: last.result,
    candidate,
    evaluatorRevision: last.evaluatorRevision,
    evaluatorRevisionIdentity: identity(freeze),
    resultIdentity: last.artifact.identity,
    attempts,
  });
}
