# Spike 015a — Bootstrap-Closed Completion Path

**Status:** Draft for Brief Readiness and human review; not frozen.

**Technical baseline:** Spike 015 implementation candidate 1159f66422796c14a68428990ae93768ce3102fd.

**Trusted predecessor:** methodology sequence 7, sha256:bea2ae256165b900a40e4cefd0fa98cfad665b5511bf2107f02b785f3fe00eea, revision 3e753a4a732c87fc5b42e9e3cf771482aba6a522.

**Depends on:** accepted 014i non-authoritative candidate observation, 014j bootstrap-closed preparation, 014k independent successor evaluation and forward-only adoption, and the Spike 015 technical implementation baseline.

## Purpose

Repair Spike 015's frozen completion-model contradiction without rewriting its history or reimplementing the split-repository feature.

The successor introduces **one narrow, optional, host-validated split-coding-smoke completion obligation**, applicable only to newly created workflows under the adopted sequence-8 methodology. The obligation does not grant the candidate authority to evaluate or adopt itself.

The old Spike 015 evaluator revision 001 cannot honestly PASS under its frozen sequencing. Its attempts, criteria, experimental smoke and review remain unchanged. Spike 015a is a successor certification, not an evaluator repair or a retroactive 015 PASS.

## Existing evidence and inherited technical scope

An independent non-authoritative technical review of candidate 1159f664 assessed Spike 015 AC01–AC13 as technically supported by public evidence and recommended no candidate-specific correction. The experimental label-normalizer smoke used 29eb21bbb2e6a4d3d7c324e49086704ab622d8d3, whose eight runtime/test files match 1159f664. Its test-only methodology at 94f51d98ec45369dbbd26a7a56b49b3ed94897ae is not production trust.

These are valuable evidence, **not an authoritative verification PASS**. Before 015a can authorize adoption of the combined implementation, its new trusted-sequence-7 evaluator must independently establish the inherited technical properties of AC01–AC13 against the exact combined candidate. It may reuse existing attributable tests, public evidence, and frozen requirements. It must not silently inherit the independent review's verdict, copy private 015 evaluator material into implementation context, or redesign the underlying split-repository requirements. No implementation changes to those properties are requested absent a demonstrated defect.

The inherited /tmp-layout containment test failure is an independently tracked operational concern, not permission to weaken containment and not scope for a general rewrite. Baseline comparisons must distinguish it from introduced regressions.

## The two distinct lifecycle contexts

### A. Sequence-7 certification of the successor

    trusted sequence 7
      -> Brief Readiness, Design Map, independent evaluator preparation
      -> bounded candidate implementation
      -> independent trusted-7 verification of inherited technical behavior
         and the proposed sequence-8 completion mechanism
      -> PASS and host-owned evidence promotion
      -> As-Built and human acceptance
      -> truthful sequence-7 Outcome (STANDARD, or an already-authorized
         PROCESS_EXCEPTION where legitimately necessary)
      -> separate explicit forward-only adoption authority
      -> sequence 8

The certification workflow's Workflow Grant remains pinned to sequence 7. Neither adoption nor a post-adoption smoke can retroactively make it subject to sequence-8 policy.

A process exception does **not** replace the independent PASS or independently required adoption evidence. If a process exception is used during closeout, its exact reason and authority must be preserved, and methodology adoption must still pass all existing trusted-predecessor PASS, closeout, human-decision and identity checks.

### B. Fresh sequence-8 operational coding smoke

    fresh sequence-8 workflow with frozen split-coding-smoke obligation
      -> normal governed prerequisites, including its own valid frozen inputs
      -> real contained registered-provider Implementation
      -> accepted source commit, brokered docs evidence and semantic handoff
      -> host validates the declared smoke check and records exact evidence
      -> normal subsequent methodology requirements, if Outcome is pursued
      -> STANDARD Outcome only with a matching valid completion record

The smoke is the **post-adoption operational demonstration**, not a prerequisite for the sequence-7 certification PASS. To demonstrate the completion mechanism, the live pilot needs one genuine governed coding allocation and a host completion record; it need not run every other methodology role live merely to prove this narrow seam. If the pilot proceeds to As-Built, acceptance and Outcome, it must satisfy the existing verification, promotion and human gates honestly. No synthetic PASS or fabricated lifecycle event is allowed.

## Bounded completion obligation

### 1. Frozen declaration

Only a **fresh sequence-8 split workflow** may opt in. Before Brief freeze its docs repository contains a committed completion-obligation.json beside the workflow brief. During the authorized Brief-freeze transition, the host validates and records one completion-obligation-declared event binding the exact committed docs artifact, content identity and workflow scope.

