---
name: brief-readiness
description:
  Review a proposed Harness spike brief against the current repository before
  freeze, Design Map, evaluation, or implementation. Preserve blocked drafts and
  findings without implementing the spike.
---

# Brief Readiness

Contract version: 4

Answer one question: **is this proposed brief ready to become a frozen
implementation contract?**

## Inputs and authority

Consume the exact draft `spike.md` bound by the Role Grant. Read it completely,
then inspect only the repository evidence needed to test its requirements:
`AGENTS.md`, relevant product documentation, implementation, public APIs,
visible tests, tooling, and selective prior public Outcomes.

Do not inspect evaluator-private `eval-spec.md`, `.hidden-test/**`, or
`.eval/**` material. Do not implement, evaluate, create a Design Map, or resolve
product decisions on the author's behalf.

## Review

The worker does not freeze the brief or write canonical authority. Harness may
record `brief-frozen` or `readiness-blocked` only after validating the Role
Result and committed evidence. A manifest is execution history, not canonical
state.

Trace material requirements to repository contracts. Report only issues that
change scope, implementation, fair evaluation, feasibility, lifecycle,
concurrency, failure behavior, ownership, public behavior, or cost materially.
Distinguish missing contract decisions from ordinary implementation freedom.

Classify findings:

- **Blocker** — freeze would force an unresolved contract, scope, feasibility,
  or externally observable decision onto a later role.
- **Material clarification** — the likely answer is apparent but must be stated
  to prevent divergent implementations.
- **Editorial** — useful wording cleanup that does not block freeze.

For every material finding, cite the brief and repository evidence, explain the
consequence, and request the smallest clarification needed. Do not manufacture
review-shaped fog.

## Output and preliminary history

Write the complete review to `feedback.md` beside the live `spike.md` and return
the same findings and verdict to the user. References in the file must be
repository-relative.

If the verdict is **Not ready to freeze**:

1. preserve the exact reviewed `spike.md` and matching `feedback.md` under the
   next monotonically numbered `preliminary/NNN/` directory;
2. never overwrite an earlier preliminary directory;
3. update the spike manifest when one exists; and
4. create the blocked-evidence local checkpoint before materially revising the
   live brief when operating in the canonical workflow.

The live root `spike.md` remains the working copy. If the verdict is passing, do
not duplicate it under `preliminary/`; retain it at the root with its feedback.
A material edit after a passing review requires another readiness pass.

## Verdict

End with exactly one:

- **Ready to freeze**
- **Ready after minor clarification**
- **Not ready to freeze**

The machine verdict is binary: both **Ready to freeze** and **Ready after minor
clarification** report `READY`; the latter retains each clarification as a
non-blocking finding. **Not ready to freeze** reports `NOT_READY`. A completed
review has semantic disposition `succeeded` for either machine verdict.

State review limitations, files changed, and checks run.

As the final repository-content step, append the run to `manifest.md` when the
revised workflow applies. Include this skill's name/version, inputs, result,
outputs, and statistics reliably available through immediately before the
manifest update. Capture a start baseline only when needed for a directly
measurable statistic. Do not append a provisional start entry, estimate metrics,
or record the manifest update itself. Create one local checkpoint containing
`feedback.md`, the conditional preliminary snapshot, and `manifest.md`. Report
the semantic Role Result, the artifacts produced, and the exact produced local
commit. Publication is a later Harness-owned host action; its outcome cannot
rewrite the truthful review result.
