# Changelog

All notable changes to the AI Career Coach project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-alpha.1] - 2026-11-09

### Added - Phase 1: Project Foundation
- Initialized monorepo directory layout: `frontend/`, `backend/`, `docs/`, `infrastructure/`, `scripts/`, `.github/workflows/`.
- Frontend SPA baseline with React 18, TypeScript 5, Vite, Material UI v5, React Router v6, Redux Toolkit, and TanStack Query.
- Responsive application shell with Sidebar navigation, Header, Theme toggler (Light/Dark mode), and Global Error Boundary.
- Backend API foundation with Flask 3 following the Application Factory pattern.
- Configuration classes for `development`, `testing`, and `production`.
- SQLAlchemy ORM setup with SQLite engine and explicit Foreign Key constraint enforcement hook (`PRAGMA foreign_keys=ON`).
- Initial `User` database model with unique email constraint, indexes, bcrypt password hashing helpers, and timestamp tracking.
- Standardized API versioning blueprint (`/api/v1`) with `/api/v1/health` status endpoint.
- Centralized exception handlers for 400, 404, 405, 422, and 500 status codes with consistent JSON responses.
- Environment variable specification templates (`frontend/.env.example`, `backend/.env.example`).
- Comprehensive Phase 1 documentation: System Architecture, Project Overview, Setup Guides, and Environment Configuration.
- Containerization scaffolding with `docker-compose.yml`, Dockerfiles, and GitHub Actions CI workflow.
