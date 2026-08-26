"""Framework-independent classification and transcription orchestration."""

from __future__ import annotations

import asyncio
import json
import math
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
INSUFFICIENT_INFO = "INSUFFICIENT_INFO"
CLASSIFICATION_CODES = FAILURE_CODES + (INSUFFICIENT_INFO,)
DEFAULT_TOP_CONFIDENCE_THRESHOLD = 0.70
DEFAULT_CONFIDENCE_GAP_THRESHOLD = 0.15


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
    top_code: str | None = None
    second_code: str | None = None
    second_confidence: float = 0.0
    confidence_gap: float = 0.0
    valid_response: bool = False


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


def _confidence(value: object) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    confidence = float(value)
    if not math.isfinite(confidence) or not 0.0 <= confidence <= 1.0:
        return None
    return confidence


def normalize_classification(
    raw: object,
    lang: Literal["hi", "en"],
    *,
    top_confidence_threshold: float = DEFAULT_TOP_CONFIDENCE_THRESHOLD,
    confidence_gap_threshold: float = DEFAULT_CONFIDENCE_GAP_THRESHOLD,
) -> DiagnosisResult:
    if not 0.0 <= top_confidence_threshold <= 1.0:
        raise ValueError("top confidence threshold must be between 0 and 1")
    if not 0.0 <= confidence_gap_threshold <= 1.0:
        raise ValueError("confidence gap threshold must be between 0 and 1")

    if not isinstance(raw, dict):
        return DiagnosisResult(
            code="UNKNOWN",
            confidence=0.0,
            needs_clarification=True,
            clarifying_question=clarification_for(lang),
        )

    top_code = raw.get("top_code")
    second_code = raw.get("second_code")
    top_confidence = _confidence(raw.get("top_confidence"))
    second_confidence = _confidence(raw.get("second_confidence"))
    raw_question = raw.get("clarifyingQuestion")
    question = raw_question.strip() if isinstance(raw_question, str) else ""

    if (
        top_code not in CLASSIFICATION_CODES
        or second_code not in CLASSIFICATION_CODES
        or top_confidence is None
        or second_confidence is None
        or top_confidence < second_confidence
        or not question
        or (top_code == second_code and top_code != INSUFFICIENT_INFO)
    ):
        return DiagnosisResult(
            code="UNKNOWN",
            confidence=0.0,
            needs_clarification=True,
            clarifying_question=clarification_for(lang),
        )

    confidence_gap = top_confidence - second_confidence
    if top_code == INSUFFICIENT_INFO:
        return DiagnosisResult(
            code="UNKNOWN",
            confidence=top_confidence,
            needs_clarification=True,
            clarifying_question=question,
            top_code=top_code,
            second_code=second_code,
            second_confidence=second_confidence,
            confidence_gap=confidence_gap,
            valid_response=True,
        )

    needs_clarification = (
        top_confidence < top_confidence_threshold
        or confidence_gap < confidence_gap_threshold
    )
    return DiagnosisResult(
        code="UNKNOWN" if needs_clarification else top_code,
        confidence=top_confidence,
        needs_clarification=needs_clarification,
        clarifying_question=question if needs_clarification else None,
        top_code=top_code,
        second_code=second_code,
        second_confidence=second_confidence,
        confidence_gap=confidence_gap,
        valid_response=True,
    )


async def classify_complaint(
    complaint: str,
    lang: Literal["hi", "en"],
    *,
    api_key: str | None,
    base_url: str,
    model: str,
    top_confidence_threshold: float = DEFAULT_TOP_CONFIDENCE_THRESHOLD,
    confidence_gap_threshold: float = DEFAULT_CONFIDENCE_GAP_THRESHOLD,
    client: httpx.AsyncClient | None = None,
) -> DiagnosisResult:
    if not api_key or not complaint.strip():
        return normalize_classification(None, lang)

    system_prompt = (
        "You classify PM-KISAN installment failures. Return ONLY the required JSON object. "
        "Never return advice, a remedy, an office name, a document list, or explanatory "
        "prose. INSUFFICIENT_INFO is a refusal, not a failure. If the complaint does not "
        "contain enough information to identify one specific failure, set top_code to "
        "INSUFFICIENT_INFO and ask one concise clarifyingQuestion in the user's language. "
        "Do not guess between plausible codes. Report calibrated probabilities for the top "
        "and second choices; do not inflate confidence. The second choice must be the next "
        "most plausible enum value. Always provide a concise clarifyingQuestion that would "
        "help distinguish the top two choices, even when the classification is clear.\n\n"
        "Allowed failure taxonomy:\n" + FAILURE_CONTEXT
    )
    schema = {
        "type": "json_schema",
        "json_schema": {
            "name": "failure_classification",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "top_code": {"type": "string", "enum": list(CLASSIFICATION_CODES)},
                    "top_confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "second_code": {"type": "string", "enum": list(CLASSIFICATION_CODES)},
                    "second_confidence": {"type": "number", "minimum": 0, "maximum": 1},
                    "clarifyingQuestion": {"type": "string"},
                },
                "required": [
                    "top_code",
                    "top_confidence",
                    "second_code",
                    "second_confidence",
                    "clarifyingQuestion",
                ],
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
                    {
                        "role": "user",
                        "content": f"Language: {lang}\nComplaint: {complaint.strip()}",
                    },
                ],
                "response_format": schema,
                "temperature": 0,
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return normalize_classification(
            parsed,
            lang,
            top_confidence_threshold=top_confidence_threshold,
            confidence_gap_threshold=confidence_gap_threshold,
        )
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return normalize_classification(None, lang)
    finally:
        if owns_client:
            await active_client.aclose()
