import sys
sys.path.insert(0, "backend")

from app.integration.person6_service import Person6Service


service = Person6Service()

data = {
    "voice_authenticity": 0.40,
    "speaker_confidence": 0.45,
    "fraud_score": 0.70,
    "behavior_risk": 0.60,
}

result = service.process(data)

print("\n========== ROUND 2 : PERSON 6 ==========")
print("Call ID        :", result["call_id"])
print("Overall Score  :", result["overall_score"])
print("Risk Level     :", result["risk_level"])
print("Decision       :", result["decision"])
print("Reasons        :", result["reasons"])
print("Component Risk :", result["component_scores"])

print("\nVerification   :", result["verification"])
print("Incident       :", result["incident"])
print("Model Versions :", result["model_versions"])
print("Audit Hash     :", result["audit_hash"])

print("\nAudit Integrity:")
print(service.verify_audit())

print("\n========================================")
print("ROUND 2 PERSON 6 COMPLETED")
