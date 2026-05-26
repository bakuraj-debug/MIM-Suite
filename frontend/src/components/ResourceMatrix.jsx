export default function ResourceMatrix({ contacts }) {
  const rows = [
    ["Resolver Manager", contacts.resolverManager, "Engaged"],
    ["DBA", contacts.dba, "Working"],
    ["Service Owner", contacts.serviceOwner, "On Bridge"],
    ["VP Engineering", contacts.vpEngineering, "Monitoring"],
    ["CTO On-Call", contacts.ctoOnCall, "Standby"],
  ];
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">Resource Engagement Matrix</h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t">
              <td className="py-1">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

