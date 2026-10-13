import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import { parseFreeze, privateAttempts } from "../evaluation-closeout.ts";
import { canonical, identity, object } from "./ledger.ts";
import type { Data, LedgerEvent } from "./model.ts";

// One-use, exact-state migration of the live 014m legacy private attempt
// ledger. Every bound fact below is a public canonical host event; private
// result and freeze identities are derived from evaluator bytes at execution
// time and never echoed beyond their identities.
export interface LedgerMigrationBinding {
  readonly workflow: string;
  readonly legacyLedgerIdentity: string;
  readonly candidate: string;
  readonly grantExecution: string;
  readonly historyDirectory: string;
  readonly attempts: readonly {
    readonly attempt: number;
    readonly evaluatorRevision: string;
    readonly allocationEvent: string;
    readonly execution: string;
    readonly roleGrant: string;
    readonly semanticResult: string;
    readonly finalizationEvent: string;
    readonly result: string;
  }[];
}

export const LEDGER_MIGRATION_014M: LedgerMigrationBinding = {
  workflow: "014m-pre-semantic-implementation-correction",
  legacyLedgerIdentity:
    "sha256:af312e4331ef69b792fd25e8c0d7e701435cdbd881f97087decf52e6eb281e62",
  candidate: "3e753a4a732c87fc5b42e9e3cf771482aba6a522",
  grantExecution: "84f7b735-63e3-46d2-ac12-88e115b26a7d",
  historyDirectory: ".eval/migrations/014m-attempt-ledger",
  attempts: [
    {
      attempt: 12,
      evaluatorRevision: "001",
      allocationEvent: "f9f5c34a-c8f1-40e8-bb75-a8d2e3514bd6",
      execution: "0daa0b4d-85a2-4401-8c47-d587616a7efa",
      roleGrant:
        "sha256:a7bd5db5a0be4b765190f8d0fc6e35660b41fcb088828edca6bdf4ba5c8a297e",
      semanticResult: "e6e3da68-b19c-43ce-941e-78f7f456d8f6",
      finalizationEvent: "e4cefdf4-81f3-4977-82ef-a50de0e1ad53",
      result: "BLOCKED",
    },
    {
      attempt: 13,
      evaluatorRevision: "002",
      allocationEvent: "02353f2b-8aa2-4ea6-998e-1811a12fd5bf",
      execution: "20c6dae8-67ca-462d-a525-84d9b8d1f47d",
      roleGrant:
        "sha256:f9b78aa8ef4da5d13c5c6b55a1ba9e3f85a9d4c0090eb34cd15c34853d62a5ae",
      semanticResult: "b57526ce-44e7-4557-b221-9665c4674120",
      finalizationEvent: "4eff7a61-9f0e-46aa-96e3-00c40734a192",
      result: "BLOCKED",
    },
    {
      attempt: 14,
      evaluatorRevision: "003",
      allocationEvent: "8277618e-28cb-4b1a-b22d-fbdd78651ae1",
      execution: "84f7b735-63e3-46d2-ac12-88e115b26a7d",
      roleGrant:
        "sha256:7de6a48e38ffc9ac0d5fae0f88e7b955d5fb31eaff1dc07866f3b7767bdcd164",
      semanticResult: "25db5182-6917-4c3b-b406-13fd6b22b7e9",
      finalizationEvent: "c0264c9a-18dc-46ef-bb87-efffc03f200d",
      result: "BLOCKED",
    },
  ],
};

const KIND = "014m-attempt-ledger-migration";

function fail(message: string): never {
  throw new Error(`014m attempt ledger migration: ${message}`);
}

function read(root: string, path: string): Buffer {
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("path escapes its bound root");
  let stat;
  try {
    stat = lstatSync(target);
  } catch {
    fail(`missing evidence: ${path}`);
  }
  if (!stat.isFile()) fail(`not a regular file: ${path}`);
  return readFileSync(target);
}

function exact(
  events: readonly LedgerEvent[],
  transition: string,
  match: (event: LedgerEvent) => boolean,
  label: string,
): LedgerEvent {
  const found = events.filter(
    (event) => event.transition === transition && match(event),
  );
  if (found.length !== 1) fail(`missing or ambiguous ${label}`);
  return found[0] as LedgerEvent;
}

