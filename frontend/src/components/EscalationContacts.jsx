export default function EscalationContacts({ contacts }) {
  return (
    <div className="bg-white p-4 rounded border">
      <h3 className="font-semibold mb-2">Escalation Contacts</h3>
      <ul className="text-sm space-y-1">
        {Object.entries(contacts).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
      </ul>
    </div>
  );
}

