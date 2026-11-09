from datetime import datetime, timezone
from app.extensions import db


class UserProfile(db.Model):
    """Extended professional profile model for career planning."""

    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    profile_image = db.Column(db.String(500), nullable=True)
    current_designation = db.Column(db.String(150), nullable=True)
    current_company = db.Column(db.String(150), nullable=True)
    total_experience = db.Column(db.Float, default=0.0, nullable=False)
    current_skills = db.Column(db.JSON, default=list, nullable=False)
    target_role = db.Column(db.String(150), nullable=True)
    career_objectives = db.Column(db.Text, nullable=True)
    education = db.Column(db.JSON, default=list, nullable=False)
    location = db.Column(db.String(150), nullable=True)
    portfolio_url = db.Column(db.String(255), nullable=True)
    github_url = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(255), nullable=True)
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

    user = db.relationship("User", back_populates="profile")

    def to_dict(self) -> dict:
        """Serialize user profile to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "profile_image": self.profile_image,
            "current_designation": self.current_designation,
            "current_company": self.current_company,
            "total_experience": self.total_experience,
            "current_skills": self.current_skills or [],
            "target_role": self.target_role,
            "career_objectives": self.career_objectives,
            "education": self.education or [],
            "location": self.location,
            "portfolio_url": self.portfolio_url,
            "github_url": self.github_url,
            "linkedin_url": self.linkedin_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<UserProfile id={self.id} user_id={self.user_id}>"
