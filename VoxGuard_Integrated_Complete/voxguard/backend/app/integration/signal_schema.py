from dataclasses import dataclass
from typing import Optional


@dataclass
class RiskSignals:
    voice_authenticity: Optional[float] = None
    speaker_confidence: Optional[float] = None
    fraud_score: Optional[float] = None
    behavior_risk: Optional[float] = None
