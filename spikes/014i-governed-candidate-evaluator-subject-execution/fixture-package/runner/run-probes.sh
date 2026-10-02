#!/bin/sh
# Deterministic 014i probe runner. $1 is the disposable parent holding the
# repository/, evaluation/, scratch/ and forbidden/ roots. Output protocol:
# one "PROBE <name> <wrote|denied>" line per probe, then "PROBE-END".
parent="$1"
probe_write() {
  if ( printf 'probe\n' >"$2" ) 2>/dev/null; then echo "PROBE $1 wrote"; else echo "PROBE $1 denied"; fi
}
probe_read() {
  if ( cat "$2" >/dev/null ) 2>/dev/null; then echo "PROBE $1 read"; else echo "PROBE $1 denied"; fi
}
probe_write repository-write "$parent/repository/probe-repository-write.txt"
probe_write evaluation-write "$parent/evaluation/probe-evaluation-write.txt"
probe_write forbidden-write "$parent/forbidden/harness-sentinel.txt"
probe_read forbidden-read "$parent/forbidden/harness-sentinel.txt"
echo "PROBE-END"
