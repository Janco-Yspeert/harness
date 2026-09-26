# R3 repaired fixture — public canonical observations

This is a sanitized, public-only evidence extract from the isolated R3 fixture
at commit `82ce3c4dbdb94ac424d6c230db35cd55e1a8c7fd`. It records the facts needed
to evaluate AC02, AC03 and the real-provider portions of AC05/AC13 without
copying the fixture's full authority ledger, evaluator-private workspace,
credentials, tokens, session tokens, host-private logs or workspace paths.

The complete source ledger is immutable in the fixture. Its identity is
`sha256:cde838bc3daa5bdcf72ad65f23a7ef167dcdefce0a6a8b792a6f5fd9e7c4c3cb`.
This extract deliberately omits `kernel.exposure` entries and all private
workspace details.

## Candidate and runtime identity

- Candidate orchestrator instruction:
  `git:b68ad3c5d35ba3415849073ae8206953cb807e97:skills/orchestrator/SKILL.md`
  (`sha256:4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`,
  contract version 3).
- Candidate evaluator instruction: `skills/evaluator/SKILL.md`
  (`sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`,
  contract version 14).
- Candidate As-Built instruction: `skills/as-built/SKILL.md`
  (`sha256:dc3c422691fb36a292b49db411ff9aefd5199f8602b73ef87428fd0a09ea534b`,
  contract version 4).
- Observed external supervisor runtime: `codex-cli 0.155.1`; model unavailable
  from that runtime's version command.
- Governed workers: registered Claude adapter, confirmed model
  `claude-opus-5-5`, reasoning unavailable, provider version `2.1.280`.
- Fixture workflow grant: `4d42bc0f-c703-4e93-a684-68206b3252bb`, spawned
  delegation, continuation enabled, six automatic allocations, and no Outcome
  role.

## Observed governed run

The external supervisor used only the fixture governed host. It did not invoke
a provider directly, create a bridge, access production credentials, or read
evaluator-private material.

| Canonical event | Event id | Public observation |
| --- | --- | --- |
| `kernel.executor-confirmed` | `26bc3dbf-5597-4503-9d66-c56c891fe279` | Brief Readiness ran on the registered Claude adapter. |
| `brief-frozen` | `bb241c71-02d9-4dc3-8cf5-9f99c2499986` | READY. |
| `kernel.executor-confirmed` | `0a1c1e5f-9cbb-46aa-a385-fcd6b980b441` | Design Map ran on the registered Claude adapter. |
| `design-map-frozen` | `858a7667-52e2-4591-9260-d87d85b80ba9` | Recorded. |
| `kernel.executor-confirmed` | `cfaf75fa-8cd5-4f81-a63e-6efbed711104` | Evaluator Prepare ran on the registered Claude adapter. |
| `evaluation-prepared` | `118a051d-e1fb-473a-a584-2158604925e7` | Recorded. |
| `kernel.allocation` / `kernel.executor-confirmed` | `b8e78ef8-8ee3-440f-bb6e-a830ed59f34b` / `ed1970f1-6df5-4daa-8acb-6d5a0f00774d` | Implementation was automatically allocated and ran through the registered Claude adapter. |
| `implementation-handoff` | `09c1d002-b592-4085-b48f-7a0def659313` | Candidate commit `2ff9921c764ab7d959f462052d4857b739e4b1b4`. |
| `kernel.executor-confirmed` / `verification-allocated` | `2e1805d7-81a3-47df-ae96-01046c1e424b` / `59fa6d4a-76bd-4e8a-95be-9df6871e750d` | Candidate evaluator was allocated as a protected governed worker. |
| `verification-finalized` | `1affd0f8-6f66-46ee-98dd-37adaf3cbec0` | PASS, evaluator revision 001, attempt 1. |
| `kernel.action-request` / `kernel.action-result` | `5fe044f9-2df1-4e4c-87ef-9304ae70b7d8` / `de876d12-19f2-46ce-b1e0-bcc27e2f44fb` | Promotion request and host result succeeded. |
| `promotion-recorded` | `14b620ca-b8e8-4b6a-8dec-0fd3756af4ee` | Promotion identity `sha256:30cb200411d6f4570d7ce197afa439060c358d68118b7a17f8cef96be93be0aa`; archive mapping count 3. |
| `as-built-recorded` | `2a77e6e3-c419-487b-be16-db01dba8e1c6` | As-Built completed against the promoted identity. |
| `kernel.continuation-stopped` | `81996200-2551-44e6-bd9b-7f8fdcffe30e` | The supervisor stopped at the genuine `human acceptance required` gate. |

The fixture also observed a read-only request remaining read-only and, after a
separate explicit stop request, no additional governed request, allocation,
grant, root authority, or Outcome execution. The source-ledger identity before
and after recording that stop observation remained the same identity above.

## Promoted public archive

The host-confirmed promotion preserved only these public archive artifacts:

| Destination | Identity |
| --- | --- |
| `promotion-plan.json` | `sha256:bbe3cbc59a59da8f1378c37e91c7ba023496893362416dfd54509c4e83ac4fb5` |
| `attempt-ledger.json` | `sha256:29babfc57760e2df6bfe4c8dd52698bd154fd93cf13a35d6a4b2651695002442` |
| `attempts/001/eval-result.md` | `sha256:012f9218aa385a2787c2660834b6cf9cfd5cd0cce82d9827809c3cb4d433def6` |

The promotion request's integrity identity is
`sha256:def5c415c1c505897f4498de8ebba5a0af7b876cabcb5e726c0e6086a8108492`.
The source public verification result is
`sha256:42a86bb6bd827e5f42952928efc99359c4c62f83ab55847dd4bb461f075b95ef`.
