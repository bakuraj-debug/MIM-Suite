// Passphrase-protected secret storage: PBKDF2 -> AES-GCM, ciphertext in localStorage.
// Plaintext secrets live only in memory while unlocked.
import { create } from "zustand";

const KEY = "mim.vault.v1";
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

let cryptoKey = null, salt = null, secrets = {};

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

async function derive(pass, saltBytes) {
  const base = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 250000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}

async function persist() {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, enc.encode(JSON.stringify(secrets)));
  localStorage.setItem(KEY, JSON.stringify({ v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
}

const initial = () => (read() ? "locked" : "empty");
export const useVault = create((set) => ({
  status: initial(), // empty | locked | unlocked
  ids: [],           // connector ids that hold a secret (known only while unlocked)
  _set: set,
}));
const publish = (status) => useVault.setState({ status, ids: status === "unlocked" ? Object.keys(secrets) : [] });

export const vault = {
  async create(pass) {
    if (!pass || pass.length < 8) throw new Error("Passphrase must be at least 8 characters");
    salt = crypto.getRandomValues(new Uint8Array(16));
    cryptoKey = await derive(pass, salt);
    secrets = {};
    await persist();
    publish("unlocked");
  },
  async unlock(pass) {
    const rec = read();
    if (!rec) throw new Error("Vault is empty");
    const s = unb64(rec.salt);
    const key = await derive(pass, s);
    try {
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(rec.iv) }, key, unb64(rec.ct));
      secrets = JSON.parse(dec.decode(pt));
    } catch { throw new Error("Wrong passphrase"); }
    salt = s; cryptoKey = key;
    publish("unlocked");
  },
  lock() { cryptoKey = null; secrets = {}; publish(read() ? "locked" : "empty"); },
  destroy() { localStorage.removeItem(KEY); cryptoKey = null; secrets = {}; publish("empty"); },
  async set(id, value) {
    if (!cryptoKey) throw new Error("Vault is locked");
    if (value) secrets[id] = value; else delete secrets[id];
    await persist();
    publish("unlocked");
  },
  get(id) {
    if (!cryptoKey) throw new Error("Vault is locked — unlock it from the Admin portal");
    return secrets[id] || "";
  },
  has: (id) => id in secrets,
};
