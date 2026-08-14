# Spike 005 — attempt 001 (frozen v1 evaluation, un-corrected)

`eval-spec.md` and `hidden-tests/**` here are the **frozen v1 evaluation
contract** used for the first `/evaluator verify 005` pass, before the
deliberate v2 revision described in `../evaluation/eval-spec.md`'s Revision
History. This is the un-corrected suite: it still contains the 13 evaluator
defects and the unfalsifiable E24 oracle documented in
`../evaluation/verify-2026-08-14-diagnostics/`.

## Provenance note

These files are a **reconstruction**, not a retrieved copy. The private
evaluator workspace (`harness-hidden/spikes/005-native-codex-backend/`) was
overwritten in place with the v2-corrected suite and then deleted, per the
evaluator skill's own promote-then-cleanup workflow, before this v1 copy was
requested — v1 was never committed anywhere as its own snapshot. It was rebuilt
by reverse-applying the known, precise fixes documented in
`../evaluation/verify-2026-08-14-diagnostics/README.md` against the v2 files,
using exact before/after text captured during the original diagnosis (either
complete pre-edit file reads or small, precisely-known diffs — no change here
was a large, freely-reconstructed block).

**Accuracy was verified empirically, not just asserted.** This reconstructed
suite was typechecked and executed against implementation commit
`bb67186d7a5b8fdcba7409ce89e593427d6c52eb` and reproduced the exact failure
signature recorded in
`../evaluation/verify-2026-08-14-diagnostics/eval-result-2026-08-14-FAIL.md`
from the original run: 26 pass / 14 fail (plus the expected obsolete
pre-implementation self-check failure) — the same 14 case names, the same
timeout durations (~15000ms) for E3/E19/E21/E22/E25/E26/E27, the same fast-fail
pattern for E8/E11/E12/E14/E17/E18, and, for E24 specifically, a byte-identical
assertion error
(`AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to: 204`,
`actual: 204`, `expected: 204`, `operator: 'notStrictEqual'`).

`hidden-tests/helpers.ts`'s relative import paths (`../../../../harness/...`)
are archival, matching the path depth of their original location inside the
now-deleted private workspace — consistent with this project's existing
precedent
(`spikes/004-session-backend-abstraction/evaluation/hidden-tests/helpers.ts`
carries the same characteristic). They do not resolve correctly if run directly
from this promoted location without adjustment; verification above was performed
against a temporarily path-corrected copy, not this archived one.
