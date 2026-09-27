# AC03 Codex CLI observation — governed no-adapter blocker

**Record type:** public administrative observation; not a methodology-role result.

## Subject and runtime

- Fixture baseline: `5a6579e9bb57155ba668155ffc433393963ea493`.
- Candidate supervisor instructions: `skills/orchestrator/SKILL.md`, contract
  version 3, `sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`.
- Supervisor: Codex CLI `0.155.1`; requested model `gpt-5.6-terra`; actual
  served model was not exposed by the CLI and is therefore recorded as
  unavailable.
- Supervisor transcript identity: `01a0e1f4-d0e7-74a0-a3ff-676c888ce914`.

## Isolated configuration and preflight

The CLI used a temporary, mode-600 profile with `shell_environment_policy`
`inherit = "core"`, automatic secret-name exclusions, and explicit private
injection of this fixture's two Harness variables only. The profile enabled the
Codex managed network proxy, enabled networking, and allowlisted only the exact
literal `127.0.0.1`. It also had read access to the existing Node dependency
directory needed by this fixture's already-authorized `node_modules` symlink.
The profile, including its fixture credential, was never tracked or published.

Before the observation, a Codex-supervised command confirmed both required
variable names were present without printing their values; an authenticated
read-only `GET r3-ac03-blocker/grants` returned `{"grants":[]}`. A supervised
attempt to reach `https://example.com` was denied by the active proxy because
the domain was not allowlisted. This demonstrates enforcement rather than a
merely documented restriction.

## Exact ordinary request and observed outcome

The initiating user request was exactly:

> Please add fixture-marker.txt with the requested ready content and run the appropriate check.

It contains no Harness instruction or acceptance-criterion wording. The
candidate read the recorded v3 instructions, recognized the configured
Harness project, inspected canonical state, and created bounded grant
`e5524c26-4cd0-486f-87fb-a4c720525a84` with spawned delegation and eight
automatic allocations. It then asked the host to continue.

The host resolved the next role as Brief Readiness but returned the inspectable
response `{ "error": "no eligible spawned executor", "category": "no-adapter" }`.
No execution was created and `fixture-marker.txt` remained absent. The
candidate reported that governed blocker and stopped; it neither invoked a
provider directly nor substituted another adapter.

## Canonical evidence binding

- Canonical fixture ledger: `fixture-spikes/r3-ac03-blocker/workflow.jsonl`
  with pre-evidence-import SHA-256
  `5b97d80f522f8371209c0fdafb62226c32be337ee75af7ac62ba46c83d472f3c`.
- Relevant root/grant and host response are preserved in that ledger. The
  configured executor list was intentionally empty.

This record establishes the observed blocker only. It does not claim any final
acceptance decision.
