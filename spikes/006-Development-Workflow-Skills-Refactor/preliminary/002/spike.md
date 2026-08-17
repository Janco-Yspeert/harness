# Spike 006 — Development Workflow Skills Refactor

## Goal

Refactor the AI-assisted development skills and supporting repository instructions used to build Harness so that the workflow is:

- correctly ordered and clearly bounded;
- substantially leaner and less context-intensive;
- explicit about each skill's responsibility and known blind spots;
- explicit about freeze, retry, commit, versioning, and provenance semantics;
- safe around hidden evaluation and repeated implementation attempts;
- non-destructive when evaluator artifacts are corrected or promoted;
- historically traceable without relying only on Git archaeology;
- instrumented with lightweight per-spike workflow telemetry; and
- coherent enough to be exercised end-to-end by a deliberately small Spike 007.

This is a methodology and tooling spike.

It must not change Harness product behavior.

---

## Primary question

> Can the Harness AI-development workflow be reduced to a small set of clearly bounded skills with explicit lifecycle, information, versioning, provenance, and observability rules, while preserving the useful independence and falsification properties learned from earlier spikes?

A successful Spike 006 leaves the workflow ready to dogfood on Spike 007.

Spike 006 itself does not prove that the revised workflow works.

Spike 007 will provide that validation.

---

# Why this spike exists

The existing workflow has produced useful results.

Independent evaluation has caught genuine implementation defects, and `outcome.md` has proven valuable as a compact historical record of what each spike established and taught us.

However, later spikes, especially Spike 005, exposed significant problems in the methodology and tooling:

- evaluator preparation can become disproportionately large and expensive;
- evaluator helpers and hidden tests can themselves be defective;
- a helper working in isolation does not prove that its oracle works through the actual asynchronous path used by the test;
- evaluator defects can be mistaken for implementation defects;
- evaluator preparation can perform unnecessary repository archaeology and repeated reasoning;
- frozen evaluator artifacts can be corrected without sufficient preservation of the original frozen revision;
- evaluation promotion can destroy or replace evidence that later becomes important to understanding what happened;
- the implementation agent needs actionable information after a confirmed implementation failure without being given private hidden evaluation;
- workflow ordering and skill responsibilities have evolved faster than repository documentation;
- reusable lessons and blind spots are split inconsistently between skills, repository-wide instructions, Outcomes, and historical knowledge;
- active skills currently evolve through Git history without a lightweight explicit skill-version model;
- future spikes do not yet have a reliable record of which skill versions actually ran;
- workflow execution statistics are valuable but are currently reconstructed inconsistently from agent logs and Outcomes; and
- the workflow has accumulated enough machinery that its own context and operational cost have become engineering concerns.

Spike 006 addresses these problems before Harness resumes its product-facing roadmap.

---

# Spike-specific process exception

Spike 006 deliberately does not use the complete Harness development pipeline that it is modifying.

Running the existing full evaluator workflow to prove a refactor of that evaluator workflow would be circular and unnecessarily expensive.

For this spike only, the intended process is:

1. create the proposed Spike 006 brief;
2. run the existing readiness-review skill, currently named `spike-review`;
3. resolve material findings and freeze this brief;
4. perform the implementation primarily with Codex using this frozen brief directly;
5. use Claude to inspect and exercise Claude-specific evaluator behavior and compatibility where required;
6. perform ordinary repository checks and human review appropriate to documentation and skill changes;
7. run the revised `outcome` skill under an explicitly documented process exception.

Spike 006 does not require:

- Design Map;
- independent evaluator preparation;
- hidden tests;
- independent evaluator verification;
- As-Built;
- use of the current `implementation` skill; or
- dogfooding the complete revised workflow against itself.

Using the current `implementation` skill is permitted if useful, but is not required.

This exception is deliberate and must not be interpreted as a change to the normal Harness workflow.

---

# Canonical workflow after Spike 006

For ordinary implementation spikes, the intended workflow is:

1. Draft spike brief
2. Brief Readiness
3. Resolve findings
4. Freeze brief
5. Design Map
6. Freeze Design Map
7. Evaluator `prepare`
8. Freeze evaluation
9. Implementation
10. Evaluator `verify`
11. Implementation/evaluation retry loop if required
12. As-Built
13. Outcome

The existing `spike-review` skill performs step 2.

The preferred replacement name is:

