// Case E12.
//
// Spike 007 must not introduce a Conduit SDK/package, a broker (e.g.
// RabbitMQ/amqplib), or any other runtime/transport dependency for the
// event model. The required envelope shape is represented locally. This is
// a static check of the public repository's declared dependencies.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const PACKAGE_JSON = new URL("../../../../harness/package.json", import.meta.url);

const FORBIDDEN_NAME_PATTERN = /conduit|amqplib|rabbitmq|amqp/i;

await test("no Conduit runtime/SDK or broker dependency is declared", async () => {
  const raw = await readFile(PACKAGE_JSON, "utf8");
  const manifest = JSON.parse(raw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const declared = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ];

  const offenders = declared.filter((name) => FORBIDDEN_NAME_PATTERN.test(name));
  assert.deepEqual(
    offenders,
    [],
    `no dependency name may reference Conduit or a broker package; found: ${offenders.join(", ")}`,
  );
});
