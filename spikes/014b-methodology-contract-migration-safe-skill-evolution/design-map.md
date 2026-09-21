# Design Map — Spike 014b: Methodology Contract Migration and Safe Skill Evolution

## Authority and scope

This Design Map is produced under the one-time human bootstrap authority in the
frozen Spike 014b brief. The active Design Map skill is evidence reviewed by the
audit, not authority for this artifact.

The frozen brief is authoritative where it has already settled semantics. This
map does not reopen evaluator classifications, Brief Readiness verdict mapping,
evaluator repair authority, As-Built finding categories, Outcome
process-exception semantics, local role-owned Git commits, or host-owned
publication.

For the matrix below, `CONTRACT_MUST_CHANGE` includes the role's JSON contract
and its configured entry in `methodologies/harness/policy.json`. This is not a
new disposition; policy is part of the configured governed-role contract.

## Shared governed-role contract

Every active methodology role has the following target boundary:

- Harness binds the exact coherent methodology identity, skill identity,
  contract identity, authoritative inputs, predecessor, workspaces, and
  capabilities before execution. Repository prose and mutable files are not
  substitutes for bound authority.
- The worker may perform its domain task, write only in granted workspaces, run
  permitted local checks, inspect Git, create its complete public checkpoint as
  a local commit, return a semantic Role Result, identify the evidence and exact
  commit it produced, and request narrow privileged host actions.
- The worker never pushes, acquires publication credentials, writes canonical
  workflow authority, allocates or dispatches a successor, selects a different
  skill/evaluator authority, or promotes itself.
- All eight role contracts grant exactly the common minimum named by the brief:
  `repository-read`, `repository-write`, `local-computation`, `git-inspect`, and
  `git-commit`. Evaluator roles additionally receive the private evaluation
  workspace and protected isolation. `git-publish` and network access are never
  worker capabilities.
- `succeeded`, `blocked`, `refused`, and `failed` are semantic role
  dispositions. Provider/process exit, methodology result, artifact details,
  and privileged-action result remain separate facts. A role that successfully
  establishes a negative methodology fact (for example Brief Readiness
  `NOT_READY` or evaluator `FAIL`) reports disposition `succeeded` with that
  methodology fact.
- A successful artifact-producing invocation owns a local checkpoint containing
  all of its public artifacts and its final manifest entry. The exact produced
  commit is output evidence, not an enum and not a value predicted at
  allocation time.
- Harness validates the Role Result, produced evidence, local checkpoint, and
  requested actions. Only Harness records the configured canonical transition
  and performs publication or promotion. A later host-action failure does not
  rewrite the worker's genuine semantic result.
- Human interaction is a bounded transport, not ambient authority. `input` may
  supply missing operational information; `approval` or `root` may grant only
  the explicit bounded permission represented by the host. No response may
  rewrite frozen authority or acceptance semantics. A question whose answer
  would change the frozen contract causes `blocked`, not conversational contract
  amendment.

## Skill ↔ Contract Fidelity Matrix

