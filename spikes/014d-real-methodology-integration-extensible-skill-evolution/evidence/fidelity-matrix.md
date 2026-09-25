# 014d Fidelity Matrix — skill ↔ contract ↔ MCP ↔ artifact ↔ policy/transition

This is the human-reviewable matrix for the eight real Harness roles in the
candidate methodology N+1. Its machine form is `MATRIX` in
`test/skill-fidelity.test.ts`; that test keeps this document, the real skill
bytes, the contracts and `methodologies/harness/policy.json` consistent.

## Evidence layers (Design Map C7)

- **(a) Pinned bytes.** The assignment delivers exact pinned skill and contract
  bytes whose identities equal the trusted manifest entries.
- **(b) Scripted worker.** A scripted MCP worker follows each row against the
  real kernel, governed host, registered Claude adapter and MCP tool server.
  This is **scripted compliance**, not provider behaviour. The provider process
  is replaced by `tools/fixtures/fake-provider.ts`.
- **(c) Static check.** The real skill bytes name each required MCP operation,
  artifact path and result or methodology term.

Deterministic evidence supports AC01 only. It does not replace the real-role,
AC05 fixture or observed-orchestrator proofs; see `real-provider-runs.md`.

## Matrix

Every role declares results `succeeded`, `blocked`, `refused` and `failed`, and
may request human `input`, `approval` or `root`. Every non-evaluator role
forbids `evaluator-private` exposure and holds only the public `repository`
workspace. The three evaluator roles are `protected` and also hold the private
`evaluation` workspace.

| Role | Skill | Contract | MCP operations | Public artifacts / postconditions | Semantic result vocabulary | Host-owned transition(s) | Failure / negative states exercised |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `brief-readiness` | `skills/brief-readiness/SKILL.md` | `contracts/brief-readiness.json` | `assignment`, `submitResult` | `feedback.md`, `manifest.md`; input `spike.md` | `succeeded` + `verdict` `READY` / `NOT_READY` | `brief-frozen` (READY), `readiness-blocked` (NOT_READY) | NOT_READY records `readiness-blocked` and gates further automatic work; a result without its committed artifact keeps the result and blocks the transition |
| `design-map` | `skills/design-map/SKILL.md` | `contracts/design-map.json` | `assignment`, `submitResult` | `design-map.md`, `manifest.md` | `succeeded` `{}`; `blocked` to return to the brief | `design-map-frozen` | Uncommitted artifact: `kernel.transition-blocked`, semantic result preserved; semantic `blocked` stops automatic continuation (host maintenance 001) |
| `evaluator-prepare` | `skills/evaluator/SKILL.md` | `contracts/evaluator-prepare.json` | `assignment`, `submitResult` | `coverage-map.json`, `eval-requirements.md`, `manifest.md`; private revision under `.eval/revisions/NNN/` | `succeeded` `{}`; `blocked` before a valid frozen revision | `evaluation-prepared` (validated by `prepared-coverage`) | Launches inside the private workspace; the public checkpoint carries no private paths |
| `implementation` | `skills/implementation/SKILL.md` | `contracts/implementation.json` | `assignment`, `submitResult` | Candidate commit plus `manifest.md` | `succeeded` `{}`, `blocked`, `failed` | `implementation-handoff` (exact committed `HEAD`) | No private workspace in its grant; a retry binds only the committed `IMPLEMENTATION_FAILURE` `verification-finalized` feedback identity |
| `evaluator-verify` | `skills/evaluator/SKILL.md` | `contracts/evaluator-verify.json` | `assignment`, `submitResult`, `requestAction` (`promotion`) | `verification-result.json` (with `promotionPlan`), `manifest.md`; private `.eval/promotion-plan.json` built by `tools/archive-manifest.ts` | `succeeded` + `result` `PASS` / `FAIL` / `BLOCKED` + `classification` `IMPLEMENTATION_FAILURE`, `EVALUATOR_DEFECT`, `SPECIFICATION_AMBIGUITY`, `SPECIFICATION_DRIFT`, `INFRASTRUCTURE_FAILURE` | `verification-allocated` (host attempt), `verification-finalized`, and `promotion-recorded` only after a successful host action | Omitted, ineligible or refused-oversized plan; wrong candidate or attempt; omitted plan artifact; over-bound (B + 1) request; mutated source; duplicate delivery. None fabricates archival, and the PASS stays intact behind the incomplete-archival gate |
| `evaluator-repair` | `skills/evaluator/SKILL.md` | `contracts/evaluator-repair.json` | `assignment`, `submitResult` | `coverage-map.json`, `manifest.md`; new private revision | `succeeded` `{}`; `blocked` | `evaluator-repair-recorded` | Ineligible before its exact `EVALUATOR_DEFECT` or human trigger; the earlier revision and finalized attempts are never rewritten |
| `as-built` | `skills/as-built/SKILL.md` | `contracts/as-built.json` | `assignment`, `submitResult` | `as-built.md`, `manifest.md`; requires `promotion-recorded`; commits only the host-written, identity-matched `evaluation/promotion.json` first when it is untracked | `succeeded` `{}`; `blocked` when `evaluation/promotion.json` is missing or does not match the bound promotion identity | `as-built-recorded` | Not allocated without host `promotion-recorded` |
| `outcome` | `skills/outcome/SKILL.md` | `contracts/outcome.json` | `assignment`, `submitResult` | `outcome.md`, `manifest.md` | `succeeded` + `completionMode` `STANDARD` / `PROCESS_EXCEPTION`; `blocked` | `outcome-recorded` | Not allocated before a real human acceptance; the process exception is reported truthfully without `promotion-recorded` |

Contract paths are relative to `methodologies/harness/`.

## Corrections made at the smallest boundary

- **Skills.** Each role skill gained a `Harness worker protocol` section. It
  names the typed `submitResult` vocabulary and any required `requestAction`,
  and states that prose is never a result. The evaluator skill also defines the
  governed private workspace, the host-allocated attempt number and the
  promotion-plan sequence. Contract versions were bumped, and prior bytes are
  preserved under `docs/history/skills/`.
- **Contracts.** `evaluator-verify.json` declares `promotion.plan`
  (`.eval/promotion-plan.json`), so the host requires the archived plan.
  `implementation.json` declares its `manifest.md` postcondition.
- **Policy.** Semantic `blocked` is no longer an automatic retry disposition
  (host maintenance 001). A verified PASS without host `promotion-recorded` or
  an authorized process exception is a gate. A NOT_READY readiness verdict is a
  gate: an unchanged brief is never re-reviewed automatically.
- **Host.** One exported artifact bound B (`MAX_ACTION_ARTIFACTS`) is used by
  the schema, request parsing, the host promotion check and the archive
  utility. The host requires the declared plan to be archived exactly once and
  records its `planIdentity` in `promotion-recorded`. Role inputs prefer an
  event's `artifactCommit` for committed provenance.

## Where each layer is proven

- (a) and (b): `test/skill-fidelity.test.ts`, "one bounded grant carries all
  eight real roles …", together with the negative, repair, retry and Outcome
  tests in the same file.
- (c): `test/skill-fidelity.test.ts`, "every real skill names its matrix
  operations, artifacts and result vocabulary".
- Plan and utility refusals: `test/archive-manifest.test.ts`.
