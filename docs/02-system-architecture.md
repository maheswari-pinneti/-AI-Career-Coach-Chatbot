# 02 — System Architecture: AI Career Coach SaaS

## System Overview

The application adopts a decoupled client-server architecture designed for high maintainability, developer ergonomics, and seamless production cloud deployments (Docker, AWS ECS/Render, Vercel/Netlify).

```
+-------------------------------------------------------------+
|                     Client Tier (SPA)                       |
|   React 18 + TypeScript + Vite + MUI v5 + TanStack Query    |
+------------------------------+------------------------------+
                               | HTTPS / JSON REST API
                               v
+-------------------------------------------------------------+
|                     Application Tier                        |
|        Flask 3 (App Factory) + Blueprints (/api/v1)         |
|  - Auth Middleware (JWT + Bcrypt)                           |
|  - CORS & Centralized Exception Handlers                   |
|  - Structured Logging & Health Telemetry                   |
+------------------------------+------------------------------+
                               | SQLAlchemy ORM
                               v
+-------------------------------------------------------------+
|                       Data Tier                             |
|    SQLite 3 (Development/Test) -> PostgreSQL (Production)   |
|  - Foreign Key Constraints Enabled (PRAGMA foreign_keys=ON) |
|  - Alembic / Flask-Migrate Schema Versioning                |
+-------------------------------------------------------------+
```

---

## Frontend Architecture

- **Build System**: Vite 5 with React 18, utilizing ES Modules for sub-second HMR.
- **Language**: TypeScript 5 in strict mode (`strict: true`, `noImplicitAny: true`).
- **UI Framework**: Material UI v5 with `@emotion/react` and `@emotion/styled`. Customized palette supporting instant switching between light and dark themes.
- **State Architecture**:
  - **Server State**: `@tanstack/react-query` for API caching, deduping, and background invalidation.
  - **Client / UI State**: `@reduxjs/toolkit` and `react-redux` for global layout state (theme mode, drawer collapse, notifications).
- **Routing**: `react-router-dom` v6 with layouts, error boundaries, and nested route definitions.
- **Form & Validation**: `react-hook-form` coupled with `zod` for zero-overhead client validation.
- **Icons & Charts**: `lucide-react`, `@mui/icons-material`, and `recharts`.

---

## Backend Architecture

- **Framework**: Flask 3.x using the **Application Factory pattern** (`create_app(config_name)`).
- **Environment Management**: Configuration classes (`DevelopmentConfig`, `TestingConfig`, `ProductionConfig`) powered by `python-dotenv`.
- **Database & Migration**: `Flask-SQLAlchemy` (SQLAlchemy 2.x) and `Flask-Migrate` (Alembic) ensuring reproducible schema migrations.
- **API Versioning**: Prefix-based versioning via Flask Blueprints (`/api/v1/health`, `/api/v1/auth`, etc.).
- **Security & Hardening**:
  - `bcrypt` for password hashing with work-factor salting.
  - Centralized error handlers returning consistent JSON payloads with HTTP error codes.
  - Strict CORS whitelist configurations.
- **Observability**: Standardized Python logging with timestamped formatters and configurable log levels.
