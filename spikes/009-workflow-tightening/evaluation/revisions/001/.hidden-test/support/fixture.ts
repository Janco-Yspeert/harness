import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export const root = process.cwd();
export const spike = `spikes/999-eval-009-${process.pid}`;
export const spikePath = join(root, spike);
export function run(args: string[], env: NodeJS.ProcessEnv = process.env) {
  const clean = { ...env };
  delete clean.NODE_TEST_CONTEXT;
  const workflow = (JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { scripts: { workflow: string } }).scripts.workflow;
  const entry = workflow.match(/^node\s+([^\s]+)$/)?.[1];
  assert.ok(entry, "workflow script must invoke one Node entrypoint");
  return spawnSync(process.execPath, [entry, ...args], { cwd: root, encoding: "utf8", env: clean });
}
export function init(): void { mkdirSync(spikePath, { recursive: true }); assert.equal(run(["init", spike]).status, 0); }
export function complete(phase: string): void { assert.equal(run(["dispatch", phase, spike]).status, 0); assert.equal(run(["record", phase, spike, "complete"]).status, 0); }
export function beforeImplementation(): void { complete("brief-readiness"); complete("design-map"); complete("evaluator-prepare"); }
export function state(): { records: Array<Record<string, unknown>> } { return JSON.parse(readFileSync(join(spikePath, ".workflow", "state.json"), "utf8")) as { records: Array<Record<string, unknown>> }; }
export function fixtureBin(): { bin: string; environment: NodeJS.ProcessEnv; cleanup: () => void } {
  const bin = mkdtempSync(join(tmpdir(), "harness-eval-009-"));
  for (const name of ["codex", "claude"]) { const path = join(bin, name); writeFileSync(path, "#!/bin/sh\nprintf '%s\\n' \"$0 $*\"\n"); chmodSync(path, 0o755); }
  return { bin, environment: { ...process.env, PATH: `${bin}:${process.env.PATH ?? ""}` }, cleanup: () => rmSync(bin, { recursive: true, force: true }) };
}
export function cleanup(): void { rmSync(spikePath, { recursive: true, force: true }); }
