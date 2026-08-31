// Builds throwaway executable-on-PATH fixtures standing in for `codex`,
// `claude`, and (as a poison pill) `git`, per TR3/A2/A3: bare-name PATH
// resolution under a non-shell argument vector lets evaluation substitute
// these without ever installing or invoking a real agent CLI.

import { mkdtemp, writeFile, chmod, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface FixtureScriptSpec {
  readonly name: string;
  readonly sleepMs?: number;
  readonly exitCode?: number;
  readonly marker?: string;
  /** When true, stdout output is withheld until just before the process
   * exits, so a liveness oracle cannot correctly infer "still running" by
   * checking whether the log already contains output. */
  readonly writeMarkerBeforeExit?: boolean;
}

export interface FixtureBin {
  readonly binDir: string;
  readonly invocationLogPath: string;
  invocations(): Promise<FixtureInvocation[]>;
  cleanup(): Promise<void>;
}

export interface FixtureInvocation {
  readonly cwd: string;
  readonly args: string[];
  readonly at: number;
}

export async function createFixtureBin(
  scripts: readonly FixtureScriptSpec[],
): Promise<FixtureBin> {
  const binDir = await mkdtemp(join(tmpdir(), "wf008-fixture-bin-"));
  const invocationLogPath = join(binDir, "invocations.log");

  for (const script of scripts) {
    const sleepMs = script.sleepMs ?? 0;
    const exitCode = script.exitCode ?? 0;
    const marker = script.marker ?? `${script.name}-fixture-output`;
    const emitMarker = `process.stdout.write(${JSON.stringify(marker)} + '\\n');`;
    const body = [
      "#!/usr/bin/env node",
      "const fs = require('fs');",
      `fs.appendFileSync(${JSON.stringify(invocationLogPath)}, JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2), at: Date.now() }) + '\\n');`,
      script.writeMarkerBeforeExit ? "" : emitMarker,
      `setTimeout(() => { ${script.writeMarkerBeforeExit ? emitMarker : ""} process.exit(${exitCode}); }, ${sleepMs});`,
      "",
    ].join("\n");
    const scriptPath = join(binDir, script.name);
    await writeFile(scriptPath, body, { mode: 0o755 });
    await chmod(scriptPath, 0o755);
  }

  return {
    binDir,
    invocationLogPath,
    async invocations() {
      try {
        const raw = await readFile(invocationLogPath, "utf8");
        return raw
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => JSON.parse(line) as FixtureInvocation);
      } catch {
        return [];
      }
    },
    async cleanup() {
      await rm(binDir, { recursive: true, force: true });
    },
  };
}

/** PATH with the fixture bin directory prepended ahead of the real PATH,
 * matching TR3's inherited-PATH resolution. */
export function pathWithFixtureBin(fixture: FixtureBin): string {
  return `${fixture.binDir}${process.platform === "win32" ? ";" : ":"}${process.env["PATH"] ?? ""}`;
}
