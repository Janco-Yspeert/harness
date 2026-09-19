# Evaluation Result — Spike 013a, attempt 006

## Overall Result

FAIL.

## Evaluation Source

- Verification-attempt identifier: `006` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `8`
  (`implementationAttempt: 6`), allocated `2026-09-15T00:16:05.018Z`
  (`workflow.jsonl`, commit `c25f3059c4aa6468e5646595087287165afa6781`,
  "chore: allocate Spike 013a verification 8"). This is the first verification
  attempt against a genuinely new implementation commit since private attempt
  005 (canonical attempt 6, `BLOCKED`/`INFRASTRUCTURE_FAILURE`, against commit
  `3edb316`). Two intervening implementation-handoff/verification-allocated
  pairs exist in `workflow.jsonl` (canonical attempt 7, implementation attempt
  5, commit `3932b1340cb9ca974d3a4bf2c7185900691b39d2`) that were never
  finalized before a further implementation-handoff (attempt 6, commit
  `5ff1a1bfc22a7e44bda19cf155c39903d7bd7feb`) superseded them; this attempt
  evaluates only the current, latest allocation (canonical attempt 8,
  implementation attempt 6).
- Project commit evaluated: `5ff1a1bfc22a7e44bda19cf155c39903d7bd7feb`
  ("fix: bind evaluator hidden workspace explicitly"), branch
  `feat/spike-013a`. Confirmed `HEAD` (`c25f305`) differs from this commit by
  exactly one file, `spikes/013a-Workflow-execution-friction/workflow.jsonl`
  (`chore: allocate Spike 013a verification 8`, 2 lines added, no
  implementation content) — `git diff --stat 5ff1a1b..HEAD`.
- Working tree: one pre-existing, unrelated, uncommitted drift in
  `spikes/011-host-owned-workflow-runs/workflow.jsonl` (a single
  `correction-cycle-opened` line dated `2026-09-11T19:18:29.452Z`, i.e.
  predating every Spike 013a implementation commit) — the same drift every
  prior attempt (002-005) independently observed and excluded; plus an
  untracked, permission-masked `.mcp.json` sandbox artifact unrelated to any
  repository content. No other uncommitted change exists. No implementation
  content is uncommitted.
- Frozen `eval-spec.md` identity: `sha256:26979bd42ae5f5651624dfe1642f5966f92ed5b0b740a4c40b3cab54f62b5f1f`
  (revision `002`, re-hashed fresh this attempt — unchanged).
- `case-manifest.json` identity: `sha256:8e018f5b945a5121e3ffac96323c93761c7ed815a67b2ae7c0904230fbb2fba8`
  (re-hashed fresh — unchanged).
- Spike brief (`spike.md`) identity: `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  (re-hashed fresh — matches frozen).
- Design Map identity: `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
  (re-hashed fresh — matches frozen).
- Public `eval-requirements.md` identity: `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`
  (re-hashed fresh — matches frozen).
- Public `coverage-map.json` identity: `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`
  (re-hashed fresh — matches frozen).
- All five `.hidden-test/*.test.ts` files and `.hidden-test/manifest.json`
  re-hashed fresh this attempt; all byte-identical to their revision-002
  `freeze.json` identities (no drift).
- `bootstrap/evaluator-skill.md` (`sha256:5dea02ee...060a802`) and
  `bootstrap/evaluator-authority.json` re-hashed fresh; both unchanged.
