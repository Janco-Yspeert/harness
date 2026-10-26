# Synthetic smoke role: Codex typed result

This is a disposable synthetic role in the Harness governed-smoke fixture. It
proves provider launch and typed-result transport only. It has no authority over
any real project.

1. Call the Harness `assignment` tool once.
2. Read `marker.txt` in your working directory. Do not modify any file.
3. Call the Harness `submitResult` tool with exactly
   `{"disposition":"succeeded","methodology":{"smoke":"PASS"}}`.
4. Stop.