> `brief-readiness`

The final name may be settled during this spike, but the operational contract is fixed:

> Brief Readiness is the first code-facing skill used on a proposed spike brief. It runs before the brief is frozen and before Design Map, evaluator preparation, or implementation.

Any repository documentation implying that this review occurs later in the workflow must be corrected.

---

# Workflow state and freeze semantics

“Frozen” is a contract-bearing workflow state and must have a durable identity.

Use the following general rule:

> A frozen artifact has an immutable recorded identity and must not change as an input to the current workflow cycle. A legitimate material change creates a new frozen revision and invalidates downstream artifacts derived from the prior revision where applicable.

Freeze identity differs between public repository artifacts and evaluator-private artifacts.

## Public artifacts

Public contract-bearing artifacts include at least:

- `spike.md`;
- `design-map.md`; and
- public evaluator requirements.

Their durable provenance identity is the Git commit containing the exact version used by the next stage.

Content hashes may additionally be used for drift detection.

Git commit identity provides historical provenance.

Content hashes provide inexpensive mechanical drift checks.

They are complementary rather than competing mechanisms.

## Private evaluator artifacts

Evaluator-private material currently lives under the sibling:

```text
../harness-hidden
```

It is not part of the Harness repository and must not be assumed to have Git history.

Private evaluator freeze identity must therefore use explicit content identities.

Evaluator preparation must record sufficient private freeze metadata to identify the exact frozen evaluation revision, including at least:

- evaluation revision identity;
- frozen public brief identity;
- frozen Design Map identity;
- public evaluation-requirements identity;
- private evaluation-spec identity;
- hidden-test and supporting-file identities;
- evaluator skill identity/version; and
- any additional information necessary to establish that `verify` is running the same evaluation that was frozen.

A compact private freeze manifest or equivalent mechanism is acceptable.

The exact serialization format is not prescribed.

## Freeze and revision rules

### Brief change

A material change to the frozen brief requires:

1. a new brief revision/commit;
2. another Brief Readiness pass;
3. reconsideration or regeneration of downstream Design Map material; and
4. invalidation of evaluator preparation derived from the previous frozen brief.

### Design Map change

A material change to the frozen Design Map requires:

1. a new committed Design Map revision; and
2. invalidation of evaluator preparation derived from the previous Design Map where the change affects evaluation or implementation assumptions.

### Evaluation change

An implementation failure does not permit the frozen evaluator contract to move.

A demonstrated evaluator defect or legitimate specification correction may cause evaluator artifacts to change.

When this happens:

- the prior frozen evaluator revision must be preserved;
- the corrected evaluator becomes a distinguishable new frozen revision;
- provenance must show which revision was used by each verification attempt; and
- verification should be rerun against the unchanged implementation before implementation is blamed.

No additional evaluator command mode is required to represent this lifecycle.

---

# Commit boundaries

The normal workflow should use meaningful Git commits as durable public phase boundaries.

The intent is not to create commits for trivial agent activity, but to make important contract transitions and evidence durable.

## Brief freeze commit

After Brief Readiness passes and its material findings are resolved:

- commit the frozen `spike.md`;
- include retained readiness evidence where appropriate;
- record the run in the spike manifest.

This commit is the durable public identity of the frozen brief.

## Design Map commit

Generate the Design Map from the frozen brief and commit it before evaluator preparation begins.

Once evaluator preparation begins, that committed Design Map is fixed for the current evaluation cycle unless explicitly revised and downstream work invalidated.

## Public evaluation-contract commit

Evaluator `prepare` creates or finalizes the public evaluation requirements while private evaluator artifacts remain under `../harness-hidden`.

After the private evaluation passes its preparation/integrity checks:

- freeze the private evaluator revision;
- commit the public evaluation requirements;
- update the public spike manifest with safe evaluator provenance.

Implementation must not begin before the public evaluation contract is durably committed and the private evaluation has been frozen.

## Implementation commit

Implementation produces a focused implementation revision containing:

- production changes;
- visible durable tests where appropriate; and
- its manifest entry.

The implementation commit is the immutable implementation identity supplied to evaluator `verify`.

Evaluator-private material must never be included in this commit.

## Implementation retry

On confirmed implementation failure:

