from ..security.authentication import AuthenticationManager, AuthorizationManager
from ..security.rate_limiter import RateLimiter
from ..security.validation import validate_risk_input, sanitize_text


class SecurityIntegration:
    """Provides authentication, authorization, rate limiting, and validation."""

    def __init__(self):
        self.authentication = AuthenticationManager()
        self.authorization = AuthorizationManager()
        self.rate_limiter = RateLimiter()

    def authenticate(self, api_key: str) -> bool:
        return self.authentication.authenticate(api_key)

    def check_rate_limit(self, client_id: str) -> bool:
        return self.rate_limiter.allow(client_id)

    def validate_input(self, data: dict):
        return validate_risk_input(data)

    def authorize(self, role: str, resource: str) -> bool:
        return self.authorization.authorize(role, resource)

    def sanitize(self, text: str) -> str:
        return sanitize_text(text)
