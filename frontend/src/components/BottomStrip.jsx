import { useState } from "react";
import { useOps } from "../store/ops";
import { useConfig } from "../store/config";
import { postWorkNote } from "../lib/actions";
import { utcHHMM } from "../lib/util";
import { SlotBadge, SlotError, Src } from "./Common";

function Timeline({ items }) {
  const [filter, setFilter] = useState("ALL");
  const [text, setText] = useState("");
  const { patchLocal, notify } = useOps();
  const srcs = ["ALL", ...new Set(items.map((i) => i.src))];
  const shown = items.filter((i) => filter === "ALL" || i.src === filter);
  return (
    <div className="strip-pane">
      <div className="strip-head">
        <div className="row"><Src s="LOG" /><h2>Unified Audit Timeline</h2><SlotBadge slot="timeline" /></div>
        <div className="seg">{srcs.map((s) => <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>{s === "ALL" ? "All" : s}</button>)}</div>
      </div>
      <SlotError slot="timeline" />
      <div className="feed">
        {shown.map((e, i) => (
          <div className="tl" key={i}><span className="mono muted">{e.time}</span><Src s={e.src} /><span>{e.text}</span></div>
        ))}
        {!shown.length && <div className="empty">No events.</div>}
      </div>
      <form className="quick" onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        patchLocal((l) => ({ notes: [{ time: utcHHMM(), src: "IC", text: text.trim() }, ...l.notes] }));
        setText(""); notify("Note added to timeline");
      }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add incident note to timeline…" aria-label="Incident note" />
        <button className="btn sm primary" style={{ height: 30 }}>Log Note</button>
      </form>
    </div>
  );
}

function Ops({ view }) {
  const [tab, setTab] = useState("actions");
  const [newAct, setNewAct] = useState("");
  const [note, setNote] = useState("");
  const [setState, setSetState] = useState(false);
  const [busy, setBusy] = useState(false);
  const { patchLocal, notify } = useOps();
  const syncCount = useOps((s) => s.local.syncCount);
  const hasWorkNote = useConfig((s) => !!s.bindings.workNote);
  const defaultNote = `MIM update: ${view.headline}. Error rate ${view.errorRate}%. Phase: ${view.phase}.`;

  const toggle = (a, done) => patchLocal((l) => ({ done: { ...l.done, [a.id]: done ? { done, completedBy: a.owner, completedTeam: a.team, completedAt: `${utcHHMM()} UTC` } : { done, completedBy: null, completedTeam: null, completedAt: null } } }));

  return (
    <div className="strip-pane">
      <div className="strip-head">
        <div className="seg">
          <button className={tab === "actions" ? "active" : ""} onClick={() => setTab("actions")}>Actions Checklist</button>
          <button className={tab === "bridge" ? "active" : ""} onClick={() => setTab("bridge")}>Teams Bridge ({view.bridge.length})</button>
          <button className={tab === "sync" ? "active" : ""} onClick={() => setTab("sync")}>ServiceNow Sync</button>
        </div>
        <span className="badge" title="Work notes posted this session">{hasWorkNote ? "Connected" : "Demo"} · {syncCount} posted</span>
      </div>
      <div className="feed">
        {tab === "actions" && (
          <>
            <SlotError slot="actions" />
            {view.actions.map((a) => (
              <label className="ops-row" key={a.id}>
                <input type="checkbox" checked={!!a.done} onChange={(e) => toggle(a, e.target.checked)} style={{ accentColor: "var(--emerald)" }} />
                <span style={{ flex: 1, ...(a.done ? { textDecoration: "line-through", color: "var(--ink-muted)" } : null) }}>{a.title}</span>
                <span className="mono muted" style={{ fontSize: 10 }}>{a.owner}</span>
              </label>
            ))}
            <form style={{ display: "flex", gap: 6, marginTop: 8 }} onSubmit={(e) => {
              e.preventDefault();
              if (!newAct.trim()) return;
              patchLocal((l) => ({ addedActions: [{ id: "a" + Date.now(), title: newAct.trim(), owner: "Unassigned", team: "Incident Command", done: false }, ...l.addedActions] }));
              setNewAct(""); notify("Action added");
            }}>
              <input className="input" value={newAct} onChange={(e) => setNewAct(e.target.value)} placeholder="Add operational action…" aria-label="New action" />
              <button className="btn sm primary" style={{ height: 30 }}>Add</button>
            </form>
          </>
        )}
        {tab === "bridge" && (<><SlotError slot="bridge" />{view.bridge.map((b, i) => (
          <div className="ops-row" key={i} style={{ justifyContent: "space-between" }}>
            <div><b>{b.team}</b><br /><span className="sec" style={{ fontSize: 11 }}>{b.engineer}</span></div>
            <span className={`sev-pill ${b.status === "on-bridge" ? "ok" : ""}`} style={{ height: 20, fontSize: 10 }}>{b.status}</span>
          </div>))}</>)}
        {tab === "sync" && (
          <>
            <div className="sec" style={{ fontSize: 11, marginBottom: 6 }}>
              {hasWorkNote ? "Posts through the “Post work note” connector binding." : "Demo mode — add a work-note binding in Admin → Data bindings to send this to ServiceNow."}
            </div>
            <textarea className="textarea" rows={3} value={note || defaultNote} onChange={(e) => setNote(e.target.value)} aria-label="Work note" />
            <div className="row sp" style={{ marginTop: 8 }}>
              <label style={{ fontSize: 11.5 }}><input type="checkbox" checked={setState} onChange={(e) => setSetState(e.target.checked)} /> Also set state to <b>{view.phase.toUpperCase()}</b></label>
              <button className="btn sm primary" disabled={busy} onClick={async () => { setBusy(true); await postWorkNote(note || defaultNote, setState); setBusy(false); }}>Post to ServiceNow</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BottomStrip({ view }) {
  return <div className="strip"><Timeline items={view.timeline} /><Ops view={view} /></div>;
}
