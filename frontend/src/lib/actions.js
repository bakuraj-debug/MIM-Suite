// Operator actions. Each updates local state and, if an action binding is configured, fires it at the connector.
import { useOps } from "../store/ops";
import { useConfig } from "../store/config";
import { runBinding } from "./connectors";
import { utcHHMM } from "./util";

const ctxBase = () => {
  const { settings } = useConfig.getState();
  return { incidentId: settings.incidentId, changeId: settings.changeId, phase: useOps.getState().local.phase || "" };
};
const say = (m) => useOps.getState().notify(m);
const note = (src, text) => useOps.getState().patchLocal((l) => ({ notes: [{ time: utcHHMM(), src, text, local: true }, ...l.notes] }));

/** Returns {fired, ok}. fired=false when no live binding is configured (demo mode). */
async function fire(slot, extra = {}) {
  const b = useConfig.getState().bindings[slot];
  if (!b) return { fired: false, ok: true };
  try { await runBinding(b, { ...ctxBase(), ...extra }); return { fired: true, ok: true }; }
  catch (e) { say(`Action failed: ${e.message}`); return { fired: true, ok: false }; }
}

export async function approveRollback() {
  const r = await fire("rollback");
  if (!r.ok) return;
  useOps.getState().patchLocal({ phase: "mitigating", recovery: true });
  note("IC", `Rollback of ${ctxBase().changeId} approved.${r.fired ? " Sent to connector." : ""}`);
  say(r.fired ? "Rollback approved and sent" : "Rollback approved (demo — nothing sent)");
}

export async function postWorkNote(text, setState) {
  const phase = useOps.getState().local.phase || "investigating";
  const r = await fire("workNote", { note: text, state: setState ? phase : "" });
  if (!r.ok) return false;
  useOps.getState().patchLocal((l) => ({ syncCount: l.syncCount + 1 }));
  note("SN", `Work note posted${r.fired ? "" : " (demo)"}: ${text.slice(0, 80)}`);
  say(r.fired ? "Work note posted to ServiceNow" : "Demo mode: note logged locally, not sent");
  return true;
}

export async function pingOwner(node) {
  const r = await fire("pingOwner", { ci: node.id, team: node.owner });
  if (!r.ok) return;
  note("IC", `Pinged ${node.owner} about ${node.name}.`);
  say(r.fired ? `Pinged ${node.owner}` : `Demo: would ping ${node.owner}`);
}
