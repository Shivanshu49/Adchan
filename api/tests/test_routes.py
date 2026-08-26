import asyncio
import os

os.environ.setdefault("VERCEL_ORIGIN", "https://adchan.example")
os.environ.setdefault("LLM_BASE_URL", "https://gateway.example/v1")
os.environ.setdefault("LLM_API_KEY", "test-classifier-key")
os.environ.setdefault("LLM_MODEL", "test-model")

import httpx

import main
from engine import DiagnosisResult, TranscriptionResult


async def fake_transcription(*args: object, **kwargs: object) -> TranscriptionResult:
    return TranscriptionResult(text="ईकेवाईसी बाकी है", provider="sarvam")


def reset_limits() -> None:
    main.limiter._storage.reset()


def request(method: str, path: str, **kwargs) -> httpx.Response:
    async def send() -> httpx.Response:
        transport = httpx.ASGITransport(app=main.app, client=("testclient", 50000))
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan.example") as client:
            return await client.request(method, path, **kwargs)

    return asyncio.run(send())


def test_transcribe_route(monkeypatch) -> None:
    reset_limits()
    monkeypatch.setattr(main, "transcribe_audio", fake_transcription)
    response = request(
        "POST",
        "/transcribe",
        files={"audio": ("recording.webm", b"audio", "audio/webm")},
        data={"duration_seconds": "8.5"},
    )
    assert response.status_code == 200
    assert response.json() == {"text": "ईकेवाईसी बाकी है", "provider": "sarvam"}


def test_transcribe_rejects_more_than_60_seconds() -> None:
    reset_limits()
    response = request(
        "POST",
        "/transcribe",
        files={"audio": ("recording.webm", b"audio", "audio/webm")},
        data={"duration_seconds": "61"},
    )
    assert response.status_code == 400


def test_transcribe_rate_limit_triggers_on_21st_request(monkeypatch) -> None:
    reset_limits()
    monkeypatch.setattr(main, "transcribe_audio", fake_transcription)

    async def send_all() -> None:
        transport = httpx.ASGITransport(app=main.app, client=("testclient", 50000))
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan.example") as client:
            for index in range(1, 22):
                response = await client.post(
                    "/transcribe",
                    files={"audio": ("recording.webm", b"audio", "audio/webm")},
                    data={"duration_seconds": "1"},
                )
                expected = 429 if index == 21 else 200
                assert response.status_code == expected

    asyncio.run(send_all())


def test_cors_allows_configured_origin_only() -> None:
    allowed = request(
        "OPTIONS",
        "/transcribe",
        headers={
            "Origin": "https://adchan.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    denied = request(
        "OPTIONS",
        "/transcribe",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "https://adchan.example"
    assert "access-control-allow-origin" not in denied.headers


def test_diagnose_passes_configured_confidence_thresholds(monkeypatch) -> None:
    reset_limits()
    received: dict[str, object] = {}

    async def fake_classification(*args: object, **kwargs: object) -> DiagnosisResult:
        received.update(kwargs)
        return DiagnosisResult(
            code="EKYC_PENDING",
            confidence=0.86,
            needs_clarification=False,
            top_code="EKYC_PENDING",
            second_code="NPCI_NOT_MAPPED",
            second_confidence=0.2,
            confidence_gap=0.66,
            valid_response=True,
        )

    monkeypatch.setattr(main, "classify_complaint", fake_classification)
    monkeypatch.setattr(main.settings, "llm_top_confidence_threshold", 0.72)
    monkeypatch.setattr(main.settings, "llm_confidence_gap_threshold", 0.18)

    response = request(
        "POST",
        "/diagnose",
        json={"complaint": "पोर्टल पर पहचान बाकी दिख रही है", "lang": "hi"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "code": "EKYC_PENDING",
        "confidence": 0.86,
        "needsClarification": False,
        "clarifyingQuestion": None,
    }
    assert received["top_confidence_threshold"] == 0.72
    assert received["confidence_gap_threshold"] == 0.18