### Brief Readiness

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Target: a human-bound mutable draft `spike.md` plus only the public repository evidence needed to review it. The current contract correctly takes an unfrozen path input, but the skill says to identify a spike itself rather than consume the exact bound input. | SKILL_MUST_CHANGE |
| Workspaces and read/write exposure | Repository read/write is correct. The skill forbids evaluator-private material, but the contract has no `evaluator-private` forbidden exposure. | CONTRACT_MUST_CHANGE |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`, required for the role-owned checkpoint. | CONTRACT_MUST_CHANGE |
| Human interaction | The declared `input`, `approval`, and `root` transports are compatible with bounded human authority; none may silently resolve a brief decision. | MATCH |
| Semantic disposition | A completed review is `succeeded` whether its verdict is `READY` or `NOT_READY`; inability to perform a fair review is `blocked`, with `refused` and `failed` retaining their generic meanings. Current result dispositions permit this. | MATCH |
| Methodology vocabulary and invariants | The binary contract vocabulary `READY`/`NOT_READY` is correct. The skill's three prose conclusions do not state the required mapping: both “Ready to freeze” and “Ready after minor clarification” map to `READY`; the latter retains a non-blocking finding. | SKILL_MUST_CHANGE |
| Artifacts | `feedback.md` is always public output; a `NOT_READY` review also preserves the immutable `preliminary/NNN/{spike.md,feedback.md}` snapshot; `manifest.md` is final where applicable. The contract names only `feedback.md`, and the `NOT_READY` policy outcome validates no artifact. | CONTRACT_MUST_CHANGE |
| Produced repository checkpoint | The complete review/snapshot/manifest must be one local commit and its exact SHA reported. The skill currently requires commit **and push**. | SKILL_MUST_CHANGE |
| Privileged host actions | Publication, when configured, is requested after the local commit and performed by Harness. The current skill pushes directly. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Before `brief-frozen`, under the exact supplied draft authority. The policy trigger matches this. | MATCH |
| Postconditions | Harness must validate the committed `feedback.md`, conditional preliminary snapshot, manifest when required, and exact checkpoint. Current static postconditions and policy evidence are incomplete. | CONTRACT_MUST_CHANGE |
| Expected canonical transition | After host validation, `READY` records `brief-frozen`; `NOT_READY` records `readiness-blocked`. The worker must not record either. Current policy transitions are correct, while the skill instructs direct `brief-frozen` recording. | SKILL_MUST_CHANGE |

### Design Map

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact committed `brief-frozen` content and provenance are bound. Current skill, contract, and policy agree. | MATCH |
| Workspaces and read/write exposure | Repository read/write is correct. Non-evaluator execution must carry `evaluator-private` forbidden exposure, which is absent. | CONTRACT_MUST_CHANGE |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | `git-inspect` and `git-commit` are already declared. | MATCH |
| Human interaction | Bounded human transport is compatible with returning genuinely unresolved public-contract decisions upstream; it cannot amend the frozen brief in place. | MATCH |
| Semantic disposition | `succeeded` for a completed map and `blocked` for an unresolved frozen-contract problem are sufficient; no routing taxonomy is needed. | MATCH |
| Methodology vocabulary and invariants | No role-specific methodology enum is required. Explanatory design findings stay in the artifact. | INTENTIONALLY_ARTIFACT_ONLY |
| Artifacts | `design-map.md` plus the final `manifest.md` are correctly named by the contract. | MATCH |
| Produced repository checkpoint | The complete map and manifest must be one local commit and its exact SHA reported. The skill currently requires commit and direct push. | SKILL_MUST_CHANGE |
| Privileged host actions | Publication is a requested host action. The skill currently performs it. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Latest committed `brief-frozen`, with no current `design-map-frozen`. Current policy matches. | MATCH |
| Postconditions | The map and manifest must exist in the exact produced commit. Current contract names both, and policy validates the map artifact. | MATCH |
| Expected canonical transition | Harness records `design-map-frozen` only after validating the local checkpoint. The current policy matches; the skill incorrectly instructs the worker to record it. | SKILL_MUST_CHANGE |

### Evaluator Prepare

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact committed brief and Design Map plus the pinned evaluator skill/definition are bound. Current contract and policy bind the two public artifacts, and methodology pinning binds the skill. | MATCH |
| Workspaces and read/write exposure | Repository plus private evaluation workspace under protected isolation is the correct shape. `harness.project.json` currently configures no `evaluation` workspace, so the generic allocator cannot realize the declared contract. | KERNEL_SUPPORT_REQUIRED |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`. Protected execution must be able to write repository `.git` for the checkpoint without widening private exposure or granting publication. | CONTRACT_MUST_CHANGE |
| Human interaction | Protected bounded human transport is acceptable. A material public-contract ambiguity produces disposition `blocked`; human chat cannot redefine success. | MATCH |
| Semantic disposition | Successful frozen preparation is `succeeded`; insufficient public authority is `blocked`. Current skill and generic dispositions agree. | MATCH |
| Methodology vocabulary and invariants | Internal preparation/integrity `PASS` facts remain evaluator evidence, not workflow enums. The empty methodology object is deliberate. | INTENTIONALLY_ARTIFACT_ONLY |
| Artifacts | Public: `coverage-map.json`, `eval-requirements.md`, and final manifest entry. Private: spec, case manifest, optional hidden tests/support, freeze metadata, and preparation diagnostics. The contract omits the manifest and cannot declare workspace-qualified private evidence. | CONTRACT_MUST_CHANGE |
| Produced repository checkpoint | All public preparation output must be one local commit whose SHA is reported. The skill currently commits and pushes. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness publishes the public checkpoint; the worker neither pushes nor records canonical authority. Current skill directly pushes. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Latest `brief-frozen` plus `design-map-frozen`, without `evaluation-prepared`. Current policy matches. | MATCH |
| Postconditions | Public coverage and requirements must match the private frozen revision and pass the pinned integrity validator; public manifest and private evidence must exist. The current public postconditions are incomplete, and the contract model has no workspace-qualified private postcondition/evidence declaration. | KERNEL_SUPPORT_REQUIRED |
| Expected canonical transition | Harness records `evaluation-prepared` after validating the committed public checkpoint and its readiness attestation. Current policy does so; the skill tells the evaluator to record it directly. | SKILL_MUST_CHANGE |

