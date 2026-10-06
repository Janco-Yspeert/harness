# Manifest - Spike 014k

## brief-readiness (contract version 5) - execution 59217559-7bf9-49d4-916b-ead1ebf1c96d

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c
- Result: READY (Ready after minor clarification; findings F1-F3 non-blocking material clarifications, F4 editorial)
- Outputs: `feedback.md`, `manifest.md`
- Checks: static review of `methodologies/harness/trusted.jsonl` and `src/methodology-evolution.ts`; no tests run

## design-map (contract version 4) - execution 8ad71641-d82e-40ab-9212-6c5dd88013fc

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c (identity and committed provenance at `894c71a` verified)
- Result: succeeded
- Output: `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `manifest.md`
- Checks: static review of brief, feedback, `src/methodology-evolution.ts` promotion boundary and 014j Design Map; no tests run
- Measurements: Design Map 8 shared contracts; provider calls and runtime metrics unavailable

## evaluator-prepare (evaluator contract version 14) - execution b2a3946f-e819-4cba-804a-5da603b96a37

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; evaluator revision 001 frozen, identity sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2
- Outputs: `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a; `coverage-map.json`; `manifest.md`
- Checks: pre-freeze integrity validation PASS (15 criterion records); controls on synthetic repositories and the pre-implementation baseline only; no candidate executed
- Measurements: 15 criteria, 9 procedures; provider calls 0

## implementation (contract version 5) - execution 507252f4-73cc-4092-8efd-1c3e0d655f63

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a; coverage sha256:508a418efd3e759c2138e71966841b1e7d4b175c8d6413c6a2aeb996ccd71118; base commit 9611a3b2bea67b768f20b380031950ef133618e9; no implementation feedback (first attempt)
- Result: succeeded (candidate checkpoint; independent evaluation not yet run)
- Outputs (content identities): `src/observation-declaration.ts` sha256:639cc61afa358d1408e2cf0b7756046e9002432877624e6fa13cc3201bf8d031; `src/evaluation-closeout.ts` sha256:14dbb165acf071b560dcd4800bce8b1e7c72e5f51f95fa16de8bd38ac090ba47; `src/methodology-evolution.ts` sha256:b86270cd792340656310a33a97d184cb9f1f78096cd04cde0a302f2b3792ba35; `skills/evaluator/SKILL.md` sha256:55f1b55f2839a44f0b334a3ce262f18bc31f57bc5e95b8bf81bece1a87451d99; `test/successor-closeout.test.ts` sha256:4719f720bddd78ee0c4e51e6e94a9950518fac2a48af04be14fb1f136f3336e8; also edited `test/methodology-evolution.test.ts`, `test/skill-fidelity.test.ts`; `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint .` PASS; `prettier --check` on src/test/skills PASS; `test/successor-closeout.test.ts` 11/11 PASS; `test/methodology-evolution.test.ts` 9/9 PASS; `test/skill-fidelity.test.ts` 13/13 PASS
- Measurements: 11 new tests; pre-change full suite baseline 9 failing of 245 (environmental, listed at suite run); provider calls 0

## evaluator-verify (evaluator contract version 14) - execution cee0da0c-b5ed-41fb-9542-e5c13717b859

- Inputs: candidate `75e350ac8e875965565a5fd8fabbc3789cad82ac`; evaluator revision 001 (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2); `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; attempt 001 FAIL, classification IMPLEMENTATION_FAILURE (AC06, AC10 unsatisfied; other criteria satisfied)
- Outputs: `verification-result.json`; `feedback.md`; `manifest.md`
- Checks: frozen identities matched; executable procedures 3/3 PASS; typecheck, lint, format PASS; full suite 255/256, the one failure reproduces at baseline; reviews M1-M5 done
- Measurements: provider calls 0

## implementation retry 002 (contract version 5) - execution 039cf097-1164-45a9-b64b-09029a4ed7a8

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a; coverage sha256:508a418efd3e759c2138e71966841b1e7d4b175c8d6413c6a2aeb996ccd71118; implementation feedback (verification attempt 001, IMPLEMENTATION_FAILURE) sha256:4609e2436023d4a6e869e1442c5bf0b3a9faf84a05395d8f133d5baeb91e59c3; base commit 1a63eb596f615e30f8105526cfbe1ff89c264d84
- Result: succeeded (candidate checkpoint; independent evaluation not yet run). Addresses AC06/AC10: the host now derives and performs the post-PASS archive; the evaluator authors no ELIGIBLE/INELIGIBLE plan
- Outputs (content identities): `src/evaluation-closeout.ts` (adds `deriveHostArchive`) sha256:c02d95f76a34fd00be02ec7134d6eb1e983ec71b89d24e2f5da2ccea20ee0578; `skills/evaluator/SKILL.md` sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b; `methodologies/harness/contracts/evaluator-verify.json` (`promotion.plan` replaced by `promotion.derive: host-archive`) sha256:5c64c273b9e0ad83ad8877098aa265dc29812725909aecd6f870133835b0aecc; `src/kernel/execution.ts` (promote derives artifacts via `deriveHostArchive`) sha256:f0555f8dbafa0753d521f09dab8c52ec1d3e4d6b6f6ccf7af092c5d16742830e; `test/skill-fidelity.test.ts` sha256:b15bea81aa6a81e2b3071f0ad245cca5fcaebc5fcbd3f57c16020b2f4ff3e9ce; also edited `src/kernel/{model,methodology,resolver,host}.ts`, `src/executors/protocol.ts` (promotion artifacts optional), `tools/fixtures/fake-provider.ts`, `test/successor-closeout.test.ts` (+1 test); `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint .` PASS; `prettier --check` on src/test/skills/tools PASS; `test/skill-fidelity.test.ts` 13/13, `test/successor-closeout.test.ts` and `test/methodology-evolution.test.ts` PASS; full suite 245 pass / 12 fail
- Measurements: the 12 full-suite failures are unrelated to promotion: two are EACCES reading spikes workflow ledgers in this sandbox, ten are pinned evaluator bootstrap provenance/authority checks; baseline for them was not re-measured at HEAD in this environment (the evaluator's attempt 001 recorded one baseline failure); provider calls 0

## evaluator-verify attempt 002 (evaluator contract version 14) - execution 5e2ca20a-6464-48f2-a29d-073b1d3d0e6c

- Inputs: candidate `4455fd884e4ae4396149a277b5e0a79a57506aff`; evaluator revision 001 (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2); `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; attempt 002 PASS (all 15 criteria satisfied); promotion plan ELIGIBLE (ledger and terminal results; evaluator revision bundle kept private)
- Outputs: `verification-result.json`; `manifest.md`
- Checks: frozen identities matched; executable procedures 3/3 PASS; typecheck, lint, format PASS; full suite 256/257, the one failure reproduces at baseline; reviews M1-M5 done
- Measurements: provider calls 0

