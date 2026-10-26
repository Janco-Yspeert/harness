# Post-Outcome maintenance 004 — attempt history and finalization recovery

Status: **GENERIC CORRECTION COMPLETE; 014f RECOVERY BLOCKED ON EXISTING EVIDENCE GAPS**

## Authority and provenance

This is explicitly human-authorized post-Outcome host/runtime maintenance
performed inline through Codex App. It is not a governed Harness role
allocation, a reopening of the completed 014k workflow, methodology evolution,
or a new evaluator execution.

The starting repository commit was
`10b37cd6a495c9a5a012bc3961000c3ed61ca988`. The generic implementation
checkpoint is `e398ee8535b045aad7e14eaefecf66ebc80a11cd`.

Trusted methodology sequence 6 remains unchanged. Spike 014f candidate
`af75b14d1847af02404a591a8829751dc8df2a2e`, evaluator revision `002`, attempt
9, execution `d59a2e87-2bf0-494c-86af-9012967229b6`, its semantic `PASS`, and
all earlier workflow events and evidence remain unchanged. No attempt 10 was
created.

## Inspection findings

Attempt 9 produced a genuine evaluator `kernel.result` of `PASS` after 11/11
mandatory executable procedures, 2/2 non-executable procedures and 8/8
criteria. Its public evidence commit `10b37cd6...` is byte-intact at identity
`sha256:e5beec0bf66c671d429ebc1819f8063c9ed66afafc3f10a837483022230141fe`.

Two independent post-verdict defects were confirmed:

1. The public result omitted the validator-required `coverageResults` object.
   The pinned validator therefore blocked `verification-finalized` with
   `expected an object` before promotion was requested.
2. `deriveHostArchive()` iterated private ledger rows by array position and
   assumed private row N was host allocation N. The host has allocations 1–9,
   while the current private ledger contains only historical alternate-shape
   rows for attempts 8 and 9. Promotion was separately denied with `attempt
   ledger disagrees with host allocations`.

The first behavior violated accepted 014k canonical-transition validation. The
second violated AC07/AC08/AC10 and the Design Map requirement that host
allocation history determines attempt existence, never-produced results remain
NONTERMINAL without fictional artifacts, and a later PASS remains archivable
after earlier NONTERMINAL allocations.

## Generic correction

`deriveHostArchive()` now uses the complete ordered current-cycle host
allocation sequence as its attempt backbone. The host call site joins each
allocation to exact `kernel.result` and `verification-finalized` history by
attempt/execution identity. Canonical private rows are joined by their explicit
zero-padded `id`, never array position.

The corrected behavior:

- classifies an allocation with no semantic evaluator result as NONTERMINAL;
- requires exact canonical private evidence for a semantic terminal result;
- reports a precise terminal-evidence gap rather than degrading a terminal
  result to NONTERMINAL;
- uses LOST only when a recorded exact result identity exists and the bytes are
  absent;
- rejects incomplete/out-of-order host history, duplicate or unknown private
  IDs, malformed alternate schemas, ambiguous host results/finalizations,
  candidate/revision/result/execution conflicts and changed terminal bytes;
- requires the ordered history to end in a terminal PASS before deriving a
  post-PASS archive.

The exact accepted canonical private schema remains the evaluator template's
schema-version-2 form (`id`, `implementation`, `evaluatorRevision`,
`evaluatorRevisionIdentity`, `resultPath`, `resultIdentity`, `status`). The
runtime does not silently normalize the 014f historical alternate shape.

## Historical terminal evidence search

The workflow ledger, all retained 014f commits, public manifests and evidence
actions, the complete current 014f private tree, and retained public archive
records were searched for attempts 1, 2 and 5.

- Attempt 1 has canonical public terminal evidence at commit `c385d75f...`,
  identity
  `sha256:10f0b41b305ea712f3e2e73eb85c624bbdae1963d5cf508a8dbb12eb8cbd8878`.
