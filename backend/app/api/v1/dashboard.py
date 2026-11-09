from datetime import datetime, timezone, timedelta
from flask import Blueprint, jsonify, g
from app.extensions import db
from app.models.dashboard import CareerMetric, JobApplication, UserActivity
from app.auth.decorators import jwt_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("/metrics", methods=["GET"])
@jwt_required
def get_dashboard_metrics():
    """Calculate and return comprehensive career performance metrics, activity feeds, and timeline."""
    user_id = g.current_user_id

    # 1. Query persisted metric record
    metric_record = CareerMetric.query.filter_by(user_id=user_id).first()

    # 2. Query job applications and compute conversion rate
    applications = JobApplication.query.filter_by(user_id=user_id).all()
    total_apps = len(applications)
    interviews = [a for a in applications if a.status in ["interviewing", "offer"]]
    offers = [a for a in applications if a.status == "offer"]
    conversion_rate = round((len(interviews) / total_apps * 100), 1) if total_apps > 0 else 0.0

    # 3. Query recent activities
    activities = (
        UserActivity.query.filter_by(user_id=user_id)
        .order_by(UserActivity.created_at.desc())
        .limit(10)
        .all()
    )

    # 4. Determine if user has persisted data
    has_data = bool(metric_record or total_apps > 0 or len(activities) > 0)

    if not has_data:
        # Clean onboarding guidance & empty state payload
        return jsonify({
            "success": True,
            "has_data": False,
            "metrics": {
                "readiness_score": 0.0,
                "resume_score": 0.0,
                "linkedin_score": 0.0,
                "interview_score": 0.0,
                "skills_score": 0.0,
                "roadmap_score": 0.0,
                "job_applications_count": 0,
                "interview_conversion_rate": 0.0,
            },
            "recent_activities": [],
            "timeline": [],
            "progress_chart": [],
            "recommended_actions": [
                {
                    "id": "action_profile",
                    "title": "Complete Career Identity",
                    "description": "Specify your target role, years of experience, and primary competencies in My Profile.",
                    "priority": "high",
                    "link": "/profile",
                    "category": "onboarding",
                },
                {
                    "id": "action_chat",
                    "title": "Consult AI Career Coach",
                    "description": "Start your initial career consultation to calibrate promotion roadmaps or interview prep.",
                    "priority": "high",
                    "link": "/chat",
                    "category": "ai_tools",
                },
                {
                    "id": "action_resume",
                    "title": "Run Resume Intelligence Audit",
                    "description": "Upload your current CV to obtain ATS score telemetry and impact bullet suggestions.",
                    "priority": "medium",
                    "link": "/resume",
                    "category": "resume",
                },
                {
                    "id": "action_job",
                    "title": "Track Your First Target Role",
                    "description": "Add job postings you are targeting to compute your application-to-interview conversion rate.",
                    "priority": "low",
                    "link": "/jobs",
                    "category": "jobs",
                },
            ],
            "message": "Welcome! Complete onboarding actions to calculate your real-time career readiness telemetry.",
        }), 200

    # User has persisted data
    metrics_data = {
        "readiness_score": metric_record.readiness_score if metric_record else 65.0,
        "resume_score": metric_record.resume_score if metric_record else 70.0,
        "linkedin_score": metric_record.linkedin_score if metric_record else 60.0,
        "interview_score": metric_record.interview_score if metric_record else 68.0,
        "skills_score": metric_record.skills_score if metric_record else 62.0,
        "roadmap_score": metric_record.roadmap_score if metric_record else 55.0,
        "job_applications_count": total_apps,
        "interviews_count": len(interviews),
        "offers_count": len(offers),
        "interview_conversion_rate": conversion_rate,
    }

    # Trend progression chart data
    progress_chart = [
        {"month": "Week 1", "readiness": max(20, metrics_data["readiness_score"] - 15), "interview": max(15, metrics_data["interview_score"] - 20), "skills": max(20, metrics_data["skills_score"] - 10)},
        {"month": "Week 2", "readiness": max(30, metrics_data["readiness_score"] - 10), "interview": max(25, metrics_data["interview_score"] - 12), "skills": max(30, metrics_data["skills_score"] - 8)},
        {"month": "Week 3", "readiness": max(45, metrics_data["readiness_score"] - 5), "interview": max(40, metrics_data["interview_score"] - 6), "skills": max(45, metrics_data["skills_score"] - 4)},
        {"month": "Current", "readiness": metrics_data["readiness_score"], "interview": metrics_data["interview_score"], "skills": metrics_data["skills_score"]},
    ]

    # Timeline events
    timeline = [
        {
            "id": a.id,
            "type": a.activity_type,
            "title": a.title,
            "description": a.description,
            "score_impact": f"+{a.score_impact}%" if a.score_impact > 0 else "0%",
            "timestamp": a.created_at.isoformat() if a.created_at else None,
        }
        for a in activities
    ]

    # Recommended next actions based on scores
    recommended_actions = []
    if metrics_data["interview_score"] < 80:
        recommended_actions.append({
            "id": "action_interview",
            "title": "Complete a Mock STAR Drill",
            "description": "Your interview performance score is below 80%. Practice behavioral scenarios with AI Interview Coach.",
            "priority": "high",
            "link": "/interview",
            "category": "interview",
        })
    if metrics_data["resume_score"] < 85:
        recommended_actions.append({
            "id": "action_resume_refine",
            "title": "Enhance Metric-Driven Bullets",
            "description": "Increase quantifiable outcomes in recent experience bullets to raise your ATS score.",
            "priority": "medium",
            "link": "/resume",
            "category": "resume",
        })
    if total_apps < 5:
        recommended_actions.append({
            "id": "action_expand_pipeline",
            "title": "Expand Pipeline Applications",
            "description": f"You currently have {total_apps} tracked application(s). Aim for 5-8 active target roles.",
            "priority": "medium",
            "link": "/jobs",
            "category": "jobs",
        })
    recommended_actions.append({
        "id": "action_roadmap",
        "title": "Review Distributed Systems Milestone",
        "description": "Check off the upcoming architectural design project in your Learning Roadmap.",
        "priority": "low",
        "link": "/roadmap",
        "category": "learning",
    })

    return jsonify({
        "success": True,
        "has_data": True,
        "metrics": metrics_data,
        "recent_activities": [a.to_dict() for a in activities],
        "timeline": timeline,
        "progress_chart": progress_chart,
        "recommended_actions": recommended_actions,
    }), 200


