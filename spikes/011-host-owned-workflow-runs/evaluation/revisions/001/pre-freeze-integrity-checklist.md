# Spike 011 pre-freeze integrity checklist - evaluator revision 001

Evaluator v10 step 4 requires a deterministic pre-freeze integrity validation
over the candidate evaluator bundle before the private revision is frozen and
before `evaluation-prepared` is recorded. No process exception applies: the
frozen `spike.md` bootstrap exception covers only the Spike 011 workflow runner
dispatch path, not this evaluator preparation.

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
`evaluation-prepared` is recorded. No Spike 011 implementation exists at the
preparation commit.

Preparation commit: `52dc78e6654fc53fba466a5003a40fb22f56ac18` (`feat/spike-011`).

This checklist contains no literal `.eval/freeze.json` identity and no literal
identity of itself; it states relational properties so the freeze inventory has
no circular dependency.

## Candidate bundle

| File                                | Identity                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `eval-spec.md`                      | `sha256:4d94c8b42a18ff9f80b93a43753bc56d2ee999a439afc0edd6bbb0895f0708e0` |
| `criterion-records.md`              | `sha256:d6d47aabb85e47186cd1086cdf64ddfbfb2b61302ac0d4056349714ccddddd21` |
| `case-manifest.json`                | `sha256:70a995a7604802cab4d598bc69c7211fecf6b380a3f8580c028db813603150d1` |
| `.hidden-test/manifest.json`        | `sha256:838c2ddc0c6010bc634a58854b16a876bfb57b34e15301f34940d5197ad3cb05` |
| `pre-freeze-integrity-checklist.md` | this document                                                          |

Frozen inputs: `spike.md`
`sha256:ba7f7c0a2110e6bb5e144d5c9596e2ced5464d562c373db34e0bd1be1a580455`
(`9af63ce`); `design-map.md`
`sha256:22f01566e2c34a3e9a0b98a5e47a78310a4d8351c17307d8c5c23f4c68f0a97b`
(`3689964`); `eval-requirements.md`
`sha256:16766fafeba18217e5a97b90de97079ab0447878b919705381a6f397fa9f9af7`.

## 1. Criterion completeness - PASS

`criterion-records.md`, `case-manifest.json` (union of `cases[].criteria`), and
`coverage-map.json` (`criteria[].id`) each contain exactly the 21 identifiers
`AC01`-`AC21`, one per numbered acceptance criterion in `spike.md` section
"Acceptance Criteria". No criterion is missing; no id is duplicated.
`readiness.criterionRecordCount` is `21` and equals the record count.

## 2. One criterion-specific evidence record with a sufficiency reason - PASS

Each `AC` record in `criterion-records.md` and in `coverage-map.json` carries
`id`, a frozen-authority source (acceptance criterion number plus cited
`spike.md` scope section and/or Design Map section), an evidence `mode`,
`required` (`true`), referenced `procedures`, and a `sufficiency` written
specifically for that criterion. Spot-checked that no two `sufficiency` strings
are copy-identical and that each names the property its referenced procedures
establish for that criterion. Procedures shared across records (E1 in three
records, E2 in two, E5 in two, E7 in two, E10 in four, S1 in two, S2 in three,
S3 in two, S4 in two, P1 in two) carry a distinct per-record reason rather than
a group label.

## 3. Every referenced procedure materialized / concretely defined - PASS

Referenced procedure identifiers are `E1`-`E12`, `S1`-`S4`, `P1`, `P2`. Every
one has a defining entry in `case-manifest.json` `cases[]` with a concrete
`procedure` and `decisionRule`, and (for static cases) a concrete `artifact`
target. Every `coverage-map.json` `criteria[].procedures` value resolves to one
of `E1`-`E12`, `S1`-`S4`, `P1`; no record points at an undefined procedure.
`P2` establishes negative requirement `N8` and is deliberately not referenced by
any `coverage-map.json` criterion record (it is not a numbered acceptance
criterion).

