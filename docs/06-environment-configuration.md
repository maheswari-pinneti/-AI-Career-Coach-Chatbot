# 06 — Environment Configuration Guide

## Overview

The AI Career Coach application relies on 12-factor application configuration principles. Environment variables govern application behaviors across Development, Testing, Staging, and Production tiers.

> **Security Rule**: Never commit `.env` or production secrets to Git. Always copy `.env.example` templates and populate them locally.

---

## Frontend Environment Variables (`frontend/.env`)

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api/v1` | Base URL used by Axios client for backend REST API requests |
| `VITE_APP_ENV` | No | `development` | Environment descriptor used for client logging and feature toggles |

---

## Backend Environment Variables (`backend/.env`)

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `FLASK_ENV` | Yes | `development` | Selects configuration class (`development`, `testing`, `production`) |
| `FLASK_APP` | Yes | `run.py` | Flask CLI application entry point |
| `FLASK_DEBUG` | No | `1` (dev), `0` (prod) | Toggles Flask live debugger and auto-reloader |
| `SECRET_KEY` | Yes | *Random 32+ character string* | Cryptographic salt for session signing and CSRF tokens |
| `JWT_SECRET_KEY` | Yes | *Random 32+ character string* | Secret key for signing and validating JWT tokens |
| `DATABASE_URL` | Yes | `sqlite:///ai_career_coach.db` | SQLAlchemy connection URI (SQLite or PostgreSQL) |
| `CORS_ORIGINS` | Yes | `http://localhost:3000,http://localhost:5173` | Comma-separated list of allowed CORS browser origins |
| `AI_PROVIDER` | Yes | `mock` | Active AI provider (`mock`, `openai`, `huggingface`) |
| `OPENAI_API_KEY` | Conditional | `your-openai-api-key-here` | OpenAI platform API credential (required if `AI_PROVIDER=openai`) |
| `HUGGINGFACE_API_KEY` | Conditional | `your-hf-api-key-here` | Hugging Face inference key (required if `AI_PROVIDER=huggingface`) |
