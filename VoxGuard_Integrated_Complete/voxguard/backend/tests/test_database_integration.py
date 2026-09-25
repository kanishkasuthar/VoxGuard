"""
test_database_integration.py
-----------------------------
Unit tests for VoxGuard PostgreSQL database integration:
1. URL normalization & password masking
2. Database models & schema validation
3. Foreign key relationships & constraints
4. Database health check probe & endpoint
5. Session dependency management
"""

import unittest
import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import Response, status

from app.core.database import Base, normalize_db_url, mask_db_url, check_db_health
from app.core.models import User, TrustedContact, Call, RiskEvent, Incident, AuditLog
import main


class TestDatabaseIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create an in-memory SQLite engine for comprehensive schema testing
        cls.test_engine = create_engine("sqlite:///:memory:")
        cls.TestSession = sessionmaker(bind=cls.test_engine)
        Base.metadata.create_all(bind=cls.test_engine)

    def setUp(self):
        self.session = self.TestSession()

    def tearDown(self):
        self.session.rollback()
        self.session.close()

    # ------------------------------------------------------------------
    # 1. URL Normalization & Password Masking
    # ------------------------------------------------------------------
    def test_normalize_db_url(self):
        url1 = "postgresql://postgres:secret123@localhost:5432/voxguard_db"
        norm1 = normalize_db_url(url1)
        self.assertTrue(norm1.startswith("postgresql+psycopg://"))
        self.assertIn("localhost:5432/voxguard_db", norm1)

        url2 = "postgresql+psycopg://postgres:secret123@localhost:5432/voxguard_db"
        norm2 = normalize_db_url(url2)
        self.assertEqual(norm2, url2)

    def test_mask_db_url(self):
        raw = "postgresql+psycopg://postgres:SuperSecretPassword123@localhost:5432/voxguard_db"
        masked = mask_db_url(raw)
        self.assertNotIn("SuperSecretPassword123", masked)
        self.assertIn(":***@", masked)

    # ------------------------------------------------------------------
    # 2. Model Creation & Constraints
    # ------------------------------------------------------------------
    def test_user_creation_and_to_dict(self):
        user = User(
            id="USR-TEST-01",
            name="Commander Test",
            email="commander@test.com",
            password_hash="testhash123",
            is_active=True,
        )
        self.session.add(user)
        self.session.commit()

        queried = self.session.query(User).filter(User.email == "commander@test.com").first()
        self.assertIsNotNone(queried)
        self.assertEqual(queried.name, "Commander Test")
        d = queried.to_dict()
        self.assertEqual(d["id"], "USR-TEST-01")
        self.assertTrue(d["is_active"])

    def test_trusted_contacts_relationship(self):
        user1 = User(id="USR-REL-01", name="Alice", email="alice@test.com", password_hash="h1")
        user2 = User(id="USR-REL-02", name="Bob", email="bob@test.com", password_hash="h2")
        self.session.add_all([user1, user2])
        self.session.commit()

        contact = TrustedContact(
            user_id=user1.id,
            contact_user_id=user2.id,
            relationship_name="Brother",
            verification_status="verified",
        )
        self.session.add(contact)
        self.session.commit()

        queried = self.session.query(TrustedContact).filter(TrustedContact.user_id == "USR-REL-01").first()
        self.assertIsNotNone(queried)
        self.assertEqual(queried.relationship, "Brother")
        self.assertEqual(queried.verification_status, "verified")

    def test_calls_and_risk_events(self):
        call = Call(
            id="VG-CALL-TEST-99",
            status="completed",
            risk_score=0.88,
        )
        self.session.add(call)
        self.session.commit()

        # Add risk event metrics
        event = RiskEvent(
            call_id=call.id,
            deepfake_score=0.92,
            speaker_score=0.15,
            intent_score=0.85,
            overall_risk=0.88,
        )
        self.session.add(event)
        self.session.commit()

        queried_events = self.session.query(RiskEvent).filter(RiskEvent.call_id == call.id).all()
        self.assertEqual(len(queried_events), 1)
        self.assertEqual(queried_events[0].deepfake_score, 0.92)
        self.assertEqual(queried_events[0].overall_risk, 0.88)

    def test_incidents_model(self):
        inc = Incident(
            id="VG-INC-TEST-01",
            call_id="VG-CALL-TEST-99",
            risk_score=0.88,
            reason="High synthetic speech probability and OTP solicitation",
            action_taken="BLOCK",
        )
        self.session.add(inc)
        self.session.commit()

        queried = self.session.query(Incident).filter(Incident.id == "VG-INC-TEST-01").first()
        self.assertIsNotNone(queried)
        self.assertEqual(queried.action_taken, "BLOCK")
        self.assertEqual(queried.risk_score, 0.88)

    def test_audit_logs_model(self):
        log = AuditLog(
            user_id=None,
            call_id="VG-CALL-TEST-99",
            event_type="SECURITY_BLOCK",
            details={"threat": "voice_clone"},
            hash="abc123sha256hash",
        )
        self.session.add(log)
        self.session.commit()

        queried = self.session.query(AuditLog).filter(AuditLog.call_id == "VG-CALL-TEST-99").first()
        self.assertIsNotNone(queried)
        self.assertEqual(queried.event_type, "SECURITY_BLOCK")
        self.assertEqual(queried.hash, "abc123sha256hash")

    # ------------------------------------------------------------------
    # 3. Health Probe & Endpoint
    # ------------------------------------------------------------------
    def test_db_health_endpoint_contract(self):
        resp = Response()
        data = main.db_health(resp)
        self.assertIn("status", data)
        # Should return healthy or unhealthy depending on whether local pg password is set
        self.assertIn(data["status"], ("healthy", "unhealthy"))
        if data["status"] == "unhealthy":
            self.assertEqual(resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            self.assertIn("database", data)


if __name__ == "__main__":
    unittest.main()
