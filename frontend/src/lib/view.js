// Pure: merges slot data (demo or live) with local operator overlays into what the UI renders.
import { demo, defaultsAfterRecovery } from "../data/demo.js";

export const emptyLocal = () => ({
  phase: null, headline: null, done: {}, addedActions: [], notes: [], confirmed: {},
  addedPrecedents: {}, recovery: false, syncCount: 0,
});

export function deriveView(slots, local) {
  // A bound slot never falls back to demo data (stale demo numbers during a real incident would mislead).
  const EMPTY = { incident: { id: "—", headline: "Waiting for incident data…" }, topology: { nodes: [], edges: [] } };
  const get = (k) => (slots[k] ? slots[k].data ?? EMPTY[k] ?? [] : demo[k]);
  const incident = get("incident");
  const phase = local.phase || incident.phase || "investigating";
  const resolved = phase === "resolved";

  // Figures that move when the operator approves rollback / resolves — only synthesized for demo data.
  const incidentIsDemo = !slots.incident;
  let usersImpacted = incident.usersImpacted ?? 0, errorRate = incident.errorRate ?? 0;
  if (incidentIsDemo && (local.recovery || phase === "mitigating")) ({ usersImpacted, errorRate } = defaultsAfterRecovery);
  if (incidentIsDemo && resolved) { usersImpacted = 0; errorRate = 0.3; }

  let kpis = get("kpis");
  if (!slots.kpis && incidentIsDemo) {
    kpis = kpis.map((k) => (k.key === "users" ? { ...k, value: usersImpacted } : k.key === "err" ? { ...k, value: errorRate } : k));
  }

  const actions = [...local.addedActions, ...get("actions")].map((a) =>
    a.id in local.done ? { ...a, ...local.done[a.id] } : a
  );
  const hypotheses = get("hypotheses").map((h) => (h.id in local.confirmed ? { ...h, status: local.confirmed[h.id] ? "confirmed" : "open" } : h));
  const precedents = get("precedents").map((p) => ({ ...p, addedToActions: !!local.addedPrecedents[p.id] }));

  return {
    incident, phase, resolved, usersImpacted, errorRate, kpis, actions, hypotheses, precedents,
    headline: local.headline ?? incident.headline,
    decision: resolved || phase === "mitigating" ? null : incident.decision || null,
    topology: get("topology"), timeline: [...local.notes, ...get("timeline")], bridge: get("bridge"),
  };
}

export function elapsedFor(incident, loadedAtMs, nowMs) {
  const started = incident.startedAt ? Date.parse(incident.startedAt) : null;
  return started ? (nowMs - started) / 1000 : (incident.elapsedSec ?? 0) + (nowMs - loadedAtMs) / 1000;
}

/** Sparkline polyline path for a 96×36 box. */
export function sparkPath(series, w = 96, h = 36, pad = 4) {
  if (!series || series.length < 2) return "";
  const min = Math.min(...series), max = Math.max(...series), span = max - min || 1;
  return series.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (series.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

/** Column/row layout for topology SVG. */
export function layoutTopology(topo, { nodeW = 170, nodeH = 92, colGap = 90, rowGap = 28, padX = 24, padTop = 40 } = {}) {
  const tiers = [...new Set(topo.nodes.map((n) => n.tier))].sort((a, b) => a - b);
  const pos = {};
  let maxRows = 1;
  tiers.forEach((t, ci) => {
    const col = topo.nodes.filter((n) => n.tier === t);
    maxRows = Math.max(maxRows, col.length);
    col.forEach((n, ri) => { pos[n.id] = { x: padX + ci * (nodeW + colGap), y: padTop + ri * (nodeH + rowGap), tierIndex: ci }; });
  });
  const width = padX * 2 + tiers.length * nodeW + (tiers.length - 1) * colGap;
  const height = padTop + maxRows * nodeH + (maxRows - 1) * rowGap + 20;
  const edges = (topo.edges || []).filter((e) => pos[e.from] && pos[e.to]).map((e) => {
    const a = pos[e.from], b = pos[e.to];
    const x1 = a.x + nodeW, y1 = a.y + nodeH / 2, x2 = b.x, y2 = b.y + nodeH / 2, mx = (x1 + x2) / 2;
    return { ...e, d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}` };
  });
  return { tiers, pos, width, height, edges, nodeW, nodeH, padX, colGap };
}