The closed declaration contains:

- schemaVersion 1 and kind split-coding-smoke;
- source and workflow-docs workspace identities, matched against the actual split project configuration and Git origins;
- one repository-relative Node built-in test target and, if needed, a source-relative working directory;
- the exact required host-brokered docs evidence destination (the already-supported manifest.md evidence action);
- no user-supplied shell, environment overrides, host paths, network command or executable selector.

For this bounded spike the host invokes the fixed Node.js built-in test runner against the declared test target. Do **not** add a reusable arbitrary-command runner or a general postcondition DSL. The fixture is self-contained and requires no dependency installation.

Absence of the declaration at freeze means there is no completion obligation. A malformed declaration fails freeze closed; it is not interpreted as absence. Adding or changing a declaration after freeze cannot silently alter the obligation. The event and its Git/content binding, not a mutable working-tree file, are authoritative.

### 2. Host-validated completion record

Following a qualifying Implementation handoff in that same new workflow, the trusted host may run the one declared check and produce a host-owned completion attempt. It produces completion-smoke-recorded **only** when it independently verifies:

1. The exact frozen declaration, current workflow, and adopted trusted sequence-8 methodology/runtime bindings.
2. A legitimate spawned (not inline) Implementation allocation through the configured production registered-provider adapter, with host-observed readiness and managed process provenance, not a fixture-injected execution or merely a profile name.
3. A valid accepted semantic implementation-handoff for that execution. Provider launch settings and recorded enforcement are distinguished from concrete provider attestation. Codex can enforce its model/effort selector but does not attest concrete model identity; unavailable attestation is not invented or made an impossible prerequisite.
4. The allocation's exact source/docs Git snapshot pair and a descended candidate commit containing a real source-tree change; the immutable initial baseline and final candidate are distinct.
5. The successful authorized brokered manifest.md evidence action and exact docs checkpoint, descended from the allocation's docs snapshot. Direct worker docs writes, unrelated commits and stale docs evidence cannot substitute.
6. A host-run check of both the immutable initial source commit and exact final source candidate, using the fixed declared Node test target. The baseline must fail for the expected missing behavior and the final candidate must pass. The host records actual bounded exits/output identities, not the worker's assertion about tests.

Both checks use disposable source checkouts with the existing host containment machinery, no mounted production Git credentials, no writable application/docs roots, no network permission, bounded runtime/output and process cleanup. This is ordinary bounded code execution inside a test fixture, **not** a claim of absolute security or a new containment architecture.

Successful completion-smoke.json is a public-safe host-generated docs artifact. It binds declaration, workflow, runtime/methodology identities, grants, execution, source/docs repositories and commit lineages, evidence action, check results and content identities. It contains no secrets, private evaluator material or raw unbounded logs.

The host checkpoints that artifact locally in docs, validates its exact committed identity, and only then records the canonical completion-smoke-recorded event. Partial checkpoint failures must not create a successful event. A failed check or invalid prerequisite produces an explicit bounded, non-satisfying completion-attempt record. Repeated finalization of the same handoff must be idempotent and must not create conflicting success records. No remote push occurs.

The check can be implemented as a narrowly triggered post-handoff host operation using existing host action/checkpoint primitives. There is no requirement to expose an extra generic API or worker command.

### 3. Outcome enforcement and explicit exceptions

For a sequence-8 workflow **without** a completion-obligation-declared event, preserve existing Outcome eligibility and both completion modes.

For a sequence-8 workflow **with** a declared obligation:

- A STANDARD Outcome requires a successful, current completion-smoke-recorded event bound to the same declaration, workflow, adopted authority and **latest accepted Implementation handoff**. The host revalidates those bindings before both Outcome allocation where applicable and terminal STANDARD outcome recording. Mere existence of an old matching event is insufficient.
- The existing PROCESS_EXCEPTION path remains available **only under its existing explicit authorization and evidence requirements**. It may truthfully close an incomplete or exceptional workflow when legitimate, including when the smoke is missing or unsuccessful. It must identify the unfulfilled smoke obligation, its reason and exact human/process-exception evidence. It must never mark the smoke satisfied, create completion-smoke-recorded, or make a STANDARD completion claim.
- A missing smoke must not create an automatic process exception, and the exception must not bypass independently required human acceptance or other existing authority predicates.

Since eligibility is decided before the Outcome worker chooses its completion mode, the implementation must preserve a possible authorized PROCESS_EXCEPTION allocation while rejecting any STANDARD result that lacks current completion proof. Test both allocation and result/transition enforcement.

