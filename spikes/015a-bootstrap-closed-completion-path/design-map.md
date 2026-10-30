# Design Map — Spike 015a (Bootstrap-Closed Completion Path)

Bound brief: `spike.md` `sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa` (verified; committed at `eda5ebe983a4c5a37f8c4134a2abb87c6cd5c034`). The host-issued frozen binding is authoritative despite the brief's retained draft-status prose. The non-blocking Brief Readiness clarifications are settled below without changing product behavior or scope.

## Shared contracts

**Frozen declaration.** `completion-obligation.json` is a committed JSON object beside `spike.md` with exactly this version-1 surface: `schemaVersion: 1`, `kind: "split-coding-smoke"`, `sourceWorkspace`, `workflowWorkspace`, `testTarget`, optional `workingDirectory`, and `evidenceDestination: "manifest.md"`. Workspace values are configured workspace identities; paths are normalized repository-relative paths with no empty, absolute, parent-traversal, or symlink-escaping result. `testTarget` must name one file accepted by the fixed Node built-in test runner and `workingDirectory`, when present, is relative to the source root. Unknown fields or any other destination fail validation. The host resolves and records the artifact's workflow-repository binding and content identity during `brief-frozen`; only that recorded declaration is authoritative.

**Completion finalization.** Acceptance of a semantic `implementation-handoff` for a workflow with a declared obligation automatically triggers the narrow host finalizer. The finalizer is host-owned, keyed by declaration identity plus handoff execution and exact source/docs commit pair, and serialized so concurrent or repeated triggers converge on the same recorded result. It has no worker-callable or arbitrary-command surface.

**Provider evidence boundary.** Pre-adoption positive tests substitute only at the registered-provider adapter boundary and must produce the same host-observed spawned-allocation, readiness, managed-process, grant, result, Git, and brokered-action facts consumed by finalization. Such a double proves the host decision path, not a real production-provider launch. Inline execution, fixture-injected canonical facts, a profile label, or prose claims cannot satisfy the rule. The later sequence-8 pilot alone supplies operational proof through the production registered-provider adapter.

**Bounded check result.** The host runs `node --test` with the declared target in disposable checkouts of the immutable allocation baseline and exact final candidate. An expected baseline failure is a normally spawned, non-signaled, non-timeout, non-overflow Node test-runner exit of `1`; no output substring is authoritative. The exact final run must exit `0`. Spawn error, containment/setup failure, timeout, signal, output overflow, any other exit, wrong target, or wrong commit is non-satisfying. Each run records bounded exit facts and a digest of bounded output; raw unbounded output is not public evidence.

**Attempt and success records.** Every finalization writes one host-owned canonical completion-attempt fact containing the bounded prerequisite/check identities and its satisfying or non-satisfying status. Failed attempts do not create or commit `completion-smoke.json` and do not satisfy Outcome. A retry of the same handoff is idempotent; a later accepted handoff gets a new key and supersedes older attempts for currentness. On success the host generates and locally checkpoints public `completion-smoke.json` in the workflow docs repository, verifies its committed binding, then records `completion-smoke-recorded`; checkpoint or event failure remains non-satisfying and inspectable.

**Current completion and Outcome.** A completion record is current only when it binds the recorded declaration, adopted sequence-8 methodology/runtime, workflow, latest accepted Implementation handoff, that handoff's exact final source candidate, and its exact brokered docs checkpoint, with no later accepted handoff or later source/docs candidate checkpoint. The host revalidates declaration workspace identities, configured Git origins, commit ancestry, and all bindings during finalization and again for Outcome allocation and transition. Drift fails closed. For an obligated workflow, STANDARD eligibility and result recording require that current record. PROCESS_EXCEPTION eligibility and result recording instead require the existing explicit exception authority and identify the declaration and unsatisfied obligation; they never synthesize success. Undeclared and historical workflows retain their existing rules.

**Outcome contract boundary.** The sequence-8 Outcome skill/contract receives optional declaration and completion-record identities and must be materially versioned from contract version 5. A STANDARD artifact cites both when obligated; PROCESS_EXCEPTION cites the declaration, outstanding obligation, reason, and exception authority. Sequence-7 certification Outcomes remain governed by their pinned version and cannot consume later sequence-8 smoke evidence.

**Evaluation surface.** Evaluation observes configuration/freeze rejection, host-owned events and records, exact Git/content bindings and ancestry, allocation/provider provenance, brokered action results, contained check exits/output digests, Outcome allocation, and terminal transition behavior. No implementation-internal class, module, or algorithm is shared contract.

## Design decisions

- Declaration, attempt, and success records are distinct: the frozen declaration opts in, every finalization leaves a bounded attempt fact, and only a validated public checkpoint permits the success event.
- Completion attaches to the accepted semantic handoff rather than process exit or worker assertion. This preserves the existing implementation evidence and repository-qualified commit-pair seams.
- The sequence-7 evaluator may exercise proposed sequence-8 policy as candidate software under test. Candidate-produced events have no trust or adoption authority.

## Invariants

- Sequence-7 certification PASS never depends on sequence-8 adoption or a real post-adoption smoke; adoption and the fresh pilot are forward-only later actions.
- The original Spike 015 evaluator, attempts, experimental smoke, and history remain unchanged and are never represented as an authoritative PASS.
- Absence of a declaration preserves legacy behavior; malformed, mismatched, late, mutable-working-tree, or stale declarations fail closed and never become implicit absence.
- A selector setting is not provider attestation. Missing concrete Codex model attestation stays missing and is not fabricated or made a success prerequisite.
- Direct docs writes, stale evidence, non-descended commits, unchanged source, fake/inline launches, failed containment, partial checkpoints, and old completion records cannot satisfy the obligation.
- PROCESS_EXCEPTION preserves an explicit incomplete closeout without satisfying the smoke, weakening independent gates, or becoming STANDARD.
- The finalizer adds no general command runner, dependency installer, network access, remote push, trust mechanism, evaluator, or containment architecture.

## Implementation freedom

- Internal types, modules, storage encoding, and transaction/locking mechanism for the narrow host finalizer and records.
- Exact bounded output limit, timeout, digest algorithm representation, and cleanup implementation, provided failures remain distinguishable and fail closed.
- Test fixture organization and provider-adapter double implementation, provided authoritative versus simulated provenance is mechanically distinguishable.
- Placement of conditional policy checks inside existing eligibility and transition machinery, provided both boundaries enforce the same current-record rule.
