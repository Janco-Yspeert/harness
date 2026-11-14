#!/usr/bin/env bash
set -u -o pipefail

mode=${1:-all}

case "$mode" in
  all | ordinary | containment) ;;
  *)
    echo "usage: $0 [all|ordinary|containment]" >&2
    exit 64
    ;;
esac

is_containment_file() {
  case "$1" in
    test/candidate-subject.test.ts | test/external-project.test.ts | \
      test/governed-executors.test.ts | test/host-fs-isolation.test.ts)
      return 0
      ;;
    *) return 1 ;;
  esac
}

passed=0
skipped=0

for test_file in test/*.test.ts; do
  if is_containment_file "$test_file"; then
    if [[ "$mode" == "ordinary" ]]; then
      printf '=== SKIP %s (requires real Bubblewrap containment; dedicated runner) ===\n' "$test_file"
      skipped=$((skipped + 1))
      continue
    fi
  elif [[ "$mode" == "containment" ]]; then
    continue
  fi

  printf '\n=== START %s ===\n' "$test_file"
  if timeout --signal=TERM --kill-after=15s 180s node --test "$test_file"; then
    printf '=== PASS %s ===\n' "$test_file"
    passed=$((passed + 1))
    continue
  fi
  status=$?
  printf '=== FAIL OR TIMEOUT %s (exit %s) ===\n' "$test_file" "$status" >&2
  ps -eo pid,ppid,etimes,stat,cmd >&2
  exit "$status"
done

printf '\n=== PASS %s test files; SKIP %s (%s mode) ===\n' "$passed" "$skipped" "$mode"
