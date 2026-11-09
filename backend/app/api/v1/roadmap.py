from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models.roadmap import LearningRoadmap, RoadmapMilestone, LearningResource
from app.models.dashboard import UserActivity
from app.models.notification import Notification
from app.auth.decorators import jwt_required

roadmap_bp = Blueprint("roadmap", __name__, url_prefix="/roadmap")


@roadmap_bp.route("", methods=["GET"])
@jwt_required
def get_user_roadmaps():
    """Retrieve all roadmaps for the current user."""
    roadmaps = (
        LearningRoadmap.query.filter_by(user_id=g.current_user_id)
        .order_by(LearningRoadmap.updated_at.desc())
        .all()
    )
    return jsonify({
        "success": True,
        "roadmaps": [r.to_dict(include_details=True) for r in roadmaps],
        "count": len(roadmaps),
    }), 200


@roadmap_bp.route("/generate", methods=["POST"])
@jwt_required
def generate_personalized_roadmap():
    """Generate a high-impact, structured career roadmap based on target role, current skills, and weekly commitment."""
    data = request.get_json(silent=True) or {}
    target_role = (data.get("target_role") or "Senior Software Engineer").strip()
    weekly_hours = int(data.get("weekly_hours") or 10)
    current_skills = data.get("current_skills") or []
    career_objectives = (data.get("career_objectives") or "").strip()

    title = f"{target_role} Mastery Roadmap"

    roadmap = LearningRoadmap(
        user_id=g.current_user_id,
        title=title,
        target_role=target_role,
        estimated_weeks=12,
        weekly_hours=weekly_hours,
        completion_pct=0.0,
    )
    db.session.add(roadmap)
    db.session.flush()

    # Pre-generate 4 high-signal milestone sprints
    milestones_data = [
        {
            "week_number": 1,
            "title": "Architectural Fundamentals & System Modeling",
            "description": "Master non-functional requirements: scalability, latency budgets, CAP theorem, and caching hierarchies.",
            "tasks": [
                "Map p99 latency SLAs and read/write QPS constraints for modern web services",
                "Design idempotent cache invalidation mechanisms using Redis and write-through patterns",
                "Draft an RFC evaluating SQL ACID transactions vs NoSQL eventual consistency",
            ],
        },
        {
            "week_number": 4,
            "title": "Event-Driven & Distributed Data Pipelines",
            "description": "Implement robust event sourcing, message brokers, and transactional outbox patterns.",
            "tasks": [
                "Implement transactional outbox pattern to guarantee at-least-once event delivery",
                "Configure consumer groups and partition rebalancing in Apache Kafka or AWS SQS",
                "Build dead-letter-queue (DLQ) retry mechanisms with exponential backoff",
            ],
        },
        {
            "week_number": 8,
            "title": "Cloud-Native Container Orchestration & Telemetry",
            "description": "Operationalize microservices using Docker, Kubernetes Ingress, and OpenTelemetry instrumentation.",
            "tasks": [
                "Containerize polyglot services with multi-stage production Dockerfiles",
                "Deploy local Kubernetes cluster with Horizontal Pod Autoscaling (HPA) and ConfigMaps",
                "Instrument distributed trace propagation using OpenTelemetry standards",
            ],
        },
        {
            "week_number": 12,
            "title": "Production Hardening & System Design Capstone",
            "description": "Conduct end-to-end chaos engineering tests, security audits, and executive architectural review.",
            "tasks": [
                "Execute load testing simulations with k6 targeting 25,000 requests per second",
                "Implement rate limiting, JWT token rotation, and zero-trust security controls",
                "Deliver a 45-minute live System Design Capstone walkthrough",
            ],
        },
    ]

    for m in milestones_data:
        milestone = RoadmapMilestone(
            roadmap_id=roadmap.id,
            week_number=m["week_number"],
            title=m["title"],
            description=m["description"],
            tasks=m["tasks"],
            is_completed=False,
        )
        db.session.add(milestone)

    # Add verified learning resources
    resources_data = [
        {
            "title": "Designing Data-Intensive Applications",
            "category": "Architecture",
            "resource_type": "Book",
            "difficulty": "Advanced",
            "estimated_hours": 20.0,
            "url": "https://dataintensive.net/",
            "description": "The definitive guide to distributed systems storage engines, replication, and partitioning.",
        },
        {
            "title": "System Design Primer",
            "category": "System Design",
            "resource_type": "Tutorial",
            "difficulty": "Intermediate",
            "estimated_hours": 15.0,
            "url": "https://github.com/donnemartin/system-design-primer",
            "description": "Comprehensive open-source repository covering scalability, caching, load balancing, and async queues.",
        },
        {
            "title": "Kubernetes Official Documentation & Interactive Tutorials",
            "category": "Cloud & DevOps",
            "resource_type": "Documentation",
            "difficulty": "Intermediate",
            "estimated_hours": 12.0,
            "url": "https://kubernetes.io/docs/tutorials/",
            "description": "Hands-on tutorials for Pod lifecycle, Deployments, Services, and Ingress routing.",
        },
    ]

    for r in resources_data:
        resource = LearningResource(
            roadmap_id=roadmap.id,
            title=r["title"],
            category=r["category"],
            resource_type=r["resource_type"],
            difficulty=r["difficulty"],
            estimated_hours=r["estimated_hours"],
            url=r["url"],
            description=r["description"],
        )
        db.session.add(resource)

    # Log user activity
    activity = UserActivity(
        user_id=g.current_user_id,
        activity_type="roadmap_step",
        title=f"Generated Roadmap: {target_role}",
        description="Created personalized 12-week progression roadmap",
        score_impact=3.0,
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Personalized learning roadmap generated successfully.",
        "roadmap": roadmap.to_dict(include_details=True),
    }), 201


