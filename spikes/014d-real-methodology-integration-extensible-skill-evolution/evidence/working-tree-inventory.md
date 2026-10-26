# 014d working-tree inventory before implementation

This inventory was taken by the implementation execution
`cd96aa6f-1fdc-4521-9238-4b45ff1c9e22`. It was required by the canonical human
response `b90a79da-738b-4df5-ac8b-e1e65c589a1a` to request
`4fef0137-e8f7-4bfd-9ba9-ed7951a0273a`:

> preserve current work and authorized maintenance; do not adopt, discard, or
> rebuild from Git history alone; first perform a provider-free public
> inventory … reporting exact unexplained paths and origin before any
> destructive decision.

The inventory is provider-free and public. Its sources were:

- `git status` and `git diff` against `HEAD`
  `0b550644544f98571fbbade9af2234bdd70cd98d`;
- file mtimes (local time +02:00, given below in UTC);
- the public `workflow.jsonl`;
- `host-maintenance-00{1,2}.md`.

No evaluator-private material was inspected. Nothing was deleted, reverted or
stashed.

## Baseline

- At `HEAD`, a clean worktree passed all 147 tests.
- With the pre-existing tree: 170 tests, 163 passed and 7 failed.

## Origins

### D — unattributed pre-recovery draft of candidate N+1

- **When:** mtimes 2026-09-24 22:41–22:52 UTC (`test/worker-context.test.ts`
  22:57).
- **Probable origin:** implementation execution
  `49e9dfe9-dc7e-4774-8bb3-f790df889d81`. The ledger shows it `running` from
  22:37:46Z to `failed` at 22:57:39Z. It ran under the Workflow Grant that
  recovery `d86c645e-d06c-4717-906e-439c0dfb7d83` later revoked, against the
  invalidated Design Map `sha256:f5193434…` and evaluator revision `001`.

  This origin is inferred from timing. No committed record attributes the
  files, and the ledger does not say which files that execution wrote.
- **Files:**
  - `src/kernel/trust.ts`: `trustedDefinition`, which resolves N from Git
    objects;
  - `src/kernel/methodology.ts`: `definitionFrom` and `promotion.plan`
    validation;
  - `src/executors/governed.ts`: the C9 `workerContext` split;
  - `src/methodology-evolution.ts`: `ACTIVE_ROLES` removed, generic coherence,
    `roles` diff, and C5 binding;
  - `tools/archive-manifest.ts`: plan schema v2, the real-file manifest and
    refusals;
  - `methodologies/harness/contracts/{evaluator-verify,implementation}.json`;
  - `skills/{brief-readiness,design-map,evaluator,implementation,as-built,outcome,orchestrator}/SKILL.md`;
  - `docs/history/skills/README.md` and the untracked
    `docs/history/skills/{brief-readiness/v4,design-map/v3,evaluator/v13,implementation/v4,as-built/v3,outcome/v4,orchestrator/v2}.md`.
    Each history copy was verified byte-identical to its `HEAD` skill.
  - `test/archive-manifest.test.ts`, `test/worker-context.test.ts`, and the
    draft parts of `test/methodology-evolution.test.ts` (C5, AC11, EA4).
- **Interleaved in files it shares with maintenance:**
  - `src/kernel/model.ts` (`promotion.plan`);
  - `src/kernel/resolver.ts` (`plan` in the grant; `artifactCommit`
    provenance);
  - `src/kernel/execution.ts` (`methodologySource`; plan archived exactly
    once; `planIdentity`);
  - `src/kernel/host.ts` (`methodologySource: trustedDefinition`);
  - `methodologies/harness/policy.json` (the incomplete-archival gate).
- **Later draft-style edits:** `test/skill-fidelity.test.ts` (mtime 10:08
  UTC, 2026-09-25), the EA5 tests in `test/governed-executors.test.ts`, and
  the scripted scenario support in `tools/fixtures/fake-provider.ts` carry
  2026-09-25 mtimes (09:50–10:08 UTC). Their authoring execution is not
  attributable from public evidence. That is before the prior implementation
  attempt `bdfa50ec` started at 10:12Z.

### M1 — host maintenance 001 (`host-maintenance-001.md`, human-authorized)

- `src/kernel/host.ts`: semantic `BLOCKED` records
  `kernel.continuation-stopped`.
- `src/kernel/resolver.ts`: an unmatched canonical `kernel.human-request` is a
  durable gate.
- `src/kernel/execution.ts`: a response after exit closes the gate without
  reviving the worker.
- `methodologies/harness/policy.json`: `blocked` removed from retry
  dispositions.
- Tests in `test/governed-executors.test.ts` ("semantic BLOCKED …",
  "candidate Harness policy never makes semantic BLOCKED retryable", "a
  canonical unanswered human request …", "worker prose does not create a human
  gate") and the matching fake-provider support.

### M2 — host maintenance 002 (`host-maintenance-002.md`, human-authorized)

- `src/kernel/model.ts`: `PreimplementationRecoveryAuthority` and the grant's
  `recovery`.
- `src/kernel/execution.ts`: `recoverPreimplementation`, and revoked-grant
  denial.
- `src/kernel/resolver.ts`: `recoveryScopedEvents`.
- `src/kernel/host.ts`: the `preimplementation-recovery` route.
- `test/kernel.test.ts`: "pre-implementation recovery revokes …".

### U — unexplained or unrelated (not repository content for this spike)

| Path | Observation | Treatment |
| --- | --- | --- |
| `.bash_profile`, `.bashrc`, `.gitconfig`, `.gitmodules`, `.idea`, `.mcp.json`, `.profile`, `.ripgreprc`, `.vscode`, `.zprofile`, `.zshrc` (repository root) | 0-byte character-special files, mtime 2026-09-23 21:31 UTC; consistent with sandbox mount placeholders | untouched, not committed |
| `harness@0.0.0`, `node` (repository root) | empty regular files, mtime 2026-09-22 09:37 UTC; origin unknown (possibly a stray shell redirection) | untouched, not committed |
| `spikes/998a-authority-fixture-154-handoff-adoption/`, `spikes/999g-verification-dedup-148/` | untracked fixture-like spikes, mtime 2026-09-22 18:39 UTC; origin unknown | untouched, not committed |
| `spikes/014d-…/.claude/.cc-writes/` | empty, git-ignored | untouched |
| `spikes/014d-…/workflow.jsonl` | host-owned ledger | untouched, not committed |

## Decision taken

Following the human response, this execution **continued from the preserved
tree** rather than adopting the draft wholesale or discarding it.

- Every D, M1 and M2 hunk above was reviewed against the frozen brief
  (`sha256:8d4302b2…`) and the **replacement** Design Map
  (`sha256:50780fa3…`).
- The D hunks conflict with neither. Where the replacement map changed a
  contract (C4 and C6), the implementation was reconciled; see `manifest.md`,
  Run 006.
- The M1 and M2 code is kept as authorized maintenance. It is interleaved in
  the same files, so the candidate commit necessarily contains it, and its
  maintenance records are committed alongside.
- No category-U path is included.
