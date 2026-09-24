# Spike 014c closeout and 014d handoff

## Status

Spike 014c is **independently verified but administratively incomplete**.

The production governed-executor work is accepted as the candidate implementation for
014c. Independent evaluator verification completed successfully against candidate
`e61c965e56637b8b44e14fd72947f7b7459bca80`, evaluator revision `001`, attempt
`006`, execution `65f8dbab-42e5-4f04-b2da-257310197142`.

The governed semantic result
`6d61e869-809d-4a10-88f0-0614434c19e1` was `succeeded` / `PASS`.
The evaluator public artifact was committed at
`9e5d95a2ba690d84df270b7eda3490ac63c9786b`, and the canonical ledger checkpoint
recording that PASS is `b89d477b5b336ee7025a7b9d63cf3b141fd4e163`.

The successful independent execution used the corrected pre-candidate bootstrap pin
`ab97603d10023868e56fbb4ed192c3bf6781b020` from
`feat/spike-014-bootstrap-diagnostic`. That bootstrap path discovered the existing
local Claude login through the restricted non-secret environment allowlist and passed
its harmless structured preflight before the single authorized evaluator execution.

014c's production real-provider smoke evidence also remains valid: the governed Codex
and Claude routes both submitted typed semantic results through the production worker
interface, and the Claude synthetic promotion exercised the real host-mediated
`requestAction(promotion)` path successfully. This is evidence for the production
adapter and host-action machinery; it is not evidence that the real evaluator completed
its own archival action.

## Incomplete evaluator evidence promotion

The evaluator recorded promotion eligibility in `verification-result.json`:

- promotion requested: `true`;
- private request identity:
  `sha256:23f665990ac79d941c6231dd0a4bdaf9c61179bb22abc4b9daba14754b1ed239`;
- attempt-ledger identity:
  `sha256:0392f040fa9ba47cf60f000bd72a63da1ba1ab5fc7b375aa73c486a96cd52eb9`;
- attempt-result identity:
  `sha256:70c263b64eb477b195a063ba76a415165dcbeff4bb85dfab183ace73122e87e0`;
- evaluator revision `001`: `ELIGIBLE`.

However, the evaluator-authored private promotion plan required to reconstruct the
exact artifact mappings was not persisted in the authorized evaluator workspace.
The archive utility therefore cannot validate the recorded private request identity or
derive the exact evaluator-authored mappings.

No replacement plan has been fabricated. No host promotion action has been submitted.
No private evaluator evidence has been copied manually. No `promotion-recorded`,
`as-built-recorded`, `human-accepted`, or `outcome-recorded` transition has been
created.

The surviving private evaluator directory is intentionally retained unchanged.

This incomplete archival step does **not** rewrite or invalidate the independent PASS.
It remains a real PASS with an incomplete subsequent host action.

## Evaluator notes for human acceptance

The four non-failing notes recorded by the evaluator remain part of the acceptance
context:

1. The executor decision's authentication and billing position rests on the frozen
   brief's statements. The Anthropic reference documentation was unreachable from the
   implementation sandbox. The route selection does not depend on it.
2. The decision record's version table shows the sandbox Codex binary
   `0.154.0-alpha.6.2`. The governed smoke used codex-cli `0.155.1` and Claude Code
   `2.1.280`.
3. The adapter reuse inventory calls the bootstrap tool unchanged. It was changed only
   by a human-authorized bootstrap recovery commit, not by implementation work.
4. The passing smoke record embeds no source revision. Its attribution to the corrected
   adapters rests on commit timing and an unchanged source tree up to the candidate.

## Decision for 014c

Do not spend further implementation or provider quota extending the temporary bootstrap
runner merely to recover this missing promotion request.

If the private evidence is later archived manually, that action must be recorded
explicitly as human-authorized recovery and must not be represented as the missing
evaluator-authored request.

If 014c is formally closed without evaluator-evidence archival, use an explicit
process-exception path rather than fabricating the ordinary promotion transition.

Until either happens, the canonical workflow correctly remains at:
independent `PASS`, promotion incomplete.

## 014d handoff

014d owns the real-methodology integration work that 014c deliberately deferred.

At minimum, 014d should:

1. Run each of the eight actual Harness roles through the production governed worker
   interface and verify that the real skill instructions, contracts, semantic results,
   evidence production, and required host actions agree in execution rather than only
   structurally.
2. Version the evaluator skill/contract so a terminal PASS records a typed, durable
   promotion eligibility plan or explicit ineligibility decision, with exact candidate,
   evaluator revision, attempt, source identities, and canonical destination mappings.
3. Exercise the real evaluator through the production MCP adapter and prove the complete
   evaluator PASS -> `requestAction(promotion)` -> host validation -> action result ->
   `promotion-recorded` sequence. Do not add a second promotion mechanism merely to
   preserve bootstrap compatibility.
4. Preserve the distinction between semantic PASS and successful evidence archival.
   Failed, denied, omitted, or malformed promotion must remain inspectably incomplete
   without rewriting PASS.
5. Audit the other seven skills for equivalent skill-to-protocol gaps: required
   checkpoints, semantic result submission, privileged host actions, and assumptions
   that belong to the host rather than the worker.
6. Exercise methodology extensibility sufficiently to show that later optional skills or
   changed role capabilities can be introduced through candidate methodology evolution
   without replacing the authority that evaluates them.
7. Keep context assembly/execution strategy evolvable. Investigate cache-friendly stable
   prompt prefixes and preserve the possibility of later compatible public-role context
   reuse, while keeping evaluator-private exposure isolated. Full cross-role session
   reuse is not required by 014d unless evidence shows it is necessary.

014d should use the currently trusted evaluator authority to evaluate the candidate
methodology. The candidate evaluator must not become authoritative over its own
evaluation. Human methodology promotion remains a separate later decision.
