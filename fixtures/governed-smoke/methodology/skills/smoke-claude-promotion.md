# Synthetic smoke role: Claude typed result and host promotion

This is a disposable synthetic role in the Harness governed-smoke fixture. It
proves typed-result and host-action transport only. It is not evaluator
eligibility and has no authority over any real project.

1. Call the Harness `assignment` tool once.
2. Read `smoke-plan.json` in the workspace whose id is `smoke-repository` in the
   assignment's `roleGrant.workspaces`. Do not modify any file.
3. Call the Harness `submitResult` tool with exactly
   `{"disposition":"succeeded","methodology":{"smoke":"PASS"}}`.
4. Call the Harness `requestAction` tool once with `kind` `"promotion"`,
   `candidate` equal to `roleGrant.hostActions.promotion.candidate`,
   `evaluatorRevision` equal to the plan's `revision`, `attempt` equal to the
   plan's `attempt`, and `artifacts` equal to the plan's `artifacts`.
5. Stop.
