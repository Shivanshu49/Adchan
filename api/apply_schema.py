"""Apply the idempotent generated tracker schema to the configured database."""

import asyncio
from pathlib import Path

import asyncpg

from main import settings
from tracker import _asyncpg_url


async def apply_schema() -> None:
    if not settings.database_url:
        raise SystemExit("DATABASE_URL is not configured")

    connection = await asyncpg.connect(_asyncpg_url(settings.database_url), timeout=10)
    try:
        await connection.execute(Path("schema.sql").read_text(encoding="utf-8"))
    finally:
        await connection.close()

    print("Tracker schema is ready.")


if __name__ == "__main__":
    asyncio.run(apply_schema())
