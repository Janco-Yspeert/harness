import { lstatSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

import type { ArchiveItem, EvaluationFact } from "../evaluation-closeout.ts";
import { canonical, identity, object } from "./ledger.ts";
import type { LedgerEvent, PromotionArtifact } from "./model.ts";

export const RECOVERY_014N = {
  workflow: "014n-finalized-verification-evaluator-correction-authority",
  cycle: "001",
  candidate: "c448eaa26d1b4205d54212bbe61939bdf67357dc",
  successfulExecution: "81b55996-172b-4d45-a0b7-7459b1ce1419",
  successfulAttempt: 4,
  evaluatorRevision: "003",
  privateLedgerIdentity:
    "sha256:f00a43b63f341f0753a8b81cd5f66ff8d4a71b31fe1a1223314ced0315c0568e",
} as const;

const attempts = [
  {
    attempt: 1,
    allocation: "3ebe0da8-d6fd-4b49-b74b-aa961cc7713c",
    execution: "e0cdc7e5-a55a-49c2-951d-95619361f75b",
    roleGrant:
      "sha256:f06ae3da1f4a4eaf0a5572fefffc7b1dfb1765e9b6b6b28421e410b23dde0d25",
    semanticEvent: "4580be76-675a-495a-9623-0ec43b311a14",
    semanticResult: "6e64200a-0a3f-4186-aaab-f076b8b52a58",
    finalization: "2d2c3d98-62d3-4247-9d69-03e212349772",
    candidate: "04f2745558fa51432b6c4dffb219a611f00bd0df",
    evaluatorRevision: "001",
    result: "BLOCKED",
    classification: "EVALUATOR_DEFECT",
    artifactCommit: "840724721ed9fad46e747c3956e70936e98d57e2",
    publicIdentity:
      "sha256:42f9b6a8a83394431d2ed6935de098764cc5ae08b1db7ca894f6b442285c2ff7",
    privateIdentity:
      "sha256:0b0fee20175da3e6907d2ec6ff43015d99d33b39dede97798ef234bbc4858277",
    privateDisposition: "RECOVERY_BOUND",
  },
  {
    attempt: 2,
    allocation: "a0b69461-89ec-4240-bc71-65ba90ece8a1",
    execution: "7a4b59c3-91ba-41b7-8611-873ca648516e",
    roleGrant:
      "sha256:a113009bd705579689a8f5b4f1b5eb2a43fa473e34192880af81812544692aa3",
    semanticEvent: "1aaab5c1-5e0e-48a3-af76-c377534dd901",
    semanticResult: "8ddf32d8-96f3-4dfd-b047-7294043a0224",
    finalization: "f913b4b2-3120-4695-8e88-6d327d8d02cf",
    candidate: "04f2745558fa51432b6c4dffb219a611f00bd0df",
    evaluatorRevision: "002",
    result: "FAIL",
    classification: "IMPLEMENTATION_FAILURE",
    artifactCommit: "bb25e40e24b701934ee5081ee6005a29bfc08f2f",
    publicIdentity:
      "sha256:6ff3185beb36607bec111227adfc86226795d32a8be9669124875f436de34392",
    privateIdentity:
      "sha256:e827c4552ecf424970ead9f02ac12a4af6bfef4fde56bb3ac477770fd3c5d3a2",
    privateDisposition: "RECOVERY_BOUND",
  },
  {
    attempt: 3,
    allocation: "804a23c5-6c3e-4f1f-9f25-2f8514f505e5",
    execution: "b4d1c1db-5ccd-4c0e-8ba7-74b78179d4e5",
    roleGrant:
      "sha256:0c733a927b9247cd51435c1cd69a0375e6f3513bf81df0eb63700555a8b7b594",
    semanticEvent: "138eadfa-d693-4e04-ae1d-7efec5652640",
    semanticResult: "08b139a9-b1b1-484e-b7bb-41c14060e25c",
    finalization: "b2c2ce65-05d5-4ac9-bc9e-d72c3a4ad834",
    candidate: "c448eaa26d1b4205d54212bbe61939bdf67357dc",
    evaluatorRevision: "002",
    result: "BLOCKED",
    classification: "INFRASTRUCTURE_FAILURE",
    artifactCommit: "5b0900e6a212236a0659b3361a9627a34cda7989",
    publicIdentity:
      "sha256:0d4ca99c0f41c0f585b75b73d919a2f62fcfcc4fd1d489db624145f76d57fe1d",
    privateIdentity:
      "sha256:ca18090c4ac86a2d0926c680e35e1273fdafcb5f6797444bd6a88de7ddaf2f04",
    privateDisposition: "RECOVERY_BOUND",
  },
  {
    attempt: 4,
    allocation: "13d54157-1c46-4b61-8fd0-cbf6c85b1131",
    execution: "81b55996-172b-4d45-a0b7-7459b1ce1419",
    roleGrant:
      "sha256:2c531d1182123e76ec4ef9f60aaa599e452234cf8b0f59417382ef695584244e",
    semanticEvent: "08894d5d-e23e-4ac8-9878-84c740c79773",
    semanticResult: "a3e67a66-eba6-44ea-8ab1-47d2c2643a92",
    finalization: "21d11d28-1fe0-49df-8e9f-ca415bca4012",
    candidate: "c448eaa26d1b4205d54212bbe61939bdf67357dc",
    evaluatorRevision: "003",
    result: "PASS",
    classification: null,
    artifactCommit: "026665e25e20ea409ce9f8e8ebf7651fb2ac0270",
    publicIdentity:
      "sha256:f6b441613998a25c8b05bc6d8082841c431b767c008a5c6f9bd781dc5000d000",
    privateIdentity:
      "sha256:98f9aa9c8d13b5f3648ea2bc2cd607c1cfb201d86ef6174cd1004667b0e9f97b",
    privateDisposition: "BOUND",
  },
] as const;

const revisions = {
  "001":
    "sha256:9ab50eaad18d3fa8449f4dded353578fdd7c0b7770722a3d91fbf93f2c229365",
  "002":
    "sha256:f6efebd992419c66a8823bf55f20e440996c1b06249313c373b48ebcc23075fb",
  "003":
    "sha256:14c099c7689a75985bb7a9f927f2ae409d16fe200e6cf4c1e2f944b451b6d145",
} as const;

function fail(message: string): never {
  throw new Error(`014n ledger migration recovery: ${message}`);
}

function read(root: string, path: string): Buffer {
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("source escapes evaluator workspace");
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`source is not a regular file: ${path}`);
  return readFileSync(target);
}

