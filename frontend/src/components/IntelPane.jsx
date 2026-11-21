import { useState } from "react";
import { useOps } from "../store/ops";
import { approveRollback } from "../lib/actions";
import { SlotBadge, SlotError, Src } from "./Common";

function DecisionGate({ d }) {
  const [deferred, setDeferred] = useState(false);
  const notify = useOps((s) => s.notify);
  const [busy, setBusy] = useState(false);
  return (
    <div className="gate">
      <div className="row sp" style={{ marginBottom: 4 }}>
        <Src s={d.source || "TRV"} />
        <span className="mono" style={{ fontSize: 10.5, color: "var(--amber)" }}>
          {deferred ? "Deferred 10 min" : `Decision Window · ${d.minutesRemaining ?? "?"} min remaining`}
        </span>
      </div>
      <h2>{d.question}</h2>
      <div className="sec" style={{ fontSize: 11.5, marginBottom: 8 }}>{d.detail}</div>
      <div className="row">
        <button className="btn sm good" disabled={busy} onClick={async () => { setBusy(true); await approveRollback(); setBusy(false); }}>Approve Rollback</button>
        <button className="btn sm" onClick={() => { setDeferred(true); notify("Decision deferred 10 minutes"); }}>Defer 10m</button>
      </div>
    </div>
  );
}

export default function IntelPane({ view, tab, setTab, ciFilter, setCiFilter }) {
  const patchLocal = useOps((s) => s.patchLocal);
  const notify = useOps((s) => s.notify);
  const [type, setType] = useState("ALL");
  const types = ["ALL", ...new Set(view.precedents.map((p) => p.type).filter(Boolean))];
  const prec = view.precedents.filter((p) => (type === "ALL" || p.type === type) && (!ciFilter || p.ci === ciFilter));

  const addFix = (p) => {
    patchLocal((l) => ({
      addedPrecedents: { ...l.addedPrecedents, [p.id]: true },
      addedActions: [{ id: "a-" + p.id, title: p.actionText || p.fixText, owner: "Unassigned", team: `From ${p.id}`, done: false }, ...l.addedActions],
    }));
    notify(`Added verified fix from ${p.id} to Actions`);
  };

  return (
    <section className="pane">
      {view.decision && <DecisionGate d={view.decision} />}
      <div className="intel-bar">
        <div className="seg">
          <button className={tab === "causal" ? "active" : ""} onClick={() => setTab("causal")}>Causal Engine <SlotBadge slot="hypotheses" /></button>
          <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>Historical Insights ({view.precedents.length})</button>
        </div>
      </div>
      {tab === "causal" ? <SlotError slot="hypotheses" /> : <SlotError slot="precedents" />}
      <div className="scroll">
        {tab === "causal" && (view.hypotheses.length ? view.hypotheses.map((h) => (
          <div key={h.id} className={`card ${h.status === "confirmed" ? "confirmed" : ""}`}>
            <div className="row sp" style={{ marginBottom: 4 }}>
              <span className="conf">Rank #{h.rank} · {h.confidence}% Conf</span><Src s={h.source || "TRV"} />
            </div>
            <p style={{ margin: "0 0 6px", fontWeight: 500, fontSize: 12 }}>{h.statement}</p>
            {!!h.evidence?.length && <ul style={{ margin: "0 0 8px", paddingLeft: 16, fontSize: 11, color: "var(--ink-secondary)" }}>{h.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>}
            <button className="btn sm" onClick={() => patchLocal((l) => ({ confirmed: { ...l.confirmed, [h.id]: h.status !== "confirmed" } }))}>
              {h.status === "confirmed" ? "✓ Confirmed" : "Confirm Cause"}
            </button>
          </div>
        )) : <div className="empty">No hypotheses yet.</div>)}
        {tab === "history" && (
          <>
            <div className="row sp">
              <div className="chips">{types.map((t) => <button key={t} className={`chip ${type === t ? "on" : ""}`} onClick={() => setType(t)}>{t}</button>)}</div>
              {ciFilter && <button className="chip on" onClick={() => setCiFilter(null)}>CI: {ciFilter} ✕</button>}
            </div>
            {prec.length ? prec.map((p) => (
              <div className="card" key={p.id}>
                <div className="row sp" style={{ marginBottom: 4 }}>
                  <b className="mono">{p.id} ({p.typeLabel || p.type})</b>
                  <span className="mono" style={{ color: "var(--emerald)", fontSize: 10 }}>{p.matchPct}% Match</span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11.5 }}>{p.symptom}</p>
                <div className="fix"><strong>Verified Fix:</strong> {p.fixText}</div>
                <div style={{ marginTop: 6 }}>
                  <button className="btn sm primary" disabled={p.addedToActions} onClick={() => addFix(p)}>{p.addedToActions ? "Added to Actions" : "+ Add Fix to Actions"}</button>
                </div>
              </div>
            )) : <div className="empty">No matching precedents.</div>}
          </>
        )}
      </div>
    </section>
  );
}
