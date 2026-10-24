# Post-Outcome maintenance 001: evaluator write composition

- Status: `IMPLEMENTED`; deterministic verification passed; live governed
  operational confirmation remains pending
- Performed at: `2026-10-07T12:30:53+02:00`
- Authority: explicit human authorization in the active Codex App session
- Provenance: human-authorized host/runtime maintenance performed through Codex
  App; this session was not a governed Harness role allocation and held no
  evaluator identity
- Implementation method: `skills/implementation/SKILL.md`, contract version 5,
  applied where relevant to this post-Outcome maintenance correction
- Base: `caa701afb028135033b03e1d09abdfc2d5c8306a`
- Implementation commit: the focused commit containing this record. Its exact
  Git identity is reported in the maintenance handoff; embedding a commit's own
  identity in its content would change that identity.

## Completion boundary

The Spike 014k Outcome remains `COMPLETE` and immutable. This correction does
not reopen the completed governed workflow, alter its accepted evaluator
semantics, create a new methodology adoption, or append methodology sequence 7.
Trusted methodology sequence 6 remains:

- methodology identity
  `sha256:da22079f636de3a498ec853dc6dd8785f3aa8daa387130c96ac9927b377301f2`;
- revision `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`;
- trusted-ledger file identity
  `sha256:56b0257bc9cd83a00faff7ed2227c5646b8d39411cd428f1a5ab17560eb466fd`.

`outcome.md` was not modified and retains identity
`sha256:fd80ceb980d428f8e6adad8e4c69610d3cdf2c46c30e27df20848da63a30c824`.
Spike 014f candidate `af75b14d1847af02404a591a8829751dc8df2a2e` and
evaluator revision `002` were not modified.

## Discovered defect

The host-owned bubblewrap boundary already represented the accepted sequence-6
composition correctly: workspace mounts followed their individual Role Grant
modes, scratch and isolated `/tmp` were writable, the repository could remain
read-only, and paths outside the exact grant/runtime closure were unavailable.
Both provider mappings then collapsed that mixed composition into a global
write switch derived from `repository-write`:

- Claude omitted its `Edit`/`Write` tool families when `repository-write` was
  absent, even when an evaluator-private workspace was granted `write`;
- Codex selected its native global `read-only` sandbox when `repository-write`
  was absent, overriding writable evaluator-private and scratch state inside
  the outer containment.

Attempt 005 of Spike 014f exposed the Codex half operationally: authorized
isolated writable storage existed at the Harness boundary, but the nested Codex
sandbox made it read-only.

## Accepted semantics restored

The implementation now applies the existing invariant directly:

> Capability authority determines what class of mutation is allowed. Workspace
> mode determines where filesystem mutation is allowed.

- Claude enables file-authoring tools when at least one granted workspace is
  writable. Every read-only workspace remains covered by provider Edit/Write
  denials and command-sandbox `denyWrite`; absent `repository-write` and
  `git-commit` still withhold repository mutation and commit authority.
- Codex builds a mixed native permission profile from the granted workspace
  modes. Only `write` workspaces, isolated `/tmp`, and `$TMPDIR` are writable.
  Git metadata is explicitly read-only unless `git-commit` is granted.
- Network remains disabled. Host-owned bubblewrap containment, protected
  routing, bounded evidence publication, and fail-closed launch behavior are
  unchanged. No uncontained fallback or broader host visibility was added.

This is provider/runtime mapping maintenance because it makes the live adapters
faithfully realize authority and workspace modes that sequence 6 already
accepted. It changes no evaluator contract, policy, skill, result vocabulary,
routing rule, frozen evaluator artifact, or methodology history.

## Files changed

- `src/claude-workflow.ts`
  (`sha256:920052ed9f51863da04a7b31c2c3d21c0bed9702edd80d93b16b05aedc3af22a`)
- `src/executors/adapters.ts`
  (`sha256:4ac06e9eeada1a8f402f246256cc76a71ce173ca0ee5e804f4b45242233db477`)
- `test/evidence-action.test.ts`
  (`sha256:bb16fbb336a9c013a49de1a4474941ae32dcdacf2ad0b543f78e04a7a934dc88`)
- `test/external-project.test.ts`
  (`sha256:ff5d2d789bb8a108eb0aea4b03711c9cf7b46a1f074fa0524ad81ae6b37038b1`)
- this maintenance record
- `manifest.md`

No other tracked file changed.

## Verification

- Initial focused run:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts test/governed-executors.test.ts` — 68/69 passed;
  one updated Claude assertion still invoked the command builder as an
  unprotected launch and expected protected `dontAsk` mode. The test fixture was
  corrected to exercise the real protected composition; no production behavior
  changed in response.
- `node --test test/evidence-action.test.ts test/external-project.test.ts` —
  28/28 passed.
- `node --test test/external-project.test.ts` after adding the black-box mixed
  Codex profile case — 18/18 passed.
- Full sequence-6 regression set:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts test/governed-executors.test.ts test/methodology-evolution.test.ts test/successor-closeout.test.ts test/skill-fidelity.test.ts test/candidate-subject.test.ts`
  — 115/115 passed.
- `npm test` — 263/263 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed.
- `git diff --check` — passed before the final record/manifest update and is
  rerun before commit.

The tests cover the sequence-6-shaped read-only repository, writable private
workspace, writable scratch and isolated temp storage, Claude file authoring
with repository and commit authority withheld, command-level repository write
denial, Codex mixed-mode enforcement including read-only Git metadata, exact
outer visibility, unchanged ordinary writable-role behavior, bounded evidence
publication, and fail-closed provider/sandbox launch behavior. The Codex
black-box case uses the installed local `codex sandbox` helper inside real
Harness containment; it does not make a model/provider call.

Deterministic tests prove the maintenance composition, but they are not an
independent semantic evaluation and do not replace live governed operational
confirmation. After review, the intended proof remains one fresh unchanged
Spike 014f `evaluator-verify` against candidate
`af75b14d1847af02404a591a8829751dc8df2a2e` and evaluator revision `002`, using
the ordinary protected Claude route. That execution must be recorded
separately.
