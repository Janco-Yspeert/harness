# 014c Synthetic Fixture Trust-Root Authority

**Authority:** explicit human authorization for Spike 014c, 2026-09-23.

I approve the initial trust root for the isolated
`fixtures/governed-smoke` project at revision
`098b89934a3fbdf3ee18b02b9ac84e39365a4270`.

- Project: `governed-smoke-fixture`
- Reconstructed manifest:
  `sha256:726fbff1504b533104c1230a55bfea71885c5e6c8534f0dc79c5cb1716006161`
- Policy:
  `sha256:b9043ef59a23ab29b8ecd4dd9ef1f9b3939ee4d38bc1dd6143bb96635062b4a1`
- Evaluation authority: `human-bootstrap`

This root authorizes only synthetic executions of this fixture. It does not
govern 014c, alter Harness's append-only trusted history, expose 014a private
evaluator material, or authorize any production or external-project workflow.
The root is subject to the same trust-equivalence check: edits to the pinned
fixture policy, contracts, skills, or validator set cannot silently govern a
new fixture grant.
