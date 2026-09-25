import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main
from app.routes.risk_routes import calculate_risk, get_risk_config, RiskRequest
from app.routes.fraud_routes import analyze_fraud_intent, FraudAnalysisRequest
from app.routes.speaker_routes import get_engine_status
from app.routes.language_routes import get_supported_languages
from app.routes.audit_routes import get_audit_logs, verify_audit, get_blockchain
from app.routes.challenge_routes import create_challenge, verify_challenge, VerifyRequest
from app.routes.integration_routes import process_person6, Person6IntegrationRequest


class TestFastAPIEndpoints(unittest.TestCase):

    def test_root_endpoint(self):
        data = main.root()
        self.assertEqual(data["project"], "VoxGuard")
        self.assertEqual(data["status"], "running")
        self.assertTrue(len(data["modules"]) >= 5)
        self.assertIn("risk_engine", data["model_versions"])

    def test_health_endpoint(self):
        data = main.health()
        self.assertEqual(data["status"], "healthy")

    def test_risk_calculate_endpoint(self):
        req = RiskRequest(
            voice_authenticity=0.85,
            speaker_confidence=0.80,
            fraud_score=0.10,
            behavior_risk=0.10,
        )
        res = calculate_risk(req)
        self.assertTrue(res["success"])
        self.assertEqual(res["risk_level"], "LOW")
        self.assertEqual(res["decision"], "ALLOW")

    def test_risk_config_endpoint(self):
        cfg = get_risk_config()
        self.assertIn("thresholds", cfg)
        self.assertIn("weights", cfg)

    def test_fraud_analyze_endpoint(self):
        req = FraudAnalysisRequest(
            transcript="Please send the one-time password immediately or your bank account will be closed",
            language_code="en",
        )
        res = analyze_fraud_intent(req)
        self.assertTrue(res["success"])
        self.assertTrue(res["is_suspicious"])
        self.assertIn("OTP_REQUEST", res["detected_intent_types"])
        self.assertIn("ACCOUNT_THREAT", res["detected_intent_types"])

    def test_speaker_status_endpoint(self):
        data = get_engine_status()
        self.assertIn("enrolled_speakers_count", data)

    def test_language_supported_endpoint(self):
        data = get_supported_languages()
        self.assertIn("supported_languages", data)
        self.assertIn("hi", data["supported_languages"])

    def test_challenge_endpoints(self):
        create_res = create_challenge()
        self.assertTrue(create_res["success"])
        ch = create_res["challenge"]
        challenge_id = ch["challenge_id"]
        code = ch["code"]

        verify_res = verify_challenge(VerifyRequest(challenge_id=challenge_id, response=code))
        self.assertTrue(verify_res["success"])
        self.assertTrue(verify_res["verified"])

    def test_audit_and_blockchain_endpoints(self):
        verify_res = verify_audit()
        self.assertTrue(verify_res["success"])
        self.assertTrue(verify_res["integrity"]["valid"])

        chain_res = get_blockchain()
        self.assertTrue(chain_res["success"])
        self.assertTrue(chain_res["chain_valid"])

    def test_person6_process_endpoint(self):
        req = Person6IntegrationRequest(
            voice_authenticity=0.3,
            speaker_confidence=0.4,
            fraud_score=0.8,
            behavior_risk=0.6,
            client_id="test_client",
            role="admin",
        )
        data = process_person6(req)
        self.assertIn("overall_score", data)
        self.assertIn("audit_hash", data)
        self.assertIn("blockchain", data)
        self.assertTrue(data["blockchain"]["recorded"])


if __name__ == "__main__":
    unittest.main()
