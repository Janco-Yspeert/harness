import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { relative, resolve, sep } from "node:path";

import { canonical, identity, object } from "./ledger.ts";
import type { Data, LedgerEvent } from "./model.ts";
import {
  deriveHostArchive,
  privateAttempts,
  type AllocatedAttempt,
  type ArchivePlan,
} from "../evaluation-closeout.ts";

export const ATTEMPT_NAMESPACE_014N = {
  workflow: "014n-finalized-verification-evaluator-correction-authority",
  candidate: "bb84849b635c4736786c4ab84f86906b9275f84a",
  evaluatorRevision: "004",
  evaluatorRevisionIdentity:
    "sha256:5bbc58b528dc5312b5021e4fd5c4c86ec1aab367699c2c9e854415641cd8e04f",
  execution: "7dd49498-1de0-4509-a930-e604b0224cad",
  roleGrant:
    "sha256:0097b7f4e6f85b8da775240356704a1dd9e7548750dd7cc8720792424e49d493",
  semanticResult: "40f8ce68-0c54-42d1-904c-5b69bbca3e9e",
  publicCommit: "77ce026cb1a51ce0105db18a335489888b96e72b",
  publicPath:
    "spikes/014n-finalized-verification-evaluator-correction-authority/verification-result.json",
  publicIdentity:
    "sha256:735857469cb6a10baa2f64e6ebbf91a4026872c9dc45ab67006746a0250a4bc9",
  historicalLedgerIdentity:
    "sha256:f00a43b63f341f0753a8b81cd5f66ff8d4a71b31fe1a1223314ced0315c0568e",
  currentLedgerIdentity:
    "sha256:840d71b89873339cb56d734371690380a07a65788ef52af46e36942e573296ce",
  privateResultPath: ".eval/attempts/004-r004/eval-result.md",
  privateResultIdentity:
    "sha256:a9881601654dd43881ea9fae9be0d4ea8f0f862327b916af6520c36b4de6c06a",
  result: "BLOCKED",
  classification: "EVALUATOR_DEFECT",
  legacyAttempt: 4,
  recoveredAttempt: 8,
} as const;

export const ACTIVE_LEDGER_CUTOVER_014N = {
  workflow: ATTEMPT_NAMESPACE_014N.workflow,
  sourceLedgerIdentity:
    "sha256:62a4c4a7db98a4981253a9adeab1749143b10a21e37f014c3495d70ba8d4efec",
  preservedLedgerPath:
    ".eval/history/attempt-ledgers/014n-pre-canonical-cutover.json",
  provenancePath: ".eval/history/014n-active-ledger-cutover.json",
  allocationEvent: "89a3d1eb-1d14-43f0-9b29-de0889895c26",
  kernelAllocationEvent: "b97b8eb9-e66f-40cd-a902-49739d60825b",
  execution: "0c383b26-89f2-476e-864f-4ce1242b1f90",
  roleGrant:
    "sha256:aa15c34c2a6b60056079f6b34be926e515cc19cc05138ce59ecedc3690b348c4",
  semanticResult: "c82d3221-83c8-4261-b28f-9def57cca757",
  candidate: "bb84849b635c4736786c4ab84f86906b9275f84a",
  evaluatorRevision: "005",
  evaluatorRevisionIdentity:
    "sha256:1f074b457b9ab4f02e227b6f1aeb86afd61e9563620d6020ee6a1b7450d351de",
  attempt: 9,
  result: "FAIL",
  classification: "IMPLEMENTATION_FAILURE",
  publicCommit: "39e9c3e68794cda23624891a01a9b6697cf787d7",
  publicPath:
    "spikes/014n-finalized-verification-evaluator-correction-authority/verification-result.json",
  publicIdentity:
    "sha256:318d5b1a99ee391b4df5152e4e8f898327bf15b875e84f2baa815fccb0768118",
  privatePath: ".eval/attempts/009/eval-result.md",
  privateIdentity:
    "sha256:7ead5e8a972686dd845e46280a3a0920ccff8d6d65edf737024671f9f6e76c8a",
  migratedAttempt8Path: ".eval/attempts/008/eval-result.md",
} as const;

