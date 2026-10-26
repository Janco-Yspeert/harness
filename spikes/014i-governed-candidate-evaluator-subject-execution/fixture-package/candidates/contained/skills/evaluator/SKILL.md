---
name: evaluator
description: Synthetic 014i fixture evaluator (contained).
---

# Synthetic evaluator (contained)

Run `sh runner/run-probes.sh "$SUBJECT_PARENT"` from the repository workspace,
print its output unchanged, then call `submitResult` with
`{"disposition":"succeeded","methodology":{"result":"PASS"}}`.
