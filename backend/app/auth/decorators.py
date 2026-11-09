from functools import wraps
from flask import request, jsonify, g
import jwt
from app.extensions import db
from app.auth.tokens import decode_access_token
from app.models.user import User


def jwt_required(f):
    """Decorator requiring a valid JWT access token in the Authorization header."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "Authorization token is missing or malformed.",
            }), 401

        token = auth_header.split(" ", 1)[1].strip()

        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "Access token has expired. Please refresh your session.",
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "Invalid authentication token.",
            }), 401

        if payload.get("type") != "access":
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "Invalid token type.",
            }), 401

        raw_user_id = payload.get("sub")
        try:
            user_id = int(raw_user_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "Invalid user identifier in token.",
            }), 401

        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            return jsonify({
                "success": False,
                "error": "Unauthorized",
                "message": "User account is inactive or no longer exists.",
            }), 401

        # Bind user context to Flask request global
        g.current_user = user
        g.current_user_id = user.id

        return f(*args, **kwargs)

    return decorated_function


def ensure_ownership(resource_user_id: int):
    """Enforce strict tenant data isolation; prevents Insecure Direct Object Reference (IDOR)."""
    current_id = getattr(g, "current_user_id", None)
    if current_id is None or current_id != resource_user_id:
        from werkzeug.exceptions import Forbidden
        raise Forbidden("You do not have permission to access or modify this resource.")
