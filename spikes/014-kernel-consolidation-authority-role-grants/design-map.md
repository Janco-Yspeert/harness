# Design Map — Spike 014 Kernel Consolidation: Authority, Role Grants, and Execution Binding

## Shared contracts

- One append-only Authority Ledger is the sole methodology authority for a
  workflow.  A single generic Authority Resolver reads that ledger, the pinned
  Methodology Definition, immutable referenced artifacts, and policy-declared
  operational facts to resolve a requested role to exactly one of: an immutable
  Role Grant, a human gate, a policy stop, or a machine-readable denial.
  Operational records, including `.workflow`, are evidence/projections only;
  deleting or recreating them cannot change legal methodology eligibility.
- A content-addressed, versioned Methodology Definition pins the workflow-policy
  identity, every governed role's machine-readable contract identity, and the
  relevant semantic-skill identities.  A Workflow Execution Grant binds a
  workflow/project scope to exactly one such definition and to bounded
  continuation, delegation, and stopping authority.  A changed definition is
  new future authority; it cannot reinterpret an existing execution grant.
- Workflow policy is narrow declarative configuration, interpreted generically
  by the resolver.  It supplies role availability, deterministic predicates,
  result-dependent transitions, bounded retry/correction routes, gates, and
  stops for all eight current governed roles.  A role entry names its own
  contract, including the exact role even where evaluator roles share common
  contract material.  The kernel has no intrinsic Harness phase, role, path,
  or `ROLE_CONTRACTS` knowledge.
- Each allocated governed execution has one immutable, inspectable Role Grant
  derived from a Workflow Execution Grant and an authority-basis identity.  It
  binds role, methodology/skill/contract identities, inputs, workspace grants,
  direct capabilities, allowed structured host actions, and execution
  constraints.  Prompt text, provider claims, and a process exit never mint or
  broaden this authority.

## Design decisions

- Allocation is keyed by the stable authority basis plus the resolved role, not
  a local phase/attempt record.  Concurrent or repeated continuation returns
  the one allocation/Role Grant for that key.  A policy-authorized retry or
  replacement creates a distinct grant and execution identity with explicit
  predecessor lineage.
- The same Role Grant is bindable either to an eligible registered existing
  session/executor or to a new isolated executor.  The supported host boundary
  records the binding and returns a durable Execution Handle.  Attached
  execution must receive no lesser authority check than spawned execution.
  Execution identity, session identity, caller connection, and provider
  process lifecycle remain distinct.
- Execution/session provenance is monotonic host-owned evidence.  A
  mechanically observed grant of evaluator-private material records private
  exposure against that identity; later revocation does not erase it.  Policy
  predicates consume this provenance when deciding role eligibility.
- Process lifecycle, semantic Role Result, role-specific methodology result,
  and each Host Action Result are separate versioned facts correlated to the
  Execution Handle and grants.  A required action may affect a later policy
  transition, but cannot rewrite an accepted semantic result.
- Direct executor capabilities and Host Actions are separate grant fields.  A
  host action is a named, structured request whose parameters are narrowed by
  the Role Grant and validated by the host.  In particular publication names an
  exact commit/ref and host validation records pre/post remote state and the
  action result; direct remote publication is not thereby granted to the
  executor.
- A permitted structured human request transitions its existing execution to
  waiting-for-human without cancelling or replacing it.  A response is bound
  to that request and execution; if it changes authority, its canonical
  root-authority record precedes delivery/resume.  Private request content need
  only be exposed to authorized recipients.
- Generic, versioned, bounded root-authority records are forward-only resolver
  inputs.  They identify scope, basis, permitted exception/change, origin,
  lifetime, and audit reason; they may enable future grants but cannot mutate
  ledger history, old grants, results, or methodology definitions.

## Invariants

- Fresh resolution from the Authority Ledger and pinned definition yields the
  same legal next action regardless of local runner history.  Canonical PASS
  and promotion can therefore satisfy an As-Built policy predicate despite a
  separate later operational/publication failure.
- Durable identities distinguish project/workspace, Methodology Definition,
  Workflow Execution Grant, authority basis, Role Grant, execution/session,
  result, host action, and replacement/correction lineage.  New persisted
  forms carry explicit schema versions.  Handles remain inspectable after
  caller disconnect; unrecoverable post-restart work is represented as
  interrupted/lost, never absent.
- Resolver and allocation mechanics are portable: project configuration
  supplies locations and methodology content; provider adapters supply executor
  capabilities.  Telemetry is emitted/correlated through a non-authoritative,
  failure-tolerant seam and cannot determine methodology authority.
- The implementation must prove the public protocol with real host boundaries:
  a pre-existing external fixture attached under a Role Grant, a spawned grant,
  a local bare-remote host publication, and one wait/resume of the same
  execution.  Test doubles may cover deterministic mechanics but cannot replace
  those proofs.

## Implementation freedom

- The ledger-event normalization, policy and contract syntax, artifact
  locations, resolver API/transport, persistence layout, lock mechanism, and
  concrete identity encoding are free provided their content bindings and
  invariants hold.
- Endpoint names, executor/session registry design, process adapter details,
  telemetry sink, result/action enum spellings, and fixture implementation are
  free.  The fixture may be any independently running repository-controlled OS
  process using the supported host boundary; it need not be a live provider.
- The implementation may retain legacy records and schemas for historical
  reading or diagnostics, but they must flow through the one resolver path and
  cannot remain a second authority model.
