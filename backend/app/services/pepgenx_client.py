class PEPGenXClient:
    def chat(self, prompt: str, context: dict):
        return {"message": f"Mock PEPGENX response for: {prompt}", "context_used": bool(context)}

    def generate_strategic_actions(self, context: dict):
        return {"actions": ["Purge archive logs", "Throttle non-critical jobs", "Validate spooler health"], "confidence": 0.82}

    def generate_comms(self, context: dict):
        return {"draft": "P1 update: mitigation underway, next update in 15 minutes.", "audience": "Operations"}

    def generate_executive_summary(self, context: dict):
        return {"summary": "P1 incident contained, recovery in progress. Risk remains moderate."}

    def generate_post_incident_report(self, context: dict):
        return {"pir": "Draft PIR: archive saturation triggered print disruption with logistics impact."}
