import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  candidateMethodology,
  checkMethodology,
  diffMethodologies,
  exerciseMethodology,
  promoteMethodology,
  type CandidateMethodology,
  type MethodologyManifest,
} from "../src/methodology-evolution.ts";

function read(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function manifest(path: string): MethodologyManifest {
  const value = read(path) as MethodologyManifest | CandidateMethodology;
  return "manifest" in value ? value.manifest : value;
}

function output(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usage(): never {
  throw new Error(
    "Usage: methodology <candidate|check|diff|exercise|promote> ...",
  );
}

function main(args: string[]): void {
  const [operation, ...rest] = args;
  switch (operation) {
    case "candidate": {
      const [revision, history] = rest;
      if (!revision || !history) usage();
      output(candidateMethodology(process.cwd(), revision, resolve(history)));
      return;
    }
    case "check": {
      const [candidate] = rest;
      if (!candidate) usage();
      output(checkMethodology(manifest(candidate)));
      return;
    }
    case "diff": {
      const [from, to] = rest;
      if (!from || !to) usage();
      output(diffMethodologies(manifest(from), manifest(to)));
      return;
    }
    case "exercise": {
      const [candidate, history] = rest;
      if (!candidate || !history) usage();
      output(
        exerciseMethodology(
          read(candidate) as CandidateMethodology,
          resolve(history),
        ),
      );
      return;
    }
    case "promote": {
      const [candidate, history, authority] = rest;
      if (!candidate || !history || !authority) usage();
      output(
        promoteMethodology(
          read(candidate) as CandidateMethodology,
          resolve(history),
          read(authority),
        ),
      );
      return;
    }
    default:
      usage();
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
