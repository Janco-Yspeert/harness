// Shared scaffolding for Spike 008 hidden tests: invokes the frozen public
// contract surface (`npm run workflow -- ...`) as a real subprocess against
// the public repository root, exactly as any external caller would.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(
  new URL("../../../../../harness/", import.meta.url),
);

export interface CliResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number | null;
  readonly durationMs: number;
}

export function runWorkflow(
  args: readonly string[],
  options: { readonly env?: NodeJS.ProcessEnv } = {},
): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(
      "npm",
      ["run", "--silent", "workflow", "--", ...args],
      {
        cwd: REPO_ROOT,
        shell: false,
        env: options.env ?? process.env,
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({ stdout, stderr, exitCode, durationMs: Date.now() - start });
    });
  });
}

export function parseStatusJson(stdout: string): { records: StatusRecord[] } {
  const parsed: unknown = JSON.parse(stdout.trim());
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as { records?: unknown }).records)
  ) {
    throw new Error("status output did not match the frozen TR1 shape");
  }
  return parsed as { records: StatusRecord[] };
}

export interface StatusJob {
  readonly pid: number;
  readonly command: string | readonly string[];
  readonly logPath: string;
  readonly live: boolean;
}

export interface StatusRecord {
  readonly phase: string;
  readonly attempt: number;
  readonly outcome?: "complete" | "blocked" | "failed";
  readonly job?: StatusJob;
}

export function recordsFor(
  records: readonly StatusRecord[],
  phase: string,
  attempt: number,
): StatusRecord[] {
  return records.filter((r) => r.phase === phase && r.attempt === attempt);
}

export function outcomeFor(
  records: readonly StatusRecord[],
  phase: string,
  attempt: number,
): string | undefined {
  return recordsFor(records, phase, attempt).find((r) => r.outcome)?.outcome;
}

export function jobFor(
  records: readonly StatusRecord[],
  phase: string,
  attempt: number,
): StatusJob | undefined {
  return recordsFor(records, phase, attempt).find((r) => r.job)?.job;
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function waitUntil(
  predicate: () => boolean | Promise<boolean>,
  attempts = 200,
  intervalMs = 10,
): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("condition was not reached in time");
}
