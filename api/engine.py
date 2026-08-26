"""Framework-independent classification and transcription orchestration."""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import httpx


ROOT = Path(__file__).resolve().parents[1]
FAILURES_SOURCE = ROOT / "shared" / "failures.json"
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_STT_MODEL = "saaras:v3"
SARVAM_LANGUAGE = "hi-IN"
SARVAM_TIMEOUT_SECONDS = 8.0
SARVAM_SYNC_LIMIT_SECONDS = 30.0
OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions"
OPENAI_TRANSCRIPTION_MODEL = "gpt-4o-transcribe"
MAX_AUDIO_BYTES = 25 * 1024 * 1024
MAX_AUDIO_SECONDS = 60.0


def _load_failure_context() -> tuple[tuple[str, ...], str]:
    failures = json.loads(FAILURES_SOURCE.read_text(encoding="utf-8"))["failures"]
    codes = tuple(failure["code"] for failure in failures)
    context = "\n".join(
        f'- {failure["code"]}: {failure["portalText"]}; {failure["plain"]["hi"]}'
        for failure in failures
    )
    return codes, context


FAILURE_CODES, FAILURE_CONTEXT = _load_failure_context()


@dataclass(frozen=True)
class AudioInput:
    data: bytes
    filename: str
    content_type: str
    duration_seconds: float


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    provider: Literal["sarvam", "openai"]


@dataclass(frozen=True)
class DiagnosisResult:
    code: str
    confidence: float
    needs_clarification: bool
    clarifying_question: str | None = None


class AudioValidationError(ValueError):
    """Raised when an upload violates the public audio contract."""


class TranscriptionUnavailableError(RuntimeError):
    """Raised when both transcription providers fail."""


def validate_audio(audio: AudioInput) -> None:
    if not audio.data:
        raise AudioValidationError("audio file is empty")
    if len(audio.data) > MAX_AUDIO_BYTES:
        raise AudioValidationError("audio file exceeds 25MB")
    if audio.duration_seconds <= 0:
        raise AudioValidationError("audio duration must be greater than zero")
    if audio.duration_seconds > MAX_AUDIO_SECONDS:
        raise AudioValidationError("audio duration exceeds 60 seconds")
    if not audio.content_type.lower().startswith("audio/"):
        raise AudioValidationError("upload must be an audio file")


async def transcribe_with_sarvam(
    audio: AudioInput,
    api_key: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> str:
    owns_client = client is None
    active_client = client or httpx.AsyncClient(timeout=SARVAM_TIMEOUT_SECONDS)
    try:
        response = await active_client.post(
            SARVAM_STT_URL,
            headers={"api-subscription-key": api_key},
            data={
                "model": SARVAM_STT_MODEL,
                "language_code": SARVAM_LANGUAGE,
                "mode": "transcribe",
            },
            files={"file": (audio.filename, audio.data, audio.content_type)},
        )
        response.raise_for_status()
        transcript = response.json().get("transcript", "")
        if not isinstance(transcript, str) or not transcript.strip():
            raise ValueError("Sarvam returned an empty transcript")
        return transcript.strip()
    finally:
        if owns_client:
            await active_client.aclose()


async def transcribe_with_openai(
    audio: AudioInput,
    api_key: str,
    *,
    client: httpx.AsyncClient | None = None,
) -> str:
    owns_client = client is None
    active_client = client or httpx.AsyncClient(timeout=30.0)
    try:
        response = await active_client.post(
            OPENAI_TRANSCRIPTION_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            data={"model": OPENAI_TRANSCRIPTION_MODEL, "language": "hi"},
            files={"file": (audio.filename, audio.data, audio.content_type)},
        )
        response.raise_for_status()
        transcript = response.json().get("text", "")
        if not isinstance(transcript, str) or not transcript.strip():
            raise ValueError("OpenAI returned an empty transcript")
        return transcript.strip()
    finally:
        if owns_client:
            await active_client.aclose()


async def transcribe_audio(
    audio: AudioInput,
    *,
    sarvam_api_key: str | None,
    stt_fallback_api_key: str | None,
) -> TranscriptionResult:
    validate_audio(audio)
    sarvam_error: Exception | None = None

    # Sarvam's current synchronous endpoint rejects recordings over 30 seconds.
    if sarvam_api_key and audio.duration_seconds <= SARVAM_SYNC_LIMIT_SECONDS:
        try:
            async with asyncio.timeout(SARVAM_TIMEOUT_SECONDS):
                text = await transcribe_with_sarvam(audio, sarvam_api_key)
            return TranscriptionResult(text=text, provider="sarvam")
        except Exception as error:
            sarvam_error = error

    if stt_fallback_api_key:
        try:
            text = await transcribe_with_openai(audio, stt_fallback_api_key)
            return TranscriptionResult(text=text, provider="openai")
        except Exception as error:
            raise TranscriptionUnavailableError("both transcription providers failed") from error

    if sarvam_error is not None:
        raise TranscriptionUnavailableError(
            "Sarvam transcription failed and OpenAI fallback is not configured"
        ) from sarvam_error
    raise TranscriptionUnavailableError("no compatible transcription provider is configured")


def clarification_for(lang: Literal["hi", "en"]) -> str:
    if lang == "hi":
        return "कृपया पोर्टल पर दिख रहा संदेश या किस्त रुकने की वजह थोड़ी और साफ़ बताएँ।"
    return "Please share the portal message or describe why the installment appears to be blocked."


def normalize_classification(raw_code: object, lang: Literal["hi", "en"]) -> DiagnosisResult:
    if not isinstance(raw_code, str) or raw_code not in FAILURE_CODES:
        return DiagnosisResult(
            code="UNKNOWN",
            confidence=0.0,
            needs_clarification=True,
            clarifying_question=clarification_for(lang),
        )
    return DiagnosisResult(code=raw_code, confidence=1.0, needs_clarification=False)


async def classify_complaint(
    complaint: str,
    lang: Literal["hi", "en"],
    *,
    api_key: str | None,
    base_url: str,
    model: str,
    client: httpx.AsyncClient | None = None,
) -> DiagnosisResult:
    if not api_key or not complaint.strip():
        return normalize_classification(None, lang)

    system_prompt = (
        "You classify PM-KISAN installment failures. Return ONLY one FailureCode in the "
        "required JSON object. Never return advice, a remedy, an office name, a document "
        "list, or explanatory prose.\n\nAllowed taxonomy:\n" + FAILURE_CONTEXT
    )
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "failure_classification",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {"code": {"type": "string", "enum": list(FAILURE_CODES)}},
                "required": ["code"],
                "additionalProperties": False,
            },
        },
    }
    owns_client = client is None
    active_client = client or httpx.AsyncClient(timeout=20.0)
    try:
        response = await active_client.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": complaint.strip()},
                ],
                "response_format": schema,
                "temperature": 0,
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return normalize_classification(parsed.get("code"), lang)
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return normalize_classification(None, lang)
    finally:
        if owns_client:
            await active_client.aclose()
