# Evaluation Result — Spike 013a, attempt 011

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `011` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `13`
  (`implementationAttempt: 10`, `cycle: "002"`, `evaluatorRevision: "003"`),
  evidence dated `2026-09-16T21:07:43.119Z`. No prior `verification-finalized`
  record exists for this allocation.
- Canonical `implementation-handoff` (cycle `002`, attempt `10`) evidence
  commit: `eaaa53dc8ea487deff592f804154fd447bb26f86` ("fix: enforce
  host-owned evaluator permissions"), dated `2026-09-16T20:40:17.596Z`.
- Project `HEAD` actually evaluated: `eaaa53dc8ea487deff592f804154fd447bb26f86`
  — identical to the canonical `implementation-handoff` commit itself (no
  further commits on top). `git status --porcelain` confirms no
  implementation source content (`src/`, `tools/`, `test/`) is uncommitted.
- **Finding 0** (process observation, not a criterion failure): unlike every
  prior attempt, both this attempt's canonical `implementation-handoff`
  (attempt 10) and `verification-allocated` (attempt 13) ledger lines were
  present only as uncommitted working-tree additions to
  `spikes/013a-Workflow-execution-friction/workflow.jsonl` when this session
  began (never pre-committed by the dispatching runner). This mirrors
  attempt 009's own "Finding 0" (which found its `verification-allocated`
  line uncommitted) and that attempt's own resolution: the actual candidate
  source (`eaaa53d`) is fully, unambiguously committed, so this evaluator
  proceeded to evaluate that exact committed revision and commits both
  pending ledger lines together with this attempt's own
  `verification-finalized` record as part of this attempt's final commit
  (see "Final execution record" below). Neither line was altered, and this
  was never treated as an uncommitted implementation-code change.
- Working tree at evaluation time otherwise: the same pre-existing,
  unrelated, uncommitted drift in
  `spikes/011-host-owned-workflow-runs/workflow.jsonl` (a single
  `correction-cycle-opened` line dated `2026-09-11T19:18:29.452Z`, confirmed
  via `git diff` to be identical to the line every prior attempt (002-010)
  independently observed and excluded — predates every Spike 013a
  implementation commit, never committed to git history); plus an untracked,
  permission-masked `.mcp.json` sandbox artifact; an untracked
  `spikes/013a-Workflow-execution-friction/humam-acceptance.md` (public
  human-acceptance record for the closed cycle 001, unrelated to source
  content, already present before this session began); an untracked
  `skills/orchestrator/` directory (unrelated to this spike's source or
  evaluation, not inspected further); and two untracked, stale
  `spikes/998a-authority-fixture-*` directories left over from an earlier,
  apparently-interrupted `test/workflow.test.ts` run (their fixture-naming
  convention — `authority-fixture-<pid>[-handoff-adoption]` — matches that
  test file exactly; their mtimes predate this session's own test runs, and
  this session's own test/hidden-test runs left no new fixture artifacts
  under `spikes/`, confirmed via `git status --porcelain` before and after).
  None of these are implementation source content, and none were modified.
- Frozen `eval-spec.md` identity:
  `sha256:7d944725376a078e21b236124b92044a03ad703059cff88b8512f9f0ab6d0195`
  (revision `003`, re-hashed fresh this attempt — matches `.eval/freeze.json`).
- `case-manifest.json` identity:
  `sha256:c53b0c3de7562032676a98518e7b102487d6afd23e4af8b6ce01072cb3e3c0c3`
  (re-hashed fresh — matches).
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
  re-hashed fresh this attempt; all byte-identical to revision `003`'s
  `freeze.json` identities (no drift). `.eval/freeze.json` itself re-hashed:
  `sha256:b4c4aab5b162acc33eb5c5fe6665d87b5e7f04905f00aeb575864bcfe00f52ca`
  (evaluator revision `003` identity — unchanged).
