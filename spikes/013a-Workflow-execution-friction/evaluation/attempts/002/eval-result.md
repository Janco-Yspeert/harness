# Evaluation Result — Spike 013a, attempt 002

## Identity

- Attempt: `002`
- Implementation: `git:05bc7d9e47d58f35734c8e158eafd43b153e38e2`
  ("implementation retry", implementation attempt 2), canonically recorded by
  `implementation-handoff` (attempt 2) in
  `spikes/013a-Workflow-execution-friction/workflow.jsonl` at
  `HEAD 0a70328` (a follow-up commit that only appends that authority record;
  no source changes — confirmed via `git show --stat`).
- Evaluator revision used: `002` (unchanged from attempt 001), identity
  `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`.
  No evaluator correction was needed this attempt.
- Governing evaluator skill confirmed byte-identical, at verify time, to:
  `spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md`,
  `git show fae05912f59f8ebdb8982ab16deb26e293754647:skills/evaluator/SKILL.md`,
  and the working-tree `skills/evaluator/SKILL.md` — all three
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
  No binding failure.

## Step 1 — Immutable inputs

All frozen public inputs (`spike.md`, `design-map.md`, `eval-requirements.md`,
`coverage-map.json`, `bootstrap/evaluator-skill.md`/`evaluator-authority.json`)
confirmed byte-identical at implementation commit `05bc7d9e` to their frozen
identities. All private evaluator revision `002` artifacts (`eval-spec.md`,
`case-manifest.json`, `.hidden-test/manifest.json`, all five hidden test
files, `.eval/freeze.json` self-identity) confirmed byte-identical to their
frozen identities. No `SPECIFICATION_DRIFT`.

Re-confirmed the same pre-existing, uncommitted, out-of-scope working-tree
modification to `spikes/011-host-owned-workflow-runs/workflow.jsonl` noted in
attempt 001 is present, byte-identical to before (same timestamp, same
content), and untouched by this implementation attempt or this verification.
`git diff 33fa7c4 05bc7d9e -- spikes/011-host-owned-workflow-runs/` and
`git diff 6e5ff54 05bc7d9e -- spikes/011-host-owned-workflow-runs/` both
produce no output — no commit in this entire cycle touches Spike 011.

## Step 2 — Frozen evaluation results

### Executable hidden cases (revision 002, unchanged)

| Case | Criteria | Result |
| --- | --- | --- |
| E1 `dispatch-inspection-non-consuming` | AC20 | **PASS** |
| E2 `canonical-authority-adoption` | AC16, AC17, AC19 | **PASS** |
| E3 `recoverable-preexecution-failure` | AC21 | **PASS** |
| E4 `blocked-phase-retry` | AC22, AC35 | **PASS** (was FAIL in attempt 001) |
| E5 `authority-status-evidence-aware-transitions` | AC27, AC28 | **PASS** (was FAIL in attempt 001) |

All five pass; `node --test .hidden-test/*.test.ts` → 5/5. No leftover
fixture directories after the run.

### Non-executable procedures

| Procedure | Criteria | Result | Basis |
| --- | --- | --- | --- |
| PR1 | AC01, AC02, AC03 | **PASS** | Diagnostic probe + live Codex run |
| PR2 | AC04, AC07 | PASS | Unaffected, re-confirmed by regression suite |
| PR3 | AC05, AC06 | **AC05 now PASS**; AC06 PASS | Diagnostic probe |
| PR4 | AC12, AC13, AC14, AC15 | PASS | Live Codex run + code inspection |
| PR5 | AC18, AC23, AC24, AC25, AC26 | **AC25 now PASS**; others PASS | Live Codex run |
| PR6 | AC29 | PASS | Unaffected |
| PR7 | AC30, AC31 | PASS | Diagnostic probe (013a pin re-confirmed) |
| LP1 | AC08, AC09 | **BLOCKED** | See below |
| LP2 | AC10 | **PASS** (was FAIL) | Live Codex fixture |
| LP3 | AC11 | **PASS** (was FAIL) | Shared code path + live Codex confirmation |
| HB1 | AC32 | PASS | Live Codex fixture |
| COMP1 | AC33 | **PASS** (was FAIL) | Live Codex fixture (LP2 alone suffices per the frozen case) |
| COMP1 | AC34 | **BLOCKED** | Frozen case ties AC34's readiness demonstration to LP1 specifically; LP1 blocked |

