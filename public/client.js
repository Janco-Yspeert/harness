const status = document.querySelector("#status");
const output = document.querySelector("#output");
const form = document.querySelector("#command-form");
const command = document.querySelector("#command");
const sendButton = form.querySelector("button");

const webSocketProtocol =
  window.location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(
  `${webSocketProtocol}//${window.location.host}/ws`,
);

socket.addEventListener("open", () => {
  status.textContent = "Connected";
  command.disabled = false;
  sendButton.disabled = false;
  command.focus();
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.type === "output" && typeof message.data === "string") {
    output.textContent += message.data;
    output.scrollTop = output.scrollHeight;
  }
});

socket.addEventListener("close", () => {
  status.textContent = "Disconnected";
  command.disabled = true;
  sendButton.disabled = true;
});

socket.addEventListener("error", () => {
  status.textContent = "Connection error";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (socket.readyState !== WebSocket.OPEN || command.value.length === 0) {
    return;
  }

  socket.send(JSON.stringify({ type: "input", data: `${command.value}\r` }));
  command.value = "";
  command.focus();
});
