# Brief Readiness — Spike 014c Governed Executor Integration

- Skill: `brief-readiness` contract version 4
- Reviewed brief: `spikes/014c-governed-executor-integration/spike.md`
  `sha256:08da03d098ab511e467eea9bbc1d8ff90e5a7a8b97a3982d1b7037e35c245dc0`
- Repository state reviewed: `feat/spike-014` at
  `fd60b07f9bac407adeb4ff4ba5eb616672d14b46`

## Summary

The brief is mostly well-bounded. It clearly assigns ownership to the host,
adapter, worker, and orchestrator. It fixes a decision rule for choosing between
the SDK and the CLI, and it states the evidence layers without allowing one to
substitute for another. Most remaining questions are ordinary implementation
freedom.

One contract decision is unresolved. The trust-equivalence gate added at
`fd60b07` (§2 and AC16) has no stated scope. It is unclear how it applies to the
synthetic real-provider smoke tests that AC05 and AC09 require to run through
the _production_ governed host. As written, a faithful implementation of AC16
would deny those smoke tests. An implementer could also satisfy both only by
making an unstated authority decision. That decision would then fall to the
Design Map, the implementer, or the evaluator.

## Blocker

### B1 — The trust-equivalence gate does not say how it applies to synthetic smoke-test methodologies or non-Harness projects

**Brief evidence.**

