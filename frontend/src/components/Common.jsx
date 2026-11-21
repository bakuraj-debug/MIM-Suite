import { useOps } from "../store/ops";

export function SlotBadge({ slot }) {
  const s = useOps((st) => st.slots[slot]);
  if (!s) return <span className="badge" title="No connector bound — showing demo data">Demo</span>;
  if (s.status === "live") return <span className="badge live" title={`Updated ${new Date(s.updatedAt).toLocaleTimeString()}`}>Live</span>;
  if (s.status === "error") return <span className="badge err" title={s.error}>Error</span>;
  return <span className="badge load">Loading</span>;
}
export function SlotError({ slot }) {
  const s = useOps((st) => st.slots[slot]);
  return s?.status === "error" ? <div className="notice" style={{ margin: 10 }}>⚠ {s.error}</div> : null;
}
export const Src = ({ s }) => <span className={`src ${String(s).toLowerCase()}`}>{s}</span>;
export function Modal({ title, tag, onClose, children, foot, wide }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { width: 900 } : null}>
        <div className="modal-h">
          <div className="row">{tag && <span className="src cmdb">{tag}</span>}<h3 style={{ margin: 0, fontSize: 14 }}>{title}</h3></div>
          <button className="btn sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-b">{children}</div>
        {foot && <div className="modal-f">{foot}</div>}
      </div>
    </div>
  );
}
