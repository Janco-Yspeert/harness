# LP1 Primary Evidence — implementation attempt 8

This is the complete externally captured primary evidence for the one standalone
LP1 execution against candidate
`bb541265d994aad1f1af30446bf0a19ad59e1537`. The ordinary outer Harness daemon
owned the run. No formal evaluator run was allocated.

## Request

```json
{"workflow":"013a-Workflow-execution-friction","fixture":"lp1","candidateCommit":"bb541265d994aad1f1af30446bf0a19ad59e1537"}
```

## Final host-owned run record

```json
{"run":{"runId":"70410e45-d8e0-46c0-b343-6be74b8d4260","workflow":"013a-Workflow-execution-friction","phase":"fixture:lp1","methodologyAttempt":"8","executionAttempt":1,"role":"evaluator-verify","skill":"spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md","skillVersion":"11","contractIdentity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","contractDeliveryMode":"claude-system-contract","allocationAuthority":{"type":"canonical-workflow-fixture","workflow":"spikes/013a-Workflow-execution-friction","fixture":"lp1","fixtureIdentity":"spike-013a-lp1","definitionIdentity":"sha256:d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4","candidateCommit":"bb541265d994aad1f1af30446bf0a19ad59e1537","ledgerIdentity":"sha256:a5d857af8dfcf44293c6f3daa42aa7c5effefc9523051756dd78ff73ac5be25c","basisTransition":"implementation-handoff","basisIdentity":"sha256:20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed","contractIdentity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","pinnedContractAuthority":{"name":"evaluator","contractVersion":11,"sourceCommit":"fae05912f59f8ebdb8982ab16deb26e293754647","sourcePath":"skills/evaluator/SKILL.md","identity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","snapshotPath":"bootstrap/evaluator-skill.md"}},"verificationAuthority":{"type":"canonical-workflow-fixture","workflow":"spikes/013a-Workflow-execution-friction","fixture":"lp1","fixtureIdentity":"spike-013a-lp1","definitionIdentity":"sha256:d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4","candidateCommit":"bb541265d994aad1f1af30446bf0a19ad59e1537","ledgerIdentity":"sha256:a5d857af8dfcf44293c6f3daa42aa7c5effefc9523051756dd78ff73ac5be25c","basisTransition":"implementation-handoff","basisIdentity":"sha256:20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed","contractIdentity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","pinnedContractAuthority":{"name":"evaluator","contractVersion":11,"sourceCommit":"fae05912f59f8ebdb8982ab16deb26e293754647","sourcePath":"skills/evaluator/SKILL.md","identity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","snapshotPath":"bootstrap/evaluator-skill.md"}},"executor":"claude","invocationMode":"fixture","replacementReason":null,"previousExecutionId":null,"workspaces":["/home/velveteen/vk-code/harness"],"scratchWorkspace":null,"permissionProfile":{"id":"repo-local-worker","workspaces":["/home/velveteen/vk-code/harness"],"capabilities":["repository-read"]},"orchestrator":null,"pid":3379932,"providerSessionId":null,"status":"completed","terminalDisposition":"completed","terminalReason":null,"roleDisposition":"succeeded","roleResult":{"role":"evaluator-verify","methodologyAttempt":"8","skill":"spikes/013a-Workflow-execution-friction/bootstrap/evaluator-skill.md","skillVersion":"11","verificationAuthority":{"type":"canonical-workflow-fixture","workflow":"spikes/013a-Workflow-execution-friction","fixture":"lp1","fixtureIdentity":"spike-013a-lp1","definitionIdentity":"sha256:d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4","candidateCommit":"bb541265d994aad1f1af30446bf0a19ad59e1537","ledgerIdentity":"sha256:a5d857af8dfcf44293c6f3daa42aa7c5effefc9523051756dd78ff73ac5be25c","basisTransition":"implementation-handoff","basisIdentity":"sha256:20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed","contractIdentity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","pinnedContractAuthority":{"name":"evaluator","contractVersion":11,"sourceCommit":"fae05912f59f8ebdb8982ab16deb26e293754647","sourcePath":"skills/evaluator/SKILL.md","identity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","snapshotPath":"bootstrap/evaluator-skill.md"}},"disposition":"succeeded","reason":null,"recordedAt":"2026-09-15T10:24:42.841Z","contractIdentity":"sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802","contractDeliveryMode":"claude-system-contract"},"fixture":{"name":"lp1","identity":"spike-013a-lp1","definitionPath":"spikes/013a-Workflow-execution-friction/fixtures/lp1.json","definitionIdentity":"sha256:d07f0ee055bed5d30f60d6681e3d7cdd1d4a284e145a74e42306ea2844bd39c4","candidateCommit":"bb541265d994aad1f1af30446bf0a19ad59e1537","handoffIdentity":"sha256:20f1bf26efb716abc6ce0fdb22e166560442174fefb596bb2e5789d97cd66aed","parentRunId":null,"permittedSideEffects":"none","expectedRoleDisposition":"succeeded"},"createdAt":"2026-09-15T10:22:50.351Z","startedAt":"2026-09-15T10:22:50.354Z","lastActivityAt":"2026-09-15T10:24:42.311Z","terminalAt":"2026-09-15T10:24:42.841Z","logLocation":"/workflow-runs/70410e45-d8e0-46c0-b343-6be74b8d4260/log","accounting":{"allocatedAt":"2026-09-15T10:22:50.351Z","startedAt":"2026-09-15T10:22:50.354Z","endedAt":"2026-09-15T10:24:42.841Z","elapsedMs":112487,"executor":"claude","executionAttempt":1,"replacementCount":0,"terminalDisposition":"completed"}}}
```

