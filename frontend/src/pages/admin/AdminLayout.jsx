import { NavLink, Outlet } from "react-router-dom";
import { useConfig } from "../../store/config";

export default function AdminLayout() {
  const nC = useConfig((s) => s.connectors.length);
  const nB = useConfig((s) => Object.keys(s.bindings).length);
  return (
    <div className="admin" style={{ minHeight: 0, overflow: "hidden" }}>
      <nav className="admin-nav" aria-label="Admin sections">
        <NavLink to="/admin/connectors">Connectors <span className="muted mono">{nC}</span></NavLink>
        <NavLink to="/admin/bindings">Data bindings <span className="muted mono">{nB}</span></NavLink>
        <NavLink to="/admin/settings">Settings &amp; vault</NavLink>
      </nav>
      <main className="admin-main"><div><Outlet /></div></main>
    </div>
  );
}
