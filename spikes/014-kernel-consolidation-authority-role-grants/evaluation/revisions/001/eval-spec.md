# Evaluation Specification

## Status

Frozen.

## Source

- Spike path: `spikes/014-kernel-consolidation-authority-role-grants`
- Project commit at preparation: `3543159` (branch `feat/spike-014`)
- `spike.md`: `sha256:35aa888c5bb12209e675b90bb40f54d2f31126cc0e9bc0e3cb289737fadd170e`
  (frozen at `ced63aea6bd6847c433f75f3dda6ebb3458f4586`, canonical `brief-frozen`
  recorded at `d69b1be4908e43ede4b4f5f1ce248411d063ca5b`)
- `design-map.md`: `sha256:848a79c193f809a5252f94dbc1ec0ee605aa7ea63cb6034884bd7c72225988f9`
  (canonical `design-map-frozen` recorded at `1571bd108c8fa2c6a3a456c8a14aeb609e4ea9e3`)
- `eval-requirements.md`: content identity recorded in `.eval/freeze.json`
- Canonical evaluator skill: `skills/evaluator/SKILL.md`
- Evaluator skill name / contract version: `evaluator` v11
- Evaluator skill content identity:
  `sha256:5dea02ee0b1219e0bb954e52bbc3525c2d806d594d3094d44b25ed15e060a802`
- Evaluation revision identity: content identity of the formatted
  `.eval/freeze.json` for revision `001`

### No pinned bootstrap evaluator authority applies to Spike 014

`tools/workflow.ts`'s `bootstrapAuthority()` special-cases only
`012-correction-cycles-evaluator-repair` and
`013a-Workflow-execution-friction`. It returns `undefined` for
`014-kernel-consolidation-authority-role-grants`. This preparation therefore
executes directly under the plain working-tree `skills/evaluator/SKILL.md`
(confirmed by direct `sha256sum` above), not a separately pinned snapshot.
This is recorded here, rather than silently assumed, because two prior
Spike 014 preparation attempts were cancelled/blocked over exactly this kind
of protected-workspace configuration question (see
`bootstrap/evaluator-workspace-correction-001.md`).

### Protected evaluator workspace confirmed at preparation

Per `bootstrap/evaluator-workspace-correction-001.md`, this preparation's
effective workspace was confirmed, before use, to be limited to: (1) the
public Harness repository workspace; and (2) the Spike 014 private evaluator
workspace
(`harness-hidden/spikes/014-kernel-consolidation-authority-role-grants`).
`env | grep -i HARNESS` at preparation time shows only
`HARNESS_EVALUATOR_WORKSPACE` set to that exact path;
`HARNESS_EVALUATOR_HIDDEN_WORKSPACE` is unset. `ls harness-hidden/spikes`
shows exactly one entry, `014-kernel-consolidation-authority-role-grants`; no
other spike's private material is reachable. No Spike 013a (or any other
spike's) private path appears in this preparation's effective grant.

## Pre-Freeze Integrity Gate

Recorded before Status was set to Frozen.

- Shared helpers: none. The sole executable hidden test
  (`.hidden-test/prior-spike-history-and-011-boundary-preserved.test.ts`)
  is self-contained; it uses only `node:assert/strict`,
  `node:child_process.spawnSync`, and `node:test`, following the same
  CLI-invocation pattern the existing public `test/workflow.test.ts` already
  uses. No evaluator-authored helper module exists to validate separately.
- Mandatory executable case (E1): run directly with `node --test <file>`
  against the unimplemented baseline at project commit `3543159` before
  freeze. Both subtests PASS, as they must for a fact that has not yet been
  touched (the pinned Git tree identities are exactly the current committed
  identities). A negative control was performed: a temporary copy of the
  test with one deliberately wrong pinned identity (for
  `spikes/011-host-owned-workflow-runs`) was executed with
  `node --test` and confirmed to FAIL with the exact intended assertion
  message ("tree identity changed (expected
  0000000000000000000000000000000000000a, got
  a978c6b1d03a8590a02960b1e655debf3ec2bc09)"), then discarded (never
  committed to any tracked location). No candidate implementation exists at
  freeze time; nothing about this test was shaped by candidate behavior. The
  test file typechecks with 0 errors under the project's own `tsc --noEmit`
  (verified by temporarily copying it into `test/` so it resolves under the
  repository's `"type": "module"` `package.json`, running `npx tsc --noEmit`,
  then removing the temporary copy and re-confirming `git status --porcelain`
  is clean of it) and is Prettier-formatted (`npx prettier --check`).
