# Brief Readiness Feedback — Spike 014n

Reviewed: `spikes/014n-finalized-verification-evaluator-correction-authority/spike.md`
(`sha256:6481e9bd4b0074b4965aea56e30a22a5b686a0460de4f2f5ad1d6014bec62c24`).

## Blockers

### B1. The brief assumes eligibility and consumption machinery that does not exist

The brief says to "extend the existing path" and requires the authority to
"authorize exactly one `evaluator-repair` successor" and to be "consumed when one
repair succeeds, while retaining ordinary failed/interrupted retry semantics".

Repository evidence:

- `src/kernel/execution.ts` `authorizeEvaluatorCorrection` (~L706-830) only
  validates and appends `human-evaluator-correction-authorized`.
- Nothing else in `src/` or `tools/` reads that transition. `src/workflow-run.ts`
  (~L847-857) makes `evaluator-repair` eligible only from a
  `correction-cycle-opened` event with `evaluatorRepair === true` or a
  `verification-finalized` event with classification `EVALUATOR_DEFECT`.
  `tools/legacy-workflow.ts` `evaluator-repair-recorded` (~L1334) likewise accepts
  only `EVALUATOR_DEFECT` or a human-rejection cycle.

So no consumer, one-shot consumption, or retry accounting exists to extend. The
spike actually has to add: (a) resolver eligibility in `workflow-run.ts`, (b) the
`evaluator-repair-recorded` validation path, and (c) a consumption/retry model.
Those are externally observable lifecycle and scope decisions. The brief does not
say which ledger facts define "authority available", "consumed", and "retry
still allowed", or whether the existing rejected-verification authority gains the
same consumption semantics (which would conflict with "remains unchanged").

Request: state that the spike adds eligibility and consumption (naming the
resolver/validator seams in scope), define the consumption predicate precisely
(event linkage from `evaluator-repair-recorded` to the authority; what a
failed/interrupted repair leaves available), and state whether the legacy
rejected-source authority is also covered by it.

### B2. Finalized-source request contract and evidence binding are unspecified

The existing request (`src/kernel/host.ts` ~L868, `src/kernel/execution.ts`
~L706) is bound to a rejected `kernel.process` event (`rejectionEvent`,
`update.process === "failed"`) plus a committed artifact. A finalized source has
none of that. The brief lists bound facts (workflow, candidate, revision,
attempt, execution, semantic result, artifact identity, classification) but not:

- the request shape: a discriminated union on the same
  `/evaluator-corrections` route, or optional fields; what replaces
  `rejectionEvent`; how the old shape stays byte-compatible;
- how the finalized event is matched (compare `authorizeCorrectionCycle`, which
  matches `roleGrant`, `semanticResult`, `commit`, `artifactCommit`, `path`,
  `identity`); whether the artifact commit/path are re-read from git as the
  rejected path does;
- the shape and fields of the recorded authority: the model type
  `HumanEvaluatorCorrectionAuthority` (`src/kernel/model.ts`) has a
  `rejectionEvent` and fixed fields and no source classification or
  finalized-event reference;
- the duplicate key. Today it is `execution`+`attempt`; a finalized and a
  rejected source can share them.

Request: specify the request/authority shape for the finalized variant, the exact
event fields matched, and the duplicate-detection key.

### B3. "Stale or superseded verification" is undefined

Required tests refuse "stale or superseded" verification, but the brief does not
define the condition (a later `verification-finalized`/allocation, a new
evaluator revision, a new implementation handoff, a later correction cycle, a
prior repair already recorded?). It is a fail-closed rule that implementations
and the evaluator would read differently.

Request: enumerate the ledger conditions that make a finalized source stale.

## Material clarifications

- **M1. Which finalized results qualify.** The brief says "BLOCKED" in the
  motivation but requires only "an exact canonical finalized verification" in
  the rule. State whether PASS, FAIL, or a source already classified
  `EVALUATOR_DEFECT` are admissible, or only BLOCKED (PASS already has
  `authorizeCorrectionCycle`).
- **M2. Slot and cycle accounting.** State whether the authorized repair counts
  against the in-cycle evaluator-correction threshold noted in the 014m manifest
  ("second in-cycle correction ... successor path").
- **M3. Application step ownership.** The 014m application needs root authority
  and ledger writes in another workflow (its `workflow.jsonl` is not readable
  here), plus a "trusted runtime availability" step after acceptance. Say who
  performs it, whether it is part of this spike's acceptance or a later
  human/Harness action, and what evidence proves it.
- **M4. Human diagnosis.** "Explicit human diagnosis" should name the field
  (`reason`, non-empty today) and state whether any further validation is
  expected.

## Editorial

- "if it can be extended safely" should become a decision (extend, or justify why
  not) so the evaluator can judge it.
- The "stop there" sentence in the 014m application could be stated as an
  acceptance criterion.

## Verdict

**Not ready to freeze**

Limitations: the 014m workflow ledger is not readable in this environment, so its
bound identities were not re-checked. Evaluator-private material was not
inspected. Files changed: `feedback.md`, `preliminary/001/`, `manifest.md`.
Checks run: static reading of the kernel, host, workflow-run, legacy-workflow, and
test sources; no tests executed.
