# Brief Readiness — Spike 014d Real Skill Execution and Host Contract Integration (Run 001)

- Skill: `brief-readiness` contract version 4
- Reviewed brief:
  `spikes/014d-real-methodology-integration-extensible-skill-evolution/spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`
  (matches the host-bound input identity)
- Repository state reviewed: `feat/spike-014` at
  `de3cc807e47a5d679607c5bebb1978e7d30b1291` ("prioritize
  real skill execution, orchestration and promotion")

## Summary

The brief is coherent, its priorities are explicit, and it matches the
repository. Every named mechanism it builds on exists as described:

- `tools/archive-manifest.ts` already defaults to `.eval/promotion-plan.json`.
  It parses an `evaluator-promotion-plan` decision (`ELIGIBLE`/`INELIGIBLE`),
  refuses symlinks, escaping paths, duplicates and missing attempt ledgers,
  and expands bundles into identity-checked mappings. §3 extends a real
  utility; it does not invent one.
- The production `promote` host operation (`src/kernel/host.ts`) and the MCP
  `requestAction` schema (`src/executors/protocol.ts`, `maxItems: 64`) exist,
  so the §3 instruction "reuse, do not rebuild" is feasible.
- `ACTIVE_ROLES` hard-codes the eight roles
  (`src/methodology-evolution.ts:24`, enforced at lines 446 and 454). This
  confirms §5's premise.
- `promoteMethodology()` checks that the evaluating methodology is the
  current trusted one and differs from the candidate. It does not bind the
  evaluation evidence to the candidate revision. This confirms the §4 gap
  (a PASS for candidate A could be applied to B).
- `assertTrustedMethodology()` (`src/kernel/trust.ts`) compares the
  *working-tree* definition against the trusted record when a new workflow
  grant is issued. Role grants inside an existing workflow resolve the pinned
  definition (`src/kernel/execution.ts`, `definition(workflow, grant.methodology)`).
  §4's concern is therefore real but limited to new grants, and the "small
  generic trusted-snapshot/worktree separation" is feasible.
- Host continuation grants exist (`continuation` flag, `#continue` in
  `src/kernel/host.ts`, `continuation not authorized` in
  `src/kernel/resolver.ts`). §2's unattended continuation is an orchestrator
  and instruction problem, not new kernel machinery.
- `workerInstructions()` exists at `src/executors/governed.ts:93`. The §7
  legacy components (`tools/governed-claude-bootstrap.ts`,
  `tools/legacy-workflow.ts`, `src/workflow-backend.ts`,
  `src/claude-workflow.ts`) exist and still have callers in `src/index.ts`,
  `tools/workflow.ts` and tests, so the audit is concrete.
- The trusted evaluator skill (`skills/evaluator/SKILL.md`, "Complete `PASS`
  and request promotion") already says to request the promotion action but
  does not name the plan file. That is exactly the gap §3 closes.

The scope limits (no 014c recovery, no 015 quota work, no 014e canary, no
general plugin or session framework) are clear. Negative cases are
enumerated. The N → N+1 authority sequence fits the existing trusted-history
model. Nothing forces a later role to invent product scope, so there are no
blockers. Three material clarifications would stop implementations and
evaluation from diverging.

## Findings

### M1 — Orchestrator instruction adoption boundary and observed-run runtime (material clarification)

**Brief.** §2 requires revised orchestrator behavior with "observed
orchestrator-level evidence". It says to "Track the revised orchestrator
instruction version/provenance explicitly without … bypassing its applicable
review". AC02 requires "a bounded observed orchestrator-initiated run". §4
requires that candidate N+1 "must not silently govern its own preparation,
verification or real trust promotion".

**Repository.** `skills/orchestrator/SKILL.md` (contract v2) is outside the
methodology policy and manifest. `methodologies/harness/policy.json`,
`src/methodology-evolution.ts` and `src/kernel/trust.ts` never reference it,
and its only version record is `docs/history/skills/README.md`. The
orchestrator is loaded by the interactive session from the working tree.
`AGENTS.md` ("Supervisor identity") names **Codex App** as the default
orchestrator/supervisor. The brief's evidence and adapter language centres on
Claude/Codex adapters without saying which orchestrator runtime is observed.

**Consequence.** The trust gate and `promoteMethodology()` do not cover the
orchestrator. Once the candidate edits `skills/orchestrator/SKILL.md` in the
shared checkout, the edited version can govern the human's live 014d session
before acceptance. Nothing in §4 says whether that is allowed. Implementers
could also reasonably diverge in two ways:

- (a) add the orchestrator to the methodology manifest, which changes
  manifest identity and trust-gate semantics; or
- (b) keep a separate provenance record adopted by merge.

The evaluator would then have no fixed standard for AC02/AC03 or for "its
applicable review".

**Smallest clarification.** Add one sentence to §2 stating:

1. whether the revised orchestrator is adopted through the same human
   trust-promotion decision as N+1, and whether it enters the trusted
   manifest or is recorded separately;
2. that the candidate orchestrator is exercised as a subject in the bounded
   fixture and does not drive 014d's own workflow before acceptance (or
   that it may, and why that is safe); and
3. which orchestrator runtime(s) the AC02/AC03 observed run must use (Codex
   App, Claude Code, or either).

### M2 — Legitimately large eligible evidence versus the 64-artifact protocol bound (material clarification)

**Brief.** §3 requires every eligible bundle to be expanded into per-file
mappings and delivered in one `requestAction(promotion)`. It lists "oversized
manifest (including the current protocol artifact bound)" as a negative
proof, and AC06 says oversized plans "cannot fabricate archival".

**Repository.** `src/executors/protocol.ts` caps `artifacts` at 64
(`maxItems: 64` and the `artifacts.length > 64` check).
`tools/archive-manifest.ts` expands each `evaluator-revision` directory into
one mapping per file. Archived evidence already approaches this size. For
example, `spikes/008-workflow-runner/evaluation/` has a single revision with
over a dozen hidden-test and support files plus ledger, attempts, freeze and
`promotion.json`. A cycle with an evaluator repair (two eligible revisions)
plus attempt history can plausibly exceed 64.

**Consequence.** The brief makes the over-bound case a refusal, but never says
whether an **eligible**, honest PASS whose manifest exceeds 64 is expected to
archive successfully. Implementers could:

- raise or remove the bound (a public protocol change);
- split the request into several actions (which conflicts with one
  `promotion.json` and one `promotion-recorded`);
- archive a bundle unit; or
- accept that large evidence always ends as an "incomplete phase".

The evaluator cannot fairly judge any of these without the intended answer.

**Smallest clarification.** State whether the 64-artifact bound stays fixed in
014d. If it does, say that an eligible over-bound PASS ends as a truthful
incomplete or denied action. If it does not, say what may change it (for
example, the Design Map may set a new explicit bound on the same single
action).

### M3 — What "deterministic provider-free exercise of actual skill bytes" asserts (material clarification)

**Brief.** §1 and AC01 require "deterministic provider-free exercises with the
real skill bytes for all eight roles". They also say "a skill reporting in
prose that it *would* perform an action does not pass" and warn against
"describ[ing] mocked compliance as observed real-provider behavior".

**Repository.** Without a provider, no model interprets the skill text. The
available deterministic mechanisms are:

- pinned-assignment delivery of exact skill bytes (`workerInstructions()`,
  Role Grant `skill.identity`);
- scripted MCP workers that follow the fidelity matrix against the real host
  (the 014c pattern in `test/governed-executors.test.ts`); and
- static consistency checks between skill text, contracts
  (`methodologies/harness/contracts/`) and policy.

**Consequence.** One implementation could treat AC01 as "exact bytes were
delivered and a scripted conforming worker advanced the host". Another could
also require machine-checked agreement between each skill's instructions
(tool names, artifact paths, verdict vocabulary) and its contract and matrix
row. Only the second catches the §1 failure mode of skill text that never
tells the worker to call the tool. The evaluator needs to know which one is
mandatory.

**Smallest clarification.** One sentence in §1 or AC01 naming the required
deterministic assertions. For example: delivery of exact pinned bytes;
scripted-worker conformance to each matrix row through the real host; and a
static check that each skill's text names the MCP operations, artifact
paths and result vocabulary its contract requires.

## Editorial notes (non-blocking)

- **E1.** Broken section references. The Evaluator Verify row of §1 says "in
  `` `3` ``", and §4 step 3 says "``` ``1–3` ```". Both appear to be lost `§`
  characters and should read "§3" and "§§1–3".
- **E2.** The header's "Draft baseline" is `7a00523`, but the reviewed brief is
  at `de3cc80`. The header already says to re-resolve at freeze. Update it
  when freezing.
- **E3.** §4 step 5 calls for "one genuine human acceptance/trust-promotion
  decision". Execution step 7 and the Outcome skill (`skills/outcome/SKILL.md`)
  require real human acceptance. Consider saying explicitly that the step-6
  decision is the acceptance the Outcome records, so that nobody seeks a
  second human gate.

## Review limitations

- I did not read evaluator-private material (`eval-spec.md`, `.hidden-test/**`,
  `.eval/**`). The archived-evidence size estimate in M2 comes only from file
  listings of published `evaluation/` directories.
- A sandbox approval restriction blocked a shell loop that would have counted
  archived evidence files for every spike. M2 therefore relies on a glob
  listing rather than exact per-spike counts.
- I did not run the full test suite (`npm run check`). This review changes
  only documentation, and the brief makes no claim about the current suite's
  status.
- I did not read or modify the Harness-owned `workflow.jsonl`.

## Files changed

- `spikes/014d-real-methodology-integration-extensible-skill-evolution/feedback.md`
  (this review)
- `spikes/014d-real-methodology-integration-extensible-skill-evolution/manifest.md`
  (created; Run 001 entry)

The verdict passes, so no `preliminary/` snapshot was created.

## Checks run

- Checked that the SHA-256 of `spike.md` matches the host-bound input identity.
- Inspected `AGENTS.md`, `skills/evaluator/SKILL.md`,
  `skills/orchestrator/SKILL.md`, `skills/outcome/SKILL.md` and
  `tools/archive-manifest.ts`.
- Inspected `src/methodology-evolution.ts` (`ACTIVE_ROLES`,
  `promoteMethodology`), `src/kernel/trust.ts`, `src/kernel/host.ts` (grant,
  continuation and promote operations) and `src/kernel/resolver.ts`
  (continuation).
- Inspected `src/kernel/execution.ts` (pinned definitions),
  `src/executors/protocol.ts` (artifact bound) and `src/executors/governed.ts`
  (`workerInstructions`).
- Searched for legacy-bridge call sites.
- Inspected the prior 014c feedback and manifest format.
- Ran Prettier on this file.

## Verdict

**Ready after minor clarification**
