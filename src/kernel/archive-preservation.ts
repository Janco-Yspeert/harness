import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  renameSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { identity } from "./ledger.ts";
import type { LedgerEvent } from "./model.ts";

export interface PreservationPlan {
  cycle: string;
  from: string;
  to: string;
}

function inventory(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (directory: string): void => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stat = lstatSync(path);
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile())
        files[relative(root, path).split("\\").join("/")] = identity(
          readFileSync(path),
        );
      else
        throw new Error("earlier-cycle archive contains a non-regular entry");
    }
  };
  walk(root);
  return files;
}

// Decides whether a valid earlier-cycle canonical archive occupying `occupied`
// may be preserved at `<historyRoot>/cycle-NNN`. The cycle and the expected
// bytes come only from host-recorded workflow history; any change, missing
// binding, identity mismatch or occupied history destination fails closed.
// Nothing is moved here.
export function planPreservation(
  occupied: string,
  historyRoot: string,
  destination: string,
  transition: string,
  currentCycle: string,
  events: LedgerEvent[],
): PreservationPlan {
  const recorded = events.findLast(
    (event) =>
      event.transition === transition &&
      event.evidence.destination === destination,
  );
  const cycle = recorded?.evidence.cycle;
  if (
    !recorded ||
    typeof cycle !== "string" ||
    !/^\d{3}$/.test(cycle) ||
    cycle === currentCycle ||
    Number(cycle) > Number(currentCycle)
  )
    throw new Error("promotion destination already exists");
  const stat = lstatSync(occupied);
  if (stat.isSymbolicLink() || !stat.isDirectory())
    throw new Error("earlier-cycle archive is not a plain directory");
  const expected: Record<string, string> = {
    ...(recorded.evidence.artifacts as Record<string, string>),
    "promotion.json": String(recorded.evidence.promotionIdentity),
  };
  const actual = inventory(occupied);
  const keys = Object.keys(expected).sort();
  if (
    JSON.stringify(Object.keys(actual).sort()) !== JSON.stringify(keys) ||
    keys.some((key) => actual[key] !== expected[key])
  )
    throw new Error(
      "earlier-cycle archive does not match its recorded identities",
    );
  const to = resolve(historyRoot, `cycle-${cycle}`);
  if (existsSync(to) || dirname(to) !== resolve(historyRoot))
    throw new Error("earlier-cycle archive history destination is occupied");
  return { cycle, from: occupied, to };
}

export function preserve(plan: PreservationPlan): void {
  renameSync(plan.from, plan.to);
}
