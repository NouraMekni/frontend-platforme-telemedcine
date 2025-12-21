export function createSignalingSocket(onMessage) {
  const wsUrl = "ws://localhost:8083/ws/signaling";
  const socket = new WebSocket(wsUrl);
  const queue = [];

  socket.onopen = () => {
    console.log("✅ WS signaling connecté");
    while (queue.length > 0) {
      socket.send(queue.shift());
    }
  };

  socket.onclose = () => console.log("❌ WS signaling fermé");
  socket.onerror = (e) => console.error("WS error", e);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("WS message parse error", e);
    }
  };

  const send = (payload) => {
    const data = JSON.stringify(payload);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    } else {
      queue.push(data);
    }
  };

  return { socket, send };
}