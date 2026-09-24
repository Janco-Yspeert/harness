// Harness worker-to-host protocol, version 1.
//
// These four operations are the only model-visible Harness surface. They are
// identical for every provider adapter. The adapter binds each call to its
// own execution, session and credential; nothing here can name another
// execution, carry a credential or widen authority. Lifecycle and diagnostics
// are adapter/host observations and are deliberately not operations.

export const WORKER_PROTOCOL_VERSION = 1 as const;
export const WORKER_OPERATIONS = [
  "assignment",
  "submitResult",
  "requestAction",
  "requestHuman",
] as const;
export type WorkerOperation = (typeof WORKER_OPERATIONS)[number];
export const RESULT_DISPOSITIONS = [
  "succeeded",
  "blocked",
  "refused",
  "failed",
] as const;
export const ACTION_KINDS = ["promotion", "publication"] as const;
export const HUMAN_KINDS = ["input", "approval", "root"] as const;

type Json = Record<string, unknown>;
export type WorkerRequest =
  | { operation: "assignment" }
  | {
      operation: "submitResult";
      disposition: (typeof RESULT_DISPOSITIONS)[number];
      methodology: Record<string, string>;
    }
  | {
      operation: "requestAction";
      kind: "promotion";
      candidate: string;
      evaluatorRevision: string;
      attempt: number;
      artifacts: Array<{
        source: string;
        destination: string;
        identity: string;
      }>;
    }
  | {
      operation: "requestAction";
      kind: "publication";
      workspace: string;
      commit: string;
      ref: string;
    }
  | {
      operation: "requestHuman";
      kind: (typeof HUMAN_KINDS)[number];
      question: string;
      permission?: string;
    };

const string = { type: "string", minLength: 1, maxLength: 4096 };
const empty = { type: "object", additionalProperties: false, properties: {} };

