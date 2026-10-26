# R3 Codex CLI observation import manifest

**Transfer type:** explicitly human-authorized, public-only administrative
evidence handoff. It is not a governed role result and does not alter the
candidate methodology, evaluator authority, or earlier R3 evidence.

## Source identities

| Observation | Fixture baseline | Fixture evidence commit | Canonical-ledger snapshot commit |
| --- | --- | --- | --- |
| AC02 default selection | `85b1552557dc17b4be137382c12af005360ca709` | `3f0b14f` | `73639e0` |
| AC03 no-adapter blocker | `5a6579e9bb57155ba668155ffc433393963ea493` | `f4acf09` | `d7596e6` |

Both fixtures executed the exact candidate orchestrator contract v3:
`skills/orchestrator/SKILL.md`, SHA-256
`4ca4d899a73fd6963a435b46d9945697ee4709c6397051f5cf009206c6d7e60d`.

## Imported public files and SHA-256

| Destination | SHA-256 | Purpose |
| --- | --- | --- |
| `ac02/observation.md` | `e8093004f158524326557ad6c523da7fe0b36af787cdd9d267ac6228a09de1ab` | Sanitized supervisor observation and ordinary initiating request |
| `ac02/workflow.jsonl` | `3e24e94704888df92f1e5d4f1af6127f05d2c5d54973b8c8abcacb110eef4a16` | Byte-for-byte snapshot of canonical host events |
| `ac02/harness.project.json` | `f27f6fdab6ee0117f80f22bad546b2bc5d8bb06c65eb907b85dcd4a55c9fc4fe` | Retained public project configuration |
| `ac02/fixture-trusted.jsonl` | `3a02de5170d5d7c0dd14d86e3db4419c30202502b484c1fac2e1a20aa4cce287` | Fixture-local trust-root declaration |
| `ac02/executors.json` | `0b38eadcaf24d23726bf479d63e4b3d32371928d0c6cd982bb0522659a1486ba` | Non-secret registered positive executor profile |
| `ac03/observation.md` | `ec27bfd96d509c4d5374eaf1f0975a1e28c69367cfc5b4d21a13ddfa94d8376e` | Sanitized supervisor observation and ordinary initiating request |
| `ac03/workflow.jsonl` | `5b97d80f522f8371209c0fdafb62226c32be337ee75af7ac62ba46c83d472f3c` | Byte-for-byte snapshot of canonical host events |
| `ac03/harness.project.json` | `69fbad7374b0c0688681444acd46becb8887f8547e472e3768523a905aeffb18` | Retained public project configuration |
| `ac03/fixture-trusted.jsonl` | `0d2995a97835f4d9d3166992f35f736a2181b823592ebdd4bcf3c4831ad6c9dc` | Fixture-local trust-root declaration |
| `ac03/executors.json` | `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` | Non-secret intentionally empty executor configuration |

The source ledgers are ignored runtime files; their snapshots were copied
byte-for-byte into the committed fixture evidence directories before this
import. The original ledgers, all previous fixture commits, and the earlier R3
evidence remain unchanged.

## Scope and limitations

AC02 records actual default selection and two sequential host-governed Claude
executions. The fixture host then exited because its retained project
configuration lacks an `evaluation` workspace; this import does not represent
that interruption as successful evaluator preparation or a completed fixture.

AC03 records an actual host `no-adapter` refusal after candidate-selected
governed continuation. No provider or direct-worker workaround was used.

The records are evidence for later independent adjudication, not an evaluator
PASS or methodology trust promotion.
