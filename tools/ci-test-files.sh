#!/usr/bin/env bash
set -u -o pipefail

for test_file in test/*.test.ts; do
  printf '\n=== START %s ===\n' "$test_file"
  if timeout --signal=TERM --kill-after=15s 180s node --test "$test_file"; then
    printf '=== PASS %s ===\n' "$test_file"
    continue
  fi
  status=$?
  printf '=== FAIL OR TIMEOUT %s (exit %s) ===\n' "$test_file" "$status" >&2
  ps -eo pid,ppid,etimes,stat,cmd >&2
  exit "$status"
done
