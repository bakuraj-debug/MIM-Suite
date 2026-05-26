import { useEffect } from "react";
import { apiClient } from "../services/apiClient";
import { useIncidentStore } from "../store/incidentStore";

export function useIncidentData(incidentId) {
  const { setIncident, setTimeline, setActions, setIntegrations } = useIncidentStore();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [incident, timeline, actions, integrationStatus] = await Promise.all([
          apiClient.getIncident(incidentId),
          apiClient.getTimeline(incidentId),
          apiClient.getActions(incidentId),
          apiClient.getIntegrationStatus(),
        ]);
        if (!active) return;
        setIncident(incident);
        setTimeline(timeline.items || []);
        setActions(actions.items || []);
        setIntegrations(integrationStatus.integrations || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [incidentId, setIncident, setTimeline, setActions, setIntegrations]);
}
