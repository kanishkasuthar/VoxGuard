from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.authenticity_routes import router as authenticity_router
from app.routes.speaker_routes import router as speaker_router
from app.routes.language_routes import router as language_router
from app.routes.fraud_routes import router as fraud_router
from app.routes.risk_routes import router as risk_router
from app.routes.pipeline_routes import router as pipeline_router
from app.routes.audit_routes import router as audit_router
from app.routes.challenge_routes import router as challenge_router
from app.routes.integration_routes import router as integration_router
from app.routes.person4_routes import router as person4_router
from app.routes.auth_routes import router as auth_router
from app.routes.call_routes import router as call_router
from app.routes.contact_routes import router as contact_router
from app.routes.incident_routes import router as incident_router
from app.core.database import init_db, check_db_health
from app.integration.model_versions import get_model_versions
from fastapi import Response, status

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

# CORS configuration for Frontend Web & Mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Safely initialize PostgreSQL database tables on startup."""
    init_db()


# Mount Routers
# 1. Full Unified Pipeline
app.include_router(pipeline_router)

# 2. Subsystem Routers
app.include_router(authenticity_router)
app.include_router(speaker_router)
app.include_router(language_router)
app.include_router(fraud_router)
app.include_router(risk_router)
app.include_router(audit_router)
app.include_router(challenge_router)

# 3. Database-Backed Entity Routers (Users, Calls, Contacts, Incidents)
app.include_router(auth_router)
app.include_router(call_router)
app.include_router(contact_router)
app.include_router(incident_router)

# 4. Person 4 & Person 6 Backward-Compatible Routers
app.include_router(person4_router)
app.include_router(integration_router)


@app.get("/")
def root():
    return {
        "project": "VoxGuard",
        "version": settings.VERSION,
        "status": "running",
        "modules": [
            "Person 4 - Voice AI & Authenticity Detection",
            "Person 6 - Security, Risk Engine & Decision Policy",
            "SpeechBrain - Biometric Speaker Verification",
            "Whisper - Multilingual Speech Processing & Language ID",
            "Multilingual Fraud & Social Engineering Intent Detection",
            "Tamper-Evident SHA-256 Hash Chain & Blockchain Audit Ledger",
            "AES Fernet Encrypted Offline Event Store & Sync",
            "Cryptographic OTP Verification Challenge",
        ],
        "model_versions": get_model_versions(),
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "VoxGuard AI Core Engine",
        "version": settings.VERSION,
    }


@app.get("/db-health")
def db_health(response: Response):
    """
    Database connectivity probe for PostgreSQL.
    Returns status: healthy when reachable.
    Returns status: unhealthy (HTTP 503) when unavailable, without crashing the server.
    """
    is_healthy, info = check_db_health()
    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
