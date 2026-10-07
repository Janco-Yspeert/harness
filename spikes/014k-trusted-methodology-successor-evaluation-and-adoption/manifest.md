# Manifest - Spike 014k

## brief-readiness (contract version 5) - execution 59217559-7bf9-49d4-916b-ead1ebf1c96d

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c
- Result: READY (Ready after minor clarification; findings F1-F3 non-blocking
  material clarifications, F4 editorial)
- Outputs: `feedback.md`, `manifest.md`
- Checks: static review of `methodologies/harness/trusted.jsonl` and
  `src/methodology-evolution.ts`; no tests run

## design-map (contract version 4) - execution 8ad71641-d82e-40ab-9212-6c5dd88013fc

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c
  (identity and committed provenance at `894c71a` verified)
- Result: succeeded
- Output: `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `manifest.md`
- Checks: static review of brief, feedback, `src/methodology-evolution.ts`
  promotion boundary and 014j Design Map; no tests run
- Measurements: Design Map 8 shared contracts; provider calls and runtime
  metrics unavailable

## evaluator-prepare (evaluator contract version 14) - execution b2a3946f-e819-4cba-804a-5da603b96a37

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; evaluator revision 001 frozen, identity
  sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2
- Outputs: `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a;
  `coverage-map.json`; `manifest.md`
- Checks: pre-freeze integrity validation PASS (15 criterion records); controls
  on synthetic repositories and the pre-implementation baseline only; no
  candidate executed
- Measurements: 15 criteria, 9 procedures; provider calls 0

## implementation (contract version 5) - execution 507252f4-73cc-4092-8efd-1c3e0d655f63

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a;
  coverage
  sha256:508a418efd3e759c2138e71966841b1e7d4b175c8d6413c6a2aeb996ccd71118; base
  commit 9611a3b2bea67b768f20b380031950ef133618e9; no implementation feedback
  (first attempt)
- Result: succeeded (candidate checkpoint; independent evaluation not yet run)
- Outputs (content identities): `src/observation-declaration.ts`
  sha256:639cc61afa358d1408e2cf0b7756046e9002432877624e6fa13cc3201bf8d031;
  `src/evaluation-closeout.ts`
  sha256:14dbb165acf071b560dcd4800bce8b1e7c72e5f51f95fa16de8bd38ac090ba47;
  `src/methodology-evolution.ts`
  sha256:b86270cd792340656310a33a97d184cb9f1f78096cd04cde0a302f2b3792ba35;
  `skills/evaluator/SKILL.md`
  sha256:55f1b55f2839a44f0b334a3ce262f18bc31f57bc5e95b8bf81bece1a87451d99;
  `test/successor-closeout.test.ts`
  sha256:4719f720bddd78ee0c4e51e6e94a9950518fac2a48af04be14fb1f136f3336e8; also
  edited `test/methodology-evolution.test.ts`, `test/skill-fidelity.test.ts`;
  `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint .` PASS; `prettier --check` on
  src/test/skills PASS; `test/successor-closeout.test.ts` 11/11 PASS;
  `test/methodology-evolution.test.ts` 9/9 PASS; `test/skill-fidelity.test.ts`
  13/13 PASS
- Measurements: 11 new tests; pre-change full suite baseline 9 failing of 245
  (environmental, listed at suite run); provider calls 0

## evaluator-verify (evaluator contract version 14) - execution cee0da0c-b5ed-41fb-9542-e5c13717b859

