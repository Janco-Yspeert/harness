import assert from "node:assert/strict";
import test from "node:test";

import { startHarnessHost } from "../../../../harness/src/index.ts";

test("E21: the host binds only to 127.0.0.1", async () => {
  const host = await startHarnessHost(0);
  try {
    const url = new URL(host.url);
    assert.equal(url.hostname, "127.0.0.1");
  } finally {
    await host.close();
  }
});
