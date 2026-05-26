class TraversalAIClient:
    def is_app_onboarded(self, application_name: str):
        return {"application": application_name, "onboarded": True}

    def get_rca(self, incident_id: str, application_name: str):
        return {"incident_id": incident_id, "application": application_name, "confidence": 0.84, "probable_rca": "archive diskgroup saturation"}

    def get_correlated_alerts(self, incident_id: str):
        return [{"source": "db_monitor", "alert": "Archive usage > 95%"}]

    def get_evidence(self, incident_id: str):
        return [{"evidence_type": "metric", "detail": "Archive disk at 97%"}]
