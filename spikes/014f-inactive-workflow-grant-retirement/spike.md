# Spike 014f — Inactive Workflow Grant Retirement

**Status:** Draft for Brief Readiness and human review; not frozen  
**Depends on:** the current trusted Harness methodology and the 014e external-project canary findings  
**Motivation:** 014e exposed a terminal Workflow Execution Grant with unused allocation authority that could not be canonically retired without creating new work or abusing an unrelated recovery mechanism  
**Precedes:** resumption of the Stockdif 014e live canary

## Context

Spike 014e uncovered a lifecycle gap in Workflow Execution Grant authority.

The Stockdif canary had a valid H4-era Workflow Execution Grant with remaining allocations, but its only execution was terminal. The grant therefore still represented live future authority even though the canary had moved on to a later tested Harness runtime.

Existing mechanisms were intentionally insufficient:

- ordinary supersession required an active execution;
- pre-implementation recovery required already-recorded frozen evaluator authority that Stockdif correctly did not have;
- consuming an allocation merely to manufacture an active execution would create work for the purpose of making that work cancellable;
- declaring the old grant "operationally abandoned" would leave its unused authority canonically usable;
- forging a revocation or overloading an unrelated recovery mechanism would corrupt the authority model.

Attempts to implement retirement inside frozen 014e also correctly failed. The governed Implementation role was bound only to 014e's frozen brief, Design Map and evaluator requirements. The new retirement requirement was not part of that contract, so the workers produced no-op checkpoints rather than smuggling a new public lifecycle/API requirement into an already-frozen spike.

014f exists to address **only** this generic lifecycle gap.

The stranded Stockdif H4 grant is motivating evidence, not acceptance authority. 014f must be independently evaluable using Harness-owned deterministic fixtures without depending on Stockdif internals or on the existence of that exact grant.

## Question

Can Harness permanently and explicitly retire an **inactive** Workflow Execution Grant that still has unused authority, while preserving all historical evidence and preventing any future execution under that grant, without consuming an allocation or weakening the existing authority and recovery model?

## Scope and fixed boundaries

Implement one generic, host/kernel-owned lifecycle operation for **inactive Workflow Execution Grant retirement**.

Retirement must:

- be explicitly authorized through the existing human/root authority boundary;
- identify one exact existing Workflow Execution Grant in one workflow;
- be allowed only when that grant has no active execution;
- consume no role allocation;
- append durable lifecycle evidence rather than mutating or deleting the original grant;
- permanently make the retired grant unusable for future execution;
- preserve all historical executions, semantic results, diagnostics, transitions, actions, human requests, allocation accounting and evidence;
- leave successor grants free to operate normally.

Do **not** broaden this spike into generalized grant editing, grant expiry, scheduled revocation, budget transfer, cross-project cancellation, methodology changes, Stockdif-specific recovery, automatic cleanup, or a new orchestration framework.

Do not change role skills or contracts unless the Design Map demonstrates that the host-owned retirement operation genuinely requires it. Retirement is an authority/lifecycle operation, not a worker responsibility.

## 1. Retirement semantics

A retirement request targets one exact Workflow Execution Grant.

The kernel must determine from canonical state whether the grant is eligible for retirement. At minimum:

- the grant exists in the requested workflow;
- it has not already been retired;
- no execution under that grant is currently active;
- no retirement operation may create or consume a role allocation.

Define "active" using existing execution lifecycle semantics rather than introducing a second incompatible state model. A grant with a currently running or allocated execution is not eligible for inactive retirement.

If an unresolved human request or other existing canonical gate would make retirement ambiguous or unsafe, the Design Map must state and test the chosen rule. Prefer refusing retirement over silently discarding an unresolved decision.

Retirement is permanent. Once recorded, the same grant must never again authorize new work.

The exact event/API names are a Design Map decision, but the resulting state must be directly inspectable. Prefer one explicit append-only lifecycle event rather than encoding retirement indirectly as a fake execution result, fake revocation, synthetic allocation, or special-case reason string.

## 2. Retirement authority

Retirement requires explicit host-level human/root authority.

It must not be possible for:

- a normal role result;
- provider prose;
- an executor process;
- a remaining allocation budget;
- or the orchestrator acting without a valid human/root authorization

to retire a grant.

Reuse the existing bounded root/human authority mechanism where practical. Do not invent a parallel authentication or authority store.

Bind the request sufficiently to reject accidental retirement of the wrong workflow or grant. If the existing authority-basis or stale-request protections apply cleanly, reuse them.

A repeat request for an already-retired grant must have deterministic behavior: either an explicit "already retired" refusal or an idempotent response. It must not append duplicate retirement authority or make the grant executable again.

## 3. Effects of retirement

After retirement, all normal and recovery paths must treat the grant as permanently non-executable.

At minimum, a retired grant cannot:

- allocate a new role;
- continue manually;
- continue automatically;
- retry a prior execution;
- replace an execution;
- consume unused `maxAllocations` or `maxAutomaticWork`;
- be revived by process restart, host restart, retry classification, or stale continuation request.

Existing historical information remains readable and unchanged.

Retirement does **not**:

- delete or rewrite the original Workflow Execution Grant;
- alter prior execution results;
- fabricate a terminal role result;
- consume the unused allocation balance;
- transfer that balance to a successor grant;
- imply that a workflow itself is complete;
- imply human acceptance of any product result;
- create a successor grant automatically.

