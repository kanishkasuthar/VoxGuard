from .authenticity_routes import router as authenticity_router
from .speaker_routes import router as speaker_router
from .language_routes import router as language_router
from .fraud_routes import router as fraud_router
from .risk_routes import router as risk_router
from .pipeline_routes import router as pipeline_router
from .audit_routes import router as audit_router
from .challenge_routes import router as challenge_router
from .integration_routes import router as integration_router
from .person4_routes import router as person4_router

__all__ = [
    "authenticity_router",
    "speaker_router",
    "language_router",
    "fraud_router",
    "risk_router",
    "pipeline_router",
    "audit_router",
    "challenge_router",
    "integration_router",
    "person4_router",
]
