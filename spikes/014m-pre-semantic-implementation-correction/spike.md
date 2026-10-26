# Spike 014m - Pre-Semantic Implementation Correction

**Status:** Draft; not frozen

**Starting point:** Trusted Harness methodology sequence 6 is active. Spike 014l has a current implementation candidate whose downstream evaluator launch failed during host-owned readiness, before `kernel.allocation` and therefore before any evaluator semantic attempt or verdict.

**Purpose:** add the smallest generic trusted-methodology successor that can authorize one implementation correction when host-owned evidence proves a current candidate caused, or is implicated in, a downstream governed-role failure before semantic allocation and the applicable operational retry state is exhausted.

**Preferred shape:** methodology-only. Use the existing human-decision, event-binding, role-eligibility, contract-input, and bounded implementation-retry machinery if it can satisfy every invariant below. Add runtime authority or a new host operation only if the existing trusted surfaces cannot express or enforce the required bindings; any such addition must be minimal and justified by a demonstrated enforcement gap.

**Out of scope:** changing launch/readiness semantics themselves; fixing the Spike 014l candidate; evaluator correction; fabricating evaluator results; automatic classification of provider outages as implementation defects; general retry redesign; unrelated methodology, kernel, or role refactoring.

## Problem

Trusted methodology sequence 6 has no legal transition from a post-implementation downstream failure before semantic allocation back to implementation.

The existing implementation-correction path requires `verification-finalized` with `classification=IMPLEMENTATION_FAILURE`. That event cannot honestly exist when readiness fails before evaluator allocation. A generic root `permit-role` can force role eligibility, but it does not bind the failure evidence as implementation feedback and therefore is not a sufficient correction path.

The missing path must preserve the semantic boundary established by Spike 014l: operational launch evidence is not an evaluator verdict, and an evaluator semantic attempt does not exist before `kernel.allocation`.

## Required successor behavior

The successor methodology must add an explicit human-authorized pre-semantic implementation-correction transition.

Authorization is valid only when all of the following are true in the current workflow scope:

1. there is a current `implementation-handoff` candidate;
2. a downstream governed role was resolved for that candidate;
3. its latest relevant host-owned launch attempt failed before semantic allocation;
4. no semantic allocation exists for that downstream launch intent;
5. the applicable operational retry state is exhausted; and
6. no later implementation handoff has consumed or superseded the evidence.

The authorization must bind, without caller substitution:

- the exact current implementation candidate commit;
- the exact downstream role;
- the exact launch-intent identity;
- the latest relevant launch-attempt identity;
- the exact retry-exhaustion identity;
- the recorded operational failure classification; and
- the current workflow/correction scope.

The human request must additionally supply a non-empty reason and at least one concrete defect description. These human-authored fields explain why the operational evidence warrants candidate correction; they do not change the recorded operational classification into an evaluator classification.

## Eligibility and input semantics

Once the exact authorization is recorded:

- `implementation` becomes eligible again for the current candidate;
- the authorization is bound into the new Role Grant as an explicit implementation-contract input/feedback identity;
- the worker can resolve the authorized reason, defect descriptions, and immutable host evidence through the governed assignment without evaluator-private exposure;
- existing implementation retry limits continue to apply within this correction cycle;
- a successful new `implementation-handoff` consumes the authorization and becomes the only current candidate;
- the same authorization cannot reopen implementation again, apply to a different launch intent or candidate, or survive evidence drift; and
- a failed or interrupted implementation execution uses the existing bounded implementation retry semantics rather than minting new correction authority.

A fresh post-adoption Workflow Grant for an existing workflow may bind the successor methodology and use the preserved ledger state. Pre-adoption grants remain pinned to their original methodology and gain no retroactive authority.

## Safety invariants

1. No `verification-finalized` event, evaluator result, evaluator attempt, or evaluator classification is synthesized.
2. Existing evaluator verification, evaluator correction, implementation-failure correction, specification, acceptance, promotion, and outcome paths remain unchanged.
3. Operational failure alone never authorizes implementation correction. The path requires an explicit human decision that is bound to exact exhausted evidence.
4. Authentication, quota, provider availability, sandbox, and other infrastructure failures remain operational evidence unless a human explicitly identifies a candidate defect and accepts the bounded correction authority.
5. The decision cannot bind an arbitrary or stale attempt, a non-current candidate, a non-exhausted retry state, or a launch intent that already received semantic allocation.
6. Candidate methodology N+1 cannot provide authority for its own evaluation or adoption. Evaluation, closeout, and adoption remain under trusted predecessor N until the append-only trust transition completes.
7. Adoption is forward-only and does not reinterpret earlier events or grants under N+1.