const allocations = [
  [
    "3ebe0da8-d6fd-4b49-b74b-aa961cc7713c",
    "133206bc-362f-4e4f-867b-b37e1dc58742",
    "001",
    1,
    1,
    "e0cdc7e5-a55a-49c2-951d-95619361f75b",
    "sha256:f06ae3da1f4a4eaf0a5572fefffc7b1dfb1765e9b6b6b28421e410b23dde0d25",
    "04f2745558fa51432b6c4dffb219a611f00bd0df",
    "001",
  ],
  [
    "a0b69461-89ec-4240-bc71-65ba90ece8a1",
    "4484e25c-22c4-4037-816d-0769b186c3f0",
    "001",
    2,
    2,
    "7a4b59c3-91ba-41b7-8611-873ca648516e",
    "sha256:a113009bd705579689a8f5b4f1b5eb2a43fa473e34192880af81812544692aa3",
    "04f2745558fa51432b6c4dffb219a611f00bd0df",
    "002",
  ],
  [
    "804a23c5-6c3e-4f1f-9f25-2f8514f505e5",
    "4a3b91c2-5283-49e6-93eb-af8155a53f71",
    "001",
    3,
    3,
    "b4d1c1db-5ccd-4c0e-8ba7-74b78179d4e5",
    "sha256:0c733a927b9247cd51435c1cd69a0375e6f3513bf81df0eb63700555a8b7b594",
    "c448eaa26d1b4205d54212bbe61939bdf67357dc",
    "002",
  ],
  [
    "13d54157-1c46-4b61-8fd0-cbf6c85b1131",
    "8b031fe5-ce8b-4cd0-b748-b088ace4aa45",
    "001",
    4,
    4,
    "81b55996-172b-4d45-a0b7-7459b1ce1419",
    "sha256:2c531d1182123e76ec4ef9f60aaa599e452234cf8b0f59417382ef695584244e",
    "c448eaa26d1b4205d54212bbe61939bdf67357dc",
    "003",
  ],
  [
    "d723a456-ed4b-4093-b938-06ef2a5fdf09",
    "a30ead65-724d-4b75-a720-34759bc825d9",
    "002",
    1,
    5,
    "78a70e3c-8f4d-4722-b8c5-543a137a3d59",
    "sha256:099d8b167e324758779344f0cdf95b19e5dd1033054df140e5c3a76ec1b2d5f9",
    ATTEMPT_NAMESPACE_014N.candidate,
    "004",
  ],
  [
    "9abaf607-cf37-4640-9def-01a0edbc7b5f",
    "1bd0964e-84f0-4bea-a8fe-3b4da69d3cb9",
    "002",
    2,
    6,
    "baa9a7cc-06be-41b2-85c9-c9e5be2afdd3",
    "sha256:448e8037122eb5182228eed25874d7e4d05a00f9a05a54c0bb9f838466f90b25",
    ATTEMPT_NAMESPACE_014N.candidate,
    "004",
  ],
  [
    "5052aacb-516d-4e8d-b97f-03873a32bdb9",
    "a681067e-b3df-4e84-907e-98e7d01da575",
    "002",
    3,
    7,
    "7e80be60-8da0-40c0-b499-16468749b349",
    "sha256:5aade6860a10ad47a8a3670c24a8d2ce087e1b8591788705276c437b9a6caf7b",
    ATTEMPT_NAMESPACE_014N.candidate,
    "004",
  ],
  [
    "002539fe-e303-4d1d-8fa3-7135ba9513bd",
    "f7c0e258-4e6f-403c-b47f-709fb3e80278",
    "002",
    4,
    8,
    ATTEMPT_NAMESPACE_014N.execution,
    ATTEMPT_NAMESPACE_014N.roleGrant,
    ATTEMPT_NAMESPACE_014N.candidate,
    "004",
  ],
] as const;

function fail(message: string): never {
  throw new Error(`014n attempt namespace migration: ${message}`);
}

function read(root: string, path: string): Buffer {
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (delta === "" || delta === ".." || delta.startsWith(`..${sep}`))
    fail("path escapes its bound root");
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink())
    fail(`not a regular file: ${path}`);
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

function selected(value: Data, keys: readonly string[]): Data {
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}

