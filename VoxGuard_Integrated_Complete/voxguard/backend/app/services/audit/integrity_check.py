import json
import hashlib
import os


def verify_audit_integrity(log_file: str = "logs/audit.log") -> dict:
    previous_hash = "GENESIS"
    checked = 0

    if not os.path.exists(log_file):
        return {
            "valid": True,
            "checked_records": 0,
            "reason": "No audit log exists yet",
        }

    try:
        with open(log_file, "r", encoding="utf-8") as file:
            for line_number, line in enumerate(file, start=1):
                if not line.strip():
                    continue

                record = json.loads(line)

                if record.get("previous_hash") != previous_hash:
                    return {
                        "valid": False,
                        "line": line_number,
                        "reason": f"Previous hash mismatch at record {line_number}",
                    }

                stored_hash = record.get("hash")

                data = dict(record)
                data.pop("hash", None)

                serialized = json.dumps(
                    data,
                    sort_keys=True,
                    separators=(",", ":")
                )

                calculated_hash = hashlib.sha256(
                    serialized.encode("utf-8")
                ).hexdigest()

                if stored_hash != calculated_hash:
                    return {
                        "valid": False,
                        "line": line_number,
                        "reason": f"Record hash tampering detected at line {line_number}",
                    }

                previous_hash = stored_hash
                checked += 1

    except Exception as exc:
        return {
            "valid": False,
            "checked_records": checked,
            "reason": f"Integrity check failed with error: {exc}",
        }

    return {
        "valid": True,
        "checked_records": checked,
        "reason": "Audit chain is intact and untampered",
    }
