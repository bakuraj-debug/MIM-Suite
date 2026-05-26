export default function IntegrationStatusCard({ integration }) {
  const color = integration.status === "connected" ? "text-emerald-600" : "text-amber-600";
  return (
    <div className="bg-white p-4 rounded border">
      <div className="font-semibold">{integration.name}</div>
      <div className={`text-sm ${color}`}>{integration.status}</div>
      <div className="text-xs text-slate-500">{integration.detail}</div>
    </div>
  );
}
