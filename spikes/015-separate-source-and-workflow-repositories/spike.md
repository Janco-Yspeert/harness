# Spike 015 - Separate Source and Workflow Documentation Repositories

**Status:** Draft for Brief Readiness and human review; not frozen

**Starting point:** The accepted Harness v1 baseline on `main`, including the existing external-project, host-owned containment, canonical authority, pre-semantic readiness, correction, and recovery mechanisms. Earlier spike evidence remains immutable. Pre-existing CI/environment failures must be distinguished from regressions introduced by this spike.

## Purpose

Allow a governed project to keep application source and public workflow documentation in **two independent Git repositories**, while Harness continues to use its separately trusted methodology checkout and evaluator-private storage. Preserve exact, repository-qualified provenance, narrow role-specific filesystem and Git authority, and unchanged single-repository behavior.

Prove the arrangement with a **short real-provider external-project coding smoke test**, not merely mocks or configuration checks. Keep that proof deliberately smaller than a second full-methodology certification.

The intended result is a small additional workspace boundary, **not** a generalized multi-repository orchestration system.

## Problem and question

The current external-project model separates the project repository from the Harness methodology checkout and evaluator-private material. It nevertheless assumes that the public workflow directory, canonical ledger, and public role artifacts live inside the project source repository. Its path checks reject public workspaces and workflow directories outside that repository. Role contracts, artifact resolution, commit lookups, evidence actions, and provenance commonly assume that one `project.root` Git `HEAD` identifies both the product and its workflow documentation.

Counterverse needs briefs, design maps, coverage maps, reviews, historical evaluation promotion, As-Built, acceptance, and Outcomes outside the application source repository. Simply configuring a second directory would leave ambiguous commit identity and risk unintentionally granting source or documentation writes to the wrong role.

**Question:** Can Harness add one optional workflow-documentation Git repository, retain one canonical authority history, and execute its ordinary complete methodology without confusing source commits with documentation commits or broadening access?

## Proposed bounded seam

Introduce optional project configuration **`workflowWorkspace`** naming an already configured workspace. When absent, it resolves to the existing `repository` workspace and all historical configurations keep their current meaning.

For split mode, use three distinct, validated public/trusted Git roots:

- **`repository`**: application/product source. Implementation produces candidate commits here.
- **`workflow`** (the workspace named by `workflowWorkspace`): documentation repository. The workflow directory, canonical `workflow.jsonl`, public role artifacts, promoted public evaluator history, and ordinary public checkpoints belong here.
- **methodology root**: the existing separately committed and trusted Harness methodology/runtime checkout. It is not an agent-writable project workspace.

**`evaluation`** remains evaluator-private, outside *all* public/trusted Git repositories. Host-private canonical/execution provenance remains private as currently required. The documentation repository is **public to authorized roles**, not a license to expose evaluator-private files.

A split configuration should be possible with a minimal extension to `schemaVersion: 1` external-project configuration, rather than a second project or a second workflow engine. As with the existing project `origin`, split mode must explicitly declare a recognized expected docs origin (e.g. `workflowOrigin`) and validate it against the actual Git remote. Configuration remains outside the participating repositories. Exact property spelling and schema layout may be resolved in the Design Map, provided the behavioral constraints below hold and the optional `workflowWorkspace` seam remains recognizable.

## Required behavior

### 1. Location and identity

1. Resolve configured paths to real paths and validate actual Git top-levels, not path strings alone. In split mode source, docs, and methodology must be **distinct, non-nested** Git repositories; evaluator-private and host-private roots must not overlap any of them. Refuse symlink escape, duplicate roots, absent repositories, invalid workspace aliases, or origin mismatches **before** a grant or provider exposure.
2. The docs workspace must own the configured workflow directory and ledger; the source workspace must own candidate code. A role artifact or host evidence action must be resolved against its declared owner, never inferred from the process working directory.
3. Keep **one** canonical workflow ledger in the docs repository. Do not clone authority into both repos or reconstruct state from two competing ledgers. Operational/private evidence retains its existing authority relationship.
4. Allow only one docs Git repository for a project in this spike. No arbitrary workspace/repository graph or nested project handling.

