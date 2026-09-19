# Evaluation Result — Spike 013a, attempt 007

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `007` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `9`
  (`implementationAttempt: 7`), allocated `2026-09-15T01:11:37.981Z`
  (`workflow.jsonl`, commit `df2dbd459c23361dddc22b6f90e811c3399d866a`,
  "chore: allocate Spike 013a verification 9").
- Project commit evaluated: `2bce70339cc99cb2b7ccffe5623ae20627c65fc3`
  ("fix: canonicalize workflow run identity"), branch `feat/spike-013a`. This
  is the sole implementation commit since the last evaluated commit
  (`5ff1a1b`, private attempt 006, `FAIL`/`IMPLEMENTATION_FAILURE`).
  Confirmed `HEAD` (`df2dbd4`) differs from this commit by exactly two
  intervening commits, both non-implementation: `112751f` ("chore: hand off
  Spike 013a implementation 7") and `df2dbd4` ("chore: allocate Spike 013a
  verification 9") — `git log --oneline 2bce703..HEAD` and
  `git diff --stat 2bce703..HEAD` (touches only
  `spikes/013a-Workflow-execution-friction/workflow.jsonl`, 2 lines added, no
  implementation content).
- Working tree: one pre-existing, unrelated, uncommitted drift in
  `spikes/011-host-owned-workflow-runs/workflow.jsonl` (a single
  `correction-cycle-opened` line dated `2026-09-11T19:18:29.452Z`, predating
  every Spike 013a implementation commit) — the same drift every prior
  attempt (002-006) independently observed and excluded; plus an untracked,
  permission-masked `.mcp.json` sandbox artifact unrelated to any repository
  content. No other uncommitted change exists. No implementation content is
  uncommitted.
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
- Evaluator revision: `002` (unchanged from attempts 002-006), canonical
  revision identity `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`,
  evaluator skill v11, `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
- No specification drift detected in any frozen input. No evaluator
  correction was needed or performed this attempt.
- Evaluation timestamp: 2026-09-15 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `007`).

## What changed since the last evaluated commit (`5ff1a1b` -> `2bce703`)

One implementation commit, `2bce703` ("fix: canonicalize workflow run
identity"), directly responding to attempt 006's Finding 1:

1. `resolveWorkflowLocation` (`src/workflow-run.ts`) now returns the
   canonical spike-directory name (the `WorkflowLocation` type gained a
   `workflow` field) in addition to the resolved filesystem path.
2. `resolveSpec` now stores that canonical name into the resolved run's
   `slot.workflow` (`slot: { ...request.slot, workflow: workflow.workflow }`)
   rather than the caller-supplied, potentially-aliased value verbatim.
   Both the exact full directory name and the bare numeric-prefix shorthand
   (`"013a"`) now resolve, via the existing prefix-match branch already in
   `resolveWorkflowLocation`, to the one identical canonical slot value.
3. `allocateSpike013aLp1Fixture`'s guard now checks
   `spec.slot.workflow !== "013a-Workflow-execution-friction"` (the exact
   string `tools/workflow.ts`'s real `spikeName()` always produces for this
   spike) instead of the bare `"013a"` no real dispatcher call could ever
   produce.
4. `test/workflow-run.integration.test.ts`'s LP1 regression and its
   pre-existing generic run-record test were updated to construct their
   parent with the real canonical identifier and to assert the canonical
   `workflow` field on the run record, plus a new assertion that the `013a`
   shorthand allocates against the same run (`200`/`duplicate`) with an
   identical `allocationAuthority`.

No other source file changed. `implementation-report.md` and `manifest.md`
gained a correction section/run entry describing the same fix and reporting
(as implementation-side, not evaluator-side) evidence of one further live LP1
exercise.

## Summary

- Mandatory executable cases (E1-E5): 5 passed, 0 failed (re-run fresh this
  attempt against commit `2bce703`).
- Mandatory non-executable cases: 14 of 17 `SATISFIED` (PR1-PR7, LP2, LP3,
  HB1, COMP1-part-a, unaffected by this diff and re-confirmed by reference to
  their unchanged frozen evidence plus this attempt's fresh regression run);
  `LP1` is `BLOCKED` (changed from `NOT_SATISFIED`/`FAIL` at attempt 006);
  `COMP1`'s `AC34` half remains `BLOCKED` (derivative of `LP1`, unchanged
  disposition from attempt 006, though for the same underlying LP1 property).
- Criteria: 32 of 35 `SATISFIED` (AC01-07, AC10-33, AC35); 3 `BLOCKED` (AC08,
  AC09, AC34).
- Non-mandatory findings: 1 (Finding 2, the same confirmed regression attempt
  006 found, unfixed by this commit; still does not flip any criterion).
- Evaluator defects: none discovered this attempt.
- Specification ambiguities: none.
- Infrastructure failures: 1 — the required live Claude executor remains
  unreachable from this evaluation environment, now confirmed at the
  process-spawn layer specifically (not the allocation-logic layer attempt
  006 diagnosed and this commit fixed).

## Findings

### Finding 1 (carried forward, now resolved at the allocation-logic layer) — LP1's canonicalization fix confirmed by direct, real-backend exercise (AC08, AC09, AC34)

**Requirement:** see attempt 006's Finding 1 (`case-manifest.json` LP1; R8,
R9, AC08, AC09) — a bounded, repository-owned, canonically-permitted
protected-evaluator-role allocation must be dispatchable through the Harness
host to the real Claude adapter, reaching a host-validated successful
evaluator-role disposition with no manual `/evaluator ...` invocation.

**What this attempt did differently from attempt 006:** attempt 006's probe
used an in-process host with **fake** session/workflow backends, which can
only exercise the allocation-logic layer (accept/reject a request shape) and
can never attempt a real process spawn — it could show the old `400`
rejection and, with a control request, isolate the cause, but it could not
have shown a real spawn succeeding or failing even after any fix. This
attempt instead started a genuine `startHarnessHost(0, {})` with **no**
backend override — the real, production `createLocalWorkflowBackend`, the
same real-spawn code path `node src/index.ts` uses — and issued
`POST /workflow-runs` with the exact field values/shape `tools/workflow.ts`'s
real `allocateHostRun()` produces for a genuine Spike 013a `evaluator-verify`
allocation (`slot.workflow: "013a-Workflow-execution-friction"`, the real
pinned bootstrap skill path/version, `permissionProfile: "evaluator"`, no
client-supplied `verificationAuthority` — letting the host derive and
cross-check canonical authority itself, exactly as a real CLI dispatch
does), then `POST /workflow-fixtures/lp1` against the resulting run.

**Observed:**

```
PARENT_ALLOCATE 201 { ..., "workflow":"013a-Workflow-execution-friction",
  "allocationAuthority":{"type":"canonical-workflow", ...}, "status":"running", ... }
PARENT_GET       200 { ..., "status":"failed",
  "terminalDisposition":"failed",
  "terminalReason":"spawn /home/velveteen/.local/bin/claude ENOENT", ... }
LP1_ALLOCATE     400 {"error":"LP1 requires an active canonical Spike 013a
  Claude evaluator-verify allocation bound to evaluator v11"}
```

The parent allocation **succeeded** (`201`) for the genuine, canonical,
real-dispatcher-shaped full identifier — directly, empirically confirming
attempt 006's Finding 1 is fixed: the allocation-logic layer no longer
rejects a real Spike 013a evaluator-verify allocation. This is stronger,
more direct evidence than a fake-backend probe could ever provide, because
it is the same code path (`resolveWorkflowLocation` -> `resolveSpec` ->
real-backend `#createExecution`) a genuine dispatch actually uses end to
end, up to and including a real process-spawn attempt.

The real backend then attempted to spawn the configured executor
(`process.env.HARNESS_CLAUDE_EXECUTABLE`,
`/home/velveteen/.local/bin/claude` in this session) and failed within 1ms:
`spawn /home/velveteen/.local/bin/claude ENOENT`. The run's status
immediately became `"failed"` (a real, correctly-reported terminal
disposition — not a hang, not a silent success). The subsequent
`POST /workflow-fixtures/lp1` against that now-terminal run correctly
returned `400`, for a **different and correct** reason than attempt 006's
Finding 1: `isActiveWorkflowRunStatus(parent.status)` is false for a
`"failed"` run. This is exactly the behavior the frozen `LP1` fixture
requires ("Fixture prerequisites... must be fixed by the implementation
before this case can be exercised at verify time") — the mediation logic
correctly refuses to construct a bounded fixture against a parent that never
became a genuine active evaluator-verify allocation, rather than silently
proceeding.

Independently, and without going through any Harness code at all, this
evaluator confirmed the underlying cause is specific to this evaluation
session's own environment, not to the candidate: a bare `spawnSync` of
`process.env.HARNESS_CLAUDE_EXECUTABLE` (`/home/velveteen/.local/bin/claude`)
from this exact Bash tool session fails with the identical `ENOENT`; `ss
-tln` shows no Harness host already listening on any port in this session
(only the network-egress-proxy ports `1080`/`3128`); and `ps aux` shows this
Bash tool runs in an isolated process namespace containing only this tool's
own shell — i.e. there is no already-live, real, host-owned parent run
reachable from inside this evaluation session either, and no way to reach a
real `claude` binary from here regardless of how the fixture is invoked.

**Classification:** `INFRASTRUCTURE_FAILURE`, not `IMPLEMENTATION_FAILURE`
and not `SATISFIED`. Per `case-manifest.json`'s `LP1` decision rule
("Required-executor unavailability (auth/service/config) is BLOCKED, not
FAIL") and `spike.md` "Provider unavailability"/Design Map invariant I5: this
is squarely a configuration limitation of this evaluation environment (the
configured executor path is unreachable from this session's filesystem
sandbox), of exactly the kind those clauses anticipate, and is the same
general category of limitation that blocked private attempts 002, 004, and
005 (`spawn claude ENOENT`) before this commit's allocation-logic fix even
mattered. It is not license to substitute a mock or to treat the real-backend
`201` allocation result as itself sufficient: LP1 additionally requires
reaching "a host-validated successful evaluator-role disposition," which
requires the real Claude adapter to actually run, and that remains
unreachable from this session.

**Result:** `AC08`, `AC09` change from attempt 006's `NOT_SATISFIED` back to
`BLOCKED`. `AC34` (`COMP1`, part b) remains `BLOCKED`, unchanged in
disposition from attempt 006 but now for the underlying reason above rather
than the fixed allocation-logic defect: `case-manifest.json`'s `COMP1`
decision rule ties `AC34`'s readiness demonstration specifically to "LP1's
exercise of the original refusal condition (R9)," which still cannot occur
while the required executor is unreachable. `AC33` (`COMP1`, part a) is
unaffected and remains independently `SATISFIED` (live Codex evidence from
earlier attempts, unaffected by this commit or by this attempt's probe).

## Non-mandatory finding

### Finding 2 (carried forward, unfixed) — unconditional host-only environment-variable consumption still breaks unrelated visible-suite tests under this evaluator's real ambient environment

Re-run fresh this attempt, identical to attempt 006's own finding: this
evaluator session's real ambient environment (`HARNESS_EVALUATOR_HIDDEN_
WORKSPACE=/home/velveteen/vk-code/harness-hidden`,
`HARNESS_CLAUDE_EXECUTABLE=/home/velveteen/.local/bin/claude`, both genuinely
present, exactly the kind of environment a real deployed evaluator session
has) still causes `npm test` to fail the identical 3 of 74 pre-existing
tests it failed at attempt 006 (`34` "canonical evaluator delegation is
derived from the requesting workflow", `46` "permission profiles are
bounded, named, and recorded on the run", `48` "Claude evaluator execution
gets run-scoped scratch that is removed at exit"), and to pass all 74 with
both variables explicitly unset. `resolvePermissionProfile`
(`src/workflow-run.ts`) and `workflowProviderProgram`
(`src/workflow-backend.ts`) are unchanged by commit `2bce703` and still read
their respective environment variables unconditionally for every allocation/
backend construction, regardless of which spike or workflow the allocation
is for. This commit did not address this finding (it was not required to:
attempt 006 explicitly noted it does not itself flip any criterion's
`SATISFIED` status, and that remains true this attempt for the same reason —
none of the three failing tests is the coverage-matrix-cited evidence
mechanism for any of the 35 frozen criteria; the frozen evidence for the
areas they loosely corroborate remains intact via its own cited mechanism,
independently re-run and passing this attempt). It is reported again because
it is a real, reproducible, still-uncorrected regression, sharing the same
root defect class as (the now-fixed) Finding 1: host-only configuration
values read unconditionally rather than scoped to the specific canonical
allocation they were introduced for.

## Regression Results

- `npm test`: with both `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` and
  `HARNESS_CLAUDE_EXECUTABLE` unset, 74/74 pass. Under this evaluator's real
  ambient environment (both variables set), 71/74 pass, 3 fail (Finding 2,
  unchanged from attempt 006). Both runs performed fresh this attempt against
  commit `2bce703`.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check`: exit 0 (all Git-tracked files; the pre-existing,
  permission-masked, untracked `.mcp.json` sandbox artifact is unreadable to
  Prettier and excluded, as in every prior attempt).
- `git diff --check`: exit 0.
- E1-E5 (`.hidden-test/*.test.ts`): 5/5 pass, run fresh this attempt under
  this evaluator's real ambient environment (none of E1-E5 references either
  environment variable, so ambient exposure does not change their pass/fail
  result or reason).

## Diagnostic Probes

- Probe: a genuine, real-backend `startHarnessHost(0, {})` (no fake
  override), allocating a parent with the exact real-dispatcher field
  values/shape for a genuine Spike 013a `evaluator-verify` Claude
  allocation, then `POST /workflow-fixtures/lp1` against it. This is the
  basis for Finding 1 above: it directly and empirically confirms the
  allocation-logic fix (parent allocation `201`) and directly reproduces the
  real executor-unavailability limitation (`spawn ... ENOENT`,
  `terminalDisposition: "failed"`, then a correctly-reasoned `400` from the
  LP1 endpoint). It used only already-frozen, already-authoritative
  `case-manifest.json` decision rules and the candidate's own already-built,
  already-publicly-tested mechanism (`POST /workflow-runs`,
  `POST /workflow-fixtures/lp1`); it invented no new mandatory architecture,
  seam, or interpretation. The probe script was disposable (written under
  `$TMPDIR`, never committed) and was deleted after use; it touched no
  repository file (confirmed via `git status --porcelain` before and after:
  identical, only the same pre-existing unrelated drift); no scratch or
  evaluator-workspace directory was left behind under `$TMPDIR` (the failed
  run's backend cleaned up before any scratch directory needed to persist).
- Probe: a bare `spawnSync(process.env.HARNESS_CLAUDE_EXECUTABLE, ...)`
  outside any Harness code, to confirm the executor-unavailability cause is
  intrinsic to this evaluation session's own sandboxed environment and not
  an artifact of the Harness allocation/backend code. Result: identical
  `ENOENT`. This rules out a Harness-side bug masquerading as executor
  unavailability.
- Probe: `ss -tln` and `ps aux` inside this Bash tool session, to confirm no
  already-live Harness host or already-live real Claude process is reachable
  from inside this evaluation session that could be used instead of
  constructing a fresh one. Result: only the network-egress-proxy ports are
  listening; this Bash tool's own process tree contains only its own shell.
- Probe: `npm test` run twice (ambient vs. both variables unset), to confirm
  Finding 2 is unchanged from attempt 006 for this commit. Result: identical
  71/74 vs. 74/74 split, identical 3 failing tests.
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what the underlying evidence already established; they isolated
  causes and ruled out alternative explanations.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered: the `LP1` fixture
  requirement and its `BLOCKED`-for-executor-unavailability decision rule
  are unchanged from revision `002` and continue to produce a sound,
  falsifiable result (they correctly distinguished a real candidate defect
  at attempt 006 from a genuine infrastructure limitation this attempt).
  Evaluator revision remains `002`, unchanged since attempt 002.
- No specification drift was detected in any frozen input this attempt.
- Before classifying this attempt's disposition: the allocation-logic fix
  was verified by a real-backend exercise, not by inspection or by trusting
  the candidate's own added unit test alone (that test was independently
  read and its parent-construction values were independently cross-checked
  against `tools/workflow.ts`'s real `spikeName()`/`targetFrom()` behavior).
  The remaining `BLOCKED` cause was verified in isolation from Harness code
  entirely (bare `spawnSync`), and alternative explanations (a live host or
  live Claude process already reachable from this session, which would have
  meant the block was this evaluator's own oversight rather than a genuine
  environment limitation) were explicitly ruled out (`ss`/`ps` probes).
  Evaluator, specification, and infrastructure causes were each considered;
  the evidence points unambiguously to a genuine, external
  executor-configuration limitation of this evaluation environment, not to
  any evaluator or specification defect, and not to a demonstrated
  implementation defect (the previously-demonstrated implementation defect
  is confirmed fixed).

## Overall Assessment

This candidate does not yet satisfy the frozen Spike 013a evaluation
contract, but not because of any currently-demonstrated implementation
defect: 32 of 35 mandatory criteria remain `SATISFIED`, re-confirmed fresh
this attempt against commit `2bce703`, and the specific, reproducible
allocation-logic defect attempt 006 found and classified as
`IMPLEMENTATION_FAILURE` (AC08, AC09, AC34) is confirmed fixed by direct,
real-backend exercise this attempt. What remains unresolved is a distinct,
genuine limitation of this evaluation environment: the configured Claude
executor is unreachable from within this session's own sandbox, which is
squarely the `BLOCKED`/`INFRASTRUCTURE_FAILURE` category the frozen contract
anticipates and requires, not a license to pass or fail the candidate on a
substitute basis. A second, non-criterion-flipping regression (Finding 2)
remains unfixed since attempt 006 and is reported again for completeness.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is required, run from a session or
environment where a real `claude` executor is reachable for the mediated LP1
fixture's real-backend spawn to actually complete, or supplied with fresh,
independently-verified external live-Claude fixture evidence for this exact
candidate commit. No evaluator correction is warranted or was performed.

## Public Feedback

A public-safe adjudication/status artifact is recorded separately
(`verification-feedback-007.md`), stating what was confirmed fixed, what
remains blocked and why, and the classification, without reproducing hidden
mechanics, hidden test names, or fixture contents beyond what is already
safely summarized above (all of Finding 1 and Finding 2's detail is
public-safe: it describes only the candidate's own committed source, the
candidate's own public test file, and this evaluator's own environment
observations, not any hidden case).
