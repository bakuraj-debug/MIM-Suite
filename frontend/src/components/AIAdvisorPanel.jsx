export default function AIAdvisorPanel({ aiMessages = [] }) {
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">AI Advisor</h3>
      <p className="text-sm mb-2">Suggested: purge archive logs, throttle non-critical print jobs, validate DR queue.</p>
      <div className="space-y-2 text-xs">
        {aiMessages.slice(0, 5).map((m, i) => (
          <div key={i} className="bg-slate-100 p-2 rounded">{m.text || JSON.stringify(m)}</div>
        ))}
      </div>
    </div>
  );
}

