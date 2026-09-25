from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Optional
import logging
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..pipeline import UnifiedVoxGuardPipeline
from ..core.database import get_db
from ..core.models import Call, RiskEvent, Incident, AuditLog

logger = logging.getLogger("voxguard.pipeline")

router = APIRouter(prefix="/api/pipeline", tags=["Unified Pipeline"])

_pipeline = UnifiedVoxGuardPipeline()


@router.post("/analyze")
async def analyze_full_call(
    file: UploadFile = File(...),
    expected_speaker_id: Optional[str] = Form(None),
    caller_phone: Optional[str] = Form(None),
    behavior_risk: Optional[float] = Form(None),
    db: Optional[Session] = Depends(get_db),
):
    """
    End-to-end VoxGuard call security analysis.
    Ingests audio -> extracts acoustic features & deepfake score ->
    verifies voice biometric identity -> detects language & transcribes ->
    scans for fraud intent -> computes multi-signal risk -> makes decision ->
    creates incident/blockchain block if needed -> logs to hash-chain audit log.
    Persists call, risk_event, incident, and audit_log to PostgreSQL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    ext = Path(file.filename).suffix.lower()
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Audio file cannot be empty")

    temp_path = None
    try:
        with NamedTemporaryFile(suffix=ext, delete=False) as tf:
            tf.write(data)
            temp_path = tf.name

        report = _pipeline.analyze_call(
            audio_path=temp_path,
            expected_speaker_id=expected_speaker_id,
            behavior_risk=behavior_risk,
            caller_phone=caller_phone,
        )

        # ------------------------------------------------------------------
        # Safe PostgreSQL Persistence (Calls, RiskEvents, Incidents, AuditLogs)
        # ------------------------------------------------------------------
        if db is not None and hasattr(db, "add") and hasattr(db, "commit"):
            try:
                # 1. Call Record
                call_record = Call(
                    id=report.call_id,
                    status="analyzed",
                    risk_score=report.overall_risk_score,
                )
                db.add(call_record)

                # 2. Risk Event Metrics (No raw audio stored)
                risk_event = RiskEvent(
                    call_id=report.call_id,
                    deepfake_score=report.deepfake_score,
                    speaker_score=report.speaker_match_score,
                    intent_score=report.fraud_score,
                    overall_risk=report.overall_risk_score,
                )
                db.add(risk_event)

                # 3. Incident Record (if VERIFY, BLOCK, or suspicious)
                if report.decision in ("VERIFY", "BLOCK") or report.overall_risk_score >= 0.50:
                    inc_id = None
                    if report.incident and isinstance(report.incident, dict):
                        inc_id = report.incident.get("incident_id")
                    
                    incident_record = Incident(
                        id=inc_id,
                        call_id=report.call_id,
                        risk_score=report.overall_risk_score,
                        reason=", ".join(report.reasons) if report.reasons else "High voice threat detected",
                        action_taken=report.decision,
                    )
                    db.add(incident_record)

                # 4. Audit Log Record
                audit_record = AuditLog(
                    call_id=report.call_id,
                    event_type="CALL_ANALYZED",
                    details={
                        "risk_level": report.risk_level,
                        "decision": report.decision,
                        "voice_status": report.voice_status,
                        "detected_language": report.detected_language,
                    },
                    hash=report.audit_hash,
                )
                db.add(audit_record)

                db.commit()
            except Exception as db_err:
                db.rollback()
                logger.warning("[Database] Pipeline persistence warning: %s", db_err)

        return {
            "success": True,
            "report": report.to_dict(),
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Full pipeline analysis failed: {exc}") from exc

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
            proc = Path(temp_path).with_name(f"{Path(temp_path).stem}_processed.wav")
            proc.unlink(missing_ok=True)


@router.post("/stream-chunk")
async def analyze_stream_chunk(
    file: UploadFile = File(...),
    call_id: Optional[str] = Form(None),
    transcript_chunk: Optional[str] = Form(None),
    caller_phone: Optional[str] = Form(None),
):
    """
    Real-time streaming analysis endpoint for live incoming calls.
    Accepts 1-second audio chunk + optional partial transcript.
    Returns real-time deepfake probability, voice authenticity,
    detected fraud triggers, and current threat level.
    """
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty audio chunk")

    temp_path = None
    try:
        ext = Path(file.filename or "chunk.wav").suffix.lower() or ".wav"
        with NamedTemporaryFile(suffix=ext, delete=False) as tf:
            tf.write(data)
            temp_path = tf.name

        # 1. Voice Authenticity via AASIST
        voice_result = _pipeline.voice_pipeline.analyze_file(temp_path)
        authenticity_score = voice_result.get("authenticity_score", 0.5)
        deepfake_score = voice_result.get("spoof_score", 0.5)
        voice_status = voice_result.get("status", "UNCERTAIN")

        # 2. Fraud Intent on transcript if provided
        fraud_score = 0.0
        detected_types = []
        is_suspicious = False
        if transcript_chunk and transcript_chunk.strip():
            fraud_res = _pipeline.fraud_detector.analyze(transcript_chunk)
            fraud_score = fraud_res.fraud_score
            detected_types = [t.value if hasattr(t, "value") else str(t) for t in fraud_res.detected_types if t.value != "NONE"]
            is_suspicious = fraud_res.is_suspicious

        # 3. Dynamic Combined Risk
        total_risk = (deepfake_score * 0.55) + (fraud_score * 0.45)
        if total_risk >= 0.70 or deepfake_score >= 0.85:
            risk_level = "CRITICAL"
            decision = "BLOCK"
        elif total_risk >= 0.45 or deepfake_score >= 0.60:
            risk_level = "HIGH"
            decision = "VERIFY"
        elif total_risk >= 0.25:
            risk_level = "MEDIUM"
            decision = "WARN"
        else:
            risk_level = "LOW"
            decision = "ALLOW"

        return {
            "success": True,
            "call_id": call_id or "STREAM-LIVE",
            "voice_authenticity": round(authenticity_score * 100, 1),
            "deepfake_probability": round(deepfake_score * 100, 1),
            "voice_status": voice_status,
            "fraud_score": round(fraud_score, 2),
            "fraud_intent_types": detected_types,
            "overall_risk_score": round(total_risk, 2),
            "risk_level": risk_level,
            "decision": decision,
        }

    except Exception as exc:
        logger.error("[Stream Chunk] Error processing chunk: %s", exc)
        raise HTTPException(status_code=500, detail=f"Chunk processing error: {exc}") from exc

    finally:
        if temp_path:
            Path(temp_path).unlink(missing_ok=True)
            proc = Path(temp_path).with_name(f"{Path(temp_path).stem}_processed.wav")
            proc.unlink(missing_ok=True)

