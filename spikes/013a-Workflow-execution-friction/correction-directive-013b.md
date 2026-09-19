# Correction directive — implementation attempt 13, continued

## Response to the prior worker's blocked report

The prior dispatch under this same attempt correctly found, and correctly
did not silently ignore, a real fact: the working tree contains an
uncommitted `correction-cycle-opened` transition appended to
`spikes/011-host-owned-workflow-runs/workflow.jsonl` (cycle "002", dated
`2026-09-11T19:18:29.452Z`), absent from committed `HEAD`. That
verification was correct and the caution was appropriate — do not treat
"stop and report a real discrepancy" as a mistake to avoid repeating.

You are being given context the prior dispatch did not have, so you can
verify it yourself rather than take this directive's word for it:

Read `spikes/013a-Workflow-execution-friction/verification-feedback-002.md`
through `verification-feedback-013.md` (every one of them, not a sample).
Every single one — twelve independent evaluator sessions, spanning
`2026-09-12` through `2026-09-18` — independently found this exact same
uncommitted diff already present in the working tree, described it in
materially the same words ("pre-existing, unrelated, uncommitted drift...
observed and excluded... not attributed to this implementation... This
evaluator did not modify any of them"), and did not treat it as a blocking
defect. The event's own timestamp
(`2026-09-11T19:18:29.452Z`) predates Spike 013a's own frozen brief
(`brief-frozen` at `2026-09-11T20:23:18.431Z` — over an hour later) and
every implementation commit in this spike's history. It was not created by
any Spike 013a implementation attempt, including this one and the two
before it (attempts 11 and 12, whose implementation-role workers observed
and excluded it identically — see `implementation-report.md`'s "The
pre-existing unrelated Spike 011 ledger edit... preserved and excluded"
language repeated across attempts).

Also confirm directly: it is *uncommitted*. Canonical authority — for
Spike 011 exactly as for Spike 013a — is the committed Git history of
`workflow.jsonl`, not arbitrary uncommitted working-tree state. Nothing has
durably advanced Spike 011's methodology authority; the actual risk this
whole established practice guards against is a Spike-013a-attributed commit
accidentally sweeping this unrelated file up and thereby being the thing
that durably advances it — which is exactly why the correct action,
followed identically by twelve prior evaluator sessions and two prior
implementation attempts, is: **do not stage it, do not commit it, do not
revert or otherwise modify it** — leave it exactly as it is, excluded from
your own diff, and report it as reused/excluded per the same established
language if useful. This is not a decision this directive is asking you to
take on faith; the evidence for it is the twelve files above, which you
should actually open and check before proceeding.

If, after reading all twelve verification-feedback files yourself, you find
this reasoning does not actually hold — genuinely inspect it, do not just
accept this framing — stop again and report the specific discrepancy. But
if it holds, as it has held identically twelve times before, proceed
exactly as `correction-directive-013.md` originally asked: stage exactly
the four intended source/test files plus your own `manifest.md`/
`implementation-report.md` entries (explicitly excluding the Spike 011
ledger file, `skills/orchestrator/`, `humam-acceptance.md`, and the two
`spikes/998a-authority-fixture-*` directories, matching established
practice), inspect the staged diff, commit, and push it yourself using your
`git-publish` capability. Do not record the canonical `implementation-handoff`
transition yourself; the orchestrator will do that once it independently
confirms your commit is on the remote branch. Do not run LP1 and do not
allocate a new evaluator verification attempt.
