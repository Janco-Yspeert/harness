// Spike 014d §7: the normal governed path is orchestrator -> governed host ->
// registered adapter -> pinned assignment -> MCP worker protocol. This static
// check keeps the retired bridges and the terminal-prose result protocol off
// that path. Retired mutation routes are covered by the host tests (410).
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const GOVERNED_PATH = [
  "src/index.ts",
  ...readdirSync("src/executors").map((name) => join("src/executors", name)),
  ...readdirSync("src/kernel").map((name) => join("src/kernel", name)),
];

void test("014d §7: no normal-path module reaches a retired bridge, a direct runner or a prose result parser", () => {
  for (const path of GOVERNED_PATH) {
    const source = readFileSync(path, "utf8");
    for (const retired of [
      "governed-claude-bootstrap",
      "legacy-workflow",
      "tools/workflow.ts",
    ])
      assert.ok(!source.includes(retired), `${path} references ${retired}`);
  }
  for (const path of GOVERNED_PATH.filter(
    (item) =>
      item.startsWith("src/executors/") || item.startsWith("src/kernel/"),
  )) {
    const source = readFileSync(path, "utf8");
    for (const legacy of [
      "parseWorkflowBackendRoleResult",
      "createLocalWorkflowBackend",
      "buildClaudeWorkflowCommand",
      "buildExecutorCommand",
    ])
      assert.ok(!source.includes(legacy), `${path} uses ${legacy}`);
  }
  // The production entrypoint never enables legacy workflow execution.
  const main = readFileSync("src/index.ts", "utf8");
  const entry = main.slice(main.lastIndexOf("if (import.meta.main)"));
  assert.ok(!entry.includes("legacyWorkflowExecution"));
});
