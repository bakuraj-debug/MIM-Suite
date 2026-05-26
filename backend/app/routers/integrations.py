from fastapi import APIRouter

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("/status")
def integration_status():
    return {
        "integrations": [
            {"name": "ServiceNow", "status": "connected", "detail": "Mock mode active"},
            {"name": "PEPGENX", "status": "connected", "detail": "Stub responses enabled"},
            {"name": "Traversal AI", "status": "connected", "detail": "RCA confidence feed simulated"},
            {"name": "CMDB Blast Radius", "status": "connected", "detail": "Ripple analysis simulated"},
        ]
    }
