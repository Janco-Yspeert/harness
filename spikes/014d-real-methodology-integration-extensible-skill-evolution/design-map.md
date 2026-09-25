# Design Map — 014d Real Skill Execution and Host Contract Integration

- Frozen brief: `spike.md`
  `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d`,
  `brief-frozen` at `047daacb683203bbd3ebb2bd808cff3404e60042` (verdict
  `READY`).
- This map replaces the Design Map
  `sha256:f5193434bb20a2500466938305c38e835db7cd19575432af271bce47f3e2ef6f`.
  Pre-implementation recovery `d86c645e-d06c-4717-906e-439c0dfb7d83`
  invalidated that map and the Evaluator Prepare revision derived from it.
- The canonical human response `8545a0d6-a5ba-4943-bb20-e334ec356a56`
  answered request `680fdfec-ce7f-4069-9753-309b11a25d86`. It rules on the
  readiness clarifications M1–M3 in `feedback.md`. C4, C6 and C7 below apply
  that ruling. The other contracts make bounded shared-contract decisions that
  leave the brief's behavior and scope unchanged.
- `<spike>` below means
  `spikes/014d-real-methodology-integration-extensible-skill-evolution`.

## Shared contracts

### C1 — Trusted authority N

- N is trusted-history record `sequence: 4` in
  `methodologies/harness/trusted.jsonl`:
  - manifest
    `sha256:5fc66acdc6e2701ded4f729aa987b1db119845ae1bfca5f385725ba34f42ac48`;
  - revision `0a3dafe8e103cc7376bdd7fae32493710613d0c0`.
- This workflow binds N as kernel definition
  `sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`.
  The two identities differ only by schema (see `src/kernel/trust.ts`).
- Every Evaluator Prepare, Verify and Repair execution of the 014d workflow
  itself runs under N. No role of this workflow is governed by candidate N+1.
  Working-tree edits to skills, contracts or policy are candidate material, not
  N.

### C2 — Promotion plan path and format (resolves the §3 path question)

- **One plan, one path.** The plan is `.eval/promotion-plan.json`, relative to
  the evaluator's private source workspace (the contract's
  `promotion.sourceWorkspace`). No compelling incompatibility exists, so the
  brief's default stands.
- **One schema definition.** `tools/archive-manifest.ts` defines, validates and
  exports the schema. The evaluator skill, the `evaluator-verify` contract,
  tests and the host-action input all use this one definition and path.
- **Existing fields stay stable.** These keep their names and meanings:
  `schemaVersion`, `kind: "evaluator-promotion-plan"`, `decision`
  (`ELIGIBLE` | `INELIGIBLE`), `reason`, `candidate`, `evaluatorRevision`,
  `attempt`, and `artifacts[].{kind, eligible, source, destination}`, with
  kinds `attempt-ledger`, `terminal-attempt` and `evaluator-revision`.
- **Additions.** Fields that bind the full attempt history and the frozen
  revision inventories may be added. Adding any required field increments
  `schemaVersion`, and the utility rejects versions it does not support.
- **Plan identity.** The identity is `sha256:` of the exact persisted plan
  bytes, which the archive manifest records as `decisionIdentity`.
- **Public reference.** A terminal `PASS` `verification-result.json` carries
  `promotionPlan: { "identity": "sha256:…", "decision": "ELIGIBLE" | "INELIGIBLE" }`.
  The identity resolves to the real persisted plan. No request digest or
  public-summary hash may stand in for it.

### C3 — Promotion action sequence (settled by the host)

The order is fixed:

1. persist the plan;
2. build and validate the manifest;
3. publish the sanitized checkpoint;
4. `submitResult` PASS;
5. make exactly one `requestAction(kind=promotion)` carrying the manifest's
   `candidate`, `evaluatorRevision`, `attempt` and `artifacts`.

`ExecutionKernel.promote` refuses an action without a matching semantic
result, and refuses when the destination already exists. Archival is complete
only when the returned action has `status: "succeeded"` and the host has
recorded `promotion-recorded`.

### C4 — One artifact bound, retained only if a complete archive fits (human ruling on M2)