## Complete provider log

```text
## LP1 fixture execution report — semantic outcome

**Fixture identity:** `spike-013a-lp1` (workflow `013a`, candidate binding per `fixtures/lp1.json`)
**Role delivered:** `evaluator-verify`, contract `evaluator` v11
(`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`, `deliveryMode: claude-system-contract`)
**Permission profile in effect:** `repository-read-only`, `permittedSideEffects: none`

### What I inspected

I received the full text of `bootstrap/evaluator-skill.md` (the pinned v11 `evaluator` contract) as my system-level role contract, and independently confirmed against the public spike tree (`spike.md`, `design-map.md`, `eval-requirements.md`, `coverage-map.json`, `fixtures/lp1.json`, `lp1-fixture.md`, and prior `verification-attempt-006/007` and `verification-feedback-007.md` records) that:

- LP1 is defined as "the fixed, bounded live-Claude fixture required by the frozen Design Map… not a general child-agent API… distinct from the parent Spike 013a verification run," with the read boundary, no write/shell capability, and no repository/authority side effects other than an inspectable host-owned run record.
- Its `expectedRoleDisposition` is `succeeded`, and its stated purpose (per Design Map A5/TR6 and prior adjudications) is to exercise a real, delegated Claude execution of the `evaluator-verify` role through the real Harness host/adapter and "the original refusal condition" — not to carry out an actual canonical mutating verification cycle.

### Refusal boundary observed and honored

The delivered `evaluator` v11 contract's `verify` mode normally requires mutating actions: allocating/finalizing entries in `.eval/attempt-ledger.json`, writing `.eval/attempts/NNN/eval-result.md`, potentially correcting/freezing an evaluator revision, promoting artifacts under `evaluation/**`, and committing/pushing. Those actions are outside this fixture's declared boundary (`repository-read-only`, `permittedSideEffects: none`).

Consistent with that boundary — and matching what this session's actual tool grant makes possible, since only read-only inspection tools (file glob/grep/read) were available to me here, with no write, edit, or shell capability — I did not attempt, simulate, or fabricate any of those mutating verify-mode actions: no ledger allocation, no result file, no freeze/promotion, no commit, and no modification to canonical authority (Spike 011) or any evaluator artifact. I also did not access or mutate anything in the private `-hidden` mirror (a glob for it returned nothing reachable from this sandboxed session, consistent with the fixture's read boundary).

### Outcome

The bounded fixture task — receive the real `evaluator-verify` role/contract via genuine Harness delegation, inspect it, correctly decline every action that would exceed the fixture's read-only/no-side-effect boundary, and report — completed without violation. No canonical file, authority record, or evaluator artifact was modified.

**Semantic fixture outcome: succeeded.**

HARNESS_ROLE_RESULT {"disposition":"succeeded"}
```
