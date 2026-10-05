# Manifest — Spike 014j

Append-only execution history. This manifest records runs; it is not canonical freeze or workflow authority.

## 2026-10-05T00:04:50+02:00 — Brief Readiness

- Execution: `f063d629-bb60-4eae-a272-48aee1b603c2`
- Skill: `brief-readiness` contract version `5`, `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`
- Role contract: `sha256:2993d026faaab7b7b08bc0c3afe5faa1894524fedbe2f13f9fdbdb5baed98651`
- Role Grant: `sha256:544e8c51cc305c04d9675b956456a6e623cdce34622106eac68858571eacbcff`
- Input: `spike.md`, `sha256:dbd2b3bb22afeb6201e02d9b1c27eaef78987e7a3e0be5df94c0ad0013c0bf3e`
- Result: `NOT_READY` — **Not ready to freeze**
- Findings: 2 blockers
- Outputs:
  - `feedback.md`, `sha256:8c54232c839f2cf86307c062c82ff31c88cfd4451d99df3b239f18f631a4b72d`
  - `preliminary/001/spike.md`, `sha256:dbd2b3bb22afeb6201e02d9b1c27eaef78987e7a3e0be5df94c0ad0013c0bf3e`
  - `preliminary/001/feedback.md`, `sha256:8c54232c839f2cf86307c062c82ff31c88cfd4451d99df3b239f18f631a4b72d`
- Checks: bound input identity verified; complete 527-line brief read; referenced predecessor and successor Git objects resolved; relevant public contracts, implementation, visible tests, accepted Outcomes, and As-Built evidence inspected; preliminary copies verified byte-identical. Staged `git diff --check` reports only the four Markdown hard-break trailing-space lines inherited from the exact reviewed draft and necessarily preserved in its immutable preliminary snapshot.
- Limitations: evaluator-private material and workflow ledgers were not inspected; product tests were not run because this review changed no product code and blocked on unresolved contract decisions.

## 2026-10-05T00:15:09+02:00 — Brief Readiness

- Execution: `fd065d76-432f-443b-b5ea-8ec081ed3b9a`
- Skill: `brief-readiness` contract version `5`, `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`
- Role contract: `sha256:2993d026faaab7b7b08bc0c3afe5faa1894524fedbe2f13f9fdbdb5baed98651`
- Role Grant: `sha256:bf8ea4bbcb731abcc8c8032c0d38bd2bb29bdf68d070ee8d7536beda86832b3f`
- Input: `spike.md`, `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`
- Result: `READY` — **Ready to freeze**
- Findings: none
- Output: `feedback.md`, `sha256:9323b96f3faf04becee55b0b086f94aa9be03ff410c950dc4faecf938ba7649a`
- Checks: bound input identity verified; complete 570-line brief read; referenced predecessor, successor-authority, and trusted-methodology Git objects resolved; relevant public contracts, implementation, visible tests, accepted Outcomes, and As-Built evidence inspected; revised draft compared with the previously reviewed draft.
- Limitations: evaluator-private material and workflow ledgers were not inspected; product tests were not run because this review changed no product code.

## 2026-10-05T00:18:52+02:00 — Brief Readiness

- Execution: `290a9cc3-d7b0-48c8-b067-cec85a42594c`
- Skill: `brief-readiness` contract version `5`, `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`
- Role contract: `sha256:2993d026faaab7b7b08bc0c3afe5faa1894524fedbe2f13f9fdbdb5baed98651`
- Role Grant: `sha256:9665dcf261790694226617e0b76ad16f15c0c7ac7e318fb3e83f847f7f14baa9`
- Input: `spike.md`, `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`
- Result: `READY` — **Ready to freeze**
- Findings: none
- Output: `feedback.md`, `sha256:3728747504aa52a95f20cee3098cd6e87c025f2ed7b5c804c74d8b8d9094abf0`
- Checks: bound input identity verified; complete 570-line brief read; referenced predecessor, successor-authority, and trusted-methodology Git objects resolved; relevant public contracts, implementation, visible tests, accepted Outcomes, and As-Built evidence inspected; revised draft and prior readiness evidence cross-checked.
- Limitations: evaluator-private material and workflow ledgers were not inspected; product tests were not run because this review changed no product code.

## 2026-10-05T11:52:10+02:00 — Design Map

