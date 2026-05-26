export default function IncidentSummaryPanel({ incident }) {
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">Incident Summary</h3>
      <p><strong>Application:</strong> {incident.application}</p>
      <p><strong>Issue:</strong> {incident.issue}</p>
      <p><strong>Root Cause:</strong> {incident.rootCause}</p>
      <p><strong>Runbook:</strong> {incident.runbook}</p>
      <p><strong>Business Impact:</strong> {incident.businessImpact}</p>
    </div>
  );
}

