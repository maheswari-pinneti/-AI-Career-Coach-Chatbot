import logging
import os
from flask import Flask
from app.settings import config_by_name
from app.extensions import db, migrate, cors
from app.models import (
    User,
    UserProfile,
    RefreshToken,
    PasswordResetToken,
    UserSession,
    UserPreference,
)
from app.api.v1.errors import register_error_handlers
from app.api.v1 import api_v1_bp

__all__ = ["create_app", "User"]


def configure_logging(app: Flask) -> None:
    """Configure structured application logging."""
    log_level = logging.DEBUG if app.config.get("DEBUG") else logging.INFO
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s (%(process)d): %(message)s"
    )

    # Standard stream handler
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(log_level)

    app.logger.handlers.clear()
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(log_level)


def create_app(config_name: str = None) -> Flask:
    """Application factory for AI Career Coach Flask application."""
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__, instance_relative_config=True)

    # Load configuration
    config_class = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(config_class)

    # Ensure the instance directory exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Initialize CORS
    cors_origins = app.config.get("CORS_ORIGINS", ["*"])
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=True,
    )

    # Configure logging
    configure_logging(app)

    # Register centralized error handlers
    register_error_handlers(app)

    # Register API blueprints
    app.register_blueprint(api_v1_bp)

    app.logger.info(
        f"AI Career Coach API initialized successfully [ENV: {config_name}] [DB: {app.config.get('SQLALCHEMY_DATABASE_URI')}]"
    )

    return app