1. evaluator `verify` emits public implementation feedback;
2. that feedback is preserved publicly;
3. implementation is rerun against the same frozen brief, Design Map, and evaluation contract plus that feedback;
4. the corrected implementation receives a new implementation commit;
5. evaluator `verify` runs again against the same frozen evaluator revision unless an evaluator defect has independently required a new evaluator revision.

## Evaluation-promotion commit

After accepted successful evaluation:

- promote exact evaluation evidence according to the promotion rules in this brief;
- preserve required provenance and material evaluator-revision history;
- commit the promoted evaluation separately from implementation.

## As-Built commit

The As-Built artifact is evidence consumed by Outcome and should be committed as a small distinct workflow artifact.

## Outcome commit

Outcome remains a dedicated final historical artifact and receives its own commit.

---

# Per-spike manifest

Every spike must maintain a public:

```text
manifest.md
```

or equivalently named spike manifest if repository conventions require a different name.

Its purpose is:

> Record which material workflow operations actually ran, what performed them, what they consumed and produced, and useful execution statistics available from the relevant agent/runtime.

The manifest is an observability and provenance artifact.

It is not the authority that establishes workflow state or freeze status.

## Append-only execution history

Material workflow runs append distinct entries.

A later run must not overwrite evidence that an earlier run occurred.

Examples include:

- Brief Readiness run;
- Design Map generation;
- evaluator `prepare`;
- implementation attempt;
- evaluator `verify`;
- implementation retry;
- As-Built;
- Outcome;
- relevant compatibility/review operations.

## Common provenance fields

Each material entry should record, where applicable:

- run identifier or sequence;
- skill name;
- skill version;
- agent/tool identity;
- mode or workflow stage;
- result/status;
- meaningful input identities;
- meaningful output identities;
- timestamp where reliably available.

The exact Markdown format is not prescribed, but it should remain human-readable and easy for Outcome or tooling to consume.

## Execution statistics

Each skill should additionally record meaningful execution statistics that are reliably available from the agent or runtime that performed it.

These statistics are deliberately capability-dependent.

Possible examples include:

- wall-clock duration;
- tool-call count;
- token usage;
- context size;
- shell-command count;
- files inspected;
- files changed;
- tests run;
- agent turns;
- cache metrics;
- findings produced; or
- other useful execution measurements.

Do not require artificial parity between Claude, Codex, or future agents.

Do not fabricate metrics that the current runtime cannot reliably provide.

The rule is:

> Report useful execution statistics that are actually available.

The manifest should make later workflow-cost comparison possible without making metric uniformity a condition of successful execution.

## Hidden-evaluation boundary

`manifest.md` is public and potentially visible to implementation.

Evaluator entries must therefore not expose private evaluation mechanics during the active implementation loop.

Public evaluator manifest entries may record safe information such as:

- evaluator skill/version;
- `prepare` or `verify`;
- evaluator revision identity;
- high-level verification classification;
- whether public implementation feedback was emitted;
- wall time or other safe aggregate statistics;
- public artifact references.

They must not expose unnecessarily:

- hidden test identities;
- individual hidden cases;
- hidden fixtures;
- exact hidden inputs;
- private timing/oracle strategies;
- private diagnostic evidence; or
- other information intended to remain independent from implementation.

Richer evaluator telemetry may remain under `../harness-hidden` and may later be promoted where historically useful.

---

# Skill design principle

Each workflow skill should answer one primary question.

## Brief Readiness

> Is this proposed brief ready to become a frozen implementation contract?

It identifies material:

- ambiguity;
- contradiction;
- missing behavioral decisions;
- hidden structural assumptions;
- accidental scope expansion;
- unresolved lifecycle/state semantics; or
- choices that would otherwise be forced onto implementation or evaluation agents.

It runs before freeze.

It does not implement, evaluate, create hidden tests, or create the Design Map.

Its primary user-facing output may remain concise console feedback.

If a durable review artifact is retained, it should remain lightweight.

## Design Map

> What structural and architectural decisions are already settled for this frozen spike?

The Design Map skill creates a small `design-map.md`.

It may use the Quest project's existing Design Map skill as a practical reference for scale and intent, but Harness requirements in this brief remain authoritative.

The Design Map should record only material information useful to independent implementation and evaluation, such as:

- settled structural decisions;
- architectural invariants relevant to the spike;
- meaningful implementation freedoms;
- implementation seams;
- evaluation/testability seams;
- ownership and lifecycle boundaries where relevant; and
- genuinely open structural questions that do not change externally observable semantics.

