# Brief Readiness Feedback — Spike 014h

Reviewed: `spikes/014h-host-owned-fs-isolation/spike.md` (`sha256:e228070ac2030685c8f725a2aacc16980790c95b9b797d93c0ffcd659874d417`), contract version 5. This is the second readiness pass; the first (`preliminary/001/`) was Not ready.

## Verdict: Ready after minor clarification

The revision resolves the prior blocker and clarifications. The brief now states the gap (014e containment applies only to external projects), that 014h extends `src/executors/containment.ts`, the Stage A checkpoint definition and conditional authority, the failure category, nested-sandbox fail-closed behavior, and the preflight artifact. The repository claims were spot-checked and match: `src/kernel/host.ts` gates containment on `#external` (L449), `provider-config-invalid` and `permission-denied` exist in `src/kernel/model.ts`, `probeNestedSandbox` is in `containment.ts` (L325), `harness.executors.json` gives `codex-sol-medium` `isolation: []`, and `privateWorkspace` gates eligibility in `adapters.ts`.

No blockers.

## Prior findings

- B1 resolved (Context, "Core model", AC01, AC13).
- M1 resolved (Stage A gate, AC06). M2 resolved (Stage A gate last paragraph). M3 resolved (Evidence, AC14). M4 mostly resolved (see N2). M5 resolved (A3).
- E1–E3 resolved.

## Non-blocking clarifications

### N1. AC01 versus the stage split

AC01 requires containment for every spawned governed provider process, Harness and external. Stage A covers public roles and Stage B the protected evaluator. Without a statement, AC01 can be read as needing all Harness-repo launches, including protected Claude, contained at the Stage A gate. Suggested wording: AC01 is a final-candidate criterion; the Stage A gate requires it only for spawned public roles. The likely answer is apparent.

### N2. Evidence location

The Evidence section says "public execution evidence maintained by Harness" but does not name the record (execution record versus workflow ledger versus a preflight artifact). The Design Map may choose this provided the fields listed are present, the record is public-safe, and the refusal occurs before session/execution allocation. Restating that choice as implementation freedom would prevent divergence.

### N3. Codex profile routing

The brief says routing changes only after checkpoint recording, but not which artifact changes (for example `harness.executors.json`, whose Codex profile has `isolation: []`). This is implementation freedom if the change stays an executor-policy edit recorded in the public evidence. A one-line note would help.

## Editorial

- E1. The AC table lacks a blank line before the `---` rule after AC14, which some renderers treat as a setext heading.

## Limitations, files, checks

- Limitations: reviewed the brief, `src/kernel/host.ts`, `src/kernel/model.ts`, `src/executors/containment.ts`, `src/executors/adapters.ts` and `harness.executors.json` by targeted search. No evaluator-private material was read. No tests were run.
- Files changed: `feedback.md`, `manifest.md`. Not duplicated under `preliminary/` because the verdict passes.
- Checks: the brief hash matches the bound identity (`e228070a…`).

**Ready after minor clarification**
