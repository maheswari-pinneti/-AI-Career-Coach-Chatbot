# 🤖 AI Career Coach SaaS Platform

[![CI Pipeline](https://github.com/maheswari-pinneti/-AI-Career-Coach-Chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/maheswari-pinneti/-AI-Career-Coach-Chatbot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Phase 1: Foundation](https://img.shields.io/badge/Phase%201-Verified%20Foundation-brightgreen)](DEVELOPMENT_STATUS.md)

An enterprise-grade, full-stack AI SaaS platform designed to accelerate career growth, resume scoring, LinkedIn profile optimization, and mock interview preparation.

Built with **React 18 + TypeScript + Vite + Material UI v5** on the client, and **Flask 3 (Application Factory) + SQLAlchemy ORM + SQLite / PostgreSQL** on the backend.

---

## 📌 Architecture Overview

```
+-----------------------------------------------------------------+
|                       Client Tier (SPA)                         |
|   React 18 + TypeScript + Vite + MUI v5 + RTK + TanStack Query   |
+--------------------------------+--------------------------------+
                                 | HTTPS / REST JSON
                                 v
+-----------------------------------------------------------------+
|                       Backend API Tier                          |
|         Flask 3 (App Factory) + Blueprints (/api/v1)            |
|   - CORS & Centralized Error Handlers (400, 404, 405, 422, 500) |
|   - Bcrypt Password Hashing & Structured Logging                |
+--------------------------------+--------------------------------+
                                 | SQLAlchemy 2.x
                                 v
+-----------------------------------------------------------------+
|                       Database Tier                             |
|     SQLite 3 (Dev/Test) -> PostgreSQL (Production Cloud)        |
|   - PRAGMA foreign_keys = ON & Alembic Migrations               |
+-----------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

### Frontend
- **Runtime & Build**: [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode), [Vite 5](https://vitejs.dev/)
- **UI & Design System**: [Material UI v5](https://mui.com/), [Emotion](https://emotion.sh/), [Lucide React](https://lucide.dev/)
- **State & Data**: [Redux Toolkit](https://redux-toolkit.js.org/), [TanStack Query v5](https://tanstack.com/query), [Axios](https://axios-http.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Testing & Quality**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

### Backend
- **Framework**: [Flask 3](https://flask.palletsprojects.com/) (Application Factory pattern)
- **Database & ORM**: [SQLAlchemy 2.x](https://www.sqlalchemy.org/), [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/), [Flask-Migrate](https://flask-migrate.readthedocs.io/) (Alembic)
- **Security & Utilities**: `bcrypt`, `PyJWT`, `python-dotenv`, `Flask-CORS`
- **Testing**: `pytest`, `pytest-cov`
- **Deployment**: `Docker`, `Docker Compose`, `Nginx`, `Gunicorn`

---

## 🗂️ Project Directory Layout

```
AI-Career-Coach/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/              # API v1 routes & health check
│   │   ├── models/              # SQLAlchemy User entity model
│   │   ├── extensions.py        # SQLAlchemy, Migrate, CORS
│   │   ├── settings.py          # Environment configs (dev, test, prod)
│   │   └── __init__.py          # Application Factory (create_app)
│   ├── migrations/              # Alembic database migration scripts
│   ├── tests/                   # Pytest automated test suite
│   ├── requirements.txt         # Backend Python dependencies
│   ├── run.py                   # Development entry point
│   └── wsgi.py                  # WSGI entry point for production
├── docs/                        # Architecture & Setup guides (01 - 06)
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client instance & interceptors
│   │   ├── components/          # Reusable shell (Header, Sidebar, ErrorBoundary)
│   │   ├── layouts/             # Main responsive layout shell
│   │   ├── pages/               # Overview, Health check, and placeholder routes
│   │   ├── routes/              # React Router v6 tree
│   │   ├── store/               # Redux Toolkit store and UI slices
│   │   ├── theme/               # Material UI Light & Dark theme definitions
│   │   └── test/                # Vitest & Testing Library suites
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tsconfig.json            # Strict TypeScript configuration
│   └── vite.config.ts           # Vite build & alias configurations
├── infrastructure/
│   ├── Dockerfile.backend       # Multi-stage Python build
│   ├── Dockerfile.frontend      # Multi-stage Vite build + Nginx
│   └── nginx.conf               # Nginx reverse proxy configuration
├── scripts/
│   └── init_db.py               # SQLite database initializer & verification
├── .gitignore                   # Version control ignore rules
├── CHANGELOG.md                 # Semantic version changelog
├── DEVELOPMENT_STATUS.md        # Comprehensive phase implementation status
├── docker-compose.yml           # Local multi-container orchestration
└── README.md                    # Project documentation
```

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: v18+ (tested on v20, v24)
- **Python**: 3.10+ (tested on 3.11, 3.13, 3.14)
- **npm** or **pnpm**

---

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Initialize database & run migrations
flask db upgrade

# Run tests
pytest -v

# Start development server (http://localhost:5000)
python run.py
```

Verify backend health:
```bash
curl http://127.0.0.1:5000/api/v1/health
```

Expected output:
```json
{
  "success": true,
  "message": "AI Career Coach API is running",
  "version": "1.0.0"
}
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run type check, linter & tests
npx tsc --noEmit
npm run lint
npm test

# Build for production
npm run build

# Start Vite dev server (http://localhost:5173)
npm run dev
```

---

### 4. Running via Docker Compose

```bash
# Build and launch all containers
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1/health`

---

## 📚 Technical Documentation

Detailed architectural and setup guides can be found in `docs/`:
- [01 — Project Overview](docs/01-project-overview.md)
- [02 — System Architecture](docs/02-system-architecture.md)
- [03 — Frontend Setup Guide](docs/03-frontend-setup.md)
- [04 — Backend Setup Guide](docs/04-backend-setup.md)
- [05 — Database Setup & Migrations](docs/05-database-setup.md)
- [06 — Environment Configuration](docs/06-environment-configuration.md)

---

## 📜 License

MIT License — free to use and adapt. Made by [Maheswari Pinneti](https://github.com/maheswari-pinneti).