- **One bound.** Call it B. It is the single maximum number of artifact
  mappings in one `requestAction`. The worker-protocol schema
  (`src/executors/protocol.ts`, today `maxItems: 64`), the host check and the
  archive utility all use one exported definition of B. Tests refer to that
  definition, not to a literal.
- **One action per PASS.** Archival is never split across actions, never
  bundled into a unit that bypasses per-file identities, and never truncated.
  An eligible manifest with more than B mappings is refused before any copy.
  Its PASS stays genuine, and the phase is truthfully incomplete (§3).
- **Retention condition.** B stays 64 only if the evidence shows that each
  representative complete evaluator archive fits within B without truncation.
  The representative archives are:
  - the complete manifest produced by the AC05 candidate-evaluator fixture,
    which has every attempt, the attempt ledger, every frozen revision bundle
    and the plan itself;
  - a deterministic complete manifest at least as large as the largest
    committed historical archive (38 files, under
    `spikes/005-native-codex-backend/evaluation/`). It must also include the
    attempt and revision shape of `spikes/013a-Workflow-execution-friction/evaluation/`
    (14 attempts, 2 revisions).
- **Record the check.** The public evidence records B and each representative
  archive's mapping count.
- **If an archive does not fit,** the implementation raises the one definition
  of B until every representative archive fits, and records the reason in the
  public evidence. Nothing else about the action changes.
- **This spike's own archive.** Suppose 014d's own N-verified eligible archive
  still exceeds B. That remains a truthful incomplete phase. It is surfaced at
  the step-6 human acceptance and handled through the generic forward-only
  process-exception path where §4 allows it. It is never reported as archived.
- **Oversized negative case.** The oversized test uses B + 1 mappings.

### C5 — Methodology trust-promotion binding (§4, AC10)

- `promoteMethodology(candidate, trustHistoryPath, authority)` keeps its
  signature.
- An `evaluation` of kind `trusted-methodology` must also bind:
  - `candidate`: the exact 40-hex commit N verified;
  - `candidateMethodology`: the candidate manifest id.
- Promotion is rejected in any of these cases:
  - `candidate` differs from the promoted `revision`;
  - `candidateMethodology` differs from the manifest reconstructed at that
    revision;
  - the evaluating methodology is not the current trusted one;
  - the evaluating methodology equals the candidate.
- Existing trusted-history records without these fields stay readable and
  valid. `human-bootstrap` evaluations are unchanged.

### C6 — Orchestrator instruction provenance (human ruling on M1)

- **Outside trusted methodology.** `skills/orchestrator/SKILL.md` is not a
  policy role or a methodology-manifest component. It is not added to
  `trusted.jsonl`, and trust-gate semantics do not change.
- **Identity.** Each candidate revision bumps the skill's `Contract version`
  and adds a `docs/history/skills/orchestrator/` entry. It is identified as
  `git:<commit>:skills/orchestrator/SKILL.md`, plus its contract version and
  the `sha256:` of its exact bytes.
- **Before acceptance.** The candidate orchestrator is exercised only as a
  bounded test subject. It never supervises this 014d workflow.
- **Adoption.** It is adopted together with N+1, only after the final human
  acceptance. That acceptance evidence names the exact orchestrator identity.
- **AC02/AC03 evidence.** The observed-run evidence records:
  - the exact orchestrator instruction identity used;
  - the actual runtime and its version;
  - the model where available, otherwise "unavailable".

  Any runtime may be used, but only what actually ran is recorded.

### C7 — Evidence layers for real skill execution (human ruling on M3; AC01, AC02, AC05, AC13)

- **Deterministic evidence (supporting).** Each of the eight roles has
  deterministic evidence at three layers:
  - **(a) pinned bytes:** the assignment delivers exact pinned skill and
    contract bytes whose identities equal the policy and manifest entries;
  - **(b) scripted worker:** a scripted MCP worker follows the role's
    fidelity-matrix row against the real kernel and host, producing its
    artifacts, local commit, semantic result, any host action, the host-owned
    transition and the row's failure states;
  - **(c) static check:** a check against the real skill bytes confirms that
    the skill names each required MCP operation, artifact path and
    result/methodology term.
- **What it cannot replace.** This deterministic evidence supports AC01 but
  never substitutes for the brief's real integration proofs:
  - at least one real public role under a production adapter;
  - the actual candidate evaluator in the AC05 fixture;
  - the observed orchestrator run (AC02/AC03).
