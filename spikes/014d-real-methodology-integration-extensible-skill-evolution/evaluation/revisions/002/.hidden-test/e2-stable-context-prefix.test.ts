// E2 — Stable worker context is separated from execution-scoped values.
// Frozen authority: spike.md §8 and AC12; design-map.md C9.
// Seam: workerInstructions(assignment) in src/executors/governed.ts keeps its
// { system, prompt } result (C9). The protocol operation names are the
// existing public WORKER_OPERATIONS export of src/executors/protocol.ts.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { PROJECT_ROOT } from "./support/repo.ts";

interface Instructions {
  readonly system: string;
  readonly prompt: string;
}
type WorkerInstructions = (assignment: unknown) => Instructions;

function commonPrefix(a: string, b: string): string {
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index])
    index += 1;
  return a.slice(0, index);
}

interface Scoped {
  readonly execution: string;
  readonly workflow: string;
  readonly roleGrant: string;
  readonly workflowGrant: string;
  readonly allocationKey: string;
  readonly authorityBasis: string;
  readonly inputs: Record<string, string>;
  readonly attempt: number;
}

void test("E2: workerInstructions yields a byte-identical stable prefix with every execution-scoped value after it", async () => {
  const governed = (await import(
    pathToFileURL(join(PROJECT_ROOT, "src", "executors", "governed.ts")).href
  )) as { workerInstructions: WorkerInstructions };
  const protocol = (await import(
    pathToFileURL(join(PROJECT_ROOT, "src", "executors", "protocol.ts")).href
  )) as { WORKER_OPERATIONS: readonly string[] };
  const policy = JSON.parse(
    readFileSync(
      join(PROJECT_ROOT, "methodologies", "harness", "policy.json"),
      "utf8",
    ),
  ) as { roles: Record<string, { contract: string; skill: string }> };
  const role = "evaluator-verify";
  const entry = policy.roles[role];
  assert.ok(entry, "the default Harness policy configures evaluator-verify");
  const contractBytes = readFileSync(
    join(PROJECT_ROOT, entry.contract),
    "utf8",
  );
  const contract = JSON.parse(contractBytes) as Record<string, unknown>;
  const skill = readFileSync(join(PROJECT_ROOT, entry.skill), "utf8");
  const skillIdentity = `sha256:${createHash("sha256").update(skill).digest("hex")}`;
  const contractIdentity = `sha256:${createHash("sha256").update(contractBytes).digest("hex")}`;
  const methodology =
    "sha256:5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f";

  const assignment = (scoped: Scoped): Record<string, unknown> => ({
    protocolVersion: 1,
    execution: scoped.execution,
    workflow: scoped.workflow,
    roleGrant: {
      schemaVersion: 1,
      id: scoped.roleGrant,
      workflowGrant: scoped.workflowGrant,
      methodology,
      authorityBasis: scoped.authorityBasis,
      allocationKey: scoped.allocationKey,
      role,
      contractIdentity,
      skillIdentity,
      inputs: scoped.inputs,
      workspaces: [
        {
          id: "repository",
          path: "/srv/eval-fixture/repository",
          mode: "write",
          exposure: "public",
        },
      ],
      capabilities: contract.capabilities,
      hostActions: {
        promotion: {
          sourceWorkspace: "evaluation",
          destinationWorkspace: "repository",
          destination: "evaluation",
          candidate: scoped.inputs.candidate,
          evaluatorRevision: scoped.inputs.evaluatorRevision,
          attempt: scoped.attempt,
        },
      },
      executorConstraints: { forbiddenExposure: [], protected: true },
      predecessor: null,
      rootAuthority: null,
    },
    methodology,
    skill: { path: entry.skill, identity: skillIdentity, content: skill },
    contract,
    contractIdentity,
    inputs: scoped.inputs,
  });

  const a: Scoped = {
    execution: "1a1a1a1a-0000-4000-8000-00000000000a",
    workflow: "alpha-eval-fixture-workflow",
    roleGrant:
      "sha256:a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
    workflowGrant: "1b1b1b1b-0000-4000-8000-00000000000b",
    allocationKey:
      "sha256:a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2",
    authorityBasis:
      "sha256:a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3",
    inputs: {
      brief:
        "sha256:a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4",
      design:
        "sha256:a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5",
      coverage:
        "sha256:a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6a6",
      candidate: "a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7",
      evaluatorRevision: "001",
    },
    attempt: 1,
  };
  const b: Scoped = {
    execution: "2c2c2c2c-0000-4000-8000-00000000000c",
    workflow: "beta-eval-fixture-workflow",
    roleGrant:
      "sha256:b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1",
    workflowGrant: "2d2d2d2d-0000-4000-8000-00000000000d",
    allocationKey:
      "sha256:b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2",
    authorityBasis:
      "sha256:b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3",
    inputs: {
      brief:
        "sha256:b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4",
      design:
        "sha256:b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5",
      coverage:
        "sha256:b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6b6",
      candidate: "b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7",
      evaluatorRevision: "002",
    },
    attempt: 2,
  };

  const first = governed.workerInstructions(assignment(a));
  const again = governed.workerInstructions(assignment(a));
  const second = governed.workerInstructions(assignment(b));
  assert.equal(typeof first.system, "string");
  assert.equal(typeof first.prompt, "string");
  assert.deepEqual(again, first, "identical assignments give identical bytes");

  const prefix = commonPrefix(first.system, second.system);
  assert.ok(
    prefix.includes(skill),
    "the byte-identical leading prefix contains the complete pinned skill bytes",
  );
  const contractForms = [
    contractBytes,
    contractBytes.trimEnd(),
    JSON.stringify(contract),
    JSON.stringify(contract, null, 2),
  ];
  assert.ok(
    contractForms.some((form) => prefix.includes(form)),
    "the byte-identical leading prefix contains the complete pinned contract",
  );
  for (const operation of protocol.WORKER_OPERATIONS)
    assert.ok(
      prefix.includes(operation),
      `the stable prefix carries the worker-protocol rules (${operation})`,
    );

  const pairs: ReadonlyArray<readonly [string, string, string]> = [
    ["execution", a.execution, b.execution],
    ["workflow", a.workflow, b.workflow],
    ["Role Grant", a.roleGrant, b.roleGrant],
    // Short conventional values (such as a three-digit evaluator revision)
    // also occur inside pinned skill text, so position is only judged for
    // distinctive identity values.
    ...Object.keys(a.inputs)
      .filter((name) => (a.inputs[name] ?? "").length >= 16)
      .map(
        (name) =>
          [
            `input ${name}`,
            a.inputs[name] ?? "",
            b.inputs[name] ?? "",
          ] as const,
      ),
  ];
  for (const [name, left, right] of pairs) {
    if (left === right) continue;
    const shared = commonPrefix(left, right).length;
    for (const [instructions, value] of [
      [first, left],
      [second, right],
    ] as const) {
      const assembled = `${instructions.system}\n${instructions.prompt}`;
      assert.ok(
        assembled.includes(value),
        `execution-scoped ${name} still appears in the assembled instructions`,
      );
      const index = instructions.system.indexOf(value);
      if (index >= 0)
        assert.ok(
          index >= prefix.length - shared,
          `execution-scoped ${name} appears only after the stable prefix`,
        );
    }
  }
});
