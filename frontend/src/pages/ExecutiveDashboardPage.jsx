import ExecutiveMetrics from "../components/ExecutiveMetrics";
import PostIncidentReport from "../components/PostIncidentReport";

export default function ExecutiveDashboardPage() {
  return (
    <div className="space-y-4">
      <ExecutiveMetrics />
      <PostIncidentReport />
    </div>
  );
}

