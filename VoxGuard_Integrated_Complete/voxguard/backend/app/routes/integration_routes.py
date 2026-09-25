from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..integration.person6_service import Person6Service

router = APIRouter(
    prefix="/integration/person6",
    tags=["Person 6 - Security Integration"],
)

_service = Person6Service()


class Person6IntegrationRequest(BaseModel):
    voice_authenticity: float | None = Field(default=None, ge=0.0, le=1.0)
    speaker_confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    fraud_score: float | None = Field(default=None, ge=0.0, le=1.0)
    behavior_risk: float | None = Field(default=None, ge=0.0, le=1.0)
    client_id: str = "default"
    call_id: str | None = None
    role: str = "admin"


class OfflineSyncEvent(BaseModel):
    event_id: str
    timestamp: str
    risk_level: str
    decision: str
    call_id: str | None = None
    role: str = "admin"


class OfflineSyncRequest(BaseModel):
    events: list[OfflineSyncEvent]


@router.post("/process")
def process_person6(request: Person6IntegrationRequest):
    data = {
        "voice_authenticity": request.voice_authenticity,
        "speaker_confidence": request.speaker_confidence,
        "fraud_score": request.fraud_score,
        "behavior_risk": request.behavior_risk,
    }

    return _service.process(
        data=data,
        client_id=request.client_id,
        call_id=request.call_id,
        role=request.role,
    )


@router.post("/sync")
def sync_offline_events(request: OfflineSyncRequest):
    synced_event_ids = []

    for event in request.events:
        _service.audit_logger.log(
            event="OFFLINE_EVENT_SYNCED",
            call_id=event.call_id or event.event_id,
            details={
                "event_id": event.event_id,
                "risk_level": event.risk_level,
                "decision": event.decision,
                "source": "offline_sync",
                "timestamp": event.timestamp,
            },
            model_versions={},
        )
        synced_event_ids.append(event.event_id)

    return {
        "status": "SYNCED",
        "synced_event_ids": synced_event_ids,
        "synced_count": len(synced_event_ids),
    }


@router.get("/verify-audit")
def verify_audit():
    return _service.verify_audit()
