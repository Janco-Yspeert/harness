# Spike 014g Manifest

## Brief Readiness — execution ef9a1654-d1c9-4078-9a89-8b121b40ecb4

- Skill: `brief-readiness`, contract version 5
- Input: `spike.md`
  (`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`)
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 3 material clarifications (M1–M3), 1 editorial
- Measurements: wall-clock time and token usage unavailable.

## Design Map — execution 78e10240-45f6-4f89-9485-d9bc8fd8f307

- Skill: `design-map`, contract version 4
- Input: `spike.md`
  (`sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`)
- Result: succeeded
- Output: `design-map.md`
  (`sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`)
- Decisions: host-mediated evidence mutation with the verifier's
  repository-write and git-commit removed; frozen regression set is every `014e`
  test in `test/external-project.test.ts` at blob
  `4b361f81e307e129be6d106c9df9a4910e674be9`; regressions run as verifier
  commands; refusal before session start.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare — execution 70f1a1ec-2617-4a49-879f-ba9804fefc3e

- Skill: `evaluator`, contract version 14, mode `prepare`
- Inputs: brief
  `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`,
  Design Map
  `sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`
- Result: succeeded; evaluator revision `001` frozen
  (`sha256:6c5da22f74c91e0047e44b5fd7bce1a322f0211fbd6301410797baebad3863bd`)
- Outputs: `eval-requirements.md`
  (`sha256:f3fd130f1bd3d3e3348918eea6562a2dc2d23f89504dc87277c39df3293a0cca`),
  `coverage-map.json` (7 criterion records, pre-freeze integrity validation
  PASS)
- Coverage: 5 executable cases, 1 public regression, 1 manual review
- Measurements: wall-clock time and token usage unavailable.

## Implementation — execution a8d59759-cc65-40ed-9ca3-889367fee534

- Skill: `implementation`, contract version 5; branch `feat/spike-014`
- Inputs: brief
  `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676`,
  Design Map
  `sha256:b0c6aaf07569ee815d7055440948008cbdb6370439dd4126dc64adab97c8e0a3`,
  coverage
  `sha256:2af6e4309556149b48906fe026057e151423eda9a79f5e399a48db0172ee5b15`,
  requirements
  `sha256:f3fd130f1bd3d3e3348918eea6562a2dc2d23f89504dc87277c39df3293a0cca`; no
  implementation feedback (first attempt)
- Result: succeeded (candidate committed locally; independent verification not
  yet run)
- Output: candidate patch (staged code, contract and test paths, excluding this
  entry)
  `sha256:53eeeffa8367e40bcf347ac5d8736dc310e77d1df286291eedc8a4ac4f17220c`
- Change: host-mediated `requestAction` kind `evidence` (contract `evidence`
  allowlist, grant `hostActions.evidence`); `evaluator-verify` loses
  repository-write and git-commit and receives its repository workspace
  read-only; launch refused in `planLaunch` when the composition is not
  enforceable; Claude command sandbox denies command writes to read-only
  workspaces
- Visible checks: `tsc --noEmit`, `eslint src test`,
  `prettier --check src test methodologies`, `npm test` (207 pass, 0 fail, 0
  skipped; new `test/evidence-action.test.ts`, 014e tests unchanged)
- Skipped: `prettier --check .` (untracked operator dotfiles in the checkout are
  unreadable in this sandbox); live Claude run of the verifier
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify — execution 7b471b6f-db44-4208-9ad9-b12977ca2d42

- Skill: `evaluator`, contract version 14, mode `verify`; attempt 002, evaluator
  revision `001`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Result: BLOCKED, classification SPECIFICATION_AMBIGUITY (2 criteria satisfied,
  5 not adjudicated)
- Output: `verification-result.json`
- Note: the verifier launched under the pinned methodology, so the candidate
  composition was not the effective launch authority; attempt 001 returned no
  result.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify — execution 10e9aeb3-008d-451c-b298-26a578111089

- Skill: `evaluator`, contract version 14, mode `verify`; attempt 003, evaluator
  revision `001`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Result: BLOCKED, classification SPECIFICATION_AMBIGUITY (0 criteria satisfied,
  7 not adjudicated)
- Output: `verification-result.json`
- Note: the verifier again launched under the pinned methodology with repository
  write authority, so the candidate composition was not the effective launch
  authority; command execution was restricted and no frozen case was re-run.
