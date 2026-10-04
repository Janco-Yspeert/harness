# Spike 014g — Verifier Containment Composition

**Status:** Forward specification-recovery draft for Brief Readiness; prior frozen revisions `sha256:52f1c9fc1164c3fa269d1a009e942cc00202e89fcf96e8ffb4228a519fa3a676` and `sha256:c54324b00dd8fa4c54d8f567046e36fe2558cf2b5c14bc2b8edffe4ee2644759` preserved

**Depends on:** Spike 014f candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and its preserved evaluator revision `001`; accepted Spikes 014h and 014i

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

014g attempt 008 later finalized exact candidate
`e8428205a58a1c12d6f17d9a80a160b78c754cb9` as
`FAIL / IMPLEMENTATION_FAILURE` under evaluator revision `002`. Its result and
all prior attempts remain immutable. The committed human authority in
`specification-revision-authority.md` establishes that attempt 008 applied one
obsolete mechanism-specific assertion: accepted Spike 014h moved the relevant
security boundary from adapter/provider metadata and a special
`planLaunch(...contained...)` condition into mandatory host-owned containment
for every spawned registered-adapter launch. This forward revision replaces
only that assertion. It neither rewrites attempt 008 nor waives the underlying
containment invariant.

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
4. Every still-valid regression from the frozen 014e set runs unchanged through the bounded candidate-subject verifier composition. The single superseded 014e D4 assertion that adapter/provider metadata or a special `planLaunch(...contained...)` condition must cause launch refusal is replaced by the accepted 014h host-owned-containment behavior and corresponding regressions. Trusted N independently binds and adjudicates that subject evidence without weakening the security assertion.
5. The repair does not special-case Spike 014f, its candidate, its evaluator, or any Stockdif state.
6. Existing governed execution, private-workspace isolation, promotion, containment, nested-sandbox, and executor-selection regressions remain green. The revised SC1 regression composition is executed and adjudicated only through the candidate-subject evidence required by AC03; trusted N runs and adjudicates the remainder of the required regression suite. If trusted N also encounters that composition under its broader parent authority, it records it as not adjudicated in that context and binds the candidate-subject result instead. It must not count the trusted-N environmental result as either a pass or an implementation failure.
7. As a non-gating post-acceptance handoff, Harness reruns 014f verification against unchanged candidate `a2ed538330ace7a51b9585dcba404035c72c973f` and unchanged evaluator revision `001`, preserving attempts 001 and 002 and allocating a new attempt.
8. The prior frozen regression identity remains historical: every `014e` test in `test/external-project.test.ts` at git blob `4b361f81e307e129be6d106c9df9a4910e674be9` (commit `a36fd6e`). The successor Design Map must define a revised SC1 that preserves every still-valid test block from that blob byte-for-byte, excludes only the superseded mechanism-specific D4 block, and adds the accepted 014h equivalent behavior from `test/external-project.test.ts` blob `74a51d545681532ac4c49ac9034712ee3217974d` and `test/host-fs-isolation.test.ts` blob `b9c135790860a87e76afdfb458a7b0758d129704` at accepted 014h candidate `dee86d2314bffa7cc2da0d8ac72004250a06debb`. Exact C2 contains those same two 014h blobs. No other frozen 014e assertion may be removed, rewritten, or weakened.
9. Evaluation evidence distinguishes authoritative observations made under trusted N from bounded candidate-subject observations made under N+1's proposed composition, and binds both to the exact candidate, candidate methodology composition, runtime and observed behavior.

## Acceptance criteria

