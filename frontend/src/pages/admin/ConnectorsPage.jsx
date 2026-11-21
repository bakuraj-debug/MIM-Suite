import { Link, useNavigate } from "react-router-dom";
import { useConfig } from "../../store/config";
import { vault } from "../../lib/vault";

export default function ConnectorsPage() {
  const { connectors, bindings, patchConnector, removeConnector } = useConfig();
  const nav = useNavigate();
  const usage = (id) => Object.entries(bindings).filter(([, b]) => b.connectorId === id).map(([k]) => k);
  return (
    <>
      <div className="row sp" style={{ alignItems: "flex-start" }}>
        <div><h1>Connectors</h1><p className="lead">Register the REST APIs and MCP servers the cockpit can pull from (ServiceNow, CMDB BlastRadius, Traversal, …). Then map them to dashboard panels under <Link to="/admin/bindings">Data bindings</Link>.</p></div>
        <div className="row">
          <button className="btn primary" onClick={() => nav("/admin/connectors/new?kind=api")}>+ Add API</button>
          <button className="btn primary" onClick={() => nav("/admin/connectors/new?kind=mcp")}>+ Add MCP server</button>
        </div>
      </div>
      {!connectors.length && (
        <div className="panel" style={{ textAlign: "center", padding: 36 }}>
          <b>No connectors yet</b>
          <p className="sec" style={{ margin: "6px 0 0" }}>The cockpit is running on demo data. Add an API or MCP server to go live.</p>
        </div>
      )}
      {connectors.map((c) => (
        <div className="conn" key={c.id} style={c.enabled === false ? { opacity: 0.6 } : null}>
          <span className={`kind ${c.kind}`}>{c.kind.toUpperCase()}</span>
          <div className="grow">
            <div className="name">{c.name}</div>
            <div className="url">{c.baseUrl || "(no URL)"}</div>
            <div className="help">
              {c.kind === "mcp" ? `${c.tools?.length || 0} tools discovered` : `${c.endpoints?.length || 0} endpoints`}
              {usage(c.id).length ? ` · used by: ${usage(c.id).join(", ")}` : " · not bound"}
              {c.auth?.type !== "none" && ` · auth: ${c.auth.type}${vault.has(c.id) ? "" : " (secret not available)"}`}
            </div>
          </div>
          {c.lastTest && <span className={`badge ${c.lastTest.ok ? "live" : "err"}`} title={`${c.lastTest.detail} · ${new Date(c.lastTest.at).toLocaleString()}`}>{c.lastTest.ok ? `OK ${c.lastTest.ms}ms` : "Failed"}</span>}
          <label className="row" style={{ fontSize: 11.5 }}><input type="checkbox" checked={c.enabled !== false} onChange={(e) => patchConnector(c.id, { enabled: e.target.checked })} /> Enabled</label>
          <Link className="btn sm" to={`/admin/connectors/${c.id}`}>Edit</Link>
          <button className="btn sm danger" onClick={async () => { if (confirm(`Delete "${c.name}"? Its bindings will be removed.`)) { removeConnector(c.id); try { await vault.set(c.id, ""); } catch { /* vault locked: orphan secret is harmless */ } } }}>Delete</button>
        </div>
      ))}
    </>
  );
}
