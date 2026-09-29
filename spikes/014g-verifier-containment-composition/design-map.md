# Design Map — 014g Verifier Containment Composition

Brief: `spike.md` (`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`), committed at `a36fd6e`.

## Shared contracts

**SC1 — Frozen regression set (brief requirement 8, readiness M1).** AC03 refers to every test whose title begins `014e` in `test/external-project.test.ts`, at git blob `4b361f81e307e129be6d106c9df9a4910e674be9` (commit `a36fd6e`). Their bytes and assertions must be unchanged by the repair. The set is the whole 014e group, not only the test seen failing in 014f. The two known parent-boundary-sensitive tests are:
- `014e AC03/AC04/D4: contained public and protected workers see only their granted workspaces, no Harness writes and no Git credentials`
- `014e D4 (H4): inside containment the real Codex sandbox lets a write grant commit, keeps hooks and config read-only, and still denies commits under plain workspace-write`

A test reported as skipped counts as not passing.

**SC2 — Regressions run as a verifier command (readiness M2).** The regression must run as a command of the allocated verifier under that verifier's effective sandbox. A host-run result that the verifier merely binds does not satisfy AC03. Evaluation launches the verifier through the registered adapter path and runs the frozen set from inside it.

**SC3 — Effective verifier permissions after the repair.**
- The verifier's public repository workspace is read-only, and the evaluator-private workspace keeps the access the verifier needs to work.
- The verifier's role grant no longer carries repository-write or git-commit. Nothing in the launch grants write access to the repository tree, to the Harness checkout or to any host path beyond what the grant lists.
- A nested-containment check therefore starts from a parent boundary that does not already grant the repository write access the check tries to observe.
- These effective permissions are recorded in the execution grant and stay inspectable (AC06).

**SC4 — Host-mediated evidence write and commit.** The verifier publishes its public evidence through a bounded host action requested with the existing `requestAction` mechanism. It declares the action in its role contract and grant `hostActions`.
- The verifier supplies the exact destination paths and exact content bytes, or a bound identity of files it authored.
- The host validates the destinations against an allowlist that comes from the role contract and grant, not from provider prose.
- The host writes and commits only those bytes, attributed to the allocated role and execution.
- The host records the request, the destination and the content identity in the ledger.
- The host neither infers nor generates verification content, and exposes no arbitrary-path mutation.
- A request outside the allowlist is denied and leaves nothing written.

**SC5 — Fail closed before session (readiness M3).** If the host cannot enforce the selected composition (read-only repository, no repository-write or git-commit, mediated action available), the launch is refused before any session or allocation exists. This is the existing 014e D4 behavior. There is no fallback to the previous repository-write grant.

## Design decisions

- **Selected shape: host-mediated mutation (brief shape 2), with the verifier's repository write and commit authority removed.** The role/capability change is a consequence of it, not a separate role split.
- **Shape 1 rejected.** A second recording role would need new workflow transitions and would still give some role an LLM-driven commit authority.
- **Shape 3 rejected.** Claude's permission model has no per-command parent boundary. A verifier that holds repository write cannot run a nested check under a parent that does not, so the composition could not be met.
- **Generic mechanism.** The mechanism is driven only by role contract and grant data. No workflow, spike, candidate, evaluator revision or project is named anywhere in it (AC04). Applying it to other governed roles is allowed. Roles that keep repository-write and git-commit keep their current behavior.
- **Attribution.** The commit author and the ledger entry identify the allocated execution. Provider prose confers no authority.

## Invariants

- Reads stay confined to the exact granted public and evaluator-private workspaces. Home, sibling, credential and unrelated temporary paths stay denied (AC01).
- Writes are limited to explicitly granted paths. No global broadening of Claude's filesystem access, and no read or write access to all of `/tmp` (AC02).
- The frozen 014e tests, 014f authority, candidate `a2ed538330ace7a51b9585dcba404035c72c973f`, evaluator revision `001` and attempts 001 and 002 are not edited (AC07). 014f can allocate a new verification attempt afterwards.
- Existing governed execution, private exposure, promotion, containment, nested-sandbox and executor-selection behavior stays unchanged for roles that do not use the mediated action (AC05).
- Effective permissions are visible in the grant and ledger. An unsupported composition is refused, never silently downgraded (AC06).

## Implementation freedom

- The wire shape and name of the host action, and whether it reuses the publication path or adds a new action kind.
- How the allowlist is expressed in the contract, provided it is data and not a provider-controlled value.
- How the host validates, writes and commits (staging, hooks, author identity), and how the ledger record is laid out.
- How the read-only repository is enforced: Claude permission rules, bind mode, or both.
- Test structure for the new behavior, provided evaluation exercises the real launch path (SC2).