A later independent Workflow Execution Grant may be created normally under the then-current valid authority.

## 4. Interaction with existing lifecycle mechanisms

Preserve the semantics of:

- execution cancellation and interruption;
- ordinary retry and replacement;
- grant supersession;
- pre-implementation recovery;
- evaluator correction authority;
- root authority;
- continuation stopping;
- workflow/grant allocation limits.

Do not make retirement a generic substitute for correctly stopping active work.

An active grant requiring cancellation or another existing lifecycle action must use that existing mechanism first. 014f only supplies the missing terminal/inactive retirement step.

If current code has multiple checks for grant liveness, centralize or reuse the smallest coherent predicate needed to ensure retirement is respected everywhere. Avoid scattering 014f-specific special cases through the kernel.

## 5. Required deterministic evidence

The independent evaluator must be able to establish the retirement behavior without Stockdif or live provider calls.

Provide focused deterministic coverage for at least:

1. An inactive terminal grant with unused allocations can be retired.
2. Retirement records one durable canonical lifecycle event bound to the exact grant.
3. Retirement consumes no role allocation and leaves prior allocation accounting intact.
4. Manual continuation under the retired grant is refused before provider launch.
5. Automatic continuation under the retired grant cannot launch work.
6. New allocation under the retired grant is refused.
7. Retry/replacement cannot resurrect a retired grant.
8. Host/process restart does not restore retired authority.
9. Prior executions, semantic results, actions, diagnostics and transitions remain readable and unchanged.
10. Retirement while an execution is active is refused.
11. An already-retired grant has deterministic repeat-retirement behavior and cannot receive duplicate effective authority.
12. A fresh successor Workflow Execution Grant can be issued and used normally after retirement.
13. Existing grant supersession, recovery, correction-cycle, continuation and allocation-limit regression tests remain green.

No test may prove retirement by directly editing the ledger or by bypassing the normal host/kernel authority path.

## 6. Operational use after acceptance

The real stranded Stockdif H4 grant must **not** be used as 014f's implementation test fixture or as a shortcut around independent evaluation.

After 014f independently passes and is human-accepted:

1. run the accepted retirement operation against the exact stranded H4 Stockdif Workflow Execution Grant;
2. record the real retirement event as 014e operational evidence;
3. verify that the H4 grant's two unused allocations remain historically visible but unusable;
4. verify that a continuation attempt is refused without provider allocation;
5. resume Stockdif under a fresh bounded grant using the then-exact tested Harness runtime.

That real use is evidence for the continuing 014e canary. It does not retroactively alter 014f's frozen evaluation.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01** | Harness exposes one explicit host/kernel-owned operation that retires an exact inactive Workflow Execution Grant under valid human/root authority, without allocating a role. |
| **AC02** | Retirement is represented by durable append-only canonical evidence. The original grant and all prior execution/result/action/diagnostic history remain unchanged and inspectable. |
| **AC03** | A retired grant is permanently non-executable: manual/automatic continuation, allocation, retry and replacement cannot launch new work or consume its remaining budget. |
| **AC04** | Retirement of a grant with an active execution is refused. Any unresolved-gate behavior defined by the Design Map is fail-closed and independently tested. |
| **AC05** | Repeat retirement has deterministic non-escalating behavior; host restart or stale requests cannot resurrect or duplicate usable authority. |
| **AC06** | A fresh successor Workflow Execution Grant can operate normally after the old inactive grant is retired; unused authority is not transferred automatically. |
| **AC07** | Existing supersession, recovery, correction, continuation, allocation-limit and workflow regressions remain behaviorally unchanged except where they must recognize the new retired state. |
| **AC08** | Independent evaluation proves AC01–AC07 with deterministic Harness-owned fixtures under the exact candidate commit. Stockdif is not required to establish the feature's correctness. |

## Out of scope

- Changes to Stockdif application code or its evaluator.
- Resuming the 014e live canary before 014f is independently accepted.
- Automatic grant expiry or time-to-live.
- Editing allocation budgets of existing grants.
- Transferring unused allocations between grants.
- Bulk retirement, project deletion or generalized workflow garbage collection.
- Remote publication, branch merging or GitHub automation.
- Provider/model telemetry, quota recovery or context-cost work.
- Methodology/skill revisions unrelated to this lifecycle operation.

## Execution and authority sequence

1. Run Brief Readiness on this draft and resolve any material contract ambiguity.
2. Human-freeze the accepted 014f brief.
3. Produce and freeze a Design Map that specifies the smallest generic kernel/host integration and the exact inactive/retired state semantics.
4. Independently prepare/freeze deterministic evaluation before implementation.
5. Implement the feature under the frozen 014f authority. Use the configured economical public-role executor where eligible; do not use live Stockdif state as implementation authority.
6. Independently verify the exact candidate.
7. Complete normal evaluator evidence promotion, As-Built and human acceptance.
8. Record Outcome.
9. Only then return to 014e and use the accepted retirement operation on the real stranded H4 Stockdif grant before issuing its successor grant.

## Handoff

A successful 014f closes one authority-lifecycle gap discovered by 014e. It does not itself complete the external-project canary.

After 014f acceptance, resume 014e from its preserved history. Canonically retire the stranded H4 grant, keep its unused allocations visible but unusable, and continue Stockdif under a fresh bounded grant and the exact accepted Harness runtime.

**This is a draft brief, not frozen authority and not authorization to retire any existing grant yet.**
