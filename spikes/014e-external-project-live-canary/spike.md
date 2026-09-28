# Spike 014e — External-Project Live Canary and Repository Isolation

**Status:** Draft for Brief Readiness and human review; not frozen  
**Harness branch:** `feat/spike-014` (draft baseline `455205ee660c8e65c15720014c2ce64b1085f907`; re-resolve at freeze)  
**Depends on:** 014d's accepted and promoted N+1 methodology (trusted record 5, methodology `sha256:47296d5c73c7833002c482ed7ed75d67ecf21c7aec6fa62a5c84aeeab954effb`, revision `9169ccf7d4543c214e7b7890ee29e428a5f8c01a`)  
**Canary product:** private `Janco-Yspeert/stockdif`, `spikes/001-inventory-reconciliation/spike.md` on `main` (observed baseline `d1bb593fd0b56e58e384a07e8971d6bd75541ac0`; re-resolve before execution)  
**Local project directories:** `/home/velveteen/vk-code/stockdif` and `/home/velveteen/vk-code/stockdif-hidden`, resolved during initial preflight. Re-resolve their real paths and verify Git identities at the execution boundary rather than trusting directory names.
**Precedes:** remaining 014a recovery and the proposed 015 usage/quota, restart and context-efficiency work.

## Context

014d established the real eight-role governed workflow, registered Claude/Codex execution, a real evaluator promotion handshake, orchestrator continuation, and an independently evaluated N → N+1 methodology promotion. Its provider proofs used isolated Harness fixtures. They did **not** establish that the installed Harness can use the same trusted methodology to govern an ordinary project in another Git repository without duplicating skills or mixing Git histories.

Harness's current project model couples the workflow/project root with the trusted methodology source. In particular, trusted history and the policy are resolved relative to the project root, while committed workflow artifacts are checked using that project's Git history. That is correct for self-development but insufficient for Stockdif. The production host also uses repository-owned validators and role support files that must remain coherent with the pinned methodology.

The operator has already created the private GitHub repository `Janco-Yspeert/stockdif`, added its independent, **still-draft** Spike 001 product brief, and committed/pushed that initial brief to `main`. The agreed canary policy is different: ordinary role checkpoints will be **local commits** on a Stockdif feature branch; the finished branch will be pushed manually only after review and acceptance.

014d's separately committed host maintenance 003 (`f6d1456`) is present on the Harness branch but was not part of the accepted 014d candidate. Its own relevant regression/verification obligations must be resolved before treating this branch as a dependable canary runtime.

## Question

Can a single installed Harness, using its existing trusted N+1 methodology and normal governed workflow, safely implement and independently evaluate Stockdif in a **separate repository**—with distinct project, private-evaluator, Git and publication boundaries—while changing and evaluating the smallest necessary generic host interfaces in Harness first?

A successful 014e must demonstrate a **real external-project workflow**, not another synthetic Harness-only fixture or a result based solely on updated instructions.

## Ownership and execution model

There are **two distinct integrations**, not one workflow writing interchangeably to two repositories.

| Track | Authority and workspace | Owned changes and evidence | Publication boundary |
| --- | --- | --- | --- |
| **A: Harness integration (014e)** | Existing Harness project, current trusted methodology, its own independent evaluator and `feat/spike-014` | Generic configuration, trust/source separation, executor/workspace safety, deterministic tests, 014e public/private evaluation and final cross-project assessment | Local Harness checkpoint commits; any Harness remote push is a separately authorized Harness operation |
| **B: Stockdif canary (Spike 001)** | A separate project configuration hosted by the exact tested Track A commit; pinned Harness N+1; public `stockdif` repository and protected `stockdif-hidden` workspace | Stockdif's brief, design, tests, application code, ledger, evaluation archive, As-Built, Outcome and local Git commits | **No automatic remote push.** Human checks and manually pushes only the approved Stockdif branch to `Janco-Yspeert/stockdif` |

The Harness host is the control plane, **not** Stockdif's working directory. Harness's trusted methodology, role skills, contracts, validators and approved support utilities remain owned by Harness; do not vendor or copy them into Stockdif to make this canary work. Stockdif owns its own project-specific workflow configuration where appropriate, but must not acquire an independent, fabricated methodology trust history.

