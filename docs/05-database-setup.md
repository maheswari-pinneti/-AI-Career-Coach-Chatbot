# 05 — Database Setup & Migration Architecture

## Database Engine & ORM

- **Development & Testing Engine**: SQLite 3 with WAL (Write-Ahead Logging) and Foreign Key constraint enforcement enabled.
- **Production Engine**: PostgreSQL (fully supported via SQLAlchemy connection strings).
- **Object Relational Mapper**: SQLAlchemy 2.x via `Flask-SQLAlchemy`.
- **Migration Engine**: Alembic via `Flask-Migrate`.

---

## SQLite Foreign Key Enforcement

SQLite does not enable foreign keys by default. The application explicitly enforces foreign keys via SQLAlchemy engine connection hooks:

```python
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA foreign_keys=ON")
    finally:
        cursor.close()
```

---

## Initial Schema: User Model

The foundation `User` model defines:

| Column | Type | Constraints / Attributes | Description |
|---|---|---|---|
| `id` | `Integer` | Primary Key, Autoincrement | Unique record identifier |
| `email` | `String(255)` | Unique, Indexed, Not Null | Normalized user login email |
| `password_hash` | `String(255)` | Not Null | Bcrypt hashed password representation |
| `first_name` | `String(100)` | Nullable | User's first name |
| `last_name` | `String(100)` | Nullable | User's last name |
| `is_active` | `Boolean` | Default: `True`, Not Null | User account status |
| `created_at` | `DateTime` | Default: UTC now, Not Null | Creation timestamp |
| `updated_at` | `DateTime` | On Update: UTC now, Not Null | Last modification timestamp |

---

## Database Management Commands

```bash
# Initialize SQLite database and tables directly
python scripts/init_db.py

# Initialize Alembic migration directory
flask db init

# Generate migration revision after model changes
flask db migrate -m "migration message"

# Apply pending migrations
flask db upgrade

# Rollback last migration
flask db downgrade
```