- Inputs: candidate `75e350ac8e875965565a5fd8fabbc3789cad82ac`; evaluator
  revision 001
  (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2);
  `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; attempt 001 FAIL, classification IMPLEMENTATION_FAILURE
  (AC06, AC10 unsatisfied; other criteria satisfied)
- Outputs: `verification-result.json`; `feedback.md`; `manifest.md`
- Checks: frozen identities matched; executable procedures 3/3 PASS; typecheck,
  lint, format PASS; full suite 255/256, the one failure reproduces at baseline;
  reviews M1-M5 done
- Measurements: provider calls 0

## implementation retry 002 (contract version 5) - execution 039cf097-1164-45a9-b64b-09029a4ed7a8

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a;
  coverage
  sha256:508a418efd3e759c2138e71966841b1e7d4b175c8d6413c6a2aeb996ccd71118;
  implementation feedback (verification attempt 001, IMPLEMENTATION_FAILURE)
  sha256:4609e2436023d4a6e869e1442c5bf0b3a9faf84a05395d8f133d5baeb91e59c3; base
  commit 1a63eb596f615e30f8105526cfbe1ff89c264d84
- Result: succeeded (candidate checkpoint; independent evaluation not yet run).
  Addresses AC06/AC10: the host now derives and performs the post-PASS archive;
  the evaluator authors no ELIGIBLE/INELIGIBLE plan
- Outputs (content identities): `src/evaluation-closeout.ts` (adds
  `deriveHostArchive`)
  sha256:c02d95f76a34fd00be02ec7134d6eb1e983ec71b89d24e2f5da2ccea20ee0578;
  `skills/evaluator/SKILL.md`
  sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b;
  `methodologies/harness/contracts/evaluator-verify.json` (`promotion.plan`
  replaced by `promotion.derive: host-archive`)
  sha256:5c64c273b9e0ad83ad8877098aa265dc29812725909aecd6f870133835b0aecc;
  `src/kernel/execution.ts` (promote derives artifacts via `deriveHostArchive`)
  sha256:f0555f8dbafa0753d521f09dab8c52ec1d3e4d6b6f6ccf7af092c5d16742830e;
  `test/skill-fidelity.test.ts`
  sha256:b15bea81aa6a81e2b3071f0ad245cca5fcaebc5fcbd3f57c16020b2f4ff3e9ce; also
  edited `src/kernel/{model,methodology,resolver,host}.ts`,
  `src/executors/protocol.ts` (promotion artifacts optional),
  `tools/fixtures/fake-provider.ts`, `test/successor-closeout.test.ts` (+1
  test); `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint .` PASS; `prettier --check` on
  src/test/skills/tools PASS; `test/skill-fidelity.test.ts` 13/13,
  `test/successor-closeout.test.ts` and `test/methodology-evolution.test.ts`
  PASS; full suite 245 pass / 12 fail
- Measurements: the 12 full-suite failures are unrelated to promotion: two are
  EACCES reading spikes workflow ledgers in this sandbox, ten are pinned
  evaluator bootstrap provenance/authority checks; baseline for them was not
  re-measured at HEAD in this environment (the evaluator's attempt 001 recorded
  one baseline failure); provider calls 0

## evaluator-verify attempt 002 (evaluator contract version 14) - execution 5e2ca20a-6464-48f2-a29d-073b1d3d0e6c

- Inputs: candidate `4455fd884e4ae4396149a277b5e0a79a57506aff`; evaluator
  revision 001
  (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2);
  `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; attempt 002 PASS (all 15 criteria satisfied); promotion
  plan ELIGIBLE (ledger and terminal results; evaluator revision bundle kept
  private)
- Outputs: `verification-result.json`; `manifest.md`
- Checks: frozen identities matched; executable procedures 3/3 PASS; typecheck,
  lint, format PASS; full suite 256/257, the one failure reproduces at baseline;
  reviews M1-M5 done
- Measurements: provider calls 0

## evaluator-repair (evaluator contract version 14) - execution 666ef22e-4211-4ecd-b902-7f5f20275b00

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a
  (unchanged); source evaluator revision 001
  (sha256:1db3e721c2416b7045983626b4bbd47af5b12703780acf42083e012328e9dad2);
  repair trigger
  sha256:e06c860947027f1ad71cdea7669ea3f61ebdbcde7caff82d10c65442636374b3
- Result: succeeded; evaluator revision 002 frozen, identity
  sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f;
  revision 001 preserved; attempt 002 PASS untouched
- Outputs: `coverage-map.json` (readiness for revision 002 and repair lineage);
  `manifest.md`
- Checks: full structural integrity validation PASS (15 criterion records);
  acceptance semantics preserved; affected criteria AC06-AC10; no new seam
  adopted
- Measurements: 15 criteria, 10 procedures; provider calls 0

