# Eval result — attempt 001 (cycle 2, evaluator revision 002)

- Execution: 9bc76994-a478-4d9b-8456-c62fc71c13f8
- Implementation: git:7a4aa3eeeae595ab0cfc56ce76a492328d4fce01
- Evaluator revision: 002 (freeze identity sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f)
- Result: PASS (no classification)
- Evaluator integrity: brief, Design Map, eval-requirements (sha256:9b83a28e...), spec, case manifest, hidden tests and support matched frozen identities. Candidate executed from a clean checkout of the exact commit.
- Attempt-numbering note: the host allocated attempt 1 for this cycle; the prior cycle's ledger/attempts (attempts 001 FAIL, 002 PASS under revision 001, different candidates) were preserved byte-identical under .eval/cycles/001/ before this cycle's ledger was started.

## Mandatory executable
E1 PASS, E2 PASS, E3 PASS. Evaluator self-check 6/6 PASS.

## R1
typecheck PASS; lint PASS; prettier PASS on repository files (the sole format error is an unreadable untracked .mcp.json, a sandbox artifact). npm test 258/259: sole failure is the 014e contained-worker test (write-harness 'yes'), caused by the sandbox granting write access to the checkout; the test file is unchanged from baseline and not touched by the candidate (environmental). Successor-closeout and kernel tests assert each TR2 behavior.

## Reviews
M1 ok: all procedures use only git inspection, repo checks, review under trusted N.
M2 ok: observation declaration is closed/canonical, rejects unknown fields, paths, inline content; fulfilment only from a sealed matching record; J modules (candidate-observation, candidate-subject) unmodified.
M3 ok: evaluation fact and archive record separate; attempts NONTERMINAL/TERMINAL/LOST per design; active revision archived from canonical location; fail-closed staging; host derives archive from ledger and allocations; evaluator-verify contract uses promotion.derive host-archive.
M4 ok: promoteMethodology now binds predecessor sequence, PASS identity, closeout identity; stale/replay refused; trusted.jsonl unchanged at sequence 5 (E1); no worker route (E2).
M5 ok: fresh-allocation-after-adoption fixture test; no baseline tests deleted (E3).
M6 ok: kernel tests build a shared parent evaluation root with stale evidence and a workflow-scoped private root; host archive binds source through the Role Grant workspace (refusing one outside the grant); parent/other-workflow evidence cannot satisfy; missing evidence fails closed with no fallback; changed bytes fail identity validation; NONTERMINAL/TERMINAL/active-revision semantics asserted in successor-closeout tests; J modules unchanged.

## Diagnostics (non-authoritative)
Baseline comparison of the 014e test not rerun; failure cause identified from assertion output.

## Promotion
Revision 002 bundle contains private hidden tests: ineligible. Ledger and terminal attempt eligible.