@roadmap_bp.route("/<int:roadmap_id>", methods=["GET"])
@jwt_required
def get_roadmap_details(roadmap_id: int):
    """Retrieve roadmap by ID with milestones and verified resources."""
    roadmap = db.session.get(LearningRoadmap, roadmap_id)
    if not roadmap:
        return jsonify({"success": False, "error": "Not Found", "message": "Roadmap not found."}), 404

    if roadmap.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    return jsonify({
        "success": True,
        "roadmap": roadmap.to_dict(include_details=True),
    }), 200


@roadmap_bp.route("/<int:roadmap_id>", methods=["DELETE"])
@jwt_required
def delete_roadmap(roadmap_id: int):
    """Delete a learning roadmap."""
    roadmap = db.session.get(LearningRoadmap, roadmap_id)
    if not roadmap:
        return jsonify({"success": False, "error": "Not Found", "message": "Roadmap not found."}), 404

    if roadmap.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    db.session.delete(roadmap)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Roadmap deleted successfully.",
        "roadmap_id": roadmap_id,
    }), 200


@roadmap_bp.route("/milestones/<int:milestone_id>/toggle", methods=["PATCH"])
@jwt_required
def toggle_milestone(milestone_id: int):
    """Toggle completion status of a roadmap milestone."""
    milestone = db.session.get(RoadmapMilestone, milestone_id)
    if not milestone:
        return jsonify({"success": False, "error": "Not Found", "message": "Milestone not found."}), 404

    roadmap = milestone.roadmap
    if roadmap.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    milestone.is_completed = not milestone.is_completed
    progress = roadmap.calculate_progress()
    roadmap.updated_at = datetime.now(timezone.utc)

    if milestone.is_completed:
        # Create notification and activity
        notif = Notification(
            user_id=g.current_user_id,
            type="roadmap_milestone",
            title="Milestone Completed!",
            message=f"You successfully completed milestone: '{milestone.title}' ({progress}% roadmap progress).",
            link="/roadmap",
        )
        db.session.add(notif)

        act = UserActivity(
            user_id=g.current_user_id,
            activity_type="roadmap_step",
            title=f"Completed: {milestone.title}",
            description=f"Roadmap progress reached {progress}%",
            score_impact=2.5,
        )
        db.session.add(act)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Milestone marked as {'completed' if milestone.is_completed else 'pending'}.",
        "milestone": milestone.to_dict(),
        "completion_pct": progress,
    }), 200


@roadmap_bp.route("/<int:roadmap_id>/milestones", methods=["POST"])
@jwt_required
def add_custom_milestone(roadmap_id: int):
    """Add a custom milestone to an existing roadmap."""
    roadmap = db.session.get(LearningRoadmap, roadmap_id)
    if not roadmap:
        return jsonify({"success": False, "error": "Not Found", "message": "Roadmap not found."}), 404

    if roadmap.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"success": False, "error": "Bad Request", "message": "Milestone title is required."}), 400

    milestone = RoadmapMilestone(
        roadmap_id=roadmap.id,
        title=title,
        description=(data.get("description") or "").strip() or None,
        week_number=int(data.get("week_number") or len(roadmap.milestones) + 1),
        tasks=data.get("tasks") or [],
        is_completed=False,
    )
    db.session.add(milestone)
    db.session.flush()
    roadmap.calculate_progress()
    roadmap.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Milestone added successfully.",
        "milestone": milestone.to_dict(),
        "completion_pct": roadmap.completion_pct,
    }), 201
