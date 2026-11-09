from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.profile import UserProfile
from app.models.preference import UserPreference
from app.auth.decorators import jwt_required

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")


@profile_bp.route("", methods=["GET"])
@jwt_required
def get_profile():
    """Retrieve the authenticated user's profile and basic account details."""
    user = g.current_user
    if not user.profile:
        # Guarantee profile existence
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()
    else:
        profile = user.profile

    preferences = user.preferences
    if not preferences:
        preferences = UserPreference(user_id=user.id)
        db.session.add(preferences)
        db.session.commit()

    return jsonify({
        "success": True,
        "user": user.to_dict(include_profile=True),
        "profile": profile.to_dict(),
        "preferences": preferences.to_dict() if preferences else None,
    }), 200


@profile_bp.route("", methods=["PUT"])
@jwt_required
def update_profile():
    """Update profile and user demographic details."""
    user = g.current_user
    data = request.get_json(silent=True) or {}

    if not user.profile:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)
    else:
        profile = user.profile

    # Update basic user fields if supplied
    if "first_name" in data:
        user.first_name = (data.get("first_name") or "").strip() or None
    if "last_name" in data:
        user.last_name = (data.get("last_name") or "").strip() or None

    # Update profile fields
    if "profile_image" in data:
        profile.profile_image = data.get("profile_image")
    if "current_designation" in data:
        profile.current_designation = data.get("current_designation")
    if "current_company" in data:
        profile.current_company = data.get("current_company")
    if "total_experience" in data:
        try:
            profile.total_experience = max(0.0, float(data.get("total_experience") or 0.0))
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "error": "Bad Request",
                "message": "total_experience must be a valid number.",
            }), 400
    if "current_skills" in data:
        skills = data.get("current_skills")
        if isinstance(skills, list):
            profile.current_skills = skills
        elif isinstance(skills, str):
            profile.current_skills = [s.strip() for s in skills.split(",") if s.strip()]
    if "target_role" in data:
        profile.target_role = data.get("target_role")
    if "career_objectives" in data:
        profile.career_objectives = data.get("career_objectives")
    if "education" in data:
        edu = data.get("education")
        if isinstance(edu, list):
            profile.education = edu
    if "location" in data:
        profile.location = data.get("location")
    if "portfolio_url" in data:
        profile.portfolio_url = data.get("portfolio_url")
    if "github_url" in data:
        profile.github_url = data.get("github_url")
    if "linkedin_url" in data:
        profile.linkedin_url = data.get("linkedin_url")

    profile.updated_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "user": user.to_dict(include_profile=True),
            "profile": profile.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        raise e


@profile_bp.route("/preferences", methods=["GET"])
@jwt_required
def get_preferences():
    """Retrieve user UI & system preferences."""
    user = g.current_user
    prefs = user.preferences
    if not prefs:
        prefs = UserPreference(user_id=user.id)
        db.session.add(prefs)
        db.session.commit()

    return jsonify({
        "success": True,
        "preferences": prefs.to_dict(),
    }), 200


@profile_bp.route("/preferences", methods=["PUT"])
@jwt_required
def update_preferences():
    """Update user UI theme, notifications, or AI settings."""
    user = g.current_user
    data = request.get_json(silent=True) or {}

    prefs = user.preferences
    if not prefs:
        prefs = UserPreference(user_id=user.id)
        db.session.add(prefs)

    if "theme" in data and data["theme"] in ["light", "dark", "system"]:
        prefs.theme = data["theme"]
    if "email_notifications" in data:
        prefs.email_notifications = bool(data["email_notifications"])
    if "ai_provider" in data:
        prefs.ai_provider = str(data["ai_provider"]).strip()

    prefs.updated_at = datetime.now(timezone.utc)

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Preferences updated successfully.",
            "preferences": prefs.to_dict(),
        }), 200
    except Exception as e:
        db.session.rollback()
        raise e