export function validate014nAttemptNamespaceState(
  projectRoot: string,
  evaluatorRoot: string,
  workflow: string,
  events: readonly LedgerEvent[],
): Data {
  if (workflow !== ATTEMPT_NAMESPACE_014N.workflow)
    fail("workflow binding differs");
  const verificationAllocations = events.filter(
    (event) => event.transition === "verification-allocated",
  );
  if (verificationAllocations.length !== allocations.length)
    fail("allocation history length differs");

  const mappings = allocations.map((expected, index) => {
    const [
      allocationEvent,
      kernelEvent,
      cycle,
      legacyAttempt,
      recoveredAttempt,
      execution,
      roleGrant,
      candidate,
      evaluatorRevision,
    ] = expected;
    const allocation = exactEvent(
      events,
      "verification-allocated",
      allocationEvent,
    );
    if (verificationAllocations[index]?.id !== allocationEvent)
      fail("allocation append order differs");
    const allocationFacts = {
      execution,
      roleGrant,
      commit: candidate,
      evaluatorRevision,
      attempt: legacyAttempt,
      cycle,
    };
    if (
      canonical(selected(allocation.evidence, Object.keys(allocationFacts))) !==
      canonical(allocationFacts)
    )
      fail(`verification allocation differs: ${allocationEvent}`);
    const kernel = exactEvent(events, "kernel.allocation", kernelEvent);
    const kernelGrant = object(kernel.evidence.grant);
    const kernelExecution = object(kernel.evidence.execution);
    const inputs = object(kernelGrant.inputs);
    if (
      kernelExecution.id !== execution ||
      kernelGrant.id !== roleGrant ||
      inputs.candidate !== candidate ||
      inputs.evaluatorRevision !== evaluatorRevision
    )
      fail(`kernel allocation differs: ${kernelEvent}`);
    return {
      allocationEvent,
      kernelAllocationEvent: kernelEvent,
      original: { cycle, legacyAttempt, allocationEvent },
      recoveredAttempt,
      execution,
      roleGrant,
      candidate,
      evaluatorRevision,
    };
  });

  const workflowRoot = resolve(
    projectRoot,
    "spikes/014n-finalized-verification-evaluator-correction-authority",
  );
  const archivedLedger = read(
    workflowRoot,
    "evaluation/historical/attempt-ledger.json",
  );
  if (
    identity(archivedLedger) !== ATTEMPT_NAMESPACE_014N.historicalLedgerIdentity
  )
    fail("historical ledger identity differs");
  const promotion = object(
    JSON.parse(
      read(workflowRoot, "evaluation/promotion.json").toString("utf8"),
    ),
  );
  const promotionRequest = object(promotion.request);
  const operatorRecovery = object(promotionRequest.operator014nRecovery);
  if (
    promotionRequest.execution !== "81b55996-172b-4d45-a0b7-7459b1ce1419" ||
    promotionRequest.candidate !== "c448eaa26d1b4205d54212bbe61939bdf67357dc" ||
    promotionRequest.attempt !== 4 ||
    operatorRecovery.kind !== "014n-historical-ledger-migration" ||
    operatorRecovery.historicalLedgerIdentity !==
      ATTEMPT_NAMESPACE_014N.historicalLedgerIdentity ||
    operatorRecovery.archiveCompleteness !== "complete" ||
    operatorRecovery.bytesReconstructed !== false ||
    operatorRecovery.bytesOmitted !== false
  )
    fail("historical migration provenance differs");

  const currentLedger = read(evaluatorRoot, ".eval/attempt-ledger.json");
  if (identity(currentLedger) !== ATTEMPT_NAMESPACE_014N.currentLedgerIdentity)
    fail("current ledger identity differs");
  const historical = object(JSON.parse(archivedLedger.toString("utf8")));
  const current = object(JSON.parse(currentLedger.toString("utf8")));
  if (!Array.isArray(historical.attempts) || !Array.isArray(current.attempts))
    fail("attempt ledger shape differs");
  const historicalAttempts = historical.attempts as unknown[];
  const currentAttempts = current.attempts as unknown[];
  if (
    currentAttempts.length !== 5 ||
    canonical(currentAttempts.slice(0, 4)) !== canonical(historicalAttempts)
  )
    fail("immutable historical ledger prefix differs");
  const malformed: unknown = currentAttempts[4];
  const expectedMalformed = {
    attempt: 4,
    cycle: "002",
    status: ATTEMPT_NAMESPACE_014N.result,
    candidate: ATTEMPT_NAMESPACE_014N.candidate,
    evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
    classification: ATTEMPT_NAMESPACE_014N.classification,
    result: ATTEMPT_NAMESPACE_014N.privateResultPath,
  };
  if (canonical(malformed) !== canonical(expectedMalformed))
    fail("malformed current attempt evidence differs");
  if (
    identity(read(evaluatorRoot, ATTEMPT_NAMESPACE_014N.privateResultPath)) !==
    ATTEMPT_NAMESPACE_014N.privateResultIdentity
  )
    fail("private result identity differs");
  if (
    identity(read(evaluatorRoot, ".eval/freeze.json")) !==
    ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity
  )
    fail("active evaluator revision identity differs");
  const publicBytes = read(workflowRoot, "verification-result.json");
  if (identity(publicBytes) !== ATTEMPT_NAMESPACE_014N.publicIdentity)
    fail("public result identity differs");
  const committed = execFileSync(
    "git",
    [
      "show",
      `${ATTEMPT_NAMESPACE_014N.publicCommit}:${ATTEMPT_NAMESPACE_014N.publicPath}`,
    ],
    { cwd: projectRoot },
  );
  if (identity(committed) !== ATTEMPT_NAMESPACE_014N.publicIdentity)
    fail("committed public result identity differs");

  const semantic = events.filter(
    (event) =>
      event.transition === "kernel.result" &&
      event.evidence.id === ATTEMPT_NAMESPACE_014N.semanticResult,
  );
  if (semantic.length !== 1) fail("semantic result is missing or ambiguous");
  const semanticEvent = semantic[0] as LedgerEvent;
  const methodology = object(semanticEvent.evidence.methodology);
  if (
    semanticEvent.evidence.execution !== ATTEMPT_NAMESPACE_014N.execution ||
    semanticEvent.evidence.roleGrant !== ATTEMPT_NAMESPACE_014N.roleGrant ||
    methodology.result !== ATTEMPT_NAMESPACE_014N.result ||
    methodology.classification !== ATTEMPT_NAMESPACE_014N.classification
  )
    fail("semantic result differs");
  return {
    schemaVersion: 1,
    kind: "014n-attempt-namespace-migration",
    workflow,
    historicalLedgerIdentity: ATTEMPT_NAMESPACE_014N.historicalLedgerIdentity,
    currentLedgerIdentity: ATTEMPT_NAMESPACE_014N.currentLedgerIdentity,
    mappings,
    currentTerminalEvidence: {
      execution: ATTEMPT_NAMESPACE_014N.execution,
      semanticResult: ATTEMPT_NAMESPACE_014N.semanticResult,
      candidate: ATTEMPT_NAMESPACE_014N.candidate,
      evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
      evaluatorRevisionIdentity:
        ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity,
      result: ATTEMPT_NAMESPACE_014N.result,
      classification: ATTEMPT_NAMESPACE_014N.classification,
      publicArtifact: {
        commit: ATTEMPT_NAMESPACE_014N.publicCommit,
        path: "verification-result.json",
        identity: ATTEMPT_NAMESPACE_014N.publicIdentity,
      },
      privateArtifact: {
        path: ATTEMPT_NAMESPACE_014N.privateResultPath,
        identity: ATTEMPT_NAMESPACE_014N.privateResultIdentity,
        disposition: "MALFORMED_NAMESPACE_EVIDENCE",
      },
    },
    bytesReconstructed: false,
    bytesOmitted: false,
  };
}