- **Required label.** Layer (b) is labelled scripted compliance. It is never
  reported as provider behavior.

### C8 — Public evidence location

The candidate commits public-safe integration evidence under `<spike>/evidence/`.
It includes:

- `fidelity-matrix.md`, the human-reviewable skill ↔ contract ↔ MCP ↔ artifact
  ↔ policy/transition matrix;
- the §7 legacy-component classification;
- the C4 bound record;
- the real-provider and observed-orchestrator run records, with the C6 and
  AC13 fields.

Evaluator-private material never appears there.

### C9 — Stable context seam (AC12)

`workerInstructions(assignment)` in `src/executors/governed.ts` remains the
construction surface and keeps its `{ system, prompt }` result.

Take two assignments that differ only in execution-scoped values (execution
id, Role Grant id, workflow, input identities, candidate or attempt values):

- their `system` strings share a byte-identical leading prefix containing the
  full worker-protocol rules and the pinned skill and contract bytes;
- every execution-scoped value appears only after that prefix;
- every such value still appears in the assembled instructions.

## Design decisions

These are already settled by authoritative sources:

- **Existing grants keep N.** Role grants inside an existing workflow resolve
  the definition pinned by their grant (`src/kernel/execution.ts`). Only new
  workflow grants pass the trust gate (`assertTrustedMethodology`). The §4
  separation therefore concerns only new-grant resolution.
- **Host owns archival.** The host alone copies bytes, checks identities,
  creates `promotion.json` and records `promotion-recorded`
  (`ExecutionKernel.promote`). The evaluator decides eligibility and makes the
  request.
- **Continuation already exists.** Workflow-grant `continuation` and host
  continuation already exist. §2 is orchestrator instruction and evidence work,
  not new kernel machinery.
- **Canonical gates stay.** The policy gates for As-Built (`promotion-recorded`
  required), Outcome (standard or process exception) and human accept/reject
  are the "real" canonical gates.
- **Isolated fixture.** Any fixture that runs a candidate skill as a subject is
  a separate project root. Its own initialized trust root cannot reach the
  production candidate.

## Invariants

- A semantic result, a host-action result and a human decision are separate
  durable facts. A failed, denied, oversized or missing promotion never
  rewrites a genuine PASS. Nothing fabricates `promotion-recorded`.
- The archive utility reads only the real persisted plan. It refuses:
  - missing or mutated sources;
  - identity mismatch;
  - partial revision bundles;
  - unsafe or duplicate paths;
  - incomplete attempt history.
- Neither non-evaluator roles nor context shared across public roles are ever
  exposed to evaluator-private material.
- A new workflow grant binds the latest human-trusted methodology, rebuilt from
  its exact revision. Candidate working-tree bytes can neither satisfy that
  gate nor defeat it.
- Generic methodology evolution derives the configured role set from the
  candidate policy and manifest. There is no fixed generic role-name allowlist.
  Core-role invariants may remain, and an eight-role workflow still runs.
- No runtime policy, trust record or code path encodes a spike or version ID,
  or a 014d-specific exception.
- The evaluator-evidence `promotion` action stays a narrow byte-preserving
  archive. Public regression recommendations never carry hidden test bytes or
  private fixtures.

## Implementation freedom

- Field names and structure for plan additions, within C2.
- Where the one definition of B lives, and its value if C4 requires raising it.
- Whether the verification validator enforces `promotionPlan` presence.
- How new-grant trust resolution reads N from Git objects (snapshot, worktree
  or `git show`), provided no second trusted-history store is added.
- How stable and volatile context are split, named and ordered beyond C9.
- The machine-readable form of the fidelity matrix, and whether it generates or
  is generated from `evidence/fidelity-matrix.md`.
- Test layout, helper modules, the orchestrator test-subject harness, and file
  names inside `<spike>/evidence/` other than `fidelity-matrix.md`.
- Declarative role attributes, the ninth-role fixture's contents, and the
  format and location of public-safe regression recommendations. The
  recommendations must be documented and must not be consumed by any 014d
  role.
- Whether each legacy component is deleted or retired, following the §7
  classification.
- Repeat and interruption handling for promotion, within C3 and the
  invariants.