- Mandatory non-executable cases (PR1-PR11 except the manual component of
  PR2/PR8; LB1-LB3): each names a concrete decision rule, required durable
  evidence, and frozen-authority citation in `case-manifest.json`. None
  defers "what will be inspected" until after candidate exposure. LB1-LB3
  additionally fix, before implementation, the exact fixture/proof
  properties spike.md itself specifies in "Minimum reproducible proof
  protocol", "Required bounded publication environment", and "Required
  bounded proof" - this specification does not invent those properties, it
  cites them directly.
- Manual-inspection components (PR2's AC06/AC07 component; PR8/AC31; PR10's
  data-model component; PR11's schema-version component): each has a
  concrete, frozen decision rule (see `case-manifest.json`) that does not
  depend on knowing the eventual file layout; it depends only on the
  implementation's own As-Built/implementation report identifying which
  files constitute the normal kernel path (TR2, evaluator assumption A2).
  This defers *where to look*, not *what counts as a violation* - the
  violation criteria (hard-coded phase/role conditionals, a
  `ROLE_CONTRACTS`-shaped table, fixed `skills/<role>/SKILL.md` resolution,
  Spike-specific bootstrap branches, hard-coded Harness phase names, missing
  schema/version fields, an unextendable executor-selection assumption) are
  all fixed now, verbatim from spike.md's own text.
- Runtime assumptions validated at commit `3543159`: Node `v22.23.2` (the
  environment's actual available runtime; repository `engines` states
  `>=24.12.0`, noted as an environment limitation in
  `eval-requirements.md` "Environment Requirements", not a defect this
  evaluation can remedy); `npm test` 86/86 passing; `npm run typecheck`,
  `npm run lint`, `npm run format:check`, and `git diff --check` each exit 0
  (confirmed by direct execution, not by inspection alone).
- Harness parse/compile/execute: `tools/evaluator-integrity.ts` executes
  against the assembled bundle derived from `case-manifest.json` and
  `coverage-map.json` with `integrity.status: "PASS"` and no diagnostics
  (recorded in `.eval/freeze.json` `integrityChecks`).

## Explicit Requirements

Sources are the frozen `spike.md` acceptance criteria AC01-AC35 and the
frozen Design Map. Existing behavior and tests are evidence, not automatic
requirements. Each explicit requirement below is numbered `ER<NN>` to match
`AC<NN>` one-to-one; this avoids colliding with spike.md's own "R1"-"R7"
regression-scenario labels, which are referenced by name ("Scar R1", etc.)
throughout this document.

- **ER01** Governed methodology progression for a workflow has one backing
  ledger and one authority-resolution path. (AC01)
- **ER02** Deleting/recreating local `.workflow` operational state does not
  change the next legally eligible methodology role. (AC02; Scar R2)
- **ER03** A fresh runner derives the correct next action from canonical
  authority and configured methodology, without fabricating historical
  dispatch. (AC03; Scar R2)
- **ER04** A state equivalent to the Spike 013a scar (canonical verification
  PASS, promotion complete, an operational evaluator run blocked by a later
  publication failure) still permits As-Built when configured policy says
  PASS/promotion are sufficient. (AC04; Scar R1)
- **ER05** Workflow execution binds an exact content-addressed Methodology
  Definition. (AC05)
- **ER06** Harness's SDLC role ordering/eligibility is loaded as methodology
  configuration rather than intrinsic kernel phase logic. (AC06)
- **ER07** The governed Harness roles resolve deterministic contracts
  through methodology/project configuration rather than a kernel
  `ROLE_CONTRACTS` table. (AC07)
- **ER08** Changing a methodology definition does not silently reinterpret a
  Workflow Execution Grant already bound to an older definition. (AC08)
- **ER09** Human instruction to run/continue creates or binds explicit
  workflow-level execution authority with bounded continuation scope. (AC09)
- **ER10** Inspection/status/observation does not create execution
  authority or allocate a role. (AC10)
- **ER11** Every governed execution is bound to one exact immutable Role
  Grant derived from canonical authority and the pinned methodology. (AC11)
- **ER12** Provider or orchestrator text cannot grant itself a governed
  role. (AC12)
- **ER13** A newly spawned executor runs under an inspectable Role Grant.
  (AC13)
- **ER14** An already-running eligible session performs at least one real
  governed role under a Harness-issued Role Grant without spawning a
  replacement provider process for that role. (AC14)
- **ER15** Harness mechanically records evaluator-private exposure when it
  grants that access to a session/execution identity. (AC15; Scar R4)
- **ER16** Removing the private workspace grant does not erase the recorded
  exposure. (AC16; Scar R4)
- **ER17** A clean session may be implementation-eligible; the same policy
  denies implementation to a session that has seen evaluator-private
  material. (AC17; Scar R4)
- **ER18** Process state, semantic role result, methodology result, and
  host-action result are independently observable. (AC18; Scar R5)
- **ER19** A publication failure after a successful semantic role result
  does not retroactively turn that semantic result into failure. (AC19;
  Scar R5)
- **ER20** An authorized executor can request publication of an exact
  commit and Harness validates and publishes it using host-owned
  credentials. (AC20)
- **ER21** The governed publication proof succeeds without requiring the
  role executor to possess direct Git remote/network credentials. (AC21)
- **ER22** A human can issue a bounded forward-only authority decision
  through one generic mechanism without Spike-specific kernel code. (AC22;
  Scar R7)
- **ER23** A root-authority decision cannot mutate prior Role Grants, delete
  blocked runs, or rewrite earlier semantic results. (AC23)
- **ER24** A real governed execution can enter a structured
  waiting-for-human state without terminating or consuming a replacement
  execution. (AC24; Scar R6)
- **ER25** After a permitted human response, the same execution identity
  resumes and reaches a later terminal semantic result. (AC25; Scar R6)
- **ER26** If the human response grants new permission, the execution
  cannot use it until that permission is recorded in canonical authority.
  (AC26; Scar R6)
- **ER27** Repeated or concurrent continuation requests for the same
  canonical basis do not allocate duplicate equivalent Role Grants/
  executions. (AC27; Scar R3)
- **ER28** Where policy permits a retry/replacement, the new execution has a
  distinct identity and explicit lineage to the prior execution. (AC28)
- **ER29** A caller can later inspect/await the same execution by stable
  identity after the initiating caller disconnects. (AC29)
- **ER30** The model can preserve an execution as interrupted/lost after
  host recovery rather than treating it as nonexistent. (AC30)
- **ER31** The normal authority/execution kernel does not intrinsically
  depend on `spikes/<id>`, fixed skill paths, or Harness-specific role
  names. (AC31)
- **ER32** Kernel lifecycle and host-action operations emit or expose
  telemetry through a non-authoritative seam correlated to stable
  execution/grant identities. (AC32)
- **ER33** Unavailable provider usage data does not invalidate otherwise
  successful governed work. (AC33)
- **ER34** The Role Grant/execution architecture leaves an explicit seam for
  future provider/model/reasoning/usage-aware selection without changing
  methodology authority semantics. (AC34)
- **ER35** New durable grant/result/authority/action structures introduced
  by this spike have explicit schema/version identities where applicable.
  (AC35)

## Derived Invariants

- **I1** Fresh resolution from the Authority Ledger and pinned Methodology
  Definition yields the same legal next action regardless of local runner
  history; canonical PASS and promotion can therefore satisfy an As-Built
  policy predicate despite a separate later operational/publication
  failure. (Design Map "Invariants" bullet 1; underlies ER01-ER04)
- **I2** Durable identities distinguish project/workspace, Methodology
  Definition, Workflow Execution Grant, authority basis, Role Grant,
  execution/session, result, host action, and replacement/correction
  lineage; new persisted forms carry explicit schema versions; handles
  remain inspectable after caller disconnect; unrecoverable post-restart
  work is represented as interrupted/lost, never absent. (Design Map
  "Invariants" bullet 2; underlies ER09, ER11, ER27-ER30, ER35)
- **I3** Resolver and allocation mechanics are portable: project
  configuration supplies locations and methodology content; provider
  adapters supply executor capabilities; telemetry is emitted/correlated
  through a non-authoritative, failure-tolerant seam and cannot determine
  methodology authority. (Design Map "Invariants" bullet 3; underlies ER06,
  ER07, ER31-ER34)
- **I4** The implementation must prove the public protocol with real host
  boundaries: a pre-existing external fixture attached under a Role Grant, a
  spawned grant, a local bare-remote host publication, and one wait/resume
  of the same execution. Test doubles may cover deterministic mechanics but
  cannot replace those proofs. (Design Map "Invariants" bullet 4; underlies
  ER13, ER14, ER20, ER21, ER24-ER26)

## Negative Requirements

- **N1** No phase-specific adoption workaround satisfies ER02/ER03; the fix
  must be structural. (spike.md "Scope" §2 "Required consequence")
- **N2** The kernel must not need conditionals such as `if role ===
  "as-built"`, `if spike === "013a"`, or
  `if classification === "EVALUATOR_COVERAGE_DEFECT"` unless those concepts
  are supplied as configured data interpreted generically. (spike.md "Scope"
  §4)
- **N3** No kernel-level `ROLE_CONTRACTS`-shaped constant table for the
  eight migrated roles; concrete role-contract lookup must be supplied
  through methodology/project configuration. (spike.md "Simplification
  requirements" #3)
- **N4** Canonical authority interpretation must have one implementation
  path, not separate CLI and host interpretations that can disagree.
  (spike.md "Simplification requirements" #4)
- **N5** Provider prose remains diagnostic, not authority. (spike.md
  "Simplification requirements" #5)
- **N6** Prior truthful blocked/failure history remains preserved; deleting
  or recreating local `.workflow` operational state must not change what
  methodology role is legally eligible next, and root authority must not
  rewrite it. (spike.md "Simplification requirements" #6; "Scope" §1
  "Required consequence")
- **N7** Bootstrap execution for this very spike (the current Codex-driven
  Brief Readiness / Design Map / evaluator-preparation cycle, including this
  preparation) must not be treated as evidence that the new kernel satisfies
  Spike 014; it must not fabricate Role Grants, Workflow Execution Grants,
  execution provenance, or other Spike 014 concepts before they are actually
  implemented. (spike.md "Process-execution bootstrap")
- **N8** The implementation must not expose evaluator-private evidence to
  implementation-capable sessions, make protected evaluator roles generally
  model-invocable, weaken criterion coverage integrity, convert PASS into a
  provider-exit heuristic, or erase the public/private evidence distinction.
  (spike.md "Evaluator boundary")
- **N9** A root-authority event must not falsify a prior semantic result,
  rewrite a blocked run into success, delete historical evidence, alter an
  immutable old Role Grant, or retroactively reinterpret an old Methodology
  Definition. (spike.md "Scope" §15; underlies ER23)
- **N10** Spike 014 must not add compatibility machinery merely to force
  Spike 011 Cycle 002 to continue, and must not resume/advance it before
  Spike 014 is accepted. (spike.md "Spike 011 Cycle 002")

## Evaluation Cases

All cases are mandatory (`required: true`); spike.md defines no optional
acceptance criteria for Spike 014. Full procedure text, fixture properties,
and decision rules for every case are frozen in `case-manifest.json`
(private) and mirrored, without hidden mechanics, in the public
`coverage-map.json`. Summary:

- **E1** `prior-spike-history-and-011-boundary-preserved.test.ts` - pins the
  Git tree identity of eight prior, already-adjudicated spike directories
  and asserts they remain unchanged at verify time. Covers AC23; ER23; N6,
  N9, N10. Executable; PASSES against the pre-implementation baseline (as it
  must, since nothing has touched those paths yet); negative control
  confirmed to FAIL for the intended reason (see "Pre-Freeze Integrity
  Gate").
- **PR1** Visible regression obligation reproducing Scar R1 and Scar R2:
  one authority-resolution path; local-state deletion not changing
  eligibility; fresh-runner resume; As-Built regression. Covers AC01-AC04;
  ER01-ER04; N1, N4, N6; I1. `PUBLIC_REGRESSION`.
- **PR2** Visible regression obligation plus manual source inspection:
  pinned Methodology Definition; data-driven role ordering; no kernel-level
  `ROLE_CONTRACTS`/hardcoded phase names; historical definition stability.
  Covers AC05-AC08, AC31 (AC31's own coverage row also cites PR8; PR2's
  manual component is the AC06/AC07 half of the same inspection). Covers
  AC05-AC08; ER05-ER08; N2, N3; I3. `COMPOSITE`.
- **PR3** Visible regression obligation: Workflow Execution Grant on
  human run/continue instruction; observation non-consuming; Role Grant on
  every governed execution; no role by prose. Covers AC09-AC12; ER09-ER12;
  I2. `PUBLIC_REGRESSION`.
- **LB1** Live boundary proof: real spawned-execution Role Grant and real
  attached-execution Role Grant, each meeting spike.md's exact fixture
  properties. Covers AC13-AC14; ER13-ER14; N7; I4. `LIVE_BOUNDARY_PROOF`.
- **PR4** Visible regression obligation reproducing Scar R4: exposure
  recorded; exposure monotonic (survives grant removal); exposure affects
  eligibility. Covers AC15-AC17; ER15-ER17; N7. `PUBLIC_REGRESSION`.
- **PR5** Visible regression obligation reproducing Scar R5: result
  dimensions independently observable; host-action failure does not rewrite
  semantic history. Covers AC18-AC19; ER18-ER19. `PUBLIC_REGRESSION`.
- **LB2** Live boundary proof: bounded local bare-remote host-mediated
  publication exactly as spike.md's "Required bounded publication
  environment" specifies. Covers AC20-AC21; ER20-ER21; I4.
  `LIVE_BOUNDARY_PROOF`.
- **PR6** Visible regression obligation reproducing Scar R7: generic
  bounded root authority, no spike-specific kernel code, no historical
  mutation. Covers AC22; ER22; N2, N9, N10. `PUBLIC_REGRESSION`.
- **LB3** Live boundary proof: real human-wait/resume cycle through the
  actual supported host boundary, with canonical recording of any
  authority-changing response before use. Covers AC24-AC26; ER24-ER26; N7;
  I4. `LIVE_BOUNDARY_PROOF`.
- **PR7** Visible regression obligation reproducing Scar R3: idempotent
  continuation; explicit retry/replacement lineage; durable execution
  identity across disconnect; interrupted execution representable. Covers
  AC27-AC30; ER27-ER30; N7; I2. `PUBLIC_REGRESSION`.
- **PR8** Manual source-inspection procedure: absence of intrinsic
  `spikes/<id>`/fixed-skill-path/hardcoded-phase-name dependence in the
  normal kernel path. Covers AC31; ER31; N2, N3; I3. `MANUAL_REVIEW`.
- **PR9** Visible regression obligation: telemetry seam correlated to
  stable identities; telemetry failure non-fatal. Covers AC32-AC33; ER32-
  ER33; I3. `PUBLIC_REGRESSION`.
- **PR10** Visible regression obligation plus manual data-model inspection:
  explicit executor-selection seam without changing authority semantics.
  Covers AC34; ER34; I3. `COMPOSITE`.
- **PR11** Visible regression obligation plus manual schema inspection: new
  persisted structures carry explicit schema/version identities. Covers
  AC35; ER35; I2. `COMPOSITE`.

## Coverage Matrix

| ID | Cases | Executable coverage | Non-executable evidence plan |
| --- | --- | --- | --- |
| ER01-ER04 (AC01-04), N1, N4, N6, I1 | PR1 | none | implementation's visible suite (`npm test`) reproducing Scars R1-R2, reviewed at verify against the PR1 decision rule |
| ER05-ER08 (AC05-08), N2, N3, I3 | PR2 | none | implementation's visible suite + manual source inspection of the identified kernel path |
| ER09-ER12 (AC09-12), I2 | PR3 | none | implementation's visible suite |
| ER13-ER14 (AC13-14), N7, I4 | LB1 | none | real spawned + real attached Role Grant execution through the supported host boundary, per fixed fixture properties |
| ER15-ER17 (AC15-17), N7 | PR4 | none | implementation's visible suite reproducing Scar R4 |
| ER18-ER19 (AC18-19) | PR5 | none | implementation's visible suite reproducing Scar R5 |
| ER20-ER21 (AC20-21), I4 | LB2 | none | bounded local bare-remote host-mediated publication proof, per fixed durable-evidence requirements |
| ER22 (AC22), N2, N9, N10 | PR6 | none | implementation's visible suite reproducing Scar R7 |
| ER23 (AC23), N6, N9, N10 | E1 | `.hidden-test/prior-spike-history-and-011-boundary-preserved.test.ts` | - |
| ER24-ER26 (AC24-26), N7, I4 | LB3 | none | real human-wait/resume cycle through the supported host boundary, per fixed fixture properties |
| ER27-ER30 (AC27-30), N7, I2 | PR7 | none | implementation's visible suite reproducing Scar R3 |
| ER31 (AC31), N2, N3, I3 | PR8 | none | manual source inspection of the identified kernel path |
| ER32-ER33 (AC32-33), I3 | PR9 | none | implementation's visible suite |
| ER34 (AC34), I3 | PR10 | none | implementation's visible suite + manual data-model inspection |
| ER35 (AC35), I2 | PR11 | none | implementation's visible suite + manual schema inspection |
| N5, N8 | (all cases) | none | provider prose and process exit are never accepted as authority/evidence during any case's evaluation; evaluator-private isolation is checked throughout verification, not as a separate criterion |

This mapping agrees with `case-manifest.json` and `.hidden-test/manifest.json`.

## Out of Scope

- The internal representation of the Authority Resolver, Methodology
  Definition, Workflow Execution Grant, Role Grant, execution-binding/
  session-registry, provenance, result schema/disposition vocabulary,
  host-action mechanics, root-authority-record schema, telemetry sink, and
  executor-selection-seam shape - all explicit Design Map implementation
  freedom - are not frozen and are not tested for a specific shape.
- A polished workflow DSL, a generalized scheduler, worker pools/priorities,
  a full secrets manager, complete provider usage/token accounting, cost
  optimization, automatic model selection, full model/reasoning-depth
  configuration, a full evaluator/As-Built/orchestrator rewrite, the
  methodology/skill-upgrade workflow, the installer/init experience, the
  real second-project pilot, multi-session supervision, a remote client, an
  attention UI, restoring arbitrary provider processes across host restart,
  removing all historical legacy event schemas, collapsing every attempt
  counter into one number, making every semantic judgment deterministic, or
  arbitrary agent-to-agent coordination - all explicit spike.md non-goals.
- Actually resuming or completing Spike 011 Cycle 002 - explicitly deferred
  by spike.md to after Spike 014 acceptance (N10; E1's second subtest
  evaluates non-advancement only, not resumption).
- Human product acceptance - a separate, later gate per the evaluator skill
  contract.

## Limitations

- LB1, LB2, and LB3 require a reachable Harness host process and the
  ability to start real OS-level executor processes and local bare Git
  remotes at verify time. Per Design Map invariant I4 and evaluator
  assumption A6, if a required executor/host capability is unavailable for
  external/environmental reasons, the affected criteria (AC13, AC14, AC20,
  AC21, AC24-AC26) are `BLOCKED`, not passed via mocks; this is a
  limitation of the evaluation environment, not license to substitute
  static evidence.
- PR1-PR11 (except E1) rely on the implementation's own visible regression
  suite, real-boundary proofs, and manual source/data-model inspection
  rather than evaluator-authored hidden tests, because the frozen Design
  Map's "Implementation freedom" section deliberately leaves the underlying
  representations free across nearly the entire brief - this spike is a
  from-scratch kernel consolidation, not an incremental change to an
  already-fixed interface. This mirrors the approach Spike 013a's
  evaluator preparation used for the same category of freedom (its
  `eval-requirements.md` TR1-TR3 etc.) and provides real but
  implementation-suite-mediated and manual-inspection-mediated
  falsifiability rather than fully independent hidden-test falsifiability.
- E1 exercises only a narrow, pre-existing, implementation-independent fact
  (Git tree identity of already-committed prior spike directories). It does
  not, and cannot, exercise any new Spike 014 mechanism, because none exists
  before implementation; it is frozen specifically because it is one of the
  very few AC01-AC35 facts that genuinely has a stable, pre-implementation,
  non-Design-Map-free observable seam (the Git object model itself).
- The manual-inspection components (PR2's AC06/AC07 half, PR8/AC31, PR10's
  data-model half, PR11's schema half) depend on the implementation's own
  As-Built/implementation report correctly identifying "the normal kernel
  path" (TR2, assumption A2). If that identification is materially
  incomplete or misleading, the evaluator must independently establish the
  kernel path from the implementation diff and repository structure before
  relying on it, and must treat a materially incomplete self-report as
  relevant evidence for the AC06/AC07/AC31 judgment itself, not as an
  excuse to skip the inspection.

## Revision History

- Revision 001 (current): initial frozen preparation, evaluator skill
  contract v11, prepared at project commit `3543159`. Archived at
  `.eval/revisions/001/`.
