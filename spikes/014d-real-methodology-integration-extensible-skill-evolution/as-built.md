# As-Built — 014d Real Skill Execution and Host Contract Integration

## Inputs inspected

| Input | Identity | Source |
| --- | --- | --- |
| Candidate (implementation handoff) | `9169ccf7d4543c214e7b7890ee29e428a5f8c01a` | Diffed against the prepared baseline `0b55064` (Evaluator Prepare after pre-implementation recovery) |
| Frozen brief | `sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d` | `spike.md` (recomputed; matches) |
| Frozen Design Map | `sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e` | `design-map.md` (recomputed; matches) |
| Final verification | `sha256:7c30dd1f9d0ce8f135601aadeae4087688748faa789cf11f9da17a4e4c2e55bc` | `verification-result.json`: attempt 007, evaluator revision `002`, **PASS**, 13/13 criteria, `npm run check` 175/175 |
| Host promotion | `sha256:9af265620b31924d1a5cb2be13e235c40c4b49e90eb814a165d6841899862d8c` | `evaluation/promotion.json` (recomputed; matches) and ledger `promotion-recorded` `4115a86a-7208-4d7a-b6aa-9f1411775dee` |

Private evaluator material was not read. The promoted `evaluation/`
directory was read only as far as needed to identify `promotion.json`
and its artifact list, since promoted evidence is public history.

The shared working tree also has uncommitted changes to
`src/kernel/execution.ts`, `src/kernel/resolver.ts` and
`test/kernel.test.ts`. These belong to host maintenance 003 (a
recovery-scoped root authority basis). They are not part of the candidate
and are not described below as built.

## What was built

The candidate changes 50 files (+6441/−360) relative to `0b55064`. Its
shape is as follows.

### Worker context (§8, C9)

- `src/executors/governed.ts` adds `workerContext(assignment)`, which
  returns two strings:
  - `stable`: the role line, the complete worker-protocol rules, the
    pinned skill bytes and the pinned contract JSON;
  - `volatile`: execution, workflow, Role Grant, methodology, input
    identities and a pointer to the `assignment` tool.
- `workerInstructions()` keeps its `{ system, prompt }` shape. `system` is
  `stable + volatile`.
- The protocol rules gained two lines. Workers must inspect the returned
  action status, and they read detailed inputs just in time from bound
  paths.
- Coverage: `test/worker-context.test.ts`.

### Artifact bound B (C4)

- `MAX_ACTION_ARTIFACTS = 64` in `src/executors/protocol.ts` is the one
  definition of B. It is used by:
  - the published `requestAction` schema;
  - `parseWorkerRequest`;
  - `ExecutionKernel.promote`, which refuses more than B before any copy;
  - `tools/archive-manifest.ts`, which re-exports it as
    `MAX_PROMOTION_ARTIFACTS`.
- The value is unchanged at 64. `evidence/promotion-bound.md` records a
  38-mapping deterministic 013a/005-sized archive, scripted fixtures of 5
  and 8 mappings, and an AC05 fixture archive of 3 mappings.

### Promotion plan and archive utility (§3, C2, C3)

- `tools/archive-manifest.ts` is now the single schema definition:
  - `PROMOTION_PLAN_PATH = ".eval/promotion-plan.json"`;
  - `PROMOTION_PLAN_SCHEMA_VERSION = 2`, and other versions are rejected;
  - the plan is archived at the reserved destination
    `promotion-plan.json`.
- An eligible v2 plan binds:
  - the candidate (40-hex), `evaluatorRevision` and `attempt`;
  - the complete `attempts[]` history, `1..attempt`, ending with the
    terminal PASS;
  - one eligibility decision per revision, with reasons for ineligible
    revisions;
  - artifacts of kinds `attempt-ledger`, `terminal-attempt` and
    `evaluator-revision`, each with recorded identities or inventories.
