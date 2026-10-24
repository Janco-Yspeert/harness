# 014i fixture package

Harness-owned, deterministic, public. Copy it beneath a fresh disposable
prefix preserving bytes and relative layout.

- `candidates/contained/`, `candidates/over-authorized/`: synthetic candidate
  methodology trees; commit each as its own candidate. They differ only in the
  `evaluator-verify` contract capabilities (`repository-write` is added in the
  over-authorized candidate).
- `runner/run-probes.sh`: the runner executed by the subject, committed under
  `repository/runner/run-probes.sh`. Argument: the disposable parent path.
- `inputs/subject-input.txt`: frozen public subject input, committed under
  `repository/inputs/`.
- `forbidden/harness-sentinel.txt`: sacrificial forbidden target, placed under
  `forbidden/harness-sentinel.txt` and never granted.
- `expected-observations.json`: expected runner output lines and external
  before/after observations per candidate.