export function exact014nNamespaceMigration(
  events: readonly LedgerEvent[],
): LedgerEvent | undefined {
  const matches = events.filter(
    (event) =>
      event.transition === "kernel.attempt-namespace-migrated" &&
      event.evidence.kind === "014n-attempt-namespace-migration",
  );
  if (matches.length > 1) fail("migration provenance is ambiguous");
  return matches[0];
}

const historicalCanonicalAttempts = [
  {
    id: "001",
    implementation: "git:04f2745558fa51432b6c4dffb219a611f00bd0df",
    evaluatorRevision: "001",
    evaluatorRevisionIdentity:
      "sha256:9ab50eaad18d3fa8449f4dded353578fdd7c0b7770722a3d91fbf93f2c229365",
    resultPath: ".eval/attempts/001/eval-result.md",
    resultIdentity:
      "sha256:0b0fee20175da3e6907d2ec6ff43015d99d33b39dede97798ef234bbc4858277",
    status: "BLOCKED",
  },
  {
    id: "002",
    implementation: "git:04f2745558fa51432b6c4dffb219a611f00bd0df",
    evaluatorRevision: "002",
    evaluatorRevisionIdentity:
      "sha256:f6efebd992419c66a8823bf55f20e440996c1b06249313c373b48ebcc23075fb",
    resultPath: ".eval/attempts/002/eval-result.md",
    resultIdentity:
      "sha256:e827c4552ecf424970ead9f02ac12a4af6bfef4fde56bb3ac477770fd3c5d3a2",
    status: "FAIL",
  },
  {
    id: "003",
    implementation: "git:c448eaa26d1b4205d54212bbe61939bdf67357dc",
    evaluatorRevision: "002",
    evaluatorRevisionIdentity:
      "sha256:f6efebd992419c66a8823bf55f20e440996c1b06249313c373b48ebcc23075fb",
    resultPath: ".eval/attempts/003/eval-result.md",
    resultIdentity:
      "sha256:ca18090c4ac86a2d0926c680e35e1273fdafcb5f6797444bd6a88de7ddaf2f04",
    status: "BLOCKED",
  },
  {
    id: "004",
    implementation: "git:c448eaa26d1b4205d54212bbe61939bdf67357dc",
    evaluatorRevision: "003",
    evaluatorRevisionIdentity:
      "sha256:14c099c7689a75985bb7a9f927f2ae409d16fe200e6cf4c1e2f944b451b6d145",
    resultPath: ".eval/attempts/004/eval-result.md",
    resultIdentity:
      "sha256:98f9aa9c8d13b5f3648ea2bc2cd607c1cfb201d86ef6174cd1004667b0e9f97b",
    status: "PASS",
  },
] as const;

const postMigrationAllocatedAttempts = [5, 6, 7].map((attempt) => ({
  id: String(attempt).padStart(3, "0"),
  implementation: `git:${ATTEMPT_NAMESPACE_014N.candidate}`,
  evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
  evaluatorRevisionIdentity: ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity,
  status: "ALLOCATED",
}));

function exactFile(
  root: string,
  path: string,
  expectedIdentity: string,
): Buffer {
  const bytes = read(root, path);
  if (identity(bytes) !== expectedIdentity)
    fail(`file identity differs: ${path}`);
  return bytes;
}

function exactOrWrite(path: string, bytes: Buffer): void {
  if (existsSync(path)) {
    const stat = lstatSync(path);
    if (
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      identity(readFileSync(path)) !== identity(bytes)
    )
      fail(`existing cutover artifact differs: ${path}`);
    return;
  }
  writeFileSync(path, bytes, { flag: "wx" });
}

