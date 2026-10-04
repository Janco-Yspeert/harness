# Spike 014g Manifest

## Brief Readiness — execution ef9a1654-d1c9-4078-9a89-8b121b40ecb4

- Skill: `brief-readiness`, contract version 5
- Input: `spike.md` (`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`)
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 3 material clarifications (M1–M3), 1 editorial
- Measurements: wall-clock time and token usage unavailable.

## Design Map — execution 78e10240-45f6-4f89-9485-d9bc8fd8f307

- Skill: `design-map`, contract version 4
- Input: `spike.md` (`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`)
- Result: succeeded
- Output: `design-map.md` (`sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`)
- Decisions: host-mediated evidence mutation with the verifier's repository-write and git-commit removed; frozen regression set is every `014e` test in `test/external-project.test.ts` at blob `4b361f81e307e129be6d106c9df9a4910e674be9`; regressions run as verifier commands; refusal before session start.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare — execution 70f1a1ec-2617-4a49-879f-ba9804fefc3e

- Skill: `evaluator`, contract version 14, mode `prepare`
- Inputs: brief `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`, Design Map `sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`
- Result: succeeded; evaluator revision `001` frozen (`sha256:6c5da22f74c91e0047e44b5fd7bce1a322f0211fbd6301410797baebad3863bd`)
- Outputs: `eval-requirements.md` (`sha256:f3fd130f1bd3d3e3348918eea6562a2dc2d23f89504dc87277c39df3293a0cca`), `coverage-map.json` (7 criterion records, pre-freeze integrity validation PASS)
- Coverage: 5 executable cases, 1 public regression, 1 manual review
- Measurements: wall-clock time and token usage unavailable.

## Implementation — execution a8d59759-cc65-40ed-9ca3-889367fee534

- Skill: `implementation`, contract version 5; branch `feat/spike-014`
- Inputs: brief `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`, Design Map `sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`, coverage `sha256:2af6e4309556149b48906fe026057e151423eda9a79f5e399a48db0172ee5b15`, requirements `sha256:f3fd130f1bd3d3e3348918eea6562a2dc2d23f89504dc87277c39df3293a0cca`; no implementation feedback (first attempt)
- Result: succeeded (candidate committed locally; independent verification not yet run)
- Output: candidate patch (staged code, contract and test paths, excluding this entry) `sha256:53eeeffa8367e40bcf347ac5d8736dc310e77d1df286291eedc8a4ac4f17220c`
- Change: host-mediated `requestAction` kind `evidence` (contract `evidence` allowlist, grant `hostActions.evidence`); `evaluator-verify` loses repository-write and git-commit and receives its repository workspace read-only; launch refused in `planLaunch` when the composition is not enforceable; Claude command sandbox denies command writes to read-only workspaces
- Visible checks: `tsc --noEmit`, `eslint src test`, `prettier --check src test methodologies`, `npm test` (207 pass, 0 fail, 0 skipped; new `test/evidence-action.test.ts`, 014e tests unchanged)
- Skipped: `prettier --check .` (untracked operator dotfiles in the checkout are unreadable in this sandbox); live Claude run of the verifier
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify — execution 7b471b6f-db44-4208-9ad9-b12977ca2d42

- Skill: `evaluator`, contract version 14, mode `verify`; attempt 002, evaluator revision `001`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Result: BLOCKED, classification SPECIFICATION_AMBIGUITY (2 criteria satisfied, 5 not adjudicated)
- Output: `verification-result.json`
- Note: the verifier launched under the pinned methodology, so the candidate composition was not the effective launch authority; attempt 001 returned no result.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify — execution 10e9aeb3-008d-451c-b298-26a578111089

- Skill: `evaluator`, contract version 14, mode `verify`; attempt 003, evaluator revision `001`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Result: BLOCKED, classification SPECIFICATION_AMBIGUITY (0 criteria satisfied, 7 not adjudicated)
- Output: `verification-result.json`
- Note: the verifier again launched under the pinned methodology with repository write authority, so the candidate composition was not the effective launch authority; command execution was restricted and no frozen case was re-run.
- Measurements: wall-clock time and token usage unavailable.

## Brief Readiness (recovery revision) — execution dd09c411-5b83-494f-a767-dbd66cd6a043

- Skill: `brief-readiness`, contract version 5
- Input: brief `sha256:a29c32f4b8ddd7be5fa22bd4bd46e1d0309eb2dad3e19f9d734181f3252f0c5a`
- Result: NOT_READY (1 blocker, 3 material clarifications, 1 editorial)
- Outputs: `feedback.md`, `preliminary/001/spike.md`, `preliminary/001/feedback.md`
- Measurements: wall-clock time and token usage unavailable.

## Brief Readiness (recovery revision 2) — execution ee9670df-8132-4ab6-a191-8dc07f01992b

