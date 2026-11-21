import { sparkPath } from "../lib/view";
import { Src } from "./Common";

const fmt = (k) => (k.format === "int" || (Number.isInteger(k.value) && k.format !== "1dp") ? Number(k.value).toLocaleString() : typeof k.value === "number" ? k.value.toFixed(1) : k.value);

export default function KpiStrip({ kpis }) {
  return (
    <div className="kpis">
      {kpis.map((k, i) => (
        <div className={`kpi ${k.critical ? "critical" : ""}`} key={k.key || k.label + i}>
          <div style={{ minWidth: 0 }}>
            <div className="kpi-label">{k.source && <Src s={k.source} />}{k.label}</div>
            <div><span className="kpi-val">{fmt(k)}</span>{k.unit && <span className="kpi-unit">{k.unit}</span>}</div>
          </div>
          {k.series?.length > 1
            ? <svg className="spark" viewBox="0 0 96 36" aria-hidden="true"><path d={sparkPath(k.series)} /></svg>
            : k.note && <span className="mono" style={{ fontSize: 11, color: "var(--emerald)" }}>{k.note}</span>}
        </div>
      ))}
      {!kpis.length && <div className="kpi" style={{ gridColumn: "1/-1", color: "var(--ink-muted)" }}>No KPI data</div>}
    </div>
  );
}
