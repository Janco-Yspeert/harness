# Design Map — Spike 015 (Separate Source and Workflow Repositories)

Bound brief: `spike.md` `sha256:cd9485caa4689a2001521e45e3ed39edb8fc0e0b99fb90b90cc72f8348658010` (verified; committed at `550cbd145d4ede7eb13227cc2b71d43a90cf8829`). The four non-blocking Brief Readiness clarifications are settled below as shared contracts that preserve the frozen behavior; none changes scope.

## Shared contracts

**Configuration (external-project `schemaVersion: 1`, outside all participating repos).**
- `workflowWorkspace?: string` — a key in `workspaces`. Omitted ⇒ `"repository"`, and every historical configuration keeps its current meaning.
- `workflowOrigin?: string` — same recognized-origin syntax as `origin`. Required exactly when `workflowWorkspace` names a workspace other than `repository`; validated against the docs repository's actual remote. Rejected when `workflowWorkspace` is omitted or is `repository`.
- The workspace named by `workflowWorkspace` must be `exposure: "public"`, a real Git top-level, and distinct from and non-nested with `repository`, the methodology root and every private root. Private evaluation and host-private roots must overlap none of the three.
- `workflowDirectory` and `ledgerName` resolve against the **workflow workspace root** (the project root when not split). The one canonical ledger lives there. Source code and `project.root` keep meaning the source repository.
- Only one workflow workspace per project. Any preflight failure listed in AC03 occurs before grant or provider exposure.

**Repository-qualified commit binding.** Every new committed-data binding is `{ workspace: "repository" | "workflow", repository: <configured workspace id>, commit: <full 40-hex SHA>, path?: <repo-relative>, sha256?: <content identity> }`. The workspace key is the owner; the id and validated origin are recorded alongside it so a binding cannot be replayed against another repository. In split mode an unqualified commit field is invalid, and absence is never defaulted. In non-split mode, historical unqualified commit fields mean `repository`, and new events may stay unqualified. Methodology/runtime identities keep their existing separate fields.

**Allocation pair.** A role allocation records `{ source, workflow }` bindings (the two workspace keys above). The source side is source `HEAD` at allocation for roles without a source candidate input, and the frozen candidate commit for roles bound to a candidate. The workflow side is the docs commit that holds the role's frozen inputs. Both are recorded at allocation and never re-resolved. Later `HEAD` movement in either repository neither invalidates nor rewrites the recorded pair. A docs-only advance does not stale an implementation's source side, and the reverse also holds. A new checkpoint must name its predecessor binding explicitly. Source candidates bind only to `repository`. Briefs, design maps, coverage, verification artifacts, As-Built, acceptance and Outcome bind only to `workflow`. Artifact and evidence lookup is by the declared owner's binding, never by working directory.

**Per-workspace grant access.** In split mode an effective grant carries an explicit per-workspace access map, `access: { <workspaceKey>: "none" | "read" | "write" }`, which provider containment consumes and which can only narrow the configured workspace `mode`. The flat `repository-write`/`git-commit` capabilities do not widen access in split mode. A split-mode grant without the map fails closed. Git-commit authority is likewise per workspace, so `write` on a workspace does not imply commit there. In non-split mode the flat capabilities retain their existing meaning for the single `repository` workspace. Role access maxima are the brief's §3 table, and the role contract may narrow them.

**Brokered evidence.** The existing host `evidence` action keeps its shape and gains only an owner: its allowlisted destinations are resolved against the workflow workspace, and the host writes and commits there. Implementation receives no direct workflow write. No new host-authority kind and no push or remote action exists.

**Partial checkpoints.** A source commit and a docs commit are independent local events. Canonical state derives only from the docs ledger. A source commit absent from a docs-ledger record is observable but confers no methodology transition. A docs checkpoint is never described as covering a source commit unless its records bind both.

**Fixture prerequisites (smoke dispatch).** A deterministic fixture may supply prerequisite events only if they are marked `fixture-sourced`, are distinguishable from evaluator-attested events, and carry no adoption or verification authority. A fixture result may not satisfy PASS, human acceptance or trusted adoption.

**Observable surface for evaluation.** Evaluation uses black-box config load or preflight outcomes, ledger and grant records, containment results (attempted writes), git logs of the two repos, and host action results. No structural internal name is required of implementation beyond the configuration properties, binding shape and grant `access` map above.

## Design decisions

- Property names `workflowWorkspace`, `workflowOrigin` and grant `access` are fixed here; any additional record spelling is implementation freedom if it can express the binding fields above.
- Contract/skill changes are limited to describing per-workspace access and artifact owners. They are versioned and adopted through the existing forward-only trust authority; the candidate gains no self-authority.
- Existing exposure-history and attached-session eligibility rules apply per workspace to each spawned or attached session.

## Invariants

- Omitted `workflowWorkspace` is behaviorally identical to today, with no migration, and no adjacent-directory inference of split mode.
- Exactly one canonical ledger; no copy or competing ledger in source.
- Evaluator-private and host-private material are never inside, mounted from, or writable through any public or trusted repo.
- No role gains write on a workspace its contract and grant do not name; docs-authoring roles hold no source write, and implementation holds no ambient docs write.
- Wrong repository, path, commit, content, ancestry or stale authority fails closed.
- No implicit push, raw credentials, or cross-repository atomicity claim. A partial checkpoint stays visible and recoverable.
- Operational versus semantic retry accounting is unchanged.

## Implementation freedom

- Internal module layout, type names, and how workspace resolution and path ownership are plumbed.
- Concrete encoding of origin and identity checks, and how repository identity is cached.
- Containment mechanism details (mounts, Git-dir exposure), provided effective access matches the grant map.
- Event or record naming for later docs checkpoints, provided predecessor linkage is explicit.
- Example config and preflight packaging, and the choice of disposable smoke project.
