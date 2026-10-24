# Evaluation result — attempt 008

- Workflow: 014f-inactive-workflow-grant-retirement
- Execution: 7b26f056-fd50-46c1-90dc-a072295373a6
- Candidate: af75b14d1847af02404a591a8829751dc8df2a2e
- Evaluator revision: 002
- Result: BLOCKED
- Classification: INFRASTRUCTURE_FAILURE
- Candidate evaluation begun: no
- Mandatory executable cases run: 0/11; R1 and P1 not run; 0/8 criteria adjudicated.
- Cause: every shell invocation failed in the sandbox launcher
  ("bwrap: Can't create file at <public repo>/.claude/hooks: Read-only file system"),
  so no checkout, test run or identity check was possible beyond the
  pre-failure read of private bundle hashes (spec, case manifest, hidden tests
  matched freeze.json; public eval-requirements hash matched freeze.json).
- Diagnostics: none run. No coverage results are fabricated.
- Evaluator integrity: frozen private bundle identities matched; no evaluator defect indicated.
