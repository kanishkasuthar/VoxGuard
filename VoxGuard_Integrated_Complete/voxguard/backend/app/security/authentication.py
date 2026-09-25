import hashlib
from ..core.config import settings


class AuthenticationManager:

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or settings.VOXGUARD_API_KEY

    def authenticate(self, provided_key: str) -> bool:
        if not self.api_key or not provided_key:
            return False

        return hashlib.sha256(
            provided_key.encode()
        ).hexdigest() == hashlib.sha256(
            self.api_key.encode()
        ).hexdigest()


class AuthorizationManager:

    ROLES = {
        "admin": {"risk", "verification", "audit", "voice", "speaker", "fraud", "pipeline"},
        "analyst": {"risk", "audit", "voice", "fraud"},
        "user": {"verification", "voice"},
    }

    def authorize(self, role: str, resource: str) -> bool:
        return resource in self.ROLES.get(role, set())