It must not invent product behavior.

If producing the Design Map exposes an unresolved question that changes externally observable behavior or the spike contract, return to the brief, resolve it, rerun Brief Readiness as required, and refreeze before continuing.

The Design Map is not a general architecture document.

## Evaluator — `prepare`

> How can the frozen spike contract be independently falsified?

`prepare` remains one of only two evaluator modes.

It derives the public evaluation requirements and private evaluation from the frozen brief and Design Map.

It must expose structural/testability requirements required for fair evaluation without revealing hidden cases.

It must create and freeze the evaluation before implementation begins.

## Implementation

> Build the frozen spike.

The implementation agent receives:

- the frozen brief;
- the frozen Design Map;
- public evaluation requirements;
- repository-wide instructions;
- public implementation feedback from previous confirmed implementation failures, if any; and
- normal public project context.

It must not receive or inspect evaluator-private material.

## Evaluator — `verify`

> Does this implementation satisfy the already-frozen evaluation contract, and if not, what class of failure occurred?

`verify` remains the evaluator's second and final mode.

Relevant classifications include:

- `IMPLEMENTATION_FAILURE`;
- `EVALUATOR_DEFECT`;
- `SPECIFICATION_AMBIGUITY`;
- `INFRASTRUCTURE_FAILURE`; and
- specification drift where applicable.

## As-Built

> What did we actually build?

A new `as-built` skill runs after successful or otherwise final verification and before Outcome.

Using fresh context where practical, it inspects the implementation/diff and relevant surrounding code to reconstruct the material behavior and structure that actually exist.

It should focus particularly on:

- observable behavior;
- state and lifecycle semantics;
- ownership;
- persistence;
- material invariants;
- hidden coupling;
- side effects;
- assumptions introduced by implementation; and
- significant architecture actually created.

It then compares actual implementation with the frozen brief and Design Map.

Its discrepancy vocabulary should remain small, centered on:

- **Missing**
- **Contradictory**
- **Extra**

As-Built is not another evaluator and is not a general code-quality review.

It establishes facts about the implementation.

## Outcome

> What did this spike establish and teach us?

Outcome remains part of the workflow.

It should remain quick and useful.

It may consume:

- the frozen brief;
- Design Map;
- spike manifest;
- evaluation evidence available to it;
- public implementation-feedback history;
- As-Built;
- Git/provenance evidence;
- relevant previous Outcomes; and
- other bounded spike-local evidence.

It records:

- result;
- what was established;
- what failed or changed;
- material decisions and discoveries;
- relevant limitations;
- deferred concerns;
- useful provenance/promotion information;
- skill versions used; and
- what the evidence suggests should happen next.

Outcome must not become a second evaluator or a large forensic reconstruction step.

The manifest should become its primary source for workflow-execution history rather than requiring reconstruction from chats or agent logs.

---

# Outcome process exceptions

The current Outcome contract assumes a normally evaluated spike.

Spike 006 requires Outcome to support an explicit, predeclared process exception without weakening normal workflow requirements.

Outcome may run without independent evaluation only when:

- the frozen spike brief explicitly declared the exception before implementation began;
- the brief defines the substitute evidence/review process;
- required substitute checks have completed;
- the final implementation/change revision is committed;
- provenance is stable; and
- Outcome clearly records that independent evaluation was not performed.

A process-exception Outcome must not represent itself as an ordinary independently evaluated `PASS`.

Use an explicit result classification indicating successful completion under a documented process exception.

The exact label may be chosen during skill implementation, provided it is unambiguous.

For Spike 006, Outcome must record that:

- the methodology/tooling changes were completed under the documented exception;
- they were not independently evaluated using the workflow being changed; and
- the revised methodology remains unvalidated until Spike 007 exercises it.

Future spikes may use this exception only when their frozen brief explicitly establishes a legitimate process reason in advance.

It must never become a retroactive escape hatch after failed evaluation.

---

# Evaluator retry and information flow

The evaluator retains only:

```text
prepare
verify
```

Do not introduce additional evaluator modes merely to model retry behavior.

## Confirmed implementation failure

When `verify` establishes a genuine implementation defect:

1. the full `eval-result` remains evaluator-private;
2. evaluator `verify` produces public implementation feedback;
3. implementation is rerun against the same frozen brief, Design Map, and public evaluation contract plus that feedback;
4. a new implementation commit is produced;
5. evaluator `verify` runs again.

Do not rerun `prepare` merely because implementation failed.

The evaluation contract must not move in response to implementation failure.

## Public implementation feedback

The central information rule is:

> Implementation may learn what public contract it violated, but not how the hidden evaluator discovered the violation.

Public implementation feedback should identify, where relevant:

- the violated public requirement or invariant;
- expected externally observable behavior;
- observed externally observable behavior;
- material failure classification; and
- useful diagnostics that do not expose hidden evaluator mechanics.

It must not unnecessarily reveal:

- hidden test identities;
- hidden case construction;
- evaluator fixtures;
- private timing/oracle strategies;
- hidden input corpora; or
- other information whose purpose is specifically to remain independent from implementation.

The exact public artifact naming convention may be selected during implementation.

## Evaluator defect

If verification indicates an evaluator defect:

1. do not report that failure to implementation as an implementation defect;
2. diagnose and correct the evaluator artifact;
3. preserve the prior frozen evaluator revision;
4. freeze a distinguishable corrected evaluator revision;
5. rerun `verify` against the unchanged implementation.

If both evaluator and possible implementation defects appear to exist, establish trustworthy evaluation first.

Only implementation defects that remain after evaluator defects are corrected should be sent to implementation.

---

# Evaluator blind spots that must survive simplification

The evaluator skill may be substantially shortened, but important safeguards learned from earlier spikes must not disappear merely because their existing wording is verbose.

## Exact-path oracle validation

A helper or oracle working in isolation does not prove that the hidden test using it is valid.

Where asynchronous, lifecycle, PTY, WebSocket, process, provider, timing, or similar behavior matters, evaluator preparation must validate important failure oracles through the actual executable path where practical.

## Evaluator self-tests are not product coverage

Tests of evaluator helpers establish confidence in evaluator infrastructure.

They do not count as evidence that Harness satisfies a product requirement.

## Frozen evaluation is a contract

A failed implementation must not cause evaluator tests to be changed merely to make the result pass.

Evaluator artifacts may change only after a demonstrated evaluator defect, resolved specification ambiguity, or other legitimate classified reason.

Such changes must be explicit and historically traceable.

## Diagnostics classify; they do not rewrite evidence

Additional diagnostic work may establish whether a failure belongs to implementation, evaluator, specification, or infrastructure.

Diagnostic evidence must not silently substitute for broken mandatory evaluation or retroactively alter what a test originally established.

## Hidden evaluation must not impose undisclosed architecture

The evaluator may require structure or test seams only where necessary for fair evaluation and where those requirements are public.

Prefer externally observable behavior wherever practical.

---

# Skill blind spots and repository-wide rules

Spike 006 must establish a clear rule for where workflow knowledge belongs.

Use this principle:

> If a constraint or blind spot changes how one specific skill performs its job, it belongs in that skill.

> If a constraint applies across multiple roles or to the workflow as a whole, it belongs in `AGENTS.md` or equivalent repository-wide instructions.

Avoid large duplicated guidance across both.

Repository-wide concerns include:

- canonical workflow order;
- freeze semantics;
- commit boundaries;
- hidden-evaluation access rules;
- independence boundaries;
- manifest rules;
- skill version/history rules; and
- evaluation promotion/provenance rules.

Skill-local concerns include:

- evaluator oracle validation;
- Design Map's prohibition against inventing product behavior;
- As-Built's distinction from evaluation/code review;
- implementation's permitted inputs; and
- Outcome's synthesis boundary.

Domain-specific discoveries that do not belong in reusable methodology should remain in spike Outcomes or appropriate project documentation.

The goal is not to encode every historical failure into every future agent context.

---

# Skill versioning

Active skills must gain a lightweight explicit version model.

Do not introduce package-style or elaborate semantic-versioning infrastructure.

A simple monotonically increasing integer version is sufficient.

A skill version changes when its operational contract materially changes, including significant changes to:

- responsibility;
- inputs;
- outputs;
- permissions;
- lifecycle/order;
- freeze/safety rules; or
- execution procedure.

Purely typographical or editorial changes do not require a new contract version.

The exact metadata representation may vary where Claude and Codex skill formats have compatibility constraints.