interface LegacyRow {
  readonly attempt: number;
  readonly candidate: string;
  readonly evaluatorRevision: string;
  readonly status: string;
  readonly resultPath: string;
}

// Legacy rows are parsed field by field; any shape that is not unambiguous
// fails closed with a message naming only the offending field.
function legacyRows(
  ledger: Data,
  binding: LedgerMigrationBinding,
): Map<number, LegacyRow> {
  if (!Array.isArray(ledger.attempts)) fail("legacy attempts are not an array");
  const rows = new Map<number, LegacyRow>();
  const wanted = new Set<number>(
    binding.attempts.map((attempt) => attempt.attempt),
  );
  for (const raw of ledger.attempts as unknown[]) {
    const row = object(raw);
    const number = Number(row.attempt ?? row.id);
    if (!wanted.has(number)) continue;
    if (rows.has(number)) fail(`duplicate legacy row ${String(number)}`);
    const candidate = row.candidate ?? row.implementation;
    const resultPath = row.resultPath ?? row.result;
    if (
      typeof candidate !== "string" ||
      typeof row.evaluatorRevision !== "string" ||
      typeof row.status !== "string" ||
      typeof resultPath !== "string"
    )
      fail(`legacy row ${String(number)} lacks a required field`);
    rows.set(number, {
      attempt: number,
      candidate: candidate.replace(/^git:/, ""),
      evaluatorRevision: row.evaluatorRevision,
      status: row.status,
      resultPath,
    });
  }
  return rows;
}

export interface DerivedLedgerMigration {
  readonly evidence: Data;
  readonly rows: readonly Data[];
  readonly materialize: readonly {
    readonly from: string;
    readonly to: string;
  }[];
  readonly legacyBytes: Buffer;
  readonly provenance: Data;
}

export function derive014mLedgerMigration(
  evaluatorRoot: string,
  workflow: string,
  events: readonly LedgerEvent[],
  legacyBytes: Buffer,
  binding: LedgerMigrationBinding = LEDGER_MIGRATION_014M,
): DerivedLedgerMigration {
  if (workflow !== binding.workflow) fail("workflow binding differs");
  if (identity(legacyBytes) !== binding.legacyLedgerIdentity)
    fail("current ledger identity differs");
  let parsed: Data;
  try {
    parsed = object(JSON.parse(legacyBytes.toString("utf8")));
  } catch {
    fail("legacy ledger is not a JSON object");
  }
  const legacy = legacyRows(parsed, binding);
  const activeFreeze = read(evaluatorRoot, ".eval/freeze.json");

  const rows: Data[] = [];
  const bound: Data[] = [];
  const materialize: { from: string; to: string }[] = [];
  for (const expected of binding.attempts) {
    const label = String(expected.attempt);
    const allocation = exact(
      events,
      "verification-allocated",
      (event) => event.id === expected.allocationEvent,
      `allocation ${label}`,
    );
    const facts = {
      execution: expected.execution,
      roleGrant: expected.roleGrant,
      commit: binding.candidate,
      evaluatorRevision: expected.evaluatorRevision,
      attempt: expected.attempt,
    };
    for (const [key, value] of Object.entries(facts))
      if (allocation.evidence[key] !== value)
        fail(`allocation ${label} differs: ${key}`);
    const semantic = exact(
      events,
      "kernel.result",
      (event) => event.evidence.id === expected.semanticResult,
      `semantic result ${label}`,
    );
    if (
      semantic.evidence.execution !== expected.execution ||
      object(semantic.evidence.methodology).result !== expected.result
    )
      fail(`semantic result ${label} differs`);
    const finalization = exact(
      events,
      "verification-finalized",
      (event) => event.id === expected.finalizationEvent,
      `finalization ${label}`,
    );
    const finalFacts = {
      execution: expected.execution,
      commit: binding.candidate,
      evaluatorRevision: expected.evaluatorRevision,
      attempt: expected.attempt,
      result: expected.result,
    };
    for (const [key, value] of Object.entries(finalFacts))
      if (finalization.evidence[key] !== value)
        fail(`finalization ${label} differs: ${key}`);

    const row = legacy.get(expected.attempt);
    if (!row) fail(`legacy row ${label} is missing`);
    if (
      row.candidate !== binding.candidate ||
      row.evaluatorRevision !== expected.evaluatorRevision ||
      row.status !== expected.result
    )
      fail(`legacy row ${label} conflicts with canonical host history`);

    const id = label.padStart(3, "0");
    const resultPath = `.eval/attempts/${id}/eval-result.md`;
    const resultBytes = read(evaluatorRoot, row.resultPath);
    if (row.resultPath !== resultPath) {
      const target = resolve(evaluatorRoot, resultPath);
      if (existsSync(target)) {
        if (identity(read(evaluatorRoot, resultPath)) !== identity(resultBytes))
          fail(`canonical result path ${resultPath} holds different bytes`);
      } else materialize.push({ from: row.resultPath, to: resultPath });
    }
    const resultIdentity = identity(resultBytes);

    const active = expected === binding.attempts[binding.attempts.length - 1];
    const freezePath = active
      ? ".eval/freeze.json"
      : `.eval/revisions/${expected.evaluatorRevision}/freeze.json`;
    const freeze = read(evaluatorRoot, freezePath);
    parseFreeze(freeze, expected.evaluatorRevision);
    if (active) {
      const copy = resolve(
        evaluatorRoot,
        `.eval/revisions/${expected.evaluatorRevision}/freeze.json`,
      );
      if (existsSync(copy) && !read(evaluatorRoot, copy).equals(activeFreeze))
        fail("active freeze differs from its revision copy");
    }
    const evaluatorRevisionIdentity = identity(freeze);

    rows.push({
      id,
      implementation: `git:${binding.candidate}`,
      evaluatorRevision: expected.evaluatorRevision,
      evaluatorRevisionIdentity,
      resultPath,
      resultIdentity,
      status: expected.result,
    });
    bound.push({
      attempt: expected.attempt,
      allocationEvent: expected.allocationEvent,
      finalizationEvent: expected.finalizationEvent,
      semanticResult: expected.semanticResult,
      execution: expected.execution,
      evaluatorRevision: expected.evaluatorRevision,
      evaluatorRevisionIdentity,
      resultPath,
      resultIdentity,
      legacyResultPath: row.resultPath,
    });
  }
  const active = `${JSON.stringify({ schemaVersion: 2, attempts: rows })}\n`;
  privateAttempts(JSON.parse(active));
  const evidence: Data = {
    kind: KIND,
    workflow,
    legacyLedgerIdentity: binding.legacyLedgerIdentity,
    activeLedgerIdentity: identity(active),
    historyDirectory: binding.historyDirectory,
    attempts: bound,
  };
  return {
    evidence,
    rows,
    materialize,
    legacyBytes,
    provenance: { ...evidence, activeLedger: active },
  };
}