- `E1`-`E12`: visible-regression obligations placed on the implementation (brief
  scope 1-11; AC01-AC09, AC11-AC20). Declared `materializedBy: "implementation"`
  in `case-manifest.json` with an empty frozen `tests` list; **not** claimed to
  exist in the private bundle. The seam - the repository test suite run through
  `npm test` - exists and runs today (baseline in section 6). AC20 mandates that
  the implementation ship this visible coverage.
- `S1`-`S4`: static inspections of the frozen implementation source at the
  evaluated commit. Each names a repository region whose exact file layout is
  Design Map implementation freedom, so the artifact reference is "the module
  the implementation adds / evolves"; the inspection question and decision rule
  are concrete regardless of location. This is not a deferred "decide what to
  inspect later": the property to confirm is fixed now.
- `P1`: named command-exit checks (`npm test`, `npm run typecheck`,
  `npm run lint`, `npm run format:check`, `git diff --check`) plus the named
  pre-existing session/backend suites, each concrete now.
- `P2`: named `git diff` range over `spikes/008-*` through `spikes/010c-*` and
  their `workflow.jsonl` timelines, concrete now.

No frozen case references a procedure identifier that has no definition.

## 4. No executable hidden test frozen; no evaluator-authored API invented - PASS

This revision freezes **no** evaluator-authored executable hidden test and no
helper script. The frozen Design Map ("Implementation freedom") deliberately
leaves route names, JSON field spellings, UUID format, internal registry/backend
classes, log storage representation, and the duplicate-allocation
`200`-vs-conflict choice free; freezing a hidden test would require inventing
that surface, which evaluator v10 forbids. `.hidden-test/` contains only
`manifest.json`, which records every case with an empty `tests` list and the
justification. Absence of executable hidden coverage is recorded per case in
`eval-spec.md` "Evaluation Cases" and `case-manifest.json`.

## 5. Mandatory executable cases exercised under controlled pre-implementation conditions - PASS

Per evaluator v10, exercised only against a controlled pre-implementation
baseline; no candidate implementation exists.

- Positive control: at `52dc78e`, `npm test` -> `tests 42 / pass 42 / fail 0`.
  The Node test runner and the `workflow authority` / `evaluator-integrity` CLIs
  execute through the same path the frozen E1-E12 scenarios will use.
- Negative baseline: inspection of `src/index.ts`, `src/session-backend.ts`,
  `src/pty-backend.ts`, and `tools/workflow.ts` at `52dc78e` confirms there is
  currently **no** host-owned workflow-run registry, **no** workflow-run HTTP
  surface, **no** normalized workflow lifecycle events, and **no** workflow
  backend/factory seam, and that `tools/workflow.ts` still directly `spawn`s
  detached child processes in `launch()` with `{ detached: true }` and
  `child.unref()`. So E1-E12 have real falsifying power once implemented: today
  none of these behaviours exists.
- Implementation-independence: `feat/spike-011` contains only the frozen brief,
  Brief Readiness feedback, Design Map, the recorded evaluator-prepare bootstrap
  failure, and this preparation checkpoint. No implementation commit exists;
  none was executed or inspected to shape any frozen case, requirement, or
  decision rule.
- Failure-oracle confirmation on the existing path: the visible tests
  "workflow runner independently numbers verification attempts",
  "execute records a detached job and cancel terminates it",
  "broadcasts one closed lifecycle envelope to every live observer", and
  "creates, detaches, and reattaches to the same shell state" run green and
  exercise the session-lifecycle, event-stream, and workflow-dispatch paths
  that E1, E4-E9 will extend; the Node test runner reports individual failures
  distinctly. The path compiles, runs, and reports for the intended reason.

## 6. Mandatory non-executable procedures concretely defined and resolvable - PASS