- Execution: `f8c21182-49a5-4e3c-a461-432607b271d3`
- Skill: `design-map` contract version `4`, `sha256:238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136`
- Role contract: `sha256:d81228bf85698e12d6409e6ccf51b48ca94102eebe0be76bd162fadac557b60b`
- Role Grant: `sha256:b55d6927ef1ffaae6e7ab4da32b5cf2c85bf59b583b8a9d330eb7bb5cc74f010`
- Input: `spike.md`, `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`, committed at `96c218f`
- Result: succeeded
- Output: `design-map.md`, `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`
- Shared contract: one root-authorized prepared-observation operation with evaluator-private sealed evidence and a public-safe canonical record; distinct executor profile, launch-selector, exact-model and provider-attestation semantics
- Checks: bound brief identity and committed bytes matched; complete brief, relevant public contracts, accepted 014h/014i As-Built and Outcome records, implementation surfaces and visible tests inspected; Design Map passed Prettier and `git diff --check`
- Limitations: evaluator-private material and workflow ledgers were not inspected; product tests were not run because this change establishes a Markdown design contract and changes no product code
- Measurements: 46 Design Map lines; provider calls 0; runtime token and wall-clock measurements unavailable

## 2026-10-05 — Evaluator Prepare

- Execution: `809faadb-3981-4675-a993-ba9cd3d3bd92`
- Skill: `evaluator` contract version `14`, `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`; mode `prepare`
- Role contract: `sha256:a65ddd80eea69fae4e43b50f44864d21ad7c16c364a00244052fa29a39173e50`
- Role Grant: `sha256:09e141eac8d3a382bbdcccfec6c61fbc730bb5160eb706845d5b3c53ade861ce`
- Inputs: brief `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`; Design Map `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`
- Result: succeeded — evaluator revision `001` frozen
- Evaluator revision identity: `sha256:0fc74dfc962243b48b5e048960857bb22299d9fa37d8ca74c91ed7737042d16e`
- Output: `eval-requirements.md` `sha256:64f5c7f773c19d8fbd4e6dc842ef49a3d1ceab30b251eb250c6d3a46a574c658`; `coverage-map.json` `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`
- Checks: pre-freeze structural integrity validation PASS (13 criterion records); public coverage map passes the repository prepared-coverage validator; evaluator self-checks passed against synthetic repositories only; no candidate executed
- Limitations: workflow ledgers were not inspected; behavioral coverage relies on implementer-owned tests and review because the Design Map leaves those seams as implementation freedom
- Measurements: provider calls 0; runtime token and wall-clock measurements unavailable

## 2026-10-05T12:27:02+02:00 — Implementation attempt 1

- Execution: `c79cb71b-a1d9-438c-ad55-3d34df7adaf5`
- Skill: `implementation` contract version `5`, `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Role contract: `sha256:2bef8564c17485cd478ca8e72b0d45406d4e90684a82b5a8faace8e9523b0305`
- Role Grant: `sha256:8dd92212240d80c0336834e8fb6dd6662c3714a1a3b84e531bea2273b3d776f7`
- Inputs: frozen brief `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`; frozen Design Map `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`; prepared coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`; public evaluation requirements `sha256:64f5c7f773c19d8fbd4e6dc842ef49a3d1ceab30b251eb250c6d3a46a574c658`. All bound bytes matched; no retry feedback was bound.
- Result: succeeded — candidate ready for independent verification; no claim of evaluator PASS.
- Outputs: one root-authenticated `prepareCandidateObservation` operation; evaluator-private sealed prepared bundles and public-safe `kernel.prepared-observation` lifecycle records; trusted-N resolution with independent identity validation; generic launch-selector, `exactModel`, provider-attestation and executor-profile provenance separation.
- Output content identity before this manifest entry: `sha256:874f5d01e6b667d731b4bdb9d5238aa2e90449e84b8f4d6c65fbf7f79ea9b359` over the staged `git diff --cached --binary` against Design Map baseline `32bdc94b65c08e3677f32c5baee8d277f2fc2830`. This excludes this manifest update.
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, scoped `git diff --check`, the complete candidate-subject test file, and two implementation-independent executor-selection/model-planning tests passed. Stable public names are present under `src/` and absent from the worker protocol/tool surface. Baseline diff review found no non-ledger change to `spikes/014g-verifier-containment-composition/`, `skills/`, or `methodologies/`.
- Limitations: the broader `npm test` run was attempted but the managed environment denied test-created Git subprocesses and loopback listeners with `EPERM`, denied unrelated workflow-ledger reads with `EACCES`, and left one integration test process without progress until interrupted. The same run's environment-independent tests and all focused 014j tests passed. No live provider or credentials were used.
- Restricted evaluator material inspected: none. Workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-05 — Evaluator Verify attempt 002

