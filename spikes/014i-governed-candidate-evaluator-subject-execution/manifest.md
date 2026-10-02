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

## Evaluator Verify — execution 9539014f-abd0-4ea5-820c-37d19d775f03

- Skill: `evaluator`, contract version 14, mode `verify`, attempt 001
- Candidate: `202a1bf1df26cb95f4f22c859063cf87d11daa31`; evaluator revision `001` (`sha256:dbaa99ca4e277226d1f214632cc5af6b0be7af757ddf96ad3007fd925508a9ed`)
- Result: BLOCKED, classification EVALUATOR_DEFECT; public record `verification-result.json`
- Summary: frozen identities matched; the bound fixture-package check passed; the sealed-bundle check could not be adjudicated because its oracle over-constrains representations the frozen authority leaves open; remaining procedures not completed
- Measurements: provider calls 0; token usage unavailable

## Implementation — execution db807964-80aa-4afe-a8f6-d9cb4932483f

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; Design Map `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`; evaluation requirements `sha256:33bc7a34dca20798c1d59e5c98aae2b9213aea8c06475f1069d282f6d4d9d2e2`; prepared coverage `sha256:8b994aa35375d25f16e3ff25340fc131e1d962dfedf0999df6760dab3f8ab4b6`
- Result: succeeded; no implementation-failure feedback was bound, and the existing candidate required no contract-driven code change
- Output content identity before this manifest update: Git tree `be6322532afd38784f36a0d6192eb29e03c00c50`
- Candidate retained: exact-commit evaluator reconstruction, non-authoritative relay, host-created four-root containment, raw capture, fail-closed sealing, read-only publication and evaluator-only production authorization
- Sealed evidence revalidated: contained manifest `sha256:3b4ee2b1ab9f6d00a2c529471bc40a2e3d480706a11227bb252e1eaa24b4a64c`; over-authorized manifest `sha256:0f70c6f9894ec101de6d458fb04f1793a7db48b5f22c3a8d388e7f7d5ad05cb3`; frozen fixture tree remained `315593c0e9278f3df5b62e1806f5ea068144eac6`
- Checks: `node --test test/candidate-subject.test.ts`, `npm run typecheck`, `npm run lint` and `npm run format:check` passed
- Broader suite: `npm test` was attempted; the candidate-subject suite passed, while multiple existing suites failed under the managed host's `spawnSync git EPERM` behavior and the aggregate hung until terminated. Direct `node test/host-fs-isolation.test.ts` confirmed all six 014h failures occurred at fixture `git init` with reported process status 0 and `EPERM`.
- Measurements: provider calls 0; token usage unavailable

## Attached runtime repair — execution fbf59bd8-1294-4d2c-ba64-aa68c10d7375

- Authority: one attached inline governed implementation Role Grant, explicitly limited to protected-Claude command-permission plumbing; no 014i brief, Design Map, candidate, evaluator revision or failed evaluator-repair attempt was changed.
- Pre-repair runtime: `1efcb5b74278d57c94e2826a80d0d94224eabaac`; repair: `4adb5dd1ce8d9777511673c83bbc4eab925e5ed4` (`fix: authorize protected Claude Bash in containment`).
- Files: `src/claude-workflow.ts`, `test/governed-executors.test.ts`.
- Change: protected unattended launches with granted local computation pass Claude's supported `Bash` tool-family permission inside the existing 014h bwrap boundary; ordinary launches remain prefix-bounded, explicit `git push` denial remains, and bypass flags remain forbidden.
- Coverage: deterministic protected verify and evaluator-repair launch construction asserts `auto`, no prompts, Bash authority, preserved push denial and rejection of bypass flags; existing governed-executor and 014h containment coverage passed.
- Checks: `node --test test/governed-executors.test.ts test/host-fs-isolation.test.ts` (37/37); `npm run check` passed (typecheck, lint, format and full test suite).
- Product boundary: provider execution plumbing only; candidate `202a1bf1df26cb95f4f22c859063cf87d11daa31` remains unchanged.

## Evaluator Repair — execution 5006b9fb-d74c-4086-93ce-2e778078a066

