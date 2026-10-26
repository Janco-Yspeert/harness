# Spike 014g C3 Implementation Correction Report

## Authority and scope

This correction is bounded by the human decision recorded in
`human-implementation-correction-authority.md` at commit `f2121a8` (content
identity
`sha256:dfb9a685215588c149f5733f5dd46dee5f76d0a8be0e6f5505d5ad0cc6d79ed4`).
The current resolver cannot express that decision as a Role Grant input, so the
human authorized this one process exception: bounded root authority permitted
one attached inline Implementation allocation, while the committed decision—not
the root reason—provided the substantive implementation authority.

No evaluator-private material was exposed to or inspected by the Implementation
context. The frozen brief, Design Map, evaluator revision `003`, methodology and
model-selection semantics, promotion policy, and unrelated architecture are
unchanged.

## Correction

The existing 014i candidate-evaluator-subject engine now has a second input mode
at its host-owned boundary. A public caller supplies only the workflow, exact
candidate, active evaluator revision and revision/inventory/procedure identities.
The governed host checks those values against the current implementation handoff
and public readiness attestation, then resolves the configured evaluator-private
freeze itself. Requests carrying an extra path, contents, or replacement
procedure field fail closed.

The resolver verifies the exact freeze identity, revision, inventory identity,
case manifest, selected procedure, and every selected test/support blob. Only
those selected bytes are copied into a temporary read-only procedure root.
Unselected private inventory material is not exposed. The same accepted 014i
subject engine constructs the disposable candidate composition; no second
candidate-role runner or general private-file injection facility was added.

For a frozen-procedure run, the host separately creates read-only topology and
before-state inputs, records host-side before/after observations outside subject
write authority, and keeps repository/evaluation/scratch permissions governed by
the reconstructed candidate composition. The sealed manifest binds the exact
candidate, candidate methodology and composition, runtime, evaluator revision,
private inventory, procedure/material identities, and topology/before/after
identities. Bundle validation now rejects missing frozen-procedure bindings and
missing host observation artifacts.

## Visible regression evidence

The new deterministic regression proves exact resolution and execution, failure
on wrong revision identity, wrong inventory identity, unknown procedure, and
caller-supplied path/content fields; exclusion of unrelated private inventory
material; separate host-created, subject-visible, and subject-writable topology;
external before/after capture; identity-complete sealing; and rejection after a
required host-input binding is omitted. The pre-existing 014i reconstruction,
authority, lifecycle, containment, tamper, and publication regressions remain
green, as do the repository's accepted 014h containment regressions.

`npm run check` passes typecheck, lint, formatting, and all 241 visible tests.
Independent evaluator verification has not been claimed by this implementation
report.

## C4 candidate-export correction

The first required revision-003 E5 subject launch against exact C3 failed before
the private procedure executed. Full-repository reconstruction used newline
output from `git ls-tree`; with Git path quoting enabled, the repository's
Unicode em-dash filename was returned as a quoted octal escape and then passed
back to `git show` as a nonexistent literal path.

The existing 014i exporter now requests NUL-delimited tree output and parses it
as bytes before UTF-8 decoding. Its mode lookup also uses an explicit `--` path
separator. No subject authority, evaluator semantics, private-material handling,
or evidence format changed.

A deterministic regression builds a complete candidate repository with
`core.quotePath=true` and a Unicode path, then proves the ordinary 014i subject
engine reconstructs the exact committed file and seals evidence. The regression
failed as `infrastructure-failed` before the correction. `npm run typecheck`,
`npm run lint`, and formatting passed; the complete suite passed 242/242 after
the governed host was stopped to avoid unrelated concurrent test interference.