- Execution: `b8742fa5-ce30-4ad6-a59e-6e4953bdde97`
- Skill: `evaluator` contract version `14`, `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`; mode `verify`
- Role Grant: `sha256:4ab6c048561141357c42daafd3ff4e886f9c2fa51b9614a404fb55eed21118a9`
- Inputs: candidate `b1e505d48c6dfe7f40f3525093b65cdf9fa2a8ee`; evaluator revision `001`; coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`
- Result: FAIL — IMPLEMENTATION_FAILURE (see `verification-result.json`, `feedback.md`)
- Checks: frozen identities matched; static executable cases passed; typecheck, lint, format passed; full suite failures were environmental and reproduce at baseline; required test coverage of the host operation is missing
- Measurements: provider calls 0; runtime token and wall-clock measurements unavailable

## 2026-10-05T14:25:43+02:00 — Implementation attempt 2

- Execution: `bbce620a-c3af-40b6-86c8-757cda55c395`
- Skill: `implementation` contract version `5`, `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Role contract: `sha256:2bef8564c17485cd478ca8e72b0d45406d4e90684a82b5a8faace8e9523b0305`
- Role Grant: `sha256:eb931703bf8a6e5a177b020446054911852c6e9d3605ca65ffb343c2dce7c8bd`
- Inputs: frozen brief `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`; frozen Design Map `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`; prepared coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`; public evaluation requirements `sha256:64f5c7f773c19d8fbd4e6dc842ef49a3d1ceab30b251eb250c6d3a46a574c658`; committed implementation-failure feedback `sha256:2c8475d5c60402e6d58e1bd8f004f9db9c101f82450abc921b04ae414fdfa698`. All bound bytes and committed provenance matched.
- Result: succeeded — corrected candidate ready for independent verification; no claim of evaluator PASS.
- Outputs: deterministic host-operation coverage for root-only authorization, closed identity-bound requests, private material isolation, read-only host inputs, sealed resolution and absence of workflow-finalization or promotion effects; injectable exact runtime identity for deterministic host tests; successful nested Git results remain usable when the managed sandbox reports `EPERM` with exit status 0.
- Output content identity before this manifest entry: `sha256:58e2cd2dfc602112aff2a98d3889bbb9c84f51dd1d17c6fc238fac4a138ba9f1` over the staged `git diff --cached --binary` against Design Map baseline `32bdc94b65c08e3677f32c5baee8d277f2fc2830`, limited to candidate source and tests. This excludes this manifest update.
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check` and scoped staged `git diff --check` passed. The complete candidate-subject test file passed 10 tests and reached the new real host-operation path; its new test was then refused only because this managed sandbox denies unprivileged namespaces. The broader `npm test` run was attempted and interrupted after approximately 90 seconds without further progress; reported failures were the known managed-environment `EPERM`, containment and loopback/permission failures also documented at the baseline. The external-project file separately reported 4 passes and 13 environment-dependent failures.
- Limitations: the prepared-observation success path requires working unprivileged namespaces and therefore could not complete in this managed sandbox. No live provider or credentials were used.
- Restricted evaluator material inspected: none. Workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-05 — Evaluator Verify attempt 004

