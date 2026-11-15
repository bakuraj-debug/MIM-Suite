// One place that talks to the network. Direct fetch, or via a CORS proxy envelope.
import { useConfig } from "../store/config";

export async function send({ url, method = "GET", headers = {}, body }) {
  const { settings } = useConfig.getState();
  const proxy = settings.proxyUrl?.trim();
  if (proxy) {
    let r;
    try {
      r = await fetch(proxy, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, method, headers, body }),
      });
    } catch (e) { throw new Error(`Proxy unreachable (${proxy}): ${e.message}`); }
    const env = await r.json().catch(() => null);
    if (!env || env.error) throw new Error(`Proxy error: ${env?.error || r.status}`);
    return { status: env.status, headers: env.headers || {}, text: env.body ?? "" };
  }
  let r;
  try {
    r = await fetch(url, { method, headers, body: body == null || method === "GET" ? undefined : body });
  } catch (e) {
    throw new Error(`Network/CORS error calling ${new URL(url).host}. Set a Proxy URL in Admin → Settings, or enable CORS on the target. (${e.message})`);
  }
  const h = {}; r.headers.forEach((v, k) => (h[k] = v));
  return { status: r.status, headers: h, text: await r.text() };
}
