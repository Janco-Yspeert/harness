# Spike 014d — Real Skill Execution and Host Contract Integration

**Status:** Draft for human review and freeze  
**Depends on:** trusted 014b methodology; independently verified 014c production governed executor implementation  
**Precedes:** remaining 014a recovery; 014e external-project canary; 015 usage/quota work  
**Draft baseline (re-resolve at freeze):** `feat/spike-014` at `7a0052324e3d28a8b17ff51c51f897326def2173`

## Context

014b made the eight existing Harness skills, their contracts and methodology policy structurally coherent and introduced versioned candidate-versus-trusted methodology evolution. 014c implemented and independently verified the production Claude/Codex adapters, exact pinned assignments and shared MCP worker operations (`assignment`, `submitResult`, `requestAction`, `requestHuman`). Its real-provider smoke proved a **synthetic** Claude promotion. Neither spike proved that all eight *actual* skill instructions consistently create their artifacts, use the worker tools, request required host actions and advance the workflow without unnecessary intervention.

014c's independent verification is a genuine `PASS`, but its temporary bootstrap runner did not persist and deliver the real evaluator's promotion plan. The private evidence is being preserved; `../014c-governed-executor-integration/closeout.md` records the incomplete archival state. Do not rewrite 014c history or extend that bootstrap path as a second production adapter.

**014d is primarily an operational methodology integration spike.** Its deliverable is that the actual skills and orchestrator work smoothly through the existing governed host: correct pinned inputs and outputs, correct semantic results, correct MCP actions, a real evaluator-owned archival artifact and successful promotion, and autonomous continuation through already-authorized machine phases.

This work necessarily changes several authority-bearing skills, including the evaluator. Therefore 014d must also exercise a **low-friction trusted N → candidate N+1 upgrade** without candidate self-evaluation or spike-specific exceptions. Make that transition practical for this run and future compatible skill revisions, but do not let broad methodology-evolution redesign displace the operational integration work. Adding new optional roles is a smaller secondary extensibility proof. Context assembly and future reuse are bounded design considerations, not a reason to implement a session platform now.

## Question

Can Harness execute its eight real skills, by default under orchestrator control, through the proven production governed host/adapter/MCP path—without repeated routine permission prompts or manually reconstructed evaluator promotion—and can this necessary skill revision be independently evaluated and adopted through the existing N → N+1 authority model?

## Scope, priorities and fixed boundaries

**Must work in this spike:** real skill/contract/host fidelity; orchestrator default routing and unattended permitted continuation; legitimate evaluator promotion plan plus successful real MCP action; correct negative/incomplete states; bounded removal of normal-path legacy bridges; independent validation and ordinary authority cutover for these changed skills.

**Must not obstruct the work:** trusted N must remain usable while N+1 is developed and evaluated. Human methodology trust promotion remains explicit and separate from evaluator evidence archival.

**Bounded forward compatibility:** adding optional roles, public-safe regression recommendations, stable prompt prefixes and future context reuse. Prove the small extension seams, not a general plugin or conversation-management framework.

**Do not do:** 014c historical recovery, quota scheduling or billing optimization (015), external-project canary (014e), generic kernel replacement, arbitrary production shell runners, or automatically publishing hidden evaluator checks as public project tests.

Authority belongs to pinned skills, contracts and policy. Providers and context layout are execution choices. Semantic results, host-action results and human decisions remain separate, durable facts.

## 1. Make all eight actual skills function through Harness

Create a precise **skill ↔ contract ↔ MCP operation ↔ required evidence ↔ host transition** fidelity matrix and use it to correct real instruction/contract mismatches. Cover the *actual* current roles:

| Actual role | Required exercised behavior |
| --- | --- |
| Brief Readiness | Reads exact brief inputs; produces the appropriate public readiness/feedback artifact and local checkpoint; submits the declared verdict; does not claim the host's transition. |
| Design Map | Consumes the frozen brief, writes and commits the real Design Map, reports its exact produced checkpoint and submits a typed result. |
| Evaluator Prepare | Uses an isolated private evaluator workspace, prepares and freezes an independent revision, records complete inventory/integrity, produces the public-safe coverage/requirements checkpoint, and reports exact evidence without private disclosure. |
| Implementation | Consumes only public frozen inputs and properly bound retry feedback; implements and checks the candidate, produces an exact local handoff commit, and cannot read evaluator-private material. |
| Evaluator Verify | Consumes pinned frozen authority and exact candidate, runs the required verification, finalizes immutable private attempt evidence, publishes sanitized public verification results and performs the explicit evaluator evidence-promotion handshake in `3`. |
| Evaluator Repair | Requires its exact permitted defect/human trigger; preserves earlier evaluator revisions/attempts; creates an explicitly new frozen revision and public coverage checkpoint without changing implementation or retroactively rewriting evidence. |
| As-Built | Reads the exact independently verified candidate, public evidence and actual promotion status; produces a file-change-first As-Built checkpoint only after its canonical prerequisites exist. |
| Outcome | Distinguishes standard verified completion from an expressly authorized and evidenced process exception; requires real human acceptance and records a truthful outcome checkpoint. |

