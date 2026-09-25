MODEL_VERSIONS = {
    "risk_engine": "v2.0",
    "voice_authenticity": "AASIST-L-ONNX-v1",
    "speaker_verification": "SpeechBrain-ECAPA-v1",
    "fraud_detection": "MultilingualRules-v1",
    "language_processing": "Whisper-Multilingual-v1",
    "blockchain_audit": "SHA256-Ledger-v1",
    "behavior_analysis": "v1.0",
}


def get_model_versions() -> dict:
    """Returns the model/component versions used during VoxGuard processing."""
    return MODEL_VERSIONS.copy()
