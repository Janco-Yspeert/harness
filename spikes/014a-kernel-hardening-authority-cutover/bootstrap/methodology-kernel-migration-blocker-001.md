# Spike 014a Bootstrap Blocker — Methodology/Kernel Contract Migration

## Status

**BLOCKED / PAUSED — prerequisite Spike 014b required before Design Map or any
later 014a phase.**

The current 014a Brief Readiness freeze remains authoritative. This record does
not modify or refreeze `spike.md`, replace `brief-frozen`
`553ada49-1955-4d28-9c74-2f2a5fac869e`, or reclassify any earlier bootstrap
fact.

## Why 014a is paused

The observed failure is a methodology/kernel contract-migration problem, not a
standalone Design Map publication bug.

Existing production skills still contain pre-kernel execution assumptions:
they may require committing, publishing, or performing other privileged
workflow mechanics themselves. The governed Role Grant model instead requires
those operations to be expressed as bounded role authority and, where
privileged, as host actions. The current Design Map v2 execution made the seam
concrete: its Role Grant authorized bounded local Git inspection/commit, but
the Codex workspace-write executor could not create `.git/index.lock`; direct
worker publication remains deliberately unavailable. A worker capability label
alone is therefore not a sufficient governed execution contract.

More generally, migrating one role at a time during 014a would conflate the
kernel behavior under test with compatibility defects in the skills and their
configured contracts. The active skill/evaluator pinning arrangement also needs
a coherent active-versus-candidate methodology/version mechanism so a proposed
skill change cannot alter the authority that governs the workflow evaluating
that change. Continuing 014a without that migration would risk recreating the
same recursive bootstrap-authority failures it is intended to harden.

No direct `git push`, publication credential, legacy workflow mutation, or
orchestrator-authored Design Map checkpoint is authorized as a workaround.

## Preserved 014a state

The following remains valid bootstrap authority:

- Brief Readiness methodology repair commit
  `e2ff42ceee6e92c0b325c939a1bea801d6e9a49b` and definition
  `sha256:88c50c1eda9ab32994a1b04981f5a0cfa7df44c1b1002be9fb36ecbbbb30d787`.
- Durable replacement Brief Readiness checkpoint
  `27fe7f321462c70df4a1d40e25200df5d4d38030`, governed execution
  `c93c18fd-4184-49c3-8ecd-6ac1f8655d56`, semantic result
  `2ecf3cae-017a-418d-bf54-19463efdebb4`, and replacement `brief-frozen`
  `553ada49-1955-4d28-9c74-2f2a5fac869e`.
- Design Map local-checkpoint methodology repair
  `1afded46c10da15e32d6d95f68dcad4548207092` and definition
  `sha256:a219667c75d5f38f2ae8b7bc7f3143cab248544360c2414a520faca714066249`.
- Failed governed Design Map execution
  `d2ef68ca-6617-4b5b-bde7-ee38815b35be` under WEG
  `d4a10a16-de9e-4060-8a51-341404ff7272`, root authority
  `b1d9cd03-8564-4820-9cad-e17d5c077974`, Role Grant
  `sha256:6d6e1aec54d848734b1d00ebb070d12f892db63457c8ceab76c8142e7a61a492`,
  and genuine failed semantic result
  `be707d28-46f7-4978-9a10-163d5da1e8a4`.

That worker created the exact attempted `design-map.md` and `manifest.md`, but
could not commit them because its provider sandbox rejected creation of
`.git/index.lock`. Those files, the bridge source, bridge evidence, and
canonical ledger append are retained as failed-attempt evidence only. They are
not a Design Map checkpoint, do not establish `design-map-frozen`, and must not
be consumed by evaluator preparation.

## Required 014b prerequisite

Spike 014b should be a separate subspike that:

1. bootstrap-migrates all active Harness skills to the governed
   RoleInvocation/RoleResult plus host-action contract;
2. removes direct privileged mechanics from skills without intentionally
   changing their domain semantics;
3. establishes a coherent active-versus-candidate methodology/version model so
   future skill edits, including evaluator edits, cannot alter the authority
   governing their own evaluation; and
4. provides sufficient validation, exercise, and promotion machinery to avoid
   repeated bootstrap recursion.

After accepted 014b evidence exists, 014a resumes from the authoritative
replacement Brief Readiness freeze and performs its intended end-to-end kernel
proof using the migrated methodology. It must not treat the bootstrap work in
this record as proof of the eventual 014a features.
