from app.security.authentication import AuthenticationManager, AuthorizationManager
from app.security.validation import validate_risk_input, sanitize_text
from app.security.rate_limiter import RateLimiter

print()
print("=" * 42)
print("       VOXGUARD - SECURITY DEMO")
print("=" * 42)

# ---------------- AUTHENTICATION ----------------
auth = AuthenticationManager()

print("\n1. AUTHENTICATION")
print("-----------------")

print("Invalid API key rejected:",
      auth.authenticate("demo-invalid-key"))

print("Authentication logic: ACTIVE")

# ---------------- AUTHORIZATION ----------------
authorization = AuthorizationManager()

print("\n2. AUTHORIZATION / ACCESS CONTROL")
print("----------------------------------")

print("Authorization manager initialized:", authorization)

# ---------------- INPUT VALIDATION ----------------
print("\n3. INPUT VALIDATION")
print("-------------------")

valid_input = {
    "voice_authenticity": 0.40,
    "speaker_confidence": 0.45,
    "fraud_score": 0.70,
    "behavior_risk": 0.60
}

try:
    result = validate_risk_input(valid_input)
    print("Valid risk input accepted:", result)
except Exception as e:
    print("Validation error:", str(e))

# ---------------- SANITIZATION ----------------
print("\n4. INPUT SANITIZATION")
print("---------------------")

unsafe_text = "<script>alert('x')</script> suspicious call"

print("Original :", unsafe_text)
print("Sanitized:", sanitize_text(unsafe_text))

# ---------------- RATE LIMITING ----------------
print("\n5. RATE LIMITING")
print("----------------")

limiter = RateLimiter(max_requests=3, window_seconds=60)

for i in range(4):
    print(
        f"Request {i + 1} allowed:",
        limiter.allow("demo-user")
    )

print("\n" + "=" * 42)
print("       SECURITY DEMO COMPLETED")
print("=" * 42)
