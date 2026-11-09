from flask import Blueprint, jsonify, current_app

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """System health check endpoint verifying API service availability."""
    version = current_app.config.get("APP_VERSION", "1.0.0")
    return jsonify({
        "success": True,
        "message": "AI Career Coach API is running",
        "version": version,
    }), 200
