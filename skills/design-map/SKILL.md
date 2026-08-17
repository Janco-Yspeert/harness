---
name: design-map
version: 1
description:
  Create a compact design-map.md from a frozen Harness spike brief before
  evaluator preparation or implementation.
---

# Design Map

Answer one question: **which structural decisions are already settled for this
frozen spike?**

Read the frozen brief, relevant repository contracts, code, public interfaces,
and tests. Verify the brief's content identity and committed provenance. If a
material product, behavioral, structural, or architectural decision remains
unresolved, stop; return to the brief, rerun Brief Readiness, and refreeze.

Write `design-map.md` beside the brief. Include only:

- settled structural decisions and their consequences;
- relevant ownership, interface, lifecycle, persistence, or testability seams;
- invariants that hold across valid implementations; and
- meaningful implementation freedoms.

Do not invent product behavior, prescribe incidental code shape, catalogue
files, duplicate the brief, design future architecture, or write an
implementation plan. Open structural questions are allowed only when every
answer preserves observable semantics and fair evaluation.

Use a compact structure, omitting empty sections:

```markdown
# Design Map — <spike>

## Design decisions

## Invariants

## Implementation freedom
```

Record its deterministic content identity and run in `manifest.md`, including
skill version and available statistics. Commit and push the map before evaluator
preparation. A material revision requires a new identity and invalidates
downstream evaluation where affected.