- Measurements: wall-clock time and token usage unavailable.

## Brief Readiness (recovery revision) — execution dd09c411-5b83-494f-a767-dbd66cd6a043

- Skill: `brief-readiness`, contract version 5
- Input: brief
  `sha256:a29c32f4b8ddd7be5fa22bd4bd46e1d0309eb2dad3e19f9d734181f3252f0c5a`
- Result: NOT_READY (1 blocker, 3 material clarifications, 1 editorial)
- Outputs: `feedback.md`, `preliminary/001/spike.md`,
  `preliminary/001/feedback.md`
- Measurements: wall-clock time and token usage unavailable.

## Brief Readiness (recovery revision 2) — execution ee9670df-8132-4ab6-a191-8dc07f01992b

- Skill: `brief-readiness`, contract version 5
- Input: brief
  `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`
- Result: succeeded, verdict READY (Ready after minor clarification)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 2 material clarifications (C1–C2), 1 editorial; prior
  B1, M1–M3 and E1 resolved
- Measurements: wall-clock time and token usage unavailable.

## Design Map (recovery revision) — execution 01befe37-c769-474d-b95d-7d0c1ba07b0b

- Skill: `design-map`, contract version 4
- Input: `spike.md`
  (`sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`)
- Result: succeeded
- Output: `design-map.md`
  (`sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`)
- Decisions: prior host-mediated-mutation decisions carried forward; added SC6
  separating authoritative trusted-N evidence from bounded candidate-subject
  evidence (subject cannot emit the authoritative result; smallest fixture runs
  the unchanged 014e blob).
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare (recovery revision) — execution 4979763a-cc58-48c3-907e-9be28bf8502d

- Skill: `evaluator`, contract version 14, mode `prepare`; evaluator revision
  `002` (revision `001` preserved)
- Inputs: brief
  `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`,
  Design Map
  `sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`
- Outputs: `eval-requirements.md`
  (`sha256:8ede56f90b8d37cfbdf6840c650e56587fbe2d33005149378bc8b8730cf94551`),
  `coverage-map.json`
- Evaluator revision identity:
  `sha256:6091eac3062c17711a9828fe813a71389ca83a9f5c30c99bfe92a42f659b0f82`
- Result: succeeded; pre-freeze integrity validation PASS (8 criteria, 9
  procedures)
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 004 — execution 370e66df-cdb6-4104-827f-308f70b9404b

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision
  `002`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Output: `verification-result.json`
- Result: succeeded; BLOCKED / INFRASTRUCTURE_FAILURE (trusted-N cases and
  regression passed; candidate-subject evidence could not be produced or
  admitted)
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 005 — execution f7a04d8e-1c78-4a16-857b-83f99a43eeb0

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision
  `002`
- Candidate: `651352329cca473fb920139e1496f9f508eeabbb`
- Output: `verification-result.json`
- Result: succeeded; BLOCKED / INFRASTRUCTURE_FAILURE (no executable case could
  be run in this sandbox; subject evidence lacks raw outputs)
- Measurements: wall-clock time and token usage unavailable.

## Implementation correction — execution 9663c881-367e-40c7-bcfb-5d6c37264d7b

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; Role
  Grant
  `sha256:91bc160137ff09313b38875e756f2393f5e2fd41f43e8a7cde8580cfb2148137`
- Inputs: brief
  `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759`,
  Design Map
  `sha256:2ef8d4ca3494945f1ad3f4abfaff18a398178fd9bae6e0fb2470997ec7aa7cd3`,
  requirements
  `sha256:8ede56f90b8d37cfbdf6840c650e56587fbe2d33005149378bc8b8730cf94551`;
  sanitized implementation feedback bound by the Role Grant: protected
  unattended Claude's explicit `dontAsk` allowlist did not consistently admit
  every enabled provider tool family
- Result: succeeded (new candidate committed locally after this entry;
  independent verification not yet run)
- Output: candidate patch (source and visible test paths, excluding this entry)
  `sha256:b3a6f72a324bd5098f0bb1331491146db9c8e3715f1262d9862d042928e2ec49`
- Change: protected unattended Claude launches now derive their explicit
  allowlist from every provider tool family selected by the reviewed Harness
  capability mapping; narrower read-only workspace and git-push denials still
  override broad family grants; ordinary unprotected Claude launches are
  unchanged
