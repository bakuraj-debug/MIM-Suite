from pydantic import BaseModel


class Incident(BaseModel):
    incidentId: str
    priority: str
    status: str
    location: str
    application: str
    issue: str
    businessImpact: str
    rootCause: str
    runbook: str
    contacts: dict
    slaSecondsRemaining: int


class TimelineResponse(BaseModel):
    items: list[dict]


class ActionResponse(BaseModel):
    items: list[dict]
