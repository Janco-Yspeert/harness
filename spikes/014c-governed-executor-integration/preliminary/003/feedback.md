# Brief Readiness — Spike 014c Governed Executor Integration (Run 003)

- Skill: `brief-readiness` contract version 4
- Reviewed brief: `spikes/014c-governed-executor-integration/spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
- Repository state reviewed: `feat/spike-014` at
  `bf8bc140338427904d4305fc1c9273345fbcf8aa`

## Summary

This is the third readiness pass over the **same brief bytes**. `spike.md` is
byte-identical to both
`spikes/014c-governed-executor-integration/preliminary/001/spike.md` and
`spikes/014c-governed-executor-integration/preliminary/002/spike.md`. Since
Run 002's reviewed checkpoint `2765500`, the only repository changes are Run
002's review artifacts (`feedback.md`, `manifest.md`, `preliminary/002/**`).
Code, configuration, methodology, and brief text are unchanged.

I re-checked the repository evidence behind the earlier findings myself, and it
still holds. One question is still unresolved: what the trust-equivalence gate
applies to (§2, AC16). As written, the gate conflicts with the synthetic
real-provider smoke tests, which must run through the production host (§6,
AC05, AC09). The blocker therefore stands.

## Blocker

### B1 (unchanged) — The trust-equivalence gate does not say whether it covers synthetic smoke-test methodologies or non-Harness projects

**Brief evidence.** §2 ("Before a new production Workflow Execution Grant…")
requires the host to deny a grant unless the kernel definition matches the
trusted methodology manifest component for component. AC16 applies that
requirement to new governed grants. §6 and AC05 require real Claude and Codex
runs "launched through the production governed host and registered adapter".
Those runs use "an exact pinned, trivial synthetic skill/contract". §3 and AC09
require a "deliberately simple, synthetic protected role" whose promotion is
validated and recorded by the host.

**Repository evidence (re-verified at `bf8bc14`).**

- `methodologies/` contains only `harness/`. All four records in
  `methodologies/harness/trusted.jsonl` belong to the Harness methodology.
- `buildMethodologyManifest` in `src/methodology-evolution.ts` defaults to
  `methodologies/harness/policy.json`, with a fixed `VALIDATOR_SOURCES` map.
- `harness.project.json` has a `policy` field but no trust-history field.
- `src/kernel/` contains no trust logic. The host loads policy through
  `loadDefinition` (`src/kernel/methodology.ts`) without any trust check.
- The promotion host action in `src/kernel/host.ts` and
  `src/kernel/execution.ts` depends on a promotion configuration defined by the
  role contract. A synthetic promoting role therefore needs its own policy and
  contract, which would not be part of the trusted Harness methodology.

**Consequence.** If AC16 is implemented faithfully, the host will deny the AC05
and AC09 smoke grants. To make the smoke tests pass, a later role would have to
pick one of three authority models that the brief never states. Each rules out
the other two:

1. a test or configuration exemption, which weakens "production governed host"
   and opens an AC16 bypass;
2. a trust history written by the fixture, which needs a trust-root authority
   the brief does not name; or
3. adding the synthetic role to the Harness methodology, which counts as
   methodology evolution under §7.

The evaluator cannot freeze criteria that pass AC05, AC09 and AC16 together
without choosing one of these models.

**Smallest clarification requested.** Add one paragraph to §2 or §6 that
states:

- how the host finds a project's trusted history: Harness-only, or a
  per-project path;
- whether disposable or non-Harness projects are subject to the gate, and who
  may establish their trust root; and
- which configuration the smoke tests use, and why that configuration is still
  the production host and registered adapter without weakening AC16.

## Material clarifications

### M1 (unchanged) — Pinned evaluator launch path and host revision

§7 requires an existing, pinned, independent evaluator launch path before
implementation.
`spikes/014c-governed-executor-integration/bootstrap/authority.md` records that
decision. It relies on a command profile that runs
`tools/governed-claude-bootstrap.ts` at `d447e38`. That profile is accepted
through `HARNESS_EXECUTOR_CONFIG` (`src/index.ts`) and `profile.command`
(`src/kernel/host.ts`). AC04 and AC13 require the candidate host to reject
exactly this kind of profile.

The brief still names starting checkpoint `2c44416`, which is older than the
authority record.

**Requested changes:**

- cite `bootstrap/authority.md` as the §7 path;
- update the starting checkpoint; and
- state that evaluator preparation and verification run on a host pinned before
  the candidate, so that the AC04 guard binds the candidate host only.

### M2 (unchanged) — Boundary between production and test configuration

§2 and §5 allow fixture command profiles "only to explicit tests" or through an
"explicitly isolated test configuration". Today every profile, including the
fixtures in `test/kernel.test.ts`, arrives through the same
`HARNESS_EXECUTOR_CONFIG` JSON (`src/index.ts`). A discriminator such as an
environment flag or a profile field could be enabled in a deployment and would
reopen the bridge path.

**Requested change:** state that command and fixture profiles can only be
reached by constructing the host in test code. No configuration or environment
setting accepted by the production entry point may enable them.

## Editorial

- **E1.** In §3, "if SDK and structured CLI cannot both consume it" should
  refer to the selected Claude adapter together with the Codex adapter. Only
  one Claude route becomes production.
- **E2.** §3 `requestAction` does not say whether the host's existing `publish`
  action (`src/kernel/host.ts`) is part of the 014c worker protocol.
- **E3.** Unchanged brief bytes have now received three identical verdicts.
  Revise the live brief to resolve B1 and the clarifications before requesting
  another readiness pass. Re-reviewing the same bytes cannot change the
  outcome.

## Review limitations

- I reviewed only public repository material. I did not inspect
  evaluator-private paths (`**/eval-spec.md`, `**/.hidden-test/**`,
  `**/.eval/**`).
- I did not consult the external Anthropic documentation, and I made no provider
  calls.
- I did not run `npm run check`, because no code changed since the prior
  review.
- I did not read or write the untracked
  `spikes/014c-governed-executor-integration/workflow.jsonl` beyond its first
  bytes. It is Harness-owned and not needed for this review.

## Files changed

- `spikes/014c-governed-executor-integration/feedback.md` (this review)
- `spikes/014c-governed-executor-integration/preliminary/003/spike.md` (exact
  reviewed draft)
- `spikes/014c-governed-executor-integration/preliminary/003/feedback.md`
  (matching review)
- `spikes/014c-governed-executor-integration/manifest.md` (Run 003 entry)

## Checks run

- Checked that the SHA-256 of `spike.md` matches the host-bound input identity.
- Checked that `spike.md` is byte-identical to `preliminary/002/spike.md`.
- Ran `git diff 2765500 HEAD --stat`, which showed only Run 002 review
  artifacts.
- Ran `git diff fd60b07 HEAD --stat` over `src`, `methodologies`, `tools`,
  `skills` and `harness.project.json`, which showed no changes.
- Re-checked the B1, M1 and M2 evidence in `src/kernel/`, `src/index.ts`,
  `src/methodology-evolution.ts`, `harness.project.json` and
  `methodologies/harness/trusted.jsonl`.

## Verdict

**Not ready to freeze**
