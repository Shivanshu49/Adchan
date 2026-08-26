import asyncio
from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

import httpx

import main
from tracker import TrackerRecord, _asyncpg_url


SESSION_ID = UUID("00000000-0000-4000-8000-000000000001")
RECORD = TrackerRecord(
    session_id=SESSION_ID,
    reg_no="UP-DEMO-0001",
    failure_code="NPCI_NOT_MAPPED",
    marked_done_at=None,
    reminder_at=None,
    created_at=datetime(2026, 8, 26, 6, 0, tzinfo=UTC),
)


def request(method: str, path: str, **kwargs) -> httpx.Response:
    async def send() -> httpx.Response:
        transport = httpx.ASGITransport(app=main.app, client=("testclient", 50000))
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan.example") as client:
            return await client.request(method, path, **kwargs)

    return asyncio.run(send())


def test_generated_tracker_schema_uses_failure_enum_and_exact_columns() -> None:
    schema = (Path(__file__).resolve().parents[1] / "schema.sql").read_text(encoding="utf-8")
    assert "session_id UUID NOT NULL" in schema
    assert "reg_no TEXT NOT NULL" in schema
    assert "failure_code failure_code NOT NULL" in schema
    assert "marked_done_at TIMESTAMPTZ" in schema
    assert "reminder_at TIMESTAMPTZ" in schema
    assert "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" in schema
    assert "registration_number" not in schema
    assert "completed BOOLEAN" not in schema


def test_asyncpg_url_accepts_sqlalchemy_style_database_url() -> None:
    assert (
        _asyncpg_url("postgresql+asyncpg://user:pass@db.example/adchan")
        == "postgresql://user:pass@db.example/adchan"
    )


def test_create_and_read_tracker_routes(monkeypatch) -> None:
    monkeypatch.setattr(main.settings, "database_url", "postgresql://db.example/adchan")

    async def fake_ensure(*args, **kwargs) -> TrackerRecord:
        return RECORD

    async def fake_get(*args, **kwargs) -> TrackerRecord:
        return RECORD

    monkeypatch.setattr(main, "ensure_tracker_record", fake_ensure)
    monkeypatch.setattr(main, "get_tracker_record", fake_get)

    headers = {"X-Session-ID": str(SESSION_ID)}
    created = request(
        "POST",
        "/tracker/UP-DEMO-0001",
        headers=headers,
        json={"failureCode": "NPCI_NOT_MAPPED"},
    )
    fetched = request("GET", "/tracker/UP-DEMO-0001", headers=headers)

    assert created.status_code == 200
    assert fetched.status_code == 200
    assert created.json() == fetched.json()
    assert created.json()["failureCode"] == "NPCI_NOT_MAPPED"
    assert created.json()["markedDoneAt"] is None


def test_mark_done_and_reminder_routes(monkeypatch) -> None:
    monkeypatch.setattr(main.settings, "database_url", "postgresql://db.example/adchan")
    done_at = datetime(2026, 8, 27, 6, 0, tzinfo=UTC)
    reminder_at = datetime(2026, 8, 30, 3, 30, tzinfo=UTC)

    async def fake_done(*args, **kwargs) -> TrackerRecord:
        return TrackerRecord(**{**RECORD.__dict__, "marked_done_at": done_at})

    async def fake_reminder(*args, **kwargs) -> TrackerRecord:
        return TrackerRecord(**{**RECORD.__dict__, "reminder_at": reminder_at})

    monkeypatch.setattr(main, "mark_tracker_done", fake_done)
    monkeypatch.setattr(main, "set_tracker_reminder", fake_reminder)
    headers = {"X-Session-ID": str(SESSION_ID)}

    done = request(
        "POST",
        "/tracker/UP-DEMO-0001/done",
        headers=headers,
        json={"failureCode": "NPCI_NOT_MAPPED"},
    )
    reminder = request(
        "POST",
        "/tracker/UP-DEMO-0001/reminder",
        headers=headers,
        json={
            "failureCode": "NPCI_NOT_MAPPED",
            "reminderAt": reminder_at.isoformat(),
        },
    )

    assert done.status_code == 200
    assert done.json()["markedDoneAt"] == "2026-08-27T06:00:00Z"
    assert reminder.status_code == 200
    assert reminder.json()["reminderAt"] == "2026-08-30T03:30:00Z"


def test_tracker_rejects_invalid_failure_code() -> None:
    response = request(
        "POST",
        "/tracker/UP-DEMO-0001",
        headers={"X-Session-ID": str(SESSION_ID)},
        json={"failureCode": "MADE_UP_CODE"},
    )
    assert response.status_code == 422
