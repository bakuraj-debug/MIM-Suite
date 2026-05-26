export default function ExecutiveMetrics() {
  const metrics = [["Response Health", "74/100"], ["RCA Confidence", "84%"], ["Blast Radius Severity", "High"], ["Estimated Resolution", "1h 35m"]];
  return (
    <div className="grid md:grid-cols-4 gap-3">
      {metrics.map((m) => <div key={m[0]} className="bg-white p-4 rounded border"><div className="text-xs">{m[0]}</div><div className="text-xl font-semibold">{m[1]}</div></div>)}
    </div>
  );
}

