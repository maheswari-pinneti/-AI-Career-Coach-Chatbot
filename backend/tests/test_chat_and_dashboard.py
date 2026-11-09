"""Integration tests for AI Career Chatbot and Career Dashboard APIs."""
import pytest


@pytest.fixture
def auth_user(client):
    """Register and authenticate user 1, returning token and user details."""
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "chat.tester@example.com", "password": "Password123!", "first_name": "Jordan"},
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
        json={"email": "other.user@example.com", "password": "Password123!", "first_name": "Sam"},
    )
    data = res.get_json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }


def test_get_personas_public(client):
    """Test retrieving persona catalogue."""
    res = client.get("/api/v1/chat/personas")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["personas"]) >= 6
    ids = [p["id"] for p in data["personas"]]
    assert "career_mentor" in ids
    assert "technical_mentor" in ids
    assert "resume_coach" in ids


def test_conversation_lifecycle_and_messaging(client, auth_user):
    """Test creating conversation, sending message, receiving AI answer, and deleting."""
    headers = auth_user["headers"]

    # 1. Create conversation
    res_create = client.post(
        "/api/v1/chat/conversations",
        json={"persona_mode": "resume_coach", "title": "New Career Consultation"},
        headers=headers,
    )
    assert res_create.status_code == 201
    conv = res_create.get_json()["conversation"]
    conv_id = conv["id"]
    assert conv["persona_mode"] == "resume_coach"

    # 2. List conversations
    res_list = client.get("/api/v1/chat/conversations", headers=headers)
    assert res_list.status_code == 200
    assert any(c["id"] == conv_id for c in res_list.get_json()["conversations"])

    # 3. Send message
    res_msg = client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        json={"content": "How do I optimize my resume for ATS software?"},
        headers=headers,
    )
    assert res_msg.status_code == 201
    data = res_msg.get_json()
    assert data["success"] is True
    assert data["user_message"]["role"] == "user"
    assert data["assistant_message"]["role"] == "assistant"
    assert "Google XYZ Impact Formula" in data["assistant_message"]["content"]
    assert data["assistant_message"]["prompt_tokens"] > 0

    # 4. Fetch thread details
    res_details = client.get(f"/api/v1/chat/conversations/{conv_id}", headers=headers)
    assert res_details.status_code == 200
    messages = res_details.get_json()["conversation"]["messages"]
    assert len(messages) == 2

    # 5. Regenerate assistant message
    res_regen = client.post(f"/api/v1/chat/conversations/{conv_id}/regenerate", headers=headers)
    assert res_regen.status_code == 200
    assert res_regen.get_json()["success"] is True

    # 6. Delete conversation
    res_del = client.delete(f"/api/v1/chat/conversations/{conv_id}", headers=headers)
    assert res_del.status_code == 200

    # 7. Verify deletion
    res_verify = client.get(f"/api/v1/chat/conversations/{conv_id}", headers=headers)
    assert res_verify.status_code == 404


def test_conversation_idor_protection(client, auth_user, other_user):
    """Test User A's conversation cannot be read, messaged, or deleted by User B."""
    # User 1 creates conversation
    res = client.post(
        "/api/v1/chat/conversations",
        json={"persona_mode": "career_mentor", "title": "Confidential Career Plans"},
        headers=auth_user["headers"],
    )
    conv_id = res.get_json()["conversation"]["id"]

    # User 2 attempts to read conversation
    res_read = client.get(f"/api/v1/chat/conversations/{conv_id}", headers=other_user["headers"])
    assert res_read.status_code == 403

    # User 2 attempts to send message
    res_post = client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        json={"content": "Malicious payload"},
        headers=other_user["headers"],
    )
    assert res_post.status_code == 403

    # User 2 attempts to delete conversation
    res_del = client.delete(f"/api/v1/chat/conversations/{conv_id}", headers=other_user["headers"])
    assert res_del.status_code == 403


def test_dashboard_metrics_empty_state_and_sample_seeding(client, auth_user):
    """Test dashboard calculations for empty state and sample data seeding."""
    headers = auth_user["headers"]

    # Brand new user has no data -> returns onboarding guidance & empty metrics
    res_empty = client.get("/api/v1/dashboard/metrics", headers=headers)
    assert res_empty.status_code == 200
    empty_data = res_empty.get_json()
    assert empty_data["success"] is True
    assert empty_data["has_data"] is False
    assert empty_data["metrics"]["readiness_score"] == 0.0
    assert len(empty_data["recommended_actions"]) >= 3

    # Seed sample dashboard data
    res_seed = client.post("/api/v1/dashboard/seed-sample", headers=headers)
    assert res_seed.status_code == 200

    # Query metrics again -> returns populated metrics and computed conversion rate
    res_populated = client.get("/api/v1/dashboard/metrics", headers=headers)
    assert res_populated.status_code == 200
    pop_data = res_populated.get_json()
    assert pop_data["has_data"] is True
    metrics = pop_data["metrics"]
    assert metrics["readiness_score"] > 70
    assert metrics["resume_score"] >= 80
    assert metrics["job_applications_count"] == 5
    assert metrics["interview_conversion_rate"] > 0
    assert len(pop_data["timeline"]) >= 3
    assert len(pop_data["progress_chart"]) >= 4