`S1`-`S4` (static) and `P1`-`P2` (provenance) each name the exact artifact
region or command and the specific property to confirm in `case-manifest.json`
and `eval-spec.md`. None defers "what will be inspected" until after candidate
exposure. Resolvability confirmed by performing each inspection's setup at
`52dc78e`:

- `S1`-`S4`: `src/index.ts`, `src/session-backend.ts`, `src/pty-backend.ts`,
  `src/codex-backend.ts`, and `tools/workflow.ts` read; the current text is the
  pre-implementation baseline the Spike 011 change extends. The properties to
  confirm (host-owned registry, bounded permission profile recorded on the run,
  dispatch inversion, structured-event reuse) are fixed now; the modules that
  carry them will exist after implementation.
- `P1`: all five validation commands run green at `52dc78e` (section 9); the
  named session/backend suites are present and green.
- `P2`: `git log` shows Spikes 008-010c are complete with promoted
  `evaluation/**` and terminal `workflow.jsonl` timelines; `git diff` over those
  paths against the current commit is empty (no Spike 011 change has touched
  them).

## 7. Bidirectional traceability and bundle inventory - PASS

- Forward: each `AC01`-`AC21` maps to >=1 procedure in both
  `criterion-records.md` and `coverage-map.json`.
- Backward: each of `E1`-`E12`, `S1`-`S4`, `P1` lists >=1 criterion in
  `case-manifest.json`; `P2` lists negative requirement `N8`. No orphan
  procedure.
- Cross-check: the `(criterion -> procedures)` relation in `coverage-map.json`
  equals the transpose of `case-manifest.json` `(case -> criteria)` restricted
  to `E1`-`E12`, `S1`-`S4`, `P1`.
- Mechanical structural validator: `tools/evaluator-integrity.ts`
  `prepareEvaluatorBundle` over the prepared AC coverage bundle returns
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
- `.eval/attempt-ledger.json` is initialized with an empty `attempts` array; no
  verification attempt is allocated during `prepare`.

## 8. Public / private identity consistency - PASS

- `coverage-map.json` `readiness.evaluatorRevisionIdentity` equals the content
  identity of the formatted `.eval/freeze.json` for revision `001`.
- `coverage-map.json` `readiness.privateInventoryIdentity` equals the SHA-256 of
  `.eval/inventory.txt`.
- `coverage-map.json` `readiness.validatorResultBinding` equals the SHA-256 of
  the canonical JSON
  `{"evaluatorRevision":"001","privateInventoryIdentity":<the content-binding
  identity above>,"integrity":{"status":"PASS","diagnostics":[]},
  "tool":"tools/evaluator-integrity.ts","contractVersion":10}` (no whitespace),
  binding the mechanical validator PASS to this revision and its content-bound
  inventory. The mechanical `tools/evaluator-integrity.ts`
  `prepareEvaluatorBundle` was also run directly and returned
  `integrity.status: "PASS"` with empty `diagnostics` and its own name-only
  identities `privateInventoryIdentity`
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
  revision identities as `.eval/freeze.json`.
- `readiness.integrityValidatedAt` is the preparation commit; `skillVersion` is
  `10`; no `bootstrapException` field is present (none applies).

## 9. Repository validation at the preparation commit - PASS

| Command                | Result       |
| ---------------------- | ------------ |
| `npm test`             | pass (42/42) |
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

`feat/spike-011` contains only the frozen brief, Brief Readiness feedback,
Design Map, the recorded evaluator-prepare bootstrap failure (`manifest.md` Run
003), and this preparation checkpoint. No implementation commit exists; none was
read, executed, or used to construct or tune any criterion record, case,
decision rule, or the frozen evaluator bundle. Ordinary evaluator v10
post-implementation repair constraints (trace to frozen authority, preserve
prior revision, no implementation-shaped seam, two-correction threshold, and a
repeated preparation-integrity failure classified as a methodology /
evidence-model defect) apply unchanged once implementation begins.