- §2 (the paragraph beginning "Before a new production Workflow Execution
  Grant"): the host must prove that the current kernel definition is the
  component-equivalent projection of "the append-only trusted methodology
  manifest at its recorded revision". Any other definition is denied.
- AC16 repeats this requirement for new governed workflow grants.
- §6 and AC05: one real Claude run and one real Codex run must be "launched
  through the production governed host and registered adapter". Each run
  receives "an exact pinned, trivial synthetic skill/contract".
- §3 and AC09: a "deliberately simple, synthetic protected role" produces a
  predeclared promotion plan, and the host records the action and transition.

**Repository evidence.**

- There is exactly one trusted history, `methodologies/harness/trusted.jsonl`.
  It records only Harness methodology identities.
- `buildMethodologyManifest` in `src/methodology-evolution.ts` defaults to
  `methodologies/harness/policy.json` and to a fixed `VALIDATOR_SOURCES` map
  (`src/methodologies/harness-public.ts`).
- The project configuration has no trust-history field (`harness.project.json`,
  `loadProject` in `src/kernel/configuration.ts`).
- `src/kernel/host.ts` currently performs no trust check. The configured project
  policy is loaded directly through `loadDefinition` in
  `src/kernel/methodology.ts`.
- A synthetic role with a promotion action needs its own `policy.json` and
  contract, including `contract.promotion` with `allocationEvent` and
  `attemptField` (`kernel.promote` in `src/kernel/execution.ts`). That policy
  cannot be the trusted Harness methodology.

**Consequence.** An implementer must invent one of several incompatible answers,
and each changes authority or evaluation fairness:

1. **Test exemption.** An exemption or configuration flag skips the gate for
   smoke projects. The smoke runs then arguably no longer use the "production
   governed host" that AC05 and AC09 require. The flag also becomes a bypass of
   AC16.
2. **Fixture-written trust history.** The disposable project carries its own
   trust history, written by the test fixture. Unless the brief says who may
   create that history and how the host finds it, any project configuration
   could point at a self-issued trust root. That would defeat AC16.
3. **Harness methodology promotion.** The synthetic role is added to the Harness
   methodology. That is a methodology evolution requiring independent checks and
   human promotion (§7), which is clearly not intended.

An evaluator that freezes criteria now cannot tell which of these answers counts
as passing AC05, AC09, and AC16 together.

**Smallest clarification requested.** Add a short paragraph to §2 or §6 that
states:

- how the host locates the trusted methodology history for a governed project
  (Harness-only, or a per-project configured path);
- whether grants for non-Harness or disposable projects are subject to the gate,
  and what authority may establish their trust root;
- which configuration the synthetic real-provider smoke tests use, and why that
  configuration still counts as the production governed host and registered
  adapter for AC05 and AC09 without weakening AC16.

## Material clarifications

### M1 — Independent evaluator launch path and host revision during preparation and verification

**Brief evidence.** §7 requires "a separate existing, pinned, independent
evaluator launch path before implementation". It also forbids making "the
candidate adapter the evaluator's authority". The starting checkpoint on line 6
is `2c444160ecb51f5005c0f1016c67877b9f571052`.

**Repository evidence.**

- Later commits added `tools/governed-claude-bootstrap.ts` (`d447e38`) and
  `spikes/014c-governed-executor-integration/bootstrap/authority.md` (`05cf5d2`,
  `fd60b07`).
- The authority record is the human bootstrap decision that §7 anticipates.
- The bootstrap is selected as a _command_ executor profile. The current host
  accepts such profiles through `HARNESS_EXECUTOR_CONFIG` (`src/index.ts`;
  `profile.command` in `src/kernel/host.ts`).

**Consequence.** AC04 and AC13 must make a production host reject
caller-provided command profiles. Suppose the host is restarted from candidate
code during 014c. Either it rejects the pinned evaluator bootstrap, or the
candidate host and adapter become the evaluator's launch authority. The brief
implies that verification uses a host at a pinned pre-candidate revision, but it
does not say so.

**Clarification requested.**

- Cite `bootstrap/authority.md` as the §7 launch path.
- Update the starting checkpoint to the revision that contains it.
- State that evaluator preparation and verification run on a governed host
  pinned before the candidate. AC04's mechanical guard is a property of the
  candidate host and does not apply to that pinned evaluator host.

### M2 — Observable boundary between the "production" configuration and the "explicitly isolated test configuration"

**Brief evidence.**

- §2: fixture command profiles remain available "only to explicit tests".
- §5 and AC04: a _production_ allocation targeting an unregistered executable
  cannot start, while fixtures remain possible "only through an explicitly
  isolated test configuration".

**Repository evidence.** Today, every profile, including `command` fixtures, is
supplied by the same JSON file (`HARNESS_EXECUTOR_CONFIG` in `src/index.ts`).
`test/kernel.test.ts` uses `tools/fixtures/governed-executor.ts` through that
command surface.

**Consequence.** Implementers could choose several discriminators: an
environment flag, a profile field, a constructor-only option, or a separate
entry point. Some of these could be switched on in a real deployment, which
would reopen the bridge path that AC13 closes.

**Clarification requested.** State the likely intent. Fixture or command
profiles should be reachable only through programmatic test construction of the
governed host, not through any configuration or environment accepted by the
production entry point.

## Editorial

- **E1.** §3 says "if SDK and structured CLI cannot both consume it reliably".
  Only one Claude route becomes production (§1). The requirement that matters is
  that the selected Claude adapter and the Codex adapter consume the same worker
  interface. Consider rewording.
- **E2.** §3's `requestAction` row names promotion and denied actions. The host
  also exposes a host-mediated `publish` action (`src/kernel/host.ts`). A clause
  saying whether `publish` is in or out of the worker protocol for 014c would
  prevent needless divergence. It does not block freeze.

## Review limitations

- I reviewed only public repository material. I did not inspect
  evaluator-private paths (`**/eval-spec.md`, `**/.hidden-test/**`,
  `**/.eval/**`).
- I did not consult the external Anthropic documentation linked in §1, and I
  made no provider calls. The §1 authentication and billing position is recorded
  as implementation-time evidence, not as a freeze-time finding.
- I did not run `npm run check`, because no code changed.

## Files changed

- `spikes/014c-governed-executor-integration/feedback.md` (this review)
- `spikes/014c-governed-executor-integration/preliminary/001/spike.md` (exact
  reviewed draft)
- `spikes/014c-governed-executor-integration/preliminary/001/feedback.md`
  (matching review)
- `spikes/014c-governed-executor-integration/manifest.md` (run entry)

## Checks run

- Confirmed that the SHA-256 of the reviewed `spike.md` equals the host-bound
  input identity.
- Inspected the Git history of the brief and the bootstrap authority (`aac28da`,
  `d447e38`, `05cf5d2`, `fd60b07`).
- Traced the brief's requirements to the governed host, kernel execution and
  promotion, methodology loading, trusted-history and manifest construction,
  project configuration, the production entry point, and the bootstrap tool.

## Verdict

**Not ready to freeze**
