# Spike 006 — Brief Readiness Review

> Workflow note for Spike 006 implementation: revise the readiness-review skill
> so each reviewed draft and its corresponding findings are preserved together
> under a monotonically numbered `preliminary/NNN/` directory. A later review
> must create a new numbered snapshot rather than overwrite an earlier one.

## Findings

### Blocker — “Frozen” is a central workflow state, but the brief never defines how it is established or identified

The target workflow freezes the brief before the Design Map and freezes evaluation before implementation (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:91-102`). It also requires repository-wide freeze semantics (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:363-382`), immutable historical skill contracts (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:422-449`), distinguishable evaluator revisions tied to verification attempts (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:465-476`), and promotion of the exact final frozen evaluator artifacts (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:478-503`). Yet it does not say what event or durable identity makes a brief, Design Map, or evaluation “frozen.”

That omission is material, not clerical. The current evaluator relies on a formatted-file hash for one part of drift detection (`skills/evaluator/SKILL.md:134-147`), while the implementation skill treats a Git commit as the immutable implementation revision (`skills/implementation/SKILL.md:130-165`). An implementer could reasonably define freeze as a commit, a content hash recorded in another artifact, a manifest, or merely a declared workflow state. Those choices produce different drift detection, provenance, retry, and promotion behaviour. They also determine whether acceptance criteria 11–14 can be verified rather than solemnly asserted by a Markdown file wearing a tie.

**Minimum clarification before freeze:** define the durable identity used to freeze each contract-bearing input (at least `spike.md`, `design-map.md`, public evaluation requirements, and private evaluation artifacts), where that identity is recorded, and the explicit revise/refreeze rule when any such input legitimately changes. The mechanics may remain implementation choices, but the required identity and observable drift/provenance guarantees cannot.

### Blocker — Spike 006’s required Outcome cannot run under the current Outcome preconditions

The spike-specific exception explicitly omits independent evaluator preparation and verification, then requires the existing/revised Outcome skill to record the spike (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:57-85`). Acceptance also requires a completed Outcome for Spike 006 (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:701-711`). The current Outcome skill, however, may run only after a committed implementation has passed independent evaluation and that evaluation has been promoted and committed; it must refuse to write a final Outcome otherwise (`skills/outcome/SKILL.md:26-50`).

“Existing/revised” does not settle what the revised general contract should be. Blindly weakening Outcome’s preconditions would change the ordinary workflow and its provenance guarantees; leaving them intact makes the mandated final step impossible. This is exactly the sort of exception-shaped trap from which process documents breed at night.

**Minimum clarification before freeze:** state that Outcome must support an explicitly documented per-spike process exception, define the evidence and provenance required for such an Outcome, and define how its result is labelled when no independent evaluation exists. Alternatively, state that Spike 006’s Outcome is a one-off manual artifact and the Outcome skill is not used. The former fits the stated process better, but the brief must choose.

### Material clarification — The workflow does not define durable per-spike skill-version provenance

The brief requires explicit skill versioning and says the repository should make it easy to answer which skill contract was active when a spike ran (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:398-449`). It requires Spike 006’s own Outcome to list changed skills and resulting versions (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:715-731`), but it does not say how ordinary future spikes record the versions actually used at each workflow stage.

Without that rule, version numbers and historical copies exist but are not reliably connected to executions. Git history can sometimes reconstruct the answer, but the brief explicitly says Git history is not the only historical representation required (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:443-445`). Implementations may therefore diverge between an Outcome-only convention, per-artifact metadata, or a workflow manifest, with different cost and reliability.

**Minimum clarification before freeze:** name the authoritative, durable place where each completed spike records the skill name/version used for its material stages. Requiring the Outcome to record this is sufficient if that is the intended lightweight model; no new manifest is inherently necessary.

### Material clarification — Claude compatibility review has no required evidence artifact or acceptance boundary

The brief requires a focused Claude review after Codex changes Claude-facing evaluator material (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:535-555`) and makes receipt of that review an acceptance criterion (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:683-687`). It says the eventual Outcome should record the result (`spikes/006-Development-Workflow-Skills-Refactor/spike.md:715-731`), but does not require preservation of the review itself or define what evidence distinguishes “Claude could read the prose” from “Claude could discover and correctly invoke the skill with its path, argument, and environment conventions.”

That leaves completion dependent on an unverifiable conversational claim and gives the reviewer no stable input/output boundary. The likely intent is clear, so this need not become a grand certification ritual.

**Minimum clarification before freeze:** require a small spike-local compatibility record (or another named durable record) containing the evaluator revision reviewed, the Claude environment/tool used, the discovery/invocation/path/argument/environment checks performed, the result, and any corrections triggered. State whether inspection is sufficient or whether a harmless invocation/prepare-path exercise is required.

## Verdict

**Not ready to freeze.** Resolve:

1. the durable freeze identity and revise/refreeze contract; and
2. the collision between Spike 006’s no-evaluation exception and Outcome’s mandatory independent-evaluation preconditions.

The per-spike skill-version provenance rule and Claude compatibility evidence should also be tightened before freeze to prevent divergent implementations, but neither requires a new product decision or elaborate machinery.

## Review limitations

I reviewed the complete Spike 006 brief, `AGENTS.md`, `GOALS.md`, `README.md`, the active workflow skills relevant to the proposed refactor, the referenced Quest Design Map skill, and repository tooling. I did not inspect evaluator-private `eval-spec.md`, `.hidden-test/**`, or `.eval/**` material. No public `eval-requirements.md` exists for Spike 006.

No implementation, brief, test, or project-documentation files were changed, and no tests were run because this was a documentation/contract readiness review. The only change is this required `feedback.md` review artifact.