---

# Historical skill preservation

Before materially replacing an existing active skill during Spike 006, preserve its previous active contract as an immutable historical document.

Historical copies must:

- preserve the actual previous skill content rather than paraphrasing it;
- identify the skill/version sufficiently for later provenance;
- live outside active skill-discovery paths;
- not be discoverable as executable/current skills by Codex, Claude, or future adapters;
- remain available to humans and historical synthesis; and
- never silently change after promotion to history.

A structure such as:

```text
docs/history/skills/
```

is acceptable.

The exact filesystem layout is not prescribed.

Do not preserve obsolete executable-looking `SKILL.md` files within active skill-discovery trees merely for historical purposes.

Git history remains useful, but after this spike it is not the sole intended historical representation of skill contracts.

The repository should make it easy to answer:

> Which skill contract was active when this spike ran?

---

# Skill execution provenance

Every completed ordinary spike should allow its Outcome to identify which material skill versions actually ran.

The spike manifest is the primary execution record.

Each skill run should identify its own skill name/version in its manifest entry and, where useful, in the artifact it produces.

Outcome should include a compact summary of the material skills/versions used.

No separate workflow-manifest bureaucracy beyond the per-spike manifest is required.

---

# Evaluation revision and promotion

Spike 006 must replace destructive or ambiguous evaluator promotion with an explicit non-destructive rule.

## During active evaluation

Evaluator-private artifacts remain private throughout implementation and retry.

A failed implementation does not automatically make its full `eval-result` public.

The implementation-facing handoff is sanitized public feedback.

## Correcting evaluator artifacts

If a frozen evaluator artifact is demonstrated to be defective:

- it may be corrected;
- the prior frozen revision must not be overwritten or deleted;
- the corrected revision must be distinguishable;
- provenance must identify which evaluator revision was used for each verification attempt.

## Verification attempts versus evaluator revisions

Multiple implementation attempts may be verified against the same frozen evaluator revision.

For example:

```text
Evaluator revision 1
→ implementation A fails
→ implementation B fails
→ implementation C passes
```

This does not require three separately promoted copies of the evaluator suite.

By contrast:

```text
Evaluator revision 1
→ evaluator defect discovered
→ evaluator revision 2
→ successful verification
```

Both evaluator revisions are material historical evidence.

The repository must preserve the distinction.

## Promotion

Promotion occurs only after the active evaluation cycle has reached an accepted successful result.

Promotion must:

- preserve the exact final frozen evaluator artifacts actually used for successful verification;
- preserve their result and provenance;
- never rebuild hidden tests as part of promotion;
- never regenerate evaluation from the brief merely because promotion has begun;
- never replace exact evaluated tests with cleaned-up or recreated equivalents;
- preserve superseded evaluator revisions when they are material to understanding evaluator defects, specification corrections, or evaluation history.

Earlier private verification results caused only by implementation failure do not automatically need public promotion.

Public implementation feedback and Outcome may preserve the useful history of those retries.

The essential invariants are:

> Promotion preserves evidence. It does not recreate it.

> Correcting frozen evaluation creates history. It does not erase history.

Promotion occurs only after the active implementation loop is complete so that evaluator-private evidence cannot leak back into implementation.

---

# Evaluator performance and context efficiency

The evaluator should be materially simplified.

There is no arbitrary line-count, turn-count, or token-count acceptance threshold.

Shorter is not automatically better.

However, every retained section should materially contribute to:

- evaluator operation;
- independent falsification;
- correct classification;
- hidden-information boundaries; or
- prevention of a demonstrated failure mode.

Remove or consolidate:

- duplicated repository-wide rules;
- repeated explanations already authoritative elsewhere;
- unnecessary repo-discovery instructions;
- obsolete constraints;
- unnecessary narrative;
- repeated lifecycle descriptions;
- accidental architecture design;
- complexity that does not improve falsification or diagnosis.

Preserve safeguards that have proven necessary.

The target is:

> Enough independent evaluation to credibly falsify the frozen spike contract, not an attempt to prove the entire repository correct.

The per-spike manifest should make future evaluator-cost comparisons easier.

---

# Claude-specific evaluator compatibility

Agent-neutral workflow skills remain a desirable future direction.

They are not a requirement of Spike 006.

Do not opportunistically redesign the skill-discovery/execution model, create a generic agent adapter architecture, or migrate every skill to a vendor-neutral abstraction during this spike.