function exactEvent(
  events: readonly LedgerEvent[],
  transition: string,
  id: string,
): LedgerEvent {
  const matches = events.filter(
    (event) => event.transition === transition && event.id === id,
  );
  if (matches.length !== 1) fail(`missing or ambiguous ${transition} ${id}`);
  return matches[0] as LedgerEvent;
}

export function build014nLedgerMigrationArchive(
  root: string,
  workflow: string,
  events: readonly LedgerEvent[],
  runtimeCommit: string,
): { artifacts: PromotionArtifact[]; generated: ArchiveItem[] } {
  if (workflow !== RECOVERY_014N.workflow) fail("workflow binding differs");
  if (!/^[a-f0-9]{40}$/.test(runtimeCommit))
    fail("runtime identity is invalid");
  if (
    events.filter((event) => event.transition === "verification-allocated")
      .length !== attempts.length
  )
    fail("canonical allocation history differs");
  if (events.some((event) => event.transition === "promotion-recorded"))
    fail("canonical PASS is already promoted");

  for (const expected of attempts) {
    const allocation = exactEvent(
      events,
      "verification-allocated",
      expected.allocation,
    );
    const semantic = exactEvent(
      events,
      "kernel.result",
      expected.semanticEvent,
    );
    const finalization = exactEvent(
      events,
      "verification-finalized",
      expected.finalization,
    );
    const expectedAllocation = {
      execution: expected.execution,
      roleGrant: expected.roleGrant,
      commit: expected.candidate,
      evaluatorRevision: expected.evaluatorRevision,
      attempt: expected.attempt,
      cycle: RECOVERY_014N.cycle,
    };
    const expectedSemantic = {
      id: expected.semanticResult,
      execution: expected.execution,
      roleGrant: expected.roleGrant,
      disposition: "succeeded",
      methodology: {
        result: expected.result,
        ...(expected.classification
          ? { classification: expected.classification }
          : {}),
      },
    };
    const expectedFinalization = {
      result: expected.result,
      ...(expected.classification
        ? { classification: expected.classification }
        : {}),
      execution: expected.execution,
      roleGrant: expected.roleGrant,
      commit: expected.candidate,
      evaluatorRevision: expected.evaluatorRevision,
      attempt: expected.attempt,
      cycle: RECOVERY_014N.cycle,
      artifactCommit: expected.artifactCommit,
      path: "verification-result.json",
      identity: expected.publicIdentity,
      semanticResult: expected.semanticResult,
    };
    const select = (value: Record<string, unknown>, keys: string[]) =>
      Object.fromEntries(keys.map((key) => [key, value[key]]));
    if (
      canonical(
        select(allocation.evidence, Object.keys(expectedAllocation)),
      ) !== canonical(expectedAllocation) ||
      canonical(select(semantic.evidence, Object.keys(expectedSemantic))) !==
        canonical(expectedSemantic) ||
      canonical(
        select(finalization.evidence, Object.keys(expectedFinalization)),
      ) !== canonical(expectedFinalization)
    )
      fail(`canonical history differs for attempt ${String(expected.attempt)}`);
  }

  const items: ArchiveItem[] = [];
  const add = (source: string, destination: string, expected: string): void => {
    const actual = identity(read(root, source));
    if (actual !== expected) fail(`identity differs for ${source}`);
    items.push({ source, destination, identity: actual });
  };
  const generated: ArchiveItem[] = [];
  const addGenerated = (destination: string, value: unknown): void => {
    const content = `${canonical(value)}\n`;
    generated.push({ destination, content, identity: identity(content) });
  };

  add(
    ".eval/attempt-ledger.json",
    "historical/attempt-ledger.json",
    RECOVERY_014N.privateLedgerIdentity,
  );
  for (const attempt of attempts)
    add(
      `.eval/attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
      `attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
      attempt.privateIdentity,
    );

  for (const [revision, freezeIdentity] of Object.entries(revisions)) {
    const active = revision === RECOVERY_014N.evaluatorRevision;
    const base = active ? "" : `revisions/${revision}/`;
    const freezePath = `.eval/${base}freeze.json`;
    const freezeBytes = read(root, freezePath);
    if (identity(freezeBytes) !== freezeIdentity)
      fail(`freeze identity differs for revision ${revision}`);
    const freeze = object(JSON.parse(freezeBytes.toString("utf8")));
    if (freeze.evaluatorRevision !== revision)
      fail(`freeze revision differs for ${revision}`);
    items.push({
      source: freezePath,
      destination: `freeze/${revision}.json`,
      identity: freezeIdentity,
    });
    const inventory = object(freeze.artifacts);
    for (const [path, expected] of Object.entries(inventory)) {
      if (typeof expected !== "string")
        fail(`invalid inventory for ${revision}`);
      add(
        active ? path : `.eval/${base}${path}`,
        `revisions/${revision}/${path}`,
        expected,
      );
    }
  }

  const fact: EvaluationFact = {
    schemaVersion: 1,
    kind: "evaluation-fact",
    result: "PASS",
    candidate: RECOVERY_014N.candidate,
    evaluatorRevision: RECOVERY_014N.evaluatorRevision,
    evaluatorRevisionIdentity: revisions[RECOVERY_014N.evaluatorRevision],
    resultIdentity: attempts[3].privateIdentity,
    attempts: attempts.map((attempt) => ({
      attempt: attempt.attempt,
      execution: attempt.execution,
      evaluatorRevision: attempt.evaluatorRevision,
      state: "TERMINAL" as const,
      result: attempt.result,
      artifact: {
        path: `.eval/attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
        identity: attempt.privateIdentity,
      },
    })),
  };
  addGenerated("evaluation-fact.json", fact);
  addGenerated("recovery/014n-ledger-migration.json", {
    schemaVersion: 1,
    kind: "014n-historical-ledger-migration",
    scope: RECOVERY_014N,
    runtimeCommit,
    archiveCompleteness: "complete",
    historicalLedgerPreserved: true,
    bytesReconstructed: false,
    bytesOmitted: false,
    lostAttempts: [],
    unboundAttempts: [],
    attempts: attempts.map((attempt) => ({
      attempt: attempt.attempt,
      allocation: attempt.allocation,
      execution: attempt.execution,
      roleGrant: attempt.roleGrant,
      semanticEvent: attempt.semanticEvent,
      semanticResult: attempt.semanticResult,
      finalization: attempt.finalization,
      candidate: attempt.candidate,
      evaluatorRevision: attempt.evaluatorRevision,
      result: attempt.result,
      classification: attempt.classification,
      privateArtifact: {
        path: `.eval/attempts/${String(attempt.attempt).padStart(3, "0")}/eval-result.md`,
        identity: attempt.privateIdentity,
        disposition: attempt.privateDisposition,
        ...(attempt.privateDisposition === "RECOVERY_BOUND"
          ? { identityEstablished: "during-recovery" }
          : {}),
      },
    })),
    revisions,
  });
  const all = [...items, ...generated];
  return {
    artifacts: all.map((item) => ({
      source: item.source ?? `host:${item.destination}`,
      destination: item.destination,
      identity: item.identity,
    })),
    generated,
  };
}
