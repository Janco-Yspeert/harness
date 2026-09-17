# Implementation Report — Spike 013a

status: IMPLEMENTED

## Changed behavior

- Every supported workflow role is now resolved by the host to a repository
  contract path, version and SHA-256 identity. Missing caller declarations are
  filled from that resolution; invented or conflicting declarations are
  rejected. Run inspection exposes the contract identity and its
  `host-directed-repository-load`, `host-directed-pinned-snapshot`, or
  `claude-system-contract` delivery mode.
- Delegated evaluator authority is derived from the requesting workflow's own
  canonical ledger and committed artifact provenance. A workflow-owned pinned
  evaluator declaration is validated generically rather than enabled by a list
  of Spike IDs. Explicit human invocation remains a separate host-side route.
- Provider commands receive the resolved execution binding and a small
  structured result protocol. On clean process exit the local backend can turn
  a final `HARNESS_ROLE_RESULT` record into a host-bound semantic result without
  a second actor calling the result endpoint. Ordinary prose and malformed or
  extended markers remain diagnostic only.
- A terminal non-successful role run can be retried in the same host slot. The
  new run advances `executionAttempt` and links `previousExecutionId`; the old
  run remains inspectable. The runner now advances attempts after blocked or
  failed outcomes for every phase while keeping fixed-phase methodology attempt
  identity separate from execution attempts.
- Authority status includes evidence-aware transition availability. In
  particular, a repairable rejection exposes `correction-cycle-opened` as
  `available-requires-evidence` before the caller supplies that evidence.

## Consequential decisions

- Contract aliases remain accepted only as compatibility hints; the host always
  re-resolves and records the canonical repository path and content identity.
  This preserves existing callers without treating their strings as authority.
- Semantic outcomes use one provider-neutral stdout envelope described in
  ordinary context for Codex/ordinary Claude and system context for protected
  delegated Claude. The envelope carries only disposition
  and an optional reason; the host supplies and validates role, methodology
  attempt and contract authority from the immutable allocation binding.
- Canonical evaluator authorization validates committed brief, Design Map and,
  for verification, evaluator-preparation provenance before launch. This keeps
  the generalization data-driven without inventing a new authority service.

## Rejected complexity

- No provider-specific skill framework or persistent result broker was added.
  Claude has a narrow adapter for clean protected-role execution; Codex retains
  its existing repository-loading behavior.

## Tests and checks

- Added visible regression coverage for exact contract resolution and mismatch
  rejection, generic canonical evaluator delegation, explicit human evaluator
  invocation, automatic semantic-result capture, immutable linked retries, and
  provider command/result protocol behavior.
- Added runner regressions for blocked ordinary-phase retry and evidence-aware
  correction-cycle availability.
- `npm test` (69 passing), `npm run typecheck`, `npm run lint`,
  `npm run format:check`, and `git diff --check` pass.

## Limitations

- The provider result protocol deliberately requires a final structured stdout
  line. A provider that exits without emitting it remains `pending`; a clean
  process exit is still never semantic success.
- Mandatory live Claude/Codex fixture evidence remains evaluator-owned and has
  not been claimed here. This candidate reports implementation and visible
  tests, not independent evaluation.

## LP1 host-mediated fixture correction (candidate attempt 5)

The prior LP1 procedure asked a constrained evaluator shell to spawn `claude`.
That made the evaluator an accidental provider-process owner and failed when
the provider binary was intentionally absent from its PATH. The correction adds
one fixed host endpoint, `POST /workflow-fixtures/lp1`. It accepts only an
active, canonically allocated Spike 013a Claude `evaluator-verify` parent that
is bound to the pinned evaluator v11 bootstrap contract and
`claude-system-contract` delivery. Harness derives the child role, executor,
contract identity, authority prerequisite, workspaces and read-only capability
set; request fields cannot select any of them.

The child run is separately inspectable and records its LP1 identity, parent
run ID, exact contract identity/delivery mode, process state, logs and semantic
role disposition. It cannot edit files, run a shell or modify authority. The
daemon may use `HARNESS_CLAUDE_EXECUTABLE` as host-only launch configuration
when Claude is absent from the daemon PATH; that value is not sent to workers
or recorded in their bindings.

