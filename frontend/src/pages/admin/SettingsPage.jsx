import { useRef, useState } from "react";
import { useConfig, exportConfig } from "../../store/config";
import { vault, useVault } from "../../lib/vault";
import VaultControl from "../../components/VaultControl";

export default function SettingsPage() {
  const { settings, setSettings, importConfig, reset } = useConfig();
  const status = useVault((s) => s.status);
  const file = useRef();
  const [msg, setMsg] = useState("");

  const doExport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportConfig(), null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "mim-config.json" }).click();
    URL.revokeObjectURL(url);
  };
  const doImport = async (f) => {
    try {
      const cfg = JSON.parse(await f.text());
      if (!Array.isArray(cfg.connectors)) throw new Error("Not a MIM config file");
      importConfig(cfg); setMsg(`Imported ${cfg.connectors.length} connectors. Re-enter credentials in each connector (secrets are never exported).`);
    } catch (e) { setMsg("Import failed: " + e.message); }
    file.current.value = "";
  };

  return (
    <>
      <h1>Settings &amp; vault</h1>
      <p className="lead">Incident context, network routing, credential storage and config backup.</p>

      <div className="panel">
        <h2 style={{ marginBottom: 10 }}>Incident context</h2>
        <div className="grid2">
          <div className="fg"><label htmlFor="i1">Incident number</label><input id="i1" className="input" value={settings.incidentId} onChange={(e) => setSettings({ incidentId: e.target.value })} /><div className="help">Available to connectors as <code>{"{{incidentId}}"}</code></div></div>
          <div className="fg"><label htmlFor="i2">Change record</label><input id="i2" className="input" value={settings.changeId} onChange={(e) => setSettings({ changeId: e.target.value })} /><div className="help"><code>{"{{changeId}}"}</code></div></div>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 10 }}>Network</h2>
        <div className="fg"><label htmlFor="px">CORS proxy URL</label><input id="px" className="input" value={settings.proxyUrl} onChange={(e) => setSettings({ proxyUrl: e.target.value })} placeholder="(empty = call targets directly from the browser)" />
          <div className="help">Most enterprise APIs and MCP servers don’t allow browser cross-origin calls. The dev server provides <code>/__proxy</code> (restrict hosts with <code>MIM_PROXY_ALLOW=host1,host2</code>). For production, point this at an allow-listed server-side proxy that accepts <code>POST {"{url, method, headers, body}"}</code> and returns <code>{"{status, headers, body}"}</code>. Credentials are sent through this proxy, so only use one you control.</div></div>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 10 }}>Credential vault</h2>
        <VaultControl />
        {status !== "empty" && (
          <div className="row" style={{ marginTop: 12 }}>
            {status === "unlocked" && <button className="btn sm" onClick={() => vault.lock()}>Lock now</button>}
            <button className="btn sm danger" onClick={() => confirm("Delete the vault and ALL stored credentials?") && vault.destroy()}>Destroy vault</button>
          </div>
        )}
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: 10 }}>Backup</h2>
        <div className="row">
          <button className="btn" onClick={doExport}>Export config (no secrets)</button>
          <button className="btn" onClick={() => file.current.click()}>Import config…</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && doImport(e.target.files[0])} />
          <button className="btn danger" onClick={() => confirm("Remove all connectors and bindings?") && reset()}>Reset all</button>
        </div>
        {msg && <div className="notice info" style={{ marginTop: 10 }}>{msg}</div>}
      </div>
    </>
  );
}
