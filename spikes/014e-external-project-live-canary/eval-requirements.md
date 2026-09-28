# Evaluation Requirements

Spike 014e — External-Project Live Canary and Repository Isolation. Prepared
by the independent evaluator (`evaluator` v14) under trusted methodology
`sha256:5298863efb815c958488093a10572333b3e3d4c4e660158f931dfc1d0b05d568`
against frozen `spike.md`
`sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`
(committed at `ec42cef7820d3274b3dffaf907798a6db2c43e22`) and frozen
`design-map.md`
`sha256:997690bb15a9436beb08fc547881b005b80ce3d010591488dd21c490a40f97c0`
(committed at `d365138b49d1991d5c6d320e132c712da6517c7f`). This is evaluator
revision `001`.

These requirements add no product behavior. They name the already-frozen or
already-public seams that independent evaluation relies on, so that the
implementation keeps them working. Everything the Design Map leaves free stays
free.

## Testability Requirements

- **TR1 — One configuration loader for both project kinds.**
  - Requirement: `loadProject(path)` stays exported from
    `src/kernel/configuration.ts`. It loads both the unchanged
    `harness.project.json` and an external configuration. An external
    configuration is a `schemaVersion: 1` file that adds the D2
    `methodologyRoot` field (absolute or relative to the file) and may add the
    D5 `origin` field. `policy`, `trustedHistory` and `validatorSources` are
    given relative to the methodology root. `root`, `workflowDirectory`,
    `ledgerName`, `workspaces` and `remotes` are given as today. Workspace
    entries keep the `{id, path, mode, exposure}` shape. A private evaluation
    workspace is a non-`public` exposure. The configuration file can live
    outside both repositories.
  - Reason: external projects are built through this one field (D2), and the
    evaluator builds disposable external projects with it.
  - Source: design-map.md D2 and D5; the existing configuration interface.
  - Implementation impact: additional optional fields are fine. No second
    configuration file, registry or environment variable may be required.
- **TR2 — Programmatic governed host construction stays sufficient.**
  - Requirement: `startHarnessHost(port, options)` stays exported from
    `src/index.ts`. `options.governed` with `rootToken`, `project` (the
    `loadProject` result), `executors`, `validators` (`harnessValidators` from
    `src/methodologies/harness-public.ts`) and `privateDataRoot` is enough to
    host both self-development and external projects. Any new option is
    optional. Port `0` yields a usable `url`. The authenticated root routes
    `POST`/`GET /governed/<workflow>/grants` and
    `POST /governed/<workflow>/continue` with
    `{ workflowGrant, mode: "spawned", role }` keep their request shapes. A
    successful grant or continuation returns `201`. The continuation response
    keeps carrying the allocated role grant.
  - Reason: root separation, grant binding, fail-closed refusal and
    containment are checked black-box through the production host path. Each
    host runs in its own process, with its working directory at the Harness
    runtime checkout, as `npm start` does.
  - Source: design-map.md D2–D5 and D4 Testability seam; the existing host
    interface.
  - Implementation impact: internals are free. An invalid configuration may be
    refused by `loadProject`, by `startHarnessHost`, or by a non-2xx grant or
    continuation response. It must never be refused only after a provider
    process was launched. D5 origin refusals happen no later than host start,
    as D5 states.
- **TR3 — Grant records stay observable.**
  - Requirement: a granted workflow's ledger stays at
    `<project root>/<workflowDirectory>/<workflow>/<ledgerName>`. It keeps
    recording the bound kernel definition as a `kernel.definition` event
    (`policyIdentity`, and `roles.<role>` with `contractIdentity` and
    `skill.{path, identity}`) and grants as `kernel.workflow-grant` events. The
    D3 values appear literally in the host-written grant record. That record is
    returned by `GET /governed/<workflow>/grants` or written in that ledger. The
    values are the methodology repository top-level path, the trusted manifest
    identity and revision, and, for external projects, the 40-hex Harness
    runtime commit.
  - Reason: D3 binding and pinning are checked from host-written records.
  - Source: design-map.md D3 ("host-written and canonical"); the existing
    ledger form.
  - Implementation impact: field names and where the values sit inside the
    record are free.
- **TR4 — Provider programs stay located on the host PATH.**
  - Requirement: registered adapter programs (`claude`, `codex`) are still
    located by name on the host `PATH`, outside temporary directories and
    workspaces. Any provider readiness check the host makes before launch goes
    through that located program. Before launching, the host needs no provider
    network access and no credential validation beyond the presence of the
    provider's own configuration material under `HOME`. Granted workspaces are
    visible inside the containment at the absolute paths given in the Role
    Grant.
  - Reason: D4 containment is probed through the real launch path with a
    fixture command routed through the same wrapper, as D4 allows.
  - Source: design-map.md D4 (Visible filesystem, Testability seam); the
    existing adapter location rule.
  - Implementation impact: bwrap arguments, the scratch `HOME` layout and how
    credentials are copied or bound stay free.
