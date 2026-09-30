# Design Map — 014g Verifier Containment Composition

Brief: `spike.md` (`sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`), the recovery revision that adds the authority model clarification. It supersedes the map bound to `sha256:52f1c9fc…` and its design decisions carry forward unless stated below.

## Shared contracts

**SC1 — Frozen regression set (brief requirement 8, readiness M1).** AC03 refers to every test whose title begins `014e` in `test/external-project.test.ts`, at git blob `4b361f81e307e129be6d106c9df9a4910e674be9` (commit `a36fd6e`). Their bytes and assertions must be unchanged by the repair. The set is the whole 014e group, not only the test seen failing in 014f. The two known parent-boundary-sensitive tests are:
- `014e AC03/AC04/D4: contained public and protected workers see only their granted workspaces, no Harness writes and no Git credentials`
- `014e D4 (H4): inside containment the real Codex sandbox lets a write grant commit, keeps hooks and config read-only, and still denies commits under plain workspace-write`

A test reported as skipped counts as not passing.

**SC2 — Regressions run as a verifier command (readiness M2).** The regression must run as a command of a verifier under the candidate-defined effective sandbox (see SC6). A host-run result that a verifier merely binds does not satisfy AC03. The candidate-subject run launches through the registered adapter path and runs the frozen set from inside it.

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

**SC6 — Two evidence classes (brief authority model, requirements 4, 6, 9).**
- *Authoritative (trusted N):* verification runs under the exact trusted N role, skill, contract and methodology. Its launch composition is not altered by the candidate. Trusted N runs the required regression suite except the 014e group. A 014e result it observes under its broader parent authority is recorded as not adjudicated, neither pass nor failure. Where that record lives, and how the existing result vocabulary carries it, is evaluator design (readiness C1).
- *Candidate-subject (N+1):* a separate bounded execution under N+1's proposed workspace, capability and host-action composition, running the unchanged frozen 014e set (SC1) as a command from inside it. It is an observation, not a verdict. It cannot emit the authoritative result, establish trust, replace the evaluator or advance the workflow. Its evidence-action allowlist must not include the authoritative verification-result path or any workflow-state path.
- Subject evidence is public evidence stored apart from the authoritative verification result, and states the exact candidate, candidate composition, runtime and observed outputs. Trusted N must independently establish that binding before using it. Evidence at `27af3a8` may be reused only for launch composition and host-evidence-action observations, never for AC03.
- The subject fixture is the smallest one that runs the unchanged 014e blob bytes under the candidate composition without modifying the candidate. Other provider work is not repeated (readiness C2).

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
- Candidate-subject execution never governs, certifies or gates its own verification, and trusted N never receives N+1 capabilities while evaluating it (AC08). Cutover to N+1's composition happens only after human acceptance and ordinary promotion, and is not backdated.
- Existing governed execution, private exposure, promotion, containment, nested-sandbox and executor-selection behavior stays unchanged for roles that do not use the mediated action (AC05).
- Effective permissions are visible in the grant and ledger. An unsupported composition is refused, never silently downgraded (AC06).

## Implementation freedom

- The form of the subject fixture and how the subject evidence is packaged, provided SC6 holds.
- The wire shape and name of the host action, and whether it reuses the publication path or adds a new action kind.
- How the allowlist is expressed in the contract, provided it is data and not a provider-controlled value.
- How the host validates, writes and commits (staging, hooks, author identity), and how the ledger record is laid out.
- How the read-only repository is enforced: Claude permission rules, bind mode, or both.
- Test structure for the new behavior, provided evaluation exercises the real launch path (SC2).
