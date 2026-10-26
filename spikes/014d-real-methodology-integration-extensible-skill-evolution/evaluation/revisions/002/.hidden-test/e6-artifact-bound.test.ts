// E6 — One artifact bound B governs a promotion request (B mappings are
// admissible, B + 1 are refused), and B admits a representative complete
// archive.
// Frozen authority: spike.md §3 and AC06 (oversized manifest, "including the
// current protocol artifact bound"); design-map.md C4 ("One bound ... The
// worker-protocol schema, the host check and the archive utility all use one
// exported definition of B"; "The oversized test uses B + 1 mappings";
// representative archive at least as large as the largest committed
// historical archive, 38 files).
// Seams: the existing exported WORKER_PROTOCOL_SCHEMAS and
// parseWorkerRequest(operation, input) of src/executors/protocol.ts, the
// production validation point for every model-supplied requestAction. B is
// read from the published schema, never from a literal, so a legitimately
// raised B is judged by the same rule.
import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { PROJECT_ROOT } from "./support/repo.ts";

interface Protocol {
  readonly WORKER_PROTOCOL_SCHEMAS: Record<string, unknown>;
  parseWorkerRequest(operation: string, input: unknown): unknown;
}

const LARGEST_HISTORICAL_ARCHIVE = 38;

function artifacts(count: number): Record<string, string>[] {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(3, "0");
    return {
      source: `.eval/revisions/001/file-${n}.md`,
      destination: `evaluation/revisions/001/file-${n}.md`,
      identity: `sha256:${n.padStart(64, "0")}`,
    };
  });
}

function request(count: number): Record<string, unknown> {
  return {
    kind: "promotion",
    candidate: "0123456789abcdef0123456789abcdef01234567",
    evaluatorRevision: "001",
    attempt: 1,
    artifacts: artifacts(count),
  };
}

function bound(protocol: Protocol): number {
  const operations = protocol.WORKER_PROTOCOL_SCHEMAS.operations as
    | Record<
        string,
        | {
            request?: {
              properties?: { artifacts?: { maxItems?: unknown } };
            };
          }
        | undefined
      >
    | undefined;
  const value =
    operations?.requestAction?.request?.properties?.artifacts?.maxItems;
  assert.equal(
    typeof value,
    "number",
    "the published requestAction schema declares the artifact bound B",
  );
  return value as number;
}

void test("E6: the published artifact bound B is the enforced bound (B accepted, B + 1 refused) and admits a representative archive", async () => {
  const protocol = (await import(
    pathToFileURL(join(PROJECT_ROOT, "src", "executors", "protocol.ts")).href
  )) as Protocol;
  assert.equal(typeof protocol.parseWorkerRequest, "function");
  const b = bound(protocol);
  assert.ok(
    Number.isSafeInteger(b) && b >= LARGEST_HISTORICAL_ARCHIVE,
    `B (${String(b)}) admits a complete archive at least as large as the largest committed historical archive (${String(LARGEST_HISTORICAL_ARCHIVE)} mappings)`,
  );

  let accepted: { artifacts?: unknown[] } = {};
  assert.doesNotThrow(() => {
    accepted = protocol.parseWorkerRequest("requestAction", request(b)) as {
      artifacts?: unknown[];
    };
  }, "a request with exactly B mappings is admissible");
  assert.equal(
    accepted.artifacts?.length,
    b,
    "a request with exactly B mappings is admissible and is not truncated",
  );

  assert.throws(
    () => protocol.parseWorkerRequest("requestAction", request(b + 1)),
    (error: unknown) => error instanceof Error,
    "a request with B + 1 mappings is refused (never split or truncated)",
  );
});
