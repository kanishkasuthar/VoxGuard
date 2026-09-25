from .audio_processor import AudioProcessor
from .authenticity_detector import AuthenticityDetector


class Person4Pipeline:
    """Complete Person 4 voice authenticity processing pipeline."""

    def __init__(self):
        self.audio_processor = AudioProcessor()
        self.detector = AuthenticityDetector()

    def process(
        self,
        audio_file: str,
        audio_quality: float,
        spectral_consistency: float,
        temporal_consistency: float,
        replay_artifact_score: float = 0.0,
    ) -> dict:
        file_info = self.audio_processor.validate_file(audio_file)

        result = self.detector.analyze(
            audio_quality=audio_quality,
            spectral_consistency=spectral_consistency,
            temporal_consistency=temporal_consistency,
            replay_artifact_score=replay_artifact_score,
        )

        return {
            "module": "Person4",
            "analysis_type": "Voice Authenticity Detection",
            "audio": file_info,
            "authenticity_score": result.authenticity_score,
            "risk_score": result.risk_score,
            "status": result.status,
            "reasons": result.reasons,
        }