### Evaluator Repair

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact brief, Design Map, public requirements, source evaluator revision/identity, and an exact immutable trigger are bound. The trigger is either finalized `EVALUATOR_DEFECT` verification or explicit human correction carrying `EVALUATOR_COVERAGE_DEFECT` semantics. Current contract binds only brief/design and leaves repair authority discoverable from mutable state. | CONTRACT_MUST_CHANGE |
| Workspaces and read/write exposure | Repository plus private evaluation workspace under protected isolation is correct, but the generic project configuration cannot currently supply the declared evaluation workspace. | KERNEL_SUPPORT_REQUIRED |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`; protected local checkpointing must not grant publication or weaken isolation. | CONTRACT_MUST_CHANGE |
| Human interaction | Human correction is valid only as an exact bound authority event with the frozen coverage-defect semantics. The policy's bare `correction-cycle-opened {evaluatorRepair:true}` predicate is insufficient. | CONTRACT_MUST_CHANGE |
| Semantic disposition | A completed semantics-preserving repair is `succeeded`; a repair requiring changed acceptance semantics is `blocked`; generic refusal/failure remain available. | MATCH |
| Methodology vocabulary and invariants | No redundant `REPAIRED` methodology result is required. Current contract correctly has none, but policy injects `outcome: REPAIRED` into evidence. | CONTRACT_MUST_CHANGE |
| Artifacts | Private immutable repair record, preserved source revision, corrected revision/freeze, integrity evidence; public safe repaired coverage/binding and manifest. Current contract declares no postconditions. | CONTRACT_MUST_CHANGE |
| Produced repository checkpoint | Public repair output and manifest must be one local commit whose SHA is reported. The current skill does not clearly separate local checkpoint completion from later publication. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness publishes and records repair authority. The skill currently instructs the evaluator to record the public authority binding. | SKILL_MUST_CHANGE |
| Trigger or predecessor | The policy roughly identifies evaluator-defect and human-correction paths, but it does not bind exact trigger identity and source evaluator identity and its “after verification” exclusion is not valid for both alternatives. | CONTRACT_MUST_CHANGE |
| Postconditions | Corrected revision lineage, acceptance-semantics-preserved attestation, full integrity pass, public-safe binding, manifest, and exact commit are required. Workspace-qualified private evidence is not expressible by the current contract schema. | KERNEL_SUPPORT_REQUIRED |
| Expected canonical transition | Harness records `evaluator-repair-recorded` after host validation, carrying exact lineage without a fabricated `REPAIRED` result. The worker must not record it. | SKILL_MUST_CHANGE |

### Implementation

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact committed brief, Design Map, prepared/repaired coverage, identity-bound public requirements, and optional sanitized feedback from the exact confirmed implementation failure. Current contract binds the first four but omits retry feedback. | CONTRACT_MUST_CHANGE |
| Workspaces and read/write exposure | Repository workspace plus `evaluator-private` forbidden exposure is correct. | MATCH |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`. | CONTRACT_MUST_CHANGE |
| Human interaction | Bounded interaction may resolve operational facts only. Conflicting or incomplete frozen product authority yields `blocked`, not ad hoc amendment. | MATCH |
| Semantic disposition | `succeeded` means the requested implementation checkpoint exists; unresolved upstream authority is `blocked`. No finer machine routing taxonomy is required. | MATCH |
| Methodology vocabulary and invariants | No role-specific methodology enum is needed. Retry number and explanatory decisions are evidence, not methodology result. | INTENTIONALLY_ARTIFACT_ONLY |
| Artifacts | Candidate repository changes, visible tests, final manifest entry, and concise handoff evidence. Arbitrary implementation files cannot sensibly be enumerated as static postconditions. | MATCH |
| Produced repository checkpoint | The complete candidate and manifest must be a focused local commit and its SHA reported. The skill correctly owns the commit but also pushes it. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness publishes the reported commit. The skill currently pushes directly. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Initial implementation follows `evaluation-prepared`; retries follow exact `IMPLEMENTATION_FAILURE` or explicitly authorized implementation correction. Current policy expresses these paths. | MATCH |
| Postconditions | The exact commit, cleanly scoped diff, manifest, and reported visible checks are validated; static file enumeration remains inappropriate. Current policy's `commitHead` captures only ambient host `HEAD`, not worker-reported produced evidence. | KERNEL_SUPPORT_REQUIRED |
| Expected canonical transition | Harness records `implementation-handoff` with exact produced commit and attempt after validation/publication policy. The skill currently tells the worker to record it after pushing. | SKILL_MUST_CHANGE |