Focused regression coverage proves allocation of the fixed child, preserved
production Claude adapter and contract bytes, rejected arbitrary child-role or
provider shaping, and no worker-facing provider executable configuration.
The bounded live characterization reached host allocation and a real Claude
process launch using the host-only configured executable, but that process
exited 1 before a semantic result. Its log was intentionally not inspected by
the implementation role because it is evaluator-role output. This is not a
claim that LP1 independently passed; it is a remaining characterization
failure to be resolved before evaluator verification.

Canonical `implementation-handoff` is intentionally not recorded for this
candidate. The protected workflow authority still has implementation attempt 4
open after a `BLOCKED` result and exposes no transition for a new attempt until
the required human correction-cycle decision exists.

### Correction — authority-status AC27 defect

That conclusion was incorrect. Full-evidence validation for implementation
attempt 5 succeeds; only `authority status` was incorrectly probing every
transition with `{}` and classifying missing required evidence as structural
unavailability. The status calculation now preserves the distinction between
structural failure and `AuthorityEvidenceRequiredError`, reporting the latter
as `available-requires-evidence` for every transition that uses the common
evidence reader. The pre-existing correction-cycle classification remains in
place for its structurally checked, evidence-bearing route.

This correction is part of the actual attempt-5 candidate. No human rejection
or correction cycle is created.

## Correction after verification 003 (candidate attempt 3)

Claude Code remains 2.1.270, the version used by the successful clean-role
characterization supplied with the correction request. No A–E rerun or evaluator
preparation was performed.

The host captures exact contract content when resolving the existing authority,
including pinned snapshot identity/provenance checks. Only canonically validated
Claude evaluator allocations select `claude-system-contract`. Request fields
cannot populate contract content or select this mode. The adapter rechecks the
captured content identity, never reloads a contract, and delivers its unmodified
bytes inside replacement `--system-prompt` context alongside host-derived role,
project/mode/path parameters and the unchanged result protocol. Task text names
work; the CLI no longer asks delegated Claude to invoke an evaluator Skill.

The adapter uses `--safe-mode --restricted --disable-slash-commands
--strict-mcp-config --setting-sources '' --permission-prompts none
--no-session-persistence`. Safe mode excludes candidate CLAUDE.md, Skills,
commands, plugins, MCP, hooks and auto memory. Restricted file tools retain the
workspace boundary. With the evaluator profile, cwd is the declared evaluator
workspace and the candidate is an explicit additional directory. No extra
workspace is created or granted. Host-managed policy remains applicable.

Tools derive from the resolved capability set: Read/Glob/Grep for repository
reads, Edit/Write for workspace writes, Bash only with child-process and
local-computation capabilities. Write-capable profiles retain acceptEdits;
read-only profiles use dontAsk. Bash availability does not bypass permission
checks, and requests needing approval are denied. No unrestricted Bash allow,
permission bypass, native Skill invocation, or mandatory bare mode was added.
`disable-model-invocation: true` remains unchanged.

The full 69-test suite, typecheck, lint, formatting and diff checks pass. Public
regressions establish the host-to-adapter contract bytes despite post-resolution
file mutation, rejection of altered content identity, rejection/ignoring of
caller-supplied system fields, separation of task and system text, visible delivery
mode, bounded tools/workspaces, unchanged final-marker parsing, and preservation
of Codex and ordinary Claude behavior. The initial new regression failed on the
old delivery mode before implementation.

Final production-facing synthetic evidence is in
`adapter-characterization-005/`: one actual host/adapter Claude allocation read
both fresh marker tokens, returned a host-bound succeeded result and made zero
observed fixture writes. The corresponding unauthorized request received HTTP
400 with no backend launch. Candidate configuration deliberately contradicted the
audit. This is implementation evidence, not independent acceptance evidence.

LP1 still needs to falsify full pinned evaluator-contract execution, resolution
of the original refusal condition, required evaluator side effects and permission
sufficiency. In particular, restricted mode and unattended permission denial do
not promise every test/build/Git operation will be automatically approved. The
synthetic role required reads, not those operations. No evaluator verify,
promotion, evaluator revision 002 change, LP1 execution, or provenance-debt repair
was performed. The pre-existing Spike 011 ledger edit was preserved and excluded.

## Correction after verification attempt 004 (implementation attempt 4)

