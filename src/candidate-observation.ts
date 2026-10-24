// Host-owned sealing and resolution for a prepared candidate-evaluator
// observation. The subject bundle remains non-authoritative and private; the
// ledger record contains identities and lifecycle facts only.
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

import {
  validateSubjectBundle,
  type SubjectManifest,
} from "./candidate-subject.ts";
import { canonical, identity, object } from "./kernel/ledger.ts";

export const PREPARED_OBSERVATION_KIND = "kernel.prepared-observation";
export const PREPARED_OBSERVATION_LOCATION =
  ".eval/prepared-observations/{observation}/bundle";

export interface PreparedObservationBindings {
  readonly workflow: string;
  readonly candidate: {
    readonly commit: string;
    readonly methodology: string;
    readonly skill: string;
    readonly contract: string;
    readonly contractSource: string;
  };
  readonly runtime: string;
  readonly evaluator: {
    readonly revision: string;
    readonly revisionIdentity: string;
    readonly privateInventoryIdentity: string;
    readonly procedure: string;
    readonly procedureIdentity: string;
  };
}

export interface PreparedBundleManifest {
  readonly schemaVersion: 1;
  readonly kind: "kernel.prepared-observation-bundle";
  readonly authority: "non-authoritative";
  readonly purpose: "candidate-evaluator-observation";
  readonly bindings: PreparedObservationBindings;
  readonly subject: {
    readonly path: "subject";
    readonly manifestIdentity: string;
  };
}

export interface PreparedObservationRecord {
  readonly schemaVersion: 1;
  readonly kind: typeof PREPARED_OBSERVATION_KIND;
  readonly observation: string;
  readonly workflow: string;
  readonly authority: {
    readonly origin: "human-root";
    readonly purpose: "candidate-evaluator-observation";
  };
  readonly candidate: PreparedObservationBindings["candidate"];
  readonly runtime: string;
  readonly evaluator: PreparedObservationBindings["evaluator"];
  readonly state: "sealed" | "failed";
  readonly privateBundle?: {
    readonly manifestIdentity: string;
    readonly location: typeof PREPARED_OBSERVATION_LOCATION;
  };
  readonly failure?: string;
}

function inside(root: string, path: string): string {
  if (!path || isAbsolute(path))
    throw new Error("prepared path must be relative");
  const target = resolve(root, path);
  const delta = relative(root, target);
  if (delta === ".." || delta.startsWith("../") || isAbsolute(delta))
    throw new Error("prepared path escapes evaluator-private workspace");
  return target;
}

export function preparedObservationIdentity(
  record: Omit<PreparedObservationRecord, "observation">,
): string {
  return identity(canonical(record));
}

export function createPreparedObservationRecord(input: {
  readonly bindings: PreparedObservationBindings;
  readonly bundleManifestIdentity?: string;
  readonly failure?: string;
}): PreparedObservationRecord {
  const sealed = input.bundleManifestIdentity !== undefined;
  if (sealed === (input.failure !== undefined))
    throw new Error("prepared observation must be exactly sealed or failed");
  const facts: Omit<PreparedObservationRecord, "observation"> = {
    schemaVersion: 1,
    kind: PREPARED_OBSERVATION_KIND,
    workflow: input.bindings.workflow,
    authority: {
      origin: "human-root",
      purpose: "candidate-evaluator-observation",
    },
    candidate: input.bindings.candidate,
    runtime: input.bindings.runtime,
    evaluator: input.bindings.evaluator,
    state: sealed ? "sealed" : "failed",
    ...(sealed
      ? {
          privateBundle: {
            manifestIdentity: input.bundleManifestIdentity,
            location: PREPARED_OBSERVATION_LOCATION,
          },
        }
      : { failure: input.failure as string }),
  };
  return { ...facts, observation: preparedObservationIdentity(facts) };
}

export function validatePreparedObservationRecord(
  record: PreparedObservationRecord,
): void {
  const { observation, ...facts } = record;
  if (
    (record as unknown as { readonly kind?: unknown }).kind !==
    PREPARED_OBSERVATION_KIND
  )
    throw new Error("invalid prepared observation kind");
  if (preparedObservationIdentity(facts) !== observation)
    throw new Error("prepared observation identity mismatch");
  if (
    (record.state === "sealed") !== (record.privateBundle !== undefined) ||
    (record.state === "failed") !== (record.failure !== undefined)
  )
    throw new Error("invalid prepared observation lifecycle");
}

