from datetime import datetime, timezone
from app.extensions import db


class LearningRoadmap(db.Model):
    """Personalized learning roadmap generated for career goals and target roles."""

    __tablename__ = "learning_roadmaps"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(255), nullable=False)
    target_role = db.Column(db.String(150), nullable=False)
    estimated_weeks = db.Column(db.Integer, default=12, nullable=False)
    weekly_hours = db.Column(db.Integer, default=10, nullable=False)
    completion_pct = db.Column(db.Float, default=0.0, nullable=False)
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

    user = db.relationship("User", backref=db.backref("roadmaps", lazy="dynamic", cascade="all, delete-orphan"))
    milestones = db.relationship(
        "RoadmapMilestone",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapMilestone.week_number.asc()",
    )
    resources = db.relationship(
        "LearningResource",
        back_populates="roadmap",
        cascade="all, delete-orphan",
    )

    def calculate_progress(self) -> float:
        """Recalculate percentage based on milestone completion."""
        if not self.milestones:
            self.completion_pct = 0.0
            return 0.0
        completed = sum(1 for m in self.milestones if m.is_completed)
        self.completion_pct = round((completed / len(self.milestones)) * 100, 1)
        return self.completion_pct

    def to_dict(self, include_details: bool = False) -> dict:
        """Serialize learning roadmap."""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "target_role": self.target_role,
            "estimated_weeks": self.estimated_weeks,
            "weekly_hours": self.weekly_hours,
            "completion_pct": self.completion_pct,
            "milestone_count": len(self.milestones) if self.milestones else 0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_details:
            data["milestones"] = [m.to_dict() for m in self.milestones]
            data["resources"] = [r.to_dict() for r in self.resources]
        return data

    def __repr__(self) -> str:
        return f"<LearningRoadmap id={self.id} role={self.target_role} progress={self.completion_pct}%>"


class RoadmapMilestone(db.Model):
    """Weekly or thematic milestone within a learning roadmap."""

    __tablename__ = "roadmap_milestones"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_roadmaps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    week_number = db.Column(db.Integer, default=1, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    tasks = db.Column(db.JSON, default=list, nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    roadmap = db.relationship("LearningRoadmap", back_populates="milestones")

    def to_dict(self) -> dict:
        """Serialize milestone."""
        return {
            "id": self.id,
            "roadmap_id": self.roadmap_id,
            "title": self.title,
            "description": self.description,
            "week_number": self.week_number,
            "is_completed": self.is_completed,
            "tasks": self.tasks or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self) -> str:
        return f"<RoadmapMilestone id={self.id} roadmap={self.roadmap_id} completed={self.is_completed}>"


class LearningResource(db.Model):
    """Curated learning resource (documentation, book, course, practice project)."""

    __tablename__ = "learning_resources"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roadmap_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_roadmaps.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), default="General", nullable=False)
    url = db.Column(db.String(500), nullable=True)
    resource_type = db.Column(db.String(50), default="Documentation", nullable=False)  # 'Documentation', 'Tutorial', 'Video', 'Course', 'Book', 'Project'
    difficulty = db.Column(db.String(50), default="Intermediate", nullable=False)  # 'Beginner', 'Intermediate', 'Advanced'
    estimated_hours = db.Column(db.Float, default=4.0, nullable=False)

    roadmap = db.relationship("LearningRoadmap", back_populates="resources")

    def to_dict(self) -> dict:
        """Serialize learning resource."""
        return {
            "id": self.id,
            "roadmap_id": self.roadmap_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "url": self.url,
            "resource_type": self.resource_type,
            "difficulty": self.difficulty,
            "estimated_hours": self.estimated_hours,
        }

    def __repr__(self) -> str:
        return f"<LearningResource id={self.id} title={self.title[:20]}>"
