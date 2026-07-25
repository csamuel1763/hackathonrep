"""
Ollama Local AI API client for structured JSON and text response generation.

Uses httpx.AsyncClient to communicate with the local Ollama server running Llama 3.1 8B.
Endpoint: http://localhost:11434/api/generate
"""

import json
import logging
import time
from typing import Any

import httpx

from app.utils.config import get_settings
from app.utils.exceptions import (
    AITimeoutError,
    AINetworkError,
    ExternalServiceError,
)

logger = logging.getLogger(__name__)
settings = get_settings()

# Reusable HTTPX Client for performance optimization
_http_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    """Return reusable HTTPX client with configurable timeout."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(settings.ollama_timeout_seconds),
            headers={"Content-Type": "application/json"},
        )
    return _http_client


async def is_ollama_available() -> bool:
    """Check if the local Ollama engine is running by querying /api/tags."""
    try:
        client = _get_client()
        url = f"{settings.ollama_base_url.rstrip('/')}/api/tags"
        resp = await client.get(url, timeout=3.0)
        return resp.status_code == 200
    except Exception as exc:
        logger.debug("Ollama availability check failed: %s", exc)
        return False


def verify_ai_configuration() -> None:
    """Verify Ollama local AI engine configuration at application startup."""
    base_url = settings.ollama_base_url
    model = settings.ollama_model
    logger.info("Provider: Ollama")
    logger.info("Model: %s", model)
    logger.info("Base URL: %s", base_url)
    logger.info(
        "Ollama Config Verification | Provider=Ollama | BaseURL=%s | Model=%s",
        base_url,
        model,
    )


async def _call_ollama(prompt: str) -> str:
    """Execute async POST request to local Ollama /api/generate endpoint."""
    base_url = settings.ollama_base_url.rstrip('/')
    model_name = settings.ollama_model
    url = f"{base_url}/api/generate"

    # Step 5: Verify Ollama health before request
    available = await is_ollama_available()
    if not available:
        logger.warning("Local AI engine is not running | BaseURL=%s", base_url)
        raise ExternalServiceError("Local AI engine is not running. Start Ollama and try again.")

    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False,
    }

    logger.info("Ollama Request initiated | Provider=Ollama | model=%s | prompt_length=%d", model_name, len(prompt))
    start_time = time.time()

    try:
        client = _get_client()
        response = await client.post(url, json=payload)
        duration_ms = int((time.time() - start_time) * 1000)

        if response.status_code != 200:
            logger.error("Ollama Request failed | model=%s | status=%d | duration_ms=%d", model_name, response.status_code, duration_ms)
            raise ExternalServiceError(f"Ollama local service returned HTTP {response.status_code}.")

        resp_json = response.json()
        raw_text = resp_json.get("response", "").strip()

        if not raw_text:
            raise ExternalServiceError("Ollama local service returned empty response.")

        logger.info("Ollama Request succeeded | Provider=Ollama | model=%s | duration_ms=%d | content_length=%d", model_name, duration_ms, len(raw_text))
        return raw_text

    except httpx.TimeoutException as exc:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.error("Ollama Request timeout | model=%s | duration_ms=%d", model_name, duration_ms)
        raise AITimeoutError(f"Request to local Ollama model '{model_name}' timed out after {settings.ollama_timeout_seconds}s.") from exc

    except httpx.NetworkError as exc:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.error("Ollama Request network error | model=%s | duration_ms=%d | error=%s", model_name, duration_ms, exc)
        raise AINetworkError("Local AI engine is not running. Start Ollama and try again.") from exc


def _clean_json_text(text: str) -> str:
    """Strip markdown code block markers and sanitize raw text into clean JSON string."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


async def generate_structured_json(prompt: str) -> dict[str, Any]:
    """Send a prompt to Ollama and parse the structured JSON response."""
    try:
        raw_content = await _call_ollama(prompt)
        cleaned_text = _clean_json_text(raw_content)

        parsed_json = json.loads(cleaned_text)
        if isinstance(parsed_json, dict):
            logger.info("Ollama JSON payload parsed successfully")
            return parsed_json
        raise ValueError("Root JSON is not an object.")

    except (ExternalServiceError, AINetworkError, AITimeoutError) as err:
        logger.warning("Ollama engine offline/error: %s", err)
        raise err
    except json.JSONDecodeError as exc:
        logger.error("Ollama returned invalid JSON payload | error=%s", exc)
        raise ValueError("Failed to parse valid JSON from local Ollama model response.") from exc


async def generate_text_response(prompt: str) -> str:
    """Send a prompt to Ollama and return raw text output."""
    try:
        return await _call_ollama(prompt)
    except (ExternalServiceError, AINetworkError, AITimeoutError):
        return "Local AI unavailable. Start Ollama and try again."
