# Spike 006 Outcome — Development Workflow Skills Refactor

## Result and exact provenance

**COMPLETE — PROCESS EXCEPTION**

- Accepted candidate: `ace7212bbd464343a300b46b1e6ea2f916064172`
- Acceptance checkpoint: `21c229b`
- Brief identity:
  `sha256:6d198b292cbf79adca122cf79e910abfcd19ac7a39c3f93e5f2a89b1e1485b80`
- Branch: `feat/spike-006`
- Final delivery: the commit containing this Outcome and Manifest Run 015 is
  pushed to `feat/spike-006`.

Spike 006 changed methodology, skills, templates, and workflow documentation.
It made no Harness product/runtime change and did not alter the product roadmap.

## What Was Established

The canonical workflow is now:

> draft brief → Brief Readiness → freeze brief → Design Map → freeze Design Map
> → evaluator `prepare` → freeze evaluation → implementation → evaluator
> `verify`/retry → As-Built → Outcome

Public frozen artifacts use deterministic content identities plus committed Git
provenance. Private evaluator artifacts remain in the sibling hidden workspace
and use private content identities and freeze metadata. Stable public handoffs
are committed and pushed on `feat/spike-NNN`; public manifests record execution
history and skill provenance but do not establish freeze state.

Manifest statistics are capability-dependent and end at the final public
manifest update. Metrics are recorded only when directly available. Evaluator
entries expose safe aggregates while richer detail remains private until valid
promotion.

## Implementation Summary

- `spike-review` became `brief-readiness`.
- Added bounded `design-map` and `as-built` skills.
- Reduced and sharpened evaluator, implementation, and Outcome contracts.
- Kept evaluator modes limited to `prepare` and `verify`.
- Added explicit evaluator integrity, falsifiability, diagnostic-probe, drift,
  retry, correction, privacy, and exact-promotion rules.
- Added integer contract versions and an append-only per-spike manifest.
- Preserved the original v1 contracts under `docs/history/skills/`, outside
  active skill discovery.
- Preserved three blocked readiness drafts and their matching findings under
  immutable `preliminary/001`–`003`; the passing brief remains at spike root.

Active contracts at completion are Brief Readiness v3, Design Map v2, evaluator
v3, implementation v3, As-Built v2, and Outcome v3.

## Evaluation or Process-Exception Evidence

The frozen brief predeclared that Spike 006 would not independently evaluate the
workflow it was rewriting. It explicitly exempted Design Map, evaluator
`prepare`/`verify`, hidden tests, As-Built, and full workflow dogfooding, and
substituted repository checks, focused Claude compatibility checks, complete
diff/acceptance-criteria review, and project-owner acceptance.

Those substitute checks completed. `npm run check` passed with all 21 tests;
Claude Code repeatedly discovered and parsed the evaluator and enforced its
two-mode interface; and the project owner accepted the exact candidate in
`acceptance.md`. No active evaluator-private material was inspected.

This is not an independently evaluated PASS. The revised methodology remains
unvalidated until Spike 007 exercises it end to end.

## Material History

Four readiness passes were needed. The first three blocked freeze and produced
2 blockers/2 clarifications, 2 blockers/1 clarification, and 1 blocker
respectively; the fourth passed. Runs 001–004 were reconstructed retrospectively
from preserved evidence, while later manifest runs were recorded
contemporaneously.

Subsequent review refined Design Map into a minimal shared contract rather than
an implementation plan, restored explicit evaluator diagnostic and drift
safeguards, and made execution-statistics recording consistently terminal and
privacy-preserving. Claude compatibility was revalidated after material
evaluator changes.

## Decisions

- Workflow-wide rules belong in `AGENTS.md`; role-specific blind spots remain in
  the relevant skill.
- Design Map may settle only the smallest behavior-preserving contract that
  implementation and evaluation must share. Black-box evaluation remains the
  preference, and implementation-only choices remain free.
- Evaluation failures are classified before implementation is blamed. Frozen
  evaluation changes only for a demonstrated evaluator/specification issue, and
  superseded material revisions remain historical evidence.
- Promotion copies the exact successful evaluator evidence; it does not rebuild
  a cleaner-looking past.
- No framework, database, centralized workflow engine, or package-style skill
  versioning was introduced.

## Discoveries

The main simplification was not deleting safeguards; it was moving durable
workflow policy to repository instructions and templates while leaving each
skill with one primary question. The evaluator shrank from 1,008 lines in v1 to
221 lines in v3 while retaining exact-path oracle validation, evaluator
self-check separation, frozen-contract discipline, diagnostic limits, and
hidden-architecture protections.

Execution statistics have a necessary epistemic cutoff: a run can truthfully
persist only values available before its final manifest update. Anything known
only after response or orchestration must be recorded later and marked
retrospective. Attempting to make the entry measure itself is bookkeeping
ouroboros, not observability.

## Deferred Concerns

- Spike 007 must establish whether the revised workflow is effective and cheaper
  in practice; Spike 006 provides coherent contracts, not operational proof.
- Pressure-test ambiguity detection, compactness of Design Map, bounded
  evaluator preparation, retry feedback privacy, evaluator correction history,
  manifest usefulness, As-Built discrepancy detection, and Outcome brevity.
- Agent neutrality remains deliberately deferred. Claude-specific evaluator
  invocation and Codex skill packaging coexist without a generic agent/plugin
  abstraction.
- The archived index describes the original v1 replacements, but intermediate
  v2 contracts created during Spike 006 were not copied into dedicated history
  files before the active contracts advanced again. Their Git provenance
  remains available; future skill revisions should preserve each replaced
  contract before version advancement.
- The repeated first-launch Node test-runner collapse remains observable: the
  affected runs died before assertions, while immediate reruns and subsequent
  full checks passed all 21 tests. Spike 006 did not investigate this unrelated
  runtime-test issue.

## Skill Versions and Workflow Cost

Manifest Runs 001–004 used `spike-review` v1 and are explicitly retrospective.
Run 005 used implementation v1 under the process exception. Evaluator
compatibility runs used evaluator v2 and later v3. Contract refinement used the
system `skill-creator`; this final synthesis uses Outcome v3.

Reliably available cost evidence is deliberately modest: active skill bodies now
total 567 lines, compared with 1,780 lines across the four archived v1
contracts. These counts are structural context, not proof of lower token cost or
better outcomes. Token, context, and agent-turn totals were unavailable and were
not invented.

## Next Step

Run a deliberately small Spike 007 through the complete revised workflow. Its
job is to falsify the methodology where possible, not congratulate Spike 006
for producing tidy Markdown.
