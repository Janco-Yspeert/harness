# Evaluation Requirements

Spike 014d — Real Skill Execution and Host Contract Integration. Prepared by
the independent evaluator (`evaluator` v13) under trusted methodology **N**
(kernel definition
`sha256:f03608ba101fcca72ca061a8674c1070276848198e9bb2b9baa3647c18391b92`)
against frozen `spike.md`
`sha256:8d4302b27bfd760127e8d8458b515db92f5eae63c4adb9061f3d63c2d1ac710d` and
frozen `design-map.md`
`sha256:50780fa3bef5b097aab2d0cdd27c55b58113d19eca9f2485e9f808eea1e1200e`.

This is evaluator revision `002`. It replaces revision `001`, which was
derived from the Design Map
`sha256:f5193434bb20a2500466938305c38e835db7cd19575432af271bce47f3e2ef6f`.
Pre-implementation recovery `d86c645e-d06c-4717-906e-439c0dfb7d83`
invalidated that map and revision. Revision `001` is preserved privately,
unchanged, and was never used for verification.

These requirements add no product behavior. They name the already-frozen
public seams that independent evaluation relies on, so the implementation can
keep them working. Everything else the Design Map leaves free stays free.

## Testability Requirements

- **TR1 — Methodology trust promotion keeps its public interface.**
  - Requirement: `src/methodology-evolution.ts` keeps exporting
    `buildMethodologyManifest(repositoryRoot, revision)`,
    `candidateMethodology(repositoryRoot, revision, trustHistoryPath)`,
    `checkMethodology(manifest)` and
    `promoteMethodology(candidate, trustHistoryPath, authority)`.
    `promoteMethodology` still locates its repository from a trust history
    file inside that repository. A `trusted-methodology` evaluation keeps its
    existing fields (`kind`, `methodology`, `result: "PASS"`, `evidence`) and
    adds exactly the C5 names `candidate` (40-hex commit) and
    `candidateMethodology` (manifest id). A rejection is a thrown `Error`.
  - Reason: independent evaluation of C5 calls these functions directly.
    `buildMethodologyManifest` at the candidate commit is also used to confirm
    that the orchestrator is not a manifest component (C6).
  - Source: design-map.md C5 ("keeps its signature"; field names) and C6, and
    the existing public evolution interface.
  - Implementation impact: none beyond C5. Additional optional fields are
    fine.
- **TR2 — `workerInstructions` stays the construction surface.**
  - Requirement: `workerInstructions(assignment)` stays exported from
    `src/executors/governed.ts`, accepts the existing `Assignment` shape and
    returns `{ system, prompt }`. `WORKER_OPERATIONS` stays exported from
    `src/executors/protocol.ts`. The byte-identical stable prefix of `system`
    contains the complete pinned skill bytes, the complete pinned contract as
    one verbatim JSON serialization (compact `JSON.stringify`, 2-space
    indented, or the exact contract file bytes), and every worker operation
    name.
  - Reason: C9 is checked by comparing two assembled instructions.
  - Source: design-map.md C9.
  - Implementation impact: the internal split, ordering and any extra
    accessor remain free.
- **TR3 — The archive utility keeps its exported builder.**
  - Requirement: `tools/archive-manifest.ts` keeps exporting
    `buildArchiveManifest(root, decisionPath?)`. The default `decisionPath` is
    `.eval/promotion-plan.json`. Refusals are thrown `Error`s, and no manifest
    is returned.
  - Reason: refusal behavior is checked by calling the utility on disposable
    evaluator workspaces.
  - Source: design-map.md C2 and Invariants; the existing utility.
  - Implementation impact: plan-schema additions stay free within C2.
