from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import jwt
from flask import current_app
from app.extensions import db
from app.models.token import RefreshToken, PasswordResetToken


def hash_token(raw_token: str) -> str:
    """Create SHA-256 hash of a raw token for secure database storage and lookup."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_random_token(nbytes: int = 32) -> str:
    """Generate cryptographically secure URL-safe random string."""
    return secrets.token_urlsafe(nbytes)


def generate_access_token(user_id: int, email: str, expires_in: timedelta = None) -> str:
    """Generate short-lived signed JWT access token."""
    if expires_in is None:
        expires_in = timedelta(minutes=30)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "access",
        "iat": now,
        "exp": now + expires_in,
    }
    secret_key = current_app.config.get("JWT_SECRET_KEY", "fallback-jwt-secret-key-32chars")
    return jwt.encode(payload, secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    secret_key = current_app.config.get("JWT_SECRET_KEY", "fallback-jwt-secret-key-32chars")
    return jwt.decode(token, secret_key, algorithms=["HS256"])


def create_refresh_token(user_id: int, expires_in_days: int = 30) -> tuple[RefreshToken, str]:
    """Generate and persist a single-use refresh token record."""
    raw_token = generate_random_token(48)
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)

    token_record = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.session.add(token_record)
    return token_record, raw_token


def create_password_reset_token(user_id: int, expires_in_minutes: int = 60) -> tuple[PasswordResetToken, str]:
    """Generate and persist a single-use password recovery token."""
    raw_token = generate_random_token(48)
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)

    token_record = PasswordResetToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_used=False,
    )
    db.session.add(token_record)
    return token_record, raw_token
