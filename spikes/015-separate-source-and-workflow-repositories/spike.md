# Spike 015 - Separate Source and Workflow Documentation Repositories

**Status:** Draft for Brief Readiness and human review; not frozen

**Starting point:** The accepted Harness v1 baseline on `main`, including the existing external-project, host-owned containment, canonical authority, pre-semantic readiness, correction, and recovery mechanisms. Earlier spike evidence remains immutable. Pre-existing CI/environment failures must be distinguished from regressions introduced by this spike.

## Purpose

Allow a governed project to keep application source and public workflow documentation in **two independent Git repositories**, while Harness continues to use its separately trusted methodology checkout and evaluator-private storage. Preserve exact, repository-qualified provenance, narrow role-specific filesystem and Git authority, and unchanged single-repository behavior.

Prove that the arrangement can be bootstrapped and used with a **real provider**, not merely configured or exercised by mocks.

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

### 5. Usable bootstrap, not just a configuration test

Supply an understandable example configuration, layout, startup instructions and host preflight for clean, separate source/docs/methodology checkouts plus evaluator-private storage. The example must not require editing Harness for a particular application, moving source into docs, or granting an agent blanket access to all three repositories.

Demonstrate an ordinary complete split-repository workflow with **at least one real supported provider**. The evidence must show:

1. Validated repository identities, expected branches/origins, a trusted and explicitly selected **pinned runtime/methodology** revision, and an accepted bootstrap basis; no uncommitted or untrusted candidate is misrepresented as installed/trusted.
2. Canonical preflight/readiness and a real governed provider allocation with effective workspace permissions, authorized reads, and a successful semantic role result. A harmless probe or zero process exit alone is insufficient.
3. Brief Readiness through frozen brief, Design Map, evaluator preparation, source implementation commit, evaluator verification and eligible public promotion, As-Built, explicit human acceptance, and Outcome, using the **existing** methodology and authority transitions.
4. At least one realistic bounded failure/recovery or correction path completed through the existing governed mechanism, with prior evidence retained. No manual ledger editing, skipped role, manufactured verdict, or fresh private evaluator exposure to implementation.
5. Local committed source and docs artifacts, exact provenance for both lineages, correct role write boundaries, and a reconstructed state from the docs ledger. The run must progress without product-specific host source edits or remote pushes.

The accepted/trusted/pinned **bootstrap** demonstration may be recorded at the established human-acceptance/closeout boundary if a new contract/runtime revision must first be accepted or adopted. Candidate-mode tests alone are not this demonstration. Do not allow a candidate methodology to approve its own adoption.

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
| **AC10** | As-Built, human acceptance, Outcome and existing bounded correction/recovery work with cross-repository provenance and no new authority path. |
| **AC11** | Every spawned provider/attached eligibility decision and effective containment respects per-workspace role access; wrong-root writes and ungranted Git actions are refused. |
| **AC12** | No automatic remote publishing, raw worker Git credentials, cross-repo atomicity claim, new methodology engine, or silent historical migration is introduced. |
| **AC13** | Example setup and diagnostics allow a clean external project to pass preflight without source-specific Harness code changes. |
| **AC14** | At least one real-provider end-to-end split workflow reaches Outcome and demonstrates meaningful authorized reads/writes, local commits, one governed recovery, and both repository lineages; mocked probes alone cannot pass. |
| **AC15** | Required contract changes are versioned, pinned and adopted forward-only; the demo identifies the exact accepted/trusted runtime and methodology revisions and never uses candidate self-authorization. |

## Verification boundaries

Independent evaluation should cover, at minimum, deterministic fixtures for: legacy single-repo parity; positive split-mode discovery; root/origin/realpath failures; wrong-repo and wrong-commit inputs; stale source or docs HEAD; grant and artifact lineage; read-only source roles; implementation's denied docs writes; host-brokered public evidence; evaluator-private nonexposure; exact post-PASS promotion into docs; partial commits and local recovery; repeated dispatch/idempotency; and unchanged operational-versus-semantic retry accounting.

Exercise the actual host action, Git, ledger, workspace and containment seams rather than mocking the boundary under test. Keep deterministic tests exhaustive and the live-provider demonstration deliberately bounded in cost. Preserve the full real-provider observations, including failures and corrections, without treating provider diagnostics as semantic results.

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
7. Perform and preserve the pinned, accepted real-provider bootstrap proof; record its exact revisions and repository commit pair. Do not call the split mode operationally proven before this evidence exists.
8. Record Outcome only when the required acceptance and demonstration evidence is available, or truthfully record an incomplete/blocked closeout under existing workflow rules.

**This draft does not freeze the contract, authorize implementation, declare provider verification successful, or adopt a methodology.**
