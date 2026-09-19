# Evaluation Result — Spike 013a, attempt 010

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `010` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `12`
  (`implementationAttempt: 9`, `cycle: "002"`, `evaluatorRevision: "003"`),
  evidence dated `2026-09-16T13:23:32.494Z` (`workflow.jsonl`, commit
  `3a5460ff4c07ce6b474ca12b890723ea0765fda1`, "chore: allocate Spike 013a
  verification 12"). No prior `verification-finalized` record exists for this
  allocation.
- Canonical `implementation-handoff` (cycle `002`, attempt `9`) evidence
  commit: `07b300751376b805c8aa414eaa5d7964a442ea68` ("fix: resume workflow
  runner from canonical handoff"), unchanged since attempt `009`.
- Project `HEAD` actually evaluated: `3a5460ff4c07ce6b474ca12b890723ea0765fda1`.
  `git log --oneline 07b3007..HEAD` shows four commits beyond the handoff
  evidence: `9cd6cb0` (handoff record only, no source change), `afa8e21` (the
  one genuine source fix attempt `009` already evaluated), `0e8bf55` (docs:
  record attempt 009's own BLOCKED result), and `3a5460f` (chore: allocate
  this attempt's canonical `verification-allocated` record). `git diff --stat
  07b3007..HEAD` confirms exactly `manifest.md`, `verification-feedback-009.md`,
  `workflow.jsonl`, `test/workflow.test.ts` (+24), and `tools/workflow.ts`
  (+9/-5) changed — identical source diff to what attempt `009` evaluated;
  `git diff --stat afa8e21 HEAD` touches only `manifest.md`,
  `verification-feedback-009.md`, and `workflow.jsonl` (bookkeeping only, 0
  source lines). This attempt therefore evaluates the exact same
  implementation content attempt `009` evaluated — no implementation drift —
  under a freshly allocated canonical verification attempt, per attempt
  `009`'s own "Next steps" (a subsequent attempt was required once a session
  with a reachable live Claude executor, or fresh external evidence, becomes
  available). No implementation source content is uncommitted (`git status
  --porcelain` confirmed below).
- Working tree at evaluation time: the same pre-existing, unrelated,
  uncommitted drift in `spikes/011-host-owned-workflow-runs/workflow.jsonl`
  (a single `correction-cycle-opened` line dated `2026-09-11T19:18:29.452Z`,
  confirmed via `git diff` to be identical to the line every prior attempt
  (002-009) independently observed and excluded — predates every Spike 013a
  implementation commit, never committed to git history); plus an untracked,
  permission-masked `.mcp.json` sandbox artifact, and an untracked
  `humam-acceptance.md` (public human-acceptance record for the closed cycle
  001, unrelated to source content, already present before this session
  began). No implementation source content is uncommitted.
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
  executes under.
- Evaluator revision: `003` (unchanged; no evaluator correction performed or
  needed this attempt).
- No specification drift detected in any frozen input (`spike.md`,
  `design-map.md`, `eval-requirements.md`, `coverage-map.json`, evaluator
  skill pin all confirmed byte-identical to their frozen identities).
- Evaluation timestamp: 2026-09-16 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `010`).

## Why this attempt exists

Attempt `009` (canonical attempt `11`) left the cycle open, `BLOCKED` on
`INFRASTRUCTURE_FAILURE`: 32 of 35 mandatory criteria were `SATISFIED`
(including the repaired `AC16`/`AC17`/`AC19` coverage), but `AC08`, `AC09`,
and derivative `AC34` remained unestablished because no `claude` executable,
configured executor path, or reachable Harness host existed in that session.
A fresh canonical `verification-allocated` record (attempt `12`) was made
against the same, unchanged implementation content, per attempt `009`'s own
documented next-step requirement. This attempt re-runs the complete frozen
evaluation fresh (not a copy of attempt `009`'s result) against this new
session, to determine whether the blocking condition has changed.

## Summary

- Mandatory executable cases (E1-E5): **6 of 6 sub-tests pass, 0 fail**, run
  fresh this attempt against `HEAD`. `E2`'s two independent fixtures
  (original checkpoint and the cycle-002-repaired later checkpoint) both
  pass.
- Mandatory non-executable cases: 14 of 17 `SATISFIED` (`PR1`-`PR7`, `LP2`,
  `LP3`, `HB1`, `COMP1`-part-a — diff-unaffected since attempt `009`,
  re-confirmed by fresh diff inspection plus this attempt's fresh regression
  run); `LP1` is `BLOCKED` (required live Claude executor unreachable from
  this evaluation session — see below); `COMP1`'s `AC34` half remains
  `BLOCKED` (derivative of `LP1`).
- Criteria: 32 of 35 `SATISFIED` (AC01-07, AC10-33, AC35); 3 `BLOCKED` (AC08,
  AC09, AC34) — unchanged from attempt `009`.
- Non-mandatory findings: 1, re-observed and further corroborated this
  attempt (see Finding 1 below — a stale, self-referential assertion in the
  candidate's own public regression suite; does not flip any criterion; the
  candidate-facing summary was already recorded as public feedback in
  attempt `009` and is not restated as new feedback here).
- Evaluator defects: none discovered this attempt. No evaluator correction
  performed or required.
- Specification ambiguities: none.
- Infrastructure failures: 1 — the required live Claude executor remains
  unreachable from this evaluation environment (confirmed directly, the same
  way as every prior blocked attempt: no `claude` binary on `PATH`, no
  `HARNESS_CLAUDE_EXECUTABLE`/`HARNESS_HOST_URL` configured, no live Harness
  host process reachable), the same category of limitation that blocked
  private attempts 002, 004, 005, 007, and 009.

## Live fixture — Claude protected-role delegation (LP1, AC08, AC09): BLOCKED

Checked fresh this attempt, from inside this evaluation session's own
sandbox:

- `command -v claude`: not found (exit 1). No `claude` executable reachable
  on `PATH`.
- `printenv | grep -i HARNESS_CLAUDE`: empty. `printenv | grep -i
  HARNESS_HOST`: empty. No configured executor path, no configured host URL.
- `ss -tln`: only the network-egress-proxy ports (`1080`, `3128`) listening;
  no already-live Harness host process reachable from this session.
- No fresh, independently-verified external live-Claude fixture evidence for
  this exact candidate commit was supplied to or found in this session (the
  private evaluator workspace contains no file newer than attempt `009`'s own
  finalized result other than session/editor configuration artifacts and the
  ledger update attempt `009` itself made).

This is the same class of limitation, confirmed the same way (direct,
environment-level checks rather than inference), that blocked private
attempts 002, 004, 005, 007, and 009 — `spike.md` "Provider unavailability" /
Design Map invariant I5 / `case-manifest.json`'s `LP1` decision rule
("Required-executor unavailability (auth/service/config) is BLOCKED, not
FAIL"). Nothing in this evaluation environment differs from attempt `009`'s
environment in a way that resolves this limitation.

**Result:** `AC08`, `AC09` remain `BLOCKED`. `AC34` (`COMP1`, part b) remains
`BLOCKED` (derivative — `case-manifest.json`'s `COMP1` decision rule ties
`AC34`'s readiness demonstration specifically to "LP1's exercise of the
original refusal condition (R9)," unreachable while the executor is
unreachable). `AC33` (`COMP1`, part a) is independently unaffected (below).

## Non-executable cases unaffected since attempt 009 (PR1-PR7, LP2, LP3, HB1, COMP1-part-a)

No implementation source content changed since attempt `009` (confirmed
above: `git diff --stat afa8e21 HEAD` touches only bookkeeping files). All
evidence attempt `009` established for these cases therefore remains valid
without re-litigation; this attempt additionally re-confirms it is still
diff-unaffected relative to the last promoted candidate (`bb54126`):

- `git diff --stat bb541265d994aad1f1af30446bf0a19ad59e1537 HEAD -- src/
  tools/` still touches only `src/workflow-run.ts` (30 lines) and
  `tools/workflow.ts` (240 lines) — re-inspected fresh this attempt, confirmed
  scoped to `canonicalEvaluatorAuthority`'s cycle-scoping,
  `resolvePermissionProfile`'s narrowing parameter, and
  `canDispatch`/`canonicalProgress`/`record verification-allocated`, exactly
  as attempt `009` described; `grep -i 'codex\|host-boundary\|adapter'`
  against that diff returns no matches — the diff still does not touch the
  Codex/host-boundary dispatch path `LP2`/`HB1`/`COMP1`-part-a depend on.
- `PR1-PR6` (AC01-07, AC12-15, AC18, AC23-26, AC29): `SATISFIED`, confirmed
  by this attempt's fresh `npm test` (75/76; the 1 failure is Finding 1,
  which does not implicate any of these; see below) plus a fresh diagnostic
  probe covering the untested remainder of the one affected test file.
- `PR7` (AC30, AC31): `SATISFIED` — bootstrap byte-identity re-confirmed
  fresh this attempt (see "Evaluation Source"); pin-dispatch behavior
  (`run.skill`, `run.skillVersion`, `roleDisposition: "pending"`, shorthand
  duplicate binding, automatic result capture) re-confirmed via a fresh
  diagnostic probe (below), since the same test file's own in-suite
  assertion could not complete past its now-stale precondition this attempt
  either.
- `LP2` (AC10), `LP3`/AC11, `HB1`/AC32, `COMP1`-part-a/AC33: `SATISFIED` —
  referenced from already-established, diff-unaffected live-Codex evidence
  from earlier attempts in this cycle (e.g. attempt 002's real, non-mocked
  `codex exec --sandbox workspace-write` run: genuine host-boundary crossing,
  host-resolved contract identity/delivery mode, and fully automatic
  `roleDisposition: "succeeded"` capture with no manual result call),
  consistent with this cycle's own established precedent of referencing
  rather than re-running unaffected live-provider evidence when the diff is
  confirmed unaffected (attempts 007 and 009 both did the same). This
  session has no `codex` reachable at a location `tools/workflow.ts` would
  invoke without further configuration either (the environment has no more
  live-provider reach than attempt 009's did for either provider); re-running
  `LP2` fresh this attempt was not possible and is not required, since the
  diff-unaffected reference basis remains valid and undisturbed.

## Findings

### Finding 1 (re-observed, non-mandatory, previously reported in attempt 009's public feedback) — the same self-referential public regression test now manifests its other documented branch

**Observed:** `npm test` at `HEAD`: 75/76 pass. The 1 failure is again
`test/workflow-run.integration.test.ts` > `"Spike 013a binds its pinned
evaluator authority and refuses prompt-shaped authority"`, but this time at
`assert.equal(refused.status, 400)` with `actual: 201` (previously, at
attempt `009`, the same assertion produced `400` with a different message).

**Root cause:** identical to attempt `009`'s Finding 1 (root-caused there in
full: the test targets the real, live Spike 013a `workflow.jsonl` via
`workspace: repositoryRoot`/`slot.workflow: "013a"` instead of a disposable
fixture; `prompt`, `contract`, `systemPrompt`, and `allocationAuthority`
request fields are structurally inert to authorization, re-confirmed fresh
this attempt by direct code inspection — `grep -n
"request.contract\|request.systemPrompt\|request.allocationAuthority"
src/workflow-run.ts` returns no matches, and `request.prompt` is only ever
carried through to the run record, never consulted for authorization).
Attempt `009` already predicted this exact outcome as a live possibility
("once cycle-002's own real ledger legitimately reaches
`implementation-handoff` + matching `verification-allocated`... the request
is genuinely, correctly granted (`201`)"): real Spike 013a's own canonical
ledger has, by this attempt's own allocation (`verification-allocated`
attempt `12`), now reached exactly that state, so the previously-refused
request is now genuinely and correctly granted. This is the other
branch of the identical, already-diagnosed defect, not a new or different
one.

**Fresh diagnostic probe this attempt:** a disposable, uncommitted copy of
`test/workflow-run.integration.test.ts` (placed transiently at
`test/probe-013a-finding1.test.ts`, run via `node --test
--test-name-pattern`, deleted immediately after — confirmed via `git status
--porcelain test/` before and after: identical) with the stale first
assertion (`refused.status === 400`) removed and the subsequent
`created.length` counts adjusted to account for the now-granted allocation
also creating a run. Result: the remainder of the same test — the Spike
013a bootstrap-pin dispatch assertions relevant to `PR7`/AC30/AC31
(`run.skill`, `run.skillVersion`, `roleDisposition`, shorthand-duplicate
binding, and the automatic-result-capture flow) — passes cleanly once past
the stale precondition, exactly as attempt `009` found for its own branch of
this defect. This probe is non-authoritative and did not substitute for or
alter the mandatory `npm test` result recorded above.

**Classification:** unchanged from attempt `009` — the same latent,
self-referential test-design defect in the candidate's own public regression
suite (already recorded as public feedback in `verification-feedback-009.md`
and directed at a future implementation pass). It does not demonstrate AC04,
AC07, AC30, or AC31 are unmet (both directly re-confirmed, see above and
Diagnostic Probes). Since this is the identical defect already reported as
public feedback (not a new candidate-facing observation), no new public
feedback artifact is produced this attempt; this eval-result documents its
re-occurrence and continued non-authoritative status for the private record.

**Result:** does not change any criterion's disposition.

## Regression Results

- `npm test` at `HEAD`: 75/76 pass, 1 fail (Finding 1, does not flip any
  criterion).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check`: exit 0 for all Git-tracked files (the pre-existing,
  permission-masked, untracked `.mcp.json` sandbox artifact is unreadable to
  Prettier and excluded, as in every prior attempt; it causes the overall
  process exit code to be non-zero but no tracked file fails formatting).
- `git diff --check`: exit 0.
- E1-E5 (`.hidden-test/*.test.ts`, 6 sub-tests across 5 files): 6/6 pass, run
  fresh this attempt against `HEAD` via `node --test` (Node `v22.23.2`; the
  frozen runtime assumption of `>=24.12.0` is not met by this session, but no
  test's behavior depended on a version-specific Node feature; all six
  sub-tests pass cleanly and no fixture artifact was left under `spikes/`
  afterward, confirmed via `git status --porcelain`).

## Diagnostic Probes

- Probe: `command -v claude`, `printenv | grep -i HARNESS_CLAUDE`,
  `printenv | grep -i HARNESS_HOST`, `ss -tln`, and a directory-listing check
  for any fresh external live-Claude evidence file in the private evaluator
  workspace — see "Live fixture — Claude protected-role delegation" above.
- Probe: `git diff --stat bb541265d994aad1f1af30446bf0a19ad59e1537 HEAD --
  src/ tools/` plus a `grep` for Codex/host-boundary/adapter terms in that
  diff, confirming `LP2`/`HB1`/`COMP1`-part-a's dispatch path remains
  untouched — see "Non-executable cases unaffected since attempt 009" above.
- Probe: a disposable, uncommitted copy of
  `test/workflow-run.integration.test.ts` with only the now-stale first
  assertion removed, run via `node --test --test-name-pattern`, deleted
  immediately after — see Finding 1.
- Probe: direct code trace (`grep`) confirming `request.contract`,
  `request.systemPrompt`, and `request.allocationAuthority` are never read by
  `src/workflow-run.ts`, and `request.prompt` is only ever carried through —
  see Finding 1.
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
- Before classifying Finding 1's recurrence: the underlying request-parsing
  code was independently re-traced (not merely trusted), and a fresh
  read-only diagnostic probe corroborated the untested remainder of the same
  test file. The evidence points to the same, already-diagnosed candidate
  test-design fragility, not to an evaluator or specification defect, and
  not to a new or different authorization regression.
- Before classifying `LP1` `BLOCKED`: environment-level unavailability was
  confirmed directly (`command -v`, `printenv`, `ss`) this attempt, not
  inferred or copied from attempt `009`'s result, ruling out this
  evaluator's own oversight as the cause and confirming the blocking
  condition genuinely persists in this session.

## Overall Assessment

This attempt re-runs the complete frozen evaluation fresh against the exact
same implementation content attempt `009` evaluated, under a freshly
allocated canonical verification attempt. All 32 previously-`SATISFIED`
criteria are re-confirmed `SATISFIED` (including AC16, AC17, AC19). The same
genuine, external, environment-level limitation persists: the configured
Claude executor remains unreachable from within this evaluation session's own
sandbox (`LP1`; AC08, AC09, and their `COMP1` derivative AC34). This is
squarely `BLOCKED`/`INFRASTRUCTURE_FAILURE` per the frozen contract, not a
license to pass or fail on a substitute basis. Finding 1 recurs in its other
already-documented branch, confirming (rather than contradicting) attempt
009's root-cause analysis; it is not new public feedback.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt is still required, run from a session or
environment where a real `claude` executor is reachable for the `LP1`
fixture's real-backend spawn to actually complete, or supplied with fresh,
independently-verified external live-Claude fixture evidence for this exact
candidate commit. No evaluator correction is warranted or was performed this
attempt.

## Public Feedback

No new public feedback artifact is produced this attempt: the one
non-mandatory finding (Finding 1) is the identical, already-diagnosed defect
already reported in `verification-feedback-009.md`, and the BLOCKED
classification/reasoning is unchanged from that same document's substance.
`verification-feedback-010.md` is nonetheless recorded, per the evaluator
skill's per-attempt result convention, as a short status update pointing back
to `verification-feedback-009.md` for full detail and confirming this
attempt's fresh re-confirmation, without reproducing hidden mechanics.

## Final execution record

Per the evaluator skill's "Final execution record": this attempt's richer
statistics are captured in this file and in `.eval/attempt-ledger.json`
first, before the public `manifest.md` aggregate entry and
`verification-feedback-010.md` are written and committed.
