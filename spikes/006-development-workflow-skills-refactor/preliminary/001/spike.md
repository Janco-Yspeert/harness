# Spike 006 — Development Workflow Skills Refactor

## Goal

Refactor the AI-development skills and supporting repository instructions used to build Harness so that the workflow is:

- correctly ordered;
- substantially leaner and more bounded;
- explicit about skill responsibilities and blind spots;
- safe around hidden evaluation and repeated implementation attempts;
- non-destructive when evaluator artefacts are corrected or promoted;
- explicitly versioned, with previous skill contracts preserved as historical evidence; and
- coherent enough to be exercised end-to-end by a deliberately small Spike 007.

This is a methodology/tooling spike.

It must not change Harness product behaviour.

---

## Primary question

> Can the Harness AI-development workflow be reduced to a small set of clearly bounded skills with explicit lifecycle, information, versioning, and provenance rules, without discarding the useful independence and falsification properties learned from Spikes 002–005?

A successful result should leave the workflow ready to dogfood on Spike 007.

Spike 006 itself does **not** prove that the revised workflow works.

Spike 007 will do that.

---

## Why this spike exists

The existing workflow has produced useful evidence.

In particular, independent evaluation has caught real implementation defects, and `outcome.md` has proven valuable as a compressed historical record of what each spike established and taught us.

However, later spikes—especially Spike 005—also exposed significant problems in the machinery itself:

- evaluator preparation can become disproportionately large and expensive;
- evaluator helpers and hidden tests can themselves be wrong;
- a helper working in isolation does not prove that its oracle works through the real asynchronous path used by the test;
- evaluator defects can be confused with implementation defects;
- frozen evaluator artefacts can be corrected without sufficient preservation of the original frozen revision;
- promotion can destroy or replace evidence that later becomes important to understanding what happened;
- the implementation agent needs useful information after a confirmed implementation failure without being given the private hidden evaluation;
- skill responsibilities and workflow ordering have evolved faster than the repository documentation describing them;
- useful lessons are currently split inconsistently between skills, repository-wide instructions, Outcomes, and conversational knowledge;
- active skills currently evolve through Git history but do not have an explicit lightweight version/history model; and
- the reusable workflow has accumulated enough machinery that context and operational complexity themselves have become engineering concerns.

Spike 006 addresses these methodology problems before Harness resumes its product-facing sequence.

---

# Spike-specific process exception

Spike 006 deliberately does **not** use the complete Harness development pipeline that it is modifying.

Using the full existing evaluator workflow to prove a refactor of that evaluator workflow would be circular and unnecessarily expensive.

For this spike only, the intended process is:

1. create the proposed Spike 006 brief;
2. run the existing `spike-review` skill against it;
3. resolve material findings and freeze this brief;
4. perform the implementation primarily with Codex, using this frozen brief directly;
5. use Claude to inspect Claude-specific evaluator skill behaviour and compatibility where required;
6. perform ordinary repository checks and human review appropriate to documentation/tooling changes;
7. run the existing/revised `outcome` skill to record what Spike 006 changed and learned.

Spike 006 does **not** require:

- independent evaluator preparation;
- hidden tests;
- a Design Map;
- independent evaluator verification;
- As-Built;
- use of the current `implementation` skill; or
- dogfooding the new full pipeline against itself.

Using the current `implementation` skill is permitted if useful, but is not required.

This exception is deliberate and must not be interpreted as a change to the normal Harness workflow.

---

# Target workflow

After Spike 006, the canonical workflow for ordinary implementation spikes should be:

1. **Draft spike brief**
2. **Brief readiness review**
3. **Resolve findings and freeze brief**
4. **Design Map**
5. **Evaluator prepare and freeze**
6. **Implementation**
7. **Evaluator verify**
8. **Implementation/evaluation retry loop if required**
9. **As-Built**
10. **Outcome**

The current `spike-review` skill performs step 2.

Its current name may be retained or changed during this spike if a better name materially improves clarity. I suggest we change it to `brief-readiness`. The important contract is not the name:

> The readiness-review skill is the first code-facing skill used on a proposed brief, and it runs before the brief is frozen or implementation begins.

Any repository documentation implying that this review occurs later in the workflow is wrong and must be corrected.

---

# Skill design principle

Each workflow skill should answer one primary question.

The intended conceptual responsibilities are:

### Brief readiness

> Is this proposed brief ready to become a frozen implementation contract?

It identifies material ambiguity, contradiction, missing behavioural decisions, hidden structural assumptions, accidental scope expansion, or decisions that would otherwise be forced onto implementation/evaluation agents.