## What changed since attempt 001 (source-level confirmation)

Read the full diff between implementation attempts
(`git diff 33fa7c4 05bc7d9e`), focused on `src/workflow-run.ts` (508 lines),
`src/workflow-backend.ts` (75 lines), and `tools/workflow.ts` (41 lines):

- **Contract resolution is now host-derived** (`resolveRepositoryContract`):
  for ordinary roles, reads the real `skills/<name>/SKILL.md` from the
  repository, computes its identity via `sha256(content)`, and extracts the
  contract version from the file's own `Contract version:` line — not from
  caller-declared strings. A caller-declared `skill`/`skillVersion` that
  doesn't match the resolved contract is now **rejected**, not silently
  accepted.
- **Delegated evaluator authority now derives from general canonical
  authority**, not a two-entry hardcoded allowlist. `resolveWorkflowLocation`
  dynamically resolves any workflow identifier to its `spikes/` directory;
  `canonicalEvaluatorAuthority` reads that workflow's own `workflow.jsonl`,
  verifies real git provenance for `brief-frozen`/`design-map-frozen`
  (`verifyCanonicalArtifact`), and requires phase-appropriate canonical
  evidence (`design-map-frozen` for `evaluator-prepare`;
  `evaluation-prepared` + `implementation-handoff` with a matching
  `verification-allocated` commit for `evaluator-verify`; a genuine
  `EVALUATOR_DEFECT`/`evaluatorRepair` trigger for `evaluator-repair`).
- **A distinct contract-delivery-mode field** (`contractDeliveryMode`:
  `"host-directed-repository-load"` or `"host-directed-pinned-snapshot"`) now
  exists on the run record, separate from `invocationMode`.
- **Blocked-execution retry now works at the host level too**:
  `WorkflowRunRegistry.allocate()` checks the canonical run for the slot; if
  its `roleDisposition` is not `"succeeded"`, a fresh execution attempt is
  created referencing the prior as `previousExecutionId`, rather than being
  permanently blocked. `tools/workflow.ts` `attemptForDispatch()` now
  advances the attempt counter for **any** phase whose latest attempt ended
  `blocked` or `failed`, not only `implementation`/`evaluator-verify`.
- **Authority status now explicitly separates unavailable from
  available-but-requires-evidence**: `authority()`'s `status` mode now
  returns `transitionAvailability` (per-transition `available` /
  `available-requires-evidence` / `unavailable`) and includes
  `correction-cycle-opened` in `legalTransitions` whenever
  `correctionPermitted` is true, even though it fails empty-evidence
  validation.
- **Automatic semantic role-result reporting**: the executor prompt now
  embeds an explicit instruction (`executionPrompt` in
  `workflow-backend.ts`) to emit a final structured line
  (`HARNESS_ROLE_RESULT {"disposition":"...","reason":"..."}`) on completion.
  `LocalWorkflowBackend` now captures all stdout and, on a zero exit,
  extracts and validates this line (`parseWorkflowBackendRoleResult`),
  feeding it into the same host-owned role-result path attempt 001 already
  validated, without requiring a manual `/workflow-runs/:id/result` call.

## Diagnostic probes (non-authoritative, supplementary)

Same technique as attempt 001 (real `WorkflowRunRegistry` +
`parseWorkflowRunRequest` from `src/workflow-run.ts`, mock backend, no
process spawned), re-run against this implementation:

- **Contract-resolution probe**: a real skill claim is accepted with the
  correct host-derived identity; a **fabricated, nonexistent** contract
  claim is now **refused** (`"caller skill does not match the resolved
  contract"`); an omitted skill is correctly resolved by the host. Confirms
  AC01/AC02/AC03 PASS.
- **Delegation-boundary probe**: a freshly built, genuinely
  canonically-authorized, fully isolated fixture workflow (real
  `brief-frozen`/`design-map-frozen`, its own `bootstrap/evaluator-authority.json`
  pinning the real v11 evaluator skill, no relation to any real production
  spike) is now correctly **granted** delegated `evaluator-prepare`
  authority, with the run record's `allocationAuthority` showing a full
  `"type":"canonical-workflow"` binding (ledger identity, basis transition,
  basis identity, contract identity). The same fixture requesting
  `evaluator-repair` with prompt-shaped authority claims and no genuine
  trigger is correctly **refused**
  (`"canonical workflow authority does not permit evaluator-repair"`).
  Confirms AC05 PASS.
- **013a pin re-confirmation probe**: a `direct`+`humanAuthorization`
  allocation for the real Spike 013a's own `evaluator-verify` phase
  correctly resolves the pinned snapshot
  (`skill: "spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md"`,
  `skillVersion: "11"`, `contractIdentity` matching the pinned identity,
  `contractDeliveryMode: "host-directed-pinned-snapshot"`). A `delegated`
  allocation for the same phase is correctly refused at this exact moment
  because no real `verification-allocated` binding the current
  implementation-handoff commit exists *yet* (expected and correct — this
  evaluator is in the process of creating exactly that canonical record).
  Confirms AC30/AC31 remain satisfied under the generalized mechanism.

## Live fixture — bounded real Codex execution (LP2, HB1, PR1, PR4, PR5, COMP1)

Run twice for full confidence (network/process variance), both against the
**real repository root** as workspace (required this attempt: ordinary-role
contract resolution now needs real repository paths, so the executor's
sandbox necessarily covers the full repo rather than an isolated `/tmp`
fixture as in attempt 001 — flagged to and approved by the human operator
given the increased blast radius). Both runs used an explicit,
strongly-worded read-only/no-write prompt.

Second (fully captured) run: a real Harness host
(`startHarnessHost(0)`, real `createLocalWorkflowBackend`, no mocks)
allocated an ordinary `brief-readiness` role to the real `codex` executor
(`codex-cli`), workspace = real repository root. Confirmed:

- Real `codex exec --sandbox workspace-write --cd <repo root>` process
  launched (real session, real token usage) — **AC32 PASS** (genuine,
  non-static, non-mocked host-boundary crossing, confirmed a second time).
- The run record's `skill` was host-resolved to
  `"skills/brief-readiness/SKILL.md"` with a real content-derived
  `contractIdentity` and `contractDeliveryMode: "host-directed-repository-load"`
  — **AC01/AC02/AC03/AC10/AC25 PASS**.
- Codex complied fully with the bounded prompt: read only `README.md`,
  made **no file, directory, or git changes** (confirmed: `git status
  --porcelain` before and after the run is identical), and emitted exactly
  the instructed final line: `HARNESS_ROLE_RESULT {"disposition":"succeeded"}`.
- The host **automatically** parsed this and set
  `roleDisposition: "succeeded"` with a full, binding-validated `roleResult`
  object — **with no manual `/workflow-runs/:id/result` call from this
  evaluator or anyone else**, unlike attempt 001 where this step was always
  manual. This is the single most consequential change: it directly
  demonstrates **AC33 PASS** under real, live, correctly-functioning
  conditions — a real governed role reached its validated semantic outcome
  with no human translating the allocation into a provider-specific
  reporting step.
- `git status --porcelain` immediately before and after: identical (only the
  pre-existing unrelated `spikes/011` drift and, on the first exploratory
  run, this evaluator's own disposable probe fixture, both cleaned up
  afterward). No unintended repository mutation from either live run.