## implementation retry 003 (contract version 5) - execution 5342c4fc-2d31-4cae-8796-d5563c70d8fa

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a;
  coverage (evaluator revision 002 repair)
  sha256:6c8ce5e578f172048f4d19bc925ccb8e79b51537bc69245b4b0db142432f4c93; no
  current implementation feedback (attempt 001 feedback already addressed;
  attempt 002 PASS under revision 001); base commit
  8c73b6b622883257e0c7cb8472ebc63c75c35f43
- Result: succeeded (candidate checkpoint; independent evaluation not yet run).
  Addresses the revision-002 workflow-scoped private-root coverage (AC06-AC10,
  M6): host archive derivation now binds its source workspace through the Role
  Grant for the workflow, refusing a workspace outside the grant, with no
  parent-root or other-workflow fallback
- Outputs (content identities): `src/kernel/execution.ts`
  sha256:cd518b5a6033bbcb8d4781391aea84ddbd093e6b7646534fedc95bc2ebe2826f;
  `test/kernel.test.ts`
  sha256:5a9b8470abec87bb24fd4a630d03eb4ee194a7abdc49497daf18b3a5ce20dfd9 (+2
  real-chain tests: archive from workflow-scoped root despite stale parent root;
  missing workflow evidence fails closed); `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint src test` PASS; prettier PASS on edited
  files; kernel, successor-closeout, skill-fidelity, methodology-evolution tests
  71/71 PASS; full suite 250 pass / 9 fail (environmental sandbox failures:
  pinned bootstrap provenance/authority and ledger EACCES; not re-measured at
  baseline here)
- Measurements: 2 new tests; provider calls 0

## Evaluator verify — attempt 001 (cycle 2), evaluator revision 002

- Skill: evaluator v14; mode: verify; candidate
  `7a4aa3eeeae595ab0cfc56ce76a492328d4fce01`; evaluator revision 002
  (`sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f`)
- Result: PASS (all 15 criteria SATISFIED); mandatory executable cases and
  reviews passed; full suite 258/259 with the single failure environmental
  (sandbox write access in a contained-worker test unchanged from baseline)
- Promotion plan: ELIGIBLE, decision identity
  `sha256:326a5fb02f6d09bbf8631976988ab2782fd06108b1418e480c7387a7384280ea`
- Measurements: provider calls 0

## evaluator-repair (evaluator contract version 14) - execution e976e75e-0fe5-4350-bf16-bd18b6218157

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a
  (unchanged); source evaluator revision 002
  (sha256:1d5aad9a5ec9601e9691699ca5b696d60e6acc1531ca6752c325f1f0b6860b3f);
  repair trigger
  sha256:01417d242ea3a6d71ef2b162e19e78187b96d5f79336721504ea4a0a45f3a9d6
- Result: succeeded; evaluator revision 003 frozen, identity
  sha256:0128bd895b7e5f0b6e47e6a2d081eac4203c98adaf18202c35b985afbdceb144;
  revisions 001 and 002 preserved; both earlier PASS results untouched
- Outputs: `coverage-map.json` (readiness for revision 003 and repair lineage);
  `manifest.md`
- Checks: full structural integrity validation PASS (15 criterion records, 11
  procedures); acceptance semantics preserved; affected criteria AC06, AC10,
  AC15; no new seam adopted
- Measurements: provider calls 0

## implementation retry 004 (contract version 5) - execution 4d49caec-9ece-4486-bd46-5dbd0cc15350

