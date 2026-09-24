# Design Map — 014d Real Skill Execution and Host Contract Integration

- Frozen brief: `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`,
  `brief-frozen` at `047daacb683203bbd3ebb2bd808cff3404e60042` (verdict
  `READY`).
- Readiness clarifications M1–M3 (`feedback.md`) are resolved below. Each
  resolution either restates what the brief or repository already settles, or
  makes a bounded shared-contract decision that leaves the brief's behavior and
  scope unchanged.
- `<spike>` below means
  `spikes/014d-real-methodology-integration-extensible-skill-evolution`.

## Shared contracts

### C1 — Trusted authority N

- N is trusted-history record `sequence: 4` in
  `methodologies/harness/trusted.jsonl`:
  - manifest `sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`;
  - revision `0a3dafe8e103cc7376bdd7fae32493710613d0c0`.
- This workflow binds N as kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
  The two identities differ only by schema (see `src/kernel/trust.ts`).
- Every Evaluator Prepare, Verify and Repair execution of the 014d workflow
  itself runs under N. No role of this workflow is governed by candidate N+1.

### C2 — Promotion plan path and format (resolves the §3 path question)

- **One plan, one path.** The plan is `.eval/promotion-plan.json`, relative
  to the evaluator's private source workspace (the contract's
  `promotion.sourceWorkspace`). No compelling incompatibility exists, so the
  brief's default stands.
- **One schema definition.** `tools/archive-manifest.ts` defines and
  validates the schema, and exports that definition. The evaluator skill, the
  `evaluator-verify` contract, tests and the host-action input all refer to
  this one definition and path.
- **Existing fields stay stable.** These keep their current names and
  meanings: `schemaVersion`, `kind: "evaluator-promotion-plan"`, `decision`
  (`ELIGIBLE` | `INELIGIBLE`), `reason`, `candidate`, `evaluatorRevision`,
  `attempt`, and `artifacts[].{kind, eligible, source, destination}` with
  kinds `attempt-ledger`, `terminal-attempt` and `evaluator-revision`.
- **Additions.** Fields needed to bind the full attempt history and the frozen
  revision inventories may be added. If a new required field is added,
  `schemaVersion` must be incremented, and the utility must reject any version
  it does not support.
- **Plan identity.** The plan identity is `sha256:` of the exact persisted
  plan bytes. The archive manifest already records this as `decisionIdentity`.
- **Public reference.** A terminal `PASS` `verification-result.json` carries
  `promotionPlan: { "identity": "sha256:…", "decision": "ELIGIBLE" | "INELIGIBLE" }`.
  The identity must resolve to the real persisted plan. No request digest and
  no public-summary hash may stand in for it.

### C3 — Promotion action sequence (settled by the host)

The order is fixed:

1. persist the plan;
2. build and validate the manifest;
3. publish the sanitized checkpoint;
4. `submitResult` PASS;
5. make exactly one `requestAction(kind=promotion)` carrying the manifest's
   `candidate`, `evaluatorRevision`, `attempt` and `artifacts`.

The host enforces this order:

- `ExecutionKernel.promote` refuses an action unless a matching semantic
  result exists.
- It refuses when the destination already exists, so a second or split
  action cannot create another `promotion.json`.

Archival is complete only when the returned action has `status: "succeeded"`
and the host has recorded `promotion-recorded`.

### C4 — The 64-artifact bound is unchanged (resolves M2)

- `requestAction` keeps `maxItems: 64` (`src/executors/protocol.ts`), and no
  multi-action or bundle-unit archival is added.
- Suppose an eligible PASS expands to more than 64 mappings. That PASS keeps
  its semantic result, and the phase is truthfully incomplete (denied, refused
  or not requested). This is the brief's §3 rule for "PASS without a
  successful required action". It is not an archival.
- Where §4 allows it, recovery uses the generic forward-only
  process-exception path.

### C5 — Methodology trust-promotion binding (§4, AC10)

- `promoteMethodology(candidate, trustHistoryPath, authority)` keeps its
  signature.
- An `evaluation` of kind `trusted-methodology` must also bind:
  - `candidate`: the exact 40-hex commit that N verified;
  - `candidateMethodology`: the candidate manifest id.
- Promotion is rejected in any of these cases:
  - `candidate` differs from the promoted `revision`;
  - `candidateMethodology` differs from the manifest reconstructed at that
    revision;
  - the evaluating methodology is not the current trusted one;
  - the evaluating methodology equals the candidate.
- Existing trusted-history records without these fields stay readable and
  valid. `human-bootstrap` evaluations are unchanged.

### C6 — Orchestrator instruction provenance (resolves M1)

- **Not a role.** `skills/orchestrator/SKILL.md` is not a policy role or a
  methodology-manifest component. Adding it would change manifest identity
  and trust-gate semantics that the brief does not ask to change.
- **Provenance.** Its adopted identity is its exact bytes at the trusted
  record's `revision`. It is recorded as
  `git:<revision>:skills/orchestrator/SKILL.md` plus its `sha256:` and
  contract version.
- **Versioning.** A revision bumps the contract version and adds a
  `docs/history/skills/` entry, following the existing convention.
- **Adoption.** It is adopted through the same single human acceptance and
  trust-promotion decision as N+1. That decision's evidence must name the
  orchestrator identity.
