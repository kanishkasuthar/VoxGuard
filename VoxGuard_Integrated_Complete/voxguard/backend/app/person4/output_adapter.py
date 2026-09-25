from .person4_pipeline import Person4Pipeline


class Person4OutputAdapter:
    """Converts Person 4 results into a standard integration format."""

    @staticmethod
    def to_risk_signal(result: dict) -> dict:
        return {
            "voice_authenticity": result["authenticity_score"],
            "voice_risk_score": result["risk_score"],
            "voice_status": result["status"],
            "voice_reasons": result["reasons"],
            "source": "Person4",
        }


def create_person4_output(
    audio_file: str,
    audio_quality: float,
    spectral_consistency: float,
    temporal_consistency: float,
    replay_artifact_score: float = 0.0,
) -> dict:
    pipeline = Person4Pipeline()

    result = pipeline.process(
        audio_file=audio_file,
        audio_quality=audio_quality,
        spectral_consistency=spectral_consistency,
        temporal_consistency=temporal_consistency,
        replay_artifact_score=replay_artifact_score,
    )

    result["risk_signal"] = Person4OutputAdapter.to_risk_signal(result)
    return result
