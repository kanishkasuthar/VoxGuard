import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.pipeline import UnifiedVoxGuardPipeline
from app.services.fraud.fraud_detection import FraudIntentDetector


def main():
    print("=" * 65)
    print("           VOXGUARD UNIFIED PROCESSING PIPELINE DEMO")
    print("=" * 65)
    print()

    pipeline = UnifiedVoxGuardPipeline()
    sample_wav = Path(__file__).parent / "tests" / "samples" / "person4_test.wav"

    if not sample_wav.exists():
        print(f"Sample wav not found at {sample_wav}")
        return

    print(f"[*] Analyzing incoming call audio: {sample_wav.name}")
    print("    Expected Speaker: Enrolled User 'Alex'")
    print("    Caller Phone:     +91 98765 43210")
    print()

    report = pipeline.analyze_call(
        audio_path=str(sample_wav),
        expected_speaker_id="alex",
        caller_phone="+91 98765 43210",
        behavior_risk=0.20,
    )

    print("[1] VOICE AUTHENTICITY & DEEPFAKE DETECTION (AASIST ONNX + DSP)")
    print(f"    Authenticity Score : {report.voice_authenticity_score}")
    print(f"    Deepfake Risk Score: {report.deepfake_score}")
    print(f"    Voice Status       : {report.voice_status}")
    print()

    print("[2] BIOMETRIC SPEAKER VERIFICATION (SpeechBrain ECAPA-TDNN)")
    print(f"    Speaker Match Score: {report.speaker_match_score}")
    print(f"    Identity Status    : {report.identity_status}")
    print()

    print("[3] MULTILINGUAL LANGUAGE & TRANSCRIPTION (Whisper)")
    print(f"    Detected Language  : {report.detected_language} (Conf: {report.language_confidence})")
    print(f"    Transcript         : \"{report.transcript}\"")
    print()

    print("[4] MULTILINGUAL FRAUD INTENT DETECTION (Rule-based Regex)")
    print(f"    Detected Intent    : {report.fraud_intent_types}")
    print(f"    Fraud Score        : {report.fraud_score}")
    print(f"    Suspicious Call    : {report.is_suspicious_call}")
    print()

    print("[5] RISK ENGINE & DECISION")
    print(f"    Overall Risk Score : {report.overall_risk_score} / 1.0")
    print(f"    Risk Level         : {report.risk_level}")
    print(f"    Security Decision  : {report.decision}")
    print(f"    Component Scores   : {report.component_scores}")
    print(f"    Reasons            : {report.reasons}")
    print()

    if report.verification:
        print("[6] SECONDARY VERIFICATION CHALLENGE")
        print(f"    Challenge ID       : {report.verification['challenge_id']}")
        print(f"    Expires At         : {report.verification['expires_at']}")
        print(f"    Max Attempts       : {report.verification['max_attempts']}")
        print()

    if report.incident:
        print("[7] SECURITY INCIDENT CREATED")
        print(f"    Incident ID        : {report.incident['incident_id']}")
        print(f"    Severity           : {report.incident['severity']}")
        print(f"    Event Type         : {report.incident['event']}")
        print()

    print("[8] CRYPTOGRAPHIC AUDIT & BLOCKCHAIN")
    print(f"    SHA-256 Audit Hash : {report.audit_hash}")
    if report.blockchain_tx:
        print(f"    Blockchain Tx ID   : {report.blockchain_tx}")
    print()

    print("=" * 65)
    print("           VOXGUARD PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 65)


if __name__ == "__main__":
    main()
