# Spike 007 Evaluator Prepare — Churn Analysis

## Summary

The Spike 007 `prepare` retrospective indicates that evaluator inefficiency is becoming more localized and therefore more actionable.

The most important positive result is that there appears to have been **no material semantic churn** during the run. The evaluator's requirement interpretation, case set, invariants, negative requirements, and expected behaviours remained stable from initial design through freeze. This suggests that the evaluator understood the Spike 007 brief sufficiently well and did not repeatedly redesign its oracle in response to implementation feedback.

The dominant remaining problem was instead **implementation churn in evaluator-support infrastructure**: WebSocket connection handling, cleanup behaviour, path resolution, and a throwaway reference implementation used for positive-control validation.

This represents meaningful methodological progress. The principal problem no longer appears to be unstable evaluator reasoning; it is the reliability and cost of repeatedly generating ordinary test infrastructure.

However, Claude's own retrospective understates the extent to which this is also a **generated-code quality problem**.

---

## 1. Semantic Stability Was Strong

Claude reports that the evaluator's E1–E12 case set and associated requirements remained stable throughout the run.

Specifically, there were reportedly no instances where the evaluator had to:

- reinterpret a requirement;
- replace an invalid oracle;
- change expected behaviour after observing the implementation;
- abandon an evaluation strategy;
- materially rescope the evaluation.

This is significant.

Semantic churn is particularly dangerous in an independent evaluator because changing an oracle after observing implementation behaviour can undermine evaluator independence. No evidence of that failure mode was identified in this run.

The Spike 007 evaluator therefore appears to have performed well at the **evaluation-design level**.

---

## 2. Generated Evaluator Code Remained Error-Prone

Claude characterizes the remaining inefficiency primarily as repeated infrastructure work rather than poor evaluator-code quality.

That distinction is too generous.

Several reported failures were ordinary implementation defects in evaluator-generated code:

- a WebSocket helper could wait indefinitely after a rejected upgrade;
- host cleanup was skipped when an exception occurred before the relevant `try/finally`;
- the reference server used an invalid default backend;
- the reference server failed to terminate a session socket during teardown;
- dead or malformed code remained in an early test draft.

These are not semantic evaluator failures, but they are still **code-quality failures**.

A more accurate diagnosis is:

> The evaluation design was stable, but first-pass implementation reliability remained weak around lifecycle, cleanup, networking, and disposable evaluator infrastructure.

This distinction matters because the appropriate response is not necessarily to improve evaluator reasoning. Instead, the methodology can reduce exposure to these failure modes by removing unnecessary implementation decisions from each run.

---

## 3. Churn Percentages Should Be Treated as Directional

Claude estimates approximately:

- 55% necessary evaluation work;
- 10% useful discovery;
- 20% avoidable evaluator implementation churn;
- 12% environment/tooling churn;
- 0% semantic churn;
- 3% miscellaneous tooling overhead.

These numbers are useful as a qualitative indication, but they should not be treated as precise token accounting.

The retrospective largely derived them from clusters of tool calls and estimated output volume. Tool calls vary substantially in cost: a short file read, a large generated file, and a long reasoning step are not equivalent units.

There is also some conceptual overlap in the classification. For example, discovering C1 and C2 through negative-control execution is described partly as useful discovery, while C1 and C2 themselves are also classified as avoidable evaluator implementation churn.

The better interpretation is:

- the validation gate successfully detected the defects;
- the existence of the defects was avoidable churn;
- detecting them was necessary once they existed.

Accordingly, the safe conclusion is:

> A substantial minority of the run was self-inflicted evaluator churn, but current instrumentation is not sufficient to assign a trustworthy percentage of total token usage to it.

Future evaluator telemetry may make this distinction measurable rather than retrospective.

---

## 4. The Throwaway Reference Server Is a Larger Concern

The most notable concentration of churn occurred around the positive-control reference implementation.

Claude estimates approximately 20% of tool-call activity was spent constructing and debugging a throwaway reference server. Several of the highest-cost problems occurred within this mechanism:

- module and path-resolution failures;
- incorrect default backend behaviour;
- incomplete session/socket lifecycle modelling.

This deserves scrutiny beyond simply improving path handling.

The evaluator was effectively required to construct a second, partial implementation of the system in order to demonstrate that its hidden tests could pass.

That creates an inherently expensive feedback loop:

1. design the evaluator;
2. implement hidden tests;
3. implement enough of a reference system to satisfy those tests;
4. debug the reference system;
5. use that reference system to validate the evaluator.

The positive-control requirement itself is reasonable. A hidden test that has only ever failed may be unsatisfiable or incorrectly specified.

However, the current mechanism has an undesirable property:

> Validating the evaluator requires the evaluator to implement substantial portions of the behaviour it is attempting to evaluate.

This does not invalidate the Spike 007 evaluation, particularly given the apparent semantic stability of its oracles, but it introduces significant duplication and cost.

It should therefore be treated as a separate methodological issue rather than merely another reusable helper problem.

---

## 5. Infrastructure That Should Probably Be Promoted

Spike 007 provides strong evidence for extracting a small set of **criteria-neutral evaluator infrastructure**.

Likely candidates include:

```text
connectWebSocket(...)
connectWebSocketExpectFailure(...)
withHarnessHost(...)
withTimeout(...)
waitFor(...)
repoRoot(...)
```