## Acceptance criteria

| Criterion | Required evidence |
| --- | --- |
| **AC01 - Exact human decision** | A configured human decision records a dedicated transition only when all required current-candidate, pre-semantic, downstream-failure, and exhausted-retry predicates hold. |
| **AC02 - Immutable bindings** | The recorded transition binds the exact candidate, downstream role, launch intent, latest launch attempt, retry exhaustion, failure classification, and current scope from host-owned events; mismatches and stale evidence are refused. |
| **AC03 - Human diagnosis** | Authorization requires a non-empty human reason and non-empty defect-description list while preserving the original operational failure classification. |
| **AC04 - No semantic fabrication** | The path creates no evaluator allocation, semantic attempt, result, verdict, or `verification-finalized` event. |
| **AC05 - Implementation eligibility** | The exact authorization makes `implementation` eligible again without changing the existing evaluator or ordinary implementation-correction predicates. |
| **AC06 - Contract feedback** | The implementation Role Grant contains an explicit input bound to the authorization, and the governed assignment makes its reason, defects, and evidence bindings available without private evaluator material. |
| **AC07 - Single consumption** | A new successful `implementation-handoff` consumes the authorization; it cannot be replayed or applied to another candidate or launch intent. |
| **AC08 - Existing retry semantics** | Failed/interrupted correction executions use the existing bounded implementation retry rules, and a successful handoff returns the workflow to its ordinary downstream path. |
| **AC09 - Outage safety** | Operational exhaustion never opens implementation automatically; arbitrary authentication, quota, provider, or infrastructure failures require the same explicit, exactly bound human diagnosis. |
| **AC10 - Existing paths preserved** | Existing evaluator, evaluator-repair, correction-cycle, acceptance, promotion, As-Built, and Outcome behavior remains unchanged. |
| **AC11 - Methodology-only preference** | The candidate changes only trusted methodology components unless executable evidence proves existing human-decision/input machinery cannot enforce a required invariant; any runtime change is minimal and documented against that failed invariant. |
| **AC12 - Bootstrap-closed evaluation** | Trusted sequence 6 independently evaluates the exact successor candidate using the established prepared-observation/closeout path. Candidate N+1 has no authority over its own verdict or adoption. |
| **AC13 - Forward-only adoption** | Explicit human adoption binds the exact candidate methodology, predecessor sequence/identity, trusted-N PASS, closeout identity, and As-Built identity before appending exactly one sequence-7 record. |
| **AC14 - Existing-workflow cutover** | After adoption and host restart, a fresh ordinary Workflow Grant for the existing affected workflow binds sequence 7, preserves prior history, and resolves the exact pre-semantic correction authorization as the next governed action. Earlier grants remain pinned to sequence 6. |

## Required verification boundaries

Independent evaluation must exercise at least:

- positive authorization and implementation resolution from exact current evidence;
- refusal for candidate, launch-intent, attempt, exhaustion, failure-class, role, and scope mismatch;
- refusal before retry exhaustion;
- refusal when semantic allocation already exists for the launch intent;
- refusal or ineligibility after a newer handoff;
- replay refusal after successful correction handoff;
- ordinary bounded failed/interrupted implementation retries within the correction cycle;
- no automatic correction for authentication/provider/quota failures;
- unchanged ordinary evaluator and post-verification correction paths;
- trusted-N evaluation and exact forward-only N-to-N+1 adoption; and
- a fresh post-adoption grant over preserved Spike 014l history resolving the authorized implementation correction.

## Workflow

1. Run Brief Readiness under trusted methodology sequence 6.
2. Resolve findings and freeze this brief with committed provenance.
3. Create and freeze the Design Map.
4. Prepare and freeze independent evaluation.
5. Implement the successor candidate.
6. Verify the exact candidate under trusted sequence 6, correcting only through existing governed paths.
7. Promote complete evaluator history, create As-Built, and obtain human acceptance.
8. Record explicit methodology-adoption authority binding the exact predecessor, candidate, trusted-N PASS, closeout, and As-Built identities.
9. Append exactly one trusted sequence-7 record using the existing adoption boundary.
10. Restart the host from the adopted trusted revision and create a fresh grant for the existing Spike 014l workflow.
11. Record the exact authorized next action for the preserved 014l candidate. Do not perform the implementation correction as part of this spike.

**This draft authorizes neither implementation correction nor methodology adoption.**
