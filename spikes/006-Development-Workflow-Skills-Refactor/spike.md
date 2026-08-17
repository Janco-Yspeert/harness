# Spike 006 — Development Workflow Skills Refactor

## Goal

Refactor the AI-assisted development skills and supporting repository instructions used to build Harness so that the workflow is:

- correctly ordered and clearly bounded;
- substantially leaner and less context-intensive;
- explicit about each skill's responsibility and known blind spots;
- explicit about freeze, retry, commit, branch, versioning, and provenance semantics;
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

## Spike 006 substitute acceptance gate

Because Spike 006 deliberately does not use independent evaluator preparation and verification, it requires an explicit substitute acceptance gate before Outcome may run.

The final candidate revision must:

- pass `npm run check`;
- complete the required Claude compatibility review;
- receive a final review of the complete candidate diff against the frozen brief and all acceptance criteria;
- contain no unresolved material finding;
- contain no unintended Harness product or runtime behavior change; and
- be explicitly accepted by the project owner.

The final review may be assisted by an independent AI reviewer, but the project owner remains the final acceptance authority.

The result must be preserved in:

`acceptance.md`

The artifact must record at least:

- frozen brief content identity and provenance;
- candidate implementation revision;
- result of `npm run check`;
- result and reference for the Claude compatibility review;
- result of the final diff and acceptance-criteria review;
- any unresolved findings;
- any independent reviewer or review assistance used;
- acceptance authority;
- final decision: `ACCEPTED` or `NOT ACCEPTED`; and
- accepted candidate revision.

Outcome must not run unless `acceptance.md` records `ACCEPTED`.

Any material change to the candidate revision after acceptance invalidates that acceptance and requires the substitute acceptance gate to be repeated against the new candidate revision.

The commit containing `acceptance.md` necessarily follows the candidate revision that it approves. This does not alter the identity of the accepted candidate revision.

---

# Branch and public handoff convention

Each spike should be developed on a public feature branch named:

```text
feat/spike-NNN
```

For Spike 006:

```text
feat/spike-006
```

The branch is the normal public handoff surface for human and AI review.

Meaningful public workflow checkpoints should be committed and pushed so that another reviewer can inspect the actual repository state rather than relying on pasted copies or conversational summaries.

At minimum:

- the draft being submitted for Brief Readiness must be committed and pushed before external review where repository inspection is expected;
- blocked Brief Readiness evidence must be preserved and pushed before the working brief is materially revised further;
- the passing/frozen brief must be committed and pushed;
- subsequent stable workflow phase boundaries should be committed as defined below; and
- the final Outcome and associated manifest/provenance updates must be committed and pushed.

This convention applies only to public repository material.

Evaluator-private material under `../harness-hidden` must not be committed to the Harness repository or exposed merely to satisfy the branch convention.

The spike branch is a provenance and handoff mechanism, not the authority that establishes hidden evaluator state.

---

# Canonical workflow after Spike 006

For ordinary implementation spikes, the intended workflow is:

1. Draft spike brief
2. Brief Readiness
3. Resolve findings if required
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

# Brief Readiness and preliminary history

The live spike brief remains:

```text
spikes/<spike>/spike.md
```

It is the current working brief throughout drafting and review.

`preliminary/NNN/` is not a copy of every Brief Readiness pass.

It exists specifically to preserve drafts that were reviewed and found not ready to freeze.

## Blocked review

If Brief Readiness determines that freeze is blocked and the brief requires material revision:

1. preserve the exact reviewed draft;
2. preserve the corresponding review findings;
3. place them together under the next monotonically numbered preliminary directory;
4. commit and push that evidence before materially revising the live brief further.

For example:

```text
spikes/006-.../
  spike.md
  feedback.md

  preliminary/
    001/
      spike.md
      feedback.md

    002/
      spike.md
      feedback.md
```

Each `preliminary/NNN/spike.md` must be the exact draft that produced the corresponding `preliminary/NNN/feedback.md`.

Previous preliminary directories are immutable historical evidence.

They must never be overwritten by later passes.

The live root `spike.md` then continues as the working brief.

## Passing review

If Brief Readiness determines that the live brief is ready to freeze:

- do not move or duplicate that passing brief into `preliminary/`;
- keep the passing brief as the live root `spike.md`;
- preserve the passing readiness feedback beside it where the workflow retains such an artifact;
- record the run in the spike manifest;
- commit and push the passing/frozen state.

The frozen brief must be content-identical to the version that received the passing readiness result.

Any material edit after the passing review requires another Brief Readiness run before the brief may again be considered frozen.

---

# Workflow state and freeze semantics

“Frozen” is a contract-bearing workflow state and must have a durable identity.

Use the following general rule:

> A frozen artifact has an immutable recorded content identity and must not change as an input to the current workflow cycle. A legitimate material change creates a new frozen revision and invalidates downstream artifacts derived from the prior revision where applicable.

## Content identity

The canonical freeze identity of an artifact is a deterministic content hash or equivalent immutable content identity.

The exact hashing algorithm may be selected by implementation, provided it is deterministic, documented, and consistently applied.

This content identity allows public and evaluator-private artifacts to use the same conceptual freeze model.

## Public Git provenance

For public contract-bearing artifacts, the exact frozen content must also exist in committed repository state.

Git therefore provides durable provenance for the frozen content.

The distinction is:

> Content identity establishes what was frozen.

> Git establishes where that exact public content was durably preserved.

A public artifact does not need to embed the SHA of the commit that contains itself.

Avoid self-referential provenance requirements.

## Public contract-bearing artifacts

Public contract-bearing artifacts include at least:

- `spike.md`;
- `design-map.md`; and
- public evaluator requirements.

Each should have:

- a deterministic content identity; and
- committed Git provenance containing that exact content before downstream work relies on it.

## Private evaluator artifacts

Evaluator-private material currently lives under:

```text
../harness-hidden
```

It is not part of the Harness repository and must not be assumed to have Git history.

Private evaluator freeze identity therefore uses explicit content identities and private freeze metadata rather than a Harness Git commit.

Evaluator preparation must record sufficient private freeze metadata to identify the exact frozen evaluation revision, including at least:

- evaluation revision identity;
- frozen brief content identity;
- frozen Design Map content identity;
- public evaluation-requirements content identity;
- private evaluation-spec identity;
- hidden-test and supporting-file identities;
- evaluator skill identity/version; and
- any additional information necessary to establish that `verify` is running the same evaluation that was frozen.

A compact private freeze manifest or equivalent mechanism is acceptable.

The exact serialization format is not prescribed.

---

# Freeze and revision rules

## Brief change

A material change to the frozen brief requires:

1. a new working brief revision;
2. another Brief Readiness pass;
3. a new frozen brief content identity and committed provenance;
4. reconsideration or regeneration of downstream Design Map material; and
5. invalidation of evaluator preparation derived from the previous frozen brief.

## Design Map change

A material change to the frozen Design Map requires:

1. a new Design Map content identity;
2. new committed provenance; and
3. invalidation of evaluator preparation derived from the previous Design Map where the change affects implementation or evaluation assumptions.

## Evaluation change

An implementation failure does not permit the frozen evaluator contract to move.

A demonstrated evaluator defect or legitimate specification correction may cause evaluator artifacts to change.

When this happens:

- the prior frozen evaluator revision must be preserved;
- the corrected evaluator becomes a distinguishable new frozen revision;
- provenance must show which evaluator revision was used by each verification attempt; and
- verification should be rerun against the unchanged implementation before implementation is blamed.

No additional evaluator command mode is required to represent this lifecycle.

---

# Evaluator preparation and freeze ordering

Evaluator preparation must avoid circular dependency between private freeze metadata and the Git commit later preserving public evaluation requirements.

The intended sequence is:

1. begin from the frozen brief and frozen Design Map;
2. create the public evaluation requirements;
3. create the private evaluator specification, tests, helpers, and supporting material under `../harness-hidden`;
4. validate the evaluator and perform its integrity checks;
5. freeze the private evaluator revision using content identities, including the content identity of the exact public evaluation requirements;
6. commit and push the public evaluation requirements and safe public manifest entry;
7. confirm that the committed public evaluation-requirements content matches the identity recorded by the frozen private evaluator revision;
8. only then permit implementation to begin.

The private freeze metadata does not need to contain the Git commit SHA that later preserves the public requirements.

It must contain the public requirements' immutable content identity.

Git provenance can then be linked by verifying that committed repository state contains that exact content.

---

# Commit and push boundaries

The workflow should use meaningful Git commits as durable public phase boundaries.

The objective is not to generate commits for trivial agent activity.

A commit should correspond to a meaningful contract transition, public handoff, implementation revision, or durable evidence artifact.

Stable public checkpoints should also be pushed to the spike branch so that independent reviewers can inspect them.

## Blocked Brief Readiness

When a review blocks freeze:

- preserve the exact reviewed draft and feedback under `preliminary/NNN/`;
- update the manifest;
- commit and push that evidence before materially revising the live brief further.

## Brief freeze

After Brief Readiness passes:

- retain the live passing `spike.md`;
- retain the passing feedback where applicable;
- record the run in `manifest.md`;
- commit and push the passing/frozen state.

This commit provides durable provenance for the frozen brief content.

## Design Map

Generate the Design Map from the frozen brief.

Record its run in the manifest, then commit and push the Design Map before evaluator preparation begins.

Once evaluator preparation begins, the frozen Design Map is fixed for that evaluation cycle unless explicitly revised and downstream work invalidated.

## Public evaluation contract

Evaluator `prepare` creates public evaluation requirements while private evaluator artifacts remain under `../harness-hidden`.

After private evaluation passes its preparation/integrity checks and has a frozen content identity:

- commit the exact public evaluation requirements;
- include the safe public manifest entry;
- push the checkpoint;
- verify that committed public content matches the identity recorded in the private evaluation freeze.

Implementation must not begin until this boundary has been established.

## Implementation

Implementation produces a focused implementation revision containing:

- production changes;
- visible durable tests where appropriate; and
- its manifest entry.

The implementation commit is the immutable implementation revision supplied to evaluator `verify`.

It should be pushed before external verification when verification or review occurs against the public branch.

Evaluator-private material must never be included.

## Implementation feedback and retry

On confirmed implementation failure:

1. evaluator `verify` emits public implementation feedback;
2. the feedback and safe manifest entry are preserved publicly;
3. the feedback is committed;
4. implementation is rerun against the same frozen contract plus that feedback;
5. the corrected implementation receives a new implementation commit;
6. evaluator `verify` runs again.

A public feedback checkpoint should be pushed where another agent or reviewer needs to consume it from the branch.

## Evaluation promotion

After accepted successful evaluation:

- promote exact evaluation evidence according to the promotion rules below;
- preserve required provenance and material evaluator-revision history;
- update the manifest;
- commit and push the promoted public evaluation separately from implementation.

## As-Built

The As-Built artifact is evidence consumed by Outcome.

It should receive a small distinct commit with its manifest entry and should be pushed before Outcome if Outcome is performed by a separate reviewer or agent.

## Outcome

Outcome remains a dedicated final historical artifact.

It receives its own commit together with its final manifest/provenance update.

The completed Outcome commit must be pushed to the spike feature branch.

---

# Per-spike manifest

Spikes operating under the revised workflow maintain a public:

```text
manifest.md
```

Its purpose is:

> Record which material workflow operations actually ran, what performed them, what they consumed and produced, and useful execution statistics available from the relevant agent/runtime.

The manifest is an execution, observability, and provenance artifact.

It is not the authority that establishes contract freeze state.

## Scope

The manifest requirement is prospective.

It applies to:

- Spike 006 from the point at which this convention is introduced; and
- all subsequent spikes begun under the revised workflow.

Completed historical Spikes 001–005 are explicitly exempt from backfilling.

Do not manufacture retrospective execution histories for them.

## Spike 006 transition

Because the manifest convention was introduced while Spike 006 was already underway, earlier Spike 006 workflow activity may be recorded retrospectively only where facts can be reliably established from preserved artifacts, Git history, or trustworthy agent records.

Retrospective entries must:

- be clearly marked as retrospectively recorded;
- include only facts that can actually be established;
- mark unavailable statistics as unavailable; and
- never fabricate metrics to make the record appear complete.

Subsequent Spike 006 runs should record themselves contemporaneously.

A run may capture a lightweight start baseline when needed to measure a real
value, but must not append a provisional manifest entry merely to mark its
start. After substantive work and verification, the manifest update is the
run's final repository-content change. Its measurement cutoff is immediately
before that update; it does not include the update itself or later commit, push,
or response activity. A failed or interrupted run should still be recorded when
the agent retains control.

## Append-only execution history

Material workflow runs append distinct entries.

A later run must not overwrite evidence that an earlier run occurred.

Examples include:

- Brief Readiness;
- Design Map;
- evaluator `prepare`;
- implementation attempt;
- evaluator `verify`;
- implementation retry;
- As-Built;
- Outcome;
- material compatibility/review operations.

## Common provenance fields

Each material entry should record, where applicable:

- run identifier or sequence;
- skill name;
- skill version;
- agent/tool identity;
- mode or workflow stage;
- result/status;
- meaningful input content identities;
- meaningful output identities;
- timestamp where reliably available;
- whether the entry was recorded contemporaneously or retrospectively.

The exact Markdown format is not prescribed, but it should remain human-readable and easy for Outcome or simple tooling to consume.

## Execution statistics

Each skill should additionally record meaningful execution statistics that are reliably available from the agent or runtime that performed it through the manifest-update cutoff.

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

Record only runtime-provided or cheaply and directly measured values. Do not
manually estimate tokens, context, calls, or duration. Omit unavailable metrics
instead of adding ceremonial `unknown` fields.

Metrics available only after the final response cannot be persisted truthfully
during that same run. A later runtime or orchestrator may append them when they
are useful and clearly marked retrospective.

The rule is:

> Report useful execution statistics that are actually available.

The manifest should make later workflow-cost comparison possible without making metric uniformity a condition of successful execution.

## Manifest authority boundary

`manifest.md` is the authoritative per-spike record of material workflow executions and their skill provenance.

It is not authoritative for contract freeze state.

The responsibilities remain separate:

- artifact content identities establish what was frozen;
- Git establishes durable public provenance;
- the manifest establishes which workflow operations actually ran and which skill/version performed them.

## Hidden-evaluation boundary

`manifest.md` is public and potentially visible to implementation.

Evaluator entries must therefore not expose private evaluation mechanics during the active implementation loop.

Public evaluator manifest entries may record safe information such as:

- evaluator skill/version;
- `prepare` or `verify`;
- evaluator revision identity;
- high-level verification classification;
- whether public implementation feedback was emitted;
- safe aggregate execution statistics;
- public artifact references.

They must not expose unnecessarily:

- hidden test identities;
- individual hidden cases;
- hidden fixtures;
- exact hidden inputs;
- private timing/oracle strategies;
- private diagnostic evidence; or
- other information intended to remain independent from implementation.

Richer evaluator telemetry must remain under `../harness-hidden` during the
active loop. It may become public only through the existing accepted-evaluation
promotion rules. The evaluator writes private detail before making the safe
public manifest update its final repository-content step.

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

Where findings block freeze, the blocked draft and corresponding findings must be preserved under `preliminary/NNN/` as described above.

## Design Map

> What is the smallest shared design contract that implementation and evaluation must interpret consistently?

The Design Map skill creates a small `design-map.md`.

The Quest project's existing Design Map skill may be used as a practical reference for scale and intent, but Harness requirements remain authoritative.

The Design Map should first prefer black-box evaluation through externally observable behavior.

It may make a bounded shared-contract decision when implementation and evaluation would otherwise need to guess independently and every valid choice preserves the frozen product behavior and scope.

Such decisions may include a stable construction/import surface, artifact location, ownership boundary, lifecycle responsibility, or evaluation/testability seam genuinely required by both roles.

It must not decide externally observable behavior, product scope, failure semantics omitted by the brief, or architecture unnecessary for fair independent evaluation.

Choices needed only by implementation remain implementation freedom. Evaluator convenience alone does not justify a shared structural contract where reasonable black-box evaluation is available.

The Design Map should record only material information useful to independent implementation and evaluation, such as:

- shared contracts established within this bounded authority;
- settled structural decisions;
- architectural invariants relevant to the spike;
- implementation seams;
- evaluation/testability seams;
- ownership and lifecycle boundaries where relevant; and
- meaningful implementation freedoms left deliberately undecided.

It must not invent product behavior.

If producing the Design Map exposes an unresolved question that changes externally observable behavior or the spike contract:

1. return to the brief;
2. resolve the issue;
3. rerun Brief Readiness;
4. refreeze the brief;
5. regenerate or revise the Design Map from the new frozen contract.

The Design Map is not a general architecture document or implementation plan.

## Evaluator — `prepare`

> How can the frozen spike contract be independently falsified?

`prepare` remains one of only two evaluator modes.

It derives public evaluation requirements and private evaluation from the frozen brief and Design Map.

It must expose structural or testability requirements needed for fair evaluation without revealing hidden cases.

It must create and freeze the evaluation before implementation begins.

## Implementation

> Build the frozen spike.

The implementation agent receives:

- the frozen brief;
- frozen Design Map;
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
- `SPECIFICATION_DRIFT` where applicable.

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

It should use an explicit result classification such as:

> `COMPLETE — PROCESS EXCEPTION`

or another unambiguously equivalent label supported by the revised Outcome format.

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
- branch and commit boundaries;
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

Every completed spike operating under the revised workflow should allow its Outcome to identify which material skill versions actually ran.

The spike manifest is the primary execution record.

Each skill run should identify its own skill name/version in its manifest entry and, where useful, in the artifact it produces.

Outcome should include a compact summary of the material skills and versions used.

No additional workflow-manifest system is required.

---

# Evaluation revision and promotion

Spike 006 must replace destructive or ambiguous evaluator promotion with an explicit non-destructive rule.

## During active evaluation

Evaluator-private artifacts remain private throughout implementation and retry.

A failed implementation does not automatically make its full `eval-result` public.

The implementation-facing handoff is sanitized public feedback.

Private verification bookkeeping uses:

```text
<project>-hidden/<spike>/.eval/attempt-ledger.json
<project>-hidden/<spike>/.eval/attempts/NNN/eval-result.md
<project>-hidden/<spike>/.eval/revisions/NNN/**
```

Attempt and revision identifiers are monotonically increasing zero-padded
three-digit numbers. The ledger links each immutable attempt result to the exact
implementation and evaluator revision. A superseded frozen evaluator bundle is
copied exactly into its revision archive before correction; it is never
reconstructed later.

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
It does require three immutable verification results, each linked to its exact
implementation identity and evaluator revision in a private attempt ledger.

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
- preserve every superseded frozen evaluator revision from the completed cycle;
- preserve the complete verification-attempt ledger and every immutable result,
  including failures caused by implementation, evaluator, specification,
  infrastructure, or drift;
- preserve each attempt's exact implementation/evaluator provenance;
- never rebuild hidden tests as part of promotion;
- never regenerate evaluation from the brief merely because promotion has begun;
- never replace exact evaluated tests with cleaned-up or recreated equivalents;
- never replace full private results with sanitized public feedback or an
  Outcome summary.

An unchanged evaluator suite should be promoted once and referenced by every
attempt that used it. If the active cycle does not reach accepted success, its
history remains private and promotion is forbidden.

The essential invariants are:

> Promotion preserves the complete evidence chain. It does not curate a cleaner
> past.

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

Codex may change evaluator methodology and contract as required by this brief, but must preserve Claude-specific execution requirements that remain necessary, including relevant:

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
→ resolve findings if required
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
- blocked drafts are preserved correctly without cluttering successful review history;
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
- redesign the Git branching strategy beyond establishing the per-spike feature-branch convention;
- require `../harness-hidden` to become a Git repository;
- backfill manifests for completed historical spikes;
- preserve every successful Brief Readiness pass under `preliminary/`;
- rewrite historical spike records into the new format;
- turn every previous discovery into an always-loaded instruction;
- introduce complex semantic versioning;
- introduce a workflow database or centralized state machine;
- make `manifest.md` authoritative for contract freeze state;
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

3. A spike feature-branch convention of `feat/spike-NNN` is documented as the normal public workflow and review handoff.

4. Stable public workflow checkpoints are committed and pushed so that external reviewers can inspect the actual spike branch.

5. Blocked Brief Readiness drafts and their matching findings are preserved immutably under monotonically numbered `preliminary/NNN/` directories.

6. Passing/current working briefs are not unnecessarily copied into `preliminary/`.

7. A passing frozen brief is content-identical to the live brief actually reviewed as ready.

8. Public freeze semantics use deterministic content identities plus committed Git provenance.

9. Public artifacts do not require self-referential commit identities inside files contained by those commits.

10. Evaluator-private freeze semantics work with `../harness-hidden` and do not require private evaluator material to be committed to Harness.

11. The evaluator freeze sequence can identify public evaluation requirements by content before their later Git provenance is established.

12. Implementation cannot begin until the frozen private evaluation and exact committed public evaluation contract are shown to correspond.

13. Legitimate revise/refreeze behavior and downstream invalidation rules are explicit.

