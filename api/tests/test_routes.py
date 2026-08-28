import asyncio
import os

os.environ.setdefault("VERCEL_ORIGIN", "https://adchan-web.vercel.app")
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
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan-web.vercel.app") as client:
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
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan-web.vercel.app") as client:
            for index in range(1, 22):
                response = await client.post(
                    "/transcribe",
                    files={"audio": ("recording.webm", b"audio", "audio/webm")},
                    data={"duration_seconds": "1"},
                )
                expected = 429 if index == 21 else 200
                assert response.status_code == expected
                if index == 21:
                    assert response.headers["content-type"].startswith("text/html")
                    assert "बहुत ज़्यादा कोशिशें" in response.text
                    assert "नमूना निदान" in response.text
                    assert "Rate limit" not in response.text

    asyncio.run(send_all())


def test_cors_allows_configured_origin_only() -> None:
    allowed = request(
        "OPTIONS",
        "/transcribe",
        headers={
            "Origin": "https://adchan-web.vercel.app",
            "Access-Control-Request-Method": "DELETE",
            "Access-Control-Request-Headers": "X-Session-ID",
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
    assert allowed.headers["access-control-allow-origin"] == "https://adchan-web.vercel.app"
    assert "DELETE" in allowed.headers["access-control-allow-methods"]
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


def test_health_includes_version_and_deployment_commit(monkeypatch) -> None:
    monkeypatch.setenv("GIT_COMMIT_SHA", "c4b60fe3358cc2afdc17cfa7a466a1af93d69d69")
    response = request("GET", "/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "version": "0.1.0",
        "commit": "c4b60fe3358cc2afdc17cfa7a466a1af93d69d69",
    }


def test_root_identifies_service_and_health_route() -> None:
    response = request("GET", "/")

    assert response.status_code == 200
    assert response.json() == {"service": "Adchan API", "health": "/health"}


def test_health_uses_render_deployment_commit(monkeypatch) -> None:
    for name in ("GIT_COMMIT_SHA", "SOURCE_VERSION", "VERCEL_GIT_COMMIT_SHA"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("RENDER_GIT_COMMIT", "FD25011ABCDEF0")

    response = request("GET", "/health")

    assert response.status_code == 200
    assert response.json()["commit"] == "fd25011abcdef0"


def test_dependency_failure_is_hindi_and_sanitized(monkeypatch) -> None:
    reset_limits()

    async def broken_classification(*args: object, **kwargs: object) -> DiagnosisResult:
        raise RuntimeError("secret at /srv/adchan/api/main.py:204")

    monkeypatch.setattr(main, "classify_complaint", broken_classification)
    response = request(
        "POST",
        "/diagnose",
        json={"complaint": "किस्त क्यों रुकी", "lang": "hi"},
    )

    assert response.status_code == 503
    assert "ऑनलाइन जाँच अभी उपलब्ध नहीं है" in response.json()["detail"]
    assert "/srv/" not in response.text
    assert "RuntimeError" not in response.text


def test_validation_failure_is_hindi_and_has_no_internal_fields() -> None:
    response = request("POST", "/diagnose", json={"complaint": "", "lang": "hi"})

    assert response.status_code == 422
    assert "भेजी गई जानकारी" in response.json()["detail"]
    assert "string_too_short" not in response.text
    assert "body.complaint" not in response.text


def test_production_schema_and_docs_are_not_public() -> None:
    for path in ("/docs", "/redoc", "/openapi.json"):
        response = request("GET", path)
        assert response.status_code == 404
        assert "माँगी गई जानकारी नहीं मिली" in response.json()["detail"]
