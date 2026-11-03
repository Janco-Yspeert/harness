# Manifest — Spike 015a Recovery Sequence 7 Certification

## Brief Readiness

- Skill: brief-readiness, contract version 5
- Inputs: `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`)
- Result: `succeeded`; verdict `READY` (Ready after minor clarification; six non-blocking material clarifications retained)
- Outputs: `feedback.md`; `manifest.md`; no preliminary snapshot
- Checks: bound input identity matched; targeted public-contract inspection (`AGENTS.md`, `skills/outcome/SKILL.md`, `methodologies/harness/policy.json`, `src/methodology-evolution.ts`, and selective prior public feedback); no executable checks run
- Measurement cutoff: immediately before this manifest update.

## Design Map

- Skill: design-map, contract version 4
- Inputs: frozen `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`), committed at `df46058ebfb19d4e820c29357f215f40ead391b3`
- Result: `succeeded`
- Output: `design-map.md` (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`)
- Checks: verified the bound brief identity and committed provenance; inspected the public brief-readiness findings and relevant public Outcome, policy, host, candidate-subject, and contract seams; no executable checks required for this documentation contract
- Measurement cutoff: immediately before this manifest update.

## Evaluator Prepare

- Skill: evaluator, contract version 14, mode `prepare`
- Inputs: frozen `spike.md` (`sha256:eac9f72546fa65ab722dbcfd6b7d0d47c0787c1e6cd6cd66b5c570913b87baaa`), `design-map.md` (`sha256:4d92074b4d9e8511d6dc3623f1f09dc23726bb118c0d4e3bd51102e815c819ea`)
- Result: `succeeded`; evaluator revision `001` frozen (`sha256:2d8883ce53a17b9e04d6cf4eb2a6f530ca8f1219fb824f2fd15314978c224105`), private inventory `sha256:d8909283670e222339e2a9d28c4677766fae36749e6ca31c310426815e109ab4`
- Outputs: `eval-requirements.md` (`sha256:0d370ed19e102d40d89e0f010016383bfa7f50b801bae7bfbe4fbe2a90623f8f`); `coverage-map.json` (11 criterion records, BC01–BC11, readiness attestation PASS); `manifest.md`
- Checks: pre-freeze structural integrity validation passed; controlled positive/negative exercise of the one executable case passed; candidate implementation not executed
- Measurement cutoff: immediately before this manifest update.