- **TR5 — A clean clone of each committed candidate is sufficient.**
  - Requirement: the committed H1, a clone that shares all repository objects,
    and the installed dependencies are enough to run the full checks and to
    host both project kinds. Nothing may depend on untracked, ignored or
    machine-local files in the Harness checkout.
  - Reason: evaluation runs against disposable clones of the exact commit.
  - Source: brief §4 A3/A5 (immutable H1 runtime).
  - Implementation impact: commit every file the checks and the host need.
- **TR6 — The evidence checkpoint is structurally identifiable.**
  - Requirement: H1E is the only commit, reachable from a ref of the evaluated
    Harness repository, whose sole parent is H1 (D7). It carries the D6
    `index.json`. The supervisor's recorded human authorization that names
    H1E is available to Evaluator Verify as committed public content or a
    workflow-ledger event.
  - Reason: D7 rules 1–5 are applied without guessing and without `HEAD`.
  - Source: design-map.md D6, D7 and D8.
  - Implementation impact: none beyond D6–D8.
- **TR7 — Committed evidence is independently checkable.**
  - Requirement: the public-safe evidence gives exact identities for the
    AC08 items (Stockdif commits S1…, the frozen product brief, the Stockdif
    Design Map, the evaluator revision, the verification result, the promotion
    record, As-Built and Outcome), the H1 runtime recorded by the Stockdif
    grant, the Stockdif canonical ledger transitions, the governed allocation
    count against the bound of 10, and human interventions. It also gives
    adapter, model, effort and version observations, each marked as confirmed
    or unconfirmed. Unavailable measurements are `"unknown"`. Where the
    committed bytes support it, the identities must recompute.
  - Reason: the evaluator cannot reproduce the live run.
  - Source: brief §4 Track B step 5, §5 and AC06–AC10; design-map.md D6.
  - Implementation impact: none beyond D6.

## Evaluator Assumptions

- **EA1 — Live claims come only from committed evidence.**
  - Assumption: the evaluator makes no provider call and uses no provider
    credential. Automated evaluation runs offline.
  - Reason: brief §4 and §6 forbid manufacturing external-run evidence.
  - Evaluation impact: missing or unproven live evidence leaves AC06–AC09
    unsatisfied. A truthfully blocked or failed canary is judged as such and
    never becomes a product success.
- **EA2 — Containment is probed with a placeholder provider.**
  - Assumption: the evaluator runs each host with `HOME` set to a disposable
    fixture home that holds placeholder provider configuration and
    credential-shaped files. It places a placeholder program named after a
    registered adapter first on `PATH`, outside temporary directories. The
    placeholder answers version queries like an installed program.
  - Reason: D4 requires black-box evidence through the host launch path.
  - Evaluation impact: a probe that inspects only argv is not evidence. The
    protected-role positive case is judged from visible tests and the live
    Stockdif evidence.
- **EA3 — Visible regressions are reviewed for genuineness.**
  - Assumption: the evaluator runs `npm run check` on a clean clone of H1. It
    requires the host maintenance 003 recovery-authority regression to pass.
    It confirms that the D2–D5 behaviors have visible deterministic tests that
    would fail if the behavior regressed.
  - Reason: brief §4 A2–A4 and AC05.
  - Evaluation impact: tautological assertions, and tests that never execute
    the behavior, do not count.
- **EA4 — Unchanged methodology is compared with the brief freeze.**
  - Assumption: trusted history, policy, contracts, role skills and the
    orchestrator at H1 are compared with brief-freeze commit
    `ec42cef7820d3274b3dffaf907798a6db2c43e22`.
  - Reason: design-map.md D1 and brief §4 A3.
  - Evaluation impact: any change fails AC01/AC05 unless a separately
    authorized methodology-evolution record justifies it.
- **EA5 — Namespaces are available to the evaluator.**
  - Assumption: evaluation runs on Linux where `bwrap` and unprivileged user
    namespaces work for the evaluator's own processes.
  - Reason: D4 containment cannot be observed otherwise.
  - Evaluation impact: if namespaces are unavailable in the verification
    environment, the affected cases are an infrastructure failure, not a
    `PASS`.
- **EA6 — Later gates are not part of verification.**
  - Assumption: the 014e archive promotion, As-Built, human acceptance and
    Outcome follow Evaluator Verify.
  - Reason: brief §4 and AC09.
  - Evaluation impact: verification judges the H1 behavior and the imported
    Track B evidence. Its result separates architecture success, product
    success and known limitations.

## Blocking Questions

None.

## Environment Requirements

- The project's Node runtime and installed dependencies, which are the same
  ones used for `npm run check`.
- `git` with the evaluated repository's complete object store, including the
  brief-freeze commit, the trusted revisions, H1 and a ref that reaches H1E.
- Linux `bwrap` with working unprivileged user namespaces.
- Loopback TCP ports, a writable temporary directory, and one writable
  directory outside temporary directories for the placeholder provider
  program.
- No provider CLI, provider credential, network access or paid API usage is
  required or used by the evaluator.