- An `INELIGIBLE` plan requires a reason.
- `buildArchiveManifest` reads only the real persisted file. It refuses:
  - a missing plan, an unreadable plan or a symlinked plan;
  - an ineligible decision;
  - unsafe or escaping paths, duplicate or reserved destinations, and
    symlinks;
  - missing or mutated sources;
  - revision bundles whose file set or bytes differ from their inventory
    (partial bundles);
  - an attempt ledger that disagrees with the plan's history;
  - a manifest larger than B.
- It emits `decisionIdentity` as the `sha256` of the plan bytes.
- The kernel contract model gains an optional `promotion.plan`:
  - `methodology.ts` validates it;
  - the resolver passes it into the Role Grant;
  - `ExecutionKernel.promote` refuses a request that does not archive that
    exact plan source exactly once;
  - `promotion-recorded` then carries `planIdentity`.
- The candidate `evaluator-verify.json` declares
  `"plan": ".eval/promotion-plan.json"`.
- The candidate evaluator skill (v14) instructs this order:
  1. persist the plan;
  2. build the manifest;
  3. publish `verification-result.json` with
     `promotionPlan {identity, decision}`;
  4. `submitResult` PASS;
  5. call `requestAction(promotion)` once;
  6. report archival only on `status: succeeded`.
- The ineligible or refused path keeps the PASS and makes no request.
- The evaluator skill also defines optional public-safe
  `regressionRecommendations`.

### Trusted N resolution and trust promotion (§4, C1, C5)

- `src/kernel/methodology.ts` factors out `definitionFrom(policyPath, read)`.
- `src/kernel/trust.ts` adds `trustedDefinition()`. It builds the kernel
  definition by `git show <trusted revision>:<path>` and then passes the
  existing component-equivalence gate.
- `GovernedHost` installs `trustedDefinition` as the kernel's new
  `methodologySource`, so new Workflow Grants bind trusted N from Git
  objects regardless of working-tree bytes.
- A kernel without a `methodologySource` still reads the working tree.
- `promoteMethodology()` now also requires `trusted-methodology`
  evaluations to bind `candidate` (the exact commit) and
  `candidateMethodology` (the reconstructed manifest id). It rejects any
  mismatch.
- The existing checks for "current trusted evaluator" and "not
  self-evaluated" remain.
- `readTrustedHistory` accepts the new optional fields and still reads
  older records.
- `methodologies/harness/trusted.jsonl` is unchanged at the candidate. No
  trust promotion was performed.

### Optional-role extensibility (§5, §6)

- `ACTIVE_ROLES` is removed from `src/methodology-evolution.ts`. The role
  set comes from the manifest, and it must equal the policy's roles.
- New generic diagnostics apply to every role:
  - `ROLE_COHERENCE`: workspaces, results, a `when` condition and routed
    transitions;
  - `HOST_ACTION`: a required `promotion` or `publication` must have a
    contract action.
- Isolation is keyed on `contract.protected` or the core evaluator names.
- Implementation-feedback invariants apply only when `implementation` is
  configured.
- `diffMethodologies` reports `roles.added` and `roles.removed`.
- A disposable ninth-role candidate is exercised in
  `test/methodology-evolution.test.ts`.
- `evidence/extension-seams.md` documents:
  - the optional-role seam;
  - the regression-recommendation seam, which is consumed by no 014d role;
  - the future shared-public-context seam, which is not implemented.

### Skills, contracts and orchestrator (§1, §2, C6)

- Each of the seven role skills gained a "Harness worker protocol" section
  and a version bump. Each section names the `assignment` tool, the exact
  `submitResult` disposition and methodology vocabulary, and whether any
  host action applies. The new versions are:
  - brief-readiness v5, design-map v4, implementation v5, evaluator v14,
    as-built v4, outcome v5;
  - `docs/history/skills/**` entries for the prior versions.
- `implementation.json` adds the postcondition `manifest.md`.
- The orchestrator skill (v3) now:
  - makes Harness the default for actionable development requests in a
    Harness project;
  - obtains one grant through `POST <workflow>/grants` and then advances
    with `/continue`;
  - lists the only human-ask conditions;
  - treats stop/pause and denied capabilities as blockers;
  - adds a provenance section. It stays outside trusted methodology and is
    adopted only with N+1 human acceptance.
