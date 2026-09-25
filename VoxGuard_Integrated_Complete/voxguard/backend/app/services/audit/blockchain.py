import hashlib
import json
import uuid
from datetime import datetime, timezone


class SecurityBlockchain:
    """Tamper-evident blockchain ledger for security incident and evidence sealing."""

    def __init__(self):
        self.chain = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = {
            "index": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "transaction_id": "GENESIS",
            "incident_id": "GENESIS",
            "risk_level": "GENESIS",
            "detection_type": "GENESIS",
            "action": "GENESIS",
            "model_version": "GENESIS",
            "evidence_hash": "GENESIS",
            "previous_hash": "0",
        }

        genesis["block_hash"] = self._calculate_hash(genesis)
        self.chain.append(genesis)

    @staticmethod
    def _calculate_hash(block_data: dict) -> str:
        data = dict(block_data)
        data.pop("block_hash", None)

        serialized = json.dumps(
            data,
            sort_keys=True,
            separators=(",", ":"),
        )

        return hashlib.sha256(
            serialized.encode("utf-8")
        ).hexdigest()

    @staticmethod
    def generate_evidence_hash(evidence: dict) -> str:
        serialized = json.dumps(
            evidence,
            sort_keys=True,
            separators=(",", ":"),
        )

        return hashlib.sha256(
            serialized.encode("utf-8")
        ).hexdigest()

    def add_incident(
        self,
        incident_id: str,
        risk_level: str,
        detection_type: str,
        action: str,
        model_version: str,
        evidence: dict,
    ) -> dict:
        previous_block = self.chain[-1]
        evidence_hash = self.generate_evidence_hash(evidence)

        block = {
            "index": len(self.chain),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "transaction_id": "TX-" + uuid.uuid4().hex[:16].upper(),
            "incident_id": incident_id,
            "risk_level": risk_level,
            "detection_type": detection_type,
            "action": action,
            "model_version": model_version,
            "evidence_hash": evidence_hash,
            "previous_hash": previous_block["block_hash"],
        }

        block["block_hash"] = self._calculate_hash(block)
        self.chain.append(block)

        return block

    def verify_chain(self) -> dict:
        errors = []

        for index, block in enumerate(self.chain):
            calculated_hash = self._calculate_hash(block)

            if block["block_hash"] != calculated_hash:
                errors.append(
                    f"Block {index}: block hash mismatch"
                )

            if index == 0:
                if block["previous_hash"] != "0":
                    errors.append(
                        "Genesis block has invalid previous hash"
                    )
            else:
                previous_block = self.chain[index - 1]

                if block["previous_hash"] != previous_block["block_hash"]:
                    errors.append(
                        f"Block {index}: previous hash mismatch"
                    )

        return {
            "valid": len(errors) == 0,
            "block_count": len(self.chain),
            "errors": errors,
        }

    def get_blocks(self, limit: int = 50) -> list[dict]:
        return self.chain[-limit:]
