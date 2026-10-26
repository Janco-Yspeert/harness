# Verification Result Publication Correction — Attempt 001

This is a forward-only correction of the public verification-result format. It
does not rerun evaluation or change the original semantic result.

- Original public checkpoint: commit
  `0e8ea60be6833091637d9d71331519e2c942a536`, artifact identity
  `sha256:bbc2e831928d91d1da5de10092c159a308b8b5140e9e3ec01f65b4063d578c58`.
- Original semantic result:
  `021df628-d0cc-4a44-a93e-b027f870bae2`, `FAIL / IMPLEMENTATION_FAILURE`.
- Candidate: `f2def40a5fe06701b499c24aaa0d8d5c70e80478`.
- Evaluator revision and attempt: `001`, attempt `1`.
- Corrected artifact identity:
  `sha256:7120b812f36ea16386f2817ac9b1978e7089dfa710d3075d3864526c5ff851d5`.

The original artifact used `candidate` and array-style `coverage`, while the
pinned validator requires `commit` and criterion-keyed `coverageResults`. The
corrected artifact projects only the original public findings into that schema.
It accounts for all 15 frozen criteria and records AC13 as `NOT_ADJUDICATED`
rather than overstating its incomplete positive observation.

The exact pinned `verification-accounting` validator accepted the corrected
bytes. A separate public-only review independently confirmed the schema,
criterion accounting, verdict preservation, and conservative dispositions.
The private attempt result and ledger were not modified.

The Git commit containing this record is the corrected public checkpoint. The
canonical workflow transition remains host-owned and must bind that commit and
the corrected artifact identity to the original semantic result.
