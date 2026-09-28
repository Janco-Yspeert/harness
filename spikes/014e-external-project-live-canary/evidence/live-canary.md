# H2 live Stockdif canary

- Harness runtime: `d4b7975d1bc52ce1f029acc5aba4dd9855ae9743` (H2).
- Deterministic preflight: `node --test --test-reporter=spec test/external-project.test.ts` — **PASS**, 12/12.
- Stockdif origin: `https://github.com/Janco-Yspeert/stockdif.git` (normalized `github.com/Janco-Yspeert/stockdif`).
- Stockdif baseline: `d1bb593fd0b56e58e384a07e8971d6bd75541ac0`.
- Local branch: `feat/spike-001`; no product commit and no push.
- Workflow Grant: `93b4ea6c-1490-42c8-bcf9-332569dc051c`, bounded to 10 allocations.
- Public executor profile: Codex `gpt-5.6-luna`, reasoning `medium`; effective model and reasoning were not attestable by the adapter.
- Brief Readiness execution `3ccb1b18-c392-4228-8537-0deb4b58b26f` blocked before repository access. Even a read-only shell operation failed while Codex tried to construct its own bubblewrap sandbox inside Harness containment: `error building bubblewrap command: Read-only file system`.
- The canonical human request was answered without granting a bypass. The worker submitted `blocked` / `NOT_READY`.
- Automatic continuation allocated retry `4298777d-019c-4aae-8f3d-d207af4f30c5`, which reproduced the block and submitted `blocked` / `NOT_READY`.
- Terminal ledger event: `ce926e7d-5a06-47f7-b6b3-20497f09a64e` (`kernel.continuation-stopped`).
- Stockdif ledger identity at the terminal state: `sha256:aeea3b2371eda5ec02fe2c619a6a5dcf4329b0cd3a3e1a7bd84921e833cbc7d9`.
- Provider usage/cost: unavailable.

The live canary therefore stops before Brief Readiness, freeze, design, evaluation, or product implementation. This is a Harness runtime defect; it is not a Stockdif brief finding and does not authorize weakening containment or changing Stockdif.
