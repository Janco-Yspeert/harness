# Brief Readiness — Spike 013a

## Verdict

The revised brief is ready to become a frozen implementation contract.

The prior authority-boundary gap is resolved: delegated evaluator execution
must derive from canonical workflow authority, be validated before launch, and
retain an inspectable binding to the workflow, role, methodology
attempt/correction cycle, contract authority, and executor. A caller reaching
the local workflow-run endpoint is explicitly not an authority source.

The prior semantic-completion gap is also resolved. A successful methodology
role now requires a Harness-validated result bound to the allocated run, role,
attempt/cycle, and resolved contract authority. Provider output and a normal
process exit may be evidence, but cannot themselves advance workflow
authority.

Finally, the mandatory provider evidence is bounded before implementation.
The brief reserves separate real Claude protected-evaluator and real Codex
contract-delivery scenarios, defines their legal-authority and observability
properties, requires scenario prerequisites to be fixed before evaluator
preparation, and treats an unavailable required provider as blocked rather
than quietly replacing live evidence with mocks. The specific fixture and
transport remain legitimate Design Map decisions; they do not alter the
frozen authority, success, or failure contract.

The retry bootstrap is suitably narrow. It permits only a fresh host-owned run
for a canonically still-pending pre-freeze role after a durably recorded
non-successful execution, requires reference to that prior execution, and
forbids manufactured or rewritten runner history. It is an explicit bridge to
the feature being built, not a back door dressed as a convenience flag.

## Findings

No blockers, material clarifications, or editorial findings.

## Repository evidence inspected

- `spikes/013a-Workflow-execution-friction/spike.md`
- `spikes/013a-Workflow-execution-friction/feedback.md` and
  `spikes/013a-Workflow-execution-friction/preliminary/001/`
- `spikes/013a-Workflow-execution-friction/.workflow/state.json`
- `AGENTS.md` and `GOALS.md`
- `skills/brief-readiness/SKILL.md` (contract v3) and
  `skills/evaluator/SKILL.md` (contract v11)
- `tools/workflow.ts`, `src/workflow-run.ts`, `src/workflow-backend.ts`, and
  `src/index.ts`
- `test/workflow.test.ts` and `test/workflow-run.integration.test.ts`
- public Spike 011, Spike 012, and blocked Spike 013 workflow history relevant
  to protected delegated execution, evaluator bootstrap authority, state
  adoption, and correction-cycle recovery

## Checks

- Reviewed the complete revised brief, including AC01–AC35, provider evidence,
  bootstrap exceptions, non-goals, and completion boundary.
- Compared the revision against the immutable `preliminary/001` reviewed draft
  and verified that it resolves each prior blocker without broadening the
  stated non-goals.
- Inspected the relevant public workflow authority, runner, host-run, backend,
  permission, and visible-test surfaces.
- Ran `git diff --check` successfully.
- Attempted read-only inspection of the prior host-owned run at
  `http://127.0.0.1:3000`; no host was reachable in this environment. The
  durable local record identifies its run ID and blocked outcome, and no
  operational history was modified.
- Did not inspect evaluator-private material.

## Limitations

This is a contract-readiness review. No freeze, Design Map, evaluator
preparation, implementation, provider execution, or verification was
performed. The current checkout has no runnable local TypeScript toolchain
dependencies (`tsx` is unavailable), so workflow CLI status was not executed;
the source and checked-in workflow state were inspected directly instead.

**Ready to freeze**