### 2. Exact provenance and Git actions

1. Every new authority, input, role result, checkpoint, and host action that relies on committed data must distinguish its **repository identity**, full Git commit, repo-relative path where applicable, and content identity. Source candidates are bound to source commits; frozen briefs, design maps, coverage, verification artifacts, As-Built, acceptance, and Outcome bind to docs commits. Existing trusted methodology/runtime identities remain separate.
2. Each new role allocation resolves an exact **source/docs commit pair** appropriate to its frozen inputs. Record both repositories' validated identities and the relevant commit snapshots in the governed provenance. Later authorized commits advance their own lineage explicitly; an unrelated HEAD movement must neither be silently accepted nor retroactively rewrite an earlier binding.
3. Resolve and validate committed artifacts from the Git repository to which they belong, including verification and human-correction evidence. Never interpret a docs artifact path against source `HEAD`, or treat a docs commit as the implementation candidate. Fail closed on wrong repository, path, commit, content, branch/ancestry, or stale authority.
4. Preserve append-only history without a self-referential commit hash requirement: an event may bind a preceding committed snapshot, with the subsequent Git checkpoint identified through a later record or existing host evidence mechanism. Do not claim a ledger commit can contain its own Git SHA.
5. Commit only to the explicitly authorized local repository and ref. Retain existing host-mediated privileged-action checks and credential isolation. **No implicit push, remote publication, atomic cross-repository transaction, or new publishing power.** A failure or partial local checkpoint in one repository must remain observable and recoverable, not described as an atomic success.

### 3. Role access and artifact flow

The effective grant and provider containment must express **per-workspace** access, not one blanket `repository-write` capability silently applied to every mounted repository.

| Role | Source repository | Docs repository | Evaluator-private |
| --- | --- | --- | --- |
| Brief Readiness, Design Map | Read as needed | Write only required public artifacts/checkpoints | None |
| Evaluator prepare/repair | Read as permitted by existing exposure rules | Write required public coverage/checkpoints | Scoped read/write |
| Implementation | Read/write, including authorized local source commits | Read public frozen inputs; only narrowly host-brokered public evidence writes | None |
| Evaluator verify | Read candidate, no source writes | Read; host-brokered verification result, checkpoint and eligible promotion | Scoped read/write |
| As-Built, Outcome | Read source/candidate | Write required public artifacts/checkpoints | None |
| Human decisions and deterministic promotions | No ambient agent write | Host-owned append/commit/promotion only, within exact authority | Host-only access where required |

Permissions are maximums, not automatic entitlements: use the existing role contract and host-granted capabilities to narrow them further. A docs-authoring role must not acquire source-write merely because it needs to inspect source. An implementer must not acquire arbitrary docs-write to update `manifest.md`; route its permitted public handoff/checkpoint through the existing bounded evidence/host-action pattern or a minimal equivalent. An evaluator must not gain source-write or expose private evaluator state to implementation. Git credentials, hooks and repository configuration remain protected under existing containment rules.

Update affected pinned skill/role contracts only where needed to describe these permissions and artifact owners. Version material contract changes and adopt them through established forward-only trust authority. Do not create a second methodology or role authority system. Existing exposure-history and attached-session eligibility restrictions continue to apply.

### 4. Backward compatibility

When `workflowWorkspace` is omitted:

- Existing `schemaVersion: 1` self-development and external-project configurations load unchanged.
- The existing `repository` workspace still owns source, workflow directory, ledger, and public artifacts; historical unqualified commit/evidence records retain their original repository meaning.
- Existing CLI/host workflows, grants, role results, recovery, promotion, and trusted methodology resolution retain their semantics; no migration or wholesale rewrite of old ledgers is required.
- A newly split workflow does not reinterpret any preexisting workflow as split by inspection of adjacent directories. Conversion of a live historical workflow is out of scope.

Any new repository-qualified fields must be forward-compatible with historical records, but **absence of fields in a new split-mode event is not permission to guess**.

### 5. Usable bootstrap and short external-project E2E

Provide an understandable example config and preflight for **three independent checkouts** (source, docs, Harness methodology/runtime) plus evaluator-private and host-private storage. Neither app-specific code nor manually relocated artifacts are prerequisites.

