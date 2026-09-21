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
