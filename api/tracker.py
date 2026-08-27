"""Framework-independent Postgres persistence for the post-login tracker."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import datetime
from typing import Awaitable, Callable, TypeVar
from uuid import UUID

import asyncpg


T = TypeVar("T")
POOL_MIN_SIZE = 1
POOL_MAX_SIZE = 5
POOL_TIMEOUT_SECONDS = 5

_pool: asyncpg.Pool | None = None
_pool_url: str | None = None
_pool_lock: asyncio.Lock | None = None
_pool_loop: asyncio.AbstractEventLoop | None = None


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


def _current_pool_lock() -> asyncio.Lock:
    """Keep the initialization lock bound to the active application loop."""

    global _pool_lock, _pool_loop
    loop = asyncio.get_running_loop()
    if _pool_lock is None or _pool_loop is not loop:
        _pool_lock = asyncio.Lock()
        _pool_loop = loop
    return _pool_lock


async def initialize_tracker_pool(database_url: str) -> asyncpg.Pool:
    """Create the process-wide tracker pool once, with a tracker-only retry path."""

    global _pool, _pool_url
    normalized_url = _asyncpg_url(database_url)
    async with _current_pool_lock():
        if _pool is not None and _pool_url == normalized_url:
            return _pool

        if _pool is not None:
            await _pool.close()
            _pool = None
            _pool_url = None

        try:
            pool = await asyncpg.create_pool(
                normalized_url,
                min_size=POOL_MIN_SIZE,
                max_size=POOL_MAX_SIZE,
                timeout=POOL_TIMEOUT_SECONDS,
            )
        except (asyncpg.PostgresError, asyncpg.InterfaceError, OSError, asyncio.TimeoutError) as error:
            raise TrackerStorageError("tracker database is unavailable") from error

        _pool = pool
        _pool_url = normalized_url
        return pool


async def close_tracker_pool() -> None:
    """Close the process-wide tracker pool during application shutdown."""

    global _pool, _pool_url
    async with _current_pool_lock():
        pool = _pool
        _pool = None
        _pool_url = None
        if pool is not None:
            try:
                await asyncio.wait_for(pool.close(), timeout=POOL_TIMEOUT_SECONDS)
            except asyncio.TimeoutError:
                pool.terminate()


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
    try:
        pool = await initialize_tracker_pool(database_url)
        async with pool.acquire(timeout=POOL_TIMEOUT_SECONDS) as connection:
            return await operation(connection)
    except (asyncpg.PostgresError, asyncpg.InterfaceError, OSError, asyncio.TimeoutError) as error:
        raise TrackerStorageError("tracker database is unavailable") from error


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


async def delete_tracker_session(
    database_url: str,
    session_id: UUID,
) -> int:
    """Delete every demo tracker row owned by one browser session."""

    async def operation(connection: asyncpg.Connection) -> int:
        result = await connection.execute(
            "DELETE FROM tracker WHERE session_id = $1",
            session_id,
        )
        return int(result.rsplit(" ", 1)[-1])

    return await _with_connection(database_url, operation)
