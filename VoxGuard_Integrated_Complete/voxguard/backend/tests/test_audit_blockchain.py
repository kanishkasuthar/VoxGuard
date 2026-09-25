import unittest
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.audit.audit_logger import AuditLogger
from app.services.audit.integrity_check import verify_audit_integrity
from app.services.audit.blockchain import SecurityBlockchain


class TestAuditAndBlockchain(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.log_file = Path(self.temp_dir.name) / "test_audit.log"
        self.logger = AuditLogger(str(self.log_file))
        self.blockchain = SecurityBlockchain()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_hash_chain_logging_and_integrity(self):
        # Log 3 sequential events
        rec1 = self.logger.log("CALL_STARTED", risk_score=0.1, decision="ALLOW")
        rec2 = self.logger.log("CALL_MONITORED", risk_score=0.2, decision="ALLOW")
        rec3 = self.logger.log("CALL_ENDED", risk_score=0.15, decision="ALLOW")

        self.assertEqual(rec2["previous_hash"], rec1["hash"])
        self.assertEqual(rec3["previous_hash"], rec2["hash"])

        # Check integrity
        integrity = verify_audit_integrity(str(self.log_file))
        self.assertTrue(integrity["valid"])
        self.assertEqual(integrity["checked_records"], 3)

    def test_tampering_detection(self):
        self.logger.log("EVENT_1", risk_score=0.1, decision="ALLOW")
        self.logger.log("EVENT_2", risk_score=0.2, decision="ALLOW")

        # Tamper with the log file
        with open(self.log_file, "r", encoding="utf-8") as f:
            lines = f.readlines()

        lines[0] = lines[0].replace("0.1", "0.99")

        with open(self.log_file, "w", encoding="utf-8") as f:
            f.writelines(lines)

        # Integrity check should detect tampering
        integrity = verify_audit_integrity(str(self.log_file))
        self.assertFalse(integrity["valid"])

    def test_blockchain_incident_ledger(self):
        # Genesis block
        self.assertEqual(len(self.blockchain.chain), 1)
        self.assertEqual(self.blockchain.chain[0]["index"], 0)

        # Add incident
        block = self.blockchain.add_incident(
            incident_id="INC-1234",
            risk_level="CRITICAL",
            detection_type="DEEPFAKE_ATTACK",
            action="BLOCK",
            model_version="v2.0",
            evidence={"deepfake_score": 0.95},
        )

        self.assertEqual(block["index"], 1)
        self.assertEqual(block["previous_hash"], self.blockchain.chain[0]["block_hash"])
        self.assertTrue(self.blockchain.verify_chain()["valid"])


if __name__ == "__main__":
    unittest.main()
