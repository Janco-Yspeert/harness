# Brief Readiness — Spike 014

## Verdict

**Not ready to freeze**

The brief accurately identifies the authority/state-adoption scar and preserves
the important security boundaries.  It is not yet a fair implementation and
evaluation contract because three material acceptance boundaries still leave
the implementer to choose what is in scope or what counts as the required real
proof.

## Blockers

### B1 — The initial governed-role migration set is not defined

**Brief evidence:** `spikes/014-kernel-consolidation-authority-role-grants/spike.md`,
Scope §5 says “Each governed role” needs a separate machine-readable contract;
AC07 requires governed Harness roles to resolve contracts through configuration;
and Scope §24 rejects hard-coded role names and paths.

**Repository evidence:** `src/workflow-run.ts` currently has one
`ROLE_CONTRACTS` table covering eight roles (`brief-readiness`, `design-map`,
`evaluator-prepare`, `evaluator-repair`, `implementation`,
`evaluator-verify`, `as-built`, and `outcome`).  The existing workflow also
models all eight phases in `tools/workflow.ts`.

**Consequence:** “Each governed role” can fairly mean the whole current
Harness roster, only roles exercised by the new kernel scenarios, or an
open-ended future plugin set.  Those choices substantially change the
configuration/migration work and AC07's test surface.  A Design Map may select
the representation, but it must not decide which public roles the frozen
contract actually promises to migrate.

**Smallest clarification requested:** state the exact initial role roster that
must be represented by configured contracts and policy in this spike, and
whether the three evaluator phases may intentionally share one contract with
role-specific policy entries.  If any current role is deliberately deferred,
name it and state that it remains outside the new governed kernel path.

### B2 — The attached-session and human-wait proofs do not define a reproducible boundary

**Brief evidence:** Scope §§9 and 14 require a real attached-session role
execution and a real same-identity wait/resume; AC14 and AC24–AC25 make them
mandatory; “Live-provider evidence” requires those boundaries to be crossed.
The brief leaves the “exact CLI/API” and interaction transport to the Design
Map.

**Repository evidence:** the current host exposes workflow-run allocation,
inspection, cancellation, replacement, role-result, and publication routes in
`src/index.ts`, while `src/workflow-backend.ts` constructs a newly spawned
local provider process for every workflow run.  There is no current attached
session grant or structured input/resume route to migrate.

**Consequence:** without a minimum externally observable protocol and fixture
shape, an implementation can satisfy tests with an in-memory adapter or a
synthetic callback while calling it “real”, or can require an unavailable live
provider interaction.  Either outcome makes AC14 and AC24–AC25 evaluator
dependent on implementation-specific interpretation.  This is exactly the
sort of hand-wavy bridge where bugs breed behind the portcullis.

**Smallest clarification requested:** define the minimum proof contract for
these two scenarios: the stable identities and persisted records that must be
observable, the supported host operation(s) used to attach/grant and to supply
a human response, and what bounded provider/session fixture is acceptable as
“real” (including whether a repository-controlled adapter is allowed).  The
Design Map can still choose endpoint names, storage, and provider adapter
internals.

### B3 — Host-mediated publication lacks a reproducible acceptance environment

**Brief evidence:** Scope §12 and AC20–AC21 require Harness to validate and
publish an exact commit using host-held credentials, and “Live-provider
evidence” requires one real host-mediated publication request.  The brief
does not identify a remote, credential source, or a controlled substitute
that proves the executor lacks those credentials.

**Repository evidence:** `WorkflowRunRegistry#publishCommit` in
`src/workflow-run.ts` currently performs `git push origin <commit>:...` using
the host process.  The existing project test command (`npm test` in
`package.json`) supplies no remote/credential fixture.

**Consequence:** a real network publication would depend on evaluator-host
credentials and repository permissions that are neither part of the frozen
contract nor guaranteed by the allocation.  Conversely, a unit mock proves
neither host mediation nor direct-push absence.  An evaluator cannot fairly
decide which substitute is sufficient after implementation.

**Smallest clarification requested:** prescribe the bounded publication proof
environment.  For example, explicitly permit a temporary/local bare Git
remote controlled by the host, require the executor profile to have no remote
credentials/network capability, and require durable evidence that the host
validated and advanced the exact remote ref.  If an authenticated external
remote is required instead, identify the pre-provisioned authority and its
failure classification.

## Review limitations

This review inspected public repository material only: `AGENTS.md`,
`GOALS.md`, the live brief, current workflow/host implementation and visible
tests, plus the public Spike 013a As-Built and Outcome history.  It did not
inspect evaluator-private material.

## Files changed

- `spikes/014-kernel-consolidation-authority-role-grants/feedback.md`

## Checks run

- Verified the loaded `skills/brief-readiness/SKILL.md` identity is
  `sha256:0f46504c221b22c49942264e3ef87785150df0d4bb2a31dd71e3f0f4151e2426`.
- Read the complete live brief.
- Inspected the cited public implementation, visible tests, repository
  instructions, goals, and public prior-spike records.

**Not ready to freeze**
