# Design Map — 014g Verifier Containment Composition

Bound brief: `spike.md`
(`sha256:a0fbd91a0e41eed3c2e54e7450ab1e25400f71add68b0f02e10f54bc05629559`).
This map supersedes the maps bound to the two prior frozen brief revisions; it
does not revise their artifacts or results.

## Shared contracts

**SC1 — Revised regression composition.** The candidate-subject SC1 corpus is
defined by these committed blobs:

- From `test/external-project.test.ts` blob
  `4b361f81e307e129be6d106c9df9a4910e674be9` at commit `a36fd6e`, include
  byte-for-byte every test block whose title begins `014e` except the single
  block titled `014e D4: containment makes forbidden-exposure grants eligible
  for every adapter only when enforced`.
- From `test/external-project.test.ts` blob
  `74a51d545681532ac4c49ac9034712ee3217974d` at accepted 014h candidate
  `dee86d2314bffa7cc2da0d8ac72004250a06debb`, include the test block titled
  `014h AC10: privateWorkspace metadata no longer decides forbidden-exposure
  launch eligibility` byte-for-byte.
- From `test/host-fs-isolation.test.ts` blob
  `b9c135790860a87e76afdfb458a7b0758d129704` at that same accepted candidate,
  include byte-for-byte every test block whose title begins `014h`.

The excluded block is the whole and only superseded assertion: it makes
adapter/provider metadata and a special `planLaunch(...contained...)` condition
the security authority. The added blocks replace it with accepted 014h behavior:
host-owned containment is mandatory for every spawned registered-adapter
launch, preserves each granted workspace mode, denies real home, sibling,
Harness checkout, credential and unrelated temporary access, and refuses launch
when containment is unavailable or cannot safely represent the grant. The
candidate-subject fixture must bind the complete two accepted-014h source blobs
above as well as the historical 014e blob, so trusted N can recompute both the
selection and the unchanged-block claim. Every selected block must execute; a
skip, omission, rewrite or duplicate execution does not satisfy SC1.

**SC2 — Candidate-subject evidence boundary.** Revised SC1 runs as a command
inside a bounded, non-authoritative candidate subject reconstructed from the
exact committed N+1 candidate. Its effective N+1 role contract, skill,
capabilities, host actions and workspace modes are part of the captured subject
evidence. Host-side capture binds the exact candidate, candidate methodology,
runtime, three SC1 blobs, command, raw streams, worker-tool exchanges, process
result and before/after filesystem observations. The subject may report only an
observation; it cannot create the authoritative 014g result, establish trust,
promote a methodology or advance the real workflow.

Trusted N independently validates that binding and adjudicates the subject
evidence. Trusted N runs the rest of the required regression suite under its
unchanged authority. If its broader parent permissions also encounter revised
SC1, that environmental result is explicitly not adjudicated and counts as
neither pass nor implementation failure.

**SC3 — Proposed verifier composition under test.** N+1's
`evaluator-verify` composition has a read-only public repository workspace, the
required writable evaluator-private workspace, and only
`repository-read`, `local-computation` and `git-inspect` repository
capabilities. It has neither `repository-write` nor `git-commit`. Its only
public mutation authority is an explicitly granted evidence host action whose
destination allowlist is contract data. The Role Grant remains the inspectable
record of these effective permissions.

**SC4 — Host-mediated evidence mutation.** For an evidence action, the allocated
worker supplies every complete destination path and exact content byte. The
host validates the request against the Role Grant and contract allowlist, writes
and commits only those bytes, and records attribution and content identities.
Provider prose and ambient filesystem access grant nothing. A denied or failed
request writes and commits nothing. The host does not infer, complete or
manufacture evaluator content, and the action is not a general file-mutation
surface. A candidate subject receives only disposable evidence destinations and
never an authoritative result, workflow-state or trust destination.

**SC5 — Universal launch containment.** Every spawned registered-adapter worker,
including trusted N and the candidate subject, crosses the accepted 014h
host-owned containment boundary derived from its own Role Grant. Workspace
mount modes are enforced independently of adapter `privateWorkspace` metadata
or provider sandbox claims. An unrepresentable grant, unavailable containment,
or unenforceable nested sandbox is refused before provider launch, with no
uncontained fallback. Host-created scratch, synthetic HOME and mount topology
are not exposure; observations must distinguish their existence from paths
visible or writable to the subject and from host-side before/after evidence.

## Design decisions

- **Selected mutation shape: bounded host-mediated mutation (shape 2).** It lets
  the verifier author attributable public evidence while its repository remains
  read-only. Accepted 014h universal host containment supplies the uncontaminated
  parent boundary, and accepted 014i candidate-subject execution supplies the
  non-authoritative N+1 observation boundary. These are one composition, not
  alternative sources of authority.
- **No narrower recording role (shape 1).** A second role adds a transition and
  another authority handoff without improving byte authorship, destination
  validation or containment.
- **No additional conditional sandbox mode (shape 3).** Universal host-owned
  containment already enforces exact workspace access for every registered
  adapter. Making it conditional on the role, adapter metadata or this spike
  would restore the superseded mechanism. Containment alone also cannot commit
  verifier-authored public evidence from a read-only repository, so it does not
  replace shape 2.
- **Generic composition.** Contracts and Role Grants determine workspaces,
  capabilities, host-action destinations and containment. No workflow, spike,
  candidate, fixture provider or Stockdif identity participates in the product
  decision.

## Invariants

- Trusted N remains the sole authority for the 014g verdict. N+1 never governs
  the decision to trust itself, and later acceptance or methodology promotion
  is not backdated into verification.
- Filesystem visibility and mutation never exceed exact granted workspaces,
  scratch and bounded host actions. The operator home, arbitrary siblings,
  Harness checkout, credentials and unrelated temporary paths remain outside
  the subject boundary.
- Public evidence remains attributable to the allocated execution and exact
  bytes. Candidate-subject evidence remains visibly non-authoritative and
  separate from the trusted-N result.
- Every still-valid historical 014e test block is preserved byte-for-byte;
  only the SC1-named obsolete block is excluded, and the exact accepted 014h
  replacements are added.
- Existing governed execution, private-workspace isolation, promotion,
  containment, nested-sandbox and executor-selection behavior remains intact.
  Effective permissions stay explicit, inspectable and fail closed.
- Candidate `e8428205a58a1c12d6f17d9a80a160b78c754cb9`, all prior 014g attempts and
  evaluator revisions, and the 014f candidate, evaluator revision and attempts
  remain immutable. The 014f rerun is a non-gating post-acceptance handoff.

## Implementation freedom

- The fixture packaging and runner mechanics, provided the three SC1 blob
  identities, exact block selection, execution completeness and raw evidence
  are independently checkable.
- The internal representation of evidence-action allowlists and host records,
  provided the contract and Role Grant remain the authority and denial is
  atomic.
- The host's staging, commit-author and commit-message mechanics, provided only
  the worker-authored allowlisted bytes are committed and attribution is
  preserved.
- The internal containment construction and provider invocation details,
  provided the universal host boundary, exact workspace modes, visibility
  denials and pre-launch refusal remain externally demonstrable.
