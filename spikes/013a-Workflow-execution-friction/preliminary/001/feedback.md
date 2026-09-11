# Brief Readiness — Spike 013a

## Verdict

The proposed brief is not ready to become a frozen implementation contract.

It correctly identifies a real and rather nasty boundary: a host-owned
provider process completing is neither proof that the allocated methodology
role ran nor a licence to advance authority. It also keeps the predecessor
spikes and the narrow bootstrap exception properly in scope. But the three
gaps below leave the protected-authority boundary, semantic completion source,
and mandatory live-provider proof to later roles. That would make both
implementation and independent evaluation depend on decisions that the frozen
brief has not made.

## Findings

### Blocker 1 — A “valid Harness evaluator-role allocation” has no defined issuer or verification boundary

The brief requires that a protected evaluator role run only through explicit
human invocation or a “mechanically valid Harness evaluator-role allocation”
while rejecting authority conferred by prompt wording (`spike.md`,
“Delegated protected-role authority”; AC04–AC07). It deliberately leaves the
mechanism to the Design Map, which is appropriate, but it never states what
durable authority is entitled to issue the delegation, what record binds it to
the role/attempt/contract, or which host component validates it before the
provider is launched.

Current repository evidence makes this material rather than theoretical:
`src/workflow-run.ts` accepts a caller-provided workflow-run role, executor,
permission profile, and optional skill fields; `tools/workflow.ts` currently
constructs those fields at dispatch time. The existing special pinned
verification authority is limited to Spike 012 and is not a general
evaluator-role authority. Treating any request reaching `POST /workflow-runs`
as the allocation authority would make AC04/AC07 dependent on who can make a
localhost request; requiring a capability or canonical-authority binding would
produce a different public security and failure contract.

Smallest clarification: state the required authority source and minimum
binding/validation property. For example, say whether delegated evaluator
authority must be derived from a named canonical authority transition and bind
the target workflow, phase, methodology attempt, contract identity and executor
before host launch; also state whether the bootstrap allocation is validated by
that same boundary. The serialization, token/capability format, and adapter
details can remain Design Map freedom.

### Blocker 2 — Semantic role completion has no authoritative producer or acceptance rule

AC12–AC15 require a machine-readable role disposition distinct from process
exit, and the brief says provider prose is diagnostic rather than authority
(`spike.md`, “Process lifecycle versus role disposition” and “Deterministic
skill and contract binding”). It does not specify what may assert semantic
completion, how Harness verifies that assertion against the allocated
role/contract/attempt, or the minimum terminal evidence that permits workflow
advancement.

That omission cannot be filled by the role-disposition enum, which the brief
quite reasonably leaves open. Today `src/workflow-run.ts` derives its terminal
`completed` disposition directly from `WorkflowRunExitOutcome.ok`, and
`tools/workflow.ts` records a phase outcome separately. Possible successor
designs therefore have materially different authority boundaries: an
untrusted provider-produced marker, a Harness-validated signed/result record,
or an operator-created authority event. Only one of those can satisfy the
brief’s rejection of provider claims as authority, and they have different
failure and recovery behaviour.

Smallest clarification: define the trusted class of role-result evidence and
the minimum binding it must carry (at least allocated run/role/attempt and
resolved contract authority), and state which validated terminal dispositions
may unlock the corresponding canonical transition. Keep result schema and
transport open.

### Blocker 3 — Required real Claude/Codex evidence has no bounded, reproducible governed scenario

The brief makes real Claude, real Codex, and a real host-boundary run mandatory
(`spike.md`, “Evidence requirements”; AC08–AC10 and AC32–AC34). It does not
name the bounded role invocation(s), the repository-visible success artifact
or outcome expected from each, the required executor/private-workspace setup,
or the handling when a provider is unavailable. The identified production
exercise—Spike 011 Cycle 002—is expressly deferred until *after* Spike 013a
acceptance (`spike.md`, “Spike 011 recovery” and AC34), so it cannot serve as
the acceptance run for this spike.

The repository confirms why this matters: `skills/evaluator/SKILL.md` requires
an evaluator session to access the sibling hidden workspace, while the current
runner chooses the evaluator permission profile only when
`HARNESS_EVALUATOR_WORKSPACE` is supplied (`tools/workflow.ts`). An evaluator
would otherwise have to select a role, fixture, credentials, permitted side
effects, and an availability exception after freeze. That is not merely test
plumbing; it determines whether AC08/AC09 prove protected delegation or just a
provider happened to comply with a prompt.

Smallest clarification: reserve a concrete bounded live-run scenario for each
provider (or one scenario with provider-specific variants), name its legal
authority source, required workspace/access prerequisites, and the
repository-visible role-result evidence. State the terminal handling if the
required provider cannot be reached or authenticated, rather than silently
downgrading mandatory real-provider evidence to mocks.

## Repository evidence inspected

- `spikes/013a-Workflow-execution-friction/spike.md`
- `AGENTS.md` and `GOALS.md`
- `skills/brief-readiness/SKILL.md` (contract v3) and `skills/evaluator/SKILL.md`
  (contract v11)
- `tools/workflow.ts`, `src/workflow-run.ts`, `src/workflow-backend.ts`, and
  `src/index.ts`
- `test/workflow.test.ts` and `test/workflow-run.integration.test.ts`
- public Spike 011, Spike 012, and blocked Spike 013 workflow records relevant
  to delegated execution, pinned evaluator authority, and runner-state
  adoption

## Checks

- Reviewed the complete proposed brief, including AC01–AC34, bootstrap
  exceptions, evidence requirements, non-goals, and completion boundary.
- Inspected the relevant public workflow authority, runner, host-run, backend,
  permission, and visible-test surfaces.
- Did not inspect evaluator-private material.

## Limitations

This is a contract-readiness review. No Design Map, evaluator preparation,
implementation, provider execution, or verification was performed.

**Not ready to freeze**
