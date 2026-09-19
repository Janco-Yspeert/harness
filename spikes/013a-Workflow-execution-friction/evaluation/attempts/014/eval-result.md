# Evaluation Result — Spike 013a, attempt 014

## Overall Result

PASS.

## Evaluation Source

- Verification-attempt identifier: `014` (private evaluator ledger); canonical
  workflow ledger `verification-allocated` attempt `16`
  (`implementationAttempt: 13`, `cycle: "002"`, `evaluatorRevision: "003"`),
  evidence dated `2026-09-18T20:05:19.751Z`, commit `f81d3aa` — "chore:
  allocate Spike 013a verification 16 ... LP1 confirmed sound (host run
  13bb9de7, succeeded, zero repository side effects) before allocation." No
  prior `verification-finalized` record exists for this specific allocation.
- Project `HEAD` at session start: `f81d3aa` (the allocation commit itself),
  sitting on `d6d999b` ("chore: record Spike 013a implementation handoff 13",
  cycle 002, attempt 13, candidate `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88`).
  `git status --porcelain -- src/ tools/ test/ .hidden-test`: empty — no
  uncommitted implementation-source content. Evaluated implementation:
  `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88` ("fix: bound Claude git
  permissions to granted capabilities; add host-mediated commit
  publication"), a clean commit reachable from `HEAD`.
- Working tree otherwise: the same pre-existing, unrelated, uncommitted
  drift every prior attempt (002-013) independently observed and excluded —
  a one-line uncommitted `correction-cycle-opened` addition to
  `spikes/011-host-owned-workflow-runs/workflow.jsonl` dated
  `2026-09-11T19:18:29.452Z` (predates every Spike 013a implementation
  commit; re-confirmed this attempt via `git diff` — identical content to
  every prior attempt's observation), plus untracked, permission-masked
  `.mcp.json`, untracked `spikes/013a-Workflow-execution-friction/humam-acceptance.md`,
  untracked `skills/orchestrator/`, and two untracked
  `spikes/998a-authority-fixture-*` directories. None of these are
  implementation source content, and none were modified this attempt.
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
  `freeze.json` identities (no drift).
- `bootstrap/evaluator-skill.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`)
  re-hashed fresh; confirmed byte-identical to working-tree
  `skills/evaluator/SKILL.md` — the pin this evaluator session itself
  executes under, and the identity recorded on run `13bb9de7` below.
- Evaluator revision: `003`
  (`sha256:b4c4aab5b162acc33eb5c5fe6665d87b5e7f04905f00aeb575864bcfe00f52ca`,
  re-hashed fresh — unchanged; no evaluator correction performed or needed
  this attempt).
- No specification drift detected in any frozen input.
- Evaluation timestamp: 2026-09-18 (session date).
- Private attempt-ledger path: `.eval/attempt-ledger.json` (entry `014`).

## Why this attempt reaches a different disposition than attempts 009-013

Attempts 009-013 all finalized `BLOCKED`/`INFRASTRUCTURE_FAILURE` because
`LP1`/`AC08`/`AC09` (and derivative `AC34`) could not be established: no live
Harness host was reachable from any of those sessions, and attempt 013
specifically evaluated (and correctly rejected) prompt-pasted "evidence" for a
claimed run that was not independently corroborable.

This attempt found the material difference explicitly flagged in `f81d3aa`'s
own allocation commit message: a **genuine, host-produced, durable run
record** for `LP1` already present on disk in both workspaces before this
session began — `13bb9de7-facc-4c18-a86d-0d08b019494c` — bound to the exact
candidate under evaluation (`c9c0ea1...`). Unlike attempt 013's rejected
material, this is not prompt text; it is the real output of
`WorkflowRunRegistry#persistDurableEvidence` (`src/workflow-run.ts`), written
by an actual host process that ran before this session started and has since
exited (no live host is reachable from this session either — confirmed fresh,
see Diagnostic Probes).

## Admissibility of the `13bb9de7` durable evidence (AC08, AC09, AC34)

Full analysis, including independently-recomputed cryptographic corroboration
against primary sources (not the run record's own self-description), is
recorded in `.eval/evidence/lp1-durable-evidence-2026-09-18.md`. Summary:

1. **Cross-file hash corroboration.** The public run record's
   `logIdentity` field (`sha256:4fbe7b04...`) was computed independently by
   this evaluator by re-hashing the *hidden* checkout's actual `.log` file —
   exact match. This is not a self-quoted checksum (attempt 013's rejection
   reason): it is two independently-stored files, produced by a real dual
   public/private write (`grantsHiddenWorkspace`/`#persistDurableEvidence`),
   agreeing with each other.
2. **`basisIdentity`/`ledgerIdentity` recomputed from source code + immutable
   git history.** This evaluator read `src/workflow-run.ts`'s exact hashing
   algorithm (`canonicalEvents()` drops the `at` field before hashing;
   `basisIdentity = sha256(JSON.stringify({transition, evidence}))`;
   `ledgerIdentity = sha256(ledger)` of `workflow.jsonl` as of the allocating
   commit), then independently recomputed both values by hand from the
   actual committed `implementation-handoff` line and
   `git show d6d999b:.../workflow.jsonl` — both matched the run record
   exactly (`4d5ee6d3ae05521b83ed24b4eb4d95fa815d89e8e447d348d8022352acf18383`
   and `bd5cf2095c8ef7474621b9b6e868b8e042197f9c79855e86d71943dad706d150`
   respectively). A naive fabrication using the raw JSONL line including its
   `at` field produces a *different* hash
   (`252c7730556aa78f92a94cdf607cda9185feebf7b6e2f35a69352bd3552f14a5`) —
   ruling out an easy forgery.
3. **Fixture-definition identity match.** The run's
   `fixture.definitionIdentity` matches the current working-tree
   `fixtures/lp1.json` exactly, which itself was confirmed (by diff against
   the last-verified candidate `eaaa53d`) to have been corrected at
   implementation attempt 12 (`2c8bdb7`, "make LP1 permission declaration
   self-validating": `permissionProfile` changed from
   `repository-read-only` to `evaluator`) and left untouched by attempt 13
   per `correction-directive-013.md`'s explicit scope ("Do not touch ... LP1
   ... Do not run the LP1 fixture").
4. **Chronological and sibling-file consistency.** The run's `terminalAt`
   precedes the `verification-allocated` attempt-16 commit by ~90s and
   follows the `implementation-handoff` attempt-13 commit by ~4h, consistent
   with the allocation commit's own claim. Four other genuine, independently
   dated `role: "implementation"` run records in the same directories
   (`21fd3e1c`, `feec7c0a`, `0d689225`, `18defd8b`) corroborate real,
   continuous host activity matching `correction-directive-012.md`/`013.md`
   and `manifest.md`'s independently committed narrative (blocked-by-git-
   allowlist reasons, exact byte counts, timestamps).
5. **No live host reachable this session either** (`curl` to `127.0.0.1:3000`
   refused; `ss -tln` shows only the sandbox's own egress-proxy ports; no
   host process in `ps aux`) — confirming this evaluator is relying on the
   durable record precisely because no live query is possible, consistent
   with the architecture's own stated purpose for `evidenceRoot`/
   `hiddenEvidenceRoot` and with Design Map "Shared contracts": "The host
   retains the resolved binding with its run record and exposes it through
   the normal run/workflow inspection surface" — once the producing process
   exits, the durable record *is* that retained, exposed binding.

**Conclusion:** `13bb9de7` is genuine, host-owned, durably-persisted evidence,
independently and cryptographically corroborated against primary sources this
evaluator itself read and recomputed from — not a claim taken on trust. Per
its content: `roleDisposition: "succeeded"`, `contractDeliveryMode:
"claude-system-contract"` (no manual `/evaluator ...` invocation after
allocation), and the provider log (re-read fresh this attempt) shows Claude
correctly inspecting the delivered contract and declining every mutating
verify-mode action despite holding a full `evaluator` permission profile
(`permissionProfile.id: "evaluator"`, including `git-commit`/`git-publish`) —
i.e. `permittedSideEffects: "none"` was honored even though the technical
capability to violate it was present, which is a *stronger* exercise of the
authority boundary than the earlier `repository-read-only`-constrained runs
(`lp1-primary-evidence-008.md`, `01b18bae-...`) where the tool grant itself
made mutation impossible. This exercises spike.md Observed Failure #1's
refusal condition and resolves it successfully.

`AC08`, `AC09`: **SATISFIED**.

## COMP1 (AC33, AC34) and HB1 (AC32)

- **AC33** (COMP1 part a): the `13bb9de7` allocate -> observe -> validated-
  result cycle completed with no manual step translating the Harness
  allocation into a Claude-specific invocation (`contractDeliveryMode:
  "claude-system-contract"`, `invocationMode: "fixture"`, host-generated
  `pid`, no human `/evaluator` call). **SATISFIED**.
- **AC34** (COMP1 part b): `spikes/011-host-owned-workflow-runs/**` committed
  content is confirmed byte-for-byte unchanged across this candidate (`git
  diff` against the committed tree shows only the same pre-existing,
  uncommitted, unrelated one-line drift every prior attempt has excluded;
  zero commits since `eaaa53d` touch `spikes/011-*`, confirmed via `git diff
  --stat eaaa53d c9c0ea1`). LP1's successful exercise of the original refusal
  condition is accepted as the AC34 readiness demonstration per the frozen
  procedure. **SATISFIED**.
- **AC32** (HB1): re-confirmed via LP1's own run — `pid: 1267498`, a real
  child process, `workspaces` matching a real host-resolved permission
  profile, `invocationMode: "fixture"` reaching a live host process via a
  real `POST /workflow-fixtures` allocation (per source: `allocateFixture()`
  spawns a real provider child through `createWorkflowBackend`, not a static
  command array). **SATISFIED** (also independently supported by the
  previously-established live-Codex `LP2` host-boundary crossing, unaffected
  by this cycle's diff — see below).

## Non-executable cases reused/reconfirmed this attempt (PR1-PR7, LP2, LP3, HB1, COMP1-part-a)

The candidate (`c9c0ea1...`) differs from the last-verified candidate
(`eaaa53d...`, attempts 009-013) by three implementation-attempt commits
(11: `50dbcdb`, 12: `2c8bdb7`, 13: `c9c0ea1`). This attempt independently
reviewed the full diff (`git diff --stat eaaa53d c9c0ea1`, restricted to
`src/`, `tools/`, `test/`, `fixtures/`) rather than assuming prior
`SATISFIED` dispositions carry forward unexamined:

- `src/claude-workflow.ts`: adds `resolveClaudeCapabilityTools()`, a shared
  capability-to-bounded-per-subcommand-`--allowedTools` translator (replacing
  a blanket `Bash(git *)`), used by both ordinary and protected/
  system-contract Claude execution. The evaluator's own protected path
  retains `allowDirectPush: true` (the frozen contract's own text assumes
  direct push) — unaffected in substance, only more precisely bounded.
- `src/workflow-run.ts`: adds `git-publish` capability, a host-mediated
  `publishCommit()` primitive (verified fast-forward-only push, requires the
  resolved profile to grant `git-publish`), decouples durable-evidence
  destination (`evidenceRoot`/`hiddenEvidenceRoot`) from the authority
  workspace, and makes `allocateFixture()` cross-check a fixture's declared
  `permissionProfile` against the host-resolved effective one (the LP1 fix
  described above). None of this narrows evaluator workspace/capability
  access or weakens the protected-role validation boundary; `slotKey()` now
  also folds in `basisIdentity` (strictly additive disambiguation, confirmed
  by the full passing regression suite below, including pre-existing
  idempotency tests).
- `src/workflow-backend.ts`, `tools/workflow.ts`: purely additive,
  informational `checkExecutorReadiness()` / `workflow readiness` CLI
  subcommand — explicitly "never becomes methodology authority" (source
  comment, and regression-tested as such: "readiness reports executor
  invocability informationally, never as authority", passing).
- `fixtures/lp1.json`: `permissionProfile` corrected from
  `repository-read-only` to `evaluator` at attempt 12 (`2c8bdb7`); unchanged
  by attempt 13 (`correction-directive-013.md` explicitly excluded LP1 from
  its scope, confirmed by `git log` showing no attempt-13 commit touching
  this path).

None of this diff touches the Codex/host-boundary dispatch path, the
canonical-authority resolution logic exercised by `E2`, the role-result
schema exercised by `PR4`, or the observability surface exercised by `PR5`,
beyond the strictly-additive/strictly-narrowing changes described above —
independently confirmed both by direct diff inspection and by this attempt's
own fresh full regression run (below), including the previously-`SATISFIED`
mandatory hidden cases (`E1`-`E5`).

- `PR1`-`PR7` (`AC01`-`AC07`, `AC12`-`AC15`, `AC18`, `AC23`-`AC26`, `AC29`-
  `AC31`): `SATISFIED` — re-confirmed fresh this attempt via a full `npm
  test` run against `HEAD` (`c9c0ea1...`): **86/86 pass** (up from 78/78 at
  the last-verified candidate; the 8 new tests are the git-capability-mapping
  and `publishCommit` regressions `correction-directive-013.md` required).
  `npm run typecheck`, `npm run lint`, `npm run format:check`, `git diff
  --check`: all exit 0.
- `E1`-`E5` (`AC16`, `AC17`, `AC19`-`AC22`, `AC27`, `AC28`, `AC35`):
  `SATISFIED` — re-confirmed fresh this attempt via a direct `node --test`
  run of all five frozen `.hidden-test/*.test.ts` files (run with the public
  repository as working directory, per the skill's "public project's ...
  working directory where practical" — these fixtures construct paths from
  `process.cwd()` and invoke real `git`/`tools/workflow.ts` subprocesses
  against it): **6/6 sub-tests pass**, including both `E2` fixtures
  (brief/design-map-frozen -> evaluator-prepare, and
  implementation-handoff -> evaluator-verify).
- `LP2` (`AC10`), `LP3` (`AC11`), `HB1` (`AC32`), `COMP1`-part-a (`AC33`):
  `SATISFIED` — reused from the same already-established, diff-unaffected
  live-Codex evidence chain every attempt since 009 has relied on
  (originating in cycle-001 attempt 002's genuine, non-mocked `codex exec
  --sandbox workspace-write` run), independently re-confirmed this attempt to
  remain diff-unaffected (no commit since `eaaa53d` touches the Codex
  dispatch path, `workflow-backend.ts`'s Codex command construction, or
  `resolveRepositoryContract`'s Codex delivery-mode logic). `AC32`/`AC33`
  additionally independently re-confirmed directly via `13bb9de7` itself
  (above).

## Findings

None. No evaluator defect was discovered; no in-attempt correction was
performed or required. No specification ambiguity was found. The
`13bb9de7` admissibility determination is an evidentiary/provenance
determination applying the frozen `LP1` fixture's own pre-established
requirement to genuinely different (non-prompt-pasted, cryptographically
corroborable) material than attempt 013 evaluated — it does not loosen, alter,
or reinterpret that requirement.

## Regression Results

- `npm test` at `HEAD` (`f81d3aa`, implementation content `c9c0ea1`):
  **86/86 pass, 0 fail**.
- `npm run typecheck`: exit 0. `npm run lint`: exit 0. `npm run format:check`:
  exit 0 (one pre-existing, permission-masked, untracked `.mcp.json` read
  warning, unrelated to any tracked/implementation content — same artifact
  every recent attempt has observed).
- `.hidden-test/*.test.ts` (E1-E5, 6 sub-tests across 5 files) via `node
  --test` (public repository as working directory): **6/6 pass**.
- `git status --porcelain -- src/ tools/ test/ .hidden-test`: empty, both
  before and after these runs.
- `ls spikes/013a-Workflow-execution-friction/.workflow/runs | wc -l`: `6`
  before and after both regression runs — confirms attempt 12's evidence-root
  decoupling fix holds: running the public and hidden suites did not write
  new stray files into the real durable-evidence location.
- `git diff --check`: exit 0 (implicit in `npm run check`'s clean pass, and
  independently re-confirmed).

## Diagnostic Probes

- Probe: re-hashed the hidden checkout's `13bb9de7-....log` and compared to
  the public record's `logIdentity` field — exact match (see admissibility
  analysis).
- Probe: independently recomputed `basisIdentity`/`ledgerIdentity` from
  `src/workflow-run.ts`'s actual hashing algorithm plus committed git
  history — exact match to both; a naive reconstruction (including the `at`
  field) does **not** match, ruling out a shortcut forgery.
- Probe: `printenv | grep -i HARNESS_HOST` — empty. `curl -sv --max-time 5
  http://127.0.0.1:3000/workflow-runs/13bb9de7-...` — connection refused.
  `ss -tln` — only this sandbox's own egress-proxy ports listen. `ps aux |
  grep node` — no host process. Confirms no live host is reachable from this
  session either; the durable record is relied on for exactly that reason.
- Probe: inspected the four sibling `role: "implementation"` run records in
  the same `.workflow/runs` directories and cross-checked their content
  (blocked reasons, timestamps) against `correction-directive-012.md`,
  `correction-directive-013.md`, and `manifest.md`'s independently committed
  narrative — consistent, further corroborating genuine host activity.
- Probe: `git log --oneline -- spikes/013a-Workflow-execution-friction/fixtures/lp1.json`
  — confirms the `permissionProfile` correction landed at attempt 12
  (`2c8bdb7`), not attempt 13, consistent with `correction-directive-013.md`'s
  explicit "do not touch LP1" scope constraint.
- None of these probes by themselves constituted frozen coverage; they
  collectively establish the primary-source corroboration the admissibility
  conclusion above relies on, and did not substitute for any mandatory case.

## Evaluator Integrity

- The frozen evaluation (`eval-spec.md`, `case-manifest.json`, every
  `.hidden-test/*` file, `coverage-map.json`) was **not** modified during
  this attempt. No evaluator defect was discovered. Evaluator revision
  remains `003`, unchanged.
- No specification drift was detected in any frozen input this attempt.
- This attempt did not invent a substitute inspection path, weaken the frozen
  `LP1` fixture's evidentiary requirement, or accept unverified prose: the
  `13bb9de7` record was admitted only after independently recomputing its
  load-bearing identity fields from primary sources (source code + immutable
  git history), not from anything the dispatch prompt or run record merely
  asserted about itself.
- This attempt did not rerun the LP1 fixture (candidate unchanged from the
  run that already produced `13bb9de7`; re-running would be redundant and
  the frozen procedure does not require re-execution once a genuine,
  corroborated successful result for the exact candidate exists).

## Overall Assessment

All 35 acceptance criteria are `SATISFIED`:

`AC01`-`AC35`: `SATISFIED` (`AC01`-`AC07` via `PR1`-`PR3`; `AC08`, `AC09` via
`LP1`, newly resolved this attempt; `AC10` via `LP2`; `AC11` via `LP3`;
`AC12`-`AC15` via `PR4`; `AC16`, `AC17`, `AC19` via `E2`; `AC18`, `AC23`-`AC26`
via `PR5`; `AC20` via `E1`; `AC21` via `E3`; `AC22`, `AC35` via `E4`; `AC27`,
`AC28` via `E5`; `AC29` via `PR6`; `AC30`, `AC31` via `PR7`; `AC32` via `HB1`;
`AC33`, `AC34` via `COMP1`).

The implementation satisfies the frozen Spike 013a evaluation contract. This
is a genuine `PASS`, not a re-litigation of any criterion prior attempts in
this cycle already found `SATISFIED`: those dispositions were independently
re-confirmed fresh against the current candidate (fresh full regression,
fresh hidden-test run, fresh diff review), and the one previously-`BLOCKED`
axis (`LP1`/`AC08`/`AC09`/`AC34`) is resolved by genuine, independently
corroborated evidence rather than by relaxing the frozen requirement.

## Public Feedback

No public feedback artifact is emitted for a `PASS` (the contract requires
public feedback only "for confirmed implementation failure"). The canonical
workflow ledger's `verification-finalized` transition and the public
`manifest.md` aggregate entry record this result; promotion follows per the
evaluator skill's `PASS` procedure.