The external project's product requirements have one authoritative source: Stockdif's `spikes/001-inventory-reconciliation/spike.md`. This 014e brief specifies the *integration and evidence obligations*, not a second copy of the CLI acceptance criteria. Any actual Stockdif product changes must follow its own frozen brief and independent evaluator.

## 1. Small, generic separation of methodology and project roots

Support a host-configured, explicit distinction between:

- the **project root** and its Git repository, where workflow directories, ledgers, public artifacts, implementation code and local checkpoint commits belong; and
- the **methodology source root** and its Git repository, where the append-only human-trusted methodology history, policy, pinned skill and contract bytes, validator-source identities, and permitted role support files originate.

Default these roots together for existing Harness self-development and historical fixtures. A new external-project configuration may point the methodology source at the existing Harness checkout. Resolve the current trusted record from Harness's **exact committed Git revision**, not from mutable working-tree files or from a copied Stockdif policy. A new Workflow Execution Grant must bind that exact source/identity; a later Harness commit, method promotion or Stockdif edit must not silently change an active grant.

Keep committed workflow-input provenance relative to the **project repository**. A committed Stockdif `spike.md`, Design Map, coverage map, implementation handoff or verification result must be checked against a commit in Stockdif, never against an identically named path or commit in Harness. Normal local checkpoint semantics remain unchanged, including the committed public/private Evaluator Prepare binding and the post-PASS evaluator archive promotion.

Resolve validator implementations and the small set of existing role-required templates/helpers coherently with the pinned Harness methodology. Prefer host-provided pinned bytes or narrowly scoped, read-only access over vendoring or extending every role's ambient workspace. Do not use mutable Harness files as authority when the grant claims a pinned version.

Do not build a general installer, cross-project registry, new methodology, host replacement or arbitrary provider framework. Choose the smallest reusable configuration and resolver change that supports this real separation.

## 2. Enforce workspace, authority and Git isolation

### Repository boundaries

Preflight both independent repository roots with `git rev-parse --show-toplevel`. For Track B, verify that the local repository's actual `origin` resolves to **`Janco-Yspeert/stockdif`** (allow an explicitly recognized HTTPS or SSH spelling) and that its selected branch is a new `feat/spike-001` branch from the deliberately pinned initial baseline. Do not infer a repository identity from the spelling of its local directory.

Stockdif's `repository` grant must point only to the Stockdif checkout. Stockdif's `evaluation` grant must point only to its distinct private evaluator workspace; no public role may inspect or write that workspace. Evaluator-private material must not be checked into Stockdif or exposed in implementation assignments. The existing governed promotion action may copy the explicitly eligible, identity-checked frozen evaluator archive **into Stockdif's public evaluation directory**, but cannot promote evidence to Harness or bypass its existing authorization checks.

Track A uses its existing Harness-only project and private workspace; Stockdif workers must not receive a writeable Harness repository mount, Harness Git publication authority or Harness credentials. The privileged host may read its installed code and pinned methodology, but a worker must not acquire that host privilege.

A configuration or runtime mismatch must **fail closed**. Reject missing/private workspace paths, overlapping or symlink-escaping workspace roots, cross-repository project/ledger/artifact provenance, unexpected ambient Git working directories and attempts to substitute mutable methodology bytes. Do not weaken evaluation isolation or permit a direct-provider fallback to keep the canary moving.

### Actual process isolation

A grant-level workspace declaration alone is insufficient if the provider subprocess can still write to sibling directories under the operator's Unix account. Before the real canary, establish and test an enforceable boundary using the registered adapters' supported sandboxing and, if needed, the smallest general-purpose process-isolation addition. The permitted execution environment must allow assigned Stockdif writes and explicitly granted protected evaluation operations, while denying mutation of Harness and unintended access to `stockdif-hidden` by **every** public worker regardless of provider.

Where a required access boundary cannot be reliably enforced, **stop before the live run**, record the exact blocker and seek an appropriately scoped solution. Do not claim operating-system isolation from prompts or configuration prose alone.

## 3. Deliberately separate local commits from remote publication

Existing skills need **local committed checkpoints**, not GitHub pushes. Keep every Stockdif role's normal Git commits, committed-input checks and canonical host transitions; do not edit skill contracts merely to avoid commits.

