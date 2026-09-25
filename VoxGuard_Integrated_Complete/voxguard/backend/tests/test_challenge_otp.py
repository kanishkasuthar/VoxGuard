import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.challenge.challenge import ChallengeManager
from app.services.challenge.verification_service import VerificationService


class TestChallengeOTP(unittest.TestCase):

    def setUp(self):
        self.manager = ChallengeManager(expiry_seconds=10)
        self.service = VerificationService(expiry_seconds=10)

    def test_challenge_creation(self):
        challenge = self.manager.create_challenge()
        self.assertIsNotNone(challenge.challenge_id)
        self.assertEqual(len(challenge.code), 6)
        self.assertTrue(challenge.code.isdigit())

    def test_successful_verification(self):
        challenge = self.manager.create_challenge()
        result = self.manager.verify(challenge.challenge_id, challenge.code)
        self.assertTrue(result)
        self.assertTrue(challenge.verified)

    def test_failed_verification(self):
        challenge = self.manager.create_challenge()
        result = self.manager.verify(challenge.challenge_id, "000000")
        self.assertFalse(result)
        self.assertFalse(challenge.verified)

    def test_max_attempts_exceeded(self):
        challenge = self.manager.create_challenge()
        self.manager.verify(challenge.challenge_id, "111111")
        self.manager.verify(challenge.challenge_id, "222222")
        self.manager.verify(challenge.challenge_id, "333333")
        self.assertTrue(challenge.failed)
        # Even if correct code is provided on 4th attempt, it must fail
        self.assertFalse(self.manager.verify(challenge.challenge_id, challenge.code))


if __name__ == "__main__":
    unittest.main()
