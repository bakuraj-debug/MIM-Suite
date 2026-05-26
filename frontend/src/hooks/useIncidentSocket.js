import { useEffect } from "react";
import { createIncidentSocket } from "../services/websocketClient";
import { useIncidentStore } from "../store/incidentStore";

export function useIncidentSocket(incidentId) {
  const applySocketEvent = useIncidentStore((s) => s.applySocketEvent);

  useEffect(() => {
    const ws = createIncidentSocket(incidentId, applySocketEvent);
    return () => ws.close();
  }, [incidentId, applySocketEvent]);
}
