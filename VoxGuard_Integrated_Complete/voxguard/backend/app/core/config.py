import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "VoxGuard"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "VoxGuard AI Voice Security, Deepfake Detection & Risk Engine"
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    
    VOXGUARD_API_KEY: str = os.getenv("VOXGUARD_API_KEY", "voxguard_secret_api_key_2026_demo")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "voxguard_secret_key_2026_sih_shield")
    
    # Risk Engine Thresholds
    RISK_THRESHOLD_ALLOW: float = float(os.getenv("RISK_THRESHOLD_ALLOW", "0.25"))
    RISK_THRESHOLD_WARN: float = float(os.getenv("RISK_THRESHOLD_WARN", "0.50"))
    RISK_THRESHOLD_VERIFY: float = float(os.getenv("RISK_THRESHOLD_VERIFY", "0.75"))
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/voxguard_db"
    )
    
    # Paths
    AASIST_MODEL_PATH: str = str(BASE_DIR / os.getenv("AASIST_MODEL_PATH", "models/aasist-l.onnx"))
    VOICEPRINTS_PATH: str = str(BASE_DIR / os.getenv("VOICEPRINTS_STORE_PATH", "data/voiceprints.json"))
    AUDIT_LOG_PATH: str = str(BASE_DIR / os.getenv("AUDIT_LOG_PATH", "logs/audit.log"))
    OFFLINE_STORE_PATH: str = str(BASE_DIR / os.getenv("OFFLINE_STORE_PATH", "logs/offline_events.enc"))
    OFFLINE_KEY_PATH: str = str(BASE_DIR / os.getenv("OFFLINE_KEY_PATH", "logs/offline_events.key"))

settings = Settings()
