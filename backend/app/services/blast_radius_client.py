class BlastRadiusClient:
    def get_ripple_effect(self, incident_id: str):
        return {"incident_id": incident_id, "severity": "High", "impacted_location": "Europe / Russia / Stupino"}

    def get_impacted_applications(self, ci_id: str):
        return [{"name": "gTMS Print Service"}]

    def get_impacted_cis(self, ci_id: str):
        return [{"ci_id": ci_id, "dependent_ci": "Print Queue Cluster"}]

    def get_business_services(self, ci_id: str):
        return [{"service": "Logistics Fulfillment"}]

    def get_owners(self, ci_id: str):
        return [{"owner": "Dmitriy Sokolov"}, {"owner": "Khushboo Atri"}]
