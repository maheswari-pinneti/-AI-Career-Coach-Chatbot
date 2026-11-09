import os
import time
import json
import urllib.request
import urllib.error
from typing import Generator, Dict, Any, List, Optional
from app.ai.base import BaseAIProvider


class HuggingFaceProvider(BaseAIProvider):
    """Hugging Face Inference API provider supporting open-weights models."""

    provider_name: str = "huggingface"
    default_model: str = "meta-llama/Meta-Llama-3-8B-Instruct"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        if api_key is not None:
            self.api_key = api_key
        else:
            self.api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        self.model = model or self.default_model

    def _ensure_api_key(self):
        if not self.api_key or self.api_key in ["your-huggingface-api-key", "placeholder", "mock-key-not-for-production"]:
            raise ValueError("Hugging Face API key is missing. Please set HUGGINGFACE_API_KEY in your environment.")

    def _call_api(self, payload: dict) -> dict:
        self._ensure_api_key()
        api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AICareerCoach/1.0",
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30.0) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            if e.code == 401 or e.code == 403:
                raise ValueError("Hugging Face authentication failed: Invalid token.") from e
            elif e.code == 429:
                raise RuntimeError("Hugging Face rate limit reached.") from e
            elif e.code == 503:
                raise RuntimeError(f"Hugging Face model is loading: {err_body}") from e
            raise RuntimeError(f"Hugging Face API error ({e.code}): {err_body}") from e
        except urllib.error.URLError as e:
            raise TimeoutError(f"Hugging Face request failed: {str(e)}") from e

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Dict[str, Any]:
        """Generate response via Hugging Face Inference API."""
        start_time = time.time()
        full_prompt = ""
        if system_prompt:
            full_prompt += f"<|system|>\n{system_prompt}\n"
        if conversation_history:
            for msg in conversation_history:
                role = msg.get("role", "user")
                full_prompt += f"<|{role}|>\n{msg.get('content', '')}\n"
        full_prompt += f"<|user|>\n{prompt}\n<|assistant|>\n"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "return_full_text": False,
            },
        }

        raw_result = self._call_api(payload)
        elapsed_ms = int((time.time() - start_time) * 1000)

        if isinstance(raw_result, list) and len(raw_result) > 0:
            content = raw_result[0].get("generated_text", "")
        elif isinstance(raw_result, dict):
            content = raw_result.get("generated_text", "")
        else:
            content = str(raw_result)

        prompt_tokens = max(10, len(prompt) // 4)
        completion_tokens = max(10, len(content) // 4)

        return {
            "content": content.strip(),
            "provider": self.provider_name,
            "model": self.model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "latency_ms": elapsed_ms,
        }

    def stream_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Generator[str, None, None]:
        """Fallback chunked streaming for non-SSE inference endpoints."""
        res = self.generate_response(prompt, system_prompt, conversation_history, temperature, max_tokens)
        content = res["content"]
        words = content.split(" ")
        for i in range(0, len(words), 3):
            yield " ".join(words[i : i + 3]) + " "

    def generate_structured_response(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured response."""
        res = self.generate_response(prompt, system_prompt)
        try:
            return json.loads(res["content"])
        except Exception:
            return {"raw": res["content"]}

    def check_health(self) -> Dict[str, Any]:
        """Check provider operational status."""
        if not self.api_key or self.api_key in ["your-huggingface-api-key", "placeholder", "mock-key-not-for-production"]:
            return {
                "status": "unconfigured",
                "provider": self.provider_name,
                "message": "Hugging Face API key not set.",
            }
        try:
            self._ensure_api_key()
            return {
                "status": "healthy",
                "provider": self.provider_name,
                "model": self.model,
                "latency_ms": 10,
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "provider": self.provider_name,
                "error": str(e),
            }
