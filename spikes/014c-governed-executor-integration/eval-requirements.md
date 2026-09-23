# Evaluation Requirements

Spike 014c — Governed Executor Integration. Prepared by the independent
evaluator (`evaluator` v13, pinned pre-014c authority, bootstrap path in
`bootstrap/authority.md`) against frozen `spike.md`
`sha256:0e86f034efd3b3f4217f5049fdc063c47f4b36147b309b9d6b4fbf1f095d2d18` and
frozen `design-map.md`
`sha256:9f98ebfcc201736737cb9e0f5dcebc29cafd1235a8e9465b02c81764013e82e1`.

These requirements add no product behavior. They state which already-frozen
public seams independent evaluation relies on, so the implementation can keep
them working.

## Testability Requirements

- **TR1 — Programmatic host construction stays available.**
  - Requirement: `startHarnessHost(port, options)` stays exported from
    `src/index.ts`. It must accept `options.governed` carrying `rootToken`,
    `project`, `executors`, `validators` and `privateDataRoot`, plus the
    existing top-level `legacyWorkflowExecution` flag. Port `0` must yield a
    usable `url`. A fixture-command `ExecutorProfile` passed directly this way
    stays constructible.
  - Reason: independent black-box checks of the §3 gate and legacy retirement
    construct the real host this way.
  - Source: Design Map §1, "Programmatic host construction is the only test
    seam".
  - Implementation impact: keep these existing fields working. Additive
    options are fine.
- **TR2 — The production project loader and Harness validators stay
  importable.**
  - Requirement: `loadProject(path)` stays exported from
    `src/kernel/configuration.ts`. It is the function that turns a project
    configuration file, including its new trust-history and validator-source
    declarations, into the `project` option.
    `harnessValidators` stays exported from
    `src/methodologies/harness-public.ts`.
  - Reason: the declaration shape is implementation freedom (Design Map §3),
    so the evaluator loads configuration only through the production loader.
    It never builds a `Project` by hand.
  - Source: Design Map §1 and §3. Both are existing public interfaces that the
    production entrypoint already uses.
  - Implementation impact: keep both at their current paths. Their internals
    are free.
- **TR3 — The production entrypoint uses its documented environment.**
  - Requirement: `node src/index.ts` honors `PORT` together with
    `HARNESS_ROOT_TOKEN`, `HARNESS_PROJECT_CONFIG`, `HARNESS_EXECUTOR_CONFIG`
    and `HARNESS_PRIVATE_DATA_ROOT`. It listens on `127.0.0.1:$PORT` unless it
    deliberately refuses to start.
  - Reason: this is the production configuration surface.
  - Source: Design Map §1, "Production configuration is the entrypoint
    environment".
  - Implementation impact: none beyond the Design Map.
- **TR4 — The trust gate works from a clean checkout of the committed
  candidate.**
  - Requirement: the committed `harness.project.json` and the repository's own
    git history must be enough for `POST grants` to pass the §3 gate. This must
    hold for a fresh clone of the candidate commit that shares all repository
    objects, with dependencies installed, and a newly created workflow
    directory under `spikes/`. The gate must not depend on untracked, ignored
    or machine-local files.
  - Reason: evaluation runs against disposable checkouts of the exact
    committed candidate.
  - Source: Design Map §3, and brief §7's requirement to commit the handoff.
  - Implementation impact: commit every file the gate needs.
- **TR5 — Refusals are deliberate and inspectable.**
  - Requirement:
    - A trust-equivalence denial carries error text that names the failure in
      words, such as trust, trust equivalence, trusted history or methodology.
      The text appears in the non-2xx response body, or in the error thrown by
      host or configuration loading.
    - A host that refuses to start because of production executor
      configuration exits with a message that names the configuration problem,
      such as adapter, provider, executor, profile, command or installation.
    - An uncaught programming error such as `TypeError` or `ReferenceError`,
      or a missing module, is never treated as a refusal.
  - Reason: this distinguishes a correct denial from a crash that merely
    happens to prevent work.
  - Source: Design Map §1 ("inspectable error") and §3 ("an error that
    identifies the trust-equivalence failure").
  - Implementation impact: wording is free within these limits.

## Evaluator Assumptions

- **EA1 — Executing a non-provider program counts as launching it.**
  - Assumption: running a program in any form counts as launching it. This
    includes running a generated, temporary-directory or otherwise non-provider
    program named through production configuration, including a
    provider-program override, even only for an availability or version probe.
  - Reason: Design Map §1 says such an executable cannot be designated as the
    launched program. Probing it would run exactly the makeshift code that the
    rule exists to exclude.
  - Evaluation impact: availability detection must not execute a configured
    program before deciding that it is a genuine installed provider.
- **EA2 — Real-provider evidence comes only from the committed smoke
  evidence.**
  - Assumption: the evaluator makes no provider call and uses no provider
    credential. Automated evaluation runs with provider programs and
    credentials absent.
  - Reason: brief §6 separates the deterministic and real-provider layers and
    forbids substitution between them.
  - Evaluation impact: AC05, AC09 and the real-provider parts of AC06, AC07
    and AC11 are judged only from committed `smoke-evidence.md` and the files
    it references, checked against Design Map §7. Missing or unproven live runs
    leave those criteria unsatisfied. That can never become PASS.
- **EA3 — Visible regressions are reviewed for genuineness.**
  - Assumption: where the brief requires deterministic tests whose mocking
    seams are implementation-owned, the evaluator runs the candidate's own
    suite with `npm run check`. It then reviews that each required behavior is
    exercised by a test that would fail if the behavior regressed.
  - Reason: Design Map §1, "Adapter mocking is internal to the
    implementation".
  - Evaluation impact: a trivially true or merely constant assertion does not
    count as coverage.
- **EA4 — History is compared against the brief-freeze commit.**
  - Assumption: unchanged-history invariants are compared byte for byte
    against brief-freeze commit `889507128fed99db3e0af9aed7856b4d30b934cd`.
  - Reason: Design Map "Invariants".
  - Evaluation impact: any edit to the governed Harness methodology inputs
    fails the invariant, as does any edit to existing Harness trust records or
    the 014a ledger. The governed methodology inputs are the policy, role
    contracts, role skills and `src/methodologies/harness-public.ts`.

## Blocking Questions

None.

## Environment Requirements

- The project's Node runtime and installed dependencies (`node_modules`). The
  runtime is the same one used for `npm run check`.
- `git` with the evaluated repository's complete object store, including every
  revision named in `methodologies/harness/trusted.jsonl`.
- Loopback TCP ports and a writable temporary directory for disposable
  checkouts.
- No provider CLI, provider credential, network access or paid API usage is
  required or used by the evaluator.