Run **one short, genuinely useful coding smoke test** with a real, supported provider under the existing Harness host and governed role machinery:

1. Create a disposable external source Git repository containing a tiny program/library with a well-defined failing or missing behavior (for example a trivial TypeScript utility). Initialize an independent docs Git repository and point the split project configuration at both; keep methodology and evaluator-private directories separate.
2. Validate each root, actual Git identity, origins where required, trusted/pinned methodology/runtime, workspace grants and effective provider containment. Record the exact starting source/docs commits.
3. Establish the **valid minimum Harness authority and public frozen inputs needed to dispatch the coding role** under the existing methodology. Use existing governed transitions and/or a deterministic fixture with honest, explicit provenance. Do not forge a green evaluator result, silently skip mandatory state, or redefine the production methodology just to make the demonstration convenient. Earlier methodology phases need **not** each be rerun live with a provider.
4. Have the **real provider** execute an actual governed **Implementation** role: read its permitted public brief/design in docs; modify application source; run the project's ordinary test/check; and create the authorized **local source commit**. Produce or request the required public role evidence/checkpoint in docs through its authorized host-brokered channel, without general docs write access. Require an accepted **semantic Role Result**, not just process exit or readiness PASS.
5. Confirm independent final source/docs commits and repository-qualified content identities; prove denied direct docs writes, denied ungranted source writes for docs-authoring roles, and evaluator-private nonexposure using deterministic boundary tests. Reconstruct workflow state from the docs ledger. Preserve real-provider launch/role evidence and any failures truthfully.

A small smoke proves that Harness can **build something useful outside its own repository while storing its development records elsewhere**. It does **not** claim to prove every role in a fresh Brief Readiness → Outcome cycle.

**Run the pilot early:** as soon as config resolution, role dispatch and workspace routing exist, execute the disposable external-project scenario (using a deterministic provider initially if necessary) to expose integration errors before adding more abstractions. Finish with the same focused scenario using a real provider and an accepted/pinned runtime. The early diagnostic run carries no methodology-verification or adoption authority. The full-workflow, repair, promotion, historical compatibility and negative-permission matrix belongs primarily in deterministic integration coverage, where it is reproducible and cheaper.

If actual execution reveals a necessary adapter/contract deficiency, fix only the bounded deficiency needed for this proof; do not grow the scope into session persistence, an installer, general multi-repo support, new host authority kinds, or a second implementation of the entire methodology.

Use an explicitly trusted, pinned runtime/methodology for the acceptance smoke. If a new runtime or methodology version must first be independently evaluated and accepted/adopted, record that transition through the **existing** authority process before claiming bootstrap success. Never let an untrusted candidate self-certify.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| **AC01** | Omitted `workflowWorkspace` reproduces the existing single-repository behavior, including historical records and external-project cases. |
| **AC02** | Split config accepts one distinct docs Git repository with one canonical workflow directory/ledger, while source and methodology remain separate. |
| **AC03** | Preflight fails closed for overlapping/nested roots, symlink escape, missing or mismatched source/docs origins, invalid workspace mode/alias, and misplaced private roots. |
| **AC04** | Source candidate and docs artifacts use repository-qualified exact commit/path/content provenance; grants retain the intended source/docs snapshot pair and existing trusted methodology/runtime binding. |
| **AC05** | Committed artifact lookup, frozen input validation, verification, recovery and correction refuse wrong-repo commits, stale bindings, mismatched content and ancestry. |
| **AC06** | Only the docs ledger determines canonical methodology transitions; a docs/source partial checkpoint cannot produce a false combined success. |
| **AC07** | Brief Readiness and Design Map can write docs without source-write; their public artifacts freeze and resolve from docs commits. |
| **AC08** | Implementation writes/commits source and reads public docs, but cannot arbitrarily write docs or see evaluator-private materials; its required public evidence still completes through bounded host action. |
| **AC09** | Evaluator prepare, repair and verify retain private isolation, candidate/source read boundaries, host-owned result/checkpoint writes, and complete eligible promotion into docs. |
| **AC10** | Deterministic integration coverage shows existing As-Built, human acceptance, Outcome, and bounded correction/recovery can resolve split-repository inputs without a new authority path. |
| **AC11** | Every spawned provider/attached eligibility decision and effective containment respects per-workspace role access; wrong-root writes and ungranted Git actions are refused. |
| **AC12** | No automatic remote publishing, raw worker Git credentials, cross-repo atomicity claim, new methodology engine, or silent historical migration is introduced. |
| **AC13** | Example setup and diagnostics allow a clean external project to pass preflight without source-specific Harness code changes. |
| **AC14** | One bounded real-provider governed **coding** smoke operates in an external source repository with separate docs, reads its authorized brief/design, changes source, runs the project check, commits source locally, records permitted docs evidence, returns an accepted semantic Role Result, and records both exact Git lineages. It need not run every methodology phase live or manufacture a recovery. A mock or readiness-only probe cannot pass. |
| **AC15** | Required contract changes are versioned and adopted forward-only; the smoke identifies exact trusted runtime/methodology revisions and valid authority prerequisites, never allowing candidate self-authorization. |

