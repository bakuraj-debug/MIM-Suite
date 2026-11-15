import { useEffect, useMemo, useState } from "react";
import { useOps } from "../store/ops";
import { deriveView } from "../lib/view";

export function useView() {
  const slots = useOps((s) => s.slots);
  const local = useOps((s) => s.local);
  return useMemo(() => deriveView(slots, local), [slots, local]);
}
export function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return n;
}
