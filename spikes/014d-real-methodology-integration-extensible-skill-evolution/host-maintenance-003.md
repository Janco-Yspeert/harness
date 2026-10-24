# Host maintenance 003 — recovery-scoped root authority basis

**Authority:** explicit human maintenance instruction, 2026-09-25

This is a narrow generic host-maintenance change, not a Harness methodology
role and not a change to trusted methodology N.

Pre-implementation recovery intentionally removes exact invalidated frozen
events from later predicate and input resolution. Before this maintenance,
`kernel.root` recorded its authority basis from the unscoped ledger while
resolver validation used the recovery-scoped ledger. A root issued after such
a recovery therefore failed closed even when it was explicitly human-authorized
and otherwise correctly bounded.

`recoveryScopedAuthorityBasis()` is the shared canonical calculation for both
root creation and root validation. Workflows without a recovery retain their
existing basis because the scoped event view is then unchanged. Existing root
events are immutable: the two 014d roots recorded against the old basis remain
unusable historical evidence and are not reinterpreted.

The regression coverage exercises two invalidated frozen events, an old
unscoped root that remains unusable, a corrected one-use root, stale-grant
rejection and restart persistence. Replacement root authorities for 014d are
separate forward-only records tied to the same user-authorized quota-recovery
scope; they do not broaden any role or workflow grant.