For every role, verify pinned assignment delivery, actual granted workspace access, input identities, authorized capabilities, real artifact bytes and checkpoint, semantic result submission, declared host action where relevant, host-owned transition and appropriate failure states. A skill reporting in prose that it *would* perform an action does not pass.

Fix mistakes at the **smallest correct boundary**. If the skill neglected to call a tool, correct the skill and add a regression proof. If the contract grants the wrong capability or omits a required output, correct the contract. Change the generic host only when existing host interfaces cannot enforce a reusable requirement.

Use deterministic provider-free exercises with the real skill bytes for all eight roles, not merely another synthetic skill. Add bounded real-provider proof of at least one real public role and the actual candidate evaluator under the production adapters. Exercise evaluator-repair trigger/lineage deterministically; avoid an uncontrolled eight-role provider quota burn. Record exactly what was exercised and do not describe mocked compliance as observed real-provider behavior.

## 2. Make the orchestrator use Harness by default and continue without ceremony

In a project configured for Harness, when the human asks to **implement, run, continue, repair, verify or otherwise carry out development work**, the orchestrator must choose the configured Harness workflow and registered adapters **by default**. The user should not have to say “use Harness,” type a slash skill command or restate permission at every phase. Preserve any explicit user request for a narrower/read-only task or a supported alternative.

An execution request authorizes only its stated scope. The orchestrator must obtain/record the necessary initial workflow grant using the existing host's authority mechanism. After that, it proceeds through every mechanically eligible, already-authorized machine phase without repeatedly asking the human for permission, announcing phase boundaries as questions, or stopping merely to provide a status report. It inspects the host's canonical status and lets the host allocate/continue roles; it does not manually dispatch individual providers.

Ask the human **only** where the existing grant genuinely cannot decide: freezing substantive acceptance authority when required, approving an expanded scope or privilege, accepting/rejecting a verified result, authorizing a true bootstrap/process exception, approving additional spending, or resolving missing essential input. An existing valid authorization must not be relitigated. A host-denied capability is a real blocker, not a reason to try an unrestricted mode or generate a bridge. A stop/pause request overrides any remaining automatic work.

Preserve a clear read-only boundary: “inspect”, “diagnose”, “summarize” or “what happened?” must not dispatch work or mutate authority. Investigation alone is not permission to repair or retry.

Require observed orchestrator-level evidence, not just revised skill prose:

- an ordinary actionable request in a Harness project selects the governed workflow without additional incantations;
- an initial bounded authorization carries multiple eligible machine phases without an additional human permission prompt;
- an actual human gate stops correctly and preserves the exact pending decision;
- a read-only request remains read-only, and an explicit stop actually stops;
- missing adapter/permission/authority is reported as an inspectable blocker rather than replaced with a direct Claude/Codex invocation or temporary orchestration script.

The orchestrator is not itself one of the eight domain role contracts. Track the revised orchestrator instruction version/provenance explicitly without pretending it is an ordinary evaluator or bypassing its applicable review.

## 3. Make legitimate evaluator evidence promotion work end to end

The production MCP `requestAction(promotion)` and host promotion implementation already exist. Reuse them; **do not** build a new promotion engine, automatic PASS inference, bootstrap relay or additional executor.

### Typed private decision and actual artifact

The **actual candidate evaluator** must write one immutable, versioned private promotion eligibility decision for its terminal PASS **before** `submitResult`. Standardize on `.eval/promotion-plan.json` unless the Design Map demonstrates a compelling incompatibility with the existing `tools/archive-manifest.ts`. The evaluator skill, verify contract, utility and host-action input expectations must agree on the **same exact format and path**.

An eligible plan binds the actual candidate commit, evaluator revision, attempt, full attempt history, frozen revision inventories, explicit eligibility decisions and all source-to-canonical-destination bundle mappings. Ineligibility is a recorded explicit decision with a safe reason, not an omitted plan.

