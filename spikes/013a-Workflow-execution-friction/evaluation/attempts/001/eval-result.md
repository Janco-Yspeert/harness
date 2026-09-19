# Evaluation Result — Spike 013a, attempt 001

## Identity

- Attempt: `001`
- Implementation: `git:33fa7c44adfab2164a07d949431857f620e0a816`
  ("feat: bind workflow roles to semantic outcomes"), canonically recorded by
  `implementation-handoff` (attempt 1) in
  `spikes/013a-Workflow-execution-friction/workflow.jsonl` at
  `HEAD 222fdba` (a follow-up commit that only appends that authority record;
  no source changes).
- Evaluator revision used: `002`, identity
  `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`.
  (Revision `001`, identity
  `sha256:f86a3bf834325f2764ba38f83adc5127d68163e405d8a82b9fcfb731e121533b`,
  was corrected mid-attempt before any result was finalized under it — see
  `.eval/revisions/002/repair-record.md`. This attempt was never finalized
  against revision 001.)
- Governing evaluator skill confirmed byte-identical, at verify time, to:
  `spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md`,
  `git show fae05912f59f8ebdb8982ab16deb26e293754647:skills/evaluator/SKILL.md`,
  and the working-tree `skills/evaluator/SKILL.md` — all three
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
  No binding failure.

## Step 1 — Immutable inputs

All frozen inputs confirmed byte-identical at implementation commit `33fa7c4`
to their frozen identities: `spike.md`, `design-map.md`,
`eval-requirements.md`, `coverage-map.json`,
`bootstrap/evaluator-skill.md`/`evaluator-authority.json` (public); private
`eval-spec.md`, `case-manifest.json`, `.hidden-test/manifest.json`, and all
five hidden test files (private). No `SPECIFICATION_DRIFT`.

**Working-tree observation (not part of the implementation revision):** at
verify time, `spikes/011-host-owned-workflow-runs/workflow.jsonl` carries an
**uncommitted** working-tree modification appending a
`correction-cycle-opened` (cycle 002) event, timestamped
`2026-09-11T19:18:29Z` — before Spike 013a's own `brief-readiness` dispatch
(`19:56:10Z`) and before any Spike 013a authority event. It is not part of
any commit (`git log -1 -- spikes/011-host-owned-workflow-runs/workflow.jsonl`
still shows only the original `6adae1e`), is not referenced by the
implementation-handoff record, and predates this spike's own workflow
entirely. It is not attributed to this candidate implementation and was left
untouched throughout preparation and verification. It is flagged here because
its *content* is exactly the shape N9/AC34 forbid advancing, and because a
canonical-authority file sitting mutated-but-uncommitted in the working tree
is a repository-hygiene condition worth the human's attention independent of
this evaluation.

## Step 2 — Frozen evaluation results

### Executable hidden cases (revision 002)

| Case | Criteria | Result |
| --- | --- | --- |
| E1 `dispatch-inspection-non-consuming` | AC20 | **PASS** |
| E2 `canonical-authority-adoption` | AC16, AC17, AC19 | **PASS** |
| E3 `recoverable-preexecution-failure` | AC21 | **PASS** |
| E4 `blocked-phase-retry` (corrected, revision 002) | AC22, AC35 | **FAIL** |
| E5 `authority-status-evidence-aware-transitions` | AC27, AC28 | **FAIL** |

