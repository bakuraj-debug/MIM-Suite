# MIM Suite — Ops Central (React)

Incident-command cockpit (KPIs, CMDB blast-radius topology, Traversal root-cause, precedents, audit timeline,
actions, ServiceNow sync, stakeholder summary, comms drafts) with an **Admin portal** where you plug in your own
**REST APIs and MCP servers**. Everything runs on built-in demo data until you bind a connector.

```bash
npm install
npm run dev        # http://localhost:5173   (cockpit)  ·  /admin (portal)
npm test           # unit tests for the pure logic
```

## Admin portal (`/admin`)
1. **Settings & vault** – create a vault passphrase (API keys are AES-GCM encrypted in `localStorage`, decrypted only in memory; unlock after each reload). Set incident number / change record.
2. **Connectors** – *Add API* (base URL, auth, endpoints with `{{incidentId}}`-style templates, per-endpoint test) or *Add MCP server* (Streamable-HTTP URL, auth, **Save & discover tools**).
3. **Data bindings** – map a connector endpoint / MCP tool to each panel (KPIs, topology, hypotheses, precedents, timeline, actions, bridge, incident header) and to the operator actions (post work note, approve rollback, ping owner). *Test & preview* validates the response against the panel's expected shape; **Response path** (e.g. `result.items`) selects the right part of a larger payload. Expected shapes: see `src/data/demo.js`.

A bound panel never silently falls back to demo data: on error it shows an **Error** badge and an empty state.

## CORS / proxy
Browsers block most cross-origin API/MCP calls. `npm run dev` includes `/__proxy` (set as the default proxy URL; restrict targets with `MIM_PROXY_ALLOW=host1,host2`).
For production, point **Settings → CORS proxy URL** at an allow-listed server-side proxy accepting `POST {url, method, headers, body}` → `{status, headers, body}` (or enable CORS on the targets). Credentials pass through the proxy.

## Notes
- Config (connectors, bindings, settings) is per-browser in `localStorage`; use Export/Import for backup (secrets are never exported).
- There is no login on `/admin` — it is client-side only. Put the app behind your SSO/reverse proxy.
- MCP: Streamable HTTP transport (JSON or SSE responses, session ids). Legacy HTTP+SSE transport is not supported.
- The FastAPI `backend/` is not used by this frontend.
