# H1 deterministic preflight

- Harness candidate: `27430d9e80df6e7d075edb549c7c4e7b2c5a48e7`
- Command: `node --test test/external-project.test.ts`
- Result: **FAIL** — 10 passed, 1 failed.
- Failed boundary: `014e AC03/AC04/D4: contained public and protected workers see only their granted workspaces, no Harness writes and no Git credentials`.
- Observed mismatch: the public contained probe reported `read-real-home: yes`; the frozen contract requires `no`.
- Canary consequence: blocked before Stockdif branch creation, host configuration, grant allocation or provider execution. No Stockdif files or refs were changed and no remote push occurred.

This is operator-observed public evidence. It is not a role result and does not reinterpret the frozen evaluator contract.
