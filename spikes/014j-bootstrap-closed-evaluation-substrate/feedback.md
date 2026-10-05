# Verification feedback — attempt 004 (candidate 09da7b8)

Result: FAIL, classification IMPLEMENTATION_FAILURE.

- Violated public requirement: TR2 (b)–(g) and the regression suite (all checks must pass).
- Expected: the candidate's deterministic host-operation test passes, and the suite passes apart from known baseline environmental failures.
- Observed: the test "root prepares an exact private observation and no weaker authority can" fails deterministically; it asserts a single `kernel.prepared-observation` ledger event but two exist after its direct operation call plus its request-path call. Reproduced in isolation. The 014e containment failure is environmental and also occurs at the baseline.
- Safe diagnostics: preservation, static surface and closure checks, typecheck, lint and format pass; `npm test` 243/245 in a clean candidate checkout.
- Retry: make the test and the operation's behavior consistent (single intended record per preparation) against the same frozen evaluation.
