import os
import time
from typing import Generator, Dict, Any, List, Optional
from app.ai.base import BaseAIProvider

try:
    import openai
except ImportError:
    openai = None


class OpenAIProvider(BaseAIProvider):
    """OpenAI API inference provider supporting GPT-4o, GPT-4o-mini, and streaming completions."""

    provider_name: str = "openai"
    default_model: str = "gpt-4o-mini"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        if api_key is not None:
            self.api_key = api_key
        else:
            self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = model or self.default_model
        if openai and self.api_key and self.api_key not in ["your-openai-api-key", "placeholder", "mock-key-not-for-production"]:
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            self.client = None

    def _ensure_client(self):
        """Verify client readiness and credentials."""
        if not openai:
            raise RuntimeError("The 'openai' python package is not installed.")
        if not self.api_key or self.api_key in ["your-openai-api-key", "placeholder", "mock-key-not-for-production"]:
            raise ValueError("OpenAI API key is missing. Please set OPENAI_API_KEY in your environment.")
        if not self.client:
            self.client = openai.OpenAI(api_key=self.api_key)

    def _build_messages(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> List[Dict[str, str]]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if conversation_history:
            for msg in conversation_history:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": prompt})
        return messages

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Dict[str, Any]:
        """Generate full completion from OpenAI."""
        self._ensure_client()
        messages = self._build_messages(prompt, system_prompt, conversation_history)
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=30.0,
            )
            elapsed_ms = int((time.time() - start_time) * 1000)
            choice = response.choices[0]
            usage = response.usage

            return {
                "content": choice.message.content or "",
                "provider": self.provider_name,
                "model": self.model,
                "prompt_tokens": usage.prompt_tokens if usage else 0,
                "completion_tokens": usage.completion_tokens if usage else 0,
                "total_tokens": usage.total_tokens if usage else 0,
                "latency_ms": elapsed_ms,
            }
        except openai.RateLimitError as e:
            raise RuntimeError(f"OpenAI rate limit exceeded: {str(e)}") from e
        except openai.AuthenticationError as e:
            raise ValueError(f"OpenAI authentication failed: Invalid API key.") from e
        except openai.APITimeoutError as e:
            raise TimeoutError(f"OpenAI request timed out: {str(e)}") from e
        except Exception as e:
            raise RuntimeError(f"OpenAI completion error: {str(e)}") from e

    def stream_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Generator[str, None, None]:
        """Stream chunks progressively from OpenAI."""
        self._ensure_client()
        messages = self._build_messages(prompt, system_prompt, conversation_history)

        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                timeout=30.0,
            )
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise RuntimeError(f"OpenAI streaming error: {str(e)}") from e

    def generate_structured_response(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON conforming to schema."""
        self._ensure_client()
        import json

        structured_system = (system_prompt or "") + "\nYou MUST return valid JSON conforming to the requested schema."
        messages = [
            {"role": "system", "content": structured_system},
            {"role": "user", "content": prompt},
        ]
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
            timeout=30.0,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)

    def check_health(self) -> Dict[str, Any]:
        """Validate credentials and API readiness."""
        if not self.api_key or self.api_key in ["your-openai-api-key", "placeholder", "mock-key-not-for-production"]:
            return {
                "status": "unconfigured",
                "provider": self.provider_name,
                "message": "OpenAI API key not set.",
            }
        try:
            self._ensure_client()
            start = time.time()
            self.client.models.list()
            elapsed_ms = int((time.time() - start) * 1000)
            return {
                "status": "healthy",
                "provider": self.provider_name,
                "model": self.model,
                "latency_ms": elapsed_ms,
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.provider_name,
                "error": str(e),
            }
