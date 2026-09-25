# 014d §7 — Legacy bridge classification

Normal governed production path:

```text
orchestrator -> governed host (/governed) -> registered provider adapter
             -> pinned worker assignment -> Harness MCP worker protocol
             -> host-owned semantic results, actions and transitions
```

Classes: **(a)** retired historical/bootstrap-only with no production caller;
**(b)** test fixture; **(c)** a required, repository-owned, versioned
first-class component with a single responsibility.

| Component | Class | Callers | Justification |
| --- | --- | --- | --- |
| `tools/governed-claude-bootstrap.ts` | (a) | Only `test/governed-claude-bootstrap.test.ts` | A human-authorized 014c bootstrap executor that hard-codes the 014c workflow. No production module imports it. It is kept unmodified because it is part of 014c's historical record, which 014d must not rewrite. Not extended and not used by 014d. |
| `tools/legacy-workflow.ts` via `tools/workflow.ts` (non-`governed` subcommands) | (a) for execution; (c) for historical inspection | `npm run workflow` | `--execute` is refused unless `HARNESS_LEGACY_WORKFLOW=1`. Even then, the host answers legacy mutation with `410`. The remaining subcommands only record and validate historical artifact transitions for pre-kernel spikes. `workflow governed …` is a host client and adds no state machine of its own. |
| `/workflow-runs` and `/workflow-fixtures` mutation routes in `src/index.ts` | (a); (b) when enabled | The legacy integration tests only, through the programmatic `legacyWorkflowExecution` option | The production entrypoint never sets the option, and mutation returns `410`. `GET` inspection of historical runs remains. |
| `src/workflow-backend.ts` | (c) shared helpers; (b) local backend | Production adapters use `assertBoundedExecutorCommand`, `codexExecCommand`, `stopChild` and `workflowScratchEnvironment`. `createLocalWorkflowBackend` serves only the legacy route above. | The helpers bound provider commands and scratch environments for the registered adapters. The local backend and its `RESULT_PREFIX` result-line parser (`parseWorkflowBackendRoleResult`) are reachable only through the retired, test-only route. Governed results come only from MCP `submitResult`. |
| `src/claude-workflow.ts` | (c) | `src/executors/adapters.ts` (`buildGovernedClaudeCommand`, permission and capability translation); the legacy backend and the 014c bootstrap use `buildClaudeWorkflowCommand` | This is the one Claude command and permission translation. The governed adapter uses only the governed builder. |
| Arbitrary `command` executor profiles | none exist | — | Executor profiles are fixed to registered adapters. No command, program path or unknown key can be configured (`src/executors/adapters.ts`). |
| Generated orchestration wrappers or `/tmp` bridges | none exist | — | None was created in 014d. |

Deletion was not chosen. The legacy local backend is still exercised by the
supported legacy integration tests, and its shared helpers serve the
production adapters. Its retirement from the normal path is enforced instead.
`test/legacy-bridges.test.ts` checks that no module on the governed path
(`src/index.ts`, `src/executors/**`, `src/kernel/**`) references the bootstrap
or legacy tools. It also checks that the executor and kernel modules use no
prose result parser, legacy backend or legacy command builder, and that the
production entrypoint never enables legacy execution. The host tests
separately assert `410` for legacy mutation.
