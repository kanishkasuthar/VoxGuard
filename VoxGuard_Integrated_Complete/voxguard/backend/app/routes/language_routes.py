from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..services.language.language_processing import (
    MultilingualProcessor,
    SUPPORTED_LANGUAGES,
)

router = APIRouter(prefix="/api/language", tags=["Multilingual Speech Processing"])

_processor = MultilingualProcessor()


@router.get("/supported")
def get_supported_languages():
    return {
        "engine": "OpenAI Whisper",
        "ready": _processor.is_engine_ready(),
        "supported_languages": SUPPORTED_LANGUAGES,
    }


@router.post("/transcribe")
async def transcribe_audio(
    force_language: Optional[str] = Form(None),
    file: UploadFile = File(...),
):
    """Detect language and transcribe speech into text."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    ext = Path(file.filename).suffix.lower()
    data = await file.read()

    temp_path = None
    try:
        with NamedTemporaryFile(suffix=ext, delete=False) as tf:
            tf.write(data)
            temp_path = tf.name

        result = _processor.transcribe(temp_path, force_language=force_language)

        return {
            "success": True,
            "language_code": result.language_code,
            "language_name": result.language_name,
            "language_confidence": result.language_confidence,
            "transcript": result.transcript,
            "is_supported_language": result.is_supported_language,
            "status": result.status,
            "details": result.details,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}") from exc

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
