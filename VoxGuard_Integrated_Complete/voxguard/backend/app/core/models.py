"""
models.py
---------
SQLAlchemy 2.0 ORM models for the VoxGuard PostgreSQL database:
1. users
2. trusted_contacts
3. calls
4. risk_events
5. incidents
6. audit_logs
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


# ===========================================================================
# 1. Users Table
# ===========================================================================
class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    trusted_contacts = relationship(
        "TrustedContact",
        back_populates="user",
        foreign_keys="TrustedContact.user_id",
        cascade="all, delete-orphan",
    )
    calls_as_caller = relationship(
        "Call",
        back_populates="caller",
        foreign_keys="Call.caller_id",
    )
    calls_as_receiver = relationship(
        "Call",
        back_populates="receiver",
        foreign_keys="Call.receiver_id",
    )
    audit_logs = relationship(
        "AuditLog",
        back_populates="user",
        foreign_keys="AuditLog.user_id",
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }


# ===========================================================================
# 2. Trusted Contacts Table
# ===========================================================================
class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    relationship_name = Column("relationship", String(100), nullable=True)
    verification_status = Column(String(50), default="unverified", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="trusted_contacts")
    contact_user = relationship("User", foreign_keys=[contact_user_id])

    @property
    def relationship(self) -> Optional[str]:
        return self.relationship_name

    @relationship.setter
    def relationship(self, value: Optional[str]) -> None:
        self.relationship_name = value

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "contact_user_id": self.contact_user_id,
            "relationship": self.relationship_name,
            "verification_status": self.verification_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ===========================================================================
# 3. Calls Table
# ===========================================================================
class Call(Base):
    __tablename__ = "calls"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    caller_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    receiver_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    started_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="active", nullable=False)
    risk_score = Column(Float, nullable=True)

    # Relationships
    caller = relationship("User", foreign_keys=[caller_id], back_populates="calls_as_caller")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="calls_as_receiver")
    risk_events = relationship("RiskEvent", back_populates="call", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="call")
    audit_logs = relationship("AuditLog", back_populates="call")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "caller_id": self.caller_id,
            "receiver_id": self.receiver_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "status": self.status,
            "risk_score": self.risk_score,
        }


# ===========================================================================
# 4. Risk Events Table (Never stores raw audio - only scores & features)
# ===========================================================================
class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    deepfake_score = Column(Float, nullable=True)
    speaker_score = Column(Float, nullable=True)
    intent_score = Column(Float, nullable=True)
    overall_risk = Column(Float, nullable=True)

    # Relationship
    call = relationship("Call", back_populates="risk_events")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "call_id": self.call_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "deepfake_score": self.deepfake_score,
            "speaker_score": self.speaker_score,
            "intent_score": self.intent_score,
            "overall_risk": self.overall_risk,
        }


# ===========================================================================
# 5. Incidents Table
# ===========================================================================
class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="SET NULL"), nullable=True, index=True)
    risk_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    action_taken = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationship
    call = relationship("Call", back_populates="incidents")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "call_id": self.call_id,
            "risk_score": self.risk_score,
            "reason": self.reason,
            "action_taken": self.action_taken,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


# ===========================================================================
# 6. Audit Logs Table
# ===========================================================================
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    call_id = Column(String(64), ForeignKey("calls.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    details = Column(JSON, nullable=True)
    hash = Column(String(64), nullable=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    call = relationship("Call", back_populates="audit_logs")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "call_id": self.call_id,
            "event_type": self.event_type,
            "details": self.details,
            "hash": self.hash,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