The remaining Bash denial was a provider permission composition defect. The
adapter exposed Bash through `--tools`, but `acceptEdits` does not approve
general git/npm/code execution and `--permission-prompts none` turns every
remaining prompt into an automatic denial. Neither `--restricted` nor
`--add-dir` confines Bash filesystem reads, and command allow rules or auto mode
without a sandbox permitted an out-of-bound `git -C` probe.

Protected Claude evaluator execution now combines two host-derived layers. A
capability-derived `--allowedTools` set authorizes bounded command families for
Git, npm/npx, Node and Python without granting bare Bash. Claude's strict native
OS sandbox then enforces the actual boundary: sandbox startup is mandatory,
sandboxed Bash is auto-approved, unsandboxed retry is disabled, no commands are
excluded, reads of workspace parents are denied and only the exact runtime
workspaces are re-opened. Candidate settings remain excluded and cannot widen
either layer.

The local backend adds a third, ephemeral workspace. It creates unique
run-scoped scratch, points TMPDIR/TMP/TEMP, XDG cache and npm cache into it,
exposes it separately on run inspection, and removes it at process exit.
Candidate and evaluator workspaces remain the durable permission-profile
workspaces; evaluator artifacts stay in the private workspace and scratch is
not canonical or provenance-bearing state.

Public regressions cover evaluator capabilities, the exact sandbox and command
allow settings, absence of bare Bash/bypass flags, three-workspace temp/cache
routing and cleanup, candidate configuration isolation, exact system-contract
delivery, unchanged Codex construction and unchanged semantic-result parsing.

`adapter-characterization-006/` records bounded discovery and the final real
production-adapter run on Claude Code 2.1.270. Repo-local `git status`, `git
diff`, `git show`, `npm test`, `npm run typecheck`, private-workspace
bookkeeping and scratch writes all ran unattended; an undeclared `/tmp` sibling
was unreadable; the host candidate stayed clean; scratch was removed; and the
host accepted the final semantic `succeeded` result. LP1 and evaluator
verification were not run.

