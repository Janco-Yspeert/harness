# Spike 012 pre-freeze integrity checklist - evaluator revision 001

Evaluator v10 step 4 requires a deterministic pre-freeze integrity validation
over the candidate evaluator bundle before the private revision is frozen and
before `evaluation-prepared` is recorded.

Bootstrap note: the frozen `spike.md` "Evaluator skill versioning and bootstrap"
section pins Spike 012 evaluator `prepare` and `verify` to the exact
pre-implementation evaluator skill `evaluator` v10
(`sha256:fa8168a3dc946a852e3dc755ef7baa0871fd7b790986d91d861433b80452c38b`). At
the preparation commit the working-tree `skills/evaluator/SKILL.md` is
byte-identical to `spikes/012-correction-cycles-evaluator-repair/bootstrap/
evaluator-skill.md`, so this preparation is executing that pinned contract. This
checklist follows evaluator v10 step 4 unchanged.

This validation has two parts:

1. the mechanical structural validator `tools/evaluator-integrity.ts`
   (`validatePreparedEvaluatorBundle` / `prepareEvaluatorBundle`), run over the
   prepared AC coverage bundle; and
2. this deterministic checklist, which covers the structural properties the
   mechanical validator does not itself check - physical file existence, content
   hash recomputation of the frozen bundle, public/private consistency, and the
   absence of any verification attempt allocated during `prepare`. The Spike
   010c human rejection (`IMPLEMENTATION_GAP`) recorded that
   `tools/evaluator-integrity.ts` validates a supplied bundle description rather
   than the physical bundle; part 2 closes exactly that gap for this revision.

Every item was completed **before** `.eval/freeze.json` was written and before
`evaluation-prepared` is recorded. No Spike 012 feature implementation exists at
the preparation commit.

Preparation commit: `6f46363053e4e8c48054599439e52747ba595239` (`feat/spike-012`).

This checklist contains no literal `.eval/freeze.json` identity and no literal
identity of itself; it states relational properties so the freeze inventory has
no circular dependency.

## Candidate bundle

| File                                | Identity                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `eval-spec.md`                      | `sha256:974c49925e11dc8fdd2552f8681e276491b8428bef3724c80fe9e4d0d7f6c048` |
| `criterion-records.md`              | `sha256:8e71aa35ff126bd116b2ed233e2fa47dfba230eb53efbd3cdf4c9b61693cdf46` |
| `case-manifest.json`                | `sha256:6d4dde9c82189b371003b41f5f5fd656853e1f1d5c39bde470e9650083e9c53c` |
| `.hidden-test/manifest.json`        | `sha256:2cf3126df174136973c3d1b04b1d383af41a65bdb3dd34bb2582c1db83919d64` |
| `pre-freeze-integrity-checklist.md` | this document                                                          |

Frozen inputs: `spike.md`
`sha256:8f54bcb361aae9aff1093159c3459da6f21d84470161de651c11118c09d67e94`
(`a3742a8`); `design-map.md`
`sha256:50a5e771a55f49bbc6082b66e7957a37261302022784b90dd2cd97b52983e4d4`
(`6b83954`); `eval-requirements.md`
`sha256:1ac745acfc52bdc9dcee9da38de34dfe9c33a898a7465de1b9002f9891c0d05c`.

## 1. Criterion completeness - PASS

`criterion-records.md`, `case-manifest.json` (union of `cases[].criteria`), and
`coverage-map.json` (`criteria[].id`) each contain exactly the 30 identifiers
`AC01`-`AC30`, one per numbered acceptance criterion in `spike.md` section
"Acceptance Criteria". No criterion is missing; no id is duplicated.
`readiness.criterionRecordCount` is `30` and equals the record count.

## 2. One criterion-specific evidence record with a sufficiency reason - PASS

Each `AC` record in `criterion-records.md` and in `coverage-map.json` carries
`id`, a frozen-authority source (acceptance criterion number plus cited
`spike.md` scope/model section and/or Design Map section), an evidence `mode`,
`required` (`true`), referenced `procedures`, and a `sufficiency` written
specifically for that criterion. Spot-checked that no two `sufficiency` strings
are copy-identical and that each names the property its referenced procedures
establish for that criterion. Procedures shared across records (E6 in AC06; E14
in AC15/AC16/AC21; E16 in AC18/AC19; S2 in AC13/AC14/AC16/AC17/AC18/AC19; S5 in
AC07/AC19; S6 in AC01/AC02; P1 in AC29/AC30; P2 in AC06; P3 in AC27/AC28) carry
a distinct per-record reason rather than a group label.

