from dataclasses import dataclass

@dataclass
class RiskThresholds:
    allow: float = 0.25
    warn: float = 0.50
    verify: float = 0.75

@dataclass
class RiskWeights:
    voice: float = 0.30
    speaker: float = 0.25
    fraud: float = 0.25
    behavior: float = 0.20

THRESHOLDS = RiskThresholds()
WEIGHTS = RiskWeights()
