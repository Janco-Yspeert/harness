# Spike 014d — Real Methodology Integration and Frictionless Skill Evolution

**Status:** Draft for human review and freeze  
**Depends on:** trusted 014b methodology and independently verified 014c governed executor implementation  
**Precedes:** remaining 014a recovery; 014e independent-project canary; 015 usage/quota telemetry  
**Draft baseline:** `5d4b3b4d2581a5a417adf1752861c6fee406919b` on `feat/spike-014`; re-resolve exact authority and revision at freeze.

## Context

014b reconciled the eight active Harness skills, their contracts and policy, and introduced content-addressed candidate methodology, coherence checking, diffing, immutable trusted history and explicit human trust promotion. 014c implemented and independently verified the real registered Claude/Codex adapters and provider-neutral Harness MCP worker operations (`assignment`, `submitResult`, `requestAction`, `requestHuman`). Its live Claude smoke demonstrated host-validated *synthetic* promotion, but not the real evaluator skill's promotion behavior.

014c's independent verification is `PASS`. The evaluator recorded promotion eligibility but its temporary bootstrap execution did not persist or deliver the exact private promotion plan. This does not invalidate the PASS. Its private evidence remains preserved, and 014c's archival state remains incomplete as documented in `../014c-governed-executor-integration/closeout.md`. Do not rewrite that history or extend the temporary bootstrap into a second production execution architecture.

The first priority of 014d is **ordinary skill-version evolution**: trusted methodology/skills **N must prepare and verify candidate methodology/skills N+1, including a changed evaluator skill, without N+1 becoming its own authority and without recurring manual bootstrap friction**. Adding entirely new optional roles should also become possible, but that is a secondary extensibility proof.

There are two concrete obstacles in the current repository. `src/methodology-evolution.ts` insists on an exact hard-coded `ACTIVE_ROLES` set, preventing additional roles. More critically for ordinary upgrades, the production host's trust-equivalence gate reads the *active working tree* when authorizing new workflows; editing the candidate methodology in that same checkout can make it impossible to authorize the still-trusted N. Meanwhile `promoteMethodology()` reconstructs the candidate at the requested revision, but its supplied evaluation authority does not mechanically bind the referenced PASS to that exact candidate revision and methodology identity.

014d must fix the general evolution path, not hard-code an exception for this spike, for 014c, or for any named evaluator version.

## Question

Can Harness execute the **real** skills through its production MCP adapters and make changing a trusted skill or coherent methodology from N to N+1 a routine, independently evaluated, explicitly human-approved operation—with no self-evaluation, temporary orchestration bridges, branch-specific rules, or unnecessary human pauses?

## Boundary and guiding decisions

- **Authority is immutable; execution strategy is not.** Each execution binds a pinned trusted skill, contract, policy and input identities. Context layout, provider choice and eligible conversation reuse are execution strategies and may change without changing that authority.
- **N evaluates N+1.** Candidate code/skills cannot silently become trusted because the working tree changed. A new skill does not evaluate itself during the transition that establishes its trust.
- **One production execution path.** Orchestrator → governed host → registered provider adapter → pinned assignment → Harness MCP worker tools → host-owned canonical state/actions. No generated `/tmp` orchestration bridges.
- **A semantic result is not a privileged action.** PASS, evaluator eligibility, host promotion and human methodology trust promotion are distinct facts.
- **Human input at genuine boundaries, not routine transitions.** Once the user authorizes a workflow, execute eligible machine phases through the normal host until a real decision or genuine blocker occurs.
- **Specific interfaces, bounded scope.** Prefer explicit artifact schemas, exact identities, observable behavior and negative acceptance tests over free-form instructions and speculative infrastructure.

## 1. Make N → N+1 an ordinary supported operation

A normal compatible skill/methodology upgrade must use this generic sequence:

1. Resolve the current trusted methodology **N**, including the exact revision and all skill/contract/policy/validator bytes, from that project's append-only trusted history.
2. Create the candidate **N+1** from an exact committed revision. Candidate edits must not change N's evaluator, preparation, worker authority or active existing grants.
3. Produce a machine-readable, human-readable change review covering changed skill versions, contracts, capabilities, policy, validators, required actions and public acceptance implications.
4. Prepare and freeze an independent evaluation of N+1 under the *trusted N evaluator skill/authority*, with candidate-specific requirements coming from the frozen new brief and design—not from N+1's evaluator instructions.
5. Implement the candidate in a separate writable location; independently verify the exact resulting candidate revision under pinned N. Preserve all old evaluator revision/attempt history.
6. Bind a real N-authored PASS and its exact evidence to the candidate methodology identity **and** Git revision proposed for promotion. A PASS for A must never authorize B.
7. After explicit human review/approval, record N+1 in append-only trusted history. New workflow grants may bind N+1; older grants and evidence keep their original N.
8. Do not require another human decision at each mechanically eligible intermediate phase.

