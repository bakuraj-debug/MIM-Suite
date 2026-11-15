// Demo data — shown for any data slot that has no live binding. Also serves as the shape reference.
export const demo = {
  incident: {
    id: "INC0048213",
    severity: "P1",
    phase: "investigating", // investigating | decision | mitigating | resolved
    headline: "Checkout failing for ~45,200 EU customers on EU-1 gateway cluster",
    elapsedSec: 2781,
    usersImpacted: 45200,
    errorRate: 14.2,
    decision: {
      question: "Roll back release CHG0041872 on EU-1?",
      detail: "Root cause verified (86% confidence). Rolling back restores gateway connection pool limit to 50.",
      minutesRemaining: 8,
      source: "TRV",
    },
  },
  kpis: [
    { key: "users", source: "CMDB", label: "Users Impacted", value: 45200, unit: "EU", series: [28, 25, 18, 10, 8, 6], critical: true, format: "int" },
    { key: "err", source: "SN", label: "Checkout Error Rate", value: 14.2, unit: "%", series: [30, 28, 22, 14, 10, 8], critical: true, format: "1dp" },
    { key: "lat", source: "TRV", label: "p95 Latency", value: 6.8, unit: "s", series: [20, 19, 18, 15, 14, 12], format: "1dp" },
    { key: "bridge", source: "TM", label: "Bridge Teams", value: 2, unit: "of 4 needed", series: [], note: "● Connected" },
  ],
  topology: {
    tierLabels: ["Tier 1: Change & Root CI", "Tier 2: Platform Services", "Tier 3: Business Operations"],
    nodes: [
      { id: "CHG0041872", name: "CHG0041872", subtitle: "Connection Pool -50%", tier: 1, type: "Change", owner: "Payments Platform", engineer: "Priya N. (Available)", status: "change", metric: "Active Trigger", footnote: "Payments Platform" },
      { id: "eu1-pay-gw-cluster", name: "eu1-pay-gw", subtitle: "Gateway Pods", tier: 2, type: "Platform", owner: "Payments Platform", engineer: "Priya N. (Available)", status: "critical", metric: "14.2% Err Rate", footnote: "12 instances" },
      { id: "eu1-db-pool", name: "eu1-db-pool", subtitle: "HikariPool-1", tier: 2, type: "Platform", owner: "DB Operations", engineer: "Anil K. (Busy)", status: "at-risk", metric: "98% Saturation", footnote: "DB Ops" },
      { id: "Online-Checkout", name: "Online Checkout", subtitle: "EU-1 Retail Web & Mobile", tier: 3, type: "Business", owner: "Retail Ops", engineer: "Retail duty mgr", status: "critical", metric: "31,000 users impacted" },
      { id: "Mobile-Ordering", name: "Mobile Ordering App", subtitle: "EU Partner API Gateway", tier: 3, type: "Business", owner: "Digital App Team", engineer: "—", status: "at-risk", metric: "9,800 users at risk" },
    ],
    edges: [
      { from: "CHG0041872", to: "eu1-pay-gw-cluster", state: "fault" },
      { from: "CHG0041872", to: "eu1-db-pool", state: "fault" },
      { from: "eu1-pay-gw-cluster", to: "Online-Checkout", state: "fault" },
      { from: "eu1-pay-gw-cluster", to: "Mobile-Ordering", state: "risk" },
    ],
  },
  hypotheses: [
    { id: "h1", rank: 1, confidence: 86, status: "confirmed", statement: "Release CHG0041872 shrank HikariPool-1 connection pool limit from 50 to 10 on EU-1 gateway cluster.", evidence: ["[TRV] Connection pool timeout spikes began 6 min after deployment", "[SN] Change record CHG0041872 modified maxPoolSize parameter", "[CMDB] 12 of 12 gateway pods experiencing thread starvation"] },
    { id: "h2", rank: 2, confidence: 9, status: "open", statement: "Frankfurt CDN edge regional certificate handshake failure.", evidence: ["[TRV] 450 HTTP 502s recorded at Frankfurt pop edge", "[CMDB] TLS cert valid through Q3 2026"] },
  ],
  precedents: [
    { id: "INC0039102", type: "MIM", typeLabel: "Major Incident", ci: "eu1-pay-gw-cluster", matchPct: 94, symptom: "Checkout connection pool exhaustion following config push.", fixText: "Immediate rollback of change configuration and restart of HikariPool threads.", actionText: "Roll back connection pool configuration change" },
    { id: "PRB0008412", type: "PRB", typeLabel: "Problem", ci: "eu1-db-pool", matchPct: 88, symptom: "HikariPool-1 thread deadlock under high EU evening traffic.", fixText: "Increase connection timeout threshold to 30000ms and add pool sizing guardrail.", actionText: "Add pool-size guardrail to release pipeline checks" },
  ],
  timeline: [
    { time: "14:22", src: "TM", text: "Payments Platform and Cloud Infrastructure joined Teams Bridge." },
    { time: "14:14", src: "TRV", text: "Traversal AI correlated connection pool timeout with CHG0041872 (86% confidence)." },
    { time: "14:08", src: "SN", text: "INC0048213 raised to P1 by Priya N. Assignment group: Payments Platform." },
    { time: "14:02", src: "TRV", text: "Checkout error rate crossed 5% threshold in EU-1 region." },
  ],
  actions: [
    { id: "a1", title: "Approve & execute rollback of CHG0041872 on EU-1", owner: "Priya N.", team: "Incident Command", done: false },
    { id: "a2", title: "Engage Database Operations on Teams bridge", owner: "Duty Mgr", team: "MIM Operations", done: false },
    { id: "a3", title: "Publish EU Checkout status-page advisory", owner: "Marcus L.", team: "Cloud Infrastructure", done: false },
    { id: "a4", title: "Capture heap & thread dumps from gateway pods", owner: "Priya N.", team: "Payments Platform", done: true, completedBy: "Priya N.", completedTeam: "Payments Platform", completedAt: "14:29 UTC" },
  ],
  bridge: [
    { team: "Payments Platform", engineer: "Priya N.", status: "on-bridge" },
    { team: "Cloud Infrastructure", engineer: "Marcus L.", status: "on-bridge" },
    { team: "Database Operations", engineer: "Anil K.", status: "idle" },
  ],
};

export const defaultsAfterRecovery = { usersImpacted: 1200, errorRate: 2.1 };
