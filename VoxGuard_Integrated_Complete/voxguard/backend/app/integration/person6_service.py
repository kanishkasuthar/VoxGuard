import uuid
from ..services.audit.audit_logger import AuditLogger
from ..services.audit.integrity_check import verify_audit_integrity
from ..services.audit.blockchain import SecurityBlockchain
from ..services.risk.risk_engine import RiskEngine
from ..services.risk.decision_engine import make_decision, Decision
from ..services.challenge.verification_service import VerificationService
from ..security.authentication import AuthenticationManager, AuthorizationManager
from ..security.rate_limiter import RateLimiter
from ..security.validation import validate_risk_input
from ..services.incident.incident_manager import IncidentManager
from .signal_adapter import SignalAdapter
from .model_versions import get_model_versions
from ..core.config import settings


class Person6Service:
    """
    Complete Person 6 security and risk-processing service.

    Responsibilities:
    - Authentication
    - Rate limiting
    - Input validation
    - Signal standardization
    - Risk calculation
    - Security decision
    - Verification challenge
    - Suspicious incident creation
    - Blockchain incident recording
    - Audit logging
    - Audit integrity verification
    """

    def __init__(self, log_file: str | None = None):
        self.log_file = log_file or settings.AUDIT_LOG_PATH
        self.risk_engine = RiskEngine()
        self.verification_service = VerificationService()
        self.authentication = AuthenticationManager()
        self.authorization = AuthorizationManager()
        self.rate_limiter = RateLimiter()
        self.audit_logger = AuditLogger(self.log_file)
        self.incident_manager = IncidentManager()
        self.blockchain = SecurityBlockchain()

    def process(
        self,
        data: dict,
        client_id: str = "default",
        api_key: str | None = None,
        role: str = "admin",
        call_id: str | None = None,
    ):
        call_id = call_id or str(uuid.uuid4())

        # 1. Authentication
        if api_key is not None:
            if not self.authentication.authenticate(api_key):
                raise PermissionError("Authentication failed")

        # 2. Authorization
        if not self.authorization.authorize(role, "risk"):
            raise PermissionError("Role not authorized for risk processing")

        # 3. Rate limiting
        if not self.rate_limiter.allow(client_id):
            raise PermissionError("Rate limit exceeded")

        # 4. Input validation
        validate_risk_input(data)

        # 5. Standardize signals
        signals = SignalAdapter.adapt(data)

        # 6. Risk calculation
        result = self.risk_engine.calculate(
            voice_authenticity=signals.voice_authenticity,
            speaker_confidence=signals.speaker_confidence,
            fraud_score=signals.fraud_score,
            behavior_risk=signals.behavior_risk,
        )

        # 7. Security decision
        decision = make_decision(result.overall_score)

        # 8. Verification challenge when required
        verification = None
        if decision == Decision.VERIFY:
            verification = self.verification_service.start()

        # 9. Create incident for suspicious/high-risk events
        incident = None
        if decision in (Decision.VERIFY, Decision.BLOCK):
            severity = "HIGH" if decision == Decision.VERIFY else "CRITICAL"
            incident = self.incident_manager.create_incident(
                call_id=call_id,
                severity=severity,
                event="SUSPICIOUS_RISK_EVENT",
                risk_score=result.overall_score,
                decision=decision.value,
                details={
                    "risk_level": result.risk_level,
                    "reasons": result.reasons,
                    "component_scores": result.component_scores,
                },
            )

        # 10. Blockchain ledger record
        blockchain_record = None
        if incident is not None:
            blockchain_record = self.blockchain.add_incident(
                incident_id=incident.incident_id,
                risk_level=incident.details.get("risk_level", incident.severity),
                detection_type=incident.event,
                action=incident.decision,
                model_version=get_model_versions().get("risk_engine", "v2.0"),
                evidence={
                    "call_id": incident.call_id,
                    "risk_score": incident.risk_score,
                    "decision": incident.decision,
                    "details": incident.details,
                },
            )

        # 11. Cryptographic Audit logging
        audit_record = self.audit_logger.log(
            event="RISK_PROCESSED",
            risk_score=result.overall_score,
            decision=decision.value,
            call_id=call_id,
            details={
                "risk_level": result.risk_level,
                "reasons": result.reasons,
                "component_scores": result.component_scores,
                "incident_id": incident.incident_id if incident else None,
            },
            model_versions=get_model_versions(),
        )

        # 12. Complete response
        return {
            "call_id": call_id,
            "overall_score": result.overall_score,
            "risk_level": result.risk_level,
            "decision": decision.value,
            "reasons": result.reasons,
            "component_scores": result.component_scores,
            "verification": verification,
            "incident": (
                {
                    "incident_id": incident.incident_id,
                    "severity": incident.severity,
                    "event": incident.event,
                    "status": incident.status,
                    "timestamp": incident.timestamp,
                }
                if incident
                else None
            ),
            "model_versions": get_model_versions(),
            "audit_hash": audit_record["hash"],
            "blockchain": (
                {
                    "recorded": True,
                    "transaction_id": blockchain_record["transaction_id"],
                    "block_hash": blockchain_record["block_hash"],
                    "evidence_hash": blockchain_record["evidence_hash"],
                    "chain_status": self.blockchain.verify_chain(),
                }
                if blockchain_record
                else {
                    "recorded": False,
                    "transaction_id": None,
                    "block_hash": None,
                    "evidence_hash": None,
                    "chain_status": self.blockchain.verify_chain(),
                }
            ),
        }

    def verify_audit(self) -> dict:
        return verify_audit_integrity(self.log_file)
