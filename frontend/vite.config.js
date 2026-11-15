import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Dev-only CORS proxy so the admin portal can reach ServiceNow / CMDB / Traversal / MCP
 * servers that do not send CORS headers.  The browser POSTs an envelope to /__proxy:
 *   { url, method, headers, body }  ->  { status, headers, body }
 * Restrict targets with MIM_PROXY_ALLOW="host1,host2" (exact hostnames). Unset = any host
 * (acceptable on a developer machine only; for production put an allow-listed proxy in your backend).
 */
function devProxy() {
  const allow = (process.env.MIM_PROXY_ALLOW || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    name: "mim-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/__proxy", async (req, res) => {
        const send = (code, obj) => {
          res.statusCode = code;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(obj));
        };
        if (req.method !== "POST") return send(405, { error: "POST only" });
        let raw = "";
        for await (const chunk of req) raw += chunk;
        try {
          const { url, method = "GET", headers = {}, body } = JSON.parse(raw);
          const target = new URL(url);
          if (!/^https?:$/.test(target.protocol)) return send(400, { error: "http(s) only" });
          if (allow.length && !allow.includes(target.hostname)) {
            return send(403, { error: `host ${target.hostname} not in MIM_PROXY_ALLOW` });
          }
          const r = await fetch(target, {
            method,
            headers,
            body: body == null || method === "GET" || method === "HEAD" ? undefined : body,
            signal: AbortSignal.timeout(20000),
          });
          const text = await r.text();
          const outHeaders = {};
          r.headers.forEach((v, k) => (outHeaders[k] = v));
          send(200, { status: r.status, headers: outHeaders, body: text });
        } catch (e) {
          send(502, { error: String(e?.cause?.message || e?.message || e) });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devProxy()],
  server: { port: 5173 },
});
