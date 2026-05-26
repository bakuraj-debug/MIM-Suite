from pydantic import BaseModel


class IntegrationStatus(BaseModel):
    name: str
    status: str
    detail: str


class IntegrationStatusResponse(BaseModel):
    integrations: list[IntegrationStatus]
