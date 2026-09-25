# 014d extension seams (§5, §6, §8)

These are small documented seams. None is a framework, and no 014d role
consumes them.

## Optional roles (§5, AC11)

- `src/methodology-evolution.ts` has no fixed role-name allowlist.
  `checkMethodology` derives the configured role set from the candidate policy
  and manifest, and requires the two to match.
- Every configured role must pass the generic coherence check
  (`ROLE_COHERENCE`): workspaces, results, an eligibility condition, and routed
  outcome transitions.
- A declared `promotion` or `publication` action must have a host-mediated
  contract action (`HOST_ACTION`).
- Isolation is declarative. A `protected` contract is an evaluator-private role
  and must hold the `evaluation` workspace; every other role must forbid
  `evaluator-private`.
- Core-role invariants (for example implementation retry feedback) apply only
  when those roles are configured.
- `diffMethodologies` reports `roles.added` and `roles.removed`.
- Proof: `test/methodology-evolution.test.ts` › "a ninth optional public role is
  derived from policy, checked and diffed without becoming trusted". It covers
  `candidate`, `check` and `diff` on a disposable nine-role candidate. It also
  confirms that new bindings stay on N, the trusted history is unchanged, the
  eight-role methodology stays coherent, and an optional role cannot hold
  private exposure. The eight-role workflow itself runs end to end in
  `test/skill-fidelity.test.ts`.

## Public-safe regression recommendations (§6)

- A terminal public `verification-result.json` may carry
  `regressionRecommendations`: a list of public-safe entries. Each names:
  - the public requirement (for example an AC id);
  - the observed behaviour class;
  - the ordinary regression test worth maintaining.
- Recommendations never contain hidden test bytes, private fixtures, case
  names, oracle or timing strategy, or grader logic. This is defined in the
  evaluator skill, "Public regression recommendations".
- A later, separately granted public implementation or review role may write
  an ordinary maintained test from a recommendation. No role of the evaluated
  cycle consumes them, and implementation never receives evaluator-private
  mechanics.
- Publishing exact hidden test bytes needs a separate, explicit human
  disclosure decision. `PASS` never implies it.
- The evaluator-evidence `promotion` action stays a narrow, byte-preserving
  archive and is not a publishing tool.
- A future optional role such as a regression curator is introduced through
  normal N → N+1 evolution, using the optional-role seam above.

## Stable context and a future shared public context (§8, AC12, C9)

- `workerInstructions(assignment)` in `src/executors/governed.ts` still returns
  `{ system, prompt }`. It is built from `workerContext(assignment)`, which has
  two parts:
  - `stable`: the role line, the complete worker-protocol rules with every
    operation name, the pinned skill bytes, and the pinned contract as compact
    `JSON.stringify`;
  - `volatile`: execution, workflow, Role Grant, methodology binding and
    input identities, all placed after the stable prefix.
- Two executions of the same pinned role therefore share a byte-identical
  stable prefix. Pinned-assignment validation is unchanged.
- Workers read detailed artifacts just in time through `assignment` and their
  granted workspaces; the prompt does not inline them.
- Proof: `test/worker-context.test.ts`.
- **Future shared-public-context seam (not implemented).** Successive
  compatible public roles could reuse one provider context whose leading
  bytes are the shared stable material. Even then, each role still receives:
  - its own new Role Grant;
  - its pinned skill and contract, appended as a new stable block;
  - its bound inputs;
  - its own `submitResult`;
  - its own host-action authority.

  A context lineage that has seen `evaluator-private` material is tainted and
  must never be reused by a public role. If reuse is added, it must record
  context provenance (the lineage of execution ids and exposures). An executor
  session and a model conversation are separate objects, and neither carries
  authority.
- No token, cache, billing or quota measurement is claimed. That work is
  deferred to 015.
