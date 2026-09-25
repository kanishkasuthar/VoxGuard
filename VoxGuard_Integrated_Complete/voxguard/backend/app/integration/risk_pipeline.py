from ..services.risk.risk_engine import RiskEngine
from ..services.risk.decision_engine import make_decision, Decision
from ..services.challenge.verification_service import VerificationService
from .signal_adapter import SignalAdapter
from .model_versions import get_model_versions


class RiskPipeline:
    """
    Receives standardized signals, calculates overall risk,
    determines the security decision, and triggers verification when required.
    """

    def __init__(self):
        self.risk_engine = RiskEngine()
        self.verification_service = VerificationService()

    def process(self, data: dict):
        signals = SignalAdapter.adapt(data)

        result = self.risk_engine.calculate(
            voice_authenticity=signals.voice_authenticity,
            speaker_confidence=signals.speaker_confidence,
            fraud_score=signals.fraud_score,
            behavior_risk=signals.behavior_risk,
        )

        decision = make_decision(result.overall_score)

        verification = None
        if decision == Decision.VERIFY:
            verification = self.verification_service.start()

        return {
            "overall_score": result.overall_score,
            "risk_level": result.risk_level,
            "decision": decision.value,
            "reasons": result.reasons,
            "component_scores": result.component_scores,
            "verification": verification,
            "source_versions": get_model_versions(),
        }
