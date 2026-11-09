# 🤖 AI Career Coach SaaS Platform

[![CI Pipeline](https://github.com/maheswari-pinneti/-AI-Career-Coach-Chatbot/actions/workflows/ci.yml/badge.svg)](https://github.com/maheswari-pinneti/-AI-Career-Coach-Chatbot/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Phase Status](https://img.shields.io/badge/Phases%201--8-Production%20Certified-brightgreen)](DEVELOPMENT_STATUS.md)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)](frontend/tsconfig.json)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13%20%7C%203.14-blue)](backend/requirements.txt)

An enterprise-grade, full-stack AI SaaS platform designed to accelerate career growth, resume scoring, LinkedIn profile optimization, interactive mock interviews, personalized sprint roadmaps, job pipeline tracking, and career readiness telemetry.

Built with **React 18 + TypeScript + Vite + Material UI v5** on the client, and **Flask 3 (Application Factory) + SQLAlchemy ORM 2.x + SQLite / PostgreSQL** on the backend with resilient multi-provider AI adapters (OpenAI, HuggingFace, and deterministic Mock).

---

## 📌 Architecture Overview

```
+-------------------------------------------------------------------------+
|                        Client Tier (SPA)                                |
|   React 18 + TypeScript + Vite + MUI v5 + RTK + TanStack Query          |
+------------------------------------+------------------------------------+
                                     | HTTPS / REST JSON (JWT Auth)
                                     v
+-------------------------------------------------------------------------+
|                        Backend API Tier                                 |
|            Flask 3 (App Factory) + Blueprints (/api/v1)                 |
|   - CORS & Centralized Error Handlers (400, 401, 403, 404, 422, 500)   |
|   - Bcrypt/Argon2 Password Hashing & Single-Use JWT Refresh Rotation    |
|   - Multi-Provider AI Engine (OpenAI, HuggingFace, Mock Fallback)       |
+------------------------------------+------------------------------------+
                                     | SQLAlchemy 2.x
                                     v
+-------------------------------------------------------------------------+
|                        Database Tier                                    |
|         SQLite 3 (WAL Mode) -> PostgreSQL (Cloud Production)            |
|   - PRAGMA foreign_keys = ON & Alembic Migration Chain                  |
|   - Users, Sessions, Chats, Jobs, Roadmaps, Notifications               |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

### Frontend
- **Runtime & Build**: [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode), [Vite 5](https://vitejs.dev/)
- **UI & Design System**: [Material UI v5](https://mui.com/), [Emotion](https://emotion.sh/), [Lucide React](https://lucide.dev/)
- **State & Caching**: [Redux Toolkit](https://redux-toolkit.js.org/), [TanStack Query v5](https://tanstack.com/query), [Axios](https://axios-http.com/)
- **Data Visualizations**: [Recharts](https://recharts.org/)
- **Performance**: Route-level code-splitting (`React.lazy`), manual Rollup vendor chunks
- **Testing & Quality**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

### Backend
- **Framework**: [Flask 3](https://flask.palletsprojects.com/) (Application Factory pattern)
- **Database & ORM**: [SQLAlchemy 2.x](https://www.sqlalchemy.org/), [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/), [Flask-Migrate](https://flask-migrate.readthedocs.io/) (Alembic)
- **Security & Authentication**: `bcrypt`, `PyJWT` (single-use token rotation), `python-dotenv`, `Flask-CORS`
- **Testing**: `pytest` (35 unit/integration tests), `pytest-cov`
- **Containerization**: `Docker` multi-stage containers, `Docker Compose`, `Nginx`, `Gunicorn`

---

## 🗂️ Project Directory Layout

```
AI-Career-Coach/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Unified multi-stage CI pipeline
│       ├── frontend-ci.yml            # Frontend lint, test, typecheck, build
│       ├── backend-ci.yml             # Backend pytest automated test suite
│       └── security-checks.yml        # Bandit AST & npm dependency audit
├── backend/
│   ├── app/
│   │   ├── ai/                        # BaseAIProvider, OpenAI, HuggingFace, Mock
│   │   ├── api/v1/                    # Blueprints (auth, chat, jobs, roadmap, analytics)
│   │   ├── auth/                      # JWT token rotation & IDOR protection decorators
│   │   ├── models/                    # User, Session, Chat, Job, Roadmap, Notification
│   │   ├── extensions.py              # SQLAlchemy, Migrate, CORS
│   │   ├── settings.py                # Environment configs (development, testing, production)
│   │   └── __init__.py                # Flask application factory (create_app)
│   ├── instance/                      # Persistent SQLite storage directory
│   ├── migrations/                    # Alembic versioned migration chain
│   ├── tests/                         # 35 Pytest unit and integration tests
│   ├── requirements.txt               # Backend Python dependencies
│   ├── run.py                         # Local development server entry point
│   └── wsgi.py                        # Production Gunicorn WSGI entry point
├── docs/                              # Technical guides & Production Readiness Audit
├── frontend/
│   ├── src/
│   │   ├── api/                       # Typed Axios API clients (auth, chat, jobs, roadmap)
│   │   ├── components/                # 20+ Atomic design system components & layout
│   │   ├── pages/                     # Lazy-loaded views (Dashboard, Chat, Jobs, Roadmap)
│   │   ├── routes/                    # Code-split router with Suspense fallback
│   │   ├── store/                     # Redux Toolkit store and slices (auth, ui)
│   │   ├── theme/                     # Material UI tokenized light & dark themes
│   │   └── test/                      # Vitest & React Testing Library test suites
│   ├── package.json                   # Frontend dependencies and npm scripts
│   ├── tsconfig.json                  # TypeScript strict compiler configuration
│   ├── vercel.json                    # Vercel SPA routing and security headers
│   └── vite.config.ts                 # Vite manual chunk splitting configuration
├── infrastructure/
│   ├── Dockerfile.backend             # Multi-stage Python 3.11 slim Gunicorn container
│   ├── Dockerfile.frontend            # Multi-stage Node 20 build -> Nginx Alpine
│   └── nginx.conf                     # Nginx client-side routing & gzip proxy
├── scripts/
│   ├── backup_db.py                   # Automated SQLite backup with SHA-256 checksums
│   ├── restore_db.py                  # Verified database restore utility
│   └── init_db.py                     # Database verification script
├── .dockerignore                      # Docker ignore rules
├── .gitignore                         # Git exclusion rules
├── CHANGELOG.md                       # Comprehensive version changelog
├── DEVELOPMENT_STATUS.md              # Phase-by-phase implementation certification
├── docker-compose.yml                 # Multi-container local production stack
├── render.yaml                        # Render cloud deployment configuration
└── README.md                          # Project documentation
```

---

## 📥 How to Clone the Repository

### 1. Clone via HTTPS (Recommended)
```bash
git clone https://github.com/maheswari-pinneti/-AI-Career-Coach-Chatbot.git
cd -AI-Career-Coach-Chatbot
```

### 2. Clone via SSH
```bash
git clone git@github.com:maheswari-pinneti/-AI-Career-Coach-Chatbot.git
cd -AI-Career-Coach-Chatbot
```

### 3. Exploring Repository Branches
This repository organizes feature modules across dedicated Git branches:
```bash
# View all local and remote branches
git branch -a

# Switch to specific discipline branches
git checkout frontend      # Frontend UI & Design System
git checkout backend       # Flask API, AI Providers & Authentication
git checkout database      # Database Models, Alembic Migrations, Backups
git checkout testing       # Full Pytest & Vitest Test Suites
git checkout devops        # Docker, Nginx, CI/CD Workflows
git checkout docs          # Architecture specifications & audit reports
git checkout main          # Main production-ready release
```

---

## ⚡ How to Run the Application

You can run the full-stack application using either **Docker Compose** (fastest, zero-configuration) or by running **Frontend & Backend locally**.

### Option A: Running with Docker Compose (Recommended)

Ensure [Docker Desktop](https://www.docker.com/) is installed and running.

```bash
# Build images and start all containers in detached mode
docker-compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Database Persistence**: SQLite database is automatically persisted to the `backend_data` named Docker volume across restarts.

To stop the containers:
```bash
docker-compose down
```

---

### Option B: Running Locally (Frontend + Backend)

#### Prerequisites
- **Python**: 3.10+ (tested on 3.11, 3.13, 3.14)
- **Node.js**: 18.x or 20.x (tested up to Node 24)
- **npm** or **pnpm**

---

#### Step 1: Backend Setup

Open a terminal in the project root:

```bash
cd backend

# 1. Create a Python virtual environment
python -m venv .venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Windows (CMD):
.\.venv\Scripts\activate.bat
# macOS / Linux:
source .venv/bin/activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Set up environment variables
# Windows (PowerShell):
Copy-Item .env.example .env
# macOS / Linux:
cp .env.example .env

# 5. Apply database migrations
flask db upgrade

# 6. Start the Flask development server (runs on http://127.0.0.1:5000)
python run.py
```

Verify the backend is active:
```bash
curl http://127.0.0.1:5000/api/v1/health
```

Expected JSON response:
```json
{
  "success": true,
  "message": "AI Career Coach API is running",
  "version": "1.0.0"
}
```

---

#### Step 2: Frontend Setup

Open a **second** terminal in the project root:

```bash
cd frontend

# 1. Install Node dependencies
npm install

# 2. Set up environment variables
# Windows (PowerShell):
Copy-Item .env.example .env
# macOS / Linux:
cp .env.example .env

# 3. Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the SaaS platform.

---

## 🧪 Running Automated Tests

### Backend Tests (Pytest)
```bash
cd backend

# Activate virtual environment first
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate

pytest tests -v --tb=short
```
*Result: 35 passing tests covering authentication, JWT rotation, IDOR security, AI mock adapters, job pipelines, roadmap checklists, and telemetry analytics.*

### Frontend Tests (Vitest & React Testing Library)
```bash
cd frontend

# Run unit and integration tests
npm test

# Run TypeScript compiler check (Strict Mode)
npx tsc --noEmit

# Run ESLint
npm run lint
```
*Result: 13 passing tests with 0 TypeScript errors and 0 ESLint warnings.*

### Production Build Verification
```bash
cd frontend
npm run build
```
*Outputs optimized, route-level chunks under `frontend/dist/` with zero warnings.*

---

## 💾 Database Backup & Recovery

### Creating an Automated Backup
Run the backup script from the repository root:
```bash
python scripts/backup_db.py
```
Outputs an atomic copy with an associated SHA-256 integrity hash:
```
[SUCCESS] Database backed up to: backups/ai_career_coach_20261109_142815.db
[CHECKSUM] SHA-256: 4f1a...c89e
```

### Restoring from Backup
```bash
python scripts/restore_db.py backups/ai_career_coach_YYYYMMDD_HHMMSS.db
```
Automatically verifies the SHA-256 checksum before restoring the database.

---

## 📚 Technical Documentation & Guides

Comprehensive architecture and security documentation is available in `docs/`:

- [Production Readiness & Security Audit Report](docs/production-readiness-audit.md)
- [01 — Project Overview](docs/01-project-overview.md)
- [02 — System Architecture](docs/02-system-architecture.md)
- [03 — Frontend Setup Guide](docs/03-frontend-setup.md)
- [04 — Backend Setup Guide](docs/04-backend-setup.md)
- [05 — Database Setup & Migrations](docs/05-database-setup.md)
- [06 — Environment Configuration](docs/06-environment-configuration.md)

---

## 📜 License

Distributed under the **MIT License**. Free for commercial and non-commercial usage.  
Developed by [Maheswari Pinneti](https://github.com/maheswari-pinneti).
