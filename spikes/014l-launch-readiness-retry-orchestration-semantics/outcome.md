# Outcome — 014l Launch, Readiness, Retry, and Orchestration Semantics

## Result and exact provenance

- Result: **COMPLETE — STANDARD** (independently evaluated `PASS`, human-accepted).
- Completion mode: `STANDARD`.
- Accepted candidate: `4f0560165a14c44f76c6fdd540f4bc456ef208ae`.
- Brief `sha256:de56e997…e803`; Design Map `sha256:11fddfcd…c00d`; evaluator revision `001`
  `sha256:6293e45e…43cc`; promotion `sha256:8fc28981…f9f2`; As-Built `sha256:20534fff…9b04`.
- Evaluation: attempt 005 `PASS` (execution `d44c7829…`) on the exact candidate; promoted at `5a207652`;
  As-Built at `a4d4819c`.

## What Was Established

- Proven by evaluation: the host derives canonical launch shapes, runs material-free readiness before
  semantic allocation, records operational attempts separately from semantic ones, bounds automatic
  operational retry, supports human-authorized retry bound to an exhausted state, detects repeated
  no-progress, and projects status through root-only `resolve`. 25/25 criteria satisfied.
- Not established: behaviour against a live provider. Evidence is visible tests and diff reading.

## Implementation Summary

Per As-Built (22 files, +4193/−181 from design freeze): new `src/kernel/orchestration.ts`; ledger
records `kernel.launch-attempt`, `retry-exhausted`, `retry-authority`, `semantic-progress`,
`continuation-stopped`; `kernel.allocation` remains the sole semantic commit; a one-tool readiness MCP
server requiring positive `tool-confirmed` evidence; adapters take the canonical shape; attached-mode
compatibility check with no automatic retry; root-only retry endpoint; 3 automatic operational retries
per launch intent. As-Built found no Missing or Contradictory items.

## Evaluation Evidence

- Attempt 004 (candidate `212e12e4`): `FAIL`, `IMPLEMENTATION_FAILURE` — 20 of 331 visible tests failed.
- Attempt 005 (candidate `4f056016`): `PASS`. Typecheck, lint, format passed; fresh-clone suite 331 tests,
  330 passing. The one failure is a containment test that also fails at pre-014l baseline `03330f5a` and
  passes in the project checkout. All 33 required tests present.
- The evaluator noted the orchestration tests are thin; the verdict is evidence-based per the frozen plan.

## Material History

1. Brief readiness: first draft `NOT_READY`; revised draft `READY`.
2. Implementation attempt 1 delivered the full design; its broad test run was environment-limited.
3. Authorized pre-semantic correction (attempt 2): readiness had passed on provider connection alone; it now
   requires a positive tool-confirmed event (denial becomes a pre-allocation readiness failure).
4. Evaluator attempt 4 failed; implementation attempt 3 kept specific refusal categories instead of looping
   to `operational-retry-exhaustion` and updated fixtures for the readiness probe.
5. Evaluator attempt 5 passed.

## Decisions

- Operational and semantic retry budgets are independent; deterministic configuration refusals are recorded
  as failed launch attempts but keep their specific category.
- A readiness pass is single-use, consumed by the following allocation.
- Default human retry count is one.

## Discoveries

- Connection-only readiness is a false positive; a real tool call is required.
- Generic exhaustion handling regressed existing refusal categories.
- The implementation added unplanned scope, recorded in As-Built as "Extra": a methodology path for
  pre-semantic implementation correction (implementation skill contract v6), evaluation-closeout changes
  (private-attempt finalization validation), and an in-run shape re-check.

## Deferred Concerns

- No live-provider validation of readiness or retry.
- Thin orchestration tests; an environment-sensitive containment test fails in fresh clones (pre-existing).
- The evaluator's full-suite rerun in the real repository did not complete within its time limit.
- The Extra scope has not been separately reviewed against the brief's out-of-scope list.

## Skill Versions and Workflow Cost

- brief-readiness v5; design-map v4; evaluator v14 (prepare and verify); implementation v5 (attempt 1) and
  v6 (attempts 2–3); as-built v4; outcome v5. Manifest entries for attempts 2–3 and evaluator attempt 4 omit
  some execution and Role Grant identities. Workflow shape: 2 brief reviews, 3 implementation runs, 2
  verifications (1 fail). Token and time cost were not recorded in the manifest and are not estimated here.

## Next Step

Exercise the orchestration path with a live-provider canary, and decide whether the Extra methodology and
evaluation-closeout changes need their own review.