### Evaluator Verify

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact brief, Design Map, prepared/repaired coverage, candidate commit, evaluator revision, and verification allocation are bound. Current contract/policy bind these and allocate attempt identity before execution. | MATCH |
| Workspaces and read/write exposure | Repository plus private evaluation workspace under protected isolation is correct, but the project configuration cannot currently realize the evaluation workspace. | KERNEL_SUPPORT_REQUIRED |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`; protected checkpointing must preserve private isolation and exclude publication credentials. | CONTRACT_MUST_CHANGE |
| Human interaction | Human input cannot alter frozen cases or acceptance semantics. Genuine missing frozen authority is classified and finalized, not patched conversationally. | MATCH |
| Semantic disposition | A completed evaluation reports role disposition `succeeded` with methodology result `PASS`, `FAIL`, or `BLOCKED`. Role disposition `blocked` is reserved for inability to complete the semantic role at all. The skill does not state this mapping sharply enough. | SKILL_MUST_CHANGE |
| Methodology vocabulary | The contract incorrectly has `SPECIFICATION_DEFECT` and omits `SPECIFICATION_AMBIGUITY` and `SPECIFICATION_DRIFT`. The exact five classifications are fixed by the brief. | CONTRACT_MUST_CHANGE |
| Conditional result invariants | `PASS` has no classification; every `FAIL` or `BLOCKED` has exactly one valid classification. The current schema validates fields independently and cannot express these cross-field rules. | KERNEL_SUPPORT_REQUIRED |
| Artifacts | Private immutable allocation/ledger/result and diagnostics; public `verification-result.json`, safe feedback when applicable, and final manifest. The policy requires `verification-result.json`, but the skill never requires producing it and the contract has no public postconditions. | SKILL_MUST_CHANGE |
| Produced repository checkpoint | Every terminal verification result owns a local public checkpoint and exact SHA; PASS-related public promotion material is not worker-owned. Current skill commits/pushes feedback and later promotion itself. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness owns publication and all evaluation promotion/copying. Current skill performs direct push and self-promotion. The generic host exposes publication only, not an evaluator-promotion action/result. | KERNEL_SUPPORT_REQUIRED |
| Trigger or predecessor | Current prepared evaluator plus exact implementation handoff; a repaired evaluator may trigger re-verification of the unchanged implementation. Policy matches this at a high level. | MATCH |
| Postconditions | Terminal result must bind allocation, candidate, evaluator revision, complete coverage accounting, classification invariant, private immutable result, public result, manifest, and commit. Current validator checks useful accounting but not the full vocabulary/invariant/evidence set. | CONTRACT_MUST_CHANGE |
| Expected canonical transition | Harness records `verification-finalized` for all three methodology results. Classification then routes implementation failure, evaluator defect, specification ambiguity/drift, or infrastructure failure without inventing `SPECIFICATION_DEFECT`. Current policy has stale vocabulary and incomplete routing. | CONTRACT_MUST_CHANGE |

### As-Built

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Exact final implementation commit, frozen brief, Design Map, final accepted verification result, and completed host promotion are bound. Current contract binds only candidate commit; policy predicates are not delivered as inputs. | CONTRACT_MUST_CHANGE |
| Workspaces and read/write exposure | Repository access is correct. Active evaluator-private exposure must be forbidden; promoted target-spike evidence remains public and readable. Current contract has no forbidden exposure. | CONTRACT_MUST_CHANGE |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`. | CONTRACT_MUST_CHANGE |
| Human interaction | Bounded operational input is compatible; As-Built does not seek acceptance or redefine the contract. | MATCH |
| Semantic disposition | `succeeded` means the reconstruction artifact is complete, regardless of whether it reports discrepancies. Generic blocked/refused/failed meanings remain. | MATCH |
| Methodology vocabulary and invariants | `Missing`, `Contradictory`, and `Extra` may coexist and remain artifact findings, never a singular workflow result. | INTENTIONALLY_ARTIFACT_ONLY |
| Artifacts | `as-built.md` plus final manifest. The contract names only `as-built.md`. | CONTRACT_MUST_CHANGE |
| Produced repository checkpoint | Artifact and manifest form one local commit with reported SHA. The skill commits and pushes. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness publishes; worker does not push. Current skill pushes. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Latest current verification `PASS` plus completed `promotion-recorded`, before `as-built-recorded`. Current policy matches. | MATCH |
| Postconditions | Committed As-Built, manifest, exact inspected implementation identity, and exact produced checkpoint are required. Current postconditions omit manifest and bound comparison inputs. | CONTRACT_MUST_CHANGE |
| Expected canonical transition | Harness records `as-built-recorded` after checkpoint validation. Current policy matches; skill instructs the worker to record it. | SKILL_MUST_CHANGE |

