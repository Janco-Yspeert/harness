# Eval result — attempt 001 (cycle 3, evaluator revision 003)

- Execution: 5c02b191-4a20-4a47-b6f2-847dfd0ce135
- Implementation: git:2e1cf0e2ee3facc2742dade252ac970b03f38a26
- Evaluator revision: 003 (freeze identity sha256:0128bd895b7e5f0b6e47e6a2d081eac4203c98adaf18202c35b985afbdceb144)
- Result: PASS (no classification)
- Evaluator integrity: brief, Design Map, eval-requirements (sha256:9b83a28e...) matched frozen identities; hidden tests/support match freeze.json artifact identities (unchanged from revision 002). Candidate executed from a clean clone of the exact commit; tracked tree clean.
- Attempt-numbering note: the host allocated attempt 1 for this cycle; the prior cycle's ledger, plan and terminal attempt (attempt 001 PASS under revision 002, candidate 7a4aa3e) were preserved byte-identical under .eval/cycles/002/ before this cycle's ledger was started.

## Mandatory executable
E1 PASS, E2 PASS, E3 PASS. Evaluator self-check 6/6 PASS.

## R1
typecheck PASS; lint PASS; prettier PASS on src/test/skills/tools/methodologies. npm test 259/260: sole failure is the 014e contained-worker test (environmental; identical to prior attempts' baseline-comparable failure, test file unchanged). Candidate adds a kernel test asserting the real host promotion path records the host-derived cycle (002) on promotion-recorded under a non-initial correction cycle, with a stale earlier-cycle allocation present.

## Reviews
M1-M6 ok: the candidate diff since the revision-002 PASS candidate (7a4aa3e) is limited to src/kernel/execution.ts and test/kernel.test.ts (+ public records); J substrate, declaration, verdict/archive, adoption and cutover code unchanged; no test removed.
M7 ok: (a) promote() now emits the scope field on promotion-recorded, host-derived from the latest correction-cycle-opened event (initial 001 otherwise) and asserted through the real host action path; (b)/(c) the gate reads via scopedEvents on that field, so current-cycle promotion clears it and earlier-cycle promotion is excluded (same mechanism covered by existing scoped-decision tests); (d) the promote request body supplies only candidate/revision/attempt, the cycle key is set by the host and not overridable; (e) initial-cycle path falls back to scope.initial; (f) workflow-private-root tests retained and passing; (g) no accepted test removed (E3). Archive allocation derivation now uses scopedEvents so earlier-cycle allocations do not shadow the current one. Other host-authored events (human decisions, scope-bound) already carry the cycle; no same-class omission demonstrated. Non-blocking follow-up: add a test asserting gate clearing directly after real-path promotion under cycle 002.

## Diagnostics (non-authoritative)
None beyond reading the diff and scopedEvents.

## Promotion
Revision 003 bundle contains private hidden tests: ineligible. Ledger and terminal attempt eligible.
