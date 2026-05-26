export default function StatusBanner({ incident }) {
  const m = Math.floor((incident.slaSecondsRemaining || 0) / 60);
  const s = (incident.slaSecondsRemaining || 0) % 60;
  return (
    <section className="bg-red-600 text-white px-4 py-2 text-sm grid grid-cols-1 md:grid-cols-4 gap-2">
      <div><strong>{incident.incidentId}</strong> · {incident.priority}</div>
      <div>Status: {incident.status}</div>
      <div>Location: {incident.location}</div>
      <div>SLA Countdown: {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</div>
    </section>
  );
}