- `bootstrap/evaluator-skill.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`)
  re-hashed fresh; confirmed byte-identical to working-tree
  `skills/evaluator/SKILL.md` — the pin this evaluator session itself
  executes under (this session was given the pinned snapshot path directly
  as its contract source, consistent with PR7/AC30/AC31).
- Evaluator revision: `003` (unchanged; no evaluator correction performed or
  needed this attempt).
- No specification drift detected in any frozen input (`spike.md`,
  `design-map.md`, `eval-requirements.md`, `coverage-map.json`, evaluator
  skill pin all confirmed byte-identical to their frozen identities).
- Evaluation timestamp: 2026-09-16 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `011`).

## What changed since attempt 010

Unlike attempts 009/010 (which found only ledger bookkeeping changed since
the previously-evaluated content), this attempt evaluates genuine new
implementation content. `git diff --stat` from attempt 010's evaluated
commit (`18c2da6`, the tip that recorded attempt 010's own result) to `HEAD`
(`eaaa53d`) touches: `manifest.md` (implementer's own log), `src/index.ts`
(+16/-4), `src/workflow-run.ts` (+34/-19), `test/workflow-run.integration.
test.ts` (+170/-63), and `tools/workflow.ts` (+9/-9).

The substance (commit message: "fix: enforce host-owned evaluator
permissions", confirmed by direct code reading): protected `evaluator-*`
role allocations now always resolve to the `"evaluator"` permission profile,
and that profile's workspace/hidden-workspace values are now derived
exclusively from the Harness **host's own** configuration
(`startHarnessHost`'s `evaluatorWorkspace` option, sourced from
`process.env.HARNESS_EVALUATOR_WORKSPACE` in `src/index.ts`'s own
`import.meta.main` entry point) rather than from caller-supplied
`request.evaluatorWorkspace`/`request.permissionProfile` fields. A protected
allocation with no host-configured evaluator workspace is now rejected
(`400`, "the evaluator permission profile requires a declared
evaluatorWorkspace") before any provider is launched, instead of silently
falling back to a caller-influenced value. `tools/workflow.ts`'s
`allocateHostRun` no longer reads or forwards `HARNESS_EVALUATOR_WORKSPACE`
or a caller-chosen `permissionProfile` in its request body at all — the
runner supplies only role/slot/executor; the host alone decides the
protected-role profile. The internal fixture-run construction path
(`WorkflowRunRegistry`'s `allocateFixture`) was updated to use this same
host-derived `resolvePermissionProfile("evaluator", ...)` call instead of a
previously-hardcoded `"repo-local-worker"`/`repository-read`-only profile,
so a fixture protected-evaluator allocation now receives the same
host-owned profile an ordinary protected allocation would. A narrower,
previously per-spike-hardcoded special case (permitting the evaluator
profile's hidden workspace only for `"013a-Workflow-execution-friction"` +
`"evaluator-verify"` + `executor: "claude"`) was replaced by a general
`protectedRole` (`role.startsWith("evaluator-")`) condition, so this no
longer depends on which spike or phase is asking.

This maps to `case-manifest.json`'s `PR2` (`AC04`, `AC07` — a caller cannot
supply text or fields that grant itself protected authority; N1/I1) and
`PR3` (`AC05`, `AC06` — a valid Harness allocation authorizes the role
without weakening protection globally), both `"public executable
regression"` mode, exercised by `npm test`. It does not touch the
Codex/host-boundary dispatch path (confirmed below), the bootstrap-pin
resolution (`PR7`), or the live-provider-fixture spawn mechanism itself
(`buildClaudeWorkflowCommand`/`workflow-backend.ts`'s subprocess-spawn code,
unchanged) — only which permission profile and workspace values are
resolved before a spawn is attempted.

## Summary

- Mandatory executable cases (E1-E5): **6 of 6 sub-tests pass, 0 fail**, run
  fresh this attempt against `HEAD`. `E2`'s two independent fixtures
  (original checkpoint and the cycle-002-repaired later checkpoint) both
  pass.
- Public regression (`npm test`): **78 of 78 pass, 0 fail** — a strict
  improvement over every attempt since the cycle-002 evaluator repair
  (previous attempts consistently reported 75/76, with the 1 failure being
  the self-referential `test/workflow-run.integration.test.ts` "Spike 013a
  binds its pinned evaluator authority..." defect described in
  `verification-feedback-009.md`). See "Finding 1 (resolved)" below.
- Mandatory non-executable cases: all 17 `SATISFIED` except `LP1` (`BLOCKED`)
  and `COMP1`'s `AC34` half (`BLOCKED`, derivative of `LP1`); `PR1`-`PR7`,
  `LP2`, `LP3`, `HB1`, and `COMP1`-part-a are `SATISFIED`.
- Criteria: 32 of 35 `SATISFIED` (AC01-07, AC10-33, AC35); 3 `BLOCKED` (AC08,
  AC09, AC34) — unchanged in disposition from every prior attempt in this
  cycle, but now demonstrated against materially stronger implementation
  content (the caller-controlled-permission defect this fix addresses was
  never itself a scored criterion failure in a prior attempt, but its
  correction strengthens PR2/PR3's evidence and closes a real gap the
  frozen Design Map's "host-owned" framing anticipates).
- Non-mandatory findings: 1 (resolved this attempt — see "Finding 1
  (resolved)" below).
- Evaluator defects: none discovered this attempt. No evaluator correction
  performed or required.
- Specification ambiguities: none.
- Infrastructure failures: 1 — the required live Claude executor remains
  unreachable from this evaluation environment (confirmed directly, the same
  way as every prior blocked attempt: no `claude` binary on `PATH`, no
  `HARNESS_CLAUDE_EXECUTABLE`/`HARNESS_HOST_URL` configured, no live Harness
  host process reachable), the same category of limitation that blocked
  private attempts 002, 004, 005, 007, 009, and 010.

## Live fixture — Claude protected-role delegation (LP1, AC08, AC09): BLOCKED

Checked fresh this attempt, from inside this evaluation session's own
sandbox:

- `command -v claude`: not found (exit 1). No `claude` executable reachable
  on `PATH`.
- `command -v codex`: found this attempt at `/usr/lib/chatgpt/resources/codex`
  (unlike some prior attempts, a `codex` binary happens to be present in this
  session's `PATH`). This is immaterial to `LP1`, which specifically
  requires the real **Claude** adapter (`R8`/`R9`); it does not change `LP2`'s
  disposition either, since `LP2` is independently `SATISFIED` by reference
  to already-established, diff-unaffected earlier evidence (see below) and,
  in any case, no live Harness host is reachable through which to allocate a
  fresh Codex-backed run.
- `printenv | grep -i HARNESS_CLAUDE`: empty. No configured Claude executor
  path.
- `printenv | grep -i HARNESS_HOST`: empty. No configured Harness host URL.
- `curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://127.0.0.1:3000/`:
  connection failed (no listener). `ss -tln`: only the network-egress-proxy
  ports (`1080`, `3128`) listening; no live Harness host process reachable
  from this session.
- No fresh, independently-verified external live-Claude fixture evidence for
  this exact candidate commit was supplied to or found in this session.
- **Diagnostic probe (non-authoritative)**: this evaluator session's own
  invocation shares surface-level structural conventions with the
  candidate's dispatch design (a directly-resolved "Perform the allocated
  {phase} work for {spike}"-shaped instruction rather than a manual
  `/evaluator ...` invocation; `HARNESS_EVALUATOR_WORKSPACE` and
  `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` present in this session's own
  environment). This was inspected and explicitly **not** treated as `LP1`
  evidence: (a) `LP1`'s frozen fixture explicitly requires a disposable,
  repository-owned **fixture** spike/workflow, not this evaluator's own real
  Spike 013a allocation; (b) this sandboxed session has no way to confirm
  from the inside that its own outer invocation ran through the candidate's
  own subprocess-spawn code path (`workflow-backend.ts`'s `spawn(program,
  ...)`) rather than a separate, external dispatch mechanism outside this
  session's observable boundary; and (c) no live `claude` binary or
  `HARNESS_HOST_URL` is reachable from inside this session to independently
  reproduce or observe a nested fixture dispatch either way. Treating this
  session's own existence as `LP1` evidence would require inventing facts
  about a process outside this sandbox's visibility, which this evaluator
  declines to do.

This is the same class of limitation, confirmed the same way (direct,
environment-level checks rather than inference), that blocked private
attempts 002, 004, 005, 007, 009, and 010 —
`spike.md` "Provider unavailability" / Design Map invariant I5 /
`case-manifest.json`'s `LP1` decision rule ("Required-executor unavailability
(auth/service/config) is BLOCKED, not FAIL"). Nothing in this evaluation
environment differs from prior attempts' environments in a way that resolves
this limitation, and the new "host-owned evaluator permissions" fix does not
touch the subprocess-spawn mechanism `LP1` requires.

**Result:** `AC08`, `AC09` remain `BLOCKED`. `AC34` (`COMP1`, part b) remains
`BLOCKED` (derivative — `case-manifest.json`'s `COMP1` decision rule ties
`AC34`'s readiness demonstration specifically to "LP1's exercise of the
original refusal condition (R9)," unreachable while the executor is
unreachable). `AC33` (`COMP1`, part a) is independently unaffected (below).

## Non-executable cases confirmed this attempt (PR1-PR7, LP2, LP3, HB1, COMP1-part-a)

- `PR2` (`AC04`, `AC07`) and `PR3` (`AC05`, `AC06`): **freshly, directly
  exercised** this attempt by the new/changed tests in `npm test` — "canonical
  evaluator delegation is derived from the requesting workflow" (updated: the
  caller-shaped-authority refusal now uses a dedicated fixture workflow
  rather than real Spike 013a; a settings/permission-profile assertion now
  confirms the host-configured workspace, not a caller-supplied one, is
  used), "Spike 013a binds its pinned evaluator authority and refuses
  prompt-shaped authority" (updated, no longer self-referential — see Finding
  1), "protected evaluator roles use host configuration, never caller worker
  permissions" (new), and "a protected evaluator allocation without host
  configuration is rejected before launch" (new). All pass. `SATISFIED`.
- `PR1` (`AC01`-`AC03`), `PR4` (`AC12`-`AC15`), `PR5` (`AC18`, `AC23`-`AC26`):
  `SATISFIED`, confirmed by this attempt's fresh `npm test` (78/78); direct
  inspection confirms the diff does not touch contract-identity resolution,
  role-result/process-vs-semantic-disposition handling, or run
  observability/CLI-inspection surfaces.
- `PR6` (`AC29`): `SATISFIED` — unaffected; the diff does not touch the
  Spike 013a bootstrap-exception allocation path
  (`allocateHostRun`/`bootstrapAuthority` identification of upstream
  authority), only the permission-profile values it produces.
- `PR7` (`AC30`, `AC31`): `SATISFIED` — bootstrap byte-identity re-confirmed
  fresh this attempt (see "Evaluation Source" above): `bootstrap/
  evaluator-skill.md` is byte-identical to working-tree `skills/evaluator/
  SKILL.md`, and this very evaluation session was itself dispatched using
  that pinned snapshot path (`contractPath` supplied directly), not a
  working-tree resolution.
- `LP2` (`AC10`), `LP3` (`AC11`), `HB1` (`AC32`), `COMP1`-part-a (`AC33`):
  `SATISFIED` — referenced from already-established, diff-unaffected
  live-Codex evidence from earlier attempts in this cycle (e.g. attempt
  002's real, non-mocked `codex exec --sandbox workspace-write` run: genuine
  host-boundary crossing, host-resolved contract identity/delivery mode, and
  fully automatic `roleDisposition: "succeeded"` capture with no manual
  result call). `git diff --stat bb541265d994aad1f1af30446bf0a19ad59e1537
  eaaa53d -- src/ tools/` plus a `grep -i 'codex\|host-boundary\|adapter'`
  against that cumulative cycle diff returns exactly one line
  (`createCodexBackend(...)` in `src/index.ts`'s existing executor-selection
  branch, unchanged in substance), confirming the dispatch path
  `LP2`/`HB1`/`COMP1`-part-a depend on remains untouched across the whole
  cycle, including this attempt's new fix. This session has no `codex`-
  reachable live Harness host either (see above), so re-running `LP2` fresh
  was not possible and is not required, since the diff-unaffected reference
  basis remains valid and undisturbed.

## Findings

### Finding 1 (resolved this attempt) — the self-referential public regression test defect reported in attempts 009/010 no longer exists

**Prior observation** (attempts 009 and 010): `test/workflow-run.integration.
test.ts`'s "Spike 013a binds its pinned evaluator authority and refuses
prompt-shaped authority" test targeted the real, live Spike 013a
`workflow.jsonl` for its caller-shaped-authority-refusal assertion, making
the assertion's expected status code (`400` vs `201`) depend on Spike 013a's
own real, evolving ledger state rather than a controlled fixture — a latent
test-design defect, not a product defect, already reported as public
feedback in `verification-feedback-009.md`.

**This attempt**: the candidate's own new diff removed that self-referential
first assertion from the Spike-013a-specific test entirely and relocated an
equivalent caller-shaped-authority-refusal assertion into the
already-fixture-based "canonical evaluator delegation is derived from the
requesting workflow" test (which uses a disposable `fixtureName` workflow,
not real Spike 013a). `npm test` this attempt: **78/78 pass, 0 fail** — the
previously-intermittent failure does not occur. Direct inspection of the
diff (`test/workflow-run.integration.test.ts`) confirms this restructuring
is exactly what would eliminate the defect's root cause (dependence on real
Spike 013a ledger state for a caller-authority-refusal assertion).

**Classification:** this was always a non-mandatory, candidate-facing test-
design finding, not a criterion failure; its resolution does not by itself
flip any criterion (the criteria it was adjacent to, `AC04`/`AC07`/`AC30`/
`AC31`, were already independently `SATISFIED` in every prior attempt via
the diagnostic probes those attempts ran). It is recorded here because the
public feedback that reported it (`verification-feedback-009.md`) can now be
noted as addressed; no new public feedback artifact is required for this
already-closed, now-resolved item.

**Result:** does not change any criterion's disposition; removes a
previously-recurring non-mandatory finding.

## Regression Results

- `npm test` at `HEAD`: **78/78 pass, 0 fail**.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check`: exit 0 for all Git-tracked files (the pre-existing,
  permission-masked, untracked `.mcp.json` sandbox artifact is unreadable to
  Prettier and excluded, as in every prior attempt; it causes the overall
  process exit code to be non-zero but no tracked file fails formatting).
- `git diff --check` (working tree and staged): exit 0.
- E1-E5 (`.hidden-test/*.test.ts`, 6 sub-tests across 5 files): 6/6 pass, run
  fresh this attempt against `HEAD` via `node --test` (Node `v22.23.2`; the
  frozen runtime assumption of `>=24.12.0` is not met by this session, but no
  test's behavior depended on a version-specific Node feature; all six
  sub-tests pass cleanly and no fixture artifact was left under `spikes/`
  afterward, confirmed via `git status --porcelain`).

## Diagnostic Probes

- Probe: `command -v claude`, `command -v codex`, `printenv | grep -i
  HARNESS_CLAUDE`, `printenv | grep -i HARNESS_HOST`, `curl` to
  `127.0.0.1:3000`, and `ss -tln` — see "Live fixture" above.
- Probe: this evaluator session's own invocation conventions, explicitly
  ruled non-authoritative for `LP1` — see "Live fixture" above.
- Probe: `git diff --stat bb541265d994aad1f1af30446bf0a19ad59e1537 eaaa53d --
  src/ tools/` plus a `grep` for Codex/host-boundary/adapter terms in that
  cumulative cycle diff, confirming `LP2`/`HB1`/`COMP1`-part-a's dispatch
  path remains untouched — see "Non-executable cases confirmed this
  attempt" above.
- Probe: direct reading of `src/index.ts`, `src/workflow-run.ts`, and
  `tools/workflow.ts`'s changed regions to confirm the fix's substance
  (host-derived, not caller-derived, protected-role permission resolution)
  independent of the commit message and the implementer's own `manifest.md`
  narrative.
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what the underlying mandatory evidence already established; they
  isolated causes and ruled out alternative explanations, per the evaluator
  skill's diagnostic-probe rules.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered. Evaluator revision
  remains `003`, unchanged.
- No specification drift was detected in any frozen input this attempt.
- Before treating this session's own invocation as potential `LP1` evidence,
  it was deliberately and explicitly excluded for the reasons given above,
  rather than either silently ignored or silently credited — avoiding both a
  missed-evidence error and a fabricated-evidence error.
- Before classifying `LP1` `BLOCKED`: environment-level unavailability was
  confirmed directly (`command -v`, `printenv`, `curl`, `ss`) this attempt,
  not inferred or copied from attempt 010's result, ruling out this
  evaluator's own oversight as the cause and confirming the blocking
  condition genuinely persists in this session.

## Overall Assessment

This attempt evaluates genuine new implementation content: a fix that makes
protected `evaluator-*` role permission profiles depend solely on the
Harness host's own configuration rather than on caller-supplied request
fields, closing a real caller-controlled-authority gap the frozen Design
Map's host-owned framing anticipates, and — as a side effect — removing the
self-referential test-design defect (`verification-feedback-009.md`'s
Finding 1) that recurred in attempts 009 and 010. `npm test` now passes
78/78 (previously 75/76), and all mandatory executable/non-executable cases
except `LP1` and `AC34` remain `SATISFIED`. The same genuine, external,
environment-level limitation persists: the configured Claude executor
remains unreachable from within this evaluation session's own sandbox
(`LP1`; `AC08`, `AC09`, and their `COMP1` derivative `AC34`). This is
squarely `BLOCKED`/`INFRASTRUCTURE_FAILURE` per the frozen contract, not a
license to pass or fail on a substitute basis, and this evaluator explicitly
declined to treat its own dispatch circumstances as a substitute for the
frozen fixture's requirements.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is still required, run from a session or
environment where a real `claude` executor and a reachable Harness host are
both available for the `LP1` fixture's real-backend spawn to actually
complete, or supplied with fresh, independently-verified external
live-Claude fixture evidence for this exact candidate commit. No evaluator
correction is warranted or was performed this attempt.

## Public Feedback

A short public feedback artifact (`verification-feedback-011.md`) is
recorded, noting: (a) the continued `BLOCKED`/`INFRASTRUCTURE_FAILURE`
disposition and its cause (unchanged from `verification-feedback-010.md`);
(b) that the "host-owned evaluator permissions" fix is confirmed correct and
sufficient for `PR2`/`PR3` by a fresh, full `npm test` run; and (c) that the
self-referential test-design defect previously reported in
`verification-feedback-009.md` is now resolved and needs no further action.
No hidden mechanics are disclosed.

## Final execution record

Per the evaluator skill's "Final execution record": this attempt's richer
statistics are captured in this file and in `.eval/attempt-ledger.json`
first, before the public `manifest.md` aggregate entry, the canonical
workflow-ledger `verification-finalized` transition, and
`verification-feedback-011.md` are written and committed. This attempt's
final public commit also carries forward the two pre-existing, uncommitted
canonical-ledger lines this session found at start (`implementation-handoff`
attempt 10 and `verification-allocated` attempt 13, both unmodified — see
"Finding 0" above).