E4 failure: `dispatch brief-readiness <spike> --execute` refused with
`"Phase brief-readiness attempt 1 has already been dispatched"` even though
the phase's only prior execution ended `blocked` and canonical authority
still requires it. Root cause (confirmed by reading
`tools/workflow.ts`): `attemptForDispatch()` only increments the attempt
counter for the `implementation` and `evaluator-verify` phases; every other
phase always computes attempt 1, and this was not changed by the candidate
(confirmed: `git diff 6e5ff54 33fa7c4 -- tools/workflow.ts` touches neither
`attemptForDispatch` nor the "already been dispatched" guard's condition).

E5 failure: `authority status`'s `legalTransitions` still excludes
`correction-cycle-opened` for a repairable Spike-011-shaped rejection state
(`correctionPermitted: true` but the transition absent from
`legalTransitions`), identical to the pre-implementation baseline. Confirmed
unaddressed: `git diff 6e5ff54 33fa7c4 -- tools/workflow.ts` contains no
change to the `legalTransitions` computation in the `authority()` function.

### Non-executable procedures

| Procedure | Criteria | Result | Basis |
| --- | --- | --- | --- |
| PR1 | AC01, AC02, AC03 | **FAIL** | Diagnostic probe (below) |
| PR2 | AC04, AC07 | PASS | Implementation's own test + probe |
| PR3 | AC05 (see below), AC06 | AC06 PASS, AC05 **FAIL** | Probe |
| PR4 | AC12, AC13, AC14, AC15 | PASS | Live fixture + code inspection |
| PR5 | AC18, AC23, AC24, AC25, AC26 | AC25 **FAIL**; others PASS | Live fixture |
| PR6 | AC29 | PASS | Preserved `.workflow`/`manifest.md` history |
| PR7 | AC30, AC31 | PASS | Probe (pin generalized to workflow "013a") |
| LP1 | AC08, AC09 | **BLOCKED** | See below |
| LP2 | AC10 | **FAIL** | Live Codex fixture + probe |
| LP3 | AC11 | **FAIL** | Depends on LP2 |
| HB1 | AC32 | PASS | Live Codex fixture |
| COMP1 | AC33, AC34 | **FAIL** | Live Codex fixture |

## Diagnostic probes (non-authoritative, supplementary)

Per the "Diagnostic probes" rule: read-only, does not substitute for a
mandatory case, but distinguishes implementation/evaluator/infrastructure
causes and grounds the non-executable procedure results above.

**Probe A — authorization boundary generality (grounds PR3/AC05, and why LP1
was not attempted for real).** Using the real `WorkflowRunRegistry` and
`parseWorkflowRunRequest` from `src/workflow-run.ts` with a mock backend (no
process spawned), a freshly and genuinely canonically-authorized fixture
spike (real `brief-frozen`/`design-map-frozen`/`evaluation-prepared` recorded
via `tools/workflow.ts authority record`, plus its own valid
`bootstrap/evaluator-authority.json` pinning the same v11 evaluator skill)
requesting a **delegated** `evaluator-prepare` allocation was **refused**:
`"protected evaluator roles require a canonical pinned allocation or explicit
human authorization"`. The same request with `invocationMode: "direct"` +
`humanAuthorization: true` was allowed (confirms AC06). A request for
workflow `"013a"` was allowed and correctly bound
`skill: "bootstrap/evaluator-skill.md"`, `skillVersion: "11"` (confirms
PR7/AC30-31 generalized past Spike 012).

Root cause read from source: `resolvePinnedVerificationAuthority` in
`src/workflow-run.ts` only recognizes `request.slot.workflow === "012"` or
`"013a"` by literal string equality; it never consults the named workflow's
own canonical `workflow.jsonl` authority or its own `bootstrap/` declaration.
A valid Harness evaluator-role allocation is therefore **not** generally
authorized from canonical authority (AC05); it is authorized from a
two-entry hardcoded allowlist of the two real spikes that happen to exist
today.

Consequence for LP1/AC08/AC09: the frozen `eval-spec.md`/`case-manifest.json`
required a "bounded, reproducible, repository-owned" fixture distinct from
real production spikes (per spike.md "Scenario prerequisites" and Design Map
"the two required live-provider scenarios use bounded, repository-owned
workflow fixtures"). Given the above, the *only* two targets that can
receive delegated protected-evaluator authority under this candidate are
Spike 012 (closed, historical, already-accepted) and Spike 013a itself (the
in-progress subject of this very verification). Dispatching a real,
`acceptEdits`, repo-root-writable Claude session against either carries a
material risk of mutating real historical evaluator records or interfering
with this verification, with no way to bound it the way the frozen
prerequisites require. The human operator was consulted and declined to
accept that risk. **AC08 and AC09 are therefore BLOCKED for this attempt**:
not because the executor is unavailable (it is available — confirmed
`claude`/`codex` binaries present), but because the implementation's own
AC05 defect makes the mandated safe fixture impossible to construct. This is
recorded as `BLOCKED`, not a mock-backed `PASS`, per Design Map invariant I5
and spike.md "Provider unavailability" (extended here to "no safe mandated
fixture obtainable," the closest-fitting non-`FAIL` disposition; the
underlying cause is itself the confirmed AC05 `IMPLEMENTATION_FAILURE`
above, not an independent defect).

**Probe B — host-side contract-identity verification (grounds PR1/AC01-03,
LP2/AC10).** Using the same real registry with a mock backend, three ordinary
(non-`evaluator-*`) role allocations were made: one claiming the real skill
name `"brief-readiness"` v3, one claiming a **fabricated, nonexistent**
contract `"totally-made-up-contract-that-does-not-exist"` v999, and one
omitting `skill` entirely. All three were **accepted identically** — the
host performs no independent resolution or verification of which contract
actually governs a role; it stores and echoes back whatever string the
caller supplies. Root cause read from source: `resolveSpec()` in
`src/workflow-run.ts` sets `skill: pinnedAuthority?.snapshotPath ??
request.skill ?? null` — for the (evaluator-only) pinned path this is
derived, but for every ordinary role it is pure passthrough with no
lookup against any repository contract, canonical authority, or skill
registry.

**Live fixture — bounded real Codex execution (LP2, HB1, contributes to
PR4/PR5/COMP1).** A real Harness host was started
(`startHarnessHost(0)` with no backend overrides, i.e. the real
`createLocalWorkflowBackend`) and a bounded, disposable, git-initialized
fixture directory (outside the Harness repository, containing only a
`README.md`, deleted afterward) was used as the sole workspace for an
ordinary `brief-readiness` role dispatched to the real `codex` executor with
a caller-declared `skill: "lp2-fixture-contract"` v1 and a bounded prompt
("reply DONE, do not modify files"). Observed:

- A real `codex exec` child process launched (`codex-cli 0.153.4`, real
  session id, real token usage), correctly sandboxed
  (`sandbox: workspace-write [workdir, /tmp, $TMPDIR]`, `workdir: <fixture>`)
  — confirms **AC32**: a real, non-static, non-mocked crossing of the
  Harness host-owned workflow-run boundary, with genuine process-level
  enforcement of the declared workspace boundary.
- The run record accepted `skill: "lp2-fixture-contract"` v1 verbatim with
  no verification and exposed no distinct "delivery/invocation mode" field
  separate from `invocationMode` (which records delegation-authorization
  mode, not contract-delivery mode) — confirms **AC10 FAIL** (same root
  cause as Probe B) and **AC25 FAIL** (contract identity unverified; no
  delivery-mode field at all).
- The process exited 0 (`status: "completed"`) and **`roleDisposition`
  remained `"pending"`** — confirms **AC12/AC13/AC15 PASS**: process
  completion alone did not, and structurally cannot, satisfy the role
  result.
- **Nothing automatically observed the real process's actual output or
  reported a role result.** `POST /workflow-runs/:id/result` had to be
  called manually (by this evaluator, simulating what some other actor
  would have to do) before `roleDisposition` became `"succeeded"`. No file
  in the diff between `6e5ff54` and `33fa7c4` (confirmed:
  `src/workflow-backend.ts`, the actual process-spawning adapter, has zero
  changes) adds any mechanism that inspects real provider output and
  determines/reports the semantic outcome on its own. This directly
  confirms **AC33 FAIL**: a real, successfully-sandboxed, successfully
  completed governed role did **not** reach its semantic outcome without an
  external actor manually translating the raw process result into the
  Harness-specific `/result` call — the same class of manual bridging the
  brief's central question asks Harness to eliminate, now moved one layer
  down (from "type `/evaluator repair`" to "manually POST a JSON result")
  rather than removed. **AC34 FAIL** follows directly: Spike 011 Cycle 002
  cannot be retried "without... manual operational-state repair" (closely
  related to this same manual-bridging gap) when even a bounded,
  successful, correctly-sandboxed fixture role still needs a human to close
  the loop.
- **AC14** (machine-readable evidence distinguishable from process exit): the
  `roleResult` schema itself (`role`/`skill`/`skillVersion`/
  `verificationAuthority`/`disposition`/`reason`/`recordedAt`, validated
  against the host-owned binding before acceptance — confirmed a
  role-result claim for a *different* role/skill than the run's own binding
  is rejected, per `reportRoleResult`'s equality checks read in source) is
  genuine, real, machine-readable evidence, structurally sound and
  provider-proof. **PASS** on the narrow question of whether the evidence
  format exists and is trustworthy when produced; **AC33 is the separate,
  failing claim that it gets produced without manual intervention.**

Full stdout/stderr transcript of the live Codex fixture and both probe
scripts are preserved in this evaluator's private workspace notes (not
duplicated here to keep this result focused; available on request within the
private evaluator context).

## Regression / repository checks (TR7)

`npm test`: 62/62 passing. `npm run typecheck`, `npm run lint`,
`npm run format:check`, `git diff --check`: all exit 0, at implementation
commit `33fa7c4` / `HEAD 222fdba`. No fixture artifacts left on disk.

## Classification

**IMPLEMENTATION_FAILURE**, confirmed on independent, reproducible grounds
for: AC01, AC02, AC03, AC05, AC10, AC11, AC22, AC25, AC27, AC28, AC33, AC34,
AC35. Each was rerun in isolation (hidden cases individually via
`node --test`; probes re-executed to confirm determinism) before this
classification; evaluator, specification, and infrastructure causes were
ruled out for each (E4 additionally required — and received — an in-cycle
evaluator repair before its classification could be trusted; see
`.eval/revisions/002/repair-record.md`). This is the first and only
evaluator correction in this cycle (below the two-correction threshold).

AC08 and AC09 are **BLOCKED** for this attempt (mandated safe live-fixture
evidence not obtainable, root-caused to the confirmed AC05 defect; not a
mock-backed substitute).

All other criteria (AC04, AC06, AC07, AC12, AC13, AC14, AC15, AC16, AC17,
AC18, AC19, AC20, AC21, AC23, AC24, AC26, AC29, AC30, AC31, AC32) **PASS**.

## Terminal disposition

**FAIL.** Confirmed implementation failures on 13 mandatory criteria
(AC01, AC02, AC03, AC05, AC10, AC11, AC22, AC25, AC27, AC28, AC33, AC34,
AC35) and 2 mandatory criteria BLOCKED (AC08, AC09) preclude `PASS`. Do not
promote.
