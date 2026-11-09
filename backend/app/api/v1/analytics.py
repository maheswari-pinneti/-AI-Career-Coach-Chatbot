from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.dashboard import CareerMetric, JobApplication, UserActivity
from app.models.roadmap import LearningRoadmap
from app.models.profile import UserProfile
from app.auth.decorators import jwt_required

analytics_bp = Blueprint("analytics", __name__, url_prefix="/analytics")


@analytics_bp.route("/overview", methods=["GET"])
@jwt_required
def get_analytics_overview():
    """Aggregate actual persisted data across all modules for charts, trends, and conversion funnels."""
    user_id = g.current_user_id
    days_param = request.args.get("days", "30").strip().lower()

    if days_param == "7":
        since_date = datetime.now(timezone.utc) - timedelta(days=7)
    elif days_param == "90":
        since_date = datetime.now(timezone.utc) - timedelta(days=90)
    elif days_param == "all":
        since_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    else:
        since_date = datetime.now(timezone.utc) - timedelta(days=30)

    # 1. Job application distribution
    all_jobs = JobApplication.query.filter_by(user_id=user_id).all()
    status_counts = {
        "interested": 0,
        "applied": 0,
        "assessment": 0,
        "interview": 0,
        "offer": 0,
        "rejected": 0,
        "withdrawn": 0,
    }
    for job in all_jobs:
        if job.status in status_counts:
            status_counts[job.status] += 1
        else:
            status_counts["applied"] += 1

    total_jobs = len(all_jobs)
    interviews = status_counts["interview"] + status_counts["offer"]
    conversion_rate = round((interviews / total_jobs * 100), 1) if total_jobs > 0 else 0.0

    # 2. Roadmap progress
    roadmaps = LearningRoadmap.query.filter_by(user_id=user_id).all()
    avg_roadmap_progress = (
        round(sum(r.completion_pct for r in roadmaps) / len(roadmaps), 1) if roadmaps else 0.0
    )

    # 3. User skills from profile
    profile = UserProfile.query.filter_by(user_id=user_id).first()
    skills_list = profile.current_skills if profile and profile.current_skills else []

    # 4. Career metrics
    metric_record = CareerMetric.query.filter_by(user_id=user_id).first()
    metrics = {
        "readiness_score": metric_record.readiness_score if metric_record else 0.0,
        "resume_score": metric_record.resume_score if metric_record else 0.0,
        "linkedin_score": metric_record.linkedin_score if metric_record else 0.0,
        "interview_score": metric_record.interview_score if metric_record else 0.0,
        "skills_score": metric_record.skills_score if metric_record else 0.0,
        "roadmap_score": metric_record.roadmap_score if metric_record else 0.0,
    }

    # 5. Activity counts
    activities_count = UserActivity.query.filter(
        UserActivity.user_id == user_id,
        UserActivity.created_at >= since_date,
    ).count()

    # 6. Status distribution formatted for Recharts Pie/Bar
    status_distribution = [
        {"name": "Interested", "value": status_counts["interested"], "color": "#94a3b8"},
        {"name": "Applied", "value": status_counts["applied"], "color": "#0ea5e9"},
        {"name": "Assessment", "value": status_counts["assessment"], "color": "#8b5cf6"},
        {"name": "Interview", "value": status_counts["interview"], "color": "#f59e0b"},
        {"name": "Offer", "value": status_counts["offer"], "color": "#10b981"},
        {"name": "Rejected", "value": status_counts["rejected"], "color": "#ef4444"},
        {"name": "Withdrawn", "value": status_counts["withdrawn"], "color": "#64748b"},
    ]

    return jsonify({
        "success": True,
        "total_jobs": total_jobs,
        "conversion_rate": conversion_rate,
        "avg_roadmap_progress": avg_roadmap_progress,
        "skills_count": len(skills_list),
        "activities_count": activities_count,
        "metrics": metrics,
        "status_distribution": status_distribution,
        "skills_list": skills_list,
    }), 200


@analytics_bp.route("/export", methods=["GET"])
@jwt_required
def export_analytics_data():
    """Export complete persisted user career telemetry dataset as JSON."""
    user_id = g.current_user_id

    jobs = JobApplication.query.filter_by(user_id=user_id).all()
    roadmaps = LearningRoadmap.query.filter_by(user_id=user_id).all()
    activities = UserActivity.query.filter_by(user_id=user_id).all()
    metrics = CareerMetric.query.filter_by(user_id=user_id).first()
    profile = UserProfile.query.filter_by(user_id=user_id).first()

    export_payload = {
        "export_timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "profile": profile.to_dict() if profile else None,
        "metrics": metrics.to_dict() if metrics else None,
        "job_applications": [j.to_dict(include_history=True) for j in jobs],
        "roadmaps": [r.to_dict(include_details=True) for r in roadmaps],
        "activities": [a.to_dict() for a in activities],
    }

    return jsonify({
        "success": True,
        "data": export_payload,
    }), 200
