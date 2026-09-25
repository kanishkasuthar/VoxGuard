from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..services.risk.risk_engine import RiskEngine
from ..services.risk.decision_engine import make_decision
from ..services.risk.config import THRESHOLDS, WEIGHTS

router = APIRouter(prefix="/api/risk", tags=["Risk Engine & Decision Policy"])

_engine = RiskEngine()


class RiskRequest(BaseModel):
    voice_authenticity: float | None = Field(default=None, ge=0.0, le=1.0)
    speaker_confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    fraud_score: float | None = Field(default=None, ge=0.0, le=1.0)
    behavior_risk: float | None = Field(default=None, ge=0.0, le=1.0)


@router.get("/config")
def get_risk_config():
    return {
        "thresholds": {
            "allow": THRESHOLDS.allow,
            "warn": THRESHOLDS.warn,
            "verify": THRESHOLDS.verify,
        },
        "weights": {
            "voice": WEIGHTS.voice,
            "speaker": WEIGHTS.speaker,
            "fraud": WEIGHTS.fraud,
            "behavior": WEIGHTS.behavior,
        },
    }


@router.post("/calculate")
def calculate_risk(request: RiskRequest):
    result = _engine.calculate(
        voice_authenticity=request.voice_authenticity,
        speaker_confidence=request.speaker_confidence,
        fraud_score=request.fraud_score,
        behavior_risk=request.behavior_risk,
    )

    decision = (
        make_decision(result.overall_score)
        if result.risk_level != "UNKNOWN"
        else "UNKNOWN"
    )

    return {
        "success": True,
        "module": "RiskEngine",
        "overall_score": result.overall_score,
        "risk_level": result.risk_level,
        "decision": decision if isinstance(decision, str) else decision.value,
        "reasons": result.reasons,
        "component_scores": result.component_scores,
    }