### Outcome

| Dimension | Frozen target and current finding | Disposition |
| --- | --- | --- |
| Inputs and authority | Bind exact candidate, brief, Design Map, manifest/history, As-Built, durable human acceptance, and either accepted standard evaluation/promotion or the predeclared process exception plus completed substitute evidence. Current contract binds only candidate commit. | CONTRACT_MUST_CHANGE |
| Workspaces and read/write exposure | Repository access is correct. Active evaluator-private exposure must be forbidden; promoted target-spike evaluation remains public under the existing exception. Current contract has no forbidden exposure. | CONTRACT_MUST_CHANGE |
| Capabilities | Repository read/write and local computation are present. | MATCH |
| Git capabilities | The contract lacks `git-inspect` and `git-commit`. | CONTRACT_MUST_CHANGE |
| Human interaction | Human acceptance is a bound predecessor fact, not a worker prompt or permission to rewrite history. Current skill observes this distinction. | MATCH |
| Semantic disposition | `succeeded` means the historical synthesis is complete under one authorized completion mode; absent required evidence is `blocked` or `refused`, never a counterfeit success. | MATCH |
| Methodology vocabulary and invariants | Structured completion mode must be at least `STANDARD` or `PROCESS_EXCEPTION`. A process exception is never evaluator `PASS`. Current contract and policy expose no completion-mode fact. | CONTRACT_MUST_CHANGE |
| Artifacts | `outcome.md` plus final manifest. The contract names only `outcome.md`. | CONTRACT_MUST_CHANGE |
| Produced repository checkpoint | Outcome and manifest form one local commit with reported SHA. The skill commits and pushes. | SKILL_MUST_CHANGE |
| Privileged host actions | Harness publishes; worker does not push. Current skill pushes. | SKILL_MUST_CHANGE |
| Trigger or predecessor | Standard path: As-Built plus durable human acceptance of the evaluated/promoted candidate. Exception path: predeclared exception, complete substitute evidence, committed final candidate, As-Built-equivalent historical evidence where declared, and durable acceptance. Current policy represents only the standard-looking path. | CONTRACT_MUST_CHANGE |
| Postconditions | Committed Outcome and manifest must bind the exact completion mode and provenance. Current postconditions omit manifest and structured mode. | CONTRACT_MUST_CHANGE |
| Expected canonical transition | Harness records `outcome-recorded` only after validating the appropriate completion mode. The skill must report the mode and stop recording/pushing the transition itself. | SKILL_MUST_CHANGE |