Most Spike 006 implementation work will be performed with Codex.

The evaluator is currently Claude-oriented and must remain operational under Claude.

Codex may change evaluator methodology and contract as required by this brief, but must preserve Claude-specific execution requirements that are still necessary, including relevant:

- discovery conventions;
- invocation behavior;
- paths;
- arguments;
- environment assumptions; and
- private `../harness-hidden` handling.

After Codex changes Claude-facing evaluator material, Claude must perform a focused compatibility review.

## Claude compatibility evidence

Preserve a small public compatibility-review artifact for Spike 006.

It should record:

- evaluator skill version/revision reviewed;
- Claude tool/environment identity where available;
- checks performed;
- result;
- corrections triggered by the review.

The review must include more than prose inspection.

It should harmlessly exercise enough of the evaluator interface to establish that:

- Claude can discover the skill;
- invocation works;
- expected arguments are understood;
- required project-directory/path conventions remain valid;
- sibling `../harness-hidden` access conventions remain valid; and
- no accidental Codex-only assumption has been introduced.

A full evaluator `prepare` run is not required for Spike 006.

Spike 007 will provide the first full workflow exercise.

---

# Repository documentation

Update repository documentation so that the live documented workflow agrees with the intended workflow after Spike 006.

At minimum review:

- `AGENTS.md`;
- `README.md`;
- active skill definitions;
- relevant supporting templates/documentation; and
- other files that describe the current development methodology as authoritative.

Do not retroactively rewrite completed spike artifacts merely to make them appear to have used the new workflow.

Historical evidence should remain historical.

Where an earlier spike used an earlier skill contract, preserve that fact.

---

# Product scope

Spike 006 must not change Harness host, session, backend, protocol, browser, or provider behavior.

Do not use this spike to implement:

- structured Harness events;
- attention/approval handling;
- replay/resynchronization;
- persistence;
- multi-session behavior;
- additional provider integrations; or
- other product-facing roadmap work.

These remain on the product path after the methodology detour.

No runtime application refactoring should occur unless strictly required to support methodology tooling, and any such requirement should be surfaced before proceeding.

---

# Spike 007 — acceptance and dogfood

Spike 007 is the intended end-to-end validation of the revised workflow.

Spike 006 should leave the methodology ready for that exercise but must not claim workflow success based solely on static inspection of the skills.

Spike 007 should be deliberately small enough that workflow cost and unnecessary evaluator complexity are visible.

Its initial draft brief may intentionally contain one or more material ambiguities so that Brief Readiness can demonstrate that it catches them.

However:

> Intentional ambiguity belongs in the draft Spike 007 brief, not the frozen brief.

Any material ambiguity identified by Brief Readiness must be resolved before freeze.

Spike 007 should then exercise:

```text
draft brief
→ Brief Readiness
→ resolve findings
→ freeze brief
→ Design Map
→ freeze Design Map
→ evaluator prepare
→ freeze evaluation
→ implementation
→ evaluator verify
→ retry if required
→ As-Built
→ Outcome
```

Where practical, Spike 007 should expose whether:

- Brief Readiness catches genuine material ambiguity;
- Design Map remains compact and structural;
- evaluator preparation remains appropriately bounded;
- implementation works without evaluator-private knowledge;
- confirmed implementation failure can be communicated without revealing hidden tests;
- evaluator defects can be corrected without destroying history;
- manifest telemetry is useful without leaking hidden evaluation;
- As-Built detects material Missing, Contradictory, or Extra facts;
- Outcome remains a compact historical synthesis; and
- overall workflow cost is materially improved relative to recent spikes.

Designing and implementing Spike 007 is not part of Spike 006.

---

# Non-goals

Spike 006 does not:

- change Harness product behavior;
- validate the revised methodology end-to-end;
- require hidden evaluation of the methodology refactor;
- make all skills agent-neutral;
- introduce a generic agent/plugin architecture;
- redesign Git branching strategy;
- require `../harness-hidden` to become a Git repository;
- rewrite historical spike records into the new format;
- turn every previous discovery into an always-loaded instruction;
- introduce complex semantic versioning;
- introduce a workflow database or state machine;
- make `manifest.md` authoritative for freeze state;
- require identical telemetry from Claude and Codex;
- make Outcome larger or replace it;
- merge As-Built into Outcome;
- add evaluator modes beyond `prepare` and `verify`; or
- optimize toward an arbitrary token, line, or turn-count threshold.

