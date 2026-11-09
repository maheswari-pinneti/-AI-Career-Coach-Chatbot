from datetime import datetime, timezone
from app.extensions import db


class UserPreference(db.Model):
    """User account settings and UI preferences."""

    __tablename__ = "user_preferences"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    theme = db.Column(db.String(20), default="light", nullable=False)
    email_notifications = db.Column(db.Boolean, default=True, nullable=False)
    ai_provider = db.Column(db.String(50), default="mock", nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = db.relationship("User", back_populates="preferences")

    def to_dict(self) -> dict:
        """Serialize preferences to dictionary."""
        return {
            "id": self.id,
            "theme": self.theme,
            "email_notifications": self.email_notifications,
            "ai_provider": self.ai_provider,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<UserPreference id={self.id} user_id={self.user_id} theme={self.theme}>"
