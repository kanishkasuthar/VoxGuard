"""
pipeline.py
-----------
Unified VoxGuard Processing Pipeline.

Orchestrates:
    1. Preprocessing & Acoustic Feature Extraction (DSP)
    2. Voice Authenticity & Deepfake Detection (AASIST ONNX)
    3. Multilingual Speech Recognition & Language ID (OpenAI Whisper)
    4. Multilingual Fraud & Social Engineering Intent Detection (Rule-based Regex)
    5. Biometric Speaker Verification (SpeechBrain ECAPA-TDNN)
    6. Multi-Signal Risk Calculation (VoxGuard Risk Engine)
    7. Security Decision (Decision Engine: ALLOW, WARN, VERIFY, BLOCK)
    8. Secondary OTP Challenge (if VERIFY)
    9. Incident Creation & Blockchain Evidence Sealing (if VERIFY or BLOCK)
    10. Tamper-Evident SHA-256 Hash-Chain Audit Logging
"""

from __future__ import annotations

import json
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from .services.voice_authenticity.offline_voice_pipeline import OfflineVoicePipeline
from .services.speaker.speaker_verification import SpeakerVerifier, IdentityStatus
from .services.language.language_processing import MultilingualProcessor
from .services.fraud.fraud_detection import FraudIntentDetector, FraudIntentType
from .services.risk.risk_engine import RiskEngine
from .services.risk.decision_engine import make_decision, Decision
from .services.challenge.verification_service import VerificationService
from .services.incident.incident_manager import IncidentManager
from .services.audit.audit_logger import AuditLogger
from .services.audit.blockchain import SecurityBlockchain
from .integration.model_versions import get_model_versions
from .core.config import settings


@dataclass
class VoiceGuardReport:
    call_id: str
    detected_language: str
    language_confidence: float
    transcript: str
    speaker_match_score: float
    identity_status: str
    matched_speaker_id: Optional[str]
    voice_authenticity_score: float
    deepfake_score: float
    voice_status: str
    fraud_intent_types: List[str]
    fraud_score: float
    is_suspicious_call: bool
    overall_risk_score: float
    risk_level: str
    decision: str
    reasons: List[str]
    component_scores: Dict[str, float]
    verification: Optional[dict] = None
    incident: Optional[dict] = None
    audit_hash: Optional[str] = None
    blockchain_tx: Optional[str] = None
    model_versions: Dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)


