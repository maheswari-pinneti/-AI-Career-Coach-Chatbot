from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.dashboard import JobApplication, JobStatusHistory, UserActivity
from app.models.notification import Notification
from app.auth.decorators import jwt_required

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")

VALID_STATUSES = [
    "interested",
    "applied",
    "assessment",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
]


@jobs_bp.route("", methods=["GET"])
@jwt_required
def get_jobs():
    """Retrieve filtered, searched, and paginated job applications."""
    query = JobApplication.query.filter_by(user_id=g.current_user_id)

    # Search filter
    search = (request.args.get("search") or "").strip()
    if search:
        query = query.filter(
            (JobApplication.company.ilike(f"%{search}%")) | (JobApplication.role.ilike(f"%{search}%"))
        )

    # Status filter
    status = (request.args.get("status") or "").strip().lower()
    if status and status in VALID_STATUSES:
        query = query.filter_by(status=status)

    # Sorting
    sort_by = (request.args.get("sort_by") or "date_desc").strip()
    if sort_by == "company_asc":
        query = query.order_by(JobApplication.company.asc())
    elif sort_by == "company_desc":
        query = query.order_by(JobApplication.company.desc())
    elif sort_by == "date_asc":
        query = query.order_by(JobApplication.applied_date.asc())
    else:
        query = query.order_by(JobApplication.applied_date.desc())

    # Pagination
    page = max(1, request.args.get("page", 1, type=int))
    per_page = min(50, max(1, request.args.get("per_page", 10, type=int)))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "success": True,
        "jobs": [j.to_dict() for j in paginated.items],
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages,
    }), 200


@jobs_bp.route("/kanban", methods=["GET"])
@jwt_required
def get_jobs_kanban():
    """Retrieve job applications categorized by pipeline statuses for Kanban board view."""
    all_jobs = (
        JobApplication.query.filter_by(user_id=g.current_user_id)
        .order_by(JobApplication.applied_date.desc())
        .all()
    )

    kanban: dict = {s: [] for s in VALID_STATUSES}
    for job in all_jobs:
        if job.status in kanban:
            kanban[job.status].append(job.to_dict())
        else:
            kanban["interested"].append(job.to_dict())

    return jsonify({
        "success": True,
        "kanban": kanban,
        "total": len(all_jobs),
    }), 200


@jobs_bp.route("", methods=["POST"])
@jwt_required
def create_job():
    """Create a new tracked job application."""
    data = request.get_json(silent=True) or {}
    company = (data.get("company") or "").strip()
    role = (data.get("role") or "").strip()
    status = (data.get("status") or "applied").strip().lower()

    if not company or not role:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Company name and job role title are required.",
        }), 400

    if status not in VALID_STATUSES:
        status = "applied"

    job = JobApplication(
        user_id=g.current_user_id,
        company=company,
        role=role,
        job_description=(data.get("job_description") or "").strip() or None,
        job_url=(data.get("job_url") or "").strip() or None,
        location=(data.get("location") or "").strip() or None,
        employment_type=(data.get("employment_type") or "Full-time").strip(),
        salary_range=(data.get("salary_range") or "").strip() or None,
        status=status,
        notes=(data.get("notes") or "").strip() or None,
    )
    db.session.add(job)
    db.session.flush()

    # Initial status transition history
    history = JobStatusHistory(
        application_id=job.id,
        from_status=None,
        to_status=status,
        notes="Application tracked in career dashboard.",
    )
    db.session.add(history)

    # Activity log
    activity = UserActivity(
        user_id=g.current_user_id,
        activity_type="job_applied",
        title=f"Applied to {company}",
        description=f"Role: {role} ({status})",
        score_impact=1.0,
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Job application tracked successfully.",
        "job": job.to_dict(include_history=True),
    }), 201


@jobs_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required
def get_job_details(job_id: int):
    """Retrieve job application details and full audit history."""
    job = db.session.get(JobApplication, job_id)
    if not job:
        return jsonify({"success": False, "error": "Not Found", "message": "Job application not found."}), 404

    if job.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    return jsonify({
        "success": True,
        "job": job.to_dict(include_history=True),
    }), 200


@jobs_bp.route("/<int:job_id>", methods=["PUT"])
@jwt_required
def update_job(job_id: int):
    """Update job application fields."""
    job = db.session.get(JobApplication, job_id)
    if not job:
        return jsonify({"success": False, "error": "Not Found", "message": "Job application not found."}), 404

    if job.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    if "company" in data:
        job.company = (data.get("company") or "").strip()
    if "role" in data:
        job.role = (data.get("role") or "").strip()
    if "job_description" in data:
        job.job_description = data.get("job_description")
    if "job_url" in data:
        job.job_url = data.get("job_url")
    if "location" in data:
        job.location = data.get("location")
    if "employment_type" in data:
        job.employment_type = data.get("employment_type")
    if "salary_range" in data:
        job.salary_range = data.get("salary_range")
    if "notes" in data:
        job.notes = data.get("notes")

    job.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Job details updated successfully.",
        "job": job.to_dict(include_history=True),
    }), 200


@jobs_bp.route("/<int:job_id>/status", methods=["PATCH"])
@jwt_required
def update_job_status(job_id: int):
    """Transition job application status and record audit log."""
    job = db.session.get(JobApplication, job_id)
    if not job:
        return jsonify({"success": False, "error": "Not Found", "message": "Job application not found."}), 404

    if job.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip().lower()
    notes = (data.get("notes") or "").strip() or None

    if new_status not in VALID_STATUSES:
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
        }), 400

    old_status = job.status
    if old_status != new_status:
        job.status = new_status
        job.updated_at = datetime.now(timezone.utc)

        # Record history transition
        history = JobStatusHistory(
            application_id=job.id,
            from_status=old_status,
            to_status=new_status,
            notes=notes,
        )
        db.session.add(history)

        # Trigger in-app notification for interviews or offers
        if new_status in ["interview", "offer"]:
            notif = Notification(
                user_id=g.current_user_id,
                type="interview" if new_status == "interview" else "system",
                title=f"Stage Advanced: {job.company} ({new_status.capitalize()})",
                message=f"Your application for {job.role} moved from {old_status} to {new_status}!",
                link="/jobs",
            )
            db.session.add(notif)

        db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Status updated to '{new_status}'.",
        "job": job.to_dict(include_history=True),
    }), 200


@jobs_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required
def delete_job(job_id: int):
    """Delete a tracked job application."""
    job = db.session.get(JobApplication, job_id)
    if not job:
        return jsonify({"success": False, "error": "Not Found", "message": "Job application not found."}), 404

    if job.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    db.session.delete(job)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Job application deleted.",
        "job_id": job_id,
    }), 200
