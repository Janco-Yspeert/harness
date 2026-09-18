# As-Built — Spike 013a Deterministic Workflow Execution and State Adoption

## Inspected revision and evidence

- Final implementation revision: `c9c0ea1d027f0e31558efde15a08e5d3a0ee5a88`
  ("fix: bound Claude git permissions to granted capabilities; add
  host-mediated commit publication"), cycle `002`, implementation attempt
  `13`.
- Frozen brief: `spike.md`,
  `sha256:e11f7c8549d7a54162b8bf08698d1aa20e077aedf649f59f456eba9b135b60ac`.
- Frozen Design Map: `design-map.md`,
  `sha256:c6fe65488748b22c2e819a1b7aa6115d7fd7c3723835e0721e8673554f93b407`.
- Public `eval-requirements.md`,
  `sha256:59a4c69a1da9d3fa77a4d4557509499396d027021a5c14ac3c17784ee4f45fbf`,
  and `coverage-map.json`,
  `sha256:eb4921e8c87d47c35d16f8fc90ad5192526327b4fe6e4517f08ae0faba1ad0a4`.
  All four hashes were recomputed directly from the working tree and match
  both the promoted evaluation's recorded identities and each other.
- Promoted final verification: pinned evaluator `v11`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  evaluator revision `003`, private attempt `014` / canonical
  `verification-finalized` attempt `16`, `PASS`, all 35 acceptance criteria
  `SATISFIED`. The promotion preserves all fourteen private attempt results
  and both evaluator revisions' frozen bundles under `evaluation/**`
  (`evaluation/promotion.json`, `passingAttempt: "014"`).

## Built shape

### Execution binding and contract resolution

Before launching any provider, the host resolves one immutable execution
binding for the workflow-run: workflow/spike, methodology phase and
attempt/cycle, role, executor, and the repository contract that governs the
role. Every supported role resolves deterministically to a contract path,
version, and SHA-256 content identity; caller-supplied contract aliases are
accepted only as compatibility hints and are always re-resolved against the
canonical repository content rather than trusted. The resolved binding
records one of three delivery modes — `host-directed-repository-load`,
`host-directed-pinned-snapshot`, or `claude-system-contract` — so the
inspection surface can show independently of provider prose how the contract
reached the executor. A caller cannot construct or widen this binding by
supplying fields or prompt text; the host always re-derives it.

### Delegated authority and evaluator protection

Delegated evaluator authority is derived generically from the requesting
workflow's own canonical `workflow.jsonl` ledger and committed
evaluator-preparation provenance, not from a hardcoded list of workflow IDs
(`resolveSpike012VerificationAuthority`'s Spike-012-only precedent is now
generalized). A request cannot obtain evaluator authority by asking for it,
embedding authoritative-sounding prompt text, or supplying a role/skill name;
only a mechanically valid Harness evaluator-role allocation, or an explicit
separate human-invocation path, can trigger the protected evaluator contract.
`disable-model-invocation` protection is unchanged and global.

### Semantic role result

Provider commands receive the resolved binding and a small, provider-neutral
stdout result protocol (`HARNESS_ROLE_RESULT`). On a clean process exit, the
local backend parses one final structured line and turns it into a
host-validated semantic result bound to the run's own role, methodology
attempt, and contract authority; ordinary prose, missing markers, or
malformed/extended markers remain diagnostic only and leave the run
`pending`. Process lifecycle (`pending`/`running`/`completed`/etc.) and role
disposition (`succeeded`/`blocked`/`refused`/...) are independently tracked
fields on the run record; only a validated `succeeded` disposition can
satisfy a governed workflow prerequisite.

### Retry and adoption

A terminal non-successful run can be retried in the same host slot: the new
run gets its own `executionAttempt` and a `previousExecutionId` link, while
the prior run remains inspectable and unmodified — this now applies uniformly
across phases, not only to the evaluator path. Run-slot identity additionally
folds in the resolved allocation's `basisIdentity` (the SHA-256 of the exact
canonical ledger event) when the caller's `allocationAuthority` carries one,
so two distinct canonical allocations that happen to target the same
methodology attempt no longer collapse onto one slot and silently rebind to a
stale prior run; ordinary, non-protected allocations are unaffected.
`tools/workflow.ts` adopts already-valid canonical brief/Design-Map/
evaluation-preparation checkpoints into local operational state as one
inspectable, explicit adoption fact, then derives the next eligible phase
from canonical authority — it never fabricates missing historical dispatches.
Planning/inspection is read-only and does not consume an execution attempt;
operational history begins only once a host allocation is genuinely
committed.