export function cutover014nActiveAttemptLedger(
  projectRoot: string,
  evaluatorRoot: string,
  workflow: string,
  events: readonly LedgerEvent[],
  runtimeCommit: string,
): Data {
  if (workflow !== ACTIVE_LEDGER_CUTOVER_014N.workflow)
    fail("active-ledger cutover workflow binding differs");
  if (!/^[a-f0-9]{40}$/.test(runtimeCommit))
    fail("active-ledger cutover runtime is invalid");

  const migration = exact014nNamespaceMigration(events);
  if (!migration) fail("active-ledger cutover requires namespace migration");
  const migrationMappings = migration.evidence.mappings;
  if (!Array.isArray(migrationMappings) || migrationMappings.length !== 8)
    fail("active-ledger cutover migration mapping differs");

  const verificationAllocations = events.filter(
    (event) => event.transition === "verification-allocated",
  );
  if (verificationAllocations.length !== 9)
    fail("active-ledger cutover allocation history length differs");
  for (const [index, raw] of migrationMappings.entries()) {
    const mapping = object(raw);
    if (
      verificationAllocations[index]?.id !== mapping.allocationEvent ||
      mapping.recoveredAttempt !== index + 1
    )
      fail("active-ledger cutover allocation history differs");
  }
  const allocation = exactEvent(
    events,
    "verification-allocated",
    ACTIVE_LEDGER_CUTOVER_014N.allocationEvent,
  );
  if (verificationAllocations[8]?.id !== allocation.id)
    fail("attempt 009 allocation append order differs");
  const expectedAllocation = {
    execution: ACTIVE_LEDGER_CUTOVER_014N.execution,
    roleGrant: ACTIVE_LEDGER_CUTOVER_014N.roleGrant,
    commit: ACTIVE_LEDGER_CUTOVER_014N.candidate,
    evaluatorRevision: ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevision,
    attempt: ACTIVE_LEDGER_CUTOVER_014N.attempt,
    cycle: "002",
  };
  if (
    canonical(
      selected(allocation.evidence, Object.keys(expectedAllocation)),
    ) !== canonical(expectedAllocation)
  )
    fail("attempt 009 allocation differs");
  const kernel = exactEvent(
    events,
    "kernel.allocation",
    ACTIVE_LEDGER_CUTOVER_014N.kernelAllocationEvent,
  );
  const grant = object(kernel.evidence.grant);
  const execution = object(kernel.evidence.execution);
  const inputs = object(grant.inputs);
  if (
    grant.id !== ACTIVE_LEDGER_CUTOVER_014N.roleGrant ||
    execution.id !== ACTIVE_LEDGER_CUTOVER_014N.execution ||
    inputs.candidate !== ACTIVE_LEDGER_CUTOVER_014N.candidate ||
    inputs.evaluatorRevision !== ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevision
  )
    fail("attempt 009 kernel allocation differs");

  const semantic = events.filter(
    (event) =>
      event.transition === "kernel.result" &&
      event.evidence.id === ACTIVE_LEDGER_CUTOVER_014N.semanticResult,
  );
  if (semantic.length !== 1)
    fail("attempt 009 semantic result is missing or ambiguous");
  const semanticEvent = semantic[0] as LedgerEvent;
  const methodology = object(semanticEvent.evidence.methodology);
  if (
    semanticEvent.evidence.execution !== ACTIVE_LEDGER_CUTOVER_014N.execution ||
    semanticEvent.evidence.roleGrant !== ACTIVE_LEDGER_CUTOVER_014N.roleGrant ||
    methodology.result !== ACTIVE_LEDGER_CUTOVER_014N.result ||
    methodology.classification !== ACTIVE_LEDGER_CUTOVER_014N.classification
  )
    fail("attempt 009 semantic result differs");

  const workflowRoot = resolve(
    projectRoot,
    "spikes/014n-finalized-verification-evaluator-correction-authority",
  );
  const publicBytes = exactFile(
    workflowRoot,
    "verification-result.json",
    ACTIVE_LEDGER_CUTOVER_014N.publicIdentity,
  );
  const committed = execFileSync(
    "git",
    [
      "show",
      `${ACTIVE_LEDGER_CUTOVER_014N.publicCommit}:${ACTIVE_LEDGER_CUTOVER_014N.publicPath}`,
    ],
    { cwd: projectRoot },
  );
  if (identity(committed) !== identity(publicBytes))
    fail("attempt 009 committed public result differs");
  const attempt8Bytes = exactFile(
    evaluatorRoot,
    ATTEMPT_NAMESPACE_014N.privateResultPath,
    ATTEMPT_NAMESPACE_014N.privateResultIdentity,
  );
  const attempt9Bytes = exactFile(
    evaluatorRoot,
    ACTIVE_LEDGER_CUTOVER_014N.privatePath,
    ACTIVE_LEDGER_CUTOVER_014N.privateIdentity,
  );
  exactFile(
    evaluatorRoot,
    ".eval/freeze.json",
    ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevisionIdentity,
  );

  const malformedLedger = read(evaluatorRoot, ".eval/attempt-ledger.json");
  const preservedPath = resolve(
    evaluatorRoot,
    ACTIVE_LEDGER_CUTOVER_014N.preservedLedgerPath,
  );
  const alreadyCutOver =
    identity(malformedLedger) !==
    ACTIVE_LEDGER_CUTOVER_014N.sourceLedgerIdentity;
  const sourceLedger = alreadyCutOver
    ? exactFile(
        evaluatorRoot,
        ACTIVE_LEDGER_CUTOVER_014N.preservedLedgerPath,
        ACTIVE_LEDGER_CUTOVER_014N.sourceLedgerIdentity,
      )
    : malformedLedger;
  if (
    identity(sourceLedger) !== ACTIVE_LEDGER_CUTOVER_014N.sourceLedgerIdentity
  )
    fail("active-ledger cutover source identity differs");
  const source = object(JSON.parse(sourceLedger.toString("utf8")));
  if (!Array.isArray(source.attempts) || source.attempts.length !== 6)
    fail("active-ledger cutover source shape differs");
  const archivedHistoricalLedger = exactFile(
    workflowRoot,
    "evaluation/historical/attempt-ledger.json",
    ATTEMPT_NAMESPACE_014N.historicalLedgerIdentity,
  );
  const archivedHistorical = object(
    JSON.parse(archivedHistoricalLedger.toString("utf8")),
  );
  if (
    !Array.isArray(archivedHistorical.attempts) ||
    canonical(source.attempts.slice(0, 4)) !==
      canonical(archivedHistorical.attempts)
  )
    fail("active-ledger cutover historical prefix differs");
  if (
    canonical(source.attempts[4]) !==
      canonical({
        attempt: 4,
        cycle: "002",
        status: ATTEMPT_NAMESPACE_014N.result,
        candidate: ATTEMPT_NAMESPACE_014N.candidate,
        evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
        classification: ATTEMPT_NAMESPACE_014N.classification,
        result: ATTEMPT_NAMESPACE_014N.privateResultPath,
      }) ||
    canonical(source.attempts[5]) !==
      canonical({
        attempt: 9,
        cycle: "002",
        status: ACTIVE_LEDGER_CUTOVER_014N.result,
        candidate: ACTIVE_LEDGER_CUTOVER_014N.candidate,
        evaluatorRevision: ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevision,
        classification: ACTIVE_LEDGER_CUTOVER_014N.classification,
        result: ACTIVE_LEDGER_CUTOVER_014N.privatePath,
      })
  )
    fail("active-ledger cutover malformed terminal rows differ");

  const canonicalLedger = {
    schemaVersion: 2,
    attempts: [
      ...historicalCanonicalAttempts,
      ...postMigrationAllocatedAttempts,
      {
        id: "008",
        implementation: `git:${ATTEMPT_NAMESPACE_014N.candidate}`,
        evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
        evaluatorRevisionIdentity:
          ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity,
        resultPath: ACTIVE_LEDGER_CUTOVER_014N.migratedAttempt8Path,
        resultIdentity: ATTEMPT_NAMESPACE_014N.privateResultIdentity,
        status: ATTEMPT_NAMESPACE_014N.result,
      },
      {
        id: "009",
        implementation: `git:${ACTIVE_LEDGER_CUTOVER_014N.candidate}`,
        evaluatorRevision: ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevision,
        evaluatorRevisionIdentity:
          ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevisionIdentity,
        resultPath: ACTIVE_LEDGER_CUTOVER_014N.privatePath,
        resultIdentity: ACTIVE_LEDGER_CUTOVER_014N.privateIdentity,
        status: ACTIVE_LEDGER_CUTOVER_014N.result,
      },
    ],
  };
  privateAttempts(canonicalLedger);
  for (const entry of historicalCanonicalAttempts) {
    exactFile(evaluatorRoot, entry.resultPath, entry.resultIdentity);
  }
  const revisionIdentities = new Map([
    [
      "001",
      "sha256:9ab50eaad18d3fa8449f4dded353578fdd7c0b7770722a3d91fbf93f2c229365",
    ],
    [
      "002",
      "sha256:f6efebd992419c66a8823bf55f20e440996c1b06249313c373b48ebcc23075fb",
    ],
    [
      "003",
      "sha256:14c099c7689a75985bb7a9f927f2ae409d16fe200e6cf4c1e2f944b451b6d145",
    ],
    ["004", ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity],
  ]);
  for (const [revision, revisionIdentity] of revisionIdentities) {
    exactFile(
      evaluatorRoot,
      `.eval/revisions/${revision}/freeze.json`,
      revisionIdentity,
    );
  }
  for (let index = 0; index < 4; index += 1) {
    const mapping = object(migrationMappings[index]);
    const terminal = events.filter(
      (event) =>
        event.transition === "verification-finalized" &&
        event.evidence.execution === mapping.execution,
    );
    const expected = historicalCanonicalAttempts[index];
    if (!expected) fail("historical canonical attempt is missing");
    const finalized = terminal[0];
    if (!finalized) fail("historical terminal host evidence is missing");
    if (
      terminal.length !== 1 ||
      finalized.evidence.attempt !== index + 1 ||
      finalized.evidence.commit !== expected.implementation.slice(4) ||
      finalized.evidence.evaluatorRevision !== expected.evaluatorRevision ||
      finalized.evidence.result !== expected.status
    )
      fail(`historical terminal host evidence differs: ${String(index + 1)}`);
  }
  for (let index = 4; index < 7; index += 1) {
    const mapping = object(migrationMappings[index]);
    if (
      events.some(
        (event) =>
          (event.transition === "kernel.result" ||
            event.transition === "verification-finalized") &&
          event.evidence.execution === mapping.execution,
      )
    )
      fail(
        `nonterminal allocation has terminal host evidence: ${String(index + 1)}`,
      );
  }
  const attempt8Finalizations = events.filter(
    (event) =>
      event.transition === "verification-finalized" &&
      event.evidence.execution === ATTEMPT_NAMESPACE_014N.execution,
  );
  const attempt8Finalized = attempt8Finalizations[0];
  if (!attempt8Finalized)
    fail("attempt 008 finalized host evidence is missing");
  if (
    attempt8Finalizations.length !== 1 ||
    attempt8Finalized.evidence.attempt !== 8 ||
    attempt8Finalized.evidence.result !== ATTEMPT_NAMESPACE_014N.result ||
    attempt8Finalized.evidence.classification !==
      ATTEMPT_NAMESPACE_014N.classification
  )
    fail("attempt 008 finalized host evidence differs");
  const ledgerBytes = Buffer.from(
    `${JSON.stringify(canonicalLedger, null, 2)}\n`,
  );
  const provenance = {
    schemaVersion: 1,
    kind: "014n-active-attempt-ledger-cutover",
    workflow,
    runtimeCommit,
    sourceLedger: {
      path: ACTIVE_LEDGER_CUTOVER_014N.preservedLedgerPath,
      identity: ACTIVE_LEDGER_CUTOVER_014N.sourceLedgerIdentity,
      preservedByteForByte: true,
    },
    activeLedger: {
      path: ".eval/attempt-ledger.json",
      identity: identity(ledgerBytes),
      namespace: "workflow-global",
    },
    terminalCopies: [
      {
        attempt: 8,
        allocationEvent: "002539fe-e303-4d1d-8fa3-7135ba9513bd",
        evaluatorRevision: "004",
        originalPath: ATTEMPT_NAMESPACE_014N.privateResultPath,
        originalIdentity: ATTEMPT_NAMESPACE_014N.privateResultIdentity,
        canonicalPath: ACTIVE_LEDGER_CUTOVER_014N.migratedAttempt8Path,
        canonicalIdentity: ATTEMPT_NAMESPACE_014N.privateResultIdentity,
        pathOrigin: "namespace-migration-copy",
      },
      {
        attempt: 9,
        allocationEvent: ACTIVE_LEDGER_CUTOVER_014N.allocationEvent,
        evaluatorRevision: ACTIVE_LEDGER_CUTOVER_014N.evaluatorRevision,
        originalPath: ACTIVE_LEDGER_CUTOVER_014N.privatePath,
        originalIdentity: ACTIVE_LEDGER_CUTOVER_014N.privateIdentity,
        canonicalPath: ACTIVE_LEDGER_CUTOVER_014N.privatePath,
        canonicalIdentity: ACTIVE_LEDGER_CUTOVER_014N.privateIdentity,
        pathOrigin: "original-canonical-path-with-obsolete-row",
      },
    ],
    allocations: verificationAllocations.map((event, index) => ({
      allocationEvent: event.id,
      recoveredGlobalAttempt: index + 1,
      originalAttempt: event.evidence.attempt,
      cycle: event.evidence.cycle,
      execution: event.evidence.execution,
      roleGrant: event.evidence.roleGrant,
      candidate: event.evidence.commit,
      evaluatorRevision: event.evidence.evaluatorRevision,
    })),
    attempts: canonicalLedger.attempts.map((entry) => ({
      id: entry.id,
      status: entry.status,
      evidenceOrigin:
        entry.id === "008"
          ? "namespace-migration"
          : entry.id === "009"
            ? "exact-current-host-and-private-evidence"
            : Number(entry.id) <= 4
              ? "prior-ledger-recovery"
              : "canonical-host-allocation",
    })),
    bytesReconstructed: false,
    bytesOmitted: false,
  };
  const provenanceBytes = Buffer.from(`${canonical(provenance)}\n`);

  mkdirSync(resolve(evaluatorRoot, ".eval/history/attempt-ledgers"), {
    recursive: true,
  });
  mkdirSync(resolve(evaluatorRoot, ".eval/attempts/008"), { recursive: true });
  exactOrWrite(preservedPath, sourceLedger);
  exactOrWrite(
    resolve(evaluatorRoot, ACTIVE_LEDGER_CUTOVER_014N.migratedAttempt8Path),
    attempt8Bytes,
  );
  exactOrWrite(
    resolve(evaluatorRoot, ACTIVE_LEDGER_CUTOVER_014N.provenancePath),
    provenanceBytes,
  );
  if (!alreadyCutOver) {
    const staged = resolve(evaluatorRoot, ".eval/attempt-ledger.cutover.json");
    writeFileSync(staged, ledgerBytes, { flag: "wx" });
    renameSync(staged, resolve(evaluatorRoot, ".eval/attempt-ledger.json"));
  }
  const active = read(evaluatorRoot, ".eval/attempt-ledger.json");
  if (identity(active) !== identity(ledgerBytes))
    fail("canonical active ledger differs");
  privateAttempts(JSON.parse(active.toString("utf8")));
  return {
    ...provenance,
    provenancePath: ACTIVE_LEDGER_CUTOVER_014N.provenancePath,
    provenanceIdentity: identity(provenanceBytes),
    attempt8CanonicalIdentity: identity(attempt8Bytes),
    attempt9Identity: identity(attempt9Bytes),
  };
}

