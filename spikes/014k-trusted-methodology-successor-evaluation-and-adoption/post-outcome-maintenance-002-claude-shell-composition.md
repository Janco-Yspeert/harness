# Post-Outcome maintenance 002: Claude shell composition

- Status: `IMPLEMENTED`; deterministic verification passed; a minimal live
  protected-Claude runtime preflight remains required before another evaluator
  allocation
- Performed at: `2026-10-07T13:28:18+02:00`
- Authority: explicit human authorization in the active Codex App session
- Provenance: human-authorized inline host/runtime maintenance performed
  through Codex App; this session was not a governed Harness role allocation
  and held no evaluator identity
- Implementation method: `skills/implementation/SKILL.md`, contract version 5,
  applied where relevant
- Base: `f938fec61f7574a7e274a242a6522cb91e314fe7`, retaining attempt-8 evidence
  commits `5031475e47b0894c87e6bc8f89cf450ba73f61c5` and
  `f938fec61f7574a7e274a242a6522cb91e314fe7`
- Predecessor maintenance: post-Outcome maintenance 001,
  `1c1b432ccb68e856926d8635a11ab39def7ef17e`
- Implementation commit: the focused commit containing this record. Its exact
  Git identity is reported in the maintenance handoff; embedding a commit's own
  identity in its content would change that identity.

## Completion boundary

The Spike 014k Outcome remains `COMPLETE` and immutable. This correction does
not reopen that workflow, evolve methodology, append sequence 7, or change the
accepted sequence-6 verifier contract. Trusted methodology sequence 6 remains:

- methodology identity
  `sha256:da22079f636de3a498ec853dc6dd8785f3aa8daa387130c96ac9927b377301f2`;
- revision `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330`;
- trusted-ledger file identity
  `sha256:56b0257bc9cd83a00faff7ed2227c5646b8d39411cd428f1a5ab17560eb466fd`.

`outcome.md` was not modified and retains identity
`sha256:fd80ceb980d428f8e6adad8e4c69610d3cdf2c46c30e27df20848da63a30c824`.
Spike 014f candidate `af75b14d1847af02404a591a8829751dc8df2a2e`
and evaluator revision `002` were not modified. No evaluator execution was
launched by this maintenance.

## Attempt 8 diagnosis

The explicitly authorized Spike 014f verification used Workflow Grant
`96780035-e4b6-4c30-97e5-a7d644b3a831`, root authority
`05928639-d540-4e6f-a226-68628581385a`, Role Grant
`sha256:a733098af7fbcee216981189630c625794d7a897ebda8bc0ad5ff6c34d312ecf`,
and execution `7b26f056-fd50-46c1-90dc-a072295373a6`. It bound attempt 8,
candidate `af75b14d1847af02404a591a8829751dc8df2a2e`, evaluator revision
`002`, the `claude-sonnet` profile, confirmed model `claude-sonnet-5-5`, and
Claude Code `2.1.292`.

Retained bounded provider diagnostics establish the exact failure. Before any
evaluator Bash command ran, Claude Code's nested bubblewrap launcher attempted
to create:

`/home/velveteen/vk-code/harness/.claude/hooks`

Harness had already mounted the public repository read-only, so sandbox
construction failed with:

`bwrap: Can't create file at /home/velveteen/vk-code/harness/.claude/hooks: Read-only file system`

This was not a candidate command failing to write the repository. It was
Claude's sandbox runtime creating a filesystem-policy mount point while
reconstructing deny-write policy already enforced by outer Harness
containment. The same execution successfully used Claude's Write tool for its
evaluator-private result, confirming that maintenance 001's workspace mapping
worked at the Harness boundary. The nested shell launcher alone made that valid
composition unusable. Consequently 0/11 executable procedures ran and 0/8
criteria were adjudicated; the submitted result was `BLOCKED` /
`INFRASTRUCTURE_FAILURE`.

## Runtime correction

Governed contained Claude launches now set only the nested sandbox's filesystem
component to `disabled`. Claude's sandbox itself remains enabled and
fail-closed, with automatic sandboxed Bash approval, no excluded commands, and
`allowUnsandboxedCommands: false`. Its command and network isolation therefore
remain active; there is no unsandboxed fallback.

Filesystem authority remains entirely with the already-authoritative outer
Harness bubblewrap boundary for governed launches:

- granted `read` workspaces are read-only mounts, including repository Git
  metadata;
- granted `write` workspaces, execution scratch and isolated `/tmp` are
  writable;
