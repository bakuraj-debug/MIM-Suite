import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useView } from "../hooks/useView";
import { useOps } from "../store/ops";
import KpiStrip from "../components/KpiStrip";
import TopologyPane from "../components/Topology";
import IntelPane from "../components/IntelPane";
import BottomStrip from "../components/BottomStrip";
import Stakeholder from "../components/Stakeholder";

export default function CockpitPage() {
  const view = useView();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("causal");
  const [ciFilter, setCiFilter] = useState(null);
  const selectNode = useOps((s) => s.selectNode);
  if (params.get("view") === "summary") return <Stakeholder view={view} />;
  return (
    <div className="cockpit">
      <KpiStrip kpis={view.kpis} />
      <div className="workspace">
        <TopologyPane topo={view.topology} precedents={view.precedents} onHistory={(ci) => { selectNode(ci); setCiFilter(ci); setTab("history"); }} />
        <IntelPane view={view} tab={tab} setTab={setTab} ciFilter={ciFilter} setCiFilter={setCiFilter} />
      </div>
      <BottomStrip view={view} />
    </div>
  );
}
