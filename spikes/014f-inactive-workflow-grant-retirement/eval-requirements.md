# Evaluation Requirements

Spike 014f — Inactive Workflow Grant Retirement. Authority: `spike.md`
(`sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`) and
`design-map.md`
(`sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`).

## Testability Requirements

No new seam is introduced. Independent evaluation drives only the public
surfaces the frozen Design Map already names, so the implementation must
provide them exactly as specified there:

- **TR1** — `ExecutionKernel.retireWorkflowGrant(workflow, { workflowGrant, reason })`
  (Design Map shared contract 2) returns the recorded event evidence, and
  throws on every refusal.
  - Reason: the kernel is the only writer of the event and the authoritative
    lifecycle interface.
  - Impact: none beyond Design Map; the return value carries exactly the
    evidence fields named in shared contract 1 (`workflowGrant`, `origin`,
    `reason`).
- **TR2** — the ledger event `kernel.workflow-grant-retired` with evidence
  `{ workflowGrant, origin: "human", reason }`, readable through the existing
  `ExecutionKernel.events()` (shared contract 1).
  - Reason: "directly inspectable" durable evidence (brief §1, AC02).
  - Impact: no `recovery` field, no other transition substituted.
- **TR3** — host operation `POST /governed/<workflow>/grant-retirements`
  (201 with the evidence on success; existing 409 `{ error }` envelope on
  refusal; root bearer only) and root-only `GET` on the same path that
  lists retirement evidence for the workflow (shared contract 3).
  - Reason: the human/root authority boundary and its listing (AC01).
  - Impact: the `GET` body shape is implementation freedom, but it must
    include each retired grant identity.
- **TR4** — existing public interfaces keep their current signatures and
  behavior (`authorize`, `register`, `allocate`, `process`, `ask`, `respond`,
  `result`, `diagnostic`, `inspect`, `executions`, `execution`, `grant`,
  `events`, `authorityBasis`, `startHarnessHost`, and the `grants`, `resolve`,
  `continue`, `executions/<id>` host operations).
  - Reason: evaluation arranges and observes state only through these
    existing interfaces and never edits a ledger directly.
  - Impact: none beyond AC07.

## Evaluator Assumptions

- **EA1** — Evaluation uses temporary Harness-owned fixture projects with a
  scripted role policy and repository fixture executor; no Stockdif state, live
  provider, or network is used. Reason: AC08. Impact: none on implementation.
- **EA2** — Existing refusal semantics for a retired grant are judged by
  observable outcome: a `denied` resolution, a thrown/409 refusal, and an
  unchanged ledger. Only the markers "retired" and "already retired" and the
  absence of the pre-implementation recovery wording are required in messages
  (Design Map implementation freedom). Reason: message wording is free.
- **EA3** — An empty or missing reason, or missing grant identity, is refused
  without appending. Reason: the Design Map requires a non-empty reason.
- **EA4** — Host start-up recovery may interrupt executions that were left
  active by a prior host process (existing behavior); evaluation therefore
  starts hosts before creating live work it wants to remain active.
- **EA5** — Automatic continuation is a consequence of the shared liveness
  predicate the Design Map mandates; it is evaluated through the identical
  continuation request the host issues, plus the public regression suite.
- **EA6** — The required public regression suite is the repository's normal
  checks at the candidate commit: `npm test`, `npm run typecheck`,
  `npm run lint`, `npm run format:check`, and `git diff --check`.

## Blocking Questions

None.

## Environment Requirements

- Node.js `>=24.12.0` with the repository's installed dependencies, `git`, and
  a writable temporary directory (`HARNESS_PROOF_ROOT` may relocate it).
- Evaluation runs with the public project root as the working directory and
  uses the project's own runtime and configuration; no external services.
