# Post-Outcome maintenance 006: historical unbound evidence recovery

## Authority and boundary

This is explicit human-authorized, forward-only host/runtime maintenance performed
through Codex App. It was not a governed Harness role allocation and did not
reopen the completed Spike 014k workflow.

The maintenance started from commit
`703b4d2ca8f8481441dd43e6bfc1a585cc36700b`. It used implementation skill
contract version 5, identity
`sha256:8968bbd6f3fade371b6d7c872702b1c559539ce3f05b63071abb127c2ba145d8`,
where applicable. The human authority specifically permitted this recovery to
consume the exact surviving evaluator-private bytes as bounded recovery inputs;
those bytes were not treated as implementation requirements or semantic
authority.

This maintenance did not:

- run an evaluator or create attempt 10;
- change any evaluator verdict;
- change candidate `af75b14d1847af02404a591a8829751dc8df2a2e`;
- change evaluator revision `002`;
- change trusted methodology sequence 6 or its identity;
- rewrite workflow events or the private evaluator ledger; or
- modify the completed 014k Outcome.

## Defect and accepted semantics

The ordinary archive path correctly failed closed because historical terminal
attempts 1, 2 and 5 lacked exact private terminal evidence. The existing
known-loss recovery was also inapplicable: no durable exact identity proved that
those private artifacts had ever existed. Calling them `LOST` would therefore
have invented history; calling them `NONTERMINAL` would have contradicted their
canonical semantic results.

The generic correction keeps semantic lifecycle and archive provenance
separate:

- `NONTERMINAL`: an allocation has no semantic evaluator result and requires no
  terminal artifact;
- `BOUND`: exact private bytes match an exact durable historical binding;
- `RECOVERY_BOUND`: exact private bytes survive and are hashed during recovery,
  without claiming that the identity was historically bound;
- `LOST`: an exact private identity was durably recorded and those bytes are now
  unavailable; and
- `UNBOUND`: canonical terminal semantic/public provenance exists, but no exact
  private identity was durably bound, the bytes are unavailable, and prior
  persistence is unknown.

`UNBOUND` is an archive-provenance disposition, not a fourth verdict. Missing
bytes are neither reconstructed nor represented by placeholder files.

## Generic implementation

Commit `1bf3cbef36348d8f3ec75e2b3330d7a2ae323417` adds the root-only
`evaluator-unbound-evidence-recovery` route and tests. The route requires a
committed, content-addressed declaration and independently reconstructs the
host's exact allocation, Role Grant, semantic-result, finalization and public
artifact history. It validates every attempt in order, checks private evidence
according to the declared disposition, binds the final canonical PASS, refuses
later attempts or an existing promotion, and produces an explicitly incomplete
machine-readable attempt-provenance archive.

The recovery is forward-only, drift-refusing and idempotent. It cannot allocate
an evaluator, append a semantic result or finalization, fabricate a private
artifact, or make an ordinary complete promotion. Existing ordinary complete
archive and known-loss recovery behavior remains unchanged.

The `promotion-recorded` event carries the recovery classification,
declaration identity, runtime identities, canonical PASS, provenance identity,
explicit `archiveCompleteness: "incomplete"`, and the bounded human/root
closeout authorization. Consequently downstream closeout does not confuse this
exception with an arbitrary or ordinary-complete promotion.

The implementation touched:

- `src/kernel/unbound-archive-recovery.ts`;
- `src/kernel/execution.ts`;
- `src/kernel/host.ts`;
- `src/kernel/model.ts`;
- `test/unbound-archive-recovery.test.ts`; and
- `test/kernel.test.ts`.

## Recovery declaration and exact attempt history

Commit `0984a9ea1dfb7e5a6ced1be994545cb821298eb3` adds
`spikes/014f-inactive-workflow-grant-retirement/unbound-archive-recovery.json`.
Its identity is
`sha256:8e7cf8a755b3a33bd32a5bd45aa2bce19cdcab4bb86e2ca739cdaec8d5e43df0`.
It binds the complete ordered host history and explicitly states that no missing
bytes were reconstructed and that `UNBOUND` makes no prior-existence claim.

| Attempt | Semantic lifecycle/result | Private evidence disposition |
| --- | --- | --- |
| 1 | TERMINAL / BLOCKED, candidate `a2ed538...`, revision `001` | UNBOUND |
| 2 | TERMINAL / BLOCKED, candidate `a2ed538...`, revision `001` | UNBOUND |
| 3 | NONTERMINAL, provider failure | none required |
| 4 | NONTERMINAL, provider failure | none required |
| 5 | TERMINAL / BLOCKED, candidate `af75b14...`, revision `002` | UNBOUND |
| 6 | NONTERMINAL, provider failure | none required |
| 7 | NONTERMINAL, provider failure | none required |
| 8 | TERMINAL / BLOCKED, revision `002` | RECOVERY_BOUND |
| 9 | TERMINAL / PASS, revision `002` | BOUND |