- all other host paths remain outside the bounded runtime closure;
- Claude Edit/Write denials still cover every read-only workspace;
- capability mapping still withholds `git commit`, `git add`, direct push and
  repository mutation from the sequence-6 verifier;
- the bounded host evidence action remains its only public mutation route.

Legacy Claude launches that do not use governed host containment retain the
existing provider filesystem fence. Ordinary governed writable Claude roles
continue to receive their existing capability and workspace-mode behavior.
Codex composition from maintenance 001 is unchanged.

This restores existing sequence-6 runtime semantics. It changes no contract,
policy, evaluator skill, frozen artifact, evaluator routing rule, trusted
history, result vocabulary, or publication authority.

## Attempt-8 public evidence repair

The first attempt-8 evidence action committed the attempted blocked result and
replaced the 014f manifest with the 11-byte text `PLACEHOLDER` in
`5031475e47b0894c87e6bc8f89cf450ba73f61c5`. A second action replaced that
placeholder with a partial reconstruction in
`f938fec61f7574a7e274a242a6522cb91e314fe7`. Both commits remain intact and
visible in history.

The attempted `verification-result.json` has identity
`sha256:928d928308d0234719f973155e053f9dc39cc346171603d6bdc30bda6c7152b8`.
Its `schemaVersion: 1`, `evaluatorRevision: "002"`, and result `BLOCKED`
matched the allocation and submitted Role Result. The validator-bound
candidate field did not: it wrote `candidate` instead of `commit`, leaving
`result.commit` absent rather than equal to
`af75b14d1847af02404a591a8829751dc8df2a2e`. That exact mismatch caused
`verification result identity mismatch`.

The forward correction restores the complete 014f manifest exactly as it stood
at maintenance 001, then appends the attempt-8 execution, overwrite, validation
failure and correction history. The malformed attempted result remains
unchanged as historical evidence. The ledger contains `kernel.result` followed
by `kernel.transition-blocked`; it contains no attempt-8
`verification-finalized` event. This maintenance does not manufacture one.

## Files changed

- `src/claude-workflow.ts`
  (`sha256:115194bc6fc3d74cf647e3dbbeb8f0a6a973a0076f8e0b3eb5a339da37509fe9`)
- `test/evidence-action.test.ts`
  (`sha256:b310653838199ea22cbda2893f28072210cfe6ad1eeda91f7a71c5550a402f32`)
- `test/governed-executors.test.ts`
  (`sha256:ec22c28c52e7ff69ee0252c5c3441a8d3884bc1a662b9ff65bfd3faa8b61299f`)
- `test/host-fs-isolation.test.ts`
  (`sha256:39b8a571ba336ca46f2fdf4e7ad67835ccac3c9e72bbaad512934334b2ebe356`)
- `spikes/014f-inactive-workflow-grant-retirement/manifest.md`
  (forward restoration and attempt-8 correction record)
- this maintenance record
- `manifest.md`

No other tracked file changed.

## Verification

- Initial focused composition run:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts`
  — 35/35 passed.
- Expanded focused provider/containment run:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts test/governed-executors.test.ts`
  — 70/70 passed, both before and after final test/style cleanup.
- Full sequence-6 regression set:
  `node --test test/evidence-action.test.ts test/host-fs-isolation.test.ts test/external-project.test.ts test/governed-executors.test.ts test/methodology-evolution.test.ts test/successor-closeout.test.ts test/skill-fidelity.test.ts test/candidate-subject.test.ts`
  — 115/115 passed.
- `npm test` — 263/263 passed.
- Initial static pass: typecheck and `git diff --check` passed; lint reported
  two unnecessary optional chains in the new assertion and formatting reported
  the new settings expression. Those mechanical issues were corrected without
  production-semantic changes.
- Final `npm run typecheck` — passed.
- Final `npm run lint` — passed.
- Final `npm run format:check` — passed.
- Final `git diff --check` — rerun after this record and manifest entry, before
  commit.

The deterministic coverage proves the provider configuration keeps Claude's
inner command sandbox enabled while delegating filesystem enforcement to outer
containment; the outer boundary reads but cannot mutate the repository or Git
metadata, writes evaluator-private, scratch and isolated temp state, hides
ungranted paths, and fails closed. It also preserves read-only-workspace
Edit/Write denials, absence of commit authority, bounded evidence publication,
ordinary writable Claude behavior, and the maintenance-001 Codex mixed mode.

These tests are not independent verification and do not replace operational
confirmation. Before consuming another Spike 014f `evaluator-verify`
allocation, the next separately authorized action should be a minimal live
protected-Claude preflight that reads repository state, writes only
evaluator-private/scratch state, and demonstrates repository-write failure.