- Inputs: `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de;
  `eval-requirements.md`
  sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a;
  coverage (evaluator revision 003 repair)
  sha256:9d6f6c4d95e7d01f2808fdb4f0d73c4a1431b61a6b52d7079f498703f1d57469; no
  current implementation feedback (latest verification PASS under revision 002);
  base commit ace3335f01efdea87b7d00f3b2fd70509db2cd76
- Result: succeeded (candidate checkpoint; independent evaluation not yet run).
  Addresses revision-003 M7 (AC06/AC10/AC15): under a non-initial correction
  cycle the host promotion action derives archive allocations from the current
  cycle only (earlier-cycle allocations with the same attempt number no longer
  shadow the current one) and records the host-derived active cycle on
  `promotion-recorded`, so a current-cycle archive clears the gate; cycle 001
  behavior is unchanged
- Outputs (content identities): `src/kernel/execution.ts`
  sha256:80deabca7f3b8f6c900ca637483bf3e3e0a973c01cb82c1d1b7be33a76928523;
  `test/kernel.test.ts`
  sha256:5d4d8aa59386cc760d8ba3d42ceea26cba87678bb77339e68382e9986339f71d (+1
  cycle-002 test); `manifest.md`
- Checks: `tsc --noEmit` PASS; `eslint src test` PASS; prettier PASS on edited
  files; kernel, successor-closeout, skill-fidelity, methodology-evolution tests
  72/72 PASS; full suite not run in this sandbox (known environmental failures)
- Measurements: 1 new test; provider calls 0

## Evaluator verify — attempt 001 (cycle 3), evaluator revision 003

- Skill: evaluator v14; mode: verify; candidate
  `2e1cf0e2ee3facc2742dade252ac970b03f38a26`; evaluator revision 003
  (`sha256:0128bd895b7e5f0b6e47e6a2d081eac4203c98adaf18202c35b985afbdceb144`)
- Result: PASS (all 15 criteria SATISFIED); mandatory executable cases and
  reviews (including correction-cycle archival provenance) passed; full suite
  259/260 with the single failure environmental (contained-worker test unchanged
  from baseline)
- Promotion plan: ELIGIBLE, decision identity
  `sha256:1a926934a5a263b98fd46b7595c6ca5c16c688c5d4407c97f810532eff84f8a4`
- Measurements: provider calls 0

## As-Built

- Skill: as-built, contract version 4; inspected revision
  `2e1cf0e2ee3facc2742dade252ac970b03f38a26`
- Input identities: brief
  `sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c`;
  design
  `sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de`;
  verification
  `sha256:8dbb7f45a302efa63a3d03a3d632f994913fd0036a8cf337f878ef2bdf538b4a`;
  promotion
  `sha256:ad348dd072464c67bc406a38c0f634525fa7309efb186d67b84833da66323a1e`
  (verified against `evaluation/promotion.json`, committed separately as
  `8565c08`)
- Result: succeeded; artifact `as-built.md`; Missing: post-As-Built adoption and
  cutover steps not yet present, no host call site for
  `executeArchive`/`closeoutPermitted`; Contradictory: none; Extra: cycle scope
  field on `promotion-recorded`, optional promotion artifacts schema
- Measurements: provider calls 0

## Evaluator repair — revision 004

- Skill: evaluator v14; mode: repair; source evaluator revision 003
  (`sha256:0128bd895b7e5f0b6e47e6a2d081eac4203c98adaf18202c35b985afbdceb144`);
  resulting evaluator revision 004
  (`sha256:dd9e3a8a646f2fe862da843b36c2d7cff63f4ea01a9b0786230ddbf23f251c11`)
- Trigger: `sha256:db0834d08b4a9de90288ffb3b9c3f70400ab00ac634abeb6a57b4e65020be283`
  (evaluator coverage defect: archival of a later authoritative PASS when an
  earlier-cycle canonical archive already exists)
- Affected criteria: AC06, AC10, AC15; acceptance semantics preserved; integrity
  validation PASS (15 criterion records, 12 procedures); no candidate executed
- Public artifacts: `coverage-map.json` (readiness, repair lineage)
- Measurements: provider calls 0

## Verification attempt 001 — evaluator revision 004

- Skill: evaluator v14; mode: verify; candidate
  `6e2cec8dfa61b34c2ac2e5063139108381826b15`; evaluator revision 004
  (`sha256:dd9e3a8a646f2fe862da843b36c2d7cff63f4ea01a9b0786230ddbf23f251c11`)
- Result: FAIL; classification IMPLEMENTATION_FAILURE (AC06, AC10, AC15:
  earlier-cycle archive preservation not implemented or tested); mandatory
  executable cases pass; no promotion requested
- Public artifacts: `verification-result.json`, `feedback.md`
- Measurements: provider calls 0

## implementation retry 005 (contract version 5) - execution fafe4c4a-3982-49eb-bcae-1f5e2652c08b

- Skill: implementation v5; branch `feat/spike-014`; base `f3fed8026c6d8db0759d2747736b28f9667b2971`
- Inputs: brief
  `sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c`;
  design
  `sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de`;
  coverage
  `sha256:124701113b66cd2c30f415df08ec498fe6bceefa5a0887aea102a8985098f001`;
  requirements
  `sha256:9b83a28e40660a34ed778033b494efbc3723424378a6bcb929b5b7365af5b06a`;
  implementation feedback
  `sha256:cc880fd4f2c07ab63dce23f033f44a5b6304d85c939e23e1902ddf244a7469d9`
  (attempt 001, evaluator revision 004, IMPLEMENTATION_FAILURE: AC06, AC10,
  AC15)
- Output: host promotion now identity-validates and atomically preserves a valid
  earlier-cycle canonical archive at `<destination>-history/cycle-NNN/` (cycle
  and expected identities from host workflow history only) before promoting the
  current cycle; changed, extra, unbound or occupied-history cases fail closed
  with nothing overwritten. Content identities:
  `src/kernel/archive-preservation.ts`
  `sha256:138c176be8a1b1ae35eee1206dd83cb34fdca2af991c4fdfb097563e517ccb1a`;
  `src/kernel/execution.ts`
  `sha256:c83a37d36bb05ea667aed4ef99fb02b8634fce9a065dbd0aaac43e82842b2c05`;
  `test/governed-executors.test.ts`
  `sha256:a744280900e65fdec0412988442ff9e94b89ea1f91770620409f34bed3bca332`
- Status: succeeded (candidate committed locally; not independently evaluated)
- Visible verification: two new tests through the real host promotion path pass;
  typecheck, eslint, prettier pass; `npm test` 253 pass / 9 fail, the same 9
  failures occur without this change (sandbox EACCES on protected paths)

## evaluator-verify attempt 002 (cycle 4, evaluator contract version 14) - execution b005763e-b408-4bb4-8429-13f89ec88e10

- Inputs: candidate `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`; evaluator
  revision 004
  (sha256:dd9e3a8a646f2fe862da843b36c2d7cff63f4ea01a9b0786230ddbf23f251c11);
  `spike.md`
  sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c;
  `design-map.md`
  sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de
- Result: succeeded; attempt 002 PASS (all 15 criteria satisfied); promotion
  plan ELIGIBLE (ledger and terminal results; evaluator revision bundle kept
  private), decision identity
  sha256:b15a9ba9d51b3887ba7a0868e9f79c7ff10993da050289a730c6a61c44b991f1
- Outputs: `verification-result.json`; `manifest.md`
- Checks: frozen identities matched; executable procedures 3/3 PASS; full suite
  261/262, the one failure reproduces at baseline; reviews M1-M8 done
- Measurements: provider calls 0

## As-Built (cycle 4)

- Skill: as-built, contract version 4; inspected revision
  `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`
- Input identities: brief
  `sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c`;
  design
  `sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de`;
  verification
  `sha256:001af4733cedac7a70613b86d0bc54cb1c0824f4b05f2e033385a671fb0b3c36`;
  promotion
  `sha256:2965c3f2264fade33941a7efae52ac21e552e319ffb0bdedab514fd057b67cf6`
  (verified against `evaluation/promotion.json`, committed separately as
  `ed99cd3`)
- Result: succeeded; artifact `as-built.md`; Missing: post-As-Built adoption and
  cutover steps not yet present, no host call site for
  `executeArchive`/`closeoutPermitted`; Contradictory: none; Extra: cycle scope
  field on `promotion-recorded`, optional promotion artifacts schema,
  earlier-cycle archive preservation
- Measurements: provider calls 0

## Outcome (contract version 5) - execution 8b16f4c1-1c47-4540-a270-a586e8ce9986

- Inputs: candidate `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`;
  brief
  `sha256:5e618dae8b741c143cb8c94145fe614e0ca1d730b9621e56c361a1d8ee0ff08c`;
  design
  `sha256:2a991865fb00047af1019ad0e6cb69afac2f5955c69f312c9ad7953dc558b2de`;
  promotion
  `sha256:2965c3f2264fade33941a7efae52ac21e552e319ffb0bdedab514fd057b67cf6`;
  As-Built
  `sha256:a69839d86b4e337f7667456e5a94416ed0ff1804cbee2f3098920bf83393d6e0`;
  human acceptance of candidate
  `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`
- Result: succeeded; completion mode `STANDARD`
- Output: `outcome.md`
  `sha256:fd80ceb980d428f8e6adad8e4c69610d3cdf2c46c30e27df20848da63a30c824`
- Checks: bound input identities matched repository bytes; candidate commit and
  ancestry verified; promoted artifact identities matched the committed
  promotion record; exact candidate PASS, completed As-Built, human acceptance,
  trusted sequence-6 adoption and fresh ordinary post-cutover allocation
  verified from committed public evidence; `git diff --check` passed for Outcome
- Measurements: 4 evaluator revisions, 6 verification attempts, 5
  implementation runs including retries; entry recorded contemporaneously

## Post-Outcome host/runtime maintenance 001

- Authority and provenance: explicit human authorization in the active Codex
  App session; performed through Codex App, not through a governed Harness role
  allocation
- Scope: repair provider/runtime write composition so workspace modes govern
  filesystem locations independently of `repository-write`, preserving the
  accepted trusted sequence-6 verifier authority
- Base: `caa701afb028135033b03e1d09abdfc2d5c8306a`
- Result: implemented; deterministic verification passed; independent and live
  governed operational confirmation not yet performed
- Outputs: `src/claude-workflow.ts`
  `sha256:920052ed9f51863da04a7b31c2c3d21c0bed9702edd80d93b16b05aedc3af22a`;
  `src/executors/adapters.ts`
  `sha256:4ac06e9eeada1a8f402f246256cc76a71ce173ca0ee5e804f4b45242233db477`;
  `test/evidence-action.test.ts`
  `sha256:bb16fbb336a9c013a49de1a4474941ae32dcdacf2ad0b543f78e04a7a934dc88`;
  `test/external-project.test.ts`
  `sha256:ff5d2d789bb8a108eb0aea4b03711c9cf7b46a1f074fa0524ad81ae6b37038b1`;
  `post-outcome-maintenance-001-evaluator-write-composition.md`; `manifest.md`
- Checks: focused provider/containment regression 68/69 initially (stale test
  setup corrected), then 28/28 PASS and external-project 18/18 PASS; full
  sequence-6 regression set 115/115 PASS; full suite 263/263 PASS; typecheck,
  ESLint, Prettier and `git diff --check` PASS
- Boundaries: no live provider call; no governed role identity; no change to
  014k Outcome, trusted methodology sequence 6 or its identity, Spike 014f
  candidate `af75b14d1847af02404a591a8829751dc8df2a2e`, or evaluator revision
  `002`. A fresh unchanged protected Claude `evaluator-verify` remains required
  as separately recorded operational confirmation.

## Post-Outcome host/runtime maintenance 002

- Authority and provenance: explicit human authorization in the active Codex
  App session; performed inline through Codex App, not through a governed
  Harness role allocation
- Predecessor: maintenance 001 commit
  `1c1b432ccb68e856926d8635a11ab39def7ef17e`; base includes immutable Spike
  014f attempt-8 evidence commits `5031475e47b0894c87e6bc8f89cf450ba73f61c5`
  and `f938fec61f7574a7e274a242a6522cb91e314fe7`
- Scope: stop Claude's nested command sandbox from reconstructing filesystem
  write policy already enforced by authoritative outer Harness containment,
  while retaining Claude command/network isolation and all sequence-6
  capability, tool and publication restrictions
- Diagnosis: execution `7b26f056-fd50-46c1-90dc-a072295373a6` failed before
  evaluator Bash execution because Claude Code `2.1.292` tried to create the
  nested sandbox mount point
  `/home/velveteen/vk-code/harness/.claude/hooks` inside the outer read-only
  repository mount
- Result: implemented; governed contained Claude launches disable only the
  nested sandbox filesystem component. The sandbox remains enabled and
  fail-closed with unsandboxed commands forbidden; outer bubblewrap remains the
  exact filesystem boundary
- Evidence repair: restored the complete Spike 014f manifest forward from
  maintenance 001 and appended the attempt-8 overwrite and validation history.
  The attempted result used `candidate` instead of validator-bound `commit`, so
  `verification result identity mismatch` prevented `verification-finalized`.
  The malformed result, both evidence commits and ledger failure remain intact
- Outputs: `src/claude-workflow.ts`, `test/evidence-action.test.ts`,
  `test/governed-executors.test.ts`, `test/host-fs-isolation.test.ts`, the Spike
  014f `manifest.md`,
  `post-outcome-maintenance-002-claude-shell-composition.md`, and this manifest
- Checks: focused provider/containment 35/35 and expanded 70/70 PASS; full
  sequence-6 regression set 115/115 PASS; full suite 263/263 PASS; typecheck,
  ESLint and Prettier PASS; `git diff --check` rerun immediately before commit
- Boundaries: no live provider call and no new evaluator allocation; no change
  to the 014k Outcome, trusted methodology sequence 6 or its identity, Spike
  014f candidate `af75b14d1847af02404a591a8829751dc8df2a2e`, or evaluator
  revision `002`. A separately authorized minimal protected-Claude runtime
  preflight is the next operational step before any evaluator retry.

## Post-Outcome host/runtime maintenance 003

- Authority and provenance: explicit human authorization in the active Codex
  App session; performed through Codex App, not through a governed Harness role
  allocation
- Base and predecessor: maintenance 002 commit
  `2bf56bee4efa10707ec1cf548110ac7e8f9e8993`
- Runtime evidence: historical successful 014k executions used
  `claude-sonnet-5-5` / Claude Code `2.1.284`; the inspected and preflighted
  runtime is Claude Code `2.1.292`
- Diagnosis: protected `dontAsk` denied Bash before execution, while the copied
  synthetic-HOME OAuth file would have been readable to a child after disabling
  duplicated filesystem isolation unless protected independently
- Result: implemented a control/execution-plane split. Harness bubblewrap owns
  exact filesystem modes; Claude's fail-closed child sandbox owns strict
  deny-all network isolation and masks provider credentials; protected
  mixed-workspace launches use sandbox-aware `acceptEdits`, never bypass mode;
  Claude nested-sandbox startup is probed before allocation
- Outputs: `src/claude-workflow.ts`, `src/executors/adapters.ts`,
  `test/evidence-action.test.ts`, `test/external-project.test.ts`,
  `test/governed-executors.test.ts`,
  `post-outcome-maintenance-003-claude-control-execution-plane.md`, and this
  manifest
- Deterministic checks: focused provider/containment 59/59 PASS; sequence-6
  regression set 115/115 PASS; full suite 263/263 PASS; typecheck, ESLint,
  Prettier and `git diff --check` PASS
- Disposable live preflight: one launch, confirmed `claude-sonnet-5-5` /
  `2.1.292`; Harness MCP and parent provider traffic worked; child computation,
  repository read, Git inspection, private/scratch/tmp writes worked; repository
  and Git-metadata writes, outside-root visibility, DNS/external network, and
  provider credential access were denied; disposable state was deleted
- Boundaries: no 014f Workflow Grant, Role Grant, or evaluator allocation was
  created; no attempt 9; no change to the 014k Outcome, trusted methodology
  sequence 6 or its identity, Spike 014f candidate
  `af75b14d1847af02404a591a8829751dc8df2a2e`, or evaluator revision `002`.
  The preflight is operational evidence, not independent semantic evaluation.

## Post-Outcome host/runtime maintenance 004

- Authority and provenance: explicit human authorization in the active Codex
  App session; performed inline through Codex App, not through a governed
  Harness role allocation
- Base: attempt-9 public evidence commit
  `10b37cd6a495c9a5a012bc3961000c3ed61ca988`; generic correction commit
  `e398ee8535b045aad7e14eaefecf66ebc80a11cd`
- Scope: restore accepted sequence-6 attempt-history derivation by making
  current-cycle host allocations authoritative, joining semantic/finalization
  history and canonical private evidence by explicit attempt identity, and
  failing closed on terminal evidence gaps
- Result: generic correction implemented. Attempts without evaluator results
  are NONTERMINAL; semantic terminal results require exact private evidence;
  missing terminal evidence is neither silently NONTERMINAL nor LOST; malformed,
  duplicate, unknown, ambiguous, conflicting and changed evidence fails closed
- 014f recovery: not performed. Attempt 9 private evidence contains aggregate
  `8/8` coverage but no exact AC01–AC08 adjudication map, so no corrected public
  result or `verification-finalized` was fabricated. Attempts 1, 2 and 5 have
  exact committed public terminal results but no retained private artifact or
  durable private identity, so complete promotion remains blocked
- Outputs: `src/evaluation-closeout.ts`, `src/kernel/execution.ts`,
  `test/successor-closeout.test.ts`, `test/kernel.test.ts`,
  `test/skill-fidelity.test.ts`, `tools/fixtures/fake-provider.ts`,
  `post-outcome-maintenance-004-attempt-history-and-finalization-recovery.md`,
  identity
  `sha256:4bbc41acdcd022d96fb1a00c95050e08333646a8504a69809346d4c08c016c73`,
  and this manifest
- Checks: focused closeout 16/16 PASS; host/closeout 54/54 PASS; sequence-6
  archive/methodology 76/76 PASS; full suite 267/267 PASS; typecheck, ESLint,
  Prettier and `git diff --check` PASS
- Boundaries: no evaluator rerun, attempt 10, workflow event, private evidence
  edit, finalization recovery or promotion action; no change to the 014k
  Outcome, trusted methodology sequence 6 or its identity, Spike 014f candidate
  `af75b14d1847af02404a591a8829751dc8df2a2e`, evaluator revision `002`, or
  attempt-9 semantic PASS

## Post-Outcome host/runtime maintenance 005

- Authority and provenance: explicit human authorization in the active Codex
  App session; performed inline through Codex App, not through a governed
  Harness role allocation
- Scope: recover only Spike 014f attempt 9's missing criterion-level public
  accounting and replay its blocked canonical transition without evaluator
  execution, a new semantic result, or another allocation
- Surviving evidence: exact named E1–E6 case outcomes, R1 differential
  observations and P1 identity observations were retained in the bounded
  provider diagnostic and joined mechanically through the frozen revision-002
  coverage map; no AC value was inferred from the aggregate `8/8` counter
- Implementation: generic root-only, drift-refusing and idempotent transition
  recovery in commits `1649d727d202dfafe1ba9afa960068478fcbb07c` and
  `ce4c4a2182b7710f6597ffe078bc4066a9fde1c4`
- Corrected evidence: commit
  `193c4d4cbf109fb0cf3fcd3685d11fb482a061ec`, identity
  `sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`;
  original malformed commit `10b37cd6a495c9a5a012bc3961000c3ed61ca988`
  and its blocked transitions remain immutable
- Result: canonical `verification-finalized`
  `138271e4-40d9-4f5d-bdf9-42e72fc8fbc0` and matching
  `kernel.transition` `02fdef5c-3f5e-4008-be87-d8aece983916`; exact replay
  returned the same event and appended nothing
- Record: `post-outcome-maintenance-005-attempt-9-evidence-finalization-recovery.md`,
  identity
  `sha256:2cded59b423569bf3c3ddbc161dcb408bbbdd32e68e4026ea5095cf22d023606`
- Checks: focused recovery 3/3 PASS; kernel 41/41 PASS; sequence-6
  kernel/workflow/skill-fidelity/closeout regressions PASS; full suite PASS;
  typecheck, ESLint, Prettier and `git diff --check` PASS
- Boundaries: no evaluator rerun, attempt 10, private evaluator edit,
  archive/promotion recovery, As-Built or acceptance; no change to the 014k
  Outcome, trusted sequence 6, candidate
  `af75b14d1847af02404a591a8829751dc8df2a2e`, evaluator revision `002`, or
  attempt-9 semantic PASS. Attempts 1, 2 and 5 still block complete archival
  because their canonical terminal history has no retained private terminal
  artifact or durable private identity.
