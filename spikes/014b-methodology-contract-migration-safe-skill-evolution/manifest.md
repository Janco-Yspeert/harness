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
