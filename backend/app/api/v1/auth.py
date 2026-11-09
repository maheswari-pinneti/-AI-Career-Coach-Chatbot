import re
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.preference import UserPreference
from app.models.token import RefreshToken, PasswordResetToken
from app.models.session import UserSession
from app.auth.tokens import (
    generate_access_token,
    create_refresh_token,
    create_password_reset_token,
    hash_token,
)
from app.auth.decorators import jwt_required

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email_format(email: str) -> bool:
    """Validate RFC 5322 compatible email address format."""
    if not email or len(email) > 255:
        return False
    return bool(EMAIL_REGEX.match(email))


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account with default profile and preference records."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()

    # Validations
    if not email or not validate_email_format(email):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "A valid email address is required.",
        }), 400

    if not password or len(password) < 8:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Password must be at least 8 characters long.",
        }), 400

    # Duplicate email check
    if User.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "error": "Conflict",
            "message": "An account with this email address already exists.",
        }), 409

    try:
        user = User(
            email=email,
            first_name=first_name or None,
            last_name=last_name or None,
            is_active=True,
            is_verified=True,
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # Obtain user.id

        # Initialize 1-to-1 profile
        profile = UserProfile(
            user_id=user.id,
            target_role=data.get("target_role") or "Software Engineer",
            current_skills=data.get("current_skills") or [],
            education=[],
        )
        db.session.add(profile)

        # Initialize 1-to-1 preferences
        preference = UserPreference(
            user_id=user.id,
            theme="light",
            email_notifications=True,
            ai_provider="mock",
        )
        db.session.add(preference)

        # Create session
        session_id = str(uuid.uuid4())
        session = UserSession(
            user_id=user.id,
            session_id=session_id,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else "Unknown",
        )
        db.session.add(session)

        # Generate access and refresh tokens
        access_token = generate_access_token(user.id, user.email)
        _, raw_refresh_token = create_refresh_token(user.id)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful",
            "user": user.to_dict(include_profile=True),
            "access_token": access_token,
            "refresh_token": raw_refresh_token,
            "token_type": "Bearer",
        }), 201

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate credentials and issue short-lived access and refresh tokens."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Email and password are required.",
        }), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Invalid email address or password.",
        }), 401

    if not user.is_active:
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Account has been deactivated. Please contact support or reactivate your account.",
        }), 401

    try:
        # Create active session record
        session_id = str(uuid.uuid4())
        session = UserSession(
            user_id=user.id,
            session_id=session_id,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else "Unknown",
            last_active=datetime.now(timezone.utc),
        )
        db.session.add(session)

        # Issue tokens
        access_token = generate_access_token(user.id, user.email)
        _, raw_refresh_token = create_refresh_token(user.id)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user.to_dict(include_profile=True),
            "access_token": access_token,
            "refresh_token": raw_refresh_token,
            "token_type": "Bearer",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    """Rotate single-use refresh token and issue a fresh access token."""
    data = request.get_json(silent=True) or {}
    raw_token = data.get("refresh_token") or ""

    if not raw_token:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Refresh token is required.",
        }), 400

    token_hash = hash_token(raw_token)
    token_record = RefreshToken.query.filter_by(token_hash=token_hash, is_revoked=False).first()

    if not token_record or token_record.is_expired:
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Refresh token is invalid or has expired.",
        }), 401

    user = db.session.get(User, token_record.user_id)
    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "User account is no longer active.",
        }), 401

    try:
        # Revoke the used refresh token (Single-Use Token Rotation)
        token_record.is_revoked = True

        # Generate new token pair
        new_access_token = generate_access_token(user.id, user.email)
        _, new_raw_refresh_token = create_refresh_token(user.id)

        db.session.commit()

        return jsonify({
            "success": True,
            "access_token": new_access_token,
            "refresh_token": new_raw_refresh_token,
            "token_type": "Bearer",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/logout", methods=["POST"])
@jwt_required
def logout():
    """Revoke refresh token and active sessions."""
    data = request.get_json(silent=True) or {}
    raw_token = data.get("refresh_token")

    try:
        if raw_token:
            token_hash = hash_token(raw_token)
            token_record = RefreshToken.query.filter_by(token_hash=token_hash).first()
            if token_record and token_record.user_id == g.current_user_id:
                token_record.is_revoked = True

        # Revoke user's recent sessions
        UserSession.query.filter_by(user_id=g.current_user_id, is_revoked=False).update({"is_revoked": True})
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Logged out successfully",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generate secure password reset token."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Email is required.",
        }), 400

    user = User.query.filter_by(email=email).first()
    raw_token = None

    if user and user.is_active:
        _, raw_token = create_password_reset_token(user.id)
        db.session.commit()

    # Return standard response to prevent email enumeration attacks
    return jsonify({
        "success": True,
        "message": "If an account exists with this email, password reset instructions have been generated.",
        "reset_token": raw_token,  # Provided for local testing and development
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Validate recovery token and reset account password."""
    data = request.get_json(silent=True) or {}
    raw_token = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if not raw_token or not new_password:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Reset token and new password are required.",
        }), 400

    if len(new_password) < 8:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Password must be at least 8 characters long.",
        }), 400

    token_hash = hash_token(raw_token)
    token_record = PasswordResetToken.query.filter_by(token_hash=token_hash, is_used=False).first()

    if not token_record or token_record.is_expired:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Password reset token is invalid or has expired.",
        }), 400

    user = db.session.get(User, token_record.user_id)
    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "User account is invalid or deactivated.",
        }), 400

    try:
        user.set_password(new_password)
        token_record.is_used = True

        # Invalidate all existing refresh tokens for security
        RefreshToken.query.filter_by(user_id=user.id, is_revoked=False).update({"is_revoked": True})
        UserSession.query.filter_by(user_id=user.id, is_revoked=False).update({"is_revoked": True})

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Password has been reset successfully. Please log in with your new password.",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required
def change_password():
    """Update password for an authenticated user."""
    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not current_password or not new_password:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Current password and new password are required.",
        }), 400

    if not g.current_user.check_password(current_password):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Current password does not match our records.",
        }), 400

    if len(new_password) < 8:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "New password must be at least 8 characters long.",
        }), 400

    try:
        g.current_user.set_password(new_password)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Password updated successfully.",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/me", methods=["GET"])
@jwt_required
def get_current_user():
    """Retrieve full profile and preferences for the currently authenticated user."""
    return jsonify({
        "success": True,
        "user": g.current_user.to_dict(include_profile=True),
    }), 200


@auth_bp.route("/deactivate", methods=["POST"])
@jwt_required
def deactivate_account():
    """Deactivate user account and revoke all sessions."""
    try:
        g.current_user.is_active = False
        RefreshToken.query.filter_by(user_id=g.current_user_id, is_revoked=False).update({"is_revoked": True})
        UserSession.query.filter_by(user_id=g.current_user_id, is_revoked=False).update({"is_revoked": True})
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Account has been deactivated and all active sessions revoked.",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e


@auth_bp.route("/activate", methods=["POST"])
def activate_account():
    """Reactivate a previously deactivated user account."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Email and password are required.",
        }), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Invalid email or password.",
        }), 401

    try:
        user.is_active = True
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Account has been reactivated successfully. You can now log in.",
        }), 200

    except Exception as e:
        db.session.rollback()
        raise e