---

# Acceptance criteria

Spike 006 is successful when all of the following are true:

1. The canonical workflow order is documented consistently, with Brief Readiness occurring before brief freeze and before Design Map, evaluator preparation, or implementation.

2. The preferred `brief-readiness` naming decision is resolved and active documentation no longer creates ambiguity about the skill's position.

3. Public freeze semantics use durable Git identities, with content hashes available where useful for drift detection.

4. Evaluator-private freeze semantics work with `../harness-hidden` and do not require private evaluator material to be committed to the Harness repository.

5. Legitimate revise/refreeze behavior and downstream invalidation rules are explicit.

6. Meaningful workflow commit boundaries are documented, including brief, Design Map, public evaluation contract, implementation, evaluation promotion, As-Built, and Outcome.

7. Every spike has a public append-only `manifest.md` or equivalent execution/provenance artifact.

8. Revised material workflow skills define how they record their execution and available statistics in that manifest.

9. Telemetry is capability-dependent rather than artificially standardized across Claude and Codex.

10. Public manifest entries cannot leak evaluator-private evidence.

11. Existing active skills materially changed by Spike 006 have their previous contracts preserved as immutable, non-executable historical documents.

12. Active skills use a lightweight explicit version convention and the repository explains when a version changes.

13. Future Outcomes can identify which material skill versions actually ran using the spike manifest and local provenance.

14. Repository-wide workflow rules and skill-specific blind spots have a clear ownership rule and unnecessary duplication is reduced.

15. A bounded Design Map skill exists and cannot legitimately invent unresolved externally observable product behavior.

16. The evaluator still exposes only `prepare` and `verify`.

17. The evaluator remains Claude-compatible and receives a durable focused Claude compatibility review after Codex changes it.

18. The Claude compatibility review harmlessly exercises discovery/invocation/path assumptions rather than relying only on prose inspection.

19. Evaluator preparation remains independent and hidden from implementation while becoming materially leaner and more operationally bounded.

20. Exact-path oracle validation, evaluator-self-test separation, frozen-evaluation integrity, and failure classification remain explicit.

21. Confirmed implementation failure produces useful public feedback without exposing private evaluator mechanics.

22. Implementation failure does not cause evaluator preparation to be rerun or the frozen evaluation contract to move.

23. Evaluator defects are corrected and reverified against unchanged implementation before implementation is blamed.

24. Frozen evaluator revisions are never silently destroyed when corrected.

25. Promotion preserves exact evaluated artifacts and material superseded evaluator revisions rather than rebuilding or replacing them.

26. A bounded `as-built` skill exists and distinguishes actual implementation facts from evaluation and code-quality judgment.

27. Outcome remains a distinct quick synthesis skill.

28. Outcome supports explicitly predeclared process exceptions without weakening ordinary independently evaluated Outcome requirements.

29. Spike 006's Outcome clearly records that independent evaluation was intentionally omitted and that the revised methodology remains unvalidated until Spike 007.

30. README, `AGENTS.md`, active skills, and relevant supporting documentation describe one coherent current methodology.

31. Spike 006 makes no product-facing Harness runtime change.

---

# Evidence to preserve in the Spike 006 Outcome

The Outcome should record at least:

- which skills changed;
- resulting skill versions;
- where previous skill contracts were preserved;
- whether `spike-review` became `brief-readiness`;
- the final canonical workflow;
- the final freeze and commit rules;
- the manifest convention and statistics actually available during Spike 006;
- the public/private evaluator-information boundary;
- evaluator revision and promotion rules;
- which known blind spots were retained and where they live;
- meaningful evidence of evaluator simplification;
- the result of Claude compatibility review;
- any decisions deliberately deferred to an agent-neutral-skills spike;
- material concerns that Spike 007 should pressure-test; and
- confirmation that Harness's product roadmap was not changed by this methodology detour.

---

# Successful outcome

A successful Spike 006 does not establish that the revised Harness development methodology is proven.

It establishes that:

> The methodology has been rebuilt into a coherent, bounded, observable, and historically safe form that is ready for end-to-end validation.

Spike 007 then answers:

> Does the revised workflow work effectively when exercised end-to-end?
