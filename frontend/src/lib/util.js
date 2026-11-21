export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
export const utcHHMM = () => new Date().toISOString().slice(11, 16);
export const fmtClock = (sec) => {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};
export const clip = (s, n) => (String(s ?? "").length > n ? String(s).slice(0, n - 1) + "…" : String(s ?? ""));

/** Read "a.b[0].c" from an object. Empty path returns the object. */
export function getPath(obj, path) {
  if (!path || !path.trim()) return obj;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Replace {{var}} using ctx. `json` mode escapes values so they are safe inside JSON strings. */
export function render(template, ctx, { json = false } = {}) {
  return String(template ?? "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = getPath(ctx, key);
    const s = v == null ? "" : String(v);
    return json ? JSON.stringify(s).slice(1, -1) : s;
  });
}

export const safeJson = (text, fallback = undefined) => {
  try { return JSON.parse(text); } catch { return fallback; }
};
