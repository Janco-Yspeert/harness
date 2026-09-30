# Spike 014g — Verifier Containment Composition

**Status:** Specification-recovery draft for Brief Readiness; prior frozen revision preserved

**Depends on:** Spike 014f candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and its preserved evaluator revision `001`

**Motivation:** 014f verification attempts 001 and 002 established the retirement behavior but could not adjudicate the full regression suite from inside the protected verifier's own writable repository sandbox

## Context

Harness grants `evaluator-verify` repository write capability because the role must commit its public verification record. The registered Claude adapter therefore launches the verifier with the public repository and evaluator-private workspace inside Claude's enforced sandbox.

One existing containment regression exercises a nested provider sandbox and depends on observing its write boundary from an environment that does not already grant the same repository write access. Inside the protected verifier, the parent sandbox's legitimate repository-write grant makes that environmental premise false. The product cases pass, but the verifier cannot fairly adjudicate the regression from that execution context.

014f attempts 001 and 002 both finalized `BLOCKED / INFRASTRUCTURE_FAILURE`. They, candidate `a2ed538330ace7a51b9585dcba404035c72c973f`, and evaluator revision `001` are immutable inputs to this successor. This spike must not revise or reinterpret them.

014g verification attempt 003, committed at `a5819dc`, subsequently finalized
`BLOCKED / SPECIFICATION_AMBIGUITY`. It established that this brief and the
original Design Map did not distinguish the trusted methodology authority that
adjudicates a methodology candidate from the reduced verifier composition being
tested as candidate behavior. Attempt 003, evaluator revision `001`, attempts
001–003, candidate `651352329cca473fb920139e1496f9f508eeabbb`, and the
candidate-subject fixture evidence committed at `27af3a8` are immutable recovery
inputs. This revision records the human authority clarification triggered by
attempt 003; it does not retrofit that clarification into revision `001`.

## Authority model clarification

Trusted methodology N remains the independent authority that verifies candidate
methodology N+1. N+1 must not govern the decision to trust itself, even when its
proposed authority is strictly narrower than N.

- Authoritative verification of the 014g candidate runs under the exact trusted
  N verifier role, skill, contract and methodology authority.
- N+1's proposed verifier composition is exercised separately as a bounded
  candidate subject. That execution must demonstrate the actual candidate-defined
  workspace exposure, capabilities, host actions and required behavior.
- Candidate-subject execution cannot emit the authoritative N to N+1 result,
  establish methodology trust, replace the trusted-N evaluator, or advance the
  real 014g workflow.
- No candidate-defined capability or contract expands or alters trusted N while
  N evaluates the candidate.
- Only after independent verification, human acceptance and ordinary methodology
  promotion do later Workflow Grants resolve N+1's reduced verifier composition.
  That post-promotion observation establishes the authority cutover and is not
  backdated into this verification.

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

If host-mediated mutation is selected, the evaluator must still author or explicitly bind the exact evidence bytes and destination it is requesting. The host may enforce and perform the mutation or commit, but must not infer substantive evaluator output, manufacture verification evidence, or expose a general arbitrary-file mutation API.

## Required behavior

1. A protected verifier can read the exact public repository and evaluator-private workspace and cannot read arbitrary home, sibling-project, credential, or unrelated temporary paths.
2. Only explicitly granted public/evaluator paths are writable; no repair broadens Claude's filesystem access globally.
3. Verifier evidence mutation remains attributable to the allocated role or a bounded host action. Provider prose and ambient filesystem access confer no authority.
4. The existing 014e containment regression runs unchanged through the bounded candidate-subject verifier composition, while the trusted-N evaluator independently binds and adjudicates that subject evidence without weakening, skipping, rewriting, or changing the regression's security assertion.
5. The repair does not special-case Spike 014f, its candidate, its evaluator, or any Stockdif state.
6. Existing governed execution, private-workspace isolation, promotion, containment, nested-sandbox, and executor-selection regressions remain green.
7. After independent acceptance of this repair, Harness reruns 014f verification against unchanged candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and unchanged evaluator revision `001`, preserving attempts 001 and 002 and allocating a new attempt.
8. At freeze, record the exact repository path and committed identity of the containment regression whose assertion must remain unchanged. AC03 refers to those frozen bytes, not merely a test name or equivalent replacement.
9. Evaluation evidence distinguishes authoritative observations made under trusted N from bounded candidate-subject observations made under N+1's proposed composition, and binds both to the exact candidate, candidate methodology composition, runtime and observed behavior.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01** | Protected verifier access is confined to the exact granted public and evaluator-private workspaces, with home, sibling, credential and unrelated temporary paths still denied. |
| **AC02** | Authorized verifier evidence can be written and committed through only the workspace/capability surface required by the selected design, without granting write authority to unrelated repository paths or host filesystem locations.|
| **AC03** | The existing nested-containment regression passes unchanged when executed through the bounded candidate-subject verifier using N+1's proposed workspace/capability composition; trusted N independently establishes the exact candidate, composition, runtime, execution result and unchanged regression identity before using that evidence. The subject cannot author the authoritative verification result. |
| **AC04** | The implementation is generic and contains no workflow-, spike-, candidate-, provider-fixture-, or Stockdif-specific exception. |
| **AC05** | Existing governed execution, private exposure, promotion, containment, nested-sandbox and executor-selection regressions remain green. |
| **AC06** | Effective executor/workspace permissions remain explicit, inspectable and fail closed when the host cannot enforce the selected composition. |
| **AC07** | 014f can subsequently allocate verification against candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and evaluator revision `001` without modifying its frozen authority or prior attempts. |
| **AC08** | Authoritative 014g verification runs under unchanged trusted N authority and clearly separates trusted-N evidence from candidate-subject evidence. N+1 cannot advance 014g, certify itself or establish trust; a later ordinary grant uses the reduced composition only after human acceptance and methodology promotion. |

## Non-goals

- Weakening, skipping or reinterpreting the existing containment regression.
- Changing 014f acceptance criterion AC07.
- Editing the 014f candidate, evaluator revision, or attempts 001/002.
- Broadening Claude access to the operator home, arbitrary siblings, credentials, or all of `/tmp`.
- Adding an 014f- or Stockdif-specific exception.
- Resuming or mutating Stockdif.
- Changing provider/model policy except where a frozen Design Map proves it necessary for the selected containment composition.
- Making candidate N+1 the governing authority for its own verification.
- Retrofitting the clarified authority model into evaluator revision `001` or attempts 001–003.

## Handoff

Run a new Brief Readiness, Design Map and evaluator preparation revision under
trusted N. The evaluator must distinguish authoritative trusted-N evidence from
candidate-subject evidence. Existing candidate-subject evidence at `27af3a8`
may be reused only if the evaluator independently establishes that it binds the
exact candidate, proposed composition, runtime and required observations;
otherwise rerun only the smallest bounded subject fixture needed. Do not repeat
provider work merely for freshness.

Do not change candidate `651352329cca473fb920139e1496f9f508eeabbb` solely for
this clarification. If the clarified contract exposes an implementation defect,
use the ordinary implementation-correction path. After a trusted-N PASS, perform
eligible evidence promotion and As-Built, then stop at human acceptance. Do not
promote N+1 or return to 014f until explicit human acceptance and the ordinary
methodology-trust transition are complete.
