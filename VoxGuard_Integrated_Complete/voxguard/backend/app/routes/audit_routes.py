from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..services.audit.audit_logger import AuditLogger
from ..services.audit.integrity_check import verify_audit_integrity
from ..services.audit.blockchain import SecurityBlockchain
from ..core.config import settings

router = APIRouter(prefix="/api/audit", tags=["Tamper-Evident Audit & Blockchain"])

_logger = AuditLogger(settings.AUDIT_LOG_PATH)
_blockchain = SecurityBlockchain()


class EvidenceHashRequest(BaseModel):
    call_id: str = Field(..., description="Unique call identifier")
    metadata: dict = Field(default_factory=dict, description="Evidence metadata dictionary")


@router.get("/logs")
def get_audit_logs(limit: int = 50):
    """Retrieve recent hash-chained audit log records."""
    records = _logger.get_recent_records(limit=limit)
    return {
        "success": True,
        "count": len(records),
        "records": records,
    }


@router.get("/verify")
def verify_audit():
    """Verify cryptographic hash-chain integrity of the audit log."""
    result = verify_audit_integrity(settings.AUDIT_LOG_PATH)
    return {
        "success": True,
        "integrity": result,
    }


@router.get("/blockchain")
def get_blockchain(limit: int = 50):
    """Retrieve verified blockchain blocks and chain validity status."""
    blocks = _blockchain.get_blocks(limit=limit)
    chain_status = _blockchain.verify_chain()
    return {
        "success": True,
        "block_count": len(blocks),
        "chain_valid": chain_status["valid"],
        "blocks": blocks,
        "chain_status": chain_status,
    }


@router.post("/evidence")
def seal_evidence(request: EvidenceHashRequest):
    """Generate SHA-256 evidence digest and append an immutable block."""
    evidence_hash = _blockchain.generate_evidence_hash(request.metadata)
    block = _blockchain.add_incident(
        incident_id=f"EV-{request.call_id}",
        risk_level="INFO",
        detection_type="EVIDENCE_SEALED",
        action="RECORDED",
        model_version="SHA256-Ledger-v1",
        evidence=request.metadata,
    )
    return {
        "success": True,
        "call_id": request.call_id,
        "evidence_hash": evidence_hash,
        "transaction_id": block["transaction_id"],
        "block_hash": block["block_hash"],
        "block": block,
    }
