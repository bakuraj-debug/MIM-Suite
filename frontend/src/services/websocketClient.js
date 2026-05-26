export function createIncidentSocket(incidentId, onMessage) {
  const ws = new WebSocket(`ws://localhost:8000/ws/incidents/${incidentId}`);
  ws.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      onMessage({ type: "AI_MESSAGE_ADDED", payload: { source: "system", text: "Malformed socket payload" } });
    }
  };
  return ws;
}