It is pre-freeze.

It does not implement, evaluate, create hidden tests, or create the Design Map.

Its normal output remains console feedback rather than another mandatory artefact.

### Design Map

> What structural and architectural decisions are already settled for this frozen spike?

The new Design Map skill creates a small `design-map.md`.

As an example, you can inspect `../quest/skills/design-map`

It should record only information materially useful to independent implementation and evaluation, such as:

- settled structural decisions;
- architectural invariants relevant to the spike;
- meaningful implementation freedoms;
- implementation seams;
- evaluation/testability seams;
- ownership and lifecycle boundaries where relevant; and
- genuinely open structural questions that do not change externally observable semantics.

It must not invent product behaviour.

If producing the Design Map exposes an unresolved question that changes externally observable behaviour or the spike contract, the correct action is to return to the brief, resolve the issue, re-freeze the brief, and then regenerate/revisit the Design Map.

The Design Map must remain small.

It is not a general architecture document.

### Evaluator — prepare

> How can the frozen spike contract be independently falsified?

`prepare` remains one of only two evaluator modes.

It derives the public evaluation requirements and private evaluation from the frozen brief and Design Map.

It must expose implementation assumptions required for fair evaluation without revealing hidden cases.

It must create a frozen evaluation before implementation begins.

### Implementation

> Build the frozen spike.

The implementation agent receives:

- the frozen brief;
- the Design Map;
- public evaluation requirements;
- repository-wide instructions; and
- any public implementation feedback from previous failed implementation attempts.

It must not receive or inspect evaluator-private material.

### Evaluator — verify

> Does this implementation satisfy the already-frozen evaluation contract, and if not, what class of failure occurred?

`verify` remains the evaluator's second and final mode.

The evaluator should classify material failures rather than treating any red test as proof of an implementation defect.

Relevant classifications include:

- `IMPLEMENTATION_FAILURE`
- `EVALUATOR_DEFECT`
- `SPECIFICATION_AMBIGUITY`
- `INFRASTRUCTURE_FAILURE`
- specification drift where applicable

### As-Built

> What did we actually build?

A new `as-built` skill runs after verification and before Outcome.

Using fresh context where practical, it inspects the implementation/diff and relevant surrounding code and reconstructs the material behaviour and structure that actually exist.

It should focus particularly on:

- observable behaviour;
- state/lifecycle semantics;
- ownership;
- persistence;
- important invariants;
- hidden coupling;
- side effects;
- assumptions introduced by the implementation; and
- significant architecture actually created.

It then compares that reality with the frozen brief and Design Map.

Its discrepancy vocabulary should remain small, centred on:

- **Missing**
- **Contradictory**
- **Extra**

As-Built is not another evaluator and is not a general code-quality review.

It establishes facts about the implementation.

### Outcome

> What did this spike establish and teach us?

Outcome remains part of the workflow.

It should remain quick and useful.

It may consume the frozen brief, Design Map, evaluation evidence available to it, As-Built, implementation feedback/history, relevant provenance, and other spike-local evidence.

It records the useful historical synthesis:

- result;
- what was established;
- what failed or changed;
- material decisions and discoveries;
- relevant limitations;
- deferred concerns;
- useful promotion/provenance information; and
- what the evidence suggests should happen next.

Outcome must not become a second evaluator or a large reconstruction exercise.

Existing Outcomes are valuable historical inputs and should continue to be treated as such.

---

# Evaluator retry and information flow

The evaluator retains only the modes:

```text
prepare
verify
```

Do not introduce additional evaluator modes merely to model retry behaviour.

## Confirmed implementation failure

When `verify` establishes a genuine implementation defect:

1. the full `eval-result` remains evaluator-private;
2. the evaluator produces public implementation feedback;
3. implementation is rerun against the same frozen brief, Design Map and public evaluation contract plus that feedback;
4. evaluator `verify` is run again.

Do not rerun `prepare` merely because implementation failed.

The frozen evaluation must not move the goalposts in response to an implementation failure.

## Public implementation feedback

A confirmed implementation failure must provide the implementer with enough information to fix the product without exposing the private evaluator machinery.

The central information rule is:

> Implementation may learn what public contract it violated, but not how the hidden evaluator discovered the violation.

Public implementation feedback should identify, where relevant:

- the violated public requirement or invariant;
- expected externally observable behaviour;
- observed externally observable behaviour;
- the material failure class; and
- useful diagnostics that do not expose hidden evaluator mechanics.

It must not reveal unnecessarily:

- hidden test identities;
- hidden case construction;
- evaluator fixtures;
- private timing/oracle strategies;
- hidden input corpora; or
- other information whose purpose is specifically to remain independent from implementation.

