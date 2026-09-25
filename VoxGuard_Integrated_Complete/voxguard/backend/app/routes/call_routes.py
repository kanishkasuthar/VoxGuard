"""
call_routes.py
--------------
Call recording, retrieval, and risk event associations backed by PostgreSQL 'calls' table.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.models import Call, RiskEvent, Incident

router = APIRouter(prefix="/api/calls", tags=["Call Management & History"])


class CallCreateRequest(BaseModel):
    id: Optional[str] = None
    caller_id: Optional[str] = None
    receiver_id: Optional[str] = None
    status: str = "active"
    risk_score: Optional[float] = None


@router.get("")
def list_calls(limit: int = 50, db: Optional[Session] = Depends(get_db)):
    """Retrieve call history records from PostgreSQL calls table."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "count": 0,
            "calls": [],
            "note": "Database offline - returning empty list",
        }

    try:
        calls = db.query(Call).order_by(Call.started_at.desc()).limit(limit).all()
        return {
            "success": True,
            "count": len(calls),
            "calls": [c.to_dict() for c in calls],
        }
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_call(request: CallCreateRequest, db: Optional[Session] = Depends(get_db)):
    """Create a new call record in PostgreSQL calls table."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "call": {
                "id": request.id or "VG-CALL-DEMO",
                "status": request.status,
                "risk_score": request.risk_score,
            },
        }

    try:
        new_call = Call(
            id=request.id,
            caller_id=request.caller_id,
            receiver_id=request.receiver_id,
            status=request.status,
            risk_score=request.risk_score,
        )
        db.add(new_call)
        db.commit()
        db.refresh(new_call)
        return {
            "success": True,
            "call": new_call.to_dict(),
        }
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.get("/{call_id}")
def get_call_details(call_id: str, db: Optional[Session] = Depends(get_db)):
    """Retrieve detailed call record with associated risk events and incidents."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "call": {"id": call_id, "status": "unknown"},
            "risk_events": [],
            "incidents": [],
        }

    try:
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            raise HTTPException(status_code=404, detail=f"Call '{call_id}' not found")

        risk_events = db.query(RiskEvent).filter(RiskEvent.call_id == call_id).all()
        incidents = db.query(Incident).filter(Incident.call_id == call_id).all()

        return {
            "success": True,
            "call": call.to_dict(),
            "risk_events": [re.to_dict() for re in risk_events],
            "incidents": [inc.to_dict() for inc in incidents],
        }
    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )
