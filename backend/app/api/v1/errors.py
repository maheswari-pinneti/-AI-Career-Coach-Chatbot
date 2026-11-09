from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    """Register centralized JSON error handlers for common HTTP status codes."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": getattr(error, "description", "The request could not be processed."),
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": getattr(error, "description", "The requested resource was not found."),
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": "Method Not Allowed",
            "message": getattr(error, "description", "HTTP method is not supported for this endpoint."),
        }), 405

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            "success": False,
            "error": "Unprocessable Entity",
            "message": getattr(error, "description", "Validation error occurred."),
        }), 422

    @app.errorhandler(500)
    def internal_server_error(error):
        current_app.logger.error(f"Internal server error: {error}")
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred on the server.",
        }), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle standard Werkzeug HTTP exceptions uniformly."""
        return jsonify({
            "success": False,
            "error": error.name,
            "message": error.description,
        }), error.code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Catch-all for unhandled exceptions."""
        current_app.logger.exception(f"Unhandled exception: {error}")
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "An unhandled exception occurred.",
        }), 500