The final `npm run check` passed with 70/70 tests, typecheck, lint and formatting;
`git diff --check` also passed. Frozen bootstrap v11 remains
`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
and the protected source Skill and bootstrap snapshot still declare
`disable-model-invocation: true`.

One penultimate full-check invocation had six Node test workers terminate and
then hung without diagnostics. It was interrupted; a clean `npm test` rerun and
the subsequent complete `npm run check` both passed 70/70. The abandoned run's
untracked synthetic authority fixture was removed before final diff review.

Strict Claude sandboxing requires Ubuntu `bubblewrap` and `socat`. The current
host lacks a system-installed `socat`; characterization used an extracted
Ubuntu package in the probe-only PATH. Production fails closed when either
dependency is unavailable. No bypass or degraded fallback was added.

## Correction after verification attempt 006 (implementation attempt 7)

Workflow location resolution now returns the canonical spike-directory name,
and `resolveSpec` stores that value in the resolved slot before slot-keying,
run inspection, or fixture authorization. The LP1 guard therefore checks only
`013a-Workflow-execution-friction`, the exact identifier emitted by
`tools/workflow.ts`; it does not accept a second LP1-specific shorthand magic
string. The existing `013a` shorthand remains an input alias at the common
location resolver and canonicalizes to the same run slot and allocation
authority as the full identifier.

The LP1 regression now creates its parent with the real runner identifier,
then allocates the same phase through shorthand and proves that Harness returns
the same run ID, canonical workflow field, and allocation-authority object.

## Standalone repository fixture correction (implementation attempt 8)

The prior `/workflow-fixtures/lp1` mechanism and its active evaluator-parent
requirement have been removed. Harness core now exposes the deliberately small
generic `POST /workflow-fixtures` operation. Its request accepts only a workflow,
fixture name, full candidate commit, and optional correlation parent run ID.
Role, executor, contract, permissions, workspaces, authority and expected result
cannot be supplied by the caller.

The fixture definition is loaded with `git show` from the exact asserted
candidate commit, rather than from mutable working-tree bytes. Harness then
canonicalizes the workflow, proves that commit is the current implementation
handoff eligible for verification, validates the protected evaluator role and
contract against the workflow's pinned canonical evaluator authority, and
allocates an ordinary host-owned run in a separate `fixture:<name>` slot. The
generic standalone prerequisite is therefore the current canonical
implementation handoff plus valid evaluation-prepared and pinned-contract
authority—not a live formal evaluator process. An optional parent is recorded
only as correlation and grants no authority.

Spike 013a owns `fixtures/lp1.json`, which fixes the LP1 identity, real Claude
executor, evaluator v11 contract, repository-read-only boundary, no permitted
side effects and required succeeded disposition. That descriptor is candidate
implementation, not a new acceptance transition or frozen evaluator authority.
Core contains no Spike 013a or LP1 identifier or launch special case.

Visible synthetic regression coverage proves standalone protected-fixture
allocation, exact candidate-byte resolution, canonical/pinned contract
validation, rejection of caller-shaped execution, rejection of a stale
candidate, and candidate-aware success evidence. The existing workflow
canonicalization regression now starts with the exact runner-emitted
`013a-Workflow-execution-friction` identifier and proves the retained `013a`
shorthand resolves to the same run and authority identity.

`npm test` passes 74/74 after one transient all-worker startup failure produced
no test diagnostics; the workflow suite and a clean full-suite rerun both
passed. Typecheck, lint, formatting and `git diff --check` also pass. The real
LP1 run is intentionally deferred until this exact candidate is committed and
recorded as the current canonical handoff, so the mechanism can validate the
same bytes it launches.
The pre-existing generic run-record assertion was updated to require the
canonical workflow identifier rather than the caller alias.

The focused regression first failed because full and shorthand requests
created distinct slots (`201` instead of duplicate `200`), then passed after
canonicalization. The complete visible suite passes 74/74, together with
typecheck, lint, formatting, and diff checks.

A real loopback Harness host then allocated a genuine canonical full-ID Claude
`evaluator-verify` parent and the fixed LP1 child through
`POST /workflow-fixtures/lp1`. Child run
`9cc0a9a8-692f-444b-99a8-839626754741` used the pinned evaluator v11 contract
identity `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`,
completed after 67,201 ms, stayed read-only, and produced a host-validated
`succeeded` semantic result. This is implementation-side live-fixture evidence,
not a claim of independent evaluator acceptance. The unrelated pre-existing
Spike 011 ledger edit remains preserved and excluded.

## Durable evidence and verification-slot correction (cycle 002, implementation attempt 11)

Correction directive: `correction-directive-011.md`, given as root-authority
input following unchanged candidate `eaaa53dc8ea487deff592f804154fd447bb26f86`
(implementation attempt 10), verified `BLOCKED`/`INFRASTRUCTURE_FAILURE` on
AC08/AC09/AC34 only at canonical verification attempts 11-15 (all other 32 of
35 criteria `SATISFIED` throughout). Root cause per the directive:
`WorkflowRunRegistry` holds run records only in host-process memory, so a
verify-time evaluator sandbox with no network path to whatever host process
ran a live fixture can never independently corroborate it — the one attempt
that did establish AC08/AC09/AC34 (implementation attempt 8, canonical
verification attempt 10, `PASS`) worked only because a human manually
committed `lp1-primary-evidence-008.md` as a public Git artifact. This
correction generalizes that shape into the host itself, plus fixes a
second, independently-identified defect in run-slot identity.

### 1. Durable, host-owned evidence, public/private split

`WorkflowRunRegistry` now writes durable evidence to disk on every terminal
disposition (`completed`, `failed`, `cancelled`, `replaced`, and backend
-creation failure), reusing the existing `<spike>/.workflow/` convention
(`<spike>/.workflow/runs/<runId>.json`) rather than a new subsystem. Which
side of the public/private split a run lands on is keyed generically off its
*resolved* permission profile — specifically, whether that profile's
workspaces include the private `harness-hidden` sibling mirror, exactly as
`resolvePermissionProfile` already computes that grant — never off spike name,
role name, or provider identity:

- A run whose resolved profile never reached `harness-hidden` (ordinary
  worker runs, `repository-read-only` fixtures, etc.) is durable in full at
  the public location.
- A run whose resolved profile did reach `harness-hidden` (i.e. the evaluator
  profile with the hidden-workspace grant) has its full record and raw log
  written only under the mirrored private location
  (`harness-hidden/spikes/<spike>/.workflow/runs/<runId>.{json,log}`,
  matching the exact sibling-mirror path `resolvePermissionProfile` already
  uses for the hidden-workspace grant itself). The public location instead
  gets a sanitized manifest — the full record with `roleResult.reason`
  cleared — plus a `logIdentity` SHA-256 of the private raw log, letting the
  two be linked without exposing content.

No database, artifact service, or evaluator network access was added; this is
a mechanical "write what the host already produced to disk on terminal
disposition," matching what `lp1-primary-evidence-008.md` already
demonstrated worked by hand.

### 2. Run-slot identity fix

`slotKey()` previously keyed only on `(workflow, phase, methodologyAttempt)`.
Two distinct canonical `verification-allocated` ledger events that happen to
target the same implementation attempt (exactly canonical verification
attempts 11-15, all against implementation attempt 10) collapsed onto one
slot; once that slot held a `succeeded` prior run, `allocate()` silently
rebound any later, genuinely new canonical allocation to the stale prior
record instead of creating its own execution. `slotKey()` now additionally
folds in the resolved allocation's `basisIdentity` when the caller's
`allocationAuthority` carries one (protected delegated allocations and
repository fixtures already compute this — the SHA-256 of the exact canonical
ledger event, so no new counter was invented). Unchanged authority for the
same slot remains idempotent; a new canonical allocation authority targeting
the same `(workflow, phase, methodologyAttempt)` now gets its own execution
without rewriting or deleting the prior one. Ordinary, non-protected
allocations (no `basisIdentity`) are unaffected and retain today's exact
retry/dedup behavior.

### 3. Executor readiness (informational only)

Added `checkExecutorReadiness()` (`src/workflow-backend.ts`) and a `workflow
readiness [codex|claude]` CLI surface (`tools/workflow.ts`) that report
whether the currently configured executor program is resolvable on this host
(via `HARNESS_CLAUDE_EXECUTABLE`/PATH lookup, no process spawn). This is
purely informational: it never touches canonical authority, `.workflow`
state, or run allocation, so repeated dispatch is not wasted on an
already-diagnosed unreachable executor. No new subsystem was introduced; kept
deliberately small per the correction directive's explicit permission to
leave this out if it grew.

### Scope discipline honored

No database, general evidence/artifact service, or evaluator network access
was added. No unification of the separate canonical/private/operational
attempt counters was attempted. No Spike 011 work of any kind — the
pre-existing unrelated `spikes/011-host-owned-workflow-runs/workflow.jsonl`
modification, `humam-acceptance.md`, `skills/orchestrator/`, and the two
`spikes/998a-authority-fixture-*` directories were left untouched and
excluded from this candidate. No evaluator rubric/semantic change was made.
The durability mechanism is expressed generically off the resolved permission
profile, not spike- or provider-specific, and grants ordinary workers no new
read access to `harness-hidden`.

### Tests and checks

Added regression coverage in `test/workflow-run.integration.test.ts`
demonstrating: the public/private durable-evidence split (an ordinary run's
full record, including `roleResult.reason`, is durable in full publicly; a
hidden-workspace-granted evaluator run's public copy is a sanitized manifest
with `roleResult.reason` cleared, its full record and raw log durable only
under `harness-hidden`, and its public `logIdentity` independently
recomputed from the private log file read directly off disk — mirroring by
hand what the evaluator did for implementation attempt 8's LP1 evidence —
after the host and registry are closed, so the assertions never depend on
live process memory); and the run-slot fix (a second, distinct canonical
`verification-allocated` event targeting the same implementation attempt as a
prior *successful* allocation gets its own fresh execution rather than being
deduplicated against the stale prior run, while repeated allocation under the
same new authority remains idempotent and the superseded run is preserved
unmodified). Added a focused CLI regression in `test/workflow.test.ts` for
the `readiness` command.

`npm run check` (typecheck, lint, `format:check`, and the full `npm test`
suite: 81/81 passing) and `git diff --check` all pass at this candidate. No
LP1 fixture was run and no new evaluator verification attempt was allocated,
per this correction directive's explicit stop condition; implementation ends
at the pushed candidate commit and its manifest entry.
