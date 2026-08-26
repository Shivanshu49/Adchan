"""Framework-independent Postgres persistence for the post-login tracker."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Awaitable, Callable, TypeVar
from uuid import UUID

import asyncpg


T = TypeVar("T")


class TrackerStorageError(RuntimeError):
    """Raised when Postgres cannot serve the tracker request."""


@dataclass(frozen=True)
class TrackerRecord:
    session_id: UUID
    reg_no: str
    failure_code: str
    marked_done_at: datetime | None
    reminder_at: datetime | None
    created_at: datetime


def _asyncpg_url(database_url: str) -> str:
    return database_url.replace("postgresql+asyncpg://", "postgresql://", 1)


def _to_record(row: asyncpg.Record) -> TrackerRecord:
    return TrackerRecord(
        session_id=row["session_id"],
        reg_no=row["reg_no"],
        failure_code=row["failure_code"],
        marked_done_at=row["marked_done_at"],
        reminder_at=row["reminder_at"],
        created_at=row["created_at"],
    )


async def _with_connection(
    database_url: str,
    operation: Callable[[asyncpg.Connection], Awaitable[T]],
) -> T:
    connection: asyncpg.Connection | None = None
    try:
        connection = await asyncpg.connect(_asyncpg_url(database_url), timeout=5)
        return await operation(connection)
    except (asyncpg.PostgresError, OSError, asyncio.TimeoutError) as error:
        raise TrackerStorageError("tracker database is unavailable") from error
    finally:
        if connection is not None:
            await connection.close()


async def get_tracker_record(
    database_url: str,
    session_id: UUID,
    reg_no: str,
) -> TrackerRecord | None:
    async def operation(connection: asyncpg.Connection) -> TrackerRecord | None:
        row = await connection.fetchrow(
            """
            SELECT session_id, reg_no, failure_code, marked_done_at,
                   reminder_at, created_at
            FROM tracker
            WHERE session_id = $1 AND reg_no = $2
            """,
            session_id,
            reg_no,
        )
        return _to_record(row) if row is not None else None

    return await _with_connection(database_url, operation)


async def ensure_tracker_record(
    database_url: str,
    session_id: UUID,
    reg_no: str,
    failure_code: str,
) -> TrackerRecord:
    async def operation(connection: asyncpg.Connection) -> TrackerRecord:
        row = await connection.fetchrow(
            """
            INSERT INTO tracker (session_id, reg_no, failure_code)
            VALUES ($1, $2, $3::failure_code)
            ON CONFLICT (session_id, reg_no)
            DO UPDATE SET failure_code = EXCLUDED.failure_code
            RETURNING session_id, reg_no, failure_code, marked_done_at,
                      reminder_at, created_at
            """,
            session_id,
            reg_no,
            failure_code,
        )
        assert row is not None
        return _to_record(row)

    return await _with_connection(database_url, operation)


async def mark_tracker_done(
    database_url: str,
    session_id: UUID,
    reg_no: str,
    failure_code: str,
) -> TrackerRecord:
    async def operation(connection: asyncpg.Connection) -> TrackerRecord:
        row = await connection.fetchrow(
            """
            INSERT INTO tracker (session_id, reg_no, failure_code, marked_done_at)
            VALUES ($1, $2, $3::failure_code, NOW())
            ON CONFLICT (session_id, reg_no)
            DO UPDATE SET failure_code = EXCLUDED.failure_code,
                          marked_done_at = COALESCE(tracker.marked_done_at, NOW())
            RETURNING session_id, reg_no, failure_code, marked_done_at,
                      reminder_at, created_at
            """,
            session_id,
            reg_no,
            failure_code,
        )
        assert row is not None
        return _to_record(row)

    return await _with_connection(database_url, operation)


async def set_tracker_reminder(
    database_url: str,
    session_id: UUID,
    reg_no: str,
    failure_code: str,
    reminder_at: datetime,
) -> TrackerRecord:
    async def operation(connection: asyncpg.Connection) -> TrackerRecord:
        row = await connection.fetchrow(
            """
            INSERT INTO tracker (session_id, reg_no, failure_code, reminder_at)
            VALUES ($1, $2, $3::failure_code, $4)
            ON CONFLICT (session_id, reg_no)
            DO UPDATE SET failure_code = EXCLUDED.failure_code,
                          reminder_at = EXCLUDED.reminder_at
            RETURNING session_id, reg_no, failure_code, marked_done_at,
                      reminder_at, created_at
            """,
            session_id,
            reg_no,
            failure_code,
            reminder_at,
        )
        assert row is not None
        return _to_record(row)

    return await _with_connection(database_url, operation)