The Outcome contract accepts the declaration/record identities when present; a successful STANDARD artifact cites them. In PROCESS_EXCEPTION, the artifact cites the declaration and outstanding obligation plus exception authority instead. Only the trusted host validates bindings. Avoid a general predicate-language extension if one narrow checked completion rule suffices.

### 4. Predecessor-pinned certification closeout

The 015a certification workflow completes under trusted sequence-7 authority. Its Outcome must state that its own grant remains sequence 7, sequence-8 smoke enforcement is not retroactive, and adoption plus a fresh sequence-8 pilot are distinct later actions.

The certification's STANDARD/PROCESS_EXCEPTION choice must be made under the existing sequence-7 requirements. Neither mode claims that the subsequent real smoke has already happened. Explicit sequence-8 adoption occurs only after all existing trusted-N promotion requirements have been independently met.

## Pre-adoption acceptance criteria

| ID | Required property |
| --- | --- |
| **BC01** | Bootstrap closure: every required certification criterion has an evidence path available under trusted sequence 7; no real post-adoption smoke or sequence-8 authority is required for PASS. |
| **BC02** | Declaration is closed, committed, bound to the frozen docs/workflow context and recorded only through host Brief-freeze authority. Missing declarations preserve legacy behavior; invalid or late declarations cannot silently change scope. |
| **BC03** | Completion success requires host-observed production registered-provider spawned Implementation, readiness/managed-process facts, accepted semantic handoff, exact source/docs snapshot and nonempty source delta. Selector enforcement is not confused with unavailable Codex model attestation; fixture/inlined/prose-only evidence fails closed. |
| **BC04** | Only the authorized brokered manifest.md action and exact descended docs checkpoint satisfy docs evidence; direct writes, stale checkpoints or mismatched origins do not. |
| **BC05** | The narrow contained Node test checks an initially failing frozen baseline and a passing exact final commit, recording bounded exit/output identities. Failed check, wrong target/commit, containment failure or evidence drift cannot produce success. |
| **BC06** | Host-derived record and event bind current declaration, workflow, candidate, trusted methodology/runtime, grants, semantic result, Git lineages, brokered evidence and checks. Forgery, stale handoffs, partial checkpoints and duplicate finalization fail closed or remain idempotent. |
| **BC07** | A sequence-8 obligated workflow cannot allocate/finalize STANDARD Outcome without its **current** valid record. Undeclared and historical workflows preserve existing eligibility. |
| **BC08** | Explicitly authorized PROCESS_EXCEPTION remains possible without fabricating the smoke. It records outstanding obligations, never becomes STANDARD, and does not bypass other existing gates. |
| **BC09** | A sequence-7 certification workflow remains sequence 7 after trust adoption; a fresh post-adoption grant resolves sequence 8. No retroactive policy or evidence reassignment occurs. |
| **BC10** | Technical properties of Spike 015 AC01–AC13 remain independently supported for the exact successor candidate through trusted-7 evaluator evidence, public boundary/regression tests and inspection. The original 015 frozen evaluator is not rewritten or represented as PASS. |
| **BC11** | All historical Spike 015 verification, implementation, independent review and experimental evidence remains unchanged; no second evaluator, new trust authority, generic command interface, migration, remote publishing or containment rewrite is introduced. |

## Bootstrap-closure and evidence feasibility

Every required pre-adoption criterion must be independently falsifiable with existing sequence-7 evaluation authority. The Design Map and Evaluator Prepare must map each to an explicit executable/inspection procedure before freeze.

| Criteria | Pre-adoption evidence | Available authority |
| --- | --- | --- |
| BC01, BC09 | Dependency audit and fixture showing pinned predecessor grants versus newly bound successor grants | Existing sequence-7 evaluator and 014k trust fixture semantics |
| BC02 | Committed-docs, freeze and malformed/late declaration tests | Existing Git/host integration test authority |
| BC03–BC04 | Supervised-provider fixture and real host/kernel, Git, grant and brokered-action boundary tests; missing attestation and fake launch negative cases | Existing sequence-7 evaluator tests running candidate software as non-authoritative subject |
| BC05–BC06 | Contained disposable baseline/final check, tamper, partial checkpoint, idempotence and lineage tests | Existing sequence-7 local tests/host-fixture authority |
| BC07–BC08 | Outcome eligibility, latest-handoff, STANDARD rejection and authorized PROCESS_EXCEPTION tests | Existing sequence-7 evaluator testing proposed policy as candidate software |
| BC10 | Independent technical criterion matrix covering unchanged AC01–AC13 properties, with focused regression execution and inspection | Existing sequence-7 evaluator authority; not the old 015 evaluator verdict |
| BC11 | Git/history inspection, full regression and scope review | Existing sequence-7 evaluator authority |

