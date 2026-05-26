from fastapi import APIRouter
from app.models.ai import AIRequest, AIResponse
from app.services.pepgenx_client import PEPGenXClient

router = APIRouter(prefix="/api/ai", tags=["ai"])
pepgenx = PEPGenXClient()


@router.post("/strategic-actions", response_model=AIResponse)
def strategic_actions(req: AIRequest):
    return {"content": pepgenx.generate_strategic_actions(req.context)}


@router.post("/generate-comms", response_model=AIResponse)
def generate_comms(req: AIRequest):
    return {"content": pepgenx.generate_comms(req.context)}


@router.post("/executive-summary", response_model=AIResponse)
def executive_summary(req: AIRequest):
    return {"content": pepgenx.generate_executive_summary(req.context)}


@router.post("/post-incident-report", response_model=AIResponse)
def post_incident_report(req: AIRequest):
    return {"content": pepgenx.generate_post_incident_report(req.context)}
