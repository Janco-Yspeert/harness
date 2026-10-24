import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Criterion AC11: Outcome must distinguish STANDARD from PROCESS_EXCEPTION
// completion as a durable structured fact, never representing a process
// exception as evaluator PASS. The exact JSON field name is explicit
// implementation freedom (frozen brief §4 "Outcome"), so this test is
// tolerant of naming and only requires that *some* methodology field
// exposes both semantic values.

const PROJECT_ROOT = process.env.HARNESS_PROJECT_ROOT ?? process.cwd();

void test("outcome.json exposes a completion-mode field distinguishing STANDARD from PROCESS_EXCEPTION (AC11)", () => {
  const raw = readFileSync(
    join(PROJECT_ROOT, "methodologies/harness/contracts/outcome.json"),
    "utf8",
  );
  const contract = JSON.parse(raw) as { methodology?: Record<string, unknown> };
  const methodology = contract.methodology ?? {};
  assert.ok(
    Object.keys(methodology).length > 0,
    "outcome.json methodology object must not be empty; a completion-mode fact is required",
  );

  let foundStandard = false;
  let foundException = false;
  for (const value of Object.values(methodology)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      if (typeof entry !== "string") continue;
      if (/^standard$/i.test(entry)) foundStandard = true;
      if (/process.?exception/i.test(entry)) foundException = true;
    }
  }
  assert.ok(
    foundStandard,
    "outcome.json methodology must expose a STANDARD-shaped value",
  );
  assert.ok(
    foundException,
    "outcome.json methodology must expose a PROCESS_EXCEPTION-shaped value",
  );
});

void test("outcome.json methodology does not conflate process exception with PASS (AC11 negative requirement)", () => {
  const raw = readFileSync(
    join(PROJECT_ROOT, "methodologies/harness/contracts/outcome.json"),
    "utf8",
  );
  const contract = JSON.parse(raw) as { methodology?: Record<string, unknown> };
  const methodology = contract.methodology ?? {};
  for (const [field, value] of Object.entries(methodology)) {
    if (!Array.isArray(value)) continue;
    const values = value.filter(
      (entry): entry is string => typeof entry === "string",
    );
    const hasPass = values.some((entry) => /^pass$/i.test(entry));
    const hasException = values.some((entry) =>
      /process.?exception/i.test(entry),
    );
    assert.ok(
      !(hasPass && hasException),
      `field "${field}" must not combine a PASS-shaped value with a PROCESS_EXCEPTION-shaped value in the same enum`,
    );
  }
});
