# Spike 014g — Verifier Containment Composition

**Status:** Draft for Brief Readiness; not frozen

**Depends on:** Spike 014f candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and its preserved evaluator revision `001`

**Motivation:** 014f verification attempts 001 and 002 established the retirement behavior but could not adjudicate the full regression suite from inside the protected verifier's own writable repository sandbox

## Context

Harness grants `evaluator-verify` repository write capability because the role must commit its public verification record. The registered Claude adapter therefore launches the verifier with the public repository and evaluator-private workspace inside Claude's enforced sandbox.

One existing containment regression exercises a nested provider sandbox and depends on observing its write boundary from an environment that does not already grant the same repository write access. Inside the protected verifier, the parent sandbox's legitimate repository-write grant makes that environmental premise false. The product cases pass, but the verifier cannot fairly adjudicate the regression from that execution context.

014f attempts 001 and 002 both finalized `BLOCKED / INFRASTRUCTURE_FAILURE`. They, candidate `a2ed538330ace7a51b9585dcba404035c72c973f`, and evaluator revision `001` are immutable inputs to this successor. This spike must not revise or reinterpret them.

## Question

Can Harness compose protected verifier permissions and nested provider-containment checks so that a verifier can create its authorized public evidence while full repository regressions observe the same containment boundaries they establish outside the verifier?

## Scope

Choose and implement the smallest generic repair that preserves both requirements:

- protected evaluator reads remain limited to its exact public and evaluator-private workspaces;
- evaluator-owned public artifacts can be written and committed through explicit authority;
- repository checks that exercise nested provider containment run in an environment whose parent permissions do not invalidate their security premise;
- the repair applies generically to governed roles and contains no 014f-specific exception;
- executor selection and effective permissions remain inspectable and fail closed.

The Design Map must decide between the currently viable shapes rather than assuming they are equivalent:

1. a narrower evaluator role/capability split;
2. a host-mediated mutation or verification operation;
3. a sandbox composition change that preserves exact workspace access while giving nested containment an uncontaminated parent boundary.

## Required behavior

1. A protected verifier can read the exact public repository and evaluator-private workspace and cannot read arbitrary home, sibling-project, credential, or unrelated temporary paths.
2. Only explicitly granted public/evaluator paths are writable; no repair broadens Claude's filesystem access globally.
3. Verifier evidence mutation remains attributable to the allocated role or a bounded host action. Provider prose and ambient filesystem access confer no authority.
4. The existing 014e containment regression runs under the protected verifier without weakening, skipping, rewriting, or changing its security assertion.
5. The repair does not special-case Spike 014f, its candidate, its evaluator, or any Stockdif state.
6. Existing governed execution, private-workspace isolation, promotion, containment, nested-sandbox, and executor-selection regressions remain green.
7. After independent acceptance of this repair, Harness reruns 014f verification against unchanged candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and unchanged evaluator revision `001`, preserving attempts 001 and 002 and allocating a new attempt.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01** | Protected verifier access is confined to the exact granted public and evaluator-private workspaces, with home, sibling, credential and unrelated temporary paths still denied. |
| **AC02** | Authorized verifier evidence can be written and committed without granting broader ambient repository or host filesystem authority than the selected design requires. |
| **AC03** | The existing nested-containment regression passes unchanged when executed through the real protected-verifier path; its security assertion is neither skipped nor weakened. |
| **AC04** | The implementation is generic and contains no workflow-, spike-, candidate-, provider-fixture-, or Stockdif-specific exception. |
| **AC05** | Existing governed execution, private exposure, promotion, containment, nested-sandbox and executor-selection regressions remain green. |
| **AC06** | Effective executor/workspace permissions remain explicit, inspectable and fail closed when the host cannot enforce the selected composition. |
| **AC07** | 014f can subsequently allocate verification against candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and evaluator revision `001` without modifying its frozen authority or prior attempts. |

## Non-goals

- Weakening, skipping or reinterpreting the existing containment regression.
- Changing 014f acceptance criterion AC07.
- Editing the 014f candidate, evaluator revision, or attempts 001/002.
- Broadening Claude access to the operator home, arbitrary siblings, credentials, or all of `/tmp`.
- Adding an 014f- or Stockdif-specific exception.
- Resuming or mutating Stockdif.
- Changing provider/model policy except where a frozen Design Map proves it necessary for the selected containment composition.

## Handoff

Run ordinary Brief Readiness and Design Map before implementation. Evaluation must exercise the real protected-verifier launch path and the existing containment assertion, not a synthetic permission object alone. After 014g passes and is accepted, return to 014f and rerun verification unchanged; do not regenerate its evaluator or candidate.
