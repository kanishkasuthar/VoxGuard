from ..services.challenge.verification_service import VerificationService


class VerificationProvider:
    """Verification abstraction for Person 6 security workflow."""

    def __init__(self):
        self.service = VerificationService()

    def create_challenge(self):
        return self.service.start()

    def verify_challenge(
        self,
        challenge_id: str,
        response: str,
    ):
        return self.service.verify(
            challenge_id,
            response,
        )
