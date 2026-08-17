# Spike 006 — Claude Evaluator Compatibility Review

## Result

**PASS**

## Reviewed revision

- Public candidate commit: `e943b1bed4b609f685e52761db4e2d65183875ef`
- Evaluator: `skills/evaluator/SKILL.md` v2
- Claude Code: `2.1.232`
- Environment: local Claude CLI from the Harness repository root

## Checks performed

- Confirmed Claude discovers `/evaluator` through
  `.claude/skills/evaluator -> ../../skills/evaluator`.
- Invoked `/evaluator compatibility-check
  spikes/006-Development-Workflow-Skills-Refactor` as a harmless invalid-mode
  exercise. Claude parsed the skill and returned only its defined `prepare` and
  `verify` invocation forms.
- Confirmed the v2 frontmatter, `$mode`/`$spike` arguments, and two-mode
  interface are understood by Claude Code.
- Confirmed the skill's `${CLAUDE_PROJECT_DIR}` root resolution and mirrored
  `<project-name>-hidden/<spike>` convention are coherent.
- Confirmed the sibling `/home/velveteen/vk-code/harness-hidden` directory
  exists without reading any private evaluator content.
- Reviewed the public contract for accidental Codex-only commands, paths,
  environment assumptions, or invocation requirements; none were found.

## Correction triggered

Claude initially rejected an obsolete `Write(...)` permission entry in the
gitignored `.claude/settings.local.json`. The valid equivalent `Edit(...)` entry
was already present, so the redundant invalid local rule was removed. Discovery
and invocation then completed successfully. This machine-local compatibility
correction does not alter the public candidate revision.

## Limitations

- No evaluator `prepare` or `verify` run was performed.
- No evaluator-private file was read.
- This review establishes Claude discovery, parsing, invocation, path, argument,
  and environment compatibility. Spike 007 remains responsible for the first
  complete end-to-end workflow exercise.

## Revalidation after candidate revision

The compatibility exercise was repeated after candidate commit `2cf889a`, which
moved evaluator contract versioning from an extra frontmatter key to the skill
body without changing its Claude-specific invocation fields.

- Claude Code again discovered `/evaluator` through the project skill link.
- It parsed `Contract version: 2` from the skill body.
- The harmless `compatibility-check` invocation was rejected and only
  `prepare`/`verify` were offered.
- Claude returned **PASS** for discovery, contract parsing, mode gating, and the
  unchanged path/environment conventions.
- No full evaluator mode ran and no evaluator-private content was read.
