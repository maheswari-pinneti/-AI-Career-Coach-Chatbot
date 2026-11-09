import json
import time
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g, Response, stream_with_context
from app.extensions import db
from app.models.conversation import Conversation, ChatMessage
from app.models.ai_usage import AIUsageLog
from app.models.dashboard import UserActivity
from app.auth.decorators import jwt_required
from app.ai.factory import get_ai_provider
from app.ai.personas import get_persona, list_personas

chat_bp = Blueprint("chat", __name__, url_prefix="/chat")


@chat_bp.route("/personas", methods=["GET"])
def get_personas_list():
    """Retrieve all available career coach personas and starter prompts."""
    return jsonify({
        "success": True,
        "personas": list_personas(),
    }), 200


@chat_bp.route("/conversations", methods=["GET"])
@jwt_required
def get_conversations():
    """List all conversations for the authenticated user."""
    conversations = (
        Conversation.query.filter_by(user_id=g.current_user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return jsonify({
        "success": True,
        "conversations": [c.to_dict() for c in conversations],
        "count": len(conversations),
    }), 200


@chat_bp.route("/conversations", methods=["POST"])
@jwt_required
def create_conversation():
    """Create a new conversation thread."""
    data = request.get_json(silent=True) or {}
    persona_mode = data.get("persona_mode", "career_mentor")
    title = (data.get("title") or "").strip() or "New Career Consultation"
    provider = (data.get("provider") or "").strip() or "mock"

    persona_config = get_persona(persona_mode)

    conversation = Conversation(
        user_id=g.current_user_id,
        title=title,
        persona_mode=persona_config["id"],
        provider=provider,
    )
    db.session.add(conversation)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Conversation created successfully.",
        "conversation": conversation.to_dict(),
    }), 201


@chat_bp.route("/conversations/<int:conv_id>", methods=["GET"])
@jwt_required
def get_conversation_details(conv_id: int):
    """Retrieve conversation thread with all chronological messages."""
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({"success": False, "error": "Not Found", "message": "Conversation not found."}), 404

    # IDOR check
    if conversation.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    return jsonify({
        "success": True,
        "conversation": conversation.to_dict(include_messages=True),
    }), 200


@chat_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@jwt_required
def delete_conversation(conv_id: int):
    """Delete a conversation thread and its associated message history."""
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({"success": False, "error": "Not Found", "message": "Conversation not found."}), 404

    # IDOR check
    if conversation.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    db.session.delete(conversation)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Conversation deleted successfully.",
        "conversation_id": conv_id,
    }), 200


@chat_bp.route("/conversations/<int:conv_id>/messages", methods=["POST"])
@jwt_required
def send_message(conv_id: int):
    """Send a user message and receive AI coach guidance."""
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({"success": False, "error": "Not Found", "message": "Conversation not found."}), 404

    # IDOR check
    if conversation.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"success": False, "error": "Bad Request", "message": "Message content cannot be empty."}), 400

    # Persist user message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=content,
    )
    db.session.add(user_msg)
    db.session.flush()

    # Load recent conversation history for context (up to last 10 messages)
    history_records = (
        ChatMessage.query.filter_by(conversation_id=conversation.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    history_records.reverse()
    context = [{"role": m.role, "content": m.content} for m in history_records[:-1]]

    # Prepare persona prompt
    persona = get_persona(conversation.persona_mode)
    system_prompt = persona["system_prompt"]

    # Execute AI provider
    provider = get_ai_provider(conversation.provider)
    start_time = time.time()
    try:
        ai_result = provider.generate_response(
            prompt=content,
            system_prompt=system_prompt,
            conversation_history=context,
        )
        latency_ms = ai_result.get("latency_ms", int((time.time() - start_time) * 1000))
        assistant_content = ai_result.get("content", "")
        model_name = ai_result.get("model", provider.default_model)
        status = "success"
        error_category = None
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        status = "error"
        error_category = "api_error"
        # Graceful fallback message
        assistant_content = (
            "I encountered a temporary connectivity issue connecting to the AI inference engine. "
            f"Error details: {str(e)}. Please retry in a few moments."
        )
        model_name = "error-fallback"

    # Persist assistant message
    assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
        provider=provider.provider_name,
        model=model_name,
        prompt_tokens=ai_result.get("prompt_tokens", 0) if status == "success" else 0,
        completion_tokens=ai_result.get("completion_tokens", 0) if status == "success" else 0,
        total_tokens=ai_result.get("total_tokens", 0) if status == "success" else 0,
        latency_ms=latency_ms,
    )
    db.session.add(assistant_msg)

    # Privacy-safe telemetry logging
    usage_log = AIUsageLog(
        user_id=g.current_user_id,
        conversation_id=conversation.id,
        provider=provider.provider_name,
        model=model_name,
        prompt_tokens=assistant_msg.prompt_tokens,
        completion_tokens=assistant_msg.completion_tokens,
        total_tokens=assistant_msg.total_tokens,
        latency_ms=latency_ms,
        status=status,
        error_category=error_category,
    )
    db.session.add(usage_log)

    # Auto-title conversation if still default
    if conversation.title in ["New Career Consultation", "New Chat", ""]:
        cleaned = content.replace("\n", " ").strip()
        conversation.title = (cleaned[:40] + "...") if len(cleaned) > 40 else cleaned

    conversation.updated_at = datetime.now(timezone.utc)

    # Record user activity for dashboard telemetry
    activity = UserActivity(
        user_id=g.current_user_id,
        activity_type="chat_consultation",
        title=f"Consulted {persona['name']}",
        description=f"Topic: {conversation.title}",
        score_impact=0.5,
    )
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        "success": True,
        "user_message": user_msg.to_dict(),
        "assistant_message": assistant_msg.to_dict(),
        "conversation": conversation.to_dict(),
    }), 201