- Evaluator revision: `002` (unchanged from attempts 002-005), canonical
  revision identity `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`,
  evaluator skill v11, `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- No specification drift detected in any frozen input. No evaluator
  correction was needed or performed this attempt.
- Evaluation timestamp: 2026-09-15 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `006`).

## What changed since the last evaluated commit (`3edb316` -> `5ff1a1b`)

Four implementation commits (`cfa33cf`, `b655c00`, `3932b13`, `5ff1a1b`;
`3932b13` is candidate attempt 5, the other three are candidate attempt 6 per
`implementation-report.md`'s own "LP1 host-mediated fixture correction
(candidate attempt 5)" / "bind evaluator hidden workspace explicitly"
sections):

1. A new fixed host endpoint, `POST /workflow-fixtures/lp1`
   (`allocateSpike013aLp1Fixture` in `src/workflow-run.ts`), intended to let
   the evaluator obtain the required LP1 live-Claude fixture without itself
   spawning a `claude` process (the `spawn claude ENOENT` limitation every
   prior attempt hit).
2. A host-only `HARNESS_CLAUDE_EXECUTABLE` override
   (`workflowProviderProgram` in `src/workflow-backend.ts`) so the daemon can
   launch Claude from a configured path when it is outside the daemon's PATH.
3. An authority-status fix (`tools/workflow.ts`) distinguishing structural
   unavailability from missing-evidence for `correction-cycle-opened` and
   every other evidence-bearing transition (this is `.hidden-test/authority-
   status-evidence-aware-transitions.test.ts`'s E5 subject; re-run and
   confirmed passing, see Regression Results).
4. An automatic binding of a host-configured `HARNESS_EVALUATOR_HIDDEN_WORKSPACE`
   environment variable into every `evaluator` permission profile's
   `workspaces` list (`resolvePermissionProfile` in `src/workflow-run.ts`).

This attempt investigated whether (1) finally allows a genuine LP1 fixture
exercise (which would resolve the `INFRASTRUCTURE_FAILURE` block private
attempts 002-005 recorded), since this evaluator's own real dispatch
environment, unlike prior attempts, has both `HARNESS_CLAUDE_EXECUTABLE` and
`HARNESS_EVALUATOR_HIDDEN_WORKSPACE` set (see below). It does not: (1) and (4)
are each independently defective, and (1)'s defect is a pure allocation-logic
bug, not executor unavailability, so LP1 changes classification from
`BLOCKED`/`INFRASTRUCTURE_FAILURE` to `FAIL`/`IMPLEMENTATION_FAILURE` this
attempt.

## Summary

- Mandatory executable cases (E1-E5): 5 passed, 0 failed (re-run fresh this
  attempt against commit `5ff1a1b`, clean of the two candidate-introduced
  environment variables that are otherwise present in this evaluator's own
  ambient session — see Finding 2 for why that isolation was necessary; the
  isolation affects neither E1-E5's pass/fail nor their reasons).
- Mandatory non-executable cases: 14 of 17 `SATISFIED` (PR1-PR7, LP2, LP3,
  HB1, COMP1-part-a unaffected and re-confirmed by reference to their
  unchanged frozen evidence); `LP1` is now `NOT_SATISFIED` (changed from
  `BLOCKED`); `COMP1`'s AC34 half is `NOT_SATISFIED` (changed from `BLOCKED`,
  derivative of `LP1`).
- Criteria: 32 of 35 `SATISFIED` (AC01-07, AC10-33, AC35); 3 `NOT_SATISFIED`
  (AC08, AC09, AC34).
- Non-mandatory findings: 1 (Finding 2, an additional confirmed regression
  from the same commit, not itself tied to a single numbered AC).
- Evaluator defects: none discovered this attempt.
- Specification ambiguities: none.
- Infrastructure failures: none this attempt (the prior `INFRASTRUCTURE_
  FAILURE` classification for LP1 no longer applies: the newly demonstrated
  defect is a code-level logic bug reachable and reproducible with zero live
  provider access, not executor unavailability).

## Confirmed implementation failures

### Finding 1 — LP1's host-mediated fixture endpoint rejects every genuine canonical Spike 013a evaluator-verify parent (AC08, AC09, AC34)

**Requirement (`case-manifest.json` LP1; R8, R9, AC08, AC09):** a bounded,
repository-owned, canonically-permitted protected-evaluator-role allocation
must be dispatchable through the Harness host to the real Claude adapter,
using only the fixture's declared workspace/access and side effects, reaching
a host-validated successful evaluator-role disposition with no manual
`/evaluator ...` invocation. `case-manifest.json`'s decision rule: "the host
recording process completion without a validated successful role result[] is
a FAIL for AC08/AC09. Required-executor unavailability (auth/service/config)
is BLOCKED, not FAIL."

**Observed:** `allocateSpike013aLp1Fixture` (`src/workflow-run.ts`) requires
its parent run's `spec.slot.workflow` to equal the literal string `"013a"`
exactly:

```
spec.slot.workflow !== "013a" ||
spec.slot.phase !== "evaluator-verify" ||
spec.role !== "evaluator-verify" ||
...
```

`resolveSpec` stores `slot: request.slot` verbatim (no canonicalization), so
this check is exact-string, not the directory-prefix match
`resolveWorkflowLocation` itself uses to find the spike directory. The
repository's own, single, committed canonical dispatcher,
`tools/workflow.ts`, can never produce that value: `targetFrom()` requires
every spike argument to match `^spikes/\d{3}[a-z]*-[^/]+$` (i.e. the full
suffixed directory name, e.g. `spikes/013a-Workflow-execution-friction`), and
`spikeName()` (used for `slot.workflow` in `allocateHostRun`) returns
`spike.split("/")[1]`, i.e. `"013a-Workflow-execution-friction"` — never the
bare `"013a"` the fixture check requires. This was verified directly, not by
inspection alone: a diagnostic probe (see Diagnostic Probes) started a real
in-process `startHarnessHost` (fake session/workflow backends, so no process
is spawned — this isolates the allocation-logic layer the bug lives in from
the separate, already-established `spawn claude ENOENT` executor-availability
layer) and allocated a parent run using the exact `requestBody` shape and
field values `tools/workflow.ts`'s `allocateHostRun()` produces for
`phase="evaluator-verify"`, `spike="spikes/013a-Workflow-execution-friction"`
(the real pinned `bootstrap/evaluator-authority.json` content, the real
`promptFor()` text, `spikeName()`'s real output for `slot.workflow`). That
parent allocated successfully (`201`) with `allocationAuthority.type:
"canonical-workflow"` and `contractDeliveryMode: "claude-system-contract"` —
i.e. it is a genuine, valid, canonically-authorized Spike 013a Claude
`evaluator-verify` allocation in every respect the fixture endpoint itself
checks except `slot.workflow`'s exact string. `POST /workflow-fixtures/lp1`
against that parent's `runId` was rejected: `400`, `"LP1 requires an active
canonical Spike 013a Claude evaluator-verify allocation bound to evaluator
v11"`. A control request, identical except `slot.workflow` forced to the
literal short `"013a"` (the value the candidate's own added integration test
uses, but which no real dispatcher call can produce), succeeded (`201`) on
the same running host instance, isolating `slot.workflow`'s exact string as
the sole cause.

