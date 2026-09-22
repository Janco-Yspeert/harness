import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Criterion AC02 (post-verification repair D05): every event name a role
// contract's `inputs[].event` references must actually be producible —
// either by some role's configured policy `outcomes[].transition` (or
// `onAllocate.transition`), or because it is a recognized human/root
// authority-declared event that Harness records directly rather than
// through a role outcome (the same category `human-accepted`/
// `human-rejected` already fall into). An input bound to an event nothing
// can ever produce is exactly the kind of internal skill/contract/policy
// mismatch Spike 014b exists to eliminate (AC02: "No known mismatch is
// silently normalized").
//
// The exemption list below is deliberately narrow and each entry is
// independently justified by frozen authority already on record, not
// invented here:
//   - any event name starting with "human-" (e.g. "human-accepted",
//     "human-rejected", "human-evaluator-correction-authorized"):
//     human-authority facts recorded directly, never a role outcome.
//   - "correction-cycle-opened": the policy's own configured `scopeEvent`
//     transition, recorded by explicit human correction authority.
//   - "promotion-recorded": the frozen Design Map's "Generic kernel
//     handback to Spike 014a" table explicitly records that "[t]he generic
//     host exposes publication only, not an evaluator-promotion
//     action/result" (KERNEL_SUPPORT_REQUIRED) — wiring this is not 014b's
//     responsibility.
//   - "process-exception-evidence-recorded": structurally the same
//     human/root-declared-exception category as "human-accepted" (frozen
//     brief: a process exception requires "durable acceptance explicitly
//     approves" — a human action, not a role outcome).
// Any other dangling event is a genuine, unexcused mismatch.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();
const CONTRACTS_DIR = join(PROJECT_ROOT, "methodologies/harness/contracts");
const POLICY_PATH = join(PROJECT_ROOT, "methodologies/harness/policy.json");

const EXEMPT_EVENTS = new Set([
  "correction-cycle-opened",
  "promotion-recorded",
  "process-exception-evidence-recorded",
]);

function isExempt(event: string): boolean {
  return EXEMPT_EVENTS.has(event) || event.startsWith("human-");
}

interface PolicyOutcome {
  readonly transition?: string;
}

interface PolicyRole {
  readonly outcomes?: readonly PolicyOutcome[];
  readonly onAllocate?: { readonly transition?: string };
}

interface Policy {
  readonly roles: Record<string, PolicyRole>;
  readonly scopeEvent?: { readonly transition?: string };
}

interface ContractInput {
  readonly name: string;
  readonly event?: string | readonly string[];
}

interface Contract {
  readonly inputs?: readonly ContractInput[];
}

function loadPolicy(): Policy {
  return JSON.parse(readFileSync(POLICY_PATH, "utf8")) as Policy;
}

function producedTransitions(policy: Policy): Set<string> {
  const produced = new Set<string>();
  for (const role of Object.values(policy.roles)) {
    for (const outcome of role.outcomes ?? [])
      if (outcome.transition) produced.add(outcome.transition);
    if (role.onAllocate?.transition) produced.add(role.onAllocate.transition);
  }
  if (policy.scopeEvent?.transition) produced.add(policy.scopeEvent.transition);
  return produced;
}

void test("every contract input event is producible by a policy outcome, an exempt human-authority event, or the configured scope event (D05)", () => {
  const policy = loadPolicy();
  const produced = producedTransitions(policy);
  const offenders: { contract: string; input: string; event: string }[] = [];

  for (const file of readdirSync(CONTRACTS_DIR)) {
    const contract = JSON.parse(
      readFileSync(join(CONTRACTS_DIR, file), "utf8"),
    ) as Contract;
    for (const input of contract.inputs ?? []) {
      if (input.event === undefined) continue;
      const events: readonly string[] = Array.isArray(input.event)
        ? input.event
        : [input.event];
      for (const event of events) {
        if (produced.has(event) || isExempt(event)) continue;
        offenders.push({ contract: file, input: input.name, event });
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `every referenced event must be producible or explicitly exempt: ${JSON.stringify(offenders)}`,
  );
});
