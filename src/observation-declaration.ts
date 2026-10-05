// Prepared-observation requirement declaration (N+1 evaluator-facing).
//
// A declaration is a closed, canonical, identity-bearing description of a
// prepared candidate observation an evaluator procedure requires. It carries
// identities and closed-vocabulary names only: never filesystem paths or
// inline content. It confers no authority and cannot select private material;
// the host's existing preparation operation fulfils it.
import { contentId, object } from "./kernel/ledger.ts";
import {
  validatePreparedObservationRecord,
  type PreparedObservationRecord,
} from "./candidate-observation.ts";

// The host-created observation input classes (names, never paths or bytes).
export const HOST_INPUT_CLASSES = ["topology", "before", "after"] as const;
export type HostInputClass = (typeof HOST_INPUT_CLASSES)[number];

export interface ObservationDeclaration {
  readonly schemaVersion: 1;
  readonly kind: "prepared-observation-declaration";
  // Purpose/procedure identity.
  readonly purpose: string;
  readonly candidate: string;
  readonly evaluator: {
    readonly revision: string;
    readonly revisionIdentity: string;
  };
  readonly hostInputs: readonly HostInputClass[];
  // The criterion/procedure that consumes the observation.
  readonly consumer: string;
  // Present only once the host has sealed the observation.
  readonly observation?: string;
}

const NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const SHA = /^sha256:[a-f0-9]{64}$/;

function closed(
  value: Record<string, unknown>,
  allowed: readonly string[],
  name: string,
): void {
  for (const key of Object.keys(value))
    if (!allowed.includes(key))
      throw new Error(`${name} has unknown field: ${key}`);
}

function name(value: unknown, field: string): string {
  if (typeof value !== "string" || !NAME.test(value))
    throw new Error(
      `${field} must be a bounded identifier, not a path or inline content`,
    );
  return value;
}

function sha(value: unknown, field: string): string {
  if (typeof value !== "string" || !SHA.test(value))
    throw new Error(`${field} must be a sha256 identity`);
  return value;
}

export function parseObservationDeclaration(
  value: unknown,
): ObservationDeclaration {
  const raw = object(value);
  closed(
    raw,
    [
      "schemaVersion",
      "kind",
      "purpose",
      "candidate",
      "evaluator",
      "hostInputs",
      "consumer",
      "observation",
    ],
    "observation declaration",
  );
  if (
    raw.schemaVersion !== 1 ||
    raw.kind !== "prepared-observation-declaration"
  )
    throw new Error("invalid observation declaration");
  if (
    typeof raw.candidate !== "string" ||
    !/^[a-f0-9]{40}$/.test(raw.candidate)
  )
    throw new Error("candidate must be an exact commit");
  const evaluator = object(raw.evaluator);
  closed(evaluator, ["revision", "revisionIdentity"], "evaluator binding");
  if (
    typeof evaluator.revision !== "string" ||
    !/^\d{3}$/.test(evaluator.revision)
  )
    throw new Error("evaluator revision must be a three-digit revision");
  if (
    !Array.isArray(raw.hostInputs) ||
    raw.hostInputs.length === 0 ||
    new Set(raw.hostInputs).size !== raw.hostInputs.length ||
    !raw.hostInputs.every((entry) =>
      (HOST_INPUT_CLASSES as readonly unknown[]).includes(entry),
    )
  )
    throw new Error(
      "hostInputs must be unique names from the closed vocabulary",
    );
  const parsed: ObservationDeclaration = {
    schemaVersion: 1,
    kind: "prepared-observation-declaration",
    purpose: name(raw.purpose, "purpose"),
    candidate: raw.candidate,
    evaluator: {
      revision: evaluator.revision,
      revisionIdentity: sha(evaluator.revisionIdentity, "revisionIdentity"),
    },
    hostInputs: [...(raw.hostInputs as HostInputClass[])].sort(),
    consumer: name(raw.consumer, "consumer"),
    ...(raw.observation === undefined
      ? {}
      : { observation: sha(raw.observation, "observation") }),
  };
  return Object.freeze(parsed);
}

export function declarationIdentity(
  declaration: ObservationDeclaration,
): string {
  return contentId(parseObservationDeclaration(declaration));
}

// Binds a sealed host observation to its declaration by identity. The record
// is evidence only; this never resolves private bytes.
export function fulfilObservationDeclaration(
  declaration: ObservationDeclaration,
  record: PreparedObservationRecord,
): ObservationDeclaration {
  const parsed = parseObservationDeclaration(declaration);
  if (parsed.observation !== undefined)
    throw new Error("declaration is already fulfilled");
  validatePreparedObservationRecord(record);
  if (record.state !== "sealed")
    throw new Error("only a sealed observation fulfils a declaration");
  if (
    record.candidate.commit !== parsed.candidate ||
    record.evaluator.revision !== parsed.evaluator.revision ||
    record.evaluator.revisionIdentity !== parsed.evaluator.revisionIdentity ||
    record.evaluator.procedure !== parsed.purpose
  )
    throw new Error("observation does not match the declaration");
  return parseObservationDeclaration({
    ...parsed,
    observation: record.observation,
  });
}