- Skill: `evaluator`, contract version 14, mode `repair`
- Trigger: finalized verification attempt 001 classified `EVALUATOR_DEFECT` (`7f9be350-30e3-49e8-8c33-768b5fea1ffc`)
- Source evaluator revision `001` (`sha256:dbaa99ca4e277226d1f214632cc5af6b0be7af757ddf96ad3007fd925508a9ed`) preserved; resulting revision `002` (`sha256:f8c5cc0adc329153246d901a6744fa999cbb1b905862cce98f5695a5922cd410`)
- Inputs unchanged: brief `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; Design Map `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`; evaluation requirements `sha256:33bc7a34dca20798c1d59e5c98aae2b9213aea8c06475f1069d282f6d4d9d2e2`
- Result: structural integrity PASS; acceptance semantics preserved; no implementation-shaped seam adopted; candidate not executed
- Measurements: provider calls 0; token usage unavailable

## Protected Claude runtime recovery — deterministic permission mode

- Scope: generic contained unattended protected-Claude launch behavior only; no 014i candidate, evaluator semantics, frozen input or historical attempt was changed.
- Diagnosis: the retained repair diagnostic showed an authorized Bash operation was denied before execution because provider-side approval was required for a runtime-computed path while no approval surface existed. The operation was subsequently completed through an equivalent run-scratch script; revision `002` was independently re-audited and remains admissible.
- Change: protected unattended launches now use the installed Claude CLI's supported `dontAsk` permission mode with the existing Harness-derived tool allow/deny rules. User, project and local settings remain excluded; admin-managed policy remains effective. `git push` stays explicitly denied; bypass modes stay forbidden; 014h bubblewrap containment and workspace visibility are unchanged.
- Deterministic checks: protected verify and repair receive identical `dontAsk` treatment and Bash authority; ordinary unprotected launch mode is unchanged; explicit push denial, bypass rejection and mandatory no-fallback containment coverage pass.
- Live preflight: one disposable protected execution (`943d7a82-2d90-4f1c-a8c8-6fdab0de91c0`) initialized in `dontAsk`; an authorized composed Bash command completed, a host-side `/tmp` sentinel remained invisible inside `bwrap`, and a separate `git push` was denied before execution. The preflight submitted `PASS` and exited cleanly; it was not an evaluator repair or verification attempt.
- Revision `002` audit: retained 24/24 repair controls passed; a fresh repaired self-test passed; all seven frozen artifact identities and the archived bundle matched; deterministic integrity validation returned `PASS` with no diagnostics and reproduced both public readiness identities.
- Checks: `npm run check` passed (typecheck, lint, format and 233 tests).

## Verification — execution ab9057a7-6b1e-49fb-8c63-2a53b4943194 (attempt 002)

- Skill: `evaluator`, contract version 14, mode `verify`
- Candidate `1efcb5b74278d57c94e2826a80d0d94224eabaac`; evaluator revision `002` (`sha256:f8c5cc0adc329153246d901a6744fa999cbb1b905862cce98f5695a5922cd410`); inputs matched their frozen identities
- Result: FAIL, `IMPLEMENTATION_FAILURE` — published bundles bind the contract identity in a form outside TR2; see `verify-feedback.md` and `verification-result.json`
- Measurements: provider calls 0; token usage unavailable

## Implementation — execution db8444d2-e4da-4591-951a-29bb62d9a73d

- Skill: `implementation`, contract version 5, pinned identity `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Inputs: brief `sha256:36143fc057b9a67594103baabb994f7b3c3b28a110c7d87b6baf39aa73796c7e`; Design Map `sha256:69548f440c3f54efbcf3c2cf621d5c75d5c7f951b75b397c4dbeb9c2b5ca5f3b`; evaluation requirements `sha256:33bc7a34dca20798c1d59e5c98aae2b9213aea8c06475f1069d282f6d4d9d2e2`; prepared coverage `sha256:6fdd13c2e733f1ac3cd9586dc3bdbb0f7754fd5ca702bc976f205f52d97e385e`; implementation feedback `sha256:1e3d99ebeed9131f42eeafe3a7b331c2c635929d4b4d32900df9e432d99229c3`
- Result: succeeded; corrected attempt 002's TR2 implementation failure
- Output content identity before this manifest update: Git tree `99abf88e9b02cd60f32ecb0b9223dd271ab77e2f`
- Change: exact committed contract bytes now receive a distinct source identity; reconstruction continues to validate the canonical parsed-contract identity, while sealed manifests bind the contract-file SHA-256 required by TR2
- Regenerated sealed evidence: contained manifest `sha256:85273030f81d9813c6ad9908d6d0f33ea879ffab19043daa52fd1eab51886884`; over-authorized manifest `sha256:cb62e9276aa37aeb42347fa8820c7753e89a2614dde2fdd0b6057f26c6f661d6`; runtime commit `b98d8b4bc9dc817afab9f79b9cf6b60e487d4648`; fixture candidate commits and frozen fixture tree unchanged
- Checks passed: `npm run typecheck`; `npm run lint` on retry after one ESLint segmentation fault; `npm run format:check`; `node --test test/candidate-subject.test.ts`; direct `node test/candidate-subject.test.ts` (7/7); both bundles passed `validateSubjectBundle`; manifest contract identities matched the fixture contract-file SHA-256 values; frozen fixture tree remained `315593c0e9278f3df5b62e1806f5ea068144eac6`
- Broader checks: `npm test`, `node test/host-fs-isolation.test.ts` and `node test/governed-executors.test.ts` were attempted; affected tests could not complete under the managed host because Node child Git operations returned `EPERM` despite status 0, and one governed regression could not read a host-managed workflow ledger. The aggregate run hung after reporting these infrastructure failures and was terminated; no related assertion failure was observed.
- Measurements: provider calls 0; token usage unavailable
