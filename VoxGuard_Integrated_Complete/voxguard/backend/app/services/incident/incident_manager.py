from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid


@dataclass
class Incident:
    incident_id: str
    call_id: str
    severity: str
    event: str
    risk_score: float
    decision: str
    timestamp: str
    details: dict = field(default_factory=dict)
    status: str = "OPEN"


class IncidentManager:
    """Manages suspicious security incidents created by the VoxGuard Risk & Security layer."""

    def __init__(self):
        self.incidents: dict[str, Incident] = {}

    def create_incident(
        self,
        call_id: str,
        severity: str,
        event: str,
        risk_score: float,
        decision: str,
        details: dict | None = None,
    ) -> Incident:
        inc = Incident(
            incident_id=str(uuid.uuid4()),
            call_id=call_id,
            severity=severity,
            event=event,
            risk_score=risk_score,
            decision=decision,
            timestamp=datetime.now(timezone.utc).isoformat(),
            details=details or {},
        )
        self.incidents[inc.incident_id] = inc
        return inc

    def get_incident(self, incident_id: str) -> Incident | None:
        return self.incidents.get(incident_id)

    def list_incidents(self, limit: int = 50) -> list[Incident]:
        return list(self.incidents.values())[-limit:]

    @staticmethod
    def close_incident(incident: Incident) -> Incident:
        incident.status = "CLOSED"
        return incident
