# H3 live Stockdif canary

- Harness runtime: `eb6a06e5bd808918e958103fd63589b4e67d8ce3` (H3).
- Deterministic preflight: `node --test --test-reporter=spec test/external-project.test.ts` — **PASS**, 15/15.
- Stockdif origin: `https://github.com/Janco-Yspeert/stockdif.git` (normalized `github.com/Janco-Yspeert/stockdif`).
- Stockdif baseline: `d1bb593fd0b56e58e384a07e8971d6bd75541ac0`.
- Local branch: `feat/spike-001`; no product commit and no push.
- Workflow Grant: `a5fa0c8f-3117-4caf-827d-dcc5cedfc70e`, bounded to the eight allocations remaining after H2 used two.
- Public executor profile: Codex `gpt-5.6-luna`, reasoning `medium`; effective model and reasoning were not attestable by the adapter.
- Brief Readiness execution `5dcdb9d6-e097-45a8-a558-1dab3c1721cd` could read and write the Stockdif worktree and completed a `READY` review, but could not create `.git/index.lock`. The Codex nested sandbox kept the granted repository's Git metadata read-only despite the Role Grant's `git-commit` capability.
- The canonical human request was answered without granting a sandbox bypass or permitting a supervisor-authored role commit. The worker preserved the uncommitted review artifacts and submitted `blocked` / `READY`.
- Automatic continuation allocated retry `0676c9f8-1849-47dd-b7f5-bbaa7e92722c`. The host was stopped to prevent duplicate work against the known broken runtime; recovery recorded it `interrupted`.
- Preserved Stockdif worktree artifacts: `feedback.md`, `manifest.md`, and `preliminary/`, all untracked; no product or role checkpoint commit exists.
- Terminal ledger event: `d9f80774-f8f0-461b-9f6a-a0e4451340a7` (`kernel.process`, execution `0676c9f8-1849-47dd-b7f5-bbaa7e92722c` interrupted).
- Stockdif ledger identity at the terminal state: `sha256:2791b8ad3671a51b974e7ca93c95b095b39229738b6bf7643e89da9c1dbbc9de`.
- Provider usage/cost: unavailable.

The live canary therefore stops before a valid Brief Readiness checkpoint, freeze, design, evaluation, or product implementation. This is a Harness runtime defect; it is not a Stockdif brief finding and does not authorize weakening containment, substituting a provider silently, or changing Stockdif product scope.
