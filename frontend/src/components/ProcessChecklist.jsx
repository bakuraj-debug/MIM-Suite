export default function ProcessChecklist() {
  const steps = ["Context Collected", "RCA Correlated", "Blast Radius Mapped", "SLA Risk Reviewed", "Comms Prepared", "PIR Drafted"];
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">AI Process Checklist</h3>
      <ul className="text-sm space-y-1">{steps.map((s) => <li key={s}>[x] {s}</li>)}</ul>
    </div>
  );
}

