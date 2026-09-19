# Evaluation Result — Spike 013a, attempt 008

## Overall Result

PASS.

## Evaluation Source

- Verification-attempt identifier: `008` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `10`
  (`implementationAttempt: 8`), allocated `2026-09-15T10:41:06.281Z`
  (`workflow.jsonl`, commit `eff412578f47098c582e1151086d9f9c0134e79b`, "chore:
  allocate Spike 013a verification attempt 10").
- Project commit evaluated: `bb541265d994aad1f1af30446bf0a19ad59e1537` ("feat:
  add candidate-bound workflow fixtures"), branch `feat/spike-013a`. This is
  the sole implementation commit since the last evaluated commit (`2bce703`,
  private attempt 007, `BLOCKED`/`INFRASTRUCTURE_FAILURE`).
  `git log --oneline bb54126..HEAD` shows exactly three intervening commits,
  all non-implementation: `0baf1fa` ("chore: hand off Spike 013a
  implementation 8"), `06ed2b9` ("docs: preserve standalone LP1 evidence"),
  `eff4125` ("chore: allocate Spike 013a verification attempt 10").
  `git diff --stat bb54126..HEAD` touches only
  `lp1-primary-evidence-008.md` (new), `manifest.md` (append), and
  `workflow.jsonl` (append) — no `src/`, `tools/`, or `test/` change. No
  implementation content is uncommitted.
- Working tree: one pre-existing, unrelated, uncommitted drift in
  `spikes/011-host-owned-workflow-runs/workflow.jsonl` (a single
  `correction-cycle-opened` line dated `2026-09-11T19:18:29.452Z`, predating
  every Spike 013a implementation commit) — the same drift every prior
  attempt (002-007) independently observed and excluded; plus an untracked,
  permission-masked `.mcp.json` sandbox artifact unrelated to any repository
  content. No other uncommitted change exists.
- Frozen `eval-spec.md` identity:
  `sha256:26979bd42ae5f5651624dfe1642f5966f92ed5b0b740a4c40b3cab54f62b5f1f`
  (revision `002`, re-hashed fresh this attempt — unchanged).
- `case-manifest.json` identity:
  `sha256:8e018f5b945a5121e3ffac96323c93761c7ed815a67b2ae7c0904230fbb2fba8`
  (re-hashed fresh — unchanged).
- Spike brief (`spike.md`) identity:
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  (re-hashed fresh — matches frozen).
- Design Map identity:
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
  (re-hashed fresh — matches frozen).
- Public `eval-requirements.md` identity:
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`
  (re-hashed fresh — matches frozen).
- Public `coverage-map.json` identity:
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`
  (re-hashed fresh — matches frozen).
- All five `.hidden-test/*.test.ts` files and `.hidden-test/manifest.json`
  re-hashed fresh this attempt; all byte-identical to their revision-002
  `freeze.json` identities (no drift).
- `bootstrap/evaluator-skill.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`)
  and `bootstrap/evaluator-authority.json` re-hashed fresh; both unchanged.
  Working-tree `skills/evaluator/SKILL.md` re-hashed to the identical
  identity; no binding failure.
- Evaluator revision: `002` (unchanged from attempts 002-007), canonical
  revision identity
  `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`,
  evaluator skill v11,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- No specification drift detected in any frozen input. No evaluator
  correction was needed or performed this attempt.
- This evaluator session's own ambient environment does not set
  `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` or `HARNESS_CLAUDE_EXECUTABLE`
  (confirmed via `env` before any check), so Finding 2 (carried forward from
  attempts 006-007, a non-criterion-flipping regression: `resolvePermission
  Profile`/`workflowProviderProgram` still read those two variables
  unconditionally — confirmed unchanged in this diff by direct source
  inspection) does not manifest this attempt; `npm test` is unaffected either
  way (Finding 2 never flips a criterion).
- Evaluation timestamp: 2026-09-15 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `008`).

## What changed since the last evaluated commit (`2bce703` -> `bb54126`)

One implementation commit, `bb54126` ("feat: add candidate-bound workflow
fixtures"), replacing the entire LP1 host-mediation mechanism:

1. `POST /workflow-fixtures/lp1` (which required an *active* canonical Spike
   013a Claude `evaluator-verify` parent run, the mechanism attempt 006 found
   defective and attempt 007 confirmed reaches only the executor-availability
   layer) is removed. A generic `POST /workflow-fixtures` operation replaces
   it, accepting only `workflow`, `fixture`, `candidateCommit`, and an
   optional correlation `parentRunId` (`parseWorkflowFixtureRequest`,
   `src/workflow-run.ts`). Role, executor, contract, permissions, workspaces,
   authority, and expected result cannot be supplied by the caller.
2. `WorkflowRunRegistry.allocateFixture` (`src/workflow-run.ts`) resolves the
   fixture definition with `git show <candidateCommit>:<definitionPath>` (not
   mutable working-tree bytes), proves `candidateCommit` is the *current*
   canonical `implementation-handoff` (rejecting a stale candidate once a
   later `implementation-handoff` or a `PASS` `verification-finalized`
   supersedes it), validates the fixture's declared protected role
   (`evaluator-verify` only) and contract against the workflow's pinned
   canonical evaluator authority (`resolvePinnedVerificationAuthority` +
   `resolveRepositoryContract`), and allocates an ordinary host-owned run in
   a separate `fixture:<name>` slot, distinct from any canonical verification
   run and correlated to a parent (if any) only for inspection, not
   authority.
3. Spike 013a's own `fixtures/lp1.json` (new file, committed by this
   candidate) fixes the LP1 fixture's identity, `claude` executor, pinned
   evaluator v11 contract identity/delivery mode, `repository-read-only`
   permission profile, `permittedSideEffects: "none"`, and
   `expectedRoleDisposition: "succeeded"`. Harness core contains no Spike
   013a- or LP1-specific identifier.
4. `isSuccessfulWorkflowFixtureEvidence` (`src/workflow-run.ts`, exported from
   `src/index.ts`) is a new pure predicate over a `WorkflowRunRecord` plus an
   expected `{workflow, fixture, candidateCommit}`, checking `status ===
   "completed"`, `roleDisposition === "succeeded"`, the phase/fixture-name/
   candidate-commit match, and that `fixture.definitionIdentity`/
   `fixture.handoffIdentity` agree with `allocationAuthority.definitionIdentity`/
   `allocationAuthority.basisIdentity` and `allocationAuthority.contractIdentity
   === record.contractIdentity`.
5. `test/workflow-run.integration.test.ts`'s LP1 test is replaced by a generic
   "repository fixtures resolve from candidate bytes without caller-shaped
   execution" test using a wholly synthetic fixture workflow, proving:
   standalone allocation with no active parent required; exact
   candidate-byte resolution (`git show`); canonical/pinned-contract
   validation (rejects a fixture whose declared contract identity doesn't
   match the pinned one); rejection of any caller-supplied `role`/`executor`
   field; rejection of a stale candidate commit; and that
   `isSuccessfulWorkflowFixtureEvidence` returns `true` for the genuine
   candidate/fixture pairing and `false` for a mismatched one.

No other source file changed (`src/workflow-backend.ts`, `tools/workflow.ts`,
the Codex path, and every other public regression are untouched).

## Executable hidden cases (revision 002, unchanged)

| Case | Criteria | Result |
| --- | --- | --- |
| E1 `dispatch-inspection-non-consuming` | AC20 | **PASS** |
| E2 `canonical-authority-adoption` | AC16, AC17, AC19 | **PASS** |
| E3 `recoverable-preexecution-failure` | AC21 | **PASS** |
| E4 `blocked-phase-retry` | AC22, AC35 | **PASS** |
| E5 `authority-status-evidence-aware-transitions` | AC27, AC28 | **PASS** |

All five re-run fresh this attempt against commit `bb54126`
(`node --test <each .hidden-test/*.test.ts>` from the public project root):
5/5 pass. No leftover fixture directories after the run.

## Non-executable procedures

| Procedure | Criteria | Result | Basis |
| --- | --- | --- | --- |
| PR1 | AC01, AC02, AC03 | PASS | Unaffected; re-confirmed by fresh `npm test` (74/74) |
| PR2 | AC04, AC07 | PASS | Unaffected; re-confirmed by fresh `npm test` |
| PR3 | AC05, AC06 | PASS | Unaffected; re-confirmed by fresh `npm test` |
| PR4 | AC12, AC13, AC14, AC15 | PASS | Unaffected; re-confirmed by fresh `npm test` |
| PR5 | AC18, AC23, AC24, AC25, AC26 | PASS | Unaffected; re-confirmed by fresh `npm test` |
| PR6 | AC29 | PASS | Unaffected; this spike's own preserved `.workflow`/`manifest.md` history, unchanged |
| PR7 | AC30, AC31 | PASS | Bootstrap byte-identity re-confirmed fresh; `npm test` includes the pin-dispatch regression (5/5 in that file) |
| LP1 | AC08, AC09 | **PASS** (was `BLOCKED` at attempt 007) | Independently corroborated standalone live-Claude fixture evidence for this exact candidate commit — see below |
| LP2 | AC10 | PASS | Unaffected; established live Codex fixture evidence from private attempt 002, re-confirmed unaffected by this diff (no Codex-path source file changed) |
| LP3 | AC11 | PASS | LP1 and LP2 share the same generic `allocateFixture`/`isSuccessfulWorkflowFixtureEvidence` mechanism (confirmed by direct source reading of `src/workflow-run.ts`); both bind an exact pinned contract identity/delivery mode and require a host-validated `succeeded` semantic result via the identical predicate. No material difference beyond provider-specific delivery (`claude-system-contract` vs. repository-loaded Codex contract), which the frozen decision rule explicitly permits |
| HB1 | AC32 | PASS | Both the established live Codex fixture (private attempt 002) and this attempt's corroborated LP1 evidence (real host process, PID `3379932`, real spawned Claude Code process) cross the real Harness host boundary |
| COMP1 (a) | AC33 | PASS | Unaffected; established live Codex fixture evidence, automatic unattended semantic-result capture, re-confirmed by fresh `npm test` |
| COMP1 (b) | AC34 | **PASS** (was `BLOCKED` at attempt 007) | `spikes/011-host-owned-workflow-runs/**` confirmed byte-for-byte unchanged across the whole Spike 013a implementation/verification cycle (same single pre-existing, pre-dating drift line every attempt has excluded); LP1's exercise of the original refusal condition (R9) is now affirmatively demonstrated (not merely blocked), which `case-manifest.json`'s `COMP1` decision rule accepts as the AC34 readiness demonstration |

35 of 35 mandatory criteria `SATISFIED`.

## LP1 corroboration (AC08, AC09, AC34) — independently verified, not rerun

Per this attempt's allocating instructions, fresh standalone LP1 primary
evidence for this exact candidate commit was already committed at
`spikes/013a-Workflow-execution-friction/lp1-primary-evidence-008.md` before
this verification attempt began (public manifest.md "Run 022 — Standalone
real LP1 evidence", implementation-side, not a claim of evaluator
acceptance). Per this evaluator's own established practice for external
live-provider evidence (private attempt 003's independent corroboration of
`.eval/evidence/lp1-external-live-claude-2026-09-13.md`, and attempt 007's
direct real-backend probes), a written claim is not accepted on its own
prose; it must be independently corroborated against primary, harder-to-
fabricate sources before being treated as authoritative. This evaluator's own
execution environment still cannot itself spawn a real `claude` process
(the same `spawn ... ENOENT` limitation independently confirmed across
private attempts 002, 004, 005, and 007), so a fresh nested live-Claude
fixture run was not attempted; per this attempt's allocating instructions,
LP1 was not rerun because the preserved evidence proved admissible and
sufficient on independent corroboration, detailed below.

**Structural / hash-based corroboration (the decisive evidence).** The
committed evidence file embeds a full host-owned run record with several
derived identities that `WorkflowRunRegistry.allocateFixture` computes from
values that were *not* under the evidence author's control at the time of
the real run: `ledgerIdentity` (`sha256` of the exact canonical
`workflow.jsonl` bytes at allocation time) and the fixture's
`handoffIdentity`/`allocationAuthority.basisIdentity` (`sha256` of
`JSON.stringify({transition, evidence})` for the *specific*
`implementation-handoff` event object `canonicalEvents` constructs — a
narrower, undocumented shape that drops the event's `at` timestamp and
reorders fields, not a plain hash of the raw ledger line). Both identities
were recomputed independently, from scratch, using only the actually
committed repository history (no reliance on the evidence file's own
prose):

- Extracted the actual `workflow.jsonl` content as it existed at the
  historical commit `0baf1fa` (the real "hand off Spike 013a implementation
  8" commit, i.e. the ledger state at the moment the fixture allocation
  would have run, before the later `verification-allocated` line was
  appended) via `git show 0baf1fa:.../workflow.jsonl`, and computed its
  `sha256`. Result: `a5d857af8dfcf44293c6f3daa42aa7c5effefc9523051756dd78ff73ac5be25c` —
  an **exact match** to the evidence's declared `ledgerIdentity`.
- Reimplemented `canonicalEvents`'s exact `{transition, evidence}` object
  construction (read directly from `src/workflow-run.ts`, not guessed) over
  that same ledger content, located the latest `implementation-handoff`
  event (`{"transition":"implementation-handoff","evidence":{"commit":
  "bb541265d994aad1f1af30446bf0a19ad59e1537","attempt":8}}`), and computed
  its `sha256`. Result:
  `20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed` — an
  **exact match** to the evidence's declared `handoffIdentity` and
  `allocationAuthority.basisIdentity`, everywhere they appear in the record.
- Fetched `fixtures/lp1.json` at the exact candidate commit
  (`git show bb54126:.../fixtures/lp1.json`) and computed its `sha256`:
  `d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4` — an
  **exact match** to the evidence's declared `definitionIdentity` /
  `fixture.definitionIdentity`, and identical to the working-tree copy
  (the file has not changed since).
- Computed the `sha256` of the committed evidence markdown file itself:
  `b2534cb812846af15953661778d2ed3d12d09da4f3cea2e3e4397b58099a96ae` —
  matches the identity independently recorded in the public manifest.md
  entry for Run 022, written by a different (implementation) role at a
  different time.

Producing all four of these exact matches by hand-fabrication would require
correctly guessing a specific, undocumented, source-code-defined
transformation (dropping the `at` field, particular key order) applied to
the *exact* historical ledger bytes at a *specific* prior commit not
otherwise called out anywhere in the evidence file's own prose — this is far
more consistent with the record being mechanically produced by the real
`allocateFixture` code running against the real, currently-committed
repository history than with hand construction. This evaluator treats it as
independently established, not merely accepted on the strength of the
document's own claims.

**Structural predicate check.** Applying the candidate's own
`isSuccessfulWorkflowFixtureEvidence(record, {workflow:
"013a-Workflow-execution-friction", fixture: "lp1", candidateCommit:
"bb541265d994aad1f1af30446bf0a19ad59e1537"})` predicate (read directly from
source, evaluated by hand against the evidence record's fields, not
executed as code) to the embedded run record: `status === "completed"`
&#x2713;; `roleDisposition === "succeeded"` &#x2713;; `workflow`/`phase ===
"fixture:lp1"`/`fixture.name === "lp1"`/`fixture.candidateCommit` all match
&#x2713;; `fixture.definitionIdentity === allocationAuthority.definitionIdentity`
&#x2713;; `fixture.handoffIdentity === allocationAuthority.basisIdentity`
&#x2713;; `allocationAuthority.type === "canonical-workflow-fixture"`
&#x2713;; `allocationAuthority.contractIdentity === record.contractIdentity`
(both `sha256:5dea02ee...060a802`, the pinned evaluator v11 identity)
&#x2713;. The record is well-formed per the candidate's own validator.

**Timeline / provenance consistency.** `implementation-handoff` for attempt 8
was recorded at `2026-09-15T10:21:57.059Z`; the fixture run's
`createdAt`/`startedAt` (`10:22:50Z`) fall after it and before the docs
commit preserving the evidence (`06ed2b9`, `12:26:32+02:00 = 10:26:32Z`);
the run's own `terminalAt` (`10:24:42.841Z`) falls between those two, and
its `accounting.elapsedMs` (`112487`) is exactly consistent with
`startedAt`/`terminalAt`. No canonical `verification-allocated` entry exists
in `workflow.jsonl` for a "fixture:lp1" phase (confirmed: the only entries
between the `implementation-handoff` and the real canonical
`verification-allocated` for this attempt are absent — the fixture is not,
and does not claim to be, a formal verification allocation), consistent
with "No formal evaluator run was allocated" in the evidence file's own
header and with the fixture requirement that it stay "distinct from the
parent Spike 013a verification run" (`lp1-fixture.md`).

**Mechanism review (source, not evidence prose).** Read
`git diff 2bce703..bb54126 -- src/workflow-run.ts src/index.ts
test/workflow-run.integration.test.ts` in full. Confirmed directly from the
diff, not from any implementation claim: the new endpoint accepts only
`workflow`/`fixture`/`candidateCommit`/`parentRunId` (`parseWorkflowFixture
Request` rejects any other key); the fixture definition is loaded via `git
show <candidateCommit>:...` (immune to working-tree tampering after the
fact); the protected role is hard-restricted to `evaluator-verify`
(`definition.role !== "evaluator-verify"` throws); the resolved contract is
cross-checked against `resolvePinnedVerificationAuthority` (the same pinned
v11 bootstrap authority PR7 re-confirms); the allocated run's
`permissionProfile` is fixed to `capabilities: ["repository-read"]` and
`workspaces: [workspace]` (the real repository root only, no broader host
access) with no caller override possible; `fixtures/lp1.json` is itself new
candidate content in this same commit (`git log` on the file shows a single
commit, `bb54126`, "new file mode 100644" — not something invented after
the fact by the evaluator or shaped to the evidence's outcome). The new
focused regression test (`test/workflow-run.integration.test.ts`,
"repository fixtures resolve from candidate bytes without caller-shaped
execution") independently exercises this same mechanism end-to-end
(synthetic fixture, real host, real `isSuccessfulWorkflowFixtureEvidence`
call) and is included in the 74/74 fresh `npm test` pass below.

**Semantic content review.** The evidence's "Complete provider log" section
shows delegated Claude receiving the pinned v11 contract as genuine
system-level context (`claude-system-contract` delivery, matching the
mechanism implemented and regression-tested since the "Correction after
verification 003" candidate attempt: replacement `--system-prompt` content,
not a prompt-injected header), performing the assigned bounded read-only
inspection task, and explicitly declining only the specific mutating
verify-mode actions that fall outside the fixture's declared
`permittedSideEffects: "none"` boundary — not declining the delegated role
itself, and at no point stating a human must type `/evaluator ...`. This is
exactly the affirmative behavior LP1's frozen procedure requires ("Claude is
delegated the role and performs it without independently deciding it needs
a human-typed `/evaluator` command"), and is consistent in kind with every
other real successful protected-Claude execution already established across
this cycle (private attempt 005's outer execution;
`verification-attempt-006-lp1-adjudication.md`'s own finding that a
*distinct, disposable, repository-owned fixture* — not the verification
session itself — is what the frozen Design Map actually requires; and Run
019's real LP1 child `9cc0a9a8...`). This run satisfies that distinct-fixture
requirement directly: it was allocated by "the ordinary outer Harness
daemon," with "No formal evaluator run was allocated," i.e. it is not this
or any verification session's own compliance being substituted for the
fixture, resolving exactly the concern `verification-attempt-006-lp1-
adjudication.md` raised.

**Side-effect / cleanup confirmation.** `spikes/011-host-owned-workflow-runs/
workflow.jsonl` re-diffed fresh this attempt: identical to every prior
attempt's observation, the single pre-existing `correction-cycle-opened`
line dated `2026-09-11T19:18:29.452Z` (predating all of Spike 013a), no new
line. Spike 013a's own `workflow.jsonl` carries no fixture-related entry
(the fixture lives in a separate, non-canonical `fixture:lp1` run slot, not
in canonical authority). `git status --porcelain` shows nothing else.

**Conclusion.** The preserved evidence is admissible (independently,
structurally corroborated against primary repository state the evidence
author did not control, not merely accepted on its own prose) and
sufficient (it affirmatively satisfies LP1's frozen fixture prerequisites,
procedure, and decision rule for this exact candidate commit). Rerunning
LP1 from this evaluator's own environment was not required and was not
attempted, consistent with the allocating instructions and with this
evaluator's own environment's unchanged, independently-reconfirmed inability
to spawn a real `claude` process.

## Regression Results

- `npm test`: 74/74 pass, run fresh this attempt against commit `bb54126`,
  in this session's actual ambient environment (`HARNESS_EVALUATOR_HIDDEN_
  WORKSPACE` and `HARNESS_CLAUDE_EXECUTABLE` both confirmed unset before the
  run, so Finding 2 does not manifest and was not specifically re-probed
  this attempt — it remains a known, non-criterion-flipping, unfixed
  regression carried forward from attempts 006-007, confirmed still present
  by source inspection of the unchanged `resolvePermissionProfile`/
  `workflowProviderProgram` functions).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check`: "All matched files use Prettier code style!" for
  every Git-tracked file; the pre-existing, permission-masked, untracked
  `.mcp.json` sandbox artifact is unreadable to Prettier and excluded, as in
  every prior attempt (identical benign failure mode, not a repository
  formatting defect).
- `git diff --check`: exit 0 (no output).
- E1-E5 (`.hidden-test/*.test.ts`): 5/5 pass, run fresh this attempt (see
  above).

## Diagnostic Probes

- Probe: independent recomputation of `ledgerIdentity`, `handoffIdentity`/
  `basisIdentity`, and `definitionIdentity` from the actual committed Git
  history (not from the evidence file's own prose), as detailed in "LP1
  corroboration" above. This is the decisive, non-authoritative-but-
  load-bearing corroboration for the LP1 `PASS` classification; it did not
  itself execute any candidate code, spawn any process, or mutate any
  repository state (read-only `git show`/hashing only).
- Probe: manual, by-hand application of the candidate's own
  `isSuccessfulWorkflowFixtureEvidence` predicate logic (read from source)
  against the evidence record's fields, to confirm the record is
  self-consistent per the candidate's own validator, not merely
  plausible-looking prose.
- Probe: `env | grep -E 'HARNESS_EVALUATOR_HIDDEN_WORKSPACE|HARNESS_CLAUDE_
  EXECUTABLE'` before any check, confirming this session's actual ambient
  environment does not set either variable this attempt (so Finding 2, a
  carried-forward non-criterion-flipping regression, does not need separate
  re-probing to explain the regression suite's result this attempt).
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what the underlying evidence already established; they isolated and
  independently corroborated the basis for the LP1 finding above.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered. Evaluator revision
  remains `002`, unchanged since attempt 002.
- No specification drift was detected in any frozen input this attempt.
- Before classifying LP1 `PASS`: the preserved evidence was independently
  corroborated against primary, evidence-author-independent sources (the
  actual committed Git history at the historical commit that predates the
  evidence's own authorship), not accepted on its own prose, consistent with
  this evaluator's own established practice for external live-provider
  evidence in this same cycle (private attempt 003). Evaluator,
  specification, and infrastructure causes were each considered for why LP1
  had previously blocked/failed and found not to apply to this new,
  corroborated result: the mechanism defect attempt 006 found is
  structurally absent from this commit's replacement mechanism (confirmed by
  direct source reading, not by trusting the candidate's own characterization
  alone); the executor-unavailability block attempts 002/004/005/007 hit is
  a property of *this evaluator's own execution environment*, not of the
  candidate, and the corroborated evidence was gathered by a different,
  capable environment for the exact same candidate bytes, which the frozen
  contract does not require to be this specific evaluator session.

## Overall Assessment

This candidate satisfies the frozen Spike 013a evaluation contract. All 35
mandatory criteria are `SATISFIED`: 32 were already established and remain
unaffected by this attempt's sole implementation commit (re-confirmed fresh
this attempt via the full regression suite and hidden-test re-run); the
remaining 3 (`AC08`, `AC09`, `AC34`), blocked at every prior attempt solely
by this evaluator's own execution environment's inability to reach a real
Claude executor, are now `PASS` on independently, structurally corroborated
standalone live-Claude fixture evidence for this exact candidate commit,
gathered through the candidate's own newly-generalized, candidate-committed,
non-evaluator-invented fixture mechanism.

## Terminal disposition

**PASS.** 35 of 35 criteria `SATISFIED`. Proceeding to the evaluator-owned
promotion procedure.

## Public Feedback

No public implementation-feedback artifact is required (`PASS`, not a
confirmed implementation failure). The public canonical `workflow.jsonl`
`verification-finalized` entry and the evaluator-owned promotion under
`evaluation/**` (see `promotion.json`) constitute the public record of this
result.
