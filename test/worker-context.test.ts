// Spike 014d C9 / AC12: stable, identity-checked worker context is separated
// from execution-scoped facts without weakening assignment verification.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  verifyAssignment,
  workerContext,
  workerInstructions,
  type Assignment,
} from "../src/executors/governed.ts";
import { WORKER_OPERATIONS } from "../src/executors/protocol.ts";
import { contentId, identity } from "../src/kernel/ledger.ts";
import type { RoleContract, RoleGrant } from "../src/kernel/model.ts";

const skill = readFileSync("skills/implementation/SKILL.md", "utf8");
const contract = JSON.parse(
  readFileSync("methodologies/harness/contracts/implementation.json", "utf8"),
) as RoleContract;

function assignment(n: string): Assignment {
  const grant = {
    schemaVersion: 1,
    id: `sha256:${n.repeat(64)}`,
    workflowGrant: `grant-${n}`,
    methodology: `sha256:${"a".repeat(64)}`,
    authorityBasis: `sha256:${n.repeat(64)}`,
    allocationKey: `sha256:${n.repeat(64)}`,
    role: "implementation",
    contractIdentity: contentId(contract),
    skillIdentity: identity(skill),
    inputs: {
      brief: `sha256:${n.repeat(64)}`,
      candidate: n.repeat(40),
    },
    workspaces: [
      {
        id: "repository",
        path: `/work/${n}`,
        mode: "write",
        exposure: "public",
      },
    ],
    capabilities: contract.capabilities,
    hostActions: {},
    executorConstraints: {
      forbiddenExposure: ["evaluator-private"],
      protected: false,
    },
    predecessor: null,
    rootAuthority: null,
  } as unknown as RoleGrant;
  return {
    protocolVersion: 1,
    execution: `execution-${n}`,
    workflow: `workflow-${n}`,
    roleGrant: grant,
    methodology: grant.methodology,
    skill: {
      path: "skills/implementation/SKILL.md",
      identity: identity(skill),
      content: skill,
    },
    contract,
    contractIdentity: contentId(contract),
    inputs: grant.inputs,
  };
}

void test("014d C9: identical pinned inputs give a byte-identical stable prefix; every execution-scoped value follows it", () => {
  const first = assignment("1");
  const second = assignment("2");
  const a = workerInstructions(first);
  const b = workerInstructions(second);
  assert.deepEqual(workerInstructions(first), a, "deterministic");
  const stable = workerContext(first).stable;
  assert.equal(workerContext(second).stable, stable);
  assert.ok(a.system.startsWith(stable));
  assert.ok(b.system.startsWith(stable));
  assert.notEqual(a.system, b.system);
  assert.ok(stable.includes(skill));
  assert.ok(stable.includes(JSON.stringify(contract)));
  for (const operation of WORKER_OPERATIONS)
    assert.ok(stable.includes(operation), operation);
  for (const value of [
    first.execution,
    first.workflow,
    first.roleGrant.id,
    ...Object.values(first.inputs),
  ]) {
    assert.ok(!stable.includes(value), value);
    assert.ok(a.system.indexOf(value) >= stable.length, value);
  }
});

void test("014d C9: exact assignment identities are still enforced before launch", () => {
  const good = assignment("3");
  const response = (skillContent: string, pinned = good.contract) => ({
    assignments: [
      {
        execution: { id: good.execution },
        grant: good.roleGrant,
        skill: { ...good.skill, content: skillContent },
        contract: pinned,
      },
    ],
  });
  assert.equal(
    verifyAssignment(response(skill), good.execution, good.workflow).skill
      .content,
    skill,
  );
  assert.throws(
    () =>
      verifyAssignment(
        response(`${skill}\ntampered`),
        good.execution,
        good.workflow,
      ),
    /pinned skill identity mismatch/,
  );
  assert.throws(
    () =>
      verifyAssignment(
        response(skill, { ...contract, capabilities: [] }),
        good.execution,
        good.workflow,
      ),
    /pinned contract identity mismatch/,
  );
});