### Observability and authority status

`workflow status`, `workflow dispatch`, and `workflow authority status`
expose, without requiring the caller to parse `.workflow` or
`workflow.jsonl` directly: the created run identity, allocated role and
executor on dispatch; process state and semantic role disposition together;
the resolved contract identity and delivery mode; and, for authority status,
a `transitionAvailability` list that distinguishes `unavailable`,
`available`, and `available-requires-evidence` per transition — so an
evidence-bearing transition such as `correction-cycle-opened` remains
discoverable as available even before its evidence is supplied, instead of
disappearing behind a bare boolean.

### Durable, host-owned run evidence

`WorkflowRunRegistry` now writes a durable record to disk on every terminal
disposition, reusing the existing `<spike>/.workflow/` convention. Which side
of the public/private split a run's evidence lands on is derived generically
from the *resolved* permission profile's own `harness-hidden`-sibling grant
(`grantsHiddenWorkspace`), never from spike name, role name, or provider
identity: a profile that never reaches the hidden sibling is durable in full
at the public location; a profile that does (currently only the evaluator
profile) has its full record and raw log written only under the mirrored
private location, while the public side receives a sanitized manifest (full
record with `roleResult.reason` cleared) plus a `logIdentity` SHA-256 of the
private log, letting the two be linked without exposing private content. The
public/private write roots are host-process configuration
(`HARNESS_EVIDENCE_ROOT`/`HARNESS_HIDDEN_EVIDENCE_ROOT`, mirroring the
existing `HARNESS_EVALUATOR_WORKSPACE` seam) rather than always derived from
the run's own workspace, so tests and alternate deployments can redirect
evidence writes without changing which workspace canonical authority and
contracts are read from; unconfigured behavior still defaults to the run's
own workspace, byte-identical to the original shape.

### Bounded live-provider fixtures

A bounded candidate-commit fixture allocation (`POST /workflow-fixtures`)
accepts only workflow, fixture name, an exact candidate commit, and an
optional inspection-only parent correlation; it loads `fixtures/<name>.json`
from that exact commit, requires the commit to be the current canonical
implementation handoff, validates frozen public artifacts and (for protected
roles) the pinned evaluator contract, and derives role, executor,
permissions, workspace, side-effect boundary, and delivery mode itself — the
caller cannot shape any of that. `allocateFixture` cross-checks a fixture's
declared `permissionProfile` against the profile the host actually resolves
and rejects the allocation on mismatch, so a fixture cannot describe a
narrower effective capability than Harness actually grants it.
`fixtures/lp1.json` (repository-owned) declares the LP1 scenario: a Claude
`evaluator-verify` execution bound to pinned evaluator `v11` via
`claude-system-contract`, the real `evaluator` permission profile (matching
the frozen contract's requirement to use the evaluator's actual required
workspace/access), and `permittedSideEffects: "none"`. The equivalent
live-Codex host-boundary scenario (`LP2`) and the third live-provider
regression (`LP3`) are established and durably corroborated evidence in the
promoted evaluation but are evaluator-owned/private fixtures, not additional
public repository surface this role inspects.

### Git-capability translation and host-mediated publication

