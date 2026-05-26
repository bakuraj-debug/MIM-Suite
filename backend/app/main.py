from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import incidents, ai, integrations, websocket

app = FastAPI(title="PEPSICO AI OPS · MIM SUITE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(incidents.router)
app.include_router(ai.router)
app.include_router(integrations.router)
app.include_router(websocket.router)
