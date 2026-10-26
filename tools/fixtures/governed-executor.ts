// Repository-owned external executor exercising the public host protocol.
// It has no root credential, Git remote, provider credentials or push code.
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { required } from "../../src/kernel/ledger.ts";
import type {
  Execution,
  HumanRequest,
  RoleGrant,
  RoleContract,
} from "../../src/kernel/model.ts";

const base = `${required(process.env.HARNESS_URL)}/governed/${required(process.env.HARNESS_WORKFLOW)}`;
const session = required(process.env.HARNESS_SESSION);
const headers = {
  authorization: `Bearer ${required(process.env.HARNESS_SESSION_TOKEN)}`,
  "x-harness-session": session,
  "content-type": "application/json",
};
async function call<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`${base}/${path}`, {
    headers,
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}
interface Assignment {
  execution: Execution;
  grant: RoleGrant;
  contract: RoleContract;
}
const seen = new Set<string>();
const deadline = Date.now() + 30000;
while (Date.now() < deadline) {
  const { assignments } = await call<{ assignments: Assignment[] }>(
    `sessions/${session}`,
  );
  const assignment = assignments.find(
    (a) =>
      !seen.has(a.execution.id) &&
      ["allocated", "running"].includes(a.execution.process),
  );
  if (!assignment) {
    await delay(20);
    continue;
  }
  const { execution, grant, contract } = assignment;
  seen.add(execution.id);
  const path = `executions/${execution.id}`;
  if (execution.process === "allocated")
    await call(`${path}/started`, { pid: process.pid });
  const evidence = (value: object): void => {
    appendFileSync(
      join(required(grant.workspaces[0]).path, "executor-evidence.jsonl"),
      `${JSON.stringify({ schemaVersion: 1, session, execution: execution.id, workflowGrant: grant.workflowGrant, roleGrant: grant.id, pid: process.pid, ...value })}\n`,
    );
  };
  evidence({
    event: "received-grant",
    capabilities: grant.capabilities,
    workspaces: grant.workspaces,
  });
  if (process.argv.includes("--wait") && contract.human.includes("root")) {
    const request = await call<HumanRequest>(`${path}/human`, {
      kind: "root",
      question: "May this execution finish the bounded proof?",
      permission: "finish-proof",
    });
    evidence({ event: "waiting", request: request.id });
    let response: HumanRequest["response"] = null;
    while (Date.now() < deadline && !response) {
      const state = await call<{ execution: Execution }>(path);
      response =
        state.execution.requests.find((r) => r.id === request.id)?.response ??
        null;
      if (!response) await delay(20);
    }
    if (!response?.authority) throw new Error("no canonical human response");
    if (response.value !== "yes")
      throw new Error("human did not permit completion");
    evidence({
      event: "resumed",
      request: request.id,
      response: response.id,
      authority: response.authority,
    });
  }
  await call(`${path}/result`, {
    disposition: "succeeded",
    methodology: contract.methodology.verification
      ? { verification: "PASS" }
      : {},
  });
  if (grant.hostActions.publication) {
    const p = grant.hostActions.publication;
    const action = await call(`${path}/publish`, {
      workspace: p.workspace,
      commit: p.commit,
      ref: p.ref,
    });
    evidence({ event: "publication", action });
  }
  const final = await call<{ execution: Execution }>(path);
  evidence({ event: "semantic-result", result: final.execution.result });
  await call(`${path}/exited`, {});
  break;
}
if (seen.size === 0)
  throw new Error("no role received before fixture deadline");
