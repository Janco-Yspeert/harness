# Spike 014 Manifest

## Run 001 — Design Map

- Skill: `design-map` v2
- Input: frozen `spike.md`
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  with committed provenance `55dfa7d032af847871d8786512281a8a1a0588a5`.
- Result: ready to freeze.
- Output: `design-map.md`.
- Repository evidence inspected: frozen brief and readiness result; `GOALS.md`;
  public authority ledger/runner, host-run, backend, and visible-test surfaces;
  and public prior Design Maps.
- Restricted evaluator material inspected: none.
- Checks: Design Map contract SHA-256, frozen brief SHA-256 and Git provenance,
  Design Map boundary review, and `git diff --check`.
- Measurement cutoff: immediately before this manifest update.

## Run 002 — Evaluator Preparation

- Skill: `evaluator` v11 (no bootstrap pin applies to this spike; executed
  directly under the plain working-tree `skills/evaluator/SKILL.md`,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`).
- Inputs: frozen `spike.md`
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  (canonical `brief-frozen` provenance `d69b1be4908e43ede4b4f5f1ce248411d063ca5b`)
  and frozen `design-map.md`
  `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`
  (canonical `design-map-frozen` provenance
  `1571bd108c8fa2c6a3a456c8a14aeb609e4ea9e3`).
- Result: prepared. 35 required criteria (AC01-AC35) each carry exactly one
  criterion evidence record across 15 evaluation procedures; pre-freeze
  structural integrity validation (`tools/evaluator-integrity.ts`) PASSED
  with 0 diagnostics; evaluator revision `001` frozen.
- Output: `eval-requirements.md`, `coverage-map.json` (public); private
  `eval-spec.md`, `case-manifest.json`, one evaluator-authored executable
  hidden regression test, and `.eval/freeze.json` under the Spike 014
  private evaluator workspace.
- Coverage summary: 1 mandatory executable hidden-test procedure (a
  pre-authored, implementation-independent Git-tree-identity regression
  control over prior, already-adjudicated spike directories); the remaining
  14 procedures rely on the implementation's own visible regression suite,
  manual source/data-model inspection, and 4 mandatory real-boundary proofs
  (attached execution, spawned execution, host-mediated publication,
  human-wait/resume), because the frozen Design Map's "Implementation
  freedom" section deliberately leaves nearly every underlying
  representation, storage, and API/transport as an implementation choice
  for this from-scratch kernel consolidation.
- Repository evidence inspected: frozen `spike.md` and `design-map.md`;
  `bootstrap/brief-readiness-replacement-001.md` and
  `bootstrap/evaluator-workspace-correction-001.md`; `AGENTS.md`; `GOALS.md`;
  the public authority ledger/runner (`tools/workflow.ts`), host-owned
  workflow-run surface (`src/workflow-run.ts`, `src/workflow-backend.ts`,
  `src/index.ts`), evaluator-integrity helper (`tools/evaluator-integrity.ts`),
  and visible test suite; prior spikes 010-013a's promoted evaluation
  artifacts and public authority ledgers, used both as structural precedent
  for this preparation's own artifacts and as the pinned fixture for the
  frozen `E1` hidden regression test.
- Restricted evaluator material inspected: none beyond this spike's own
  private evaluator preparation workspace under
  `harness-hidden/spikes/014-kernel-consolidation-authority-role-grants`
  (this spike's own `eval-spec.md`, `case-manifest.json`,
  `.hidden-test/**`, and `.eval/**`, all authored during this run). Before
  use, the effective protected workspace was confirmed limited to the
  public Harness repository plus that one private path;
  `HARNESS_EVALUATOR_HIDDEN_WORKSPACE` was unset and no other spike's
  private material was reachable, per
  `bootstrap/evaluator-workspace-correction-001.md`.
- Checks: evaluator skill contract SHA-256 (v11); frozen brief and Design
  Map SHA-256 and Git provenance; `tools/evaluator-integrity.ts` structural
  validation (PASS, 0 diagnostics, 35 criteria / 15 procedures); the sole
  executable hidden test run via `node --test` against the
  pre-implementation baseline with a positive result and a discarded
  negative control confirming the correct failure mode; `tsc --noEmit`,
  `eslint`, and `prettier --check` on that hidden test; full `npm test`
  (86/86), `npm run typecheck`, `npm run lint`, `npm run format:check`, and
  `git diff --check` at the preparation commit; committed public content
  identity of `eval-requirements.md` and `coverage-map.json` confirmed to
  match `.eval/freeze.json`; canonical `evaluation-prepared` recorded
  through the existing supported `workflow authority record` path.
- Measurement cutoff: immediately before this manifest update.

## Run 003 — Implementation attempt 1

- Skill: `implementation` v3,
  `sha256:bd10992f2d46103e603063230fe2c7dc150f876cee14e23b320a669312682605`.
- Authority: explicit human initiation of implementation only; stop after the
  pushed candidate and canonical attempt-1 implementation handoff. No evaluator
  verification or subsequent methodology phase was invoked.
- Starting branch: `feat/spike-014`; local and remote tips verified as exactly
  `3a6d5a2a0ce2ae47d792457e386683bb693f57c6` before implementation, with no
  pre-existing working-tree changes. Remote remained at that commit immediately
  before checkpoint publication.
- Inputs: frozen brief
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  (canonical provenance `d69b1be4908e43ede4b4f5f1ce248411d063ca5b`);
  frozen Design Map
  `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`
  (`1571bd108c8fa2c6a3a456c8a14aeb609e4ea9e3`); public prepared coverage
  `sha256:286b7ff910dcdf0e64eeb75f3ae35dd4b6f73cea43dd9ae107246046b8f0418a`
  (`62b40d748f29040c0c47ef9efe18cafebb3be915`, evaluator revision `001`);
  public evaluation requirements
  `sha256:0502c53027824586c18f6711e77774c5f34105363f3834633e5d9597974041b1`;
  `AGENTS.md`, `GOALS.md`, and the two public bootstrap scar records.
  Frozen content identities and committed provenance were verified.
- Result: implementation candidate ready for independent verification; no claim
  of independent PASS. Sixteen new visible kernel tests plus all 86 pre-existing
  tests pass. No unrelated failure was repaired.
- Outputs: configured governed-execution kernel, eight Harness policy/contracts,
  authenticated attached/spawned host protocol, immutable authority grants,
  durable provenance and retry lineage, separate result/action dimensions,
  bounded root authority and same-execution human wait/resume, actual
  host-mediated local Git publication, and non-authoritative telemetry/selection
  seams. Obsolete execution is demoted to explicit historical replay; the old
  role table and duplicate ledger parser are removed.
- Output content identity before this manifest entry:
  `sha256:76ae3a852f45db02aa863f7a740786db9ec89e172fa0f78ec08f7adb2ada00a1`
  over the staged `git diff --cached --binary` against the starting commit.
  This excludes the manifest update itself and the later canonical handoff.
- Report: `implementation.md` identifies the seven normal kernel-path files,
  host/CLI integration, configured methodology adapter, executor-selection seam
  (`src/kernel/model.ts`, `src/kernel/execution.ts`), persisted schema versions
  (`src/kernel/model.ts`, version 1), operational instructions, and limitations.
- Visible proofs: `test/kernel.test.ts` and
  `tools/fixtures/governed-executor.ts`; retained public snapshots in
  `implementation-proofs/attached/` and `implementation-proofs/spawned/`.
  The two real-process scenarios exercise all four mandatory boundaries through
  HTTP. Their preserved ledger/evidence content identities were checked.
- Checks: `npm test` PASS (102/102, zero skipped); `npm run typecheck` PASS;
  `npm run lint` PASS; `npm run format:check` PASS; `git diff --check` and
  `git diff --cached --check` PASS. The retained-proof rerun passed 2/2 outside
  the sandbox after a sandboxed invocation could not start. Final staged diff,
  frozen-input preservation, and absence of unrelated/historical changes were
  reviewed. No evaluator-private or promoted evaluation material is included.
- Restricted evaluator material inspected: none. Synthetic private-exposure
  fixtures contain only repository-authored test data. Live provider attachment,
  external-network publication, evaluator verification, As-Built, acceptance,
  and Outcome were not run. Recovery marks unrecoverable work interrupted;
  full process resurrection and dynamic executor routing remain out of scope.
- Measurement cutoff: immediately before this final implementation manifest
  update; commit, push, handoff recording, and response activity are excluded.

## Run 004 — Evaluator Verification attempt 1

- Skill: `evaluator` v11 (no bootstrap pin applies to this spike; executed
  directly under the plain working-tree `skills/evaluator/SKILL.md`,
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`).
- Authority: independent verification of the exact allocated candidate,
  canonical `implementation-handoff` attempt 1,
  `309d87ba2e1833c0bb9dade338794ec863a3d2df`, against frozen evaluator
  revision `001`.
- Inputs: frozen brief
  `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  (`d69b1be4908e43ede4b4f5f1ce248411d063ca5b`); frozen Design Map
  `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`
  (`1571bd108c8fa2c6a3a456c8a14aeb609e4ea9e3`); public prepared coverage
  `sha256:286b7ff910dcdf0e64eeb75f3ae35dd4b6f73cea43dd9ae107246046b8f0418a`
  (`62b40d748f29040c0c47ef9efe18cafebb3be915`); public evaluation
  requirements `sha256:0502c53027824586c18f6711e77774c5f34105363f3834633e5d9597974041b1`.
  All frozen content identities and Git provenance were re-verified against
  the candidate commit at verification time; no drift was found.
- Result: **PASS**. All 35 required acceptance criteria (AC01-AC35), across
  15 frozen evaluation procedures (1 executable hidden regression, 11
  visible-regression/manual-inspection procedures, 3 mandatory live
  real-boundary proofs), were independently evaluated and satisfied.
  Canonical `verification-finalized: PASS` recorded with per-criterion
  `coverageResults` for all 35 required criteria.
- Checks performed: the sole frozen executable hidden test run directly
  against the candidate (2/2 pass); full public visible suite `npm test`
  (102/102 pass); the new Spike-014 visible suite alone (16/16 pass);
  `npm run typecheck` (0 errors); `npm run lint` (0 errors); `npm run
  format:check` (pass); `git diff --check` on the candidate commit (clean);
  all four mandatory real-boundary proofs (attached execution, spawned
  execution, host-mediated local bare-remote publication, human
  wait/resume) independently exercised end to end through the real
  supported host/process/Git boundaries in this verification session, not
  merely reviewed from committed evidence; manual source/data-model/schema
  inspection of the implementation's identified normal kernel path for
  portability, configured-policy, executor-selection, and schema-version
  requirements.
- Evaluator integrity: frozen evaluation bundle unmodified and re-hashed
  identical to its frozen/archived identities; no specification drift; no
  evaluator defect; no evaluator correction performed this cycle.
- Diagnostics: one non-mandatory, informational finding was recorded and
  root-caused to an evaluation-session-local environment variable
  unrelated to the candidate implementation; it did not affect the Overall
  Result (full suite re-confirmed 102/102 pass with that variable absent,
  consistent with the candidate's own independently reported
  implementation-time test run).
- Promotion: canonical `promotion-recorded`. The complete evidence chain
  (private attempt ledger, immutable attempt result, evaluator revision
  `001` freeze metadata and full frozen bundle) was promoted unchanged to
  `evaluation/` under this spike, with recomputed content identities
  matching their source identities exactly.
- Restricted evaluator material inspected: this spike's own private
  evaluator-verification workspace only
  (`eval-spec.md`, `case-manifest.json`, `.hidden-test/**`, `.eval/**`),
  confirmed limited to the public Harness repository plus that one private
  path before use.
- Measurement cutoff: immediately before this manifest update; the
  promotion commit/push and any later human-acceptance activity are
  excluded.

## Run 005 — As-Built

- Skill: `as-built` (active repository contract).
- Authority: canonical verification attempt `1` has `PASS` and promotion is
  recorded; this record reconstructs the exact implementation candidate
  `309d87ba2e1833c0bb9dade338794ec863a3d2df` before the human acceptance gate.
- Inputs inspected: the frozen `spike.md` and `design-map.md`, candidate diff
  from the prepared pre-implementation revision, normal kernel and configured
  methodology surfaces, visible kernel tests and retained real-boundary proof
  records, public implementation handoff, and the promoted public verification
  result. No unpromoted evaluator-private material was accessed.
- Result: `as-built.md` reports `ALIGNED`; no Missing, Contradictory, or Extra
  material behavior or structure was identified. It records the retained
  legacy boundary and the absence of a production Claude adapter as factual
  implementation limits, not evaluator findings.
- Checks: candidate reachability from the current branch, public promoted PASS
  provenance, exact frozen public identities, candidate diff inventory, and
  working-tree `git diff --check` before this manifest update.
- Measurement cutoff: immediately before this manifest update; commit, push,
  canonical `as-built-recorded`, and human-acceptance activity are excluded.


## Run 006 — Human Acceptance Review

- Authority: explicit human acceptance decision after canonical verification
  attempt `1` PASS, promotion, and As-Built.
- Result: **REJECTED / SUCCESSOR REQUIRED**. The technical PASS remains genuine
  historical evidence and was not reclassified.
- Public decision artifact: `acceptance.md`.
- Human rejection classifications: `IMPLEMENTATION_GAP` and
  `EVALUATOR_COVERAGE_DEFECT`.
- Material implementation findings: configured evaluator-result vocabulary and
  cross-field semantics drift from the active methodology; allocation can
  misreport a non-equivalent in-flight Role Grant as a duplicate; host-owned
  automatic continuation can swallow an HTTP non-success without durable
  stop/escalation evidence.
- Evaluator finding: revision `001` did not include negative cases that would
  falsify those three defects, so its 35/35 PASS remains valid against the frozen
  evaluator but insufficient for human acceptance.
- Non-blocking deferred concerns recorded in `acceptance.md`: concentrated
  readability/conditional complexity in the execution/host surfaces, the
  PID-only stale-lock edge case, and broader provider/routing/transport cleanup.
- Disposition: do not reopen Spike 014 as a normal correction cycle. Preserve
  its complete evidence chain. A separately authored successor brief now exists
  at `spikes/014a-kernel-hardening-authority-cutover/spike.md`; requirements
  introduced there beyond the rejection findings are new successor scope, not
  retroactive Spike 014 failures.
- Canonical authority: `human-rejected` recorded after `as-built-recorded`.
