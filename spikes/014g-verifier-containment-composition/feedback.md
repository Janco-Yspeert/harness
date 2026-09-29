# Brief Readiness — Spike 014g Verifier Containment Composition

Reviewed: `spikes/014g-verifier-containment-composition/spike.md`
(`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`).
Skill: `brief-readiness`, contract version 5.

## Findings

No blockers. The brief states a bounded question, immutable inputs (014f candidate, evaluator revision `001`, attempts 001/002), explicit non-goals, and defers the design choice among three shapes to the Design Map on purpose. That is ordinary design freedom, not a missing contract decision.

### M1 — Material clarification: the frozen regression is not yet identified, and repository evidence shows several candidates

Brief: requirement 4 and 8, AC03 ("the existing 014e containment regression").
Repository: `spikes/014f-inactive-workflow-grant-retirement/verification-result.json` says only "one unrelated containment test (014e)" failed. `test/external-project.test.ts` holds many 014e D4 tests. Line 746 ("no Harness writes") and line 1269 ("still denies commits under plain workspace-write") both depend on a parent-boundary premise. Line 1001 starts a nested sandbox. The brief may mean more than one of these.
Consequence: requirement 8 defers recording the path and identity to freeze. If the freeze step does not also name the exact test(s) and say whether it is one or several, AC03 could be met by a different test than the one that failed.
Smallest clarification: state that the freeze record must name each affected test, by file and test title, at a committed identity. It should say whether the set is one test or several. The set should cover every 014e test whose premise is invalidated inside the verifier, not only the one seen failing.

### M2 — Material clarification: "real protected-verifier path" versus host-mediated verification

Brief: AC03, Handoff ("Evaluation must exercise the real protected-verifier launch path"), and design option 2 (host-mediated mutation or verification operation).
Consequence: if the design runs the regression outside the verifier through a host operation, whether that satisfies AC03 is ambiguous. The brief says AC03 passes "through the real protected-verifier path". Implementers could read that as either allowing or forbidding a host-run regression.
Smallest clarification: say whether, in the selected design, the regression must execute as a command of the allocated verifier under its effective sandbox, or whether a host-run result bound into the verifier's evidence also counts. If the latter counts, say what the verifier must bind (for example command, exit and output identity).

### M3 — Material clarification: "fail closed" behavior for AC06

Brief: AC06 and scope ("fail closed when the host cannot enforce the selected composition").
Repository: `src/executors/containment.ts` and `src/executors/adapters.ts` already refuse before session and allocation when containment or a nested sandbox cannot start (014e D4).
Consequence: without stating the observable outcome, an implementation could fail closed at launch, at allocation, or mid-execution.
Smallest clarification: require refusal before session start and allocation, consistent with the existing D4 behavior, or name the intended alternative.

### E1 — Editorial

- "Status: Draft for Brief Readiness; not frozen" and the `Depends on` line are fine, but a trailing space is missing in the AC02 row (`...host filesystem locations.|`).
- Requirement 7 and AC07 overlap. Requirement 7 is a post-acceptance process step and AC07 is the checkable criterion. Say so to avoid double counting.

## Review notes

- Feasibility: consistent with the repository. Claude runs with `nestedSandbox: false` and the verifier holds repository-write, as the Context section says. The provider-containment code is host-owned in `src/executors/containment.ts`.
- Limitations: I did not run the test suite and did not inspect evaluator-private material. The Design Map must still decide the composition.
- Files changed: `feedback.md`, `manifest.md`. Checks run: read of the brief, repository search of `src/executors`, `test/external-project.test.ts`, and the 014e and 014f records.

**Verdict: Ready after minor clarification**
