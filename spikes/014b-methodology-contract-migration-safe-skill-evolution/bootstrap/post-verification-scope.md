# Spike 014b — Post-Verification Correction Scope

## Status

This record narrows the human correction scope following the post-verification review of Spike 014b.

The existing frozen authorities remain unchanged:

* `spike.md`
* `design-map.md`
* the original bootstrap authority record
* the frozen evaluator authority and revision lineage

The earlier `post-verification-review.md` remains preserved as historical review evidence. It must not be rewritten or treated as though it had not occurred.

However, that review deliberately explored a broader set of architectural and hardening concerns than should become mandatory Spike 014b correction requirements.

This record distinguishes required correction from non-blocking future hardening.

---

## Governing design principle

Harness is being designed as a **well-designed, low-friction, highly autonomous AI software-development workflow**.

Its current threat model is cooperative but fallible AI agents and ordinary workflow mistakes.

Harness is **not currently being designed as a hostile multi-tenant security system or as protection against deliberate authority forgery, malicious callers, or adversarial takeover**.

Mechanical safeguards are justified where they materially improve:

* autonomy;
* reliability against realistic agent failures;
* recoverability;
* reproducibility;
* independent evaluation; or
* clear human authority.

They are not goals in themselves.

A safeguard that adds substantial workflow friction or architectural complexity to defend primarily against deliberate hostile misuse should not become a mandatory requirement without separate explicit authority.

---

# Required correction scope

## D05 — Implementation retry feedback binding

**Required for Spike 014b correction.**

The implementation role declares an optional `implementationFeedback` input from `implementation-feedback-recorded`, and the implementation skill requires retry feedback to be bound from the exact earlier confirmed implementation failure.

The configured methodology currently has no producer for that event.

This is a direct skill/contract/policy fidelity defect within the existing Spike 014b scope.

The corrected methodology must provide one small coherent mechanism by which sanitized public implementation feedback from the exact relevant verification failure can be bound into the implementation retry.

Do not leave retry authority dependent on ambient repository discovery or conversational context.

---

## D01 — Candidate methodology/revision coherence

**Required only in the minimal coherent-identity sense.**

Spike 014b requires one exact coherent methodology identity associated with an exact candidate revision.

Promotion must therefore not record a methodology identity and repository revision that do not correspond to the same actual candidate.

Prefer the simplest design that removes the possibility of accidental mismatch.

For example, promotion may accept the exact candidate revision and reconstruct or verify the methodology identity internally rather than trusting two independently supplied representations.

This requirement is intended to prevent ordinary workflow/provenance mistakes.

It does **not** require a broader adversarial anti-forgery system.

---

## D03 — Meaningful bounded `exercise`

**Required only as a truthful compatibility smoke test.**

The current `exercise` operation proves that a temporary Git repository can create a local commit and that trusted methodology state remains unchanged, but it does not materially exercise the candidate methodology itself.

The correction should make `exercise` meaningfully involve the candidate methodology in at least one bounded representative scenario.

It should establish, at minimum, that:

* the candidate can be loaded and structurally used;
* a representative candidate role/contract can participate in a disposable scenario;
* an expected local artifact/checkpoint can be produced;
* no publication occurs; and
* trusted methodology authority remains unchanged.

This is **not** a requirement to simulate a complete workflow, execute every role, or reproduce Spike 014a's future end-to-end kernel proof.

Keep the exercise small.

---

# Non-blocking observations

The following earlier review findings do **not** become mandatory Spike 014b acceptance criteria merely because they were raised during human review.

They may be recorded for later consideration where useful.

## D02 — Strong evaluation-to-candidate anti-substitution binding

Do not add elaborate anti-forgery machinery solely to defend against a caller deliberately reusing PASS evidence for another candidate.

The existing correction should preserve normal exact provenance and coherent human/evaluator handoff, but hostile evidence substitution is outside the current threat model.

## D04 — Exhaustive fidelity validation in `check`

`check` does not need to mechanically prove every semantic statement across every skill, contract, policy entry, and workflow transition.

Its purpose should remain modest and deterministic: detect obvious structural incoherence and configuration mistakes.

Do not recreate the evaluator or build a second semantic specification language inside `check`.

Useful checks include things such as:

* configured files and role links exist;
* component identities are coherent;
* capability and result vocabularies are legal;
* obvious dangling references are rejected;
* forbidden worker publication authority is rejected; and
* other inexpensive structural contradictions are detected.

Semantic design review remains evaluator/human work where appropriate.

## D06 — Machine-enforced evaluator cross-field invariant

The evaluator PASS/classification invariant remains authoritative:

* `PASS` has no failure classification;
* non-PASS verification has exactly one valid classification.

The generic kernel's structured enforcement of dependent fields remains part of the existing Spike 014a handback.

Spike 014b must not grow a new generalized constraint system merely to close this observation.

Clear methodology documentation is sufficient until the generic kernel can enforce the invariant coherently.

## D07 — Concurrent hostile promotion writers

Concurrent promotion races are not a current Spike 014b acceptance blocker.

Harness is not currently designed around mutually hostile or highly concurrent trust writers.

A future need for locking or stronger single-writer serialization may be addressed when the runtime architecture or observed use makes it necessary.

Do not introduce distributed or security-oriented concurrency machinery in this correction.

---

# Evaluator repair scope

The evaluator repair triggered by the post-verification review may strengthen evaluation only for requirements already contained in the original frozen Spike 014b brief and Design Map.

It must not convert every observation in `post-verification-review.md` into a new mandatory requirement.

For the current correction cycle:

* D05 is mandatory.
* D01 is mandatory only in the minimal coherent-identity form described above.
* D03 is mandatory only in the bounded smoke-test form described above.
* D02, D04, D06, and D07 are non-blocking observations unless the original frozen authority independently requires a narrower behavior.

If an evaluator repair has already introduced stronger requirements inconsistent with this scope, treat that as evaluator-repair overreach and correct the evaluator rather than forcing implementation to satisfy the expanded requirement.

Acceptance semantics remain those of the original frozen brief and Design Map.

---

# Implementation correction authority

Implementation repair should use:

* the original frozen Spike 014b brief;
* the original frozen Design Map;
* the original public evaluation requirements;
* this human correction-scope record;
* the preserved post-verification review as historical context; and
* sanitized public evaluator feedback from the corrected evaluator revision.

The implementation role should make the smallest coherent changes necessary for the required scope above.

It must not expand Spike 014b into:

* generic kernel enforcement already assigned to Spike 014a;
* hostile-caller security hardening;
* exhaustive semantic validation infrastructure;
* a general methodology registry;
* distributed locking;
* or a full workflow simulator.

---

# Human acceptance

A future evaluator PASS remains evidence, not automatic acceptance.

Before methodology trust promotion, human review should confirm that:

1. D05 has a real producer/consumer feedback path;
2. methodology identity and exact candidate revision cannot accidentally diverge during promotion;
3. `exercise` now performs a useful but bounded candidate-methodology smoke test; and
4. the correction did not introduce unnecessary workflow friction or security machinery outside the current Harness goals.

The objective remains a reliable and highly autonomous development workflow, not maximal defensive formalism.