For Track B:

- No role, orchestrator or host automatically pushes to GitHub. Configure no Stockdif publication host action/grant. Prevent provider workers from bypassing this via ordinary shell `git push`, inherited Git credentials or an unrestricted network path.
- Do not configure Harness's repository or remote as a Stockdif publication destination. Verify the expected Stockdif remote identity independently of the worker-provided URL and reject a mismatched or swapped destination.
- Use no force push or automatic push to `main`. The normal development branch is `feat/spike-001`; `main` contains the initial product brief.
- After Stockdif's own independent PASS, successful evaluator archive promotion, As-Built, human acceptance and Outcome, the operator may inspect the exact Stockdif branch and push it **manually** to its verified remote. A manual push is not a hidden prerequisite for any governed role's result or transition.

Track A's local commits remain Harness commits on `feat/spike-014`. Any separate Harness publication/remote push must follow its own explicit authorization. A permitted Harness publication never authorizes a Stockdif push, and the Stockdif host must never be able to publish to Harness.

The current host publication action targets configured host-owned filesystem remotes; 014e need not extend it to GitHub because Stockdif automatic publication is out of scope. Preserve the current host's evaluator **evidence promotion**, which is a different operation from Git publication.

## 4. Harness integration first, then one real Stockdif canary

### Track A — prepare and checkpoint the host change

1. Run normal Harness 014e Brief Readiness and Design Map under the current trusted methodology. Independently prepare/freeze an evaluator that can judge both generic architecture and the predeclared, real external-run evidence without adapting hidden criteria after seeing the candidate.
2. Check host maintenance 003's independent status and execute the relevant recovery-authority regressions; do not silently subsume its unevaluated changes into 014d's earlier PASS. Record the exact Harness branch baseline and its current trusted-record identity.
3. Implement the root separation, configuration and actual boundary enforcement with focused unit/integration tests, then run the required repository checks. Create an exact local Harness checkpoint **H1**. Do not change the trusted methodology or orchestrator v3 unless an observed and independently justified contract defect makes it unavoidable; such a change must follow the existing separate methodology-evolution path.
4. Run a cheap, deterministic preflight against H1: existing Harness self-development still loads unchanged; an external project loads the same exact pinned N+1; project-specific public Git commits are resolved in the correct repository; evaluator-private paths are isolated; invalid roots, provenance, access and remote configurations are rejected. Resolve adapter availability, credentials, localhost access and real containment **before** spending on provider calls.
5. Treat H1 as an immutable runtime for Track B. Running a Stockdif workflow must not use an uncommitted or subsequently edited Harness host. If a Harness defect requires **H2**, record the new commit and explicitly determine which affected Stockdif evidence must be rerun; do not rewrite H1's observed history or silently swap runtimes.

The final independent 014e verification and human acceptance must include the actual Track B evidence. Preliminary local tests and preflight establish permission to attempt the bounded canary; they are not themselves the final 014e PASS.

### Cross-track lifecycle and evidence binding

Track B is executed by the Codex supervisor, not by a Track A role worker, under the explicit human authorization recorded for this 014e run. It begins only after Track A Implementation has produced and handed off the exact committed H1 candidate and before Track A Evaluator Verify is allocated. The supervisor may operate the separate Stockdif governed host and its human gates, but it may not claim any Stockdif worker identity, edit either evaluator's private artifacts or allow a Stockdif worker to modify Harness.

After Track B reaches its truthful terminal state, the supervisor may make one explicitly human-authorized Harness checkpoint **H1E** containing only the predetermined public-safe `014e/evidence/` summary and exact cross-repository identities. H1E must retain H1's implementation tree unchanged outside the 014e evidence area. The final 014e verification binds candidate H1 for generic implementation behavior and the named H1E commit and artifact identities for AC06–AC09; the evaluator must confirm both bindings and may not infer either from mutable `HEAD`. This evidence-import checkpoint is operator evidence, not a role result or worker-identity claim.

If the canary exposes a Harness defect, H1 is preserved. A normal Track A implementation correction produces a separately identified H2 and new implementation handoff before another verification allocation. The supervisor records which Track B observations remain valid and reruns every affected canary step under H2 before producing an H2E evidence checkpoint; prior H1 evidence and allocation history remain forward-only.

