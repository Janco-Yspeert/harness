# Selected public fixture-ledger provenance

This is a source-indexed public selection from the immutable fixture ledger
`fixture-spikes/r3-repair/workflow.jsonl` at fixture commit
`82ce3c4dbdb94ac424d6c230db35cd55e1a8c7fd`. The original ledger identity is
`sha256:cde838bc3daa5bdcf72ad65f23a7ef167dcdefce0a6a8b792a6f5fd9e7c4c3cb`.

It deliberately excludes `kernel.exposure` and every entry containing a
private-workspace path. It is an index to authentic source events, not a
replacement ledger.

| Role / fact | Source events | Bound public identity or outcome |
| --- | --- | --- |
| Brief Readiness | allocation `f84f8b71-0883-47bd-9e6d-6aacdd990e96`; provider confirmation `26bc3dbf-5597-4503-9d66-c56c891fe279`; freeze `bb241c71-02d9-4dc3-8cf5-9f99c2499986` | skill `sha256:439432d11abaf318ccddb7219c69baaf8052446dccad0887f50ce3b0e18fdc2c`; `claude-opus-5-5`, provider `2.1.280`; READY |
| Design Map | allocation `e71bb70a-7b58-411a-b9c5-70899e445cef`; provider confirmation `0a1c1e5f-9cbb-46aa-a385-fcd6b980b441`; freeze `858a7667-52e2-4591-9260-d87d85b80ba9` | skill `sha256:238af12bbee012a784f234f2aaab9d4e783a58ec1b7c0257937bc54a16010136`; `claude-opus-5-5`, provider `2.1.280` |
| Implementation | allocation `b8e78ef8-8ee3-440f-bb6e-a830ed59f34b`; provider confirmation `ed1970f1-6df5-4daa-8acb-6d5a0f00774d`; handoff `09c1d002-b592-4085-b48f-7a0def659313` | skill `sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`; candidate `2ff9921c764ab7d959f462052d4857b739e4b1b4` |
| Candidate evaluator | provider confirmation `2e1805d7-81a3-47df-ae96-01046c1e424b`; verification allocation `59fa6d4a-76bd-4e8a-95be-9df6871e750d`; finalization `1affd0f8-6f66-46ee-98dd-37adaf3cbec0` | skill `sha256:7a0e65316e5f55393f66049709d86f7d848979e5a5aefb9c9e72e4f3187e8aaa`; PASS, revision 001, attempt 1 |
| Promotion | action request `5fe044f9-2df1-4e4c-87ef-9304ae70b7d8`; action result `de876d12-19f2-46ce-b1e0-bcc27e2f44fb`; promotion record `14b620ca-b8e8-4b6a-8dec-0fd3756af4ee` | succeeded; promotion `sha256:30cb200411d6f4570d7ce197afa439060c358d68118b7a17f8cef96be93be0aa`; plan `sha256:bbe3cbc59a59da8f1378c37e91c7ba023496893362416dfd54509c4e83ac4fb5` |
| As-Built and gate | As-Built `2a77e6e3-c419-487b-be16-db01dba8e1c6`; stop `81996200-2551-44e6-bd9b-7f8fdcffe30e` | human acceptance required |