This is not executor unavailability (the narrow `case-manifest.json` `BLOCKED`
carve-out): the rejection happens entirely inside Harness's own allocation
logic, before any provider process would be considered, and is fully
reproducible with zero live Claude access. It means the LP1 fixture mechanism
this candidate built specifically to resolve prior attempts' infrastructure
block cannot be invoked by any allocation the repository's own canonical
dispatch tooling can ever produce; it can only be invoked by a request shaped
exactly like the candidate's own new unit test, which is not a genuine
verification allocation. The candidate's own added regression test
(`test/workflow-run.integration.test.ts`, "LP1 is a host-mediated fixed
Claude fixture...") passes only because it independently constructs its
parent with the same non-production short `slot.workflow: "013a"`, so it does
not catch this defect.

**Result:** `AC08`, `AC09` are `NOT_SATISFIED` (changed from `BLOCKED`: the
prior classification no longer applies once the specific, reproducible
allocation-logic cause is known). `AC34` (`COMP1`, part b) remains
`NOT_SATISFIED`/unestablished as a direct consequence: `case-manifest.json`'s
`COMP1` decision rule ties `AC34`'s readiness demonstration specifically to
"LP1's exercise of the original refusal condition (R9)", which cannot occur
while LP1 itself cannot be allocated against a genuine parent. `AC33`
(`COMP1`, part a) is unaffected and remains independently `SATISFIED` (live
Codex evidence from earlier attempts, unaffected by any commit in this diff).

## Non-mandatory finding

### Finding 2 — the same commit also breaks pre-existing visible regressions under this evaluator's real ambient environment

This evaluator session's own real environment (the sibling `harness-hidden`
access this compatibility contract requires, and this same environment's
ability to dispatch a live Claude fixture) sets both
`HARNESS_EVALUATOR_HIDDEN_WORKSPACE=/home/velveteen/vk-code/harness-hidden`
and `HARNESS_CLAUDE_EXECUTABLE=/home/velveteen/.local/share/claude/versions/
2.1.271` ambiently — i.e. exactly the two host-only configuration values this
candidate's own commits (3 and 4 in "What changed", above) are written to
consume, and exactly the kind of environment a genuine deployed evaluator
session has. Running the full mandatory visible suite (`npm test`) under
these real, present, unmodified ambient conditions:

