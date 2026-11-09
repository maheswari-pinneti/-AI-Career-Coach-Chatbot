# 04 — Backend Setup & Development Guide

## Prerequisites

- **Python**: `3.10` or higher (verified with Python 3.11, 3.13, 3.14)
- **Pip**: Latest version
- Virtual environment tool (`venv`)

---

## Installation & Configuration

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables:**
   ```bash
   cp .env.example .env
   ```

5. **Initialize Database:**
   ```bash
   python scripts/init_db.py
   # or
   flask db upgrade
   ```

---

## Running the Application

### Development Server
```bash
python run.py
```
By default, the server runs on `http://127.0.0.1:5000`.

### Health Check Verification
```bash
curl http://127.0.0.1:5000/api/v1/health
```

Expected Response:
```json
{
  "success": true,
  "message": "AI Career Coach API is running",
  "version": "1.0.0"
}
```

---

## Running Automated Tests

```bash
# Run pytest test suite
pytest -v

# Run with coverage report
pytest --cov=app -v
```
