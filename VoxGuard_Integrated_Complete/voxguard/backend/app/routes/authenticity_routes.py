import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, File, HTTPException, UploadFile

from ..services.voice_authenticity.offline_voice_pipeline import OfflineVoicePipeline

router = APIRouter(prefix="/api/voice", tags=["Voice Authenticity & Anti-Spoofing"])

_pipeline = OfflineVoicePipeline()


@router.post("/analyze")
async def analyze_voice(file: UploadFile = File(...)):
    """Analyze uploaded audio for voice authenticity and synthetic/deepfake indicators."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Audio file name is required")

    extension = Path(file.filename).suffix.lower()
    if extension not in {".wav", ".flac", ".ogg", ".mp3", ".m4a"}:
        raise HTTPException(
            status_code=400,
            detail="Supported audio formats: WAV, FLAC, OGG, MP3, M4A",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded audio is empty")

    temp_path = None
    try:
        with NamedTemporaryFile(suffix=extension, delete=False) as temp_file:
            temp_file.write(data)
            temp_path = temp_file.name

        result = _pipeline.analyze_file(temp_path)

        return {
            "success": True,
            "module": "VoiceAuthenticity",
            "file_name": file.filename,
            "deepfake_score": result["deepfake_score"],
            "spoof_score": result["spoof_score"],
            "authenticity_score": result["authenticity_score"],
            "voice_status": result["voice_status"],
            "signals": result["signals"],
            "features": result["features"],
            "model_version": result["model_version"],
            "inference_mode": result["inference_mode"],
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Voice analysis failed: {exc}",
        ) from exc

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
            # Also clean up generated _processed.wav if exists
            proc = Path(temp_path).with_name(f"{Path(temp_path).stem}_processed.wav")
            proc.unlink(missing_ok=True)
