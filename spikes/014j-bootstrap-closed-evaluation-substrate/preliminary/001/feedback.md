# Brief Readiness — Spike 014j

## Review basis

Reviewed the exact draft `spikes/014j-bootstrap-closed-evaluation-substrate/spike.md` at `sha256:dbd2b3bb22afeb6201e02d9b1c27eaef78987e7a3e0be5df94c0ad0013c0bf3e` against `AGENTS.md`, `GOALS.md`, the accepted public Outcomes and As-Built records for Spikes 014h and 014i, the 014g successor authority, the current public evaluator contracts, and the relevant candidate-subject and executor/runtime implementation and visible tests.

The bootstrap-closure requirement is explicit and testable in principle: AC01 and the required deterministic evidence prohibit using 014j-introduced authority to prove 014j. The accepted 014h containment and 014i reconstruction/capture substrate make the proposed implementation feasible through ordinary deterministic tests and inspection under trusted N. The following unresolved contract decisions nevertheless prevent freeze.

## Findings

### Blocker 1 — Confidential evidence residence and release are unresolved

The draft permits exact evaluator-private procedure material as a host-owned input (`spikes/014j-bootstrap-closed-evaluation-substrate/spike.md:188`), requires raw subject output and worker-tool activity in the sealed evidence (`spikes/014j-bootstrap-closed-evaluation-substrate/spike.md:220`), permits the evidence to be committed or published into the public repository (`spikes/014j-bootstrap-closed-evaluation-substrate/spike.md:246`), and requires later trusted-N inspectability through already-held authority (`spikes/014j-bootstrap-closed-evaluation-substrate/spike.md:261`). It does not decide which bytes remain evaluator-private, where the sealed bundle and canonical record reside before a PASS, or how trusted N receives their exact identity without public disclosure.

That omission conflicts with the repository rule that private evaluator artifacts remain outside the public repository and that private evaluator detail may become public only through promotion after a successful evaluator result (`AGENTS.md:173`, `AGENTS.md:211`). It also leaves the host-broker obligation to expose only permitted information unresolved (`GOALS.md:239`). The current evaluator contract already has an evaluator-private workspace as well as repository read/git-inspect authority (`methodologies/harness/contracts/evaluator-verify.json`), while the carried-forward, unaccepted host path currently copies a frozen-subject bundle beneath the public workflow directory (`src/kernel/host.ts:188`). Freezing the draft would therefore allow materially different implementations: one could publish raw private procedure-derived evidence before PASS, while another could retain it privately but lack the promised cross-workflow binding and inspection path.

Smallest clarification required: define the pre-PASS residence, identity, retention, and trusted-N delivery path for the sealed bundle and canonical record. State explicitly that evaluator-private procedure/input bytes and any derived private output cannot enter the public repository before the existing successful-result promotion/release boundary; if only a public-safe projection may be committed earlier, define its required contents and relationship to the private sealed bundle. AC06, AC07, and deterministic evidence items 9, 12, 13, and 15 should cover that choice.

### Blocker 2 — Non-exact selector compatibility has no defined failure rule

The draft correctly separates executor profile, provider launch selector/family, concrete provider attestation, and exact concrete-model constraint (`spikes/014j-bootstrap-closed-evaluation-substrate/spike.md:296`). It says a selector such as `sonnet` may attest as `claude-sonnet-5-5`, prohibits a hard-coded alias table, and requires “compatible” selector/attestation behavior in AC09. It does not define whether a non-exact selector is merely a provider-facing request whose concrete attestation is always recorded without comparison, or a family constraint whose membership the adapter must validate. It also leaves implicit which existing public field supplies the launch selector and which supplies the explicit exact constraint.

This changes observable launch and result behavior. Today `ExecutorProfile.model` and `RoleGrant.executorConstraints.model` are both strings (`src/kernel/model.ts:304`, `src/kernel/model.ts:380`); launch planning treats the grant value as an exact override of the profile value (`src/executors/adapters.ts:561`), and the governed runner literally compares provider attestation with the grant value (`src/executors/governed.ts:563`). Without a contract decision, conforming implementations could accept an unrelated concrete attestation, reject it through an undocumented provider-specific family rule, or disagree over whether an existing profile value is exact. Those outcomes are not equivalent and cannot be evaluated fairly by AC08–AC11.

Smallest clarification required: state the semantic mapping for existing profile and grant fields (or require their replacement), the precedence between a profile selector and an explicit exact constraint, and the non-exact mismatch rule. If selectors are request-only, say that no selector-to-attestation membership check occurs and attestation is provenance only. If family membership must be enforced, define the generic adapter-owned compatibility contract and fail-closed behavior without an alias table.

## Review limitations

- Evaluator-private `eval-spec.md`, `.hidden-test/**`, and `.eval/**` material was not read or searched.
- Workflow ledgers were not inspected.
- This was a contract/readiness review; no implementation, Design Map, evaluator preparation, or evaluation was performed.
- The working tree already contained unrelated modified and untracked files; they were not changed or included in this checkpoint.

## Files changed

- `spikes/014j-bootstrap-closed-evaluation-substrate/feedback.md`
- `spikes/014j-bootstrap-closed-evaluation-substrate/preliminary/001/spike.md`
- `spikes/014j-bootstrap-closed-evaluation-substrate/preliminary/001/feedback.md`
- `spikes/014j-bootstrap-closed-evaluation-substrate/manifest.md`

## Checks run

- Verified the bound draft SHA-256 identity.
- Read the complete 527-line draft.
- Confirmed the referenced 014h, 014i, 014g C4, and successor-authority Git objects exist.
- Inspected the accepted public 014h/014i Outcomes, 014i As-Built, 014g successor authority, public contracts, implementation seams, and visible tests relevant to feasibility and the findings.
- Reviewed the checkpoint file set and verified the preliminary draft is byte-identical to the reviewed live draft; the exact snapshot retains four Markdown hard-break trailing-space lines from the input.
- No test suite was run because no product code was changed and the verdict turns on unresolved frozen-contract decisions.

**Not ready to freeze**
