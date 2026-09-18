# Correction directive — implementation attempt 12 (cycle 002)

## Authority

Explicit human root authority. Cycle `002` remains open. Current canonical
implementation handoff: attempt `11`, candidate
`50dbcdbf55e76ce53509e98bdfa46f69bb526b92`. No verification has been
allocated since that handoff. `authority status` confirms
`implementation-handoff` is `available-requires-evidence` right now. This is
implementation attempt 12: a new candidate building on attempt 11, not a
rewrite of it. Preserve all existing history — do not fabricate or backdate
anything.

This directive is root-authority input (an explicitly frozen process
exception per `skills/implementation/SKILL.md`), not public feedback from a
confirmed evaluator failure — no verification has run against attempt 11.

Two real defects were found during a pre-verification validation exercise
(running the durable-evidence mechanism from implementation attempt 11
against a real LP1 execution, across a host restart). Fix both. Do not touch
anything else. Do not run LP1. Do not allocate verification.

## Defect 1 — test execution writes synthetic durable evidence into real evidence locations

`WorkflowRunRegistry#persistDurableEvidence` (added in attempt 11) derives
its evidence write locations directly from `run.spec.workspaces[0]`
(`durableRunsDir`/`hiddenDurableRunsDir` in `src/workflow-run.ts`) — the same
`workspace` used to resolve canonical authority and repository contracts.
The public integration suite (`test/workflow-run.integration.test.ts`)
legitimately constructs many `WorkflowRunRegistry` instances against the
real repository root and the real `013a-Workflow-execution-friction`
workflow, because those tests need real canonical-ledger/pinned-authority
behavior. Before attempt 11 that was disk-side-effect-free. Now every
`npm test`/`npm run check` run writes real files into the real
`spikes/013a-Workflow-execution-friction/.workflow/runs/` and the real
`../harness-hidden/spikes/013a-Workflow-execution-friction/.workflow/runs/`.

Confirmed 9 stray public files (and their private counterparts, where
present) produced this way, all with `createdAt` timestamps on 2026-09-17
clustered at `17:47:15`, `17:48:34`, and `20:38:27`, all role
`evaluator-prepare` or `evaluator-verify`, none corresponding to any real
canonical `verification-allocated`/`evaluation-prepared` event at those
times (the real `evaluator-prepare` for this spike happened once, at spike
inception, 2026-09-11):

Public-only (no private counterpart — resolved without hidden-workspace
access):
- `113c6774-dcc3-45c1-8b51-3095ed97eeca.json`
- `5c971a57-3787-41de-899f-c5aa3d8c5a5f.json`

Public + private pair (private `.log` present but 0 bytes — no real Claude
process ever produces an empty transcript on a genuine `succeeded`/observed
disposition):
- `2e9c0b9e-96fd-451d-a343-1e799c2bf676`
- `3515c0ba-47ec-41d6-aee6-3edae9c81064`
- `40b8f081-da7f-4084-8a3c-60c181487df4`
- `4bd8e569-c302-4899-ab83-462b2e97769a`
- `6a04df2c-41e4-48ed-927e-6b1537ac50d2`
- `a4e2c4b2-2691-414e-b5c5-9736dc514c9c`
- `c62ab669-2c13-4d3d-ac32-ff8a8417160b`

**Do not trust this list blindly** — independently re-derive it (role has no
matching genuine canonical event; empty/absent private log on a
`completed`/`succeeded` record; clustered synthetic timestamps) before
removing anything. **Do not remove** the genuine LP1 evidence from this
validation exercise: `01b18bae-db12-407b-a57e-0f4cfb8869b6.json` (public),
and `01b18bae-db12-407b-a57e-0f4cfb8869b6.{json,log}` (private, private log
is 3516 bytes, a real transcript ending in a `HARNESS_ROLE_RESULT` line) —
that is real evidence from a real host-owned Claude execution and must
survive this correction untouched.

### Required architectural property

Separate *where canonical authority/contracts are read from*
(`request.workspace`, unchanged) from *where durable execution evidence is
written* (currently implicitly coupled to that same workspace). Make the
durable-evidence destination host-owned configuration — analogous to how
`HARNESS_EVALUATOR_WORKSPACE`/`HARNESS_EVALUATOR_HIDDEN_WORKSPACE` are
already host-owned, optional, read once at host process entry
(`src/index.ts`), and default sensibly when absent. Production should
default to the existing repository-relative locations when unconfigured (the
smallest coherent design); tests should be able to supply isolated temporary
public/private evidence roots while still constructing registries against
the real repository as their authority workspace.

Do not solve this with Spike-013a-specific branching, `NODE_ENV` checks,
disabling durable evidence in tests, granting test roles `harness-hidden`
access, or broad filesystem permission bypasses. This is a generic host
configuration seam, useful beyond tests (e.g. an operator who wants evidence
on a different volume).

## Defect 2 — LP1's declared permission profile does not match its effective binding