No procedure uses candidate-created authority as the source of the trusted-7 verdict. Candidate policy/host behaviour is exercised only as **software under test**. Real sequence-8 adoption and the live post-adoption smoke happen later, under separate authority.

If any mandatory evaluation procedure requires sequence-8 trust, an actual post-adoption completion event or an inadmissible private 015 artifact, stop preparation before freeze. Do not solve the circularity by changing the meaning of a result after the fact.

## Bounded implementation

Build on 1159f664; do not redesign the existing split-repository work.

- Add only the typed frozen declaration, bounded completion-attempt and completion-record types.
- Reuse existing Brief-freeze, host-owned evidence, Git checkpoint and governed execution seams to validate and record the declaration and actual smoke result.
- Add only the fixture-specific, contained Node test check, with no general command launcher or dependency installer.
- Add conditional host validation for current completion evidence at Outcome eligibility and STANDARD transition, with the existing PROCESS_EXCEPTION branch preserved.
- Update the Outcome contract and coherence validation only as required for these exact semantics.
- Add deterministic negative tests and regression coverage; preserve historical artifacts untouched.

Do not build a general approval system, new evaluator, new trust mechanism, configurable command-execution API, session backend, remote publisher or containment rewrite.

## Verification and completion sequence

1. Human reviews this draft, then Brief Readiness under trusted sequence 7.
2. Freeze a corrected brief and Design Map only after proving each criterion's pre-adoption evidence is executable under sequence 7.
3. Prepare independent evaluation. Reject impossible private/procedural assumptions before freezing its revision.
4. Implement one exact successor runtime/methodology candidate based on 1159f664.
5. Trusted sequence 7 verifies both inherited technical properties (BC10) and completion semantics (BC01–BC09, BC11); independently PASS, then promote evidence and perform As-Built.
6. Human acceptance, truthful sequence-7 Outcome by STANDARD or genuinely authorized PROCESS_EXCEPTION as appropriate; no post-adoption smoke claim.
7. Separately authorize exact candidate adoption under existing trusted-methodology promotion requirements and append sequence 8 forward-only.
8. Create a new, disposable split source/docs workflow under sequence 8, with its completion obligation committed before Brief freeze. Use a small Node test fixture with a genuinely failing baseline.
9. After normal frozen-input prerequisites, execute **one** real contained supported-provider Implementation and accept its semantic handoff.
10. Let the trusted host run the frozen baseline/final checks and commit the validated smoke record. Preserve every actual failure truthfully.
11. Independently demonstrate that sequence-8 STANDARD Outcome requires the matching record, while a properly authorized PROCESS_EXCEPTION may close incomplete without claiming smoke success. A real Outcome is recorded only if its ordinary verification/promotion/acceptance prerequisites have also been satisfied.

The live pilot does not need another complete live multi-role methodology cycle merely to demonstrate this single gate. Its completion record is post-adoption operational proof; the sequence-7 certification Outcome is a separate historical fact.

## Explicit non-goals

- Rewriting original Spike 015 criteria, frozen evaluator revision, terminal results, workflow ledgers or experimental history.
- Claiming an authoritative Spike 015 PASS from this successor.
- Turning the old experimental smoke into post-adoption proof.
- Changing the split-repository feature absent a confirmed inherited defect.
- Building general-purpose code execution, installation, sandbox-security architecture or new provider attestation.
- Disabling or automatically granting legitimate PROCESS_EXCEPTION authority.
- Retroactive methodology migration, remote push or automatic trust promotion.

## Freeze conditions

Before Brief freeze, establish:

1. Every mandatory pre-adoption criterion has an evidence procedure available with sequence-7 authority.
2. The frozen declaration/check can be implemented through existing host/Git/containment machinery without a generalized runner.
3. The Outcome policy can preserve legitimate PROCESS_EXCEPTION while rejecting unsupported STANDARD completion at both authorization and result transitions.
4. The evaluator can independently test the inherited AC01–AC13 behavioural requirements against the exact successor candidate without depending on old private evaluator authority.
5. The certification workflow's own sequence-7 closeout and the fresh sequence-8 smoke are explicitly distinct.

If any of these conditions fails, return NOT_READY with the specific unsatisfied dependency. Do not patch around an unresolved authority cycle during implementation.

**This is a draft brief only. It does not freeze acceptance semantics, allocate roles, authorize adoption, or claim the old 015 cycle passed.**
