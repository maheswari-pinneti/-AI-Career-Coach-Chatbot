from app import create_app
from app.settings import DevelopmentConfig, TestingConfig, ProductionConfig


def test_development_config():
    """Verify development configuration flags."""
    app = create_app("development")
    assert app.config["DEBUG"] is True
    assert app.config["TESTING"] is False
    assert "ai_career_coach" in app.config["SQLALCHEMY_DATABASE_URI"]


def test_testing_config():
    """Verify testing configuration flags."""
    app = create_app("testing")
    assert app.config["DEBUG"] is False
    assert app.config["TESTING"] is True
    assert app.config["SQLALCHEMY_DATABASE_URI"] == "sqlite:///:memory:"


def test_production_config():
    """Verify production configuration flags."""
    app = create_app("production")
    assert app.config["DEBUG"] is False
    assert app.config["TESTING"] is False