`resolveClaudeCapabilityTools()` (`src/claude-workflow.ts`) is the single
place that translates a resolved permission profile's capabilities into
actual Claude CLI permissions, used by both ordinary and protected/
system-contract execution. Granted capabilities map to bounded per-subcommand
`--allowedTools` entries — `git-inspect` → read-only git subcommands
(`status`, `diff`, `log`, `show`, `rev-parse`, `cat-file`, `merge-base`),
`git-commit` → `git add`/`git commit`, `git-publish` → `git push` (when
direct push is enabled, currently unconditional in both call sites) — never
the blanket `Bash(git *)` this replaced, which would equally have admitted
`git reset --hard`, `git push --force`, or `git branch -D` regardless of
which specific capability was actually granted. Ordinary (non-protected)
Claude execution now also passes `--setting-sources ""` and
`--permission-prompts none`, so its effective permissions are deterministic
and Harness-derived rather than dependent on the launching account's own
ambient `.claude/settings.local.json` — the gap that had left implementation
workers holding `git-inspect`/`git-commit` still blocked at their own
`git add`/`commit`/`push`. Evaluator-specific isolation (hidden workspace,
strict OS sandbox, system-prompt replacement) is unchanged and remains
exclusive to protected execution.

A new `git-publish` capability and `WorkflowRunRegistry#publishCommit(runId,
commit, branch)` primitive (exposed as `POST /workflow-runs/{id}/publish`)
let a role report a commit it already created for the host to verify and
push with its own credentials, without the role needing direct git-remote
network access itself: the host confirms the run's resolved profile actually
grants `git-publish`, that the commit exists in the run's own workspace, and
that it is a fast-forward descendant of the branch's current remote tip
(refusing anything else, so already-published history can never be
rewritten), then pushes with `git push origin <commit>:refs/heads/<branch>`
and records `{ commit, branch, pushed, at }` on the run. The currently pinned
evaluator contract's own text still assumes direct push, so evaluator and
ordinary Claude execution both still also receive the direct, bounded
`Bash(git push *)` grant when `git-publish` is present; host-mediated
publication is an additional primitive, not (yet) evaluator's only path.

## Lifecycle and boundaries

- Execution bindings and run records are host-process-memory state, durable
  to disk on terminal disposition at a location that is host configuration
  (default: the run's own workspace); daemon-restart in-memory persistence
  beyond that durable record is not introduced.
- Canonical workflow authority (`workflow.jsonl`) and runner/host operational
  history remain separate, append-only sources; adoption, retries, and
  durable-evidence writes add facts, they do not rewrite either history.
- A run's public/private evidence split is a mechanical function of its
  *resolved* permission profile's hidden-workspace grant; ordinary,
  non-evaluator runs gain no new read access to `harness-hidden`, and
  `publishCommit` neither reads nor grants access to it.
- Fixture allocation exposes no caller-shaped worker command, provider
  choice, evaluator authority, contract, or side-effect grant; every one of
  those is host-derived from the exact candidate commit's own fixture
  definition.
- `publishCommit` accepts only an exact 40-character lowercase commit SHA and
  a branch name; it performs exactly one verified fast-forward push and nothing
  broader (no arbitrary remote-command surface).
- The structured `HARNESS_ROLE_RESULT` provider-result envelope remains
  intentionally small; provider output that omits or malforms it cannot
  advance methodology.

## Frozen-contract comparison

- **Missing** — none observed. All 35 acceptance criteria are `SATISFIED` in
  the promoted evaluation, including the previously-`BLOCKED` AC08/AC09/AC34
  (live Claude LP1 evidence and Spike 011 recovery readiness), which this
  final candidate's durable-evidence mechanism (built in implementation
  attempt 11, unaffected by attempt 13) made independently corroborable.
- **Contradictory** — none observed.
- **Extra** — none material beyond implementation freedom the Design Map
  already reserves. Two items are worth naming explicitly as selected
  implementation, not additional product surface beyond the frozen contract:
  - The host-mediated `publishCommit` primitive and `git-publish` capability
    were introduced to fix real, repeatedly observed publication friction
    (implementation attempts 11 and 12 both required manual orchestrator
    completion of their own commit/push). The frozen brief does not name Git
    publication mechanics at all; this is bounded, additive infrastructure in
    service of "does not require repeated human authorization" and "the
    execution path can reach its semantic outcome without requiring the human
    to translate that allocation into provider-specific invocation
    instructions" (AC33), not a new required behavior beyond it.
  - `checkExecutorReadiness()`/`workflow readiness [codex|claude]` is a small,
    informational-only executor-availability probe that touches no canonical
    authority, `.workflow` state, or run allocation; it exists so repeated
    dispatch is not wasted against an already-diagnosed unreachable executor
    and is not itself part of any acceptance criterion.