## Verification boundaries

Independent evaluation should cover, at minimum, deterministic fixtures for: legacy single-repo parity; positive split-mode discovery; root/origin/realpath failures; wrong-repo and wrong-commit inputs; stale source or docs HEAD; grant and artifact lineage; read-only source roles; implementation's denied docs writes; host-brokered public evidence; evaluator-private nonexposure; exact post-PASS promotion into docs; partial commits and local recovery; repeated dispatch/idempotency; and unchanged operational-versus-semantic retry accounting.

Exercise actual host action, Git, ledger, workspace and containment seams rather than mocking the boundary under test. Use deterministic fixtures for the full phase/repair/promotion matrix. Keep **one** live coding smoke short and inexpensive; do not force an entire live methodology cycle or intentional live failure/recovery. Preserve real-provider observations and any naturally occurring failures without converting provider diagnostics into semantic results.

## Explicit non-goals

- Arbitrary multi-repo dependency graphs, multiple docs repositories, submodules/worktrees as a new model, or distributed workflow authority.
- Atomic commits across Git repositories, cross-repository merge orchestration, automatic push/pull/PR creation or remote publication.
- Porting the host to macOS, Windows, or a new isolation implementation.
- Replacing bubblewrap, changing evaluator secrecy policy, adding broad session persistence, remote access, cost telemetry, context caching or new provider adapters.
- Rewriting legacy spike history or migrating an active single-repo workflow.
- Changing the methodology's phase sequence, independent evaluation rule, human acceptance gate, or trusted-adoption authority.
- Counterverse-specific product logic or a generalized document-management framework.

## Methodology and scope control

1. Run **Brief Readiness** on this draft under the currently trusted methodology. Address findings and preserve preliminary rejected drafts as required.
2. Freeze `spike.md` with committed provenance; then freeze the minimal Design Map, including exact config property names, artifact ownership, commit-pair representation and per-role access mechanics.
3. Prepare independent evaluation and pass the existing pre-freeze integrity gate before implementation exposure.
4. Implement the narrow configuration, path, provenance, permission and host-action changes; keep old behavior under regression tests.
5. Verify through the independent evaluator, preserving all attempts and correcting only under existing bounded authority. Promote eligible history after `PASS`.
6. Record As-Built, obtain explicit human acceptance, and complete any required forward-only runtime/methodology adoption without granting a candidate its own authority.
7. Perform and preserve **one short real-provider external coding smoke**, after any required trusted runtime/methodology adoption; record its authority, semantic result, actual source change/test, docs checkpoint and exact commit pair. Its outcome is a practical bootstrap check, not a claim that a full live methodology was independently rerun.
8. Record this **Spike 015's** Outcome only when its evaluation, human acceptance and bounded smoke evidence exist, or truthfully record an incomplete/blocked closeout under existing workflow rules.

**This draft does not freeze the contract, authorize implementation, declare provider verification successful, or adopt a methodology.**

**Retrospective scope safeguard:** the external-repository pilot is the forcing function. Do not introduce extra review phases, a generalized documentation platform, or exhaustive live multi-role proof to solve a targeted repository-layout problem.