The exact public artefact name may be chosen during implementation. A name such as `implementation-feedback.md` is acceptable.

## Evaluator defect

If verification evidence indicates an evaluator defect:

1. do not send that failure to implementation as an implementation defect;
2. correct the evaluator artefact;
3. preserve the relevant frozen prior evaluator revision rather than silently destroying it;
4. rerun `verify` against the unchanged implementation.

If both evaluator and possible implementation defects appear to exist, establish a trustworthy evaluator first.

Only implementation defects that remain after evaluator defects are corrected should be sent to implementation.

---

# Evaluator blind spots that must survive the refactor

The evaluator skill may be substantially shortened, but hard-won safeguards must not disappear merely because their prose is verbose.

At minimum, preserve the following principles:

### Exact-path oracle validation

A helper or oracle working in isolation does not prove that the hidden test using it is valid.

Where asynchronous, lifecycle, PTY, WebSocket, process, provider, timing, or similar behaviour matters, evaluator preparation must validate important failure oracles through the actual path used by the executable evaluation where practical.

### Evaluator self-tests are not product coverage

Tests of evaluator helpers establish confidence in evaluator infrastructure.

They do not count as evidence that Harness itself satisfies a requirement.

### Frozen evaluation is a contract

A failed implementation must not cause evaluator tests to be changed merely to make the result green.

Evaluator artefacts may change after a demonstrated evaluator defect, ambiguity resolution, or other legitimate classification, but that change must be explicit and historically traceable.

### Diagnostics classify; they do not rewrite evidence

Additional diagnostic work may establish whether a failure belongs to the implementation, evaluator, specification or infrastructure.

Diagnostic evidence must not silently substitute for broken mandatory evaluation or retroactively change what a test originally established.

### Hidden evaluation must not impose undisclosed architecture

The evaluator may require structure/test seams only where they are necessary for fair evaluation and have been made public.

Prefer externally observable behaviour.

---

# Skill blind spots and repository-wide rules

Spike 006 must establish a clear rule for where workflow knowledge belongs.

Use this principle:

> If a constraint or blind spot changes how one specific skill performs its job, it belongs in that skill.

> If a constraint applies across multiple roles or to the workflow as a whole, it belongs in `AGENTS.md` or equivalent repository-wide instructions.

Avoid duplicating large bodies of guidance across both.

Examples of repository-wide concerns include:

- canonical workflow order;
- freeze semantics;
- hidden-evaluation access rules;
- independence boundaries;
- skill version/history rules; and
- evaluation promotion/provenance rules.

Examples of skill-local concerns include:

- evaluator oracle validation;
- Design Map's prohibition against inventing product behaviour;
- As-Built's distinction from evaluation/code review;
- implementation's permitted inputs; and
- Outcome's synthesis boundary.

Domain-specific discoveries that do not belong in reusable workflow skills should remain in spike Outcomes or appropriate project documentation.

The goal is not to encode every historical scar into every future agent context.

---

# Skill versioning

Active skills must gain a lightweight explicit versioning model.

Do not introduce elaborate package-style version infrastructure.

A simple monotonically increasing integer version is sufficient.

A skill version should change when its operational contract materially changes, including significant changes to:

- responsibility;
- inputs;
- outputs;
- permissions;
- lifecycle/order;
- safety/freeze rules; or
- execution procedure.

Typographical or purely editorial corrections do not require a new contract version.

The exact metadata representation may be chosen to remain compatible with the agent/tool that consumes the skill.

---

# Historical skill preservation

Before materially replacing an existing skill during Spike 006, preserve the previous active contract as an immutable historical document.

Historical skill copies must:

- preserve the actual previous skill content rather than paraphrasing it;
- identify the skill/version sufficiently for later provenance;
- live outside active skill-discovery paths;
- not be discoverable as executable/current skills by Codex, Claude, or other agent adapters;
- remain available to humans and historical synthesis; and
- never silently change after promotion to history.

A location such as:

```text
docs/history/skills/
```

is acceptable, but the exact structure is not prescribed.

Do not keep obsolete executable-looking `SKILL.md` files under active `skills/` subtrees merely for history.

Git history remains useful, but it is not the only historical representation required after this spike.

The repository should make it easy to answer:

> Which skill contract was considered active when this spike ran?

---

# Evaluation revision and promotion

Spike 006 must replace destructive or ambiguous evaluator promotion with an explicit non-destructive rule.

## During active evaluation

Evaluator-private artefacts remain private throughout implementation/retry.

