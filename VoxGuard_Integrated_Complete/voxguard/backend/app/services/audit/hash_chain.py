import hashlib
import json


class HashChain:

    def __init__(self, initial_hash: str = "GENESIS"):
        self.last_hash = initial_hash

    @staticmethod
    def calculate_hash(record: dict) -> str:
        data = dict(record)
        data.pop("hash", None)

        serialized = json.dumps(
            data,
            sort_keys=True,
            separators=(",", ":")
        )

        return hashlib.sha256(
            serialized.encode("utf-8")
        ).hexdigest()
