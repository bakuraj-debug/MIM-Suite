import { useIncidentStore } from "../store/incidentStore";
import IncidentSummaryPanel from "../components/IncidentSummaryPanel";
import CriticalActionsPanel from "../components/CriticalActionsPanel";
import AIAdvisorPanel from "../components/AIAdvisorPanel";

export default function WhiteboardPage() {
  const { incident, actions, aiMessages } = useIncidentStore();
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <IncidentSummaryPanel incident={incident} />
      <CriticalActionsPanel actions={actions} />
      <AIAdvisorPanel aiMessages={aiMessages} />
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">ServiceNow Live Data</h3><p className="text-sm">Incident synced in mock mode.</p></div>
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">RCA Sources</h3><p className="text-sm">ServiceNow · Traversal AI · Combined</p></div>
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">CMDB Blast Radius + Human Approval</h3><p className="text-sm">Ripple severity High. Awaiting leadership approval for action A-102.</p></div>
    </div>
  );
}

