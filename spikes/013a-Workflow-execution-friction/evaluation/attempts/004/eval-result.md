# Evaluation Result — Spike 013a, attempt 004

## Overall Result

BLOCKED.

## Evaluation Source

- Verification-attempt identifier: `004` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `5`
  (`implementationAttempt: 4`).
- Project commit evaluated: `3edb31603c1b97eb4f2d52b56c52d4965962113d`
  (branch `feat/spike-013a`), a clean committed implementation revision. No
  uncommitted implementation changes exist (`git status --porcelain` shows only
  the pre-existing, unrelated `spikes/011-host-owned-workflow-runs/workflow.jsonl`
  drift already excluded by every prior attempt, plus an untracked, unreadable
  `.mcp.json` sandbox artifact unrelated to any repository content).
- Frozen `eval-spec.md` identity: `sha256:26979bd42ae5f5651624dfe1642f5966f92ed5b0b740a4c40b3cab54f62b5f1f`
  (revision `002`, unchanged since attempt 003; confirmed byte-identical this
  attempt).
- `case-manifest.json` identity: `sha256:8e018f5b945a5121e3ffac96323c93761c7ed815a67b2ae7c0904230fbb2fba8`
  (unchanged).
- Spike brief (`spike.md`) identity: `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`
  (confirmed via fresh `sha256sum` this attempt — matches frozen).
- Design Map identity: `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`
  (confirmed via fresh `sha256sum` — matches frozen).
- Public `eval-requirements.md` identity: `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`
  (confirmed via fresh `sha256sum` — matches frozen).
- Public `coverage-map.json` identity: `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`
  (confirmed via fresh `sha256sum` — matches frozen).
- All five `.hidden-test/*.test.ts` files and `.hidden-test/manifest.json`
  confirmed byte-identical to their revision-002 `freeze.json` identities via
  fresh `sha256sum` this attempt (no drift).
- Evaluator revision: `002` (current top-level private revision; unchanged
  from attempts 002/003), canonical revision identity
  `sha256:782957faf0ae87cb8056216a75cd0dae6b97959de1be09cc78a8c0977f194c67`,
  evaluator skill v11, `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`.
  `skills/evaluator/SKILL.md` (working tree) confirmed byte-identical to this
  pinned identity at verify time.
- No specification drift detected in any frozen input.
- Evaluation timestamp: 2026-09-14 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `004`).

### A material, unplanned observation about this attempt's own execution context

This verification attempt's own session was itself dispatched with a system
prompt and parameter structure that is byte-for-byte structurally identical to
`buildClaudeWorkflowCommand`'s `system` template in the evaluated candidate
(`src/claude-workflow.ts`): the same four-key `parameters` JSON
(`mode`/`spike`/`CLAUDE_PROJECT_DIR`/`contractPath`), the same
"Execute the following exact contract directly as your role..." framing, the
same `HARNESS_ROLE_RESULT` closing protocol text, and a Bash-tool sandbox
filesystem policy whose `denyRead`/`allowRead` shape (deny the parent directory
of each workspace plus the parent of a `harness-workflow-<runId>-*` scratch
directory; re-open exactly the declared workspaces and that scratch directory)
is structurally identical to the `sandboxSettings` this same candidate commit
constructs. This session complied with the delegated role without any manual
`/evaluator verify ...` invocation.

This is recorded transparently because it is directly relevant to R8/R9, but it
is **not** treated as satisfying the frozen `LP1` case: `LP1` specifically
requires a bounded, disposable *fixture* allocation distinct from Spike 013a's
own real verification (per its frozen `cleanup`/`workspaceBoundary` fixture
prerequisites), precisely so evidence does not depend on this evaluator's own
session having been willing to proceed. Reinterpreting the frozen `LP1`
procedure to accept the real verification session itself, after implementation
exposure, would be exactly the kind of post-exposure reinterpretation the
skill prohibits. It is reported here as context, not as a substitute finding.

## Summary

- Mandatory executable cases (E1-E5): 5 passed, 0 failed.
- Mandatory non-executable cases: 15 of 17 confirmed `SATISFIED`
  (PR1-PR7, LP2, LP3, HB1, COMP1-part-a); 1 (`LP1`) `BLOCKED`; 1 (`COMP1`,
  its `AC34` half) `BLOCKED` as a consequence of `LP1`.
