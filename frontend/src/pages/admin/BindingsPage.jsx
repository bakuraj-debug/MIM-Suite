import { useState } from "react";
import { Link } from "react-router-dom";
import { useConfig } from "../../store/config";
import { useOps } from "../../store/ops";
import { SLOTS, slotDef, validateSlot, exampleFor } from "../../data/slots";
import { runBinding } from "../../lib/connectors";
import { Modal } from "../../components/Common";

function Editor({ def, onClose }) {
  const { connectors, bindings, setBinding, settings } = useConfig();
  const cur = bindings[def.key];
  const [b, setB] = useState(cur || { connectorId: connectors.find((c) => c.enabled !== false)?.id || "", target: "", args: "{}", responsePath: "", refreshSec: def.defaultRefresh ?? 0 });
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const c = connectors.find((x) => x.id === b.connectorId);
  const set = (p) => setB((x) => ({ ...x, ...p }));
  const targets = c ? (c.kind === "mcp" ? (c.tools || []).map((t) => ({ v: t.name, l: t.name })) : (c.endpoints || []).map((e) => ({ v: e.id, l: `${e.method} ${e.name}` }))) : [];

  const test = async () => {
    setBusy(true); setRes(null);
    const ctx = { incidentId: settings.incidentId, changeId: settings.changeId, note: "Test note from MIM Suite", state: "", ci: "", team: "", phase: "" };
    try {
      const { raw, mapped } = await runBinding(b, ctx, { raw: true });
      let problem = null;
      if (def.kind === "read") { try { validateSlot(def.key, mapped); } catch (e) { problem = e.message; } }
      setRes({ raw, mapped, problem });
    } catch (e) { setRes({ error: e.message }); }
    setBusy(false);
  };

  return (
    <Modal wide title={def.label} tag={def.kind === "action" ? "ACTION" : "DATA"} onClose={onClose}
      foot={<>
        {cur && <button className="btn danger" onClick={() => { setBinding(def.key, null); onClose(); }}>Unbind (use demo)</button>}
        <button className="btn" onClick={test} disabled={busy || !c || !b.target}>{busy ? "Running…" : def.kind === "action" ? "Test action (real call)" : "Test & preview"}</button>
        <button className="btn primary" disabled={!c || !b.target} onClick={() => { setBinding(def.key, b); onClose(); }}>Save binding</button>
      </>}>
      <div className="help">{def.hint}</div>
      {!connectors.length && <div className="notice">Add a connector first. <Link to="/admin/connectors">Go to Connectors</Link></div>}
      <div className="grid2">
        <div className="fg"><label htmlFor="bc">Connector</label>
          <select id="bc" className="select" value={b.connectorId} onChange={(e) => set({ connectorId: e.target.value, target: "", args: "{}" })}>
            <option value="">— choose —</option>{connectors.map((x) => <option key={x.id} value={x.id}>{x.kind.toUpperCase()} · {x.name}</option>)}
          </select></div>
        <div className="fg"><label htmlFor="bt">{c?.kind === "mcp" ? "Tool" : "Endpoint"}</label>
          {c?.kind === "mcp" && !targets.length
            ? <input id="bt" className="input" value={b.target} onChange={(e) => set({ target: e.target.value })} placeholder="tool name (run “discover tools” on the connector to list)" />
            : <select id="bt" className="select" value={b.target} onChange={(e) => set({ target: e.target.value })}><option value="">— choose —</option>{targets.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select>}
        </div>
      </div>
      {c?.kind === "mcp" && (
        <div className="fg"><label htmlFor="ba">Tool arguments (JSON template)</label>
          <textarea id="ba" className="textarea" rows={3} value={b.args} onChange={(e) => set({ args: e.target.value })} />
          <div className="help">Placeholders: {(def.ctxVars || ["incidentId", "changeId"]).map((v) => `{{${v}}}`).join(" ")} {c.tools?.find((t) => t.name === b.target)?.inputSchema?.properties && <>· tool accepts: <code>{Object.keys(c.tools.find((t) => t.name === b.target).inputSchema.properties).join(", ")}</code></>}</div></div>
      )}
      {def.kind === "read" && (
        <div className="grid2">
          <div className="fg"><label htmlFor="bp">Response path (optional)</label><input id="bp" className="input" value={b.responsePath} onChange={(e) => set({ responsePath: e.target.value })} placeholder="result.items" />
            <div className="help">Dot path to the part of the response that matches the shape above, e.g. <code>result[0]</code>.</div></div>
          <div className="fg"><label htmlFor="br">Refresh every (seconds, 0 = once)</label><input id="br" className="input" type="number" min="0" value={b.refreshSec} onChange={(e) => set({ refreshSec: Math.max(0, +e.target.value || 0) })} /></div>
        </div>
      )}
      {def.kind === "action" && c?.kind !== "mcp" && <div className="help">The endpoint body template is defined on the connector. Available placeholders: {def.ctxVars.map((v) => `{{${v}}}`).join(" ")}</div>}
      {res?.error && <pre className="result bad">{res.error}</pre>}
      {res && !res.error && (
        <>
          {res.problem ? <div className="notice">⚠ Shape mismatch: {res.problem}</div> : def.kind === "read" && <div className="notice info">✓ Response fits the “{def.label}” shape.</div>}
          <div className="flabel">{def.kind === "read" ? "Mapped result" : "Response"}</div>
          <pre className="result">{JSON.stringify(res.mapped ?? res.raw, null, 2)?.slice(0, 4000)}</pre>
          {def.kind === "read" && res.problem && <details><summary className="help">Raw response</summary><pre className="result">{JSON.stringify(res.raw, null, 2)?.slice(0, 4000)}</pre></details>}
        </>
      )}
      {def.kind === "read" && <details><summary className="help">Expected shape (demo data)</summary><pre className="result">{JSON.stringify(exampleFor(def.key), null, 2).slice(0, 2500)}</pre></details>}
    </Modal>
  );
}

export default function BindingsPage() {
  const { bindings, connectors } = useConfig();
  const slots = useOps((s) => s.slots);
  const [editing, setEditing] = useState(null);
  const group = (title, kind) => (
    <div className="panel" key={kind}>
      <h2>{title}</h2>
      {SLOTS.filter((s) => s.kind === kind).map((d) => {
        const b = bindings[d.key], c = b && connectors.find((x) => x.id === b.connectorId), st = slots[d.key];
        return (
          <div className="slot-row" key={d.key}>
            <div style={{ minWidth: 0 }}>
              <b>{d.label}</b>
              <div className="help">{b ? <>→ {c ? `${c.name} · ${c.kind === "api" ? (c.endpoints.find((e) => e.id === b.target)?.name || "endpoint missing") : b.target}` : <span style={{ color: "var(--red)" }}>connector missing</span>}{kind === "read" && st && <> · <span className={`badge ${st.status === "live" ? "live" : st.status === "error" ? "err" : "load"}`}>{st.status}</span> {st.error && <span style={{ color: "var(--red)" }}>{st.error}</span>}</>}</> : "Demo data — not bound"}</div>
            </div>
            <button className="btn sm" onClick={() => setEditing(d.key)}>{b ? "Edit" : "Bind…"}</button>
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <h1>Data bindings</h1>
      <p className="lead">Choose which connector feeds each panel. Anything left unbound keeps showing demo data. Responses must match the shape each panel expects; use <b>Response path</b> to select the right part of a larger payload.</p>
      {group("Panels (read)", "read")}
      {group("Operator actions (write)", "action")}
      {editing && <Editor key={editing} def={slotDef(editing)} onClose={() => setEditing(null)} />}
    </>
  );
}
