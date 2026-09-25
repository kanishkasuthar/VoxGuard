from ..services.voice_authenticity.audio_processor import AudioProcessor
from ..services.voice_authenticity.authenticity_detector import AuthenticityDetector


class Person4Service:
    """Main service for Person 4 voice authenticity analysis."""

    def __init__(self):
        self.audio_processor = AudioProcessor()
        self.authenticity_detector = AuthenticityDetector()

    def validate_audio(self, file_path: str) -> dict:
        """Validate an audio file before analysis."""
        return self.audio_processor.validate_file(file_path)

    def analyze_voice(
        self,
        audio_quality: float,
        spectral_consistency: float,
        temporal_consistency: float,
        replay_artifact_score: float = 0.0,
    ) -> dict:
        """Analyze voice authenticity and return a structured result."""
        result = self.authenticity_detector.analyze(
            audio_quality=audio_quality,
            spectral_consistency=spectral_consistency,
            temporal_consistency=temporal_consistency,
            replay_artifact_score=replay_artifact_score,
        )

        return {
            "authenticity_score": result.authenticity_score,
            "risk_score": result.risk_score,
            "status": result.status,
            "reasons": result.reasons,
        }