export function derive014nAttemptNamespaceArchive(
  projectRoot: string,
  evaluatorRoot: string,
  workflow: string,
  events: readonly LedgerEvent[],
  candidate: string,
  hostAllocations: readonly AllocatedAttempt[],
): ArchivePlan {
  if (workflow !== ATTEMPT_NAMESPACE_014N.workflow)
    fail("archive workflow binding differs");
  const migration = exact014nNamespaceMigration(events);
  if (!migration) fail("archive requires namespace migration provenance");
  if (
    hostAllocations.length < ATTEMPT_NAMESPACE_014N.recoveredAttempt ||
    hostAllocations.some(
      (allocation, index) => allocation.attempt !== index + 1,
    )
  )
    fail("archive host allocation sequence differs");
  const currentLedgerBytes = read(evaluatorRoot, ".eval/attempt-ledger.json");
  const currentLedger = object(JSON.parse(currentLedgerBytes.toString("utf8")));
  try {
    privateAttempts(currentLedger);
    const ordinary = deriveHostArchive(
      evaluatorRoot,
      candidate,
      hostAllocations,
    );
    const preserved = exactFile(
      evaluatorRoot,
      ACTIVE_LEDGER_CUTOVER_014N.preservedLedgerPath,
      ACTIVE_LEDGER_CUTOVER_014N.sourceLedgerIdentity,
    );
    const provenance = read(
      evaluatorRoot,
      ACTIVE_LEDGER_CUTOVER_014N.provenancePath,
    );
    return {
      evaluationFact: ordinary.evaluationFact,
      items: [
        ...ordinary.items,
        {
          source: ACTIVE_LEDGER_CUTOVER_014N.preservedLedgerPath,
          destination: "historical/014n-pre-canonical-attempt-ledger.json",
          identity: identity(preserved),
        },
        {
          source: ACTIVE_LEDGER_CUTOVER_014N.provenancePath,
          destination: "recovery/014n-active-attempt-ledger-cutover.json",
          identity: identity(provenance),
        },
      ],
    };
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("private attempt"))
      throw error;
  }
  if (
    !Array.isArray(currentLedger.attempts) ||
    currentLedger.attempts.length < 5
  )
    fail("archive attempt ledger shape differs");
  const allCurrentAttempts = currentLedger.attempts as unknown[];
  const prefix = allCurrentAttempts.slice(0, 5);
  const expectedPrefix = object(
    JSON.parse(
      read(
        resolve(
          projectRoot,
          "spikes/014n-finalized-verification-evaluator-correction-authority",
        ),
        "evaluation/historical/attempt-ledger.json",
      ).toString("utf8"),
    ),
  ).attempts;
  if (
    !Array.isArray(expectedPrefix) ||
    canonical(prefix.slice(0, 4)) !== canonical(expectedPrefix) ||
    canonical(prefix[4]) !==
      canonical({
        attempt: 4,
        cycle: "002",
        status: ATTEMPT_NAMESPACE_014N.result,
        candidate: ATTEMPT_NAMESPACE_014N.candidate,
        evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
        classification: ATTEMPT_NAMESPACE_014N.classification,
        result: ATTEMPT_NAMESPACE_014N.privateResultPath,
      })
  )
    fail("archive historical ledger prefix differs");
  const canonicalTail: unknown[] = allCurrentAttempts.slice(5);
  privateAttempts({ schemaVersion: 2, attempts: canonicalTail });
  const migratedAttempt = {
    id: "008",
    implementation: `git:${ATTEMPT_NAMESPACE_014N.candidate}`,
    evaluatorRevision: ATTEMPT_NAMESPACE_014N.evaluatorRevision,
    evaluatorRevisionIdentity: ATTEMPT_NAMESPACE_014N.evaluatorRevisionIdentity,
    resultPath: ".eval/attempts/008/eval-result.md",
    resultIdentity: ATTEMPT_NAMESPACE_014N.privateResultIdentity,
    status: ATTEMPT_NAMESPACE_014N.result,
  };
  const syntheticLedger = {
    schemaVersion: 2,
    attempts: [
      ...historicalCanonicalAttempts,
      migratedAttempt,
      ...canonicalTail,
    ],
  };
  // Validate through the ordinary archive derivation without changing the
  // evaluator workspace. The temporary tree exists only to present the exact
  // recovery-bound attempt 008 under its recovered durable identity.
  const temporary = mkdtempSync(resolve(tmpdir(), "harness-014n-namespace-"));
  try {
    cpSync(resolve(evaluatorRoot, ".eval"), resolve(temporary, ".eval"), {
      recursive: true,
      dereference: false,
    });
    writeFileSync(
      resolve(temporary, ".eval/attempt-ledger.json"),
      `${JSON.stringify(syntheticLedger, null, 2)}\n`,
    );
    mkdirSync(resolve(temporary, ".eval/attempts/008"), { recursive: true });
    writeFileSync(
      resolve(temporary, ".eval/attempts/008/eval-result.md"),
      read(evaluatorRoot, ATTEMPT_NAMESPACE_014N.privateResultPath),
    );
    const ordinary = deriveHostArchive(temporary, candidate, hostAllocations);
    const provenance = `${canonical({
      schemaVersion: 1,
      kind: "014n-attempt-namespace-migration-provenance",
      migrationEvent: migration.id,
      migration: migration.evidence,
      historicalAttempts: [1, 2, 3, 4].map((attempt) => ({
        attempt,
        disposition: attempt === 4 ? "BOUND" : "RECOVERY_BOUND",
        source: "prior-014n-ledger-migration",
      })),
      namespaceConflictAttempts: [5, 6, 7, 8].map((attempt) => ({
        attempt,
        disposition:
          attempt === 8 ? "MALFORMED_NAMESPACE_EVIDENCE" : "NONTERMINAL",
      })),
      archiveCompleteness: "complete",
      bytesReconstructed: false,
      bytesOmitted: false,
      lostAttempts: [],
      unboundAttempts: [],
    })}\n`;
    return {
      evaluationFact: ordinary.evaluationFact,
      items: [
        ...ordinary.items.map((item) =>
          item.source === ".eval/attempts/008/eval-result.md"
            ? { ...item, source: ATTEMPT_NAMESPACE_014N.privateResultPath }
            : item,
        ),
        {
          source: ".eval/attempt-ledger.json",
          destination: "historical/current-malformed-attempt-ledger.json",
          identity: identity(currentLedgerBytes),
        },
        {
          destination: "recovery/014n-attempt-namespace-migration.json",
          identity: identity(provenance),
          content: provenance,
        },
      ],
    };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