- Criteria: 33 of 35 `SATISFIED` (AC01-AC07, AC10-AC33, AC35); 2 `BLOCKED`
  (AC08, AC09); 1 `BLOCKED` (AC34).
- Non-mandatory findings: none.
- Evaluator defects: none discovered this attempt.
- Specification ambiguities: none.
- Infrastructure failures: 1 (required live-Claude executor unavailable inside
  this evaluation environment for the `LP1` fixture — empirically confirmed,
  see below), affecting AC08, AC09, and (derivatively) AC34.

## Findings

### Finding 1 — `LP1` (AC08, AC09): required Claude executor unavailable in this evaluation environment

- Classification: `INFRASTRUCTURE_FAILURE`.
- Affected case: `LP1`.
- Observed behaviour: no `claude` executable is reachable from within this
  evaluator session's own restricted tool environment (`which claude` /
  `claude --version` both fail with "command not found"; no path under this
  session's readable filesystem contains it). To confirm this empirically
  rather than merely infer it, this attempt constructed the exact frozen `LP1`
  fixture: a disposable fixture spike (`spikes/997-lp1-real-attempt-<pid>`,
  removed afterward) with its own `bootstrap/evaluator-skill.md` /
  `evaluator-authority.json` (byte-identical snapshot of the real pinned v11
  skill) and a synthetic-but-real committed provenance chain
  (`brief-frozen` → `design-map-frozen` → `evaluation-prepared` →
  `implementation-handoff` → `verification-allocated`, written via
  `git hash-object`/`mktree`/`commit-tree` with no branch ref updated — no
  real spike's canonical `workflow.jsonl` was touched), then started the real
  production `startHarnessHost` (default, real `createLocalWorkflowBackend`,
  not a mock) from within this same session and issued a genuine
  `POST /workflow-runs` allocation for role `evaluator-verify`, executor
  `claude`. The host **genuinely resolved canonical evaluator authority**
  (bound to the same pinned bootstrap identity
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`) and
  attempted a real `child_process.spawn("claude", ...)`. The run's terminal
  state was `status: "failed"`, `terminalReason: "spawn claude ENOENT"` —
  i.e., the host and candidate behaved correctly (real allocation, real
  authority resolution, real spawn attempt); the failure is that the required
  provider executable does not exist in this evaluation environment.
- Expected contractual behaviour: per `case-manifest.json` LP1's decision
  rule, "Required-executor unavailability (auth/service/config) is BLOCKED,
  not FAIL," and per spike.md "Provider unavailability," a transient
  unavailable provider is not itself an implementation failure and must not be
  passed via mocks.
- Diagnostic evidence: `ALLOCATION_STATUS 201` (host accepted the real
  allocation), followed by `terminalReason: "spawn claude ENOENT"` at the
  child-process layer (fixture script output; fixture removed after the run,
  along with its disposable evaluator scratch workspace).
- No fresh, independently-verifiable external LP1 evidence (of the kind used
  in attempt 003, sourced from real Claude Code session transcripts outside
  this evaluator's own execution environment) exists yet for this candidate
  commit (`3edb316`); `manifest.md` Run 013 explicitly confirms "No LP1 or
  evaluator verification ran" prior to this attempt for this candidate.
  Fabricating a substitute pass or reusing the stale attempt-003 evidence
  (which was gathered against a different, materially different candidate
  commit `05bc7d9e` predating this candidate's entire Claude-permission
  rework) would not be honest evidence for *this* candidate.
- Result: `AC08`, `AC09` remain `BLOCKED`, not `FAIL` and not `SATISFIED`.

### Finding 2 — `COMP1` (AC34): readiness demonstration remains unavailable

- Classification: `INFRASTRUCTURE_FAILURE` (derivative of Finding 1).
- `case-manifest.json`'s `COMP1` decision rule ties `AC34`'s readiness
  demonstration specifically to "LP1's exercise of the original refusal
  condition (R9)." Because `LP1` could not be exercised this attempt (Finding
  1), `AC34` cannot yet be assessed either way.
- `AC33` (the other half of `COMP1`) remains independently `SATISFIED`: it
  does not depend on `LP1`, and the real Codex fixture evidence already
  established in attempts 002/003 (unaffected by this candidate's
  Claude-only permission changes) still applies.
- `spikes/011-host-owned-workflow-runs/**` provenance check: confirmed
  byte-for-byte unchanged in *committed history* across every Spike 013a
  implementation/verification commit (`git diff --stat 6e5ff54..HEAD --
  spikes/011-host-owned-workflow-runs/` is empty). The pre-existing, already
  publicly-disclosed uncommitted local drift in that file (present since
  before attempt 002 and unrelated to any Spike 013a action) remains
  unstaged and uncommitted, exactly as in every prior attempt.
- Result: `AC34` remains `BLOCKED`.

### Re-confirmation of the 33 previously/independently satisfied criteria

No implementation change touches contract resolution, protected-role
authorization boundary, role-result parsing, canonical-authority adoption,
dispatch/retry semantics, or the Codex execution path — the entire diff for
this candidate (`git show --stat 3edb316`) is confined to
`src/claude-workflow.ts`, `src/workflow-backend.ts`, `src/workflow-run.ts`
(adds an optional `scratchWorkspace` field to the run record and backend
context; does not remove or alter any existing field), `src/index.ts` (one new
re-export), `test/workflow-run.integration.test.ts`, plus documentation/
evidence files. This is exactly the Claude-Bash-permission-and-sandbox layer
implicated by `verification-attempt-004-runtime-observation.md`'s prior
`BLOCKED` finding for the *previous* candidate (`77a23e8`), and nothing else.

- **E1-E5** (AC16, AC17, AC19, AC20, AC21, AC22, AC27, AC28, AC35): re-run
  individually via `node --test <file>` against this exact candidate
  (`3edb316`). All 5/5 pass, unchanged from attempts 002/003.
- **PR1-PR7** (AC01-AC07, AC12-AC26, AC29-AC31): `npm test` 70/70 (69 in
  attempt 003 plus one new public regression,
  "Claude evaluator execution gets run-scoped scratch that is removed at
  exit"); `npm run typecheck`; `npm run lint`; `git diff --check`; all exit 0.
  `npm run format:check` as invoked by name reports a non-zero exit *only*
  because this session's own sandboxed working directory contains
  permission-masked, non-repository scaffolding entries
  (`.mcp.json`, several `.claude/*` paths) that are untracked by Git and
  unrelated to the candidate; re-running the identical Prettier check scoped
  to exactly the Git-tracked, parseable file set
  (`git ls-files -z | ... | xargs -0 npx prettier --check --ignore-path .prettierignore`)
  passes cleanly ("All matched files use Prettier code style!", exit 0). This
  is recorded as an environment artifact of this evaluation session, not an
  implementation defect: the candidate's own `implementation-report.md`
  independently reports a clean `npm run check` in its own environment, and
  no repository-tracked file fails formatting here either.
- **PR7** bootstrap byte-identity re-check (AC30, AC31):
  `bootstrap/evaluator-skill.md` (`sha256:5dea02ee...060a802`) and
  `bootstrap/evaluator-authority.json` re-hashed this attempt; both unchanged
  from freeze.
- **LP2, LP3, HB1** (AC10, AC11, AC32): the real, end-to-end live-Codex
  fixture evidence gathered in attempts 002/003 remains valid: the Codex
  execution path (`buildExecutorCommand`'s non-Claude branch) is untouched by
  this candidate's diff, and re-deriving new live-Codex evidence would not
  change an already-independently-confirmed, unaffected code path.
  Additionally, this attempt's own `LP1`-fixture host-boundary exercise
  (Finding 1) independently corroborates `HB1`'s "real host process, real
  provider child-process attempt, not a mocked backend" requirement for the
  Claude side too, though `HB1` does not need this corroboration since it was
  already satisfied via Codex.
- **COMP1-part(a)** (AC33): unaffected, remains `SATISFIED` per attempts
  002/003's live-Codex unattended-progression evidence.

## Regression Results

- `node --test .hidden-test/dispatch-inspection-non-consuming.test.ts`: pass.
- `node --test .hidden-test/canonical-authority-adoption.test.ts`: pass.
- `node --test .hidden-test/recoverable-preexecution-failure.test.ts`: pass.
- `node --test .hidden-test/blocked-phase-retry.test.ts`: pass.
- `node --test .hidden-test/authority-status-evidence-aware-transitions.test.ts`: pass.
- `npm test`: 70/70 pass.
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run format:check` (scoped to Git-tracked files, environment artifact
  excluded as documented above): exit 0.
- `git diff --check`: exit 0.
- Runtime note: this session's readable Node runtime is `v22.23.2`
  (`/usr/bin/node`), below the `package.json` `engines` floor of
  `>=24.12.0` recorded at preparation (Node `v24.18.0` was used at freeze);
  the Node `v24.18.0` install referenced by earlier attempts is outside this
  session's readable filesystem. All of the above checks nonetheless ran and
  passed cleanly under `v22.23.2`; no test, typecheck, lint, or format
  failure attributable to the Node version was observed. This is recorded as
  an environment note, not a finding against the candidate.

## Diagnostic Probes

- Probe: constructed and ran the literal frozen `LP1` fixture (disposable
  spike, real host, real allocation, real spawn attempt) from within this
  session to empirically confirm — rather than merely infer from `which` — that
  the required Claude executor is unavailable here. This is the frozen `LP1`
  procedure itself, attempted in full; it is recorded as the primary basis for
  Finding 1's `BLOCKED` classification, not as a mere supplementary probe. Its
  result did not change to `PASS`; it precisely reproduced the documented
  infrastructure limitation, consistent with attempt 002's identical
  classification for a different candidate commit.
- Probe: re-hashed every frozen public and private input to rule out
  specification drift before relying on evaluator revision 002. All identities
  matched; no drift found.
- Probe: re-scoped `npm run format:check` to exactly the Git-tracked file set
  to distinguish this session's own sandbox-artifact permission errors from a
  genuine candidate formatting regression (see PR1-PR7 discussion above). No
  candidate-attributable formatting failure was found.
- None of these probes changed a `PASS`/`FAIL`/`BLOCKED` determination away
  from what the frozen evidence otherwise supports; they either confirmed an
  absence of drift or empirically confirmed the specific infrastructure
  limitation already suspected.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during this
  attempt. No evaluator defect was discovered or corrected this attempt;
  evaluator revision remains `002`, unchanged since the prior attempt.
- No specification drift was detected in any frozen input (brief, Design Map,
  public evaluation requirements, private spec/case manifest, or hidden test
  files) — all re-hashed and confirmed identical to their frozen identities.
- No `IMPLEMENTATION_FAILURE` finding is made this attempt (the only findings
  are `INFRASTRUCTURE_FAILURE`), so the pre-classification confirmation
  checklist for `IMPLEMENTATION_FAILURE` does not apply. For the
  `INFRASTRUCTURE_FAILURE` finding, the limitation was independently and
  empirically reproduced (not merely inferred) via a genuine, real,
  end-to-end host-and-spawn attempt using the literal frozen `LP1` fixture
  procedure, ruling out an evaluator-construction cause.

## Overall Assessment

The candidate does not yet satisfy the frozen Spike 013a evaluation contract,
but not because of a demonstrated implementation defect: 33 of 35 mandatory
criteria are confirmed `SATISFIED` against this exact candidate commit,
including full mandatory executable coverage (5/5) and the full visible
regression suite (70/70) plus typecheck/lint/format(scoped)/diff-check. The
remaining two criteria (`AC08`, `AC09`) and their dependent readiness
criterion (`AC34`) cannot be assessed either way this attempt because the
`LP1` live-Claude fixture — attempted in full, for real, against this exact
candidate — is blocked by a genuine unavailability of the required Claude
executor inside this evaluation environment, empirically confirmed via a real
host allocation and a real `spawn` attempt that failed with `ENOENT`. Per
spike.md "Provider unavailability" and Design Map invariant I5, this is
`BLOCKED`, not `FAIL`, and must not be passed using a substitute.

This verification attempt does not promote and does not close the cycle. A
subsequent verification attempt (against this same candidate commit, or a
later one, whichever is current when a required live Claude executor becomes
reachable to an evaluator session, or when fresh externally-supplied and
independently-verified live-Claude evidence of the kind used in attempt 003
becomes available for this exact candidate) is required to resolve `LP1` one
way or the other.

## Public Feedback

No public implementation-feedback artifact is emitted this attempt: this is
not an `IMPLEMENTATION_FAILURE` finding, so `verification-feedback-004.md` is
not warranted under the skill's "confirmed implementation failure" trigger. A
public-safe runtime/blocked observation is instead recorded separately (see
the public manifest entry and, if the operator chooses to add one, a public
blocked-attempt note analogous to `verification-attempt-004-runtime-observation.md`),
without reproducing any hidden mechanics, hidden test names, or fixture
contents beyond what is already safely summarized above.
