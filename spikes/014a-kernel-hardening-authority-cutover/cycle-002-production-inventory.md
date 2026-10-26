# Cycle 002 focused production-path inventory

The inventory is limited to AC16, AC17, and AC19 in the frozen brief.

| Criterion | Observed production path | Missing behavior |
| --- | --- | --- |
| AC16 | `RoleGrant.hostActions` and `HostActionRequest` support only `publication`; `ExecutionKernel.publish()` is the only host action route. | No configured evaluator-promotion request, host-owned copy/identity validation, action result, or `promotion-recorded` transition exists. |
| AC17 | Publication failures are distinct from semantic results, but there is no promotion action to deny or fail. | No real promotion-denial/failure behavior can demonstrate that a canonical PASS remains intact without fabricated promotion. |
| AC19 | The host can answer an outstanding executor-created `HumanRequest` through `executions/:id/respond`. | There is no configured, host-validated human acceptance/rejection authority route and no producer for `human-accepted` or `human-rejected`. |

This is an inventory, not a redesign. Cycle 002 implements only the narrow
host-owned promotion route and the missing configured human-decision route.
