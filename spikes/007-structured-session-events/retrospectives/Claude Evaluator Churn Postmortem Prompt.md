When this Prepare run is complete, perform a retrospective on **your own work during this run**.

The goal is to understand where token/tool usage went, especially how much effort was spent doing necessary evaluator work versus recovering from your own mistakes or avoidable exploration.

Do **not** modify any files as part of this retrospective.

Use the conversation/tool history from this run as your evidence. Be concrete rather than defensive. Do not treat successful self-correction as evidence that the original mistake was harmless.

Report:

## 1. Overall accounting

Give the best accounting you can of the work performed, divided into categories such as:

- understanding the frozen brief / requirements
- reading and understanding the repository
- designing the evaluation strategy
- implementing evaluator/tests/harness code
- running the evaluator
- debugging or correcting evaluator code
- correcting semantic misunderstandings or invalid test assumptions
- repeated/redundant repository reads or searches
- retries caused by tool/environment problems
- final verification/reporting
- other substantial categories you identify

For each category, estimate its relative share of:
- reasoning/output effort
- tool calls
- token/context consumption, where this can reasonably be inferred

Exact token attribution is not expected if it is unavailable. Prefer a defensible rough estimate over invented precision.

## 2. Churn log

Identify every material instance where you had to correct, redo, or substantially revise your own work.

For each instance, provide:

- what went wrong
- whether it was:
  - **implementation churn** — e.g. wrong path, broken fixture, cleanup bug, syntax/API misuse, hanging process, bad shell invocation
  - **semantic churn** — e.g. misunderstood requirement, wrong oracle, invalid expected behaviour, inappropriate evaluation strategy
  - **environment/tool churn**
  - **necessary discovery** rather than a mistake
- what evidence exposed the problem
- what work had already been done because of the incorrect assumption/code
- what had to be repeated or replaced
- a rough assessment of downstream cost: trivial / small / moderate / large
- whether the problem was realistically preventable before execution

Include mundane mistakes. For example, a path being off by one level or a missing `host.close()` on an exception path counts if it caused additional work.

## 3. Waste versus necessary iteration

Estimate what proportion of this run was:

- necessary evaluation work
- useful discovery that could not reasonably have been known earlier
- avoidable evaluator implementation churn
- avoidable semantic churn
- tooling/environment overhead

Explain the basis for the estimate.

## 4. Repeated infrastructure

Identify evaluator-support machinery that you implemented, debugged, or reasoned about during this run that is likely to recur across future spikes.

Examples might include process lifecycle management, guaranteed cleanup, repository-path resolution, temporary resources, timeout handling, ports, HTTP/WebSocket setup, event capture, process termination, or fixture setup.

For each recurring concern, say whether extracting it into stable shared evaluator infrastructure would likely reduce future churn **without encoding hidden acceptance criteria**.

## 5. Highest-cost mistakes

Rank the 3–5 mistakes or avoidable detours that consumed the most work.

For each, explain the smallest workflow, tooling, or infrastructure change that would probably have prevented it.

Do not answer merely with “be more careful” or “improve the prompt.” Prefer structural fixes.

## 6. Bottom line

Finish with a concise assessment containing:

- whether this Prepare run was materially less churn-heavy than previous evaluator work, if the available context allows that comparison
- the main source of remaining inefficiency
- whether the current problem appears primarily to be:
  - excessive evaluator scope,
  - semantic uncertainty,
  - generated evaluator-code quality,
  - repeated infrastructure work,
  - repository-navigation/tooling friction,
  - or something else
- the single most valuable change to test on the next Prepare run

Be candid. The objective is to improve the Harness methodology, not to justify this run.