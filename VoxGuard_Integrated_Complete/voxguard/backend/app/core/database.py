"""
database.py
-----------
PostgreSQL database connection and session management for VoxGuard backend.
Uses SQLAlchemy 2.0 and modern psycopg 3 driver.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, Generator, Optional, Tuple
from urllib.parse import urlparse

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from .config import settings

logger = logging.getLogger("voxguard.database")

Base = declarative_base()


def normalize_db_url(raw_url: str) -> str:
    """
    Ensure the PostgreSQL driver dialect is properly mapped to psycopg 3.
    Standard 'postgresql://' is mapped to 'postgresql+psycopg://'.
    Also safely URL-encodes special characters (such as '@') in the password if present.
    """
    if not raw_url:
        return "postgresql+psycopg://postgres:postgres@localhost:5432/voxguard_db"

    url = raw_url.strip()
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)

    # If multiple '@' signs exist (e.g. password contains '@'), encode the password portion
    if "://" in url:
        scheme, remainder = url.split("://", 1)
        if remainder.count("@") > 1 and ":" in remainder:
            last_at_idx = remainder.rfind("@")
            userinfo = remainder[:last_at_idx]
            host_db = remainder[last_at_idx + 1:]
            if ":" in userinfo:
                username, password = userinfo.split(":", 1)
                from urllib.parse import quote_plus
                encoded_password = quote_plus(password)
                url = f"{scheme}://{username}:{encoded_password}@{host_db}"

    return url


def mask_db_url(raw_url: str) -> str:
    """Safely mask password in database URL for logs and diagnostics."""
    if not raw_url:
        return "not_configured"
    # Replace :password@ with :***@
    return re.sub(r":([^@]+)@", r":***@", raw_url)


# ---------------------------------------------------------------------------
# Engine & Session Factory Setup
# ---------------------------------------------------------------------------
normalized_url = normalize_db_url(settings.DATABASE_URL)

try:
    engine = create_engine(
        normalized_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=3600,
        connect_args={"connect_timeout": 3},
    )
except Exception as exc:
    logger.warning("[Database Engine] Could not create engine with URL %s: %s", mask_db_url(normalized_url), exc)
    # Fallback engine
    engine = create_engine("sqlite:///:memory:", pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# FastAPI Dependency Injection
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a thread-safe SQLAlchemy database session.
    Automatically handles rollback on error and session close on completion.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Health Check & Table Initialization
# ---------------------------------------------------------------------------
def check_db_health() -> Tuple[bool, Dict[str, Any]]:
    """
    Executes a quick ping query (SELECT 1) against PostgreSQL.
    Returns (is_healthy, info_dict). Never raises exceptions.
    Never exposes passwords.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        parsed = urlparse(normalized_url)
        return True, {
            "status": "healthy",
            "database": parsed.path.lstrip("/") or "voxguard_db",
            "host": parsed.hostname or "localhost",
            "port": parsed.port or 5432,
            "driver": "psycopg3 / SQLAlchemy 2.0",
        }
    except Exception as exc:
        err_msg = str(exc)
        # Scrub any password from error message
        if ":" in err_msg and "@" in err_msg:
            err_msg = re.sub(r":([^@]+)@", r":***@", err_msg)
        
        logger.debug("[Database Health Ping] Failed: %s", err_msg)
        return False, {
            "status": "unhealthy",
            "error": "Unable to connect to PostgreSQL database. Please verify DATABASE_URL credentials in .env.",
            "driver": "psycopg3 / SQLAlchemy 2.0",
        }


def init_db() -> bool:
    """
    Safely creates all database tables defined in models.py if they do not exist.
    Will not crash if database is temporarily offline.
    """
    from . import models  # noqa: F401 - ensure models are registered with Base.metadata

    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("[Database] All tables initialized successfully in %s", mask_db_url(normalized_url))
        return True
    except Exception as exc:
        logger.warning(
            "[Database] Table initialization deferred (database currently unreachable): %s",
            mask_db_url(str(exc))
        )
        return False
