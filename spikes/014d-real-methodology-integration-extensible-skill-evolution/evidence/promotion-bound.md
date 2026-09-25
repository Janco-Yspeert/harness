# 014d C4 — Promotion artifact bound B

- **B = 64** artifact mappings per `requestAction`. This is unchanged from the
  prior literal.
- **One definition:** `MAX_ACTION_ARTIFACTS` in `src/executors/protocol.ts`.
  It is used by:
  - the published `requestAction` schema (`artifacts.maxItems`);
  - `parseWorkerRequest("requestAction", …)`;
  - the host promotion check in `ExecutionKernel.promote`;
  - `tools/archive-manifest.ts`, which re-exports it as
    `MAX_PROMOTION_ARTIFACTS`.
- An eligible manifest above B is refused whole, before any copy. It is never
  split, bundled or truncated. The oversized cases use B + 1 mappings: the
  archive-utility refusal, the protocol refusal and the scripted host case
  (`padTo: MAX_ACTION_ARTIFACTS + 1`).

## Retention check

| Representative complete archive | Mappings | Fits within B |
| --- | ---: | --- |
| Deterministic 013a-shaped archive (14 attempts, 2 eligible revisions of 11 files each, attempt ledger, plan) | 38 | yes |
| Largest committed historical archive, `spikes/005-native-codex-backend/evaluation/` (files, including `promotion.json`) | 38 files | yes; the deterministic representative is at least this large |
| Scripted fidelity fixture (layer (b); 1 attempt, 1 revision of 2 files, ledger, plan) | 5 | yes |
| Scripted repair fixture (2 attempts, 2 revisions of 2 files each, ledger, plan) | 8 | yes |
| **AC05 real candidate-evaluator fixture manifest** | **not yet run** | **outstanding.** Record the count here when the governed run exists (see `real-provider-runs.md`) |

The deterministic check is
`test/archive-manifest.test.ts` › "B is the one published bound and a
representative complete archive fits within it". It counts the committed
historical archives from Git, builds the 38-mapping representative with the
real utility, and asserts that it fits.

B therefore stays 64 on the evidence available now. If the AC05 fixture
manifest or 014d's own N-verified archive exceeds B, C4 applies: raise the
single definition, record the reason here, or surface a truthful incomplete
phase at human acceptance. It is never reported as archived.
