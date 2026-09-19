# Human Bootstrap Authorization — Brief Readiness Replacement 001

## Scope

This is a bounded human bootstrap authorization for Harness Spike 014.

It is bootstrap evidence only. It is not a canonical methodology transition and does not satisfy any Spike 014 acceptance criterion for the new authority/grant model.

## Exact target

- Branch: `feat/spike-014`
- Spike: `spikes/014-kernel-consolidation-authority-role-grants`
- Brief path: `spikes/014-kernel-consolidation-authority-role-grants/spike.md`
- Updated brief commit: `ced63aea6bd6847c433f75f3dda6ebb3458f4586`
- Superseded review run: `832ffab6-7dfa-4809-8d41-bf6948f87e72`

The prior run remains historically valid as a completed Brief Readiness review of the earlier brief. Its verdict was Not ready to freeze. It must not be rewritten, relabelled, or reused as evidence for the updated brief.

## Authorized recovery

The human authorizes exactly one new Brief Readiness semantic review of the updated brief through the existing supported host replacement operation:

`POST /workflow-runs/832ffab6-7dfa-4809-8d41-bf6948f87e72/replace`

The replacement must:

- retain the Brief Readiness role and its currently resolved contract;
- create a new host-owned execution identity with explicit predecessor/replacement lineage;
- use the updated repository state whose brief is bound by commit `ced63aea6bd6847c433f75f3dda6ebb3458f4586`;
- state in its execution prompt that the review target is the updated brief at that exact commit/path;
- preserve the old run unchanged;
- produce a fresh semantic readiness verdict and fresh review evidence.

The replacement reason should identify the bootstrap defect: the legacy host slot key does not include the changed Brief Readiness input identity and therefore incorrectly deduplicates the updated review against the prior successful execution.

## Conditions on use of the result

The replacement result may be used to freeze the brief only if:

1. the replacement run reaches a successful semantic role disposition;
2. its review evidence is demonstrably about the updated brief at commit `ced63aea6bd6847c433f75f3dda6ebb3458f4586`;
3. the verdict is Ready to freeze;
4. the subsequent canonical `brief-frozen` event binds the exact current brief artifact and Git provenance through the existing supported authority validation.

Do not manufacture a local workflow completion record for the old run.

Do not hand-edit `.workflow/state.json`.

Once canonical `brief-frozen` exists, later preparation may rely on canonical authority as currently supported.

## Boundaries

This authorization does not permit:

- implementation;
- Design Map before a valid canonical brief freeze;
- evaluator preparation before a valid canonical Design Map freeze;
- changing the prior run's semantic or operational result;
- changing methodology attempt labels merely to evade deduplication;
- adding Spike-014-specific host code;
- claiming that this bootstrap recovery proves Spike 014's future Role Grant, Workflow Execution Grant, input-identity, or idempotency design.

If this exact replacement operation cannot produce a fresh review of the updated brief, stop and report the bootstrap defect. Do not invent another recovery path without further human authority.