| ID | Mandatory acceptance |
| --- | --- |
| **AC01** | Every spawned registered-adapter worker is launched under mandatory host-owned containment derived from its Role Grant. Granted workspaces retain their declared read/write modes; real home, arbitrary siblings, the Harness checkout, credentials and unrelated temporary paths remain inaccessible. Host-created scratch, synthetic HOME and sibling topology are not exposure by their existence: evaluation must distinguish host-created topology from paths actually visible or writable to the subject and from host-side before/after evidence. |
| **AC02** | Authorized verifier evidence can be written and committed through only the workspace/capability surface required by the selected design, without granting write authority to unrelated repository paths or host filesystem locations. |
| **AC03** | The revised SC1 composition passes when executed through the bounded candidate-subject verifier using N+1's proposed workspace/capability composition: every still-valid frozen 014e block is unchanged, and only the superseded metadata/`planLaunch(...contained...)` refusal block is replaced by the accepted 014h regressions proving mandatory host-owned containment, preserved workspace modes, denial of real-home/sibling/checkout/credential/unrelated-temporary access, fail-closed refusal when containment is unavailable or unenforceable, and provider `privateWorkspace` metadata is not the security authority. Trusted N independently establishes the exact candidate, composition, runtime, execution result and regression identities before using that evidence. The subject cannot author the authoritative verification result. |
| **AC04** | The implementation is generic and contains no workflow-, spike-, candidate-, provider-fixture-, or Stockdif-specific exception. |
| **AC05** | Trusted N independently runs and adjudicates the required regression suite other than the revised SC1 composition; that composition is executed and adjudicated through the exact candidate-subject evidence required by AC03. Any such result observed under trusted N's broader parent authority is explicitly not adjudicated and is neither counted as a pass nor treated as an implementation failure. |
| **AC06** | Effective executor/workspace permissions remain explicit and inspectable. Mandatory host-owned containment fails closed before launch when unavailable or unenforceable; there is no uncontained registered-adapter fallback and provider `privateWorkspace` metadata is not treated as filesystem-security authority. |
| **AC07** | The repair does not modify 014f candidate `a2ed538330ace7a51b9585dcba404035c72c973f`, evaluator revision `001`, attempts 001/002 or their frozen authority. The later 014f rerun is a non-gating post-acceptance handoff. |
| **AC08** | Authoritative 014g verification runs under unchanged trusted N authority and clearly separates trusted-N evidence from candidate-subject evidence. N+1 cannot advance 014g, certify itself or establish trust. The later ordinary-grant observation after human acceptance and methodology promotion is a non-gating handoff condition, not evidence backdated into this verdict. |

## Non-goals

- Weakening, skipping or reinterpreting any still-valid frozen 014e regression or the accepted 014h containment invariant.
- Changing 014f acceptance criterion AC07.
- Editing the 014f candidate, evaluator revision, or attempts 001/002.
- Broadening Claude access to the operator home, arbitrary siblings, credentials, or all of `/tmp`.
- Adding an 014f- or Stockdif-specific exception.
- Resuming or mutating Stockdif.
- Changing provider/model policy except where a frozen Design Map proves it necessary for the selected containment composition.
- Making candidate N+1 the governing authority for its own verification.
- Retrofitting the clarified authority model into evaluator revision `001` or attempts 001–003.

## Handoff

Run a new Brief Readiness, Design Map and successor evaluator preparation under
trusted N. Preserve evaluator revisions `001` and `002`. The successor evaluator
must correct the two defects established by attempt 008: its containment oracle
must distinguish host-created topology, subject-visible paths, subject-writable
paths and host-side before/after evidence; its lineage checks must bind the
legitimate current recovery brief and Design Map rather than the pre-recovery
base. Neither correction may loosen the actual containment oracle or change
acceptance semantics beyond this recorded authority.

The evaluator must continue to distinguish authoritative trusted-N evidence
from candidate-subject evidence. Existing C2 candidate-subject evidence may be
reused only where the successor evaluator independently establishes that its
candidate, composition, runtime, fixture and observations remain valid for the
revised requirement. If AC03 needs fresh evidence, rerun only the smallest
bounded subject fixture required for exact candidate
`e8428205a58a1c12d6f17d9a80a160b78c754cb9`.

Do not change C2 solely for this specification recovery. Create a new candidate
only if independent evaluation establishes a genuine C2 implementation defect.
Do not change model-selection or model-attestation semantics. After a trusted-N
PASS, perform eligible evidence promotion and As-Built, then stop at human
acceptance. Do not promote N+1 or return to 014f until explicit human acceptance
and the ordinary methodology-trust transition are complete.
