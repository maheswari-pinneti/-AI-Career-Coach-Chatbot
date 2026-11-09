import os
import logging
from flask import current_app, has_app_context
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.huggingface_provider import HuggingFaceProvider

logger = logging.getLogger(__name__)


PLACEHOLDER_KEYS = [
    "your-openai-api-key",
    "your-huggingface-api-key",
    "mock-key-not-for-production",
    "placeholder",
    "",
]


def get_ai_provider(provider_name: str = None) -> BaseAIProvider:
    """Resolve and instantiate the appropriate AI inference provider based on config or request."""
    if not provider_name:
        if has_app_context():
            provider_name = current_app.config.get("AI_PROVIDER", "mock")
        else:
            provider_name = os.getenv("AI_PROVIDER", "mock")

    provider_name = (provider_name or "mock").strip().lower()

    if provider_name == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "")
        if (not api_key or api_key in PLACEHOLDER_KEYS) and has_app_context():
            api_key = current_app.config.get("OPENAI_API_KEY", "")

        if not api_key or api_key in PLACEHOLDER_KEYS:
            logger.warning(
                "OPENAI_API_KEY not found in environment or app config. Gracefully falling back to MockAIProvider."
            )
            return MockAIProvider(latency_ms=10)
        return OpenAIProvider(api_key=api_key)

    elif provider_name == "huggingface":
        api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        if (not api_key or api_key in PLACEHOLDER_KEYS) and has_app_context():
            api_key = current_app.config.get("HUGGINGFACE_API_KEY", "")

        if not api_key or api_key in PLACEHOLDER_KEYS:
            logger.warning(
                "HUGGINGFACE_API_KEY not found in environment or app config. Gracefully falling back to MockAIProvider."
            )
            return MockAIProvider(latency_ms=10)
        return HuggingFaceProvider(api_key=api_key)

    else:
        # Default deterministic mock provider
        return MockAIProvider(latency_ms=10)
