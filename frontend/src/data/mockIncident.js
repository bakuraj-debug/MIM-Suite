export const mockIncident = {
  incidentId: "INC16852714",
  priority: "P1 Critical",
  status: "Active / Investigating",
  location: "Europe · Russia · Stupino PO1",
  application: "gTMS Print Service",
  issue: "Unable to print shipment lists",
  businessImpact: "15 trucks delayed, 45 trucks queuing, 3,200+ users affected",
  rootCause: "Archive diskgroup saturation at 97%",
  runbook: "RB-2241",
  contacts: {
    resolverManager: "Khushboo Atri",
    dba: "Rajesh Kumar",
    serviceOwner: "Dmitriy Sokolov",
    vpEngineering: "Vandana Sharma",
    ctoOnCall: "James Mitchell",
  },
  slaSecondsRemaining: 7260,
};

export const mockTimeline = [
  { time: "08:12 UTC", event: "Alert triggered for print service failures" },
  { time: "08:19 UTC", event: "Major incident bridge opened" },
  { time: "08:34 UTC", event: "Traversal AI suggested diskgroup saturation pattern" },
  { time: "08:47 UTC", event: "DBA engaged for archive clean-up" },
];

export const mockActions = [
  { id: "A-101", owner: "Rajesh Kumar", task: "Free archive disk space by 20%", status: "In Progress" },
  { id: "A-102", owner: "Khushboo Atri", task: "Broadcast update to logistics ops", status: "Pending Approval" },
  { id: "A-103", owner: "Dmitriy Sokolov", task: "Validate print spooler recovery", status: "Pending" },
];
