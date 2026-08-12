---
name: outcome
description: Synthesize the complete historical outcome of a finished Harness spike after implementation, evaluation, and review. Use when producing or updating outcome.md for a completed spike.
---

# Spike Outcome

Create the historical outcome record for a completed Harness spike.

The outcome is a synthesis of what actually happened during the spike.

It is not:

- an implementation task;
- another evaluation;
- a code review;
- a retrospective justification of the implementation;
- a polished success narrative.

Preserve failures, ambiguity, unexpected complexity, deferred risks, and process problems when they materially contributed to what was learned.

## Preconditions

Use this skill only after the spike has completed:

1. implementation;
2. successful independent evaluation and promotion;
3. independent code review.

If the spike has not successfully completed evaluation, do not write a final outcome.

Report which prerequisite is incomplete instead.

## Target

Use the spike directory identified by the user.

Write only:

`<spike>/outcome.md`

unless the user explicitly requests another change.

Do not modify:

- implementation code;
- tests;
- `spike.md`;
- `eval-requirements.md`;
- evaluation specifications;
- evaluation results;
- historical evaluation attempts;
- review artifacts;
- `AGENTS.md`;
- `GOALS.md`;
- ADRs;
- skills;
- other project documentation.

Recommendations for changes to those artifacts belong in the outcome as follow-up suggestions.

## Read Authority

For the target completed spike, read all available artifacts needed to reconstruct what actually happened.

This includes normally restricted evaluation artifacts that have been promoted into the target spike's permanent historical record.

Inspect where relevant:

- `spike.md`;
- `eval-requirements.md`;
- final promoted `evaluation/eval-spec.md`;
- final promoted `evaluation/eval-result.md`;
- promoted hidden tests and their manifest;
- archived blocked or failed evaluation attempts;
- code-review findings;
- existing `outcome.md` when updating rather than creating;
- implementation and visible tests;
- relevant git commits and diff/history;
- `AGENTS.md`;
- relevant `GOALS.md`, architecture documentation, and ADRs.

Restricted evaluation access granted to this skill is for historical synthesis only.

Do not inspect active evaluator-private workspaces outside the target completed spike unless explicitly authorized by the user.

Do not modify any restricted evaluation artifact.

## Source Discipline

Ground every material conclusion in the spike's actual artifacts, implementation, repository history, or established project documentation.

Distinguish clearly between:

- what the spike proved;
- what was observed;
- what was decided;
- what remains uncertain;
- what was deliberately deferred;
- what is merely recommended for future work.

Do not infer that something was proven merely because it was implemented.

Do not infer that something was correct merely because evaluation ultimately passed.

Do not erase earlier blocked or failed attempts from the historical account when they produced meaningful lessons.

Avoid reproducing large sections of existing artifacts. Synthesize them.

## Determine the Spike Result

Establish the final result from the promoted evaluation and review record.

Normally this should be:

`PASS`

Do not use `PASS` merely because implementation completed.

Record the final implementation commit and final evaluation result when available.

## Write `outcome.md`

Use the following structure.

# Spike NNN: <Name> — Outcome

## Result

State the final result concisely.

Include, where available:

- final implementation commit;
- final evaluation result;
- whether code review completed successfully.

## What Was Proven

Describe only the meaningful behaviours, boundaries, or architectural assumptions that this spike demonstrated.

Prefer statements such as:

- Harness can...
- The spike demonstrated...
- Evaluation confirmed...

Do not merely repeat every requirement from `spike.md`.

Focus on what became established knowledge because the spike succeeded.

## Implementation Summary

Summarize the implemented shape of the solution.

Include only architecture or implementation decisions useful to understanding the resulting system.

Do not reproduce the diff or provide a file-by-file changelog.

Do not describe incidental implementation details unless they became important during evaluation or review.

## Evaluation Outcome

Summarize the final independent evaluation.

Include:

- whether the final frozen evaluation passed;
- significant behavioural areas exercised;
- any important limitations of the evaluation;
- evaluator defects or specification issues that materially affected the spike.

Do not reproduce the evaluation report.

## Evaluation History

Include this section when there were meaningful earlier blocked, failed, or revised evaluation attempts.

Summarize:

- what happened;
- why the attempt did not produce a final PASS;
- how the issue was classified;
- what deliberately changed before evaluation resumed.

Preserve the distinction between:

- implementation failure;
- evaluator defect;
- specification ambiguity;
- infrastructure failure;
- specification drift.

Do not rewrite an evaluator defect as a product defect or vice versa.

## Decisions Made

Record material decisions made during the spike that affect how Harness should be understood going forward.

For each significant decision, briefly capture:

- the decision;
- why it was made;
- whether it is intended as a durable architectural decision or a spike-local constraint.

Do not silently elevate a spike-local decision into permanent project architecture.

## Discoveries

Record material facts learned during implementation, evaluation, or review that were not adequately understood when the spike began.

A discovery describes something learned about reality, the technology, the existing system, or the AI-development process.

Keep discoveries separate from decisions.

For example:

- a runtime behaves differently from an assumption made during planning;
- an operating-system mechanism has an unexpected constraint;
- an evaluation technique produces ambiguous observations;
- an existing architectural boundary behaves differently than expected.

## Deferred Concerns

Record known concerns intentionally left unresolved.

For each material item include:

- what remains unresolved;
- why it was deferred;
- why it may matter later.

Do not convert every non-goal into deferred work.

Include only concerns that emerged as meaningful future risks, requirements, or architectural questions.

## AI-Development Process Findings

Include this section only when the spike produced meaningful lessons about the Harness AI-first workflow.

Potential subjects include:

- implementation-readiness review findings;
- evaluator quality or evaluator defects;
- hidden-test design;
- context separation;
- skill changes;
- specification quality;
- review effectiveness;
- workflow friction.

State both successes and failures plainly.

Do not portray process failures as evidence that the process worked merely because they were eventually discovered.

When the process was changed during the spike, state:

- what failed or proved inadequate;
- what was changed;
- why.

## Recommended Follow-ups

List only concrete follow-ups supported by what was learned during the spike.

Distinguish between:

- likely future implementation spikes;
- project-documentation changes;
- AI-workflow improvements;
- architectural questions requiring later investigation.

Recommendations are not automatically approved project decisions.

Do not edit other project artifacts to implement these recommendations.

## Provenance

Record available references to the artifacts from which the outcome was synthesized.

Include where available:

- spike brief;
- public evaluation requirements;
- final implementation commit;
- final evaluation specification;
- final evaluation result;
- archived evaluation attempts;
- code-review artifact or commit;
- relevant ADRs created during the spike.

Use repository-relative paths where practical.

## Historical Integrity

The outcome must remain an honest historical record.

Do not:

- hide unsuccessful attempts that materially affected the spike;
- describe evaluator defects as implementation defects;
- describe implementation defects as evaluator defects;
- claim deferred behaviour was implemented;
- claim an evaluation proved something outside its coverage;
- turn unexpected discoveries into claims that they were planned from the start;
- rewrite earlier decisions to make the final architecture appear inevitable;
- invent rationale that is not supported by the available record.

If evidence is incomplete or contradictory, say so.

## Completion

Before finishing:

1. Confirm the final outcome agrees with the promoted evaluation result.
2. Confirm important earlier evaluation attempts have been represented when relevant.
3. Confirm decisions and discoveries are not conflated.
4. Confirm deferred concerns are not presented as completed work.
5. Confirm recommended follow-ups have not been silently promoted into project requirements.
6. Confirm only `outcome.md` was modified unless the user explicitly authorized other changes.

Report the path written and a concise summary of the major outcome findings.