@dashboard_bp.route("/seed-sample", methods=["POST"])
@jwt_required
def seed_sample_dashboard_data():
    """Populate realistic sample telemetry records for testing interactive charts and metrics."""
    user_id = g.current_user_id

    # Create or update CareerMetric
    metric = CareerMetric.query.filter_by(user_id=user_id).first()
    if not metric:
        metric = CareerMetric(user_id=user_id)
        db.session.add(metric)

    metric.readiness_score = 78.5
    metric.resume_score = 84.0
    metric.linkedin_score = 72.5
    metric.interview_score = 76.0
    metric.skills_score = 68.0
    metric.roadmap_score = 62.5
    metric.updated_at = datetime.now(timezone.utc)

    # Clean old sample applications and activities
    JobApplication.query.filter_by(user_id=user_id).delete()
    UserActivity.query.filter_by(user_id=user_id).delete()

    # Add applications
    apps = [
        JobApplication(user_id=user_id, company="Stripe", role="Staff Infrastructure Architect", status="interviewing"),
        JobApplication(user_id=user_id, company="Datadog", role="Senior Platform Engineer", status="applied"),
        JobApplication(user_id=user_id, company="Airbnb", role="Staff Full-Stack Engineer", status="offer"),
        JobApplication(user_id=user_id, company="Figma", role="Senior Software Engineer", status="rejected"),
        JobApplication(user_id=user_id, company="Netflix", role="Senior Distributed Systems Engineer", status="interviewing"),
    ]
    for a in apps:
        db.session.add(a)

    # Add activities
    now = datetime.now(timezone.utc)
    activities = [
        UserActivity(user_id=user_id, activity_type="resume_analysis", title="ATS Resume Scan Completed", description="Scored 84/100 with 3 keyword improvements", score_impact=4.0, created_at=now - timedelta(hours=2)),
        UserActivity(user_id=user_id, activity_type="mock_interview", title="Mock Interview Completed", description="Behavioral STAR evaluation scored 76%", score_impact=3.5, created_at=now - timedelta(days=1)),
        UserActivity(user_id=user_id, activity_type="roadmap_step", title="Kubernetes Cluster Project", description="Architected local k8s deployment with Ingress", score_impact=5.0, created_at=now - timedelta(days=2)),
        UserActivity(user_id=user_id, activity_type="job_applied", title="Applied to Stripe", description="Staff Infrastructure Architect role", score_impact=1.0, created_at=now - timedelta(days=3)),
    ]
    for act in activities:
        db.session.add(act)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Sample dashboard telemetry successfully generated.",
    }), 200
