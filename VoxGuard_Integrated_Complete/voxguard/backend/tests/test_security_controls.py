import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.security.authentication import AuthenticationManager, AuthorizationManager
from app.security.rate_limiter import RateLimiter
from app.security.validation import validate_risk_input, sanitize_text


class TestSecurityControls(unittest.TestCase):

    def setUp(self):
        self.auth = AuthenticationManager(api_key="test_secret_key_123")
        self.authorizer = AuthorizationManager()
        self.limiter = RateLimiter(max_requests=3, window_seconds=10)

    def test_authentication(self):
        self.assertTrue(self.auth.authenticate("test_secret_key_123"))
        self.assertFalse(self.auth.authenticate("wrong_key"))
        self.assertFalse(self.auth.authenticate(""))

    def test_authorization(self):
        self.assertTrue(self.authorizer.authorize("admin", "risk"))
        self.assertTrue(self.authorizer.authorize("analyst", "risk"))
        self.assertFalse(self.authorizer.authorize("user", "risk"))

    def test_rate_limiter(self):
        client = "test_client_ip"
        self.assertTrue(self.limiter.allow(client))
        self.assertTrue(self.limiter.allow(client))
        self.assertTrue(self.limiter.allow(client))
        self.assertFalse(self.limiter.allow(client))  # 4th should be blocked

    def test_input_validation(self):
        valid_data = {
            "voice_authenticity": 0.8,
            "speaker_confidence": 0.7,
            "fraud_score": 0.2,
            "behavior_risk": 0.1,
        }
        self.assertEqual(validate_risk_input(valid_data), valid_data)

        # Missing field
        with self.assertRaises(ValueError):
            validate_risk_input({"voice_authenticity": 0.5})

        # Out of bounds
        with self.assertRaises(ValueError):
            validate_risk_input({
                "voice_authenticity": 1.5,
                "speaker_confidence": 0.5,
                "fraud_score": 0.2,
                "behavior_risk": 0.1,
            })

    def test_sanitization(self):
        dirty = "<script>alert('xss')</script> Hello World \x00"
        clean = sanitize_text(dirty)
        self.assertNotIn("<script>", clean)
        self.assertNotIn("\x00", clean)
        self.assertIn("Hello World", clean)


if __name__ == "__main__":
    unittest.main()
