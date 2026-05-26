import { create } from "zustand";
import { mockIncident, mockTimeline, mockActions } from "../data/mockIncident";

export const useIncidentStore = create((set) => ({
  incident: mockIncident,
  timeline: mockTimeline,
  actions: mockActions,
  aiMessages: [],
  integrations: [],
  setIncident: (incident) => set({ incident }),
  setTimeline: (timeline) => set({ timeline }),
  setActions: (actions) => set({ actions }),
  setIntegrations: (integrations) => set({ integrations }),
  addAiMessage: (message) => set((s) => ({ aiMessages: [message, ...s.aiMessages] })),
  applySocketEvent: (event) =>
    set((state) => {
      if (event.type === "SLA_TICK") {
        return { incident: { ...state.incident, slaSecondsRemaining: Math.max(0, state.incident.slaSecondsRemaining - 60) } };
      }
      if (event.type === "STATUS_UPDATED") {
        return { incident: { ...state.incident, status: event.payload.status } };
      }
      if (event.type === "ACTION_UPDATED") {
        return { actions: state.actions.map((a) => (a.id === event.payload.id ? { ...a, ...event.payload } : a)) };
      }
      if (event.type === "AI_MESSAGE_ADDED") {
        return { aiMessages: [event.payload, ...state.aiMessages] };
      }
      if (event.type === "RESOURCE_STATUS_UPDATED") {
        return { timeline: [{ time: "Live", event: event.payload.note }, ...state.timeline] };
      }
      return state;
    }),
}));
