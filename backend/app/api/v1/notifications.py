from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.notification import Notification, NotificationPreference
from app.auth.decorators import jwt_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


@notifications_bp.route("", methods=["GET"])
@jwt_required
def get_notifications():
    """Retrieve user notifications and unread counter."""
    user_id = g.current_user_id
    notifications = (
        Notification.query.filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        "success": True,
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    }), 200


@notifications_bp.route("/<int:notif_id>/read", methods=["PATCH"])
@jwt_required
def mark_notification_read(notif_id: int):
    """Mark single notification as read."""
    notif = db.session.get(Notification, notif_id)
    if not notif:
        return jsonify({"success": False, "error": "Not Found", "message": "Notification not found."}), 404

    if notif.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    notif.is_read = True
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Notification marked as read.",
        "notification_id": notif_id,
    }), 200


@notifications_bp.route("/read-all", methods=["POST"])
@jwt_required
def mark_all_notifications_read():
    """Mark all unread notifications as read for current user."""
    user_id = g.current_user_id
    unread_notifs = Notification.query.filter_by(user_id=user_id, is_read=False).all()
    for n in unread_notifs:
        n.is_read = True

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Marked {len(unread_notifs)} notification(s) as read.",
    }), 200


@notifications_bp.route("/preferences", methods=["GET"])
@jwt_required
def get_notification_preferences():
    """Retrieve user notification preferences."""
    user_id = g.current_user_id
    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)
        db.session.commit()

    return jsonify({
        "success": True,
        "preferences": prefs.to_dict(),
    }), 200


@notifications_bp.route("/preferences", methods=["PUT"])
@jwt_required
def update_notification_preferences():
    """Update notification preferences."""
    user_id = g.current_user_id
    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)

    data = request.get_json(silent=True) or {}
    if "email_alerts" in data:
        prefs.email_alerts = bool(data["email_alerts"])
    if "in_app_alerts" in data:
        prefs.in_app_alerts = bool(data["in_app_alerts"])
    if "learning_reminders" in data:
        prefs.learning_reminders = bool(data["learning_reminders"])
    if "interview_reminders" in data:
        prefs.interview_reminders = bool(data["interview_reminders"])
    if "job_followup_reminders" in data:
        prefs.job_followup_reminders = bool(data["job_followup_reminders"])

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Notification preferences updated.",
        "preferences": prefs.to_dict(),
    }), 200
