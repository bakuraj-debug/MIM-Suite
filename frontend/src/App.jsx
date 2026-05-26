import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";
import StatusBanner from "./components/StatusBanner";
import { useIncidentStore } from "./store/incidentStore";
import { useIncidentData } from "./hooks/useIncidentData";
import { useIncidentSocket } from "./hooks/useIncidentSocket";

const INCIDENT_ID = "INC16852714";

export default function App() {
  const incident = useIncidentStore((s) => s.incident);
  useIncidentData(INCIDENT_ID);
  useIncidentSocket(INCIDENT_ID);

  return (
    <div className="min-h-screen">
      <TopNav />
      <StatusBanner incident={incident} />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