## Generic kernel handback to Spike 014a

These findings are requirements on generic governed execution and must not be
worked around in skill prose:

| Finding | Required generic behavior | Disposition |
| --- | --- | --- |
| Produced evidence | `RoleResult` currently accepts only enum-valued methodology fields. It needs a typed evidence channel able to carry an exact commit SHA and artifact identities produced during execution. | KERNEL_SUPPORT_REQUIRED |
| Conditional results | Contract validation must express and enforce dependent-field rules, including evaluator PASS/no-classification and non-PASS/exactly-one-classification, and must reject semantically valid fields that have no total policy route. | KERNEL_SUPPORT_REQUIRED |
| Checkpoint validation | `postconditions` currently prove little beyond resolvable paths, while outcome evidence can validate only one configured artifact or ambient `HEAD`. Host validation must bind all required artifacts to the exact worker-reported produced commit. | KERNEL_SUPPORT_REQUIRED |
| Post-execution host actions | Publication is currently pre-bound from input commit/base in the Role Grant. The interface must accept a post-execution request for the newly produced commit, validate it against the grant/result, and report action success/failure separately from semantic role success. | KERNEL_SUPPORT_REQUIRED |
| Evaluator promotion | The only generic host action is publication. A narrow host-owned promotion action/result is required so the evaluator can report eligibility and exact source identities without copying/promoting itself. | KERNEL_SUPPORT_REQUIRED |
| Private evidence | Contracts cannot name workspace-qualified private postconditions/evidence. Protected evaluator roles need validation of required private outputs without exposing their content publicly. | KERNEL_SUPPORT_REQUIRED |
| Protected Git writes | The configured capability/workspace path must allow `git-inspect` and `git-commit`, including repository `.git`, for protected evaluator execution without granting network, credentials, direct push, or broader filesystem access. Current generic project configuration also needs an actual private evaluation workspace binding. | KERNEL_SUPPORT_REQUIRED |
| Capability vocabulary | Role contracts use `repository-write`, while the executor adapter gates edit tools on `workspace-write`; default governed executor profiles also lack the new Git capabilities. One enforced vocabulary must connect contract, selection, and provider sandbox. | KERNEL_SUPPORT_REQUIRED |
| Canonical transitions | The host must be the only writer of role-derived canonical transitions and must preserve a successful Role Result when validation or a required host action blocks the transition. | KERNEL_SUPPORT_REQUIRED |

## Coherent methodology identity and safe evolution

The coherent methodology unit is one deterministic manifest containing:

