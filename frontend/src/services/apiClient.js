const API_BASE = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}

export const apiClient = {
  getIncident: (id) => request(`/api/incidents/${id}`),
  getTimeline: (id) => request(`/api/incidents/${id}/timeline`),
  getActions: (id) => request(`/api/incidents/${id}/actions`),
  getIntegrationStatus: () => request("/api/integrations/status"),
  postStrategicActions: (body) => request("/api/ai/strategic-actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  postComms: (body) => request("/api/ai/generate-comms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  postExecutiveSummary: (body) => request("/api/ai/executive-summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  postPir: (body) => request("/api/ai/post-incident-report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
};
