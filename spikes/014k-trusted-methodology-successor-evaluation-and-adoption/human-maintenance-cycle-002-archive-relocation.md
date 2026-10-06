# Human maintenance: cycle-002 archive relocation

- Status: `COMPLETED`
- Performed at: `2026-10-06T08:58:12Z`
- Authority: explicit human authorization in the active Spike 014k supervisor session
- Cycle: `002`
- Source: `spikes/014k-trusted-methodology-successor-evaluation-and-adoption/evaluation/`
- Destination: `spikes/014k-trusted-methodology-successor-evaluation-and-adoption/evaluation-history/cycle-002/`

## Reason

A valid historical cycle-002 archive occupied the singleton canonical
`evaluation/` destination after its `promotion-recorded` event was mis-scoped.
The archive action itself had succeeded and identity-validated its evidence, but
trusted-N policy could not treat the event as current-cycle evidence.

The human explicitly authorized one bounded maintenance relocation so the
existing cycle-002 evidence would remain preserved while the ordinary cycle-003
promotion retried against an empty canonical destination.

## Verified inventory

The source was required to contain exactly these files. Every identity was
verified before relocation and again at the destination afterward.

| Relative path | Before identity | After identity |
| --- | --- | --- |
| `attempt-ledger.json` | `sha256:f61329b6d31ebba21288b41ee100b84217f7a97a89b6e8d2895168ee3f592865` | `sha256:f61329b6d31ebba21288b41ee100b84217f7a97a89b6e8d2895168ee3f592865` |
| `attempts/001/eval-result.md` | `sha256:b0b4cfc9f532d4870c7159ebfee4a7f59c84fae6ffdc0ad7f46be45c9cbeea67` | `sha256:b0b4cfc9f532d4870c7159ebfee4a7f59c84fae6ffdc0ad7f46be45c9cbeea67` |
| `promotion-plan.json` | `sha256:326a5fb02f6d09bbf8631976988ab2782fd06108b1418e480c7387a7384280ea` | `sha256:326a5fb02f6d09bbf8631976988ab2782fd06108b1418e480c7387a7384280ea` |
| `promotion.json` | `sha256:c9f3d21e762a98b735836a2bd2df8e5afa70c001d293e9715be578bbd819d313` | `sha256:c9f3d21e762a98b735836a2bd2df8e5afa70c001d293e9715be578bbd819d313` |

The destination did not exist before the operation. The source no longer
exists after the filesystem rename. No evidence bytes were altered,
reconstructed, normalized, overwritten, or deleted.

## Boundary

This was an explicit human maintenance action outside trusted-N governed archive
operations. It is not a Harness capability, reusable recovery mechanism,
governed archive transition, semantic evaluation result, or methodology
authority. It does not alter either historical PASS and does not authorize any
future archive relocation.
