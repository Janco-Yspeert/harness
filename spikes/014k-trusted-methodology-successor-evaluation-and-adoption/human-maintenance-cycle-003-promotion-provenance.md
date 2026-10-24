# Human maintenance: cycle-003 promotion provenance correction

- Status: `AUTHORIZED`
- Recorded at: `2026-10-06T09:12:21Z`
- Origin: explicit human maintenance authority in the active Spike 014k supervisor session
- Cycle: `003`
- Correction kind: `PROVENANCE_ONLY`

## Bound facts

- Candidate: `2e1cf0e2ee3facc2742dade252ac970b03f38a26`
- Evaluator revision: `003`
- Verification execution: `5c02b191-4a20-4a47-b6f2-847dfd0ce135`
- Verification result: `PASS`
- Semantic result: `ed9c199e-2271-4e27-b085-cab42b8b0b0b`
- Verification identity: `sha256:8dbb7f45a302efa63a3d03a3d632f994913fd0036a8cf337f878ef2bdf538b4a`
- Successful promotion action: `bc85f12a-2b49-4582-999b-b2a386b08d2c`
- Promotion identity: `sha256:ad348dd072464c67bc406a38c0f634525fa7309efb186d67b84833da66323a1e`
- Archive integrity identity: `sha256:a3c9e8e5df8bcf15ed45c45d1cc8a320248e6d150af1ef7ee1ed376490937dd6`
- Original `promotion-recorded` event: `052b41a6-fe5f-44b7-9cb2-48126263d8d6`

## Archived inventory

| Relative path | Identity |
| --- | --- |
| `attempt-ledger.json` | `sha256:0e5e5414488aa3c66ea38fa3685da7b6f456efee8c628902d5a99df85905c37a` |
| `attempts/001/eval-result.md` | `sha256:d34f79b0bdf5b904f5e943fa54ea5e64f65d17f75b6d90e791d92f49ee130204` |
| `promotion-plan.json` | `sha256:1a926934a5a263b98fd46b7595c6ca5c16c688c5d4407c97f810532eff84f8a4` |
| `promotion.json` | `sha256:ad348dd072464c67bc406a38c0f634525fa7309efb186d67b84833da66323a1e` |

## Defect and authority

The promotion action succeeded and the archive bytes match its recorded
identities. The original `promotion-recorded` event binds the same candidate,
revision, attempt, execution, role grant, semantic result, action, artifact
inventory, integrity identity, plan identity and promotion identity. Its sole
policy-relevant provenance defect is that it omitted `cycle: "003"`.

The omission occurred because the long-running host process had loaded the
pre-correction event emitter before candidate `2e1cf0e` was committed. That
stale host was stopped and confirmed absent before this authority was recorded.

The human explicitly authorizes one append-only corrective
`promotion-recorded` event carrying `cycle: "003"`, the exact existing action
and identities above, `authorityOrigin: "human-maintenance"`, and a reference
to the original event. This is provenance correction only. It is not a second
promotion, does not change the semantic PASS, and does not authorize evidence
movement, reconstruction, normalization, deletion, replacement, or another
correction cycle.

## Follow-up defect

The stale-host runtime-identity failure must be handled as follow-up work. It is
not an additional Spike 014k acceptance requirement and no runtime-identity
feature is implemented by this maintenance action.