## evaluator-repair (evaluator contract version 14) - execution 666ef22e-4211-4ecd-b902-7f5f20275b00

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a (unchanged); source evaluator revision 001 (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2); repair trigger sha256:e06c860947027f1ad71cdea7669ea3f61ebdbcde7caff82d10c65442636374b3
- Result: succeeded; evaluator revision 002 frozen, identity sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f; revision 001 preserved; attempt 002 PASS untouched
- Outputs: `coverage-map.json` (readiness for revision 002 and repair lineage); `manifest.md`
- Checks: full structural integrity validation PASS (15 criterion records); acceptance semantics preserved; affected criteria AC06-AC10; no new seam adopted
- Measurements: 15 criteria, 10 procedures; provider calls 0

## implementation retry 003 (contract version 5) - execution 5342c4fc-2d31-4cae-8796-d5563c70d8fa

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a; coverage (evaluator revision 002 repair) sha256:6c8ce5e578f172048f4d19bc925ccb8e79b51537bc69245b4b0db142432f4c93; no current implementation feedback (attempt 001 feedback already addressed; attempt 002 PASS under revision 001); base commit 8c73b6b622883257e0c7cb8472ebc63c75c35f43
- Result: succeeded (candidate checkpoint; independent evaluation not yet run). Addresses the revision-002 workflow-scoped private-root coverage (AC06-AC10, M6): host archive derivation now binds its source workspace through the Role Grant for the workflow, refusing a workspace outside the grant, with no parent-root or other-workflow fallback
- Outputs (content identities): `src/kernel/execution.ts` sha256:cd518b5a6033bbcb8d4781391aea84ddbd093e6b7646534fedc95bc2ebe2826f; `test/kernel.test.ts` sha256:5a9b8470abec87bb24fd4a630d03eb4ee194a7abdc49497daf18b3a5ce20dfd9 (+2 real-chain tests: archive from workflow-scoped root despite stale parent root; missing workflow evidence fails closed); `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint src test` PASS; prettier PASS on edited files; kernel, successor-closeout, skill-fidelity, methodology-evolution tests 71/71 PASS; full suite 250 pass / 9 fail (environmental sandbox failures: pinned bootstrap provenance/authority and ledger EACCES; not re-measured at baseline here)
- Measurements: 2 new tests; provider calls 0

## Evaluator verify — attempt 001 (cycle 2), evaluator revision 002

- Skill: evaluator v14; mode: verify; candidate `7a4aa3eeeae595ab0cfc56ce76a492328d4fce01`; evaluator revision 002 (`sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f`)
- Result: PASS (all 15 criteria SATISFIED); mandatory executable cases and reviews passed; full suite 258/259 with the single failure environmental (sandbox write access in a contained-worker test unchanged from baseline)
- Promotion plan: ELIGIBLE, decision identity `sha256:326a5fb02f6d09bbf8631976988ab2782fd06108b1418e480c7387a7384280ea`
- Measurements: provider calls 0

## evaluator-repair (evaluator contract version 14) - execution e976e75e-0fe5-4350-bf16-bd18b6218157

- Inputs: `spike.md` sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c; `design-map.md` sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de; `eval-requirements.md` sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a (unchanged); source evaluator revision 002 (sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f); repair trigger sha256:01417d242ea3a6d71ef2b162e19e78187b96d5f79336721504ea4a0a45f3a9d6
- Result: succeeded; evaluator revision 003 frozen, identity sha256:0128bd895b7e5f0b6e47e6a2d081eac4203c98adaf18202c35b985afbdceb144; revisions 001 and 002 preserved; both earlier PASS results untouched
- Outputs: `coverage-map.json` (readiness for revision 003 and repair lineage); `manifest.md`
- Checks: full structural integrity validation PASS (15 criterion records, 11 procedures); acceptance semantics preserved; affected criteria AC06, AC10, AC15; no new seam adopted
- Measurements: provider calls 0
