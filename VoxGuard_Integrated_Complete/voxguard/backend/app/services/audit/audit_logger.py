import json
import os
import uuid
from datetime import datetime, timezone

from .hash_chain import HashChain


class AuditLogger:

    def __init__(self, log_file: str = "logs/audit.log"):
        self.log_file = log_file
        self.hash_chain = HashChain()

        os.makedirs(os.path.dirname(log_file) or ".", exist_ok=True)
        self._load_last_hash()

    def _load_last_hash(self):
        if not os.path.exists(self.log_file):
            return

        try:
            with open(self.log_file, "r", encoding="utf-8") as file:
                lines = [line.strip() for line in file if line.strip()]

            if lines:
                last_record = json.loads(lines[-1])
                self.hash_chain.last_hash = last_record.get(
                    "hash",
                    "GENESIS"
                )

        except (json.JSONDecodeError, OSError):
            self.hash_chain.last_hash = "GENESIS"

    def log(
        self,
        event: str,
        risk_score: float | None = None,
        decision: str | None = None,
        call_id: str | None = None,
        details: dict | None = None,
        model_versions: dict | None = None,
    ):
        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "call_id": call_id or str(uuid.uuid4()),
            "event": event,
            "risk_score": risk_score,
            "decision": decision,
            "details": details or {},
            "model_versions": model_versions or {},
        }

        record["previous_hash"] = self.hash_chain.last_hash
        record["hash"] = self.hash_chain.calculate_hash(record)

        self.hash_chain.last_hash = record["hash"]

        with open(self.log_file, "a", encoding="utf-8") as file:
            file.write(json.dumps(record) + "\n")

        return record

    def get_recent_records(self, limit: int = 50) -> list[dict]:
        if not os.path.exists(self.log_file):
            return []

        records = []
        try:
            with open(self.log_file, "r", encoding="utf-8") as file:
                for line in file:
                    if line.strip():
                        records.append(json.loads(line))
        except (json.JSONDecodeError, OSError):
            pass

        return records[-limit:]
