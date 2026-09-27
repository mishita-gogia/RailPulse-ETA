"""Application configuration."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "RailPulse ETA"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Dynamic Train Arrival Forecasting System"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./railpulse.db"
    )

    # MongoDB — used ONLY for auth (Control Room + Passenger accounts).
    # All other app data stays on the existing SQLite/SQLAlchemy stack.
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "railpulse_auth")

    # Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-only-insecure-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    # Simulation
    SIMULATION_INTERVAL: int = int(os.getenv("SIMULATION_INTERVAL", "3"))

    # ML Model
    ML_MODEL_PATH: str = os.getenv(
        "ML_MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "..", "..", "ml", "model", "eta_model.joblib")
    )

    # Demo mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

    # Server
    HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BACKEND_PORT", "8000"))


settings = Settings()
