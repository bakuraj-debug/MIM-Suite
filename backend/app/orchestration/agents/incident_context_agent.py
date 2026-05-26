def run(incident_id: str):
    return {"name": "Incident Context Agent", "status": "completed", "confidence": 0.96, "output": {"incident_id": incident_id}, "evidence_sources": ["ServiceNow"], "human_approval_required": False}