@chat_bp.route("/conversations/<int:conv_id>/messages/stream", methods=["POST"])
@jwt_required
def stream_chat_message(conv_id: int):
    """Stream assistant response tokens progressively via Server-Sent Events (SSE)."""
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({"success": False, "error": "Not Found", "message": "Conversation not found."}), 404

    if conversation.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"success": False, "error": "Bad Request", "message": "Content is required."}), 400

    # Save user message
    user_msg = ChatMessage(conversation_id=conversation.id, role="user", content=content)
    db.session.add(user_msg)
    db.session.commit()

    persona = get_persona(conversation.persona_mode)
    provider = get_ai_provider(conversation.provider)

    def event_stream():
        full_response = []
        try:
            for chunk in provider.stream_response(prompt=content, system_prompt=persona["system_prompt"]):
                full_response.append(chunk)
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            final_text = "".join(full_response)
            yield f"data: {json.dumps({'done': True, 'content': final_text})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(stream_with_context(event_stream()), mimetype="text/event-stream")


@chat_bp.route("/conversations/<int:conv_id>/regenerate", methods=["POST"])
@jwt_required
def regenerate_response(conv_id: int):
    """Regenerate the latest assistant response in the thread."""
    conversation = db.session.get(Conversation, conv_id)
    if not conversation:
        return jsonify({"success": False, "error": "Not Found", "message": "Conversation not found."}), 404

    if conversation.user_id != g.current_user_id:
        return jsonify({"success": False, "error": "Forbidden", "message": "Access denied."}), 403

    # Find the last message
    last_msg = (
        ChatMessage.query.filter_by(conversation_id=conversation.id)
        .order_by(ChatMessage.created_at.desc())
        .first()
    )

    if not last_msg:
        return jsonify({"success": False, "error": "Bad Request", "message": "No messages to regenerate."}), 400

    # If last message was assistant, delete it and find user prompt before it
    if last_msg.role == "assistant":
        db.session.delete(last_msg)
        db.session.commit()
        last_user_msg = (
            ChatMessage.query.filter_by(conversation_id=conversation.id, role="user")
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
    else:
        last_user_msg = last_msg

    if not last_user_msg:
        return jsonify({"success": False, "error": "Bad Request", "message": "No user message found to answer."}), 400

    persona = get_persona(conversation.persona_mode)
    provider = get_ai_provider(conversation.provider)

    ai_result = provider.generate_response(
        prompt=last_user_msg.content,
        system_prompt=persona["system_prompt"],
    )

    new_assistant_msg = ChatMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_result.get("content", ""),
        provider=provider.provider_name,
        model=ai_result.get("model", provider.default_model),
        prompt_tokens=ai_result.get("prompt_tokens", 0),
        completion_tokens=ai_result.get("completion_tokens", 0),
        total_tokens=ai_result.get("total_tokens", 0),
        latency_ms=ai_result.get("latency_ms", 50),
    )
    db.session.add(new_assistant_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Response regenerated successfully.",
        "assistant_message": new_assistant_msg.to_dict(),
    }), 200
