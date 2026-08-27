import asyncio
from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

import asyncpg
import httpx

import main
from tracker import (
    TrackerRecord,
    _asyncpg_url,
    _with_connection,
    close_tracker_pool,
    initialize_tracker_pool,
)


SESSION_ID = UUID("00000000-0000-4000-8000-000000000001")
OTHER_SESSION_ID = UUID("00000000-0000-4000-8000-000000000002")
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
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan-web.vercel.app") as client:
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
    assert "PRIMARY KEY (session_id, reg_no)" in schema
    assert "draft" not in schema.lower()
    assert "escalation" not in schema.lower()
    assert "registration_number" not in schema
    assert "completed BOOLEAN" not in schema

    source = (Path(__file__).resolve().parents[1] / "tracker.py").read_text(encoding="utf-8")
    assert "WHERE session_id = $1 AND reg_no = $2" in source
    assert source.count("ON CONFLICT (session_id, reg_no)") == 3
    assert "DELETE FROM tracker WHERE session_id = $1" in source
    assert "asyncpg.connect(" not in source
    assert "asyncpg.create_pool(" in source


def test_asyncpg_url_accepts_sqlalchemy_style_database_url() -> None:
    assert (
        _asyncpg_url("postgresql+asyncpg://user:pass@db.example/adchan")
        == "postgresql://user:pass@db.example/adchan"
    )


def test_tracker_pool_is_created_once_with_bounded_size(monkeypatch) -> None:
    created: list[tuple[str, dict[str, int]]] = []
    connection = object()

    class FakeAcquire:
        async def __aenter__(self):
            return connection

        async def __aexit__(self, *args):
            return None

    class FakePool:
        def __init__(self):
            self.acquire_count = 0
            self.close_count = 0

        def acquire(self, *, timeout: int):
            assert timeout == 5
            self.acquire_count += 1
            return FakeAcquire()

        async def close(self):
            self.close_count += 1

        def terminate(self):
            raise AssertionError("healthy test pool must close cleanly")

    fake_pool = FakePool()

    async def fake_create_pool(database_url: str, **kwargs):
        created.append((database_url, kwargs))
        return fake_pool

    monkeypatch.setattr(asyncpg, "create_pool", fake_create_pool)

    async def exercise() -> None:
        await close_tracker_pool()
        first = await initialize_tracker_pool("postgresql+asyncpg://user:pass@db.example/adchan")
        second = await initialize_tracker_pool("postgresql+asyncpg://user:pass@db.example/adchan")
        assert first is second is fake_pool

        async def operation(acquired):
            return acquired

        assert await _with_connection("postgresql+asyncpg://user:pass@db.example/adchan", operation) is connection
        assert await _with_connection("postgresql+asyncpg://user:pass@db.example/adchan", operation) is connection
        await close_tracker_pool()

    asyncio.run(exercise())

    assert created == [
        (
            "postgresql://user:pass@db.example/adchan",
            {"min_size": 1, "max_size": 5, "timeout": 5},
        )
    ]
    assert fake_pool.acquire_count == 2
    assert fake_pool.close_count == 1


def test_fastapi_lifespan_opens_and_closes_tracker_pool(monkeypatch) -> None:
    calls: list[str] = []
    database_url = "postgresql://user:pass@db.example/adchan"
    monkeypatch.setattr(main.settings, "database_url", database_url)

    async def fake_initialize(url: str):
        calls.append(f"open:{url}")

    async def fake_close():
        calls.append("close")

    monkeypatch.setattr(main, "initialize_tracker_pool", fake_initialize)
    monkeypatch.setattr(main, "close_tracker_pool", fake_close)

    async def exercise() -> None:
        async with main.lifespan(main.app):
            calls.append("inside")

    asyncio.run(exercise())
    assert calls == [f"open:{database_url}", "inside", "close"]


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


def test_reset_deletes_only_the_current_session(monkeypatch) -> None:
    monkeypatch.setattr(main.settings, "database_url", "postgresql://db.example/adchan")
    deleted: list[UUID] = []

    async def fake_delete(_url: str, session_id: UUID) -> int:
        deleted.append(session_id)
        return 3

    monkeypatch.setattr(main, "delete_tracker_session", fake_delete)
    response = request(
        "DELETE",
        "/tracker/session",
        headers={"X-Session-ID": str(SESSION_ID)},
    )

    assert response.status_code == 200
    assert response.json() == {"cleared": 3}
    assert deleted == [SESSION_ID]


