import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useConfig, blankConnector } from "../../store/config";
import { useVault, vault } from "../../lib/vault";
import { testConnector, callEndpoint } from "../../lib/connectors";
import { uid } from "../../lib/util";
import VaultControl from "../../components/VaultControl";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function Endpoints({ c, set }) {
  const [out, setOut] = useState({});
  const ctx = { incidentId: useConfig.getState().settings.incidentId, changeId: useConfig.getState().settings.changeId, note: "test", state: "", ci: "", team: "" };
  const upd = (i, p) => set({ endpoints: c.endpoints.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const run = async (e) => {
    setOut((o) => ({ ...o, [e.id]: { busy: true } }));
    try { const data = await callEndpoint(c, e, ctx); setOut((o) => ({ ...o, [e.id]: { ok: true, text: JSON.stringify(data, null, 2) } })); }
    catch (er) { setOut((o) => ({ ...o, [e.id]: { ok: false, text: er.message } })); }
  };
  return (
    <div className="panel">
      <div className="row sp" style={{ marginBottom: 8 }}>
        <h2>Endpoints</h2>
        <button className="btn sm" onClick={() => set({ endpoints: [...c.endpoints, { id: uid("ep"), name: "New endpoint", method: "GET", path: "", body: "" }] })}>+ Add endpoint</button>
      </div>
      <div className="help" style={{ marginBottom: 10 }}>Path and body support <code>{"{{incidentId}} {{changeId}} {{note}} {{state}} {{ci}} {{team}}"}</code>. Example: <code>/api/now/table/incident?sysparm_query=number={"{{incidentId}}"}</code></div>
      {!c.endpoints.length && <div className="muted">No endpoints defined.</div>}
      {c.endpoints.map((e, i) => (
        <div className="ep" key={e.id}>
          <div className="ep-top">
            <input className="input" value={e.name} onChange={(ev) => upd(i, { name: ev.target.value })} aria-label="Endpoint name" placeholder="Name" />
            <select className="select" value={e.method} onChange={(ev) => upd(i, { method: ev.target.value })} aria-label="Method">{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            <input className="input" value={e.path} onChange={(ev) => upd(i, { path: ev.target.value })} aria-label="Path" placeholder="/path/{{incidentId}}" />
            <button className="btn sm danger" onClick={() => set({ endpoints: c.endpoints.filter((_, j) => j !== i) })}>Remove</button>
          </div>
          {e.method !== "GET" && <textarea className="textarea" rows={3} value={e.body} onChange={(ev) => upd(i, { body: ev.target.value })} aria-label="JSON body template" placeholder={'{"work_notes": "{{note}}"}'} />}
          <div className="row" style={{ marginTop: 6 }}>
            <button className="btn sm" onClick={() => run(e)} disabled={out[e.id]?.busy}>{out[e.id]?.busy ? "Running…" : "Run test"}</button>
            {e.method !== "GET" && <span className="help">⚠ Runs the real request.</span>}
          </div>
          {out[e.id]?.text && <pre className={`result ${out[e.id].ok ? "" : "bad"}`} style={{ marginTop: 6 }}>{out[e.id].text}</pre>}
        </div>
      ))}
    </div>
  );
}

export default function ConnectorForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { connectors, upsertConnector } = useConfig();
  const existing = connectors.find((c) => c.id === id);
  const [c, setC] = useState(() => existing || blankConnector(params.get("kind") === "mcp" ? "mcp" : "api"));
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const vstatus = useVault((s) => s.status);
  const set = (p) => setC((x) => ({ ...x, ...p }));
  const needsSecret = c.auth.type !== "none";
  const blocked = needsSecret && vstatus !== "unlocked";

  if (id !== "new" && !existing) return <div className="panel">Connector not found. <Link to="/admin/connectors">Back</Link></div>;

  const save = async (patch = {}) => {
    if (!c.name.trim()) throw new Error("Name is required");
    if (!/^https?:\/\//i.test(c.baseUrl)) throw new Error("URL must start with http:// or https://");
    if (needsSecret && secret) await vault.set(c.id, secret);
    if (!needsSecret) { try { await vault.set(c.id, ""); } catch { /* locked */ } }
    const next = { ...c, ...patch, baseUrl: c.baseUrl.trim(), headers: c.headers.filter((h) => h.key) };
    upsertConnector(next);
    setC(next); setSecret("");
    return next;
  };

  const onSave = async () => {
    setBusy(true); setMsg(null);
    try { await save(); nav("/admin/connectors"); } catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy(false);
  };

  const onTest = async () => {
    setBusy(true); setMsg(null);
    try {
      const saved = await save();
      let r;
      try { r = await testConnector(saved); } catch (e) { r = { ok: false, ms: 0, detail: e.message }; }
      const lastTest = { ok: r.ok, at: Date.now(), detail: r.detail, ms: r.ms };
      const patch = { lastTest, ...(r.tools ? { tools: r.tools } : {}) };
      upsertConnector({ ...saved, ...patch }); setC((x) => ({ ...x, ...patch }));
      setMsg({ ok: r.ok, text: (r.ok ? "✓ " : "✗ ") + r.detail + (r.ok ? ` (${r.ms} ms)` : "") });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    setBusy(false);
  };

  const isMcp = c.kind === "mcp";
  return (
    <>
      <p style={{ margin: "0 0 8px" }}><Link to="/admin/connectors">← Connectors</Link></p>
      <h1>{existing ? "Edit" : "Add"} {isMcp ? "MCP server" : "API"}</h1>
      <p className="lead">{isMcp ? "Streamable-HTTP MCP servers are supported. Use “Save & discover tools” to list what the server offers." : "A REST/JSON API. Define the endpoints you want panels to call."}</p>

      <div className="panel">
        <div className="grid2">
          <div className="fg"><label htmlFor="n">Name</label><input id="n" className="input" value={c.name} onChange={(e) => set({ name: e.target.value })} placeholder={isMcp ? "Traversal MCP" : "ServiceNow"} /></div>
          <div className="fg"><label htmlFor="u">{isMcp ? "MCP endpoint URL" : "Base URL"}</label><input id="u" className="input" value={c.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} placeholder={isMcp ? "https://mcp.example.com/mcp" : "https://instance.service-now.com"} /></div>
          {!isMcp && <div className="fg"><label htmlFor="h">Health-check path (optional)</label><input id="h" className="input" value={c.healthPath} onChange={(e) => set({ healthPath: e.target.value })} placeholder="/api/now/table/sys_properties?sysparm_limit=1" /></div>}
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 10 }}>Authentication</h2>
        <div className="grid3">
          <div className="fg"><label htmlFor="at">Type</label>
            <select id="at" className="select" value={c.auth.type} onChange={(e) => set({ auth: { ...c.auth, type: e.target.value } })}>
              <option value="none">None</option><option value="bearer">Bearer token</option><option value="basic">Basic (user + password)</option><option value="header">Custom header</option>
            </select></div>
          {c.auth.type === "basic" && <div className="fg"><label htmlFor="au">Username</label><input id="au" className="input" value={c.auth.username || ""} onChange={(e) => set({ auth: { ...c.auth, username: e.target.value } })} autoComplete="off" /></div>}
          {c.auth.type === "header" && <div className="fg"><label htmlFor="ah">Header name</label><input id="ah" className="input" value={c.auth.headerName || ""} onChange={(e) => set({ auth: { ...c.auth, headerName: e.target.value } })} placeholder="X-API-Key" /></div>}
          {needsSecret && <div className="fg"><label htmlFor="as">{c.auth.type === "basic" ? "Password" : c.auth.type === "bearer" ? "Token" : "Value"}</label>
            <input id="as" className="input" type="password" autoComplete="new-password" value={secret} onChange={(e) => setSecret(e.target.value)} disabled={blocked} placeholder={vault.has(c.id) ? "•••••••• stored (leave blank to keep)" : "Paste credential"} /></div>}
        </div>
        {blocked && <div style={{ marginTop: 12 }}><VaultControl /></div>}
        <h2 style={{ margin: "16px 0 8px" }}>Static headers <span className="muted" style={{ fontWeight: 400 }}>(non-secret)</span></h2>
        {c.headers.map((h, i) => (
          <div className="kv" key={i} style={{ gridTemplateColumns: "1fr 1.5fr auto" }}>
            <input className="input" value={h.key} placeholder="Header" aria-label="Header name" onChange={(e) => set({ headers: c.headers.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)) })} />
            <input className="input" value={h.value} placeholder="Value" aria-label="Header value" onChange={(e) => set({ headers: c.headers.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
            <button className="btn sm" onClick={() => set({ headers: c.headers.filter((_, j) => j !== i) })} aria-label="Remove header">✕</button>
          </div>
        ))}
        <button className="btn sm" onClick={() => set({ headers: [...c.headers, { key: "", value: "" }] })}>+ Add header</button>
      </div>

      {!isMcp && <Endpoints c={c} set={set} />}
      {isMcp && !!c.tools?.length && (
        <div className="panel">
          <h2 style={{ marginBottom: 8 }}>Discovered tools ({c.tools.length})</h2>
          {c.tools.map((t) => <div className="tool" key={t.name}><b>{t.name}</b><div className="sec">{t.description}</div>{t.inputSchema?.properties && <div className="help mono">args: {Object.keys(t.inputSchema.properties).join(", ")}</div>}</div>)}
        </div>
      )}

      {msg && <div className={`notice ${msg.ok ? "info" : ""}`} role="status">{msg.text}</div>}
      <div className="row">
        <button className="btn primary" disabled={busy || blocked} onClick={onSave}>Save</button>
        <button className="btn" disabled={busy || blocked} onClick={onTest}>{isMcp ? "Save & discover tools" : "Save & test connection"}</button>
        <Link className="btn link" to="/admin/connectors">Cancel</Link>
      </div>
    </>
  );
}
