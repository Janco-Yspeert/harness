import assert from "node:assert/strict";
import test from "node:test";

import {
  createSession,
  deleteJson,
  getJson,
  makeControllableBackend,
  startHost,
} from "./helpers.ts";

// New for spike 004: termination races (spike.md "Termination races"). Per
// A1/A5, "close together" is approximated by triggering both events without
// an intervening `await`, relying on this project's established
// single-threaded-ordering assumption rather than true OS concurrency. The
// exact HTTP status of whichever request "loses" a race is deliberately not
// asserted (see eval-spec.md's Out of Scope) — only absence of
// corruption/duplicate teardown/uncaught errors and eventual convergence to
// a consistent terminal state.

test("E29: explicit stop + near-simultaneous backend-initiated exit does not corrupt state", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const host = await startHost(0, { createBackend: backend.factory });
  try {
    const id = await createSession(host.url);

    const deletePending = deleteJson(`${host.url}/sessions/${id}`);
    backend.emitExit();

    // If either path threw an uncaught error or an unhandled rejection,
    // node:test would surface it as a failure of this test.
    const deleteResponse = await deletePending;
    assert.ok(
      [204, 404].includes(deleteResponse.status),
      `unexpected DELETE status during the race: ${deleteResponse.status}`,
    );

    assert.equal((await getJson(`${host.url}/sessions/${id}`)).status, 404);

    const recreated = await fetch(`${host.url}/sessions`, { method: "POST" });
    assert.notEqual(
      recreated.status,
      409,
      "the singleton slot was leaked by the explicit-stop/backend-exit race",
    );
  } finally {
    await host.close();
  }
});

test("E30: backend-initiated exit + concurrent explicit DELETE does not corrupt state", async () => {
  const backend = makeControllableBackend();
  backend.resolveStart();
  const host = await startHost(0, { createBackend: backend.factory });
  try {
    const id = await createSession(host.url);

    backend.emitExit();
    const deletePending = deleteJson(`${host.url}/sessions/${id}`);

    const deleteResponse = await deletePending;
    assert.ok(
      [204, 404].includes(deleteResponse.status),
      `unexpected DELETE status during the race: ${deleteResponse.status}`,
    );

    assert.equal((await getJson(`${host.url}/sessions/${id}`)).status, 404);

    const recreated = await fetch(`${host.url}/sessions`, { method: "POST" });
    assert.notEqual(
      recreated.status,
      409,
      "the singleton slot was leaked by the backend-exit/explicit-stop race",
    );
    assert.equal(recreated.status, 201);
  } finally {
    await host.close();
  }
});
