import ProcessChecklist from "../components/ProcessChecklist";
import StakeholderComms from "../components/StakeholderComms";

export default function AICommsPage() {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <ProcessChecklist />
      <StakeholderComms />
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">AI Confidence Cards</h3><p className="text-sm">RCA 84% · SLA Risk 78% · Comms Quality 91%</p></div>
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">LangGraph Agent Execution List</h3><p className="text-sm">IncidentContext → RCA → BlastRadius → Impact → SLA → Comms → ExecSummary → PIR → HumanApproval</p></div>
    </div>
  );
}

