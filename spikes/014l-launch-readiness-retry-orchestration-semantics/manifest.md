# Spike 014l Manifest

## 2026-10-09 — Brief Readiness

- Execution: `800f6535-65ce-47bb-879c-87731b16f6db`.
- Skill: `brief-readiness`, contract version 5
  (`sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`).
- Role Grant: `sha256:62b5704c68c9409ded2764ee5ab2e88113343d950255236aad0226beb453f6ca`.
- Input: `spike.md`
  `sha256:fc2c399f32cb6d0e27d2e820a76a28205521be4ecaf878cef91fbdb00f0b4183`
  (verified against the host-bound identity).
- Result: succeeded, verdict `NOT_READY` (**Not ready to freeze**).
- Outputs: `feedback.md`
  `sha256:fb64cbbc4a024b190430fac8fe3583485a609844d2a12275bdc63af0b7b28a31`;
  `preliminary/001/spike.md`
  `sha256:fc2c399f32cb6d0e27d2e820a76a28205521be4ecaf878cef91fbdb00f0b4183`;
  `preliminary/001/feedback.md`
  `sha256:fb64cbbc4a024b190430fac8fe3583485a609844d2a12275bdc63af0b7b28a31`;
  `manifest.md`.
- Checks: bound input identity verified; preliminary snapshot compared byte-for-byte
  with the reviewed draft and matching feedback; scoped `git diff --check` passed;
  static inspection covered relevant public source, policy, visible tests, goals,
  and selected public Outcomes. No product tests were run because this review made
  documentation/evidence changes only.
- Limitations: no live provider was exercised; evaluator-private material and
  workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-09 — Brief Readiness (revised draft)

- Execution: `8205afb6-f3d5-4515-8aad-a7c034b405fd`.
- Skill: `brief-readiness`, contract version 5
  (`sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`).
- Role Grant: `sha256:4426458775ddc2833f403fb484bc9335edcad3c321a1229f803784dd1388dc4d`.
- Input: `spike.md`
  `sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`
  (verified against the host-bound identity).
- Result: succeeded, verdict `READY` (**Ready to freeze**).
- Output: `feedback.md`
  `sha256:920f4c7b66711aacbed833c0137a85b47e1fee8df6beff300bff300ae63260bd`;
  `manifest.md`. No preliminary snapshot was created for this passing review.
- Checks: bound input identity verified; revised draft compared with the
  preserved preliminary draft and findings; scoped `git diff --check` passed;
  static inspection covered relevant public source, policy, visible tests,
  goals, and selected public Outcomes. No product tests were run because this
  review made documentation/evidence changes only.
- Limitations: no live provider was exercised; evaluator-private material and
  workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-09 — Design Map

- Execution: `8c47727a-84ae-45fc-ad31-5105b96e1735`.
- Skill: `design-map`, contract version 4
  (`sha256:238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136`).
- Role Grant: `sha256:05fffb0586ec80d2d394214f8fd662e20bb36ddf03c4cf991f2cc76ce9829c64`.
- Input: `spike.md`
  `sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`
  (verified against the host-bound identity and committed bytes at `a9c69e27`).
- Result: succeeded.
- Output: `design-map.md`
  `sha256:11fddfcd3eef9294a6d899e21b403cf65537f4623c5a8be71fb89a7a4ffac00d`;
  `manifest.md`.
- Checks: frozen brief identity and committed provenance verified; scoped
  `git diff --check` passed for the Design Map; static inspection covered the
  relevant public host, kernel, resolver, model, provider-adapter, governed-run,
  worker-protocol, visible-test, goals, and prior public Design Map contracts.
  No product tests were run because this role changed documentation/evidence
  only.
- Limitations: no live provider was exercised; evaluator-private material and
  workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-09 — Evaluator Prepare

- Execution: `50dccdf2-4832-4906-b621-dee1f96f789a`.
- Skill: `evaluator`, mode `prepare`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Role Grant: `sha256:f9076194e71ff9246c7fc0155efa6c5d1b0bc2e5834f722936673b0ac46fae03`.
- Inputs: `spike.md`
  `sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`;
  `design-map.md`
  `sha256:11fddfcd3eef9294a6d899e21b403cf65537f4623c5a8be71fb89a7a4ffac00d`.
- Result: succeeded; evaluator revision `001`
  (`sha256:6293e45e5cb22a6449fec4315cc5440cc031e98e0ca3b93983798c8236f543cc`).
- Outputs: `eval-requirements.md`
  `sha256:3359c649327fffbbc735a862c56a599db22276e9f8827b1c3c5f25f64144cbdb`;
  `coverage-map.json` (25 criterion records); `manifest.md`.
- Checks: bound input identities verified; pre-freeze structural integrity
  validation passed with negative controls. The candidate implementation was
  neither run nor inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-09 — Implementation attempt 1

