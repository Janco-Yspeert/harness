# 014d administrative import 002 — complete existing R3 public evidence

**Authority:** explicit human authorization to import existing authentic,
public-only fixture evidence and prepare, but not execute, the remaining R3
observations. This is administrative evidence transfer, not output of a
governed role. It does not alter the terminal `BLOCKED` execution `444a6def…`,
verification attempt 005, frozen evaluator revision 002, candidate skills,
host configuration, or the retained fixture.

## Source provenance

- Fixture Git commit: `82ce3c4dbdb94ac424d6c230db35cd55e1a8c7fd`.
- Earlier primary sanitized-import commit: `01875f3`.
- The fixture's retained non-secret host project configuration was not itself a
  Git object; its source path was `/tmp/harness-014d-r3-repair2-host/project.json`
  and its verified source identity is
  `sha256:9a85385329fdd021cb13f36d521f4157883f2fd05b2c4944c65a92df30e5fe4e`.
- The source fixture working tree contains untracked `node_modules` only; no
  fixture evidence was changed for this import.

## Byte-preserving imported artifacts

| Source | Source identity | Primary destination | Destination identity |
| --- | --- | --- | --- |
| `fixture-trusted.jsonl` | `sha256:80500291e85907c81ee8cdbf1a99dcd9ec1173762dbfce42dbc0d7c17cb85970` | `source/fixture-trusted.jsonl` | same |
| retained fixture `project.json` | `sha256:9a85385329fdd021cb13f36d521f4157883f2fd05b2c4944c65a92df30e5fe4e` | `source/project.json` | same |
| `fixture-spikes/r3-repair/observed-supervisor-r3-repair.md` | `sha256:f981bb2a3b075dc7ffe2048d933c5b177ae785026b1d1956923f2a5f4da4bac9` | `source/observed-supervisor-r3-repair.md` | same |
| `fixture-spikes/r3-repair/verification-result.json` | `sha256:42a86bb6bd827e5f42952928efc99359c4c62f83ab55847dd4bb461f075b95ef` | `source/verification-result.json` | same |
| `fixture-spikes/r3-repair/evaluation/promotion-plan.json` | `sha256:bbe3cbc59a59da8f1378c37e91c7ba023496893362416dfd54509c4e83ac4fb5` | `source/evaluation/promotion-plan.json` | same |
| `fixture-spikes/r3-repair/evaluation/promotion.json` | `sha256:30cb200411d6f4570d7ce197afa439060c358d68118b7a17f8cef96be93be0aa` | `source/evaluation/promotion.json` | same |

`source/ledger-provenance.md` is a public index into the retained full ledger
`sha256:cde838bc3daa5bdcf72ad65f23a7ef167dcdefce0a6a8b792a6f5fd9e7c4c3cb`.
It excludes private-workspace exposure entries and therefore is not represented
as a byte-for-byte ledger copy.

## Verified bindings

1. `source/project.json` names `fixture-trusted.jsonl` as `trustedHistory`.
   That file declares a sequence-1, human-bootstrap authority for the isolated
   R3 repair fixture, rooted at `b68ad3c…`; the indexed fixture ledger records
   the resulting governed operations under the fixture grant.
2. SHA-256 of the imported promotion-plan bytes is
   `sha256:bbe3cbc59a59da8f1378c37e91c7ba023496893362416dfd54509c4e83ac4fb5`.
   Imported `verification-result.json` has
   `promotionPlan.identity` equal to that value and `promotionPlan.decision`
   equal to `ELIGIBLE`.
3. Imported `promotion.json` requests that same plan identity; its action result
   records the same plan artifact identity and integrity identity
   `sha256:def5c415c1c505897f4498de8ebba5a0af7b876cabcb5e726c0e6086a8108492`.
   The indexed host `promotion-recorded` event binds it to promotion identity
   `sha256:30cb200411d6f4570d7ce197afa439060c358d68118b7a17f8cef96be93be0aa`.

No credentials, root tokens, host-private logs, evaluator-private source,
hidden tests, or private-workspace contents are included.
