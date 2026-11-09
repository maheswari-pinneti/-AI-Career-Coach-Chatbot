from abc import ABC, abstractmethod
from typing import Generator, Dict, Any, List, Optional


class BaseAIProvider(ABC):
    """Abstract interface defining the standardized contract for all AI LLM inference providers."""

    provider_name: str = "base"
    default_model: str = "default-model"

    @abstractmethod
    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Dict[str, Any]:
        """Generate a complete text completion.

        Returns:
            {
                "content": str,
                "provider": str,
                "model": str,
                "prompt_tokens": int,
                "completion_tokens": int,
                "total_tokens": int,
                "latency_ms": int
            }
        """
        pass

    @abstractmethod
    def stream_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Generator[str, None, None]:
        """Stream response tokens progressively for real-time frontend consumption."""
        pass

    @abstractmethod
    def generate_structured_response(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON response conforming strictly to the requested schema."""
        pass

    @abstractmethod
    def check_health(self) -> Dict[str, Any]:
        """Check provider connectivity, API key validity, and latency health metrics."""
        pass