A failed implementation does not automatically make its private `eval-result` public to implementation.

The public handoff is the sanitized implementation feedback described above.

## Correcting evaluator artefacts

If a frozen evaluator artefact is demonstrated to be defective:

- it may be corrected;
- the prior frozen revision must not be silently overwritten or deleted;
- the corrected version must be distinguishable from the prior version;
- provenance must make clear which revision was used by each verification attempt.

This does not require a separate evaluator mode.

It is lifecycle/provenance behaviour within `verify`.

## Promotion

Promotion occurs only after the active evaluation cycle has reached an accepted successful result.

Promotion must:

- preserve the exact final frozen evaluator artefacts actually used for the successful verification;
- preserve their result and provenance;
- never rebuild hidden tests as part of promotion;
- never regenerate evaluation from the brief merely because promotion has begun;
- never replace exact evaluated tests with "cleaned up" equivalents;
- never delete a superseded frozen evaluator revision merely because a later corrected revision passed.

Earlier failed implementation results do **not** have to become public automatically.

Superseded evaluator revisions, diagnostic attempts, or failed evaluation evidence should be promoted when they provide material historical evidence, particularly where an evaluator defect or evaluation correction affected the spike.

Such promotion happens only once the active implementation loop is over, so it cannot leak hidden evaluation back into implementation.

The essential invariant is:

> Promotion preserves evidence. It does not recreate it.

And:

> Correcting a frozen evaluator creates history; it does not erase history.

---

# Evaluator performance and context efficiency

The evaluator should be substantially simplified.

There is no arbitrary line-count or token-count acceptance threshold.

Shorter is not automatically better.

However, every retained section should materially contribute to the evaluator's operating contract or prevent a demonstrated class of failure.

Remove or consolidate:

- duplicated repository rules;
- repeated explanations already authoritative elsewhere;
- unnecessary repo-discovery instructions;
- obsolete constraints;
- unnecessary narrative;
- repeated descriptions of the same lifecycle;
- complexity that does not improve falsification or diagnosis.

Preserve important safeguards learned from earlier spikes.

The target is:

> enough evaluation to credibly falsify the frozen spike contract, not an attempt to prove the entire repository correct.

---

# Agent neutrality

Agent-neutral skills remain a desirable future direction.

They are **not a requirement of Spike 006**.

Do not opportunistically redesign the skill-discovery/execution model, create a generic agent adapter architecture, or migrate every skill to a vendor-neutral abstraction while performing this refactor.

Most implementation work for Spike 006 will be performed with Codex.

However, the evaluator is currently Claude-oriented and must remain operational under Claude after this spike.

Codex may change the evaluator's methodology and operational contract as required by this brief, but must preserve Claude-specific execution requirements that are still necessary, including relevant discovery, invocation, path, argument, or environment conventions.

After Codex changes Claude-facing evaluator material, Claude must perform a focused compatibility review.

The Claude review should answer:

> Can Claude still discover, understand and correctly execute the revised evaluator skill and its supporting conventions?

Claude should not redesign the methodology during this review unless a concrete Claude-compatibility defect requires a correction.

A later small spike may make the canonical skills genuinely agent-neutral.

Spike 006 must not pre-build that architecture.

---

# Repository documentation

Update repository documentation so that the live documented workflow agrees with the actual intended workflow after Spike 006.

At minimum review:

- `AGENTS.md`;
- `README.md`;
- active skill definitions;
- relevant skill templates/supporting documentation; and
- any other repository file that presents the current AI-development workflow as authoritative.

Do not retroactively rewrite completed spike artefacts merely to make them look as though the new workflow existed earlier.

Historical evidence should remain historical.

Where an old spike used an older skill contract, preserve that fact.

---

# Product scope

Spike 006 must not change Harness host, session, backend, protocol, browser, or provider behaviour.

Do not use this spike to implement:

- structured Harness event models;
- attention/approval handling;
- replay or resynchronization;
- persistence;
- multi-session behaviour;
- additional provider integrations; or
- other product-facing roadmap work.

Those remain on the product path after the methodology detour.

No runtime application refactoring should occur unless strictly required to support repository methodology tooling, and such a requirement should be surfaced before proceeding.

---

# Spike 007 — acceptance/dogfood

Spike 007 is the intended end-to-end validation of the revised workflow.

Spike 006 should leave the methodology ready for that exercise but must not claim success of the methodology based solely on static inspection of the skills.

Spike 007 should be deliberately small enough that workflow cost and unnecessary evaluator complexity are obvious.

Its initial **draft** brief may intentionally contain one or more material ambiguities so that the readiness-review skill can demonstrate that it catches them.