The trust-equivalence gate must be able to load/execute N from its immutable trusted snapshot even while N+1 is edited in the candidate checkout. Prefer using existing Git/worktree/content-addressed reconstruction rather than maintaining duplicate mutable "active" copies or hand-pinning a spike-specific evaluator checkout. The exact mechanics may be chosen during design, but the observable behavior above is mandatory.

### N cannot perform a newly required action

The currently trusted N might have older execution instructions—this is precisely the problem surfaced in 014c. An upgrade must never require retroactively modifying N or pretending N made a request it did not make.

An old evaluator's genuine independent PASS may be retained while its *separate* evidence-archival action is incomplete. If ordinary N cannot finish a newer administrative step, use a documented, generic human-authorized recovery/process-exception path supported by the trusted system, with exact evidence and forward-only provenance. It must not fabricate `promotion-recorded`, silently copy hidden files, or become an automatic bypass for failed evaluation.

A genuine inability of N to **fairly evaluate the substantive acceptance criteria** is different from an old transport or archival limitation. That case must stop for an explicit **generic** human bootstrap decision. It cannot silently substitute N+1 as its own evaluator.

Acceptance must demonstrate one actual N → N+1 upgrade involving a changed *evaluator skill*, including preparation and independent verification under N, and human-gated methodology promotion. It must not rely on any identifier, condition or bypass specific to 014d.

## 2. Integrate all eight actual role skills with the production worker interface

Exercise Brief Readiness, Design Map, Evaluator Prepare, Implementation, Evaluator Verify, Evaluator Repair, As-Built and Outcome against their real pinned skill instructions and real contracts. The existing synthetic 014c role is infrastructure evidence, not proof that these skills work.

For each role, establish the exact required sequence and verify:

- only the pinned assignment's skill/contract and declared inputs govern the execution;
- the role can access its declared workspace(s) and cannot access forbidden evaluator-private exposure;
- its real outputs exist in the correct public/private location and its required public local Git checkpoint is reported exactly;
- it submits a single valid typed semantic result through `submitResult`;
- any privileged operation is requested only through the declared `requestAction` and handled by the host;
- the host, not the skill's prose, records the canonical transition;
- a missing, denied or failed required action remains visible without rewriting a real semantic result;
- requested human decisions use `requestHuman`, and eligible non-human phases do not pause merely to chat with the user.

Create a skill ↔ contract ↔ worker-protocol ↔ evidence ↔ policy fidelity matrix for all eight roles. If a mismatch can be fixed in a skill or contract, do not build a generic kernel mechanism to conceal it. If existing kernel abstractions cannot express a true cross-role requirement, identify the smallest reusable correction.

Use deterministic provider-free tests wherever they establish behavior. Include bounded real-provider runs of the **actual** protected evaluator and at least one actual public role through the production adapter, with exact versions, provider-reported constraints and safe evidence. A real evaluator-repair exercise must establish its bound trigger and revision authority; deterministic execution may cover its negative paths. Avoid an uncontrolled eight-role live-provider quota burn merely to duplicate deterministic coverage.

## 3. Close the actual evaluator promotion-plan/MCP gap

The production MCP `requestAction(promotion)` and host promotion action already work. Do **not** add another runner or action mechanism.

Version the candidate evaluator skill and contract together so that every terminal PASS persists a **typed private promotion eligibility decision or explicit ineligibility record** before `submitResult`. Use one canonical private path, preferably `.eval/promotion-plan.json`, and one versioned schema shared with `tools/archive-manifest.ts`.

An eligible plan must bind the candidate commit, evaluator revision, verification attempt, attempt history, complete eligible revision bundles, eligibility decisions, private relative source paths and canonical public destination mappings. The archive utility must derive file-level source identities from actual bytes and reject missing, changed, incomplete, unsafe or unmapped material. An ineligible decision must give a bounded reason; it must not become an invented promotion request or event.

For eligible PASS, the actual evaluator must persist the plan, validate/expand it to the exact typed artifact list, submit PASS, invoke production MCP `requestAction(promotion)`, inspect the host result and report archival success **only after** the action succeeds. The host alone copies bytes and emits `promotion-recorded`. Keep the source private until successful promotion.

For ineligible PASS, record the decision and require the existing explicit human review or an appropriately configured generic no-archive path; never silently claim archival success. Keep any required archival gate conditional on the actual recorded eligibility decision, not simply every PASS.

Cover valid/ineligible/missing/tampered decisions; denied, failed and omitted actions; mismatched candidate/revision/attempt; incomplete frozen bundles; an artifact list exceeding the current protocol's bounded size; repeated or interrupted action requests. Do not silently truncate bundles. Do not introduce speculative general restart orchestration: correct only failures actually required for a reliable normal promotion path.

