# Historical Skill Contracts

This directory preserves exact prior active skill contracts outside agent skill-
discovery paths. The copies are historical evidence, not executable skills.

| Historical contract     | Version | Replaced by                          |
| ----------------------- | ------: | ------------------------------------ |
| `evaluator/v1.md`       |       1 | `skills/evaluator/SKILL.md` v2       |
| `evaluator/v3.md`       |       3 | `skills/evaluator/SKILL.md` v4       |
| `evaluator/v4.md`       |       4 | `skills/evaluator/SKILL.md` v5       |
| `evaluator/v5.md`       |       5 | `skills/evaluator/SKILL.md` v6       |
| `evaluator/v6.md`       |       6 | `skills/evaluator/SKILL.md` v7       |
| `implementation/v1.md`  |       1 | `skills/implementation/SKILL.md` v2  |
| `orchestrator/v1.md`    |       1 | `skills/orchestrator/SKILL.md` v2    |
| `outcome/v1.md`         |       1 | `skills/outcome/SKILL.md` v2         |
| `spike-review/v1.md`    |       1 | `skills/brief-readiness/SKILL.md` v2 |
| `brief-readiness/v4.md` |       4 | `skills/brief-readiness/SKILL.md` v5 |
| `design-map/v3.md`      |       3 | `skills/design-map/SKILL.md` v4      |
| `evaluator/v13.md`      |      13 | `skills/evaluator/SKILL.md` v14      |
| `implementation/v4.md`  |       4 | `skills/implementation/SKILL.md` v5  |
| `as-built/v3.md`        |       3 | `skills/as-built/SKILL.md` v4        |
| `outcome/v4.md`         |       4 | `skills/outcome/SKILL.md` v5         |
| `orchestrator/v2.md`    |       2 | `skills/orchestrator/SKILL.md` v3    |

The 014d revisions (N+1 candidate) add each role's Harness worker protocol
section: the typed `submitResult` vocabulary, any required `requestAction`, and,
for the evaluator, the governed private workspace, host-allocated attempt and
the promotion plan sequence. The orchestrator revision makes Harness the default
for actionable development requests and removes routine permission prompts
between already-authorized machine phases.

Files identified as historical versions must never be silently edited. A later
contract change preserves the then-active content as a new version instead.
