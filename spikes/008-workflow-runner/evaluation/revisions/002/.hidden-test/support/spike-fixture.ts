// Creates and tears down a throwaway `spikes/999-*/` directory beneath the
// real repository root, matching the canonical `spikes/NNN-*/` pattern the
// runner requires, without touching any real numbered spike.

import { mkdir, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

import { REPO_ROOT } from "./cli.ts";

export interface SpikeFixture {
  readonly relPath: string;
  readonly absPath: string;
  cleanup(): Promise<void>;
}

export async function createSpikeFixture(slug: string): Promise<SpikeFixture> {
  const suffix = randomBytes(3).toString("hex");
  const relPath = `spikes/999-${slug}-${suffix}`;
  const absPath = join(REPO_ROOT, relPath);
  await mkdir(absPath, { recursive: true });
  return {
    relPath,
    absPath,
    async cleanup() {
      await rm(absPath, { recursive: true, force: true });
    },
  };
}
