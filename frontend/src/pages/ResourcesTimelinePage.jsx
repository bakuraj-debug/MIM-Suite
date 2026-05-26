import { useIncidentStore } from "../store/incidentStore";
import ResourceMatrix from "../components/ResourceMatrix";
import EscalationContacts from "../components/EscalationContacts";

export default function ResourcesTimelinePage() {
  const { incident, timeline } = useIncidentStore();
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold mb-2">Critical Path Timeline</h3>
        <ul className="text-sm space-y-2">{timeline.map((t, i) => <li key={i}><strong>{t.time}</strong> · {t.event}</li>)}</ul>
      </div>
      <ResourceMatrix contacts={incident.contacts} />
      <EscalationContacts contacts={incident.contacts} />
      <div className="bg-white p-4 rounded border"><h3 className="font-semibold">AI Escalation Guidance</h3><p className="text-sm">Escalate to CTO if SLA breach risk exceeds 80% in next 30 minutes.</p></div>
    </div>
  );
}

