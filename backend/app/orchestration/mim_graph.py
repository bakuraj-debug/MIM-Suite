from app.orchestration.agents import (
    incident_context_agent,
    rca_agent,
    blast_radius_agent,
    business_impact_agent,
    sla_risk_agent,
    communications_agent,
    executive_summary_agent,
    post_incident_report_agent,
    human_approval_agent,
)


def run_mim_graph(incident_id: str):
    steps = []
    steps.append(incident_context_agent.run(incident_id))
    steps.append(rca_agent.run(steps[-1]))
    steps.append(blast_radius_agent.run(steps[-1]))
    steps.append(business_impact_agent.run(steps[-1]))
    steps.append(sla_risk_agent.run(steps[-1]))
    steps.append(communications_agent.run(steps[-1]))
    steps.append(executive_summary_agent.run(steps[-1]))
    steps.append(post_incident_report_agent.run(steps[-1]))
    steps.append(human_approval_agent.run(steps[-1]))
    return {"incident_id": incident_id, "agents": steps}