## 3. Every referenced procedure materialized / concretely defined - PASS

Referenced procedure identifiers are `E1`-`E23`, `S1`-`S6`, `P1`-`P3` (32
procedures). Every one has a defining entry in `case-manifest.json` `cases[]`
with a concrete `procedure` and `decisionRule`, and (for static cases) a
concrete `artifact` target. Every `coverage-map.json` `criteria[].procedures`
value resolves to one of those 32; no record points at an undefined procedure,
and every procedure maps back to at least one `AC`.

- `E1`-`E23`: visible-regression obligations placed on the implementation (brief
  scope 1-18; AC01-AC26, AC29). Declared `materializedBy: "implementation"` in
  `case-manifest.json` with an empty frozen `tests` list; **not** claimed to
  exist in the private bundle. The seam - the repository test suite run through
  `npm test` - exists and runs today (baseline in section 6). AC29 mandates that
  the implementation ship this visible deterministic coverage.
- `S1`-`S6`: static inspections of the frozen implementation source and skill
  material at the evaluated commit. Each names a repository region whose exact
  file layout is Design Map implementation freedom; the inspection question and
  decision rule are concrete regardless of location. Not a deferred "decide what
  to inspect later": the property to confirm is fixed now.
- `P1`: named command-exit checks (`npm test`, `npm run typecheck`,
  `npm run lint`, `npm run format:check`, `git diff --check`) plus the named
  pre-existing suites, each concrete now.
- `P2`: named `git diff` range from `6adae1e` (pre-Spike-012 base, `origin/main`
  tip `Spike 011: host-owned workflow runs (#20)`) over `spikes/003-*` through
  `spikes/011-*` and their `workflow.jsonl` timelines, concrete now.
- `P3`: named identity match on the bootstrap-authority identity
  `sha256:fa8168a3...c38b` in the Spike 012 evaluator freeze and verification
  result, concrete now.

No frozen case references a procedure identifier that has no definition.

## 4. No executable hidden test frozen; no evaluator-authored API invented - PASS

This revision freezes **no** evaluator-authored executable hidden test and no
helper script. The frozen Design Map "Implementation freedom" deliberately
leaves the internal authority representation, the status JSON shape, the private
repair-record format, executor command wiring, and the test fixture location as
implementation freedom, and states no public API beyond the existing
authority/status and workflow-run surfaces is required merely for evaluator
convenience; `spike.md` AC29 mandates visible deterministic regression coverage.
Freezing a hidden test would require inventing that surface, which evaluator v10
forbids. `.hidden-test/` contains only `manifest.json`, which records every case
with an empty `tests` list and the justification. Absence of executable hidden
coverage is recorded per case in `eval-spec.md` "Evaluation Cases" and
`case-manifest.json`.

## 5. Mandatory executable cases exercised under controlled pre-implementation conditions - PASS

Per evaluator v10, exercised only against a controlled pre-implementation
baseline; no candidate feature implementation exists.

- Positive control: at `6f46363`, `npm test` -> `tests 53 / pass 53 / fail 0`.
  The Node test runner and the `workflow authority` / `evaluator-integrity` CLIs
  execute through the same path the frozen `E1`-`E23` scenarios will use.
- Negative baseline: inspection of `tools/workflow.ts`,
  `tools/evaluator-integrity.ts`, `src/workflow-backend.ts`, and
  `skills/evaluator/SKILL.md` at `6f46363` confirms there is currently **no**
  `correction-cycle-opened` authority transition, **no**
  `evaluator-repair-recorded` transition (`authorityTransitions` lists twelve
  transitions, none for cycles or repair), **no** cycle-scoped authority state
  (`authorityState` answers PASS / promotion / As-Built / human decision only as
  spike-global facts), and **no** evaluator `repair` mode (the skill's
  `argument-hint` is `<prepare|verify> <spike-path>` and contract version is
  `10`). So `E1`-`E23` have real falsifying power once implemented: today none of
  these behaviours exists.
- Implementation-independence: `feat/spike-012` at `6f46363` contains, beyond the
  frozen brief / Brief Readiness feedback / Design Map / bootstrap pin /
  recorded dispatch-block manifest entries, only two narrow pre-`prepare`
  workflow-backend executor-CLI compatibility repairs (`src/workflow-backend.ts`
  Codex `--approve-for-me` flag rename, Claude `--` prompt separator, and
  preserving an immediate executor exit; `test/workflow-run.integration.test.ts`
  updated assertions), recorded in `manifest.md` "Bootstrap Exception - Runner-
  State Adoption Gap". These implement **no** Spike 012 acceptance criterion and
  were not read or used to shape any frozen case, requirement, or decision rule.
  No correction-cycle / evaluator-repair implementation commit exists.
