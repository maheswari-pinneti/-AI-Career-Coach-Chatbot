from datetime import datetime, timezone
from app.extensions import db


class CareerMetric(db.Model):
    """Persisted career performance metrics for a user."""

    __tablename__ = "career_metrics"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    readiness_score = db.Column(db.Float, default=0.0, nullable=False)
    resume_score = db.Column(db.Float, default=0.0, nullable=False)
    linkedin_score = db.Column(db.Float, default=0.0, nullable=False)
    interview_score = db.Column(db.Float, default=0.0, nullable=False)
    skills_score = db.Column(db.Float, default=0.0, nullable=False)
    roadmap_score = db.Column(db.Float, default=0.0, nullable=False)
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

    user = db.relationship("User", backref=db.backref("metrics", uselist=False, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        """Serialize career metrics."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "readiness_score": round(self.readiness_score, 1),
            "resume_score": round(self.resume_score, 1),
            "linkedin_score": round(self.linkedin_score, 1),
            "interview_score": round(self.interview_score, 1),
            "skills_score": round(self.skills_score, 1),
            "roadmap_score": round(self.roadmap_score, 1),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:
        return f"<CareerMetric user_id={self.user_id} readiness={self.readiness_score}>"


class JobApplication(db.Model):
    """Persisted job application tracking for conversion rate and pipeline analytics."""

    __tablename__ = "job_applications"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(150), nullable=False)
    job_description = db.Column(db.Text, nullable=True)
    job_url = db.Column(db.String(500), nullable=True)
    location = db.Column(db.String(150), nullable=True)
    employment_type = db.Column(db.String(50), default="Full-time", nullable=False)  # 'Full-time', 'Contract', 'Remote', 'Hybrid'
    salary_range = db.Column(db.String(100), nullable=True)
    status = db.Column(
        db.String(50),
        default="applied",
        nullable=False,
    )  # 'interested', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn'
    applied_date = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    interview_date = db.Column(db.DateTime, nullable=True)
    follow_up_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
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

    user = db.relationship("User", backref=db.backref("job_applications", lazy="dynamic", cascade="all, delete-orphan"))
    status_history = db.relationship(
        "JobStatusHistory",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="JobStatusHistory.created_at.desc()",
    )

    def to_dict(self, include_history: bool = False) -> dict:
        """Serialize job application."""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "company": self.company,
            "role": self.role,
            "job_description": self.job_description,
            "job_url": self.job_url,
            "location": self.location,
            "employment_type": self.employment_type,
            "salary_range": self.salary_range,
            "status": self.status,
            "applied_date": self.applied_date.isoformat() if self.applied_date else None,
            "interview_date": self.interview_date.isoformat() if self.interview_date else None,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_history:
            data["status_history"] = [h.to_dict() for h in self.status_history]
        return data

    def __repr__(self) -> str:
        return f"<JobApplication id={self.id} company={self.company} status={self.status}>"


class JobStatusHistory(db.Model):
    """Audit log of status changes for a job application."""

    __tablename__ = "job_status_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(
        db.Integer,
        db.ForeignKey("job_applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_status = db.Column(db.String(50), nullable=True)
    to_status = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    application = db.relationship("JobApplication", back_populates="status_history")

    def to_dict(self) -> dict:
        """Serialize status transition."""
        return {
            "id": self.id,
            "application_id": self.application_id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<JobStatusHistory app={self.application_id} {self.from_status} -> {self.to_status}>"


class UserActivity(db.Model):
    """Persisted user career activity telemetry for timeline and recent activity feeds."""

    __tablename__ = "user_activities"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    activity_type = db.Column(db.String(50), nullable=False)  # 'resume_analysis', 'mock_interview', 'roadmap_step', 'job_applied', 'chat_consultation'
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    score_impact = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = db.relationship("User", backref=db.backref("activities", lazy="dynamic", cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        """Serialize user activity."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "activity_type": self.activity_type,
            "title": self.title,
            "description": self.description,
            "score_impact": self.score_impact,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<UserActivity id={self.id} user={self.user_id} type={self.activity_type}>"
