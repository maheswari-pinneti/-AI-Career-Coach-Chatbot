"""
Database Initialization Script for AI Career Coach.
Creates SQLite database schema and verifies table existence and constraints.
"""
import os
import sys

# Ensure backend root is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import create_app
from app.extensions import db
from app.models.user import User


def init_database(config_name="development"):
    """Initialize database tables and verify schema."""
    app = create_app(config_name)
    with app.app_context():
        # Ensure instance folder exists
        db_path = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        if "sqlite:///" in db_path:
            abs_db_path = db_path.replace("sqlite:///", "")
            if not os.path.isabs(abs_db_path):
                abs_db_path = os.path.join(app.instance_path, abs_db_path)
            os.makedirs(os.path.dirname(abs_db_path), exist_ok=True)

        print(f"[*] Initializing database for configuration: {config_name}")
        print(f"[*] Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

        db.create_all()

        # Verify tables created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"[+] Successfully created tables: {', '.join(tables)}")

        # Verify foreign keys pragma on SQLite
        if "sqlite" in app.config["SQLALCHEMY_DATABASE_URI"]:
            with db.engine.connect() as conn:
                result = conn.execute(db.text("PRAGMA foreign_keys;")).scalar()
                print(f"[+] SQLite PRAGMA foreign_keys = {result} (1 = active)")

        return tables


if __name__ == "__main__":
    env = os.getenv("FLASK_ENV", "development")
    init_database(env)
