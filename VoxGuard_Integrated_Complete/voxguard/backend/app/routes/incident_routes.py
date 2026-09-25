"""
incident_routes.py
------------------
Security incident management backed by PostgreSQL 'incidents' table.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.models import Incident

router = APIRouter(prefix="/api/incidents", tags=["Security Incident Response"])


class IncidentCreateRequest(BaseModel):
    call_id: Optional[str] = None
    risk_score: float = Field(..., ge=0.0, le=1.0)
    reason: Optional[str] = "High voice security risk detected"
    action_taken: str = Field(..., description="Action taken: ALLOW, WARN, VERIFY, BLOCK")


@router.get("")
def list_incidents(limit: int = 50, db: Optional[Session] = Depends(get_db)):
    """Retrieve security incidents recorded in PostgreSQL."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "count": 0,
            "incidents": [],
            "note": "Database offline - returning empty list",
        }

    try:
        incidents = db.query(Incident).order_by(Incident.timestamp.desc()).limit(limit).all()
        return {
            "success": True,
            "count": len(incidents),
            "incidents": [inc.to_dict() for inc in incidents],
        }
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_incident(request: IncidentCreateRequest, db: Optional[Session] = Depends(get_db)):
    """Create a security incident in PostgreSQL."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "incident": {
                "id": "VG-INC-DEMO",
                "call_id": request.call_id,
                "risk_score": request.risk_score,
                "reason": request.reason,
                "action_taken": request.action_taken,
            },
        }

    try:
        new_inc = Incident(
            call_id=request.call_id,
            risk_score=request.risk_score,
            reason=request.reason,
            action_taken=request.action_taken,
        )
        db.add(new_inc)
        db.commit()
        db.refresh(new_inc)
        return {
            "success": True,
            "incident": new_inc.to_dict(),
        }
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Optional[Session] = Depends(get_db)):
    """Retrieve a single incident by ID."""
    if db is None or not hasattr(db, "query"):
        return {"success": True, "incident": {"id": incident_id}}

    try:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")
        return {"success": True, "incident": inc.to_dict()}
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )
