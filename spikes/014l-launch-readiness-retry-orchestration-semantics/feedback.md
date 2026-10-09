# Brief Readiness — Spike 014l

## Review basis

Reviewed the exact draft `spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md` at `sha256:fc2c399f32cb6d0e27d2e820a76a28205521be4ecaf878cef91fbdb00f0b4183` against `AGENTS.md`, `GOALS.md`, the current kernel/allocation and governed-provider paths, the bundled methodology policy, visible tests, and the public Outcomes for 014f, 014j, and 014k. No evaluator-private material or workflow ledger was inspected.

## Material findings

### 1. Blocker — the canonical semantic-attempt boundary is not defined in terms of host records

The brief requires allocation, operational readiness, a semantic-attempt boundary, exposure, and semantic result to be distinct (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:54`, `spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:98`). It does not state which canonical event commits the semantic attempt, or whether operational preparation and semantic work are phases of one execution or separately identified records.

That decision cannot be left implicit in the current implementation. Allocation presently records protected exposure before recording `kernel.allocation`, then immediately emits any role `onAllocate` transition and counter (`src/kernel/execution.ts:1276`, `src/kernel/execution.ts:1290`, `src/kernel/execution.ts:1301`). For evaluator verification, that allocation transition is the semantic attempt number (`methodologies/harness/policy.json:356`). Moving only the counter, only exposure, or the whole allocation produces materially different history, retry, confidentiality, and recovery semantics.

Consequence: independent implementations can satisfy the prose while disagreeing about whether an allocated-but-unready execution exists, whether it has a Role Grant, whether it creates exposure provenance, and which event makes the attempt irrevocable. AC4, AC5, AC8, AC14, and AC15 therefore do not yet have one fair interpretation.

Smallest clarification: name the canonical event or state transition that commits a semantic attempt and state its ordering relative to Role Grant binding, session/workspace exposure, assignment delivery, role `onAllocate` transitions, and attempt-counter allocation. Also state whether operational executions have their own identity or are a pre-bound phase of the same execution.

### 2. Blocker — the required readiness mechanism is unresolved for the current one-shot provider launch

The brief requires authentication, worker/tool connectivity, effective permissions, harmless computation, and launch-shape compatibility to be demonstrated before governed material is exposed (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:162`, `spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:178`). In the current path, Harness fetches the complete assignment first, embeds the pinned skill, contract, Role Grant, bindings, and work prompt into the provider command, and only then spawns the provider (`src/executors/governed.ts:370`, `src/executors/governed.ts:405`, `src/executors/governed.ts:439`). Provider-reported tool connectivity and model evidence arrive only after that launch.

The brief leaves open two materially different designs: a separate material-free probe whose result is reused by a later one-shot semantic launch, or a two-stage provider execution that receives governed material only after readiness. The former needs freshness and contradiction rules because the checked process is not the semantic process; the latter changes the provider interaction model and is in tension with the stated non-goals around persistent sessions and progressive exposure (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:9`).

Consequence: implementation scope, provider feasibility, exposure guarantees, and the evidence sufficient for AC3, AC6, and AC7 are unresolved.

Smallest clarification: select the permitted readiness topology for one-shot adapters, specify exactly what pre-readiness material/workspace visibility is allowed, and define when a probe result is fresh enough to authorize the semantic launch. If both topologies are permitted, give each the same observable evidence and invalidation requirements.

### 3. Blocker — attached executions are neither included nor excluded from the new lifecycle

The brief speaks about “each governed role execution” and a “relevant adapter/runtime” (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:112`, `spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:164`), while most mandatory semantics and tests are expressed through provider adapters. The repository supports both attached and spawned governed modes. Attached continuation currently allocates directly without provider selection, translation, containment probing, or a spawned readiness phase (`src/kernel/host.ts:777`); spawned continuation takes the adapter path (`src/kernel/host.ts:791`). `GOALS.md` explicitly preserves both existing-session and newly launched role execution.

