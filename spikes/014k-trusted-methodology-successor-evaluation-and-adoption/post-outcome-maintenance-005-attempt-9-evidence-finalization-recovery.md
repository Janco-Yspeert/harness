# Post-Outcome maintenance 005 — attempt-9 evidence finalization recovery

Status: **COMPLETE; ARCHIVE/PROMOTION RECOVERY NOT ATTEMPTED**

## Authority and boundaries

This is explicitly human-authorized forward-only post-Outcome maintenance
performed inline through Codex App. It is not a governed Harness role
allocation, a new evaluator execution, methodology evolution, or a reopening of
the completed 014k workflow.

The maintenance is bound only to Spike 014f attempt 9:

- execution `d59a2e87-2bf0-494c-86af-9012967229b6`;
- Role Grant
  `sha256:2be47c1a08de48261c0263c65ac6c9b356a97f2d2ad75cf0111441412d4a8f05`;
- allocation event `e95da57e-458f-458e-9787-8b61fe2b0b99`;
- semantic result `6985ffea-a473-43a4-8f1e-3912d3bfe8f8`, `PASS`;
- candidate `af75b14d1847af02404a591a8829751dc8df2a2e`;
- evaluator revision `002`.

No evaluator was rerun, no attempt 10 was created, no private evaluator file or
ledger row was changed, and no archive or promotion recovery was attempted.
Trusted methodology sequence 6, its identity, the 014f candidate and evaluator
revision, and the completed 014k Outcome remain unchanged.

## Surviving evaluator evidence and criterion projection

The original public artifact remains immutable at commit
`10b37cd6a495c9a5a012bc3961000c3ed61ca988`, identity
`sha256:e5beec0bf66c671d429ebc1819f8063c9ed66afafc3f10a837483022230141fe`.
Its missing `coverageResults` object caused the preserved
`kernel.transition-blocked` reason `expected an object`.

The bounded provider diagnostic retained for execution `d59a2e87...` contains
the exact evaluator-authored outcomes for all eleven named E1–E6 executable
cases (11 pass, 0 fail), the completed R1 differential observations, and the P1
identity observations. The frozen revision-002 coverage map, bound by the Role
Grant at identity
`sha256:14527f3f714d5d0bb86de59762adc01303f9b11ef4c097870d50e7da1cc7f15a`,
provides the criterion/procedure relationships and criterion-specific
sufficiency statements. The private attempt result remains unchanged at
identity
`sha256:52d576b80931ee77a314f1b5a55398072e21be23be71e2d87ef25924a6bc3af5`.

The public criterion values were recovered mechanically from those exact
observations and frozen links:

- AC01: E1 and E4 passed;
- AC02: E1 and E6 passed;
- AC03: E3 and E4 passed;
- AC04: E2 and E5 passed;
- AC05: E2 and E4 passed;
- AC06: E6 passed;
- AC07: R1 established that no baseline-passing behavior failed at the
  candidate and the required static checks passed;
- AC08: E1–E6 passed and P1 bound the clean candidate and frozen evaluator
  identities.

This projection does not derive eight adjudications from the aggregate `8/8`
counter and adds no new evaluator interpretation.

## Corrected public artifact

Commit `193c4d4cbf109fb0cf3fcd3685d11fb482a061ec` adds only the missing
criterion accounting to the forward version of
`spikes/014f-inactive-workflow-grant-retirement/verification-result.json`.
The corrected artifact identity is
`sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`.
Candidate, evaluator revision, execution, attempt, semantic `PASS`, aggregate
coverage and summary remain unchanged. The exact pinned
`verification-accounting` validator accepted the corrected bytes.

## Generic transition recovery and canonical event

Implementation commit `1649d727d202dfafe1ba9afa960068478fcbb07c`
adds a root-only `transition-recovery` operation. It binds the original
execution, Role Grant, allocation event, semantic result, candidate, evaluator
revision, attempt, result, target transition, corrected artifact path, commit
and identity. It invokes the ordinary pinned transition validator, appends no
semantic result or allocation, refuses drift before mutation, and returns the
existing canonical event on exact replay. Commit
`ce4c4a2182b7710f6597ffe078bc4066a9fde1c4` makes each allocation-binding
refusal precise without changing authority or success behavior.

The root-authorized replay used the ordinary transition machinery and recorded:

- `verification-finalized` event
  `138271e4-40d9-4f5d-bdf9-42e72fc8fbc0`;
- matching `kernel.transition` event
  `02fdef5c-3f5e-4008-be87-d8aece983916`;
- corrected artifact commit `193c4d4cbf109fb0cf3fcd3685d11fb482a061ec`;
- corrected artifact identity
  `sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`;
- original semantic result `6985ffea-a473-43a4-8f1e-3912d3bfe8f8`.

An exact replay returned the same `verification-finalized` event and appended
nothing. The original blocked transitions and malformed artifact remain
preserved.

## Files and verification

Changed files and final identities:

- `src/kernel/execution.ts`
  `sha256:ae1db29bdb3d6f105b405c671b6d849285457ed83f53988862e850846fec8cf8`;
- `src/kernel/host.ts`
  `sha256:638d46905d21214d93c0e64e933f0e5c44aa6d64f1fd4a3d3106e4fa265c32af`;
- `test/kernel.test.ts`
  `sha256:fb52cd9fecbcd6fdad017c04f267c54d27c3e550d749723e1b39cb6ca2031159`;
- Spike 014f `verification-result.json`
  `sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`;
- this maintenance record and the 014k manifest.

Checks passed:

- focused transition-recovery tests: 3/3;
- complete kernel regression: 41/41;
- sequence-6 kernel/workflow/skill-fidelity/closeout regression set: PASS;
- full test suite: PASS;
- TypeScript typecheck, ESLint, Prettier and `git diff --check`: PASS;
- exact live replay: one canonical event; exact replay returned the same event.

## Remaining boundary

Attempt 9 is now canonically finalized and remains the sole PASS attempt. The
complete archive is still blocked independently: attempts 1, 2 and 5 have
canonical terminal BLOCKED history but no retained private terminal artifact or
durable private artifact identity. This authority did not alter or solve that
historical gap, request promotion, produce As-Built, or perform human
acceptance.