- `evidence/fidelity-matrix.md` and `test/skill-fidelity.test.ts` exercise
  the real skill bytes. They cover:
  - (a) pinned bytes;
  - (b) scripted MCP workers through the real host for all eight roles in
    one bounded grant, including the human gate, NOT_READY, a result
    without its artifact, and the promotion negatives (omitted,
    ineligible, oversized, wrong candidate or attempt, omitted plan,
    mutated source, duplicate delivery);
  - (c) static skill-text checks.

### Host, kernel and policy behavior changes

These were folded in under host maintenance 001/002 and the As-Built
repair.

- **Semantic BLOCKED stops continuation.** `GovernedHost` records
  `kernel.continuation-stopped` instead of retrying. The candidate policy
  removes `blocked` from every role's retry dispositions.
- **Outstanding canonical human request is a gate.** The resolver returns
  a gate for any `kernel.human-request` without a matching response. This
  check runs before successor or root-override selection.
- **Late human responses.** A response may now bind a request of a worker
  that has already terminated. It does not revive that worker.
- **Pre-implementation recovery.** This path consists of:
  - the root-only host operation `preimplementation-recovery`;
  - `ExecutionKernel.recoverPreimplementation`;
  - the ledger events `kernel.preimplementation-recovery` and
    `kernel.workflow-grant-revoked`;
  - a successor grant under the same trusted methodology;
  - `recoveryScopedEvents()`, which hides exactly the invalidated
    `design-map-frozen` and `evaluation-prepared` events from predicates
    and inputs.

  Revoked grants are denied resolution and allocation. The operation is
  unavailable after `implementation-handoff` or `verification-finalized`.
- **Committed provenance.** For committed inputs, `roleInputs` prefers
  `evidence.artifactCommit` over `evidence.commit`.
- **New policy gates:**
  - `readiness-blocked` without `brief-frozen`;
  - a current latest PASS without `promotion-recorded` and without
    `process-exception-authorized`, which is reported as archival
    incomplete.
- **As-Built v4 commits the host record.** The skill validates the untracked
  host-written `evaluation/promotion.json` against the bound promotion
  identity. It blocks on a missing file or a mismatch. Otherwise it commits
  that file alone as its own checkpoint before the As-Built checkpoint.
- **Legacy components** (§7) are classified, not deleted, in
  `evidence/legacy-classification.md`:
  - `tools/governed-claude-bootstrap.ts`, `tools/legacy-workflow.ts`,
    `src/workflow-backend.ts` and `src/claude-workflow.ts` remain;
  - `test/legacy-bridges.test.ts` asserts that no governed-path module
    references the bootstrap, legacy tools or prose result parser.

### Real-provider and observed-orchestrator evidence (§1, §2, AC02, AC05, AC13)

- `evidence/real-provider-runs.md` summarizes the committed extract
  `r3-repaired-fixture/canonical-observations.md` from an isolated fixture
  (commit `82ce3c4…`; ledger `sha256:cde838bc…`, not in this repository).
- Workers ran on the registered Claude adapter: `claude-opus-5-5`,
  provider `2.1.280`, effort unavailable.
- **R1:** Brief Readiness, Design Map, Evaluator Prepare and
  Implementation executed through the production adapter.
- **R2:** the candidate evaluator v14 produced a PASS. A promotion action
  succeeded, and `promotion-recorded` has 3 mappings (plan, attempt
  ledger, one eval result). Candidate As-Built v4 then recorded
  `as-built-recorded`.
- **R3:** the candidate orchestrator v3 was driven by `codex-cli 0.155.1`,
  with the model unavailable. It showed:
  - one grant carrying phases through As-Built;
  - a stop at the `human acceptance required` gate;
  - read-only staying read-only;
  - an explicit stop halting work.

### This workflow's own verification and archival

