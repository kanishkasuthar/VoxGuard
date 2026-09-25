from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.fraud.fraud_detection import FraudIntentDetector

router = APIRouter(prefix="/api/fraud", tags=["Multilingual Fraud & Intent Detection"])

_detector = FraudIntentDetector()


class FraudAnalysisRequest(BaseModel):
    transcript: str = Field(..., description="Speech transcript text to analyze")
    language_code: str = Field(default="en", description="ISO 639-1 code (en, hi, kn, te, ta, ml)")


@router.post("/analyze")
def analyze_fraud_intent(request: FraudAnalysisRequest):
    """Scan transcript text for multilingual voice scam & social engineering indicators."""
    if not request.transcript or not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text cannot be empty")

    result = _detector.analyze(
        transcript=request.transcript,
        language_code=request.language_code,
    )

    return {
        "success": True,
        "transcript": request.transcript,
        "language_code": request.language_code,
        "fraud_score": result.fraud_score,
        "is_suspicious": result.is_suspicious,
        "detected_intent_types": [t.value for t in result.detected_types],
        "matched_phrases": result.matched_phrases,
    }
