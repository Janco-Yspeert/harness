const sessionId = document.querySelector("#session-id");
const attachment = document.querySelector("#attachment");
const output = document.querySelector("#output");
const form = document.querySelector("#command-form");
const command = document.querySelector("#command");
const createButton = document.querySelector("#create");
const attachButton = document.querySelector("#attach");
const disconnectButton = document.querySelector("#disconnect");
const stopButton = document.querySelector("#stop");
const sendButton = form.querySelector("button");

let id;
let socket;

async function discardSessionIfStale(expectedId) {
  if (expectedId === undefined) return;

  try {
    const response = await fetch(`/sessions/${encodeURIComponent(expectedId)}`);
    if (response.status === 404 && id === expectedId) {
      id = undefined;
      render();
    }
  } catch {
    // Connection failure says nothing about whether the session still exists.
  }
}

function render() {
  const connected = socket?.readyState === WebSocket.OPEN;
  sessionId.textContent = id ?? "None";
  attachment.textContent = connected ? "Attached" : "Detached";
  createButton.disabled = id !== undefined;
  attachButton.disabled = id === undefined || connected;
  disconnectButton.disabled = !connected;
  stopButton.disabled = id === undefined;
  command.disabled = !connected;
  sendButton.disabled = !connected;
}

function attach() {
  if (id === undefined) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(
    `${protocol}//${window.location.host}/sessions/${encodeURIComponent(id)}/ws`,
  );
  attachment.textContent = "Connecting…";

  socket.addEventListener("open", () => {
    render();
    command.focus();
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "output" && typeof message.data === "string") {
      output.textContent += message.data;
      output.scrollTop = output.scrollHeight;
    } else if (
      message.type === "error" &&
      typeof message.code === "string" &&
      typeof message.data === "string"
    ) {
      output.textContent += `\n[${message.code}] ${message.data}\n`;
      output.scrollTop = output.scrollHeight;
    }
  });
  socket.addEventListener("close", () => {
    socket = undefined;
    render();
    void discardSessionIfStale(id);
  });
  socket.addEventListener("error", () => {
    attachment.textContent = "Connection error";
  });
}

createButton.addEventListener("click", async () => {
  const response = await fetch("/sessions", { method: "POST" });
  if (!response.ok) {
    attachment.textContent = `Create failed (${String(response.status)})`;
    return;
  }
  ({ id } = await response.json());
  render();
  attach();
});

attachButton.addEventListener("click", attach);
disconnectButton.addEventListener("click", () => socket?.close());
stopButton.addEventListener("click", async () => {
  if (id === undefined) return;
  const response = await fetch(`/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    attachment.textContent = `Stop failed (${String(response.status)})`;
    return;
  }
  id = undefined;
  socket = undefined;
  render();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (socket?.readyState !== WebSocket.OPEN || command.value.length === 0) {
    return;
  }
  socket.send(JSON.stringify({ type: "input", data: `${command.value}\r` }));
  command.value = "";
  command.focus();
});

render();