These operations are:

- mechanically reusable across spikes;
- independent of hidden acceptance criteria;
- vulnerable to repetitive implementation mistakes;
- straightforward to test publicly;
- poor uses of fresh evaluator-generation effort.

The most valuable helpers are those that make correct behaviour structural rather than advisory.

For example:

```ts
await withHarnessHost(options, async (host) => {
  // evaluator logic
});
```

is preferable to repeatedly relying on the evaluator to correctly construct nested lifecycle and cleanup logic.

The methodology should generally prefer:

> make invalid evaluator plumbing difficult or impossible to express

over:

> instruct the model to remember the correct plumbing pattern.

---

## 6. Canonical Test Doubles May Also Be Worth Reusing

The `MemoryBackend`-style test double appears to reproduce behaviour already represented in Harness's public test infrastructure.

If it contains no spike-specific acceptance logic, repeatedly regenerating it provides little value.

Where possible, the evaluator should reuse an existing canonical test implementation rather than maintain a second evaluator-specific copy.

This should remain subject to one important constraint:

> Shared evaluator infrastructure must not encode hidden acceptance criteria or allow the production implementation to depend on evaluator-only behaviour.

Generic implementation of a public interface is acceptable. Hidden feature-specific semantics are not.

---

## 7. Repository and Module Resolution Should Be Mechanical

The path-resolution churn is a straightforward candidate for elimination.

The run included:

- an incorrect directory guess;
- incorrect relative import depth;
- repeated discovery that scripts staged outside a package tree could not resolve required modules.

One particularly notable aspect is that the module-resolution failure was encountered and then repeated later in the same run.

This is precisely the kind of decision that should be removed from agent discretion.

Evaluator tooling should provide deterministic repository-root and package-root resolution rather than relying on manually counted relative paths or ad hoc scratch locations.

---

## 8. Do Not Yet Institutionalize the Reference-Server Pattern

Claude proposes a `host-under-test` indirection seam that would allow frozen tests to run against either the real implementation or a positive-control implementation without copying and rewriting test files.

That would clearly improve the mechanics of positive-control execution and would likely eliminate much of the path and transformation churn.

However, it would **not** solve all of the reported problems.

For example:

- C4 occurred because the reference implementation modelled the default backend incorrectly.
- C5 occurred because the reference implementation modelled session teardown incorrectly.

A cleaner import seam would make those failures easier to exercise, but it would not prevent them.

The larger question therefore remains:

> Should evaluator preparation require a substantial parallel reference implementation at all?

Before promoting the current positive-control approach into stable methodology, alternative strategies should be considered, including:

- narrower behaviour-specific stubs;
- reusable generic host infrastructure;
- mutation or negative controls;
- targeted positive controls rather than a complete reference host;
- disposable reference patches against real Harness architecture rather than an independent shadow lifecycle implementation.

Spike 007 alone is not sufficient evidence to select among these approaches.

---

## 9. Current Diagnosis

The Spike 007 results suggest three distinct evaluator-quality layers.

### Semantic evaluator quality

**Strong.**

The requirements, oracle, expected behaviours, and case set apparently remained stable throughout the run.

### Hidden-test implementation quality

**Reasonably strong.**

Claude reports that the frozen tests themselves behaved correctly once shared support mechanics were repaired.

### Evaluator infrastructure implementation quality

**Weak and unnecessarily expensive.**

Most avoidable churn occurred in ordinary lifecycle, transport, cleanup, path, and reference-server plumbing.

This is a substantially better failure mode than semantic instability. It is also considerably easier to attack structurally.

---

## 10. Recommended Next Experiment

Do not redesign `prepare` yet.

Instead, make one constrained intervention before the next comparable evaluator run:

1. Extract clearly criteria-neutral shared evaluator infrastructure demonstrated by Spike 007:
   - WebSocket connection/error/timeout handling;
   - guaranteed Harness host cleanup;
   - deterministic repository-root resolution;
   - reusable generic backend test support where appropriate.

2. Leave the core evaluator methodology otherwise substantially unchanged.

3. Run the next `prepare` under the same broad process.

4. Compare:
   - total token usage;
   - tool-call volume;
   - number of self-corrections;
   - implementation churn;
   - semantic churn;
   - time spent on positive-control infrastructure.

This creates a useful experiment.

If evaluator churn drops substantially, the hypothesis that repeated infrastructure generation is the primary remaining problem gains strong support.

If churn merely moves into new areas, the problem is broader first-pass generated-code reliability and will require a different intervention.

The positive-control/reference-server mechanism should be investigated separately because it appears to represent the next largest concentration of avoidable complexity after generic evaluator plumbing.

---

## Conclusion

Spike 007 `prepare` appears to be **methodologically successful but operationally inefficient**.

The important result is not simply that the evaluator consumed a large number of tokens. It is that the failure pattern has changed:

> The evaluator appears to understand what it is testing, but still spends excessive effort implementing and debugging the machinery used to test it.

That is progress.

The immediate priority should therefore be to remove recurring, criteria-neutral implementation work from evaluator generation rather than making the evaluator prompt more elaborate or redesigning the evaluation process.

The remaining major open question is positive-control validation. Building a second partial implementation of Harness in order to validate hidden tests produced a disproportionate amount of churn and should not become permanent methodology without further examination.