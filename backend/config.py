"""
AgroVision AI — Configuration
Loads environment variables from .env file.
"""

import os
from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))


# ─── AI Provider ──────────────────────────────────────────
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").strip()
AI_API_KEY = os.getenv("AI_API_KEY", "").strip()

# ─── JWT Authentication ──────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# ─── Database ─────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agrovision.db")

# ─── Paths ────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def validate_config():
    """Warn about missing critical config on startup."""
    warnings = []
    if not AI_API_KEY or AI_API_KEY == "your-gemini-api-key-here":
        warnings.append("⚠ AI_API_KEY not set — AI features will return fallback responses")
    if JWT_SECRET == "dev-secret-change-in-production":
        warnings.append("⚠ JWT_SECRET using default — change for production")
    for w in warnings:
        print(w)
