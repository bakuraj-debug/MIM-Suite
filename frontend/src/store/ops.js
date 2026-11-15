import { create } from "zustand";
import { emptyLocal } from "../lib/view";

export const useOps = create((set) => ({
  slots: {},              // key -> {data, status: loading|live|error, error, updatedAt}
  local: emptyLocal(),
  loadedAt: Date.now(),
  selectedNode: null,
  frozenAt: null,
  toast: null,

  setSlot: (key, v) => set((s) => ({ slots: { ...s.slots, [key]: { ...s.slots[key], ...v } } })),
  clearSlot: (key) => set((s) => { const slots = { ...s.slots }; delete slots[key]; return { slots }; }),
  patchLocal: (patch) => set((s) => ({ local: { ...s.local, ...(typeof patch === "function" ? patch(s.local) : patch) } })),
  selectNode: (id) => set({ selectedNode: id }),
  notify: (msg) => { set({ toast: { msg, at: Date.now() } }); },
}));
