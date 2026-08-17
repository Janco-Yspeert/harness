---
name: spike-review
description:
  Review a Harness spike brief against the current repository for freeze
  readiness. Use before freezing or implementing a spike to identify material
  ambiguities, contract conflicts, missing decisions, hidden assumptions,
  infeasible requirements, or disproportionate cost without implementing or
  expanding the spike.
---

# Spike Review

Determine whether a spike brief is sufficiently clear, complete, internally
consistent, and implementable to freeze.

## Target

Use the spike path identified by the request. If no single target can be
identified, inspect likely `spikes/NNN-*` matches. Ask for the path only when
the target remains genuinely ambiguous.

Require the target to contain `spike.md`. Review `eval-requirements.md` too when
it already exists and is public, but do not require it for a pre-freeze brief
review.

## Read authority

Read the complete spike brief before reaching conclusions. Inspect the current
repository evidence relevant to the proposed slice, including:

- `AGENTS.md`, `GOALS.md`, and applicable project documentation;
- surrounding implementation and public APIs;
- visible tests and established behavioural contracts;
- dependency, runtime, and tooling constraints; and
- prior public outcomes when needed to understand an established decision.

Do not read, search, inspect, or use evaluator-private material, including
active `eval-spec.md`, `.hidden-test/**`, or `.eval/**` paths. Public promoted
historical evaluation artifacts remain governed by `AGENTS.md`; normally they
are unnecessary for this review.

Do not edit the brief, implementation, tests, or project documentation unless
the user separately asks for changes. The sole routine write made by this skill
is the review artifact described under **Output**.

## Review method

Trace each material requirement to the current code and established contracts.
Focus on decisions that would change implementation, evaluation, scope, cost, or
externally observable behaviour.

Identify:

- ambiguities that affect implementation;
- contradictions within the brief or with existing code, architecture, and
  public contracts;
- missing product, lifecycle, failure, concurrency, protocol, or verification
  decisions required before implementation;
- assumptions an implementer or evaluator would otherwise have to invent;
- technically infeasible requirements; and
- requirements whose cost is disproportionate to the stated spike goal.

Pay particular attention where relevant to:

- ownership and lifecycle boundaries;
- startup, shutdown, cleanup, failure, and race semantics;
- identity and cardinality;
- observable HTTP, WebSocket, CLI, or client behaviour;
- construction and independent-test seams;
- compatibility and regression expectations;
- verification feasibility and whether required behaviour is actually
  observable; and
- tension between requirements and explicit non-goals.

Distinguish a missing contract decision from an ordinary implementation choice.
Do not demand method names, classes, state-machine shapes, or other internal
design details when multiple choices can satisfy the public contract.

## Scope discipline

Do not implement the spike.

Do not expand its scope, reopen settled questions without new evidence, or
propose architecture changes unless needed to resolve a concrete problem in the
brief.

Do not manufacture objections for completeness. Style preferences, theoretical
future concerns, and merely unspecified internals are not freeze blockers.

When recommending clarification, specify the smallest decision needed. Avoid
turning the review into a replacement architecture proposal.

## Findings

Lead with findings, ordered by impact. For each material finding:

1. state the ambiguity, contradiction, missing decision, assumption, or cost
   problem;
2. cite the relevant brief and repository evidence with file and line links;
3. explain the concrete implementation or evaluation consequence; and
4. state the minimum decision or clarification required before freeze.

Classify findings as:

- **Blocker** — implementation or fair evaluation requires an unresolved
  externally observable, scope, feasibility, or contract decision;
- **Material clarification** — the likely interpretation is reasonable, but the
  brief should state it to avoid divergent implementations; or
- **Editorial** — useful cleanup that does not affect freeze readiness.

Do not bury blockers beneath summaries. If no material findings exist, say so
plainly rather than inventing a review-shaped fog bank.

## Output

Produce the complete review in both places:

1. Print it in the final response so the user can read the findings and verdict
   immediately.
2. Save the same substantive review as `feedback.md` beside the target
   `spike.md`.

Use repository-relative references in `feedback.md` so the artifact remains
useful after checkout elsewhere. The screen and file versions may differ only in
presentation details such as clickable link targets; their findings,
classifications, minimum clarifications, verdict, and limitations must agree.

If `feedback.md` already exists, inspect it first. Replace it when it is plainly
the prior review artifact for the same spike; otherwise preserve unrelated
content and report the conflict instead of silently overwriting it.

Writing `feedback.md` does not authorize edits to the spike brief or any other
project file.

## Verdict

End with one explicit verdict:

- **Ready to freeze** — no blockers or material ambiguities remain;
- **Ready after minor clarification** — no product decision is unresolved, but
  named wording should be tightened; or
- **Not ready to freeze** — list the unresolved blockers.

State any limitations of the review, including relevant files or checks that
could not be inspected. Mention that no implementation, brief, or test files
were changed and no tests were run when applicable; account separately for the
required `feedback.md` artifact.
