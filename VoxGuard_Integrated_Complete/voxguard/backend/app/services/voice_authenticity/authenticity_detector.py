from dataclasses import dataclass


@dataclass
class AuthenticityResult:
    authenticity_score: float
    risk_score: float
    status: str
    reasons: list[str]


class AuthenticityDetector:
    """Rule-based voice authenticity analysis for Person 4."""

    def analyze(
        self,
        audio_quality: float,
        spectral_consistency: float,
        temporal_consistency: float,
        replay_artifact_score: float = 0.0,
    ) -> AuthenticityResult:
        values = {
            "audio_quality": audio_quality,
            "spectral_consistency": spectral_consistency,
            "temporal_consistency": temporal_consistency,
            "replay_artifact_score": replay_artifact_score,
        }

        for name, value in values.items():
            if not 0.0 <= float(value) <= 1.0:
                raise ValueError(f"{name} must be between 0 and 1.")

        authenticity_score = (
            audio_quality * 0.25
            + spectral_consistency * 0.30
            + temporal_consistency * 0.30
            + (1.0 - replay_artifact_score) * 0.15
        )

        authenticity_score = round(
            max(0.0, min(1.0, authenticity_score)), 4
        )

        risk_score = round(1.0 - authenticity_score, 4)

        reasons = []

        if audio_quality < 0.50:
            reasons.append("Low audio quality")
        if spectral_consistency < 0.50:
            reasons.append("Abnormal spectral consistency")
        if temporal_consistency < 0.50:
            reasons.append("Abnormal temporal consistency")
        if replay_artifact_score >= 0.50:
            reasons.append("Possible replay artifacts")

        if authenticity_score >= 0.75:
            status = "AUTHENTIC"
        elif authenticity_score >= 0.50:
            status = "UNCERTAIN"
        else:
            status = "SUSPICIOUS"

        return AuthenticityResult(
            authenticity_score=authenticity_score,
            risk_score=risk_score,
            status=status,
            reasons=reasons,
        )
