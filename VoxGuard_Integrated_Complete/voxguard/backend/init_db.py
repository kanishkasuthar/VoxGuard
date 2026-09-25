"""
init_db.py
----------
Standalone database initialization and seeding script for VoxGuard PostgreSQL database.

Usage:
    python init_db.py
"""

from __future__ import annotations

import sys
import hashlib
from app.core.database import engine, Base, check_db_health, mask_db_url
from app.core.config import settings
from app.core.models import User, TrustedContact, Call, Incident, RiskEvent, AuditLog
from sqlalchemy.orm import Session


def run_init():
    print("==================================================")
    print("VOXGUARD POSTGRESQL DATABASE INITIALIZER")
    print(f"Target URL: {mask_db_url(settings.DATABASE_URL)}")
    print("==================================================")

    # 1. Health Probe
    is_healthy, info = check_db_health()
    if not is_healthy:
        print(f"[ERROR] Database connection failed: {info.get('error')}")
        print("Please check DATABASE_URL in your .env file.")
        sys.exit(1)

    print(f"[OK] Connected to PostgreSQL database: {info.get('database')} at {info.get('host')}:{info.get('port')}")

    # 2. Table Creation
    print("[...] Creating tables (users, trusted_contacts, calls, risk_events, incidents, audit_logs)...")
    Base.metadata.create_all(bind=engine, checkfirst=True)
    print("[OK] All 6 tables verified/created successfully!")

    # 3. Seed Initial Administrative User & Contacts
    with Session(engine) as session:
        existing_user = session.query(User).filter(User.email == "sarah.jenkins@voxguard.ai").first()
        if not existing_user:
            sarah = User(
                id="USR-9901",
                name="Officer Sarah Jenkins",
                email="sarah.jenkins@voxguard.ai",
                password_hash=hashlib.sha256("password123".encode("utf-8")).hexdigest(),
                is_active=True,
            )
            session.add(sarah)

            rahul = User(
                id="USR-B-1042",
                name="Rahul Suthar",
                email="rahul@email.com",
                password_hash=hashlib.sha256("password123".encode("utf-8")).hexdigest(),
                is_active=True,
            )
            session.add(rahul)

            session.flush()

            contact1 = TrustedContact(
                user_id=sarah.id,
                contact_user_id=rahul.id,
                relationship_name="Brother / Family",
                verification_status="verified",
            )
            session.add(contact1)
            session.commit()
            print("[OK] Seeded initial SOC Commander user (USR-9901) and family contact.")
        else:
            print("[INFO] Default administrative user already exists in database.")

    print("==================================================")
    print("INITIALIZATION COMPLETE!")
    print("==================================================")


if __name__ == "__main__":
    run_init()
