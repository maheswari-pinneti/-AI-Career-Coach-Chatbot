from flask import Blueprint
from app.api.v1.health import health_bp
from app.api.v1.auth import auth_bp
from app.api.v1.profile import profile_bp
from app.api.v1.sessions import sessions_bp
from app.api.v1.chat import chat_bp
from app.api.v1.dashboard import dashboard_bp
from app.api.v1.roadmap import roadmap_bp
from app.api.v1.jobs import jobs_bp
from app.api.v1.analytics import analytics_bp
from app.api.v1.notifications import notifications_bp

api_v1_bp = Blueprint("api_v1", __name__, url_prefix="/api/v1")

# Register feature route sub-blueprints
api_v1_bp.register_blueprint(health_bp)
api_v1_bp.register_blueprint(auth_bp)
api_v1_bp.register_blueprint(profile_bp)
api_v1_bp.register_blueprint(sessions_bp)
api_v1_bp.register_blueprint(chat_bp)
api_v1_bp.register_blueprint(dashboard_bp)
api_v1_bp.register_blueprint(roadmap_bp)
api_v1_bp.register_blueprint(jobs_bp)
api_v1_bp.register_blueprint(analytics_bp)
api_v1_bp.register_blueprint(notifications_bp)
