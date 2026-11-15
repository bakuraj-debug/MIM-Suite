import { useEffect } from "react";
import { useConfig } from "../store/config";
import { useOps } from "../store/ops";
import { useVault } from "../lib/vault";
import { runBinding } from "../lib/connectors";
import { SLOTS, validateSlot } from "../data/slots";

/** Polls every live-bound read slot. Unbound slots stay on demo data. */
export function useDataSync() {
  const bindings = useConfig((s) => s.bindings);
  const connectors = useConfig((s) => s.connectors);
  const settings = useConfig((s) => s.settings);
  const vaultStatus = useVault((s) => s.status);

  const sig = JSON.stringify([bindings, connectors.map((c) => [c.id, c.baseUrl, c.enabled, c.auth, c.endpoints, c.headers]), settings.incidentId, settings.changeId, settings.proxyUrl, vaultStatus]);

  useEffect(() => {
    const { setSlot, clearSlot } = useOps.getState();
    const timers = [];
    let dead = false;

    for (const def of SLOTS.filter((s) => s.kind === "read")) {
      const b = bindings[def.key];
      if (!b) { clearSlot(def.key); continue; }
      const ctx = () => ({ incidentId: settings.incidentId, changeId: settings.changeId, phase: useOps.getState().local.phase || "" });
      const pull = async () => {
        setSlot(def.key, { status: useOps.getState().slots[def.key]?.data ? "live" : "loading", error: null });
        try {
          const data = validateSlot(def.key, await runBinding(b, ctx()));
          if (!dead) setSlot(def.key, { data, status: "live", error: null, updatedAt: Date.now() });
        } catch (e) {
          if (!dead) setSlot(def.key, { status: "error", error: e.message, data: undefined });
        }
      };
      pull();
      if (b.refreshSec > 0) timers.push(setInterval(pull, b.refreshSec * 1000));
    }
    return () => { dead = true; timers.forEach(clearInterval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
}