- Failure-oracle confirmation on the existing path: the visible tests
  "authority preserves a complete PASS through human rejection", "a draft
  without a passing readiness attestation cannot reach a prepared state", and
  "a post-allocation evaluator-integrity failure is forward-only and preserves
  identities" run green and exercise the authority-transition,
  `validatePreparedMap`, and evaluator-integrity paths that `E2`-`E22` will
  extend; the Node test runner reports individual failures distinctly. The path
  compiles, runs, and reports for the intended reason.

## 6. Mandatory non-executable procedures concretely defined and resolvable - PASS

`S1`-`S6` (static) and `P1`-`P3` (provenance) each name the exact artifact
region or command and the specific property to confirm in `case-manifest.json`
and `eval-spec.md`. None defers "what will be inspected" until after candidate
exposure. Resolvability confirmed by performing each inspection's setup at
`6f46363`:

- `S1`, `S2`: `skills/evaluator/SKILL.md` read; the current text is the
  pre-implementation `prepare`/`verify` v10 contract the Spike 012 change
  extends with a `repair` mode.
- `S3`: `spikes/012-correction-cycles-evaluator-repair/bootstrap/` read;
  `evaluator-skill.md` is byte-identical to `skills/evaluator/SKILL.md`
  (`sha256:fa8168a3...c38b`) and `evaluator-authority.json` binds `evaluator`
  v10, source commit `b7f442ae`, and that identity. The dispatcher wiring for
  the two Spike 012 evaluator phases is the module the implementation adds/evolves.
- `S4`: Spike 012's `workflow.jsonl` currently holds two events (`brief-frozen`,
  `design-map-frozen`); `evaluation/**` does not yet exist. The property (no
  `correction-cycle-opened` / `evaluator-repair-recorded`, pinned-authority
  binding) is fixed now.
- `S5`, `S6`: `tools/workflow.ts` `authorityTransitions` / `authorityState` /
  `validateAuthority` read; the current spike-global model is the baseline the
  cycle-scoped derivation replaces.
- `P1`: all five validation commands run green at `6f46363` (section 9); the
  named workflow-authority, evaluator-integrity, host-owned workflow-run, and
  session/backend suites are present and green.
- `P2`: `git diff 6adae1e..6f46363 -- spikes/003-* spikes/007-* spikes/008-*
  spikes/009-* spikes/010* spikes/011-*` is empty; Spikes 003-011 are complete
  with promoted `evaluation/**` (where applicable) and terminal `workflow.jsonl`
  timelines untouched by `feat/spike-012`.
- `P3`: the bootstrap-authority identity `sha256:fa8168a3...c38b` is recorded in
  `bootstrap/evaluator-authority.json` and will be bound by `.eval/freeze.json`
  `bootstrapAuthority` and by the Spike 012 verification result.

## 7. Bidirectional traceability and bundle inventory - PASS

- Forward: each `AC01`-`AC30` maps to >=1 procedure in both
  `criterion-records.md` and `coverage-map.json`.
- Backward: each of `E1`-`E23`, `S1`-`S6`, `P1`-`P3` lists >=1 criterion in
  `case-manifest.json`. No orphan procedure.
- Cross-check: the `(criterion -> procedures)` relation in `coverage-map.json`
  equals the transpose of `case-manifest.json` `(case -> criteria)`.
- Mechanical structural validator: `tools/evaluator-integrity.ts`
  `prepareEvaluatorBundle` over the prepared AC coverage bundle (30 criteria, 32
  procedures, no material paths, five-file freeze inventory) returns
  `integrity.status` `PASS` with an empty `diagnostics` array and a readiness
  attestation whose `integrityValidation` is `PASS`. Recorded in
  `.eval/freeze.json` `integrityChecks` and `.eval/prepare-run.md`.
- Freeze inventory: `.eval/freeze.json` `artifacts` lists `eval-spec.md`,
  `criterion-records.md`, `case-manifest.json`, `.hidden-test/manifest.json`,
  and `pre-freeze-integrity-checklist.md` with their content identities. These
  are every file the frozen revision depends on (no hidden tests, no support
  code). `.eval/inventory.txt` is the path-sorted `sha256:<hex>  <relpath>`
  listing of exactly those five files; `readiness.privateInventoryIdentity`
  equals the SHA-256 of `.eval/inventory.txt`.