The existing archive utility must read the **real persisted file**, validate the declared eligibility and expand the actual files/directories into deterministic, identity-checked artifact mappings. It must refuse missing or mutated files, mismatched plan identity, partial revision bundles, unsafe paths, duplicate destinations and incomplete attempt history. Do not reconstruct a missing plan from evaluator prose or the public summary hash.

### Required real action and acknowledgment

For an eligible PASS, the evaluator must persist the plan, build/validate the exact manifest, publish the normal sanitized verification checkpoint, submit its typed PASS and invoke the production MCP `requestAction(promotion)` with those manifest mappings. It must **inspect the returned action result** and report archival as complete only after host-confirmed success. The host alone copies private evidence byte-for-byte into `evaluation/`, creates the canonical `promotion.json`, emits a successful action event and records `promotion-recorded`.

The public verification result must reference the identity of the real private plan, not a request digest for a file that was never persisted. The promoted file set and manifest identities must be independently checkable against actual source bytes. A real PASS without a successful required action remains an authentic PASS but an **incomplete phase**, not ordinary completion.

For an ineligible PASS, preserve the explicit decision and route to a truthful configured review/no-archive outcome or human gate; do not pretend that archival occurred or silently force hidden material public.

Prove the complete eligible sequence with the **actual candidate evaluator skill under the actual production governed adapter and host**, operating as a test subject in a bounded isolated fixture. The fixture has its own explicitly initialized test trust root and cannot establish trust over the production candidate. The current trusted evaluator N independently checks the resulting evidence; the candidate skill never certifies itself. A synthetic promotion test alone does not satisfy this requirement.

Negative proofs: absent or invalid plan, wrong identity, wrong candidate/revision/attempt, partial bundle, ineligible decision, oversized manifest (including the current protocol artifact bound), omitted request, denied/failed action, premature exit and duplicate/retried delivery. Preserve valid semantic results, expose truthful pending/failure state and never fabricate promotion. Implement the smallest reliable repeat/interruption handling required by these cases; do not broaden 014d into a speculative job scheduler.

## 4. Keep this skill revision N → N+1 safe, with less future friction

This section is an **enabler and acceptance constraint** for the actual skill/host integration above, not a separate platform-rewrite objective.

During 014d, the current trusted methodology/evaluator **N** remains the independent authority. The edited skill/contract/policy set **N+1** is candidate material until explicitly human-promoted. It must not silently govern its own preparation, verification or real trust promotion. Resolve N once by exact trusted-history identity/revision and keep it usable while the candidate checkout changes; the current host trust gate's dependence on active working-tree bytes must not force spike-specific pinned-commit scripts or a one-off trust override. Prefer a small generic trusted-snapshot/worktree separation using the existing Git and pinned-definition machinery.

The ordinary path must be:

