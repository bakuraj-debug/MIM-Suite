import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "../lib/util";

const isDev = import.meta.env.DEV;

export const blankConnector = (kind) => ({
  id: uid(kind),
  kind,                       // "api" | "mcp"
  name: kind === "mcp" ? "New MCP server" : "New API",
  baseUrl: "",
  enabled: true,
  auth: { type: "none" },     // none | bearer | basic | header  (secret itself lives in the vault)
  headers: [],                // non-secret static headers [{key,value}]
  healthPath: "",             // api only
  endpoints: [],              // api only [{id,name,method,path,body}]
  tools: [],                  // mcp only: discovered by "Test & discover"
  lastTest: null,             // {ok, at, detail, ms}
});

export const useConfig = create(
  persist(
    (set, get) => ({
      connectors: [],
      bindings: {},           // slotKey -> {mode:"live", connectorId, target, args, responsePath, refreshSec}
      settings: { incidentId: "INC0048213", changeId: "CHG0041872", proxyUrl: isDev ? "/__proxy" : "", theme: "dark" },

      upsertConnector: (c) => set((s) => ({
        connectors: s.connectors.some((x) => x.id === c.id) ? s.connectors.map((x) => (x.id === c.id ? c : x)) : [...s.connectors, c],
      })),
      patchConnector: (id, patch) => set((s) => ({ connectors: s.connectors.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeConnector: (id) => set((s) => ({
        connectors: s.connectors.filter((x) => x.id !== id),
        bindings: Object.fromEntries(Object.entries(s.bindings).filter(([, b]) => b.connectorId !== id)),
      })),
      setBinding: (slot, b) => set((s) => {
        const bindings = { ...s.bindings };
        if (b) bindings[slot] = b; else delete bindings[slot];
        return { bindings };
      }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      importConfig: (cfg) => set((s) => ({
        connectors: (cfg.connectors || []).map((c) => ({ ...c, lastTest: null })),
        bindings: cfg.bindings || {},
        settings: { ...s.settings, ...(cfg.settings || {}) },
      })),
      reset: () => set({ connectors: [], bindings: {} }),
    }),
    { name: "mim.config.v1", version: 1 }
  )
);

export const exportConfig = () => {
  const { connectors, bindings, settings } = useConfig.getState();
  return { version: 1, connectors: connectors.map(({ lastTest, ...c }) => c), bindings, settings };
};
