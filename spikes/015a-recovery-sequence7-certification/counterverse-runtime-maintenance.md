# Counterverse note — durable shared-runtime maintenance

Operational recovery has three separate steps:

1. Fix the runtime actually executing the interrupted task.
2. Preserve the generic correction on a maintained shared branch.
3. Resume the task from its existing canonical state.

They are related, but none implies either of the others. A task-local runtime
exception may be necessary immediately; it does not make that commit trusted,
and it must not be the only surviving copy of a reusable correction.

Counterverse should use ordinary Git commits, branches, and worktrees to carry
these facts: record the source fix, determine whether a newer maintained
runtime already contains it, apply only the needed delta to the active runtime,
and separately surface anything still absent from the maintained branch. It
should avoid rediscovering or duplicating a fix already available upstream.

The guarantee is preservation and traceable reuse of generic corrections across
sessions and disposable worktrees. It is not automatic trust promotion, branch
merging, or methodology adoption.
