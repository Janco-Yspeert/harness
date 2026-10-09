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
