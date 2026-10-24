# Brief Readiness — Spike 014c Governed Executor Integration (Run 004)

- Skill: `brief-readiness` contract version 4
- Reviewed brief: `spikes/014c-governed-executor-integration/spike.md`
  `sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18`
- Repository state reviewed: `feat/spike-014` at
  `fea79abb0b9085f6ce90b2c94e750b15a38e56c8`

## Summary

The brief was revised in `fea79ab` ("clarify synthetic trust authority"). That
commit changes only `spike.md`. The revision resolves every blocking or
material finding from Runs 001–003:

- **B1 (resolved).** §2 now scopes the trust-equivalence gate to "that
  project's" immutable trusted manifest. The gate applies to Harness,
  disposable test projects, and external projects, with no synthetic
  exemption. The smoke tests use one dedicated fixture project with its own
  synthetic methodology and a human-established trust root, which cannot
  govern 014c or alter Harness trust history. §6 builds the smoke host in test
  code from the fixture configuration and trust history, using the production
  host implementation and adapters. AC16 now covers the fixture explicitly.
  This combination is consistent: AC05, AC09 and AC16 can all pass without an
  exemption. It also fits the existing mechanism: `readTrustedHistory`,
  `bindFutureWorkflow` and `promoteMethodology` in
  `src/methodology-evolution.ts` already take an explicit trust-history path
  and accept a `human-bootstrap` evaluation.
- **Earlier M1 (resolved).** §7 cites `bootstrap/authority.md`, pins the
  bootstrap executor to `d447e385018fd587809431d2f6e9363ddb304a66`, and states
  that candidate adapter restrictions bind only the candidate path. I
  confirmed that commit exists, is an ancestor of `HEAD`, and contains
  `tools/governed-claude-bootstrap.ts`. The starting checkpoint has been
  updated.
- **Earlier M2 (resolved).** §5 states that fixture command profiles can be
  built only in test code. No production entrypoint variable, configuration
  file, test-mode flag, alternative trust root, or fixture command may enable
  them.
- **Earlier E1 and E2 (resolved).** §3 now refers to the selected Claude
  adapter together with the Codex adapter. It also states that existing
  authorized host actions, including publication where granted, go through
  the shared protocol.

No blocker remains. Two clarifications would stop implementations from
diverging, but the likely answers are clear.

## Material clarifications (non-blocking)

### C1 — Who records the fixture's human trust root, and when

**Brief evidence.** §2: "Human authority may establish only that fixture's
initial immutable trust root; the tests must pin and record its exact
definition, revision, and manifest identity before execution." §6 requires
recording the "fixture trust-root authority".

**Repository evidence.** `requirePromotionAuthority` in
`src/methodology-evolution.ts` accepts `{kind: "human", evaluation: {kind:
"human-bootstrap", evidence}}`. It checks only that the evidence strings are
non-empty, and `tools/methodology.ts promote` appends the record. As a
result, whoever writes the authority file controls the human attestation.

**Consequence.** If the brief does not say otherwise, the implementing worker
could write the fixture's `human-bootstrap` evidence itself. That would be
the synthesized human authority that §3 (`requestHuman`) prohibits. The
evaluator would then have no fixed rule for judging whether the root is
genuine.

**Smallest clarification.** State that a human approves the fixture trust
root explicitly, through the existing human approval mechanism or a committed
human decision record. The approval must come after the fixture methodology
is committed and before any smoke execution. The implementing worker prepares
the fixture but does not author the human evidence.

### C2 — Manifest construction is currently specific to Harness

**Brief evidence.** §2 and AC16 require component equivalence for every
configured project, including a fixture with its own policy, roles, and
promotion contract.

**Repository evidence.** `buildMethodologyManifest` in
`src/methodology-evolution.ts` defaults to
`methodologies/harness/policy.json`. It also always hashes a fixed
`VALIDATOR_SOURCES` map that points at `src/methodologies/harness-public.ts`.
`harness.project.json` has a `policy` field but no trust-history field. The
host (`src/kernel/`) performs no trust check today.

**Consequence.** Implementers must decide two things: how a project declares
its trust-history location, and how it declares which validator sources make
up its manifest. That work is expected under §2, but it touches
`src/methodology-evolution.ts` and project configuration. It sits close to
the non-goal "no broad kernel redesign".

**Smallest clarification.** State that each project declares its trust
history, and that the manifest's validator set comes from that project's
declared policy or configuration. Also state that this generalization is in
scope, provided the Harness manifest identities recorded in
`methodologies/harness/trusted.jsonl` still reconstruct unchanged.

## Editorial

- **E1.** The header's starting checkpoint is `ccca429`, but the reviewed
  brief is at `fea79ab`. The header already says "verify again when
  freezing", so record the freeze commit at that point.

## Review limitations

- I reviewed only public repository material. I did not inspect
  evaluator-private paths (`**/eval-spec.md`, `**/.hidden-test/**`,
  `**/.eval/**`).
- I did not consult the external Anthropic documentation, and I made no
  provider calls. The authentication and billing position is left to the §1
  worksheet, as the brief requires.
- I did not run `npm run check`, because no code changed since the prior
  review (`git diff ccca429 HEAD --stat` shows only `spike.md`).
- I did not read or modify the Harness-owned
  `spikes/014c-governed-executor-integration/workflow.jsonl`.

## Files changed

- `spikes/014c-governed-executor-integration/feedback.md` (this review)
- `spikes/014c-governed-executor-integration/manifest.md` (Run 004 entry)

The verdict passes, so no `preliminary/` snapshot was created.

## Checks run

- Checked that the SHA-256 of `spike.md` matches the host-bound input
  identity.
- Ran `git diff f032ea7 HEAD -- spike.md` (the revision since Run 003) and
  `git diff ccca429 HEAD --stat`.
- Checked that `d447e385` exists, is an ancestor of `HEAD`, and contains
  `tools/governed-claude-bootstrap.ts`.
- Inspected `bootstrap/authority.md`, `harness.project.json`,
  `methodologies/harness/trusted.jsonl`, `src/methodology-evolution.ts`
  (trust events, promotion authority, manifest construction),
  `tools/methodology.ts`, and the host configuration loading in
  `src/index.ts`.

## Verdict

**Ready after minor clarification**