- Attempt 007 ran under trusted N (evaluator v13) on candidate `9169ccf`.
- The evaluator made a first promotion request, which was denied with
  "promotion outside role grant". Its second request succeeded:
  integrity `sha256:21227871…`, promotion `sha256:9af26562…`. The archive
  includes:
  - the attempt ledger;
  - attempts 001 and 004–007;
  - the freeze records;
  - the evaluator revision `002` bundle.
- It contains no `promotion-plan.json`, and `promotion-recorded` has no
  `planIdentity`. N's trusted `evaluator-verify` contract declares no
  `promotion.plan`.
- The public `verification-result.json` has no `promotionPlan` field.

## Comparison with the frozen contract

### Missing

1. **R3 blocker reporting (brief §2, fifth observed-evidence bullet; AC02/AC03).**
   There is no observed-run evidence that a missing adapter, permission
   or authority was reported as an inspectable blocker.
   `evidence/real-provider-runs.md` lists this as an open gap.
2. **R3 initiating request (brief §2, first bullet).** The observed run
   records that the supervisor used only the governed host. It does not
   record the actionable request text that was supposed to select
   Harness by default.
3. **R1 executed skill identities (AC13, C6/C7).** The real-provider
   evidence does not name the exact Brief Readiness, Design Map or
   Implementation skill bytes that the fixture workers ran. The R2 plan,
   ledger and `promotion.json` bytes stay in the fixture, so they cannot
   be recomputed from this repository.

### Contradictory

1. **C4 AC05 representative archive.** C4 describes the AC05 fixture
   manifest as containing "every attempt, the attempt ledger, every
   frozen revision bundle and the plan itself". The recorded manifest has
   3 mappings (plan, ledger, `attempts/001/eval-result.md`) and no
   evaluator-revision bundle. B retention actually rests on the
   38-mapping deterministic archive.
2. **C2 public `promotionPlan` reference.** C2 says a terminal PASS
   `verification-result.json` carries `promotionPlan`. This spike's own
   PASS result carries none, and its archive has no plan. The PASS was
   produced under trusted N per C1, and N's contract has no plan. The
   candidate's C2 behavior is shown only in the fixture (R2).

### Extra

1. Pre-implementation recovery: the root host operation, the kernel
   method, grant revocation, and recovery-scoped event resolution (host
   maintenance 002). This is not part of the brief's scope.
2. Semantic BLOCKED stops automatic continuation, and `blocked` is
   removed from all retry dispositions (host maintenance 001).
3. Any unanswered canonical `kernel.human-request` is a resolver gate, and
   human responses may bind requests of terminated workers (host
   maintenance 001).
4. New policy gates: `readiness-blocked` before `brief-frozen`, and a PASS
   without host promotion or process exception.
5. Candidate As-Built v4 validates and commits the host-written
   `evaluation/promotion.json` as its own separate checkpoint.
6. Committed-input provenance prefers `artifactCommit` over `commit` in
   `roleInputs`.
7. The Implementation contract adds the postcondition `manifest.md`.

Everything else in brief §§1–8 and Design Map C1–C9 matches what was
built, as described above.

## Retry record (execution `700e3b1a-63dc-4649-993e-18757c305ae0`)

This is a forward-only As-Built retry under one-use human root authority
`36343082-b3f8-4142-96c3-f0155e5af501`. The reconstruction above was
recorded by execution `3652f997-2153-4c39-a1e1-bdd86926fc49`
(`as-built-recorded` `207ecefa-29da-4c80-b972-07676776b956`, commit
`45f3ce4`). It is preserved unchanged.

- The bound inputs are identical to the prior execution's, and all were
  recomputed. The candidate is unchanged, so the built shape, the Missing,
  Contradictory and Extra findings, and their counts (3/2/7) are unchanged.
- `evaluation/promotion.json` was validated against the bound promotion
  identity and against `promotionIdentity` on `promotion-recorded`
  `4115a86a-7208-4d7a-b6aa-9f1411775dee`. Both match. That file alone
  was committed as its own checkpoint `d221862c820f1de52a8018b453246d996c6fc37d`,
  separate from this As-Built checkpoint. No other `evaluation/` content
  was committed or read.