- Execution: `284b9c6e-0613-4ac5-84ae-f591ddce239f`
- Skill: `evaluator` contract version `14`, `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`; mode `verify`
- Role Grant: `sha256:995a4594a2a7f12e29720d3cc7738f5f5ce142f953e88ab12063c9704614713c`
- Inputs: candidate `09da7b866dbd1a0a8c68f44efb42985feb897c49`; evaluator revision `001`; coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`
- Result: FAIL — IMPLEMENTATION_FAILURE (see `verification-result.json`, `feedback.md`)
- Checks: frozen identities matched; static executable cases passed; typecheck, lint, format passed; `npm test` 243/245 in a clean candidate checkout, one failure being a deterministic candidate host-operation test failure
- Measurements: provider calls 0; runtime token and wall-clock measurements unavailable

## 2026-10-05T14:39:32+02:00 — Implementation attempt 3

- Execution: `a08de64d-e235-44cc-9800-530745eb02b2`
- Skill: `implementation` contract version `5`, `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`
- Role contract: `sha256:2bef8564c17485cd478ca8e72b0d45406d4e90684a82b5a8faace8e9523b0305`
- Role Grant: `sha256:055e97ac1484eba91ec76c84a198d0adcc5b2c86651f38210e87488c38e2f8be`
- Inputs: frozen brief `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`; frozen Design Map `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`; prepared coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`; public evaluation requirements `sha256:64f5c7f773c19d8fbd4e6dc842ef49a3d1ceab30b251eb250c6d3a46a574c658`; committed implementation-failure feedback `sha256:63830c515225b1b94db71e98d3ed589114add3d8fd7144c0ed82790cde877727`. All bound bytes and committed provenance matched.
- Result: succeeded — corrected candidate ready for independent verification; no claim of evaluator PASS.
- Output: removed the unintended direct preparation from the root-boundary regression so its successful path performs exactly one authenticated preparation and expects exactly one `kernel.prepared-observation` record.
- Output content identity before this manifest entry: `sha256:f3ecd704573044ef4e26d059bfcb4f7a89768a10777d5249a41b27c01bc50e91` over the staged `git diff --cached --binary` from prior candidate `42008aabc2b242a779b1625addcffeaba7e6d5b3` limited to candidate tests. This excludes this manifest update.
- Checks: `npm run typecheck`, `npm run lint`, `npm run format:check`, scoped `git diff --check` and staged `git diff --cached --check` passed. Running `node test/candidate-subject.test.ts` passed all 10 tests not requiring the prepared-observation containment success path; the corrected test reached that path and was refused only because this managed environment denies unprivileged namespaces. The broader suite was attempted but interrupted after its known managed-environment permission and containment failures made no further progress.
- Limitations: the corrected success path requires working unprivileged namespaces and could not complete in this managed sandbox. No live provider or credentials were used.
- Restricted evaluator material inspected: none. Workflow ledgers were not inspected.
- Measurement cutoff: immediately before this manifest update.

## 2026-10-05 — Evaluator Verify attempt 005

- Execution: `3a077861-616c-44eb-a2c2-bb85b1d89ccd`
- Skill: `evaluator` contract version `14`, `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`; mode `verify`
- Role Grant: `sha256:00a3d2277a9c75f8c88c63489f97bc8e29781506337de0c8daa20c4f41c13ca7`
- Inputs: candidate `93ade31b1dcb6487798b27e812dc443fce30af43`; evaluator revision `001`; coverage `sha256:52e39e2a374fa9e3002b379bb5535b9830b8fcd66fa9338f066e425451c622ea`
- Result: PASS (see `verification-result.json`); promotion plan INELIGIBLE (incomplete prior attempt history), no archival requested
- Checks: frozen identities matched; static executable cases passed; typecheck, lint, format passed; `npm test` 244/245 in a clean candidate checkout, the one failure also occurring at the pre-implementation baseline (environmental)
- Measurements: provider calls 0; runtime token and wall-clock measurements unavailable

## 2026-10-05T15:18:10+02:00 — As-Built

- Execution: `d51234aa-8376-4e4c-83fc-27d8193712fb`
- Skill: `as-built` contract version `4`, `sha256:dc3c422691fb36a292b49db411ff9aefd5199f8602b73ef87428fd0a09ea534b`
- Role contract: `sha256:68fe500c291ea8c3a2419c9176d87152e4fc774d2396ba1873b6e299fb2ac926`
- Role Grant: `sha256:c867fcd3e9b42cc47137a3d3ff6ac8c76292837e57bd5ce27a1300173ff6c13b`
- Inputs: candidate `93ade31b1dcb6487798b27e812dc443fce30af43`; frozen brief `sha256:6b616066fa2a616e9c649fad3d96bcd0a684a5d674cb430ebb7f74c1a55f994d`; Design Map `sha256:79c77b7924414cd2290068b9376c2ae423be8546a4f448e348e9756fe87ae910`; final verification `sha256:c1517668c877eb920e4cc8ef2b2cf0343342642542a1af55fd0abf4b46c7a668`; promotion `sha256:b929bd89f8b46ad6f068d02dae59279e8847c1bbc2696eccff0c17ee4651ddc7`
- Promotion checkpoint: `69cd431dfcab48b48d576ee93acef3384db000cf`
- Result: succeeded — no Missing, Contradictory, or Extra discrepancies
- Output: `as-built.md`, `sha256:3cbd46d2d64756a3b3954ce353475bdc3feed9c7065c389d32e9b9b823290dac`
- Checks: all bound input identities matched; promotion record identity matched and was committed separately; exact candidate diff, relevant source and visible tests, accepted verification result, and promoted target-spike evidence inspected; artifact passed `git diff --check`; evaluation was not rerun
- Measurements: candidate delta from Design Map baseline `32bdc94b65c08e3677f32c5baee8d277f2fc2830` comprised 16 files, 1,412 insertions and 117 deletions; As-Built artifact 23 lines; provider calls 0
- Measurement cutoff: immediately before this manifest update