- the complete policy content and identity;
- every active role name, contract content/identity, and skill content/identity;
- all material validator names and executable identities;
- the capability vocabulary/schema version used to interpret contracts; and
- any configured public authority needed to resolve those components.

Its identity is the deterministic content identity of that complete manifest.
Role files have individual versions for human history, but no combination of
those versions is authority without the complete methodology identity.

The repository must maintain an explicit trusted methodology identity for new
workflow grants. A workflow grant embeds its exact complete definition and
continues to use that identity. Loading mutable configured paths is permitted
only to construct a candidate; it is not sufficient to select trusted authority.

The smallest required evolution surface provides these observable operations:

1. **candidate** constructs a complete manifest from one exact repository
   revision and proves it differs from or equals the trusted identity;
2. **check** validates component identities, all policy/contract/skill links,
   the complete fidelity rules in this map, result routing/invariants,
   capability vocabulary, forbidden worker authority patterns, and validator
   availability;
3. **diff** reports component-level material changes, including skills,
   contracts, policy, validators, capabilities, result vocabularies, and
   privileged-action requirements;
4. **exercise** runs bounded disposable compatibility scenarios against the
   candidate without creating trusted workflow authority or publishing;
5. **promote** requires explicit human authority, records the validated
   candidate identity and evidence, and changes only the trusted identity used
   by future grants.

Command names and storage layout are implementation freedom. The observable
inputs and outputs are not: all five operations accept or return exact complete
methodology identities and machine-readable results. Promotion is monotonic
history, never an in-place rewrite. A candidate skill—including a candidate
evaluator—cannot supply the evaluator authority that checks that candidate.

The existing kernel's embedded `MethodologyDefinition` and workflow pinning are
a sound base and already make policy, skills, contracts, and validator identities
part of one content identity. They do **not** yet provide a durable trusted versus
candidate selection/promotion surface, and validator execution after a trusted
set changes must remain available to already-bound workflows. That remaining
runtime support belongs to the Spike 014a handback; 014b must still produce and
validate the coherent target manifest and evolution operations independently.

## Invariants

- Exactly the eight roles in this matrix are active methodology roles. The
  orchestrator consumes Role Results but is not forced into their taxonomy.
- Every configured role outcome has one total, deterministic interpretation;
  accepted-but-unrouted Role Results are invalid.
- The exact evaluator classifications are `IMPLEMENTATION_FAILURE`,
  `EVALUATOR_DEFECT`, `SPECIFICATION_AMBIGUITY`, `SPECIFICATION_DRIFT`, and
  `INFRASTRUCTURE_FAILURE`. `SPECIFICATION_DEFECT` is not an alias.
- Evaluator repair consumes bound immutable authority and source lineage. It
  never discovers its own permission from mutable repository state.
- As-Built discrepancy categories remain coexistable artifact facts.
- Outcome completion mode is a durable structured fact. `PROCESS_EXCEPTION`
  never implies or fabricates evaluator PASS.
- Private evaluator artifacts never enter an implementation-capable session.
  Promoted historical artifacts are public copies governed by their recorded
  provenance, not active private exposure.
- A local role checkpoint may exist even if publication fails. Semantic result,
  checkpoint validation, host-action result, and canonical transition remain
  separately inspectable.
- Candidate methodology N+1 is checked by trusted authority N. Only explicit
  human promotion makes N+1 trusted for future grants; existing grants remain
  bound to N.

## Implementation freedom

- Exact JSON field names for produced evidence and Outcome completion mode,
  provided their semantics and validation are explicit.
- The internal representation of conditional result schemas and multi-artifact
  checkpoint validation, provided it is generic rather than evaluator-specific.
- The command/API shape and storage layout of candidate/check/diff/exercise/
  promote, provided the exact identities and machine-readable behavior above
  remain observable.
- How public and private artifact inventories are represented, provided private
  content is not leaked and host validation can bind the required evidence.
- Executor/provider mechanics used to realize the declared capabilities, as
  long as the contract vocabulary is enforced consistently and publication
  authority remains host-owned.
