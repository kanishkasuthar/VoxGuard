from .challenge import ChallengeManager


class VerificationService:
    """Secondary challenge verification service for suspicious calls."""

    def __init__(self, expiry_seconds: int = 120):
        self.manager = ChallengeManager(expiry_seconds=expiry_seconds)

    def start(self) -> dict:
        challenge = self.manager.create_challenge()
        return {
            "challenge_id": challenge.challenge_id,
            "code": challenge.code,
            "expires_at": challenge.expires_at,
            "max_attempts": challenge.max_attempts,
        }

    def verify(self, challenge_id: str, response: str) -> dict:
        result = self.manager.verify(challenge_id, response)
        return {
            "challenge_id": challenge_id,
            "verified": result,
        }
