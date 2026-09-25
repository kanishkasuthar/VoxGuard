from dataclasses import dataclass
from typing import Dict, Optional

from .config import WEIGHTS, THRESHOLDS


@dataclass
class RiskResult:
    overall_score: float
    risk_level: str
    reasons: list[str]
    component_scores: Dict[str, float]


class RiskEngine:

    def calculate(
        self,
        voice_authenticity: Optional[float] = None,
        speaker_confidence: Optional[float] = None,
        fraud_score: Optional[float] = None,
        behavior_risk: Optional[float] = None,
    ) -> RiskResult:

        components = {}
        reasons = []

        if voice_authenticity is not None:
            components["voice"] = 1.0 - self._clamp(voice_authenticity)

        if speaker_confidence is not None:
            components["speaker"] = 1.0 - self._clamp(speaker_confidence)

        if fraud_score is not None:
            components["fraud"] = self._clamp(fraud_score)

        if behavior_risk is not None:
            components["behavior"] = self._clamp(behavior_risk)

        if not components:
            return RiskResult(
                overall_score=0.0,
                risk_level="UNKNOWN",
                reasons=["No risk signals available"],
                component_scores={}
            )

        weight_map = {
            "voice": WEIGHTS.voice,
            "speaker": WEIGHTS.speaker,
            "fraud": WEIGHTS.fraud,
            "behavior": WEIGHTS.behavior,
        }

        active_weight = sum(weight_map[k] for k in components)

        score = sum(
            components[k] * weight_map[k]
            for k in components
        ) / active_weight

        score = round(self._clamp(score), 4)

        for name, value in components.items():
            if value >= 0.75:
                reasons.append(f"High {name} risk")
            elif value >= 0.50:
                reasons.append(f"Moderate {name} risk")

        if score < THRESHOLDS.allow:
            risk_level = "LOW"
        elif score < THRESHOLDS.warn:
            risk_level = "MODERATE"
        elif score < THRESHOLDS.verify:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return RiskResult(
            overall_score=score,
            risk_level=risk_level,
            reasons=reasons,
            component_scores={k: round(v, 4) for k, v in components.items()},
        )

    @staticmethod
    def _clamp(value: float) -> float:
        return max(0.0, min(1.0, float(value)))
