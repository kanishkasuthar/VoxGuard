from app.risk.risk_engine import RiskEngine
from app.risk.decision_engine import make_decision
from app.verification.verification_service import VerificationService
from app.security.authentication import AuthenticationManager, AuthorizationManager
from app.security.validation import validate_risk_input, sanitize_text
from app.security.rate_limiter import RateLimiter
from app.audit.audit_logger import AuditLogger
from app.audit.integrity_check import verify_audit_integrity

print("=" * 60)
print("              VOXGUARD - ROUND 1")
print("           PERSON 6: RISK & SECURITY")
print("=" * 60)

# 1. RISK ENGINE
print("\n[1] RISK ENGINE")
print("-" * 60)

risk_input = {
    "voice_authenticity": 0.40,
    "speaker_confidence": 0.45,
    "fraud_score": 0.70,
    "behavior_risk": 0.60
}

validate_risk_input(risk_input)

print("Input Risk Signals:")
for key, value in risk_input.items():
    print(f"  {key}: {value}")

engine = RiskEngine()
result = engine.calculate(**risk_input)

print(f"\nOverall Risk Score : {result.overall_score}")
print(f"Risk Level         : {result.risk_level}")

print("\nComponent Risks:")
for key, value in result.component_scores.items():
    print(f"  {key}: {value}")

print("\nRisk Reasons:")
for reason in result.reasons:
    print(f"  - {reason}")

# 2. DECISION ENGINE
print("\n[2] DECISION ENGINE")
print("-" * 60)

decision = make_decision(result.overall_score)

print(f"Risk Score : {result.overall_score}")
print(f"Decision   : {decision}")

# 3. VERIFICATION
print("\n[3] VERIFICATION CHALLENGE")
print("-" * 60)

verification = VerificationService()
challenge = verification.start()

print(f"Challenge ID : {challenge['challenge_id']}")
print(f"Expires At   : {challenge['expires_at']}")
print(f"Max Attempts : {challenge['max_attempts']}")

if str(decision) == "VERIFY" or getattr(decision, "value", "") == "VERIFY":
    print("\nHigh-risk request requires verification.")

    verification_result = verification.verify(
        challenge["challenge_id"],
        "000000"
    )

    print("Wrong response accepted:", verification_result["verified"])

# 4. SECURITY
print("\n[4] SECURITY CONTROLS")
print("-" * 60)

auth = AuthenticationManager()
authorization = AuthorizationManager()

print("Authentication:")
print("  Invalid API key rejected:",
      auth.authenticate("demo-invalid-key"))

print("\nAuthorization:")
print("  Authorization manager initialized: YES")

print("\nInput Validation:")
print("  Valid risk input accepted: YES")

print("\nInput Sanitization:")
unsafe_text = "<script>alert('x')</script> suspicious call"
print("  Original :", unsafe_text)
print("  Sanitized:", sanitize_text(unsafe_text))

print("\nRate Limiting:")
limiter = RateLimiter(max_requests=3, window_seconds=60)

for i in range(4):
    print(f"  Request {i + 1} allowed:",
          limiter.allow("round1-demo-user"))

# 5. AUDIT
print("\n[5] AUDIT LOGGING")
print("-" * 60)

audit = AuditLogger()

record = audit.log(
    event="ROUND1_RISK_DECISION",
    risk_score=result.overall_score,
    decision=str(decision),
    details={
        "risk_level": result.risk_level,
        "risk_reasons": result.reasons
    },
    model_versions={
        "risk_engine": "round1-v1"
    }
)

print("Audit record created successfully.")

if record:
    print(f"Call ID       : {record.get('call_id')}")
    print(f"Timestamp     : {record.get('timestamp')}")
    print(f"Risk Score    : {record.get('risk_score')}")
    print(f"Decision      : {record.get('decision')}")
    print(f"Previous Hash : {record.get('previous_hash')}")
    print(f"Record Hash   : {record.get('hash')}")

# 6. INTEGRITY
print("\n[6] AUDIT INTEGRITY / HASH CHAIN")
print("-" * 60)

integrity = verify_audit_integrity()

print(f"Integrity Valid  : {integrity.get('valid')}")
print(f"Records Checked  : {integrity.get('checked_records', 0)}")
print(f"Integrity Status : {integrity.get('reason')}")

print("\n" + "=" * 60)
print("        ROUND 1 PERSON 6 COMPLETED")
print("=" * 60)
