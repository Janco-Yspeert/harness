# Outcome — Spike 013a Deterministic Workflow Execution and State Adoption

## Result and exact provenance

**COMPLETE — independently evaluated PASS, accepted by the user.** Not a
process exception.

Human root authority accepted cycle `002`: implementation attempt `13`,
candidate `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88` ("fix: bound Claude git
permissions to granted capabilities; add host-mediated commit publication"),
against verification attempt `16` (private attempt `014`), evaluator
revision `003`, result `PASS`, all 35 acceptance criteria `SATISFIED`
(`workflow.jsonl` `human-accepted`, commit `0f34444`). Promotion and As-Built
for this candidate are both canonically recorded (`promotion-recorded` at
commit `0c9bd55`, `as-built-recorded` at commit `a82634e`).

Spike 013a itself succeeds a rejected predecessor, cycle `001`
(implementation attempt `8`, candidate `bb541265d994aad1f1af30446bf0a19ad59e1537`,
verification attempt `10`, evaluator revision `001`, `PASS`, promoted and
As-Built) which the human explicitly rejected rather than accepted. Both
cycles' full private evidence chains, and both evaluator revisions used
across them (`002` and `003`), are preserved under `evaluation/**`.

## What Was Established

Harness can now take a legitimately authorized workflow-role allocation and
carry it through to a Harness-validated semantic outcome without the human
manually re-issuing provider-specific invocations for most of that path:

- Every governed allocation resolves one immutable, host-derived execution
  binding (contract path/version/content-identity, delivery mode, and, for
  protected roles, the canonical authority that permitted it) before a
  provider launches; a caller cannot construct or widen this by supplying
  fields or prompt text.
- Delegated evaluator authority derives generically from a workflow's own
  canonical ledger and preparation provenance rather than a hardcoded
  workflow allowlist; ordinary prompt claims of authority still cannot
  obtain it, and Claude now executes a mechanically valid delegated
  evaluator allocation for real, resolving the spike's original refusal
  (see Spike 011's Observed Failure 1) for the bounded case this spike could
  exercise.
- A provider-neutral `HARNESS_ROLE_RESULT` stdout protocol lets the host
  bind a validated semantic disposition (`succeeded`/`blocked`/`refused`/...)
  to the run's own role, attempt, and contract identity, independent of
  process exit; only a validated `succeeded` disposition can satisfy a
  governed prerequisite.
- The runner adopts already-valid canonical brief/Design-Map/
  evaluator-preparation checkpoints as an explicit, inspectable fact instead
  of fabricating dispatch history, and — after this cycle's correction —
  also derives eligibility for later phases from a canonical implementation
  handoff, not only from early-checkpoint adoption.
- Retries of a non-successful run preserve the prior run and link a fresh
  `executionAttempt`; run-slot identity additionally folds in the resolved
  allocation's `basisIdentity` so distinct canonical allocations for the
  same methodology attempt no longer silently collapse onto a stale prior
  run.
- `workflow status`/`dispatch`/`authority status` expose run identity, role,
  executor, contract identity/delivery mode, and process/role disposition
  together, and distinguish `unavailable` from `available` from
  `available-requires-evidence` authority transitions.
- Bounded, host-derived, candidate-commit-bound live-provider fixtures (LP1
  Claude, LP2 Codex, plus a durable-evidence host-boundary regression)
  exist as reusable, non-caller-shaped repository infrastructure rather than
  one-off manual scenarios.

## Implementation Summary

Cycle `001`'s accepted implementation (attempt `8`) built the execution
binding, delegation, semantic-result, early-checkpoint adoption,
non-consuming dispatch, and observability machinery, plus the two required
live-provider fixtures, and passed verification attempt `10` under evaluator
revision `001`.

Cycle `002`'s eventual accepted implementation (attempt `13`, the same
candidate line carried forward through nine further correction attempts
after the rejection — attempts `9` through `13` as the manifest's Runs
025–034) added: canonical-implementation-handoff-driven adoption for later
phases (closing the rejection's actual gap); durable, host-owned, disk-backed
run evidence split public/private by the run's *resolved* permission
profile rather than by spike/provider identity; run-slot deduplication keyed
on canonical `basisIdentity`; a generic candidate-commit-bound fixture
endpoint (replacing an earlier Spike/LP1-specific one); self-validating
fixture/permission-profile agreement; host-process-configurable durable
evidence roots (decoupling test/session pollution from real evidence
locations); bounded per-subcommand Claude git-capability translation
(`git-inspect`/`git-commit`/`git-publish`, replacing a blanket `Bash(git *)`);
and a host-mediated `publishCommit` primitive letting a role hand the host an
already-created commit to verify and push with the host's own credentials.
Getting Claude to accept protected delegated execution at all required a
multi-attempt provider-characterization detour (manifest Runs 010–013)
before the `claude-system-contract` delivery mode — replacing Claude's
system prompt rather than appending instructions — was established as the
only delivery mode Claude Code 2.1.270 would not refuse.

## Evaluation Evidence

Cycle `002`'s accepted result: evaluator revision `003` (pinned bootstrap
`evaluator` v11,
`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
private verification attempt `014` / canonical attempt `16`, `PASS`, all 35
criteria `SATISFIED`. Getting there took ten further verification attempts
after the rejection (canonical attempts `9` through `15`, all `BLOCKED` on
`INFRASTRUCTURE_FAILURE`): most reconfirmed 32–33/35 criteria against an
unchanged or newly-corrected candidate while AC08/AC09 (the live-Claude
fixture) and dependent AC34 stayed blocked because no evaluator session in
this cycle could itself reach a live Claude executor (`spawn claude ENOENT`,
unreachable host, or no external corroborable evidence). One of those
attempts (canonical `8`, private `006`) went further and found `FAIL`
(`IMPLEMENTATION_FAILURE`): the new host-mediated LP1 fixture endpoint
rejected every parent allocation the real dispatcher could actually produce,
by direct code-level construction rather than a live-provider gap — a real
defect, not an infrastructure limitation, corrected in the following
attempt. AC08/AC09/AC34 only reached `SATISFIED` once implementation
attempt `13`'s durable-evidence mechanism let a real Claude run captured
outside any evaluator's own sandboxed session (`13bb9de7`, produced before
this evaluator session began) be independently, cryptographically
corroborated — re-hashing the private log against the public record's
`logIdentity` and recomputing `basisIdentity`/`ledgerIdentity` from primary
Git history — rather than accepted on its own prose or re-run live.

## Material History

- **Cycle `001` was rejected, not superseded.** Its implementation attempt
  `8` passed verification attempt `10` (evaluator revision `001`, `PASS`,
  all 35 criteria `SATISFIED`), was promoted, and had As-Built recorded — and
  the human then rejected it anyway (`human-rejected`,
  classification `IMPLEMENTATION_GAP`, secondary
  `EVALUATOR_COVERAGE_DEFECT`). The reason: canonical authority already
  recorded implementation handoff attempt `8`, but the stale local runner
  could neither derive nor dispatch the required evaluator verification from
  it — the same class of adoption gap this spike exists to fix, now
  reproduced *inside* Spike 013a's own accepted-looking candidate, at a
  later checkpoint (post-implementation-handoff) than the frozen evaluator
  coverage (`E2`) had exercised (only brief/design → evaluator-prepare
  adoption). The evaluator therefore could not have caught it: its own
  coverage did not falsify this later-stage failure.
- **The correction cycle and evaluator repair.** `correction-cycle-opened`
  (cycle `002`) followed the rejection immediately, requiring both an
  implementation correction and an evaluator repair. The first forward
  evaluator-repair attempt itself came back `BLOCKED`
  (`METHODOLOGY_EVIDENCE_MODEL_DEFECT`): it could not reach the required
  immutable private evaluator authority under the `harness-hidden` sibling
  and, correctly by contract, refused to fall back to public artifacts
  rather than silently reasoning from less evidence. A separate fix
  recovered the evaluator lineage from cycle `001`'s own promoted evidence;
  a second forward evaluator-repair attempt then succeeded, producing
  evaluator revision `003` from revision `002` and repairing exactly the
  `AC16`/`AC17`/`AC19` coverage gap the rejection identified.
- **A publication-boundary failure inside a genuine PASS.** The evaluator
  verification run that produced attempt `16`'s accepted `PASS`
  (`cb314e67-eff3-41ce-adfb-d925cf390ac2`) completed its full substantive
  evaluation — all 35 criteria `SATISFIED` — and committed that result
  locally, but its own required `git push` failed before it could
  self-report completion, so its Harness-level `roleDisposition` recorded
  honestly as `blocked` even though it sits alongside a real, independently
  verified canonical `PASS`. Process lifecycle (`completed`) and role
  disposition (`blocked`) were genuinely different facts on the same run —
  exactly the distinction this spike's brief required Harness to preserve,
  demonstrated for real rather than only in the abstract.
- **The recovery.** That blocked publication was resolved through the
  host-mediated `git-publish` capability and `WorkflowRunRegistry#publishCommit`
  primitive (`POST /workflow-runs/{id}/publish`), built earlier in this same
  implementation attempt (`13`) for exactly this class of problem: the host
  independently verified the pending commit was a fast-forward descendant of
  the branch's remote tip and pushed it with its own credentials
  (published as commit `0c9bd55`), without rewriting the run's own honestly
  reported `blocked` disposition. The mechanism was exercised for its own
  first real use, not merely built and left theoretical.
- **A duplicate local/canonical runner-state gap in As-Built dispatch,
  recovered by explicit process exception.** After the genuine canonical
  `PASS`, the ordinary `tools/workflow.ts dispatch as-built --execute` CLI
  path refused with "As-Built requires a completed evaluator verify," even
  though canonical authority already recorded `verification-finalized: PASS`
  for this exact attempt. Root cause (`as-built-dispatch-exception.md`): the
  CLI's local eligibility gate checks a `.workflow/state.json` outcome
  record that only a host run self-reporting `roleDisposition: "succeeded"`
  can produce — and this cycle's own evaluator-verify run had just, for the
  reason above, honestly self-reported `blocked` instead. The gate was
  checking a duplicate, host-role-disposition-derived proxy for a fact
  canonical authority already stated directly. As-Built was dispatched
  directly against the host under an explicit, narrowly scoped human process
  exception that changed no run record, fabricated no `.workflow` outcome,
  and altered no canonical authority beyond the honest `as-built-recorded`
  transition the completed As-Built role itself was expected to produce.

## Decisions

- Cycle `001`'s rejected candidate and its promoted evidence remain
  preserved, not deleted or rewritten; cycle `002` is a distinct, explicitly
  bound successor sharing the same frozen brief and Design Map.
- The pinned pre-implementation evaluator authority (bootstrap `v11`,
  `sha256:5dea02ee...` above) governed both cycles' preparation and
  verification; candidate changes to evaluator invocation semantics never
  replaced it.
- Spike 011 Cycle `002` was deliberately left untouched throughout — its
  pre-existing, unrelated ledger edits were repeatedly identified,
  preserved, and excluded from every candidate in this spike, per the
  frozen brief's explicit instruction not to advance its authority during
  013a's own implementation or verification.
- The evaluator's own frozen contract text was not changed to require
  host-mediated-only publication; ordinary and protected Claude execution
  both still also receive a direct, bounded `git push` grant when
  `git-publish` is present, so host-mediated publication is additive
  infrastructure, not a replacement path, for this cycle.

## Discoveries

- **Runner adoption is only as complete as its latest exercised checkpoint.**
  Cycle `001` proved early-checkpoint adoption (brief/design →
  evaluator-prepare) but left later-phase adoption (implementation handoff →
  evaluator-verify) unimplemented; nothing forced this gap to surface before
  a real end-to-end run reached that later checkpoint for the first time.
- **A host run's own honest failure-to-publish can itself block the very
  local tooling meant to act on its success**, because the local CLI derived
  eligibility from process-level role-disposition rather than from canonical
  authority directly — the same underlying defect class as the runner
  adoption gap above, surfacing at a different phase boundary (As-Built
  instead of evaluator-verify).
- **Live-provider evidence that must be gathered inside the same sandboxed
  evaluator session as the verification itself is fragile in a way that
  durable, independently-corroborable evidence is not.** Ten of eleven
  cycle-`002` verification attempts spent their AC08/AC09 result on "cannot
  reach a live executor from this session," not on any defect; only
  decoupling evidence production from evidence corroboration resolved it.

## Deferred Concerns

Left deliberately unaddressed in this cycle, and worth naming explicitly as
intended next-spike work rather than oversights:

- The pinned evaluator `v11` contract's own frozen text still assumes
  *direct* git push rather than host-mediated publication; changing it was
  out of scope because an immutable pinned contract cannot be altered to
  suit a later implementation without re-litigating what the evaluator was
  actually pinned to test.
- The local runner's phase-dispatch eligibility checks in `tools/workflow.ts`
  still derive some gates (As-Built, and originally evaluator-verify before
  this cycle) from local operational-state proxies of host role-disposition
  rather than reading canonical authority directly — the same defect class
  the rejection identified, worked around for As-Built via an explicit
  human process exception this cycle rather than fixed at the root.
- Distinct attempt counters — canonical verification attempt, the
  evaluator's own private attempt ledger id, `.workflow/state.json`'s local
  per-phase dispatch attempt, and the host registry's execution-attempt
  counter — remain unreconciled into one identity scheme.
- Per the frozen brief's own completion boundary, Spike 011 Cycle `002`'s
  evaluator-repair is not itself resolved by this spike; only its retry
  readiness (AC34) is established.

## Skill Versions and Workflow Cost

Brief Readiness v3; Design Map v2; evaluator v11 (pinned bootstrap
authority) with two live evaluator revisions across the two cycles
(`002` promoted from cycle `001`'s repair of revision `001`; `003` repaired
from `002` during cycle `002`); implementation v3; As-Built v2; Outcome v3.
Two full accepted-then-rejected/accepted cycles, 13 implementation attempts
and 16 canonical verification attempts in cycle `002` alone (manifest Runs
001–036) plus cycle `001`'s own attempts, is a materially higher workflow
cost than a single-cycle spike; the majority of cycle `002`'s attempts were
spent establishing durable, independently-corroborable live-Claude evidence
rather than on new defects. Manifest entries are contemporaneous; no
reliable runtime cost statistics were captured, so none are invented here.

## Next Step

Per the frozen brief's completion boundary: resume the already-open Spike
011 Cycle `002` evaluator-repair as the first production use of this
corrected execution path, then proceed to executor model/reasoning/cost/
token/time telemetry, then separately address lightweight-change and
workflow-entry friction. This Outcome does not start Spike 014 and takes no
position on its scope.