Attempt 8's surviving `.eval/attempts/008/eval-result.md` was hashed during
recovery as
`sha256:be938ffedf151ed10252a330c732f7478c7037a3c61d22f71a8364ff1c488304`.
That observation is bound to allocation `b23592f8-bd2e-48cf-aafe-ff80179f98a5`,
execution `7b26f056-fd50-46c1-90dc-a072295373a6`, Role Grant
`sha256:a733098af7fbcee216981189630c625794d7a897ebda8bc0ad5ff6c34d312ecf`,
its BLOCKED semantic result `03d25521-b6dc-4018-a7b0-ab6fe04a115d`, malformed
public artifact
`sha256:928d928308d0234719f973155e053f9dc39cc346171603d6bdc30bda6c7152b8`,
and blocked transition `31453aff-6422-4d68-8227-b552660834a1`. It does not
claim that the private identity was recorded historically, and it does not
fabricate `verification-finalized` for attempt 8.

Attempt 9 remains the sole PASS. Recovery required its exact execution
`d59a2e87-2bf0-494c-86af-9012967229b6`, Role Grant
`sha256:2be47c1a08de48261c0263c65ac6c9b356a97f2d2ad75cf0111441412d4a8f05`,
semantic result `6985ffea-a473-43a4-8f1e-3912d3bfe8f8`, canonical
`verification-finalized` `138271e4-40d9-4f5d-bdf9-42e72fc8fbc0`, corrected
public artifact
`sha256:f5ccd08882665d49cd26d05155ca6e0cd4e23210fc3a77d0d239ad443212ac9a`,
and bound private result
`sha256:52d576b80931ee77a314f1b5a55398072e21be23be71e2d87ef25924a6bc3af5`.

## Applied recovery and promotion

The first recovery request used the repository's generic project mapping and
failed before authorization or mutation because that configuration did not
expose the historical 014f evaluator workspace. A disposable, exact 014f-only
host configuration then named the repository and evaluator-private roots; it
was deleted after use.

The successful root recovery recorded:

- recovery authority `a589a7c8-fe1c-4702-b3da-2e42bd84a661`;
- authorization event `b8fe4173-edd7-4801-a689-b20303231bb6`;
- action request `4e463e1a-25b3-4875-a553-5bb9e2a28b23`;
- action result `2a1b0812-115e-449d-bdd6-1d74fe03b06b`;
- archive integrity identity
  `sha256:074457cff2dc17e70b5e1606dbfa81d43457172ab7707c2407206e68ff08e9b0`;
- nine-attempt provenance identity
  `sha256:b46f3ce0fe40431b2381cfd74a9f69dd379ddd415fc53750a3db742bdbcbd109`;
- promotion identity
  `sha256:d283a7ffb58a9c9a227783148f1a7f63249443377aef1943986b4b218583c7e5`;
  and
- `promotion-recorded` event `60c33af1-2e6f-4ef6-815f-a818cbd47e12`.

The archive is deliberately and visibly `incomplete`, classified
`HISTORICAL_UNBOUND_PRIVATE_EVIDENCE`. It contains the complete nine-attempt
provenance manifest and every authorized byte that actually survives, including
attempts 8 and 9, the historical identity-free private ledger, revision 002,
the recovery declaration and the promotion receipt. It contains no fabricated
artifact for attempts 1, 2 or 5. Exact replay returned the original successful
action and appended no second promotion.

The public recovery archive is under
`spikes/014f-inactive-workflow-grant-retirement/evaluation/`.

## Verification

- focused archive, recovery, kernel, methodology, skill-fidelity and closeout
  regressions: 108/108 PASS;
- full suite: 283/283 PASS;
- TypeScript typecheck: PASS;
- ESLint: PASS;
- Prettier check: PASS; and
- `git diff --check`: PASS before the final checkpoint.

The tests prove disposition semantics, exact ordered declaration coverage,
candidate/revision/execution/Role Grant/result/finalization drift refusal,
attempt-9 final-PASS binding, later-attempt refusal, changed private evidence
refusal, no fake artifacts, explicit incomplete promotion provenance,
idempotence, preservation of ordinary complete and known-loss paths, and the
absence of evaluator allocation/result/finalization side effects.

## Closeout and future invariant

The host now resolves the As-Built role from the exact recovered promotion.
Spike 014f is ready for As-Built; human acceptance remains downstream of a
completed As-Built and was not performed here.

Future terminal finalization should durably bind private terminal evidence to
attempt, execution, Role Grant, candidate, evaluator revision, semantic result,
verdict, bounded private path and artifact identity before or atomically with
`verification-finalized`. Broader retry and terminal-lifecycle redesign remains
deferred to Spike 014l.
