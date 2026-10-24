# As-Built — 014k Trusted Methodology Successor Evaluation and Adoption

Inspected implementation: `f64b55286e2d2c06d4bd1fd1f815b1b9d09a5330` (cycle 4; it adds `src/kernel/archive-preservation.ts`, `src/kernel/execution.ts` and `test/governed-executors.test.ts` changes on top of the earlier implementation `2e1cf0e2`). Verification: attempt 002, evaluator revision 004, PASS, all 15 criteria SATISFIED (`sha256:001af473…3c36`). Host promotion record `evaluation/promotion.json` matches the bound identity `sha256:2965c3f2…7cf6` and was committed as its own checkpoint (`ed99cd3`).

## Implemented shape

- **Observation declaration** (`src/observation-declaration.ts`). A closed, canonical, identity-bearing `prepared-observation-declaration`. Fields: purpose, candidate, evaluator revision and identity, host-input classes from the closed vocabulary `topology|before|after`, consumer, and an optional sealed `observation` identity once fulfilled. Unknown fields, paths and inline content are rejected. It exposes `parseObservationDeclaration`, `declarationIdentity` and `fulfilObservationDeclaration`, which validates a prepared-observation record. It confers no authority. No runtime code imports the module; only tests exercise it.
- **Evaluation-closeout library** (`src/evaluation-closeout.ts`).
  - Attempts are classified as `NONTERMINAL` (reason only, no artifact), `TERMINAL` (result plus artifact identity) or `LOST`. `LOST` applies only when a recorded artifact identity exists and the file is now missing. A never-produced artifact is never `LOST`. A recorded artifact whose bytes changed throws.
  - `EvaluationFact` is an immutable, identity-computed verdict record.
  - `buildArchivePlan` archives the active revision directly from `.eval/` and superseded revisions from `.eval/revisions/<id>/`. Changed or missing bytes throw.
  - `executeArchive` stages the archive and renames it only after every identity verifies. It returns an `ArchiveRecord` (`complete|incomplete|failed`) that references the fact by identity and never alters it. `incomplete` means a `LOST` attempt exists.
  - `closeoutPermitted` is a policy predicate over the record only.
  - `deriveHostArchive` builds the plan from the private attempt ledger plus host allocation events. It requires a terminal last attempt and a frozen revision, and it reads no evaluator eligibility plan.
  - In the runtime, only `deriveHostArchive` is wired in. `executeArchive` and `closeoutPermitted` are exercised by tests, not by host code.
- **Host-derived promotion** (`src/kernel/execution.ts`, `model.ts`, `resolver.ts`, `methodology.ts`, `host.ts`, `executors/protocol.ts`).
  - The `promotion.derive: "host-archive"` contract option is mutually exclusive with `plan`. The harness `evaluator-verify` contract now declares it instead of `.eval/promotion-plan.json`.
  - Worker `requestAction` promotion no longer requires `artifacts`. The host derives the artifacts from the grant-bound source workspace and from allocations scoped to the current cycle. It uses the generated content or file bytes for each item and verifies identities.
  - On success, `promotion-recorded` carries the host-derived active correction-cycle field (taken from the latest `correction-cycle-opened` event, otherwise `scope.initial`). The caller cannot supply it.
  - Derivation failure is recorded as a failed action.
- **Evaluator skill** (`skills/evaluator/SKILL.md`). Rewritten (about −51 lines net) to match the verdict-only, host-archived model. `test/skill-fidelity.test.ts` was updated accordingly.
- **Adoption authority** (`src/methodology-evolution.ts`). `promoteMethodology` now requires authority evaluation to bind `predecessorSequence`, `resultIdentity` and `closeout` (sha256 identities). It refuses a stale head (`predecessorSequence !== history.length`). The existing candidate and methodology binding checks are retained. `parseTrustedHistory` validates the new optional fields.
- **Earlier-cycle archive preservation** (`src/kernel/archive-preservation.ts`, called from `src/kernel/execution.ts`). When the promotion destination already exists and the methodology defines a scope event, the host plans preservation before staging. The cycle and the expected file identities come only from the latest recorded promotion event for that destination. The occupied directory must be a plain directory whose file inventory exactly matches the recorded artifact identities plus `promotion.json`. The recorded cycle must be three digits and earlier than the current cycle. The history root `<destination>-history` must be a plain directory if it exists, and `cycle-NNN` must be unoccupied. Any mismatch fails closed with nothing moved. On success the old archive is renamed to `<destination>-history/cycle-NNN`, then the new staging directory is renamed into place. If that second rename fails, the old archive is renamed back. Without a scope event the old "promotion destination already exists" failure is kept. Cycle-4 tests in `test/governed-executors.test.ts` exercise this through the real promotion path.
- **Tests and fixtures.** `test/successor-closeout.test.ts` (755 lines), additions to `kernel.test.ts` and `methodology-evolution.test.ts`, and `tools/fixtures/fake-provider.ts` changes.
- **Persisted artifacts.** `evaluation/` holds the cycle-4 archive: promotion plan, attempt ledger, attempt 001 and 002 `eval-result.md` and `promotion.json`. The cycle-3 archive sits at `evaluation-history/cycle-003/` (not yet committed in the working tree) and the cycle-2 legacy material at `evaluation-history/cycle-002/`. The evaluator revision bundle with private hidden tests was kept private.

## Comparison to the frozen contract

**Missing**
- No `human-adoption-decision.md`, trusted-history N+1 append or `cutover-evidence.md` exists at this revision. The Design Map and brief place these after As-Built (execution sequence steps 13–15). They are lifecycle steps, not candidate content, so they are noted as not yet present rather than as defects in the implementation.
- The Design Map's `human-adoption-decision.md` artifact is not validated by any code. Adoption binding is enforced only through the authority fields on the evaluation record.
- The Design Map's separate verdict and archive-record model (`executeArchive`, `closeoutPermitted`) has no host call site. The host-side archive and the gate on As-Built, adoption and promotion go through the existing promotion action and `promotion-recorded` gate. `closeoutPermitted` does not drive them.
- The declaration interface has no runtime consumer, as the design allowed ("exercised only as candidate software").

**Contradictory**
- None found.

**Extra**
- `promotion-recorded` gains a host-derived correction-cycle scope field, and archive allocations are scoped to the current cycle. This is not in the Design Map. It was added to fix a cycle-3 evaluator finding (M7).
- `evaluation-history/` and the pre-existing `evaluation/` material carry old-N compatibility closeout material, and human maintenance records exist (`human-maintenance-cycle-002-archive-relocation.md`, `human-maintenance-cycle-003-promotion-provenance.md`). Per the brief this is legacy closeout and is not evidence for the N+1 archival semantics.
- Earlier-cycle archive preservation under `<destination>-history/cycle-NNN` (see Implemented shape) is behavior beyond the Design Map. It was added to resolve the cycle-4 AC06/AC10/AC15 failures.
- Protocol schema change: promotion `artifacts` is now optional with no `minItems`. This applies to all grants, not only those with `derive`.
