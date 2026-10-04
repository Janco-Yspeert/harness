# Verification feedback — attempt 008 (candidate e8428205)

Result: FAIL — IMPLEMENTATION_FAILURE.

- Violated requirement: AC03 / required behavior 8 — the frozen 014e group must remain unchanged and pass unchanged.
- Expected: every frozen 014e block byte-identical to the frozen blob (`4b361f81…`) and passing in the bounded verifier subject.
- Observed: the block "014e D4: containment makes forbidden-exposure grants eligible for every adapter only when enforced" was replaced in `test/external-project.test.ts`; running the frozen blob reports 16 of 17 passing, the failing title being that one ("Missing expected exception"). Subject boundary observation also reported home and sibling locations readable (AC01).
- Safe diagnostics: restore the frozen block unchanged and keep its asserted launch behavior; do not expose home or sibling locations to the verifier sandbox.
- Note: an evaluator-side lineage sub-check defect was found (it diffs the revised brief/design map against the pre-recovery base); it needs a repair but did not decide this result.
