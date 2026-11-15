import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useConfig } from "../store/config";
import { useOps } from "../store/ops";
import { useVault } from "../lib/vault";
import { useDataSync } from "../hooks/useDataSync";
import { useView, useNow } from "../hooks/useView";
import { elapsedFor } from "../lib/view";
import { fmtClock } from "../lib/util";
import CommsModal from "./CommsModal";

const PHASES = [["investigating", "Investigating"], ["decision", "Decision"], ["mitigating", "Mitigating"], ["resolved", "Resolved"]];

function Clock({ view }) {
  const now = useNow();
  const loadedAt = useOps((s) => s.loadedAt);
  const frozen = useOps((s) => s.frozenAt);
  const sec = elapsedFor(view.incident, loadedAt, view.resolved && frozen ? frozen : now);
  return <div className="clock"><span className="k">Elapsed</span><span className="v">{fmtClock(sec)}</span></div>;
}

function CockpitBar({ view, onComms }) {
  const [params, setParams] = useSearchParams();
  const patchLocal = useOps((s) => s.patchLocal);
  const notify = useOps((s) => s.notify);
  const bindings = useConfig((s) => s.bindings);
  const theme = useConfig((s) => s.settings.theme);
  const setSettings = useConfig((s) => s.setSettings);
  const vault = useVault((s) => s.status);
  const liveCount = Object.keys(bindings).length;
  const summary = params.get("view") === "summary";

  const setPhase = (p) => {
    useOps.setState((s) => ({ frozenAt: p === "resolved" ? Date.now() : null }));
    patchLocal({ phase: p });
    notify(`Incident phase → ${p.toUpperCase()}`);
  };

  return (
    <header className="topbar">
      <div className="tb-left">
        <span className={`sev-pill ${view.resolved ? "ok" : ""}`}>{view.resolved ? "RESOLVED" : `${view.incident.severity || "P1"} CRITICAL`}</span>
        <span className="mono" style={{ fontWeight: 600 }}>{view.incident.id}</span>
        <span className="seg hide-sm" role="group" aria-label="Incident phase">
          {PHASES.map(([k, l]) => <button key={k} data-p={k} className={view.phase === k ? "active" : ""} onClick={() => setPhase(k)}>{l}</button>)}
        </span>
        <input className="headline" value={view.headline} onChange={(e) => patchLocal({ headline: e.target.value })} aria-label="Incident headline" />
      </div>
      <div className="tb-right">
        <Link to="/admin/bindings" className="btn sm" title="Manage connectors & data bindings">
          <span className={`dot ${liveCount ? (vault === "locked" ? "warn" : "ok") : ""}`} /> {liveCount ? `${liveCount} live source${liveCount > 1 ? "s" : ""}` : "Demo data"}
          {liveCount > 0 && vault === "locked" && <span className="mono"> · vault locked</span>}
        </Link>
        <button className="btn sm hide-sm" onClick={() => { const n = new URLSearchParams(params); summary ? n.delete("view") : n.set("view", "summary"); setParams(n); }}>{summary ? "MIM Cockpit" : "Shareable Summary"}</button>
        <button className="btn sm primary" onClick={onComms}>Draft Comms</button>
        <button className="btn sm" onClick={() => setSettings({ theme: theme === "dark" ? "light" : "dark" })} aria-label="Toggle theme">{theme === "dark" ? "☀" : "☾"}</button>
        <Link to="/admin" className="btn sm">⚙ Admin</Link>
        <Clock view={view} />
      </div>
    </header>
  );
}

function AdminBar() {
  return (
    <header className="topbar">
      <div className="tb-left"><b>MIM Suite</b><span className="muted">/ Admin portal</span></div>
      <div className="tb-right"><Link to="/" className="btn sm primary">← Back to cockpit</Link></div>
    </header>
  );
}

export default function Layout() {
  useDataSync();
  const view = useView();
  const { pathname } = useLocation();
  const toast = useOps((s) => s.toast);
  const notify = useOps((s) => s.notify);
  const theme = useConfig((s) => s.settings.theme);
  const [comms, setComms] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const admin = pathname.startsWith("/admin");

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    if (!toast) return;
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="shell">
      {admin ? <AdminBar /> : <CockpitBar view={view} onComms={() => setComms(true)} />}
      <Outlet />
      {comms && <CommsModal view={view} onClose={() => setComms(false)} notify={notify} />}
      <div className={`toast ${showToast ? "show" : ""}`} role="status" aria-live="polite">{toast?.msg}</div>
    </div>
  );
}
