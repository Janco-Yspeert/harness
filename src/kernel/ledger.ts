import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  openSync,
  closeSync,
  fsyncSync,
} from "node:fs";
import { dirname } from "node:path";
import type { Data, LedgerEvent, Predicate, WorkflowPolicy } from "./model.ts";

export function identity(bytes: string | Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  return value === undefined ? "null" : JSON.stringify(value);
}
export function contentId(value: unknown): string {
  return identity(canonical(value));
}
export function object(value: unknown): Data {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new Error("expected an object");
  return value as Data;
}
export function text(value: unknown): string {
  if (typeof value !== "string" || value.length === 0)
    throw new Error("expected a nonempty string");
  return value;
}
export function required<T>(
  value: T | undefined | null,
  message = "required binding missing",
): T {
  if (value === undefined || value === null) throw new Error(message);
  return value;
}
export function parseLedger(bytes: string): LedgerEvent[] {
  return bytes
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const raw = object(JSON.parse(line));
      text(raw.transition);
      object(raw.evidence);
      return raw as unknown as LedgerEvent;
    });
}
export function readLedger(path: string): LedgerEvent[] {
  return existsSync(path) ? parseLedger(readFileSync(path, "utf8")) : [];
}
export function appendLedger(
  path: string,
  transition: string,
  evidence: object,
): LedgerEvent {
  const event: LedgerEvent = {
    schemaVersion: 1,
    id: randomUUID(),
    at: new Date().toISOString(),
    transition,
    evidence: evidence as Data,
  };
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, "a", 0o600);
  try {
    appendFileSync(fd, `${JSON.stringify(event)}\n`);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  return event;
}
export function scopedEvents(
  events: LedgerEvent[],
  policy: WorkflowPolicy,
): LedgerEvent[] {
  const scope = policy.scopeEvent;
  if (!scope) return events;
  const current =
    events.findLast((e) => e.transition === scope.transition)?.evidence[
      scope.field
    ] ?? scope.initial;
  return events.filter(
    (e) => (e.evidence[scope.field] ?? scope.initial) === current,
  );
}
export function matches(fields: Data, expected: Data): boolean {
  return Object.entries(expected).every(
    ([key, value]) => canonical(fields[key]) === canonical(value),
  );
}
export function predicate(
  p: Predicate,
  events: LedgerEvent[],
  policy: WorkflowPolicy,
): boolean {
  if ("all" in p) return p.all.every((v) => predicate(v, events, policy));
  if ("any" in p) return p.any.some((v) => predicate(v, events, policy));
  if ("not" in p) return !predicate(p.not, events, policy);
  const candidates = (p.current ? scopedEvents(events, policy) : events).filter(
    (e) => e.transition === p.event,
  );
  return (
    (p.latest ? candidates.slice(-1) : candidates).filter(
      (e) =>
        matches(e.evidence, p.fields ?? {}) &&
        (!p.after ||
          events.indexOf(e) >
            events.findLastIndex((v) => v.transition === p.after)),
    ).length >= (p.atLeast ?? 1)
  );
}