### Track B — ordinary product workflow, not a special fixture

1. Resolve Stockdif `main` and the committed draft Spike 001 brief; create the local `feat/spike-001` branch. Configure the **separate** Stockdif project/workflow with `stockdif` as `repository` and `stockdif-hidden` as `evaluation`. Start its own host instance/state/credentials as appropriate, with the exact H1 runtime commit recorded in its grant or ledger and using trusted N+1 from Harness.
2. Run normal Stockdif Brief Readiness. Address material product-brief findings within Stockdif, obtain real human freeze, and commit the exact accepted product brief in Stockdif. Then run ordinary Design Map and independent Evaluator Prepare with the protected evaluator workspace.
3. Run Implementation on the small Node.js 24/TypeScript CSV inventory-reconciliation CLI exactly as Stockdif's brief specifies. The implementation role sees no evaluator-private assets. It produces a normal **local** Stockdif candidate commit.
4. Independently run Evaluator Verify against that exact Stockdif commit. For an eligible PASS, retain the real private promotion plan and use the existing host-mediated promotion to archive allowed evidence in Stockdif. Run As-Built against the exact verified candidate and completed promotion. Stop at genuine human acceptance, then run Outcome if accepted.
5. Record the exact Stockdif implementation/evidence commits **S1...**, the frozen product-brief identity, trusted Harness methodology identity, H1 runtime, adapter/model/version observations, canonical ledger transitions, any correction history, gate count and usage figures **only where reliably exposed**. Cross-reference this in Harness's `014e/evidence/` using public-safe summaries and exact identities; do not import Stockdif's private evaluator files into Harness or co-commit the two repositories.

If Stockdif's independent evaluator finds a product defect, use its normal public feedback and bounded implementation correction **inside Stockdif**. If it identifies a Harness defect, classify it as infrastructure, stop or recover under explicit authority and produce H2 in Harness; never let a Stockdif worker patch Harness directly.

## 5. Bound expense, provider choices and live evidence

Use **one** ordinary external-project live run after deterministic preflight, rather than an additional provider-backed fixture for each code edit. Preserve independent, pre-frozen Stockdif evaluation; do not weaken it merely to reduce cost.

Preferred low-cost public-role/orchestrator setup is Codex with the requested Luna/Medium profile **only if the installed CLI supports the actual model identifier and requested effort**. This is a profile preference recorded as requested but unconfirmed when the adapter cannot attest model or effort; it is not an exact grant constraint in that case. Preferred protected evaluator is the registered Claude adapter with an available Sonnet model. Verify executable versions, credentials, model identifiers, supported controls, protected-workspace behavior and actual role/profile eligibility before allocating; do not claim a model or reasoning level was enforced when the adapter cannot attest it. If Codex cannot enforce the required public-worker read boundary, substitution of an eligible Claude public-role profile is pre-authorized within the same 10-allocation bound and must be recorded; any other provider substitution or material budget expansion is an explicit human decision, not an ungoverned fallback.

Give Stockdif an initial bound of **10 governed role allocations**. Brief Readiness re-review counts; each Design Map, Evaluator Prepare, Implementation, Evaluator Verify, As-Built and Outcome execution counts; retries and corrections count. Supervisor coordination and human decisions are not role allocations. Genuine human decisions, unexpected evaluator repair, material scope changes and any increase beyond the grant's bound need their ordinary explicit authority. Track A's allocations and cost are accounted for separately. Avoid speculative token-dollar estimates until reliable telemetry exists.

Capture actually available provider usage, quota/reset diagnostics, elapsed time, grants, allocations, retries, human interventions and wall-clock blockers. Mark unavailable measurements **unknown** rather than inferring token or cache costs. Restart-after-quota scheduling belongs to later work; a quota wall during 014e is an honest pause/blocker with exact retained progress.

## 6. Acceptance criteria