- Visible checks:
  `node --test --test-reporter=spec test/governed-executors.test.ts` (31 pass, 0
  fail, 0 skipped); `npm run typecheck`; `npm run lint`;
  `npx prettier --check src test methodologies tools`; `npm test` (240 pass, 0
  fail, 0 skipped); `git diff --check`
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify attempt 008 — execution 4430e87a-041b-4a00-966f-d124d159a718

- Skill: `evaluator`, contract version 14, mode `verify`; evaluator revision
  `002`
- Candidate: `e8428205a58a1c12d6f17d9a80a160b78c754cb9`
- Output: `verification-result.json`, `verification-feedback.md`
- Result: succeeded; FAIL / IMPLEMENTATION_FAILURE (frozen 014e block altered;
  subject run 16 of 17; evaluator lineage sub-check defect noted for repair)
- Measurements: wall-clock time and token usage unavailable.

## Human specification decision — 2026-10-04

- Authority: explicit human decision recorded in
  `specification-revision-authority.md`
  (`sha256:e5ac26e3619768732e7ca6632eb9ec4d94b4c111fe4fb0309e917944f6c235c7`)
- Decision: frozen 014g SC1/AC03 is partially superseded only where its original
  014e D4 regression requires adapter/provider metadata to cause `planLaunch`
  refusal; accepted Spike 014h moved that mechanism into mandatory host-owned
  containment for every spawned registered-adapter launch
- Preserved invariant: containment remains mandatory; the decision authorizes a
  forward specification revision replacing only the obsolete mechanism-specific
  assertion with accepted 014h behavior and corresponding regressions
- Unchanged: every other frozen 014g requirement, artifact, candidate identity,
  evaluator revision, and historical attempt
- No role execution or frozen-artifact revision was performed by this record.

## Brief Readiness (forward specification recovery) — execution 96c595d3-9b04-4039-a74a-60c9eb8e19ca

- Skill: `brief-readiness`, contract version 5
- Input: brief
  `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`
- Result: succeeded, verdict READY (Ready to freeze)
- Outputs: `feedback.md`; no preliminary snapshot (passing verdict)
- Findings: 0 blockers, 0 material clarifications
- Checks: bound brief identity; public authority and accepted 014h/014i
  Outcomes; current containment, candidate-subject and evaluator-contract
  surfaces; referenced commits, ancestry and blob identities; exact 014e-to-014h
  test diff
- Limitations: product tests not run; evaluator-private material and workflow
  ledgers not inspected
- Measurements: wall-clock time and token usage unavailable.

## Design Map (forward specification recovery) — execution f98a8c70-52fc-4ce6-82d2-9b8607b600d9

- Skill: `design-map`, contract version 4
- Input: `spike.md`
  (`sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`)
- Result: succeeded
- Output: `design-map.md`
  (`sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`)
- Decisions: bounded host-mediated evidence mutation remains the selected shape;
  accepted 014h universal host containment supplies the launch boundary;
  accepted 014i candidate-subject execution supplies the non-authoritative N+1
  observation boundary; revised SC1 preserves every still-valid 014e test block,
  excludes only the named obsolete D4 block, and adds the exact accepted 014h
  replacements from blobs `74a51d545681532ac4c49ac9034712ee3217974d` and
  `b9c135790860a87e76afdfb458a7b0758d129704`.
- Checks: bound brief identity and committed ancestry; referenced 014e/014h
  commit and blob identities; public accepted 014h/014i Outcomes; current
  containment, governed-execution and candidate-subject surfaces;
  `git diff --check`; Prettier check of `design-map.md`.
- Limitations: product tests not run because this role changed only the shared
  design artifact and manifest; evaluator-private material and workflow ledgers
  not inspected.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Prepare (forward specification recovery) — execution 4bcef6cd-ac0e-4cc3-b89e-a34d61ad6cef

- Skill: `evaluator`, mode `prepare`, contract version 14
- Inputs: brief
  `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`;
  Design Map
  `sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`
- Result: succeeded; successor evaluator revision `003` frozen (prior revisions
  `001` and `002` and all attempts preserved unchanged)
- Outputs: `eval-requirements.md`
  (`sha256:91d25c8bc3594a51a0767a426cbac6744fc2d206d9c869b64a6e5a7fee64175b`);
  `coverage-map.json`; evaluator revision identity
  `sha256:a3e2c86bed00aa085b85eff106d581e26b0de107a6ed45c65025e221cb4c8920`;
  private inventory identity
  `sha256:c587da3ae882b36808dc7791ffacbfe54a84a17517eaf2a72f6aef798c677be3`
