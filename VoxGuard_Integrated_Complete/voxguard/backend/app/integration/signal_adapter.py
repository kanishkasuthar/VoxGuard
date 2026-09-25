from .signal_schema import RiskSignals


class SignalAdapter:
    """Adapts raw dictionary signals from external callers into standardized RiskSignals."""

    @staticmethod
    def adapt(data: dict) -> RiskSignals:
        return RiskSignals(
            voice_authenticity=data.get("voice_authenticity"),
            speaker_confidence=data.get("speaker_confidence"),
            fraud_score=data.get("fraud_score"),
            behavior_risk=data.get("behavior_risk"),
        )