| ID | Mandatory, independently checkable result |
| --- | --- |
| **AC01** | Existing Harness project config still resolves its trusted methodology and executes normal workflows; the new external config derives the **same exact trusted N+1 identity** from committed Harness Git history without copying skills/contracts/policy into Stockdif. Active grants remain pinned across later working-tree changes. |
| **AC02** | Stockdif's public artifacts, workflow ledger, candidate commit and committed-input checks use **Stockdif's Git history**; Harness's trusted skill/validator/support identities use **Harness's history**. Swapped, absent, drifted or cross-repository identities are refused. |
| **AC03** | Configured `repository` and `evaluation` workspaces, role exposure rules, actual subprocess permissions and private archive roots preserve isolation. Public Stockdif workers cannot access private evaluator assets or mutate Harness; protected evaluation runs without a private-workspace fallback. Negative path/symlink/overlap tests fail closed. |
| **AC04** | Stockdif role grants have no automatic Git publication. Mismatched Harness/Stockdif remotes, unexpected Git cwd/roots and attempted worker-side direct publication are denied in safe, controlled negative tests; no actual unauthorized push occurs. Local role commits remain usable without a remote push. |
| **AC05** | An unchanged Harness self-development regression and focused external-project tests pass using the exact H1 implementation candidate, including relevant host maintenance 003 regressions. No automatic trusted-methodology change, installer or fixture-specific authority exception is required. |
| **AC06** | The real Stockdif Spike 001 executes Brief Readiness → human freeze → Design Map → protected Evaluator Prepare → Implementation → independent Evaluator Verify under a valid, bounded Harness grant. All public outputs and application changes belong only to Stockdif. |
| **AC07** | The real Stockdif evaluator either produces a truthful failure/blocker or records a genuinely eligible PASS followed by successful, identity-checked **Stockdif-local** evaluator evidence promotion. For a successful canary, As-Built, human acceptance and Outcome complete in Stockdif without any GitHub push prerequisite. |
| **AC08** | The live run identifies exact H1 and Stockdif commits, N+1 methodology identity, frozen brief/evaluator identities, host events, confirmed versus unconfirmed provider properties, interventions and observable consumption. Any correction/retry retains forward-only history; no claims rely on invented model, cost or promotion evidence. |
| **AC09** | Harness 014e's independent evaluator, prepared before implementation, verifies H1's generic behavior and the predetermined public-safe canary evidence. The final 014e result, archive, As-Built and human acceptance distinguish architecture success, product success and known limitations instead of treating fixture assertions as real execution. |
| **AC10** | Harness and Stockdif retain separate commit histories, grants, evidence roots and publication decisions. The Stockdif branch remains unpushed by automation; any eventual push is an independently checked, human-executed operation to `Janco-Yspeert/stockdif`. |

A failure of repository or evaluator-private containment is **not** an acceptable partial canary success. If external execution cannot safely proceed, preserve the passing deterministic evidence and report the canary as blocked; do not manufacture the external-run evidence.

## Out of scope

- Installing, packaging or distributing Harness; replacing its host; generalized multi-project orchestration or a remote project registry.
- Vendoring Harness skills/contracts/policy into Stockdif or creating an independent Stockdif methodology trust root.
- Automatic GitHub publication, generalized remote Git push support, pull-request creation or repository merging.
- Further skill-revision process redesign, TDD/As-Built instruction enhancements, optional code-review roles, decomposed multi-agent implementation, agent-neutral wrappers or autonomous product development.
- Full usage/billing telemetry, quota-reset scheduling/restarts, persistent shared provider contexts or speculative context-caching savings.
- Additional Stockdif application scope beyond its own independently frozen Spike 001 brief; repeated live canaries for ordinary small changes.

## Completion and handoff

Freeze this brief after Brief Readiness resolves genuine blockers. The subsequent Design Map must make an explicit enforceable runtime/workspace isolation choice, and implementation must not begin until it does. The Stockdif product brief remains a **separate, independent brief** and must pass its own ordinary readiness/freeze gate. The exact external repository and runtime commits are resolved again at the relevant freeze and preflight boundaries.

After a successful Stockdif cycle, evaluate 014e against its own pre-frozen plan, obtain Harness-side human acceptance, and produce a truthful 014e Outcome. Record any generic portability defects discovered by the canary without quietly turning them into new product requirements or unfrozen evaluator criteria. Only then consider broader installation/multi-project extraction and the deferred 015 telemetry/recovery work.

**This document is a draft brief, not a Workflow Execution Grant, frozen contract, human acceptance or authorization for automatic publication.**
