# 01 — Project Overview: AI Career Coach SaaS

## Executive Summary

The **AI Career Coach** is an enterprise-grade, full-stack SaaS application engineered to guide professionals through modern job search workflows. It provides an intelligent ecosystem featuring resume analysis, LinkedIn profile optimization, realistic mock interview simulations, personalized skill gap roadmaps, and career trajectory tracking.

The platform is designed following modern software engineering principles:
- **Clean Architecture & Decoupled Layers**: Independent frontend SPA and REST API backend.
- **Robust Security & Tenant Isolation**: Secure session handling, encrypted storage, and IDOR protection.
- **Provider-Agnostic AI Integration**: Seamless switching between OpenAI, Hugging Face, and deterministic local mock providers for resilient testing and cost efficiency.

---

## Core Product Capabilities (Phase 1–7 Roadmap)

1. **Authentication & Identity Management**: JWT-based access/refresh token rotation, bcrypt password hashing, session revocation.
2. **Interactive Career Dashboard**: High-level telemetry, application tracker status, recommended next actions.
3. **Conversational Career Chatbot**: Real-time context-aware guidance with career persona prompts.
4. **AI Resume Analyzer**: PDF/DOCX parsing, ATS score computation, section-by-section critique, and bullet-point suggestions.
5. **LinkedIn Profile Optimizer**: Headline generation, summary crafting, experience section enhancement, and keyword extraction.
6. **AI Interview Simulator**: Behavioral (STAR framework) and technical interview mock sessions with real-time feedback.
7. **Skill Gap Analyzer**: Role-based benchmark comparisons with market demand metrics.
8. **Personalized Learning Roadmap**: Milestone-based career transition paths with curated learning resources.
9. **Job Application Kanban Tracker**: Pipeline management for applications, interviews, offers, and rejections.
10. **Analytics & Progress Visualizations**: Career growth trajectory and preparation readiness scores.

---

## Phase 1 Scope & Foundation Goals

Phase 1 focuses entirely on setting up an immaculate project foundation:
- Clean monorepo directory layout with CI/CD and Docker scaffolding.
- Type-safe React + TypeScript + Vite frontend with Material UI v5, React Router, Redux Toolkit, and TanStack Query.
- Responsive, theme-aware application shell with Light/Dark mode toggling.
- Modular Flask backend adhering to the Application Factory pattern.
- SQLite database configuration with SQLAlchemy ORM, foreign key enforcement, migrations, and User model.
- Health check endpoints (`/api/v1/health`) and standardized JSON error structures.
- Strict environment variable boundaries and comprehensive setup documentation.