The independent evaluator **N** remains responsible for evaluating these changes to candidate N+1; the candidate evaluator is not permitted to validate itself.

## 4. Mechanically bind methodology trust promotion to the right PASS

Strengthen ordinary `candidate`/`check`/`diff`/`exercise`/`promote` behavior without creating a second trust store:

- candidate revision resolves to an exact Git commit and its reconstructed manifest;
- evaluation evidence identifies the trusted N authority, exact evaluated candidate commit, candidate manifest identity, independent result, relevant frozen evaluator revision and evidence identities;
- human trust promotion checks those bindings rather than merely accepting an arbitrary PASS evidence string;
- changed trusted authority since evaluation blocks stale promotion until reviewed;
- no changed evaluator candidate, role or validation source can silently become authoritative through mutable working-tree discovery;
- older pinned workflow grants remain valid and keep their existing definitions.

Explicit human review is necessary to make N+1 trusted; human approval is not a substitute for a missing or failed substantive evaluator result. A generic, explicitly recorded exception for an older evaluator's missing *archival* action must keep that limitation visible and cannot be reused to waive independent verification.

Demonstrate denial of PASS-for-A applied to candidate B, self-evaluated N+1, stale N authority, uncommitted candidate, mismatched artifact identities and silent working-tree trust drift.

## 5. Keep additional skills easy, but secondary

Remove the current fixed `ACTIVE_ROLES` exact-eight-role requirement from generic methodology evolution. The default Harness workflow may still contain eight core roles, and domain-specific invariants may remain for those roles, but the checker must derive the set of configured roles from the candidate policy/manifest.

Adding an optional role must not require editing a generic role-name allowlist. Every role must have coherent policy, skill, contract, inputs, capabilities, workspaces, evidence and outcomes; declared privileged actions must remain host-mediated. Prefer declarative role attributes or explicit reusable constraints over spreading evaluator-name special cases through the kernel.

Prove with one disposable candidate containing a ninth optional public role: `candidate`, `check` and `diff` succeed and describe it, its existing N authority remains unchanged until human promotion, and a previous eight-role workflow still runs normally. This is an extensibility fixture, not a requirement to ship an actual ninth production role.

## 6. Reserve a safe path for evaluator-to-public regression recommendations

Future skills should be able to suggest that selected evaluator discoveries become ordinary maintained project tests, rather than hiding every useful regression forever.

014d must define a small extension seam, not ship automatic hidden-test publication:

- an evaluator may emit a **public-safe recommendation** naming the public requirement, observed behavior class and desirable ordinary regression;
- a later separately granted public implementation/review role may develop a normal test from that recommendation;
- no live implementation role receives hidden evaluator mechanics or private fixtures during the cycle it is being evaluated;
- publishing the *exact hidden test bytes* requires a separate explicit disclosure decision and must not be inferred from PASS;
- a future optional role such as a regression curator must be introducible through normal N → N+1 methodology evolution.

Do not broaden the existing evaluator-evidence `promotion` action into a general secret-to-public publishing tool. Its narrow byte-preserving archive responsibility remains distinct.

## 7. Retire legacy bridges from the normal path

The only normal governed production path is:

```text
orchestrator -> governed host -> registered provider adapter
             -> pinned worker assignment -> Harness MCP worker protocol
             -> host-owned semantic results, actions and transitions
```

Audit current call sites for `tools/governed-claude-bootstrap.ts`, `tools/legacy-workflow.ts`, `src/workflow-backend.ts`, `src/claude-workflow.ts` and any result-line parser or generated orchestration wrapper.

Classify each remaining component as (a) retired historical/bootstrap-only with no production caller; (b) test fixture; or (c) genuinely required, repository-owned, versioned first-class component with a single defined responsibility. Prefer deletion or retirement where the production adapter already owns the behavior. Preserve functionality still used by a supported interactive backend.

Do not invent bridge code in `/tmp`, allow arbitrary production `command` profiles, reactivate legacy `/workflow-runs` mutation, change authority by parsing terminal prose, or encode spike/version IDs into runtime policy.

## 8. Context efficiency without changing authority

Fresh, isolated provider execution remains the default. The methodology defines the exact permitted knowledge, skills, inputs, exposures and actions, but should not unnecessarily prescribe one model conversation per role for all time.

Refactor/specify `workerInstructions()` and associated context assembly to separate stable, identity-checked material from volatile execution facts. Use deterministic ordering and byte-identical stable prefixes where feasible:

- stable worker protocol and methodology rules;
- pinned skill and contract bytes;
- small relevant, versioned reference summaries or indexes explicitly permitted by the grant;
- volatile execution/grant IDs, candidate/attempt values and fresh evidence references later.