14. Meaningful workflow commit boundaries are documented, including blocked readiness evidence, frozen brief, Design Map, public evaluation contract, implementation, public implementation feedback where required, evaluation promotion, As-Built, and Outcome.

15. The final Outcome commit and manifest update are pushed to the spike feature branch.

16. Spike 006 and subsequent revised-workflow spikes maintain a public append-only `manifest.md`.

17. Completed historical Spikes 001–005 are explicitly exempt from manifest backfilling.

18. Any retrospectively recorded Spike 006 manifest entries are clearly identified and contain only verifiable information.

19. Revised material workflow skills define how they record their execution and available statistics in the manifest.

20. Telemetry is capability-dependent rather than artificially standardized across Claude and Codex.

21. Public manifest entries cannot leak evaluator-private evidence.

22. `manifest.md` is authoritative for workflow execution and skill-version provenance but not contract freeze state.

23. Existing active skills materially changed by Spike 006 have their previous contracts preserved as immutable, non-executable historical documents.

24. Active skills use a lightweight explicit version convention and the repository explains when that version changes.

25. Future Outcomes can identify which material skill versions actually ran using the spike manifest and local provenance.

26. Repository-wide workflow rules and skill-specific blind spots have a clear ownership rule and unnecessary duplication is reduced.

27. A bounded Design Map skill establishes the smallest shared contract required by implementation and evaluation, prefers black-box evaluation, leaves implementation-only choices free, and cannot legitimately invent unresolved externally observable product behavior.

28. The evaluator still exposes only `prepare` and `verify`.

29. The evaluator remains Claude-compatible and receives a durable focused Claude compatibility review after Codex changes it.

30. The Claude compatibility review harmlessly exercises discovery, invocation, path, and environment assumptions rather than relying only on prose inspection.

31. Evaluator preparation remains independent and hidden from implementation while becoming materially leaner and more operationally bounded.

32. Exact-path oracle validation, evaluator-self-test separation, frozen-evaluation integrity, and failure classification remain explicit.

33. Confirmed implementation failure produces useful public feedback without exposing private evaluator mechanics.

34. Implementation failure does not cause evaluator preparation to be rerun or the frozen evaluation contract to move.

35. Evaluator defects are corrected and reverified against unchanged implementation before implementation is blamed.

36. Frozen evaluator revisions are never silently destroyed when corrected.

37. Promotion after an accepted pass preserves exact evaluator revisions, the
complete immutable verification-attempt history—including implementation and
evaluator failures—and their provenance rather than rebuilding, replacing, or
selectively omitting evidence.

38. A bounded `as-built` skill exists and distinguishes actual implementation facts from evaluation and code-quality judgment.

39. Outcome remains a distinct quick synthesis skill.

40. Outcome supports explicitly predeclared process exceptions without weakening ordinary independently evaluated Outcome requirements.

41. Spike 006's Outcome clearly records that independent evaluation was intentionally omitted and that the revised methodology remains unvalidated until Spike 007.

42. README, `AGENTS.md`, active skills, and relevant supporting documentation describe one coherent current methodology.

43. Spike 006 makes no product-facing Harness runtime change.

---

# Evidence to preserve in the Spike 006 Outcome

The Outcome should record at least:

- which skills changed;
- resulting skill versions;
- where previous skill contracts were preserved;
- whether `spike-review` became `brief-readiness`;
- the final canonical workflow;
- the final freeze, branch, commit, and push rules;
- blocked Brief Readiness history preserved during Spike 006;
- the manifest convention and statistics actually available during Spike 006;
- which Spike 006 manifest entries were recorded retrospectively, if any;
- the public/private evaluator-information boundary;
- evaluator revision and promotion rules;
- which known blind spots were retained and where they live;
- meaningful evidence of evaluator simplification;
- the result of Claude compatibility review;
- any decisions deliberately deferred to an agent-neutral-skills spike;
- material concerns that Spike 007 should pressure-test;
- confirmation that the final Outcome commit was pushed to `feat/spike-006`; and
- confirmation that Harness's product roadmap was not changed by this methodology detour.

---

# Successful outcome

A successful Spike 006 does not establish that the revised Harness development methodology is proven.

It establishes that:

> The methodology has been rebuilt into a coherent, bounded, observable, and historically safe form that is ready for end-to-end validation.

Spike 007 then determines whether the revised workflow works effectively when exercised end-to-end.
