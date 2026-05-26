from app.config import settings
from app.services import mock_data


class ServiceNowClient:
    def __init__(self):
        self.enabled = settings.enable_real_integrations

    def get_incident(self, incident_id: str):
        if self.enabled:
            # TODO: Add real ServiceNow REST API call using configured credentials.
            pass
        return mock_data.INCIDENT

    def get_work_notes(self, incident_id: str):
        return [{"note": "Bridge started"}, {"note": "DBA engaged"}]

    def get_slas(self, incident_id: str):
        return [{"name": "P1 Mitigation SLA", "remaining_seconds": mock_data.INCIDENT["slaSecondsRemaining"]}]

    def get_related_tasks(self, incident_id: str):
        return mock_data.ACTIONS["items"]

    def get_cmdb_ci(self, ci_id: str):
        return {"ci_id": ci_id, "name": "gTMS Print DB", "env": "PROD"}
