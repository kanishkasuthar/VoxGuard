from ..services.audit.audit_logger import AuditLogger
from ..services.audit.integrity_check import verify_audit_integrity
from .model_versions import get_model_versions
from ..core.config import settings


class AuditIntegration:
    """
    Audit integration layer connecting the risk-processing pipeline
    with the tamper-evident audit logging and integrity system.
    """

    def __init__(self, log_file: str | None = None):
        self.log_file = log_file or settings.AUDIT_LOG_PATH
        self.logger = AuditLogger(self.log_file)

    def log_risk_event(
        self,
        event: str,
        risk_score: float,
        decision: str,
        call_id: str | None = None,
        details: dict | None = None,
    ):
        return self.logger.log(
            event=event,
            risk_score=risk_score,
            decision=decision,
            call_id=call_id,
            details=details,
            model_versions=get_model_versions(),
        )

    def verify_integrity(self) -> dict:
        return verify_audit_integrity(self.log_file)
