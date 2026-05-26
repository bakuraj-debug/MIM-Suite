from fastapi import APIRouter, HTTPException
from app.models.incident import Incident, TimelineResponse, ActionResponse
from app.services.servicenow_client import ServiceNowClient
from app.services import mock_data

router = APIRouter(prefix="/api/incidents", tags=["incidents"])
sn = ServiceNowClient()


@router.get("/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    if incident_id != mock_data.INCIDENT["incidentId"]:
        raise HTTPException(status_code=404, detail="Incident not found in mock mode")
    return sn.get_incident(incident_id)


@router.get("/{incident_id}/timeline", response_model=TimelineResponse)
def get_timeline(incident_id: str):
    return mock_data.TIMELINE


@router.get("/{incident_id}/actions", response_model=ActionResponse)
def get_actions(incident_id: str):
    return mock_data.ACTIONS
