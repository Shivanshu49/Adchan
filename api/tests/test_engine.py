import asyncio
import json

import httpx
import pytest

import engine


def classification(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "top_code": "EKYC_PENDING",
        "top_confidence": 0.9,
        "second_code": "NPCI_NOT_MAPPED",
        "second_confidence": 0.2,
        "clarifyingQuestion": "क्या पोर्टल पर eKYC बाकी लिखा है?",
    }
    payload.update(overrides)
    return payload


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


def test_real_confidence_and_gap_control_routing() -> None:
    clear = engine.normalize_classification(classification(), "hi")
    low = engine.normalize_classification(
        classification(top_confidence=0.6, second_confidence=0.2),
        "hi",
    )
    narrow = engine.normalize_classification(
        classification(top_confidence=0.82, second_confidence=0.75),
        "hi",
    )

    assert clear.code == "EKYC_PENDING"
    assert clear.confidence == 0.9
    assert clear.confidence_gap == pytest.approx(0.7)
    assert clear.needs_clarification is False
    assert low.code == "UNKNOWN"
    assert low.needs_clarification is True
    assert narrow.code == "UNKNOWN"
    assert narrow.needs_clarification is True


def test_thresholds_are_independently_configurable() -> None:
    raw = classification(top_confidence=0.68, second_confidence=0.58)

    conservative = engine.normalize_classification(
        raw,
        "hi",
        top_confidence_threshold=0.7,
        confidence_gap_threshold=0.15,
    )
    permissive = engine.normalize_classification(
        raw,
        "hi",
        top_confidence_threshold=0.65,
        confidence_gap_threshold=0.05,
    )

    assert conservative.needs_clarification is True
    assert permissive.code == "EKYC_PENDING"
    assert permissive.needs_clarification is False


def test_insufficient_info_is_a_refusal_not_a_failure() -> None:
    question = "पोर्टल पर कौन सा संदेश दिख रहा है?"
    result = engine.normalize_classification(
        classification(
            top_code=engine.INSUFFICIENT_INFO,
            top_confidence=0.8,
            second_confidence=0.1,
            clarifyingQuestion=question,
        ),
        "hi",
    )

    assert engine.INSUFFICIENT_INFO not in engine.FAILURE_CODES
    assert engine.INSUFFICIENT_INFO in engine.CLASSIFICATION_CODES
    assert result.top_code == engine.INSUFFICIENT_INFO
    assert result.code == "UNKNOWN"
    assert result.needs_clarification is True
    assert result.clarifying_question == question
    assert result.valid_response is True


def test_malformed_ranking_is_guarded() -> None:
    invalid_code = engine.normalize_classification(
        classification(top_code="MADE_UP_CODE"),
        "hi",
    )
    reversed_scores = engine.normalize_classification(
        classification(top_confidence=0.4, second_confidence=0.8),
        "hi",
    )
    duplicate_codes = engine.normalize_classification(
        classification(second_code="EKYC_PENDING"),
        "hi",
    )

    for result in (invalid_code, reversed_scores, duplicate_codes):
        assert result.code == "UNKNOWN"
        assert result.needs_clarification is True
        assert result.valid_response is False


def test_classifier_schema_contains_refusal_and_ranked_confidence() -> None:
    async def run() -> None:
        async def handler(request: httpx.Request) -> httpx.Response:
            payload = json.loads(request.content)
            schema = payload["response_format"]["json_schema"]["schema"]
            properties = schema["properties"]
            assert engine.INSUFFICIENT_INFO in properties["top_code"]["enum"]
            assert len(properties["top_code"]["enum"]) == 13
            assert properties["top_confidence"]["minimum"] == 0
            assert properties["top_confidence"]["maximum"] == 1
            assert properties["second_confidence"]["minimum"] == 0
            assert set(schema["required"]) == set(properties)
            assert "Do not guess between plausible codes" in payload["messages"][0]["content"]
            assert "Language: hi" in payload["messages"][1]["content"]
            return httpx.Response(
                200,
                json={
                    "choices": [
                        {"message": {"content": json.dumps(classification())}}
                    ]
                },
            )

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        try:
            result = await engine.classify_complaint(
                "पोर्टल पर पहचान बाकी दिख रही है",
                "hi",
                api_key="classifier-test",
                base_url="https://gateway.example/v1",
                model="test-model",
                client=client,
            )
        finally:
            await client.aclose()

        assert result.code == "EKYC_PENDING"
        assert result.confidence == 0.9
        assert result.second_code == "NPCI_NOT_MAPPED"

    asyncio.run(run())