def test_two_concurrent_sessions_on_same_reg_no_are_fully_isolated(monkeypatch) -> None:
    """Reviewer B must never receive reviewer A's completion or reminder state."""

    monkeypatch.setattr(main.settings, "database_url", "postgresql://db.example/adchan")
    records: dict[tuple[UUID, str], TrackerRecord] = {}
    lock = asyncio.Lock()

    async def ensure(_url: str, session_id: UUID, reg_no: str, failure_code: str) -> TrackerRecord:
        async with lock:
            key = (session_id, reg_no)
            record = records.get(key) or TrackerRecord(
                session_id=session_id,
                reg_no=reg_no,
                failure_code=failure_code,
                marked_done_at=None,
                reminder_at=None,
                created_at=datetime(2026, 8, 27, 6, 0, tzinfo=UTC),
            )
            records[key] = record
            return record

    async def mark_done(_url: str, session_id: UUID, reg_no: str, failure_code: str) -> TrackerRecord:
        async with lock:
            current = records[(session_id, reg_no)]
            updated = TrackerRecord(
                **{**current.__dict__, "failure_code": failure_code, "marked_done_at": datetime(2026, 8, 27, 7, 0, tzinfo=UTC)}
            )
            records[(session_id, reg_no)] = updated
            return updated

    async def remind(
        _url: str,
        session_id: UUID,
        reg_no: str,
        failure_code: str,
        reminder_at: datetime,
    ) -> TrackerRecord:
        async with lock:
            current = records[(session_id, reg_no)]
            updated = TrackerRecord(
                **{**current.__dict__, "failure_code": failure_code, "reminder_at": reminder_at}
            )
            records[(session_id, reg_no)] = updated
            return updated

    async def read(_url: str, session_id: UUID, reg_no: str) -> TrackerRecord | None:
        async with lock:
            return records.get((session_id, reg_no))

    monkeypatch.setattr(main, "ensure_tracker_record", ensure)
    monkeypatch.setattr(main, "mark_tracker_done", mark_done)
    monkeypatch.setattr(main, "set_tracker_reminder", remind)
    monkeypatch.setattr(main, "get_tracker_record", read)

    async def exercise_sessions() -> tuple[httpx.Response, httpx.Response]:
        transport = httpx.ASGITransport(app=main.app, client=("reviewers", 50000))
        async with httpx.AsyncClient(transport=transport, base_url="https://adchan-web.vercel.app") as client:
            async def reviewer_a() -> httpx.Response:
                headers = {"X-Session-ID": str(SESSION_ID)}
                await client.post(
                    "/tracker/UP-DEMO-0001",
                    headers=headers,
                    json={"failureCode": "NPCI_NOT_MAPPED"},
                )
                await client.post(
                    "/tracker/UP-DEMO-0001/done",
                    headers=headers,
                    json={"failureCode": "NPCI_NOT_MAPPED"},
                )
                await client.post(
                    "/tracker/UP-DEMO-0001/reminder",
                    headers=headers,
                    json={
                        "failureCode": "NPCI_NOT_MAPPED",
                        "reminderAt": "2026-08-31T03:30:00Z",
                    },
                )
                return await client.get("/tracker/UP-DEMO-0001", headers=headers)

            async def reviewer_b() -> httpx.Response:
                headers = {"X-Session-ID": str(OTHER_SESSION_ID)}
                await client.post(
                    "/tracker/UP-DEMO-0001",
                    headers=headers,
                    json={"failureCode": "NPCI_NOT_MAPPED"},
                )
                return await client.get("/tracker/UP-DEMO-0001", headers=headers)

            return await asyncio.gather(reviewer_a(), reviewer_b())

    reviewer_a, reviewer_b = asyncio.run(exercise_sessions())

    assert reviewer_a.status_code == reviewer_b.status_code == 200
    assert reviewer_a.json()["sessionId"] == str(SESSION_ID)
    assert reviewer_a.json()["markedDoneAt"] == "2026-08-27T07:00:00Z"
    assert reviewer_a.json()["reminderAt"] == "2026-08-31T03:30:00Z"
    assert reviewer_b.json()["sessionId"] == str(OTHER_SESSION_ID)
    assert reviewer_b.json()["markedDoneAt"] is None
    assert reviewer_b.json()["reminderAt"] is None
    assert "draft" not in reviewer_b.text.lower()
    assert set(records) == {
        (SESSION_ID, "UP-DEMO-0001"),
        (OTHER_SESSION_ID, "UP-DEMO-0001"),
    }
