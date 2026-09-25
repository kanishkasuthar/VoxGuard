import secrets
import time
from dataclasses import dataclass


@dataclass
class VerificationChallenge:
    challenge_id: str
    code: str
    created_at: float
    expires_at: float
    attempts: int = 0
    max_attempts: int = 3
    verified: bool = False
    failed: bool = False


class ChallengeManager:

    def __init__(self, expiry_seconds: int = 120):
        self.expiry_seconds = expiry_seconds
        self.challenges: dict[str, VerificationChallenge] = {}

    def create_challenge(self) -> VerificationChallenge:
        challenge_id = secrets.token_urlsafe(16)
        code = f"{secrets.randbelow(1000000):06d}"
        now = time.time()

        challenge = VerificationChallenge(
            challenge_id=challenge_id,
            code=code,
            created_at=now,
            expires_at=now + self.expiry_seconds,
        )

        self.challenges[challenge_id] = challenge
        return challenge

    def verify(self, challenge_id: str, response: str) -> bool:
        challenge = self.challenges.get(challenge_id)

        if challenge is None:
            return False

        if challenge.verified or challenge.failed:
            return False

        if time.time() > challenge.expires_at:
            challenge.failed = True
            return False

        challenge.attempts += 1

        if secrets.compare_digest(str(response), challenge.code):
            challenge.verified = True
            return True

        if challenge.attempts >= challenge.max_attempts:
            challenge.failed = True

        return False

    def get_challenge(self, challenge_id: str) -> VerificationChallenge | None:
        return self.challenges.get(challenge_id)
