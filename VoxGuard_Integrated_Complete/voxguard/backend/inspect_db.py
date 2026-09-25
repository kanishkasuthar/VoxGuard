"""
inspect_db.py
-------------
Quick CLI database inspector for VoxGuard PostgreSQL database.

Usage:
    python inspect_db.py
"""

from __future__ import annotations

import json
from app.core.database import engine, check_db_health
from app.core.models import User, TrustedContact, Call, RiskEvent, Incident, AuditLog
from sqlalchemy.orm import Session
from sqlalchemy import text


def inspect_database():
    print("=" * 60)
    print("VOXGUARD DATABASE INSPECTOR (PostgreSQL 18)")
    print("=" * 60)

    # 1. Health check
    is_healthy, info = check_db_health()
    if not is_healthy:
        print(f"[!] Database connection failed: {info.get('error')}")
        return

    print(f"[+] Status:   {info.get('status').upper()}")
    print(f"[+] Database: {info.get('database')}")
    print(f"[+] Host:     {info.get('host')}:{info.get('port')}")
    print(f"[+] Driver:   {info.get('driver')}")
    print("-" * 60)

    # 2. Query each table
    with Session(engine) as session:
        # Table list & counts
        tables = [
            ("users", User),
            ("trusted_contacts", TrustedContact),
            ("calls", Call),
            ("risk_events", RiskEvent),
            ("incidents", Incident),
            ("audit_logs", AuditLog),
        ]

        for table_name, model in tables:
            rows = session.query(model).all()
            print(f"\n[TABLE] {table_name.upper()} (Total rows: {len(rows)})")
            if not rows:
                print("   (Empty)")
                continue

            for idx, r in enumerate(rows[:5], 1):
                data = r.to_dict()
                print(f"   [{idx}] {json.dumps(data, indent=None, default=str)}")
            
            if len(rows) > 5:
                print(f"   ... and {len(rows) - 5} more rows.")

    print("\n" + "=" * 60)
    print("INSPECTION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    inspect_database()
