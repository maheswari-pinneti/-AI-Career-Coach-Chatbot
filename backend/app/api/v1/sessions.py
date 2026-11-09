from datetime import datetime, timezone
from flask import Blueprint, jsonify, g
from app.extensions import db
from app.models.session import UserSession
from app.auth.decorators import jwt_required

sessions_bp = Blueprint("sessions", __name__, url_prefix="/sessions")


@sessions_bp.route("", methods=["GET"])
@jwt_required
def get_user_sessions():
    """Retrieve all active and past sessions for the authenticated user."""
    sessions = (
        UserSession.query.filter_by(user_id=g.current_user_id)
        .order_by(UserSession.last_active.desc())
        .limit(20)
        .all()
    )
    return jsonify({
        "success": True,
        "sessions": [s.to_dict() for s in sessions],
        "count": len(sessions),
    }), 200


@sessions_bp.route("/<string:session_id>", methods=["DELETE"])
@jwt_required
def revoke_session(session_id: str):
    """Revoke a specific session belonging to the authenticated user."""
    session_record = UserSession.query.filter_by(session_id=session_id).first()

    if not session_record:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Session not found.",
        }), 404

    # IDOR check: ensure session belongs to authenticated user
    if session_record.user_id != g.current_user_id:
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You do not have permission to terminate this session.",
        }), 403

    session_record.is_revoked = True
    session_record.last_active = datetime.now(timezone.utc)

    try:
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Session revoked successfully.",
            "session_id": session_id,
        }), 200
    except Exception as e:
        db.session.rollback()
        raise e


@sessions_bp.route("/revoke-others", methods=["POST"])
@jwt_required
def revoke_other_sessions():
    """Revoke all other active sessions for this user."""
    try:
        active_sessions = UserSession.query.filter_by(
            user_id=g.current_user_id,
            is_revoked=False,
        ).all()

        for s in active_sessions:
            s.is_revoked = True

        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"Successfully revoked {len(active_sessions)} active sessions.",
        }), 200
    except Exception as e:
        db.session.rollback()
        raise e