- `.eval/attempt-ledger.json` is initialized with an empty `attempts` array
  (`schemaVersion` 2); no verification attempt is allocated during `prepare`.

## 8. Public / private identity consistency - PASS

- `coverage-map.json` `readiness.evaluatorRevisionIdentity` equals the content
  identity of the formatted `.eval/freeze.json` for revision `001`.
- `coverage-map.json` `readiness.privateInventoryIdentity` equals the SHA-256 of
  `.eval/inventory.txt` (content-binding).
- `coverage-map.json` `readiness.validatorResultBinding` equals the SHA-256 of
  the canonical JSON
  `{"evaluatorRevision":"001","privateInventoryIdentity":<the content-binding
  identity above>,"integrity":{"status":"PASS","diagnostics":[]},
  "tool":"tools/evaluator-integrity.ts","contractVersion":10}` (no whitespace),
  binding the mechanical validator PASS to this revision and its content-bound
  inventory. The mechanical `tools/evaluator-integrity.ts` `prepareEvaluatorBundle`
  was also run directly and returned `integrity.status: "PASS"` with empty
  `diagnostics` and its own name-only identities `privateInventoryIdentity`
  `sha256:e5aac1d1d1c9e7b31ecf5ef42e3ef5469b6613b337449d59de8d702710cde7e4`
  and `validatorResultBinding`
  `sha256:737d9976bfd6512fba19b72eab5cd25bc5462c925e7c38ef34e0fac848f37188`;
  the readiness attestation uses the stronger content-binding inventory
  identity, and both are recorded in `.eval/freeze.json` `integrityChecks`.
- `coverage-map.json` `evaluationRequirements` equals the `eval-requirements.md`
  identity recorded in `.eval/freeze.json` `inputs.evaluationRequirements`.
- `coverage-map.json` has exactly one record per criterion named in
  `criterion-records.md`; `mode` families and `required` dispositions agree
  between the two.
- `eval-spec.md` records the same brief, Design Map, evaluator-skill, and
  revision identities as `.eval/freeze.json`, and records the bootstrap process
  exception.
- `readiness.integrityValidatedAt` is the preparation commit `6f46363`;
  `skillVersion` is `10`; `readiness.bootstrapAuthority` and
  `.eval/freeze.json` `bootstrapAuthority` bind `evaluator` v10 identity
  `sha256:fa8168a3...c38b` from source commit `b7f442ae`.

## 9. Repository validation at the preparation commit - PASS

| Command                | Result       |
| ---------------------- | ------------ |
| `npm test`             | pass (53/53) |
| `npm run typecheck`    | pass         |
| `npm run lint`         | pass         |
| `npm run format:check` | pass         |
| `git diff --check`     | clean        |

## 10. Freeze only after this checklist passes - PASS

All items above are PASS. `.eval/freeze.json` is written and its content
identity computed only after this point; the public `evaluation-prepared`
authority event is recorded only after the public checkpoint
(`eval-requirements.md`, `coverage-map.json`, `manifest.md`) is committed and
pushed and the committed `coverage-map.json` identity matches the value bound in
`.eval/prepare-run.md` and consistent with `.eval/freeze.json`.

## 11. Failed checklist keeps preparation pre-freeze - not triggered

No item failed. Had one failed, no `freeze.json` would be written, no
`evaluation-prepared` recorded, no evaluator revision created, no verification
attempt allocated, and preparation would remain an unfrozen draft.

## 12. No candidate implementation used - PASS

`feat/spike-012` at `6f46363` contains the frozen brief, Brief Readiness
feedback, Design Map, bootstrap pin, recorded evaluator-dispatch-block manifest
entries, and two narrow pre-`prepare` workflow-backend executor-CLI
compatibility repairs that implement no Spike 012 acceptance criterion. No
correction-cycle or evaluator-repair implementation commit exists; none was
read, executed, or used to construct or tune any criterion record, case,
decision rule, or the frozen evaluator bundle. Ordinary evaluator v10
post-implementation repair constraints (trace to frozen authority, preserve
prior revision, no implementation-shaped seam, two-correction threshold, and a
repeated preparation-integrity failure classified as a methodology /
evidence-model defect) apply unchanged once implementation begins. Because Spike
012's own evaluator cycle is pinned to the pre-implementation v10 contract, any
bootstrap evaluator correction would use only that v10 `verify`
post-implementation correction semantics, not the newly implemented `repair`
mode.
