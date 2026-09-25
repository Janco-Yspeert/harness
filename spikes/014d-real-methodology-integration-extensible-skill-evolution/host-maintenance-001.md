# Host maintenance 001 — semantic `BLOCKED` continuation

**Authority:** explicit human maintenance instruction, 2026-09-25

This is a narrowly scoped host-maintenance change, not a completed Harness
methodology role and not a change to trusted methodology history.

The live 014d Design Map attempt
`ebf4dd0c-9bf4-4713-b17a-baf8c5cc711b` submitted a semantic `blocked` result.
The pre-fix host incorrectly treated that result as an automatic retry and
allocated `a6208983-9f84-4c2e-8292-761597938c81`. Its pending human question
and host evidence remain in the append-only workflow ledger.

The safeguard stops automatic continuation after any semantic `BLOCKED` result
and records `kernel.continuation-stopped`. Explicit, separately authorized
recovery remains governed by normal allocation authority. Candidate 014d policy
also removes `blocked` from automatic retry dispositions; trusted records are
unchanged.

## Follow-up defect — unanswered canonical human requests

**Authority:** explicit human recovery-investigation instruction, 2026-09-25

The failed retry `a6208983-9f84-4c2e-8292-761597938c81` recorded canonical
human request `680fdfec-ce7f-4069-9753-309b11a25d86`, then exited before that
request could be answered. The pre-fix resolver treated the terminal process
state as sufficient to allocate a later successor. It did so at
`2026-09-24T22:16:09.957Z`; this historical event is preserved and is not
recharacterized as authorized.

The resolver now treats every unmatched `kernel.human-request` as a durable
human gate before it selects a retry, successor, or root override. Only a
matching canonical `kernel.human-response` can clear that gate. A terminal
worker's request may be answered after exit, but the response does not revive
the worker or dispatch anything by itself. Provider prose remains non-authority
and cannot create this gate. The deterministic governed-host tests cover a
retryable failure, terminal worker exit, restart, preservation of the original
question and diagnostics, post-exit response, and prose-only non-gating.

## Candidate orchestrator identity observation

The current candidate test subject is `skills/orchestrator/SKILL.md`, contract
version `3`, SHA-256
`8899541623bc9852992efb7c514940457174bee14d3ec7026f5e4b6207936724`.
This is an observed working-tree identity only: it is outside trusted N, has
not been adopted, and is not evidence that AC02/AC03's observed orchestrator
run happened. That future evidence must record the actual runtime, runtime
version, model where available, and exact instruction identity used for the
run.
