import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

// Baseline regression, adapted from spike 003's promoted hidden tests
// (session-networking.test.ts), renumbered to this spec's E-id.

test("E34: the host binds only to 127.0.0.1", async () => {
  const host = await startHarnessHost(0);
  try {
    const url = new URL(host.url);
    assert.equal(url.hostname, "127.0.0.1");
  } finally {
    await host.close();
  }
});
