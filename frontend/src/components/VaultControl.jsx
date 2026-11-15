import { useState } from "react";
import { useVault, vault } from "../lib/vault";

/** Create / unlock / lock the encrypted credential vault. */
export default function VaultControl({ compact }) {
  const status = useVault((s) => s.status);
  const [pass, setPass] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const go = async (fn) => { setBusy(true); setErr(""); try { await fn(); setPass(""); } catch (e) { setErr(e.message); } setBusy(false); };

  if (status === "unlocked") {
    return (
      <div className="row"><span className="dot ok" /> <span>Vault unlocked</span>
        {!compact && <button className="btn sm" onClick={() => vault.lock()}>Lock</button>}
      </div>
    );
  }
  const creating = status === "empty";
  return (
    <form onSubmit={(e) => { e.preventDefault(); go(() => (creating ? vault.create(pass) : vault.unlock(pass))); }}>
      <div className="flabel" style={{ marginBottom: 4 }}>{creating ? "Create a vault passphrase (min 8 chars)" : "Unlock vault"}</div>
      <div className="row">
        <input className="input" type="password" autoComplete={creating ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase" aria-label="Vault passphrase" />
        <button className="btn primary" disabled={busy || !pass}>{creating ? "Create vault" : "Unlock"}</button>
      </div>
      {err && <div style={{ color: "var(--red)", fontSize: 11.5, marginTop: 4 }}>{err}</div>}
      <div className="help" style={{ marginTop: 4 }}>
        {creating ? "API keys are encrypted (AES-GCM) with this passphrase before touching localStorage. If you forget it, keys must be re-entered." : "Credentials stay encrypted at rest; decrypted only in memory for this tab."}
      </div>
    </form>
  );
}