`spikes/013a-Workflow-execution-friction/fixtures/lp1.json` declares
`"permissionProfile": "repository-read-only"`, and the repository fixture
parser requires that exact string. But `allocateFixture()` in
`src/workflow-run.ts` ignores `definition.permissionProfile` when resolving
execution permissions and unconditionally resolves protected
`evaluator-verify` fixtures through the full host-owned `evaluator`
permission profile (confirmed directly: the LP1 run from this validation
exercise resolved `permissionProfile.id: "evaluator"` with `harness-hidden`
in its `workspaces`). That came from the earlier host-owned
evaluator-permission correction (implementation attempt 10 / cycle 002) and
is almost certainly the intended security architecture, not a bug to revert.

Before choosing a fix, this is what the frozen contract actually says (do
not take my word for it — confirm these yourself, they are quoted exactly):

- `spike.md`, "Claude protected evaluator delegation": the Claude scenario
  must "use the evaluator workspace/access required by the frozen evaluator
  contract."
- `design-map.md`, "Shared contracts": "The Claude fixture exercises a
  canonically permitted protected evaluator role against the pinned
  evaluator authority, with only its evaluator workspace/access and the
  fixture's declared allowed side effects."
- `skills/evaluator/SKILL.md` frontmatter `compatibility`: "The evaluator
  session must have access to the sibling `<project-name>-hidden`
  directory."
- `eval-requirements.md` contains no mention of "permission profile" or
  "repository-read-only" at all — this is not frozen public evaluation
  vocabulary; it exists only in the implementation-owned `fixtures/lp1.json`
  and its parser.

My reading: the frozen contract requires LP1 to use the real evaluator's
required workspace access (which includes `harness-hidden`), not a narrowed
repository-only profile; the fixture's write/side-effect boundary is
already carried by its separate, correct `"permittedSideEffects": "none"`
field. `"permissionProfile": "repository-read-only"` looks like a leftover
description of an earlier execution model (from before the host-owned
evaluator-permission unification), now stale and misleading rather than
semantically load-bearing. If your own independent reading of the frozen
brief/Design Map/evaluator Skill confirms this, correct the **fixture's own
representation** (`fixtures/lp1.json` and its parser/schema in
`src/workflow-run.ts` — not `spike.md`, `design-map.md`, or
`eval-requirements.md`, which are frozen and out of bounds) so it no longer
falsely claims a narrower effective capability than Harness actually binds.
Prefer the smallest honest fix: either update the declared field to
accurately describe the effective evaluator-workspace binding, or
distinguish a "requested/descriptive" field from the "resolved/effective"
one that the host always determines — your judgment, informed by what
already exists in the schema.

**Invariant to preserve, verbatim:** protected evaluator-role permissions
remain host-owned and cannot be downgraded or broadened by fixture/caller
fields, but repository-owned fixture metadata must not falsely claim an
effective capability profile different from the one Harness actually binds.

**If your own inspection instead finds that fixing this honestly would
require changing frozen evaluation semantics** (not just implementation
representation) — stop implementation, do not touch `fixtures/lp1.json`'s
semantics or the frozen documents, and report exactly what you found instead
of proceeding.

## Preserve

Do not regress: protected evaluator roles deriving effective permissions
from trusted host configuration; ordinary workers having no `harness-hidden`
access; the durable public/private evidence split from attempt 11;
`slotKey()`'s `basisIdentity`-aware deduplication from attempt 11;
append-only canonical authority; provider-neutral role/capability semantics.
Do not add evaluator networking. Do not build a database or general
artifact/evidence service. Do not unify all attempt counters. Do not touch
Spike 011, evaluator revision 003, LP1's frozen contract identity, or the
frozen `spike.md`/`design-map.md`/`eval-requirements.md`.

## Validation required

1. `npm run check` passes (typecheck, lint, format:check, full test suite).
2. Add a regression proving: a registry using the real repository as its
   authority workspace but configured with a temporary evidence root creates
   no files in the real `spikes/013a-Workflow-execution-friction/.workflow/runs`
   or real `harness-hidden` mirror.
3. Add a regression proving synthetic test evidence lands only in the
   isolated temporary root.
4. Confirm (by a regression, not just manual testing) that default/
   unconfigured production behavior still persists terminal evidence to the
   existing repository-relative locations exactly as attempt 11 built it.
5. Confirm the public/private split still depends on the *resolved effective*
   permission profile, not the request or fixture-declared one.
6. Add or update a regression establishing LP1's declared permission
   representation and its effective Harness binding are no longer
   contradictory.
7. Add a regression proving an ordinary/public test role cannot cause writes
   into the real `harness-hidden` evidence area merely by running.

Identify and remove the stray synthetic files per Defect 1 above as part of
this same candidate; report exactly what was removed, with your own
independent justification for why each one was synthetic (not just a copy
of this directive's list).

## Completion

Produce the exact candidate commit and its `manifest.md` entry per
`skills/implementation/SKILL.md`'s normal completion. If your own session's
command allowlist blocks `git add`/`commit`/`push` the way it did for
implementation attempt 11, do not bypass it — stop, leave the working tree
exactly as you left it, and report precisely what is staged/ready plus the
check results; the orchestrator will review and complete the mechanical
publish step, exactly as happened for attempt 11. **Do not run the LP1
fixture and do not allocate a new evaluator verification attempt.**
Implementation ends at a ready-to-review candidate.
