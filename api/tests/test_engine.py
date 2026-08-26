import asyncio

import httpx
import pytest

import engine


def audio(duration_seconds: float = 10.0) -> engine.AudioInput:
    return engine.AudioInput(
        data=b"not-real-audio",
        filename="recording.webm",
        content_type="audio/webm",
        duration_seconds=duration_seconds,
    )


def test_validates_public_audio_limits() -> None:
    engine.validate_audio(audio(60.0))
    with pytest.raises(engine.AudioValidationError, match="60 seconds"):
        engine.validate_audio(audio(60.1))
    with pytest.raises(engine.AudioValidationError, match="25MB"):
        engine.validate_audio(
            engine.AudioInput(
                data=b"x" * (engine.MAX_AUDIO_BYTES + 1),
                filename="too-large.webm",
                content_type="audio/webm",
                duration_seconds=1,
            )
        )


def test_sarvam_request_uses_current_endpoint_shape() -> None:
    async def run() -> None:
        async def handler(request: httpx.Request) -> httpx.Response:
            assert request.url == engine.SARVAM_STT_URL
            assert request.headers["api-subscription-key"] == "sarvam-test"
            body = await request.aread()
            assert b"saaras:v3" in body
            assert b"hi-IN" in body
            assert b"recording.webm" in body
            return httpx.Response(200, json={"transcript": "ईकेवाईसी बाकी है"})

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        try:
            text = await engine.transcribe_with_sarvam(audio(), "sarvam-test", client=client)
        finally:
            await client.aclose()
        assert text == "ईकेवाईसी बाकी है"

    asyncio.run(run())


def test_sarvam_error_falls_back_to_openai(monkeypatch: pytest.MonkeyPatch) -> None:
    async def sarvam_failure(*args: object, **kwargs: object) -> str:
        raise httpx.ReadTimeout("timeout")

    async def openai_success(*args: object, **kwargs: object) -> str:
        return "बैंक खाता आधार से लिंक नहीं है"

    monkeypatch.setattr(engine, "transcribe_with_sarvam", sarvam_failure)
    monkeypatch.setattr(engine, "transcribe_with_openai", openai_success)
    result = asyncio.run(
        engine.transcribe_audio(
            audio(),
            sarvam_api_key="sarvam-test",
            stt_fallback_api_key="stt-fallback-test",
        )
    )
    assert result.provider == "openai"
    assert result.text == "बैंक खाता आधार से लिंक नहीं है"


def test_long_recording_skips_incompatible_sarvam(monkeypatch: pytest.MonkeyPatch) -> None:
    async def sarvam_must_not_run(*args: object, **kwargs: object) -> str:
        raise AssertionError("Sarvam sync must not receive audio over 30 seconds")

    async def openai_success(*args: object, **kwargs: object) -> str:
        return "जाँच बाकी है"

    monkeypatch.setattr(engine, "transcribe_with_sarvam", sarvam_must_not_run)
    monkeypatch.setattr(engine, "transcribe_with_openai", openai_success)
    result = asyncio.run(
        engine.transcribe_audio(
            audio(45),
            sarvam_api_key="sarvam-test",
            stt_fallback_api_key="stt-fallback-test",
        )
    )
    assert result.provider == "openai"


def test_invalid_failure_code_is_guarded() -> None:
    result = engine.normalize_classification("MADE_UP_CODE", "hi")
    assert result.code == "UNKNOWN"
    assert result.needs_clarification is True
