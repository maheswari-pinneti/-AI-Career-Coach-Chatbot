from datetime import datetime, timezone
from app.extensions import db


class AIUsageLog(db.Model):
    """Audit and telemetry log for AI inference requests (privacy-safe: zero private prompt retention)."""

    __tablename__ = "ai_usage_logs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id = db.Column(
        db.Integer,
        db.ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    provider = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    prompt_tokens = db.Column(db.Integer, default=0, nullable=False)
    completion_tokens = db.Column(db.Integer, default=0, nullable=False)
    total_tokens = db.Column(db.Integer, default=0, nullable=False)
    latency_ms = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="success")  # 'success', 'error'
    error_category = db.Column(db.String(50), nullable=True)  # 'rate_limit', 'timeout', 'auth_error', 'api_error'
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    def to_dict(self) -> dict:
        """Serialize usage log."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "conversation_id": self.conversation_id,
            "provider": self.provider,
            "model": self.model,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "latency_ms": self.latency_ms,
            "status": self.status,
            "error_category": self.error_category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<AIUsageLog id={self.id} user={self.user_id} provider={self.provider} status={self.status}>"