- Execution: `f78a05b5-b93c-4f41-b495-69c7ce603bce`.
- Skill: `implementation`, contract version 5
  (`sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`).
- Role Grant: `sha256:dc2013e585da34f9c0b02b9ac614406e516f07d5cd2f22a6de06aebd2c580409`.
- Inputs: `spike.md`
  `sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`;
  `design-map.md`
  `sha256:11fddfcd3eef9294a6d899e21b403cf65537f4623c5a8be71fb89a7a4ffac00d`;
  `coverage-map.json`
  `sha256:4ba8570cd18ef090cee84087ca1f2e1cc951c797bc51a0f17c87fd82ac937cec`;
  `eval-requirements.md`
  `sha256:3359c649327fffbbc735a862c56a599db22276e9f8827b1c3c5f25f64144cbdb`.
  Each identity matched its host binding and committed provenance before the
  implementation changed files. No retry-feedback input was bound.
- Result: succeeded. The host now derives canonical spawned and attached
  shapes, records pre-semantic operational attempts, runs a separate
  material-free readiness process or attached compatibility check, commits
  semantic work only at `kernel.allocation`, keeps exposure after allocation
  and before delivery, enforces independent operational and semantic retry
  authority, detects repeated semantic no-progress, and projects canonical
  orchestration status through the existing root-only `resolve` response.
- Output content identity before this manifest entry:
  `sha256:8bf898c4bd62d5c821e819e9253e90c82b447e02e1019c3ab9d07c0a5a2d222a`
  over `git diff --cached --binary` against evaluator-prepared baseline
  `03330f5a942c3d9bec30c8467dd159f8213664d6`, limited to 10 candidate source
  and test paths. This excludes this manifest update.
- Visible verification: all 33 frozen deterministic 014l cases passed
  (`node test/orchestration.test.ts`; 33 passed, 0 failed); `npm run typecheck`,
  `npm run lint`, `npm run format:check`, and scoped `git diff --check` passed.
  A broad `npm test` was attempted: the 014l suite and several pure suites
  passed, while this execution sandbox rejected loopback listeners and child
  processes with `EPERM`; after the remaining integration workers made no
  further progress, the run was terminated. No assertion failure from that
  run was treated as product evidence.
- Candidate size before this entry: 10 paths, 2,121 insertions and 109
  deletions.
- Limitations: no live provider was exercised; production readiness uses a
  one-shot provider invocation, while deterministic tests inject its public
  material-free boundary. Evaluator-private material and workflow ledgers were
  not inspected. Unrelated worktree/runtime residue was preserved and excluded
  from the candidate.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-19 — Implementation attempt 2 (pre-semantic correction)

- Skill: implementation, contract version 6.
- Inputs: brief `sha256:de56e997…e803`, design `sha256:11fddfcd…c00d`,
  coverage `sha256:4ba8570c…7cec`, requirements `sha256:3359c649…cbdb`, and
  pre-semantic correction authorization `sha256:7e2f767b…f2e2` (candidate
  `11334109`). Its preserved input lineage matches the other grant inputs and
  it carries a non-empty reason and three defects.
- Result: succeeded. Defects 1 and 2 (readiness tool absent from the Claude
  allowlist; permission denial normalized to authentication-failure) were
  already corrected on this branch by `0383e0c8`. Defect 3 is fixed here:
  Claude readiness no longer passes on provider init/connection alone;
  `runProviderReadiness` now requires a positive `tool-confirmed` readiness
  event. `runProviderReadiness` is exported for testing.
- Output content identity before this entry:
  `sha256:71c3c650b9031c8da214a9eb7036e52862bf2144ec5116c77ae5f29457eff5d6`
  over `git diff --binary` of `src/kernel/host.ts` and
  `test/readiness-evidence.test.ts` (2 paths), excluding this manifest.
- Visible verification: new `test/readiness-evidence.test.ts` 3 passed, 0
  failed (connection-only fails, confirmed call passes, denial is a
  pre-allocation-readiness-failure); `node test/orchestration.test.ts`,
  typecheck and `format:check` passed. `test/governed-executors.test.ts` shows
  4 failing cases (014h AC11, 014j AC10/AC11, AC04/AC13, AC14), apparently
  environment-related; not fixed here.
- Limitations: no live provider exercised; workflow ledgers and
  evaluator-private material not inspected; unrelated worktree residue
  preserved and excluded.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-19 — Evaluator Verify (attempt 4)

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Execution: `31a2873f-3bd5-4f71-ae9d-e74136351017`; candidate
  `212e12e4a99ead07329685ec5142347acf41f897`; evaluator revision `001`
  (`sha256:6293e45e5cb22a6449fec4315cc5440cc031e98e0ca3b93983798c8236f543cc`).