- Changes from revision `002`: executable regression composition follows revised
  SC1; boundary observation distinguishes host-created topology, subject-visible
  paths, subject-writable paths and host-side before/after evidence without
  loosening the containment oracle; lineage binds the current recovery brief and
  Design Map
- Checks: structural pre-freeze integrity validation PASS (8 criterion records);
  controlled positive and negative exercise of every evaluator oracle on
  synthetic and accepted-014h baseline conditions; public coverage map validated
  against the private bundle; candidate implementation not executed
- Limitations: manual procedures resolved from the frozen checklist; candidate
  evidence is produced only in an allocated verification
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify (attempt 009, evaluator revision 003) — execution 66fc32a1-b56b-44f8-a68c-2303f2763343

- Skill: `evaluator`, mode `verify`, contract version 14
- Candidate: `e8428205a58a1c12d6f17d9a80a160b78c754cb9`; evaluator revision
  `003`
- Result: BLOCKED, classification INFRASTRUCTURE_FAILURE
- Outputs: `verification-result.json`
- Summary: trusted-N revised frozen-regression, genericity and verifier-contract
  checks passed; typecheck, lint and format passed. The bounded
  candidate-subject observations (E2/E5) could not be launched by this session,
  so the criteria depending on them are not adjudicated.
- Measurements: wall-clock time and token usage unavailable.

## Evaluator Verify (attempt 010, evaluator revision 003) — execution 404e879e-46c6-479b-958f-53dfd4e196c3

- Skill: `evaluator`, mode `verify`, contract version 14
- Candidate: `e8428205a58a1c12d6f17d9a80a160b78c754cb9`; evaluator revision
  `003`
- Result: BLOCKED, classification INFRASTRUCTURE_FAILURE
- Outputs: `verification-result.json`
- Summary: trusted-N regression, genericity, verifier-contract and public
  regression checks passed. Subject evidence 08f6548c shows the revised
  selection passing but its boundary observation does not follow the frozen
  boundary/host-effects procedure, so it is not admitted; criteria depending on
  it are not adjudicated.
- Measurements: wall-clock time and token usage unavailable.

## Implementation (forward specification recovery) — execution 035cc497-fec8-4da5-8259-08a92b52947e

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; Role
  Grant
  `sha256:c99c81a0c8fd6ec4c4287229a11e0d3eb655eda3c261502d249c3cd98c1aee36`
- Inputs: brief
  `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`,
  Design Map
  `sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`,
  coverage
  `sha256:112be8e3c1fbc8be8d67de29321256d9b9da00c3c1768b290bf4c1dd7a027073`,
  requirements
  `sha256:91d25c8bc3594a51a0767a426cbac6744fc2d206d9c869b64a6e5a7fee64175b`; no
  implementation feedback bound
- Result: succeeded; no product change. The brief says to preserve C2 unless
  independent evaluation establishes a genuine defect, and none is established.
  Candidate `e8428205a58a1c12d6f17d9a80a160b78c754cb9` is an ancestor of `HEAD`,
  and no non-spike path differs between it and the pre-entry `HEAD`
  `84d26813d794f2fefa89df024b7bd1b10b52dcae`.
- Output: this entry only; the candidate content is unchanged.
- Visible checks: `npm test` gave 240 tests, 231 pass, 9 fail, 0 skipped. All 9
  failures are in workflow/authority tests that read other spikes'
  `workflow.jsonl` ledgers, which this sandbox denies (`EACCES`). They are
  environmental and not product defects. Typecheck, lint and format were not
  run, because the tool policy blocked the compound shell commands.
- Limitations: independent evaluation has not run; wall-clock time and token
  usage unavailable.

## Implementation (forward recovery checkpoint) — execution ad74544a-758c-4081-a28b-da818485e9db

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; Role
  Grant
  `sha256:5344f30109b8f1a99112352f878933092385994675911b3476b13288b6ab851e`
- Inputs: brief
  `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`,
  Design Map
  `sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`,
  coverage
  `sha256:112be8e3c1fbc8be8d67de29321256d9b9da00c3c1768b290bf4c1dd7a027073`,
  requirements
  `sha256:91d25c8bc3594a51a0767a426cbac6744fc2d206d9c869b64a6e5a7fee64175b`; no
  implementation feedback bound
