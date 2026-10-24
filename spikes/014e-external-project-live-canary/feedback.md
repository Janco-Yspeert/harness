# Spike 014e — Brief Readiness Feedback

**Reviewed input:** `spikes/014e-external-project-live-canary/spike.md`
(`sha256:ff7a11e3990c4bff89dd151fc04bfb9931cd7ece940170f1747b901f50ef3322`),
reviewed against `feat/spike-014` at
`ec42cef7820d3274b3dffaf907798a6db2c43e22`.

**Prior review:** run 001, `preliminary/001/` (`NOT_READY`; B1, M1–M4,
E1–E2).

**Verdict:** **Ready after minor clarification** (`READY`)

## Summary

The revision (`e20253b..ec42cef`) resolves every run 001 finding:

- **B1:** the new §4 subsection "Cross-track lifecycle and evidence binding"
  answers all five requested points:
  - the supervisor runs Track B under recorded human authorization, not a
    Track A role worker;
  - Track B runs after H1 `implementation-handoff` and before 014e Evaluator
    Verify is allocated;
  - one human-authorized evidence checkpoint, **H1E**, is limited to the
    evidence area;
  - verification binds H1 for generic behaviour and H1E for AC06–AC09;
  - an H2 correction reruns affected steps, and history stays forward-only.
- **M1:** freeze now comes before the Design Map, which matches the
  `design-map` precondition in `methodologies/harness/policy.json`.
- **M2:** read denial now applies to "**every** public worker regardless of
  provider". Substituting Claude for Codex is pre-authorized within the same
  bound.
- **M3:** Luna/Medium is now a profile preference recorded as unconfirmed,
  not an exact grant constraint. That matches the attestation refusal in
  `src/executors/adapters.ts`.
- **M4:** the rules for counting the 10 allocations are now explicit.
- **E1–E2:** the directory names are now `stockdif`/`stockdif-hidden`
  throughout, and the H1 runtime is recorded in the Stockdif grant or ledger.

The new text is consistent with the repository in these ways:

- `AGENTS.md` "Supervisor identity" forbids the supervisor from editing role
  artifacts and from claiming worker identity. The brief keeps both limits and
  calls H1E operator evidence, not a role result.
- Evaluator-evidence promotion (`src/kernel/execution.ts`, promotion path)
  checks the eligibility plan, source identities and the destination
  workspace. It does not require `HEAD` to equal the candidate, so an H1E
  commit on top of H1 does not break promotion.
- Human acceptance binds `candidate` from `implementation-handoff`
  (`methodologies/harness/policy.json`, `humanDecisions`). That stays H1.

Two gaps remain. Both have an apparent answer and should be stated before
freeze so the Design Map and Evaluator Prepare do not diverge. Neither one
blocks freeze.

## Material clarifications (non-blocking)

### C1 — Where the H1E identity is bound, given that Evaluator Verify's grant cannot carry it

**Brief evidence.** §4, "Cross-track lifecycle and evidence binding": "The
final 014e verification binds candidate H1 … and the named H1E commit and
artifact identities for AC06–AC09; the evaluator must confirm both bindings
and may not infer either from mutable `HEAD`." §4 Track A step 3 forbids
changing the trusted methodology unless an independently justified contract
defect makes it unavoidable.

**Repository evidence.**

- `methodologies/harness/contracts/evaluator-verify.json` binds only these
  inputs: `brief`, `design`, `coverage`, `candidate` (from
  `implementation-handoff.commit`) and `evaluatorRevision`.
- `methodologies/harness/policy.json` (`evaluator-verify.onAllocate`) records
  only `commit: candidate` and `evaluatorRevision`.
- No policy event can carry an operator-made evidence commit.
- So under the unchanged trusted methodology, H1E cannot be a host-bound grant
  input. The brief says it is "named" but does not say where.

**Consequence.** Evaluator Prepare has to predeclare how it finds and checks
H1E before H1E exists. Without a stated source, one design could extend the
trusted contract, which Track A step 3 argues against. Another could let the
evaluator take H1E from branch `HEAD`, which the brief forbids. A third could
use an ad-hoc file. These choices lead to different fair-evaluation evidence.

**Smallest clarification requested.** One sentence, for example: "H1E's exact
commit and evidence-artifact digests are recorded in the explicit human
authorization/ledger note for the H1E checkpoint. The evaluator resolves H1E
from that record, not from the Evaluator Verify grant. It confirms that H1E
descends from H1, changes nothing outside the 014e evidence area, and matches
the recorded digests. No trusted-methodology change is made for this binding."

### C2 — How the Track A workflow is held between H1 handoff and Evaluator Verify

**Brief evidence.** Track B "begins only after Track A Implementation has …
handed off … H1 and before Track A Evaluator Verify is allocated."

**Repository evidence.**

- In `methodologies/harness/policy.json`, `evaluator-verify` becomes eligible
  as soon as `implementation-handoff` is current.
- `AGENTS.md` "Autonomous orchestration" and `skills/orchestrator/SKILL.md`
  continue to the next valid action unless a human gate or a human stop
  request applies.
- No policy gate holds Verify for external evidence.

**Consequence.** Without a stated hold, normal orchestration allocates Verify
right after H1 handoff, before any Track B evidence exists. That uses a
verification attempt and produces a result that cannot satisfy AC06–AC09.

**Smallest clarification requested.** State the hold mechanism. For example:
"The recorded human authorization includes a stop request after 014e
`implementation-handoff`. Verify is allocated only after H1E, or a truthful
blocked-canary record, exists." Also say what happens if the canary is
blocked: whether Verify still runs against H1 with the evidence recording the
block (see the §6 final paragraph).

## Editorial

- **E1.** `014e/evidence/` is not a repository path. Say whether it means
  `spikes/014e-external-project-live-canary/evidence/`, so that "outside the
  014e evidence area" can be checked mechanically.
- **E2.** The header still gives the draft baseline as `455205e`. The branch is
  now at `ec42cef`, and the brief already defers this to re-resolution at
  freeze.

## Review limitations

- The Stockdif repositories (`/home/velveteen/vk-code/stockdif`,
  `/home/velveteen/vk-code/stockdif-hidden`) are outside the granted workspace
  and were not inspected.
- The installed provider CLIs, their versions and their sandbox behaviour were
  not exercised.
- No evaluator-private material (`eval-spec.md`, `.hidden-test/**`,
  `.eval/**`) was inspected.

## Files changed and checks

- Written:
  - `spikes/014e-external-project-live-canary/feedback.md`;
  - `spikes/014e-external-project-live-canary/manifest.md` (run 002 appended).
- No `preliminary/` snapshot, because the verdict passes. `spike.md` was not
  modified.
- Checks:
  - SHA-256 of `spike.md` compared with the host-bound identity (match);
  - diff `e20253b..ec42cef` reviewed against the run 001 findings;
  - Prettier check of `feedback.md`.

**Ready after minor clarification**
