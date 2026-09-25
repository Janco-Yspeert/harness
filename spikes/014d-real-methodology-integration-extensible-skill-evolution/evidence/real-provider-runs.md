# 014d real-provider and observed-orchestrator runs

**Status: OUTSTANDING. No real-provider or observed-orchestrator run has been
performed for this candidate. Nothing below is a claim that one happened.**

The implementation role had no provider CLI, no provider credentials and no
provider network access in its sandbox (`claude` was not on `PATH`). The
canonical human response `b90a79da-738b-4df5-ac8b-e1e65c589a1a` (to request
`4fef0137-e8f7-4bfd-9ba9-ed7951a0273a`) instructed that these proofs be
recorded as outstanding. The orchestrator will run them **only through the
governed host**. They must not be run by direct provider invocation, and no
evidence may be fabricated.

Until these records are completed with real evidence, AC02, AC03, AC05 and the
real-provider part of AC13 are unproven (eval-requirements EA1). The
deterministic layer (b) in `fidelity-matrix.md` is scripted compliance and does
not substitute for any of them (C7).

## Candidate identities to exercise

These are the exact candidate bytes, from the implementation handoff commit
that contains this file:

| Subject | Path | Contract version | `sha256` |
| --- | --- | ---: | --- |
| Orchestrator (test subject only; C6) | `skills/orchestrator/SKILL.md` | 3 | `4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d` |
| Evaluator (AC05 subject) | `skills/evaluator/SKILL.md` | 14 | `7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa` |
| Brief Readiness | `skills/brief-readiness/SKILL.md` | 5 | `439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c` |
| Design Map | `skills/design-map/SKILL.md` | 4 | `238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136` |
| Implementation | `skills/implementation/SKILL.md` | 5 | `8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8` |
| As-Built | `skills/as-built/SKILL.md` | 4 | `dc3c422691fb36a292b49db411ff9aefd5199f8602b73ef87428fd0a09ea534b` |
| Outcome | `skills/outcome/SKILL.md` | 5 | `2ab64cee141d06a88ff04dc540ddfa7a15c364e07bb717b7fab70c15460b7e82` |

Identify each one as `git:<handoff-commit>:<path>`. The orchestrator
identity observed in `host-maintenance-001.md` (`sha256:88995416…`) was an
earlier working-tree state. This implementation superseded it by adding the
C6 acceptance and run-evidence wording.

The As-Built identity changed in the promotion-to-As-Built repair. The
earlier candidate bytes were `sha256:9b26849a…`. They required an
already-committed `evaluation/promotion.json`, but the host's promotion action
leaves that file untracked. The repaired contract, still version 4 and not yet
trusted, has As-Built validate the file and commit it alone. No run evidence
from the earlier bytes is imported or claimed here.

## Required runs and the fields each record must contain

Each record must give:

- the exact skill identity above;
- the runtime and its installed version;
- the confirmed model and effort, or "unavailable";
- the host results, action statuses and ledger event ids;
- safe diagnostics only.

### R1 — Real public role under a production adapter (AC02, AC13)

- Run at least one actual public role, for example Brief Readiness or Design
  Map on a disposable fixture spike. Use a Workflow Execution Grant through
  `POST /governed/<workflow>/grants` and `/continue` with a registered Claude
  or Codex profile.
- Record: `kernel.executor-confirmed` (model, provider version), the
  `kernel.result`, the artifact transition, and the committed artifact
  identity.

### R2 — Candidate evaluator as an AC05 test subject (AC05, AC13, C4)

- Use an isolated fixture project with its own initialized trust root. It must
  not be able to establish trust over the production candidate.
- Run the candidate evaluator skill (identity above) as `evaluator-verify`
  under the production adapter and host, so that it:
  1. persists `.eval/promotion-plan.json`;
  2. builds the manifest with `tools/archive-manifest.ts`;
  3. publishes `verification-result.json` with `promotionPlan`;
  4. submits `PASS`;
  5. calls `requestAction(promotion)` once;
  6. reports only the returned host status.
- Record:
  - the plan identity;
  - the archive manifest (mapping count, which also feeds
    `promotion-bound.md`);
  - the `evaluation/promotion.json` identity;
  - the action status and `promotion-recorded` event;
  - byte-check results against the source files.
- Trusted N then independently evaluates this fixture evidence. The candidate
  never certifies itself.

### R3 — Observed orchestrator run (AC02, AC03; C6)

- Use the candidate orchestrator (identity above) as a bounded test subject in
  an isolated fixture. It must never supervise the 014d workflow itself.
- Record:
  - the exact orchestrator instruction identity;
  - the runtime and version;
  - the model, or "unavailable".
- Observe each of these:
  - An ordinary actionable request selects the governed workflow without
    extra incantations.
  - One initial bounded grant carries several eligible machine phases with no
    additional permission prompt.
  - A real human gate stops and reports the exact pending decision.
  - A read-only request stays read-only.
  - An explicit stop stops.
  - A missing adapter, permission or authority is reported as a blocker, not
    worked around.

## Results

| Run | Status | Evidence |
| --- | --- | --- |
| R1 | not run | — |
| R2 | not run | — |
| R3 | not run | — |
