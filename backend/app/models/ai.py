from pydantic import BaseModel, Field


class AIRequest(BaseModel):
    incident_id: str
    context: dict = Field(default_factory=dict)


class AIResponse(BaseModel):
    content: dict
