import pytest
from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.user import User


def test_user_creation_and_password_hashing(app):
    """Test user model instantiation, bcrypt hashing, and password verification."""
    with app.app_context():
        user = User(
            email="engineer@example.com",
            first_name="Jane",
            last_name="Doe",
        )
        user.set_password("SecureP@ssw0rd123")

        # Verify password is not plaintext
        assert user.password_hash != "SecureP@ssw0rd123"
        assert user.password_hash.startswith("$2b$") or user.password_hash.startswith("$2a$")
        assert user.check_password("SecureP@ssw0rd123") is True
        assert user.check_password("WrongPassword") is False

        db.session.add(user)
        db.session.commit()

        saved_user = User.query.filter_by(email="engineer@example.com").first()
        assert saved_user is not None
        assert saved_user.id is not None
        assert saved_user.first_name == "Jane"
        assert saved_user.is_active is True
        assert saved_user.created_at is not None


def test_user_email_unique_constraint(app):
    """Test database unique constraint on user email."""
    with app.app_context():
        u1 = User(email="duplicate@example.com")
        u1.set_password("P@ssword123")
        db.session.add(u1)
        db.session.commit()

        u2 = User(email="duplicate@example.com")
        u2.set_password("P@ssword456")
        db.session.add(u2)

        with pytest.raises(IntegrityError):
            db.session.commit()
        db.session.rollback()


def test_user_to_dict_omits_sensitive_fields(app):
    """Verify serialization to dictionary omits password hash."""
    user = User(
        id=1,
        email="test@example.com",
        first_name="Alex",
        last_name="Smith",
    )
    user.set_password("Secret123456")
    user_dict = user.to_dict()

    assert user_dict["email"] == "test@example.com"
    assert user_dict["first_name"] == "Alex"
    assert "password_hash" not in user_dict
    assert "password" not in user_dict
