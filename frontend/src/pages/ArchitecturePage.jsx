import { useIncidentStore } from "../store/incidentStore";
import IntegrationStatusCard from "../components/IntegrationStatusCard";

export default function ArchitecturePage() {
  const integrations = useIncidentStore((s) => s.integrations);
  const blocks = ["Frontend (React/Vite)", "Python Backend (FastAPI)", "LangGraph Orchestration", "PEPGENX LLM Gateway", "ServiceNow", "Traversal AI", "CMDB Blast Radius"];
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {blocks.map((b) => <div className="bg-white p-4 rounded border text-sm" key={b}>{b}</div>)}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {integrations.map((i) => <IntegrationStatusCard key={i.name} integration={i} />)}
      </div>
    </div>
  );
}

