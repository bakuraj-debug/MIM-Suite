export default function CriticalActionsPanel({ actions }) {
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">Critical Actions</h3>
      <ul className="space-y-2 text-sm">
        {actions.map((a) => (
          <li key={a.id} className="border rounded p-2">
            <div className="font-medium">{a.task}</div>
            <div>{a.owner} · {a.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

