import asyncio
import itertools
from fastapi import APIRouter, WebSocket

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/incidents/{incident_id}")
async def incident_ws(websocket: WebSocket, incident_id: str):
    await websocket.accept()
    cycle = itertools.cycle(
        [
            {"type": "SLA_TICK", "payload": {"incident_id": incident_id}},
            {"type": "STATUS_UPDATED", "payload": {"status": "Mitigation in Progress"}},
            {"type": "ACTION_UPDATED", "payload": {"id": "A-102", "status": "Approved"}},
            {"type": "AI_MESSAGE_ADDED", "payload": {"source": "pepgenx", "text": "AI: prioritize archive cleanup before spooler restart."}},
            {"type": "RESOURCE_STATUS_UPDATED", "payload": {"note": "DBA escalated storage team for emergency archive extension."}},
        ]
    )
    try:
        while True:
            await websocket.send_json(next(cycle))
            await asyncio.sleep(5)
    except Exception:
        await websocket.close()