export function exact014mLedgerMigration(
  events: readonly LedgerEvent[],
): LedgerEvent | undefined {
  const found = events.filter(
    (event) =>
      event.transition === "kernel.attempt-ledger-migrated" &&
      event.evidence.kind === KIND,
  );
  if (found.length > 1) fail("migration provenance is ambiguous");
  return found[0];
}

// Writes durable history first, then swaps the active ledger atomically.
// Re-entry after a partial run converges on the same exact state.
export function apply014mLedgerMigration(
  evaluatorRoot: string,
  derived: DerivedLedgerMigration,
  binding: LedgerMigrationBinding = LEDGER_MIGRATION_014M,
): void {
  const history = resolve(evaluatorRoot, binding.historyDirectory);
  const legacyTarget = resolve(history, "attempt-ledger.legacy.json");
  const provenanceTarget = resolve(history, "provenance.json");
  mkdirSync(history, { recursive: true });
  if (!existsSync(legacyTarget))
    writeFileSync(legacyTarget, derived.legacyBytes, { mode: 0o444 });
  else if (!read(evaluatorRoot, legacyTarget).equals(derived.legacyBytes))
    fail("preserved legacy ledger differs");
  if (!existsSync(provenanceTarget))
    writeFileSync(provenanceTarget, `${canonical(derived.provenance)}\n`, {
      mode: 0o444,
    });
  for (const move of derived.materialize) {
    const to = resolve(evaluatorRoot, move.to);
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, read(evaluatorRoot, move.from), { flag: "wx" });
  }
  const active = resolve(evaluatorRoot, ".eval/attempt-ledger.json");
  const staged = `${active}.migrating`;
  writeFileSync(staged, String(derived.provenance.activeLedger));
  renameSync(staged, active);
}
