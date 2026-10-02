# Spike 014i Manifest

## Brief Readiness — execution fd8896d8-5464-45fb-a72b-abe96264f4d4

- Skill: `brief-readiness`, contract version 5
- Input: `spike.md` (`sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`)
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 4 material clarifications, 0 editorial findings
- Checks: bound brief read completely; repository contracts, implementation and public history inspected by targeted search; brief identity confirmed with `sha256sum`; evaluator-private material not inspected
- Measurements: runtime-provided wall-clock time and token usage unavailable

## Design Map — execution 6374d3c0-e83a-4e95-8e1d-a7d6759248f6

- Skill: `design-map`, contract version 4
- Input: `spike.md` (`sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`), committed at `78c683c`
- Result: succeeded
- Output: `design-map.md` (`sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`)
- Decisions: one exact-commit candidate `evaluator-verify` subject operation; separate non-authoritative worker-tool relay; host-created disposable roots; host-owned lifecycle and raw capture; fail-closed sealing; unchanged committed evidence handoff for read-only trusted-N inspection
- Checks: bound brief identity and committed provenance verified; relevant repository contracts, public interfaces, implementation, tests and prior public Design Maps inspected; `git diff --check` passed for the map; evaluator-private material not inspected
- Measurements: runtime-provided wall-clock time and token usage unavailable

## Evaluator Prepare — execution 6a6ba593-76cd-4162-bff2-34a0798fd2a5

- Skill: `evaluator` (mode `prepare`), contract version 14, pinned identity `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`
- Inputs: brief `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; Design Map `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`
- Outputs: `eval-requirements.md`, `coverage-map.json`, bound fixture package (commit `21e037c71e7b2617fadb89f4a3edeb86cc985d3a`, tree `315593c0e9278f3df5b62e1806f5ea068144eac6`)
- Result: succeeded; evaluator revision `001` frozen after passing pre-freeze integrity validation (10 criterion records, 7 procedures)
- Coverage: 2 executable, 1 public regression and 4 manual-review procedures; absence of further hidden tests preserves Design Map implementation freedom
- Measurements: provider calls 0; token usage unavailable

## Implementation — execution 85bde5b1-ccaf-4422-869c-c2a1133e7288

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; Design Map `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`; evaluation requirements `sha256:33bc7a34dca20798c1d59e5c98aae2b9213aea8c06475f1069d282f6d4d9d2e2`; prepared coverage `sha256:8b994aa35375d25f16e3ff25340fc131e1d962dfedf0999df6760dab3f8ab4b6`
- Result: succeeded
- Output content identity before this manifest update: Git tree `d486440f7c4e96973acb667f3a227ee2df5c3820`
- Changes: exact-commit candidate `evaluator-verify` reconstruction; non-authoritative worker-tool relay; host-created four-root contained execution; lifecycle and raw capture; fail-closed sealing and unchanged publication; narrow governed-host operation; deterministic visible regression coverage
- Fixture candidates: contained commit `7b8b89f2589e55776c3594a7ab713eecf5e5e5ec`; over-authorized commit `ea8af8ee162d4e32d04ed737172986ec185f7a4e`; runtime commit `c13251d5b08897eeaab8bba9d12a6f23d3ac1400`
- Sealed evidence: contained manifest `sha256:3b4ee2b1ab9f6d00a2c529471bc40a2e3d480706a11227bb252e1eaa24b4a64c`; over-authorized manifest `sha256:0f70c6f9894ec101de6d458fb04f1793a7db48b5f22c3a8d388e7f7d5ad05cb3`
- Checks: `npm run typecheck`, `npm run lint` and `npm run format:check` passed; `node test/candidate-subject.test.ts` passed 7/7, including real `bubblewrap` fixture runs; both committed bundles passed `validateSubjectBundle`; frozen fixture tree remained `315593c0e9278f3df5b62e1806f5ea068144eac6`
- Broader suite: `npm test` was attempted; the new candidate-subject suite passed, but the managed host returned `EPERM` from otherwise successful Node child Git operations and unrelated existing suites failed or hung. A direct existing archive-manifest run passed 5/6 with its sole failure at that `EPERM`, and the existing 014h isolation suite failed during fixture `git init` for the same reason. The hung aggregate run was terminated.
- Measurements: provider calls 0; token usage unavailable
