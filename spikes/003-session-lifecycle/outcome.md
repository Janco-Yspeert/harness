## Evaluator integrity

The first application of the evaluator workflow produced a blocked verification
because several hidden tests contained evaluator defects.

The evaluator correctly classified its own failures rather than reporting them
as implementation failures.

This exposed a gap in the prepare workflow: evaluator helper code and test
oracles need explicit integrity validation before an evaluation is frozen.

The evaluator skill was subsequently strengthened with pre-freeze integrity
checks.

## Specification ambiguity

Evaluation also exposed an ambiguity in the session-cleanup contract around
background processes occupying separate Unix process groups.

The ambiguity was resolved by explicitly deferring descendant-process cleanup
from Spike 003 rather than allowing the evaluator or implementer to choose an
interpretation silently.
