"""
contact_routes.py
-----------------
Trusted contacts management backed by PostgreSQL 'trusted_contacts' table.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..core.database import get_db
from ..core.models import TrustedContact, User

router = APIRouter(prefix="/api/contacts", tags=["Trusted Contacts Biometric Directory"])


class ContactCreateRequest(BaseModel):
    user_id: str = Field(..., description="ID of the user managing this contact")
    contact_user_id: Optional[str] = Field(None, description="Optional user ID of contact if registered")
    relationship: Optional[str] = Field("Known Contact", description="Relationship type")
    verification_status: str = Field("verified", description="Biometric verification status")


@router.get("")
def list_contacts(user_id: Optional[str] = None, db: Optional[Session] = Depends(get_db)):
    """List trusted contacts for a given user from PostgreSQL."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "count": 0,
            "contacts": [],
            "note": "Database offline - returning empty list",
        }

    try:
        query = db.query(TrustedContact)
        if user_id:
            query = query.filter(TrustedContact.user_id == user_id)
        contacts = query.all()
        return {
            "success": True,
            "count": len(contacts),
            "contacts": [c.to_dict() for c in contacts],
        }
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.post("", status_code=status.HTTP_201_CREATED)
def add_contact(request: ContactCreateRequest, db: Optional[Session] = Depends(get_db)):
    """Add a new trusted contact into PostgreSQL."""
    if db is None or not hasattr(db, "query"):
        return {
            "success": True,
            "contact": {
                "user_id": request.user_id,
                "relationship": request.relationship,
                "verification_status": request.verification_status,
            },
        }

    try:
        new_contact = TrustedContact(
            user_id=request.user_id,
            contact_user_id=request.contact_user_id,
            relationship_name=request.relationship,
            verification_status=request.verification_status,
        )
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        return {
            "success": True,
            "contact": new_contact.to_dict(),
        }
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )


@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Optional[Session] = Depends(get_db)):
    """Delete a contact from trusted_contacts table."""
    if db is None or not hasattr(db, "query"):
        return {"success": True, "message": f"Contact {contact_id} removed (offline)"}

    try:
        contact = db.query(TrustedContact).filter(TrustedContact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        db.delete(contact)
        db.commit()
        return {"success": True, "message": "Contact removed successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please verify DATABASE_URL in .env.",
        )
