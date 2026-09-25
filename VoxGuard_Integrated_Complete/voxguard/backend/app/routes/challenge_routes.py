from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.challenge.verification_service import VerificationService

router = APIRouter(prefix="/api/challenge", tags=["Verification Challenges"])

_service = VerificationService()


class VerifyRequest(BaseModel):
    challenge_id: str = Field(..., description="Challenge token identifier")
    response: str = Field(..., description="User-provided 6-digit response code")


@router.post("/create")
def create_challenge():
    """Create a new time-limited OTP verification challenge."""
    challenge = _service.start()
    return {
        "success": True,
        "challenge": challenge,
    }


@router.post("/verify")
def verify_challenge(request: VerifyRequest):
    """Verify an OTP challenge code."""
    result = _service.verify(request.challenge_id, request.response)
    if not result["verified"]:
        raise HTTPException(
            status_code=400,
            detail="Challenge verification failed: invalid code, expired, or maximum attempts exceeded.",
        )
    return {
        "success": True,
        "verified": True,
        "challenge_id": request.challenge_id,
        "message": "Challenge verified successfully.",
    }