export function sealPreparedObservationBundle(
  subjectRoot: string,
  destination: string,
  bindings: PreparedObservationBindings,
): { manifest: PreparedBundleManifest; identity: string } {
  if (existsSync(destination))
    throw new Error("prepared observation bundle already exists");
  const subject = validateSubjectBundle(subjectRoot);
  if (
    subject.candidate !== bindings.candidate.commit ||
    subject.candidateMethodology !== bindings.candidate.methodology ||
    subject.composition.skill !== bindings.candidate.skill ||
    subject.composition.contractIdentity !== bindings.candidate.contract ||
    subject.composition.contract !== bindings.candidate.contractSource ||
    subject.runtimeCommit !== bindings.runtime ||
    subject.frozenProcedure?.evaluatorRevision !==
      bindings.evaluator.revision ||
    subject.frozenProcedure.evaluatorRevisionIdentity !==
      bindings.evaluator.revisionIdentity ||
    subject.frozenProcedure.privateInventoryIdentity !==
      bindings.evaluator.privateInventoryIdentity ||
    subject.frozenProcedure.procedure !== bindings.evaluator.procedure ||
    subject.frozenProcedure.procedureIdentity !==
      bindings.evaluator.procedureIdentity
  )
    throw new Error("prepared observation binding mismatch");
  mkdirSync(destination, { recursive: true });
  cpSync(subjectRoot, join(destination, "subject"), {
    recursive: true,
    dereference: false,
    errorOnExist: true,
  });
  const subjectManifest = readFileSync(join(subjectRoot, "manifest.json"));
  const manifest: PreparedBundleManifest = {
    schemaVersion: 1,
    kind: "kernel.prepared-observation-bundle",
    authority: "non-authoritative",
    purpose: "candidate-evaluator-observation",
    bindings,
    subject: {
      path: "subject",
      manifestIdentity: identity(subjectManifest),
    },
  };
  const bytes = Buffer.from(`${canonical(manifest)}\n`);
  writeFileSync(join(destination, "manifest.json"), bytes, { mode: 0o444 });
  const validated = validatePreparedObservationBundle(destination);
  return { manifest: validated, identity: identity(bytes) };
}

export function validatePreparedObservationBundle(
  root: string,
): PreparedBundleManifest {
  const actual = realpathSync(root);
  const entries = readdirSync(actual).sort();
  if (entries.join("\n") !== "manifest.json\nsubject")
    throw new Error("prepared observation bundle has unbound content");
  for (const entry of entries)
    if (lstatSync(join(actual, entry)).isSymbolicLink())
      throw new Error("prepared observation bundle contains a symlink");
  const bytes = readFileSync(join(actual, "manifest.json"));
  const raw: unknown = JSON.parse(bytes.toString("utf8"));
  const shape = object(raw);
  if (
    shape.schemaVersion !== 1 ||
    shape.kind !== "kernel.prepared-observation-bundle" ||
    shape.authority !== "non-authoritative" ||
    shape.purpose !== "candidate-evaluator-observation"
  )
    throw new Error("invalid prepared observation bundle manifest");
  const manifest = raw as PreparedBundleManifest;
  const subject = validateSubjectBundle(join(actual, "subject"));
  const subjectBinding = object(shape.subject);
  if (
    subjectBinding.path !== "subject" ||
    subjectBinding.manifestIdentity !==
      identity(readFileSync(join(actual, "subject", "manifest.json")))
  )
    throw new Error("prepared subject binding mismatch");
  // Re-check the outer bindings against the independently validated inner
  // manifest so neither layer can be substituted on its own.
  if (
    subject.candidate !== manifest.bindings.candidate.commit ||
    subject.candidateMethodology !== manifest.bindings.candidate.methodology ||
    subject.composition.skill !== manifest.bindings.candidate.skill ||
    subject.composition.contractIdentity !==
      manifest.bindings.candidate.contract ||
    subject.composition.contract !==
      manifest.bindings.candidate.contractSource ||
    subject.runtimeCommit !== manifest.bindings.runtime ||
    subject.frozenProcedure?.evaluatorRevision !==
      manifest.bindings.evaluator.revision ||
    subject.frozenProcedure.evaluatorRevisionIdentity !==
      manifest.bindings.evaluator.revisionIdentity ||
    subject.frozenProcedure.privateInventoryIdentity !==
      manifest.bindings.evaluator.privateInventoryIdentity ||
    subject.frozenProcedure.procedure !==
      manifest.bindings.evaluator.procedure ||
    subject.frozenProcedure.procedureIdentity !==
      manifest.bindings.evaluator.procedureIdentity
  )
    throw new Error("prepared bundle composition mismatch");
  return manifest;
}

export function resolvePreparedObservation(
  privateRoot: string,
  record: PreparedObservationRecord,
): { readonly root: string; readonly manifest: PreparedBundleManifest } {
  validatePreparedObservationRecord(record);
  if (record.state !== "sealed" || !record.privateBundle)
    throw new Error("prepared observation is not sealed evidence");
  const location = record.privateBundle.location.replace(
    "{observation}",
    record.observation,
  );
  const privateActual = realpathSync(privateRoot);
  const root = realpathSync(inside(privateActual, location));
  const delta = relative(privateActual, root);
  if (delta === ".." || delta.startsWith("../") || isAbsolute(delta))
    throw new Error("prepared observation bundle escapes private workspace");
  const bytes = readFileSync(join(root, "manifest.json"));
  if (identity(bytes) !== record.privateBundle.manifestIdentity)
    throw new Error("prepared observation bundle identity mismatch");
  const manifest = validatePreparedObservationBundle(root);
  if (
    canonical(manifest.bindings) !==
    canonical({
      workflow: record.workflow,
      candidate: record.candidate,
      runtime: record.runtime,
      evaluator: record.evaluator,
    })
  )
    throw new Error("prepared observation record binding mismatch");
  return { root, manifest };
}

export function preparedSubjectManifest(
  resolved: ReturnType<typeof resolvePreparedObservation>,
): SubjectManifest {
  return validateSubjectBundle(join(resolved.root, "subject"));
}