- Skill: `brief-readiness`, contract version 5
- Input: brief `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 2 material clarifications (C1–C2), 1 editorial; prior B1, M1–M3 and E1 resolved
- Measurements: wall-clock time and token usage unavailable.

## Design Map (recovery revision) — execution 01befe37-c769-474d-b95d-7d0c1ba07b0b

- Skill: `design-map`, contract version 4
- Input: `spike.md` (`sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`)
- Result: succeeded
- Output: `design-map.md` (`sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`)
- Decisions: prior host-mediated-mutation decisions carried forward; added SC6 separating authoritative trusted-N evidence from bounded candidate-subject evidence (subject cannot emit the authoritative result; smallest fixture runs the unchanged 014e blob).
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare (recovery revision) — execution 4979763a-cc58-48c3-907e-9be28bf8502d

- Skill: `evaluator`, contract version 14, mode `prepare`; evaluator revision `002` (revision `001` preserved)
- Inputs: brief `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`, Design Map `sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`
- Outputs: `eval-requirements.md` (`sha256:8ede56f90b8d37cfbdf6840c650e56587fbe2d33005149378bc8b8730cf94551`), `coverage-map.json`
- Evaluator revision identity: `sha256:6091eac3062c17711a9828fe813a71389ca83a9f5c30c99bfe92a42f659b0f82`
- Result: succeeded; pre-freeze integrity validation PASS (8 criteria, 9 procedures)
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 004 — execution 370e66df-cdb6-4104-827f-308f70b9404b

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision `002`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Output: `verification-result.json`
- Result: succeeded; BLOCKED / INFRASTRUCTURE_FAILURE (trusted-N cases and regression passed; candidate-subject evidence could not be produced or admitted)
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 005 — execution f7a04d8e-1c78-4a16-857b-83f99a43eeb0

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision `002`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Output: `verification-result.json`
- Result: succeeded; BLOCKED / INFRASTRUCTURE_FAILURE (no executable case could be run in this sandbox; subject evidence lacks raw outputs)
- Measurements: wall-clock time and token usage unavailable.

## Implementation correction — execution 9663c881-367e-40c7-bcfb-5d6c37264d7b

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; Role Grant `sha256:91bc160137ff09313b38875e756f2393f5e2fd41f43e8a7cde8580cfb2148137`
- Inputs: brief `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`, Design Map `sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`, requirements `sha256:8ede56f90b8d37cfbdf6840c650e56587fbe2d33005149378bc8b8730cf94551`; sanitized implementation feedback bound by the Role Grant: protected unattended Claude's explicit `dontAsk` allowlist did not consistently admit every enabled provider tool family
- Result: succeeded (new candidate committed locally after this entry; independent verification not yet run)
- Output: candidate patch (source and visible test paths, excluding this entry) `sha256:b3a6f72a324bd5098f0bb1331491146db9c8e3715f1262d9862d042928e2ec49`
- Change: protected unattended Claude launches now derive their explicit allowlist from every provider tool family selected by the reviewed Harness capability mapping; narrower read-only workspace and git-push denials still override broad family grants; ordinary unprotected Claude launches are unchanged
- Visible checks: `node --test --test-reporter=spec test/governed-executors.test.ts` (31 pass, 0 fail, 0 skipped); `npm run typecheck`; `npm run lint`; `npx prettier --check src test methodologies tools`; `npm test` (240 pass, 0 fail, 0 skipped); `git diff --check`
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 008 — execution 4430e87a-041b-4a00-966f-d124d159a718

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision `002`
- Candidate: `e8428205a58a1c12d6f17d9a80a160b78c754cb9`
- Output: `verification-result.json`, `verification-feedback.md`
- Result: succeeded; FAIL / IMPLEMENTATION_FAILURE (frozen 014e block altered; subject run 16 of 17; evaluator lineage sub-check defect noted for repair)
- Measurements: wall-clock time and token usage unavailable.

## Human specification decision — 2026-10-04

- Authority: explicit human decision recorded in `specification-revision-authority.md` (`sha256:e5ac26e3619768732e7ca6632eb9ec4d94b4c111fe4fb0309e917944f6c235c7`)
- Decision: frozen 014g SC1/AC03 is partially superseded only where its original 014e D4 regression requires adapter/provider metadata to cause `planLaunch` refusal; accepted Spike 014h moved that mechanism into mandatory host-owned containment for every spawned registered-adapter launch
- Preserved invariant: containment remains mandatory; the decision authorizes a forward specification revision replacing only the obsolete mechanism-specific assertion with accepted 014h behavior and corresponding regressions
- Unchanged: every other frozen 014g requirement, artifact, candidate identity, evaluator revision, and historical attempt
- No role execution or frozen-artifact revision was performed by this record.

## Brief Readiness (forward specification recovery) — execution 96c595d3-9b04-4039-a74a-60c9eb8e19ca

- Skill: `brief-readiness`, contract version 5
- Input: brief `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`
- Result: succeeded, verdict READY (Ready to freeze)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 0 material clarifications
- Checks: bound brief identity; public authority and accepted 014h/014i Outcomes; current containment, candidate-subject and evaluator-contract surfaces; referenced commits, ancestry and blob identities; exact 014e-to-014h test diff
- Limitations: product tests not run; evaluator-private material and workflow ledgers not inspected
- Measurements: wall-clock time and token usage unavailable.

## Design Map (forward specification recovery) — execution f98a8c70-52fc-4ce6-82d2-9b8607b600d9

- Skill: `design-map`, contract version 4
- Input: `spike.md` (`sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`)
- Result: succeeded
- Output: `design-map.md` (`sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`)
- Decisions: bounded host-mediated evidence mutation remains the selected shape; accepted 014h universal host containment supplies the launch boundary; accepted 014i candidate-subject execution supplies the non-authoritative N+1 observation boundary; revised SC1 preserves every still-valid 014e test block, excludes only the named obsolete D4 block, and adds the exact accepted 014h replacements from blobs `74a51d545681532ac4c49ac9034712ee3217974d` and `b9c135790860a87e76afdfb458a7b0758d129704`.
- Checks: bound brief identity and committed ancestry; referenced 014e/014h commit and blob identities; public accepted 014h/014i Outcomes; current containment, governed-execution and candidate-subject surfaces; `git diff --check`; Prettier check of `design-map.md`.
- Limitations: product tests not run because this role changed only the shared design artifact and manifest; evaluator-private material and workflow ledgers not inspected.
- Measurements: wall-clock time and token usage unavailable.
