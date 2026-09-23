# Brief Readiness — Spike 014c Governed Executor Integration (Run 002)

- Skill: `brief-readiness` contract version 4
- Reviewed brief: `spikes/014c-governed-executor-integration/spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
- Repository state reviewed: `feat/spike-014` at
  `27655009f3e915b4973eaad5b82058bec190f41e`

## Summary

This is a second readiness pass over the **same brief bytes** that Run 001
reviewed. `spike.md` is byte-identical to
`spikes/014c-governed-executor-integration/preliminary/001/spike.md`. Since
`fd60b07`, the only repository changes are Run 001's review artifacts
(`feedback.md`, `manifest.md`, `preliminary/001/**`). No code, configuration,
methodology, or brief text has changed.

I independently re-checked the repository evidence behind Run 001's findings,
and it still holds. The brief remains well-bounded in most respects. However,
the scope of the trust-equivalence gate (§2, AC16) is still unresolved, and it
conflicts with the synthetic real-provider smoke tests that must run through the
production host (§6, AC05, AC09). The blocker therefore stands. Freezing the
brief now would pass an authority decision to the Design Map, the implementer,
or the evaluator.

## Blocker

### B1 (unchanged) — The trust-equivalence gate has no stated scope for synthetic smoke-test methodologies or non-Harness projects

**Brief evidence.**

- §2, the paragraph beginning "Before a new production Workflow Execution
  Grant": the host must establish that the kernel definition is the
  component-equivalent projection of "the append-only trusted methodology
  manifest at its recorded revision". Otherwise it denies the grant.
- AC16 requires new governed workflow grants to reject untrusted methodology.
- §6 and AC05: real Claude and Codex runs must be "launched through the
  production governed host and registered adapter". Each uses "an exact pinned,
  trivial synthetic skill/contract".
- §3 and AC09: a "deliberately simple, synthetic protected role" requests a
  promotion, and the host records the action and the transition.

**Repository evidence (re-verified).**

- `methodologies/` contains only `harness/`. Its `trusted.jsonl` has four
  records, all for the Harness methodology.
- `buildMethodologyManifest` in `src/methodology-evolution.ts` defaults to
  `methodologies/harness/policy.json` and a fixed `VALIDATOR_SOURCES` map.
- `harness.project.json` has a `policy` field but no trust-history field.
- `src/kernel/` contains no trust-related logic, and `src/kernel/host.ts`
  performs no trust check. The policy is loaded directly through
  `loadDefinition` (`src/kernel/methodology.ts`).
- Kernel promotion (`src/kernel/execution.ts`, the `promotion` host action)
  requires the grant's `hostActions.promotion` with `allocationEvent` and
  `attemptField`. These come from the policy's role contract. A synthetic
  promoting role therefore needs its own policy, which cannot be the trusted
  Harness methodology.

**Consequence.** A faithful AC16 implementation denies the AC05 and AC09 smoke
grants. To make them pass, the implementer must pick one of these unstated
authority models, and each is incompatible with the others:

1. a test or config exemption, which undermines "production governed host" and
   creates an AC16 bypass;
2. a trust history written by the fixture, where an unspecified trust-root
   authority lets any project self-certify; or
3. adding the synthetic role to the Harness methodology, which is a methodology
   evolution under §7.

An evaluator freezing criteria now cannot say which model passes AC05, AC09, and
AC16 together.

**Smallest clarification requested.** Add a short paragraph to §2 or §6 that
states:

- how the host locates the trusted history for a project (Harness-only, or a
  per-project path);
- whether non-Harness or disposable projects are subject to the gate, and which
  authority may establish their trust root; and
- which configuration the smoke tests use, and why it still counts as the
  production host and registered adapter without weakening AC16.

## Material clarifications

### M1 (unchanged) — Pinned evaluator launch path and host revision

§7 requires an existing, pinned, independent evaluator launch path before
implementation.
`spikes/014c-governed-executor-integration/bootstrap/authority.md` (`05cf5d2`,
`fd60b07`) is that human bootstrap decision. It relies on a command profile that
runs `tools/governed-claude-bootstrap.ts` at `d447e38`. The current host accepts
such profiles through `HARNESS_EXECUTOR_CONFIG` (`src/index.ts`) and
`profile.command` (`src/kernel/host.ts`). AC04 and AC13 make the candidate host
reject such profiles.

The brief still names starting checkpoint `2c44416`, which predates this record.
It also does not say that evaluator preparation and verification run on a host
pinned before the candidate.

**Request:**

- cite `bootstrap/authority.md` as the §7 path;
- update the starting checkpoint; and
- state that the AC04 guard is a property of the candidate host, not of the
  pinned evaluator host.

### M2 (unchanged) — Boundary between production and test configuration

Fixture command profiles may remain "only to explicit tests" or through "an
explicitly isolated test configuration" (§2, §5). Today every profile, including
the fixtures used by `test/kernel.test.ts`, arrives through the same
`HARNESS_EXECUTOR_CONFIG` JSON. Some possible discriminators, such as an
environment flag or a profile field, could be enabled in a deployment and would
reopen the bridge path.

**Request:** state that command/fixture profiles are reachable only through
programmatic test construction of the host, not through any configuration or
environment that the production entry point accepts.

## Editorial

- **E1.** §3 says "if SDK and structured CLI cannot both consume it". Only one
  Claude route becomes production. The relevant pairing is the selected Claude
  adapter with the Codex adapter.
- **E2.** §3 `requestAction` does not say whether the host's existing `publish`
  action (`src/kernel/host.ts`) is in or out of the 014c worker protocol.
- **E3.** Revise the live brief to address B1 before requesting another
  readiness pass. Re-reviewing unchanged bytes cannot change the verdict.

## Review limitations

- I reviewed only public repository material. I did not inspect
  evaluator-private paths (`**/eval-spec.md`, `**/.hidden-test/**`,
  `**/.eval/**`).
- I did not consult the external Anthropic documentation, and I made no provider
  calls.
- I did not run `npm run check`, because no code changed.
- An attempt to summarize `workflow.jsonl` with a Python one-liner was denied by
  the sandbox approval policy. The ledger is not needed for this review, and I
  wrote nothing to it.

## Files changed

- `spikes/014c-governed-executor-integration/feedback.md` (this review)
- `spikes/014c-governed-executor-integration/preliminary/002/spike.md` (exact
  reviewed draft)
- `spikes/014c-governed-executor-integration/preliminary/002/feedback.md`
  (matching review)
- `spikes/014c-governed-executor-integration/manifest.md` (Run 002 entry)

## Checks run

- Confirmed that the SHA-256 of `spike.md` matches the host-bound input
  identity, and that `spike.md` is byte-identical to `preliminary/001/spike.md`.
- Ran `git diff fd60b07 HEAD --stat`: only Run 001 review artifacts changed.
- Re-verified the B1, M1, and M2 evidence in `harness.project.json`,
  `methodologies/`, `src/methodology-evolution.ts`, `src/kernel/host.ts`,
  `src/kernel/methodology.ts`, `src/kernel/execution.ts`, and `src/index.ts`.

## Verdict

**Not ready to freeze**
