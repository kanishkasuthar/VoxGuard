from enum import Enum
from .config import THRESHOLDS


class Decision(str, Enum):
    ALLOW = "ALLOW"
    WARN = "WARN"
    VERIFY = "VERIFY"
    BLOCK = "BLOCK"


def make_decision(risk_score: float) -> Decision:
    if risk_score < THRESHOLDS.allow:
        return Decision.ALLOW

    if risk_score < THRESHOLDS.warn:
        return Decision.WARN

    if risk_score < THRESHOLDS.verify:
        return Decision.VERIFY

    return Decision.BLOCK