- Result: succeeded; no product change. The frozen forward-recovery brief
  requires preserving C2 unless independent evaluation establishes a genuine
  implementation defect, and no such feedback is bound to this execution.
- Output: candidate identity remains
  `e8428205a58a1c12d6f17d9a80a160b78c754cb9`; it is an ancestor of the
  pre-entry `HEAD`, with no non-014g paths changed since that candidate.
- Visible checks: `npm run typecheck`, `npm run lint`, and
  `npm run format:check` passed. `npm test` could not complete: 6 test files
  passed and 13 failed because this worker sandbox denies nested `git` fixture
  creation (`spawnSync git EPERM`); direct execution of
  `test/evidence-action.test.ts` confirms the 9 affected 014g cases fail at
  that environmental setup boundary, while its 2 non-fixture cases pass.
- Limitations: independent evaluation has not run; `git diff --check` against
  the shared dirty worktree could not hash unrelated restricted workflow
  ledgers; wall-clock time and token usage unavailable.

## Implementation (forward recovery checkpoint) — execution fa84c54d-51ff-4c78-89c2-da3b38aa6819

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; Role
  Grant
  `sha256:a2b70f424003fdf6dbeadadd9d078e44980734c5839c44c087f67152e3223060`
- Inputs: brief
  `sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`,
  Design Map
  `sha256:32b38b26394b614dd9d293c056b67af75e9b89e0284c14eeba07c5d7e706813a`,
  coverage
  `sha256:112be8e3c1fbc8be8d67de29321256d9b9da00c3c1768b290bf4c1dd7a027073`,
  requirements
  `sha256:91d25c8bc3594a51a0767a426cbac6744fc2d206d9c869b64a6e5a7fee64175b`; no
  implementation feedback bound
- Result: succeeded; no product change. Candidate
  `e8428205a58a1c12d6f17d9a80a160b78c754cb9` remains an ancestor of the
  pre-entry checkpoint, with no non-014g path changed since that candidate.
- Output: this entry only; the candidate content remains unchanged.
- Visible checks: `npm run typecheck`, `npm run lint`, and
  `npm run format:check` passed. `test/candidate-subject.test.ts` passed.
  `npm test` could not complete: 6 test files passed and 13 failed because
  this worker sandbox denies nested Git fixture creation (`spawnSync git
  EPERM`); direct execution of `test/evidence-action.test.ts` confirms the 9
  affected 014g cases fail at that environmental setup boundary, while its 2
  non-fixture cases pass.
- Limitations: independent evaluation has not run; the shared dirty worktree
  contains unrelated restricted workflow ledgers, so full working-tree diff
  checks cannot run; wall-clock time and token usage unavailable.

## Implementation (C3 evidence-path correction) — execution c37534c7-4f1c-49a0-8f8f-238e61462b44

- Skill: `implementation`, contract version 5; branch `feat/spike-014`; attached
  inline Role Grant
  `sha256:efe93d516d130b958a9a6cd1adcde45b5b9991ff1abef4c430e1e9e532ed3a53`
- Authority: committed human decision
  `human-implementation-correction-authority.md` at `f2121a8`, identity
  `sha256:dfb9a685215588c149f5733f5dd46dee5f76d0a8be0e6f5505d5ad0cc6d79ed4`.
  The resolver cannot bind that decision as a Role Grant input; bounded root
  authority permitted this one allocation under the explicitly authorized
  process exception and supplied no substantive implementation authority.
- Result: succeeded; extended the existing 014i candidate-subject/host boundary
  with identity-only frozen-procedure resolution, host-owned topology and
  before/after observations, exact provenance binding, and fail-closed sealed
  evidence validation. No evaluator-private bytes were exposed to the worker or
  public caller, and no arbitrary path/content injection or second subject
  engine was added.
- Outputs: `src/candidate-subject.ts`, `src/kernel/host.ts`,
  `test/candidate-subject.test.ts`, `implementation-report.md`, and `WORKLOG.md`.
- Visible checks: `npm run check` passed typecheck, lint, formatting, and all 241
  tests; focused candidate-subject coverage passed 9/9, including the new C3
  frozen-procedure and fail-closed regression. Existing 014h containment and
  014i authority/containment regressions remained green.
- Limitations: independent trusted-N verification and candidate-bound revision
  `003` subject evidence are later workflow steps, not claims of this
  implementation execution. Wall-clock time and token usage unavailable.