- Attempt 2 has canonical public terminal evidence at commit `93b86bdc...`,
  identity
  `sha256:fc1c31e5f971cc2139bc05bf09dc82645511c7ec6b5d753dd2193c533f1227b0`.
- Attempt 5 has canonical public terminal evidence at commit `caa701af...`,
  identity
  `sha256:9bd11cfcdc8f771b2db2b1641533ea5a36d652a7e0b0b6fb738dc3a9d44b698d`.

Those are exact public `verification-result.json` identities. No retained
private terminal artifact, private result identity, promotion plan/record or
other durable proof of a corresponding private `eval-result.md` was found for
attempt 1, 2 or 5. They therefore remain semantic/canonical TERMINAL history
with a private terminal-evidence gap. They are not NONTERMINAL and are not
truthfully classifiable as LOST.

Attempts 3, 4, 6 and 7 have allocations but no evaluator semantic result and
are truthfully NONTERMINAL. Attempts 8 and 9 have semantic results and current
private result files, but their current private ledger rows use noncanonical
field names and contain no recorded result identities. The observed current
attempt-9 file identity is
`sha256:52d576b80931ee77a314f1b5a55398072e21be23be71e2d87ef25924a6bc3af5`;
it was not retroactively written into evaluator evidence.

## Finalization and promotion recovery status

The attempt-9 private result records aggregate `8/8` satisfaction but does not
record explicit evaluator-authored adjudications for AC01 through AC08. Per the
human recovery authority, no `coverageResults` map was inferred from the
aggregate, no corrected public artifact was created, and no transition-recovery
operation was implemented or invoked. `verification-finalized` remains absent.

Promotion/archive recovery was not attempted. It is independently blocked by
the truthful terminal-evidence gaps for attempts 1, 2 and 5 and by the
noncanonical, identity-free historical private rows for attempts 8 and 9.
Completing recovery requires bounded evaluator evidence repair for attempt 9's
criterion-level public projection and explicit historical authority capable of
representing the terminal private-evidence gaps without fabricating artifacts
or misusing LOST.

No evaluator rerun, evaluator allocation, workflow event, private-ledger edit,
promotion action or archive write occurred.

## Files and verification

Implementation checkpoint `e398ee8535b045aad7e14eaefecf66ebc80a11cd`
changed:

- `src/evaluation-closeout.ts`
  (`sha256:598f1189cb68ea2d9dc384f13e952f5683bb5504f6edafc54147be01876a5f7b`)
- `src/kernel/execution.ts`
  (`sha256:0b68897cfdeae70d1245ba17295ccf150be39d54c68fefbe42437e99d6d5340a`)
- `test/successor-closeout.test.ts`
  (`sha256:4c293b2641a2f4fa98a75d1877a00200b76d4c53e501902adf6a9dad7993faf0`)
- `test/kernel.test.ts`
  (`sha256:debad2162a2fea2659d0a747eb386bf88e99b39683a60940699fc06ad12645cf`)
- `test/skill-fidelity.test.ts`
  (`sha256:e56e3277960d8dbea3a608618bd43ea5da340480f89daca2104809a708cbf1f4`)
- `tools/fixtures/fake-provider.ts`
  (`sha256:05cedf14711bbfa47ac8eb203af96251b28483dfeec45428f409fbed241c8da5`)

Checks:

- focused closeout tests: 16/16 passed;
- focused host/closeout regression: 54/54 passed;
- sequence-6 archive/methodology regression set: 76/76 passed;
- full suite: 267/267 passed;
- TypeScript typecheck, ESLint, Prettier check and `git diff --check`: passed.

The initial combined regression run exposed six stale scripted fixtures that
authored incomplete private rows; they were corrected to emit the accepted
canonical schema and preserve prior candidate provenance. The final runs above
are the authoritative results.

The completed 014k Outcome, trusted sequence-6 history and identity, 014f
candidate, evaluator revision, and all attempt-9 semantic/evidence identities
were not modified.