- fails 3 of 74 pre-existing tests (`34` "canonical evaluator delegation is
  derived from the requesting workflow", `46` "permission profiles are
  bounded, named, and recorded on the run", `48` "Claude evaluator execution
  gets run-scoped scratch that is removed at exit") — none of which reference
  either environment variable or attempt to control for it;
- passes all 74 with both variables explicitly unset (confirmed both ways
  this attempt: `npm test` with ambient env = 71/74; with both variables
  unset = 74/74).

`resolvePermissionProfile` reads `process.env.HARNESS_EVALUATOR_HIDDEN_
WORKSPACE` unconditionally for *every* `evaluator`-profile allocation
(regardless of which spike/workflow the allocation is for), so whenever an
operator's daemon happens to have that variable set, every `evaluator`
permission profile across the whole system — not only Spike 013a's own
canonical allocations — silently gains an extra workspace entry, which is
exactly what breaks tests 34 and 46 (both use unrelated spikes/fixtures, e.g.
`workflow: "011"`, for their `evaluator`-profile assertions). Test 48 fails
for the parallel reason on the executor-program side:
`workflowProviderProgram` reads `process.env.HARNESS_CLAUDE_EXECUTABLE`
unconditionally for every `executor: "claude"` backend construction with no
per-call override, so the test's own fake `claude` PATH shim is silently
replaced by whatever real Claude binary the ambient environment happens to
configure, and the test's assumptions about that fake shim's behavior no
longer hold.

None of these three tests is the coverage-matrix-cited evidence for any of
the 35 frozen criteria (the frozen evidence for the areas they loosely
corroborate — AC16/AC17 via `E2`, AC12-AC15 via the process/lifecycle-
distinctness behavior PR4 actually describes — remains intact via its own
cited mechanism, independently re-run and passing this attempt), so this
finding does not itself flip any criterion's `SATISFIED` status. It is
reported because it is a real, reproducible, commit-attributable regression
discovered by running the mandatory visible suite under the real environment
this exact fix targets, and because it demonstrates the same underlying
defect class as Finding 1: this candidate's new host-only-configuration
values are read unconditionally, with no scoping to the specific canonical
Spike 013a / LP1 allocation they were introduced for.

## Regression Results

- `npm test`: with both `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` and
  `HARNESS_CLAUDE_EXECUTABLE` unset, 74/74 pass. Under this evaluator's real
  ambient environment (both variables set, as they are for this entire
  attempt), 71/74 pass, 3 fail (Finding 2). Both runs performed fresh this
  attempt against commit `5ff1a1b`.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check`: exit 0 (all Git-tracked files; the pre-existing,
  permission-masked, untracked `.mcp.json` sandbox artifact is unreadable to
  Prettier and excluded, as in every prior attempt).
- `git diff --check`: exit 0.
- E1-E5 (`.hidden-test/*.test.ts`): 5/5 pass, run fresh this attempt with
  both candidate-introduced environment variables unset (isolating the
  mandatory hidden suite from Finding 2's ambient-environment interaction;
  none of E1-E5 references either variable, and this exclusion changes
  neither their pass/fail result nor its reason).

## Diagnostic Probes

- Probe: an in-process `startHarnessHost` instance (fake session/workflow
  backends; no real process spawned) was used to allocate a parent run with
  the exact field values `tools/workflow.ts`'s real `allocateHostRun()`
  produces for a genuine Spike 013a `evaluator-verify` Claude allocation
  (real pinned bootstrap authority content, real `spikeName()`/`promptFor()`
  output), then `POST /workflow-fixtures/lp1` was issued against that
  parent's `runId`. Result: `400`,
  `"LP1 requires an active canonical Spike 013a Claude evaluator-verify
  allocation bound to evaluator v11"`. A control request differing only in
  `slot.workflow` (forced to the literal short `"013a"`) succeeded (`201`)
  against the same host instance. This probe is the basis for Finding 1; it
  used only already-frozen, already-authoritative case-manifest decision
  rules (host allocation logic reachable through the existing, real
  `/workflow-runs` and `/workflow-fixtures/lp1` endpoints) and invented no
  new mandatory architecture, seam, or interpretation — it exercises exactly
  the prerequisite the candidate itself wrote and the candidate's own added
  test exercises, with the sole substitution of a genuine-dispatcher-shaped
  parent for the test's own non-production-shaped one.
- Probe: `npm test` was run twice, once under this evaluator's unmodified
  ambient environment and once with `HARNESS_EVALUATOR_HIDDEN_WORKSPACE`/
  `HARNESS_CLAUDE_EXECUTABLE` explicitly unset, to isolate whether the 3
  observed failures were caused by those two variables specifically (rather
  than by some other change in this diff, or a flaky/pre-existing issue).
  Confirmed: both variables together fully account for the 3 failures (74/74
  clean; 71/74 ambient), and this is the basis for Finding 2.
- Neither probe changed a `PASS`/`FAIL`/`BLOCKED` determination away from
  what the underlying evidence already established; they isolated causes.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during this
  attempt. No evaluator defect was discovered: Finding 1 traces directly to
  `case-manifest.json` LP1's own frozen, pre-implementation decision rule
  (host allocation must succeed for a genuine canonical parent; failing that
  for a reason other than executor unavailability is FAIL, not BLOCKED) and
  to code the candidate itself wrote this attempt, not to any evaluator-
  invented seam, architecture, or interpretation. Evaluator revision remains
  `002`, unchanged since attempt 002.
- No specification drift was detected in any frozen input this attempt.
- Before classifying `IMPLEMENTATION_FAILURE`: Finding 1 was rerun in
  isolation (the isolated in-process probe above, run twice, both matching);
  helper/oracle integrity was confirmed by reading the exact rejection logic
  and the exact real-dispatcher field-construction logic side by side, not by
  inference; setup/teardown for the probe host was clean (own in-memory host
  instance per run, closed after). Evaluator and specification causes were
  ruled out: the LP1 decision rule (frozen, pre-implementation, unchanged) is
  itself sound and was not reinterpreted; the defect is squarely inside
  candidate code that did not exist before this implementation attempt.
  Infrastructure cause was ruled out: the probe used no live Claude/Codex
  process at all and still reproduces the failure deterministically.

## Overall Assessment

This candidate does not satisfy the frozen Spike 013a evaluation contract.
32 of 35 mandatory criteria remain `SATISFIED`, re-confirmed fresh this
attempt against commit `5ff1a1b`. The remaining three (`AC08`, `AC09`,
`AC34`) are `NOT_SATISFIED`: the new LP1 host-mediation mechanism this
candidate built to resolve prior attempts' `INFRASTRUCTURE_FAILURE` block is
itself defective in a way that is fully demonstrable without any live
provider access, so the correct classification changes from `BLOCKED` to
`FAIL`/`IMPLEMENTATION_FAILURE`. A second, non-criterion-flipping but
independently confirmed regression (Finding 2) was also discovered in the
same commits and should be corrected alongside Finding 1, since both share
the same root cause: reading host-only configuration unconditionally rather
than scoping it to the specific canonical Spike 013a / LP1 allocation it was
introduced for.

This verification attempt does not promote. A subsequent implementation
retry against this same frozen evaluation (revision `002`) is required; no
evaluator correction is warranted or was performed.

## Public Feedback

A public-safe implementation-feedback artifact is recorded separately
(`verification-feedback-006.md`), stating the violated requirement, expected
and observed behaviour, and classification, without reproducing hidden
mechanics, hidden test names, or fixture contents beyond what is already
safely summarized above (all of Finding 1 and Finding 2's detail is already
public-safe: it describes only the candidate's own committed source and
public test file, not any hidden case).
