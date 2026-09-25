import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..services.speaker.speaker_verification import SpeakerVerifier, IdentityStatus
from ..core.config import settings

router = APIRouter(prefix="/api/speaker", tags=["Biometric Speaker Verification"])

_verifier = SpeakerVerifier()
if Path(settings.VOICEPRINTS_PATH).exists():
    _verifier.load_enrollment(settings.VOICEPRINTS_PATH)


@router.get("/status")
def get_engine_status():
    return {
        "engine": "SpeechBrain ECAPA-TDNN",
        "ready": _verifier.is_engine_ready(),
        "model_loaded": _verifier.classifier is not None,
        "enrolled_speakers_count": len(_verifier.enrolled_speakers),
        "enrolled_speakers": list(_verifier.enrolled_speakers.keys()),
    }


@router.post("/enroll")
async def enroll_speaker(
    speaker_id: str = Form(...),
    files: List[UploadFile] = File(...),
):
    """Enroll a trusted speaker from one or more sample audio files."""
    if not speaker_id or not speaker_id.strip():
        raise HTTPException(status_code=400, detail="speaker_id is required")

    if not files:
        raise HTTPException(status_code=400, detail="At least one audio file is required for enrollment")

    temp_paths = []
    try:
        for file in files:
            ext = Path(file.filename or "sample.wav").suffix.lower()
            data = await file.read()
            with NamedTemporaryFile(suffix=ext, delete=False) as tf:
                tf.write(data)
                temp_paths.append(tf.name)

        _verifier.enroll_speaker(speaker_id.strip(), temp_paths)
        _verifier.save_enrollment(settings.VOICEPRINTS_PATH)

        return {
            "success": True,
            "speaker_id": speaker_id.strip(),
            "sample_count": len(files),
            "status": "ENROLLED",
            "message": f"Successfully enrolled voiceprint for speaker '{speaker_id.strip()}'",
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {exc}") from exc

    finally:
        for tp in temp_paths:
            Path(tp).unlink(missing_ok=True)


@router.post("/verify")
async def verify_speaker(
    speaker_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    """Verify an audio clip against a specified enrolled speaker (or all enrolled speakers)."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    ext = Path(file.filename).suffix.lower()
    data = await file.read()

    temp_path = None
    try:
        with NamedTemporaryFile(suffix=ext, delete=False) as tf:
            tf.write(data)
            temp_path = tf.name

        result = _verifier.verify(temp_path, speaker_id=speaker_id)

        return {
            "success": True,
            "similarity_score": result.similarity_score,
            "status": result.status.value if isinstance(result.status, IdentityStatus) else str(result.status),
            "matched_speaker_id": result.matched_speaker_id,
            "all_scores": result.all_scores,
            "details": result.details,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Speaker verification failed: {exc}") from exc

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
