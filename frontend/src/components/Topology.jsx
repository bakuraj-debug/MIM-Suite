import { useState } from "react";
import { useOps } from "../store/ops";
import { layoutTopology } from "../lib/view";
import { clip } from "../lib/util";
import { pingOwner } from "../lib/actions";
import { SlotBadge, SlotError, Src } from "./Common";

const STATUS_LABEL = { critical: "Critical", "at-risk": "At risk", healthy: "Healthy", change: "Trigger" };

function Graph({ topo, selected, onSelect }) {
  const L = layoutTopology(topo);
  const labels = topo.tierLabels || [];
  return (
    <div className="topo">
      <svg viewBox={`0 0 ${L.width} ${L.height}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label="Dependency topology">
        {L.tiers.map((t, i) => (
          <text key={t} className="tier-label" x={L.padX + i * (L.nodeW + L.colGap)} y="22">{clip(labels[i] || `Tier ${t}`, 30).toUpperCase()}</text>
        ))}
        {L.edges.map((e, i) => <path key={i} className={`edge ${e.state || ""}`} d={e.d} />)}
        {topo.nodes.map((n) => {
          const p = L.pos[n.id], st = n.status || "unknown";
          return (
            <g key={n.id} className={`node ${selected === n.id ? "sel" : ""}`} transform={`translate(${p.x},${p.y})`}
               tabIndex={0} role="button" aria-label={`${n.name}, ${STATUS_LABEL[st] || st}`} aria-pressed={selected === n.id}
               onClick={() => onSelect(n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(n.id))}>
              <rect className="node-box" width={L.nodeW} height={L.nodeH} rx="6" />
              <rect className={`bar-${st}`} width="4" height={L.nodeH} rx="2" />
              <text x="12" y="20" className="node-title">{clip(n.name, 22)}</text>
              <text x="12" y="37" className="node-sub">{clip(n.subtitle, 26)}</text>
              <text x="12" y="62" className={`node-metric m-${st}`}>{clip(n.metric, 24)}</text>
              <text x="12" y="80" className="node-sub">{clip(n.footnote || n.owner, 26)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TopologyPane({ topo, precedents, onHistory }) {
  const [tab, setTab] = useState("graph");
  const sel = useOps((s) => s.selectedNode);
  const select = useOps((s) => s.selectNode);
  const node = topo.nodes.find((n) => n.id === sel) || topo.nodes.find((n) => n.status === "critical") || topo.nodes[0];
  const past = node ? precedents.filter((p) => p.ci === node.id).length : 0;

  return (
    <section className="pane">
      <div className="pane-head">
        <div className="row"><Src s="CMDB" /><h2>BlastRadius Dependency Topology</h2><SlotBadge slot="topology" /></div>
        <div className="seg">
          <button className={tab === "graph" ? "active" : ""} onClick={() => setTab("graph")}>Topology Graph</button>
          <button className={tab === "table" ? "active" : ""} onClick={() => setTab("table")}>Impact Table</button>
        </div>
      </div>
      <SlotError slot="topology" />
      {!topo.nodes.length ? <div className="empty">No configuration items to display.</div> : tab === "graph"
        ? <Graph topo={topo} selected={node?.id} onSelect={select} />
        : (
          <div style={{ flex: 1, overflow: "auto" }}>
            <table className="t">
              <thead><tr><th>Configuration Item</th><th>Tier</th><th>Owner / Team</th><th>Status</th><th>Impact</th></tr></thead>
              <tbody>
                {topo.nodes.map((n) => (
                  <tr key={n.id} className={node?.id === n.id ? "sel" : ""} onClick={() => select(n.id)}>
                    <td className="mono">{n.name}</td><td>{n.type || `Tier ${n.tier}`}</td><td>{n.owner}</td>
                    <td><span className={`pill ${n.status}`}>{STATUS_LABEL[n.status] || n.status}</span></td><td className="mono">{n.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {node && (
        <div className="inspector">
          <div className="fields">
            <div className="field"><span className="l">Selected CI</span><span className="v mono">{node.name}</span></div>
            <div className="field"><span className="l">Assignment Group</span><span className="v">{node.owner || "—"}</span></div>
            <div className="field"><span className="l">On-Call Engineer</span><span className="v">{node.engineer || "—"}</span></div>
          </div>
          <div className="row">
            <button className="btn sm" onClick={() => onHistory(node.id)}>Past Incidents ({past}) →</button>
            <button className="btn sm primary" onClick={() => pingOwner(node)}>Ping Owner</button>
          </div>
        </div>
      )}
    </section>
  );
}