- **TR4 — Programmatic governed host construction stays available.**
  - Requirement: `startHarnessHost(port, options)` stays exported from
    `src/index.ts`. It accepts `options.governed` with `rootToken`, `project`,
    `executors`, `validators` and `privateDataRoot`, plus the top-level
    `legacyWorkflowExecution` flag. Port `0` yields a usable `url`.
    `loadProject(path)` stays exported from `src/kernel/configuration.ts`, and
    `harnessValidators` from `src/methodologies/harness-public.ts`. An
    authenticated root `POST /governed/<workflow>/grants` with
    `{ continuation, delegation, maxAllocations }` returns `201` for a newly
    created directory under `spikes/`. The workflow's committed-ledger form
    keeps recording the bound kernel definition as a `kernel.definition`
    event whose `roles.<role>.skill.identity` is the pinned skill identity.
  - Reason: the §4 new-grant invariant is checked black-box through the
    production host construction path.
  - Source: design-map.md Invariants and Design decisions ("Existing grants
    keep N"); existing public host and ledger interfaces.
  - Implementation impact: internals are free; additive options and ledger
    fields are fine.
- **TR5 — A clean clone of the committed candidate is sufficient.**
  - Requirement: the committed candidate, a clone sharing all repository
    objects and the installed dependencies are enough to run the full checks
    and to grant new workflows. Nothing may depend on untracked, ignored or
    machine-local files.
  - Reason: evaluation runs against disposable clones of the exact commit.
  - Source: brief §4 and the handoff requirement to commit the candidate.
  - Implementation impact: commit every file the gate and checks need.
- **TR6 — Committed evidence is independently recomputable.**
  - Requirement: the C8 evidence identifies the exact skill bytes (commit and
    `sha256:` identity) that each real or fixture run executed. It also gives
    the fixture promotion plan identity, archive manifest, `promotion.json`
    identity, action status and ledger events, plus each run's runtime,
    installed version, and confirmed-or-unavailable model and effort. The
    observed orchestrator run records the exact orchestrator instruction
    identity used (C6). The C4 bound record gives B and the mapping count of
    each representative complete archive. Where bytes are committed, their
    identities and counts must recompute.
  - Reason: real-provider and orchestrator runs cannot be reproduced by the
    evaluator.
  - Source: brief §1, §2, §3 and AC13; design-map.md C4, C6, C7 and C8.
  - Implementation impact: none beyond C4, C6 and C8.
- **TR7 — The published artifact bound is the enforced bound.**
  - Requirement: `WORKER_PROTOCOL_SCHEMAS` and
    `parseWorkerRequest(operation, input)` stay exported from
    `src/executors/protocol.ts`. The `requestAction` request schema keeps
    publishing B as the `maxItems` of its `artifacts` property.
    `parseWorkerRequest("requestAction", …)` keeps validating against that
    published schema: it accepts a well-formed promotion request with exactly
    B artifact mappings, unchanged, and refuses B + 1 with a thrown `Error`.
  - Reason: C4's single bound and its B + 1 oversized case are checked
    through the production validation point for model-supplied requests,
    reading B from the published schema rather than a literal.
  - Source: design-map.md C4; the existing worker-protocol interface.
  - Implementation impact: where B's one definition lives, its name, and its
    value (if C4 requires raising it) stay free.
- **TR8 — Orchestrator revisions keep the repository's identity and history
  conventions.**
  - Requirement: `skills/orchestrator/SKILL.md` keeps a
    `Contract version: <integer>` line. A revision increments it and adds a
    `docs/history/skills/orchestrator/` entry that preserves the exact prior
    contract bytes, following `docs/history/skills/README.md`. The orchestrator
    is not referenced by `methodologies/harness/policy.json` or the methodology
    manifest.
  - Reason: C6 provenance and exclusion from trusted methodology are checked
    against committed bytes.
  - Source: design-map.md C6; `docs/history/skills/README.md`.
  - Implementation impact: none beyond C6.

## Evaluator Assumptions

- **EA1 — Real-provider and orchestrator claims come only from committed
  evidence.**
  - Assumption: the evaluator makes no provider call and uses no provider
    credential. Automated evaluation runs offline with provider programs and
    credentials absent.
  - Reason: brief §1 separates deterministic and real-provider evidence and
    forbids substitution.
  - Evaluation impact: unproven or missing real runs leave the relevant
    criteria unsatisfied. They never become `PASS`.
- **EA2 — Visible regressions are reviewed for genuineness.**
  - Assumption: where the brief requires deterministic tests whose harness
    and mocking seams are implementation-owned, the evaluator runs
    `npm run check`. It then confirms each required behavior has a test that
    would fail if the behavior regressed.
  - Reason: design-map.md C7 and Implementation freedom.
  - Evaluation impact: constant or tautological assertions do not count.
    Scripted compliance never counts as provider behavior. Deterministic
    evidence supports AC01 but never replaces the real-role, AC05 fixture or
    observed-orchestrator proofs (design-map.md C7).
- **EA3 — History is compared against the brief-freeze commit.**
  - Assumption: unchanged-history checks compare against brief-freeze commit
    `047daacb683203bbd3ebb2bd808cff3404e60042`.
  - Reason: brief §4 and AC10. The final trust event occurs only after
    explicit human approval, which follows verification.
  - Evaluation impact: at the candidate, `methodologies/harness/trusted.jsonl`
    must be byte-identical to that commit, and existing 014c files must be
    unmodified.
- **EA4 — A comment-only skill change is a coherent candidate.**
  - Assumption: a methodology that differs from a coherent candidate only by
    an appended comment line in one role skill still passes
    `checkMethodology`.
  - Reason: independent C5 evaluation builds such disposable candidates.
  - Evaluation impact: `check` must not require unrelated bookkeeping (for
    example a version bump) for such a change.
- **EA5 — N means the latest trusted record's committed bytes.**
  - Assumption: for new grants, "trusted N" is the latest
    `methodologies/harness/trusted.jsonl` record, rebuilt from its exact
    revision. How validator sources are resolved is implementation freedom,
    provided working-tree bytes neither satisfy nor defeat the gate.
  - Reason: design-map.md Invariants and Implementation freedom.
  - Evaluation impact: a clean candidate checkout, and one with uncommitted
    skill edits, must both grant new workflows bound to N's exact role set
    and skill bytes.
- **EA6 — Human trust promotion is not part of verification.**
  - Assumption: verification judges the promotion mechanism and the absence
    of premature trust events. It does not require the final human decision.
  - Reason: brief §4 step 5 and AC10.
  - Evaluation impact: a verification result never claims that human
    promotion occurred.

## Blocking Questions

None.

## Environment Requirements

- The project's Node runtime and installed dependencies (`node_modules`). The
  runtime is the same one used for `npm run check`.
- `git` with the evaluated repository's complete object store, including the
  brief-freeze commit and every revision named in
  `methodologies/harness/trusted.jsonl`.
- Loopback TCP ports and a writable temporary directory for disposable
  clones.
- No provider CLI, provider credential, network access or paid API usage is
  required or used by the evaluator.