- **Subject only before acceptance.** The candidate orchestrator is exercised
  only as a subject in the isolated fixture. It must not drive this 014d
  workflow before acceptance.
- **Runtime.** The AC02/AC03 observed run may use Codex App or Claude Code.
  The evidence must identify which runtime was used, its version and the
  model where available.

### C7 — What provider-free exercise of real skill bytes must assert (resolves M3, AC01)

Each of the eight roles must have deterministic evidence at three layers:

- **(a) Pinned bytes.** The Role Grant assignment delivers exact pinned
  skill and contract bytes, and their identities equal the policy and manifest
  entries.
- **(b) Scripted worker.** A scripted MCP worker follows the role's matrix
  row against the real kernel/host. It must produce:
  - the declared artifacts and local commit;
  - the semantic result;
  - any host action;
  - the host-owned transition;
  - the row's failure states.
- **(c) Static check.** A check against the real skill bytes confirms that
  the skill names:
  - each MCP operation its contract or matrix row requires;
  - the artifact paths it must produce;
  - its result and methodology vocabulary.

Layer (b) is labelled scripted compliance and is never reported as provider
behavior.

### C8 — Public evidence location

The candidate commits public-safe integration evidence under
`<spike>/evidence/`. It includes:

- `fidelity-matrix.md`, the human-reviewable skill ↔ contract ↔ MCP ↔
  artifact ↔ policy/transition matrix;
- the legacy-component classification required by §7;
- records of the real-provider run and the observed orchestrator run: what
  ran, versions, model and effort confirmed or unavailable, host results, and
  safe diagnostics.

Evaluator-private material never appears there.

### C9 — Stable context seam (AC12)

`workerInstructions(assignment)` in `src/executors/governed.ts` remains the
construction surface and keeps its `{ system, prompt }` result.

Take two assignments that differ only in execution-scoped values (execution
id, Role Grant id, workflow, input identities, candidate or attempt values).
For such a pair:

- their `system` strings share a byte-identical leading prefix. That prefix
  contains the full worker-protocol rules and the pinned skill and contract
  bytes;
- every execution-scoped value appears only after that prefix;
- every such value still appears in the assembled instructions.

## Design decisions

These are already settled by authoritative sources:

- **Existing grants keep N.** Role grants inside an existing workflow
  resolve the definition pinned by the grant (`src/kernel/execution.ts`).
  Only new workflow grants pass the trust gate (`assertTrustedMethodology`).
  The §4 separation therefore concerns new-grant resolution only.
- **Host owns archival.** The host alone performs byte copying, identity
  checks, `promotion.json` creation and `promotion-recorded`
  (`ExecutionKernel.promote`). The evaluator only decides eligibility and
  makes requests.
- **Continuation already exists.** `continuation` in workflow grants and host
  `#continue` already exist. §2 is orchestrator instruction and evidence
  work, not new kernel machinery.
- **Canonical gates stay.** Policy gates for As-Built (`promotion-recorded`
  required), Outcome (standard or process exception) and human
  accept/reject bindings are the canonical gates the brief calls "real".
- **Isolated fixture.** The fixture that runs the candidate evaluator (and
  candidate orchestrator) as a subject is a separate project root. It has its
  own initialized trusted history, so its trust root cannot reach the
  production candidate.

## Invariants

- A semantic result, a host-action result and a human decision are separate
  durable facts. A failed, denied or missing promotion never rewrites a
  genuine PASS, and nothing fabricates `promotion-recorded`.
- The archive utility reads only the real persisted plan. It never
  reconstructs a plan from prose or a public hash. It refuses:
  - missing or mutated sources;
  - identity mismatch;
  - partial revision bundles;
  - unsafe or duplicate paths;
  - incomplete attempt history.
- Neither non-evaluator roles nor the context shared across public roles are
  ever exposed to evaluator-private material.
- A new workflow grant binds the latest human-trusted methodology, rebuilt
  from its exact revision. Candidate working-tree bytes can neither satisfy
  that gate nor defeat it.
- Generic methodology evolution derives the configured role set from the
  candidate policy and manifest. There is no fixed generic role-name
  allowlist. Invariants specific to the eight core roles may remain, and an
  eight-role workflow still runs.
- No runtime policy, trust record or code path encodes a spike or version ID
  or a 014d-specific exception.
- The evaluator-evidence `promotion` action stays a narrow byte-preserving
  archive. Public regression recommendations never carry hidden test bytes or
  private fixtures.

## Implementation freedom

- Field names and structure for plan additions, within C2.
- Whether the verification validator enforces `promotionPlan` presence.
- How new-grant trust resolution reads N from Git objects, whether through a
  snapshot, worktree or `git show`, provided no second trusted-history store
  is added.
- How to split, name and order the stable versus volatile context internally
  beyond C9, including an optional explicit split accessor.
- The machine-readable form of the fidelity matrix, including whether it
  generates or is generated from `evidence/fidelity-matrix.md`.
- Test layout, helper modules and file names inside `<spike>/evidence/`
  other than `fidelity-matrix.md`.
- Declarative role attributes for extensibility, the ninth-role fixture's
  contents, and the format and location of public-safe regression
  recommendations. The recommendations must be documented and must not be
  consumed by any 014d role.
- Whether each legacy component is deleted or retired, following the §7
  classification.
- Repeat and interruption handling for promotion, within C3 and the
  invariants.
