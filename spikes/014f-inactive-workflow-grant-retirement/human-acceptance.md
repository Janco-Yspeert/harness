# Human Acceptance - Spike 014f

**Date:** 2026-10-08  
**Decision:** ACCEPTED

## Accepted candidate

I accept Spike 014f's inactive Workflow Execution Grant retirement implementation at the exact independently verified candidate:

`af75b14d1847af02404a591a8829751dc8df2a2e`

This acceptance is limited to the frozen 014f scope: explicit human/root-authorized retirement of one inactive Workflow Execution Grant, durable append-only retirement evidence, permanent prevention of future work under the retired grant without consuming its remaining allocation authority, preservation of historical state, and continued ordinary operation of independently issued successor grants.

## Independent verification

The exact candidate was independently verified under evaluator revision `002`, attempt `009`, execution:

`d59a2e87-2bf0-494c-86af-9012967229b6`

The canonical result is:

- **PASS**
- **AC01-AC08 satisfied**
- **11/11 mandatory executable procedures passed**
- **2/2 non-executable procedures satisfied**

The canonical verification artifact identity is:

`sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`

The canonical `verification-finalized` event is:

`138271e4-40d9-4f5d-bdf9-42e72fc8fbc0`

The corresponding semantic result is:

`6985ffea-a473-43a4-8f1e-3912d3bfe8f8`

No later evaluator attempt exists.

## Archive and promotion qualification

Promotion completed through the explicitly root-authorized historical-unbound-evidence recovery path.

The promotion identity is:

`sha256:d283a7ffb58a9c9a227783148f1a7f63249443377aef1943986b4b218583c7e5`

The archive truthfully records:

- attempts 1, 2 and 5 as terminal results whose historical private evidence was never durably identity-bound;
- attempts 3, 4, 6 and 7 as nonterminal allocations;
- attempt 8 with surviving private evidence identity-bound during recovery without claiming historical binding;
- attempt 9 as the intact, bound, canonical PASS.

The resulting archive is explicitly classified as `incomplete` with classification `HISTORICAL_UNBOUND_PRIVATE_EVIDENCE`.

I accept 014f despite that historical incompleteness because the exact passing attempt and its evaluator revision, public verification evidence and private terminal evidence are intact and identity-bound, while the missing evidence concerns superseded historical attempts and is represented without reconstruction or false loss claims.

This acceptance does not make incomplete evaluator evidence an acceptable normal condition, does not reinterpret UNBOUND evidence as LOST, and does not endorse the recovery mechanism as the desired steady-state evaluator lifecycle.

The future lifecycle must durably bind terminal private evidence before or atomically with canonical verification finalization.

## As-Built

The governed As-Built completed successfully.

- Execution: `11075cd7-106d-4dcd-985b-46e63087bf4e`
- As-Built artifact identity:
  `sha256:28e1ca62d780563132decee0413572c4fb6282bc0c2ff3aaa170525a417a5211`
- Promotion input:
  `sha256:d283a7ffb58a9c9a227783148f1a7f63249443377aef1943986b4b218583c7e5`
- Result: no **Missing**, **Contradictory**, or **Extra** discrepancies.

The accepted implementation:

- retires an exact inactive Workflow Execution Grant through existing human/root authority;
- consumes no role allocation;
- records one durable append-only retirement event;
- refuses retirement while owned work or unresolved human authority remains active;
- permanently blocks allocation, continuation, retry and replacement under the retired grant;
- preserves original grants and historical execution evidence;
- survives replay/restart;
- leaves independently issued successor grants operational.

## Provenance boundary

Human acceptance binds the independently evaluated 014f product candidate:

`af75b14d1847af02404a591a8829751dc8df2a2e`

Later host/runtime maintenance and recovery changes required to make sequence-6 evaluation, finalization and archival operate correctly are preserved in their own explicit maintenance provenance.

Their presence later on the branch does not silently expand the independently verified 014f product scope.

## Operational use

Acceptance of 014f makes the retirement operation available for future explicit use.

It does not require immediate resumption of the Stockdif 014e canary and does not authorize any new Stockdif execution by implication.

The stranded Stockdif H4 Workflow Execution Grant remains the motivating real-world case that exposed the missing lifecycle operation. It may now be retired separately under explicit human/root authority if retaining unused executable authority serves no continuing purpose.

Such retirement would be an operational lifecycle action using the accepted 014f capability. It would not itself resume the Stockdif canary, create a successor grant, consume an allocation, or imply a decision about when Stockdif work should continue.

Any later resumption of Stockdif should remain a separate deliberate action under a fresh bounded grant and the then-current accepted Harness runtime.

## Successor work

The lengthy 014f evaluation and recovery history exposed broader Harness lifecycle issues that are outside the accepted retirement feature itself.

These should remain visible for successor work, particularly:

- distinction between provider/setup failures and semantic evaluator attempts;
- explicit human retry authority beyond automatic retry budgets;
- provider authentication and runtime preflight;
- durable session/resumption semantics;
- terminal private-evidence binding;
- separation of semantic result, finalization and archival state;
- removal or isolation of compatibility and recovery machinery that should not become normal workflow structure.

These concerns do not block acceptance of 014f.

## Decision

No material product concern remains that blocks acceptance of the independently verified 014f scope.

Spike 014f is **ACCEPTED**.

This acceptance authorizes the governed workflow to record the human-acceptance transition for the exact candidate/PASS/promotion/As-Built chain above and, once that transition exists, to record Outcome.

It does not authorize Stockdif resumption, methodology adoption, another evaluator attempt, or reinterpretation of historical evaluator evidence.