Consequence: one implementation may apply semantic-attempt, retry, no-progress, and status rules only to spawned work, while another must invent readiness and launch-shape semantics for an already-running attached session. That changes scope and public lifecycle behavior materially.

Smallest clarification: state whether 014l covers attached execution. If it does, define the attached-mode equivalent of canonical launch shape, readiness, and the semantic-attempt boundary; if it does not, make spawned governed execution an explicit proof-of-concept scope limit and state which shared retry/status invariants still apply to attached work.

### 4. Blocker — operational retry policy has a ceiling but no deterministic configured budget or reset key

The brief says Harness “may perform at most three” automatic retries for a “single unchanged failed state,” subject to an existing stricter policy (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:238`). That is a ceiling, not a rule selecting zero, one, two, or three retries, and it does not identify where the operational budget is configured. Existing role policy has one retry limit for semantic dispositions/process states—for example, two for brief readiness (`methodologies/harness/policy.json:12`)—and current automatic continuation consults that role retry policy (`src/kernel/host.ts:1396`).

The phrase “single unchanged failed state” is also not bound to an exact identity. Candidate, evaluator revision, role/profile, failure class, runtime generation, and authority may independently change, and different reset choices produce different authority and liveness behavior.

Consequence: AC10, AC11, AC13, tests 13–16, and the required retries-used/remaining status cannot be implemented or evaluated deterministically.

Smallest clarification: specify the source and exact default value of the operational retry budget, how an existing stricter policy composes with it, the canonical identity under which usage accumulates, and which changes reset rather than continue that budget. State separately how a bounded human authorization extends one identified exhausted operational or semantic budget.

### 5. Blocker — no-progress equivalence is intentionally suggestive where the acceptance contract requires exactness

The brief requires deterministic no-progress detection but says only that the implementation “SHOULD” use a “relevant combination” of listed fields (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:267`). It does not define whether execution identity, retry counters, diagnostic detail, new but equivalent authority, or repeated terminal results count as progress, nor the recurrence threshold. Including fresh execution or authority identities can make every cycle appear new; excluding meaningful feedback or transition changes can stop valid correction.

Consequence: AC16 and deterministic tests 17–18 have no shared oracle, and the feature meant to prevent infinite continuation can itself either loop forever or stop productive work.

Smallest clarification: define the required canonical progress identity (or an exact normalization algorithm), identify fields explicitly ignored, and state after which repeated equivalent state automatic continuation stops. Preserve the separate operational-retry accounting required by the brief.

### 6. Material clarification — make the minimum status fields normative and identify the public projection surface

The status section says the host “MUST” provide a sufficient projection, but the enumerated minimum fields only “should” be exposed (`spikes/014l-launch-readiness-retry-orchestration-semantics/spike.md:290`). AC17 treats those fields as required, while the non-goal excludes richer status/CLI work.

Consequence: an implementation can omit listed retry or boundary fields yet claim compliance with the weaker wording, and evaluators do not know which existing host response is the public contract.

Smallest clarification: change the minimum list to MUST and name the host operation/response on which it is observable. The exact internal type layout remains implementation freedom.

## Editorial findings

None.

## Review limitations

This was a static contract-readiness review. I did not run product tests because no implementation behavior was changed, did not exercise a live provider, and did not inspect evaluator-private material or workflow ledgers. The historical allocation counts in the draft were treated as author-supplied context rather than independently reconstructed.

## Files changed

- `spikes/014l-launch-readiness-retry-orchestration-semantics/feedback.md`
- `spikes/014l-launch-readiness-retry-orchestration-semantics/preliminary/001/spike.md`
- `spikes/014l-launch-readiness-retry-orchestration-semantics/preliminary/001/feedback.md`
- `spikes/014l-launch-readiness-retry-orchestration-semantics/manifest.md`

## Checks run

- Verified the bound `spike.md` SHA-256 identity.
- Inspected relevant public source, policy, visible tests, goals, and selected public Outcomes.
- Confirmed no earlier `preliminary/` snapshot exists for this spike.
- Ran `git diff --check` over the produced artifacts before checkpointing.

**Not ready to freeze**
