import { demo } from "./demo.js";

/**
 * Data slots the dashboard can read from a connector (kind:"read")
 * or fire into one (kind:"action").  `required` = fields every item must carry.
 */
export const SLOTS = [
  { key: "incident", kind: "read", shape: "object", label: "Incident header", hint: "id, severity, phase, headline, elapsedSec | startedAt, usersImpacted, errorRate, optional decision{}", required: ["id", "headline"], defaultRefresh: 30, hasCtx: ["incidentId"] },
  { key: "kpis", kind: "read", shape: "array", label: "KPI strip", hint: "Array of {label, value, unit?, source?, series?[], critical?}", required: ["label", "value"], defaultRefresh: 30 },
  { key: "topology", kind: "read", shape: "object", label: "Dependency topology (CMDB)", hint: "{ nodes:[{id,name,tier,status,owner,metric}], edges:[{from,to,state}], tierLabels? }", required: ["nodes"], itemsKey: "nodes", itemRequired: ["id", "name", "tier"], defaultRefresh: 60 },
  { key: "hypotheses", kind: "read", shape: "array", label: "Root-cause hypotheses", hint: "Array of {id, rank, confidence, statement, evidence[], status}", required: ["id", "statement"], defaultRefresh: 30 },
  { key: "precedents", kind: "read", shape: "array", label: "Historical precedents", hint: "Array of {id, type, typeLabel?, ci, matchPct, symptom, fixText, actionText?}", required: ["id", "symptom"], defaultRefresh: 0 },
  { key: "timeline", kind: "read", shape: "array", label: "Audit timeline", hint: "Array of {time, src, text}, newest first", required: ["time", "src", "text"], defaultRefresh: 15 },
  { key: "actions", kind: "read", shape: "array", label: "Actions checklist", hint: "Array of {id, title, owner, team, done}", required: ["id", "title"], defaultRefresh: 15 },
  { key: "bridge", kind: "read", shape: "array", label: "Teams bridge", hint: "Array of {team, engineer, status}", required: ["team"], defaultRefresh: 30 },
  { key: "workNote", kind: "action", label: "Post work note (ServiceNow)", hint: "Fired by “Post to ServiceNow”. Context: {{note}} {{state}} {{incidentId}} {{phase}}", ctxVars: ["note", "state", "incidentId", "phase"] },
  { key: "rollback", kind: "action", label: "Approve rollback", hint: "Fired by “Approve Rollback”. Context: {{incidentId}} {{changeId}}", ctxVars: ["incidentId", "changeId"] },
  { key: "pingOwner", kind: "action", label: "Ping CI owner", hint: "Fired by “Ping Owner”. Context: {{incidentId}} {{ci}} {{team}}", ctxVars: ["incidentId", "ci", "team"] },
];
export const slotDef = (k) => SLOTS.find((s) => s.key === k);

/** Throws a readable error when a mapped response doesn't fit the slot. */
export function validateSlot(key, data) {
  const def = slotDef(key);
  if (!def || def.kind !== "read") return data;
  if (def.shape === "array") {
    if (!Array.isArray(data)) throw new Error(`"${def.label}" expects an array, got ${typeof data}. Use Response path to select it.`);
    const bad = data.findIndex((x) => !x || def.required.some((f) => x[f] === undefined));
    if (bad >= 0) throw new Error(`Item ${bad} is missing required field(s): ${def.required.filter((f) => data[bad]?.[f] === undefined).join(", ")}`);
  } else {
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(`"${def.label}" expects an object`);
    const miss = def.required.filter((f) => data[f] === undefined);
    if (miss.length) throw new Error(`Missing required field(s): ${miss.join(", ")}`);
    if (def.itemsKey) {
      if (!Array.isArray(data[def.itemsKey])) throw new Error(`"${def.itemsKey}" must be an array`);
      const bad = data[def.itemsKey].findIndex((x) => def.itemRequired.some((f) => x?.[f] === undefined));
      if (bad >= 0) throw new Error(`${def.itemsKey}[${bad}] missing: ${def.itemRequired.filter((f) => data[def.itemsKey][bad]?.[f] === undefined).join(", ")}`);
    }
  }
  return data;
}
export const exampleFor = (key) => demo[key];
