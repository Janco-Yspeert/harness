# Spike 006 Outcome — Development Workflow Skills Refactor

## Result and exact provenance

**COMPLETE — PROCESS EXCEPTION**

- Accepted candidate: `917a11614a24935c277ef5e8eec0c07a2fa2e5b1`
- Acceptance checkpoint: `22e07dd`
- Brief identity:
  `sha256:06182bd12daec7024fec697b112bf3907e3a03799849d3341198395fd79376b9`
- Branch: `feat/spike-006`
- Final delivery: the commit containing this Outcome and Manifest Run 024 is
  pushed to `feat/spike-006`.

Spike 006 changed methodology, skills, templates, and workflow documentation.
It made no Harness product/runtime change and did not alter the product roadmap.

## What Was Established

The canonical workflow is now:

> draft brief → Brief Readiness → freeze brief → Design Map → freeze Design Map
> → evaluator `prepare` → freeze evaluation → implementation → evaluator
> `verify`/retry → As-Built → Outcome

Public frozen artifacts use deterministic content identities plus committed Git
provenance. Private evaluator artifacts use content identities and freeze
metadata in the sibling hidden workspace. Stable public handoffs are committed
and pushed on `feat/spike-NNN`. The append-only public manifest records workflow
execution and skill provenance, but does not establish freeze state.

Manifest statistics are capability-dependent and use a cutoff immediately
before the final manifest update. Unavailable metrics are omitted rather than
estimated. Evaluator entries expose only safe aggregates during the active loop.

## Implementation Summary

- Replaced `spike-review` with `brief-readiness`.
- Added bounded `design-map` and `as-built` skills.
- Reduced and sharpened evaluator, implementation, and Outcome contracts.
- Kept evaluator modes limited to `prepare` and `verify`.
- Added integer skill versions and immutable historical contracts outside active
  skill discovery.
- Added explicit freeze, retry, classification, diagnostic, public/private,
  correction, promotion, branch, and manifest rules.
- Preserved three blocked readiness drafts with matching findings under
  `preliminary/001`–`003`; the passing brief remains at spike root.

Active contracts at completion are Brief Readiness v3, Design Map v2, evaluator
v6, implementation v3, As-Built v2, and Outcome v3.

## Evaluation or Process-Exception Evidence

The brief predeclared that Spike 006 would not independently evaluate the
workflow it was rewriting. It explicitly exempted Design Map, evaluator
`prepare`/`verify`, hidden tests, As-Built, and full workflow dogfooding. The
substitute gate required repository checks, focused Claude compatibility,
complete diff/acceptance-criteria review, no unresolved material findings, and
project-owner acceptance.

Those checks completed. `npm run check` passed with all 21 tests. Claude Code
repeatedly discovered and parsed evaluator revisions and enforced the two-mode
interface, including evaluator v6 in Manifest Run 021. The project owner
accepted the exact candidate in `acceptance.md`. No active evaluator-private
material was inspected during Spike 006.

This is not an independently evaluated PASS. The revised methodology remains
unvalidated until Spike 007 exercises it end to end.

## Material History

Four readiness passes were needed. The first three blocked freeze with 2
blockers/2 clarifications, 2 blockers/1 clarification, and 1 blocker; the fourth
passed. Manifest Runs 001–004 were reconstructed retrospectively from preserved
evidence. Later runs were recorded contemporaneously.

After the first accepted candidate and Outcome, project-owner review found that
promotion could omit implementation-failure results. The first acceptance and
stale Outcome are preserved under `attempts/001/`. Evaluator v4 then required a
complete immutable attempt/revision history; v5 defined collision-free private
paths; and v6 added the attempt-ledger template and allocate/finalize contract.
Each replaced evaluator contract from v3 onward was archived before replacement,
and Claude compatibility was revalidated after every revision.

## Decisions

- Workflow-wide rules belong in `AGENTS.md`; role-specific blind spots remain in
  the relevant skill.
- Design Map may settle only the smallest behavior-preserving shared contract.
  Black-box evaluation is preferred and implementation-only choices remain free.
- Evaluation failures are classified before implementation is blamed. Frozen
  evaluation changes only for a demonstrated evaluator/specification issue.
- Every verification attempt receives an immutable private result under
  `.eval/attempts/NNN/`, linked through a structured attempt ledger to the exact
  implementation and evaluator revision.
- Before correction, superseded evaluator bundles are archived under
  `.eval/revisions/NNN/`. After an accepted pass, promotion preserves all
  revisions and results from the cycle. An unchanged suite is stored once and
  referenced by multiple attempts.
- Hidden evidence remains private during retries; implementation receives only
  sanitized public feedback.
- No framework, database, centralized workflow engine, or elaborate semantic
  versioning system was introduced.

## Discoveries

The useful simplification was not deleting safeguards; it was assigning them to
the right layer. Durable cross-role policy moved into repository instructions
and templates while each skill retained one primary question. Evaluator v6 is
240 lines versus 1,008 in v1 while retaining oracle validation, self-test
separation, frozen-contract discipline, diagnostic limits, drift handling,
attempt immutability, and complete promotion provenance.

Evidence retention needs two distinct histories: evaluator revisions describe
what evaluation contract existed, while verification attempts describe which
implementation was tested against which revision. Conflating them either
duplicates suites or loses failures. The ledger provides the join without
building a tiny workflow database wearing a false moustache.

Execution statistics also need an epistemic cutoff: a run can persist only
values available before its final manifest update. Post-response values require
a later, explicitly retrospective entry.

## Deferred Concerns

- Spike 007 must establish whether the workflow is effective and cheaper in
  practice; Spike 006 provides coherent contracts, not operational proof.
- Pressure-test ambiguity detection, Design Map compactness, evaluator
  preparation scope, retry-feedback privacy, evaluator correction, complete
  promotion, manifest usefulness, As-Built discrepancies, and Outcome brevity.
- Agent neutrality remains deliberately deferred. Claude evaluator conventions
  and Codex skill packaging coexist without a generic agent/plugin abstraction.
- Original v1 contracts and evaluator v3–v5 are archived explicitly. Several
  intermediate v2 contracts created during Spike 006 were not copied before
  later version advancement; Git preserves them, but future revisions should
  archive every replaced active contract first.
- The recurring first-launch Node test-runner collapse remains unexplained. The
  affected launches died before assertions; immediate reruns and later full
  checks passed all 21 tests. This unrelated issue was not investigated here.

## Skill Versions and Workflow Cost

Runs 001–004 used `spike-review` v1 and are retrospective. Run 005 used
implementation v1 under the exception. Evaluator compatibility work exercised
v2 through v6. Contract revisions used the system `skill-creator`; both Outcome
attempts used Outcome v3.

The six active skill bodies total 586 lines. The four original archived v1
contracts total 1,780 lines. These structural counts suggest substantially less
always-loaded instruction, but do not prove lower runtime cost or better
results. Token, context, duration, and agent-turn totals were unavailable and
were not invented.

## Next Step

Run a deliberately small Spike 007 through the complete revised workflow. It
should try to falsify the methodology, not reward Spike 006 for finally getting
its paperwork in a row.
