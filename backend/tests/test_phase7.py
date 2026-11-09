"""Integration tests for Phase 7: Learning Roadmap, Job Tracker, Analytics, and Notifications."""
import pytest


@pytest.fixture
def auth_user(client):
    """Register and authenticate user 1."""
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "phase7.user@example.com", "password": "Password123!", "first_name": "Taylor"},
    )
    data = res.get_json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }


@pytest.fixture
def other_user(client):
    """Register and authenticate user 2 for IDOR protection checks."""
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "other7.user@example.com", "password": "Password123!", "first_name": "Casey"},
    )
    data = res.get_json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }


def test_roadmap_generation_and_milestone_toggle(client, auth_user):
    """Test generating personalized roadmap and toggling milestone completion."""
    headers = auth_user["headers"]

    # 1. Generate roadmap
    res_gen = client.post(
        "/api/v1/roadmap/generate",
        json={"target_role": "Staff Cloud Architect", "weekly_hours": 12},
        headers=headers,
    )
    assert res_gen.status_code == 201
    roadmap = res_gen.get_json()["roadmap"]
    assert roadmap["target_role"] == "Staff Cloud Architect"
    assert len(roadmap["milestones"]) >= 4
    assert len(roadmap["resources"]) >= 3
    assert roadmap["completion_pct"] == 0.0

    roadmap_id = roadmap["id"]
    first_milestone = roadmap["milestones"][0]
    milestone_id = first_milestone["id"]

    # 2. Toggle first milestone to completed
    res_toggle = client.patch(f"/api/v1/roadmap/milestones/{milestone_id}/toggle", headers=headers)
    assert res_toggle.status_code == 200
    toggle_data = res_toggle.get_json()
    assert toggle_data["milestone"]["is_completed"] is True
    assert toggle_data["completion_pct"] > 0

    # 3. Add custom milestone
    res_add = client.post(
        f"/api/v1/roadmap/{roadmap_id}/milestones",
        json={"title": "Custom AWS Security Specialist Audit", "week_number": 5},
        headers=headers,
    )
    assert res_add.status_code == 201
    assert res_add.get_json()["milestone"]["title"] == "Custom AWS Security Specialist Audit"


def test_job_application_lifecycle_and_history(client, auth_user):
    """Test job creation, status transition, kanban grouping, and history audit."""
    headers = auth_user["headers"]

    # 1. Create job application
    res_create = client.post(
        "/api/v1/jobs",
        json={
            "company": "Stripe",
            "role": "Staff Platform Engineer",
            "status": "applied",
            "employment_type": "Full-time",
            "location": "San Francisco, CA",
            "salary_range": "$220k - $260k",
        },
        headers=headers,
    )
    assert res_create.status_code == 201
    job = res_create.get_json()["job"]
    job_id = job["id"]
    assert job["company"] == "Stripe"
    assert len(job["status_history"]) == 1

    # 2. Transition status: applied -> interview
    res_status = client.patch(
        f"/api/v1/jobs/{job_id}/status",
        json={"status": "interview", "notes": "Invited to technical screening."},
        headers=headers,
    )
    assert res_status.status_code == 200
    updated_job = res_status.get_json()["job"]
    assert updated_job["status"] == "interview"
    assert len(updated_job["status_history"]) == 2
    assert updated_job["status_history"][0]["to_status"] == "interview"

    # 3. Kanban view
    res_kanban = client.get("/api/v1/jobs/kanban", headers=headers)
    assert res_kanban.status_code == 200
    kanban = res_kanban.get_json()["kanban"]
    assert len(kanban["interview"]) >= 1
    assert any(j["id"] == job_id for j in kanban["interview"])

    # 4. Filter jobs by status
    res_filter = client.get("/api/v1/jobs?status=interview", headers=headers)
    assert res_filter.status_code == 200
    assert len(res_filter.get_json()["jobs"]) >= 1


def test_job_and_roadmap_idor_protection(client, auth_user, other_user):
    """Test User A's jobs and roadmaps cannot be modified or deleted by User B."""
    # User 1 creates job
    res_job = client.post(
        "/api/v1/jobs",
        json={"company": "Secret Corp", "role": "Principal Lead"},
        headers=auth_user["headers"],
    )
    job_id = res_job.get_json()["job"]["id"]

    # User 2 attempts to delete User 1's job
    res_idor_job = client.delete(f"/api/v1/jobs/{job_id}", headers=other_user["headers"])
    assert res_idor_job.status_code == 403

    # User 1 creates roadmap
    res_road = client.post(
        "/api/v1/roadmap/generate",
        json={"target_role": "Confidential Architect"},
        headers=auth_user["headers"],
    )
    roadmap_id = res_road.get_json()["roadmap"]["id"]

    # User 2 attempts to delete User 1's roadmap
    res_idor_road = client.delete(f"/api/v1/roadmap/{roadmap_id}", headers=other_user["headers"])
    assert res_idor_road.status_code == 403


def test_analytics_overview_and_export(client, auth_user):
    """Test analytics aggregation and JSON export."""
    headers = auth_user["headers"]

    # Add a couple jobs
    client.post("/api/v1/jobs", json={"company": "Vercel", "role": "Frontend Architect", "status": "applied"}, headers=headers)
    client.post("/api/v1/jobs", json={"company": "OpenAI", "role": "Research Engineer", "status": "interview"}, headers=headers)

    # Analytics overview
    res_overview = client.get("/api/v1/analytics/overview?days=30", headers=headers)
    assert res_overview.status_code == 200
    data = res_overview.get_json()
    assert data["success"] is True
    assert data["total_jobs"] >= 2
    assert len(data["status_distribution"]) == 7

    # Export
    res_export = client.get("/api/v1/analytics/export", headers=headers)
    assert res_export.status_code == 200
    export_data = res_export.get_json()["data"]
    assert "job_applications" in export_data
    assert "roadmaps" in export_data


def test_notifications_flow(client, auth_user):
    """Test notifications retrieval and mark-as-read."""
    headers = auth_user["headers"]

    # Trigger a notification by generating roadmap and completing milestone
    res_road = client.post("/api/v1/roadmap/generate", json={"target_role": "Data Scientist"}, headers=headers)
    m_id = res_road.get_json()["roadmap"]["milestones"][0]["id"]
    client.patch(f"/api/v1/roadmap/milestones/{m_id}/toggle", headers=headers)

    # Get notifications
    res_notif = client.get("/api/v1/notifications", headers=headers)
    assert res_notif.status_code == 200
    data = res_notif.get_json()
    assert data["success"] is True
    assert len(data["notifications"]) >= 1

    first_notif_id = data["notifications"][0]["id"]

    # Mark single as read
    res_read = client.patch(f"/api/v1/notifications/{first_notif_id}/read", headers=headers)
    assert res_read.status_code == 200

    # Mark all read
    res_all = client.post("/api/v1/notifications/read-all", headers=headers)
    assert res_all.status_code == 200
