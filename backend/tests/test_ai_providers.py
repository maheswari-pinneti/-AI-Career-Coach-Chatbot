"""Unit tests for AI Provider architecture, persona prompts, and provider factory."""
import pytest
from app.ai.mock_provider import MockAIProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.huggingface_provider import HuggingFaceProvider
from app.ai.personas import get_persona, list_personas, PERSONAS
from app.ai.factory import get_ai_provider


def test_mock_provider_generate_response():
    """Test MockAIProvider returns high-signal markdown responses with token tracking."""
    provider = MockAIProvider(latency_ms=1)
    res = provider.generate_response("How do I improve my resume for an ATS?")

    assert res["provider"] == "mock"
    assert "Resume Optimization Strategy" in res["content"]
    assert "Google XYZ Impact Formula" in res["content"]
    assert res["prompt_tokens"] > 0
    assert res["completion_tokens"] > 0
    assert res["total_tokens"] == res["prompt_tokens"] + res["completion_tokens"]


def test_mock_provider_streaming():
    """Test MockAIProvider stream_response yields progressive text chunks."""
    provider = MockAIProvider(latency_ms=0)
    stream = provider.stream_response("Tell me about behavioral interviews with the STAR method")

    chunks = list(stream)
    assert len(chunks) > 1
    joined = "".join(chunks)
    assert "Interview Readiness Coaching" in joined
    assert "STAR Framework" in joined


def test_mock_provider_structured_response():
    """Test MockAIProvider structured JSON responses."""
    provider = MockAIProvider(latency_ms=0)
    schema = {"type": "object", "properties": {"score": {"type": "number"}}}
    res = provider.generate_structured_response("Evaluate my skills", schema)

    assert isinstance(res, dict)
    assert "score" in res
    assert "strengths" in res


def test_mock_provider_health():
    """Test MockAIProvider health check."""
    provider = MockAIProvider(latency_ms=0)
    health = provider.check_health()
    assert health["status"] == "healthy"
    assert health["provider"] == "mock"


def test_personas_configuration():
    """Test persona retrieval and default fallback."""
    personas = list_personas()
    assert len(personas) >= 6

    # Verify specific persona definitions
    career = get_persona("career_mentor")
    assert career["name"] == "Career Mentor"
    assert len(career["starter_prompts"]) > 0

    tech = get_persona("technical_mentor")
    assert tech["name"] == "Technical Mentor"

    # Fallback to default
    unknown = get_persona("non_existent_persona")
    assert unknown["id"] == "career_mentor"


def test_factory_fallback_on_missing_api_keys(app):
    """Test that get_ai_provider gracefully defaults to MockAIProvider when keys are absent."""
    with app.app_context():
        # With mock
        p1 = get_ai_provider("mock")
        assert isinstance(p1, MockAIProvider)

        # With openai without key -> falls back to MockAIProvider
        p2 = get_ai_provider("openai")
        assert isinstance(p2, MockAIProvider)

        # With huggingface without key -> falls back to MockAIProvider
        p3 = get_ai_provider("huggingface")
        assert isinstance(p3, MockAIProvider)


def test_openai_provider_missing_key_behavior():
    """Test OpenAIProvider surfaces unconfigured status when initialized without key."""
    provider = OpenAIProvider(api_key="")
    health = provider.check_health()
    assert health["status"] == "unconfigured"

    with pytest.raises(ValueError) as exc:
        provider.generate_response("Hello")
    assert "API key is missing" in str(exc.value)


def test_huggingface_provider_missing_key_behavior():
    """Test HuggingFaceProvider surfaces unconfigured status when initialized without key."""
    provider = HuggingFaceProvider(api_key="")
    health = provider.check_health()
    assert health["status"] == "unconfigured"

    with pytest.raises(ValueError) as exc:
        provider.generate_response("Hello")
    assert "API key is missing" in str(exc.value)