- Inputs: brief, design, requirements and coverage identities matched their
  frozen values; evaluator revision matched its freeze.
- Result: succeeded; verdict `FAIL`, classification `IMPLEMENTATION_FAILURE`.
  Typecheck, lint and format check passed; the full visible suite ran 331
  tests with 311 passing and 20 failing.
- Outputs: `verification-result.json`, `feedback.md`, `manifest.md`.
- Limitations: no live provider exercised; criteria other than AC24 and AC25
  were not individually adjudicated after the full-check gate failed.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-19 — Implementation attempt 3 (implementation-failure retry)

- Skill: implementation, contract version 6
  (`sha256:f41e0d0c335b8123a47590bf1cd9364c1473209064d74c542e16de25600c9e9e`).
- Execution: `00e8e26f-e8bb-4650-a710-f86864ca0129`.
- Inputs: brief `sha256:de56e997…e803`, design `sha256:11fddfcd…c00d`,
  coverage `sha256:4ba8570c…7cec`, requirements `sha256:3359c649…cbdb`, and
  IMPLEMENTATION_FAILURE feedback `sha256:383efc37…dde8` (attempt 4 of the
  evaluator, candidate `212e12e4`: AC24/AC25, 20 visible-suite failures).
- Result: succeeded. Deterministic host configuration refusals (no adapter,
  provider not installed, containment/provider-config invalid, adapter
  refusals) are still recorded as a failed launch attempt but now keep their
  specific category instead of looping to `operational-retry-exhaustion`.
  Existing spawned-role fixtures (`skill-fidelity`, `external-project`) inject
  the material-free readiness probe boundary. Tests updated for the additive
  `orchestration` resolve projection and for trusted history sequence 7.
- Output content identity before this entry:
  `sha256:0902265811d644ee9b6dc20d2f99f9622c8547747a5a1a652740c51421809c17`
  over `git diff --binary` of 4 paths (`src/kernel/host.ts` and three tests),
  excluding this manifest.
- Visible verification: typecheck, eslint, prettier pass. `npm test`: 331
  tests, 321 pass, 10 fail. The 10 remaining failures all read canonical
  `workflow.jsonl` ledgers that are unreadable in this execution environment
  (EACCES / character-device placeholders), unrelated to this change; the
  governed-executors, orchestration, readiness-evidence, skill-fidelity and
  external-project suites otherwise pass.
- Limitations: no live provider exercised; evaluator-private material and
  workflow ledgers not inspected; unrelated worktree residue preserved and
  excluded.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-19 — Evaluator Verify (attempt 5)

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Execution: `d44c7829-0fc1-4e51-a365-41253c09da64`; candidate
  `4f0560165a14c44f76c6fdd540f4bc456ef208ae`; evaluator revision `001`
  (`sha256:6293e45e5cb22a6449fec4315cc5440cc031e98e0ca3b93983798c8236f543cc`).
- Inputs: brief, design, requirements and coverage identities matched their
  frozen values; evaluator revision matched its freeze.
- Result: succeeded; verdict `PASS`. Typecheck, lint and format check passed;
  fresh-clone suite 331 tests, 330 passing; the one failure is an
  environment-sensitive containment test that also fails at the pre-014l
  baseline and passes in the project checkout. All 33 required tests present.
- Outputs: `verification-result.json`, `manifest.md`.
- Limitations: no live provider exercised; evidence rests on visible tests and
  diff reading per the frozen plan.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-24 — As-Built

- Skill: `as-built`, contract version 4
  (`sha256:dc3c422691fb36a292b49db411ff9aefd5199f8602b73ef87428fd0a09ea534b`).
- Execution: `74d3f8da-0fcc-4a27-b738-3a5e9161f51f`; inspected candidate
  `4f0560165a14c44f76c6fdd540f4bc456ef208ae`.
- Inputs: brief `sha256:de56e9970b339a55dc8d3024458769445e10474f73cdc1e1917afd6a2102e803`;
  design `sha256:11fddfcd3eef9294a6d899e21b403cf65537f4623c5a8be71fb89a7a4ffac00d`;
  verification `sha256:6e1606d7e3b4e360ab1d979154ab348cf96f9a871ef4b8267555c567e0234ca6`;
  promotion `sha256:8fc2898181b5c66b367a0652bbbcc948245eaa42c978ebe60aef3bd382c0f9f2`
  (validated against `evaluation/promotion.json` bytes and committed as a separate checkpoint).
- Result: succeeded. No Missing or Contradictory discrepancies; three Extra items recorded.
- Outputs: `as-built.md`, `manifest.md`.
- Statistics: candidate diff from design freeze 22 files, +4193/−181.
- Limitations: evaluation not rerun; code read selectively (orchestration module, host retry,
  allocation and status paths, adapters, methodology diff), not line-by-line.
- Measurement cutoff: immediately before this manifest update.