class UnifiedVoxGuardPipeline:
    """Central orchestration pipeline for VoxGuard voice security."""

    def __init__(
        self,
        whisper_model_size: str = "small",
        verified_threshold: float = 0.75,
        uncertain_threshold: float = 0.60,
        fraud_suspicious_threshold: float = 0.40,
    ):
        self.voice_pipeline = OfflineVoicePipeline()
        self.speaker_verifier = SpeakerVerifier(
            verified_threshold=verified_threshold,
            uncertain_threshold=uncertain_threshold,
        )
        self.language_processor = MultilingualProcessor(model_size=whisper_model_size)
        self.fraud_detector = FraudIntentDetector(
            suspicious_threshold=fraud_suspicious_threshold
        )
        self.risk_engine = RiskEngine()
        self.verification_service = VerificationService()
        self.incident_manager = IncidentManager()
        self.audit_logger = AuditLogger(settings.AUDIT_LOG_PATH)
        self.blockchain = SecurityBlockchain()

        # Load enrolled voiceprints if available
        if Path(settings.VOICEPRINTS_PATH).exists():
            self.speaker_verifier.load_enrollment(settings.VOICEPRINTS_PATH)

    # ------------------------------------------------------------------ #
    # Speaker Enrollment Helpers
    # ------------------------------------------------------------------ #
    def enroll_speaker(self, speaker_id: str, audio_paths: List[str]) -> None:
        self.speaker_verifier.enroll_speaker(speaker_id, audio_paths)
        self.speaker_verifier.save_enrollment(settings.VOICEPRINTS_PATH)

    # ------------------------------------------------------------------ #
    # Full Call Analysis
    # ------------------------------------------------------------------ #
    def analyze_call(
        self,
        audio_path: str,
        expected_speaker_id: Optional[str] = None,
        behavior_risk: Optional[float] = None,
        caller_phone: Optional[str] = None,
        call_id: Optional[str] = None,
    ) -> VoiceGuardReport:
        call_id = call_id or str(uuid.uuid4())

        # 1. Voice Authenticity & Deepfake Analysis (AASIST ONNX + DSP)
        voice_result = self.voice_pipeline.analyze_file(audio_path)
        authenticity_score = voice_result["authenticity_score"]
        deepfake_score = voice_result["deepfake_score"]
        voice_status = voice_result["voice_status"]

        # 2. Speaker Biometric Verification (SpeechBrain ECAPA-TDNN)
        speaker_result = self.speaker_verifier.verify(audio_path, expected_speaker_id)
        speaker_confidence = speaker_result.similarity_score

        # 3. Multilingual Speech-to-Text (Whisper)
        transcription = self.language_processor.transcribe(audio_path)
        transcript_text = transcription.transcript

        # 4. Multilingual Fraud & Social Engineering Intent Detection
        fraud_result = self.fraud_detector.analyze(
            transcript=transcript_text,
            language_code=transcription.language_code,
        )
        fraud_score = fraud_result.fraud_score

        # 5. Risk Calculation
        # Map speaker status into confidence: if verified -> speaker_confidence, if unverified/no enrollment -> handle appropriately
        effective_speaker_conf = speaker_confidence if speaker_result.status != IdentityStatus.NO_ENROLLMENT else None

        risk_calc = self.risk_engine.calculate(
            voice_authenticity=authenticity_score,
            speaker_confidence=effective_speaker_conf,
            fraud_score=fraud_score,
            behavior_risk=behavior_risk,
        )

        overall_risk_score = risk_calc.overall_score
        risk_level = risk_calc.risk_level
        reasons = risk_calc.reasons

        # 6. Security Decision
        decision = make_decision(overall_risk_score)

        # 7. Verification Challenge (if VERIFY)
        verification = None
        if decision == Decision.VERIFY:
            verification = self.verification_service.start()

        # 8. Security Incident Creation (if VERIFY or BLOCK)
        incident_info = None
        blockchain_tx = None
        if decision in (Decision.VERIFY, Decision.BLOCK):
            severity = "HIGH" if decision == Decision.VERIFY else "CRITICAL"
            incident = self.incident_manager.create_incident(
                call_id=call_id,
                severity=severity,
                event="VOICE_SECURITY_ALERT",
                risk_score=overall_risk_score,
                decision=decision.value,
                details={
                    "risk_level": risk_level,
                    "reasons": reasons,
                    "caller_phone": caller_phone,
                    "detected_language": transcription.language_name,
                    "fraud_types": [t.value for t in fraud_result.detected_types],
                },
            )
            incident_info = {
                "incident_id": incident.incident_id,
                "severity": incident.severity,
                "event": incident.event,
                "status": incident.status,
                "timestamp": incident.timestamp,
            }

            # Seal in Blockchain Ledger
            tx = self.blockchain.add_incident(
                incident_id=incident.incident_id,
                risk_level=risk_level,
                detection_type="VOICE_SECURITY_ALERT",
                action=decision.value,
                model_version=get_model_versions().get("risk_engine", "v2.0"),
                evidence={
                    "call_id": call_id,
                    "risk_score": overall_risk_score,
                    "deepfake_score": deepfake_score,
                    "fraud_score": fraud_score,
                },
            )
            blockchain_tx = tx["transaction_id"]

        # 9. Cryptographic Audit Logging
        audit_record = self.audit_logger.log(
            event="CALL_ANALYZED",
            risk_score=overall_risk_score,
            decision=decision.value,
            call_id=call_id,
            details={
                "risk_level": risk_level,
                "voice_status": voice_status,
                "detected_language": transcription.language_name,
                "fraud_score": fraud_score,
                "incident_id": incident_info.get("incident_id") if incident_info else None,
            },
            model_versions=get_model_versions(),
        )

        return VoiceGuardReport(
            call_id=call_id,
            detected_language=transcription.language_name,
            language_confidence=transcription.language_confidence,
            transcript=transcript_text,
            speaker_match_score=speaker_confidence,
            identity_status=speaker_result.status.value if isinstance(speaker_result.status, IdentityStatus) else str(speaker_result.status),
            matched_speaker_id=speaker_result.matched_speaker_id,
            voice_authenticity_score=authenticity_score,
            deepfake_score=deepfake_score,
            voice_status=voice_status,
            fraud_intent_types=[t.value for t in fraud_result.detected_types],
            fraud_score=fraud_score,
            is_suspicious_call=fraud_result.is_suspicious or (overall_risk_score >= 0.50),
            overall_risk_score=overall_risk_score,
            risk_level=risk_level,
            decision=decision.value,
            reasons=reasons,
            component_scores=risk_calc.component_scores,
            verification=verification,
            incident=incident_info,
            audit_hash=audit_record["hash"],
            blockchain_tx=blockchain_tx,
            model_versions=get_model_versions(),
        )