Never put secrets or evaluator-private material into shared public context. Do not sacrifice correct pinned-assignment validation for caching. Use just-in-time access to permitted exact source artifacts rather than eagerly injecting the entire repository's documentation into every skill prompt.

Demonstrate that identical stable inputs give identical stable context bytes across distinct executions, that volatile grants remain distinguishable, and that the worker can retrieve its necessary detailed artifacts within granted boundaries. Report actual token/cache measurements only if the provider exposes reliable values; do not claim billing or quota savings from string rearrangement alone.

### Preserve the future shared-public-context option

No production shared-conversation mode is required in 014d. However, document the minimal extension seam for successive compatible *public* roles to share a provider context while every role still receives its own new grant, pinned skill/contract, bound inputs, semantic result and host-action authority.

Any context lineage that has seen `evaluator-private` material must remain tainted and ineligible for reuse by public implementation. Record context provenance if reuse is later added; an executor session and a model conversation must not be treated as interchangeable authority objects.

Defer actual shared-session execution, prompt-cache/quota comparisons and scheduling to measured follow-up work in 015 unless a necessary small refactor is already justified by 014d.

## 9. Acceptance criteria and evidence

| ID | Mandatory acceptance |
| --- | --- |
| AC01 | Trusted N is resolved by exact recorded revision and remains executable/authoritative while a separate candidate N+1 checkout changes the evaluator skill, its contract and policy. No spike-specific pin or runtime exception. |
| AC02 | A normal N-authored frozen evaluation independently verifies exact N+1; N+1 never evaluates itself or silently alters N's active grant. |
| AC03 | Methodology trust promotion binds exact N PASS, evaluator/evidence identities, candidate Git revision and reconstructed candidate manifest, plus explicit human approval. Wrong-candidate, stale or self-evaluated proofs are rejected. |
| AC04 | One complete real N → N+1 upgrade of a changed evaluator skill succeeds using the ordinary version-evolution path. Any legacy-N evidence-archival limitation is resolved or handled by an explicit, generic, forward-only human path without forging promotion history. |
| AC05 | The actual eight skills' pinned assignments, inputs, workspace isolation, outputs, checkpoint behavior, typed results, host actions and policy transitions are covered by a documented fidelity matrix and executable tests. |
| AC06 | A real governed evaluator using the production MCP adapter writes its exact private eligibility decision, emits PASS and obtains a real host-validated promotion result. No synthetic substitute for this criterion. |
| AC07 | Invalid/ineligible/missing/oversized plans and denied/failed/omitted actions preserve authentic semantic results and do not fabricate archival or progress. |
| AC08 | The eight-role assumption is no longer imposed on all candidate methodologies; an optional ninth public role can be coherently checked, diffed and kept non-authoritative until promoted. |
| AC09 | A public-safe regression recommendation and separately authorized future test-curation path can be represented without exposing evaluator-private checks to the current implementation. |
| AC10 | Every legacy bridge/direct-runner call site has a disposition. Production uses only the registered adapters and MCP protocol; tests reject a generated or arbitrary bridge in the governed path. |
| AC11 | Stable role context is deterministic and separated from volatile grant data without weakening identity or exposure checks; future compatible public-role reuse has a documented seam, not an untested production implementation. |
| AC12 | Full repository checks pass at the exact candidate revision; the frozen independent evaluator runs under N; real-provider evidence is separately recorded with versions and safe diagnostics; human trust promotion is not claimed without its actual event. |

## Execution and authority sequence

1. Human-review and freeze this brief and its eventual Design Map. Before implementation, resolve the **then-current trusted N** from append-only trusted history; record its exact revision, skill/contract/validator identities and permitted authority once.
2. Use only N's pinned evaluator authority for independent `prepare`. Freeze public evaluation requirements and private cases before exposing candidate implementation.
3. Implement 014d in candidate N+1. Candidate skill and policy edits remain data under review, never current-cycle authority.
4. Exercise the real worker integration and generic evolution path; commit the exact candidate.
5. Verify with N against the frozen evaluator revision; preserve PASS and host-action results separately. If N cannot perform its own archival transport, do not retrofit N or silently substitute N+1. Use the generic explicit human process-exception/reconciliation path if authorized and supported; otherwise stop at the documented human decision.
6. After independent PASS and human acceptance, perform exact candidate methodology trust promotion through the established append-only mechanism. Future new workflows may bind N+1; existing workflows stay pinned to N.
7. Record file-change-first As-Built and Outcome as eligible. Keep private evaluation evidence private except for successful, authorized promotion.

## Handoff

After a verified and explicitly accepted 014d methodology upgrade, resume the outstanding 014a historical recovery under its own authority, then run 014e's independent external-project canary. Use 015 to measure usage, caching and eventually bounded quota-wait/resumption; do not make speculative cost optimization a blocker for 014d.

**This is a draft brief. Do not treat it as frozen acceptance authority until human review and the normal freeze record.**