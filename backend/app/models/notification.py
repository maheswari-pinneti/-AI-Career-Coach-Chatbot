from datetime import datetime, timezone
from app.extensions import db


class Notification(db.Model):
    """In-app notifications for milestone achievements, reminders, and career updates."""

    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = db.Column(db.String(50), nullable=False)  # 'learning', 'interview', 'job_followup', 'roadmap_milestone', 'system'
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(255), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = db.relationship("User", backref=db.backref("notifications", lazy="dynamic", cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        """Serialize notification."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<Notification id={self.id} user={self.user_id} read={self.is_read}>"


class NotificationPreference(db.Model):
    """Granular user preferences for reminders and alert categories."""

    __tablename__ = "notification_preferences"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    email_alerts = db.Column(db.Boolean, default=True, nullable=False)
    in_app_alerts = db.Column(db.Boolean, default=True, nullable=False)
    learning_reminders = db.Column(db.Boolean, default=True, nullable=False)
    interview_reminders = db.Column(db.Boolean, default=True, nullable=False)
    job_followup_reminders = db.Column(db.Boolean, default=True, nullable=False)

    user = db.relationship("User", backref=db.backref("notification_preferences", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        """Serialize notification preferences."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "email_alerts": self.email_alerts,
            "in_app_alerts": self.in_app_alerts,
            "learning_reminders": self.learning_reminders,
            "interview_reminders": self.interview_reminders,
            "job_followup_reminders": self.job_followup_reminders,
        }

    def __repr__(self) -> str:
        return f"<NotificationPreference user={self.user_id}>"