1. Resolve immutable trusted N and create an exact candidate N+1; present the existing `candidate`/`check`/`diff` evidence.
2. Prepare/freeze independent tests under **N** before implementing the changed skills.
3. Implement N+1 in the candidate workspace, including the actual integration required by ``1–3`.
4. Independently verify the exact candidate commit and methodology identity under N; preserve attempt history and separate semantic PASS from N's own optional archival result.
5. Obtain **one genuine human acceptance/trust-promotion decision** at the appropriate boundary; bind it to the exact N-authored PASS and candidate revision/manifest. Future grants then use N+1; existing grants retain N.

Strengthen `promoteMethodology()` enough to reject a PASS for candidate A applied to B, a self-evaluated candidate, stale trusted authority and silently drifted bytes. Do not add a second trusted-history store.

If N can substantively evaluate N+1 but its old instructions cannot deliver a newer archival action, preserve its genuine result and use a **generic, explicitly authorized, forward-only** recovery/process-exception mechanism where supported. No retroactive skill edit, made-up promotion plan, forged `promotion-recorded` or 014d-specific flag. A genuine inability of N to fairly assess new acceptance semantics is different and requires explicit generic human bootstrap authority, not automatic substitution of N+1.

Prove that the actual revised evaluator skill can pass through this path without new hand-maintained exception scaffolding. The independent evaluator can test the upgrade mechanism before your final human trust-promotion decision; it must not claim human promotion occurred before you approve it.

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

**Priority order is deliberate: actual skill behavior, orchestrator behavior and real evaluator archival come first; this run's N → N+1 transition is an essential enabling requirement, not the main product being built.**

| ID | Mandatory acceptance |
| --- | --- |
| AC01 | A complete skill ↔ contract ↔ MCP ↔ artifact ↔ policy fidelity matrix covers all eight real skills; deterministic tests exercise actual pinned skill bytes and validate required inputs, outputs, local commits, semantic results and transitions. |
| AC02 | Actual public and protected roles execute through the production registered adapters. A bounded observed orchestrator-initiated run uses Harness by default for an actionable development request, rather than a direct provider runner or improvised bridge. |
| AC03 | Once an appropriate workflow grant exists, multiple eligible machine phases proceed without redundant human permission prompts; real acceptance/new-privilege gates, read-only tasks and explicit stops behave correctly. |
| AC04 | The actual candidate evaluator persists one schema-valid private `.eval/promotion-plan.json` or explicit ineligibility decision before PASS. Its recorded request identity resolves to that real file and complete, unchanged eligible source inventory. |
| AC05 | A real governed execution of the candidate evaluator through the production MCP adapter submits PASS, calls `requestAction(promotion)` with the derived artifact list, receives successful host confirmation and leaves a byte-validated canonical `evaluation/promotion.json` plus `promotion-recorded`. N independently evaluates this fixture evidence; synthetic-only proof is insufficient. |
| AC06 | Missing/tampered/ineligible/oversized plans, denied/failed/omitted actions, bad identities and premature exit cannot fabricate archival or falsely complete the workflow. A genuine semantic PASS remains intact when its subsequent action fails. |
| AC07 | Evaluator Prepare/Verify/Repair keep complete frozen revision and attempt lineage; non-evaluator roles never receive evaluator-private exposure. As-Built and Outcome follow their *real* canonical gates, including truthful process-exception behavior. |
| AC08 | No normal-path generated bridge, alternate direct-runner, terminal-prose result protocol or arbitrary production `command` profile is needed. Every remaining legacy entrypoint has a justified test, historical or separately supported first-class purpose. |
| AC09 | The actual 014d N → N+1 skill revision uses immutable trusted N to prepare and independently verify the exact candidate; candidate skill edits do not defeat N's authority or evaluate themselves. No spike-specific runtime or trust exception is introduced. |
| AC10 | Ordinary human methodology trust promotion is tied to an actual N-authored PASS, exact candidate commit/manifest and current trusted authority; cross-candidate or self-evaluated promotion is rejected. The final trust event occurs only after explicit human approval. |
| AC11 | The fixed-eight-role assumption is removed from generic methodology evolution; a disposable ninth optional public role can be checked/diffed without becoming authoritative or exposing private evaluator content. Public-safe regression recommendations have a clear future extension seam. |
| AC12 | Stable permitted context is deterministically separated from per-execution data and exact assignment identities remain enforced. A safe future shared-public-context seam is documented; full shared sessions and cost/quota measurement are not required now. |
| AC13 | Full repository checks and frozen independent evaluation pass at the exact candidate revision. Real-provider evidence identifies what actually ran, installed versions, confirmed-or-unavailable model/effort, host results and safe diagnostics; no fabricated PASS, action, promotion or human-acceptance event. |

## Execution and authority sequence

1. Human-review and freeze the brief and Design Map. Resolve and record the then-current trusted methodology **N** once, including the actual independent evaluator authority, **before** candidate skill edits acquire any governing effect.
2. Under N, prepare the independent evaluation of the actual operational requirements: eight role integrations, default/unattended orchestrator behavior, real evaluator promotion and valid negative states. Freeze its private revision before candidate implementation.
3. Implement N+1 as a coherent candidate methodology, using the existing production adapters and worker protocol. Update the real skills, contracts, policy, orchestrator instructions and small generic host/evolution interfaces only as proven necessary.
4. Run deterministic fidelity/negative coverage and bounded real-provider proofs. In an isolated governed test fixture, execute the actual candidate evaluator as a *subject* to prove its plan → PASS → MCP action → host archive path; the fixture cannot certify the candidate methodology.
5. Commit the exact candidate, then independently verify it with **N**, preserving all actual public/private evidence and prior attempt history. If N itself cannot perform archival, preserve its semantic outcome and stop at an explicit generic human recovery/exception decision as applicable rather than pretending an action succeeded.
6. Present the actual fidelity matrix, orchestrator run evidence, real promotion manifest and independent result for human acceptance. Only after that approval promote exact N+1 through trusted history and bind subsequent workflows to it.
7. Record file-change-first As-Built/Outcome through their legitimate paths. Do not make an administrative shortfall in an old runner a fabricated prerequisite for unrelated production integration.

## Handoff

Once actual skill/host integration is independently verified and the resulting methodology is explicitly accepted, resume remaining 014a historical recovery under its own authority and then perform 014e's external-project canary. Use 015 for usage/cache/quota measurement and any subsequent shared-context execution experiment.

**This is a draft brief, not frozen acceptance authority.**