However:

> Intentional ambiguity belongs in the draft Spike 007 brief, not the frozen Spike 007 brief.

Any material ambiguity found by readiness review must be resolved before Spike 007 is frozen.

Spike 007 should then exercise the complete revised workflow:

```text
draft brief
→ readiness review
→ resolve
→ freeze
→ Design Map
→ evaluator prepare
→ implementation
→ evaluator verify
→ retry if required
→ As-Built
→ Outcome
```

Where practical, Spike 007 should be chosen so that it can expose whether:

- readiness review catches a genuine ambiguity;
- Design Map remains bounded;
- evaluator preparation remains appropriately small;
- implementation can work without private evaluator knowledge;
- implementation feedback supports a retry without revealing hidden tests;
- As-Built detects meaningful Extra/Missing/Contradictory implementation facts;
- Outcome remains a compact useful historical record.

Designing and implementing Spike 007 is not part of Spike 006.

---

# Non-goals

Spike 006 does not:

- change Harness product behaviour;
- validate the revised methodology end-to-end;
- require hidden evaluation of the methodology refactor;
- make all skills agent-neutral;
- introduce a generic agent/plugin architecture;
- redesign the Git branching strategy;
- rewrite historical spike records into the new format;
- turn every previous discovery into an always-loaded instruction;
- introduce a complex semantic-versioning system for skills;
- make Outcome larger or replace it;
- merge As-Built into Outcome;
- add evaluator modes beyond `prepare` and `verify`; or
- optimize toward a specific arbitrary token/line-count metric.

---

# Acceptance criteria

Spike 006 is successful when all of the following are true:

1. The canonical workflow order is documented consistently, with readiness review occurring before brief freeze and before all implementation/evaluation work.

2. Existing active skills materially changed by the spike have their previous contracts preserved as immutable, non-executable historical documents.

3. Active skills have a lightweight explicit versioning convention, and the repository explains when that version changes.

4. Repository-wide workflow rules and skill-specific blind spots have a clear ownership rule and obvious unnecessary duplication has been removed.

5. A bounded Design Map skill exists and cannot legitimately invent unresolved externally observable product behaviour.

6. The evaluator still exposes only `prepare` and `verify`.

7. The evaluator remains Claude-compatible and has received a focused Claude compatibility review after Codex's changes.

8. Evaluator preparation remains independent and hidden from implementation while becoming materially leaner and more operationally bounded.

9. Important evaluator safeguards remain explicit, including exact-path oracle validation, separation of evaluator self-tests from product evidence, and failure classification.

10. A confirmed implementation failure produces useful public implementation feedback without exposing private hidden evaluator mechanics.

11. A failed implementation does not cause evaluator preparation to be rerun or the evaluation contract to move.

12. Evaluator defects are corrected and re-verified against the unchanged implementation before implementation is blamed.

13. Frozen evaluator revisions are never silently destroyed when corrected.

14. Promotion copies exact evaluated artefacts rather than rebuilding them and preserves material superseded evaluator evidence.

15. A new bounded `as-built` skill exists and distinguishes actual implementation facts from evaluation or code-quality judgement.

16. Outcome remains a distinct, quick synthesis skill and is updated only as necessary to consume the revised workflow's useful evidence.

17. The implementation skill, if retained as part of the canonical workflow, understands the new permitted inputs including public implementation feedback and remains prohibited from accessing private evaluation.

18. README, `AGENTS.md`, active skills and relevant supporting documentation describe one coherent current methodology.

19. Spike 006 makes no product-facing Harness runtime change.

20. The completed Outcome explicitly records that the new methodology remains unproven until Spike 007 dogfoods it.

---

# Evidence to preserve in the Spike 006 Outcome

The Outcome should record at least:

- which skills changed;
- their resulting versions;
- where previous skill contracts were preserved;
- whether `spike-review` was renamed and why;
- the final canonical workflow;
- the final public/private evaluator information boundary;
- the chosen evaluator revision and promotion rules;
- which known blind spots were retained and where they live;
- how much the evaluator was simplified in meaningful terms;
- the result of the Claude compatibility check;
- any decisions deliberately deferred to an agent-neutral-skills spike;
- any material concern that Spike 007 should specifically pressure-test; and
- confirmation that the product roadmap was not changed by this methodology detour.

---

## Successful outcome

A successful Spike 006 does **not** mean:

> The Harness AI-development methodology is now proven.

It means:

> The methodology has been rebuilt into a coherent, bounded and historically safe form that is ready to be tested.

Spike 007 answers the next question:

> Does the thing actually work?
