import { useState } from "react";
import { Modal } from "./Common";

const templates = (v) => ({
  teams: `🚨 ${v.incident.severity || "P1"} INCIDENT SITREP: ${v.incident.id}\nStatus: ${v.phase.toUpperCase()}\nHeadline: ${v.headline}\nBusiness impact: ~${v.usersImpacted.toLocaleString()} customers affected. Error rate ${Number(v.errorRate).toFixed(1)}%.\nLikely cause: ${v.hypotheses[0]?.statement || "under investigation"}${v.hypotheses[0] ? ` (${v.hypotheses[0].confidence}% confidence)` : ""}\nOpen actions: ${v.actions.filter((a) => !a.done).length}`,
  statuspage: `${v.resolved ? "Resolved" : "Investigating"} — Some customers may be unable to complete checkout.\nWe are aware of an issue affecting checkout${v.resolved ? " that has now been resolved" : " and our teams are actively working on it"}. We will post another update within 30 minutes.`,
  it: `[IT SERVICE DESK] ${v.incident.id} — ${v.incident.severity || "P1"} — ${v.headline}\nUsers may report checkout failures. Please link related tickets to ${v.incident.id} and do not escalate individually.\nBridge: Teams "MIM ${v.incident.id}".`,
});
const TABS = [["teams", "Teams / Slack"], ["statuspage", "Status page"], ["it", "Service desk"]];

export default function CommsModal({ view, onClose, notify }) {
  const [tab, setTab] = useState("teams");
  const [edits, setEdits] = useState({});
  const t = templates(view);
  const text = edits[tab] ?? t[tab];
  return (
    <Modal title="Stakeholder Comms Generator" tag="COMMS" onClose={onClose}
      foot={<button className="btn primary" onClick={async () => { try { await navigator.clipboard.writeText(text); notify("Copied to clipboard"); onClose(); } catch { notify("Copy blocked by browser — select the text manually"); } }}>Copy to clipboard</button>}>
      <div className="seg" style={{ alignSelf: "flex-start" }}>{TABS.map(([k, l]) => <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
      <textarea className="textarea" rows={9} value={text} onChange={(e) => setEdits({ ...edits, [tab]: e.target.value })} aria-label="Message draft" />
      <div className="help">Drafts are generated from current incident data and can be edited before copying.</div>
    </Modal>
  );
}
