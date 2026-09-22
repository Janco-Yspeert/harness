## Run 001 — Evaluator Preparation

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md` (evaluator tree
  `821e1a85e75c43794eba2e0d820be9b46e05ba15`, `SKILL.md`
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  confirmed byte-identical (`diff -q`) to the plain working-tree
  `skills/evaluator/SKILL.md` at preparation time, so this preparation
  executed directly under the working-tree copy with no divergence to
  reconcile.
- Inputs: frozen `spike.md`
  `sha256:d627fd302a04e778f4100fef2b897df16e4c97c3fb728e9bfcd3bf7dc30d298a`
  (committed `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`) and frozen
  `design-map.md` / `bootstrap/authority.md`
  (`sha256:2f12c72f8a382a44a53c4478ee08379d136f652f382305a88f63fb16711f3b40`
  / `sha256:c63fddcb220444158c98b5e1aef5f5116a1ee1d2bd803c7aa0369cf753b33809`,
  committed `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`). Produced under
  direct human bootstrap authority per the frozen brief's "Bootstrap process
  exception"; the current Design Map skill was not used to produce
  `design-map.md`.
- Result: prepared. 18 required criteria (AC01-AC18) each carry exactly one
  criterion evidence record across 8 evaluation procedures (5 executable
  hidden-test procedures, 2 manual-review procedures, 1 composite
  public-regression-plus-manual-inspection procedure); pre-freeze
  structural integrity validation (`tools/evaluator-integrity.ts`) PASSED
  with 0 diagnostics; evaluator revision `001` frozen
  (`sha256:63ce677b308818a9adeb618649ee33b605c0a05664eb26c23ce7917d282d1b31`).
- Output: `eval-requirements.md`, `coverage-map.json` (public); private
  `eval-spec.md`, `case-manifest.json`, five evaluator-authored executable
  hidden regression tests, `.hidden-test/manifest.json`, and
  `.eval/freeze.json` / `.eval/attempt-ledger.json` under the Spike 014b
  private evaluator workspace (`harness-hidden/spikes/014b-methodology-contract-migration-safe-skill-evolution`).
- Coverage summary: 5 mandatory executable hidden-test procedures
  (E1-E5) statically check already-public, pre-014b JSON contract/skill-file
  formats (capabilities, workspaces, forbiddenExposure, methodology enums,
  prose absence of "push", bootstrap-evidence durability) that the frozen
  Design Map's fidelity matrix requires to change, without inventing any
  014b-specific representation. 1 procedure (M-A) rides on the already-frozen,
  implementation-immutable `design-map.md`. 1 procedure (M-B) covers
  prose-fidelity criteria requiring reading comprehension a pattern match
  cannot fairly substitute for. 1 procedure (C-C, composite) covers the new
  `candidate`/`check`/`diff`/`exercise`/`promote` mechanism (AC12-AC16),
  relying on the implementation's own visible `npm test` suite plus manual
  inspection of the implementation-identified entry point, because the
  frozen Design Map reserves that mechanism's command/API shape and storage
  layout as explicit implementation freedom.
- Repository evidence inspected: frozen `spike.md`, `design-map.md`,
  `bootstrap/authority.md`; all 8 active role skills
  (`skills/{brief-readiness,design-map,evaluator,implementation,as-built,outcome,orchestrator}/SKILL.md`
  plus the `evaluator` skill covering `prepare`/`repair`/`verify`); all 8
  role contracts under `methodologies/harness/contracts/`;
  `methodologies/harness/policy.json`; `tools/evaluator-integrity.ts`;
  `package.json`; prior promoted evaluation artifacts under
  `spikes/014-kernel-consolidation-authority-role-grants/` and
  `spikes/007-structured-session-events/`, used as structural precedent for
  this preparation's own artifacts (public historical records, not
  evaluator-private).
- Restricted evaluator material inspected: none beyond this spike's own
  private evaluator preparation workspace under
  `harness-hidden/spikes/014b-methodology-contract-migration-safe-skill-evolution`
  (this spike's own `eval-spec.md`, `case-manifest.json`, `.hidden-test/**`,
  and `.eval/**`, all authored during this run).
- Checks: evaluator skill contract SHA-256 (v11) confirmed against both the
  working-tree copy and the frozen `../harness-014b-authority` bundle;
  frozen brief and Design Map/bootstrap-authority SHA-256 and Git
  provenance (`git cat-file -t`, `git merge-base --is-ancestor`);
  `tools/evaluator-integrity.ts` structural validation (PASS, 0
  diagnostics, 18 criteria / 8 procedures); all 5 executable hidden tests
  run via `node --test` against the pre-implementation baseline (16
  sub-assertions, 10 PASS / 6 FAIL, every result matching the frozen Design
  Map's own stated gaps) plus one discarded negative control on
  `evaluator-verify.json` confirming the intended failure mode; `tsc
  --noEmit`, `eslint`, and `prettier --check` clean on all 5 hidden tests
  (verified via temporary copies under `test/`, then removed; `git status
  --porcelain` confirmed clean afterward); full `npm test` (102/102), `npm
  run typecheck`, and `npm run lint` at the preparation commit, each clean;
  `npm run format:check` clean on both new public files
  (`eval-requirements.md`, `coverage-map.json`); `git diff --check` clean.
- Pre-existing evidence, not caused by this run: `npm run format:check`
  flags two files unrelated to this preparation
  (`methodologies/harness/contracts/brief-readiness.json`, `WORKLOG.md`) as
  already not Prettier-formatted at this commit; left untouched, as
  evaluator preparation does not edit implementation-owned files.
- Publication: per the explicit 014b bootstrap authority, this run does not
  push. The public checkpoint (this manifest update plus
  `eval-requirements.md` and `coverage-map.json`) is committed locally only;
  its SHA is reported to the human for bootstrap-authorized publication.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Implementation

- Skill: `implementation` v3 under the explicit Spike 014b bootstrap
  exception. Sole implementation instruction authority: baseline commit
  `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`, `skills/implementation/SKILL.md`
  Git blob `c9a340b00e31352bcd0abc5751a2703b96baa2c5`, content identity
  `sha256:bd10992f2d46103e603063230fe2c7dc150f876cee14e23b320a669312682605`.
  Candidate edits to the active implementation and evaluator skills did not
  alter this run's bootstrap authority.
- Inputs: frozen `spike.md`
  `sha256:d627fd302a04e778f4100fef2b897df16e4c97c3fb728e9bfcd3bf7dc30d298a`
  (committed `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`); frozen
  `design-map.md`
  `sha256:2f12c72f8a382a44a53c4478ee08379d136f652f382305a88f63fb16711f3b40`
  and `bootstrap/authority.md`
  `sha256:c63fddcb220444158c98b5e1aef5f5116a1ee1d2bd803c7aa0369cf753b33809`
  (committed `f141bb0226a6d15c90b4b895ae0b7fdd00bd78f7`); public
  `eval-requirements.md`
  `sha256:f66af67075b5b91aa522397fc2b9b16f0577b917bdba31111af7dc04f9f25c47`
  and `coverage-map.json`
  `sha256:1218aa5ec959c70551c39d50ca90ca0200abefa25966e6009536bd77a0267b78`
  (committed `3c0e4934b351fa860dcf3a8f3cf4a3a527915444`).
- Result: implemented. All eight active role skills, contracts, and configured
  policy entries were migrated to the frozen fidelity target. The durable
  methodology-evolution API is `src/methodology-evolution.ts`; its command
  surface is `tools/methodology.ts`; trusted methodology history is
  `methodologies/harness/trusted.jsonl`; and visible regression coverage is
  `test/methodology-evolution.test.ts`.
- Output: candidate methodology
  `sha256:d1b50f5633911a69a81071e6cf316056015e2c78223f8ca6349362713dbb1324`,
  distinct from trusted methodology
  `sha256:0ed6e2c936462ff00222e6e345bab8a600cc52428160cf17165992e3d50078d8`.
  `check` returned valid. The implementation report is
  `sha256:125f613c21568f77bfadaeb6b5be87747304117d2c0190be8fa38ef109009e43`.
- Exercise: the exact candidate created a disposable local Git checkpoint,
  reported no publication, and left the trusted identity unchanged. Promotion
  was not invoked.
- Kernel handback: no frozen `KERNEL_SUPPORT_REQUIRED` finding was implemented
  as a methodology-specific workaround. The frozen Design Map remains the
  authoritative 014a handback.
- Checks: `npm test` PASS (107/107, Node test runner reported 18,404 ms);
  `npm run typecheck` PASS; `npm run lint` PASS; `npm run format:check` PASS;
  `git diff --check` PASS; exact candidate `check` PASS; exact candidate
  disposable `exercise` PASS. The pre-existing `WORKLOG.md` formatting failure
  recorded by evaluator preparation was repaired mechanically with Prettier so
  the required repository-wide format check could pass.
- Independent evaluation: not run by implementation. No evaluator invocation,
  evaluation promotion, candidate-methodology promotion, canonical transition,
  or publication was performed.
- Publication: intentionally withheld by the Spike 014b bootstrap exception.
  The exact local checkpoint is reported to the human for bootstrap-authorized
  publication.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Evaluator Verification attempt 1

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  re-confirmed byte-identical at verification time. The candidate's own
  migrated `skills/evaluator/SKILL.md` (v12) was evaluated as content, never
  used as operating authority.
- Inputs: implementation commit
  `0d000d94e22016381f0642905b731474c4dd0afe` (working tree clean; not partly
  represented by uncommitted changes). All frozen inputs (`spike.md`,
  `design-map.md`, `bootstrap/authority.md`, `eval-requirements.md`, private
  `eval-spec.md`/`case-manifest.json`/`.hidden-test/**`, evaluator revision
  `001` `sha256:63ce677b...d282d1b31`) re-hashed at verify time and matched
  `.eval/freeze.json` exactly; no specification drift.
- Result: **PASS**. All 18 required criteria (AC01-AC18) satisfied across
  all 8 frozen evaluation procedures. 16/16 mandatory hidden-test
  sub-assertions passed (E1-E5); the frozen manual-review procedure (M-A)
  held via unchanged `design-map.md` content identity; the frozen
  manual-review procedure (M-B) held on inspection of the final candidate's
  6 governed-role skills and `evaluator-repair.json`; the frozen composite
  procedure (C-C) held via the implementation's own
  `test/methodology-evolution.test.ts` plus this evaluation's manual
  inspection of `src/methodology-evolution.ts`/`tools/methodology.ts`, and
  independent direct-CLI reproduction against the real repository.
- Regression checks (independently run by the evaluator, not merely trusted
  from the implementation's report): `npm test` 107/107; `npm run
  typecheck` clean; `npm run lint` clean; `npm run format:check` clean
  (including the two files flagged during preparation, now also clean);
  `git diff --check` clean.
- Diagnostic probes (read-only, non-authoritative, recorded but not
  affecting the result): direct CLI reproduction of `candidate`/`check`/
  `exercise` against the real repository reproduced the implementation's
  reported candidate methodology identity
  (`sha256:d1b50f5633911a69a81071e6cf316056015e2c78223f8ca6349362713dbb1324`)
  and trusted identity exactly, with `check` valid and `exercise` disposable/
  unpublished/trust-preserving; a self-evaluation promotion probe against
  the real `methodologies/harness/trusted.jsonl` was correctly rejected
  (`candidate must be evaluated by the current trusted methodology`), file
  confirmed unmodified afterward. The implementation's reported sandbox
  `EPERM` on direct CLI execution did not reproduce in this evaluation
  environment and falls outside the frozen evidentiary requirement (visible
  `npm test` evidence, which passed in both reports); it was not classified
  as an evaluator or implementation defect.
- Evaluator integrity: the frozen evaluation was not modified during
  verification; no specification drift; no evaluator defects discovered.
- Per this bootstrap request's explicit instruction, evaluator-owned
  promotion (of evaluation evidence to `evaluation/**`, and any promotion of
  the candidate methodology to trusted status) was **not** performed and
  awaits separate explicit authorization.
- Publication: per the explicit bootstrap authority, this run does not
  push. The exact local checkpoint (this manifest update plus the private
  attempt ledger/result under the Spike 014b private evaluator workspace)
  is reported to the human for bootstrap-authorized publication.
- Measurement cutoff: immediately before this manifest update.

## Run 004 — Evaluation Promotion (archival)

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  re-confirmed byte-identical at promotion time.
- Resumed from the already-finalized `verify` attempt `001` `PASS` against
  implementation commit `0d000d94e22016381f0642905b731474c4dd0afe`. No new
  verification attempt was allocated and no evaluation was rerun; this run
  performed only the archival/promotion step of `verify` step 5.
- Eligibility: evaluator revision `001`
  (`sha256:63ce677b308818a9adeb618649ee33b605c0a05664eb26c23ce7917d282d1b31`)
  determined eligible as one all-or-nothing bundle — five static,
  already-public-schema hidden tests plus `eval-spec.md`/`case-manifest.json`,
  none containing secrets, credentials, or mechanism that must remain
  private. No revision was found ineligible; `notPromotedRevisions` is
  empty.
- Archived byte-for-byte to `evaluation/`: `attempt-ledger.json`,
  `attempts/001/eval-result.md`, `freeze/001.json`, and
  `revisions/001/{eval-spec.md,case-manifest.json,.hidden-test/**}` (5 hidden
  tests + `.hidden-test/manifest.json`). `evaluation/promotion.json` written
  last, recording the passing attempt, evaluator-revision identity, and
  every archived file's source/promoted identity (all `copied`).
- Integrity: every archived file's recomputed SHA-256 matched its recorded
  private source identity and its `.eval/freeze.json`-recorded identity
  exactly (11/11 files checked); `promotion.json` parsed as valid JSON with
  internally consistent identities. No mismatch found; promotion is
  complete.
- Not performed, per explicit instruction: candidate-methodology trust
  promotion (`methodologies/harness/trusted.jsonl` untouched by this run).
  This archival step is not human acceptance.
- Publication: per the explicit bootstrap authority, this run does not
  push. The exact local checkpoint (this manifest update plus all archived
  `evaluation/**` files) is reported to the human for bootstrap-authorized
  publication.
- Measurement cutoff: immediately before this manifest update.

## Run 005 — Evaluator Repair (revision 001 -> 002)

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  re-confirmed byte-identical at repair time.
- Trigger: human post-verification review
  `post-verification-review.md` (committed `08a138d`), raising findings
  D01-D07 against implementation commit
  `0d000d94e22016381f0642905b731474c4dd0afe`. Mid-repair, an explicit human
  bootstrap clarification fixed the scope: findings do not automatically
  become new mandatory criteria; only findings demonstrating failure to
  satisfy an already-frozen, unambiguous requirement may strengthen
  coverage; Harness's threat model is cooperative fallible agents, not
  adversarial hardening.
- Result: repaired. Source revision `001`
  (`sha256:63ce677b308818a9adeb618649ee33b605c0a05664eb26c23ce7917d282d1b31`)
  preserved unchanged, byte-for-byte, at `.eval/revisions/001/`. Corrected
  revision `002`
  (`sha256:ee4107a51a9e6f2e4767a06d02cca0ff2dd061258bbfc521569f61cae112b5fd`)
  frozen after structural integrity validation PASSED with 0 diagnostics
  (18 criteria / 10 procedures).
- Disposition of findings: **D05 accepted** (new requirement, new case E7 —
  a material existing-contract defect, directly within scope). **D01
  accepted, bounded** (new requirement, new case E6 — minimal structural
  revision/manifest-binding check only, not adversarial anti-forgery).
  **D03 accepted, bounded** (existing case C-C's decision rule lightly
  strengthened — truthfulness of exercise's already-required smoke-test
  function only, not full role/workflow simulation). **D02, D04, D06, D07
  not accepted** as blocking requirements — recorded as non-blocking design
  observations, since none is independently and unambiguously required by
  the frozen `spike.md`/`design-map.md`.
- Repair overreach identified and corrected before freeze: this repair's
  own first draft briefly added D02 and D06 as blocking requirements
  (labeled R22 and R24) before the human clarification arrived; both were
  withdrawn before structural integrity validation ran and before anything
  was committed. Neither exists in the frozen revision 002 bundle. Recorded
  transparently in the private repair record per explicit instruction not
  to freeze overreach as authority.
- New hidden tests: `promotion-binds-exact-revision.test.ts` (E6, D01) uses
  only the already-exported `methodology-evolution.ts` public API — no new
  field or seam. `contract-event-producers-bound.test.ts` (E7, D05) is
  purely structural — cross-references existing `inputs[].event` and
  `outcomes[].transition` fields already present in the public schema.
- Verification against the unchanged implementation commit (diagnostic,
  not a new verify attempt — attempt 001 remains bound to revision 001):
  E6 and E7 run via `node --test` against commit `0d000d94...` **correctly
  FAIL**, proving the repaired evaluator now falsifies real,
  previously-undetected gaps without any change to the implementation
  target. E1-E5 re-run against the same commit remain 16/16 passing,
  confirming the repair did not alter or weaken revision 001's existing
  coverage.
- Checks: `tools/evaluator-integrity.ts` structural validation (PASS, 0
  diagnostics); both new hidden test files typecheck with 0 errors and are
  clean under `eslint`/`prettier --check`; positive control for E7
  (temporarily wiring a matching policy outcome, then reverting) confirmed
  discriminating power; `git status --porcelain` confirmed clean after
  every probe/control.
- Output: `eval-requirements.md`, `coverage-map.json` (public, updated);
  private `eval-spec.md`, `case-manifest.json`, `.hidden-test/manifest.json`
  (updated), two new hidden tests, `.eval/freeze.json` (revision 002),
  `.eval/repairs/001-repair-record.md`, and `.eval/revisions/001/` (archive
  of the prior revision) under the Spike 014b private evaluator workspace.
- Not performed: verification attempt 001's `PASS` result was not altered
  or invalidated (it remains immutable historical fact, bound to revision
  001); no new verification attempt was allocated; candidate-methodology
  trust promotion was not touched.
- Publication: per the explicit bootstrap authority, this run does not
  push. The exact local checkpoint is reported to the human for
  bootstrap-authorized publication.
- Measurement cutoff: immediately before this manifest update.

## Run 006 — Implementation Correction

- Skill: `implementation` v3 under the explicit Spike 014b bootstrap
  exception. Sole implementation instruction authority remains baseline commit
  `e2bd3fa35ddb76935bf811cc7cbaed3d383abd32`,
  `skills/implementation/SKILL.md` content identity
  `sha256:bd10992f2d46103e603063230fe2c7dc150f876cee14e23b320a669312682605`.
  Candidate edits to the active implementation and evaluator skills did not
  alter this run's bootstrap authority.
- Inputs: frozen `spike.md`
  `sha256:d627fd302a04e778f4100fef2b897df16e4c97c3fb728e9bfcd3bf7dc30d298a`;
  frozen `design-map.md`
  `sha256:2f12c72f8a382a44a53c4478ee08379d136f652f382305a88f63fb16711f3b40`;
  original public `eval-requirements.md`
  `sha256:f66af67075b5b91aa522397fc2b9b16f0577b917bdba31111af7dc04f9f25c47`;
  bootstrap authority
  `sha256:c63fddcb220444158c98b5e1aef5f5116a1ee1d2bd803c7aa0369cf753b33809`;
  human correction scope
  `sha256:d5cfabfb87e68c6ce24d1440276f5290ba08261309f760b927c2de7ec0720e12`;
  preserved historical review
  `sha256:7c4ad9a038efe9d8d6a6b275ee002652ea53c9449c39cf7fded847c9c254169d`;
  and sanitized repaired public evaluation feedback in the current
  `eval-requirements.md`
  `sha256:cdb8c0506c23c6b1c101df72d629f298a229d7de3b0a920564d37e2059cad350`.
- Result: corrected. D05 now binds the exact current, post-handoff committed
  public `IMPLEMENTATION_FAILURE` verification record into the implementation
  retry through the existing `verification-finalized` producer. D01 rebuilds
  the candidate manifest from its claimed repository revision before
  promotion. D03 exercises the candidate `design-map` skill/contract and its
  declared artifact in a disposable local checkpoint.
- Output: corrected candidate methodology
  `sha256:f8a08dfe1017f222fe168726180705e35c38e30585b9852cd48bad0d41cdb129`,
  distinct from unchanged trusted methodology
  `sha256:0ed6e2c936462ff00222e6e345bab8a600cc52428160cf17165992e3d50078d8`.
  Candidate `check` returned valid with no diagnostics. Candidate `exercise`
  used role `design-map`, produced disposable artifact `design-map.md` and a
  local checkpoint, reported `published: false`, and left the trusted identity
  unchanged.
- Visible verification: `npm test` PASS (109/109; Node test runner reported
  19,308 ms); `npm run typecheck` PASS; `npm run lint` PASS after removing
  three redundant test-only narrowing guards; `npm run format:check` PASS;
  `git diff --check` PASS; focused D01/D03/D05 tests PASS; exact candidate
  `check` PASS; exact candidate disposable `exercise` PASS. Direct CLI
  diagnostics initially encountered the environment's known `spawnSync git
  EPERM`; rerunning with permission for local Git subprocesses passed.
- Scope held: D02, D04, D06, and D07 were not expanded into blocking work. The
  existing Spike 014a `KERNEL_SUPPORT_REQUIRED` handback remains unchanged.
- Not performed: evaluator invocation or preparation, evaluator promotion,
  candidate-methodology trust promotion, canonical transition, direct
  publication, or push.
- Publication: intentionally withheld by the Spike 014b bootstrap exception.
  The exact local checkpoint is reported to the human for publication.
- Measurement cutoff: immediately before this manifest update.

## Run 007 — Evaluator Verification attempt 2

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  re-confirmed byte-identical at verification time.
- Inputs: implementation commit
  `399cd61d43f7b914b1195d47bee0c1040b6f42c8` (working tree clean). Verified
  against **evaluator revision 002** (the repaired revision,
  `sha256:ee4107a51a9e6f2e4767a06d02cca0ff2dd061258bbfc521569f61cae112b5fd`),
  not revision 001. All frozen inputs re-hashed and matched
  `.eval/freeze.json` (revision 002) exactly; no specification drift.
- Result: **PASS** (attempt `002`). All 18 required criteria (AC01-AC18)
  satisfied. 18/18 mandatory hidden-test sub-assertions passed (E1-E7,
  including the two cases added under the repair — E6 and E7 — which
  correctly failed against the prior implementation commit and now pass
  against this one). M-A/M-B held on inspection; C-C's strengthened
  decision rule (D03) held via the candidate's real `design-map`-role
  exercise.
- Regression checks (independently run): `npm test` 109/109; `npm run
  typecheck`, `npm run lint`, `npm run format:check`, `git diff --check`
  all clean.
- Diagnostic probes (read-only, non-authoritative): direct CLI
  reproduction of `candidate`/`check`/`exercise` against the real
  repository exactly matched the implementation's reported identities and
  the new candidate-specific exercise output (role, artifact, contract/
  skill identities). A spliced revision/manifest promotion probe was
  correctly rejected ("candidate methodology does not match its exact
  repository revision"), independently confirming the D01 fix against the
  real repository. A self-evaluation promotion probe was re-run and
  remains correctly rejected, confirming no regression. This evaluator
  independently reviewed the small `eventFields`/`current`/`after` input-
  selector extension to `src/kernel/model.ts`/`src/kernel/resolver.ts` (the
  mechanism making the D05 binding real) and agrees it is narrow, backward
  compatible, and proportionate — not scope creep into kernel/executor
  territory.
- Evaluator integrity: frozen evaluation not modified; no drift; no
  evaluator defects.
- Not performed: evaluator-owned promotion (evidence archival, and any
  candidate-methodology trust promotion) — awaits separate explicit
  authorization, as with attempt 001.
- Publication: per the explicit bootstrap authority, this run does not
  push. The exact local checkpoint is reported to the human for
  bootstrap-authorized publication.
- Measurement cutoff: immediately before this manifest update.

## Run 008 — Evaluation Promotion (archival, attempts 001+002)

- Skill: `evaluator` v11, executed under the explicit Spike 014b bootstrap
  exception. Sole evaluator instruction authority: the frozen snapshot at
  `../harness-014b-authority/skills/evaluator/SKILL.md`
  (`sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`),
  re-confirmed byte-identical at promotion time.
- Resumed from the already-finalized `verify` attempt `002` `PASS` (evaluator
  revision `002`) against implementation commit
  `399cd61d43f7b914b1195d47bee0c1040b6f42c8`. No new verification attempt
  was allocated and no evaluation was rerun; extends the Run 004 archival
  (attempt `001` / evaluator revision `001` only) to the complete two-attempt
  evidence chain, per explicit request.
- Eligibility: both evaluator revisions determined eligible as
  all-or-nothing bundles — `001`
  (`sha256:63ce677b308818a9adeb618649ee33b605c0a05664eb26c23ce7917d282d1b31`)
  and `002`
  (`sha256:ee4107a51a9e6f2e4767a06d02cca0ff2dd061258bbfc521569f61cae112b5fd`).
  Both are pure static/regression test material with no secrets, credentials,
  or private mechanism; the superseded revision `001` is preserved
  alongside `002` as historical record of the evaluator's own repair, per
  the frozen skill's "every superseded revision used in the cycle is
  preserved." `notPromotedRevisions` is empty.
- Archived byte-for-byte: `evaluation/attempts/002/eval-result.md`,
  `evaluation/freeze/002.json`, `evaluation/revisions/002/{eval-spec.md,
  case-manifest.json,.hidden-test/**}` (newly added); `evaluation/attempt-ledger.json`
  updated to its current complete two-entry state (both entries unchanged
  from their original finalized content). `evaluation/promotion.json`
  rewritten to record both attempts, both revisions (both `copied`), and
  every archived file's source/promoted identity; `passingAttempt` updated
  to `002` (the latest).
- Integrity: every archived file's recomputed SHA-256 matched its recorded
  source/freeze identity exactly — 23 historical-artifact entries checked,
  plus both attempts' `resultIdentity`/`evaluatorRevisionIdentity`
  cross-checks. No mismatch found; promotion is complete.
- Not performed: candidate-methodology trust promotion
  (`methodologies/harness/trusted.jsonl` untouched). This archival is not
  human acceptance.
- Publication: per the explicit bootstrap authority, this run does not
  push. The exact local checkpoint (this manifest update plus all
  archived/updated `evaluation/**` files) is reported to the human for
  bootstrap-authorized publication.
- Measurement cutoff: immediately before this manifest update.
