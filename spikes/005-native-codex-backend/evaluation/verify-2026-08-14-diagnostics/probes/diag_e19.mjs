import { startAttachedCodexSession, deleteJson, randomFreePort } from "/home/velveteen/vk-code/harness-hidden/spikes/005-native-codex-backend/.hidden-test/helpers.ts";

const port = await randomFreePort();
console.log("t0", Date.now());
const { host, id, peer, socket } = await startAttachedCodexSession(port);
console.log("t1 attached", Date.now(), "peer pid", peer.pid);

peer.child.on("exit", (code, signal) => {
  console.log("PEER PROCESS EXITED", Date.now(), { code, signal });
});

console.log("issuing DELETE", Date.now());
const deletePromise = deleteJson(`${host.url}/sessions/${id}`);

let resolved = false;
deletePromise.then((r) => {
  resolved = true;
  console.log("DELETE resolved", Date.now(), r.status);
});

await new Promise((resolve) => setTimeout(resolve, 3000));
console.log("3s mark, DELETE resolved?", resolved, "peer pid alive?", peer.pid);
try {
  process.kill(peer.pid, 0);
  console.log("peer process still alive at 3s mark");
} catch {
  console.log("peer process is dead at 3s mark");
}

await new Promise((resolve) => setTimeout(resolve, 3000));
console.log("6s mark, DELETE resolved?", resolved);

socket.close();
await host.close();
peer.exit();
process.exit(0);
