import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend application
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from backend root or system environment
load_dotenv(BASE_DIR / ".env")


class Config:
    """Base configuration with safe default values."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-ai-career-coach-change-in-prod")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-change-in-prod")
    
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    cors_raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173",
    )
    CORS_ORIGINS = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]
    
    # AI Provider
    AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
    
    # Application Info
    APP_NAME = "AI Career Coach API"
    APP_VERSION = "1.0.0"


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'instance' / 'ai_career_coach_dev.db'}",
    )


class TestingConfig(Config):
    """Testing environment configuration."""
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app) if hasattr(Config, "init_app") else None
        assert os.getenv("SECRET_KEY"), "SECRET_KEY must be set in production!"
        assert os.getenv("DATABASE_URL"), "DATABASE_URL must be set in production!"


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