// Machine-readable request and response schemas for every operation. The
// request schemas double as the provider tool input schemas.
export const WORKER_PROTOCOL_SCHEMAS = {
  version: WORKER_PROTOCOL_VERSION,
  operations: {
    assignment: {
      description:
        "Read this execution's exact host-issued assignment: execution, Role Grant, methodology, pinned skill and contract, and bound input identities.",
      request: empty,
      response: {
        type: "object",
        required: [
          "protocolVersion",
          "execution",
          "workflow",
          "roleGrant",
          "methodology",
          "skill",
          "contract",
          "inputs",
        ],
        properties: {
          protocolVersion: { const: WORKER_PROTOCOL_VERSION },
          execution: string,
          workflow: string,
          roleGrant: { type: "object" },
          methodology: string,
          skill: {
            type: "object",
            required: ["path", "identity", "content"],
          },
          contract: { type: "object" },
          contractIdentity: string,
          inputs: { type: "object" },
        },
      },
    },
    submitResult: {
      description:
        "Submit this execution's typed semantic result: a generic disposition and the role contract's methodology fields. Process exit and prose are never results.",
      request: {
        type: "object",
        additionalProperties: false,
        required: ["disposition", "methodology"],
        properties: {
          disposition: { type: "string", enum: [...RESULT_DISPOSITIONS] },
          methodology: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
      response: {
        type: "object",
        required: ["protocolVersion", "execution"],
        properties: {
          protocolVersion: { const: WORKER_PROTOCOL_VERSION },
          execution: { type: "object" },
        },
      },
    },
    requestAction: {
      description:
        "Request one host-configured action for this execution. kind=promotion needs candidate, evaluatorRevision, attempt and artifacts; kind=publication needs workspace, commit and ref. The host validates and may deny it.",
      request: {
        type: "object",
        additionalProperties: false,
        required: ["kind"],
        properties: {
          kind: { type: "string", enum: [...ACTION_KINDS] },
          candidate: string,
          evaluatorRevision: string,
          attempt: { type: "integer", minimum: 1 },
          artifacts: {
            type: "array",
            minItems: 1,
            maxItems: 64,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["source", "destination", "identity"],
              properties: {
                source: string,
                destination: string,
                identity: string,
              },
            },
          },
          workspace: string,
          commit: string,
          ref: string,
        },
      },
      response: {
        type: "object",
        required: ["protocolVersion", "action"],
        properties: {
          protocolVersion: { const: WORKER_PROTOCOL_VERSION },
          action: {
            type: "object",
            required: ["status"],
            properties: {
              status: { enum: ["succeeded", "failed", "denied"] },
            },
          },
        },
      },
    },
    requestHuman: {
      description:
        "Ask the human for input, approval or root authority when the role contract permits it, then wait (bounded) for the recorded response.",
      request: {
        type: "object",
        additionalProperties: false,
        required: ["kind", "question"],
        properties: {
          kind: { type: "string", enum: [...HUMAN_KINDS] },
          question: string,
          permission: string,
        },
      },
      response: {
        type: "object",
        required: ["protocolVersion", "request"],
        properties: {
          protocolVersion: { const: WORKER_PROTOCOL_VERSION },
          request: { type: "object" },
          response: {},
        },
      },
    },
  },
} as const;

function fail(message: string): never {
  throw new Error(`invalid ${message}`);
}
function record(value: unknown, name: string): Json {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    fail(`${name}: expected an object`);
  return value as Json;
}
function only(value: Json, keys: readonly string[], name: string): void {
  const extra = Object.keys(value).find((key) => !keys.includes(key));
  if (extra !== undefined) fail(`${name}: unexpected field ${extra}`);
}
function field(value: Json, key: string, name: string): string {
  const item = value[key];
  if (typeof item !== "string" || item.length === 0 || item.length > 4096)
    fail(`${name}: ${key} must be a nonempty string`);
  return item;
}
function member<T extends string>(
  value: unknown,
  allowed: readonly T[],
  name: string,
): T {
  if (
    typeof value !== "string" ||
    !(allowed as readonly string[]).includes(value)
  )
    fail(`${name}: expected one of ${allowed.join(", ")}`);
  return value as T;
}

// Validates a model-supplied tool call against the version 1 schema. The
// result is fully typed; nothing else from the call is forwarded.
export function parseWorkerRequest(
  operation: string,
  input: unknown,
): WorkerRequest {
  const op = member(operation, WORKER_OPERATIONS, "worker operation");
  const args = record(input ?? {}, op);
  if (op === "assignment") {
    only(args, [], op);
    return { operation: op };
  }
  if (op === "submitResult") {
    only(args, ["disposition", "methodology"], op);
    const methodology = record(args.methodology, `${op} methodology`);
    for (const [key, value] of Object.entries(methodology))
      if (typeof value !== "string") fail(`${op}: methodology.${key}`);
    return {
      operation: op,
      disposition: member(args.disposition, RESULT_DISPOSITIONS, op),
      methodology: methodology as Record<string, string>,
    };
  }
  if (op === "requestHuman") {
    only(args, ["kind", "question", "permission"], op);
    return {
      operation: op,
      kind: member(args.kind, HUMAN_KINDS, op),
      question: field(args, "question", op),
      ...(args.permission === undefined
        ? {}
        : { permission: field(args, "permission", op) }),
    };
  }
  const kind = member(args.kind, ACTION_KINDS, op);
  if (kind === "publication") {
    only(args, ["kind", "workspace", "commit", "ref"], op);
    return {
      operation: op,
      kind,
      workspace: field(args, "workspace", op),
      commit: field(args, "commit", op),
      ref: field(args, "ref", op),
    };
  }
  only(
    args,
    ["kind", "candidate", "evaluatorRevision", "attempt", "artifacts"],
    op,
  );
  const attempt = args.attempt;
  if (
    typeof attempt !== "number" ||
    !Number.isSafeInteger(attempt) ||
    attempt < 1
  )
    fail(`${op}: attempt must be a positive integer`);
  const artifacts = args.artifacts;
  if (
    !Array.isArray(artifacts) ||
    artifacts.length < 1 ||
    artifacts.length > 64
  )
    fail(`${op}: artifacts must be a nonempty array`);
  return {
    operation: op,
    kind,
    candidate: field(args, "candidate", op),
    evaluatorRevision: field(args, "evaluatorRevision", op),
    attempt,
    artifacts: artifacts.map((entry) => {
      const artifact = record(entry, `${op} artifact`);
      only(artifact, ["source", "destination", "identity"], `${op} artifact`);
      return {
        source: field(artifact, "source", op),
        destination: field(artifact, "destination", op),
        identity: field(artifact, "identity", op),
      };
    }),
  };
}
