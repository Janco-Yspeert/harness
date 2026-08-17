# Spike 006 — Brief Readiness Review, Pass 2

## Findings

### Blocker — The evaluation-freeze ordering cannot record the required public Git identity

The revised brief correctly defines the Git commit containing a public contract artifact as that artifact's durable provenance identity (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:136-152`). It then requires private evaluator freeze metadata to record the frozen public evaluation-requirements identity (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:154-179`). However, the required phase order freezes the private evaluator revision before committing the public evaluation requirements (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:238-248`).

At the moment the private revision is frozen, the required public Git commit identity does not exist. If the private metadata is updated after that commit is created, the supposedly frozen private evaluator revision changes; if it records only a content hash, it does not contain the public artifact's defined durable provenance identity. The manifest does not break the cycle because the brief explicitly says it is not authoritative for freeze state (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:290-307`).

This makes the stated freeze contract impossible to implement literally and leaves evaluator `verify` without the complete identity chain the brief requires.

**Minimum clarification before freeze:** reorder or split the phase so the public evaluation requirements receive their committed Git identity before the final private evaluator freeze records it. If a provisional private integrity pass must happen first, distinguish that from final freeze. Alternatively, explicitly permit the private freeze metadata to use the public artifact's content hash as its identity and define how the later public commit is linked without mutating the frozen private revision.

### Blocker — “Every spike” requires retroactive manifests while retroactive rewriting is a non-goal

The manifest section says every spike must maintain a public append-only manifest (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:290-324`), and acceptance criterion 7 requires every spike to have one (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:1103-1107`). The same brief prohibits retroactively rewriting completed spike artifacts and says earlier historical evidence must remain historical (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:974-990`), with rewriting historical spike records into the new format repeated as a non-goal (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:1065-1081`).

Read literally, acceptance requires manifests to be added to completed Spikes 001–005. Such manifests could not be genuine append-only execution histories: the workflow did not record the newly required skill versions, input/output identities, telemetry, or run sequence at execution time. Reconstructing them now would both broaden Spike 006 and manufacture provenance of uneven reliability. Reading “every spike” as “Spike 006 and future ordinary spikes” avoids that mess, but the current acceptance language does not say so.

**Minimum clarification before freeze:** scope mandatory manifests to Spike 006 and spikes begun under the revised workflow (or only Spike 007 onward, if Spike 006's exception should use a smaller record). Explicitly state that completed earlier spikes are not backfilled; their existing artifacts and Git history remain their historical record.

### Material clarification — The requested preliminary-review preservation contract is absent from the active brief

The preserved first review explicitly carries forward a Spike 006 implementation requirement: each reviewed draft and its findings should be stored together under a monotonically numbered `preliminary/NNN/` directory, and a later review must create a new snapshot rather than overwrite the prior one (`spikes/006-Development-Workflow-Skills-Refactor/preliminary/001/feedback.md:3-6`).

The active brief instead says only that Brief Readiness's console output may remain concise and that a durable artifact, *if retained*, should be lightweight (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:407-427`). That makes preservation optional and does not define the numbered snapshot behavior. Because the implementation pass is directed primarily by the frozen brief, the requested skill change can easily disappear despite being preserved in historical feedback.

**Minimum clarification before freeze:** add the numbered `preliminary/NNN/` snapshot rule to the Brief Readiness contract and acceptance criteria. Specify that each completed readiness pass preserves the exact reviewed draft and corresponding findings without overwriting earlier passes. Naming details beyond that can remain an implementation choice.

## Resolved findings from pass 1

The earlier review's substantive issues are otherwise resolved:

- Public and private freeze identities plus revise/refreeze behavior are now explicitly defined (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:126-212`), subject to the ordering defect above.
- Outcome now has a bounded, predeclared process-exception contract that preserves ordinary evaluation requirements and forbids retroactive escape after failure (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:564-593`).
- The per-spike manifest is now the named durable source of skill-version execution provenance (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:795-805`).
- Claude compatibility now requires a durable artifact and a harmless operational exercise rather than prose inspection alone (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:922-970`).

## Verdict

**Not ready to freeze.** Resolve:

1. the circular ordering between private evaluation freeze and the public evaluation contract's Git identity; and
2. whether manifests apply retroactively to completed spikes or only to Spike 006/future workflow runs.

Also promote the already-requested `preliminary/NNN/` preservation behavior into the active brief so it cannot be lost during implementation.

## Review limitations

I reviewed the complete revised Spike 006 brief, the preserved preliminary brief and first review, `AGENTS.md`, `GOALS.md`, `README.md`, the active workflow skills relevant to this refactor, the referenced Quest Design Map skill, and repository tooling. I did not inspect evaluator-private `eval-spec.md`, `.hidden-test/**`, or `.eval/**` material. No public `eval-requirements.md` exists for Spike 006.

No implementation, brief, test, or project-documentation files were changed, and no tests were run because this was a documentation/contract readiness review. The only change is this required second-pass `feedback.md` artifact.
