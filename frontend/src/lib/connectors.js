// Calls into configured connectors: REST APIs and MCP servers (Streamable HTTP).
import { send } from "./transport";
import { vault } from "./vault";
import { render, safeJson, getPath } from "./util";
import { useConfig } from "../store/config";

export const getConnector = (id) => useConfig.getState().connectors.find((c) => c.id === id);

function authHeaders(c) {
  const h = {};
  for (const { key, value } of c.headers || []) if (key) h[key] = value;
  const a = c.auth || { type: "none" };
  if (a.type === "none") return h;
  const secret = vault.get(c.id);
  if (!secret) throw new Error(`No credential stored for "${c.name}" — add it in Admin → Connectors`);
  if (a.type === "bearer") h.Authorization = `Bearer ${secret}`;
  else if (a.type === "basic") h.Authorization = `Basic ${btoa(`${a.username || ""}:${secret}`)}`;
  else if (a.type === "header") h[a.headerName || "X-API-Key"] = secret;
  return h;
}

const joinUrl = (base, path) => base.replace(/\/+$/, "") + (path ? "/" + path.replace(/^\/+/, "") : "");

/* ---------------- REST ---------------- */
export async function callEndpoint(c, endpoint, ctx = {}) {
  const url = joinUrl(c.baseUrl, render(endpoint.path, ctx));
  const method = (endpoint.method || "GET").toUpperCase();
  const headers = { Accept: "application/json", ...authHeaders(c) };
  let body;
  if (method !== "GET" && method !== "HEAD" && endpoint.body?.trim()) {
    body = render(endpoint.body, ctx, { json: true });
    headers["Content-Type"] = "application/json";
  }
  const res = await send({ url, method, headers, body });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${method} ${new URL(url).pathname} → HTTP ${res.status}: ${res.text.slice(0, 200)}`);
  }
  const json = safeJson(res.text);
  if (json === undefined) throw new Error(`Response was not JSON: ${res.text.slice(0, 120)}`);
  return json;
}

/* ---------------- MCP (Streamable HTTP, JSON-RPC 2.0) ---------------- */
const sessions = new Map(); // connectorId -> { sessionId }
let rpcId = 1;

function parseRpc(res, id) {
  const ct = res.headers["content-type"] || "";
  if (ct.includes("text/event-stream")) {
    for (const block of res.text.split(/\r?\n\r?\n/)) {
      const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n");
      const msg = safeJson(data);
      if (msg && msg.id === id) return msg;
    }
    return null;
  }
  return safeJson(res.text);
}

async function rpc(c, method, params, { notify = false, sessionId } = {}) {
  const id = notify ? undefined : rpcId++;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...authHeaders(c),
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const res = await send({ url: c.baseUrl, method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  if (notify) return { res };
  if (res.status === 404 && sessionId) { const e = new Error("session-expired"); e.expired = true; throw e; }
  if (res.status < 200 || res.status >= 300) throw new Error(`MCP ${method} → HTTP ${res.status}: ${res.text.slice(0, 200)}`);
  const msg = parseRpc(res, id);
  if (!msg) throw new Error(`MCP ${method}: no JSON-RPC response`);
  if (msg.error) throw new Error(`MCP ${method}: ${msg.error.message || JSON.stringify(msg.error)}`);
  return { res, result: msg.result };
}

async function ensureSession(c) {
  if (sessions.has(c.id)) return sessions.get(c.id);
  const { res, result } = await rpc(c, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "mim-suite", version: "2.0.0" },
  });
  const s = { sessionId: res.headers["mcp-session-id"], server: result?.serverInfo };
  await rpc(c, "notifications/initialized", {}, { notify: true, sessionId: s.sessionId });
  sessions.set(c.id, s);
  return s;
}

async function mcpRequest(c, method, params) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await ensureSession(c);
    try { return (await rpc(c, method, params, { sessionId: s.sessionId })).result; }
    catch (e) { if (e.expired && attempt === 0) { sessions.delete(c.id); continue; } throw e; }
  }
}

export async function mcpListTools(c) {
  sessions.delete(c.id);
  const out = [];
  let cursor;
  do {
    const r = await mcpRequest(c, "tools/list", cursor ? { cursor } : {});
    out.push(...(r.tools || []));
    cursor = r.nextCursor;
  } while (cursor);
  return { tools: out, server: sessions.get(c.id)?.server };
}

export async function mcpCallTool(c, tool, args = {}) {
  const r = await mcpRequest(c, "tools/call", { name: tool, arguments: args });
  if (r.isError) throw new Error(`Tool "${tool}" failed: ${(r.content || []).map((x) => x.text).join(" ").slice(0, 200)}`);
  if (r.structuredContent !== undefined) return r.structuredContent;
  const text = (r.content || []).filter((x) => x.type === "text").map((x) => x.text).join("\n");
  const json = safeJson(text);
  return json !== undefined ? json : text;
}

/* ---------------- Connection test ---------------- */
export async function testConnector(c) {
  const t0 = performance.now();
  if (c.kind === "mcp") {
    const { tools, server } = await mcpListTools(c);
    return { ok: true, ms: Math.round(performance.now() - t0), tools, detail: `${server?.name || "MCP server"} · ${tools.length} tools` };
  }
  const url = joinUrl(c.baseUrl, c.healthPath || "");
  const res = await send({ url, method: "GET", headers: { Accept: "application/json", ...authHeaders(c) } });
  const ok = res.status >= 200 && res.status < 400;
  return { ok, ms: Math.round(performance.now() - t0), detail: `HTTP ${res.status}` + (ok ? "" : ` — ${res.text.slice(0, 100)}`) };
}

/* ---------------- Binding execution ---------------- */
/** Run a binding ({connectorId,target,args,responsePath}) and return mapped JSON. */
export async function runBinding(b, ctx, { raw = false } = {}) {
  const c = getConnector(b.connectorId);
  if (!c) throw new Error("Connector not found — was it deleted?");
  if (c.enabled === false) throw new Error(`Connector "${c.name}" is disabled`);
  let data;
  if (c.kind === "mcp") {
    const args = safeJson(render(b.args || "{}", ctx, { json: true }));
    if (args === undefined) throw new Error("Tool arguments are not valid JSON after substitution");
    data = await mcpCallTool(c, b.target, args);
  } else {
    const ep = (c.endpoints || []).find((e) => e.id === b.target);
    if (!ep) throw new Error("Endpoint not found on connector");
    data = await callEndpoint(c, ep, ctx);
  }
  if (raw) return { raw: data, mapped: getPath(data, b.responsePath) };
  const mapped = getPath(data, b.responsePath);
  if (mapped === undefined) throw new Error(`Response path "${b.responsePath}" matched nothing`);
  return mapped;
}
