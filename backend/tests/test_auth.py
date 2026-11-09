"""Unit and integration tests for Authentication, Authorization, Profile, and Session management."""
import json
import pytest
from app.models.user import User
from app.models.profile import UserProfile
from app.models.session import UserSession
from app.auth.tokens import generate_access_token


def test_user_registration_success(client):
    """Test successful user registration creates user and profile."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "alex.chen@example.com",
            "password": "SecurePassword123!",
            "first_name": "Alex",
            "last_name": "Chen",
            "target_role": "Senior Cloud Architect",
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "alex.chen@example.com"
    assert data["user"]["first_name"] == "Alex"
    assert data["user"]["profile"]["target_role"] == "Senior Cloud Architect"


def test_registration_validation_errors(client):
    """Test registration fails on invalid email or short password."""
    # Invalid email
    res1 = client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "Password123!"},
    )
    assert res1.status_code == 400
    assert "valid email" in res1.get_json()["message"]

    # Short password
    res2 = client.post(
        "/api/v1/auth/register",
        json={"email": "valid@example.com", "password": "short"},
    )
    assert res2.status_code == 400
    assert "at least 8 characters" in res2.get_json()["message"]


def test_duplicate_registration_conflict(client):
    """Test registering with an existing email returns 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "password": "Password1234!",
        "first_name": "Jane",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.get_json()["message"]


def test_login_success_and_invalid_credentials(client):
    """Test login success and bad credential rejection."""
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={"email": "login.test@example.com", "password": "CorrectPassword123!"},
    )

    # Valid login
    res_valid = client.post(
        "/api/v1/auth/login",
        json={"email": "login.test@example.com", "password": "CorrectPassword123!"},
    )
    assert res_valid.status_code == 200
    data = res_valid.get_json()
    assert data["success"] is True
    assert "access_token" in data
    assert "refresh_token" in data

    # Invalid password
    res_bad_pw = client.post(
        "/api/v1/auth/login",
        json={"email": "login.test@example.com", "password": "WrongPassword!"},
    )
    assert res_bad_pw.status_code == 401

    # Non-existent user
    res_no_user = client.post(
        "/api/v1/auth/login",
        json={"email": "does.not.exist@example.com", "password": "SomePassword1!"},
    )
    assert res_no_user.status_code == 401


def test_refresh_token_rotation(client):
    """Test that refresh token yields a new token and invalidates the old one (rotation)."""
    res = client.post(
        "/api/v1/auth/register",
        json={"email": "rotation@example.com", "password": "Password12345!"},
    )
    refresh_token = res.get_json()["refresh_token"]

    # First refresh succeeds
    res_refresh = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert res_refresh.status_code == 200
    refreshed_data = res_refresh.get_json()
    assert refreshed_data["success"] is True
    new_access_token = refreshed_data["access_token"]
    new_refresh_token = refreshed_data["refresh_token"]
    assert new_access_token is not None
    assert new_refresh_token != refresh_token

    # Reusing the old refresh token fails (rotation protection)
    res_reuse = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert res_reuse.status_code == 401
    assert "revoked" in res_reuse.get_json()["message"] or "invalid" in res_reuse.get_json()["message"].lower()


def test_protected_route_requires_token(client):
    """Test protected routes reject missing or bogus tokens."""
    res_no_auth = client.get("/api/v1/auth/me")
    assert res_no_auth.status_code == 401

    res_bogus = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer bogus-token-value"},
    )
    assert res_bogus.status_code == 401


def test_forgot_and_reset_password(client):
    """Test password reset workflow."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "reset.flow@example.com", "password": "OldPassword123!"},
    )

    # Request password reset
    res_forgot = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "reset.flow@example.com"},
    )
    assert res_forgot.status_code == 200
    forgot_data = res_forgot.get_json()
    reset_token = forgot_data.get("reset_token")
    assert reset_token is not None

    # Reset password with token
    res_reset = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": reset_token,
            "new_password": "BrandNewPassword123!",
        },
    )
    assert res_reset.status_code == 200
    assert res_reset.get_json()["success"] is True

    # Old password no longer works
    res_old = client.post(
        "/api/v1/auth/login",
        json={"email": "reset.flow@example.com", "password": "OldPassword123!"},
    )
    assert res_old.status_code == 401

    # New password works
    res_new = client.post(
        "/api/v1/auth/login",
        json={"email": "reset.flow@example.com", "password": "BrandNewPassword123!"},
    )
    assert res_new.status_code == 200


def test_change_password(client):
    """Test authenticated password change."""
    res_reg = client.post(
        "/api/v1/auth/register",
        json={"email": "change.pw@example.com", "password": "InitialPassword123!"},
    )
    token = res_reg.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong current password fails
    res_wrong = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "WrongPassword!", "new_password": "NextPassword123!"},
        headers=headers,
    )
    assert res_wrong.status_code == 400

    # Correct current password succeeds
    res_success = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "InitialPassword123!", "new_password": "NextPassword123!"},
        headers=headers,
    )
    assert res_success.status_code == 200


def test_user_profile_crud(client):
    """Test retrieving and updating user profile."""
    res_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile.user@example.com",
            "password": "SecurePassword123!",
            "first_name": "Dev",
            "last_name": "User",
        },
    )
    token = res_reg.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get profile
    res_get = client.get("/api/v1/profile", headers=headers)
    assert res_get.status_code == 200
    data = res_get.get_json()
    assert data["success"] is True
    assert data["user"]["first_name"] == "Dev"

    # Update profile
    res_update = client.put(
        "/api/v1/profile",
        json={
            "first_name": "Developer",
            "current_designation": "Staff Engineer",
            "current_company": "Tech Innovators",
            "total_experience": 8.5,
            "current_skills": ["Python", "TypeScript", "React", "Docker"],
            "target_role": "Engineering Lead",
            "location": "San Francisco, CA",
        },
        headers=headers,
    )
    assert res_update.status_code == 200
    updated = res_update.get_json()
    assert updated["user"]["first_name"] == "Developer"
    assert updated["profile"]["current_designation"] == "Staff Engineer"
    assert updated["profile"]["total_experience"] == 8.5
    assert "Python" in updated["profile"]["current_skills"]


def test_session_management_and_idor_protection(client):
    """Test session listing, revocation, and IDOR protection between users."""
    # User 1
    res1 = client.post(
        "/api/v1/auth/register",
        json={"email": "user1@example.com", "password": "Password123!"},
    )
    token1 = res1.get_json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # User 2
    res2 = client.post(
        "/api/v1/auth/register",
        json={"email": "user2@example.com", "password": "Password123!"},
    )
    token2 = res2.get_json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 1 lists sessions
    res_sessions1 = client.get("/api/v1/sessions", headers=headers1)
    assert res_sessions1.status_code == 200
    sessions_user1 = res_sessions1.get_json()["sessions"]
    assert len(sessions_user1) >= 1
    session_id_user1 = sessions_user1[0]["session_id"]

    # User 2 attempts to revoke User 1's session (IDOR attack)
    res_idor = client.delete(f"/api/v1/sessions/{session_id_user1}", headers=headers2)
    assert res_idor.status_code == 403
    assert "permission" in res_idor.get_json()["message"].lower()

    # User 1 legitimately revokes their own session
    res_legit = client.delete(f"/api/v1/sessions/{session_id_user1}", headers=headers1)
    assert res_legit.status_code == 200
    assert res_legit.get_json()["success"] is True
