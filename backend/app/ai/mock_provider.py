import time
from typing import Generator, Dict, Any, List, Optional
from app.ai.base import BaseAIProvider


class MockAIProvider(BaseAIProvider):
    """Deterministic, high-quality mock AI inference provider for development, testing, and offline usage."""

    provider_name: str = "mock"
    default_model: str = "mock-career-coach-v1"

    def __init__(self, latency_ms: int = 50):
        self.simulated_latency_ms = latency_ms

    def _craft_mock_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Construct a high-signal, context-aware coaching response formatted with rich Markdown."""
        p_lower = prompt.lower()

        # Contextual topic detection
        if any(w in p_lower for w in ["resume", "cv", "ats", "bullet"]):
            return (
                "### Resume Optimization Strategy\n\n"
                "To optimize your resume for both Applicant Tracking Systems (ATS) and hiring managers, apply the **Google XYZ Impact Formula**:\n\n"
                "> *\"Accomplished [X] as measured by [Y] by doing [Z]\"*\n\n"
                "#### Key Recommendations:\n"
                "- **Quantify Outcomes:** Replace vague statements like *\"Worked on microservices\"* with *\"Architected 4 event-driven microservices processing 12M daily requests, reducing p99 latency by 35%\"*.\n"
                "- **High-Impact Action Verbs:** Lead each bullet with verbs such as *Architected, Spearheaded, Orchestrated, Optimized, Accelerated*.\n"
                "- **ATS Keyword Alignment:** Ensure core competencies like `TypeScript`, `Docker`, `PostgreSQL`, and `CI/CD` are clearly enumerated under your Skills taxonomy.\n\n"
                "```markdown\n"
                "# Before vs After Example\n"
                "- Before: Responsible for improving database queries.\n"
                "- After: Optimized 14 slow PostgreSQL queries via indexing and connection pooling, slashing average query duration from 420ms to 48ms.\n"
                "```\n\n"
                "**Next Action:** Would you like me to rewrite a specific bullet point from your recent role?"
            )

        if any(w in p_lower for w in ["interview", "star", "behavioral", "mock", "question"]):
            return (
                "### Interview Readiness Coaching\n\n"
                "When answering behavioral and situational questions, strictly utilize the **STAR Framework**:\n\n"
                "1. **Situation:** Set the business context and technical environment in 2-3 sentences.\n"
                "2. **Task:** Clarify the specific problem or constraint you were held accountable for solving.\n"
                "3. **Action:** Focus on *what YOU did*—your technical decisions, leadership actions, and trade-off resolutions.\n"
                "4. **Result:** Provide measurable, concrete business and engineering outcomes.\n\n"
                "#### Probe Drill for Senior Engineers:\n"
                "> *\"Can you describe a high-stakes production incident you led, and what systemic safeguards you implemented to prevent recurrence?\"*\n\n"
                "**Pro-Tip:** Interviewers assess your ownership mindset and emotional composure. Always discuss the post-mortem blameless culture and telemetry improvements.\n\n"
                "**Next Action:** Would you like to draft your answer to this question together right now?"
            )

        if any(w in p_lower for w in ["promotion", "staff", "principal", "salary", "90-day", "lead"]):
            return (
                "### Strategic Career Progression Roadmap\n\n"
                "To step up from Senior to **Staff / Principal Level**, your value proposition shifts from *direct code velocity* to **organizational leverage and strategic impact**.\n\n"
                "#### The 3 Pillars of Staff Engineering:\n"
                "- **Organizational Multiplier:** You make 10 other engineers more productive through architecture, RFC mentorship, and tooling.\n"
                "- **Technical Alignment:** You bridge the gap between business objectives (revenue, compliance, scale) and technical debt.\n"
                "- **Autonomous Problem Discovery:** Rather than asking for tickets, you proactively identify systemic bottlenecks before they cause downtime.\n\n"
                "| Focus Area | Senior Engineer | Staff / Principal Engineer |\n"
                "| :--- | :--- | :--- |\n"
                "| **Scope** | Team-level tasks | Multi-team or Org-wide systems |\n"
                "| **Communication** | Pull request comments | Technical RFCs, Executive narratives |\n"
                "| **Impact Metric** | Feature delivery | System uptime, developer velocity, cost savings |\n\n"
                "**Action Step:** Create an impact portfolio of your top 3 cross-functional technical initiatives from the last 6 months."
            )

        if any(w in p_lower for w in ["architecture", "microservice", "system design", "docker", "kubernetes"]):
            return (
                "### Technical Architecture & System Design\n\n"
                "When designing high-throughput, fault-tolerant distributed systems, consider these foundational patterns:\n\n"
                "#### Core Design Principles:\n"
                "- **Idempotency:** Ensure consumers can safely reprocess events via unique event IDs stored in Redis or database idempotency tables.\n"
                "- **Graceful Degradation:** Implement circuit breakers and fallback mechanisms when downstream dependencies degrade.\n"
                "- **Observability First:** Emit distributed trace IDs across HTTP/gRPC boundaries to monitor p95 and p99 latencies.\n\n"
                "```typescript\n"
                "// Idempotent Consumer Pattern Example\n"
                "async function handlePaymentEvent(event: WebhookEvent): Promise<void> {\n"
                "  const alreadyProcessed = await redis.set(`idemp:${event.id}`, '1', 'EX', 86400, 'NX');\n"
                "  if (!alreadyProcessed) {\n"
                "    logger.info(`Duplicate event skipped: ${event.id}`);\n"
                "    return;\n"
                "  }\n"
                "  await processTransaction(event.payload);\n"
                "}\n"
                "```\n\n"
                "**Next Action:** Would you like to explore partitioning strategies or database replication for this workload?"
            )

        # General supportive career coaching response
        return (
            "### AI Career Strategy Consultation\n\n"
            f"Thank you for reaching out. Based on your target goals and background, here is a structured evaluation of your career pathway:\n\n"
            "#### Strategic Recommendations:\n"
            "1. **Continuous Competency Alignment:** Benchmark your current skill stack against top industry postings for your target role.\n"
            "2. **Quantifiable Artifacts:** Build high-signal demonstration projects rather than relying strictly on credential lists.\n"
            "3. **Network & Visibility:** Actively share technical insights, post-mortems, and architectural reflections with your community.\n\n"
            "> *\"Consistency compounds over quarters, not days. Focus on high-signal outcomes and clear documentation.\"*\n\n"
            "**How can I assist you further?** We can drill into resume bullets, conduct a mock interview simulation, or construct a personalized 60-day learning roadmap."
        )

    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> Dict[str, Any]:
        """Generate deterministic structured response."""
        start_time = time.time()
        if self.simulated_latency_ms > 0:
            time.sleep(self.simulated_latency_ms / 1000.0)

        content = self._craft_mock_response(prompt, system_prompt, conversation_history)
        elapsed_ms = int((time.time() - start_time) * 1000)

        prompt_tokens = max(10, len(prompt) // 4)
        completion_tokens = max(20, len(content) // 4)

        return {
            "content": content,
            "provider": self.provider_name,
            "model": self.default_model,
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
        """Stream response chunk by chunk."""
        content = self._craft_mock_response(prompt, system_prompt, conversation_history)
        words = content.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i : i + 3]) + " "
            yield chunk

    def generate_structured_response(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured response conforming to schema."""
        return {
            "analysis": "High proficiency detected in technical leadership and core architectural domains.",
            "score": 85,
            "strengths": ["Clear system design reasoning", "Quantifiable impact metrics"],
            "improvements": ["Deepen distributed consensus knowledge", "Expand cross-functional mentorship"],
        }

    def check_health(self) -> Dict[str, Any]:
        """Check provider operational status."""
        return {
            "status": "healthy",
            "provider": self.provider_name,
            "model": self.default_model,
            "latency_ms": 1,
            "message": "Mock provider operational and deterministic.",
        }
