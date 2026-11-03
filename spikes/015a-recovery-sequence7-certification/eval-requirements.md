# Evaluation Requirements

Prepared for brief `sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa` and Design Map `sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`.

## Testability Requirements

- **TR1 — Existing authoritative seams only.** The candidate must leave `methodologies/harness/trusted.jsonl` unchanged (head sequence `7`), must expose no methodology adoption, trusted-history, or completion-finalization operation in `src/executors/protocol.ts` or `src/executors/worker-tools.ts`, must not delete or relocate-away any test file present at the technical baseline `1159f66422796c14a68428990ae93768ce3102fd` (`test/**`, matched by path), and must leave `spikes/015-separate-source-and-workflow-repositories/**` byte-identical.
  - Reason: adoption and finalization are host operations; history and accepted regressions are preserved (BC09, BC11).
  - Impact: none beyond the Design Map.
- **TR2 — Implementer-owned deterministic tests.** The ordinary repository suite (no live provider, credentials or network) must contain tests that fail on regression of: (a) the closed declaration shape, rejection of unknown fields/other destinations/unsafe paths/unknown workspaces, recording at brief-freeze, fail-closed malformed declaration, legacy behavior when absent, and no post-freeze or working-tree alteration; (b) positive completion only via a double at the registered-provider adapter boundary with mechanically distinguishable simulated provenance, and fail-closed handling of inline/fixture-injected/profile-only/missing-readiness evidence, empty source delta, non-descended commits, direct docs writes, stale docs evidence, mismatched origins, and missing Codex attestation being neither fabricated nor required; (c) baseline exit 1 / final exit 0 semantics and every non-satisfying outcome (spawn error, containment failure, timeout, signal, overflow, other exit, wrong target/commit), with bounded exit facts and output digest; (d) one attempt fact per finalization, no success file/event on failure, partial checkpoint/event failure remaining non-satisfying, idempotent and serialized repeated triggers, supersession by a later handoff, tamper/forgery refusal; (e) currentness (latest accepted handoff, no later source/docs checkpoint, configuration/origin/ancestry drift) enforced at Outcome allocation and STANDARD transition, preserved authorized PROCESS_EXCEPTION that never satisfies or fabricates the smoke, and unchanged undeclared/historical workflows; (f) a sequence-7 grant remaining sequence 7 after a fixture adoption while a fresh grant resolves sequence 8; (g) the Outcome contract materially versioned above 5 with sequence-7 Outcomes unaffected; (h) unchanged technical properties of Spike 015 AC01–AC13 remaining asserted.
  - Reason: the Design Map leaves modules, signatures, storage and fixtures as implementation freedom, so these behaviors have no public seam for independent import.
  - Impact: the evaluator runs the whole suite and reviews that each behavior is asserted.

## Evaluator Assumptions

- **EA1 — Bootstrap-closed evidence.** All mandatory evidence uses Git inspection of the committed candidate, repository check commands and review under trusted sequence 7; none needs sequence-8 authority or a post-adoption event. Candidate behavior is software under test only.
  - Reason: BC01.
  - Evaluation impact: no procedure grants sequence-8 authority.
- **EA2 — No live provider.** Evaluation needs no credentials, network or live call.
  - Reason: brief closure rules.
  - Evaluation impact: provider calls 0.
- **EA3 — Review standard.** Reviews judge against the Design Map text; implementation freedom is never penalised.
  - Reason: preserves freedom.
  - Evaluation impact: naming and storage choices are not failures.
- **EA4 — Baseline comparison.** Failures present identically at `1159f664` (including the known inherited `/tmp`-layout containment test failure) are reported as inherited, not charged, provided no new failure appears.
  - Reason: brief's operational-concern clause.
  - Evaluation impact: introduced regressions are distinguished from inherited ones.
- **EA5 — Full-suite run.** Evaluation runs the full repository checks, not only focused tests.
  - Reason: BC11.
  - Evaluation impact: R1 covers the full suite.
- **EA6 — Inherited criteria source.** AC01–AC13 are taken from the public Spike 015 brief, not private 015 evaluator material.
  - Reason: BC10.
  - Evaluation impact: none on implementation.

## Blocking Questions

None

## Environment Requirements

- Linux with unprivileged user namespaces and `bubblewrap` on `PATH`, as existing containment tests require.
- Node 24 with the repository's installed dependencies; evaluation runs from the repository root with `npm run typecheck`, `lint`, `format:check` and `test`.
- Git access to the candidate commit and to the technical baseline `1159f66422796c14a68428990ae93768ce3102fd`, of which the candidate must be a descendant.
