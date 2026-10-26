# Human Bootstrap Authorization — Evaluator Workspace Correction 001

## Scope

This is a bounded human bootstrap authorization for Harness Spike 014 evaluator preparation.

It is bootstrap evidence only. It is not a canonical methodology transition and does not satisfy any Spike 014 acceptance criterion for the new authority, provenance, grant, or restart-recovery model.

## Contaminated run

The following evaluator-preparation run was cancelled before accepting any semantic result:

`9b845e84-004d-4d75-8d25-1b71d3d79e04`

Its protected evaluator grant incorrectly included another spike's private evaluator workspace:

`/home/velveteen/vk-code/harness-hidden/spikes/013a-Workflow-execution-friction`

That run is invalid as Spike 014 protected evaluator-preparation evidence.

Its historical record must remain:

- terminal operational state: cancelled;
- no accepted role result;
- no `evaluation-prepared` canonical transition.

Do not rewrite or delete it.

## Correct protected workspace configuration

For the next Spike 014 evaluator-preparation execution, the Harness host is authorized to be restarted with the per-spike evaluator workspace set to:

`/home/velveteen/vk-code/harness-hidden/spikes/014-kernel-consolidation-authority-role-grants`

Use:

`HARNESS_EVALUATOR_WORKSPACE=/home/velveteen/vk-code/harness-hidden/spikes/014-kernel-consolidation-authority-role-grants`

For this bootstrap retry, do **not** grant the common hidden root through `HARNESS_EVALUATOR_HIDDEN_WORKSPACE`.

If that variable is currently set, unset it before starting the corrected host.

Reason: the current implementation treats that variable as a grant of the repository-sibling `harness-hidden` root, which can expose private material belonging to other spikes. Spike 014 evaluator preparation does not currently require that broad grant.

The protected evaluator's expected effective workspace set for this retry is therefore limited to:

1. the public Harness repository workspace; and
2. the Spike 014 private evaluator workspace above;

plus only temporary scratch paths created by the supported executor backend.

No Spike 013a private path may appear in the corrected protected grant.

## Host restart and lineage

Changing `HARNESS_EVALUATOR_WORKSPACE` requires restarting the current Harness host.

The current host-owned workflow-run registry is in-memory and does not reconstruct replacement lineage from durable run evidence after restart.

Therefore the corrected evaluator-preparation run may receive a fresh host-owned run identity without automatic `previousExecutionId` linkage to the cancelled contaminated run.

That limitation must remain visible.

Do not fabricate replacement lineage.

Preserve instead:

- the cancelled run's durable evidence;
- the local/bootstrap record explaining why it was rejected;
- this authorization;
- the new corrected run identity and effective workspace grant.

This restart-lineage limitation is itself relevant historical evidence for Spike 014's durable execution/recovery design.

## Retry procedure

After restarting the host with the corrected environment:

1. inspect the host configuration/effective protected allocation before accepting evaluator output;
2. truthfully close the old local evaluator-preparation operational attempt as blocked/cancelled if the current runner requires an outcome before retry;
3. dispatch evaluator preparation again through the existing supported protected path;
4. verify the new run's effective workspaces before treating it as valid;
5. require the normal semantic evaluator-preparation result;
6. only after successful protected preparation, record the canonical `evaluation-prepared` transition through the existing supported authority path.

The retry remains bound to the already-frozen Spike 014 brief and Design Map.

## Boundaries

This authorization does not permit:

- implementation;
- access to Spike 013a evaluator-private material;
- a common hidden-root grant;
- hand-editing `.workflow/state.json`;
- fabricating host execution lineage across restart;
- accepting the cancelled run's output;
- weakening evaluator isolation;
- adding Spike-014-specific kernel code before implementation.

If the corrected host still grants any unrelated spike-private workspace, stop and report the exact effective workspace list rather than continuing evaluator preparation.