## Live fixture — Claude protected-role delegation (LP1, AC08, AC09): BLOCKED

The delegation-boundary probe above confirms the underlying authorization
mechanism (AC05) that blocked this scenario in attempt 001 is now genuinely
fixed, and a fully isolated, disposable fixture workflow (not real spike
012/013a state) can now legitimately receive delegated evaluator authority.
With the human operator's approval, an attempt was made to dispatch that
fixture's `evaluator-prepare` role through a real local Harness host to the
real Claude adapter (`startHarnessHost` + real `createLocalWorkflowBackend`,
`executor: "claude"`).

**This session's own tooling refused to execute it.** The Bash tool call
that would have launched `node <script that starts a real host and allocates
a role to the claude executor>` was denied by this environment's own
automatic safety classifier with reason `"Create Unsafe Agents"` — a
platform-level restriction on this evaluator's own execution environment,
not a defect, refusal, or behavior of the candidate implementation. Per the
denial's own guidance, no workaround was attempted; the human operator was
informed and the block accepted as-is.

This is functionally equivalent to "the required executor is unavailable...
because of an equivalent external failure" (spike.md "Provider
unavailability"; Design Map invariant I5): **AC08 and AC09 are BLOCKED**,
not `FAIL` and not passed via the strong deterministic and live-Codex
evidence gathered instead (which, while highly suggestive that the same
mechanism would work for Claude, is not itself the mandatory live-Claude
evidence the frozen contract requires). The root cause of this block is
categorically different from attempt 001's (there: a confirmed
implementation defect in AC05; here: a confirmed environment/session-level
restriction, external to the implementation, with the implementation's own
mechanism independently verified correct via the deterministic probe above).

**AC34** is also `BLOCKED`, not `PASS`: the frozen `case-manifest.json`
(`COMP1`) ties AC34's readiness demonstration specifically to LP1 (Claude)
exercising the original refusal condition, not to LP2 (Codex) alone. Since
LP1 could not be exercised this attempt, AC34's specific claim — that Spike
011 Cycle 002's evaluator-repair (a Claude-targeted protected role) can be
retried without manual invocation — remains unconfirmed by live evidence,
even though the general mechanism (AC05) and the Codex-side unattended
progression (AC33) are now both confirmed. Marking it `PASS` on the strength
of Codex evidence alone would exceed what this evaluator's own frozen
evidence plan for AC34 actually requires.

## Regression / repository checks (TR7)

`npm test`: 69/69 passing (up from 62 in attempt 001, per the implementation's
own added visible regression coverage). `npm run typecheck`, `npm run lint`,
`npm run format:check`, `git diff --check`: all exit 0, at implementation
commit `05bc7d9e` / `HEAD 0a70328`. No fixture artifacts left on disk after
any check.

## Classification

No `IMPLEMENTATION_FAILURE` confirmed this attempt. 32 of 35 criteria are
`SATISFIED` (30 individually confirmed correct here plus AC04/AC07/AC29
re-confirmed unaffected by regression). 3 criteria (AC08, AC09, AC34) are
`BLOCKED`, classified `INFRASTRUCTURE_FAILURE`: mandatory live-Claude
evidence could not be gathered because this evaluator's own execution
environment refused to spawn the required Claude agent process, a condition
external to and not caused by the candidate implementation.

No post-implementation evaluator correction was needed or performed this
attempt.

## Terminal disposition

**BLOCKED.** Not `PASS` (3 mandatory criteria remain unestablished by
required live evidence, not merely assumed); not `FAIL` (no criterion was
demonstrated to be unsatisfied — the deterministic and live-Codex evidence
consistently indicates the underlying mechanism is correct). Do not
promote. Resolving this attempt's block requires either running the
required live-Claude fixture from a session/environment where the platform
classifier permits it, or an explicit, durable permission change the human
operator makes to their own environment (the classifier's own denial names
this path: a Bash permission rule in settings) — not further implementation
work, and not another evaluator correction.
