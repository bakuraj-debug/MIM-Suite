import { SlotBadge, Src } from "./Common";

export default function Stakeholder({ view }) {
  const done = view.actions.filter((a) => a.done), open = view.actions.filter((a) => !a.done);
  const top = view.hypotheses[0];
  return (
    <div className="sitrep">
      <div className="sitrep-grid">
        <div className="sitrep-card">
          <h3><span className="row"><Src s="SN" /> Issue &amp; Impact</span><span className={`sev-pill ${view.resolved ? "ok" : ""}`}>{view.resolved ? "RESOLVED" : view.incident.severity || "P1"}</span></h3>
          <p style={{ fontWeight: 500, fontSize: 13.5, margin: 0 }}>{top?.statement || view.headline}</p>
          <div className="card" style={{ background: "var(--bg-raised)" }}>
            <div className="lbl" style={{ marginBottom: 4 }}>Business impact</div>
            <div className="sec">~{view.usersImpacted.toLocaleString()} customers affected · checkout error rate {Number(view.errorRate).toFixed(1)}% · status {view.phase}.</div>
          </div>
          <h3>Timeline <SlotBadge slot="timeline" /></h3>
          {view.timeline.map((e, i) => <div key={i} className="row" style={{ fontSize: 11.5, alignItems: "baseline" }}><span className="mono muted">{e.time}</span><Src s={e.src} /><span>{e.text}</span></div>)}
        </div>
        <div className="sitrep-card">
          <h3><span className="row"><Src s="OPS" /> Action attribution</span><span className="mono muted" style={{ fontSize: 11 }}>{done.length} of {view.actions.length} completed</span></h3>
          <div className="lbl">In progress</div>
          {open.map((a) => <div key={a.id} style={{ borderBottom: "1px solid var(--border)", padding: "4px 0" }}><b>{a.title}</b><br /><span className="sec" style={{ fontSize: 11 }}>Owner: {a.owner} ({a.team})</span></div>)}
          {!open.length && <div style={{ color: "var(--emerald)" }}>All actions completed.</div>}
          <div className="lbl" style={{ marginTop: 8 }}>Completed</div>
          {done.map((a) => <div key={a.id} className="muted" style={{ borderBottom: "1px solid var(--border)", padding: "4px 0" }}>✓ <s>{a.title}</s><br /><span style={{ fontSize: 11 }}>by {a.completedBy || a.owner} [{a.completedTeam || a.team}]{a.completedAt ? ` · ${a.completedAt}` : ""}</span></div>)}
          {!done.length && <div className="muted">None yet.</div>}
        </div>
      </div>
    </div>
  );
}
